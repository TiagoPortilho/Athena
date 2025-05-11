const eventsList = document.getElementById("eventsList");
const btnNewEvent = document.getElementById("btnNewEvent");
const eventModal = new bootstrap.Modal(document.getElementById("eventModal"));
const eventForm = document.getElementById("eventForm");
const modalTitle = document.getElementById("eventModalLabel");
let editingEventId = null;

// Verifica se tem data na URL
const urlParams = new URLSearchParams(window.location.search);
const dateFromCalendar = urlParams.get('date');

async function loadEvents() {
  const events = await window.api.listEvents();
  const eventsHeader = document.querySelector('.events-header');
  
  eventsHeader.style.display = events.length > 0 ? 'block' : 'none';
  
  if (events.length === 0) {
    eventsList.innerHTML = `
      <div class="empty-state">
        <h4>No events yet</h4>
        <p>Start planning your schedule by creating your first event</p>
        <button class="btn btn-outline-primary" onclick="openEventForm()">+ New Event</button>
      </div>
    `;
    return;
  }

  eventsList.innerHTML = events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(event => `
      <div class="list-group-item">
        <div class="d-flex align-items-center flex-grow-1" style="gap: 12px;">
          <div class="event-color-dot" style="background-color: ${event.color || '#4a81a8'}"></div>
          <div>
            <div class="event-title">${event.title}</div>
            <div class="event-info">
              <span>Date: ${new Date(event.date).toLocaleDateString()}</span>
              ${event.description ? `<span class="text-muted">•</span><span class="event-description">${event.description}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-action edit-event" onclick="openEventForm(${JSON.stringify(event).replace(/"/g, '&quot;')})" title="Edit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-action del-event" onclick="deleteEvent(${event.id})" title="Delete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `)
    .join('');
}

function openEventForm(event = null) {
  editingEventId = event ? event.id : null;
  modalTitle.textContent = editingEventId ? "Edit Event" : "New Event";
  eventForm.eventTitle.value = event ? event.title : "";
  eventForm.eventDescription.value = event ? event.description : "";
  eventForm.eventDate.value = event ? event.date : dateFromCalendar || "";
  eventForm.eventColor.value = event ? event.color : "#4a81a8";
  eventModal.show();
}

async function deleteEvent(id) {
  if (confirm("Delete this event?")) {
    await window.api.deleteEvent(id);
    loadEvents();
  }
}

eventForm.onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    title: eventForm.eventTitle.value,
    description: eventForm.eventDescription.value,
    date: eventForm.eventDate.value,
    color: eventForm.eventColor.value
  };

  if (editingEventId) {
    await window.api.updateEvent({ id: editingEventId, ...data });
  } else {
    await window.api.createEvent(data);
  }
  eventModal.hide();
  loadEvents();
};

btnNewEvent.onclick = () => openEventForm();
window.openEventForm = openEventForm;
window.deleteEvent = deleteEvent;

// Carregar eventos e abrir modal se vier da página do calendário
window.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  if (dateFromCalendar) {
    openEventForm();
  }
});
