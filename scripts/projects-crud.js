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

          // Mostra cards dos projetos
          list.forEach(p => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            card.innerHTML = `
              <div class="project-card p-3">
                <div class="project-title">${p.title}</div>
                <div class="project-meta">${p.status}</div>
                <div class="project-meta">${p.priority || ""}</div>
                <small>${new Date(p.created * 1000).toLocaleDateString()}</small>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-secondary edit">Editar</button>
                  <button class="btn btn-sm btn-outline-danger del">Excluir</button>
                </div>
              </div>`;
            card.querySelector(".edit").onclick = () => openForm(p);
            card.querySelector(".del").onclick = async () => {
              if (confirm("Excluir este projeto?")) {
                await window.api.deleteProject(p.id);
                loadProjects();
              }
            };
            grid.appendChild(card);
          });
        }
      }


      function openForm(p = {}) {
        editingId = p.id || null;
        modalTitle.textContent = editingId ? "Editar Projeto" : "Novo Projeto";
        form.name.value = p.title || "";
        form.description.value = p.description || "";
        form.status.value = p.status || "not started";
        form.start_date.value = p.start_date || "";
        form.end_date.value = p.end_date || "";
        form.priority.value = p.priority || "baixa";
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