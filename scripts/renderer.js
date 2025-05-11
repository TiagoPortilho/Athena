// renderer.js
const projectGrid = document.getElementById("projectGrid");
const form = document.getElementById("projectForm");
const modal = new bootstrap.Modal('#projectModal');
let editingId = null;

// renderiza lista
async function loadProjects() {
  projectGrid.innerHTML = '';
  const list = await window.api.listProjects();
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card p-3">
        <h5>${p.title}</h5>
        <p>${p.description}</p>
        <p>Status: ${p.status}</p>
        <p>Priority: ${p.priority}</p>
        <p>Start: ${p.start_date || 'N/A'}</p>
        <p>End: ${p.end_date || 'N/A'}</p>
        <small>${new Date(p.created * 1000).toLocaleDateString()}</small>
        <div class="mt-2">
          <button class="btn btn-sm btn-secondary edit">Edit</button>
          <button class="btn btn-sm btn-danger del">Delete</button>
        </div>
      </div>`;
    card.querySelector('.edit').onclick = () => openForm(p);
    card.querySelector('.del').onclick = async () => {
      if (confirm('Delete?')) {
        await window.api.deleteProject(p.id);
        loadProjects();
      }
    };
    projectGrid.appendChild(card);
  });
}

// abre modal para novo/edição
function openForm(p = {}) {
  editingId = p.id || null;
  form.name.value = p.title || '';
  form.status.value = p.status || 'not started';
  modal.show();
}

// submit
form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    title: form.name.value,
    description: form.description.value,
    status: form.status.value,
    start_date: form.start_date.value,
    end_date: form.end_date.value,
    priority: form.priority.value
  };
  if (editingId) {
    await window.api.updateProject({ id: editingId, ...data });
  } else {
    await window.api.createProject(data);
  }
  modal.hide();
  loadProjects();
});

// inicial
document.getElementById('btnNew').onclick = () => openForm();
window.addEventListener('DOMContentLoaded', loadProjects);
