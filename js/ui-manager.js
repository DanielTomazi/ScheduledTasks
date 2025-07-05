class UIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentFilter = 'all';
        this.currentSort = 'dueDate';
        this.sortDirection = 'asc';
        this.selectedPriorities = [];
        this.searchQuery = '';
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTheme();
        
        this.taskManager.addObserver(this);
    }

    update(action, data) {
        switch (action) {
            case 'tasksLoaded':
            case 'taskCreated':
            case 'taskUpdated':
            case 'taskDeleted':
            case 'tasksImported':
            case 'tasksCleared':
                this.renderTasks();
                this.updateCounts();
                break;
        }
    }

    initializeElements() {
        // Header elements
        this.addTaskBtn = Utils.DOMUtils.querySelector('#addTaskBtn');
        this.darkModeToggle = Utils.DOMUtils.querySelector('#darkModeToggle');

        // Filter elements
        this.filterButtons = Utils.DOMUtils.querySelectorAll('.filter-btn');
        this.priorityFilters = Utils.DOMUtils.querySelectorAll('.priority-filter');

        // Search and sort elements
        this.searchInput = Utils.DOMUtils.querySelector('#searchInput');
        this.sortSelect = Utils.DOMUtils.querySelector('#sortSelect');

        // Task list elements
        this.taskList = Utils.DOMUtils.querySelector('#taskList');
        this.emptyState = Utils.DOMUtils.querySelector('#emptyState');

        // Modal elements
        this.taskModal = Utils.DOMUtils.querySelector('#taskModal');
        this.confirmModal = Utils.DOMUtils.querySelector('#confirmModal');
        this.taskForm = Utils.DOMUtils.querySelector('#taskForm');

        // Form elements
        this.modalTitle = Utils.DOMUtils.querySelector('#modalTitle');
        this.taskTitle = Utils.DOMUtils.querySelector('#taskTitle');
        this.taskDescription = Utils.DOMUtils.querySelector('#taskDescription');
        this.taskDueDate = Utils.DOMUtils.querySelector('#taskDueDate');
        this.taskPriority = Utils.DOMUtils.querySelector('#taskPriority');
        this.taskCategory = Utils.DOMUtils.querySelector('#taskCategory');

        // Modal buttons
        this.closeModal = Utils.DOMUtils.querySelector('#closeModal');
        this.cancelBtn = Utils.DOMUtils.querySelector('#cancelBtn');
        this.saveBtn = Utils.DOMUtils.querySelector('#saveBtn');

        // Confirmation modal elements
        this.confirmTitle = Utils.DOMUtils.querySelector('#confirmTitle');
        this.confirmMessage = Utils.DOMUtils.querySelector('#confirmMessage');
        this.confirmCancel = Utils.DOMUtils.querySelector('#confirmCancel');
        this.confirmOk = Utils.DOMUtils.querySelector('#confirmOk');

        // Count elements
        this.countElements = {
            all: Utils.DOMUtils.querySelector('#allCount'),
            pending: Utils.DOMUtils.querySelector('#pendingCount'),
            completed: Utils.DOMUtils.querySelector('#completedCount'),
            overdue: Utils.DOMUtils.querySelector('#overdueCount')
        };
    }

    bindEvents() {
        // Header events
        Utils.DOMUtils.addEventListener(this.addTaskBtn, 'click', () => {
            this.openTaskModal();
        });

        Utils.DOMUtils.addEventListener(this.darkModeToggle, 'click', () => {
            this.toggleDarkMode();
        });

        // Filter events
        this.filterButtons.forEach(btn => {
            Utils.DOMUtils.addEventListener(btn, 'click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        this.priorityFilters.forEach(btn => {
            Utils.DOMUtils.addEventListener(btn, 'click', (e) => {
                this.handlePriorityFilterToggle(e.target.dataset.priority);
            });
        });

        // Search and sort events
        Utils.DOMUtils.addEventListener(this.searchInput, 'input', (e) => {
            this.handleSearchChange(e.target.value);
        });

        Utils.DOMUtils.addEventListener(this.sortSelect, 'change', (e) => {
            this.handleSortChange(e.target.value);
        });

        // Modal events
        Utils.DOMUtils.addEventListener(this.closeModal, 'click', () => {
            this.closeTaskModal();
        });

        Utils.DOMUtils.addEventListener(this.cancelBtn, 'click', () => {
            this.closeTaskModal();
        });

        Utils.DOMUtils.addEventListener(this.taskForm, 'submit', (e) => {
            this.handleTaskSubmit(e);
        });

        // Modal backdrop close
        Utils.DOMUtils.addEventListener(this.taskModal, 'click', (e) => {
            if (e.target === this.taskModal) {
                this.closeTaskModal();
            }
        });

        Utils.DOMUtils.addEventListener(this.confirmModal, 'click', (e) => {
            if (e.target === this.confirmModal) {
                this.closeConfirmModal();
            }
        });

        // Confirmation modal events
        Utils.DOMUtils.addEventListener(this.confirmCancel, 'click', () => {
            this.closeConfirmModal();
        });

        // Keyboard events
        Utils.DOMUtils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeConfirmModal();
            }
        });
    }

    /**
     * Initializes theme based on user preference
     */
    initializeTheme() {
        const savedTheme = Utils.LocalStorageManager.load('tasksync_theme', 'light');
        this.setTheme(savedTheme);
    }

    /**
     * Sets the application theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = this.darkModeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            this.darkModeToggle.title = 'Modo claro';
        } else {
            icon.className = 'fas fa-moon';
            this.darkModeToggle.title = 'Modo escuro';
        }
        
        Utils.LocalStorageManager.save('tasksync_theme', theme);
    }

    /**
     * Toggles dark mode
     */
    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Handles filter change
     * @param {string} filter - Filter type
     */
    handleFilterChange(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    /**
     * Handles priority filter toggle
     * @param {string} priority - Priority level
     */
    handlePriorityFilterToggle(priority) {
        const index = this.selectedPriorities.indexOf(priority);
        if (index > -1) {
            this.selectedPriorities.splice(index, 1);
        } else {
            this.selectedPriorities.push(priority);
        }
        
        // Update active priority filter buttons
        this.priorityFilters.forEach(btn => {
            btn.classList.toggle('active', this.selectedPriorities.includes(btn.dataset.priority));
        });
        
        this.renderTasks();
    }

    /**
     * Handles search input change
     * @param {string} query - Search query
     */
    handleSearchChange(query) {
        this.searchQuery = query;
        this.renderTasks();
    }

    /**
     * Handles sort change
     * @param {string} sortBy - Sort criteria
     */
    handleSortChange(sortBy) {
        this.currentSort = sortBy;
        this.renderTasks();
    }

    /**
     * Renders the task list
     */
    renderTasks() {
        const filters = {
            status: this.currentFilter !== 'all' ? this.currentFilter : null,
            priority: this.selectedPriorities.length > 0 ? this.selectedPriorities : null,
            search: this.searchQuery
        };
        
        const filteredTasks = this.taskManager.getFilteredTasks(filters);
        const sortedTasks = this.taskManager.getSortedTasks(filteredTasks, this.currentSort, this.sortDirection);
        
        // Clear task list
        this.taskList.innerHTML = '';
        
        if (sortedTasks.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            sortedTasks.forEach(task => {
                this.renderTaskItem(task);
            });
        }
    }

    /**
     * Renders a single task item
     * @param {Object} task - Task object
     */
    renderTaskItem(task) {
        const taskElement = Utils.DOMUtils.createElement('div', {
            className: `task-item ${task.completed ? 'completed' : ''} ${this.isTaskOverdue(task) ? 'overdue' : ''}`,
            'data-task-id': task.id
        });

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title ${task.completed ? 'completed' : ''}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    ${Utils.StringUtils.sanitizeHtml(task.title)}
                </div>
                <div class="task-actions">
                    <button class="btn-icon-sm" data-action="edit" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-sm" data-action="delete" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${task.description ? `
                <div class="task-description">
                    ${Utils.StringUtils.sanitizeHtml(task.description)}
                </div>
            ` : ''}
            
            <div class="task-meta">
                <div class="task-info">
                    ${task.dueDate ? `
                        <div class="task-due-date ${this.isTaskOverdue(task) ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${Utils.DateUtils.formatDate(task.dueDate, { includeTime: true, relative: true })}
                        </div>
                    ` : ''}
                    
                    <div class="task-category ${task.category}">
                        ${this.getCategoryLabel(task.category)}
                    </div>
                </div>
                
                <div class="task-priority">
                    <span class="priority-indicator ${task.priority}"></span>
                    ${Utils.StringUtils.capitalize(task.priority)}
                </div>
            </div>
        `;

        // Add event listeners
        this.bindTaskItemEvents(taskElement, task);
        
        // Add animation
        taskElement.classList.add('fade-in');
        
        this.taskList.appendChild(taskElement);
    }

    /**
     * Binds events to task item elements
     * @param {HTMLElement} taskElement - Task element
     * @param {Object} task - Task object
     */
    bindTaskItemEvents(taskElement, task) {
        const toggleBtn = taskElement.querySelector('[data-action="toggle"]');
        const editBtn = taskElement.querySelector('[data-action="edit"]');
        const deleteBtn = taskElement.querySelector('[data-action="delete"]');

        Utils.DOMUtils.addEventListener(toggleBtn, 'click', () => {
            this.handleTaskToggle(task.id);
        });

        Utils.DOMUtils.addEventListener(editBtn, 'click', () => {
            this.openTaskModal(task);
        });

        Utils.DOMUtils.addEventListener(deleteBtn, 'click', () => {
            this.confirmTaskDeletion(task);
        });
    }

    /**
     * Checks if task is overdue
     * @param {Object} task - Task object
     * @returns {boolean} True if task is overdue
     */
    isTaskOverdue(task) {
        return !task.completed && task.dueDate && Utils.DateUtils.isOverdue(task.dueDate);
    }

    /**
     * Gets category label
     * @param {string} category - Category key
     * @returns {string} Category label
     */
    getCategoryLabel(category) {
        const labels = {
            work: 'Trabalho',
            personal: 'Pessoal',
            study: 'Estudos',
            health: 'Saúde',
            other: 'Outros'
        };
        return labels[category] || Utils.StringUtils.capitalize(category);
    }

    /**
     * Shows empty state
     */
    showEmptyState() {
        this.emptyState.style.display = 'flex';
    }

    /**
     * Hides empty state
     */
    hideEmptyState() {
        this.emptyState.style.display = 'none';
    }

    /**
     * Updates task counts
     */
    updateCounts() {
        const stats = this.taskManager.getTaskStats();
        
        Object.entries(this.countElements).forEach(([key, element]) => {
            if (element) {
                element.textContent = stats[key] || 0;
            }
        });
    }

    /**
     * Opens task modal
     * @param {Object} task - Task to edit (optional)
     */
    openTaskModal(task = null) {
        this.currentEditingTask = task;
        
        // Set modal title
        this.modalTitle.textContent = task ? 'Editar Tarefa' : 'Nova Tarefa';
        
        // Reset form
        this.taskForm.reset();
        
        // Populate form if editing
        if (task) {
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.taskDueDate.value = task.dueDate ? 
                task.dueDate.toISOString().slice(0, 16) : '';
            this.taskPriority.value = task.priority;
            this.taskCategory.value = task.category;
        } else {
            // Set default due date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            this.taskDueDate.value = tomorrow.toISOString().slice(0, 16);
        }
        
        // Show modal
        this.taskModal.classList.add('show');
        this.taskTitle.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes task modal
     */
    closeTaskModal() {
        this.taskModal.classList.remove('show');
        this.currentEditingTask = null;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear form errors
        this.clearFormErrors();
    }

    /**
     * Handles task form submission
     * @param {Event} e - Form submit event
     */
    handleTaskSubmit(e) {
        e.preventDefault();
        
        // Clear previous errors
        this.clearFormErrors();
        
        // Get form data
        const formData = new FormData(this.taskForm);
        const taskData = {
            title: this.taskTitle.value.trim(),
            description: this.taskDescription.value.trim(),
            dueDate: this.taskDueDate.value ? new Date(this.taskDueDate.value) : null,
            priority: this.taskPriority.value,
            category: this.taskCategory.value
        };
        
        let result;
        if (this.currentEditingTask) {
            // Update existing task
            result = this.taskManager.updateTask(this.currentEditingTask.id, taskData);
        } else {
            // Create new task
            result = this.taskManager.createTask(taskData);
        }
        
        if (result.success) {
            this.closeTaskModal();
            const action = this.currentEditingTask ? 'atualizada' : 'criada';
            Utils.NotificationUtils.showToast(`Tarefa ${action} com sucesso!`, 'success');
        } else {
            if (result.errors) {
                this.displayFormErrors(result.errors);
            } else {
                Utils.NotificationUtils.showToast(result.error || 'Erro ao salvar tarefa', 'error');
            }
        }
    }

    /**
     * Displays form errors
     * @param {Object} errors - Validation errors
     */
    displayFormErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const fieldElement = this[`task${Utils.StringUtils.capitalize(field)}`];
            if (fieldElement) {
                fieldElement.style.borderColor = 'var(--danger-color)';
                
                // Add error message
                const errorElement = Utils.DOMUtils.createElement('div', {
                    className: 'form-error',
                    textContent: message
                });
                
                fieldElement.parentNode.appendChild(errorElement);
            }
        });
    }

    /**
     * Clears form errors
     */
    clearFormErrors() {
        // Reset border colors
        [this.taskTitle, this.taskDescription, this.taskDueDate, this.taskPriority, this.taskCategory]
            .forEach(field => {
                if (field) {
                    field.style.borderColor = '';
                }
            });
        
        // Remove error messages
        const errorElements = this.taskModal.querySelectorAll('.form-error');
        errorElements.forEach(el => el.remove());
    }

    /**
     * Handles task toggle
     * @param {string} taskId - Task ID
     */
    handleTaskToggle(taskId) {
        const result = this.taskManager.toggleTaskCompletion(taskId);
        if (result.success) {
            const status = result.task.completed ? 'concluída' : 'reaberta';
            Utils.NotificationUtils.showToast(`Tarefa ${status}!`, 'success');
        } else {
            Utils.NotificationUtils.showToast(result.error || 'Erro ao atualizar tarefa', 'error');
        }
    }

    /**
     * Confirms task deletion
     * @param {Object} task - Task to delete
     */
    confirmTaskDeletion(task) {
        this.showConfirmModal(
            'Excluir Tarefa',
            `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
            () => this.handleTaskDeletion(task.id)
        );
    }

    /**
     * Handles task deletion
     * @param {string} taskId - Task ID
     */
    handleTaskDeletion(taskId) {
        const result = this.taskManager.deleteTask(taskId);
        if (result.success) {
            Utils.NotificationUtils.showToast('Tarefa excluída com sucesso!', 'success');
        } else {
            Utils.NotificationUtils.showToast(result.error || 'Erro ao excluir tarefa', 'error');
        }
    }

    /**
     * Shows confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback on confirmation
     */
    showConfirmModal(title, message, onConfirm) {
        this.confirmTitle.textContent = title;
        this.confirmMessage.textContent = message;
        
        // Remove previous event listeners
        const newConfirmBtn = this.confirmOk.cloneNode(true);
        this.confirmOk.parentNode.replaceChild(newConfirmBtn, this.confirmOk);
        this.confirmOk = newConfirmBtn;
        
        // Add new event listener
        Utils.DOMUtils.addEventListener(this.confirmOk, 'click', () => {
            this.closeConfirmModal();
            onConfirm();
        });
        
        // Show modal
        this.confirmModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes confirmation modal
     */
    closeConfirmModal() {
        this.confirmModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Export for use in other modules
window.UIManager = UIManager;
