// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// expõe apenas o que precisa no window.api
contextBridge.exposeInMainWorld('api', {
  createProject: (data) => ipcRenderer.invoke('create-project', data),
  listProjects: ()  => ipcRenderer.invoke('list-projects'),
  updateProject: (data) => ipcRenderer.invoke('update-project', data),
  deleteProject: (id)   => ipcRenderer.invoke('delete-project', id),
  // Tasks CRUD
  createTask: (data) => ipcRenderer.invoke('create-task', data),
  listTasks: () => ipcRenderer.invoke('list-tasks'),
  updateTask: (data) => ipcRenderer.invoke('update-task', data),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  // Events CRUD
  createEvent: (data) => ipcRenderer.invoke('create-event', data),
  listEvents: () => ipcRenderer.invoke('list-events'),
  updateEvent: (data) => ipcRenderer.invoke('update-event', data),
  deleteEvent: (id) => ipcRenderer.invoke('delete-event', id),
  // Notes CRUD
  createNote: (data) => ipcRenderer.invoke('create-note', data),
  listNotes: () => ipcRenderer.invoke('list-notes'),
  updateNote: (data) => ipcRenderer.invoke('update-note', data),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
  // Resources CRUD
  createResource: (data) => ipcRenderer.invoke('create-resource', data),
  listResources: () => ipcRenderer.invoke('list-resources'),
  updateResource: (data) => ipcRenderer.invoke('update-resource', data),
  deleteResource: (id) => ipcRenderer.invoke('delete-resource', id),
  // Transactions CRUD
  createTransaction: (data) => ipcRenderer.invoke('createTransaction', data),
  listTransactions: () => ipcRenderer.invoke('listTransactions'),
  getTransaction: (id) => ipcRenderer.invoke('getTransaction', id),
  updateTransaction: (data) => ipcRenderer.invoke('updateTransaction', data),
  deleteTransaction: (id) => ipcRenderer.invoke('deleteTransaction', id),
});
