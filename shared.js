// Function to apply dark mode and other settings
function applySystemSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        darkMode: false,
        themeColor: 'blue'
    };

    // Apply dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Apply theme color
    document.body.classList.remove(
        'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange'
    );
    document.body.classList.add(`theme-${settings.themeColor}`);
}

// Apply settings when page loads
document.addEventListener('DOMContentLoaded', applySystemSettings);

// Function to toggle dark mode (can be called from any page)
function toggleDarkMode() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        darkMode: false,
        themeColor: 'blue'
    };
    
    settings.darkMode = !settings.darkMode;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    applySystemSettings();
}

// Update for icon toggle version
document.addEventListener('DOMContentLoaded', function() {
    const darkModeBtn = document.getElementById('dark-mode-btn');
    
    darkModeBtn.addEventListener('click', function() {
        toggleDarkMode();
        
        // Update icon immediately
        const settings = JSON.parse(localStorage.getItem('settings')) || { darkMode: false };
        if (settings.darkMode) {
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
    
    // Initialize icon
    const settings = JSON.parse(localStorage.getItem('settings')) || { darkMode: false };
    if (settings.darkMode) {
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
});