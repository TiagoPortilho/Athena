const resourcesGrid = document.getElementById("resourcesGrid");
const resourceForm = document.getElementById("resourceForm");
const resourceModal = new bootstrap.Modal(document.getElementById("resourceModal"));
const resourceModalLabel = document.getElementById("resourceModalLabel");
let editingResourceId = null;

async function loadResources() {
  resourcesGrid.innerHTML = "";

  const list = await window.api.listResources();
  const resourcesHeader = document.querySelector('.resources-header');
  
  resourcesHeader.style.display = list.length > 0 ? 'block' : 'none';

  if (list.length === 0) {
    resourcesGrid.innerHTML = `
      <div class="empty-state col-12 text-center">
        <h4>You don't have any resources yet.</h4>
        <p>Start by creating your first one!</p>
        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#resourceModal">+ New Resource</button>
      </div>
    `;
  } else {
    list.forEach(r => {
      const card = document.createElement("div");
      card.className = "col-md-4";
      card.innerHTML = `
        <div class="resource-card">
          ${r.image ? `<img src="${r.image}" class="resource-image" alt="Resource Image" onerror="this.style.display='none';"/>` : ""}
          <div class="resource-title">${r.title}</div>
          <div class="resource-description">${r.description || ""}</div>
          ${r.link ? `<a href="${r.link}" class="resource-link" target="_blank">${r.link}</a>` : ""}
          <div class="resource-actions">
            <button class="btn-action edit-resource" title="Edit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-action del-resource" title="Delete">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1-2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      const editBtn = card.querySelector(".edit-resource");
      const delBtn = card.querySelector(".del-resource");

      editBtn.onclick = () => openResourceForm(r);

      delBtn.onclick = async () => {
        if (confirm("Delete this resource?")) {
          await window.api.deleteResource(r.id);
          loadResources();
        }
      };

      resourcesGrid.appendChild(card);
    });
  }
}

function openResourceForm(r = {}) {
  editingResourceId = r.id || null;
  resourceModalLabel.textContent = editingResourceId ? "Edit Resource" : "New Resource";
  resourceForm.resourceTitle.value = r.title || "";
  resourceForm.resourceDescription.value = r.description || "";
  resourceForm.resourceLink.value = r.link || "";
  resourceForm.resourceImage.value = r.image || "";
  resourceModal.show();
}

resourceForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    title: resourceForm.resourceTitle.value,
    description: resourceForm.resourceDescription.value,
    link: resourceForm.resourceLink.value,
    image: resourceForm.resourceImage.value
  };
  if (editingResourceId) {
    await window.api.updateResource({ id: editingResourceId, ...data });
  } else {
    await window.api.createResource(data);
  }
  resourceModal.hide();
  loadResources();
});

window.addEventListener("DOMContentLoaded", loadResources);
