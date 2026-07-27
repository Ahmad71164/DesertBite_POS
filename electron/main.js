const { app, BrowserWindow, Menu, shell, dialog, utilityProcess, ipcMain } = require("electron");
const http = require("http");
const path = require("path");
const fs = require("fs");

let mainWindow = null;
let apiProcess = null;

// ─── Single Instance Lock ─────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ─── Resolve Paths ────────────────────────────────────────────────────────────
const isDev = !app.isPackaged;
const ROOT = isDev
  ? path.join(__dirname, "..")
  : path.join(process.resourcesPath, "app");

const API_CJS   = path.join(ROOT, "apps", "api", "dist", "server.cjs");
const API_JS    = path.join(ROOT, "apps", "api", "dist", "server.js");
const API_ENTRY = fs.existsSync(API_CJS) ? API_CJS : API_JS;
const DB_PATH   = path.join(ROOT, "apps", "api", "prisma", "restaurant.db");

// ─── Wait for HTTP server ─────────────────────────────────────────────────────
function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) return resolve(true);
        retry();
      }).on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start < timeoutMs) setTimeout(check, 500);
      else resolve(false);
    };
    check();
  });
}

// ─── Start Bundled API Server via UtilityProcess ──────────────────────────────
function startApiServer() {
  http.get("http://localhost:5000/api/health", (res) => {
    if (res.statusCode < 500) {
      console.log("[Electron] API server already running on port 5000.");
      return;
    }
    spawnApiProcess();
  }).on("error", () => {
    spawnApiProcess();
  });
}

function spawnApiProcess() {
  if (!fs.existsSync(API_ENTRY)) {
    console.log("[Electron] API entry not found at:", API_ENTRY, "— skipping background server spawn");
    return;
  }

  console.log("[Electron] Spawning utilityProcess for API server:", API_ENTRY);

  try {
    const formattedDbPath = DB_PATH.replace(/\\/g, "/");
    apiProcess = utilityProcess.fork(API_ENTRY, [], {
      cwd: path.join(ROOT, "apps", "api"),
      env: {
        ...process.env,
        PORT: "5000",
        NODE_ENV: "production",
        DATABASE_URL: `file:${formattedDbPath}`,
      },
      stdio: "pipe",
    });

    if (apiProcess.stdout) {
      apiProcess.stdout.on("data", (d) => console.log("[API]", d.toString().trim()));
    }
    if (apiProcess.stderr) {
      apiProcess.stderr.on("data", (d) => console.error("[API ERR]", d.toString().trim()));
    }
    apiProcess.on("exit", (code) => console.log("[API] utilityProcess exited with code:", code));
  } catch (err) {
    console.error("[Electron] Failed to fork utilityProcess:", err);
  }
}

// ─── Create Main Window ───────────────────────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: "Desert Bite — POS & ERP",
    backgroundColor: "#0d0f12",
    autoHideMenuBar: false,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // ── Application Menu
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: () => mainWindow.reload() },
        { label: "Toggle Full Screen", accelerator: "F11", click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: "separator" },
        { label: "Exit", accelerator: "Alt+F4", role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "zoomIn", accelerator: "CmdOrCtrl+=" },
        { role: "zoomOut", accelerator: "CmdOrCtrl-", },
        { role: "resetZoom", accelerator: "CmdOrCtrl+0" },
        { type: "separator" },
        { label: "Developer Tools", accelerator: "F12", click: () => mainWindow.webContents.toggleDevTools() },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "API Health", click: () => shell.openExternal("http://localhost:5000/api/health") },
        {
          label: "About Desert Bite",
          click: () => dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "Desert Bite POS & ERP",
            message: "Desert Bite — Restaurant Management System",
            detail: "v1.0.0\n\nFull-featured POS Terminal, Kitchen Display (KDS),\nCustomer CRM & Financial Analytics.",
          }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // ── Splash Loader
  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background:#0d0f12; color:#f59e0b; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; }
        .spinner { border: 4px solid #1f293d; border-top: 4px solid #f59e0b; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        h2 { font-size: 20px; margin: 0; letter-spacing: 0.5px; }
        p { color: #64748b; font-size: 13px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <h2>Desert Bite POS & ERP</h2>
      <p>Starting background server...</p>
    </body>
    </html>
  `;
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(splashHTML));

  // ── Wait for API
  const apiReady = await waitForServer("http://localhost:5000/api/health");

  if (apiReady) {
    console.log("[Electron] API server is ready, loading application UI...");
    mainWindow.loadURL("http://localhost:5000");
  } else {
    // Fallback to Vite dev server if running
    const devReady = await waitForServer("http://localhost:5173");
    if (devReady) {
      mainWindow.loadURL("http://localhost:5173");
    } else {
      const errHTML = `<body style="background:#0d0f12;color:#ef4444;font-family:sans-serif;padding:40px;"><h2>❌ Error Starting API Server</h2><p>Desert Bite backend could not be reached on port 5000.</p><p>Press <b>F12</b> to open Developer Tools or restart the app.</p></body>`;
      mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(errHTML));
    }
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ─── IPC: Printer List ──────────────────────────────────────────────────────
ipcMain.handle("get-printers", async () => {
  if (!mainWindow) return [];
  try {
    return await mainWindow.webContents.getPrintersAsync();
  } catch (err) {
    console.error("[Printers] Error getting printer list:", err);
    return [];
  }
});

// ─── IPC: Receipt Printing ───────────────────────────────────────────────────
ipcMain.handle("print-html", async (event, params) => {
  const html = typeof params === "string" ? params : params.html;
  const printerName = typeof params === "object" ? params.printerName : undefined;
  const silent = typeof params === "object" && typeof params.silent === "boolean" ? params.silent : true;

  return new Promise((resolve) => {
    const printWin = new BrowserWindow({
      width: 480,
      height: 720,
      show: !silent, // Show window only if non-silent / preview mode requested
      title: "Desert Bite — Thermal Receipt Print",
      autoHideMenuBar: true,
      backgroundColor: "#1a1a1a",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const encoded = encodeURIComponent(html);
    printWin.loadURL(`data:text/html;charset=utf-8,${encoded}`);

    printWin.webContents.once("did-finish-load", () => {
      setTimeout(() => {
        if (printWin.isDestroyed()) return resolve({ success: false });

        const options = {
          silent: silent,
          printBackground: true,
          color: true,
        };

        if (printerName) {
          options.deviceName = printerName;
        }

        printWin.webContents.print(options, (success, errorType) => {
          if (!success) console.log("[Print] result:", errorType);
          setTimeout(() => {
            if (printWin && !printWin.isDestroyed()) printWin.close();
          }, 400);
          resolve({ success, errorType });
        });
      }, 200);
    });

    printWin.on("closed", () => resolve({ success: false, errorType: "closed" }));
  });
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  startApiServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (apiProcess) {
    try { apiProcess.kill(); } catch (e) {}
    apiProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── Crash Guards ─────────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => console.error("Uncaught:", err));
process.on("unhandledRejection", (reason) => console.error("Unhandled:", reason));
