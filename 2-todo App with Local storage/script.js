const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalTodosSpan = document.getElementById('totalTodos');
const completedTodosSpan = document.getElementById('completedTodos');
let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos';
document.addEventListener('DOMContentLoaded', () => {
    loadTodosFromStorage();
    renderTodos();
    attachEventListeners();
});
function attachEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });

    clearBtn.addEventListener('click', clearCompletedTodos);
}
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a todo!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.push(newTodo);
    saveTodosToStorage();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}
function toggleTodoComplete(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodosToStorage();
    renderTodos();
}
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit your todo:', todo.text);
    
    if (newText !== null && newText.trim() !== '') {
        todos = todos.map(t => 
            t.id === id ? { ...t, text: newText.trim() } : t
        );
        saveTodosToStorage();
        renderTodos();
    }
}
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this todo?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodosToStorage();
        renderTodos();
    }
}
function clearCompletedTodos() {
    if (todos.some(t => t.completed)) {
        if (confirm('Are you sure you want to clear all completed todos?')) {
            todos = todos.filter(todo => !todo.completed);
            saveTodosToStorage();
            renderTodos();
        }
    } else {
        alert('No completed todos to clear!');
    }
}
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-message">No todos yet. Add one to get started!</div>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodoComplete(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    updateStats();
}
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;

    totalTodosSpan.textContent = `Total: ${total}`;
    completedTodosSpan.textContent = `Completed: ${completed}`;
}
function saveTodosToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function loadTodosFromStorage() {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    } else {
        todos = [];
    }
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
