const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printHtml: (params) => ipcRenderer.invoke("print-html", params),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  isElectron: true,
});
