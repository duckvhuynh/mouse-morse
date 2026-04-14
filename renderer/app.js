import { decodeMorse, decodeMorseToken } from './morse.js';

// ─── Timing constants (ms) ──────────────────────────────────────────────────
const DOT_THRESHOLD  = 200;   // shorter = dot, longer = dash
const LETTER_PAUSE   = 600;   // silence before new letter is committed
const WORD_PAUSE     = 1400;  // silence before space is added

// ─── State ───────────────────────────────────────────────────────────────────
let pressStart    = 0;
let currentToken  = '';   // signals being built for the current letter, e.g. ".-"
let morseWords    = [''];  // array of word strings, each word = ".- -... -.-."-style
let lastInputTime = 0;
let letterCommitted = false;
let wordCommitted   = false;
let audioCtx = null;
let morseMode = false;   // true while Morse PC Input is active

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const inputZone      = document.getElementById('input-zone');
const morseDisplay   = document.getElementById('morse-display');
const decodedDisplay = document.getElementById('decoded-display');
const statusDot      = document.getElementById('status-dot');
const clearBtn        = document.getElementById('clear-btn');
const modeBtn         = document.getElementById('mode-btn');
const rippleContainer = document.getElementById('ripple-container');

// ─── Audio ───────────────────────────────────────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBeep(durationMs, frequency = 600) {
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000 + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.1);
  } catch (_) { /* audio not critical */ }
}

// ─── Ripple effect ────────────────────────────────────────────────────────────
function spawnRipple(x, y, isLong) {
  const el = document.createElement('div');
  el.className = 'ripple' + (isLong ? ' ripple-long' : '');
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  rippleContainer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ─── Display helpers ─────────────────────────────────────────────────────────
function buildMorseString() {
  // Each word = array of letter tokens
  const wordStrings = morseWords.map((w, wi) => {
    let s = w;
    // Append the current in-progress token for the last word
    if (wi === morseWords.length - 1 && currentToken) {
      s = s ? s + ' ' + currentToken : currentToken;
    }
    return s;
  });
  return wordStrings.filter(w => w.length > 0).join(' / ');
}

function updateDisplay() {
  const morseStr = buildMorseString();
  morseDisplay.textContent = morseStr;

  // For decoded, commit current token tentatively
  const tentativeWords = morseWords.map((w, wi) => {
    if (wi === morseWords.length - 1 && currentToken) {
      return w ? w + ' ' + currentToken : currentToken;
    }
    return w;
  });
  const decoded = decodeMorse(tentativeWords.filter(w => w.length > 0).join(' / '));
  decodedDisplay.textContent = decoded || '—';
}

// ─── Signal logic ─────────────────────────────────────────────────────────────
function addSignal(signal) {
  letterCommitted = false;
  wordCommitted   = false;
  currentToken += signal;
  updateDisplay();
}

function commitLetter() {
  if (letterCommitted || !currentToken) return;
  letterCommitted = true;
  const decodedChar = decodeMorseToken(currentToken);
  const lastWord    = morseWords[morseWords.length - 1];
  morseWords[morseWords.length - 1] = lastWord ? lastWord + ' ' + currentToken : currentToken;
  currentToken = '';
  // Relay decoded character to the OS when Morse PC Input is active
  if (morseMode && decodedChar && decodedChar !== '?' && window.morseAPI?.typeChar) {
    window.morseAPI.typeChar(decodedChar);
  }
  updateDisplay();
}

function commitWord() {
  if (wordCommitted) return;
  commitLetter();
  wordCommitted = true;
  // Only add new word slot if the last word isn't already empty
  if (morseWords[morseWords.length - 1].trim() !== '') {
    morseWords.push('');
    // Type a space between words when Morse PC Input is active
    if (morseMode && window.morseAPI?.typeChar) {
      window.morseAPI.typeChar(' ');
    }
  }
  updateDisplay();
}

function clearAll() {
  currentToken    = '';
  morseWords      = [''];
  letterCommitted = false;
  wordCommitted   = false;
  lastInputTime   = 0;
  updateDisplay();
}

// ─── Interval – pause detection ───────────────────────────────────────────────
setInterval(() => {
  if (!lastInputTime) return;
  const diff = Date.now() - lastInputTime;

  if (diff > WORD_PAUSE && !wordCommitted) {
    commitWord();
  } else if (diff > LETTER_PAUSE && !letterCommitted) {
    commitLetter();
  }
}, 50);

// ─── Mouse / touch input ──────────────────────────────────────────────────────
function onPressStart(e) {
  pressStart = Date.now();
  inputZone.classList.add('pressing');
  statusDot.classList.add('active');
}

function onPressEnd(e) {
  const duration = Date.now() - pressStart;
  const isLong   = duration >= DOT_THRESHOLD;
  const signal   = isLong ? '-' : '.';

  inputZone.classList.remove('pressing');
  statusDot.classList.remove('active');

  // Spawn ripple at pointer position
  const rect = inputZone.getBoundingClientRect();
  const cx   = (e.clientX ?? rect.left + rect.width / 2)  - rect.left;
  const cy   = (e.clientY ?? rect.top  + rect.height / 2) - rect.top;
  spawnRipple(cx, cy, isLong);

  // Beep
  playBeep(isLong ? 280 : 90);

  // Add signal
  addSignal(signal);
  lastInputTime = Date.now();
}

inputZone.addEventListener('mousedown',  onPressStart);
inputZone.addEventListener('mouseup',    onPressEnd);
inputZone.addEventListener('touchstart', e => { e.preventDefault(); onPressStart(e.touches[0]); }, { passive: false });
inputZone.addEventListener('touchend',   e => { e.preventDefault(); onPressEnd(e.changedTouches[0]); }, { passive: false });

// Prevent context menu from appearing on right-click / long-press
inputZone.addEventListener('contextmenu', e => e.preventDefault());

// ─── Clear button ─────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', clearAll);
// ─── Morse PC Input mode ──────────────────────────────────────────────────
modeBtn?.addEventListener('click', () => window.morseAPI?.toggleMode());

if (window.morseAPI?.onModeChange) {
  window.morseAPI.onModeChange((active) => {
    morseMode = active;
    document.body.classList.toggle('morse-mode', active);
    if (modeBtn) {
      modeBtn.classList.toggle('active', active);
      modeBtn.textContent = active ? '\u2328 ON' : '\u2328 PC Input';
      modeBtn.title = active
        ? 'Morse PC Input is ON — press F8 to turn off'
        : 'Enable Morse PC Input — F8';
    }
  });
}
// ─── Initial state ────────────────────────────────────────────────────────────
updateDisplay();
