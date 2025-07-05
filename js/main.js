class TaskSyncApp {
    constructor() {
        this.taskManager = null;
        this.uiManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Error initializing TaskSync:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initializes the application components
     */
    initializeApp() {
        try {
            // Initialize task manager
            this.taskManager = new TaskManager();
            
            // Initialize UI manager
            this.uiManager = new UIManager(this.taskManager);
            
            // Initialize additional features
            this.initializeKeyboardShortcuts();
            this.initializeServiceWorker();
            this.initializePeriodicUpdates();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('TaskSync initialized successfully');
            
            // Show welcome message for first-time users
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initializes keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        Utils.DOMUtils.addEventListener(document, 'keydown', (e) => {
            // Ctrl/Cmd + N: New task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.uiManager.openTaskModal();
            }
            
            // Ctrl/Cmd + F: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = Utils.DOMUtils.querySelector('#searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl/Cmd + D: Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.uiManager.toggleDarkMode();
            }
            
            // Ctrl/Cmd + E: Export tasks
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportTasks();
            }
        });
    }

    /**
     * Initializes service worker for offline support
     */
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Note: Service worker implementation would go here
                // For now, we'll just log that it's available
                console.log('Service Worker support detected');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Initializes periodic updates (like checking for overdue tasks)
     */
    initializePeriodicUpdates() {
        // Check for overdue tasks every minute
        setInterval(() => {
            this.checkOverdueTasks();
        }, 60000);
        
        // Initial check
        setTimeout(() => {
            this.checkOverdueTasks();
        }, 5000);
    }

    /**
     * Checks for overdue tasks and shows notifications
     */
    checkOverdueTasks() {
        if (!this.isInitialized) return;
        
        const stats = this.taskManager.getTaskStats();
        if (stats.overdue > 0) {
            const message = `Você tem ${stats.overdue} tarefa${stats.overdue > 1 ? 's' : ''} atrasada${stats.overdue > 1 ? 's' : ''}`;
            
            // Only show notification if user hasn't seen it recently
            const lastNotification = Utils.LocalStorageManager.load('lastOverdueNotification', 0);
            const now = Date.now();
            
            if (now - lastNotification > 30 * 60 * 1000) { // 30 minutes
                Utils.NotificationUtils.showToast(message, 'warning', 5000);
                Utils.LocalStorageManager.save('lastOverdueNotification', now);
            }
        }
    }

    /**
     * Shows welcome message for first-time users
     */
    showWelcomeMessage() {
        const hasSeenWelcome = Utils.LocalStorageManager.load('hasSeenWelcome', false);
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                Utils.NotificationUtils.showToast(
                    'Bem-vindo ao TaskSync! Comece criando sua primeira tarefa.',
                    'info',
                    5000
                );
                Utils.LocalStorageManager.save('hasSeenWelcome', true);
            }, 1000);
        }
    }

    /**
     * Exports tasks to a downloadable file
     */
    exportTasks() {
        try {
            const exportData = this.taskManager.exportTasks();
            if (!exportData) {
                Utils.NotificationUtils.showToast('Erro ao exportar tarefas', 'error');
                return;
            }
            
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `tasksync-backup-${Utils.DateUtils.formatDate(new Date(), { includeTime: false }).replace(/\s+/g, '-')}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            Utils.NotificationUtils.showToast('Tarefas exportadas com sucesso!', 'success');
        } catch (error) {
            console.error('Error exporting tasks:', error);
            Utils.NotificationUtils.showToast('Erro ao exportar tarefas', 'error');
        }
    }

    /**
     * Imports tasks from a file
     * @param {File} file - JSON file to import
     */
    async importTasks(file) {
        try {
            const text = await file.text();
            const result = this.taskManager.importTasks(text);
            
            if (result.success) {
                Utils.NotificationUtils.showToast(
                    `${result.count} tarefa${result.count > 1 ? 's' : ''} importada${result.count > 1 ? 's' : ''} com sucesso!`,
                    'success'
                );
            } else {
                Utils.NotificationUtils.showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error importing tasks:', error);
            Utils.NotificationUtils.showToast('Erro ao importar arquivo', 'error');
        }
    }

    /**
     * Handles initialization errors
     * @param {Error} error - Error that occurred
     */
    handleInitializationError(error) {
        const errorMessage = 'Erro ao inicializar aplicação. Recarregue a página.';
        
        // Try to show error with notification system
        try {
            Utils.NotificationUtils.showToast(errorMessage, 'error', 10000);
        } catch {
            // Fallback to alert if notification system isn't available
            alert(errorMessage);
        }
        
        // Log error for debugging
        console.error('TaskSync initialization error:', error);
    }

    /**
     * Safely shuts down the application
     */
    shutdown() {
        try {
            // Save any pending changes
            if (this.taskManager) {
                this.taskManager.saveTasks();
            }
            
            // Clear intervals and timeouts
            // (In a real app, you'd track these and clear them)
            
            console.log('TaskSync shut down successfully');
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }

    /**
     * Gets application info
     * @returns {Object} Application information
     */
    getAppInfo() {
        return {
            name: 'TaskSync',
            version: '1.0.0',
            description: 'Agendador de Tarefas Elegante e Moderno',
            initialized: this.isInitialized,
            totalTasks: this.taskManager ? this.taskManager.getAllTasks().length : 0
        };
    }
}

// Application Lifecycle Management
class AppLifecycle {
    static init() {
        // Initialize application
        window.taskSyncApp = new TaskSyncApp();
        
        // Handle page visibility changes
        Utils.DOMUtils.addEventListener(document, 'visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, save state
                if (window.taskSyncApp && window.taskSyncApp.taskManager) {
                    window.taskSyncApp.taskManager.saveTasks();
                }
            } else {
                // Page is visible, check for updates
                if (window.taskSyncApp) {
                    window.taskSyncApp.checkOverdueTasks();
                }
            }
        });
        
        // Handle before unload
        Utils.DOMUtils.addEventListener(window, 'beforeunload', (e) => {
            if (window.taskSyncApp) {
                window.taskSyncApp.shutdown();
            }
        });
        
        // Handle unhandled errors
        Utils.DOMUtils.addEventListener(window, 'error', (e) => {
            console.error('Unhandled error:', e.error);
            
            if (window.taskSyncApp && window.taskSyncApp.isInitialized) {
                Utils.NotificationUtils.showToast(
                    'Ocorreu um erro inesperado. Recarregue a página se necessário.',
                    'error',
                    5000
                );
            }
        });
        
        // Handle unhandled promise rejections
        Utils.DOMUtils.addEventListener(window, 'unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
            
            if (window.taskSyncApp && window.taskSyncApp.isInitialized) {
                Utils.NotificationUtils.showToast(
                    'Ocorreu um erro inesperado. Recarregue a página se necessário.',
                    'error',
                    5000
                );
            }
        });
    }
}

// Initialize application when script loads
AppLifecycle.init();

// Export for console access and testing
window.TaskSyncApp = TaskSyncApp;
window.AppLifecycle = AppLifecycle;
