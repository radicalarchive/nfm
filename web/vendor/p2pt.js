var Lt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ce(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a;
}
var me = { exports: {} }, De, _t;
function Vn() {
  if (_t) return De;
  _t = 1;
  var a = 1e3, e = a * 60, n = e * 60, i = n * 24, s = i * 7, l = i * 365.25;
  De = function(g, d) {
    d = d || {};
    var y = typeof g;
    if (y === "string" && g.length > 0)
      return u(g);
    if (y === "number" && isFinite(g))
      return d.long ? b(g) : S(g);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(g)
    );
  };
  function u(g) {
    if (g = String(g), !(g.length > 100)) {
      var d = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        g
      );
      if (d) {
        var y = parseFloat(d[1]), R = (d[2] || "ms").toLowerCase();
        switch (R) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return y * l;
          case "weeks":
          case "week":
          case "w":
            return y * s;
          case "days":
          case "day":
          case "d":
            return y * i;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return y * n;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return y * e;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return y * a;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return y;
          default:
            return;
        }
      }
    }
  }
  function S(g) {
    var d = Math.abs(g);
    return d >= i ? Math.round(g / i) + "d" : d >= n ? Math.round(g / n) + "h" : d >= e ? Math.round(g / e) + "m" : d >= a ? Math.round(g / a) + "s" : g + "ms";
  }
  function b(g) {
    var d = Math.abs(g);
    return d >= i ? p(g, d, i, "day") : d >= n ? p(g, d, n, "hour") : d >= e ? p(g, d, e, "minute") : d >= a ? p(g, d, a, "second") : g + " ms";
  }
  function p(g, d, y, R) {
    var k = d >= y * 1.5;
    return Math.round(g / y) + " " + R + (k ? "s" : "");
  }
  return De;
}
var Fe, pt;
function Kn() {
  if (pt) return Fe;
  pt = 1;
  function a(e) {
    i.debug = i, i.default = i, i.coerce = p, i.disable = S, i.enable = l, i.enabled = b, i.humanize = Vn(), i.destroy = g, Object.keys(e).forEach((d) => {
      i[d] = e[d];
    }), i.names = [], i.skips = [], i.formatters = {};
    function n(d) {
      let y = 0;
      for (let R = 0; R < d.length; R++)
        y = (y << 5) - y + d.charCodeAt(R), y |= 0;
      return i.colors[Math.abs(y) % i.colors.length];
    }
    i.selectColor = n;
    function i(d) {
      let y, R = null, k, D;
      function x(...O) {
        if (!x.enabled)
          return;
        const P = x, F = Number(/* @__PURE__ */ new Date()), c = F - (y || F);
        P.diff = c, P.prev = y, P.curr = F, y = F, O[0] = i.coerce(O[0]), typeof O[0] != "string" && O.unshift("%O");
        let o = 0;
        O[0] = O[0].replace(/%([a-zA-Z%])/g, (_, m) => {
          if (_ === "%%")
            return "%";
          o++;
          const T = i.formatters[m];
          if (typeof T == "function") {
            const E = O[o];
            _ = T.call(P, E), O.splice(o, 1), o--;
          }
          return _;
        }), i.formatArgs.call(P, O), (P.log || i.log).apply(P, O);
      }
      return x.namespace = d, x.useColors = i.useColors(), x.color = i.selectColor(d), x.extend = s, x.destroy = i.destroy, Object.defineProperty(x, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => R !== null ? R : (k !== i.namespaces && (k = i.namespaces, D = i.enabled(d)), D),
        set: (O) => {
          R = O;
        }
      }), typeof i.init == "function" && i.init(x), x;
    }
    function s(d, y) {
      const R = i(this.namespace + (typeof y > "u" ? ":" : y) + d);
      return R.log = this.log, R;
    }
    function l(d) {
      i.save(d), i.namespaces = d, i.names = [], i.skips = [];
      const y = (typeof d == "string" ? d : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const R of y)
        R[0] === "-" ? i.skips.push(R.slice(1)) : i.names.push(R);
    }
    function u(d, y) {
      let R = 0, k = 0, D = -1, x = 0;
      for (; R < d.length; )
        if (k < y.length && (y[k] === d[R] || y[k] === "*"))
          y[k] === "*" ? (D = k, x = R, k++) : (R++, k++);
        else if (D !== -1)
          k = D + 1, x++, R = x;
        else
          return !1;
      for (; k < y.length && y[k] === "*"; )
        k++;
      return k === y.length;
    }
    function S() {
      const d = [
        ...i.names,
        ...i.skips.map((y) => "-" + y)
      ].join(",");
      return i.enable(""), d;
    }
    function b(d) {
      for (const y of i.skips)
        if (u(d, y))
          return !1;
      for (const y of i.names)
        if (u(d, y))
          return !0;
      return !1;
    }
    function p(d) {
      return d instanceof Error ? d.stack || d.message : d;
    }
    function g() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return i.enable(i.load()), i;
  }
  return Fe = a, Fe;
}
var gt;
function $n() {
  return gt || (gt = 1, function(a, e) {
    e.formatArgs = i, e.save = s, e.load = l, e.useColors = n, e.storage = u(), e.destroy = /* @__PURE__ */ (() => {
      let b = !1;
      return () => {
        b || (b = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), e.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function n() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let b;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (b = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(b[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function i(b) {
      if (b[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + b[0] + (this.useColors ? "%c " : " ") + "+" + a.exports.humanize(this.diff), !this.useColors)
        return;
      const p = "color: " + this.color;
      b.splice(1, 0, p, "color: inherit");
      let g = 0, d = 0;
      b[0].replace(/%[a-zA-Z%]/g, (y) => {
        y !== "%%" && (g++, y === "%c" && (d = g));
      }), b.splice(d, 0, p);
    }
    e.log = console.debug || console.log || (() => {
    });
    function s(b) {
      try {
        b ? e.storage.setItem("debug", b) : e.storage.removeItem("debug");
      } catch {
      }
    }
    function l() {
      let b;
      try {
        b = e.storage.getItem("debug") || e.storage.getItem("DEBUG");
      } catch {
      }
      return !b && typeof process < "u" && "env" in process && (b = process.env.DEBUG), b;
    }
    function u() {
      try {
        return localStorage;
      } catch {
      }
    }
    a.exports = Kn()(e);
    const { formatters: S } = a.exports;
    S.j = function(b) {
      try {
        return JSON.stringify(b);
      } catch (p) {
        return "[UnexpectedJSONParseError]: " + p.message;
      }
    };
  }(me, me.exports)), me.exports;
}
var zn = $n();
const Te = /* @__PURE__ */ Ce(zn), H = typeof window < "u" ? window : self, He = H.RTCPeerConnection || H.mozRTCPeerConnection || H.webkitRTCPeerConnection, Jn = H.RTCSessionDescription || H.mozRTCSessionDescription || H.webkitRTCSessionDescription, Xn = H.RTCIceCandidate || H.mozRTCIceCandidate || H.webkitRTCIceCandidate;
var be = { exports: {} }, mt;
function Pt() {
  if (mt) return be.exports;
  mt = 1;
  var a = typeof Reflect == "object" ? Reflect : null, e = a && typeof a.apply == "function" ? a.apply : function(o, f, _) {
    return Function.prototype.apply.call(o, f, _);
  }, n;
  a && typeof a.ownKeys == "function" ? n = a.ownKeys : Object.getOwnPropertySymbols ? n = function(o) {
    return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
  } : n = function(o) {
    return Object.getOwnPropertyNames(o);
  };
  function i(c) {
    console && console.warn && console.warn(c);
  }
  var s = Number.isNaN || function(o) {
    return o !== o;
  };
  function l() {
    l.init.call(this);
  }
  be.exports = l, be.exports.once = O, l.EventEmitter = l, l.prototype._events = void 0, l.prototype._eventsCount = 0, l.prototype._maxListeners = void 0;
  var u = 10;
  function S(c) {
    if (typeof c != "function")
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof c);
  }
  Object.defineProperty(l, "defaultMaxListeners", {
    enumerable: !0,
    get: function() {
      return u;
    },
    set: function(c) {
      if (typeof c != "number" || c < 0 || s(c))
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + c + ".");
      u = c;
    }
  }), l.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  }, l.prototype.setMaxListeners = function(o) {
    if (typeof o != "number" || o < 0 || s(o))
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + o + ".");
    return this._maxListeners = o, this;
  };
  function b(c) {
    return c._maxListeners === void 0 ? l.defaultMaxListeners : c._maxListeners;
  }
  l.prototype.getMaxListeners = function() {
    return b(this);
  }, l.prototype.emit = function(o) {
    for (var f = [], _ = 1; _ < arguments.length; _++) f.push(arguments[_]);
    var m = o === "error", T = this._events;
    if (T !== void 0)
      m = m && T.error === void 0;
    else if (!m)
      return !1;
    if (m) {
      var E;
      if (f.length > 0 && (E = f[0]), E instanceof Error)
        throw E;
      var L = new Error("Unhandled error." + (E ? " (" + E.message + ")" : ""));
      throw L.context = E, L;
    }
    var V = T[o];
    if (V === void 0)
      return !1;
    if (typeof V == "function")
      e(V, this, f);
    else
      for (var fe = V.length, Re = k(V, fe), _ = 0; _ < fe; ++_)
        e(Re[_], this, f);
    return !0;
  };
  function p(c, o, f, _) {
    var m, T, E;
    if (S(f), T = c._events, T === void 0 ? (T = c._events = /* @__PURE__ */ Object.create(null), c._eventsCount = 0) : (T.newListener !== void 0 && (c.emit(
      "newListener",
      o,
      f.listener ? f.listener : f
    ), T = c._events), E = T[o]), E === void 0)
      E = T[o] = f, ++c._eventsCount;
    else if (typeof E == "function" ? E = T[o] = _ ? [f, E] : [E, f] : _ ? E.unshift(f) : E.push(f), m = b(c), m > 0 && E.length > m && !E.warned) {
      E.warned = !0;
      var L = new Error("Possible EventEmitter memory leak detected. " + E.length + " " + String(o) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      L.name = "MaxListenersExceededWarning", L.emitter = c, L.type = o, L.count = E.length, i(L);
    }
    return c;
  }
  l.prototype.addListener = function(o, f) {
    return p(this, o, f, !1);
  }, l.prototype.on = l.prototype.addListener, l.prototype.prependListener = function(o, f) {
    return p(this, o, f, !0);
  };
  function g() {
    if (!this.fired)
      return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  function d(c, o, f) {
    var _ = { fired: !1, wrapFn: void 0, target: c, type: o, listener: f }, m = g.bind(_);
    return m.listener = f, _.wrapFn = m, m;
  }
  l.prototype.once = function(o, f) {
    return S(f), this.on(o, d(this, o, f)), this;
  }, l.prototype.prependOnceListener = function(o, f) {
    return S(f), this.prependListener(o, d(this, o, f)), this;
  }, l.prototype.removeListener = function(o, f) {
    var _, m, T, E, L;
    if (S(f), m = this._events, m === void 0)
      return this;
    if (_ = m[o], _ === void 0)
      return this;
    if (_ === f || _.listener === f)
      --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete m[o], m.removeListener && this.emit("removeListener", o, _.listener || f));
    else if (typeof _ != "function") {
      for (T = -1, E = _.length - 1; E >= 0; E--)
        if (_[E] === f || _[E].listener === f) {
          L = _[E].listener, T = E;
          break;
        }
      if (T < 0)
        return this;
      T === 0 ? _.shift() : D(_, T), _.length === 1 && (m[o] = _[0]), m.removeListener !== void 0 && this.emit("removeListener", o, L || f);
    }
    return this;
  }, l.prototype.off = l.prototype.removeListener, l.prototype.removeAllListeners = function(o) {
    var f, _, m;
    if (_ = this._events, _ === void 0)
      return this;
    if (_.removeListener === void 0)
      return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : _[o] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete _[o]), this;
    if (arguments.length === 0) {
      var T = Object.keys(_), E;
      for (m = 0; m < T.length; ++m)
        E = T[m], E !== "removeListener" && this.removeAllListeners(E);
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (f = _[o], typeof f == "function")
      this.removeListener(o, f);
    else if (f !== void 0)
      for (m = f.length - 1; m >= 0; m--)
        this.removeListener(o, f[m]);
    return this;
  };
  function y(c, o, f) {
    var _ = c._events;
    if (_ === void 0)
      return [];
    var m = _[o];
    return m === void 0 ? [] : typeof m == "function" ? f ? [m.listener || m] : [m] : f ? x(m) : k(m, m.length);
  }
  l.prototype.listeners = function(o) {
    return y(this, o, !0);
  }, l.prototype.rawListeners = function(o) {
    return y(this, o, !1);
  }, l.listenerCount = function(c, o) {
    return typeof c.listenerCount == "function" ? c.listenerCount(o) : R.call(c, o);
  }, l.prototype.listenerCount = R;
  function R(c) {
    var o = this._events;
    if (o !== void 0) {
      var f = o[c];
      if (typeof f == "function")
        return 1;
      if (f !== void 0)
        return f.length;
    }
    return 0;
  }
  l.prototype.eventNames = function() {
    return this._eventsCount > 0 ? n(this._events) : [];
  };
  function k(c, o) {
    for (var f = new Array(o), _ = 0; _ < o; ++_)
      f[_] = c[_];
    return f;
  }
  function D(c, o) {
    for (; o + 1 < c.length; o++)
      c[o] = c[o + 1];
    c.pop();
  }
  function x(c) {
    for (var o = new Array(c.length), f = 0; f < o.length; ++f)
      o[f] = c[f].listener || c[f];
    return o;
  }
  function O(c, o) {
    return new Promise(function(f, _) {
      function m(E) {
        c.removeListener(o, T), _(E);
      }
      function T() {
        typeof c.removeListener == "function" && c.removeListener("error", m), f([].slice.call(arguments));
      }
      F(c, o, T, { once: !0 }), o !== "error" && P(c, m, { once: !0 });
    });
  }
  function P(c, o, f) {
    typeof c.on == "function" && F(c, "error", o, f);
  }
  function F(c, o, f, _) {
    if (typeof c.on == "function")
      _.once ? c.once(o, f) : c.on(o, f);
    else if (typeof c.addEventListener == "function")
      c.addEventListener(o, function m(T) {
        _.once && c.removeEventListener(o, m), f(T);
      });
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof c);
  }
  return be.exports;
}
var Le, bt;
function Qn() {
  return bt || (bt = 1, Le = class {
    constructor(e) {
      if (!(e > 0) || (e - 1 & e) !== 0) throw new Error("Max size for a FixedFIFO should be a power of two");
      this.buffer = new Array(e), this.mask = e - 1, this.top = 0, this.btm = 0, this.next = null;
    }
    clear() {
      this.top = this.btm = 0, this.next = null, this.buffer.fill(void 0);
    }
    push(e) {
      return this.buffer[this.top] !== void 0 ? !1 : (this.buffer[this.top] = e, this.top = this.top + 1 & this.mask, !0);
    }
    shift() {
      const e = this.buffer[this.btm];
      if (e !== void 0)
        return this.buffer[this.btm] = void 0, this.btm = this.btm + 1 & this.mask, e;
    }
    peek() {
      return this.buffer[this.btm];
    }
    isEmpty() {
      return this.buffer[this.btm] === void 0;
    }
  }), Le;
}
var Pe, yt;
function Zn() {
  if (yt) return Pe;
  yt = 1;
  const a = Qn();
  return Pe = class {
    constructor(n) {
      this.hwm = n || 16, this.head = new a(this.hwm), this.tail = this.head, this.length = 0;
    }
    clear() {
      this.head = this.tail, this.head.clear(), this.length = 0;
    }
    push(n) {
      if (this.length++, !this.head.push(n)) {
        const i = this.head;
        this.head = i.next = new a(2 * this.head.buffer.length), this.head.push(n);
      }
    }
    shift() {
      this.length !== 0 && this.length--;
      const n = this.tail.shift();
      if (n === void 0 && this.tail.next) {
        const i = this.tail.next;
        return this.tail.next = null, this.tail = i, this.tail.shift();
      }
      return n;
    }
    peek() {
      const n = this.tail.peek();
      return n === void 0 && this.tail.next ? this.tail.next.peek() : n;
    }
    isEmpty() {
      return this.length === 0;
    }
  }, Pe;
}
var Ue, St;
function Et() {
  return St || (St = 1, Ue = class {
    constructor(e) {
      this.decoder = new TextDecoder(e === "utf16le" ? "utf16-le" : e);
    }
    get remaining() {
      return -1;
    }
    decode(e) {
      return this.decoder.decode(e, { stream: !0 });
    }
    flush() {
      return this.decoder.decode(new Uint8Array(0));
    }
  }), Ue;
}
var Me, wt;
function ei() {
  if (wt) return Me;
  wt = 1;
  const a = Et(), e = Et();
  Me = class {
    constructor(s = "utf8") {
      switch (this.encoding = n(s), this.encoding) {
        case "utf8":
          this.decoder = new e();
          break;
        case "utf16le":
        case "base64":
          throw new Error("Unsupported encoding: " + this.encoding);
        default:
          this.decoder = new a(this.encoding);
      }
    }
    get remaining() {
      return this.decoder.remaining;
    }
    push(s) {
      return typeof s == "string" ? s : this.decoder.decode(s);
    }
    // For Node.js compatibility
    write(s) {
      return this.push(s);
    }
    end(s) {
      let l = "";
      return s && (l = this.push(s)), l += this.decoder.flush(), l;
    }
  };
  function n(i) {
    switch (i = i.toLowerCase(), i) {
      case "utf8":
      case "utf-8":
        return "utf8";
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return "utf16le";
      case "latin1":
      case "binary":
        return "latin1";
      case "base64":
      case "ascii":
      case "hex":
        return i;
      default:
        throw new Error("Unknown encoding: " + i);
    }
  }
  return Me;
}
var We, Ct;
function ti() {
  if (Ct) return We;
  Ct = 1;
  const { EventEmitter: a } = Pt(), e = new Error("Stream was destroyed"), n = new Error("Premature close"), i = Zn(), s = ei(), l = typeof queueMicrotask > "u" ? (h) => Lt.process.nextTick(h) : queueMicrotask, u = (1 << 29) - 1, S = 1, b = 2, p = 4, g = 8, d = u ^ S, y = u ^ b, R = 16, k = 32, D = 64, x = 128, O = 256, P = 512, F = 1024, c = 2048, o = 4096, f = 8192, _ = 16384, m = 32768, T = 65536, E = 131072, L = O | P, V = R | T, fe = D | R, Re = o | x, Ae = O | E, Ht = u ^ R, Gt = u ^ D, Yt = u ^ (D | T), Ve = u ^ T, Vt = u ^ O, Kt = u ^ (x | f), $t = u ^ F, Ke = u ^ L, $e = u ^ m, zt = u ^ k, ze = u ^ E, Jt = u ^ Ae, q = 1 << 18, J = 2 << 18, ie = 4 << 18, K = 8 << 18, se = 16 << 18, G = 32 << 18, ke = 64 << 18, X = 128 << 18, xe = 256 << 18, $ = 512 << 18, _e = 1024 << 18, Xt = u ^ (q | xe), Je = u ^ ie, Qt = u ^ (q | $), Zt = u ^ se, en = u ^ K, Xe = u ^ X, tn = u ^ J, Qe = u ^ _e, re = R | q, Ze = u ^ re, ve = _ | G, W = p | g | b, U = W | S, et = W | ve, nn = Je & Gt, pe = X | m, sn = pe & Ze, tt = U | sn, rn = U | F | _, nt = U | _ | x, on = U | F | x, an = U | o | x | f, cn = U | R | F | _ | T | E, hn = W | F | _, ln = k | U | m | D, un = m | S, dn = U | $ | G, fn = K | se, it = K | q, _n = K | se | U | q, st = U | q | K | _e, pn = ie | q, gn = q | xe, mn = U | $ | it | G, bn = se | W | $ | G, yn = J | U | X | ie, Sn = $ | G | W, ge = Symbol.asyncIterator || Symbol("asyncIterator");
  class rt {
    constructor(t, { highWaterMark: r = 16384, map: w = null, mapWritable: C, byteLength: N, byteLengthWritable: v } = {}) {
      this.stream = t, this.queue = new i(), this.highWaterMark = r, this.buffered = 0, this.error = null, this.pipeline = null, this.drains = null, this.byteLength = v || N || dt, this.map = C || w, this.afterWrite = An.bind(this), this.afterUpdateNextTick = vn.bind(this);
    }
    get ended() {
      return (this.stream._duplexState & G) !== 0;
    }
    push(t) {
      return (this.stream._duplexState & Sn) !== 0 ? !1 : (this.map !== null && (t = this.map(t)), this.buffered += this.byteLength(t), this.queue.push(t), this.buffered < this.highWaterMark ? (this.stream._duplexState |= K, !0) : (this.stream._duplexState |= fn, !1));
    }
    shift() {
      const t = this.queue.shift();
      return this.buffered -= this.byteLength(t), this.buffered === 0 && (this.stream._duplexState &= en), t;
    }
    end(t) {
      typeof t == "function" ? this.stream.once("finish", t) : t != null && this.push(t), this.stream._duplexState = (this.stream._duplexState | $) & Je;
    }
    autoBatch(t, r) {
      const w = [], C = this.stream;
      for (w.push(t); (C._duplexState & st) === it; )
        w.push(C._writableState.shift());
      if ((C._duplexState & U) !== 0) return r(null);
      C._writev(w, r);
    }
    update() {
      const t = this.stream;
      t._duplexState |= J;
      do {
        for (; (t._duplexState & st) === K; ) {
          const r = this.shift();
          t._duplexState |= gn, t._write(r, this.afterWrite);
        }
        (t._duplexState & pn) === 0 && this.updateNonPrimary();
      } while (this.continueUpdate() === !0);
      t._duplexState &= tn;
    }
    updateNonPrimary() {
      const t = this.stream;
      if ((t._duplexState & mn) === $) {
        t._duplexState = t._duplexState | q, t._final(Rn.bind(this));
        return;
      }
      if ((t._duplexState & W) === p) {
        (t._duplexState & pe) === 0 && (t._duplexState |= re, t._destroy(ot.bind(this)));
        return;
      }
      (t._duplexState & tt) === S && (t._duplexState = (t._duplexState | re) & d, t._open(at.bind(this)));
    }
    continueUpdate() {
      return (this.stream._duplexState & X) === 0 ? !1 : (this.stream._duplexState &= Xe, !0);
    }
    updateCallback() {
      (this.stream._duplexState & yn) === ie ? this.update() : this.updateNextTick();
    }
    updateNextTick() {
      (this.stream._duplexState & X) === 0 && (this.stream._duplexState |= X, (this.stream._duplexState & J) === 0 && l(this.afterUpdateNextTick));
    }
  }
  class En {
    constructor(t, { highWaterMark: r = 16384, map: w = null, mapReadable: C, byteLength: N, byteLengthReadable: v } = {}) {
      this.stream = t, this.queue = new i(), this.highWaterMark = r === 0 ? 1 : r, this.buffered = 0, this.readAhead = r > 0, this.error = null, this.pipeline = null, this.byteLength = v || N || dt, this.map = C || w, this.pipeTo = null, this.afterRead = kn.bind(this), this.afterUpdateNextTick = xn.bind(this);
    }
    get ended() {
      return (this.stream._duplexState & _) !== 0;
    }
    pipe(t, r) {
      if (this.pipeTo !== null) throw new Error("Can only pipe to one destination");
      if (typeof r != "function" && (r = null), this.stream._duplexState |= P, this.pipeTo = t, this.pipeline = new Cn(this.stream, t, r), r && this.stream.on("error", ft), ae(t))
        t._writableState.pipeline = this.pipeline, r && t.on("error", ft), t.on("finish", this.pipeline.finished.bind(this.pipeline));
      else {
        const w = this.pipeline.done.bind(this.pipeline, t), C = this.pipeline.done.bind(this.pipeline, t, null);
        t.on("error", w), t.on("close", C), t.on("finish", this.pipeline.finished.bind(this.pipeline));
      }
      t.on("drain", Tn.bind(this)), this.stream.emit("piping", t), t.emit("pipe", this.stream);
    }
    push(t) {
      const r = this.stream;
      return t === null ? (this.highWaterMark = 0, r._duplexState = (r._duplexState | F) & Yt, !1) : this.map !== null && (t = this.map(t), t === null) ? (r._duplexState &= Ve, this.buffered < this.highWaterMark) : (this.buffered += this.byteLength(t), this.queue.push(t), r._duplexState = (r._duplexState | x) & Ve, this.buffered < this.highWaterMark);
    }
    shift() {
      const t = this.queue.shift();
      return this.buffered -= this.byteLength(t), this.buffered === 0 && (this.stream._duplexState &= Kt), t;
    }
    unshift(t) {
      const r = [this.map !== null ? this.map(t) : t];
      for (; this.buffered > 0; ) r.push(this.shift());
      for (let w = 0; w < r.length - 1; w++) {
        const C = r[w];
        this.buffered += this.byteLength(C), this.queue.push(C);
      }
      this.push(r[r.length - 1]);
    }
    read() {
      const t = this.stream;
      if ((t._duplexState & nt) === x) {
        const r = this.shift();
        return this.pipeTo !== null && this.pipeTo.write(r) === !1 && (t._duplexState &= Ke), (t._duplexState & c) !== 0 && t.emit("data", r), r;
      }
      return this.readAhead === !1 && (t._duplexState |= E, this.updateNextTick()), null;
    }
    drain() {
      const t = this.stream;
      for (; (t._duplexState & nt) === x && (t._duplexState & L) !== 0; ) {
        const r = this.shift();
        this.pipeTo !== null && this.pipeTo.write(r) === !1 && (t._duplexState &= Ke), (t._duplexState & c) !== 0 && t.emit("data", r);
      }
    }
    update() {
      const t = this.stream;
      t._duplexState |= k;
      do {
        for (this.drain(); this.buffered < this.highWaterMark && (t._duplexState & cn) === E; )
          t._duplexState |= V, t._read(this.afterRead), this.drain();
        (t._duplexState & an) === Re && (t._duplexState |= f, t.emit("readable")), (t._duplexState & fe) === 0 && this.updateNonPrimary();
      } while (this.continueUpdate() === !0);
      t._duplexState &= zt;
    }
    updateNonPrimary() {
      const t = this.stream;
      if ((t._duplexState & on) === F && (t._duplexState = (t._duplexState | _) & $t, t.emit("end"), (t._duplexState & et) === ve && (t._duplexState |= p), this.pipeTo !== null && this.pipeTo.end()), (t._duplexState & W) === p) {
        (t._duplexState & pe) === 0 && (t._duplexState |= re, t._destroy(ot.bind(this)));
        return;
      }
      (t._duplexState & tt) === S && (t._duplexState = (t._duplexState | re) & d, t._open(at.bind(this)));
    }
    continueUpdate() {
      return (this.stream._duplexState & m) === 0 ? !1 : (this.stream._duplexState &= $e, !0);
    }
    updateCallback() {
      (this.stream._duplexState & ln) === D ? this.update() : this.updateNextTick();
    }
    updateNextTickIfOpen() {
      (this.stream._duplexState & un) === 0 && (this.stream._duplexState |= m, (this.stream._duplexState & k) === 0 && l(this.afterUpdateNextTick));
    }
    updateNextTick() {
      (this.stream._duplexState & m) === 0 && (this.stream._duplexState |= m, (this.stream._duplexState & k) === 0 && l(this.afterUpdateNextTick));
    }
  }
  class wn {
    constructor(t) {
      this.data = null, this.afterTransform = In.bind(t), this.afterFinal = null;
    }
  }
  class Cn {
    constructor(t, r, w) {
      this.from = t, this.to = r, this.afterPipe = w, this.error = null, this.pipeToFinished = !1;
    }
    finished() {
      this.pipeToFinished = !0;
    }
    done(t, r) {
      if (r && (this.error = r), t === this.to && (this.to = null, this.from !== null)) {
        ((this.from._duplexState & _) === 0 || !this.pipeToFinished) && this.from.destroy(this.error || new Error("Writable stream closed prematurely"));
        return;
      }
      if (t === this.from && (this.from = null, this.to !== null)) {
        (t._duplexState & _) === 0 && this.to.destroy(this.error || new Error("Readable stream closed before ending"));
        return;
      }
      this.afterPipe !== null && this.afterPipe(this.error), this.to = this.from = this.afterPipe = null;
    }
  }
  function Tn() {
    this.stream._duplexState |= P, this.updateCallback();
  }
  function Rn(h) {
    const t = this.stream;
    h && t.destroy(h), (t._duplexState & W) === 0 && (t._duplexState |= G, t.emit("finish")), (t._duplexState & et) === ve && (t._duplexState |= p), t._duplexState &= Qt, (t._duplexState & J) === 0 ? this.update() : this.updateNextTick();
  }
  function ot(h) {
    const t = this.stream;
    !h && this.error !== e && (h = this.error), h && t.emit("error", h), t._duplexState |= g, t.emit("close");
    const r = t._readableState, w = t._writableState;
    if (r !== null && r.pipeline !== null && r.pipeline.done(t, h), w !== null) {
      for (; w.drains !== null && w.drains.length > 0; ) w.drains.shift().resolve(!1);
      w.pipeline !== null && w.pipeline.done(t, h);
    }
  }
  function An(h) {
    const t = this.stream;
    h && t.destroy(h), t._duplexState &= Xt, this.drains !== null && Nn(this.drains), (t._duplexState & _n) === se && (t._duplexState &= Zt, (t._duplexState & ke) === ke && t.emit("drain")), this.updateCallback();
  }
  function kn(h) {
    h && this.stream.destroy(h), this.stream._duplexState &= Ht, this.readAhead === !1 && (this.stream._duplexState & O) === 0 && (this.stream._duplexState &= ze), this.updateCallback();
  }
  function xn() {
    (this.stream._duplexState & k) === 0 && (this.stream._duplexState &= $e, this.update());
  }
  function vn() {
    (this.stream._duplexState & J) === 0 && (this.stream._duplexState &= Xe, this.update());
  }
  function Nn(h) {
    for (let t = 0; t < h.length; t++)
      --h[t].writes === 0 && (h.shift().resolve(!0), t--);
  }
  function at(h) {
    const t = this.stream;
    h && t.destroy(h), (t._duplexState & p) === 0 && ((t._duplexState & rn) === 0 && (t._duplexState |= D), (t._duplexState & dn) === 0 && (t._duplexState |= ie), t.emit("open")), t._duplexState &= Ze, t._writableState !== null && t._writableState.updateCallback(), t._readableState !== null && t._readableState.updateCallback();
  }
  function In(h, t) {
    t != null && this.push(t), this._writableState.afterWrite(h);
  }
  function On(h) {
    this._readableState !== null && (h === "data" && (this._duplexState |= c | Ae, this._readableState.updateNextTick()), h === "readable" && (this._duplexState |= o, this._readableState.updateNextTick())), this._writableState !== null && h === "drain" && (this._duplexState |= ke, this._writableState.updateNextTick());
  }
  class Ne extends a {
    constructor(t) {
      super(), this._duplexState = 0, this._readableState = null, this._writableState = null, t && (t.open && (this._open = t.open), t.destroy && (this._destroy = t.destroy), t.predestroy && (this._predestroy = t.predestroy), t.signal && t.signal.addEventListener("abort", Hn.bind(this))), this.on("newListener", On);
    }
    _open(t) {
      t(null);
    }
    _destroy(t) {
      t(null);
    }
    _predestroy() {
    }
    get readable() {
      return this._readableState !== null ? !0 : void 0;
    }
    get writable() {
      return this._writableState !== null ? !0 : void 0;
    }
    get destroyed() {
      return (this._duplexState & g) !== 0;
    }
    get destroying() {
      return (this._duplexState & W) !== 0;
    }
    destroy(t) {
      (this._duplexState & W) === 0 && (t || (t = e), this._duplexState = (this._duplexState | p) & nn, this._readableState !== null && (this._readableState.highWaterMark = 0, this._readableState.error = t), this._writableState !== null && (this._writableState.highWaterMark = 0, this._writableState.error = t), this._duplexState |= b, this._predestroy(), this._duplexState &= y, this._readableState !== null && this._readableState.updateNextTick(), this._writableState !== null && this._writableState.updateNextTick());
    }
  }
  class oe extends Ne {
    constructor(t) {
      super(t), this._duplexState |= S | G | E, this._readableState = new En(this, t), t && (this._readableState.readAhead === !1 && (this._duplexState &= ze), t.read && (this._read = t.read), t.eagerOpen && this._readableState.updateNextTick(), t.encoding && this.setEncoding(t.encoding));
    }
    setEncoding(t) {
      const r = new s(t), w = this._readableState.map || Pn;
      return this._readableState.map = C, this;
      function C(N) {
        const v = r.push(N);
        return v === "" && (N.byteLength !== 0 || r.remaining > 0) ? null : w(v);
      }
    }
    _read(t) {
      t(null);
    }
    pipe(t, r) {
      return this._readableState.updateNextTick(), this._readableState.pipe(t, r), t;
    }
    read() {
      return this._readableState.updateNextTick(), this._readableState.read();
    }
    push(t) {
      return this._readableState.updateNextTickIfOpen(), this._readableState.push(t);
    }
    unshift(t) {
      return this._readableState.updateNextTickIfOpen(), this._readableState.unshift(t);
    }
    resume() {
      return this._duplexState |= Ae, this._readableState.updateNextTick(), this;
    }
    pause() {
      return this._duplexState &= this._readableState.readAhead === !1 ? Jt : Vt, this;
    }
    static _fromAsyncIterator(t, r) {
      let w;
      const C = new oe({
        ...r,
        read(v) {
          t.next().then(N).then(v.bind(null, null)).catch(v);
        },
        predestroy() {
          w = t.return();
        },
        destroy(v) {
          if (!w) return v(null);
          w.then(v.bind(null, null)).catch(v);
        }
      });
      return C;
      function N(v) {
        v.done ? C.push(null) : C.push(v.value);
      }
    }
    static from(t, r) {
      if (Bn(t)) return t;
      if (t[ge]) return this._fromAsyncIterator(t[ge](), r);
      Array.isArray(t) || (t = t === void 0 ? [] : [t]);
      let w = 0;
      return new oe({
        ...r,
        read(C) {
          this.push(w === t.length ? null : t[w++]), C(null);
        }
      });
    }
    static isBackpressured(t) {
      return (t._duplexState & hn) !== 0 || t._readableState.buffered >= t._readableState.highWaterMark;
    }
    static isPaused(t) {
      return (t._duplexState & O) === 0;
    }
    [ge]() {
      const t = this;
      let r = null, w = null, C = null;
      return this.on("error", (A) => {
        r = A;
      }), this.on("readable", N), this.on("close", v), {
        [ge]() {
          return this;
        },
        next() {
          return new Promise(function(A, B) {
            w = A, C = B;
            const Y = t.read();
            Y !== null ? Q(Y) : (t._duplexState & g) !== 0 && Q(null);
          });
        },
        return() {
          return ce(null);
        },
        throw(A) {
          return ce(A);
        }
      };
      function N() {
        w !== null && Q(t.read());
      }
      function v() {
        w !== null && Q(null);
      }
      function Q(A) {
        C !== null && (r ? C(r) : A === null && (t._duplexState & _) === 0 ? C(e) : w({ value: A, done: A === null }), C = w = null);
      }
      function ce(A) {
        return t.destroy(A), new Promise((B, Y) => {
          if (t._duplexState & g) return B({ value: void 0, done: !0 });
          t.once("close", function() {
            A ? Y(A) : B({ value: void 0, done: !0 });
          });
        });
      }
    }
  }
  class ct extends Ne {
    constructor(t) {
      super(t), this._duplexState |= S | _, this._writableState = new rt(this, t), t && (t.writev && (this._writev = t.writev), t.write && (this._write = t.write), t.final && (this._final = t.final), t.eagerOpen && this._writableState.updateNextTick());
    }
    cork() {
      this._duplexState |= _e;
    }
    uncork() {
      this._duplexState &= Qe, this._writableState.updateNextTick();
    }
    _writev(t, r) {
      r(null);
    }
    _write(t, r) {
      this._writableState.autoBatch(t, r);
    }
    _final(t) {
      t(null);
    }
    static isBackpressured(t) {
      return (t._duplexState & bn) !== 0;
    }
    static drained(t) {
      if (t.destroyed) return Promise.resolve(!1);
      const r = t._writableState, C = (Gn(t) ? Math.min(1, r.queue.length) : r.queue.length) + (t._duplexState & xe ? 1 : 0);
      return C === 0 ? Promise.resolve(!0) : (r.drains === null && (r.drains = []), new Promise((N) => {
        r.drains.push({ writes: C, resolve: N });
      }));
    }
    write(t) {
      return this._writableState.updateNextTick(), this._writableState.push(t);
    }
    end(t) {
      return this._writableState.updateNextTick(), this._writableState.end(t), this;
    }
  }
  class Ie extends oe {
    // and Writable
    constructor(t) {
      super(t), this._duplexState = S | this._duplexState & E, this._writableState = new rt(this, t), t && (t.writev && (this._writev = t.writev), t.write && (this._write = t.write), t.final && (this._final = t.final));
    }
    cork() {
      this._duplexState |= _e;
    }
    uncork() {
      this._duplexState &= Qe, this._writableState.updateNextTick();
    }
    _writev(t, r) {
      r(null);
    }
    _write(t, r) {
      this._writableState.autoBatch(t, r);
    }
    _final(t) {
      t(null);
    }
    write(t) {
      return this._writableState.updateNextTick(), this._writableState.push(t);
    }
    end(t) {
      return this._writableState.updateNextTick(), this._writableState.end(t), this;
    }
  }
  class ht extends Ie {
    constructor(t) {
      super(t), this._transformState = new wn(this), t && (t.transform && (this._transform = t.transform), t.flush && (this._flush = t.flush));
    }
    _write(t, r) {
      this._readableState.buffered >= this._readableState.highWaterMark ? this._transformState.data = t : this._transform(t, this._transformState.afterTransform);
    }
    _read(t) {
      if (this._transformState.data !== null) {
        const r = this._transformState.data;
        this._transformState.data = null, t(null), this._transform(r, this._transformState.afterTransform);
      } else
        t(null);
    }
    destroy(t) {
      super.destroy(t), this._transformState.data !== null && (this._transformState.data = null, this._transformState.afterTransform());
    }
    _transform(t, r) {
      r(null, t);
    }
    _flush(t) {
      t(null);
    }
    _final(t) {
      this._transformState.afterFinal = t, this._flush(Fn.bind(this));
    }
  }
  class Dn extends ht {
  }
  function Fn(h, t) {
    const r = this._transformState.afterFinal;
    if (h) return r(h);
    t != null && this.push(t), this.push(null), r(null);
  }
  function Ln(...h) {
    return new Promise((t, r) => lt(...h, (w) => {
      if (w) return r(w);
      t();
    }));
  }
  function lt(h, ...t) {
    const r = Array.isArray(h) ? [...h, ...t] : [h, ...t], w = r.length && typeof r[r.length - 1] == "function" ? r.pop() : null;
    if (r.length < 2) throw new Error("Pipeline requires at least 2 streams");
    let C = r[0], N = null, v = null;
    for (let A = 1; A < r.length; A++)
      N = r[A], ae(C) ? C.pipe(N, ce) : (Q(C, !0, A > 1, ce), C.pipe(N)), C = N;
    if (w) {
      let A = !1;
      const B = ae(N) || !!(N._writableState && N._writableState.autoDestroy);
      N.on("error", (Y) => {
        v === null && (v = Y);
      }), N.on("finish", () => {
        A = !0, B || w(v);
      }), B && N.on("close", () => w(v || (A ? null : n)));
    }
    return N;
    function Q(A, B, Y, Oe) {
      A.on("error", Oe), A.on("close", Yn);
      function Yn() {
        if (A._readableState && !A._readableState.ended || Y && A._writableState && !A._writableState.ended) return Oe(n);
      }
    }
    function ce(A) {
      if (!(!A || v)) {
        v = A;
        for (const B of r)
          B.destroy(A);
      }
    }
  }
  function Pn(h) {
    return h;
  }
  function ut(h) {
    return !!h._readableState || !!h._writableState;
  }
  function ae(h) {
    return typeof h._duplexState == "number" && ut(h);
  }
  function Un(h) {
    return !!h._readableState && h._readableState.ended;
  }
  function Mn(h) {
    return !!h._writableState && h._writableState.ended;
  }
  function Wn(h, t = {}) {
    const r = h._readableState && h._readableState.error || h._writableState && h._writableState.error;
    return !t.all && r === e ? null : r;
  }
  function Bn(h) {
    return ae(h) && h.readable;
  }
  function qn(h) {
    return (h._duplexState & S) !== S || (h._duplexState & pe) !== 0;
  }
  function jn(h) {
    return typeof h == "object" && h !== null && typeof h.byteLength == "number";
  }
  function dt(h) {
    return jn(h) ? h.byteLength : 1024;
  }
  function ft() {
  }
  function Hn() {
    this.destroy(new Error("Stream aborted."));
  }
  function Gn(h) {
    return h._writev !== ct.prototype._writev && h._writev !== Ie.prototype._writev;
  }
  return We = {
    pipeline: lt,
    pipelinePromise: Ln,
    isStream: ut,
    isStreamx: ae,
    isEnded: Un,
    isFinished: Mn,
    isDisturbed: qn,
    getStreamError: Wn,
    Stream: Ne,
    Writable: ct,
    Readable: oe,
    Duplex: Ie,
    Transform: ht,
    // Export PassThrough for compatibility with Node.js core's stream module
    PassThrough: Dn
  }, We;
}
var Ut = ti(), Be, Tt;
function ni() {
  if (Tt) return Be;
  Tt = 1;
  function a(n, i) {
    for (const s in i)
      Object.defineProperty(n, s, {
        value: i[s],
        enumerable: !0,
        configurable: !0
      });
    return n;
  }
  function e(n, i, s) {
    if (!n || typeof n == "string")
      throw new TypeError("Please pass an Error to err-code");
    s || (s = {}), typeof i == "object" && (s = i, i = ""), i && (s.code = i);
    try {
      return a(n, s);
    } catch {
      s.message = n.message, s.stack = n.stack;
      const u = function() {
      };
      return u.prototype = Object.create(Object.getPrototypeOf(n)), a(new u(), s);
    }
  }
  return Be = e, Be;
}
var ii = ni();
const I = /* @__PURE__ */ Ce(ii);
/* Common package for dealing with hex/string/uint8 conversions (and sha1 hashing)
*
* @author   Jimmy Wärting <jimmy@warting.se> (https://jimmy.warting.se/opensource)
* @license  MIT
*/
const Se = "0123456789abcdef", Mt = [], Ee = [];
for (let a = 0; a < 256; a++)
  Mt[a] = Se[a >> 4 & 15] + Se[a & 15], a < 16 && (a < 10 ? Ee[48 + a] = a : Ee[87 + a] = a);
const ne = (a) => {
  const e = a.length;
  let n = "", i = 0;
  for (; i < e; )
    n += Mt[a[i++]];
  return n;
}, Wt = (a) => {
  const e = a.length >> 1, n = e << 1, i = new Uint8Array(e);
  let s = 0, l = 0;
  for (; l < n; )
    i[s++] = Ee[a.charCodeAt(l++)] << 4 | Ee[a.charCodeAt(l++)];
  return i;
};
var ee = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", si = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var ye = 0; ye < ee.length; ye++)
  si[ee.charCodeAt(ye)] = ye;
var ri = function(a) {
  var e = new Uint8Array(a), n, i = e.length, s = "";
  for (n = 0; n < i; n += 3)
    s += ee[e[n] >> 2], s += ee[(e[n] & 3) << 4 | e[n + 1] >> 4], s += ee[(e[n + 1] & 15) << 2 | e[n + 2] >> 6], s += ee[e[n + 2] & 63];
  return i % 3 === 2 ? s = s.substring(0, s.length - 1) + "=" : i % 3 === 1 && (s = s.substring(0, s.length - 2) + "=="), s;
};
const oi = new TextDecoder(), Bt = (a, e) => oi.decode(a), ai = new TextEncoder(), Ye = (a) => ai.encode(a), ci = (a) => ri(a), Z = (a) => {
  let e = "", n, i = 0;
  const s = a.length;
  for (; i < s; )
    n = a.charCodeAt(i++), e += Se[n >> 4] + Se[n & 15];
  return e;
}, Rt = 65536, ue = (a) => {
  const e = Wt(a);
  if (e.length <= Rt) return String.fromCharCode(...e);
  let n = "", i = 0;
  for (; i < e.length; )
    n += String.fromCharCode(...e.subarray(i, i += Rt));
  return n;
}, At = typeof window < "u" ? window : self, Ge = At.crypto || At.msCrypto || {}, kt = Ge.subtle || Ge.webkitSubtle, hi = {
  hex: ne,
  base64: ci
}, li = async (a, e, n = "sha-1") => {
  if (!kt) throw new Error("no web crypto support");
  typeof a == "string" && (a = Ye(a));
  const i = new Uint8Array(await kt.digest(n, a));
  return e ? hi[e](i) : i;
}, de = (a) => {
  const e = new Uint8Array(a);
  return Ge.getRandomValues(e);
};
/*! simple-peer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const ui = Te("simple-peer"), qe = 64 * 1024, di = 5 * 1e3, fi = 5 * 1e3;
function xt(a) {
  return a.replace(/a=ice-options:trickle\s\n/g, "");
}
function _i(a) {
  console.warn(a);
}
class z extends Ut.Duplex {
  /** @type {RTCPeerConnection} */
  _pc;
  constructor(e) {
    if (e = Object.assign({
      allowHalfOpen: !1
    }, e), super(e), this.__objectMode = !!e.objectMode, this._id = ne(de(4)).slice(0, 7), this._debug("new peer %o", e), this.channelName = e.initiator ? e.channelName || ne(de(20)) : null, this.initiator = e.initiator || !1, this.channelConfig = e.channelConfig || z.channelConfig, this.channelNegotiated = this.channelConfig.negotiated, this.config = Object.assign({}, z.config, e.config), this.offerOptions = e.offerOptions || {}, this.answerOptions = e.answerOptions || {}, this.sdpTransform = e.sdpTransform || ((n) => n), this.trickle = e.trickle !== void 0 ? e.trickle : !0, this.allowHalfTrickle = e.allowHalfTrickle !== void 0 ? e.allowHalfTrickle : !1, this.iceCompleteTimeout = e.iceCompleteTimeout || di, this._destroying = !1, this._connected = !1, this.remoteAddress = void 0, this.remoteFamily = void 0, this.remotePort = void 0, this.localAddress = void 0, this.localFamily = void 0, this.localPort = void 0, !He)
      throw I(typeof window > "u" ? new Error("No WebRTC support: Specify `opts.wrtc` option in this environment") : new Error("No WebRTC support: Not a supported browser"), "ERR_WEBRTC_SUPPORT");
    this._pcReady = !1, this._channelReady = !1, this._iceComplete = !1, this._iceCompleteTimer = null, this._channel = null, this._pendingCandidates = [], this._isNegotiating = !1, this._firstNegotiation = !0, this._batchedNegotiation = !1, this._queuedNegotiation = !1, this._sendersAwaitingStable = [], this._closingInterval = null, this._remoteTracks = [], this._remoteStreams = [], this._chunk = null, this._cb = null, this._interval = null;
    try {
      this._pc = new He(this.config);
    } catch (n) {
      this.__destroy(I(n, "ERR_PC_CONSTRUCTOR"));
      return;
    }
    this._isReactNativeWebrtc = typeof this._pc._peerConnectionId == "number", this._pc.oniceconnectionstatechange = () => {
      this._onIceStateChange();
    }, this._pc.onicegatheringstatechange = () => {
      this._onIceStateChange();
    }, this._pc.onconnectionstatechange = () => {
      this._onConnectionStateChange();
    }, this._pc.onsignalingstatechange = () => {
      this._onSignalingStateChange();
    }, this._pc.onicecandidate = (n) => {
      this._onIceCandidate(n);
    }, typeof this._pc.peerIdentity == "object" && this._pc.peerIdentity.catch((n) => {
      this.__destroy(I(n, "ERR_PC_PEER_IDENTITY"));
    }), this.initiator || this.channelNegotiated ? this._setupData({
      channel: this._pc.createDataChannel(this.channelName, this.channelConfig)
    }) : this._pc.ondatachannel = (n) => {
      this._setupData(n);
    }, this._debug("initial negotiation"), this._needsNegotiation(), this._onFinishBound = () => {
      this._onFinish();
    }, this.once("finish", this._onFinishBound);
  }
  get bufferSize() {
    return this._channel && this._channel.bufferedAmount || 0;
  }
  // HACK: it's possible channel.readyState is "closing" before peer.destroy() fires
  // https://bugs.chromium.org/p/chromium/issues/detail?id=882743
  get connected() {
    return this._connected && this._channel.readyState === "open";
  }
  address() {
    return { port: this.localPort, family: this.localFamily, address: this.localAddress };
  }
  signal(e) {
    if (!this._destroying) {
      if (this.destroyed) throw I(new Error("cannot signal after peer is destroyed"), "ERR_DESTROYED");
      if (typeof e == "string")
        try {
          e = JSON.parse(e);
        } catch {
          e = {};
        }
      this._debug("signal()"), e.renegotiate && this.initiator && (this._debug("got request to renegotiate"), this._needsNegotiation()), e.transceiverRequest && this.initiator && (this._debug("got request for transceiver"), this.addTransceiver(e.transceiverRequest.kind, e.transceiverRequest.init)), e.candidate && (this._pc.remoteDescription && this._pc.remoteDescription.type ? this._addIceCandidate(e.candidate) : this._pendingCandidates.push(e.candidate)), e.sdp && this._pc.setRemoteDescription(new Jn(e)).then(() => {
        this.destroyed || (this._pendingCandidates.forEach((n) => {
          this._addIceCandidate(n);
        }), this._pendingCandidates = [], this._pc.remoteDescription.type === "offer" && this._createAnswer());
      }).catch((n) => {
        this.__destroy(I(n, "ERR_SET_REMOTE_DESCRIPTION"));
      }), !e.sdp && !e.candidate && !e.renegotiate && !e.transceiverRequest && this.__destroy(I(new Error("signal() called with invalid signal data"), "ERR_SIGNALING"));
    }
  }
  _addIceCandidate(e) {
    const n = new Xn(e);
    this._pc.addIceCandidate(n).catch((i) => {
      !n.address || n.address.endsWith(".local") ? _i("Ignoring unsupported ICE candidate.") : this.__destroy(I(i, "ERR_ADD_ICE_CANDIDATE"));
    });
  }
  /**
   * Send text/binary data to the remote peer.
   * @param {ArrayBufferView|ArrayBuffer|Uint8Array|string|Blob} chunk
   */
  send(e) {
    if (!this._destroying) {
      if (this.destroyed) throw I(new Error("cannot send after peer is destroyed"), "ERR_DESTROYED");
      this._channel.send(e);
    }
  }
  _needsNegotiation() {
    this._debug("_needsNegotiation"), !this._batchedNegotiation && (this._batchedNegotiation = !0, queueMicrotask(() => {
      this._batchedNegotiation = !1, this.initiator || !this._firstNegotiation ? (this._debug("starting batched negotiation"), this.negotiate()) : this._debug("non-initiator initial negotiation request discarded"), this._firstNegotiation = !1;
    }));
  }
  negotiate() {
    if (!this._destroying) {
      if (this.destroyed) throw I(new Error("cannot negotiate after peer is destroyed"), "ERR_DESTROYED");
      this.initiator ? this._isNegotiating ? (this._queuedNegotiation = !0, this._debug("already negotiating, queueing")) : (this._debug("start negotiation"), setTimeout(() => {
        this._createOffer();
      }, 0)) : this._isNegotiating ? (this._queuedNegotiation = !0, this._debug("already negotiating, queueing")) : (this._debug("requesting negotiation from initiator"), this.emit("signal", {
        // request initiator to renegotiate
        type: "renegotiate",
        renegotiate: !0
      })), this._isNegotiating = !0;
    }
  }
  _final(e) {
    this._readableState.ended || this.push(null), e(null);
  }
  __destroy(e) {
    this.end(), this._destroy(() => {
    }, e);
  }
  _destroy(e, n) {
    this.destroyed || this._destroying || (this._destroying = !0, this._debug("destroying (error: %s)", n && (n.message || n)), setTimeout(() => {
      if (this._connected && this.emit("disconnect"), this._connected = !1, this._pcReady = !1, this._channelReady = !1, this._remoteTracks = null, this._remoteStreams = null, this._senderMap = null, clearInterval(this._closingInterval), this._closingInterval = null, clearInterval(this._interval), this._interval = null, this._chunk = null, this._cb = null, this._onFinishBound && this.removeListener("finish", this._onFinishBound), this._onFinishBound = null, this._channel) {
        try {
          this._channel.close();
        } catch {
        }
        this._channel.onmessage = null, this._channel.onopen = null, this._channel.onclose = null, this._channel.onerror = null;
      }
      if (this._pc) {
        try {
          this._pc.close();
        } catch {
        }
        this._pc.oniceconnectionstatechange = null, this._pc.onicegatheringstatechange = null, this._pc.onsignalingstatechange = null, this._pc.onicecandidate = null, this._pc.ontrack = null, this._pc.ondatachannel = null;
      }
      this._pc = null, this._channel = null, n && this.emit("error", n), e();
    }, 0));
  }
  _setupData(e) {
    if (!e.channel)
      return this.__destroy(I(new Error("Data channel event is missing `channel` property"), "ERR_DATA_CHANNEL"));
    this._channel = e.channel, this._channel.binaryType = "arraybuffer", typeof this._channel.bufferedAmountLowThreshold == "number" && (this._channel.bufferedAmountLowThreshold = qe), this.channelName = this._channel.label, this._channel.onmessage = (i) => {
      this._onChannelMessage(i);
    }, this._channel.onbufferedamountlow = () => {
      this._onChannelBufferedAmountLow();
    }, this._channel.onopen = () => {
      this._onChannelOpen();
    }, this._channel.onclose = () => {
      this._onChannelClose();
    }, this._channel.onerror = (i) => {
      const s = i.error instanceof Error ? i.error : new Error(`Datachannel error: ${i.message} ${i.filename}:${i.lineno}:${i.colno}`);
      this.__destroy(I(s, "ERR_DATA_CHANNEL"));
    };
    let n = !1;
    this._closingInterval = setInterval(() => {
      this._channel && this._channel.readyState === "closing" ? (n && this._onChannelClose(), n = !0) : n = !1;
    }, fi);
  }
  _write(e, n) {
    if (this.destroyed) return n(I(new Error("cannot write after peer is destroyed"), "ERR_DATA_CHANNEL"));
    if (this._connected) {
      try {
        this.send(e);
      } catch (i) {
        return this.__destroy(I(i, "ERR_DATA_CHANNEL"));
      }
      this._channel.bufferedAmount > qe ? (this._debug("start backpressure: bufferedAmount %d", this._channel.bufferedAmount), this._cb = n) : n(null);
    } else
      this._debug("write before connect"), this._chunk = e, this._cb = n;
  }
  // When stream finishes writing, close socket. Half open connections are not
  // supported.
  _onFinish() {
    if (this.destroyed) return;
    const e = () => {
      setTimeout(() => this.__destroy(), 1e3);
    };
    this._connected ? e() : this.once("connect", e);
  }
  _startIceCompleteTimeout() {
    this.destroyed || this._iceCompleteTimer || (this._debug("started iceComplete timeout"), this._iceCompleteTimer = setTimeout(() => {
      this._iceComplete || (this._iceComplete = !0, this._debug("iceComplete timeout completed"), this.emit("iceTimeout"), this.emit("_iceComplete"));
    }, this.iceCompleteTimeout));
  }
  _createOffer() {
    this.destroyed || this._pc.createOffer(this.offerOptions).then((e) => {
      if (this.destroyed) return;
      !this.trickle && !this.allowHalfTrickle && (e.sdp = xt(e.sdp)), e.sdp = this.sdpTransform(e.sdp);
      const n = () => {
        if (this.destroyed) return;
        const l = this._pc.localDescription || e;
        this._debug("signal"), this.emit("signal", {
          type: l.type,
          sdp: l.sdp
        });
      }, i = () => {
        this._debug("createOffer success"), !this.destroyed && (this.trickle || this._iceComplete ? n() : this.once("_iceComplete", n));
      }, s = (l) => {
        this.__destroy(I(l, "ERR_SET_LOCAL_DESCRIPTION"));
      };
      this._pc.setLocalDescription(e).then(i).catch(s);
    }).catch((e) => {
      this.__destroy(I(e, "ERR_CREATE_OFFER"));
    });
  }
  _createAnswer() {
    this.destroyed || this._pc.createAnswer(this.answerOptions).then((e) => {
      if (this.destroyed) return;
      !this.trickle && !this.allowHalfTrickle && (e.sdp = xt(e.sdp)), e.sdp = this.sdpTransform(e.sdp);
      const n = () => {
        if (this.destroyed) return;
        const l = this._pc.localDescription || e;
        this._debug("signal"), this.emit("signal", {
          type: l.type,
          sdp: l.sdp
        }), this.initiator || this._requestMissingTransceivers?.();
      }, i = () => {
        this.destroyed || (this.trickle || this._iceComplete ? n() : this.once("_iceComplete", n));
      }, s = (l) => {
        this.__destroy(I(l, "ERR_SET_LOCAL_DESCRIPTION"));
      };
      this._pc.setLocalDescription(e).then(i).catch(s);
    }).catch((e) => {
      this.__destroy(I(e, "ERR_CREATE_ANSWER"));
    });
  }
  _onConnectionStateChange() {
    this.destroyed || this._destroying || this._pc.connectionState === "failed" && this.__destroy(I(new Error("Connection failed."), "ERR_CONNECTION_FAILURE"));
  }
  _onIceStateChange() {
    if (this.destroyed) return;
    const e = this._pc.iceConnectionState, n = this._pc.iceGatheringState;
    this._debug(
      "iceStateChange (connection: %s) (gathering: %s)",
      e,
      n
    ), this.emit("iceStateChange", e, n), (e === "connected" || e === "completed") && (this._pcReady = !0, this._maybeReady()), e === "failed" && this.__destroy(I(new Error("Ice connection failed."), "ERR_ICE_CONNECTION_FAILURE")), e === "closed" && this.__destroy(I(new Error("Ice connection closed."), "ERR_ICE_CONNECTION_CLOSED"));
  }
  getStats(e) {
    const n = (i) => (Object.prototype.toString.call(i.values) === "[object Array]" && i.values.forEach((s) => {
      Object.assign(i, s);
    }), i);
    this._pc.getStats.length === 0 || this._isReactNativeWebrtc ? this._pc.getStats().then((i) => {
      const s = [];
      i.forEach((l) => {
        s.push(n(l));
      }), e(null, s);
    }, (i) => e(i)) : this._pc.getStats.length > 0 ? this._pc.getStats((i) => {
      if (this.destroyed) return;
      const s = [];
      i.result().forEach((l) => {
        const u = {};
        l.names().forEach((S) => {
          u[S] = l.stat(S);
        }), u.id = l.id, u.type = l.type, u.timestamp = l.timestamp, s.push(n(u));
      }), e(null, s);
    }, (i) => e(i)) : e(null, []);
  }
  _maybeReady() {
    if (this._debug("maybeReady pc %s channel %s", this._pcReady, this._channelReady), this._connected || this._connecting || !this._pcReady || !this._channelReady) return;
    this._connecting = !0;
    const e = () => {
      this.destroyed || this._destroying || this.getStats((n, i) => {
        if (this.destroyed || this._destroying) return;
        n && (i = []);
        const s = {}, l = {}, u = {};
        let S = !1;
        i.forEach((p) => {
          (p.type === "remotecandidate" || p.type === "remote-candidate") && (s[p.id] = p), (p.type === "localcandidate" || p.type === "local-candidate") && (l[p.id] = p), (p.type === "candidatepair" || p.type === "candidate-pair") && (u[p.id] = p);
        });
        const b = (p) => {
          S = !0;
          let g = l[p.localCandidateId];
          g && (g.ip || g.address) ? (this.localAddress = g.ip || g.address, this.localPort = Number(g.port)) : g && g.ipAddress ? (this.localAddress = g.ipAddress, this.localPort = Number(g.portNumber)) : typeof p.googLocalAddress == "string" && (g = p.googLocalAddress.split(":"), this.localAddress = g[0], this.localPort = Number(g[1])), this.localAddress && (this.localFamily = this.localAddress.includes(":") ? "IPv6" : "IPv4");
          let d = s[p.remoteCandidateId];
          d && (d.ip || d.address) ? (this.remoteAddress = d.ip || d.address, this.remotePort = Number(d.port)) : d && d.ipAddress ? (this.remoteAddress = d.ipAddress, this.remotePort = Number(d.portNumber)) : typeof p.googRemoteAddress == "string" && (d = p.googRemoteAddress.split(":"), this.remoteAddress = d[0], this.remotePort = Number(d[1])), this.remoteAddress && (this.remoteFamily = this.remoteAddress.includes(":") ? "IPv6" : "IPv4"), this._debug(
            "connect local: %s:%s remote: %s:%s",
            this.localAddress,
            this.localPort,
            this.remoteAddress,
            this.remotePort
          );
        };
        if (i.forEach((p) => {
          p.type === "transport" && p.selectedCandidatePairId && b(u[p.selectedCandidatePairId]), (p.type === "googCandidatePair" && p.googActiveConnection === "true" || (p.type === "candidatepair" || p.type === "candidate-pair") && p.selected) && b(p);
        }), !S && (!Object.keys(u).length || Object.keys(l).length)) {
          setTimeout(e, 100);
          return;
        } else
          this._connecting = !1, this._connected = !0, this.emit("connect");
        if (this._chunk) {
          try {
            this.send(this._chunk);
          } catch (g) {
            return this.__destroy(I(g, "ERR_DATA_CHANNEL"));
          }
          this._chunk = null, this._debug('sent chunk from "write before connect"');
          const p = this._cb;
          this._cb = null, p(null);
        }
        typeof this._channel.bufferedAmountLowThreshold != "number" && (this._interval = setInterval(() => this._onInterval(), 150), this._interval.unref && this._interval.unref()), this._debug("connect"), this.emit("connect");
      });
    };
    e();
  }
  _onInterval() {
    !this._cb || !this._channel || this._channel.bufferedAmount > qe || this._onChannelBufferedAmountLow();
  }
  _onSignalingStateChange() {
    this.destroyed || (this._pc.signalingState === "stable" && (this._isNegotiating = !1, this._debug("flushing sender queue", this._sendersAwaitingStable), this._sendersAwaitingStable.forEach((e) => {
      this._pc.removeTrack(e), this._queuedNegotiation = !0;
    }), this._sendersAwaitingStable = [], this._queuedNegotiation ? (this._debug("flushing negotiation queue"), this._queuedNegotiation = !1, this._needsNegotiation()) : (this._debug("negotiated"), this.emit("negotiated"))), this._debug("signalingStateChange %s", this._pc.signalingState), this.emit("signalingStateChange", this._pc.signalingState));
  }
  _onIceCandidate(e) {
    this.destroyed || (e.candidate && this.trickle ? this.emit("signal", {
      type: "candidate",
      candidate: {
        candidate: e.candidate.candidate,
        sdpMLineIndex: e.candidate.sdpMLineIndex,
        sdpMid: e.candidate.sdpMid
      }
    }) : !e.candidate && !this._iceComplete && (this._iceComplete = !0, this.emit("_iceComplete")), e.candidate && this._startIceCompleteTimeout());
  }
  _onChannelMessage(e) {
    if (this.destroyed) return;
    let n = e.data;
    n instanceof ArrayBuffer ? n = new Uint8Array(n) : this.__objectMode === !1 && (n = Ye(n)), this.push(n);
  }
  _onChannelBufferedAmountLow() {
    if (this.destroyed || !this._cb) return;
    this._debug("ending backpressure: bufferedAmount %d", this._channel.bufferedAmount);
    const e = this._cb;
    this._cb = null, e(null);
  }
  _onChannelOpen() {
    this._connected || this.destroyed || (this._debug("on channel open"), this._channelReady = !0, this._maybeReady());
  }
  _onChannelClose() {
    this.destroyed || (this._debug("on channel close"), this.__destroy());
  }
  _debug() {
    const e = [].slice.call(arguments);
    e[0] = "[" + this._id + "] " + e[0], ui.apply(null, e);
  }
}
z.WEBRTC_SUPPORT = !!He;
z.config = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478"
      ]
    }
  ],
  sdpSemantics: "unified-plan"
};
z.channelConfig = {};
/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var je, vt;
function pi() {
  if (vt) return je;
  vt = 1;
  let a;
  return je = typeof queueMicrotask == "function" ? queueMicrotask.bind(typeof window < "u" ? window : Lt) : (e) => (a || (a = Promise.resolve())).then(e).catch((n) => setTimeout(() => {
    throw n;
  }, 0)), je;
}
var gi = pi();
const Nt = /* @__PURE__ */ Ce(gi), te = {}, mi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: te
}, Symbol.toStringTag, { value: "Module" }));
/*! simple-websocket. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const bi = Te("simple-websocket"), le = typeof te != "function" ? WebSocket : te, It = 64 * 1024;
class qt extends Ut.Duplex {
  constructor(e = {}) {
    if (typeof e == "string" && (e = { url: e }), e = Object.assign({
      allowHalfOpen: !1
    }, e), super(e), this.__objectMode = !!e.objectMode, e.objectMode != null && delete e.objectMode, e.url == null && e.socket == null)
      throw new Error("Missing required `url` or `socket` option");
    if (e.url != null && e.socket != null)
      throw new Error("Must specify either `url` or `socket` option, not both");
    if (this._id = ne(de(4)).slice(0, 7), this._debug("new websocket: %o", e), this.connected = !1, this._chunk = null, this._cb = null, this._interval = null, e.socket)
      this.url = e.socket.url, this._ws = e.socket, this.connected = e.socket.readyState === le.OPEN;
    else {
      this.url = e.url;
      try {
        typeof te == "function" ? this._ws = new le(e.url, {
          ...e,
          encoding: void 0
          // encoding option breaks ws internals
        }) : this._ws = new le(e.url);
      } catch (n) {
        Nt(() => this.destroy(n));
        return;
      }
    }
    this._ws.binaryType = "arraybuffer", e.socket && this.connected ? Nt(() => this._handleOpen()) : this._ws.onopen = () => this._handleOpen(), this._ws.onmessage = (n) => this._handleMessage(n), this._ws.onclose = () => this._handleClose(), this._ws.onerror = (n) => this._handleError(n), this._handleFinishBound = () => this._handleFinish(), this.once("finish", this._handleFinishBound);
  }
  /**
   * Send text/binary data to the WebSocket server.
   * @param {TypedArrayView|ArrayBuffer|Uint8Array|string|Blob|Object} chunk
   */
  send(e) {
    this._ws.send(e);
  }
  _final(e) {
    this._readableState.ended || this.push(null), e(null);
  }
  _destroy(e) {
    if (!this.destroyed) {
      if (this._writableState.ended || this.end(), this.connected = !1, clearInterval(this._interval), this._interval = null, this._chunk = null, this._cb = null, this._handleFinishBound && this.removeListener("finish", this._handleFinishBound), this._handleFinishBound = null, this._ws) {
        const n = this._ws, i = () => {
          n.onclose = null;
        };
        if (n.readyState === le.CLOSED)
          i();
        else
          try {
            n.onclose = i, n.close();
          } catch {
            i();
          }
        n.onopen = null, n.onmessage = null, n.onerror = () => {
        };
      }
      this._ws = null, e();
    }
  }
  _write(e, n) {
    if (this.destroyed) return n(new Error("cannot write after socket is destroyed"));
    if (this.connected) {
      try {
        this.send(e);
      } catch (i) {
        return this.destroy(i);
      }
      typeof te != "function" && this._ws.bufferedAmount > It ? (this._debug("start backpressure: bufferedAmount %d", this._ws.bufferedAmount), this._cb = n) : n(null);
    } else
      this._debug("write before connect"), this._chunk = e, this._cb = n;
  }
  _handleOpen() {
    if (!(this.connected || this.destroyed)) {
      if (this.connected = !0, this._chunk) {
        try {
          this.send(this._chunk);
        } catch (n) {
          return this.destroy(n);
        }
        this._chunk = null, this._debug('sent chunk from "write before connect"');
        const e = this._cb;
        this._cb = null, e(null);
      }
      typeof te != "function" && (this._interval = setInterval(() => this._onInterval(), 150), this._interval.unref && this._interval.unref()), this._debug("connect"), this.emit("connect");
    }
  }
  _handleMessage(e) {
    if (this.destroyed) return;
    let n = e.data;
    n instanceof ArrayBuffer && (n = new Uint8Array(n)), this.__objectMode === !1 && (n = Ye(n)), this.push(n);
  }
  _handleClose() {
    this.destroyed || (this._debug("on close"), this.destroy());
  }
  _handleError(e) {
    this.destroy(new Error(`Error connecting to ${this.url}`));
  }
  // When stream finishes writing, close socket. Half open connections are not
  // supported.
  _handleFinish() {
    if (this.destroyed) return;
    const e = () => {
      setTimeout(() => this.destroy(), 1e3);
    };
    this.connected ? e() : this.once("connect", e);
  }
  _onInterval() {
    if (!this._cb || !this._ws || this._ws.bufferedAmount > It)
      return;
    this._debug("ending backpressure: bufferedAmount %d", this._ws.bufferedAmount);
    const e = this._cb;
    this._cb = null, e(null);
  }
  _debug() {
    const e = [].slice.call(arguments);
    e[0] = "[" + this._id + "] " + e[0], bi.apply(null, e);
  }
}
qt.WEBSOCKET_SUPPORT = !!le;
const yi = {
  ...mi
};
var Si = Pt();
const jt = /* @__PURE__ */ Ce(Si);
class Ei extends jt {
  constructor(e, n) {
    super(), this.client = e, this.announceUrl = n, this.interval = null, this.destroyed = !1;
  }
  setInterval(e) {
    e == null && (e = this.DEFAULT_ANNOUNCE_INTERVAL), clearInterval(this.interval), e && (this.interval = setInterval(() => {
      this.announce(this.client._defaultAnnounceOpts());
    }, e), this.interval.unref && this.interval.unref());
  }
}
const M = Te("bittorrent-tracker:websocket-tracker"), j = {}, wi = 10 * 1e3, Ci = 3600 * 1e3, Ti = 300 * 1e3, Ri = 50 * 1e3;
class we extends Ei {
  constructor(e, n) {
    super(e, n), M("new websocket tracker %s", n), this.peers = {}, this.socket = null, this.reconnecting = !1, this.retries = 0, this.reconnectTimer = null, this.expectingResponse = !1, this._openSocket();
  }
  announce(e) {
    if (this.destroyed || this.reconnecting) return;
    if (!this.socket.connected) {
      this.socket.once("connect", () => {
        this.announce(e);
      });
      return;
    }
    const n = Object.assign({}, e, {
      action: "announce",
      info_hash: this.client._infoHashBinary,
      peer_id: this.client._peerIdBinary
    });
    if (this._trackerId && (n.trackerid = this._trackerId), e.event === "stopped" || e.event === "completed")
      this._send(n);
    else {
      const i = Math.min(e.numwant, 5);
      this._generateOffers(i, (s) => {
        n.numwant = i, n.offers = s, this._send(n);
      });
    }
  }
  scrape(e) {
    if (this.destroyed || this.reconnecting) return;
    if (!this.socket.connected) {
      this.socket.once("connect", () => {
        this.scrape(e);
      });
      return;
    }
    const i = {
      action: "scrape",
      info_hash: Array.isArray(e.infoHash) && e.infoHash.length > 0 ? e.infoHash.map((s) => ue(s)) : e.infoHash && ue(e.infoHash) || this.client._infoHashBinary
    };
    this._send(i);
  }
  destroy(e = Ot) {
    if (this.destroyed) return e(null);
    this.destroyed = !0, clearInterval(this.interval), clearTimeout(this.reconnectTimer);
    for (const l in this.peers) {
      const u = this.peers[l];
      clearTimeout(u.trackerTimeout), u.destroy();
    }
    if (this.peers = null, this.socket && (this.socket.removeListener("connect", this._onSocketConnectBound), this.socket.removeListener("data", this._onSocketDataBound), this.socket.removeListener("close", this._onSocketCloseBound), this.socket.removeListener("error", this._onSocketErrorBound), this.socket = null), this._onSocketConnectBound = null, this._onSocketErrorBound = null, this._onSocketDataBound = null, this._onSocketCloseBound = null, j[this.announceUrl] && (j[this.announceUrl].consumers -= 1), j[this.announceUrl].consumers > 0) return e();
    let n = j[this.announceUrl];
    delete j[this.announceUrl], n.on("error", Ot), n.once("close", e);
    let i;
    if (!this.expectingResponse) return s();
    i = setTimeout(s, yi.DESTROY_TIMEOUT), n.once("data", s);
    function s() {
      i && (clearTimeout(i), i = null), n.removeListener("data", s), n.destroy(), n = null;
    }
  }
  _openSocket() {
    if (this.destroyed = !1, this.peers || (this.peers = {}), this._onSocketConnectBound = () => {
      this._onSocketConnect();
    }, this._onSocketErrorBound = (e) => {
      this._onSocketError(e);
    }, this._onSocketDataBound = (e) => {
      this._onSocketData(e);
    }, this._onSocketCloseBound = () => {
      this._onSocketClose();
    }, this.socket = j[this.announceUrl], this.socket)
      j[this.announceUrl].consumers += 1, this.socket.connected && this._onSocketConnectBound();
    else {
      const e = new URL(this.announceUrl);
      let n;
      this.client._proxyOpts && (n = e.protocol === "wss:" ? this.client._proxyOpts.httpsAgent : this.client._proxyOpts.httpAgent, !n && this.client._proxyOpts.socksProxy && (n = this.client._proxyOpts.socksProxy)), this.socket = j[this.announceUrl] = new qt({ url: this.announceUrl, agent: n }), this.socket.consumers = 1, this.socket.once("connect", this._onSocketConnectBound);
    }
    this.socket.on("data", this._onSocketDataBound), this.socket.once("close", this._onSocketCloseBound), this.socket.once("error", this._onSocketErrorBound);
  }
  _onSocketConnect() {
    this.destroyed || this.reconnecting && (this.reconnecting = !1, this.retries = 0, this.announce(this.client._defaultAnnounceOpts()));
  }
  _onSocketData(e) {
    if (!this.destroyed) {
      this.expectingResponse = !1;
      try {
        e = JSON.parse(Bt(e));
      } catch {
        this.client.emit("warning", new Error("Invalid tracker response"));
        return;
      }
      e.action === "announce" ? this._onAnnounceResponse(e) : e.action === "scrape" ? this._onScrapeResponse(e) : this._onSocketError(new Error(`invalid action in WS response: ${e.action}`));
    }
  }
  _onAnnounceResponse(e) {
    if (e.info_hash !== this.client._infoHashBinary) {
      M(
        "ignoring websocket data from %s for %s (looking for %s: reused socket)",
        this.announceUrl,
        Z(e.info_hash),
        this.client.infoHash
      );
      return;
    }
    if (e.peer_id && e.peer_id === this.client._peerIdBinary)
      return;
    M(
      "received %s from %s for %s",
      JSON.stringify(e),
      this.announceUrl,
      this.client.infoHash
    );
    const n = e["failure reason"];
    if (n) return this.client.emit("warning", new Error(n));
    const i = e["warning message"];
    i && this.client.emit("warning", new Error(i));
    const s = e.interval || e["min interval"];
    s && this.setInterval(s * 1e3);
    const l = e["tracker id"];
    if (l && (this._trackerId = l), e.complete != null) {
      const S = Object.assign({}, e, {
        announce: this.announceUrl,
        infoHash: Z(e.info_hash)
      });
      this.client.emit("update", S);
    }
    let u;
    if (e.offer && e.peer_id && (M("creating peer (from remote offer)"), u = this._createPeer(), u.id = Z(e.peer_id), u.once("signal", (S) => {
      const b = {
        action: "announce",
        info_hash: this.client._infoHashBinary,
        peer_id: this.client._peerIdBinary,
        to_peer_id: e.peer_id,
        answer: S,
        offer_id: e.offer_id
      };
      this._trackerId && (b.trackerid = this._trackerId), this._send(b);
    }), this.client.emit("peer", u), u.signal(e.offer)), e.answer && e.peer_id) {
      const S = Z(e.offer_id);
      u = this.peers[S], u ? (u.id = Z(e.peer_id), this.client.emit("peer", u), u.signal(e.answer), clearTimeout(u.trackerTimeout), u.trackerTimeout = null, delete this.peers[S]) : M(`got unexpected answer: ${JSON.stringify(e.answer)}`);
    }
  }
  _onScrapeResponse(e) {
    e = e.files || {};
    const n = Object.keys(e);
    if (n.length === 0) {
      this.client.emit("warning", new Error("invalid scrape response"));
      return;
    }
    n.forEach((i) => {
      const s = Object.assign(e[i], {
        announce: this.announceUrl,
        infoHash: Z(i)
      });
      this.client.emit("scrape", s);
    });
  }
  _onSocketClose() {
    this.destroyed || (this.destroy(), this._startReconnectTimer());
  }
  _onSocketError(e) {
    this.destroyed || (this.destroy(), this.client.emit("warning", e), this._startReconnectTimer());
  }
  _startReconnectTimer() {
    const e = Math.floor(Math.random() * Ti) + Math.min(Math.pow(2, this.retries) * wi, Ci);
    this.reconnecting = !0, clearTimeout(this.reconnectTimer), this.reconnectTimer = setTimeout(() => {
      this.retries++, this._openSocket();
    }, e), this.reconnectTimer.unref && this.reconnectTimer.unref(), M("reconnecting socket in %s ms", e);
  }
  _send(e) {
    if (this.destroyed) return;
    this.expectingResponse = !0;
    const n = JSON.stringify(e);
    M("send %s", n), this.socket.send(n);
  }
  _generateOffers(e, n) {
    const i = this, s = [];
    M("generating %s offers", e);
    for (let S = 0; S < e; ++S)
      l();
    u();
    function l() {
      const S = ne(de(20));
      M("creating peer (from _generateOffers)");
      const b = i.peers[S] = i._createPeer({ initiator: !0 });
      b.once("signal", (p) => {
        s.push({
          offer: p,
          offer_id: ue(S)
        }), u();
      }), b.trackerTimeout = setTimeout(() => {
        M("tracker timeout: destroying peer"), b.trackerTimeout = null, delete i.peers[S], b.destroy();
      }, Ri), b.trackerTimeout.unref && b.trackerTimeout.unref();
    }
    function u() {
      s.length === e && (M("generated %s offers", e), n(s));
    }
  }
  _createPeer(e) {
    const n = this;
    e = Object.assign({
      trickle: !1,
      config: n.client._rtcConfig,
      wrtc: n.client._wrtc
    }, e);
    const i = new z(e);
    return i.once("error", s), i.once("connect", l), i;
    function s(u) {
      n.client.emit("warning", new Error(`Connection error: ${u.message}`)), i.destroy();
    }
    function l() {
      i.removeListener("error", s), i.removeListener("connect", l);
    }
  }
}
we.prototype.DEFAULT_ANNOUNCE_INTERVAL = 30 * 1e3;
we._socketPool = j;
function Ot() {
}
const he = Te("p2pt"), Dt = "^", Ft = 16e3;
class Ni extends jt {
  /**
   *
   * @param array announceURLs List of announce tracker URLs
   * @param string identifierString Identifier used to discover peers in the network
   */
  constructor(e = [], n = "") {
    super(), this.announceURLs = e, this.trackers = {}, this.peers = {}, this.msgChunks = {}, this.responseWaiting = {}, this._rtcConfig = {
      iceServers: []
    }, n && this.setIdentifier(n), this._peerIdBuffer = de(20), this._peerId = ne(this._peerIdBuffer), this._peerIdBinary = ue(this._peerId), he("my peer id: " + this._peerId);
  }
  /**
   * Set the identifier string used to discover peers in the network
   * @param string identifierString
   */
  async setIdentifier(e) {
    this.identifierString = e, this.infoHash = li(e, "hex"), this._infoHashBuffer = Wt((await this.infoHash).toLowerCase()), this._infoHashBinary = ue((await this.infoHash).toLowerCase());
  }
  /**
   * Connect to network and start discovering peers
   */
  async start() {
    await this.infoHash, this.on("peer", (e) => {
      let n = !1;
      this.peers[e.id] || (n = !0, this.peers[e.id] = {}, this.responseWaiting[e.id] = {}), e.on("connect", () => {
        this.peers[e.id][e.channelName] = e, n && this.emit("peerconnect", e);
      }), e.on("data", (i) => {
        if (this.emit("data", e, i), ArrayBuffer.isView(i) && (i = Bt(i)), he("got a message from " + e.id), i[0] === Dt)
          try {
            i = JSON.parse(i.slice(1)), e.respond = this._peerRespond(e, i.id);
            let s = this._chunkHandler(i);
            s !== !1 && (i.o && (s = JSON.parse(s)), this.responseWaiting[e.id][i.id] ? (this.responseWaiting[e.id][i.id]([e, s]), delete this.responseWaiting[e.id][i.id]) : this.emit("msg", e, s), this._destroyChunks(i.id));
          } catch (s) {
            console.log(s);
          }
      }), e.on("error", (i) => {
        this._removePeer(e), he("Error in connection : " + i);
      }), e.on("close", () => {
        this._removePeer(e), he("Connection closed with " + e.id);
      });
    }), this.on("update", (e) => {
      const n = this.trackers[this.announceURLs.indexOf(e.announce)];
      this.emit(
        "trackerconnect",
        n,
        this.getTrackerStats()
      );
    }), this.on("warning", (e) => {
      this.emit(
        "trackerwarning",
        e,
        this.getTrackerStats()
      );
    }), this._fetchPeers();
  }
  /**
   * Add a tracker
   * @param string announceURL Tracker Announce URL
   */
  addTracker(e) {
    if (this.announceURLs.indexOf(e) !== -1)
      throw new Error("Tracker already added");
    const n = this.announceURLs.push(e);
    this.trackers[n] = new we(this, e), this.trackers[n].announce(this._defaultAnnounceOpts());
  }
  /**
   * Remove a tracker without destroying peers
   */
  removeTracker(e) {
    const n = this.announceURLs.indexOf(e);
    if (n === -1)
      throw new Error("Tracker does not exist");
    this.trackers[n].peers = [], this.trackers[n].destroy(), delete this.trackers[n], delete this.announceURLs[n];
  }
  /**
   * Remove a peer from the list if all channels are closed
   * @param integer id Peer ID
   */
  _removePeer(e) {
    if (!this.peers[e.id])
      return !1;
    delete this.peers[e.id][e.channelName], Object.keys(this.peers[e.id]).length === 0 && (this.emit("peerclose", e), delete this.responseWaiting[e.id], delete this.peers[e.id]);
  }
  /**
   * Send a msg and get response for it
   * @param Peer peer simple-peer object to send msg to
   * @param string msg Message to send
   * @param integer msgID ID of message if it's a response to a previous message
   */
  send(e, n, i = "") {
    return new Promise((s, l) => {
      const u = {
        id: i !== "" ? i : Math.floor(Math.random() * 1e5 + 1e5),
        msg: n
      };
      typeof n == "object" && (u.msg = JSON.stringify(n), u.o = 1);
      try {
        if (!e.connected) {
          for (const p in this.peers[e.id])
            if (e = this.peers[e.id][p], e.connected) break;
        }
        this.responseWaiting[e.id] || (this.responseWaiting[e.id] = {}), this.responseWaiting[e.id][u.id] = s;
      } catch (p) {
        return l(Error("Connection to peer closed" + p));
      }
      let S = 0, b = "";
      for (; u.msg.length > 0; )
        u.c = S, b = u.msg.slice(Ft), u.msg = u.msg.slice(0, Ft), b || (u.last = !0), e.send(Dt + JSON.stringify(u)), u.msg = b, S++;
      he("sent a message to " + e.id);
    });
  }
  /**
   * Request more peers
   */
  requestMorePeers() {
    return new Promise((e) => {
      for (const n in this.trackers)
        this.trackers[n].announce(this._defaultAnnounceOpts());
      e(this.peers);
    });
  }
  /**
   * Get basic stats about tracker connections
   */
  getTrackerStats() {
    let e = 0;
    for (const n in this.trackers)
      this.trackers[n].socket && this.trackers[n].socket.connected && e++;
    return {
      connected: e,
      total: this.announceURLs.length
    };
  }
  /**
   * Destroy object
   */
  destroy() {
    let e;
    for (e in this.peers)
      for (const n in this.peers[e])
        this.peers[e][n].destroy();
    for (e in this.trackers)
      this.trackers[e].destroy();
  }
  /**
   * A custom function binded on Peer object to easily respond back to message
   * @param Peer peer Peer to send msg to
   * @param integer msgID Message ID
   */
  _peerRespond(e, n) {
    return (i) => this.send(e, i, n);
  }
  /**
   * Handle msg chunks. Returns false until the last chunk is received. Finally returns the entire msg
   * @param object data
   */
  _chunkHandler(e) {
    return this.msgChunks[e.id] || (this.msgChunks[e.id] = []), this.msgChunks[e.id][e.c] = e.msg, e.last ? this.msgChunks[e.id].join("") : !1;
  }
  /**
   * Remove all stored chunks of a particular message
   * @param integer msgID Message ID
   */
  _destroyChunks(e) {
    delete this.msgChunks[e];
  }
  /**
   * Default announce options
   * @param object opts Options
   */
  _defaultAnnounceOpts(e = {}) {
    return e.numwant == null && (e.numwant = 50), e.uploaded == null && (e.uploaded = 0), e.downloaded == null && (e.downloaded = 0), e;
  }
  /**
   * Initialize trackers and fetch peers
   */
  _fetchPeers() {
    for (const e in this.announceURLs)
      this.trackers[e] = new we(this, this.announceURLs[e]), this.trackers[e].announce(this._defaultAnnounceOpts());
  }
}
export {
  Ni as default
};
