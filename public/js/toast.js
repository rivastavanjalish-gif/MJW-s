/**
 * Toast Notification System
 * Vanilla JS Toast System for MJW'S SHAKE & SPICY
 */

(function() {
    // Prevent duplicate initialization
    if (window.showToast) return;

    const toastStyles = `
    #toast-container {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        pointer-events: none;
    }

    .toast {
        min-width: 300px;
        max-width: 400px;
        background: linear-gradient(135deg, #fffef9 0%, #f4fff6 100%);
        color: #1f3a2d;
        padding: 1rem 1.25rem;
        border-radius: 1.25rem;
        box-shadow: 0 18px 40px rgba(39, 84, 57, 0.16);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        pointer-events: auto;
        transform: translateX(120%);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
        border: 1px solid rgba(90, 168, 115, 0.22);
        border-left: 5px solid #53b36c;
        font-family: 'Be Vietnam Pro', sans-serif;
        backdrop-filter: blur(14px);
    }

    .toast.show {
        transform: translateX(0);
        opacity: 1;
    }

    .toast.hide {
        transform: translateX(120%);
        opacity: 0;
    }

    .toast-icon {
        font-size: 1.5rem;
        color: #53b36c;
    }

    .toast-content {
        flex: 1;
    }

    .toast-title {
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 0.1rem;
        display: block;
        color: #214734;
    }

    .toast-message {
        font-size: 0.8rem;
        color: rgba(33, 71, 52, 0.78);
        display: block;
        line-height: 1.4;
    }

    /* Refined Theme-matching colors */
    .toast-success {
        background: linear-gradient(135deg, #f8fff8 0%, #eefbf1 100%);
        border-color: rgba(83, 179, 108, 0.28);
        border-left-color: #53b36c;
    }

    .toast-success .toast-icon {
        color: #3ea85a;
    }

    .toast-success .toast-title {
        color: #1f5a35;
    }

    .toast-success .toast-message {
        color: rgba(31, 90, 53, 0.78);
    }

    .toast-error {
        background: linear-gradient(135deg, #fff8f4 0%, #fff1ec 100%);
        color: #5a2d1f;
        border-color: rgba(255, 107, 61, 0.2);
        border-left-color: #ff6b3d;
        box-shadow: 0 18px 40px rgba(154, 74, 45, 0.14);
    }

    .toast-error .toast-icon,
    .toast-error .toast-title {
        color: #c75430;
    }

    .toast-error .toast-message {
        color: rgba(90, 45, 31, 0.78);
    }

    .toast-info {
        background: linear-gradient(135deg, #faf7ff 0%, #f3edff 100%);
        color: #3b1e54;
        border-color: rgba(180, 151, 224, 0.28);
        border-left-color: #9d79d3;
        box-shadow: 0 18px 40px rgba(115, 60, 195, 0.14);
    }

    .toast-info .toast-icon,
    .toast-info .toast-title {
        color: #733cc3;
    }

    .toast-info .toast-message {
        color: rgba(59, 30, 84, 0.76);
    }

    .toast-legacy-order {
        background: #3E2A5E;
        color: white;
        border-color: rgba(180, 151, 224, 0.18);
        border-left-color: #733CC3;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }

    .toast-legacy-order .toast-icon {
        color: #B497E0;
    }

    .toast-legacy-order .toast-title {
        color: #ffffff;
    }

    .toast-legacy-order .toast-message {
        color: rgba(255, 255, 255, 0.8);
    }
    `;

    // Inject styles only once
    const styleId = 'mjw-toast-styles';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.innerText = toastStyles;
        document.head.appendChild(styleSheet);
    }

    // Create container function
    function initContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Initialize container when possible
    let container;
    if (document.body) {
        container = initContainer();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            container = initContainer();
        });
    }

    let lastToastTime = 0;
    let lastToastTitle = '';

    /**
     * Show a toast notification
     */
    function showToast(title, message = '', type = 'success') {
        if (!container) container = initContainer();
        const now = Date.now();
        // Prevent rapid duplicate toasts (within 500ms)
        if (title === lastToastTitle && now - lastToastTime < 500) return;
        
        lastToastTime = now;
        lastToastTitle = title;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const isAddToOrderToast =
            type === 'success' &&
            typeof title === 'string' &&
            typeof message === 'string' &&
            title.toLowerCase().endsWith(' added!') &&
            message === 'Added to your order';

        if (isAddToOrderToast) {
            toast.classList.add('toast-legacy-order');
        }
        
        const iconMap = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-symbols-outlined toast-icon">${iconMap[type] || 'notifications'}</span>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                ${message ? `<span class="toast-message">${message}</span>` : ''}
            </div>
        `;

        // Limit to 3 toasts
        if (container.children.length >= 3) {
            const oldest = Array.from(container.children).find(t => !t.classList.contains('hide'));
            if (oldest) {
                oldest.classList.remove('show');
                oldest.classList.add('hide');
                setTimeout(() => oldest.remove(), 400);
            }
        }

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 400);
            }
        }, 3000);
    }

    window.showToast = showToast;
})();
