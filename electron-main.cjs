/**
 * Electron Main Process cho phần mềm V-KPI HD02 (Windows .EXE)
 * Đóng gói giao diện React + Vite thành ứng dụng Desktop chạy độc lập trên Windows
 */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'V-KPI HD02 - Hệ thống Đánh giá KPI & Kiểm điểm Cán bộ Công chức',
    icon: path.join(__dirname, 'public', 'pwa-512x512.png'),
    backgroundColor: '#F7F4F0',
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Nạp file giao diện đã build trong thư mục dist/
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  // Thiết lập thanh Menu tiếng Việt cho cán bộ dễ sử dụng và in ấn A4
  const menuTemplate = [
    {
      label: 'Hệ thống',
      submenu: [
        {
          label: 'In phiếu đánh giá A4 / Xuất PDF (Ctrl+P)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.print({ printBackground: true });
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Tải lại giao diện (Ctrl+R)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Thoát phần mềm',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Hiển thị',
      submenu: [
        { label: 'Phóng to chữ', role: 'zoomIn' },
        { label: 'Thu nhỏ chữ', role: 'zoomOut' },
        { label: 'Kích thước chuẩn (100%)', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Toàn màn hình (F11)', role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
