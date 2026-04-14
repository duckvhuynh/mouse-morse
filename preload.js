const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal, locked-down API surface to the renderer process
contextBridge.exposeInMainWorld('morseAPI', {
  platform:     process.platform,

  // Send a decoded character to the OS-focused window
  typeChar:     (char) => ipcRenderer.send('morse-type-char', String(char).slice(0, 8)),

  // Request a mode toggle from the renderer (e.g. UI button)
  toggleMode:   ()     => ipcRenderer.send('toggle-morse-mode'),

  // Register a callback invoked whenever the main process changes mode
  onModeChange: (cb)   => {
    if (typeof cb !== 'function') return;
    ipcRenderer.on('morse-mode-changed', (_, active) => cb(active));
  },
});
