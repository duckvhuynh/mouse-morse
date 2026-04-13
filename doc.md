# 🟡 Morse Mouse — Desktop App

A minimal, interactive desktop application that allows users to input Morse code using their mouse.
Click and hold to generate signals, and see real-time decoded text output.

---

## ✨ Concept

**Morse Mouse** transforms your mouse into a Morse code input device:

* Short click → `.` (dot)
* Long click → `-` (dash)
* Pause → separates letters and words

The app listens to mouse interactions and converts them into readable text in real time.

---

## 🎯 Features

### Core Features

* 🖱️ Mouse-based Morse input (click & hold)
* ⏱️ Duration detection (dot vs dash)
* 🔤 Real-time Morse → Text decoding
* 📜 Live display of:

  * Raw Morse sequence
  * Decoded text output

### UX Enhancements

* 🔊 Audio feedback (short beep / long beep)
* 🌙 Dark mode UI (terminal / hacker style)
* ✨ Visual feedback (click ripple or waveform)

---

## 🧠 How It Works

### Input Detection

| Action      | Behavior    |
| ----------- | ----------- |
| Short click | Dot (`.`)   |
| Long click  | Dash (`-`)  |
| Short pause | Next letter |
| Long pause  | Next word   |

### Timing Thresholds (configurable)

```js
DOT_THRESHOLD = 200ms
LETTER_PAUSE = 300ms
WORD_PAUSE = 700ms
```

---

## 🏗️ Tech Stack

* **Electron** — Desktop app framework
* **JavaScript / TypeScript** — Core logic
* **Web Audio API** — Sound generation
* **HTML/CSS** — UI rendering

---

## 📁 Project Structure

```
morse-mouse/
├── main.js            # Electron main process
├── preload.js         # Secure bridge
├── renderer/
│   ├── index.html
│   ├── app.js         # Core logic
│   ├── morse.js       # Encoding/decoding logic
│   └── styles.css
├── assets/
│   └── sounds/
└── package.json
```

---

## ⚙️ Core Logic

### Mouse Input Handling

```js
let pressStart = 0;

window.addEventListener('mousedown', () => {
  pressStart = Date.now();
});

window.addEventListener('mouseup', () => {
  const duration = Date.now() - pressStart;

  if (duration < DOT_THRESHOLD) {
    addSignal('.');
  } else {
    addSignal('-');
  }
});
```

---

### Pause Detection

```js
let lastInputTime = Date.now();

setInterval(() => {
  const now = Date.now();
  const diff = now - lastInputTime;

  if (diff > WORD_PAUSE) {
    addSpace(); // new word
  } else if (diff > LETTER_PAUSE) {
    endLetter();
  }
}, 50);
```

---

### Morse Decoder

```js
const MORSE_MAP = {
  ".-": "A",
  "-...": "B",
  "-.-.": "C",
  // ...
};

function decode(morse) {
  return morse
    .split(" ")
    .map(code => MORSE_MAP[code] || "?")
    .join("");
}
```

---

## 🔊 Audio Feedback

Use Web Audio API to simulate Morse beeps:

```js
function playBeep(duration) {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();

  oscillator.connect(ctx.destination);
  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
  }, duration);
}
```

* Dot → short beep (~100ms)
* Dash → long beep (~300ms)

---

## 🎨 UI Ideas

* Fullscreen minimal interface
* Center display:

  * Current Morse input
  * Decoded text output
* Cursor effect:

  * Ripple animation on click
* Background:

  * Dark + subtle grid or waveform

---

## 🚀 Getting Started

### Install

```bash
npm install
```

### Run

```bash
npm start
```

### Build

```bash
npm run build
```

---

## 🧪 Future Enhancements

### 🎮 Training Mode

* Show text → user inputs Morse
* Score based on accuracy & speed

### 🧑‍🤝‍🧑 Multiplayer

* Real-time Morse chat using WebSocket

### 🗺️ Map Integration

* Drop Morse messages on a map
* Nearby users can decode them

### 🔐 Secret Message Sharing

* Generate encoded messages
* Share link → receiver must decode manually

---

## 💡 Vision

Morse Mouse is not just a tool — it's an experience.
A playful blend of retro communication and modern interaction design.

---

## 📜 License

MIT
