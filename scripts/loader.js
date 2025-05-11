window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      });

// Função para carregar projetos recentes
async function loadRecentProjects() {
  const projectsList = document.getElementById('recentProjects');
  if (!projectsList) return;

  const projects = await window.api.listProjects();
  
  if (projects.length === 0) {
    projectsList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/folder-filled.svg" class="empty-icon">
        <h4>No projects yet</h4>
        <p>Start organizing your work by creating your first project</p>
        <a href="projects.html" class="btn-create-first">
          Create Project
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentProjects = projects
    .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
    .slice(0, 4);

  projectsList.innerHTML = recentProjects
    .map(project => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="https://c.animaapp.com/maelovkf66QMPN/img/folder-filled.svg" class="inbox-icon" />
          <div class="ms-2">
            <div class="project-name">${project.title}</div>
            <div class="project-date">${new Date(project.end_date).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="project-status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</div>
      </li>
    `)
    .join('');
}

// Função para carregar tasks recentes
async function loadRecentTasks() {
  const tasksList = document.getElementById('recentTasks');
  if (!tasksList) return;

  const tasks = await window.api.listTasks();
  
  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/check-box.svg" class="empty-icon">
        <h4>No tasks yet</h4>
        <p>Start organizing your work by creating your first task</p>
        <a href="tasks.html" class="btn-create-first">
          Create Task
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentTasks = tasks
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  tasksList.innerHTML = recentTasks
    .map(task => `
      <li class="list-group-item">
        <div class="project-item-left">
          <input type="checkbox" class="form-check-input task-check" ${task.done ? "checked" : ""} data-task-id="${task.id}" />
          <div class="project-info">
            <div class="project-name ${task.done ? "task-done" : ""}">${task.description}</div>
            <div class="project-date">Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</div>
          </div>
        </div>
        <span class="project-status status-task">${getDaysLeft(task.due_date)}</span>
      </li>
    `)
    .join('');

  // Adicionar event listeners para os checkboxes
  tasksList.querySelectorAll('.task-check').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const taskId = parseInt(e.target.dataset.taskId);
      const task = recentTasks.find(t => t.id === taskId);
      if (task) {
        await window.api.updateTask({
          id: taskId,
          description: task.description,
          due_date: task.due_date,
          done: e.target.checked
        });
        loadRecentTasks(); // Recarrega a lista
      }
    });
  });
}

function getDaysLeft(dueDate) {
  if (!dueDate) return "No date";
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff > 1) return `${diff} days left`;
  if (diff === 1) return "Tomorrow";
  if (diff === 0) return "Today";
  return "Overdue";
}

// Atualizar o event listener para incluir as tasks
window.addEventListener('DOMContentLoaded', () => {
  // Existing preloader code
  window.addEventListener('load', function() {
    document.getElementById('preloader').style.opacity = '0';
    setTimeout(function() {
      document.getElementById('preloader').style.display = 'none';
    }, 500);
  });

  // Load recent projects and tasks
  loadRecentProjects();
  loadRecentTasks();
});