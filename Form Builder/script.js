/**
 * Form Builder - Vanilla JavaScript
 * Admin-style form builder with Local Storage persistence
 */

// ============================================
// State
// ============================================

const STORAGE_KEY = 'formBuilderData';
let formFields = [];
let editingFieldIndex = -1;
let isPreviewMode = false;

// ============================================
// DOM Elements
// ============================================

const sidebar = document.getElementById('sidebar');
const formCanvas = document.getElementById('formCanvas');
const fieldsContainer = document.getElementById('fieldsContainer');
const emptyState = document.getElementById('emptyState');
const formTitleInput = document.getElementById('formTitle');
const formDescriptionInput = document.getElementById('formDescription');
const canvasHeader = document.getElementById('canvasHeader');
const canvasFooter = document.getElementById('canvasFooter');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');
const resetBtn = document.getElementById('resetBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalSave = document.getElementById('modalSave');

// ============================================
// Field Definitions
// ============================================

const FIELD_TYPES = {
  text: { label: 'Text Input', placeholder: true },
  email: { label: 'Email Input', placeholder: true },
  number: { label: 'Number Input', placeholder: true },
  textarea: { label: 'Textarea', placeholder: true },
  checkbox: { label: 'Checkbox', options: true },
  radio: { label: 'Radio Buttons', options: true },
  select: { label: 'Dropdown', options: true },
  date: { label: 'Date Input', placeholder: false }
};

/**
 * Creates a new field object with default values
 */
function createField(type) {
  const defaults = {
    type,
    label: FIELD_TYPES[type]?.label || type,
    placeholder: '',
    required: false,
    defaultValue: '',
    options: (FIELD_TYPES[type]?.options) ? ['Option 1', 'Option 2'] : []
  };
  return { ...defaults };
}

// ============================================
// Field Rendering
// ============================================

/**
 * Renders the preview/input for a single field
 */
function renderFieldPreview(field) {
  const div = document.createElement('div');
  div.className = 'field-preview';

  const labelEl = document.createElement('label');
  labelEl.textContent = field.label;
  if (field.required) {
    const span = document.createElement('span');
    span.className = 'required-mark';
    span.textContent = '*';
    labelEl.appendChild(span);
  }
  div.appendChild(labelEl);

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date': {
      const input = document.createElement('input');
      input.type = field.type;
      input.placeholder = field.placeholder || '';
      input.value = field.defaultValue || '';
      if (field.required) input.required = true;
      div.appendChild(input);
      break;
    }
    case 'textarea': {
      const textarea = document.createElement('textarea');
      textarea.placeholder = field.placeholder || '';
      textarea.value = field.defaultValue || '';
      if (field.required) textarea.required = true;
      div.appendChild(textarea);
      break;
    }
    case 'checkbox': {
      const options = field.options || [];
      const container = document.createElement('div');
      container.className = 'options-preview';
      options.forEach((opt, i) => {
        const row = document.createElement('div');
        row.className = 'option-row';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `cb-${Date.now()}-${i}`;
        input.name = `cb-${field.label.replace(/\s/g, '-')}`;
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = opt;
        row.appendChild(input);
        row.appendChild(label);
        container.appendChild(row);
      });
      div.appendChild(container);
      break;
    }
    case 'radio': {
      const options = field.options || [];
      const container = document.createElement('div');
      container.className = 'options-preview';
      const name = `radio-${field.label.replace(/\s/g, '-')}-${Date.now()}`;
      options.forEach((opt, i) => {
        const row = document.createElement('div');
        row.className = 'option-row';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.id = `radio-${Date.now()}-${i}`;
        if (field.defaultValue === opt) input.checked = true;
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = opt;
        row.appendChild(input);
        row.appendChild(label);
        container.appendChild(row);
      });
      div.appendChild(container);
      break;
    }
    case 'select': {
      const select = document.createElement('select');
      if (!field.required) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '-- Select --';
        select.appendChild(empty);
      }
      (field.options || []).forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (field.defaultValue === opt) option.selected = true;
        select.appendChild(option);
      });
      if (field.required) select.required = true;
      div.appendChild(select);
      break;
    }
    default:
      break;
  }

  return div;
}

/**
 * Renders a single field card
 */
function renderFieldCard(field, index) {
  const card = document.createElement('div');
  card.className = 'field-card';
  card.dataset.index = index;

  const header = document.createElement('div');
  header.className = 'field-card-header';

  const labelDisplay = document.createElement('span');
  labelDisplay.className = 'field-label-display';
  labelDisplay.textContent = field.label;
  if (field.required) {
    const mark = document.createElement('span');
    mark.className = 'required-mark';
    mark.textContent = ' *';
    labelDisplay.appendChild(mark);
  }

  const actions = document.createElement('div');
  actions.className = 'field-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'field-action-btn';
  editBtn.innerHTML = '✎';
  editBtn.title = 'Edit';
  editBtn.addEventListener('click', () => openEditModal(index));

  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'field-action-btn';
  upBtn.innerHTML = '↑';
  upBtn.title = 'Move up';
  upBtn.disabled = index === 0;
  upBtn.addEventListener('click', () => moveField(index, -1));

  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'field-action-btn';
  downBtn.innerHTML = '↓';
  downBtn.title = 'Move down';
  downBtn.disabled = index === formFields.length - 1;
  downBtn.addEventListener('click', () => moveField(index, 1));

  const dupBtn = document.createElement('button');
  dupBtn.type = 'button';
  dupBtn.className = 'field-action-btn';
  dupBtn.innerHTML = '⧉';
  dupBtn.title = 'Duplicate';
  dupBtn.addEventListener('click', () => duplicateField(index));

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'field-action-btn delete';
  delBtn.innerHTML = '✕';
  delBtn.title = 'Delete';
  delBtn.addEventListener('click', () => deleteField(index));

  actions.append(editBtn, upBtn, downBtn, dupBtn, delBtn);
  header.appendChild(labelDisplay);
  header.appendChild(actions);

  const preview = renderFieldPreview(field);

  card.appendChild(header);
  card.appendChild(preview);

  return card;
}

/**
 * Renders all fields to the canvas
 */
function renderFields() {
  fieldsContainer.innerHTML = '';

  if (formFields.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  formFields.forEach((field, index) => {
    const card = renderFieldCard(field, index);
    fieldsContainer.appendChild(card);
  });

  saveToStorage();
}

// ============================================
// Field Operations
// ============================================

function addField(type) {
  if (!FIELD_TYPES[type]) return;
  const field = createField(type);
  formFields.push(field);
  renderFields();
}

function deleteField(index) {
  formFields.splice(index, 1);
  renderFields();
}

function moveField(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= formFields.length) return;
  [formFields[index], formFields[newIndex]] = [formFields[newIndex], formFields[index]];
  renderFields();
}

function duplicateField(index) {
  const copy = JSON.parse(JSON.stringify(formFields[index]));
  copy.label = copy.label + ' (copy)';
  formFields.splice(index + 1, 0, copy);
  renderFields();
}

// ============================================
// Edit Modal
// ============================================

function openEditModal(index) {
  editingFieldIndex = index;
  const field = formFields[index];
  if (!field) return;

  const titleEl = document.getElementById('modalTitle');
  titleEl.textContent = `Edit ${FIELD_TYPES[field.type]?.label || field.type}`;

  modalBody.innerHTML = buildModalForm(field);
  modalOverlay.classList.add('visible');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function buildModalForm(field) {
  const hasOptions = FIELD_TYPES[field.type]?.options;
  const hasPlaceholder = FIELD_TYPES[field.type]?.placeholder !== false;

  let html = `
    <div class="form-group">
      <label for="edit-label">Label</label>
      <input type="text" id="edit-label" value="${escapeHtml(field.label)}" required>
    </div>
  `;

  if (hasPlaceholder) {
    html += `
      <div class="form-group">
        <label for="edit-placeholder">Placeholder</label>
        <input type="text" id="edit-placeholder" value="${escapeHtml(field.placeholder || '')}">
      </div>
    `;
  }

  html += `
    <div class="form-group">
      <div class="checkbox-group">
        <input type="checkbox" id="edit-required" ${field.required ? 'checked' : ''}>
        <label for="edit-required">Required</label>
      </div>
    </div>
  `;

  if (field.type !== 'checkbox') {
    const defaultLabel = hasOptions ? 'Default option (must match an option exactly)' : 'Default value';
    html += `
      <div class="form-group">
        <label for="edit-default">${defaultLabel}</label>
        <input type="text" id="edit-default" value="${escapeHtml(field.defaultValue || '')}" ${hasOptions ? 'list="edit-default-options"' : ''}>
        ${hasOptions ? `<datalist id="edit-default-options">${(field.options || []).map(opt => `<option value="${escapeHtml(opt)}">`).join('')}</datalist>` : ''}
      </div>
    `;
  }

  if (hasOptions) {
    html += `
      <div class="form-group">
        <label>Options</label>
        <div class="options-editor" id="optionsEditor">
          ${(field.options || []).map((opt, i) => `
            <div class="option-item">
              <input type="text" value="${escapeHtml(opt)}" data-opt-index="${i}">
              <button type="button" class="btn btn-icon remove-option" data-index="${i}" title="Remove">−</button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-outline add-option-btn" id="addOptionBtn">+ Add option</button>
      </div>
    `;
  }

  return html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function closeModal() {
  modalOverlay.classList.remove('visible');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  editingFieldIndex = -1;
}

function saveFieldFromModal() {
  if (editingFieldIndex < 0) return;

  const labelInput = document.getElementById('edit-label');
  if (!labelInput || !labelInput.value.trim()) {
    labelInput?.focus();
    return;
  }

  const field = formFields[editingFieldIndex];

  field.label = labelInput.value.trim();

  const placeholderInput = document.getElementById('edit-placeholder');
  if (placeholderInput) {
    field.placeholder = placeholderInput.value.trim();
  }

  const requiredInput = document.getElementById('edit-required');
  field.required = requiredInput?.checked ?? false;

  const defaultInput = document.getElementById('edit-default');
  if (defaultInput) {
    field.defaultValue = defaultInput.value.trim();
  }

  // If options changed, re-build default select - ensure default is valid
  if (optionsEditor && field.options && field.options.length && field.defaultValue) {
    if (!field.options.includes(field.defaultValue)) {
      field.defaultValue = '';
    }
  }

  const optionsEditor = document.getElementById('optionsEditor');
  if (optionsEditor) {
    const inputs = optionsEditor.querySelectorAll('.option-item input');
    field.options = Array.from(inputs)
      .map(i => i.value.trim())
      .filter(Boolean);
    if (field.options.length === 0) {
      field.options = ['Option 1'];
    }
  }

  closeModal();
  renderFields();
}

// ============================================
// Local Storage
// ============================================

function getFormData() {
  return {
    title: formTitleInput.value.trim() || 'Untitled Form',
    description: formDescriptionInput.value.trim(),
    fields: formFields
  };
}

function saveToStorage() {
  const data = getFormData();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Local Storage save failed:', e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (data.title) formTitleInput.value = data.title;
    if (data.description) formDescriptionInput.value = data.description;
    if (Array.isArray(data.fields)) {
      formFields = data.fields;
    }
  } catch (e) {
    console.warn('Local Storage load failed:', e);
  }
}

function resetBuilder() {
  if (!confirm('Reset the form builder? All fields will be removed.')) return;
  formFields = [];
  formTitleInput.value = 'Untitled Form';
  formDescriptionInput.value = '';
  localStorage.removeItem(STORAGE_KEY);
  renderFields();
}

// ============================================
// Preview Mode
// ============================================

function togglePreviewMode() {
  isPreviewMode = !isPreviewMode;
  document.body.classList.toggle('preview-mode', isPreviewMode);
  togglePreviewBtn.textContent = isPreviewMode ? 'Edit Mode' : 'Preview Mode';

  const headerEdit = document.getElementById('headerEdit');
  const headerPreview = document.getElementById('headerPreview');
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');

  if (isPreviewMode) {
    headerEdit.classList.add('hidden');
    headerPreview.classList.remove('hidden');
    previewTitle.textContent = formTitleInput.value.trim() || 'Untitled Form';
    previewDesc.textContent = formDescriptionInput.value.trim();
    previewDesc.classList.toggle('hidden', !formDescriptionInput.value.trim());
  } else {
    headerEdit.classList.remove('hidden');
    headerPreview.classList.add('hidden');
  }
}

// ============================================
// Export JSON
// ============================================

function exportJson() {
  const data = getFormData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form-structure.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// Theme Toggle
// ============================================

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('formBuilderTheme', next);
  } catch (_) {}
}

function loadTheme() {
  try {
    const saved = localStorage.getItem('formBuilderTheme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}
  updateThemeIcon();
}

function updateThemeIcon() {
  themeToggleBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☽';
}

// ============================================
// Event Listeners
// ============================================

document.querySelectorAll('.field-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    if (type) addField(type);
  });
});

formTitleInput.addEventListener('input', saveToStorage);
formTitleInput.addEventListener('change', saveToStorage);
formDescriptionInput.addEventListener('input', saveToStorage);
formDescriptionInput.addEventListener('change', saveToStorage);

togglePreviewBtn.addEventListener('click', togglePreviewMode);
resetBtn.addEventListener('click', resetBuilder);
exportJsonBtn.addEventListener('click', exportJson);
themeToggleBtn.addEventListener('click', () => {
  toggleTheme();
  updateThemeIcon();
});

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveFieldFromModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
    closeModal();
  }
});

// Delegate for dynamic modal content
modalBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-option')) {
    const item = e.target.closest('.option-item');
    item?.remove();
  }
  if (e.target.id === 'addOptionBtn') {
    const editor = document.getElementById('optionsEditor');
    if (!editor) return;
    const items = editor.querySelectorAll('.option-item');
    const nextIndex = items.length;
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
      <input type="text" placeholder="New option" data-opt-index="${nextIndex}">
      <button type="button" class="btn btn-icon remove-option" title="Remove">−</button>
    `;
    editor.appendChild(div);
  }
});

// ============================================
// Init
// ============================================

function init() {
  loadTheme();
  loadFromStorage();
  renderFields();
}

init();
