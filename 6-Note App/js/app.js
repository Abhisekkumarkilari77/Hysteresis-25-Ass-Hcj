// Notes App - Vanilla JS + LocalStorage
// Beginner-friendly, well-commented, single-file app logic.

(() => {
  // LocalStorage key
  const LS_KEY = 'notes_app_notes_v1';
  const THEME_KEY = 'notes_app_theme_v1';

  // DOM elements
  const form = document.getElementById('note-form');
  const titleInput = document.getElementById('note-title');
  const contentInput = document.getElementById('note-content');
  const categorySelect = document.getElementById('note-category');
  const notesList = document.getElementById('notes-list');
  const searchInput = document.getElementById('search-input');
  const filterCategory = document.getElementById('filter-category');
  const sortOrder = document.getElementById('sort-order');
  const charCount = document.getElementById('char-count');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const exportAllBtn = document.getElementById('export-all');
  const clearAllBtn = document.getElementById('clear-all');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalMeta = document.getElementById('modal-meta');
  const modalClose = document.getElementById('modal-close');
  const modalEdit = document.getElementById('modal-edit');
  const modalDelete = document.getElementById('modal-delete');
  const modalPin = document.getElementById('modal-pin');

  // In-memory notes array
  let notes = [];
  let activeNoteId = null; // for modal

  // Utility: safe localStorage get
  function loadNotesFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        localStorage.setItem(LS_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(raw) || [];
    } catch (e) {
      console.error('Failed to load notes:', e);
      return [];
    }
  }

  function saveNotesToStorage() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }

  // Create a new note object
  function createNote({title, content, category}){
    const now = new Date().toISOString();
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Others',
      createdAt: now,
      updatedAt: now,
      pinned: false
    };
  }

  // Render notes with search/filter/sort
  function renderNotes(){
    const q = searchInput.value.trim().toLowerCase();
    const cat = filterCategory.value;
    const sort = sortOrder.value; // desc or asc

    // Filter
    let list = notes.filter(n => {
      const matchesText = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      const matchesCat = cat === 'all' ? true : n.category === cat;
      return matchesText && matchesCat;
    });

    // Sort by date
    list.sort((a,b)=>{
      if (a.pinned === b.pinned) {
        return sort==='desc' ? (b.createdAt.localeCompare(a.createdAt)) : (a.createdAt.localeCompare(b.createdAt));
      }
      return a.pinned ? -1 : 1; // pinned first
    });

    notesList.innerHTML = '';
    if (list.length === 0) {
      notesList.innerHTML = '<p class="muted">No notes found.</p>';
      return;
    }

    for (const note of list) {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.dataset.id = note.id;

      const t = document.createElement('h3');
      t.className = 'note-title';
      t.textContent = note.title;

      const p = document.createElement('div');
      p.className = 'note-preview';
      p.textContent = note.content.length>120 ? note.content.slice(0,120)+'…' : note.content;

      const meta = document.createElement('div');
      meta.className = 'note-meta';
      meta.innerHTML = `<span>${new Date(note.createdAt).toLocaleString()}</span><span>${note.category}${note.pinned? ' • Pinned':''}</span>`;

      const actions = document.createElement('div');
      actions.className = 'note-actions';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn';
      viewBtn.textContent = 'Open';
      viewBtn.addEventListener('click', ()=> openModal(note.id));

      const pinBtn = document.createElement('button');
      pinBtn.className = 'btn';
      pinBtn.textContent = note.pinned ? 'Unpin' : 'Pin';
      pinBtn.addEventListener('click', (e)=>{ e.stopPropagation(); togglePin(note.id); });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn danger';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); removeNote(note.id); });

      actions.appendChild(viewBtn);
      actions.appendChild(pinBtn);
      actions.appendChild(delBtn);

      card.appendChild(t);
      card.appendChild(p);
      card.appendChild(meta);
      card.appendChild(actions);

      notesList.appendChild(card);
    }
  }

  // Add a new note from form
  function handleAddNote(e){
    e.preventDefault();
    const title = titleInput.value || '';
    const content = contentInput.value || '';
    const category = categorySelect.value;

    // Validation
    let ok = true;
    document.getElementById('title-error').textContent = '';
    document.getElementById('content-error').textContent = '';

    if (!title.trim()) { document.getElementById('title-error').textContent = 'Title is required'; ok=false; }
    if (!content.trim()) { document.getElementById('content-error').textContent = 'Content is required'; ok=false; }
    if (!ok) return;

    const note = createNote({title,content,category});
    notes.unshift(note); // newest-first
    saveNotesToStorage();
    renderNotes();
    form.reset();
    charCount.textContent = '0 chars';
    localStorage.removeItem('notes_app_draft_v1');
  }

  // Remove note with confirmation
  function removeNote(id){
    if (!confirm('Delete this note? This cannot be undone.')) return;
    notes = notes.filter(n=>n.id!==id);
    saveNotesToStorage();
    renderNotes();
  }

  // Toggle pin
  function togglePin(id){
    const n = notes.find(x=>x.id===id); if(!n) return;
    n.pinned = !n.pinned; n.updatedAt = new Date().toISOString();
    saveNotesToStorage(); renderNotes();
  }

  // Modal open
  function openModal(id){
    const n = notes.find(x=>x.id===id); if(!n) return;
    activeNoteId = id;
    modalTitle.textContent = n.title;
    modalBody.textContent = n.content;
    modalMeta.textContent = `Category: ${n.category} • Created: ${new Date(n.createdAt).toLocaleString()} • Updated: ${new Date(n.updatedAt).toLocaleString()}`;
    modalPin.textContent = n.pinned ? 'Unpin' : 'Pin';
    modal.classList.remove('hidden');
  }

  function closeModal(){ modal.classList.add('hidden'); activeNoteId = null; }

  // Edit currently open note
  function editActiveNote(){
    if (!activeNoteId) return;
    const n = notes.find(x=>x.id===activeNoteId); if(!n) return;
    // Prefill composer for editing
    titleInput.value = n.title;
    contentInput.value = n.content;
    categorySelect.value = n.category || 'Others';
    // Remove old note (we'll create new version on save)
    notes = notes.filter(x=>x.id!==activeNoteId);
    saveNotesToStorage(); renderNotes();
    closeModal();
  }

  // Delete from modal
  function deleteActiveNote(){ if (activeNoteId) removeNote(activeNoteId); closeModal(); }

  // Toggle pin from modal
  function pinActiveNote(){ if (!activeNoteId) return; togglePin(activeNoteId); openModal(activeNoteId); }

  // Character counter + auto-save draft
  function handleTyping(){
    const len = contentInput.value.length + titleInput.value.length;
    charCount.textContent = `${len} chars`;
    // Auto-save draft
    const draft = { title: titleInput.value, content: contentInput.value, category: categorySelect.value };
    localStorage.setItem('notes_app_draft_v1', JSON.stringify(draft));
  }

  // Export a single note as text file
  function exportNote(n){
    const blob = new Blob([`${n.title}\n\n${n.content}`], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${n.title.replace(/[^a-z0-9]/gi,'_').slice(0,40)}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Export all notes into a single txt
  function exportAll(){
    if (notes.length===0) { alert('No notes to export'); return; }
    const parts = notes.map(n=>`# ${n.title}\n${n.category} • ${new Date(n.createdAt).toLocaleString()}\n\n${n.content}\n\n---\n\n`);
    const blob = new Blob([parts.join('\n')],{type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'notes_export.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Clear all notes (with confirm)
  function clearAll(){ if (!confirm('Clear all notes? This cannot be undone.')) return; notes=[]; saveNotesToStorage(); renderNotes(); }

  // Theme toggle
  function initTheme(){
    const t = localStorage.getItem(THEME_KEY) || 'light';
    document.body.classList.toggle('dark', t==='dark');
  }
  function toggleTheme(){ const now = document.body.classList.toggle('dark'); localStorage.setItem(THEME_KEY, now? 'dark':'light'); }

  // Restore draft if present
  function restoreDraft(){
    try{
      const raw = localStorage.getItem('notes_app_draft_v1');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title) titleInput.value = d.title;
      if (d.content) contentInput.value = d.content;
      if (d.category) categorySelect.value = d.category;
      charCount.textContent = `${(d.title||'').length + (d.content||'').length} chars`;
    }catch(e){/* ignore */}
  }

  // Boot
  function init(){
    notes = loadNotesFromStorage();
    initTheme();
    restoreDraft();
    renderNotes();

    form.addEventListener('submit', handleAddNote);
    searchInput.addEventListener('input', renderNotes);
    filterCategory.addEventListener('change', renderNotes);
    sortOrder.addEventListener('change', renderNotes);
    contentInput.addEventListener('input', handleTyping);
    titleInput.addEventListener('input', handleTyping);
    toggleThemeBtn.addEventListener('click', toggleTheme);
    modalClose.addEventListener('click', closeModal);
    modalEdit.addEventListener('click', editActiveNote);
    modalDelete.addEventListener('click', deleteActiveNote);
    modalPin.addEventListener('click', pinActiveNote);
    exportAllBtn.addEventListener('click', exportAll);
    clearAllBtn.addEventListener('click', clearAll);

    // Click outside modal to close
    modal.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);

})();
