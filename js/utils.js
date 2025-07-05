class DateUtils {
    static formatDate(date, options = {}) {
        if (!date) return '';
        
        const {
            includeTime = false,
            relative = false,
            locale = 'pt-BR'
        } = options;

        if (relative) {
            return this.getRelativeTimeString(date);
        }

        const formatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    }

    static getRelativeTimeString(date) {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (Math.abs(diffDays) >= 1) {
            return diffDays > 0 
                ? `em ${diffDays} dia${diffDays > 1 ? 's' : ''}`
                : `${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? 's' : ''} atrás`;
        }

        if (Math.abs(diffHours) >= 1) {
            return diffHours > 0 
                ? `em ${diffHours} hora${diffHours > 1 ? 's' : ''}`
                : `${Math.abs(diffHours)} hora${Math.abs(diffHours) > 1 ? 's' : ''} atrás`;
        }

        if (Math.abs(diffMinutes) >= 1) {
            return diffMinutes > 0 
                ? `em ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
                : `${Math.abs(diffMinutes)} minuto${Math.abs(diffMinutes) > 1 ? 's' : ''} atrás`;
        }

        return 'agora';
    }

    static isOverdue(date) {
        if (!date) return false;
        return new Date() > date;
    }

    static getCurrentDateTimeLocal() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }
}

class StringUtils {
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static truncate(str, maxLength, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    }

    static sanitizeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2);
        return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
    }
}

class ArrayUtils {
    static sortBy(array, property, direction = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[property];
            let bVal = b[property];

            if (aVal instanceof Date && bVal instanceof Date) {
                aVal = aVal.getTime();
                bVal = bVal.getTime();
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (direction === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }

    static filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    return true;
                }
                
                if (Array.isArray(value)) {
                    return value.includes(item[key]);
                }
                
                if (typeof value === 'string') {
                    return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
                }
                
                return item[key] === value;
            });
        });
    }
}

class LocalStorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}

class DOMUtils {
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }

        return element;
    }

    static querySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error('Error in querySelector:', error);
            return null;
        }
    }

    static querySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.error('Error in querySelectorAll:', error);
            return [];
        }
    }

    static addEventListener(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') return;
        
        element.addEventListener(event, (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('Error in event handler:', error);
            }
        }, options);
    }
}

class ValidationUtils {
    static isNotEmpty(value) {
        return value && value.trim().length > 0;
    }

    static isValidFutureDate(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj) && dateObj > new Date();
    }

    static validateTask(taskData) {
        const errors = {};

        if (!this.isNotEmpty(taskData.title)) {
            errors.title = 'Título é obrigatório';
        }

        if (taskData.dueDate && !this.isValidFutureDate(taskData.dueDate)) {
            errors.dueDate = 'Data deve ser futura';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

class NotificationUtils {
    static showToast(message, type = 'info', duration = 3000) {
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = DOMUtils.createElement('div', {
            className: `toast toast-${type}`,
            innerHTML: `
                <div class="toast-content">
                    <i class="fas fa-${this.getIconForType(type)}"></i>
                    <span class="toast-message">${StringUtils.sanitizeHtml(message)}</span>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            `
        });

        if (!document.getElementById('toast-styles')) {
            const styles = DOMUtils.createElement('style', {
                id: 'toast-styles',
                textContent: `
                    .toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: var(--bg-primary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        box-shadow: var(--shadow-lg);
                        padding: var(--spacing-md);
                        z-index: 1100;
                        min-width: 300px;
                        animation: slideInRight 0.3s ease-out;
                    }
                    
                    .toast-success { border-left: 4px solid var(--success-color); }
                    .toast-error { border-left: 4px solid var(--danger-color); }
                    .toast-warning { border-left: 4px solid var(--warning-color); }
                    .toast-info { border-left: 4px solid var(--info-color); }
                    
                    .toast-content {
                        display: flex;
                        align-items: center;
                        gap: var(--spacing-sm);
                    }
                    
                    .toast-message {
                        flex: 1;
                        font-size: var(--font-size-sm);
                    }
                    
                    .toast-close {
                        background: transparent;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        padding: var(--spacing-xs);
                        margin-left: var(--spacing-sm);
                    }
                    
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `
            });
            document.head.appendChild(styles);
        }

        const closeBtn = toast.querySelector('.toast-close');
        DOMUtils.addEventListener(closeBtn, 'click', () => {
            toast.remove();
        });

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, duration);

        document.body.appendChild(toast);
    }

    static getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }
}

window.Utils = {
    DateUtils,
    StringUtils,
    ArrayUtils,
    LocalStorageManager,
    DOMUtils,
    ValidationUtils,
    NotificationUtils
};
