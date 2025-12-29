const grid = document.getElementById("projectGrid");
const form = document.getElementById("projectForm");
const modal = new bootstrap.Modal(document.getElementById("projectModal"));
const modalTitle = document.getElementById("projectModalLabel");
let editingId = null;

async function loadProjects() {
  grid.innerHTML = "";

  const list = await window.api.listProjects();
  
  const existingFloatingBtn = document.getElementById("btnNewFloating");
  if (existingFloatingBtn) existingFloatingBtn.remove();

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state col-12 text-center">
        <h4>You don't have any projects yet.</h4>
        <p>Start by creating your first one!</p>
        <button class="btn btn-outline-primary" onclick="openForm()">+ New Project</button>
      </div>
    `;
  } else {

    const floatBtn = document.createElement("button");
    floatBtn.id = "btnNewFloating";
    floatBtn.className = "btn btn-outline-primary position-absolute";
    floatBtn.style.top = "-40px";
    floatBtn.style.right = "0";
    floatBtn.innerText = "+ New Project ";
    floatBtn.onclick = () => openForm();
    grid.parentElement.appendChild(floatBtn);

    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "col-md-4";
      card.innerHTML = `
        <div class="project-card">
          <div class="header-top">
            <div class="priority ${p.priority.toLowerCase()}">${p.priority}</div>
            <div class="dropdown-menu">
              <button class="menu-button">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </button>
              <div class="dropdown-content">
                <div class="dropdown-item edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  Edit
                </div>
                <div class="dropdown-item del">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1-2 2v2"></path>
                  </svg>
                  Delete
                </div>
              </div>
            </div>
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="description">${p.description}</p>
          <div class="date-row">
            <div class="date-group">
              <div class="date-label">Start date</div>
              <div class="date-value">${new Date(p.start_date + 'T00:00:00').toLocaleDateString()}</div>
            </div>
            <div class="date-group">
              <div class="date-label">End date</div>
              <div class="date-value">${new Date(p.end_date + 'T00:00:00').toLocaleDateString()}</div>
            </div>
          </div>
          <div class="status-section">
            <div class="status-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="status-text">
              <div class="status-label">Current status</div>
              <div class="status-value">${p.status}</div>
            </div>
          </div>
          <button class="expand-button">
            View details
            <div class="expand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        </div>`;

      // Add event listeners
      const menuButton = card.querySelector(".menu-button");
      const dropdownContent = card.querySelector(".dropdown-content");
      
      menuButton.onclick = (e) => {
        e.stopPropagation();
        // Fecha todos os outros dropdowns abertos
        document.querySelectorAll('.dropdown-content.show')
          .forEach(d => {
            if (d !== dropdownContent) d.classList.remove('show')
          });
        dropdownContent.classList.toggle('show');
      };

      // Fecha o dropdown quando clicar fora
      document.addEventListener('click', () => {
        dropdownContent.classList.remove('show');
      });

      // Impede que o clique no dropdown feche ele
      dropdownContent.onclick = (e) => e.stopPropagation();

      const editBtn = card.querySelector(".edit");
      const delBtn = card.querySelector(".del");
      const expandBtn = card.querySelector(".expand-button");
      
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openForm(p);
      };
      
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Delete this project?")) {
          await window.api.deleteProject(p.id);
          loadProjects();
        }
      };

      expandBtn.onclick = () => {
        const overlay = document.createElement('div');
        overlay.className = 'project-overlay';
        overlay.innerHTML = `
          <div class="overlay-content">
            <button class="close-overlay">×</button>
            <h3 class="project-title">${p.title}</h3>
            <div class="priority ${p.priority.toLowerCase()}">${p.priority}</div>
            <p class="details-description">${p.description}</p>
            <div class="details-info">
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${p.status}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Start date:</span>
                <span class="info-value">${new Date(p.start_date + 'T00:00:00').toLocaleDateString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">End date:</span>
                <span class="info-value">${new Date(p.end_date + 'T00:00:00').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);
        
        // Fecha ao clicar fora do conteúdo
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
          }
        });

        const closeBtn = overlay.querySelector('.close-overlay');
        closeBtn.onclick = () => {
          overlay.classList.remove('active');
          setTimeout(() => overlay.remove(), 300);
        };
      };

      grid.appendChild(card);
    });
  }
}

function openForm(p = {}) {
  editingId = p.id || null;
  modalTitle.textContent = editingId ? "Edit Project" : "New Project";
  form.name.value = p.title || "";
  form.description.value = p.description || "";
  form.status.value = p.status || "not started";
  form.start_date.value = p.start_date || "";
  form.end_date.value = p.end_date || "";
  form.priority.value = p.priority || "Low";
  modal.show();
}

form.addEventListener("submit", async e => {
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

document.getElementById("btnNew").onclick = () => openForm();
window.addEventListener("DOMContentLoaded", loadProjects);