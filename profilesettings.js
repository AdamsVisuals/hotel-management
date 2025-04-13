document.addEventListener('DOMContentLoaded', function() {
    // LocalStorage keys
    const SETTINGS_KEY = 'hotelUserSettings';
    const THEME_KEY = 'hotelUserTheme';
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Initialize settings from LocalStorage or defaults
    function initSettings() {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        const savedTheme = localStorage.getItem(THEME_KEY);
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            applySettings(settings);
        } else {
            // Default settings
            const defaultSettings = {
                account: {
                    username: 'johndoe',
                    email: 'john.doe@example.com',
                    language: 'en',
                    timezone: 'est'
                },
                security: {
                    twoFactor: true
                },
                notifications: {
                    emailBookings: true,
                    emailRoomStatus: true,
                    emailSystemUpdates: false,
                    appMessages: true,
                    appReminders: true
                },
                preferences: {
                    theme: 'light',
                    dashboardLayout: 'spacious',
                    defaultView: 'overview'
                }
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
            applySettings(defaultSettings);
        }
        
        // Apply saved theme
        if (savedTheme) {
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
            document.getElementById(`${savedTheme}-theme`).checked = true;
        }
    }
    
    // Apply settings to form elements
    function applySettings(settings) {
        // Account tab
        document.getElementById('username').value = settings.account.username;
        document.getElementById('email').value = settings.account.email;
        document.getElementById('language').value = settings.account.language;
        document.getElementById('timezone').value = settings.account.timezone;
        
        // Security tab
        document.getElementById('twoFactor').checked = settings.security.twoFactor;
        
        // Notifications tab
        document.getElementById('emailBookings').checked = settings.notifications.emailBookings;
        document.getElementById('emailRoomStatus').checked = settings.notifications.emailRoomStatus;
        document.getElementById('emailSystemUpdates').checked = settings.notifications.emailSystemUpdates;
        document.getElementById('appMessages').checked = settings.notifications.appMessages;
        document.getElementById('appReminders').checked = settings.notifications.appReminders;
        
        // Preferences tab
        document.getElementById(settings.preferences.theme + '-theme').checked = true;
        document.getElementById('dashboard-layout').value = settings.preferences.dashboardLayout;
        document.getElementById('default-view').value = settings.preferences.defaultView;
    }
    
    // Save settings to LocalStorage
    function saveSettings() {
        const settings = {
            account: {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                language: document.getElementById('language').value,
                timezone: document.getElementById('timezone').value
            },
            security: {
                twoFactor: document.getElementById('twoFactor').checked
            },
            notifications: {
                emailBookings: document.getElementById('emailBookings').checked,
                emailRoomStatus: document.getElementById('emailRoomStatus').checked,
                emailSystemUpdates: document.getElementById('emailSystemUpdates').checked,
                appMessages: document.getElementById('appMessages').checked,
                appReminders: document.getElementById('appReminders').checked
            },
            preferences: {
                theme: document.querySelector('input[name="theme"]:checked').value,
                dashboardLayout: document.getElementById('dashboard-layout').value,
                defaultView: document.getElementById('default-view').value
            }
        };
        
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        showToast('Settings saved successfully!');
    }
    
    // Form submission handlers
    const forms = document.querySelectorAll('.settings-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    });
    
    // Theme switcher functionality
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const theme = this.value;
                localStorage.setItem(THEME_KEY, theme);
                
                // Apply theme
                document.body.classList.toggle('dark-theme', theme === 'dark');
                
                // In a real app, you would also update other theme-related elements
                showToast(`Theme changed to ${theme} mode`);
            }
        });
    });
    
    // Password change form (security tab)
    const securityForm = document.querySelector('#security .settings-form');
    securityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match!', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters!', 'error');
            return;
        }
        
        // In a real app, you would send this to your server
        // For now, we'll just show a success message
        showToast('Password updated successfully!');
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Initialize with the first tab active and load settings
    document.querySelector('.tab-btn.active').click();
    initSettings();
});