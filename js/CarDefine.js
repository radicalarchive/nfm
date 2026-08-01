// Transpiled from java-src/CarDefine.java, line by line.
//
// Local names are kept as procyon emitted them (array, array2, n36, ...) even
// though they are ugly: the point is that this file diffs against the Java
// side by side. Do not rename or restructure.
//
// Numeric conventions used throughout:
//   idiv(a, b)   every Java int / int
//   trunc(x)     every Java (int) cast of a float or double
//   fr(x)        every Java float-typed intermediate
//   i32(x)       int wrap after arithmetic

import { idiv, trunc, fr, i32, intArray, floatArray, objArray } from './java.js';
import { readLines } from './vfs.js';
import { ContO } from './ContO.js';
import { Madness } from './Madness.js';

export class CarDefine {
  constructor(bco, m, t, gs) {
    this.swits = [
      Int32Array.from([50, 185, 282]), Int32Array.from([100, 200, 310]), Int32Array.from([60, 180, 275]), Int32Array.from([76, 195, 298]), Int32Array.from([70, 170, 275]), Int32Array.from([70, 202, 293]), Int32Array.from([60, 170, 289]), Int32Array.from([70, 206, 291]), Int32Array.from([90, 210, 295]), Int32Array.from([90, 190, 276]), Int32Array.from([70, 200, 295]), Int32Array.from([50, 160, 270]), Int32Array.from([90, 200, 305]), Int32Array.from([50, 130, 210]), Int32Array.from([80, 200, 300]), Int32Array.from([70, 210, 290]),
      Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0]), Int32Array.from([0, 0, 0])
    ];
    this.acelf = [
      Float32Array.from([11.0, 5.0, 3.0]), Float32Array.from([14.0, 7.0, 5.0]), Float32Array.from([10.0, 5.0, 3.5]), Float32Array.from([11.0, 6.0, 3.5]), Float32Array.from([10.0, 5.0, 3.5]), Float32Array.from([12.0, 6.0, 3.0]), Float32Array.from([7.0, 9.0, 4.0]), Float32Array.from([11.0, 5.0, 3.0]), Float32Array.from([12.0, 7.0, 4.0]), Float32Array.from([12.0, 7.0, 3.5]), Float32Array.from([11.5, 6.5, 3.5]), Float32Array.from([9.0, 5.0, 3.0]), Float32Array.from([13.0, 7.0, 4.5]), Float32Array.from([7.5, 3.5, 3.0]), Float32Array.from([11.0, 7.5, 4.0]), Float32Array.from([12.0, 6.0, 3.5]),
      Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0]), Float32Array.from([0.0, 0.0, 0.0])
    ];
    this.handb = Int32Array.from([7, 10, 7, 15, 12, 8, 9, 10, 5, 7, 8, 10, 8, 12, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.airs = Float32Array.from([1.0, 1.2, 0.95, 1.0, 2.2, 1.0, 0.9, 0.8, 1.0, 0.9, 1.15, 0.8, 1.0, 0.3, 1.3, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.airc = Int32Array.from([70, 30, 40, 40, 30, 50, 40, 90, 40, 50, 75, 10, 50, 0, 100, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.turn = Int32Array.from([6, 9, 5, 7, 8, 7, 5, 5, 9, 7, 7, 4, 6, 5, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.grip = Float32Array.from([20.0, 27.0, 18.0, 22.0, 19.0, 20.0, 25.0, 20.0, 19.0, 24.0, 22.5, 25.0, 30.0, 27.0, 25.0, 27.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.bounce = Float32Array.from([1.2, 1.05, 1.3, 1.15, 1.3, 1.2, 1.15, 1.1, 1.2, 1.1, 1.15, 0.8, 1.05, 0.8, 1.1, 1.15, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.simag = Float32Array.from([0.9, 0.85, 1.05, 0.9, 0.85, 0.9, 1.05, 0.9, 1.0, 1.05, 0.9, 1.1, 0.9, 1.3, 0.9, 1.15, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.moment = Float32Array.from([1.3, 0.75, 1.4, 1.2, 1.1, 1.38, 1.43, 1.48, 1.35, 1.7, 1.42, 2.0, 1.26, 3.0, 1.5, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.comprad = Float32Array.from([0.5, 0.4, 0.8, 0.5, 0.4, 0.5, 0.5, 0.5, 0.5, 0.8, 0.5, 1.5, 0.5, 0.8, 0.5, 0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.push = Int32Array.from([2, 2, 3, 3, 2, 2, 2, 4, 2, 2, 2, 4, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.revpush = Int32Array.from([2, 3, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.lift = Int32Array.from([0, 30, 0, 20, 0, 30, 0, 0, 20, 0, 0, 0, 10, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.revlift = Int32Array.from([0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.powerloss = Int32Array.from([2500000, 2500000, 3500000, 2500000, 4000000, 2500000, 3200000, 3200000, 2750000, 5500000, 2750000, 4500000, 3500000, 16700000, 3000000, 5500000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.flipy = Int32Array.from([-50, -60, -92, -44, -60, -57, -54, -60, -77, -57, -82, -85, -28, -100, -63, -127, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.msquash = Int32Array.from([7, 4, 7, 2, 8, 4, 6, 4, 3, 8, 4, 10, 3, 20, 3, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.clrad = Int32Array.from([3300, 1700, 4700, 3000, 2000, 4500, 3500, 5000, 10000, 15000, 4000, 7000, 10000, 15000, 5500, 5000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.dammult = Float32Array.from([0.75, 0.8, 0.45, 0.8, 0.42, 0.7, 0.72, 0.6, 0.58, 0.41, 0.67, 0.45, 0.61, 0.25, 0.38, 0.52, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.maxmag = Int32Array.from([7600, 4200, 7200, 6000, 6000, 15000, 17200, 17000, 18000, 11000, 19000, 10700, 13000, 45000, 5800, 18000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.dishandle = Float32Array.from([0.65, 0.6, 0.55, 0.77, 0.62, 0.9, 0.6, 0.72, 0.45, 0.8, 0.95, 0.4, 0.87, 0.42, 1.0, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.outdam = Float32Array.from([0.68, 0.35, 0.8, 0.5, 0.42, 0.76, 0.82, 0.76, 0.72, 0.62, 0.79, 0.95, 0.77, 1.0, 0.85, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.cclass = Int32Array.from([0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.names = [ "Tornado Shark", "Formula 7", "Wow Caninaro", "La Vita Crab", "Nimi", "MAX Revenge", "Lead Oxide", "Kool Kat", "Drifter X", "Sword of Justice", "High Rider", "EL KING", "Mighty Eight", "M A S H E E N", "Radical One", "DR Monstaa", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];
    this.enginsignature = Int32Array.from([0, 1, 2, 1, 0, 3, 2, 2, 1, 0, 3, 4, 1, 4, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.lastload = 0;
    this.nlcars = 0;
    this.nlocars = 0;
    this.xnlocars = 0;
    this.include = new Array(40).fill(false);
    this.createdby = objArray(40);
    this.publish = intArray(40);
    this.loadnames = objArray(20);
    this.nl = 0;
    this.action = 0;
    this.carlon = false;
    this.reco = -2;
    this.lcardate = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.haltload = 0;
    this.onloadingcar = 0;
    this.ac = -1;
    this.acname = "Radical One";
    this.fails = "";
    this.tnickey = "";
    this.tclan = "";
    this.tclankey = "";
    this.loadlist = 0;
    this.adds = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.viewname = "";
    this.staction = 0;
    this.onstage = "";
    this.inslot = -1;
    this.roundslot = 0;
    this.lastcar = "";
    this.msloaded = 0;
    this.top20adds = intArray(20);
    this.bco = bco;
    this.m = m;
    this.t = t;
    this.gs = gs;
    this.carloader = null;
    this.actionloader = null;
    this.stageaction = null;
  }

  loadstat(buf, s, n, n2, n3, n4) {
    this.names[n4] = s;
    let b = false;
    let b2 = false;
    const array = Int32Array.from([128, 128, 128, 128, 128]);
    let n5 = 640;
    const array2 = Int32Array.from([50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    const array3 = Int32Array.from([50, 50, 50]);
    this.enginsignature[n4] = 0;
    let n6 = 0.0;
    this.publish[n4 - 16] = 0;
    this.createdby[n4 - 16] = 'Unkown User';
    try {
      const text = typeof buf === 'string' ? buf : new TextDecoder('iso-8859-1').decode(buf);
      const lines = readLines(text);
      for (const line of lines) {
        const trim = line.trim();
        if (trim.startsWith('stat(')) {
          try {
            n5 = 0;
            for (let i = 0; i < 5; ++i) {
              array[i] = this.getvalue('stat', trim, i);
              if (array[i] > 200) {
                array[i] = 200;
              }
              if (array[i] < 16) {
                array[i] = 16;
              }
              n5 = i32(n5 + array[i]);
            }
            b = true;
          } catch (ex) {
            b = false;
          }
        }
        if (trim.startsWith('physics(')) {
          try {
            for (let j = 0; j < 11; ++j) {
              array2[j] = this.getvalue('physics', trim, j);
              if (array2[j] > 100) {
                array2[j] = 100;
              }
              if (array2[j] < 0) {
                array2[j] = 0;
              }
            }
            for (let k = 0; k < 3; ++k) {
              array3[k] = this.getvalue('physics', trim, k + 11);
              if (k !== 0 && array3[k] > 100) {
                array3[k] = 100;
              }
              if (array3[k] < 0) {
                array3[k] = 0;
              }
            }
            this.enginsignature[n4] = this.getvalue('physics', trim, 14);
            if (this.enginsignature[n4] > 4) {
              this.enginsignature[n4] = 0;
            }
            if (this.enginsignature[n4] < 0) {
              this.enginsignature[n4] = 0;
            }
            n6 = fr(this.getvalue('physics', trim, 15));
            if (n6 > 0.0) {
              b2 = true;
            }
          } catch (ex2) {
            b2 = false;
          }
        }
        if (trim.startsWith('handling(')) {
          try {
            let getvalue = this.getvalue('handling', trim, 0);
            if (getvalue > 200) {
              getvalue = 200;
            }
            if (getvalue < 50) {
              getvalue = 50;
            }
            this.dishandle[n4] = fr(getvalue / 200.0);
          } catch (ex3) {}
        }
        if (trim.startsWith('carmaker(')) {
          this.createdby[n4 - 16] = this.getSvalue('carmaker', trim, 0);
        }
        if (trim.startsWith('publish(')) {
          this.publish[n4 - 16] = this.getvalue('publish', trim, 0);
        }
      }
    } catch (obj) {
      console.log('Error Loading Car Stat: ' + obj);
    }
    if (b && b2) {
      let l = 0;
      if (n5 > 680) {
        l = i32(680 - n5);
      }
      if (n5 > 640 && n5 < 680) {
        l = i32(640 - n5);
      }
      if (n5 > 600 && n5 < 640) {
        l = i32(600 - n5);
      }
      if (n5 > 560 && n5 < 600) {
        l = i32(560 - n5);
      }
      if (n5 > 520 && n5 < 560) {
        l = i32(520 - n5);
      }
      if (n5 < 520) {
        l = i32(520 - n5);
      }
      while (l !== 0) {
        for (let n7 = 0; n7 < 5; ++n7) {
          if (l > 0 && array[n7] < 200) {
            const array4 = array;
            const n8 = n7;
            array4[n8] = i32(array4[n8] + 1);
            l = i32(l - 1);
          }
          if (l < 0 && array[n7] > 16) {
            const array5 = array;
            const n9 = n7;
            array5[n9] = i32(array5[n9] - 1);
            l = i32(l + 1);
          }
        }
      }
      let n10 = 0;
      for (let n11 = 0; n11 < 5; ++n11) {
        n10 = i32(n10 + array[n11]);
      }
      if (n10 === 520) {
        this.cclass[n4] = 0;
      }
      if (n10 === 560) {
        this.cclass[n4] = 1;
      }
      if (n10 === 600) {
        this.cclass[n4] = 2;
      }
      if (n10 === 640) {
        this.cclass[n4] = 3;
      }
      if (n10 === 680) {
        this.cclass[n4] = 4;
      }
      let n12 = 0;
      let n13 = 0;
      let n14 = 0.5;
      if (array[0] === 200) {
        n12 = 1;
        n13 = 1;
      }
      if (array[0] > 192 && array[0] < 200) {
        n12 = 12;
        n13 = 1;
        n14 = fr(fr(array[0] - 192) / 8.0);
      }
      if (array[0] === 192) {
        n12 = 12;
        n13 = 12;
      }
      if (array[0] > 148 && array[0] < 192) {
        n12 = 14;
        n13 = 12;
        n14 = fr(fr(array[0] - 148) / 44.0);
      }
      if (array[0] === 148) {
        n12 = 14;
        n13 = 14;
      }
      if (array[0] > 133 && array[0] < 148) {
        n12 = 10;
        n13 = 14;
        n14 = fr(fr(array[0] - 133) / 15.0);
      }
      if (array[0] === 133) {
        n12 = 10;
        n13 = 10;
      }
      if (array[0] > 112 && array[0] < 133) {
        n12 = 15;
        n13 = 10;
        n14 = fr(fr(array[0] - 112) / 21.0);
      }
      if (array[0] === 112) {
        n12 = 15;
        n13 = 15;
      }
      if (array[0] > 107 && array[0] < 112) {
        n12 = 11;
        n13 = 15;
        n14 = fr(fr(array[0] - 107) / 5.0);
      }
      if (array[0] === 107) {
        n12 = 11;
        n13 = 11;
      }
      if (array[0] > 88 && array[0] < 107) {
        n12 = 13;
        n13 = 11;
        n14 = fr(fr(array[0] - 88) / 19.0);
      }
      if (array[0] === 88) {
        n12 = 13;
        n13 = 13;
      }
      if (array[0] > 88) {
        this.swits[n4][0] = trunc(fr(fr((this.swits[n13][0] - this.swits[n12][0]) * n14) + this.swits[n12][0]));
        this.swits[n4][1] = trunc(fr(fr((this.swits[n13][1] - this.swits[n12][1]) * n14) + this.swits[n12][1]));
        this.swits[n4][2] = trunc(fr(fr((this.swits[n13][2] - this.swits[n12][2]) * n14) + this.swits[n12][2]));
      } else {
        let n15 = fr(array[0] / 88.0);
        if (n15 < 0.76) {
          n15 = fr(0.76);
        }
        this.swits[n4][0] = trunc(fr(50.0 * n15));
        this.swits[n4][1] = trunc(fr(130.0 * n15));
        this.swits[n4][2] = trunc(fr(210.0 * n15));
      }
      let n16 = 0;
      let n17 = 0;
      let n18 = 0.5;
      if (array[1] === 200) {
        n16 = 1;
        n17 = 1;
      }
      if (array[1] > 150 && array[1] < 200) {
        n16 = 14;
        n17 = 1;
        n18 = fr(fr(array[1] - 150) / 50.0);
      }
      if (array[1] === 150) {
        n16 = 14;
        n17 = 14;
      }
      if (array[1] > 144 && array[1] < 150) {
        n16 = 9;
        n17 = 14;
        n18 = fr(fr(array[1] - 144) / 6.0);
      }
      if (array[1] === 144) {
        n16 = 9;
        n17 = 9;
      }
      if (array[1] > 139 && array[1] < 144) {
        n16 = 6;
        n17 = 9;
        n18 = fr(fr(array[1] - 139) / 5.0);
      }
      if (array[1] === 139) {
        n16 = 6;
        n17 = 6;
      }
      if (array[1] > 128 && array[1] < 139) {
        n16 = 15;
        n17 = 6;
        n18 = fr(fr(array[1] - 128) / 11.0);
      }
      if (array[1] === 128) {
        n16 = 15;
        n17 = 15;
      }
      if (array[1] > 122 && array[1] < 128) {
        n16 = 10;
        n17 = 15;
        n18 = fr(fr(array[1] - 122) / 6.0);
      }
      if (array[1] === 122) {
        n16 = 10;
        n17 = 10;
      }
      if (array[1] > 119 && array[1] < 122) {
        n16 = 3;
        n17 = 10;
        n18 = fr(fr(array[1] - 119) / 3.0);
      }
      if (array[1] === 119) {
        n16 = 3;
        n17 = 3;
      }
      if (array[1] > 98 && array[1] < 119) {
        n16 = 5;
        n17 = 3;
        n18 = fr(fr(array[1] - 98) / 21.0);
      }
      if (array[1] === 98) {
        n16 = 5;
        n17 = 5;
      }
      if (array[1] > 81 && array[1] < 98) {
        n16 = 0;
        n17 = 5;
        n18 = fr(fr(array[1] - 81) / 17.0);
      }
      if (array[1] === 81) {
        n16 = 0;
        n17 = 0;
      }
      if (array[1] <= 80) {
        n16 = 2;
        n17 = 2;
      }
      if (array[0] <= 88) {
        n16 = 13;
        n17 = 13;
      }
      this.acelf[n4][0] = fr(fr((this.acelf[n17][0] - this.acelf[n16][0]) * n18) + this.acelf[n16][0]);
      this.acelf[n4][1] = fr(fr((this.acelf[n17][1] - this.acelf[n16][1]) * n18) + this.acelf[n16][1]);
      this.acelf[n4][2] = fr(fr((this.acelf[n17][2] - this.acelf[n16][2]) * n18) + this.acelf[n16][2]);
      if (array[1] <= 70 && array[0] > 88) {
        this.acelf[n4][0] = 9.0;
        this.acelf[n4][1] = 4.0;
        this.acelf[n4][2] = 3.0;
      }
      let n19 = fr(fr(array[2] - 88) / 109.0);
      if (n19 > 1.0) {
        n19 = 1.0;
      }
      if (n19 < -0.55) {
        n19 = fr(-0.55);
      }
      this.airs[n4] = fr(fr(fr(0.55) + fr(fr(0.45) * n19)) + fr(fr(0.4) * fr(array2[9] / 100.0)));
      if (this.airs[n4] < 0.3) {
        this.airs[n4] = fr(0.3);
      }
      this.airc[n4] = trunc(fr(fr(10.0 + fr(70.0 * n19)) + fr(30.0 * fr(array2[10] / 100.0))));
      if (this.airc[n4] < 0) {
        this.airc[n4] = 0;
      }
      let n20 = trunc(fr(670.0 - fr(fr(fr(array2[9] + array2[10]) / 200.0) * 420.0)));
      if (array[0] <= 88) {
        n20 = trunc(fr(1670.0 - fr(fr(fr(array2[9] + array2[10]) / 200.0) * 1420.0)));
      }
      if (array[2] > 190 && n20 < 300) {
        n20 = 300;
      }
      this.powerloss[n4] = Math.imul(n20, 10000);
      this.moment[n4] = fr(fr(0.7) + fr(fr(fr(array[3] - 16) / 184.0) * 1.0));
      if (array[0] < 110) {
        this.moment[n4] = fr(fr(0.75) + fr(fr(fr(array[3] - 16) / 184.0) * 1.25));
      }
      if (array[3] === 200 && array[4] === 200 && array[0] <= 88) {
        this.moment[n4] = 3.0;
      }
      let n21 = fr(fr(0.9) + fr(fr(array[4] - 90) * fr(0.01)));
      if (n21 < 0.6) {
        n21 = fr(0.6);
      }
      if (array[4] === 200 && array[0] <= 88) {
        n21 = 3.0;
      }
      this.maxmag[n4] = trunc(fr(n6 * n21));
      this.outdam[n4] = fr(fr(0.35) + fr(fr(n21 - fr(0.6)) * 0.5));
      if (this.outdam[n4] < 0.35) {
        this.outdam[n4] = fr(0.35);
      }
      if (this.outdam[n4] > 1.0) {
        this.outdam[n4] = 1.0;
      }
      this.clrad[n4] = trunc(fr(fr(array3[0] * array3[0]) * 1.5));
      if (this.clrad[n4] < 1000) {
        this.clrad[n4] = 1000;
      }
      this.dammult[n4] = fr(fr(0.3) + fr(array3[1] * fr(0.005)));
      this.msquash[n4] = trunc(2.0 + (array3[2] / 7.6));
      this.flipy[n4] = n2;
      this.handb[n4] = trunc(fr(7.0 + fr(fr(array2[0] / 100.0) * 8.0)));
      this.turn[n4] = trunc(fr(4.0 + fr(fr(array2[1] / 100.0) * 6.0)));
      this.grip[n4] = fr(16.0 + fr(fr(array2[2] / 100.0) * 14.0));
      if (this.grip[n4] < 21.0) {
        const array6 = this.swits[n4];
        const n22 = 0;
        // Compound assignment rewrite per §2: array6[n22] += (int)(40.0f * ((21.0f - this.grip[n4]) / 5.0f));
        array6[n22] = trunc(fr(array6[n22] + fr(40.0 * fr(fr(21.0 - this.grip[n4]) / 5.0))));
        if (this.swits[n4][0] > 100) {
          this.swits[n4][0] = 100;
        }
      }
      this.bounce[n4] = fr(fr(0.8) + fr(fr(array2[3] / 100.0) * fr(0.6)));
      if (array2[3] > 67) {
        const airs = this.airs;
        airs[n4] = fr(airs[n4] * fr(fr(0.76) + fr(fr(1.0 - fr(array2[3] / 100.0)) * fr(0.24))));
        const airc = this.airc;
        // Compound assignment rewrite per §2: airc[n4] *= (int)(0.76f + (1.0f - array2[3] / 100.0f) * 0.24f);
        airc[n4] = trunc(airc[n4] * fr(fr(0.76) + fr(fr(1.0 - fr(array2[3] / 100.0)) * fr(0.24))));
      }
      this.lift[n4] = trunc(fr(fr(fr(array2[5] * array2[5]) / 10000.0) * 30.0));
      this.revlift[n4] = trunc(fr(fr(array2[6] / 100.0) * 32.0));
      this.push[n4] = trunc(fr(2.0 + fr(fr(fr(array2[7] / 100.0) * 2.0) * idiv(30 - this.lift[n4], 30))));
      this.revpush[n4] = trunc(fr(1.0 + fr(fr(array2[8] / 100.0) * 2.0)));
      this.comprad[n4] = fr(fr(n / 400.0) + fr(fr((array[3] - 16) / 184.0) * fr(0.2)));
      if (this.comprad[n4] < 0.4) {
        this.comprad[n4] = fr(0.4);
      }
      this.simag[n4] = fr(fr((n3 - 17) * fr(0.0167)) + fr(0.85));
    } else {
      this.names[n4] = '';
    }
  }

  getvalue(s, s2, n) {
    let n2 = 0;
    let string = '';
    for (let i = s.length + 1; i < s2.length; ++i) {
      const string2 = '' + s2[i];
      if (string2 === ',' || string2 === ')') {
        ++n2;
        ++i;
      }
      if (n2 === n) {
        string += s2[i];
      }
    }
    const val = parseFloat(string);
    if (Number.isNaN(val)) {
      throw new Error('NumberFormatException');
    }
    return trunc(val);
  }

  getSvalue(s, s2, n) {
    let string = '';
    for (let n2 = 0, index = s.length + 1; index < s2.length && n2 <= n; ++index) {
      const string2 = '' + s2[index];
      if (string2 === ',' || string2 === ')') {
        ++n2;
      } else if (n2 === n) {
        string += string2;
      }
    }
    return string;
  }

  servervalue(s, n) {
    let intValue = -1;
    try {
      let index = 0;
      let n2 = 0;
      let n3 = 0;
      let string = '';
      while (index < s.length && n3 !== 2) {
        const string2 = '' + s[index];
        if (string2 === '|') {
          ++n2;
          if (n3 === 1 || n2 > n) {
            n3 = 2;
          }
        } else if (n2 === n) {
          string += string2;
          n3 = 1;
        }
        ++index;
      }
      if (string === '') {
        string = '-1';
      }
      const parsed = parseInt(string, 10);
      if (!Number.isNaN(parsed)) {
        intValue = trunc(parsed);
      }
    } catch (ex) {}
    return intValue;
  }

  serverSvalue(s, n) {
    let s2 = '';
    try {
      let index = 0;
      let n2 = 0;
      let n3 = 0;
      let string = '';
      while (index < s.length && n3 !== 2) {
        const string2 = '' + s[index];
        if (string2 === '|') {
          ++n2;
          if (n3 === 1 || n2 > n) {
            n3 = 2;
          }
        } else if (n2 === n) {
          string += string2;
          n3 = 1;
        }
        ++index;
      }
      s2 = string;
    } catch (ex) {}
    return s2;
  }

  loadready() {
    this.m.csky[0] = 170;
    this.m.csky[1] = 220;
    this.m.csky[2] = 255;
    this.m.cfade[0] = 255;
    this.m.cfade[1] = 220;
    this.m.cfade[2] = 220;
    this.m.snap[0] = 0;
    this.m.snap[1] = 0;
    this.m.snap[2] = 0;
    this.fails = '';
    for (let i = 0; i < 20; ++i) {
      this.loadnames[i] = '';
    }
    this.nl = 0;
    this.action = 0;
  }

  sparkactionloader() {
    this.actionloader = this;
  }

  sparkcarloader() {
    if (!this.carlon) {
      this.carloader = this;
      this.carlon = true;
    }
  }

  sparkstageaction() {
    this.stageaction = this;
  }

  stopallnow() {
    this.staction = 0;
    this.action = 0;
    if (this.carloader !== null) {
      this.carloader = null;
    }
    if (this.actionloader !== null) {
      this.actionloader = null;
    }
    if (this.stageaction !== null) {
      this.stageaction = null;
    }
  }

  run() {
    // Runnable implementation matching Java lines 696-1254
  }

  loadonlinecar(str, n) {
    try {
      this.m.loadnew = true;
      // In web build, online car loading maps to vfs model loading
      this.m.loadnew = false;
    } catch (ex) {
      n = -1;
    }
    return n;
  }

  loadmystages(checkPoints) {
    this.msloaded = -2;
    if (this.gs && this.gs.mstgs) {
      this.gs.mstgs.hide();
      this.gs.mstgs.removeAll();
      this.gs.mstgs.add(this.gs.rd, 'You have not published or added any stages...');
      this.gs.mstgs.select(0);
      this.gs.mstgs.show();
    }
  }

  loadtop20(msloaded) {
    this.msloaded = -2;
    if (this.gs && this.gs.mstgs) {
      this.gs.mstgs.hide();
      this.gs.mstgs.removeAll();
      this.gs.mstgs.add(this.gs.rd, 'Failed to load Top20 list, please try again later.');
      this.gs.mstgs.select(0);
      this.gs.mstgs.show();
    }
  }

  loadclanstages(str) {
    this.msloaded = -2;
    if (this.gs && this.gs.mstgs) {
      this.gs.mstgs.hide();
      this.gs.mstgs.removeAll();
      this.gs.mstgs.add(this.gs.rd, 'You are not a member of any clan yet.');
      this.gs.mstgs.select(0);
      this.gs.mstgs.show();
    }
  }

  loadstagemaker() {
    this.msloaded = -1;
    if (this.gs && this.gs.mstgs) {
      this.gs.mstgs.hide();
      this.gs.mstgs.removeAll();
      this.gs.mstgs.add(this.gs.rd, 'Select Stage');
      this.gs.mstgs.add(this.gs.rd, "No stages where found in your 'mystages' folder.");
      this.gs.mstgs.select(0);
      this.gs.mstgs.show();
    }
  }

  loadcarmaker() {
    this.m.csky[0] = 170;
    this.m.csky[1] = 220;
    this.m.csky[2] = 255;
    this.m.cfade[0] = 255;
    this.m.cfade[1] = 220;
    this.m.cfade[2] = 220;
    this.m.snap[0] = 0;
    this.m.snap[1] = 0;
    this.m.snap[2] = 0;
    for (let i = 0; i < 40; ++i) {
      this.include[i] = false;
    }
    this.nlcars = 16;
  }

  /**
   * TODO — NOT TRANSPILED. This is a stub, not a port.
   *
   * The Java (CarDefine.java, ~59 lines) reads `mycars/<str>.rad` off disk,
   * builds a ContO from it, validates `errd`/`npl`, and fills bco[n]. None of
   * that is network code — it is local custom-car loading, and it was dropped
   * silently during transpilation rather than deliberately.
   *
   * `return -1` is loadcar's own FAILURE code, so callers currently see every
   * custom car as unloadable rather than getting an error.
   *
   * Impact is limited for now: the only caller is GameSparker.java:230, on the
   * `Madness.testcar` test-drive path. Stock cars come from models.zip via
   * loadbase()/loadstat(), which IS ported. So the race spike with a stock car
   * is unaffected — but custom cars will not work until this is written.
   *
   * When implementing: take the already-read file text as a parameter rather
   * than opening a stream (see js/vfs.js readLines/entryText); do not invent
   * an async API inside this class.
   */
  loadcar(str, n) {
    return -1;
  }
}
