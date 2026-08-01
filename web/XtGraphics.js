import { idiv, i32, trunc, fr, intArray, floatArray, random, RGBtoHSB, HSBtoRGB } from './java.js';

export class XtGraphics {
  constructor(m = null, cd = null, rd = null, app = null) {
    this.rd = rd;
    this.m = m;
    this.cd = cd;
    this.ftm = null;
    this.ob = null;
    this.app = app;
    this.fase = 111;
    this.oldfase = 0;
    this.starcnt = 0;
    this.mtop = false;
    this.opselect = 0;
    this.dropf = 0;
    this.cfase = 0;
    this.firstime = true;
    this.shaded = false;
    this.flipo = 0;
    this.nextc = 0;
    this.multion = 0;
    this.gmode = 0;
    this.unlocked = Int32Array.from([1, 1]);
    this.scm = Int32Array.from([0, 0]);
    this.looped = 1;
    this.warning = 0;
    this.newparts = false;
    this.logged = false;
    this.gotlog = false;
    this.autolog = false;
    this.nofull = false;
    this.nfreeplays = 0;
    this.ndisco = 0;
    this.hours = 8;
    this.onviewpro = false;
    this.playingame = -1;
    this.onjoin = -1;
    this.ontyp = 0;
    this.lan = false;
    this.arnp = Float32Array.from([0.5, 0.0, 0.0, 1.0, 0.5, 0.0]);
    this.nickname = "";
    this.clan = "";
    this.nickey = "";
    this.clankey = "";
    this.backlog = "";
    this.server = "multiplayer.needformadness.com";
    this.localserver = "";
    this.servername = "Madness";
    this.servport = 7071;
    this.gameport = 7001;
    this.acexp = 0;
    this.discon = 0;
    this.cntptrys = 5;
    this.delays = Int32Array.from([600, 600, 600]);
    this.nplayers = 7;
    this.im = 0;
    this.plnames = new Array(8).fill("");
    this.osc = 10;
    this.minsl = 0;
    this.maxsl = 15;
    this.sc = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
    this.xstart = Int32Array.from([0, -350, 350, 0, -350, 350, 0, 0]);
    this.zstart = Int32Array.from([-760, -380, -380, 0, 380, 380, 760, 0]);
    this.allrnp = Array.from({ length: 8 }, () => floatArray(6));
    this.isbot = new Array(8).fill(false);
    this.clangame = 0;
    this.clanchat = false;
    this.pclan = new Array(8).fill("");
    this.gaclan = "";
    this.lcarx = 0;
    this.lcary = 0;
    this.lcarz = 0;
    this.dcrashes = intArray(8);
    this.beststunt = 0;
    this.laptime = 0;
    this.fastestlap = 0;
    this.sendstat = 0;
    this.testdrive = 0;
    this.holdit = false;
    this.holdcnt = 0;
    this.winner = true;
    this.flexpix = null;
    this.smokey = intArray(94132);
    this.flatrstart = 0;
    this.runner = null;
    this.runtyp = 0;
    this.forstart = 0;
    this.exitm = 0;
    this.odmg = null;
    this.opwr = null;
    this.opos = null;
    this.osped = null;
    this.owas = null;
    this.olap = null;
    this.oyourwasted = null;
    this.odisco = null;
    this.ogamefinished = null;
    this.oyoulost = null;
    this.oyouwon = null;
    this.oyouwastedem = null;
    this.ogameh = null;
    this.owgame = null;
    this.oloadingmusic = null;
    this.oflaot = null;
    this.oexitgame = null;
    this.mload = null;
    this.dmg = null;
    this.pwr = null;
    this.pos = null;
    this.sped = null;
    this.was = null;
    this.lap = null;
    this.br = null;
    this.select = null;
    this.loadingmusic = null;
    this.yourwasted = null;
    this.disco = null;
    this.gamefinished = null;
    this.youlost = null;
    this.youwon = null;
    this.youwastedem = null;
    this.gameh = null;
    this.wgame = null;
    this.congrd = null;
    this.gameov = null;
    this.carsbg = null;
    this.carsbgc = null;
    this.selectcar = null;
    this.statb = null;
    this.statbo = null;
    this.mdness = null;
    this.paused = null;
    this.radicalplay = null;
    this.logocars = null;
    this.logomadnes = null;
    this.logomadbg = null;
    this.byrd = null;
    this.bggo = null;
    this.opback = null;
    this.nfmcoms = null;
    this.opti = null;
    this.opti2 = null;
    this.bgmain = null;
    this.rpro = null;
    this.nfmcom = null;
    this.flaot = null;
    this.brt = null;
    this.arn = null;
    this.exitgame = null;
    this.pgate = null;
    this.fixhoop = null;
    this.sarrow = null;
    this.stunts = null;
    this.racing = null;
    this.wasting = null;
    this.plus = null;
    this.space = null;
    this.arrows = null;
    this.chil = null;
    this.ory = null;
    this.kz = null;
    this.kx = null;
    this.kv = null;
    this.km = null;
    this.kn = null;
    this.ks = null;
    this.kenter = null;
    this.nfm = null;
    this.login = null;
    this.register = null;
    this.play = null;
    this.sdets = null;
    this.cancel = null;
    this.bob = null;
    this.bot = null;
    this.bol = null;
    this.bolp = null;
    this.bor = null;
    this.borp = null;
    this.logout = null;
    this.change = null;
    this.pln = null;
    this.pon = null;
    this.dome = null;
    this.upgrade = null;
    this.bols = null;
    this.bolps = null;
    this.bors = null;
    this.borps = null;
    this.games = null;
    this.exit = null;
    this.chat = null;
    this.players = null;
    this.cgame = null;
    this.ccar = null;
    this.lanm = null;
    this.asu = null;
    this.asd = null;
    this.pls = null;
    this.sts = null;
    this.gmc = null;
    this.stg = null;
    this.crd = null;
    this.roomp = null;
    this.myfr = null;
    this.mycl = null;
    this.cnmc = null;
    this.redy = null;
    this.ntrg = null;
    this.bcl = new Array(2).fill(null);
    this.bcr = new Array(2).fill(null);
    this.bc = new Array(2).fill(null);
    this.cmc = null;
    this.myc = null;
    this.gac = null;
    this.yac = null;
    this.ycmc = null;
    this.top20s = null;
    this.trackbg = new Array(2).fill(null);
    this.dude = new Array(3).fill(null);
    this.duds = 0;
    this.dudo = 0;
    this.next = new Array(2).fill(null);
    this.back = new Array(2).fill(null);
    this.contin = new Array(2).fill(null);
    this.ostar = new Array(2).fill(null);
    this.star = new Array(3).fill(null);
    this.pcontin = 0;
    this.pnext = 0;
    this.pback = 0;
    this.pstar = 0;
    this.orank = new Array(8).fill(null);
    this.rank = new Array(8).fill(null);
    this.ocntdn = new Array(4).fill(null);
    this.cntdn = new Array(4).fill(null);
    this.gocnt = 0;
    this.engs = Array.from({ length: 5 }, () => new Array(5).fill(null));
    this.pengs = new Array(5).fill(false);
    this.air = new Array(6).fill(null);
    this.aird = false;
    this.grrd = false;
    this.crashClips = new Array(3).fill(null);
    this.lowcrash = new Array(3).fill(null);
    this.tires = null;
    this.checkpoint = { play() {} };
    this.carfixed = { play() {} };
    this.powerup = { play() {} };
    this.three = { play() {} };
    this.two = { play() {} };
    this.one = { play() {} };
    this.go = { play() {} };
    this.wastd = { play() {} };
    this.firewasted = { play() {} };
    this.pwastd = false;
    this.skidClips = new Array(3).fill(null);
    this.dustskid = new Array(3).fill(null);
    this.scrapeClips = new Array(4).fill(null);
    this.mutes = false;
    this.snd = null;      // web/audio.js, attached by main.js
    this.intertrack = null;
    this.strack = null;
    this.loadedt = false;
    this.mutem = false;
    this.badmac = false;
    this.arrace = false;
    this.alocked = -1;
    this.lalocked = -1;
    this.cntflock = 0;
    this.onlock = false;
    this.ana = 0;
    this.cntan = 0;
    this.cntovn = 0;
    this.flk = false;
    this.tcnt = 30;
    this.tflk = false;
    this.say = "";
    this.wasay = false;
    this.clear = 0;
    this.posit = 0;
    this.wasted = 0;
    this.laps = 0;
    this.dested = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
    this.dmcnt = 0;
    this.dmflk = false;
    this.pwcnt = 0;
    this.pwflk = false;
    this.adj = [
      ["Cool", "Alright", "Nice"],
      ["Wicked", "Amazing", "Super"],
      ["Awesome", "Ripping", "Radical"],
      ["What the...?", "You're a super star!!!!", "Who are you again...?"],
      ["surf style", "off the lip", "bounce back"]
    ];
    this.exlm = ["!", "!!", "!!!"];
    this.loop = "";
    this.spin = "";
    this.asay = "";
    this.auscnt = 45;
    this.aflk = false;
    this.sndsize = Int32Array.from([39, 128, 23, 58, 106, 140, 81, 135, 38, 141, 106, 76, 56, 116, 92, 208, 70, 80, 152, 102, 27, 65, 52, 30, 151, 129, 80, 44, 57, 123, 202, 210, 111]);
    this.hello = null;
    this.sign = null;
    this.loadbar = null;
    this.kbload = 0;
    this.dnload = 0;
    this.shload = 0.0;
    this.socket = null;
    this.din = null;
    this.dout = null;
    this.radpx = 212;
    this.pin = 60;
    this.trkx = Int32Array.from([65, 735]);
    this.trkl = 0;
    this.trklim = 0;
    this.lmode = 0;
    this.bgmy = Int32Array.from([0, -400]);
    this.bgf = 0.0;
    this.bgup = false;
    this.ovx = intArray(4);
    this.ovy = intArray(4);
    this.ovw = intArray(4);
    this.ovh = intArray(4);
    this.ovsx = intArray(4);
    this.removeds = 0;
    this.nfmtab = 0;
    this.justwon1 = false;
    this.justwon2 = false;
    this.lfrom = 0;
    this.lockcnt = 0;
    this.showtf = false;
    this.ransay = 0;
    this.cnames = [
      ["", "", "", "", "", "", "Game Chat  "],
      ["", "", "", "", "", "", "Your Clan's Chat  "]
    ];
    this.sentn = [
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""]
    ];
    this.updatec = Int32Array.from([-1, -1]);
    this.movepos = Int32Array.from([0, 0]);
    this.pointc = Int32Array.from([6, 6]);
    this.floater = Int32Array.from([0, 0]);
    this.cntchatp = Int32Array.from([0, 0]);
    this.msgflk = Int32Array.from([0, 0]);
    this.lcmsg = ["", ""];
    this.flkat = 0;
    this.movly = 0;
    this.gxdu = 0;
    this.gydu = 0;
    this.muhi = 0;
    this.lsc = -1;
    this.mouson = -1;
    this.onmsc = -1;
    this.remi = false;
    this.basefase = 0;
    this.noclass = false;
    this.gatey = 300;
    this.pgatx = Int32Array.from([211, 240, 280, 332, 399, 466, 517, 558, 586]);
    this.pgaty = Int32Array.from([193, 213, 226, 237, 244, 239, 228, 214, 196]);
    this.pgady = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.pgas = new Array(9).fill(false);
    this.waitlink = 0;
    this.lxm = -10;
    this.lym = -10;
    this.pwait = 7;
    this.stopcnt = 0;
    this.cntwis = 0;
    this.lcn = 0;
    this.crshturn = 0;
    this.bfcrash = 0;
    this.bfskid = 0;
    this.crashup = false;
    this.skidup = false;
    this.skflg = 0;
    this.dskflg = 0;
    this.bfscrape = 0;
    this.sturn0 = 0;
    this.sturn1 = 0;
    this.bfsc1 = 0;
    this.bfsc2 = 0;
    this.flatr = 0;
    this.flyr = 0;
    this.flyrdest = 0;
    this.flang = 0;
  }

  // --- sound hooks ---
  // --- sound -----------------------------------------------------------
  //
  // Ported from xtGraphics.java:9289-9430. java.applet.AudioClip's contract is
  // "play() fires a one-shot, stop() cuts it", which web/audio.js reproduces,
  // so these bodies are the Java's unchanged -- including the rotation
  // counters that stop the same sample repeating back to back, and the bfXXX
  // debounce counters the tick decrements.
  //
  // `snd` is null until main.js attaches it; every call site tolerates that,
  // so a missing or undecodable sounds.zip costs sound and nothing else.

  /** One-shot by name; silent if audio is unavailable. */
  _snd(name) {
    if (this.snd && !this.mutes) this.snd.play(name);
  }

  crash(a, n) {
    if (this.bfcrash !== 0) return;
    if (n === 0) {
      if (Math.abs(a) > 25.0 && Math.abs(a) < 170.0) {
        this._snd(`lowcrash${this.crshturn + 1}`);
        this.bfcrash = 2;
      }
      if (Math.abs(a) >= 170.0) {
        this._snd(`crash${this.crshturn + 1}`);
        this.bfcrash = 2;
      }
      if (Math.abs(a) > 25.0) {
        if (this.crashup) --this.crshturn;
        else ++this.crshturn;
        if (this.crshturn === -1) this.crshturn = 2;
        if (this.crshturn === 3) this.crshturn = 0;
      }
    }
    if (n === -1) {
      if (Math.abs(a) > 25.0 && Math.abs(a) < 170.0) {
        this._snd('lowcrash3');
        this.bfcrash = 2;
      }
      if (Math.abs(a) > 170.0) {
        this._snd('crash3');
        this.bfcrash = 2;
      }
    }
    if (n === 1) {
      this._snd('tires');
      this.bfcrash = 3;
    }
  }

  skid(n, n2) {
    if (this.bfcrash === 0 && this.bfskid === 0 && n2 > 150.0) {
      if (n === 0) {
        this._snd(`skid${this.skflg + 1}`);
        if (this.skidup) --this.skflg;
        else ++this.skflg;
        if (this.skflg === 3) this.skflg = 0;
        if (this.skflg === -1) this.skflg = 2;
      } else {
        this._snd(`dustskid${this.dskflg + 1}`);
        if (this.skidup) --this.dskflg;
        else ++this.dskflg;
        if (this.dskflg === 3) this.dskflg = 0;
        if (this.dskflg === -1) this.dskflg = 2;
      }
      this.bfskid = 5;
    }
  }

  scrape(n, n2, n3) {
    if (this.bfscrape === 0 && Math.sqrt(n * n + n2 * n2 + n3 * n3) / 10.0 > 10.0) {
      let n4 = 0;
      if (this.m.random() > this.m.random()) n4 = 1;
      if (n4 === 0) {
        this.sturn1 = 0;
        ++this.sturn0;
        if (this.sturn0 === 3) { n4 = 1; this.sturn1 = 1; this.sturn0 = 0; }
      } else {
        this.sturn0 = 0;
        ++this.sturn1;
        if (this.sturn1 === 3) { n4 = 0; this.sturn0 = 1; this.sturn1 = 0; }
      }
      this._snd(`scrape${n4 + 1}`);
      this.bfscrape = 5;
    }
  }

  gscrape(n, n2, n3) {
    if ((this.bfsc1 === 0 || this.bfsc2 === 0)
        && Math.sqrt(n * n + n2 * n2 + n3 * n3) / 10.0 > 15.0) {
      // scrape[2] and scrape[3] are two separate clips of scrape3.wav in the
      // Java, so a fresh scrape can cut the previous one while the other keeps
      // playing. Two distinct keys over the same buffer preserve that.
      if (this.bfsc1 === 0) {
        if (this.snd && !this.mutes) { this.snd.stop('scrape3'); this.snd.play('scrape3'); }
        this.bfsc1 = 12;
        this.bfsc2 = 6;
      } else {
        if (this.snd && !this.mutes) { this.snd.stop('scrape3b'); this.snd.play('scrape3b'); }
        this.bfsc2 = 12;
        this.bfsc1 = 6;
      }
    }
  }

  // --- stubs ---
  snap(_stage) {}
  resetstat(_stage) {}
  colorCar(_contO, _n) {}
  loadingstage(_stage, _b) {}
  trackbg(_b) {}
  stoploading() {}
  playsounds() {}

  stopchat() {
    // TODO not ported: chat network socket shutdown
  }

  stat(mad, contO, checkPoints, control, b) {
    if (this.holdit) {
      let n = 250;
      if (this.fase === 7001) {
        if (this.exitm !== 4) {
          this.exitm = 0;
          n = 600;
        } else {
          n = 1200;
        }
      }
      if (this.exitm !== 4 || !this.lan || this.im !== 0) {
        ++this.holdcnt;
        if ((control.enter || this.holdcnt > n) && (control.chatup === 0 || this.fase !== 7001)) {
          this.fase = -2;
          control.enter = false;
        }
      } else if (control.enter) {
        control.enter = false;
      }
    } else {
      if (this.holdcnt !== 0) {
        this.holdcnt = 0;
      }
      if (control.enter || control.exit) {
        if (this.fase === 0) {
          if (this.loadedt && this.strack && this.strack.stop) {
            this.strack.stop();
          }
          this.fase = -6;
        } else if (this.starcnt === 0 && control.chatup === 0 && (this.multion < 2 || !this.lan)) {
          if (this.exitm === 0) {
            this.exitm = 1;
          } else {
            this.exitm = 0;
          }
        }
        if (control.chatup === 0 || this.fase !== 7001) {
          control.enter = false;
        }
        control.exit = false;
      }
    }
    if (this.exitm === 2) {
      this.fase = -2;
      this.winner = false;
    }
    if (this.fase !== -2) {
      this.holdit = false;
      if (checkPoints.haltall) {
        checkPoints.haltall = false;
      }
      let b2 = false;
      let str = "";
      let str2 = "";
      if (this.clangame !== 0 && (!mad.dest || this.multion >= 2)) {
        // TODO not ported: clan game player checking
        b2 = true;
        for (let i = 0; i < this.nplayers; ++i) {
          if (checkPoints.dested[i] === 0) {
            if (str === "") {
              str = this.pclan[i];
            } else if (str.toLowerCase() !== this.pclan[i].toLowerCase()) {
              b2 = false;
              break;
            }
          }
        }
      }
      if (this.clangame > 1) {
        // TODO not ported: clan game win/lose condition text and overlay
        let b3 = false;
        let s = "";
        if (b2) {
          for (let j = 0; j < this.nplayers; ++j) {
            if (str.toLowerCase() !== this.pclan[j].toLowerCase()) {
              str2 = this.pclan[j];
              break;
            }
          }
          if (this.clangame === 2) {
            b3 = true;
            s = "Clan " + str2 + " wasted, nobody won becuase this is a racing only game!";
          }
          if (this.clangame === 4 && str.toLowerCase() !== this.gaclan.toLowerCase()) {
            b3 = true;
            s = "Clan " + str2 + " wasted, nobody won becuase " + str + " should have raced in this racing vs wasting game!";
          }
          if (this.clangame === 5 && str.toLowerCase() === this.gaclan.toLowerCase()) {
            b3 = true;
            s = "Clan " + str2 + " wasted, nobody won becuase " + str + " should have raced in this racing vs wasting game!";
          }
        }
        for (let k = 0; k < this.nplayers; ++k) {
          if (checkPoints.clear[k] === checkPoints.nlaps * checkPoints.nsp && checkPoints.pos[k] === 0) {
            if (this.clangame === 3) {
              b3 = true;
              s = "" + this.plnames[k] + " of clan " + this.pclan[k] + " finished first, nobody won becuase this is a wasting only game!";
            }
            if (this.clangame === 4 && this.pclan[k].toLowerCase() === this.gaclan.toLowerCase()) {
              b3 = true;
              s = "" + this.plnames[k] + " of clan " + this.pclan[k] + " finished first, nobody won becuase " + this.pclan[k] + " should have wasted in this racing vs wasting game!";
            }
            if (this.clangame === 5 && this.pclan[k].toLowerCase() !== this.gaclan.toLowerCase()) {
              b3 = true;
              s = "" + this.plnames[k] + " of clan " + this.pclan[k] + " finished first, nobody won becuase " + this.pclan[k] + " should have wasted in this racing vs wasting game!";
            }
          }
        }
        if (b3) {
          if (this.gamefinished) {
            this.drawhi(this.gamefinished, 70);
          } else {
            // TODO not ported: gamefinished image asset not loaded
          }
          if (this.aflk) {
            this.drawcs(120, s, 0, 0, 0, 0);
            this.aflk = false;
          } else {
            this.drawcs(120, s, 0, 128, 255, 0);
            this.aflk = true;
          }
          this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
          checkPoints.haltall = true;
          this.holdit = true;
          this.winner = false;
        }
      }
      if (this.multion < 2) {
        if (!this.holdit && ((checkPoints.wasted === this.nplayers - 1 && this.nplayers !== 1) || b2)) {
          if (this.youwastedem) {
            this.drawhi(this.youwastedem, 70);
          } else {
            // TODO not ported: youwastedem image asset not loaded
          }
          if (!b2) {
            if (this.aflk) {
              this.drawcs(120, "You Won, all cars have been wasted!", 0, 0, 0, 0);
              this.aflk = false;
            } else {
              this.drawcs(120, "You Won, all cars have been wasted!", 0, 128, 255, 0);
              this.aflk = true;
            }
          } else if (this.aflk) {
            this.drawcs(120, "Your clan " + str + " has wasted all the cars!", 0, 0, 0, 0);
            this.aflk = false;
          } else {
            this.drawcs(120, "Your clan " + str + " has wasted all the cars!", 0, 128, 255, 0);
            this.aflk = true;
          }
          this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
          checkPoints.haltall = true;
          this.holdit = true;
          this.winner = true;
        }
        if (!this.holdit && mad.dest && this.cntwis === 8) {
          if (this.discon !== 240) {
            if (this.yourwasted) {
              this.drawhi(this.yourwasted, 70);
            } else {
              // TODO not ported: yourwasted image asset not loaded
            }
          } else {
            if (this.disco) {
              this.drawhi(this.disco, 70);
            } else {
              // TODO not ported: disco image asset not loaded
            }
            this.stopchat();
          }
          let b4 = false;
          if (this.lan) {
            // TODO not ported: LAN multiplayer bot checking
            b4 = true;
            for (let l = 0; l < this.nplayers; ++l) {
              if (l !== this.im && this.dested[l] === 0 && this.plnames[l].indexOf("MadBot") === -1) {
                b4 = false;
              }
            }
          }
          if (this.fase === 7001 && this.nplayers - (checkPoints.wasted + 1) >= 2 && this.discon !== 240 && !b4) {
            // TODO not ported: multiplayer server exit state 4
            this.exitm = 4;
          } else {
            if (this.exitm === 4) {
              this.exitm = 0;
            }
            this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
          }
          this.holdit = true;
          this.winner = false;
        }
        if (!this.holdit) {
          for (let n2 = 0; n2 < this.nplayers; ++n2) {
            if (checkPoints.clear[n2] === checkPoints.nlaps * checkPoints.nsp && checkPoints.pos[n2] === 0) {
              if (this.clangame === 0) {
                if (n2 === this.im) {
                  if (this.youwon) {
                    this.drawhi(this.youwon, 70);
                  } else {
                    // TODO not ported: youwon image asset not loaded
                  }
                  if (this.aflk) {
                    this.drawcs(120, "You finished first, nice job!", 0, 0, 0, 0);
                    this.aflk = false;
                  } else {
                    this.drawcs(120, "You finished first, nice job!", 0, 128, 255, 0);
                    this.aflk = true;
                  }
                  this.winner = true;
                } else {
                  if (this.youlost) {
                    this.drawhi(this.youlost, 70);
                  } else {
                    // TODO not ported: youlost image asset not loaded
                  }
                  if (this.fase !== 7001) {
                    if (this.aflk) {
                      this.drawcs(120, "" + (this.cd && this.cd.names ? this.cd.names[this.sc[n2]] : "") + " finished first, race over!", 0, 0, 0, 0);
                      this.aflk = false;
                    } else {
                      this.drawcs(120, "" + (this.cd && this.cd.names ? this.cd.names[this.sc[n2]] : "") + " finished first, race over!", 0, 128, 255, 0);
                      this.aflk = true;
                    }
                  } else if (this.aflk) {
                    this.drawcs(120, "" + this.plnames[n2] + " finished first, race over!", 0, 0, 0, 0);
                    this.aflk = false;
                  } else {
                    this.drawcs(120, "" + this.plnames[n2] + " finished first, race over!", 0, 128, 255, 0);
                    this.aflk = true;
                  }
                  this.winner = false;
                }
              } else if (this.pclan[n2].toLowerCase() === this.pclan[this.im].toLowerCase()) {
                if (this.youwon) {
                  this.drawhi(this.youwon, 70);
                } else {
                  // TODO not ported: youwon image asset not loaded
                }
                if (this.aflk) {
                  this.drawcs(120, "Your clan " + this.pclan[this.im] + " finished first, nice job!", 0, 0, 0, 0);
                  this.aflk = false;
                } else {
                  this.drawcs(120, "Your clan " + this.pclan[this.im] + " finished first, nice job!", 0, 128, 255, 0);
                  this.aflk = true;
                }
                this.winner = true;
              } else {
                if (this.youlost) {
                  this.drawhi(this.youlost, 70);
                } else {
                  // TODO not ported: youlost image asset not loaded
                }
                if (this.aflk) {
                  this.drawcs(120, "" + this.plnames[n2] + " of clan " + this.pclan[n2] + " finished first, race over!", 0, 0, 0, 0);
                  this.aflk = false;
                } else {
                  this.drawcs(120, "" + this.plnames[n2] + " of clan " + this.pclan[n2] + " finished first, race over!", 0, 128, 255, 0);
                  this.aflk = true;
                }
                this.winner = false;
              }
              this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
              checkPoints.haltall = true;
              this.holdit = true;
            }
          }
        }
      } else {
        // TODO not ported: multiplayer / spectator mode overlay
        if (!this.holdit && (checkPoints.wasted >= this.nplayers - 1 || b2)) {
          let string = "Someone";
          if (!b2) {
            for (let n3 = 0; n3 < this.nplayers; ++n3) {
              if (checkPoints.dested[n3] === 0) {
                string = this.plnames[n3];
              }
            }
          } else {
            string = "Clan " + str + "";
          }
          if (this.gamefinished) {
            this.drawhi(this.gamefinished, 70);
          } else {
            // TODO not ported: gamefinished image asset not loaded
          }
          if (this.aflk) {
            this.drawcs(120, "" + string + " has wasted all the cars!", 0, 0, 0, 0);
            this.aflk = false;
          } else {
            this.drawcs(120, "" + string + " has wasted all the cars!", 0, 128, 255, 0);
            this.aflk = true;
          }
          this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
          checkPoints.haltall = true;
          this.holdit = true;
          this.winner = false;
        }
        if (!this.holdit) {
          for (let n4 = 0; n4 < this.nplayers; ++n4) {
            if (checkPoints.clear[n4] === checkPoints.nlaps * checkPoints.nsp && checkPoints.pos[n4] === 0) {
              if (this.gamefinished) {
                this.drawhi(this.gamefinished, 70);
              } else {
                // TODO not ported: gamefinished image asset not loaded
              }
              if (this.clangame === 0) {
                if (this.aflk) {
                  this.drawcs(120, "" + this.plnames[n4] + " finished first, race over!", 0, 0, 0, 0);
                  this.aflk = false;
                } else {
                  this.drawcs(120, "" + this.plnames[n4] + " finished first, race over!", 0, 128, 255, 0);
                  this.aflk = true;
                }
              } else if (this.aflk) {
                this.drawcs(120, "Clan " + this.pclan[n4] + " finished first, race over!", 0, 0, 0, 0);
                this.aflk = false;
              } else {
                this.drawcs(120, "Clan " + this.pclan[n4] + " finished first, race over!", 0, 128, 255, 0);
                this.aflk = true;
              }
              this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
              checkPoints.haltall = true;
              this.holdit = true;
              this.winner = false;
            }
          }
        }
        if (!this.holdit && this.discon === 240) {
          if (this.gamefinished) {
            this.drawhi(this.gamefinished, 70);
          } else {
            // TODO not ported: gamefinished image asset not loaded
          }
          if (this.aflk) {
            this.drawcs(120, "Game got disconnected!", 0, 0, 0, 0);
            this.aflk = false;
          } else {
            this.drawcs(120, "Game got disconnected!", 0, 128, 255, 0);
            this.aflk = true;
          }
          this.drawcs(350, "Press  [ Enter ]  to continue", 0, 0, 0, 0);
          checkPoints.haltall = true;
          this.holdit = true;
          this.winner = false;
        }
        if (!this.holdit) {
          if (this.rd && this.wgame) {
            this.rd.drawImage(this.wgame, 311, 20);
          } else {
            // TODO not ported: wgame image asset not loaded
          }
          if (!this.clanchat) {
            this.drawcs(397, "Click any player on the right to follow!", 0, 0, 0, 0);
            if (!this.lan) {
              this.drawcs(412, "Press [V] to change view.  Press [Enter] to exit.", 0, 0, 0, 0);
            } else {
              this.drawcs(412, "Press [V] to change view.", 0, 0, 0, 0);
            }
          }
        }
      }
      if (b) {
        if (checkPoints.stage !== 10 && this.multion < 2 && this.nplayers !== 1 && this.arrace !== control.arrace) {
          this.arrace = control.arrace;
          if (this.multion === 1 && this.arrace) {
            control.radar = true;
          }
          if (this.arrace) {
            this.wasay = true;
            this.say = " Arrow now pointing at >  CARS";
            if (this.multion === 1) {
              this.say += "    Press [S] to toggle Radar!";
            }
            this.tcnt = -5;
          }
          if (!this.arrace) {
            this.wasay = false;
            this.say = " Arrow now pointing at >  TRACK";
            if (this.multion === 1) {
              this.say += "    Press [S] to toggle Radar!";
            }
            this.tcnt = -5;
            this.cntan = 20;
            this.alocked = -1;
            this.alocked = -1;
          }
        }
        if (!this.holdit && this.fase !== -6 && this.starcnt === 0 && this.multion < 2 && checkPoints.stage !== 10) {
          this.arrow(mad.point, mad.missedcp, checkPoints, this.arrace);
          if (!this.arrace) {
            if (this.auscnt === 45 && mad.capcnt === 0 && this.exitm === 0) {
              if (mad.missedcp > 0) {
                if (mad.missedcp > 15 && mad.missedcp < 50) {
                  if (this.flk) {
                    this.drawcs(70, "Checkpoint Missed!", 255, 0, 0, 0);
                  } else {
                    this.drawcs(70, "Checkpoint Missed!", 255, 150, 0, 2);
                  }
                }
                ++mad.missedcp;
                if (mad.missedcp === 70) {
                  mad.missedcp = -2;
                }
              } else if (mad.mtouch && this.cntovn < 70) {
                if (Math.abs(this.ana) > 100) {
                  ++this.cntan;
                } else if (this.cntan !== 0) {
                  --this.cntan;
                }
                if (this.cntan > 40) {
                  ++this.cntovn;
                  this.cntan = 40;
                  if (this.flk) {
                    this.drawcs(70, "Wrong Way!", 255, 150, 0, 0);
                    this.flk = false;
                  } else {
                    this.drawcs(70, "Wrong Way!", 255, 0, 0, 2);
                    this.flk = true;
                  }
                }
              }
            }
          } else if (this.alocked !== this.lalocked) {
            if (this.alocked !== -1) {
              this.wasay = true;
              this.say = " Arrow Locked on >  " + this.plnames[this.alocked] + "";
              this.tcnt = -5;
            } else {
              this.wasay = true;
              this.say = "Arrow Unlocked!";
              this.tcnt = 10;
            }
            this.lalocked = this.alocked;
          }
        }
        if (this.m && this.m.darksky) {
          if (this.rd) {
            const hsbvals = floatArray(3);
            RGBtoHSB(this.m.csky[0], this.m.csky[1], this.m.csky[2], hsbvals);
            hsbvals[2] = 0.6;
            const rgb = HSBtoRGB(hsbvals[0], hsbvals[1], hsbvals[2]);
            const rSky = (rgb >> 16) & 0xff;
            const gSky = (rgb >> 8) & 0xff;
            const bSky = rgb & 0xff;
            this.rd.setColor(rSky, gSky, bSky);
            this.rd.fillRect(602, 9, 54, 14);
            this.rd.drawLine(601, 10, 601, 21);
            this.rd.drawLine(600, 12, 600, 19);
            this.rd.fillRect(607, 29, 49, 14);
            this.rd.drawLine(606, 30, 606, 41);
            this.rd.drawLine(605, 32, 605, 39);
            this.rd.fillRect(18, 6, 155, 14);
            this.rd.drawLine(17, 7, 17, 18);
            this.rd.drawLine(16, 9, 16, 16);
            this.rd.drawLine(173, 7, 173, 18);
            this.rd.drawLine(174, 9, 174, 16);
            this.rd.fillRect(40, 26, 107, 21);
            this.rd.drawLine(39, 27, 39, 45);
            this.rd.drawLine(38, 29, 38, 43);
            this.rd.drawLine(147, 27, 147, 45);
            this.rd.drawLine(148, 29, 148, 43);
          }
        }
        if (this.rd) {
          if (this.dmg) this.rd.drawImage(this.dmg, 600, 7); else { /* TODO not ported: dmg image asset not loaded */ }
          if (this.pwr) this.rd.drawImage(this.pwr, 600, 27); else { /* TODO not ported: pwr image asset not loaded */ }
          if (this.lap) this.rd.drawImage(this.lap, 19, 7); else { /* TODO not ported: lap image asset not loaded */ }
          this.rd.setColor(0, 0, 100);
          this.rd.drawString("" + (mad.nlaps + 1) + " / " + checkPoints.nlaps + "", 51, 18);
          if (this.was) this.rd.drawImage(this.was, 92, 7); else { /* TODO not ported: was image asset not loaded */ }
          this.rd.setColor(0, 0, 100);
          this.rd.drawString("" + checkPoints.wasted + " / " + (this.nplayers - 1) + "", 150, 18);
          if (this.pos) this.rd.drawImage(this.pos, 42, 27); else { /* TODO not ported: pos image asset not loaded */ }
          const rankImg = this.rank[checkPoints.pos[mad.im]];
          if (rankImg) this.rd.drawImage(rankImg, 110, 28); else { /* TODO not ported: rank image asset not loaded */ }
        }
        this.drawstat(this.cd ? this.cd.maxmag[mad.cn] : 100, mad.hitmag, mad.newcar, mad.power);
        if (control.radar && checkPoints.stage !== 10) {
          this.radarstat(mad, contO, checkPoints);
        }
      }
      if (!this.holdit) {
        if (this.starcnt !== 0 && this.starcnt <= 35) {
          if (this.starcnt === 35 && !this.mutes && this.three && this.three.play) {
            this.three.play();
          }
          if (this.starcnt === 24) {
            this.gocnt = 2;
            if (!this.mutes && this.two && this.two.play) {
              this.two.play();
            }
          }
          if (this.starcnt === 13) {
            this.gocnt = 1;
            if (!this.mutes && this.one && this.one.play) {
              this.one.play();
            }
          }
          if (this.starcnt === 2) {
            this.gocnt = 0;
            if (!this.mutes && this.go && this.go.play) {
              this.go.play();
            }
          }
          this.duds = 0;
          if (this.starcnt <= 37 && this.starcnt > 32) {
            this.duds = 1;
          }
          if (this.starcnt <= 26 && this.starcnt > 21) {
            this.duds = 1;
          }
          if (this.starcnt <= 15 && this.starcnt > 10) {
            this.duds = 1;
          }
          if (this.starcnt <= 4) {
            this.duds = 2;
          }
          if (this.dudo !== -1) {
            if (this.rd) this.rd.setComposite(0.3);
            const dudeImg = this.dude[this.duds];
            if (this.rd && dudeImg) {
              this.rd.drawImage(dudeImg, this.dudo, 0);
            } else {
              // TODO not ported: dude image asset not loaded
            }
            if (this.rd) this.rd.setComposite(1.0);
          }
          const cntdnImg = this.cntdn[this.gocnt];
          if (this.rd && cntdnImg) {
            if (this.gocnt !== 0) {
              this.rd.drawImage(cntdnImg, 385, 50);
            } else {
              this.rd.drawImage(cntdnImg, 363, 50);
            }
          } else {
            // TODO not ported: cntdn image asset not loaded
          }
        }
        if (this.looped !== 0 && mad.loop === 2) {
          this.looped = 0;
        }
        if (mad.power < 45.0) {
          if (this.tcnt === 30 && this.auscnt === 45 && mad.mtouch && mad.capcnt === 0 && this.exitm === 0) {
            if (this.looped !== 2) {
              if (this.pwcnt < 70 || (this.pwcnt < 100 && this.looped !== 0)) {
                if (this.pwflk) {
                  this.drawcs(110, "Power low, perform stunt!", 0, 0, 200, 0);
                  this.pwflk = false;
                } else {
                  this.drawcs(110, "Power low, perform stunt!", 255, 100, 0, 0);
                  this.pwflk = true;
                }
              }
            } else if (this.pwcnt < 100) {
              let s2 = "";
              if (this.multion === 0) {
                s2 = "  (Press Enter)";
              }
              if (this.pwflk) {
                this.drawcs(110, "Please read the Game Instructions!" + s2 + "", 0, 0, 200, 0);
                this.pwflk = false;
              } else {
                this.drawcs(110, "Please read the Game Instructions!" + s2 + "", 255, 100, 0, 0);
                this.pwflk = true;
              }
            }
            ++this.pwcnt;
            if (this.pwcnt === 300) {
              this.pwcnt = 0;
              if (this.looped !== 0) {
                ++this.looped;
                if (this.looped === 4) {
                  this.looped = 2;
                }
              }
            }
          }
        } else if (this.pwcnt !== 0) {
          this.pwcnt = 0;
        }
        if (mad.capcnt === 0) {
          if (this.tcnt < 30) {
            if (this.exitm === 0) {
              if (this.tflk) {
                if (!this.wasay) {
                  this.drawcs(105, this.say, 0, 0, 0, 0);
                } else {
                  this.drawcs(105, this.say, 0, 0, 0, 0);
                }
                this.tflk = false;
              } else {
                if (!this.wasay) {
                  this.drawcs(105, this.say, 0, 128, 255, 0);
                } else {
                  this.drawcs(105, this.say, 255, 128, 0, 0);
                }
                this.tflk = true;
              }
            }
            ++this.tcnt;
          } else if (this.wasay) {
            this.wasay = false;
          }
          if (this.auscnt < 45) {
            if (this.exitm === 0) {
              if (this.aflk) {
                this.drawcs(85, this.asay, 98, 176, 255, 0);
                this.aflk = false;
              } else {
                this.drawcs(85, this.asay, 0, 128, 255, 0);
                this.aflk = true;
              }
            }
            ++this.auscnt;
          }
        } else if (this.exitm === 0) {
          if (this.tflk) {
            this.drawcs(110, "Bad Landing!", 0, 0, 200, 0);
            this.tflk = false;
          } else {
            this.drawcs(110, "Bad Landing!", 255, 100, 0, 0);
            this.tflk = true;
          }
        }
        if (mad.trcnt === 10) {
          this.loop = "";
          this.spin = "";
          this.asay = "";
          let n5 = 0;
          while (mad.travzy > 225) {
            mad.travzy -= 360;
            ++n5;
          }
          while (mad.travzy < -225) {
            mad.travzy += 360;
            --n5;
          }
          if (n5 === 1) {
            this.loop = "Forward loop";
          }
          if (n5 === 2) {
            this.loop = "double Forward";
          }
          if (n5 === 3) {
            this.loop = "triple Forward";
          }
          if (n5 >= 4) {
            this.loop = "massive Forward looping";
          }
          if (n5 === -1) {
            this.loop = "Backloop";
          }
          if (n5 === -2) {
            this.loop = "double Back";
          }
          if (n5 === -3) {
            this.loop = "triple Back";
          }
          if (n5 <= -4) {
            this.loop = "massive Back looping";
          }
          if (n5 === 0) {
            if (mad.ftab && mad.btab) {
              this.loop = "Tabletop and reversed Tabletop";
            } else if (mad.ftab || mad.btab) {
              this.loop = "Tabletop";
            }
          }
          if (n5 > 0 && mad.btab) {
            this.loop = "Hanged " + this.loop;
          }
          if (n5 < 0 && mad.ftab) {
            this.loop = "Hanged " + this.loop;
          }
          if (this.loop !== "") {
            this.asay = this.asay + " " + this.loop;
          }
          let n6 = 0;
          mad.travxy = Math.abs(mad.travxy);
          while (mad.travxy > 270) {
            mad.travxy -= 360;
            ++n6;
          }
          if (n6 === 0 && mad.rtab) {
            if (this.loop === "") {
              this.spin = "Tabletop";
            } else {
              this.spin = "Flipside";
            }
          }
          if (n6 === 1) {
            this.spin = "Rollspin";
          }
          if (n6 === 2) {
            this.spin = "double Rollspin";
          }
          if (n6 === 3) {
            this.spin = "triple Rollspin";
          }
          if (n6 >= 4) {
            this.spin = "massive Roll spinning";
          }
          let n7 = 0;
          let b5 = false;
          mad.travxz = Math.abs(mad.travxz);
          while (mad.travxz > 90) {
            mad.travxz -= 180;
            n7 += 180;
            if (n7 > 900) {
              n7 = 900;
              b5 = true;
            }
          }
          if (n7 !== 0) {
            if (this.loop === "" && this.spin === "") {
              this.asay = this.asay + " " + n7;
              if (b5) {
                this.asay += " and beyond";
              }
            } else {
              if (this.spin !== "") {
                if (this.loop === "") {
                  this.asay = this.asay + " " + this.spin;
                } else {
                  this.asay = this.asay + " with " + this.spin;
                }
              }
              this.asay = this.asay + " by " + n7;
              if (b5) {
                this.asay += " and beyond";
              }
            }
          } else if (this.spin !== "") {
            if (this.loop === "") {
              this.asay = this.asay + " " + this.spin;
            } else {
              this.asay = this.asay + " by " + this.spin;
            }
          }
          if (this.asay !== "") {
            this.auscnt -= 15;
          }
          if (this.loop !== "") {
            this.auscnt -= 25;
          }
          if (this.spin !== "") {
            this.auscnt -= 25;
          }
          if (n7 !== 0) {
            this.auscnt -= 25;
          }
          if (this.auscnt < 45) {
            if (!this.mutes && this.powerup && this.powerup.play) {
              this.powerup.play();
            }
            if (this.auscnt < -20) {
              this.auscnt = -20;
            }
            let n8 = 0;
            if (mad.powerup > 20.0) {
              n8 = 1;
            }
            if (mad.powerup > 40.0) {
              n8 = 2;
            }
            if (mad.powerup > 150.0) {
              n8 = 3;
            }
            if (mad.surfer) {
              this.asay = " " + this.adj[4][trunc(fr(this.m.random() * 3.0))] + this.asay;
            }
            if (n8 !== 3) {
              this.asay = this.adj[n8][trunc(fr(this.m.random() * 3.0))] + this.asay + this.exlm[n8];
            } else {
              this.asay = this.adj[n8][trunc(fr(this.m.random() * 3.0))];
            }
            if (!this.wasay) {
              this.tcnt = this.auscnt;
              if (mad.power !== 98.0) {
                this.say = "Power Up " + trunc(100.0 * mad.powerup / 98.0) + "%";
              } else {
                this.say = "Power To The MAX";
              }
              if (this.skidup) {
                this.skidup = false;
              } else {
                this.skidup = true;
              }
            }
          }
        }
        if (mad.newcar) {
          if (!this.wasay) {
            this.say = "Car Fixed";
            this.tcnt = 0;
          }
          if (this.crashup) {
            this.crashup = false;
          } else {
            this.crashup = true;
          }
        }
        for (let n9 = 0; n9 < this.nplayers; ++n9) {
          if (this.dested[n9] !== checkPoints.dested[n9] && n9 !== this.im) {
            this.dested[n9] = checkPoints.dested[n9];
            if (this.fase !== 7001) {
              if (this.dested[n9] === 1) {
                this.wasay = true;
                this.say = "" + (this.cd && this.cd.names ? this.cd.names[this.sc[n9]] : "") + " has been wasted!";
                this.tcnt = -15;
              }
              if (this.dested[n9] === 2) {
                this.wasay = true;
                this.say = "You wasted " + (this.cd && this.cd.names ? this.cd.names[this.sc[n9]] : "") + "!";
                this.tcnt = -15;
              }
            } else {
              if (this.dested[n9] === 1) {
                this.wasay = true;
                this.say = "" + this.plnames[n9] + " has been wasted!";
                this.tcnt = -15;
              }
              if (this.dested[n9] === 2) {
                this.wasay = true;
                if (this.multion < 2) {
                  this.say = "You wasted " + this.plnames[n9] + "!";
                } else {
                  this.say = "" + this.plnames[this.im] + " wasted " + this.plnames[n9] + "!";
                }
                this.tcnt = -15;
              }
              if (this.dested[n9] === 3) {
                this.wasay = true;
                this.say = "" + this.plnames[n9] + " has been wasted! (Disconnected)";
                this.tcnt = -15;
              }
            }
          }
        }
        if (this.multion >= 2 && this.alocked !== this.lalocked) {
          if (this.alocked !== -1) {
            this.wasay = false;
            this.say = "Now following " + this.plnames[this.alocked] + "!";
            this.tcnt = -15;
          }
          this.lalocked = this.alocked;
          this.clear = mad.clear;
        }
        if (this.clear !== mad.clear && mad.clear !== 0) {
          if (!this.wasay) {
            this.say = "Checkpoint!";
            this.tcnt = 15;
          }
          this.clear = mad.clear;
          if (!this.mutes && this.checkpoint && this.checkpoint.play) {
            this.checkpoint.play();
          }
          this.cntovn = 0;
          if (this.cntan !== 0) {
            this.cntan = 0;
          }
        }
      }
    }
    if (this.m && this.m.lightn !== -1) {
      if (this.strack && this.strack.sClip && this.strack.sClip.stream && typeof this.strack.sClip.stream.available === 'function') {
        const available = this.strack.sClip.stream.available();
        this.m.lton = false;
        if (available <= 6380001 && available > 5368001) {
          this.m.lton = true;
        }
        if (available <= 2992001 && available > 1320001) {
          this.m.lton = true;
        }
      } else {
        // TODO not ported: strack soundClip stream available check for lightning flashes
      }
    }
  }

  drawstat(n, n2, b, n3) {
    if (!this.rd || !this.m) return;
    const array = intArray(4);
    const array2 = intArray(4);
    if (n2 > n) {
      n2 = n;
    }
    const n4 = trunc(fr(98.0 * fr(n2 / n)));
    array[0] = 662;
    array2[0] = 11;
    array[1] = 662;
    array2[1] = 20;
    array[2] = 662 + n4;
    array2[2] = 20;
    array[3] = 662 + n4;
    array2[3] = 11;
    const n5 = 244;
    let n6 = 244;
    const n7 = 11;
    if (n4 > 33) {
      n6 = trunc(fr(244.0 - fr(233.0 * fr(fr(n4 - 33) / 65.0))));
    }
    if (n4 > 70) {
      if (this.dmcnt < 10) {
        if (this.dmflk) {
          n6 = 170;
          this.dmflk = false;
        } else {
          this.dmflk = true;
        }
      }
      ++this.dmcnt;
      if (this.dmcnt > 167.0 - n4 * 1.5) {
        this.dmcnt = 0;
      }
    }
    let r = trunc(fr(n5 + fr(n5 * fr(this.m.snap[0] / 100.0))));
    if (r > 255) r = 255;
    if (r < 0) r = 0;
    let g = trunc(fr(n6 + fr(n6 * fr(this.m.snap[1] / 100.0))));
    if (g > 255) g = 255;
    if (g < 0) g = 0;
    let b2 = trunc(fr(n7 + fr(n7 * fr(this.m.snap[2] / 100.0))));
    if (b2 > 255) b2 = 255;
    if (b2 < 0) b2 = 0;
    this.rd.setColor(r, g, b2);
    this.rd.fillPolygon(array, array2, 4);

    array[0] = 662;
    array2[0] = 31;
    array[1] = 662;
    array2[1] = 40;
    array[2] = trunc(fr(662.0 + n3));
    array2[2] = 40;
    array[3] = trunc(fr(662.0 + n3));
    array2[3] = 31;
    let n8 = 128;
    if (n3 === 98.0) {
      n8 = 64;
    }
    let n9 = trunc(190.0 + n3 * 0.37);
    let n10 = 244;
    if (this.auscnt < 45 && this.aflk) {
      n8 = 128;
      n9 = 244;
      n10 = 244;
    }
    let r2 = trunc(fr(n8 + fr(n8 * fr(this.m.snap[0] / 100.0))));
    if (r2 > 255) r2 = 255;
    if (r2 < 0) r2 = 0;
    let g2 = trunc(fr(n9 + fr(n9 * fr(this.m.snap[1] / 100.0))));
    if (g2 > 255) g2 = 255;
    if (g2 < 0) g2 = 0;
    let b3 = trunc(fr(n10 + fr(n10 * fr(this.m.snap[2] / 100.0))));
    if (b3 > 255) b3 = 255;
    if (b3 < 0) b3 = 0;
    this.rd.setColor(r2, g2, b3);
    this.rd.fillPolygon(array, array2, 4);
  }

  drawhi(image, n) {
    if (!image) {
      // TODO not ported: drawhi called with null image asset
      return;
    }
    const w = image.width || (image.getWidth ? image.getWidth(this.ob) : 0);
    const h = image.height || (image.getHeight ? image.getHeight(this.ob) : 0);
    if (this.m && this.m.darksky && this.rd) {
      const hsbvals = floatArray(3);
      RGBtoHSB(this.m.csky[0], this.m.csky[1], this.m.csky[2], hsbvals);
      hsbvals[2] = 0.6;
      const rgb = HSBtoRGB(hsbvals[0], hsbvals[1], hsbvals[2]);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      this.rd.setColor(r, g, b);
      this.rd.fillRect(390 - idiv(w, 2), n - 2, w + 20, h + 2);
      this.rd.setColor(trunc(r / 1.1), trunc(g / 1.1), trunc(b / 1.1));
      this.rd.drawRect(390 - idiv(w, 2), n - 2, w + 20, h + 2);
    }
    if (this.rd) {
      this.rd.drawImage(image, 400 - idiv(w, 2), n);
    }
  }

  drawcs(n, str, r, g, b, n2) {
    if (!this.m) return;
    if (n2 !== 3 && n2 !== 4 && n2 !== 5) {
      r = trunc(fr(r + fr(r * fr(this.m.snap[0] / 100.0))));
      if (r > 255) r = 255;
      if (r < 0) r = 0;
      g = trunc(fr(g + fr(g * fr(this.m.snap[1] / 100.0))));
      if (g > 255) g = 255;
      if (g < 0) g = 0;
      b = trunc(fr(b + fr(b * fr(this.m.snap[2] / 100.0))));
      if (b > 255) b = 255;
      if (b < 0) b = 0;
    }
    if (n2 === 4) {
      r = trunc(fr(r - fr(r * fr(this.m.snap[0] / 100.0))));
      if (r > 255) r = 255;
      if (r < 0) r = 0;
      g = trunc(fr(g - fr(g * fr(this.m.snap[1] / 100.0))));
      if (g > 255) g = 255;
      if (g < 0) g = 0;
      b = trunc(fr(b - fr(b * fr(this.m.snap[2] / 100.0))));
      if (b > 255) b = 255;
      if (b < 0) b = 0;
    }
    const ftm = this.ftm || (this.rd ? this.rd.getFontMetrics() : { stringWidth: (s) => s.length * 6 });
    if (n2 === 1 && this.rd) {
      this.rd.setColor(0, 0, 0);
      this.rd.drawString(str, 400 - idiv(ftm.stringWidth(str), 2) + 1, n + 1);
    }
    if (n2 === 2) {
      r = idiv(r * 2 + this.m.csky[0] * 1, 3);
      if (r > 255) r = 255;
      if (r < 0) r = 0;
      g = idiv(g * 2 + this.m.csky[1] * 1, 3);
      if (g > 255) g = 255;
      if (g < 0) g = 0;
      b = idiv(b * 2 + this.m.csky[2] * 1, 3);
      if (b > 255) b = 255;
      if (b < 0) b = 0;
    }
    if (n2 === 5 && this.rd) {
      this.rd.setColor(idiv(this.m.csky[0], 2), idiv(this.m.csky[1], 2), idiv(this.m.csky[2], 2));
      this.rd.drawString(str, 400 - idiv(ftm.stringWidth(str), 2) + 1, n + 1);
    }
    if (this.rd) {
      this.rd.setColor(r, g, b);
      this.rd.drawString(str, 400 - idiv(ftm.stringWidth(str), 2), n);
    }
  }

  arrow(n, n2, checkPoints, b) {
    if (!this.m) return;
    const array = intArray(7);
    const array2 = intArray(7);
    const array3 = intArray(7);
    const n3 = 400;
    const n4 = -90;
    const n5 = 700;
    for (let i = 0; i < 7; ++i) {
      array2[i] = n4;
    }
    array[0] = n3;
    array3[0] = n5 + 110;
    array[1] = n3 - 35;
    array3[1] = n5 + 50;
    array[2] = n3 - 15;
    array3[2] = n5 + 50;
    array[3] = n3 - 15;
    array3[3] = n5 - 50;
    array[4] = n3 + 15;
    array3[4] = n5 - 50;
    array[5] = n3 + 15;
    array3[5] = n5 + 50;
    array[6] = n3 + 35;
    array3[6] = n5 + 50;
    let n7;
    if (!b) {
      let n6 = 0;
      if (checkPoints.x[n] - checkPoints.opx[this.im] >= 0) {
        n6 = 180;
      }
      n7 = trunc(90 + n6 + Math.atan((checkPoints.z[n] - checkPoints.opz[this.im]) / (checkPoints.x[n] - checkPoints.opx[this.im])) / 0.017453292519943295);
    } else {
      let alocked = 0;
      if (this.multion === 0 || this.alocked === -1) {
        let py = -1;
        let n8 = 0;
        for (let j = 0; j < this.nplayers; ++j) {
          if (j !== this.im && (this.py(idiv(checkPoints.opx[this.im], 100), idiv(checkPoints.opx[j], 100), idiv(checkPoints.opz[this.im], 100), idiv(checkPoints.opz[j], 100)) < py || py === -1) && (n8 === 0 || checkPoints.onscreen[j] !== 0) && checkPoints.dested[j] === 0) {
            alocked = j;
            py = this.py(idiv(checkPoints.opx[this.im], 100), idiv(checkPoints.opx[j], 100), idiv(checkPoints.opz[this.im], 100), idiv(checkPoints.opz[j], 100));
            if (checkPoints.onscreen[j] !== 0) {
              n8 = 1;
            }
          }
        }
      } else {
        alocked = this.alocked;
      }
      let n9 = 0;
      if (checkPoints.opx[alocked] - checkPoints.opx[this.im] >= 0) {
        n9 = 180;
      }
      n7 = trunc(90 + n9 + Math.atan((checkPoints.opz[alocked] - checkPoints.opz[this.im]) / (checkPoints.opx[alocked] - checkPoints.opx[this.im])) / 0.017453292519943295);
      if (this.multion === 0) {
        this.drawcs(13, "[                                ]", 76, 67, 240, 0);
        if (this.cd && this.cd.names) {
          this.drawcs(13, this.cd.names[this.sc[alocked]], 0, 0, 0, 0);
        }
      } else {
        // TODO not ported: multiplayer target arrow text formatting
        if (this.rd) {
          this.rd.setFont('bold 12px Arial');
          this.ftm = this.rd.getFontMetrics();
        }
        this.drawcs(17, "[                                ]", 76, 67, 240, 0);
        this.drawcs(12, this.plnames[alocked], 0, 0, 0, 0);
        if (this.rd) {
          this.rd.setFont('10px Arial');
          this.ftm = this.rd.getFontMetrics();
        }
        if (this.cd && this.cd.names) {
          this.drawcs(24, this.cd.names[this.sc[alocked]], 0, 0, 0, 0);
        }
        if (this.rd) {
          this.rd.setFont('bold 11px Arial');
          this.ftm = this.rd.getFontMetrics();
        }
      }
    }
    let k;
    for (k = n7 + this.m.xz; k < 0; k += 360) {}
    while (k > 180) {
      k -= 360;
    }
    if (!b) {
      if (k > 130) {
        k = 130;
      }
      if (k < -130) {
        k = -130;
      }
    } else {
      if (k > 100) {
        k = 100;
      }
      if (k < -100) {
        k = -100;
      }
    }
    if (Math.abs(this.ana - k) < 180) {
      if (Math.abs(this.ana - k) < 10) {
        this.ana = k;
      } else if (this.ana < k) {
        this.ana += 10;
      } else {
        this.ana -= 10;
      }
    } else {
      if (k < 0) {
        this.ana += 15;
        if (this.ana > 180) {
          this.ana -= 360;
        }
      }
      if (k > 0) {
        this.ana -= 15;
        if (this.ana < -180) {
          this.ana += 360;
        }
      }
    }
    this.rot(array, array3, n3, n5, this.ana, 7);
    const abs = Math.abs(this.ana);
    if (this.rd) this.rd.setRenderingHint();
    if (!b) {
      if (abs > 7 || n2 > 0 || n2 === -2 || this.cntan !== 0) {
        for (let l = 0; l < 7; ++l) {
          array[l] = this.xs(array[l], array3[l]);
          array2[l] = this.ys(array2[l], array3[l]);
        }
        let r = trunc(fr(190.0 + fr(190.0 * fr(this.m.snap[0] / 100.0))));
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        let g = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[1] / 100.0))));
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        let b2 = 0;
        if (n2 <= 0) {
          if (abs <= 45 && n2 !== -2 && this.cntan === 0) {
            r = idiv(r * abs + this.m.csky[0] * (45 - abs), 45);
            g = idiv(g * abs + this.m.csky[1] * (45 - abs), 45);
            b2 = idiv(b2 * abs + this.m.csky[2] * (45 - abs), 45);
          }
          if (abs >= 90) {
            let n10 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 100.0))));
            if (n10 > 255) n10 = 255;
            if (n10 < 0) n10 = 0;
            r = idiv(r * (140 - abs) + n10 * (abs - 90), 50);
            if (r > 255) r = 255;
          }
        } else if (this.flk) {
          r = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 100.0))));
          if (r > 255) r = 255;
          if (r < 0) r = 0;
          this.flk = false;
        } else {
          r = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 100.0))));
          if (r > 255) r = 255;
          if (r < 0) r = 0;
          g = trunc(fr(220.0 + fr(220.0 * fr(this.m.snap[1] / 100.0))));
          if (g > 255) g = 255;
          if (g < 0) g = 0;
          this.flk = true;
        }
        if (this.rd) {
          this.rd.setColor(r, g, b2);
          this.rd.fillPolygon(array, array2, 7);
        }
        let r2 = trunc(fr(115.0 + fr(115.0 * fr(this.m.snap[0] / 100.0))));
        if (r2 > 255) r2 = 255;
        if (r2 < 0) r2 = 0;
        let g2 = trunc(fr(170.0 + fr(170.0 * fr(this.m.snap[1] / 100.0))));
        if (g2 > 255) g2 = 255;
        if (g2 < 0) g2 = 0;
        let b3 = 0;
        if (n2 <= 0) {
          if (abs <= 45 && n2 !== -2 && this.cntan === 0) {
            r2 = idiv(r2 * abs + this.m.csky[0] * (45 - abs), 45);
            g2 = idiv(g2 * abs + this.m.csky[1] * (45 - abs), 45);
            b3 = idiv(b3 * abs + this.m.csky[2] * (45 - abs), 45);
          }
        } else if (this.flk) {
          r2 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 100.0))));
          if (r2 > 255) r2 = 255;
          if (r2 < 0) r2 = 0;
          g2 = 0;
        }
        if (this.rd) {
          this.rd.setColor(r2, g2, b3);
          this.rd.drawPolygon(array, array2, 7);
        }
      }
    } else {
      let n11 = 0;
      if (this.multion !== 0) {
        n11 = 8;
      }
      for (let n12 = 0; n12 < 7; ++n12) {
        array[n12] = this.xs(array[n12], array3[n12]);
        array2[n12] = this.ys(array2[n12], array3[n12]) + n11;
      }
      let r3 = trunc(fr(159.0 + fr(159.0 * fr(this.m.snap[0] / 100.0))));
      if (r3 > 255) r3 = 255;
      if (r3 < 0) r3 = 0;
      let g3 = trunc(fr(207.0 + fr(207.0 * fr(this.m.snap[1] / 100.0))));
      if (g3 > 255) g3 = 255;
      if (g3 < 0) g3 = 0;
      let b4 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[2] / 100.0))));
      if (b4 > 255) b4 = 255;
      if (b4 < 0) b4 = 0;
      if (this.rd) {
        this.rd.setColor(r3, g3, b4);
        this.rd.fillPolygon(array, array2, 7);
      }
      let r4 = trunc(fr(120.0 + fr(120.0 * fr(this.m.snap[0] / 100.0))));
      if (r4 > 255) r4 = 255;
      if (r4 < 0) r4 = 0;
      let g4 = trunc(fr(114.0 + fr(114.0 * fr(this.m.snap[1] / 100.0))));
      if (g4 > 255) g4 = 255;
      if (g4 < 0) g4 = 0;
      let b5 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[2] / 100.0))));
      if (b5 > 255) b5 = 255;
      if (b5 < 0) b5 = 0;
      if (this.rd) {
        this.rd.setColor(r4, g4, b5);
        this.rd.drawPolygon(array, array2, 7);
      }
    }
    if (this.rd) this.rd.setRenderingHint();
  }

  radarstat(mad, contO, checkPoints) {
    if (!this.rd || !this.m) return;
    this.rd.setComposite(0.5);
    this.rd.setColor(this.m.csky[0], this.m.csky[1], this.m.csky[2]);
    this.rd.fillRect(10, 55, 172, 172);
    this.rd.setComposite(1.0);
    this.rd.setRenderingHint();
    this.rd.setColor(idiv(this.m.csky[0], 2), idiv(this.m.csky[1], 2), idiv(this.m.csky[2], 2));
    for (let i = 0; i < checkPoints.n; ++i) {
      let n = i + 1;
      if (i === checkPoints.n - 1) {
        n = 0;
      }
      let b = false;
      if (checkPoints.typ[n] === -3) {
        n = 0;
        b = true;
      }
      const array = Int32Array.from([
        trunc(fr(96.0 - fr(fr(checkPoints.opx[this.im] - checkPoints.x[i]) / checkPoints.prox))),
        trunc(fr(96.0 - fr(fr(checkPoints.opx[this.im] - checkPoints.x[n]) / checkPoints.prox)))
      ]);
      const array2 = Int32Array.from([
        trunc(fr(141.0 - fr(fr(checkPoints.z[i] - checkPoints.opz[this.im]) / checkPoints.prox))),
        trunc(fr(141.0 - fr(fr(checkPoints.z[n] - checkPoints.opz[this.im]) / checkPoints.prox)))
      ]);
      this.rot(array, array2, 96, 141, mad.cxz, 2);
      this.rd.drawLine(array[0], array2[0], array[1], array2[1]);
      if (b) {
        break;
      }
    }
    if (this.arrace || this.multion > 1) {
      const array3 = intArray(this.nplayers);
      const array4 = intArray(this.nplayers);
      for (let j = 0; j < this.nplayers; ++j) {
        array3[j] = trunc(fr(96.0 - fr(fr(checkPoints.opx[this.im] - checkPoints.opx[j]) / checkPoints.prox)));
        array4[j] = trunc(fr(141.0 - fr(fr(checkPoints.opz[j] - checkPoints.opz[this.im]) / checkPoints.prox)));
      }
      this.rot(array3, array4, 96, 141, mad.cxz, this.nplayers);
      let n2 = 0;
      let n3 = trunc(fr(80.0 + fr(80.0 * fr(this.m.snap[1] / 100.0))));
      if (n3 > 255) n3 = 255;
      if (n3 < 0) n3 = 0;
      let n4 = trunc(fr(159.0 + fr(159.0 * fr(this.m.snap[2] / 100.0))));
      if (n4 > 255) n4 = 255;
      if (n4 < 0) n4 = 0;
      for (let k = 0; k < this.nplayers; ++k) {
        if (k !== this.im && checkPoints.dested[k] === 0) {
          if (this.clangame !== 0) {
            // TODO not ported: clan game radar car colors
            let n5, n6, n7;
            if (this.pclan[k].toLowerCase() === this.gaclan.toLowerCase()) {
              n5 = 159; n6 = 80; n7 = 0;
            } else {
              n5 = 0; n6 = 80; n7 = 159;
            }
            n2 = trunc(fr(n5 + fr(n5 * fr(this.m.snap[0] / 100.0))));
            if (n2 > 255) n2 = 255;
            if (n2 < 0) n2 = 0;
            n3 = trunc(fr(n6 + fr(n6 * fr(this.m.snap[1] / 100.0))));
            if (n3 > 255) n3 = 255;
            if (n3 < 0) n3 = 0;
            n4 = trunc(fr(n7 + fr(n7 * fr(this.m.snap[2] / 100.0))));
            if (n4 > 255) n4 = 255;
            if (n4 < 0) n4 = 0;
          }
          let n8 = 2;
          if (this.alocked === k) {
            n8 = 3;
            this.rd.setColor(n2, n3, n4);
          } else {
            this.rd.setColor(idiv(n2 + this.m.csky[0], 2), idiv(this.m.csky[1] + n3, 2), idiv(n4 + this.m.csky[2], 2));
          }
          this.rd.drawLine(array3[k] - n8, array4[k], array3[k] + n8, array4[k]);
          this.rd.drawLine(array3[k], array4[k] + n8, array3[k], array4[k] - n8);
          this.rd.setColor(n2, n3, n4);
          this.rd.fillRect(array3[k] - 1, array4[k] - 1, 3, 3);
        }
      }
    }
    let r = trunc(fr(159.0 + fr(159.0 * fr(this.m.snap[0] / 100.0))));
    if (r > 255) r = 255;
    if (r < 0) r = 0;
    let g = 0;
    let b2 = 0;
    if (this.clangame !== 0) {
      // TODO not ported: clan game player radar indicator color
      let n9, n10, n11;
      if (this.pclan[this.im].toLowerCase() === this.gaclan.toLowerCase()) {
        n9 = 159; n10 = 80; n11 = 0;
      } else {
        n9 = 0; n10 = 80; n11 = 159;
      }
      r = trunc(fr(n9 + fr(n9 * fr(this.m.snap[0] / 100.0))));
      if (r > 255) r = 255;
      if (r < 0) r = 0;
      g = trunc(fr(n10 + fr(n10 * fr(this.m.snap[1] / 100.0))));
      if (g > 255) g = 255;
      if (g < 0) g = 0;
      b2 = trunc(fr(n11 + fr(n11 * fr(this.m.snap[2] / 100.0))));
      if (b2 > 255) b2 = 255;
      if (b2 < 0) b2 = 0;
    }
    this.rd.setColor(idiv(r + this.m.csky[0], 2), idiv(this.m.csky[1] + g, 2), idiv(b2 + this.m.csky[2], 2));
    this.rd.drawLine(96, 139, 96, 143);
    this.rd.drawLine(94, 141, 98, 141);
    this.rd.setColor(r, g, b2);
    this.rd.fillRect(95, 140, 3, 3);
    this.rd.setRenderingHint();
    if (this.m.darksky) {
      const hsbvals = floatArray(3);
      RGBtoHSB(this.m.csky[0], this.m.csky[1], this.m.csky[2], hsbvals);
      hsbvals[2] = 0.6;
      const rgb = HSBtoRGB(hsbvals[0], hsbvals[1], hsbvals[2]);
      const rSky = (rgb >> 16) & 0xff;
      const gSky = (rgb >> 8) & 0xff;
      const bSky = rgb & 0xff;
      this.rd.setColor(rSky, gSky, bSky);
      this.rd.fillRect(5, 232, 181, 17);
      this.rd.drawLine(4, 233, 4, 247);
      this.rd.drawLine(3, 235, 3, 245);
      this.rd.drawLine(186, 233, 186, 247);
      this.rd.drawLine(187, 235, 187, 245);
    }
    if (this.sped) {
      this.rd.drawImage(this.sped, 7, 234);
    } else {
      // TODO not ported: sped image asset not loaded
    }
    const n12 = contO.x - this.lcarx;
    this.lcarx = contO.x;
    const n13 = contO.y - this.lcary;
    this.lcary = contO.y;
    const n14 = contO.z - this.lcarz;
    this.lcarz = contO.z;
    const n15 = fr(fr(fr(fr(fr(fr(Math.sqrt(i32(Math.imul(n12, n12) + Math.imul(n14, n14))) * 1.4) * 21.0) * 60.0) * 60.0) / 100000.0));
    const n16 = fr(n15 * 0.621371);
    this.rd.setColor(0, 0, 100);
    this.rd.drawString("" + trunc(n15), 62, 245);
    this.rd.drawString("" + trunc(n16), 132, 245);
  }

  /**
   * Pick the opponent field for stage `n` — xtGraphics.java:7052.
   *
   * The original never uses one car for the whole grid: it draws sc[1..6] by
   * rejection sampling, biased so that later stages field faster cars, then
   * forces specific opponents in for certain stages (stage 10 wants a Radical
   * One and a Nimi, 12 wants a Radical One, 14 wants a Formula 7 and an
   * M.A.S.H.E.E.N., and so on).
   *
   * The rejection test is `(15 - sc[j]) / 15 * (n / 10)` capped at 0.8: a
   * low-numbered (slow) car is rejected more often the later the stage, so
   * the grid drifts upward through the roster without ever being fixed.
   *
   * `sc[0]` — the player's car — must be set BEFORE calling: several branches
   * avoid duplicating it.
   *
   * Duplicates are rejected across all 7 slots, so this loop only terminates
   * because the pool is larger than the grid. Slot 7 is untouched: the
   * original grid is 7 cars and this port allows 8.
   */
  sortcars(n) {
    if (n === 0) return;
    for (let i = 1; i < 7; ++i) {
      this.sc[i] = -1;
    }
    const array = new Array(7).fill(false);
    if (n < 0) {
      n = 27;
    }
    let n2 = 7;
    if (this.gmode === 1) {
      n2 = 5;
    }
    let b = false;
    if (n <= 10) {
      let n3 = 6;
      if (this.gmode === 1) {
        n3 = 4;
      }
      if ((n === 1 || n === 2) && this.sc[0] !== 5) {
        this.sc[n3] = 5;
        n2 = n3;
      }
      if ((n === 3 || n === 4) && this.sc[0] !== 6) {
        this.sc[n3] = 6;
        n2 = n3;
      }
      if ((n === 5 || n === 6) && this.sc[0] !== 11) {
        this.sc[n3] = 11;
        n2 = n3;
      }
      if ((n === 7 || n === 8) && this.sc[0] !== 14) {
        this.sc[n3] = 14;
        n2 = n3;
      }
      if ((n === 9 || n === 10) && this.sc[0] !== 15) {
        this.sc[n3] = 15;
        n2 = n3;
      }
    } else {
      n -= 10;
      b = true;
      if (this.sc[0] !== 7 + idiv(n + 1, 2) && n !== 17) {
        this.sc[6] = 7 + idiv(n + 1, 2);
        n2 = 6;
      }
    }
    let n4 = 16;
    let n5 = 1;
    let n6 = 2;
    for (let j = 1; j < n2; ++j) {
      array[j] = false;
      while (!array[j]) {
        let n7 = 10.0;
        if (b) {
          n7 = 17.0;
        }
        this.sc[j] = trunc(random() * fr(24.0 + fr(8.0 * fr(n / n7))));
        if (this.sc[j] >= 16) {
          this.sc[j] -= 16;
        }
        array[j] = true;
        for (let k = 0; k < 7; ++k) {
          if (j !== k && this.sc[j] === this.sc[k]) {
            array[j] = false;
          }
        }
        // n7 is reassigned here, AFTER it was used to pick the car and
        // BEFORE it is used to weight the rejection. Not a decompiler
        // artifact -- the two uses genuinely differ for the bonus stages.
        if (b) {
          n7 = 16.0;
        }
        let n9 = fr(fr((15 - this.sc[j]) / 15.0) * fr(n / n7));
        if (n9 > 0.8) {
          n9 = 0.8;
        }
        if (n === 17 && n9 > 0.5) {
          n9 = 0.5;
        }
        if (n9 > random()) {
          array[j] = false;
        }
        if (this.gmode === 1) {
          if (this.sc[j] >= 7 && this.sc[j] <= 10) array[j] = false;
          if (this.sc[j] === 12 || this.sc[j] === 13) array[j] = false;
          if (this.sc[j] > 5 && this.unlocked[0] <= 2) array[j] = false;
          if (this.sc[j] > 6 && this.unlocked[0] <= 4) array[j] = false;
          if (this.sc[j] > 11 && this.unlocked[0] <= 6) array[j] = false;
          if (this.sc[j] > 14 && this.unlocked[0] <= 8) array[j] = false;
        }
        if (this.gmode === 2) {
          if ((this.sc[j] - 7) * 2 > this.unlocked[1]) {
            array[j] = false;
          }
          if (n !== 16 || this.unlocked[1] !== 16 || this.sc[j] >= 9) {
            continue;
          }
          array[j] = false;
        }
      }
      // n5/n6 track the two slots holding the slowest cars; the forced
      // opponents below overwrite those rather than a random slot.
      if (this.sc[j] < n4) {
        n4 = this.sc[j];
        if (n5 !== j) {
          n6 = n5;
          n5 = j;
        }
      }
    }
    const has = (car) => {
      for (let i = 0; i < 7; ++i) {
        if (this.sc[i] === car) return true;
      }
      return false;
    };
    if (!b && n === 10) {
      if (!has(11) && (random() > random() || this.gmode !== 0)) this.sc[n5] = 11;
      if (!has(14) && (random() > random() || this.gmode !== 0)) this.sc[n6] = 14;
    }
    if (n === 12) {
      if (!has(11)) this.sc[n5] = 11;
    }
    if (n === 14) {
      if (!has(12) && (random() > random() || this.gmode !== 0)) this.sc[n5] = 12;
      if (!has(10) && (random() > random() || this.gmode !== 0)) this.sc[n6] = 10;
    }
    if (n === 15) {
      if (!has(11) && (random() > random() || this.gmode !== 0)) this.sc[n5] = 11;
      if (!has(13) && (random() > random() || this.gmode !== 0)) this.sc[n6] = 13;
    }
    if (n === 16) {
      if (!has(13) && (random() > random() || this.gmode !== 0)) this.sc[n5] = 13;
      if (!has(12) && (random() > random() || this.gmode !== 0)) this.sc[n6] = 12;
    }
    // Custom-car packs. lastload is 0 in the race-only harness, so neither
    // branch runs; kept so loading a pack later behaves as the original.
    if (this.cd.lastload === 1) {
      let n18 = 0;
      for (let n19 = 0; n19 < this.cd.nlcars - 16; ++n19) {
        if (n18 === 0) {
          for (let n20 = 1; n20 < n2; ++n20) array[n20] = false;
        }
        if (this.cd.include[n19] && this.sc[0] !== n19 + 16) {
          let n21;
          for (n21 = trunc(1.0 + random() * (n2 - 1)); array[n21]; n21 = trunc(1.0 + random() * (n2 - 1))) {}
          array[n21] = true;
          this.sc[n21] = n19 + 16;
          if (++n18 === n2 - 1) n18 = 0;
        }
      }
    }
    if (this.cd.lastload === 2) {
      let n22 = 0;
      for (let n23 = 0; n23 < this.cd.nlocars - 16; ++n23) {
        if (n22 === 0) {
          for (let n24 = 1; n24 < n2; ++n24) array[n24] = false;
        }
        if (this.cd.include[n23] && this.sc[0] !== n23 + 16) {
          let n25;
          for (n25 = trunc(1.0 + random() * (n2 - 1)); array[n25]; n25 = trunc(1.0 + random() * (n2 - 1))) {}
          array[n25] = true;
          this.sc[n25] = n23 + 16;
          if (++n22 === n2 - 1) n22 = 0;
        }
      }
    }
  }

  rot(array, array2, n, n2, n3, n4) {
    if (!this.m) return;
    if (n3 !== 0) {
      const cos = this.m.cos(n3);
      const sin = this.m.sin(n3);
      for (let i = 0; i < n4; ++i) {
        const n5 = array[i];
        const n6 = array2[i];
        array[i] = n + trunc(fr(fr((n5 - n) * cos) - fr((n6 - n2) * sin)));
        array2[i] = n2 + trunc(fr(fr((n5 - n) * sin) + fr((n6 - n2) * cos)));
      }
    }
  }

  xs(n, n2) {
    if (!this.m) return n;
    if (n2 < 50) {
      n2 = 50;
    }
    return idiv(Math.imul(n2 - this.m.focus_point, this.m.cx - n), n2) + n;
  }

  ys(n, n2) {
    if (!this.m) return n;
    if (n2 < 50) {
      n2 = 50;
    }
    return idiv(Math.imul(n2 - this.m.focus_point, this.m.cy - n), n2) + n;
  }

  py(n, n2, n3, n4) {
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }

  pys(n, n2, n3, n4) {
    return fr(Math.sqrt(i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4))));
  }
}
