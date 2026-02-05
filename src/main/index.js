import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs-extra'
import mammoth from 'mammoth'

const storagePath = path.join(app.getPath('userData'), 'Notes')
// Inside src/main/index.js

function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true, // Makes it look professional
    frame: false,      // Removes the Windows borders
    alwaysOnTop: true
  });

  // Create a simple HTML file for the splash or load a static image
  splash.loadFile(path.join(__dirname, '../renderer/splash.html'));
  return splash;
}

app.whenReady().then(() => {
  const splash = createSplashWindow();
  
  // Create the main window but keep it hidden
  const mainWindow = createWindow(); 

  // Once the main window is ready, swap them
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.close();
      mainWindow.show();
    }, 2000); // 2 second delay so people can actually see your cool logo
  });
}); 

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    title: "Study Helper",
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // Necessary to load local AppData files in the viewer
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  fs.ensureDirSync(storagePath)
  createWindow()
})

// FILE PICKER & CONVERSION LOGIC
ipcMain.handle('open-file-picker', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Study Docs', extensions: ['pdf', 'docx', 'txt'] }]
  })

  if (canceled) return null

  const sourcePath = filePaths[0]
  const fileName = path.basename(sourcePath)
  const ext = path.extname(fileName).toLowerCase()
  const destPath = path.join(storagePath, fileName)

  // Copy and Lock
  await fs.copy(sourcePath, destPath)
  await fs.chmod(destPath, 0o444) 

  let content = ""
  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: destPath })
    content = result.value // HTML version of Word doc
  } else if (ext === '.txt') {
    content = await fs.readFile(destPath, 'utf8')
  }

  return { name: fileName, path: destPath, type: ext.replace('.', ''), content }
})

ipcMain.handle('get-notes', async () => {
  const files = await fs.readdir(storagePath)
  return files.map(f => ({ 
    name: f, 
    path: path.join(storagePath, f),
    type: path.extname(f).replace('.', '')
  }))
})
ipcMain.handle('delete-note', async (event, filePath) => {
  try {
    // On Windows, we need to ensure the file isn't 'locked' before deleting
    // though fs.remove usually handles this well.
    await fs.remove(filePath);
    return { success: true };
  } catch (err) {
    console.error("Delete failed:", err);
    return { success: false, error: err.message };
  }
});