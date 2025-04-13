document.addEventListener('DOMContentLoaded', () => {
    // Load all data from localStorage
    const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
    
    // Get current date information
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Initialize charts
    let weeklyOccupancyChart, roomTypeChart;
    
    // Calculate and display all dashboard metrics
    updateDashboardMetrics();
    
    // Functions
    function updateDashboardMetrics() {
        // 1. Calculate occupancy statistics
        updateOccupancyStats();
        
        // 2. Calculate revenue statistics
        updateRevenueStats();
        
        // 3. Calculate guest statistics
        updateGuestStats();
        
        // 4. Calculate room statistics
        updateRoomStats();
        
        // 5. Initialize charts
        initCharts();
        
        // 6. Show recent bookings
        showRecentBookings();
        
        // 7. Show system alerts
        showSystemAlerts();
    }
    
    function updateOccupancyStats() {
        // Today's occupancy
        const occupiedToday = bookings.filter(booking => {
            const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
            const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
            return checkIn <= todayStr && checkOut >= todayStr;
        }).length;
        
        const totalRooms = rooms.length;
        const todayOccupancyRate = totalRooms > 0 ? Math.round((occupiedToday / totalRooms) * 100) : 0;
        document.getElementById('today-occupancy').textContent = `${todayOccupancyRate}%`;
        
        // Monthly occupancy
        const monthBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.checkInDate);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        });
        
        const roomNights = monthBookings.reduce((total, booking) => {
            const nights = Math.ceil(
                (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
            );
            return total + nights;
        }, 0);
        
        const possibleRoomNights = totalRooms * new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthOccupancyRate = possibleRoomNights > 0 ? Math.round((roomNights / possibleRoomNights) * 100) : 0;
        document.getElementById('month-occupancy').textContent = `${monthOccupancyRate}%`;
    }
    
    function updateRevenueStats() {
        // Today's revenue
        const todayRevenue = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.createdAt || booking.checkInDate).toISOString().split('T')[0];
                return bookingDate === todayStr;
            })
            .reduce((total, booking) => total + booking.totalPrice, 0);
        
        document.getElementById('today-revenue').textContent = `$${todayRevenue.toFixed(2)}`;
        
        // Monthly revenue
        const monthRevenue = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.createdAt || booking.checkInDate);
                return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
            })
            .reduce((total, booking) => total + booking.totalPrice, 0);
        
        document.getElementById('month-revenue').textContent = `$${monthRevenue.toFixed(2)}`;
    }
    
    function updateGuestStats() {
        // Current guests
        const currentGuests = bookings.filter(booking => {
            const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
            const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
            return checkIn <= todayStr && checkOut >= todayStr;
        }).length;
        
        document.getElementById('current-guests').textContent = currentGuests;
        
        // Today's arrivals
        const todayArrivals = bookings.filter(booking => {
            const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
            return checkIn === todayStr;
        }).length;
        
        document.getElementById('today-arrivals').textContent = todayArrivals;
    }
    
    function updateRoomStats() {
        const availableRooms = rooms.filter(room => room.status === 'available').length;
        const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
        
        document.getElementById('available-rooms').textContent = availableRooms;
        document.getElementById('occupied-rooms').textContent = occupiedRooms;
    }
    
    function initCharts() {
        // Weekly Occupancy Chart
        const weeklyCtx = document.getElementById('weeklyOccupancyChart').getContext('2d');
        
        // Get last 7 days
        const days = [];
        const dayOccupancy = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const occupied = bookings.filter(booking => {
                const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
                const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
                return checkIn <= dateStr && checkOut >= dateStr;
            }).length;
            
            const rate = rooms.length > 0 ? (occupied / rooms.length) * 100 : 0;
            dayOccupancy.push(rate.toFixed(1));
        }
        
        if (weeklyOccupancyChart) {
            weeklyOccupancyChart.destroy();
        }
        
        weeklyOccupancyChart = new Chart(weeklyCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Occupancy Rate (%)',
                    data: dayOccupancy,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Occupancy Rate (%)'
                        }
                    }
                }
            }
        });
        
        // Room Type Distribution Chart
        const roomTypeCtx = document.getElementById('roomTypeChart').getContext('2d');
        
        const roomTypes = [...new Set(rooms.map(room => room.type))];
        const roomCounts = roomTypes.map(type => 
            rooms.filter(room => room.type === type).length
        );
        
        if (roomTypeChart) {
            roomTypeChart.destroy();
        }
        
        roomTypeChart = new Chart(roomTypeCtx, {
            type: 'doughnut',
            data: {
                labels: roomTypes,
                datasets: [{
                    data: roomCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    function showRecentBookings() {
        const recentBookings = [...bookings]
            .sort((a, b) => new Date(b.createdAt || b.checkInDate) - new Date(a.createdAt || a.checkInDate))
            .slice(0, 5);
        
        const bookingsList = document.getElementById('recent-bookings');
        bookingsList.innerHTML = '';
        
        recentBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId) || { name: 'Unknown Guest' };
            const room = rooms.find(r => r.id === booking.roomId) || { number: 'N/A' };
            
            const bookingItem = document.createElement('div');
            bookingItem.className = 'activity-item info';
            bookingItem.innerHTML = `
                <i class="fas fa-calendar-check"></i>
                <div>
                    <strong>${guest.name}</strong> booked Room ${room.number} for $${booking.totalPrice.toFixed(2)}
                    <small>${formatDate(booking.createdAt || booking.checkInDate)}</small>
                </div>
            `;
            bookingsList.appendChild(bookingItem);
        });
    }
    
    function showSystemAlerts() {
        const alertsList = document.getElementById('system-alerts');
        alertsList.innerHTML = '';
        
        // Check for upcoming check-outs today
        const checkOutsToday = bookings.filter(booking => {
            const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
            return checkOut === todayStr;
        }).length;
        
        if (checkOutsToday > 0) {
            const alertItem = document.createElement('div');
            alertItem.className = 'activity-item warning';
            alertItem.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                <div>
                    <strong>${checkOutsToday} rooms</strong> checking out today
                    <small>Prepare for room cleaning</small>
                </div>
            `;
            alertsList.appendChild(alertItem);
        }
        
        // Check for available rooms
        const availableRooms = rooms.filter(room => room.status === 'available').length;
        if (availableRooms < 3) {
            const alertItem = document.createElement('div');
            alertItem.className = 'activity-item alert';
            alertItem.innerHTML = `
                <i class="fas fa-bed"></i>
                <div>
                    <strong>Low availability!</strong> Only ${availableRooms} rooms left
                    <small>Consider closing some bookings</small>
                </div>
            `;
            alertsList.appendChild(alertItem);
        }
        
        // Check for maintenance needed
        const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
        if (maintenanceRooms > 0) {
            const alertItem = document.createElement('div');
            alertItem.className = 'activity-item alert';
            alertItem.innerHTML = `
                <i class="fas fa-tools"></i>
                <div>
                    <strong>${maintenanceRooms} rooms</strong> need maintenance
                    <small>Schedule repairs ASAP</small>
                </div>
            `;
            alertsList.appendChild(alertItem);
        }
        
        if (alertsList.children.length === 0) {
            const noAlerts = document.createElement('div');
            noAlerts.className = 'activity-item';
            noAlerts.textContent = 'No alerts to display';
            alertsList.appendChild(noAlerts);
        }
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});