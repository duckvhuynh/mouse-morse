# Morse Mouse

A minimal Electron desktop app that turns your mouse into a Morse code input device. Tap for dots, hold for dashes — letters and words decode in real time.

---

## Features

- **Mouse-driven input** — short click for dot, held click for dash
- **PC input mode** — press F8 to route decoded characters directly into any focused window via system-level key injection
- **Real-time decoding** — Morse symbols decode as you type
- **Audio feedback** — distinct beep tones for dots and dashes
- **Visual ripple effects** — click animations on the input zone
- **Auto letter/word commit** — silence thresholds automatically commit letters and insert word spaces
- **Built-in Morse reference** — always-visible A–Z and 0–9 cheat sheet
- **Custom titlebar** — frameless window with minimize, maximize, and close controls

---

## How It Works

| Action | Result |
|---|---|
| Short click (< 200 ms) | Dot |
| Hold click (>= 200 ms) | Dash |
| 600 ms silence | Commit current letter |
| 1400 ms silence | Insert word space |
| F8 (global) | Toggle PC input mode on/off |
| Clear button | Reset all input and output |

### Timing

Thresholds are defined at the top of `renderer/app.js`:

```js
const DOT_THRESHOLD = 200   // ms — shorter = dot, longer = dash
const LETTER_PAUSE  = 600   // ms — silence before letter is committed
const WORD_PAUSE    = 1400  // ms — silence before a space is inserted
```

---

## PC Input Mode

When PC input mode is active (F8 or the button in the titlebar), the overlay becomes click-through so keyboard focus stays in your target application. Each decoded character is injected into the focused window using PowerShell `SendKeys` on Windows.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install

```bash
git clone https://github.com/duckvhuynh/mouse-morse.git
cd mouse-morse
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

Output is placed in the `dist/` folder.

---

## Project Structure

```
mouse-morse/
├── main.js          # Electron main process, window management, IPC, F8 shortcut
├── preload.js       # Context bridge — exposes morseAPI to the renderer
├── package.json
└── renderer/
    ├── index.html   # UI shell
    ├── app.js       # Input handling, pause detection, audio, ripple effects
    ├── morse.js     # Morse encode/decode (A–Z, 0–9, punctuation)
    └── styles.css   # Dark terminal theme
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Electron](https://www.electronjs.org/) |
| Core logic | Vanilla JavaScript (ES Modules) |
| Key injection | PowerShell `System.Windows.Forms.SendKeys` |
| Audio | Web Audio API |
| Build | electron-builder |

---

## License

MIT
