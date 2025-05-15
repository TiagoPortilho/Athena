// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { queries: sql_req } = require('../database/sql-queries.js'); //Importando as queries SQL
const now = Math.floor(Date.now() / 1000);


let db; // Variavel global para o banco de dados

// Inicia o banco de dados SQLite
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
  const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8'); // Leitura do arquivo SQL
  db.exec(schema);
  return db;
}


function createWindow() {
  // Configurações da janela principal
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

// Tentativa de inicialização do banco de dados
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


// PROJECTS CRUD
ipcMain.handle('create-project', (e, { title, description, status, start_date, end_date, priority }) => {
  const stmt = db.prepare(sql_req.create_project);
  const info = stmt.run(title, description, status, start_date, end_date, priority, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-projects', () => {
  return db.prepare(sql_req.list_projects).all();
});

ipcMain.handle('update-project', (e, { id, title, description, status, start_date, end_date, priority }) => {
  db.prepare(sql_req.update_project).run(title, description, status, start_date, end_date, priority, id);
});

ipcMain.handle('delete-project', (e, id) => {
  db.prepare(sql_req.delete_project).run(id);
});



// TASKS CRUD
ipcMain.handle('create-task', (e, { description, due_date }) => {
  const stmt = db.prepare(sql_req.create_task);
  const info = stmt.run(description, due_date, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-tasks', () => {
  return db.prepare(sql_req.list_tasks).all();
});

ipcMain.handle('update-task', (e, { id, description, due_date, done }) => {
  db.prepare(sql_req.update_task).run(description, due_date, done ? 1 : 0, id);
});

ipcMain.handle('delete-task', (e, id) => {
  db.prepare(sql_req.delete_task).run(id);
});



// EVENTS CRUD
ipcMain.handle('create-event', (e, { title, description, date, color }) => {
  const stmt = db.prepare(sql_req.create_event);
  const info = stmt.run(title, description, date, color, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-events', () => {
  return db.prepare(sql_req.list_events).all();
});

ipcMain.handle('update-event', (e, { id, title, description, date, color }) => {
  db.prepare(sql_req.update_event).run(title, description, date, color, id);
});

ipcMain.handle('delete-event', (e, id) => {
  db.prepare(sql_req.delete_event).run(id);
});



// NOTAS CRUD
ipcMain.handle('create-note', (e, { title, text }) => {
  const stmt = db.prepare(sql_req.create_note);
  const info = stmt.run(title, text, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-notes', () => {
  return db.prepare(sql_req.list_notes).all();
});

ipcMain.handle('update-note', (e, { id, title, text }) => {
  db.prepare(sql_req.update_note).run(title, text, id);
});

ipcMain.handle('delete-note', (e, id) => {
  db.prepare(sql_req.delete_note).run(id);
});



// RESOURCES CRUD
ipcMain.handle('create-resource', (e, { title, description, link, image }) => {
  const stmt = db.prepare(sql_req.create_resource);
  const info = stmt.run(title, description, link, image, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-resources', () => {
  return db.prepare(sql_req.list_resources).all();
});

ipcMain.handle('update-resource', (e, { id, title, description, link, image }) => {
  db.prepare(sql_req.update_resource).run(title, description, link, image, id);
});

ipcMain.handle('delete-resource', (e, id) => {
  db.prepare(sql_req.delete_resource).run(id);
});



// Transactions CRUD
ipcMain.handle('createTransaction', (e, { type, description, value }) => {
  const stmt = db.prepare(sql_req.create_transaction);
  const info = stmt.run(type, description, value, now);
  return info.lastInsertRowid;
});

ipcMain.handle('listTransactions', () => {
  return db.prepare(sql_req.list_transactions).all();
});

ipcMain.handle('getTransaction', (e, id) => {
  return db.prepare(sql_req.get_transaction).get(id);
});

ipcMain.handle('updateTransaction', (e, { id, type, description, value }) => {
  db.prepare(sql_req.update_transaction).run(type, description, value, id);
});

ipcMain.handle('deleteTransaction', (e, id) => {
  db.prepare(sql_req.delete_transaction).run(id);
});



// Goals CRUD
ipcMain.handle('create-goal', (e, { title, description, category, target_value, current_value, deadline }) => {
  const stmt = db.prepare(sql_req.create_goal);
  const info = stmt.run(title, description, category, target_value, current_value, deadline, now);
  return info.lastInsertRowid;
});

ipcMain.handle('list-goals', () => {
  return db.prepare(sql_req.list_goals).all();
});

ipcMain.handle('update-goal', (e, { id, title, description, category, target_value, current_value, deadline }) => {
  db.prepare(sql_req.update_goal).run(title, description, category, target_value, current_value, deadline, id);
});

ipcMain.handle('delete-goal', (e, id) => {
  db.prepare(sql_req.delete_goal).run(id);
});
