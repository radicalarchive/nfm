// The handful of Madness statics the race path reads. The real Madness class
// is applet/fullscreen/launcher plumbing that the port replaces wholesale.
export const Madness = {
  anti: 1,          // antialiasing hint; the WebGL shim ignores it
  fullscreen: false,
  testdrive: 0,
  testcar: '',
};
