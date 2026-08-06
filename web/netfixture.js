// A car's worth of plausible state, for the netplay tests.
//
// Test-only, and shared rather than duplicated: both the codec and the session
// tests need a car to serialise, and two copies of a fixture drift until one
// of them stops exercising the case it was written for.
//
// The values are deliberately awkward — coordinates past 32k (the stage runs
// to +/-83000), a negative `power`, a mixed set of flags — so that a field
// dropped from the wire format shows up as a wrong number rather than as a
// zero that happened to match.
export function fakeCar(over = {}) {
  const mad = {
    newcar: true, mtouch: false, wtouch: true, pushed: false, gtouch: true,
    pl: false, pr: true, pd: false, pu: true, dest: false,
    speed: 12.34, power: -3.21, mxz: 91, pzy: -12, pxy: 7, txz: 355,
    loop: 2, pcleared: 3, clear: 1, nlaps: 4, hitmag: 0,
    cn: 1, cd: { maxmag: [7600, 4200, 7200] },
    ...over.mad,
  };
  const contO = {
    x: -41234, y: 903, z: 82777, xz: 271, xy: -14, zy: 33, wxz: 180,
    ...over.contO,
  };
  const control = {
    left: true, right: false, up: true, down: false, handb: true,
    ...over.control,
  };
  return { mad, contO, control };
}
