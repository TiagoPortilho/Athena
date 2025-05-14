const goalsList = document.getElementById("goalsList");
const btnNewGoal = document.getElementById("btnNewGoal");
const goalModal = new bootstrap.Modal(document.getElementById("goalModal"));
const goalForm = document.getElementById("goalForm");
const modalTitle = document.getElementById("goalModalLabel");
let editingGoalId = null;

function calculateProgress(goal) {
  switch (goal.category) {
    case 'financial':
      return Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100);
    
    case 'health':
      const baseProgress = (goal.current_value / goal.target_value) * 100;
      return Math.min(Math.round(baseProgress), 100);
    
    case 'professional':
      return Math.min(Math.round(goal.current_value), 100);
    
    case 'personal':
      return Math.min(Math.round(goal.current_value), 100);
  }
}

function getProgressColor(progress) {
  if (progress < 25) return '#ef476f';
  if (progress < 50) return '#ffd166';
  if (progress < 75) return '#06d6a0';
  return '#118ab2';
}

function getProgressDisplay(goal) {
  const progress = calculateProgress(goal);
  const daysToDeadline = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  
  switch (goal.category) {
    case 'financial':
      const remaining = goal.target_value - goal.current_value;
      const dailyNeeded = daysToDeadline > 0 ? remaining / daysToDeadline : 0;
      return `
        <span>${progress}% Complete</span>
        <span>${goal.current_value.toLocaleString('en-US', {style: 'currency', currency: 'BRL'})} / 
               ${goal.target_value.toLocaleString('en-US', {style: 'currency', currency: 'BRL'})}</span>
        <div class="goal-metrics">
          <small>Remaining: ${remaining.toLocaleString('en-US', {style: 'currency', currency: 'BRL'})}</small>
          <small>Daily Goal: ${dailyNeeded.toLocaleString('en-US', {style: 'currency', currency: 'BRL'})}</small>
        </div>`;
    
    case 'health':
      return `
        <span>${progress}% Complete</span>
        <span>${goal.current_value} of ${goal.target_value} Days</span>
        <div class="goal-metrics">
          <small>${goal.activity_type || 'Activity'}</small>
          <small>Streak: ${goal.current_streak || 0} Days</small>
          <small>Days Left: ${daysToDeadline}</small>
        </div>`;
    
    case 'professional':
      const nextMilestone = [25, 50, 75, 100].find(m => m > goal.current_value) || 100;
      return `
        <span>${progress}% Complete</span>
        <span>Milestone: ${Math.floor(goal.current_value)}%</span>
        <div class="goal-metrics">
          <small>Next Milestone: ${nextMilestone}%</small>
          <small>Days Left: ${daysToDeadline}</small>
        </div>`;
    
    case 'personal':
      const baseProgressPersonal = goal.current_value;
      return `
        <span>${progress}% Complete</span>
        <span>Base Progress: ${Math.floor(baseProgressPersonal)}%</span>
        <div class="goal-metrics">
          <small>Days Left: ${daysToDeadline}</small>
        </div>`;
  }
}

async function loadGoals() {
  const list = await window.api.listGoals();
  const goalsHeader = document.querySelector('.goals-header');
  
  goalsHeader.style.display = list.length > 0 ? 'block' : 'none';
  
  if (list.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-state">
        <h4>No goals yet</h4>
        <p>Start by setting your first goal!</p>
        <button class="btn btn-outline-primary" onclick="openGoalForm()">+ New Goal</button>
      </div>
    `;
    return;
  }

  goalsList.innerHTML = "";
  list.forEach(goal => {
    const progress = calculateProgress(goal);
    const progressColor = getProgressColor(progress);
    
    const item = document.createElement("div");
    item.className = "list-group-item";
    item.innerHTML = `
      <div class="goal-header">
        <div class="goal-title">${goal.title}</div>
        <div class="goal-category">${goal.category}</div>
      </div>
      <div class="goal-description">${goal.description || ''}</div>
      <div class="goal-progress">
        <div class="progress" style="height: 10px;">
          <div class="progress-bar" role="progressbar" 
               style="width: ${progress}%; background-color: ${progressColor};"
               aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>
        <div class="progress-stats">
          ${getProgressDisplay(goal)}
        </div>
      </div>
      <div class="goal-footer">
        <div class="goal-deadline">Deadline: ${new Date(goal.deadline).toLocaleDateString()}</div>
        <div class="goal-actions">
          <button class="btn-action edit-goal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-action del-goal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    item.querySelector(".edit-goal").onclick = () => openGoalForm(goal);
    item.querySelector(".del-goal").onclick = async () => {
      if (confirm("Delete this goal?")) {
        await window.api.deleteGoal(goal.id);
        loadGoals();
      }
    };

    goalsList.appendChild(item);
  });
}

function openGoalForm(goal = {}) {
  editingGoalId = goal.id || null;
  modalTitle.textContent = editingGoalId ? "Edit Goal" : "New Goal";
  
  // Reset form
  goalForm.reset();
  
  // Set initial values
  goalForm.title.value = goal.title || "";
  goalForm.description.value = goal.description || "";
  goalForm.category.value = goal.category || "financial";
  goalForm.deadline.value = goal.deadline || "";

  // Trigger category change to setup dynamic fields
  const event = new Event('change');
  goalForm.category.dispatchEvent(event);

  // Set values for dynamic fields after they're created
  setTimeout(() => {
    if (goal.target_value) {
      const targetInput = goalForm.querySelector('#target_value');
      if (targetInput) targetInput.value = goal.target_value;
    }
    if (goal.current_value) {
      const currentInput = goalForm.querySelector('#current_value');
      if (currentInput) {
        currentInput.value = goal.current_value;
        if (currentInput.type === 'range') {
          const event = new Event('input');
          currentInput.dispatchEvent(event);
        }
      }
    }
    // Set additional fields based on category
    if (goal.category === 'health') {
      const streakInput = goalForm.querySelector('#current_streak');
      if (streakInput) streakInput.value = goal.current_streak || 0;
      const activityInput = goalForm.querySelector('#activity_type');
      if (activityInput) activityInput.value = goal.activity_type || 'exercise';
      const frequencyInput = goalForm.querySelector('#frequency');
      if (frequencyInput) frequencyInput.value = goal.frequency || 'daily';
    }
  }, 0);

  goalModal.show();
}

btnNewGoal.onclick = () => openGoalForm();

document.getElementById('category').addEventListener('change', function(e) {
  const dynamicFields = document.getElementById('dynamic-fields');
  const category = e.target.value;

  const fields = {
    financial: `
      <div class="mb-3">
        <label for="target_value" class="form-label">Target Amount (R$)</label>
        <input type="number" class="form-control" id="target_value" required min="0" step="0.01">
        <div class="form-text">Set your financial goal target</div>
      </div>
      <div class="mb-3">
        <label for="current_value" class="form-label">Current Amount (R$)</label>
        <input type="number" class="form-control" id="current_value" required min="0" step="0.01">
        <div class="form-text">Current progress towards your goal</div>
      </div>
    `,
    health: `
      <div class="mb-3">
        <label for="activity_type" class="form-label">Activity Type</label>
        <select class="form-select" id="activity_type" required>
          <option value="exercise">Exercise</option>
          <option value="meditation">Meditation</option>
          <option value="sleep">Sleep Goals</option>
          <option value="diet">Healthy Diet</option>
          <option value="reading">Reading</option>
          <option value="learning">Learning</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="target_value" class="form-label">Target Days</label>
        <input type="number" class="form-control" id="target_value" required min="1">
        <div class="form-text">How many days do you want to maintain this habit?</div>
      </div>
      <div class="mb-3">
        <label for="current_value" class="form-label">Days Completed</label>
        <input type="number" class="form-control" id="current_value" required min="0">
        <div class="form-text">How many days have you completed so far?</div>
      </div>
      <div class="mb-3">
        <label for="current_streak" class="form-label">Current Streak</label>
        <input type="number" class="form-control" id="current_streak" value="0" min="0">
        <div class="form-text">Current consecutive days (adds up to 10% bonus)</div>
      </div>
    `,
    professional: `
      <div class="mb-3">
        <label for="milestone_type" class="form-label">Progress Type</label>
        <select class="form-select" id="milestone_type" required>
          <option value="certification">Certification/Course</option>
          <option value="project">Project Completion</option>
          <option value="skill">Skill Development</option>
          <option value="career">Career Goal</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="milestones" class="form-label">Key Milestones</label>
        <textarea class="form-control" id="milestones" rows="3" placeholder="List your key milestones..."></textarea>
      </div>
      <div class="mb-3">
        <label for="current_value" class="form-label">Current Progress (%)</label>
        <input type="range" class="form-range" id="current_value" min="0" max="100" value="0">
        <div id="progress-value" class="form-text text-center">0%</div>
      </div>
    `,
    personal: `
      <div class="mb-3">
        <label for="goal_type" class="form-label">Goal Type</label>
        <select class="form-select" id="goal_type" required>
          <option value="learning">Learning</option>
          <option value="habit">Habit Formation</option>
          <option value="lifestyle">Lifestyle Change</option>
          <option value="relationship">Relationship</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="measurement" class="form-label">How will you measure success?</label>
        <textarea class="form-control" id="measurement" rows="2" placeholder="Define your success criteria..."></textarea>
      </div>
      <div class="mb-3">
        <label for="current_value" class="form-label">Self-Assessment (%)</label>
        <input type="range" class="form-range" id="current_value" min="0" max="100" value="0">
        <div id="assessment-value" class="form-text text-center">0%</div>
      </div>
    `
  };

  dynamicFields.innerHTML = fields[category];

  // Adicionar listeners para campos específicos
  if (category === 'professional' || category === 'personal') {
    const rangeInput = document.getElementById('current_value');
    const valueDisplay = document.getElementById(category === 'professional' ? 'progress-value' : 'assessment-value');
    
    if (rangeInput && valueDisplay) {
      rangeInput.addEventListener('input', (e) => {
        valueDisplay.textContent = `${e.target.value}%`;
      });
    }
  }
});

goalForm.onsubmit = async (e) => {
  e.preventDefault();
  
  try {
    const formData = {
      title: goalForm.title.value,
      description: goalForm.description.value,
      category: goalForm.category.value,
      deadline: goalForm.deadline.value,
      target_value: 0,
      current_value: 0,
      current_streak: 0,
      activity_type: null
    };

    switch (formData.category) {
      case 'financial':
        formData.target_value = parseFloat(goalForm.target_value.value) || 0;
        formData.current_value = parseFloat(goalForm.current_value.value) || 0;
        break;
        
      case 'health':
        formData.target_value = parseInt(goalForm.target_value.value) || 0;
        formData.current_value = parseInt(goalForm.current_value.value) || 0;
        formData.current_streak = parseInt(goalForm.current_streak.value) || 0;
        formData.activity_type = goalForm.activity_type.value;
        break;
        
      case 'professional':
      case 'personal':
        formData.target_value = 100;
        formData.current_value = parseInt(goalForm.current_value.value) || 0;
        break;
    }

    if (editingGoalId) {
      await window.api.updateGoal({ id: editingGoalId, ...formData });
    } else {
      await window.api.createGoal(formData);
    }

    goalModal.hide();
    loadGoals();
  } catch (error) {
    console.error('Error saving goal:', error);
    alert('Error saving goal. Please try again.');
  }
};

window.openGoalForm = openGoalForm;
window.addEventListener("DOMContentLoaded", loadGoals);
