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

// Adicionar ao DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  // Existing preloader code
  window.addEventListener('load', function() {
    document.getElementById('preloader').style.opacity = '0';
    setTimeout(function() {
      document.getElementById('preloader').style.display = 'none';
    }, 500);
  });

  // Load recent projects
  loadRecentProjects();
});