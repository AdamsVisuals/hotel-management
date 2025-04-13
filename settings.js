document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeColorSelect = document.getElementById('theme-color');
    const exportBtn = document.getElementById('export-data');
    const importBtn = document.getElementById('import-data');
    const resetBtn = document.getElementById('reset-data');
    const importModal = document.getElementById('import-modal');
    const resetModal = document.getElementById('reset-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const confirmImportBtn = document.getElementById('confirm-import');
    const cancelImportBtn = document.getElementById('cancel-import');
    const confirmResetBtn = document.getElementById('confirm-reset');
    const cancelResetBtn = document.getElementById('cancel-reset');
    const importFileInput = document.getElementById('import-file');

    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings')) || {
            darkMode: false,
            themeColor: 'blue',
            dateFormat: 'mm/dd/yyyy',
            timeFormat: '12h',
            language: 'en',
            emailNotifications: true,
            smsNotifications: false,
            notificationSound: true
        };

        // Apply settings
        darkModeToggle.checked = settings.darkMode;
        themeColorSelect.value = settings.themeColor;
        document.getElementById('date-format').value = settings.dateFormat;
        document.getElementById('time-format').value = settings.timeFormat;
        document.getElementById('language').value = settings.language;
        document.getElementById('email-notifications').checked = settings.emailNotifications;
        document.getElementById('sms-notifications').checked = settings.smsNotifications;
        document.getElementById('notification-sound').checked = settings.notificationSound;

        // Apply dark mode if enabled
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Apply theme color
        applyThemeColor(settings.themeColor);

        return settings;
    }

    // Save settings to localStorage
    function saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // Apply theme color to the page
    function applyThemeColor(color) {
        // Remove all existing theme classes
        document.body.classList.remove(
            'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange'
        );

        // Add the selected theme class
        document.body.classList.add(`theme-${color}`);
    }

    // Export all data as JSON file
    function exportData() {
        const data = {
            bookings: JSON.parse(localStorage.getItem('bookings')) || [],
            guests: JSON.parse(localStorage.getItem('guests')) || [],
            rooms: JSON.parse(localStorage.getItem('rooms')) || [],
            settings: JSON.parse(localStorage.getItem('settings')) || {}
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = `hotel-management-data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }

    // Import data from JSON file
    function importData(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.bookings) localStorage.setItem('bookings', JSON.stringify(data.bookings));
                if (data.guests) localStorage.setItem('guests', JSON.stringify(data.guests));
                if (data.rooms) localStorage.setItem('rooms', JSON.stringify(data.rooms));
                if (data.settings) {
                    localStorage.setItem('settings', JSON.stringify(data.settings));
                    // Reload to apply new settings
                    window.location.reload();
                }
                
                alert('Data imported successfully!');
                importModal.style.display = 'none';
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    // Reset all data
    function resetData() {
        localStorage.clear();
        alert('All data has been reset. The page will now reload.');
        window.location.reload();
    }

    // Initialize settings
    const currentSettings = loadSettings();

    // Event Listeners
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        currentSettings.darkMode = this.checked;
        saveSettings(currentSettings);
    });

    themeColorSelect.addEventListener('change', function() {
        applyThemeColor(this.value);
        currentSettings.themeColor = this.value;
        saveSettings(currentSettings);
    });

    document.getElementById('date-format').addEventListener('change', function() {
        currentSettings.dateFormat = this.value;
        saveSettings(currentSettings);
    });

    document.getElementById('time-format').addEventListener('change', function() {
        currentSettings.timeFormat = this.value;
        saveSettings(currentSettings);
    });

    document.getElementById('language').addEventListener('change', function() {
        currentSettings.language = this.value;
        saveSettings(currentSettings);
    });

    document.getElementById('email-notifications').addEventListener('change', function() {
        currentSettings.emailNotifications = this.checked;
        saveSettings(currentSettings);
    });

    document.getElementById('sms-notifications').addEventListener('change', function() {
        currentSettings.smsNotifications = this.checked;
        saveSettings(currentSettings);
    });

    document.getElementById('notification-sound').addEventListener('change', function() {
        currentSettings.notificationSound = this.checked;
        saveSettings(currentSettings);
    });

    exportBtn.addEventListener('click', exportData);

    importBtn.addEventListener('click', function() {
        importModal.style.display = 'block';
    });

    resetBtn.addEventListener('click', function() {
        resetModal.style.display = 'block';
    });

    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            importModal.style.display = 'none';
            resetModal.style.display = 'none';
        });
    });

    cancelImportBtn.addEventListener('click', function() {
        importModal.style.display = 'none';
    });

    cancelResetBtn.addEventListener('click', function() {
        resetModal.style.display = 'none';
    });

    confirmImportBtn.addEventListener('click', function() {
        if (importFileInput.files.length > 0) {
            importData(importFileInput.files[0]);
        } else {
            alert('Please select a file to import');
        }
    });

    confirmResetBtn.addEventListener('click', resetData);

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === importModal) {
            importModal.style.display = 'none';
        }
        if (event.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });
});