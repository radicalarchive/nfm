// The AWT text-widget seam, headless. These are the semantics the transpiled
// chunks depend on -- insertText/replaceText are AWT's, not the DOM's, and
// getting either backwards corrupts the car source silently.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TextArea, TextField } from './widgets.js';

test('insertText inserts at a character position', () => {
  const t = new TextArea();
  t.setText('p(10,20,30)');
  t.insertText('c(1,2,3)\n', 0);
  assert.equal(t.getText(), 'c(1,2,3)\np(10,20,30)');
  t.insertText('!', 8);
  assert.equal(t.getText(), 'c(1,2,3)!\np(10,20,30)');
});

test('replaceText replaces [start, end)', () => {
  const t = new TextArea();
  t.setText('ScaleX(100)');
  t.replaceText('105', 7, 10);
  assert.equal(t.getText(), 'ScaleX(105)');
});

test('selection round-trips and getSelectedText reads through it', () => {
  const t = new TextArea();
  t.setText('<p>\np(1,2,3)\n</p>');
  t.select(4, 12);
  assert.equal(t.getSelectionStart(), 4);
  assert.equal(t.getSelectionEnd(), 12);
  assert.equal(t.getSelectedText(), 'p(1,2,3)');
});

test('show/hide drive isShowing, which the key handler branches on', () => {
  const t = new TextField();
  assert.equal(t.isShowing(), true);
  t.hide();
  assert.equal(t.isShowing(), false);
  t.show();
  assert.equal(t.isShowing(), true);
});

test('a TextField keeps the text it was constructed with', () => {
  assert.equal(new TextField('145').getText(), '145');
});

test('setText(null) is the empty string, not "null"', () => {
  const t = new TextArea();
  t.setText(null);
  assert.equal(t.getText(), '');
});
