document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Display current user
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        const userElements = document.querySelectorAll('.user-nav span, .sidebar-footer h4');
        userElements.forEach(el => {
            el.textContent = userEmail.split('@')[0]; // Show username part
        });
    }

    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
    
    // Initialize charts
    initCharts();
    
    // Simulate real-time updates
    simulateRealTimeUpdates();
});

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    
    // Initialize charts
    initCharts();
    
    // Simulate real-time updates
    simulateRealTimeUpdates();
});

function initCharts() {
    // Occupancy Chart
    const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
    const occupancyChart = new Chart(occupancyCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Occupancy Rate',
                data: [65, 72, 80, 85, 78, 92, 95],
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function simulateRealTimeUpdates() {
    // Simulate real-time updates by randomly updating stats
    setInterval(() => {
        const stats = document.querySelectorAll('.stat-info h3');
        
        // Update total rooms (slight variation)
        const totalRooms = Math.floor(Math.random() * 5) + 122;
        stats[0].textContent = totalRooms;
        
        // Update current guests (more variation)
        const currentGuests = Math.floor(Math.random() * 20) + 85;
        stats[1].textContent = currentGuests;
        
        // Update occupancy percentage
        const occupancyPercentage = Math.round((currentGuests / totalRooms) * 100);
        document.querySelectorAll('.stat-progress .progress-bar')[0].style.width = occupancyPercentage + '%';
        document.querySelectorAll('.stat-progress span')[0].textContent = occupancyPercentage + '% Occupied';
        
        // Update today's check-ins
        const todaysCheckins = Math.floor(Math.random() * 10) + 38;
        stats[2].textContent = todaysCheckins;
        
        // Update check-in percentage
        const checkinPercentage = Math.round((todaysCheckins / 100) * 100);
        document.querySelectorAll('.stat-progress .progress-bar')[1].style.width = checkinPercentage + '%';
        document.querySelectorAll('.stat-progress span')[1].textContent = checkinPercentage + '% of Capacity';
        
        // Update today's revenue
        const revenue = Math.floor(Math.random() * 5000) + 20000;
        stats[3].textContent = '$' + revenue.toLocaleString();
        
        // Update revenue percentage
        const revenuePercentage = Math.round((revenue / 38000) * 100);
        document.querySelectorAll('.stat-progress .progress-bar')[2].style.width = revenuePercentage + '%';
        document.querySelectorAll('.stat-progress span')[2].textContent = revenuePercentage + '% of Target';
        
    }, 5000);
    
    // Simulate new activities
    const activities = [
        {
            icon: 'fas fa-bed',
            color: 'primary',
            text: 'Room 105 checked in',
            time: 'just now'
        },
        {
            icon: 'fas fa-utensils',
            color: 'warning',
            text: 'Room service ordered for Room 215',
            time: '1 minute ago'
        },
        {
            icon: 'fas fa-spa',
            color: 'success',
            text: 'Spa appointment confirmed for Jane Doe',
            time: '3 minutes ago'
        },
        {
            icon: 'fas fa-credit-card',
            color: 'secondary',
            text: 'Payment received for Booking #BK-1006',
            time: '5 minutes ago'
        },
        {
            icon: 'fas fa-broom',
            color: 'danger',
            text: 'Housekeeping request from Room 312',
            time: '8 minutes ago'
        }
    ];
    
    setInterval(() => {
        const activityList = document.querySelector('.activity-list');
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        const newActivity = document.createElement('li');
        newActivity.innerHTML = `
            <div class="activity-icon bg-${randomActivity.color}">
                <i class="${randomActivity.icon}"></i>
            </div>
            <div class="activity-details">
                <p>${randomActivity.text}</p>
                <small>${randomActivity.time}</small>
            </div>
        `;
        
        activityList.insertBefore(newActivity, activityList.firstChild);
        
        // Remove oldest activity if more than 5
        if (activityList.children.length > 5) {
            activityList.removeChild(activityList.lastChild);
        }
    }, 10000);
}

// Display user info after login
function displayUserInfo() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentEmail = localStorage.getItem('userEmail');
    const currentUser = users.find(user => user.email === currentEmail);
    
    // Set avatar (in real app, this would come from user data)
    const avatarElements = document.querySelectorAll('.user-nav img, .sidebar-footer img');
    avatarElements.forEach(img => {
        // You could use the user's actual avatar if available
        img.src = `https://ui-avatars.com/api/?name=${currentUser ? currentUser.name : currentEmail}&background=random&rounded=true`;
    });
    
    // Set name
    const name = currentUser ? currentUser.name : currentEmail.split('@')[0];
    document.getElementById('userName').textContent = name;
    document.querySelector('.sidebar-footer h4').textContent = name;
    
    // Set email in sidebar if available
    if (currentEmail) {
        document.querySelector('.sidebar-footer small').textContent = currentEmail;
    }
}

// Initialize user dropdown
function initUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Toggle dropdown
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.classList.remove('active');
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    displayUserInfo();
    
    // Initialize user dropdown
    initUserDropdown();
});