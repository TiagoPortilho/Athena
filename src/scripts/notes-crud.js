const notesGrid = document.getElementById("notesGrid");
const noteForm = document.getElementById("noteForm");
const noteModal = new bootstrap.Modal(document.getElementById("noteModal"));
const noteModalTitle = document.getElementById("noteModalLabel");
let editingNoteId = null;

async function loadNotes() {
  notesGrid.innerHTML = "";

  const list = await window.api.listNotes();

  const existingFloatingBtn = document.getElementById("btnNewNoteFloating");
  if (existingFloatingBtn) existingFloatingBtn.remove();

  if (list.length === 0) {
    notesGrid.innerHTML = `
      <div class="empty-state col-12 text-center">
        <h4>You don't have any notes yet.</h4>
        <p>Start by creating your first one!</p>
        <button class="btn btn-outline-primary" onclick="openNoteForm()">+ New Note</button>
      </div>
    `;
  } else {
    const floatBtn = document.createElement("button");
    floatBtn.id = "btnNewNoteFloating";
    floatBtn.className = "btn btn-outline-primary position-absolute";
    floatBtn.style.top = "-40px";
    floatBtn.style.right = "0";
    floatBtn.innerText = "+ New Note ";
    floatBtn.onclick = () => openNoteForm();
    notesGrid.parentElement.appendChild(floatBtn);

    list.forEach(n => {
      const card = document.createElement("div");
      card.className = "col-md-4";
      card.innerHTML = `
        <div class="notes-card">
          <div class="header-top">
            <h3 class="notes-title">${n.title}</h3>
          </div>
          <p class="notes-text">${n.text}</p>
          <div class="task-actions">
            <button class="btn-action edit-note" title="Edit">
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
        </div>
      `;

      const editBtn = card.querySelector(".edit-note");
      const delBtn = card.querySelector(".del-task");

      editBtn.onclick = () => openNoteForm(n);
      
      delBtn.onclick = async () => {
        if (confirm("Delete this note?")) {
          await window.api.deleteNote(n.id);
          loadNotes();
        }
      };

      notesGrid.appendChild(card);
    });
  }
}

function openNoteForm(n = {}) {
  editingNoteId = n.id || null;
  noteModalTitle.textContent = editingNoteId ? "Edit Note" : "New Note";
  noteForm.noteTitle.value = n.title || "";
  noteForm.noteText.value = n.text || "";
  noteModal.show();
}

noteForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    title: noteForm.noteTitle.value,
    text: noteForm.noteText.value
  };
  if (editingNoteId) {
    await window.api.updateNote({ id: editingNoteId, ...data });
  } else {
    await window.api.createNote(data);
  }
  noteModal.hide();
  loadNotes();
});

document.getElementById("btnNewNote").onclick = () => openNoteForm();
window.addEventListener("DOMContentLoaded", loadNotes);
