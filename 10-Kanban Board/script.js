// ============================================
// KANBAN BOARD - JAVASCRIPT
// ============================================

// ============================================
// STATE & LOCAL STORAGE MANAGEMENT
// ============================================

class KanbanBoard {
    constructor() {
        this.tasks = [];
        this.currentEditingTaskId = null;
        this.taskToDeleteId = null;
        this.draggedTaskId = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // When creating new IDs, we need to calculate based on existing tasks
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.render();
    }

    // ============================================
    // LOCAL STORAGE OPERATIONS
    // ============================================

    /**
     * Load all tasks from Local Storage
     */
    loadFromLocalStorage() {
        try {
            const savedTasks = localStorage.getItem('kanbanTasks');
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
            
            // Ensure all tasks have required properties
            this.tasks = this.tasks.map(task => ({
                ...task,
                id: task.id || this.generateId(),
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                createdAt: task.createdAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error loading from Local Storage:', error);
            this.tasks = [];
        }
    }

    /**
     * Save all tasks to Local Storage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('kanbanTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving to Local Storage:', error);
            this.showToast('Error saving tasks. Please try again.', 'error');
        }
    }

    /**
     * Generate a unique task ID
     */
    generateId() {
        // Use timestamp + random number for uniqueness
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    /**
     * Add a new task
     */
    addTask(title, description = '') {
        // Validation
        if (!title || title.trim() === '') {
            document.getElementById('titleError').textContent = 'Task title cannot be empty';
            return false;
        }

        // Clear any previous error
        document.getElementById('titleError').textContent = '';

        const newTask = {
            id: this.generateId(),
            title: title.trim(),
            description: description.trim(),
            status: 'todo',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveToLocalStorage();
        this.showToast('✓ Task added successfully');
        return true;
    }

    /**
     * Update an existing task
     */
    updateTask(taskId, title, description = '') {
        // Validation
        if (!title || title.trim() === '') {
            document.getElementById('titleError').textContent = 'Task title cannot be empty';
            return false;
        }

        // Clear any previous error
        document.getElementById('titleError').textContent = '';

        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error('Task not found:', taskId);
            return false;
        }

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            title: title.trim(),
            description: description.trim()
        };

        this.saveToLocalStorage();
        this.showToast('✓ Task updated successfully');
        return true;
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error('Task not found:', taskId);
            return false;
        }

        this.tasks.splice(taskIndex, 1);
        this.saveToLocalStorage();
        this.showToast('✓ Task deleted');
        return true;
    }

    /**
     * Update task status (for drag & drop)
     */
    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return false;
        }

        task.status = newStatus;
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Get tasks by status
     */
    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    // ============================================
    // DOM & RENDERING
    // ============================================

    /**
     * Render the entire board
     */
    render() {
        this.renderTasks('todo');
        this.renderTasks('inprogress');
        this.renderTasks('done');
        this.updateTaskCounts();
    }

    /**
     * Render tasks for a specific status
     */
    renderTasks(status) {
        const container = document.getElementById(`${status}-tasks`);
        const tasks = this.getTasksByStatus(status);

        // Clear container
        container.innerHTML = '';

        // If no tasks, show empty state
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks yet</div>';
            return;
        }

        // Render each task
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    /**
     * Create a task card element
     */
    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        taskEl.draggable = true;
        taskEl.dataset.taskId = task.id;

        // Format date
        const createdDate = new Date(task.createdAt);
        const dateString = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const timeString = createdDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Build HTML
        const descriptionHtml = task.description ? 
            `<p class="task-description">${this.escapeHtml(task.description)}</p>` : '';

        taskEl.innerHTML = `
            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
            ${descriptionHtml}
            <div class="task-meta">
                <span class="task-date">📅 ${dateString} ${timeString}</span>
            </div>
            <div class="task-actions">
                <button class="btn-task-action btn-task-edit" title="Edit">✏️ Edit</button>
                <button class="btn-task-action btn-task-delete" title="Delete">🗑️</button>
            </div>
        `;

        // Add event listeners
        taskEl.addEventListener('dragstart', (e) => this.onDragStart(e, task.id));
        taskEl.addEventListener('dragend', (e) => this.onDragEnd(e));

        const editBtn = taskEl.querySelector('.btn-task-edit');
        const deleteBtn = taskEl.querySelector('.btn-task-delete');

        editBtn.addEventListener('click', () => this.openEditModal(task));
        deleteBtn.addEventListener('click', () => this.confirmDelete(task.id));

        return taskEl;
    }

    /**
     * Update task count badges
     */
    updateTaskCounts() {
        const statuses = ['todo', 'inprogress', 'done'];
        statuses.forEach(status => {
            const count = this.getTasksByStatus(status).length;
            document.getElementById(`count-${status}`).textContent = count;
        });
    }

    /**
     * Escape HTML characters to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ============================================
    // DRAG & DROP OPERATIONS
    // ============================================

    /**
     * Handle drag start
     */
    onDragStart(e, taskId) {
        this.draggedTaskId = taskId;
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        taskElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Handle drag end
     */
    onDragEnd(e) {
        const taskElement = document.querySelector(`[data-task-id="${this.draggedTaskId}"]`);
        if (taskElement) {
            taskElement.classList.remove('dragging');
        }
        this.draggedTaskId = null;
        
        // Remove drag-over class from all containers
        document.querySelectorAll('.tasks-container').forEach(container => {
            container.classList.remove('drag-over');
        });
    }

    /**
     * Setup drag over events on containers
     */
    setupDragOverEvents() {
        const containers = document.querySelectorAll('.tasks-container');
        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', (e) => {
                // Only remove if we're leaving the container itself
                if (e.target === container) {
                    container.classList.remove('drag-over');
                }
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                
                if (this.draggedTaskId) {
                    // Get the status from the container's parent column
                    const column = container.closest('.column');
                    const newStatus = column.dataset.status;
                    
                    this.updateTaskStatus(this.draggedTaskId, newStatus);
                    this.render();
                }
            });
        });
    }

    // ============================================
    // MODAL OPERATIONS
    // ============================================

    /**
     * Open "Add Task" modal
     */
    openAddModal() {
        this.currentEditingTaskId = null;
        document.getElementById('modalTitle').textContent = 'Add New Task';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('titleError').textContent = '';
        this.openModal('taskModal');
        document.getElementById('taskTitle').focus();
    }

    /**
     * Open "Edit Task" modal
     */
    openEditModal(task) {
        this.currentEditingTaskId = task.id;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('titleError').textContent = '';
        this.openModal('taskModal');
        document.getElementById('taskTitle').focus();
    }

    /**
     * Open modal
     */
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // ============================================
    // DELETE CONFIRMATION
    // ============================================

    /**
     * Show delete confirmation
     */
    confirmDelete(taskId) {
        this.taskToDeleteId = taskId;
        this.openModal('confirmModal');
    }

    /**
     * Confirm and delete task
     */
    performDelete() {
        if (this.taskToDeleteId) {
            this.deleteTask(this.taskToDeleteId);
            this.render();
            this.closeModal('confirmModal');
            this.taskToDeleteId = null;
        }
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // EVENT LISTENERS SETUP
    // ============================================

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Add task button
        document.getElementById('btnAddTask').addEventListener('click', () => {
            this.openAddModal();
        });

        // Task form submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;

            if (this.currentEditingTaskId) {
                // Update existing task
                if (this.updateTask(this.currentEditingTaskId, title, description)) {
                    this.render();
                    this.closeModal('taskModal');
                }
            } else {
                // Add new task
                if (this.addTask(title, description)) {
                    this.render();
                    this.closeModal('taskModal');
                }
            }
        });

        // Close modal buttons
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            this.closeModal('taskModal');
        });

        document.getElementById('btnCancelTask').addEventListener('click', () => {
            this.closeModal('taskModal');
        });

        // Delete confirmation
        document.getElementById('btnConfirmDelete').addEventListener('click', () => {
            this.performDelete();
        });

        document.getElementById('btnCancelDelete').addEventListener('click', () => {
            this.closeModal('confirmModal');
            this.taskToDeleteId = null;
        });

        // Close modal when clicking outside
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal('taskModal');
            }
        });

        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.closeModal('confirmModal');
                this.taskToDeleteId = null;
            }
        });

        // Setup drag & drop
        this.setupDragOverEvents();
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

// Initialize Kanban board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = new KanbanBoard();
});

// Re-setup drag events when tasks are rendered
const originalRender = KanbanBoard.prototype.render;
KanbanBoard.prototype.render = function() {
    originalRender.call(this);
    this.setupDragOverEvents();
};
