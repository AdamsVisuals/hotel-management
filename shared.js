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

// Function to display time-based greeting
function displayGreeting() {
    const greetingElement = document.getElementById('time-greeting');
    const usernameElement = document.getElementById('username-display');
    
    // Get current hour
    const hour = new Date().getHours();
    
    // Set greeting based on time of day
    let greeting;
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    // Get username from localStorage or use default
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Admin' };
    
    // Update DOM elements
    if (greetingElement) greetingElement.textContent = greeting;
    if (usernameElement) usernameElement.textContent = currentUser.name;
}

// Call the function when page loads
document.addEventListener('DOMContentLoaded', displayGreeting);

// Update greeting every minute in case page stays open long
setInterval(displayGreeting, 60000);