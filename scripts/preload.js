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
});
