let financeChart = null;

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

// Função para carregar eventos recentes
async function loadRecentEvents() {
  const eventsList = document.getElementById('recentEvents');
  if (!eventsList) return;

  const events = await window.api.listEvents();
  
  if (events.length === 0) {
    eventsList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/stars.svg" class="empty-icon">
        <h4>No events yet</h4>
        <p>Start planning your schedule by creating your first event</p>
        <a href="events.html" class="btn-create-first">
          Create Event
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentEvents = events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  eventsList.innerHTML = recentEvents
    .map(event => `
      <li class="list-group-item">
        <div class="d-flex align-items-center flex-grow-1" style="gap: 12px;">
          <div class="event-color-dot" style="background-color: ${event.color || '#4a81a8'}; width: 12px; height: 12px; border-radius: 50%;"></div>
          <div class="d-flex flex-column">
            <div class="project-name">${event.title}</div>
            <div class="d-flex align-items-center gap-2">
              <span class="project-date">${new Date(event.date).toLocaleDateString()}</span>
              ${event.description ? `<span class="text-muted">•</span><span class="project-date text-truncate" style="max-width: 200px;">${event.description}</span>` : ''}
            </div>
          </div>
        </div>
        <span class="project-status status-event">${getEventStatus(event.date)}</span>
      </li>
    `)
    .join('');
}

// Função para carregar notas recentes
async function loadRecentNotes() {
  const notesList = document.getElementById('recentNotes');
  if (!notesList) return;

  const notes = await window.api.listNotes();
  
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/edit.svg" class="empty-icon">
        <h4>No notes yet</h4>
        <p>Start capturing your thoughts by creating your first note</p>
        <a href="notes.html" class="btn-create-first">
          Create Note
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentNotes = notes
    .sort((a, b) => b.created - a.created)
    .slice(0, 4);

  notesList.innerHTML = recentNotes
    .map(note => `
      <li class="list-group-item">
        <div class="project-item-left">
          <img src="https://c.animaapp.com/maelovkf66QMPN/img/edit.svg" class="project-icon"/>
          <div class="project-info">
            <div class="project-name">${note.title}</div>
            <div class="project-date">Created: ${new Date(note.created * 1000).toLocaleDateString()}</div>
          </div>
        </div>
        <span class="project-status">Note</span>
      </li>
    `)
    .join('');
}

// Função para carregar recursos recentes
async function loadRecentResources() {
  const resourcesList = document.getElementById('recentResources');
  if (!resourcesList) return;

  const resources = await window.api.listResources();
  
  if (resources.length === 0) {
    resourcesList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/bookmark.svg" class="empty-icon">
        <h4>No resources yet</h4>
        <p>Start building your collection by adding your first resource</p>
        <a href="resources.html" class="btn-create-first">
          Add Resource
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentResources = resources
    .sort((a, b) => b.created - a.created)
    .slice(0, 4);

  resourcesList.innerHTML = recentResources
    .map(resource => `
      <li class="list-group-item">
        <div class="project-item-left">
          <img src="https://c.animaapp.com/maelovkf66QMPN/img/bookmark.svg" class="project-icon"/>
          <div class="project-info">
            <div class="project-name">${resource.title}</div>
            <div class="project-date d-flex align-items-center gap-2">
              <span>Added: ${new Date(resource.created * 1000).toLocaleDateString()}</span>
              ${resource.link ? `
                <span class="text-muted">•</span>
                <a href="${resource.link}" target="_blank" class="resource-link text-truncate" style="max-width: 200px;">
                  ${resource.link}
                </a>
              ` : ''}
            </div>
          </div>
        </div>
        <span class="project-status">Resource</span>
      </li>
    `)
    .join('');
}

// Função para carregar transações recentes
async function loadRecentTransactions() {
  const transactionsList = document.getElementById('recentTransactions');
  if (!transactionsList) return;

  const transactions = await window.api.listTransactions();
  
  if (transactions.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/dollar-sign.svg" class="empty-icon">
        <h4>No transactions yet</h4>
        <p>Start tracking your finances by adding your first transaction</p>
        <a href="finances.html" class="btn-create-first">
          Add Transaction
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    document.getElementById('inboxBalance').textContent = 'R$ 0,00';
    document.getElementById('inboxIncome').textContent = 'R$ 0,00';
    document.getElementById('inboxExpenses').textContent = 'R$ 0,00';
    return;
  }

  const recentTransactions = transactions
    .sort((a, b) => b.created - a.created)
    .slice(0, 3);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
    
  const balance = income - expenses;

  document.getElementById('inboxBalance').textContent = formatCurrency(balance);
  document.getElementById('inboxIncome').textContent = formatCurrency(income);
  document.getElementById('inboxExpenses').textContent = formatCurrency(expenses);

  transactionsList.innerHTML = recentTransactions
    .map(transaction => `
      <li class="list-group-item">
        <div class="project-item-left">
          <div class="project-info">
            <div class="project-name">${transaction.description}</div>
            <div class="project-date">Added: ${new Date(transaction.created * 1000).toLocaleDateString()}</div>
          </div>
        </div>
        <span class="project-status ${transaction.type === 'income' ? 'income' : 'expense'}">
          ${formatCurrency(transaction.value)}
        </span>
      </li>
    `).join('');
}

// Função para carregar goals recentes
async function loadRecentGoals() {
  const goalsList = document.getElementById('recentGoals');
  if (!goalsList) return;

  const goals = await window.api.listGoals();
  
  if (goals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-inbox">
        <img src="https://c.animaapp.com/maelovkf66QMPN/img/crosshair.svg" class="empty-icon">
        <h4>No goals yet</h4>
        <p>Start tracking your progress by setting your first goal</p>
        <a href="goals.html" class="btn-create-first">
          Set Goal
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const recentGoals = goals
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  goalsList.innerHTML = recentGoals
    .map(goal => {
      const progress = goal.current_value / goal.target_value * 100;
      const progressCapped = Math.min(Math.round(progress), 100);
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <li class="list-group-item">
          <div class="project-item-left">
            <img src="https://c.animaapp.com/maelovkf66QMPN/img/crosshair.svg" class="project-icon"/>
            <div class="project-info">
              <div class="project-name">${goal.title}</div>
              <div class="project-date d-flex align-items-center gap-2">
                <span>${goal.category}</span>
                <span class="text-muted">•</span>
                <span>${daysLeft} days left</span>
              </div>
            </div>
          </div>
          <span class="project-status">${progressCapped}%</span>
        </li>
      `;
    })
    .join('');
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

function getEventStatus(date) {
  const today = new Date();
  const eventDate = new Date(date);
  const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return "This week";
  return "Upcoming";
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

async function updateFinanceOverview() {
  const transactions = await window.api.listTransactions();
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
    
  const balance = income - expenses;

  // Update overview values
  document.getElementById('overviewBalance').textContent = formatCurrency(balance);
  document.getElementById('overviewIncome').textContent = formatCurrency(income);
  document.getElementById('overviewExpenses').textContent = formatCurrency(expenses);

  // Initialize or update chart
  const ctx = document.getElementById('financeChart');
  if (ctx) {
    if (financeChart) {
      financeChart.destroy();
    }

    financeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: [
            'rgba(72, 187, 120, 0.2)',
            'rgba(245, 101, 101, 0.2)'
          ],
          borderColor: [
            '#48bb78',
            '#f56565'
          ],
          borderWidth: 2,
          borderRadius: 8,
          spacing: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '75%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatCurrency(context.raw);
              }
            }
          }
        }
      }
    });
  }
}

window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      });


// Atualizar o event listener para incluir as tasks e eventos
window.addEventListener('DOMContentLoaded', () => {
  // Existing preloader code
  window.addEventListener('load', function() {
    document.getElementById('preloader').style.opacity = '0';
    setTimeout(function() {
      document.getElementById('preloader').style.display = 'none';
    }, 500);
  });

  // Load recent projects, tasks, events, notes, resources, transactions, and goals
  loadRecentProjects();
  loadRecentTasks();
  loadRecentEvents();
  loadRecentNotes();
  loadRecentResources();
  loadRecentTransactions();
  loadRecentGoals();
  updateFinanceOverview();
});