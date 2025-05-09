// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// expõe apenas o que precisa no window.api
contextBridge.exposeInMainWorld('api', {
  createProject: (data) => ipcRenderer.invoke('create-project', data),
  listProjects: ()  => ipcRenderer.invoke('list-projects'),
  updateProject: (data) => ipcRenderer.invoke('update-project', data),
  deleteProject: (id)   => ipcRenderer.invoke('delete-project', id),
});
