class TaskManager {
    constructor() {
        this.tasks = [];
        this.storageKey = 'tasksync_tasks';
        this.observers = [];
        this.loadTasks();
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(action, data) {
        this.observers.forEach(observer => {
            if (typeof observer.update === 'function') {
                observer.update(action, data);
            }
        });
    }

    loadTasks() {
        try {
            const savedTasks = Utils.LocalStorageManager.load(this.storageKey, []);
            this.tasks = savedTasks.map(task => this.deserializeTask(task));
            this.notifyObservers('tasksLoaded', this.tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            const serializedTasks = this.tasks.map(task => this.serializeTask(task));
            Utils.LocalStorageManager.save(this.storageKey, serializedTasks);
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    }

    serializeTask(task) {
        return {
            ...task,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString()
        };
    }

    deserializeTask(taskData) {
        return {
            ...taskData,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            createdAt: new Date(taskData.createdAt),
            updatedAt: new Date(taskData.updatedAt)
        };
    }

    createTask(taskData) {
        try {
            // Validate task data
            const validation = Utils.ValidationUtils.validateTask(taskData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            // Create task object
            const task = {
                id: Utils.StringUtils.generateId('task'),
                title: taskData.title.trim(),
                description: taskData.description?.trim() || '',
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                priority: taskData.priority || 'medium',
                category: taskData.category || 'other',
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.tasks.push(task);
            
            this.saveTasks();
            this.notifyObservers('taskCreated', task);

            return { success: true, task };
        } catch (error) {
            console.error('Error creating task:', error);
            return { success: false, error: 'Erro interno ao criar tarefa' };
        }
    }

    updateTask(taskId, updates) {
        try {
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) {
                return { success: false, error: 'Tarefa não encontrada' };
            }

            const currentTask = this.tasks[taskIndex];
            const updatedTaskData = { ...currentTask, ...updates };

            if (updates.title !== undefined || updates.dueDate !== undefined) {
                const validation = Utils.ValidationUtils.validateTask(updatedTaskData);
                if (!validation.isValid) {
                    return { success: false, errors: validation.errors };
                }
            }

            const updatedTask = {
                ...currentTask,
                ...updates,
                dueDate: updates.dueDate ? new Date(updates.dueDate) : currentTask.dueDate,
                updatedAt: new Date()
            };

            this.tasks[taskIndex] = updatedTask;
            
            this.saveTasks();
            this.notifyObservers('taskUpdated', updatedTask);

            return { success: true, task: updatedTask };
        } catch (error) {
            console.error('Error updating task:', error);
            return { success: false, error: 'Erro interno ao atualizar tarefa' };
        }
    }

    deleteTask(taskId) {
        try {
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) {
                return { success: false, error: 'Tarefa não encontrada' };
            }

            const deletedTask = this.tasks[taskIndex];
            this.tasks.splice(taskIndex, 1);
            
            this.saveTasks();
            this.notifyObservers('taskDeleted', deletedTask);

            return { success: true, task: deletedTask };
        } catch (error) {
            console.error('Error deleting task:', error);
            return { success: false, error: 'Erro interno ao excluir tarefa' };
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            return { success: false, error: 'Tarefa não encontrada' };
        }

        return this.updateTask(taskId, { completed: !task.completed });
    }

    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }

    getAllTasks() {
        return [...this.tasks];
    }

    getFilteredTasks(filters = {}) {
        let filteredTasks = [...this.tasks];

        if (filters.status) {
            switch (filters.status) {
                case 'completed':
                    filteredTasks = filteredTasks.filter(task => task.completed);
                    break;
                case 'pending':
                    filteredTasks = filteredTasks.filter(task => !task.completed);
                    break;
                case 'overdue':
                    filteredTasks = filteredTasks.filter(task => 
                        !task.completed && task.dueDate && Utils.DateUtils.isOverdue(task.dueDate)
                    );
                    break;
            }
        }

        if (filters.priority && filters.priority.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                filters.priority.includes(task.priority)
            );
        }

        if (filters.category && filters.category.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                filters.category.includes(task.category)
            );
        }

        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        return filteredTasks;
    }

    getSortedTasks(tasks, sortBy = 'dueDate', direction = 'asc') {
        const sortFunctions = {
            dueDate: (a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return direction === 'asc' ? 1 : -1;
                if (!b.dueDate) return direction === 'asc' ? -1 : 1;
                
                const diff = a.dueDate.getTime() - b.dueDate.getTime();
                return direction === 'asc' ? diff : -diff;
            },
            priority: (a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
                return direction === 'asc' ? -diff : diff;
            },
            created: (a, b) => {
                const diff = a.createdAt.getTime() - b.createdAt.getTime();
                return direction === 'asc' ? diff : -diff;
            },
            title: (a, b) => {
                const diff = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
                return direction === 'asc' ? diff : -diff;
            }
        };

        const sortFunction = sortFunctions[sortBy] || sortFunctions.dueDate;
        return [...tasks].sort(sortFunction);
    }

    getTaskStats() {
        const all = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = this.tasks.filter(task => !task.completed).length;
        const overdue = this.tasks.filter(task => 
            !task.completed && task.dueDate && Utils.DateUtils.isOverdue(task.dueDate)
        ).length;

        const byPriority = {
            high: this.tasks.filter(task => task.priority === 'high').length,
            medium: this.tasks.filter(task => task.priority === 'medium').length,
            low: this.tasks.filter(task => task.priority === 'low').length
        };

        const byCategory = this.tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});

        return {
            all,
            completed,
            pending,
            overdue,
            byPriority,
            byCategory,
            completionRate: all > 0 ? Math.round((completed / all) * 100) : 0
        };
    }

    exportTasks() {
        try {
            const exportData = {
                tasks: this.tasks.map(task => this.serializeTask(task)),
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting tasks:', error);
            return null;
        }
    }

    importTasks(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.tasks || !Array.isArray(importData.tasks)) {
                return { success: false, error: 'Formato de arquivo inválido' };
            }

            const importedTasks = importData.tasks
                .map(taskData => this.deserializeTask(taskData))
                .filter(task => {
                    const validation = Utils.ValidationUtils.validateTask(task);
                    return validation.isValid;
                });

            if (importedTasks.length === 0) {
                return { success: false, error: 'Nenhuma tarefa válida encontrada' };
            }

            importedTasks.forEach(task => {
                task.id = Utils.StringUtils.generateId('task');
                task.createdAt = new Date();
                task.updatedAt = new Date();
            });

            this.tasks.push(...importedTasks);
            
            this.saveTasks();
            this.notifyObservers('tasksImported', importedTasks);

            return { 
                success: true, 
                count: importedTasks.length,
                tasks: importedTasks 
            };
        } catch (error) {
            console.error('Error importing tasks:', error);
            return { success: false, error: 'Erro ao processar arquivo' };
        }
    }

    clearAllTasks() {
        try {
            const taskCount = this.tasks.length;
            this.tasks = [];
            
            this.saveTasks();
            this.notifyObservers('tasksCleared', { count: taskCount });

            return { success: true, count: taskCount };
        } catch (error) {
            console.error('Error clearing tasks:', error);
            return { success: false, error: 'Erro ao limpar tarefas' };
        }
    }
}

window.TaskManager = TaskManager;
