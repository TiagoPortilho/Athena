const tasksList = document.getElementById("tasksList");
const btnNewTask = document.getElementById("btnNewTask");
const taskModal = new bootstrap.Modal(document.getElementById("taskModal"));
const taskForm = document.getElementById("taskForm");
const modalTitle = document.getElementById("taskModalLabel");
let editingTaskId = null;

function daysLeft(dueDate) {
  if (!dueDate) return "";
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff > 1) return `${diff} days left`;
  if (diff === 1) return "1 day left";
  if (diff === 0) return "Due today";
  return "Overdue";
}

async function loadTasks() {
  const list = await window.api.listTasks();
  const tasksHeader = document.querySelector('.tasks-header');
  
  tasksHeader.style.display = list.length > 0 ? 'block' : 'none';
  
  if (list.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <h4>No tasks yet</h4>
        <p>Start by creating your first task!</p>
        <button class="btn btn-outline-primary" onclick="openTaskForm()">+ New Task</button>
      </div>
    `;
    return;
  }
  tasksList.innerHTML = "";
  list.forEach(t => {
    const item = document.createElement("div");
    item.className = "list-group-item d-flex align-items-center justify-content-between";
    item.innerHTML = `
      <div class="d-flex align-items-center flex-grow-1" style="gap: 12px;">
        <input type="checkbox" class="form-check-input task-check" ${t.done ? "checked" : ""} />
        <div>
          <div class="task-desc ${t.done ? "task-done" : ""}">${t.description}</div>
          <div class="task-date text-muted">
            Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : "-"} 
            <span class="ms-2 badge">${daysLeft(t.due_date)}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-action edit-task" title="Edit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn-action del-task" title="Delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    // Checkbox
    item.querySelector(".task-check").onchange = async (e) => {
      await window.api.updateTask({
        id: t.id,
        description: t.description,
        due_date: t.due_date,
        done: e.target.checked
      });
      loadTasks();
    };
    // Edit
    item.querySelector(".edit-task").onclick = () => openTaskForm(t);
    // Delete
    item.querySelector(".del-task").onclick = async () => {
      if (confirm("Delete this task?")) {
        await window.api.deleteTask(t.id);
        loadTasks();
      }
    };
    tasksList.appendChild(item);
  });
}

function openTaskForm(task = {}) {
  editingTaskId = task.id || null;
  modalTitle.textContent = editingTaskId ? "Edit Task" : "New Task";
  taskForm.description.value = task.description || "";
  taskForm.due_date.value = task.due_date || "";
  taskModal.show();
}

btnNewTask.onclick = () => openTaskForm();

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    description: taskForm.description.value,
    due_date: taskForm.due_date.value
  };
  if (editingTaskId) {
    await window.api.updateTask({ id: editingTaskId, ...data, done: false });
  } else {
    await window.api.createTask(data);
  }
  taskModal.hide();
  loadTasks();
};

window.openTaskForm = openTaskForm;
window.addEventListener("DOMContentLoaded", loadTasks);
