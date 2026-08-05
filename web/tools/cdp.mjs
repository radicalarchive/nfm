// A minimal Chrome DevTools Protocol client: RFC6455 over node:net, plus the
// request/response and event plumbing CDP needs.
//
// Why this exists: `WebSocket` only became a global in Node 22, and this
// machine has Node 18. Every CDP tool here was written against the global and
// dies with "WebSocket is not defined" -- which surfaces as a silent
// "no devtools target", because the connect loop catches everything. There is
// no `ws` package available offline, so this is the whole dependency.
//
// Deliberately partial, and the limits are the ones a CDP session actually
// reaches: text frames only (CDP never sends binary), continuation frames
// reassembled (large DOM/eval results do fragment), close/ping handled. No
// permessage-deflate -- Chrome does not offer it on the DevTools endpoint.

import net from 'node:net';
import { createHash, randomBytes } from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

class Socket {
  constructor(sock) {
    this.sock = sock;
    this.buf = Buffer.alloc(0);
    this.frags = [];
    this.onmessage = null;
    this.onclose = null;
    sock.on('data', (d) => this._feed(d));
    sock.on('close', () => this.onclose && this.onclose());
  }

  _feed(d) {
    this.buf = Buffer.concat([this.buf, d]);
    for (;;) {
      const f = this._frame();
      if (!f) return;
      // Opcode 0 is a continuation of the previous frame; 1 is text. Anything
      // arriving in pieces has to be joined before JSON.parse sees it.
      if (f.op === 8) { this.close(); return; }
      if (f.op === 9) { this._send(10, f.payload); continue; }   // ping -> pong
      if (f.op === 1 || f.op === 0) {
        this.frags.push(f.payload);
        if (f.fin) {
          const msg = Buffer.concat(this.frags).toString('utf8');
          this.frags = [];
          if (this.onmessage) this.onmessage(msg);
        }
      }
    }
  }

  /** Decode one frame from the head of the buffer, or null if incomplete. */
  _frame() {
    const b = this.buf;
    if (b.length < 2) return null;
    const fin = (b[0] & 0x80) !== 0;
    const op = b[0] & 0x0f;
    const masked = (b[1] & 0x80) !== 0;
    let len = b[1] & 0x7f;
    let off = 2;
    if (len === 126) {
      if (b.length < 4) return null;
      len = b.readUInt16BE(2); off = 4;
    } else if (len === 127) {
      if (b.length < 10) return null;
      // Payloads above 2^53 cannot happen here; readBigUInt64BE keeps it exact
      // for the range that can.
      len = Number(b.readBigUInt64BE(2)); off = 10;
    }
    const maskLen = masked ? 4 : 0;
    if (b.length < off + maskLen + len) return null;
    let payload = b.subarray(off + maskLen, off + maskLen + len);
    if (masked) {
      const key = b.subarray(off, off + 4);
      payload = Buffer.from(payload);
      for (let i = 0; i < payload.length; i++) payload[i] ^= key[i & 3];
    }
    this.buf = b.subarray(off + maskLen + len);
    return { fin, op, payload };
  }

  _send(op, payload) {
    const len = payload.length;
    const head = len < 126 ? 2 : len < 65536 ? 4 : 10;
    const buf = Buffer.alloc(head + 4 + len);
    buf[0] = 0x80 | op;
    // Client-to-server frames MUST be masked, or the server drops the
    // connection without explanation.
    buf[1] = 0x80 | (len < 126 ? len : len < 65536 ? 126 : 127);
    if (head === 4) buf.writeUInt16BE(len, 2);
    else if (head === 10) buf.writeBigUInt64BE(BigInt(len), 2);
    const key = randomBytes(4);
    key.copy(buf, head);
    for (let i = 0; i < len; i++) buf[head + 4 + i] = payload[i] ^ key[i & 3];
    this.sock.write(buf);
  }

  send(text) { this._send(1, Buffer.from(text, 'utf8')); }
  close() { try { this.sock.destroy(); } catch { /* already gone */ } }
}

/** Open a WebSocket to `url` (ws://host:port/path) and resolve a Socket. */
export function open(url) {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const key = randomBytes(16).toString('base64');
    const sock = net.connect(Number(u.port), u.hostname, () => {
      const req = [
        `GET ${u.pathname}${u.search} HTTP/1.1`,
        `Host: ${u.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '', '',
      ].join('\r\n');
      sock.write(req);
    });
    sock.on('error', reject);
    let head = Buffer.alloc(0);
    const onData = (d) => {
      head = Buffer.concat([head, d]);
      const end = head.indexOf('\r\n\r\n');
      if (end < 0) return;
      const res = head.subarray(0, end).toString();
      if (!/^HTTP\/1\.1 101/.test(res)) { reject(new Error(res.split('\r\n')[0])); return; }
      const accept = createHash('sha1').update(key + GUID).digest('base64');
      if (!res.includes(accept)) { reject(new Error('bad Sec-WebSocket-Accept')); return; }
      sock.removeListener('data', onData);
      const ws = new Socket(sock);
      resolve(ws);
      // Bytes after the handshake are already frames.
      const rest = head.subarray(end + 4);
      if (rest.length) ws._feed(rest);
    };
    sock.on('data', onData);
  });
}

/** A CDP session: `send(method, params)` returns a promise; events go to `on`. */
export class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = [];
    ws.onmessage = (text) => {
      const m = JSON.parse(text);
      if (m.id && this.pending.has(m.id)) {
        this.pending.get(m.id)(m);
        this.pending.delete(m.id);
      } else if (m.method) {
        for (const h of this.handlers) h(m);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((res) => {
      const i = ++this.id;
      this.pending.set(i, res);
      this.ws.send(JSON.stringify({ id: i, method, params }));
    });
  }
  on(fn) { this.handlers.push(fn); }
  /** Evaluate an expression in the page and return its value. */
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    return r.result?.result?.value;
  }
  /**
   * Collect console output into an array, which is how every tool here reads
   * results back out of the page. Requires Runtime.enable first.
   */
  collectConsole(into = []) {
    this.on((m) => {
      if (m.method === 'Runtime.consoleAPICalled') {
        into.push(m.params.args.map((a) => a.value ?? '').join(' '));
      }
    });
    return into;
  }
  close() { this.ws.close(); }
}

/**
 * Poll the browser's /json/list until a page target matches, then attach.
 * `match` is a substring of the target URL.
 */
export async function attach(port, match, tries = 80) {
  let last = 'no response';
  for (let i = 0; i < tries; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && t.url.includes(match));
      if (page) return new Session(await open(page.webSocketDebuggerUrl));
      last = `targets: ${JSON.stringify(list.map((t) => t.url))}`;
    } catch (e) { last = e.message; }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no devtools target matching "${match}" on :${port} -- ${last}`);
}
