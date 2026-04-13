const { contextBridge } = require('electron');

// Expose a minimal API surface to the renderer process
contextBridge.exposeInMainWorld('morseAPI', {
  platform: process.platform,
});
