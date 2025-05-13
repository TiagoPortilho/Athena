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
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      done        INTEGER NOT NULL DEFAULT 0,
      due_date    TEXT,
      created     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT,
      date        TEXT NOT NULL,
      color       TEXT,
      created     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text  TEXT NOT NULL,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT,
      image TEXT,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      value REAL NOT NULL,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      target_value REAL NOT NULL,
      current_value REAL NOT NULL DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      activity_type TEXT,
      category TEXT NOT NULL,
      deadline TEXT,
      created INTEGER NOT NULL
    );
  `);
  return db;
}

let db;
function createWindow() {
  const win = new BrowserWindow({
    minWidth: 1024,
    minHeight: 768,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '../views/index.html'));
  win.maximize();
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

// TASKS CRUD
ipcMain.handle('create-task', (e, { description, due_date }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO tasks (description, due_date, created)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(description, due_date, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-tasks', () => {
  return db.prepare('SELECT * FROM tasks ORDER BY done ASC, due_date ASC').all();
});

ipcMain.handle('update-task', (e, { id, description, due_date, done }) => {
  db.prepare(`
    UPDATE tasks
    SET description = ?, due_date = ?, done = ?
    WHERE id = ?
  `).run(description, due_date, done ? 1 : 0, id);
});

ipcMain.handle('delete-task', (e, id) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
});

// EVENTS CRUD
ipcMain.handle('create-event', (e, { title, description, date, color }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO events (title, description, date, color, created)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, date, color, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-events', () => {
  return db.prepare('SELECT * FROM events').all();
});

ipcMain.handle('update-event', (e, { id, title, description, date, color }) => {
  db.prepare(`
    UPDATE events
    SET title = ?, description = ?, date = ?, color = ?
    WHERE id = ?
  `).run(title, description, date, color, id);
});

ipcMain.handle('delete-event', (e, id) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
});

// NOTAS CRUD
ipcMain.handle('create-note', (e, { title, text }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO notes (title, text, created)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(title, text, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-notes', () => {
  return db.prepare('SELECT * FROM notes ORDER BY created DESC').all();
});

ipcMain.handle('update-note', (e, { id, title, text }) => {
  db.prepare(`
    UPDATE notes
    SET title = ?, text = ?
    WHERE id = ?
  `).run(title, text, id);
});

ipcMain.handle('delete-note', (e, id) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
});

// RESOURCES CRUD
ipcMain.handle('create-resource', (e, { title, description, link, image }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO resources (title, description, link, image, created)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, link, image, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-resources', () => {
  return db.prepare('SELECT * FROM resources ORDER BY created DESC').all();
});

ipcMain.handle('update-resource', (e, { id, title, description, link, image }) => {
  db.prepare(`
    UPDATE resources
    SET title = ?, description = ?, link = ?, image = ?
    WHERE id = ?
  `).run(title, description, link, image, id);
});

ipcMain.handle('delete-resource', (e, id) => {
  db.prepare('DELETE FROM resources WHERE id = ?').run(id);
});

// Transactions CRUD
ipcMain.handle('createTransaction', (e, { type, description, value }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO transactions (type, description, value, created)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(type, description, value, now);
  return info.lastInsertRowid;
});

ipcMain.handle('listTransactions', () => {
  return db.prepare('SELECT * FROM transactions ORDER BY created DESC').all();
});

ipcMain.handle('getTransaction', (e, id) => {
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
});

ipcMain.handle('updateTransaction', (e, { id, type, description, value }) => {
  db.prepare(`
    UPDATE transactions
    SET type = ?, description = ?, value = ?
    WHERE id = ?
  `).run(type, description, value, id);
});

ipcMain.handle('deleteTransaction', (e, id) => {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
});

// Goals CRUD
ipcMain.handle('create-goal', (e, { title, description, category, target_value, current_value, deadline }) => {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO goals (title, description, category, target_value, current_value, deadline, created)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, category, target_value, current_value, deadline, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-goals', () => {
  return db.prepare('SELECT * FROM goals ORDER BY deadline ASC').all();
});

ipcMain.handle('update-goal', (e, { id, title, description, category, target_value, current_value, deadline }) => {
  db.prepare(`
    UPDATE goals
    SET title = ?, description = ?, category = ?, target_value = ?, current_value = ?, deadline = ?
    WHERE id = ?
  `).run(title, description, category, target_value, current_value, deadline, id);
});

ipcMain.handle('delete-goal', (e, id) => {
  db.prepare('DELETE FROM goals WHERE id = ?').run(id);
});
