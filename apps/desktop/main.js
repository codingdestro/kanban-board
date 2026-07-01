const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const storagePath = path.join(app.getPath("userData"), "tasks-store.json");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // Load the IPC bridge
    },
    backgroundColor: "#070a13",
    title: "DevFlow Kanban",
    titleBarStyle: "hiddenInset", // macOS traffic lights integrated into the layout shell
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173"); // Vite dev server port
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist-renderer/index.html")); // Vite production assets build
  }
}

// Set up local file persistence IPC handlers
function setupIpcHandlers() {
  ipcMain.handle("read-state", async () => {
    try {
      if (fs.existsSync(storagePath)) {
        const data = fs.readFileSync(storagePath, "utf-8");
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to read persistent JSON state from file", e);
    }
    return null;
  });

  ipcMain.handle("write-state", async (event, data) => {
    try {
      const dir = path.dirname(storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Failed to write persistent JSON state to file", e);
      return false;
    }
  });
}

// Set up native application menu template
function setAppMenu() {
  const template = [
    {
      label: "DevFlow",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "close" },
      ],
    },
  ];

  // Adjust menu for non-macOS platforms
  if (process.platform !== "darwin") {
    // Remove DevFlow menu item, rename File
    template.shift();
    template.unshift({
      label: "File",
      submenu: [{ role: "quit" }],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  setupIpcHandlers();
  setAppMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
