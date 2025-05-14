// CRUD de eventos + renderização do calendário

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let editingEventId = null;

function getMonthName(month, year) {
  return new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(month, year) {
  return new Date(year, month, 1).getDay();
}

async function loadEvents() {
  return await window.api.listEvents();
}

function clearEventForm() {
  document.getElementById('eventId').value = '';
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventDescription').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventColor').value = '#4a81a8';
  editingEventId = null;
}

function openEditEvent(event) {
  document.getElementById('eventId').value = event.id;
  document.getElementById('eventTitle').value = event.title;
  document.getElementById('eventDescription').value = event.description;
  document.getElementById('eventDate').value = event.date;
  document.getElementById('eventColor').value = event.color || '#4a81a8';
  editingEventId = event.id;
  const modal = new bootstrap.Modal(document.getElementById('eventModal'));
  modal.show();
}

async function renderCalendar() {
  const events = await loadEvents();
  const calendarGrid = document.getElementById('calendarGrid');
  const monthName = getMonthName(currentMonth, currentYear);
  document.getElementById('calendarMonth').textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Dias do mês
  const days = daysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfWeek(currentMonth, currentYear);
  let html = '';

  // Cabeçalho dos dias da semana
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  html += weekDays.map(d => `<div class="calendar-day empty" style="font-weight:bold; background:transparent; box-shadow:none; color:#4a81a8;">${d}</div>`).join('');

  // Espaços vazios antes do primeiro dia
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  // Dias do mês
  for (let day = 1; day <= days; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(ev => ev.date === dateStr);
    const isToday = (new Date().getFullYear() === currentYear && new Date().getMonth() === currentMonth && new Date().getDate() === day);
    
    html += `
      <div class="calendar-day${isToday ? ' today' : ''}" 
           style="cursor: pointer;"
           onclick="goToEvents('${dateStr}')">
        <div class="day-number">${day}</div>
        <div class="calendar-events">
          ${dayEvents.map(ev => `
            <div class="calendar-event" style="--event-color:${ev.color || '#4a81a8'}">
              <span class="event-title" title="${ev.title}">${ev.title}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  // Espaços vazios para completar a última linha
  const totalCells = weekDays.length + firstDay + days;
  const extra = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < extra; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  calendarGrid.innerHTML = html;
}

// Adicionar função global para navegação
function goToEvents(date) {
  window.location.href = `events.html?date=${date}`;
}

window.goToEvents = goToEvents; // Torna a função acessível globalmente

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

document.getElementById('btnNewEvent').addEventListener('click', () => {
  clearEventForm();
});

document.getElementById('eventForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('eventId').value;
  const title = document.getElementById('eventTitle').value;
  const description = document.getElementById('eventDescription').value;
  const date = document.getElementById('eventDate').value;
  const color = document.getElementById('eventColor').value;
  if (!title || !date) return;

  if (id) {
    await window.api.updateEvent({ id: parseInt(id), title, description, date, color });
  } else {
    await window.api.createEvent({ title, description, date, color });
  }
  bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
  renderCalendar();
});

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});
