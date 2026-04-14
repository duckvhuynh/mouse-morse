const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// ─── Morse PC Input state ─────────────────────────────────────────────────────
let morseMode = false;
let psTyper   = null;

/**
 * Ensure a persistent PowerShell process is running.
 * We load the assembly once at start-up so per-keystroke latency is minimal.
 */
function ensureTyper() {
  if (psTyper && !psTyper.killed) return;
  psTyper = spawn('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-sta', '-Command', '-',
  ], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  psTyper.stdin.write('Add-Type -AssemblyName System.Windows.Forms\n');
  psTyper.on('error', () => { psTyper = null; });
  psTyper.on('exit',  () => { psTyper = null; });
}

/**
 * Inject `char` into whatever window currently has OS keyboard focus.
 * Uses SendKeys so alphanumeric text, punctuation, and space all work.
 */
function typeChar(char) {
  if (process.platform !== 'win32') return;
  ensureTyper();
  // 1) Escape SendKeys special chars: + ^ % ~ ( ) [ ] { }
  const skEscaped = char.replace(/[+^%~()[\]{}]/g, '{$&}');
  // 2) Escape PowerShell single-quoted string (only ' needs doubling)
  const psEscaped = skEscaped.replace(/'/g, "''");
  try {
    psTyper.stdin.write(`[System.Windows.Forms.SendKeys]::SendWait('${psEscaped}')\n`);
  } catch (_) { psTyper = null; }
}

/** Activate or deactivate Morse PC Input mode on the main window. */
function setMorseMode(win, active) {
  morseMode = active;
  if (active) {
    ensureTyper();                           // pre-warm – avoids lag on first letter
    win.setFocusable(false);                 // clicks on overlay won't steal focus
    win.setAlwaysOnTop(true, 'screen-saver');
  } else {
    win.setFocusable(true);
    win.setAlwaysOnTop(false);
    win.focus();
  }
  win.webContents.send('morse-mode-changed', active);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: '#0d0d0d',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // ── F8 global shortcut: toggle Morse PC Input from anywhere ──────────────
  globalShortcut.register('F8', () => setMorseMode(win, !morseMode));

  // ── IPC: renderer UI button pressed ──────────────────────────────────────
  ipcMain.on('toggle-morse-mode', () => setMorseMode(win, !morseMode));

  // ── IPC: renderer sends a decoded letter/space to inject into the OS ─────
  ipcMain.on('morse-type-char', (_, char) => {
    if (morseMode) typeChar(char);
  });

  win.on('closed', () => {
    globalShortcut.unregisterAll();
    if (psTyper) { try { psTyper.stdin.end(); } catch (_) {} psTyper = null; }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (psTyper) { try { psTyper.stdin.end(); } catch (_) {} psTyper = null; }
  if (process.platform !== 'darwin') app.quit();
});
