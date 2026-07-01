const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readState: () => ipcRenderer.invoke("read-state"),
  writeState: (data) => ipcRenderer.invoke("write-state", data),
});
