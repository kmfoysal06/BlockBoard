class CharmAlert {
    constructor() {
        this.timeout = null;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CharmAlert();
        }
        return this.instance;
    }
    showAlert(message, type = 'info') {
        const alertBox = document.createElement('div');
        alertBox.className = `charm-alert charm-alert-${type}`;
        alertBox.style.position = 'fixed';
        // Calculate stacked top position: find existing alerts and place new one below them
        const existingAlerts = Array.from(document.querySelectorAll('.charm-alert'));
        const gap = 10; // px gap between alerts
        let topOffset = 50; // base top offset
        if (existingAlerts.length > 0) {
            // compute the bottom-most point among existing alerts
            const bottoms = existingAlerts.map(a => {
                const rect = a.getBoundingClientRect();
                return rect.top + rect.height;
            });
            const maxBottom = Math.max(...bottoms);
            // if maxBottom is greater than base offset, start after it plus gap
            topOffset = Math.max(topOffset, Math.ceil(maxBottom + gap));
        }
        alertBox.style.top = topOffset + 'px';
        // zindex 
        alertBox.style.zIndex = '1111';
        
        alertBox.style.left = '50%';
        alertBox.style.transform = 'translateX(-50%)';
        alertBox.style.padding = '10px 20px';
        alertBox.style.borderRadius = '5px';
        alertBox.style.color = '#fff';
        alertBox.style.fontSize = '16px';
        alertBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        alertBox.style.backgroundColor = type === 'success' ? '#4CAF50' :
                                         type === 'error' ? '#F44336' :
                                         type === 'warning' ? '#FF9800' :
                                         '#2196F3';
        alertBox.style.transition = 'opacity 0.3s ease-in-out';
        alertBox.style.opacity = '0.9';
        alertBox.style.cursor = 'pointer';

        alertBox.innerText = message;
        // pause timeout on hover and resume on mouse leave
        // Append the alert box to the body
        document.body.appendChild(alertBox);

        // Use a per-alert timeout so multiple alerts don't clash
        let alertTimeout = null;
        const startAutoRemove = () => {
            alertTimeout = setTimeout(() => {
                alertBox.remove();
            }, 3000);
        };

        // pause timeout on hover and resume on mouse leave
        alertBox.addEventListener('mouseenter', () => {
            if (alertTimeout) {
                clearTimeout(alertTimeout);
                alertTimeout = null;
            }
        });
        alertBox.addEventListener('mouseleave', () => {
            // restart timer
            if (!alertTimeout) startAutoRemove();
        });

        // clicking removes immediately
        alertBox.addEventListener('click', () => {
            if (alertTimeout) clearTimeout(alertTimeout);
            alertBox.remove();
        });

        // start the auto removal timer
        startAutoRemove();
    }
}