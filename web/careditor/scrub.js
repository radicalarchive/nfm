// A number you drag, or click to type into.
//
// Every numeric control in the editor is one of these. Two modes, told apart by
// movement rather than by timing:
//
//   DRAG   moving past the click threshold starts a scrub. The cursor becomes
//          ew-resize, the value updates in place as you move, and onChange
//          fires once, on release.
//   EDIT   a pointer-up with no movement swaps the readout for a real <input>
//          with its text selected. Enter or blur commits, Escape restores.
//
// Because the threshold decides, a click can never open the editor at the end
// of a scrub and a drag can never commit a half-typed value.
//
// Precision: dragStep per pixel normally, altDragStep per pixel with Shift
// held. The defaults are `step / 5` and `step` -- five pixels per unit for
// ordinary work, one pixel per unit when you want to cover ground. The anchor
// re-locks the instant Shift changes state, so switching precision changes the
// RATE from that point and never jumps the value.

const CLICK_SLOP = 3;                     // px of travel that still counts as a click

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

/** Round to the step's own precision, so 0.30000000000000004 never shows up. */
function quantise(v, step, min) {
  const n = Math.round((v - min) / step) * step + min;
  const dp = (String(step).split('.')[1] || '').length;
  return dp ? Number(n.toFixed(dp)) : n;
}

/**
 * @param {object} opts
 * @param {() => number} opts.read      current value, straight from the model
 * @param {(v:number)=>void} opts.onInput   during a drag, and on commit
 * @param {(v:number)=>void} [opts.onChange] once, on release or commit
 * @returns {HTMLElement} the trigger, with a `sync()` to re-read the model
 */
export function scrubber({
  read, onInput, onChange, min = -Infinity, max = Infinity, step = 1,
  dragStep = step / 5, altDragStep = step, format = String, label, title,
}) {
  const host = document.createElement('span');
  host.className = 'scrub';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'scrub-trigger';
  // A button, so it is in the tab order and reachable without a mouse; the
  // arrow keys below give it the same reach a slider has.
  trigger.setAttribute('role', 'spinbutton');
  if (label) trigger.setAttribute('aria-label', label);
  if (title) trigger.title = title;

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.className = 'scrub-input';
  input.hidden = true;
  if (label) input.setAttribute('aria-label', label);

  host.append(trigger, input);

  const show = (v) => {
    trigger.textContent = format(v);
    trigger.setAttribute('aria-valuenow', String(v));
    if (Number.isFinite(min)) trigger.setAttribute('aria-valuemin', String(min));
    if (Number.isFinite(max)) trigger.setAttribute('aria-valuemax', String(max));
  };

  const commit = (v, final) => {
    const next = clamp(quantise(v, step, Number.isFinite(min) ? min : 0), min, max);
    show(next);
    onInput(next);
    if (final && onChange) onChange(next);
    return next;
  };

  // ---- drag ----------------------------------------------------------------

  let dragging = false, moved = false;
  let anchorX = 0, anchorValue = 0, shifted = false, live = 0;

  const rate = () => (shifted ? altDragStep : dragStep);

  trigger.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    shifted = e.shiftKey;
    anchorX = e.clientX;
    anchorValue = live = read();
    trigger.setPointerCapture(e.pointerId);
  });

  trigger.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    // Re-anchor on a precision change: the pointer keeps its position and only
    // the rate changes, so Shift never yanks the value.
    if (e.shiftKey !== shifted) {
      shifted = e.shiftKey;
      anchorX = e.clientX;
      anchorValue = live;
    }
    const dx = e.clientX - anchorX;
    if (!moved && Math.abs(e.clientX - anchorX) <= CLICK_SLOP) return;
    moved = true;
    host.classList.add('scrubbing');
    live = commit(anchorValue + dx * rate(), false);
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    host.classList.remove('scrubbing');
    if (moved) {
      if (onChange) onChange(live);
    } else {
      edit();                            // a click, not a drag
    }
    if (e && trigger.hasPointerCapture?.(e.pointerId)) trigger.releasePointerCapture(e.pointerId);
  };
  trigger.addEventListener('pointerup', endDrag);
  trigger.addEventListener('pointercancel', endDrag);

  // Shift pressed or released mid-drag, without the pointer moving.
  const rekey = (e) => {
    if (!dragging || e.shiftKey === shifted) return;
    shifted = e.shiftKey;
    anchorValue = live;
    // anchorX stays where the pointer is; the next move re-measures from it.
  };
  window.addEventListener('keydown', rekey);
  window.addEventListener('keyup', rekey);

  // ---- edit ----------------------------------------------------------------

  function edit() {
    input.value = String(read());
    trigger.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  }

  function close(save) {
    if (input.hidden) return;
    const v = Number(input.value);
    input.hidden = true;
    trigger.hidden = false;
    if (save && input.value.trim() !== '' && Number.isFinite(v)) commit(v, true);
    else show(read());
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); close(true); trigger.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(false); trigger.focus(); }
  });
  input.addEventListener('blur', () => close(true));

  // ---- keyboard on the trigger --------------------------------------------

  trigger.addEventListener('keydown', (e) => {
    const by = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (by !== undefined) {
      e.preventDefault();
      commit(read() + by * step * (e.shiftKey ? 10 : 1), true);
      return;
    }
    // Typing a digit goes straight into edit mode, the way a spinbutton should.
    if (e.key === 'Enter' || /^[-0-9.]$/.test(e.key)) {
      e.preventDefault();
      edit();
      if (e.key !== 'Enter') { input.value = e.key; input.setSelectionRange(1, 1); }
    }
  });

  host.sync = () => { if (!dragging && input.hidden) show(read()); };
  host.sync();
  return host;
}
