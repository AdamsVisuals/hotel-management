document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportBtn = document.getElementById('generate-report');
    
    // Chart instances
    let occupancyChart, revenueChart, guestChart, bookingSourceChart;
    
    // Initialize date inputs
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    startDateInput.valueAsDate = firstDayOfMonth;
    endDateInput.valueAsDate = today;
    
    // Load initial data
    generateReports();
    
    // Event Listeners
    generateReportBtn.addEventListener('click', generateReports);
    
    // Core Functions
    function generateReports() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            alert('End date must be after start date');
            return;
        }
        
        // Get data from localStorage
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
        const guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        
        // Filter bookings by date range
        const filteredBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt || booking.checkInDate);
            return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
        });
        
        // Generate reports
        generateOccupancyReport(filteredBookings, rooms);
        generateRevenueReport(filteredBookings, rooms);
        generateGuestReport(guests);
        generateBookingSourceReport(filteredBookings);
    }
    
    function generateOccupancyReport(bookings, rooms) {
        // Calculate occupancy stats
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
        const vacantRooms = totalRooms - occupiedRooms;
        const occupancyRate = (occupiedRooms / totalRooms * 100).toFixed(1);
        
        // Update stats display
        document.getElementById('total-rooms').textContent = totalRooms;
        document.getElementById('occupied-rooms').textContent = occupiedRooms;
        document.getElementById('vacant-rooms').textContent = vacantRooms;
        document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
        
        // Prepare data for chart
        const roomTypes = [...new Set(rooms.map(room => room.type))];
        const occupancyByType = roomTypes.map(type => {
            const typeRooms = rooms.filter(room => room.type === type);
            const occupied = typeRooms.filter(room => room.status === 'occupied').length;
            return {
                type,
                occupied,
                total: typeRooms.length,
                rate: (occupied / typeRooms.length * 100).toFixed(1)
            };
        });
        
        // Create or update chart
        const ctx = document.getElementById('occupancyChart').getContext('2d');
        
        if (occupancyChart) {
            occupancyChart.destroy();
        }
        
        occupancyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: roomTypes,
                datasets: [
                    {
                        label: 'Occupied Rooms',
                        data: occupancyByType.map(item => item.occupied),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Rooms',
                        data: occupancyByType.map(item => item.total),
                        backgroundColor: 'rgba(201, 203, 207, 0.7)',
                        borderColor: 'rgba(201, 203, 207, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Rooms'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Room Type'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const data = occupancyByType[context.dataIndex];
                                return `Occupancy Rate: ${data.rate}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function generateRevenueReport(bookings, rooms) {
        // Calculate revenue stats
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const totalRoomNights = bookings.reduce((sum, booking) => {
            const nights = Math.ceil(
                (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
            );
            return sum + nights;
        }, 0);
        
        const averageDailyRate = totalRoomNights > 0 ? (totalRevenue / totalRoomNights) : 0;
        const revPerAvailableRoom = rooms.length > 0 ? (totalRevenue / rooms.length) : 0;
        
        // Update stats display
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('average-rate').textContent = `$${averageDailyRate.toFixed(2)}`;
        document.getElementById('rev-per-room').textContent = `$${revPerAvailableRoom.toFixed(2)}`;
        
        // Prepare data for chart (daily revenue)
        const dateRange = getDateRange(startDateInput.value, endDateInput.value);
        const dailyRevenue = {};
        
        dateRange.forEach(date => {
            dailyRevenue[date] = 0;
        });
        
        bookings.forEach(booking => {
            const bookingDate = formatDate(booking.createdAt || booking.checkInDate);
            if (dailyRevenue.hasOwnProperty(bookingDate)) {
                dailyRevenue[bookingDate] += booking.totalPrice;
            }
        });
        
        // Create or update chart
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (revenueChart) {
            revenueChart.destroy();
        }
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dateRange,
                datasets: [{
                    label: 'Daily Revenue',
                    data: dateRange.map(date => dailyRevenue[date]),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
    
    function generateGuestReport(guests) {
        // Group guests by country (or other demographic)
        const countries = {};
        guests.forEach(guest => {
            const country = guest.country || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;
        });
        
        // Sort by count and take top 5
        const sortedCountries = Object.entries(countries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Create or update chart
        const ctx = document.getElementById('guestChart').getContext('2d');
        
        if (guestChart) {
            guestChart.destroy();
        }
        
        guestChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sortedCountries.map(item => item[0]),
                datasets: [{
                    data: sortedCountries.map(item => item[1]),
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
                    },
                    title: {
                        display: true,
                        text: 'Guest Nationalities'
                    }
                }
            }
        });
    }
    
    function generateBookingSourceReport(bookings) {
        // Group bookings by source (example - in real app this would come from booking data)
        const sources = {
            'Website': Math.floor(bookings.length * 0.4),
            'Travel Agent': Math.floor(bookings.length * 0.3),
            'Direct Call': Math.floor(bookings.length * 0.2),
            'Other': bookings.length - Math.floor(bookings.length * 0.4) - 
                    Math.floor(bookings.length * 0.3) - Math.floor(bookings.length * 0.2)
        };
        
        // Create or update chart
        const ctx = document.getElementById('bookingSourceChart').getContext('2d');
        
        if (bookingSourceChart) {
            bookingSourceChart.destroy();
        }
        
        bookingSourceChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(sources),
                datasets: [{
                    data: Object.values(sources),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
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
                    },
                    title: {
                        display: true,
                        text: 'Booking Sources'
                    }
                }
            }
        });
    }
    
    // Helper Functions
    function getDateRange(startDate, endDate) {
        const dates = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);
        
        while (currentDate <= end) {
            dates.push(formatDate(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }
    
    function formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
});