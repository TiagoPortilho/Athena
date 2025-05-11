// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

function initDb() {
  // 1) determina onde o DB ficará
  const userData = app.getPath('userData');           // ex: C:\Users\<vc>\AppData\Roaming\Athena
  const dbDir    = path.join(userData, 'db');         // pasta “db” dentro de userData
  const dbPath   = path.join(dbDir, 'athena.db');     // arquivo final

  // 2) garante que a pasta exista
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 3) abre (ou cria) o arquivo SQLite e a tabela
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      status      TEXT NOT NULL,
      start_date  TEXT,
      end_date    TEXT,
      priority    TEXT,
      created     INTEGER NOT NULL
    );
  `);
  return db;
}

let db;
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  try {
    db = initDb();
  } catch (err) {
    console.error('Erro ao inicializar DB', err);
    app.quit();
    return;
  }
  createWindow();
});

ipcMain.handle('create-project', (e, { title, description, status, start_date, end_date, priority }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO projects (title, description, status, start_date, end_date, priority, created)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, status, start_date, end_date, priority, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-projects', () => {
  return db.prepare('SELECT * FROM projects').all();
});

ipcMain.handle('update-project', (e, { id, title, description, status, start_date, end_date, priority }) => {
  db.prepare(`
    UPDATE projects
    SET title = ?, description = ?, status = ?, start_date = ?, end_date = ?, priority = ?
    WHERE id = ?
  `).run(title, description, status, start_date, end_date, priority, id);
});

ipcMain.handle('delete-project', (e, id) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
});
