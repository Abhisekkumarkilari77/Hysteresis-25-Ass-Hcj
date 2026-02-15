// Elements
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeBtn = document.getElementById('themeBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toolbarBtns = document.querySelectorAll('.toolbar-btn');
const editorPanel = document.querySelector('.editor-panel');
const previewPanel = document.querySelector('.preview-panel');

// Load saved content and theme
editor.value = localStorage.getItem('markdown') || '';
const isDark = localStorage.getItem('theme') === 'dark';
if (isDark) {
    document.body.classList.add('dark-mode');
    themeBtn.textContent = '☀️ Light';
}

// Update preview
function updatePreview() {
    const markdown = editor.value;
    preview.innerHTML = marked.parse(markdown);
    localStorage.setItem('markdown', markdown);
}

// Initial render
updatePreview();

// Real-time preview
editor.addEventListener('input', updatePreview);

// Theme toggle
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Clear editor
clearBtn.addEventListener('click', () => {
    if (confirm('Clear all content?')) {
        editor.value = '';
        updatePreview();
    }
});

// Download as .md file
downloadBtn.addEventListener('click', () => {
    const blob = new Blob([editor.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
});

// Toolbar buttons - insert syntax
toolbarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const syntax = btn.dataset.syntax;
        const offset = parseInt(btn.dataset.offset);
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        let newText;
        let cursorPos;

        if (syntax.includes('text') || syntax.includes('code') || syntax.includes('bold') || syntax.includes('italic')) {
            // Replace placeholder with selected text or keep placeholder
            if (selectedText) {
                if (syntax.includes('[text](url)')) {
                    newText = `[${selectedText}](url)`;
                    cursorPos = start + selectedText.length + 3;
                } else {
                    newText = syntax.replace(/\*\*bold\*\*|\*italic\*|`code`/, selectedText);
                    cursorPos = start + newText.length;
                }
            } else {
                newText = syntax;
                cursorPos = start + offset;
            }
        } else {
            newText = syntax + selectedText;
            cursorPos = start + syntax.length + selectedText.length;
        }

        editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
        editor.focus();
        editor.setSelectionRange(cursorPos, cursorPos);
        updatePreview();
    });
});

// Scroll sync
let isEditorScrolling = false;
let isPreviewScrolling = false;

editorPanel.addEventListener('scroll', () => {
    if (isPreviewScrolling) return;
    isEditorScrolling = true;
    
    const scrollPercentage = editorPanel.scrollTop / (editorPanel.scrollHeight - editorPanel.clientHeight);
    previewPanel.scrollTop = scrollPercentage * (previewPanel.scrollHeight - previewPanel.clientHeight);
    
    setTimeout(() => { isEditorScrolling = false; }, 100);
});

previewPanel.addEventListener('scroll', () => {
    if (isEditorScrolling) return;
    isPreviewScrolling = true;
    
    const scrollPercentage = previewPanel.scrollTop / (previewPanel.scrollHeight - previewPanel.clientHeight);
    editorPanel.scrollTop = scrollPercentage * (editorPanel.scrollHeight - editorPanel.clientHeight);
    
    setTimeout(() => { isPreviewScrolling = false; }, 100);
});

// Tab key support
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
    }
});
