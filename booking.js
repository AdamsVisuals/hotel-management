document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookingTableBody = document.getElementById('booking-table-body');
    const bookingForm = document.getElementById('booking-form');
    const bookingModal = document.getElementById('booking-modal');
    const addBookingBtn = document.getElementById('add-booking-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelBookingBtn = document.getElementById('cancel-booking');
    const bookingSearch = document.getElementById('booking-search');
    const bookingFilter = document.getElementById('booking-filter');
    const bookingDate = document.getElementById('booking-date');
    
    // Form elements
    const guestSelect = document.getElementById('guest-select');
    const roomSelect = document.getElementById('room-select');
    const checkInDate = document.getElementById('check-in-date');
    const checkOutDate = document.getElementById('check-out-date');
    const totalPrice = document.getElementById('total-price');
    
    // Booking state
    let bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    let guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
    let staff = JSON.parse(localStorage.getItem('hotelStaff')) || [];
    
    // Initialize date inputs
    const today = new Date().toISOString().split('T')[0];
    checkInDate.min = today;
    bookingDate.value = today;
    
    // Load initial data
    loadGuests();
    loadRooms();
    displayBookings();
    
    // Event Listeners
    addBookingBtn.addEventListener('click', openNewBookingModal);
    closeModal.addEventListener('click', closeBookingModal);
    cancelBookingBtn.addEventListener('click', closeBookingModal);
    window.addEventListener('click', (e) => e.target === bookingModal && closeBookingModal());
    
    bookingSearch.addEventListener('input', displayBookings);
    bookingFilter.addEventListener('change', displayBookings);
    bookingDate.addEventListener('change', displayBookings);
    
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Date change listeners for price calculation
    checkInDate.addEventListener('change', updateCheckOutMinDate);
    checkOutDate.addEventListener('change', calculateTotalPrice);
    roomSelect.addEventListener('change', calculateTotalPrice);
    
    // Functions
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    function loadGuests() {
        guestSelect.innerHTML = '<option value="">Select Guest</option>';
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest.id;
            option.textContent = `${guest.name} (${guest.email || 'No email'})`;
            guestSelect.appendChild(option);
        });
    }
    
    function loadRooms() {
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        rooms.filter(room => room.status === 'available').forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `Room ${room.number} (${room.type}, ${formatCurrency(room.price)}/night)`;
            option.dataset.price = room.price;
            roomSelect.appendChild(option);
        });
    }
    
    function displayBookings() {
        const searchTerm = bookingSearch.value.toLowerCase();
        const filter = bookingFilter.value;
        const dateFilter = bookingDate.value;
        
        const filteredBookings = bookings.filter(booking => {
            const guest = guests.find(g => g.id === booking.guestId) || {};
            const room = rooms.find(r => r.id === booking.roomId) || {};
            
            // Search matching
            const matchSearch = 
                booking.id.toLowerCase().includes(searchTerm) ||
                guest.name.toLowerCase().includes(searchTerm) ||
                room.number.toLowerCase().includes(searchTerm);
            
            // Filter matching
            const matchFilter = filter === 'all' || booking.status === filter;
            
            // Date matching
            let matchDate = true;
            if (dateFilter) {
                const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0];
                const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0];
                matchDate = checkIn === dateFilter || checkOut === dateFilter || 
                           (dateFilter > checkIn && dateFilter < checkOut);
            }
            
            return matchSearch && matchFilter && matchDate;
        });
        
        bookingTableBody.innerHTML = filteredBookings.length
            ? ''
            : '<tr><td colspan="8" class="no-bookings"><i class="fas fa-calendar-times"></i> No bookings found</td></tr>';
        
        filteredBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId) || {};
            const room = rooms.find(r => r.id === booking.roomId) || {};
            const assignedStaff = staff.find(s => s.id === booking.assignedStaffId) || {};
            
            const statusClass = `status-${booking.status.replace(' ', '-')}`;
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td data-label="Booking ID">${booking.id.substring(0, 6)}</td>
                <td data-label="Guest"><strong>${guest.name || 'Guest not found'}</strong></td>
                <td data-label="Room">Room ${room.number || 'N/A'} (${room.type || 'N/A'})</td>
                <td data-label="Check-In">${formatDate(booking.checkInDate)}</td>
                <td data-label="Check-Out">${formatDate(booking.checkOutDate)}</td>
                <td data-label="Total">${formatCurrency(booking.totalPrice)}</td>
                <td data-label="Status"><span class="booking-status ${statusClass}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
                <td data-label="Actions" class="booking-actions">
                    ${booking.status === 'confirmed' || booking.status === 'upcoming' ? 
                        `<button class="btn-checkin" data-id="${booking.id}">
                            <i class="fas fa-sign-in-alt"></i> Check In
                        </button>` : ''}
                    ${booking.status === 'checked-in' ? 
                        `<button class="btn-checkout" data-id="${booking.id}">
                            <i class="fas fa-sign-out-alt"></i> Check Out
                        </button>` : ''}
                    ${booking.status !== 'cancelled' && booking.status !== 'checked-out' ? 
                        `<button class="btn-cancel" data-id="${booking.id}">
                            <i class="fas fa-ban"></i> Cancel
                        </button>` : ''}
                    <button class="btn-edit" data-id="${booking.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            bookingTableBody.appendChild(row);
        });
        
        attachBookingActionListeners();
    }
    
    function attachBookingActionListeners() {
        document.querySelectorAll('.btn-checkin').forEach(btn => {
            btn.addEventListener('click', () => updateBookingStatus(btn.dataset.id, 'checked-in'));
        });
        
        document.querySelectorAll('.btn-checkout').forEach(btn => {
            btn.addEventListener('click', () => updateBookingStatus(btn.dataset.id, 'checked-out'));
        });
        
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => updateBookingStatus(btn.dataset.id, 'cancelled'));
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editBooking(btn.dataset.id));
        });
    }
    
    function updateBookingStatus(bookingId, newStatus) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = newStatus;
            
            // Update room status if needed
            if (newStatus === 'checked-in') {
                const room = rooms.find(r => r.id === booking.roomId);
                if (room) room.status = 'occupied';
            } else if (newStatus === 'checked-out' || newStatus === 'cancelled') {
                const room = rooms.find(r => r.id === booking.roomId);
                if (room) room.status = 'available';
            }
            
            saveAllData();
            displayBookings();
        }
    }
    
    function openNewBookingModal() {
        bookingForm.reset();
        document.getElementById('booking-id').value = '';
        document.getElementById('booking-modal-title').innerHTML = '<i class="fas fa-calendar-plus"></i> New Booking';
        document.getElementById('booking-status').value = 'confirmed';
        document.getElementById('check-in-date').valueAsDate = new Date();
        updateCheckOutMinDate();
        openBookingModal();
    }
    
    function editBooking(bookingId) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            document.getElementById('booking-id').value = booking.id;
            document.getElementById('booking-modal-title').innerHTML = '<i class="fas fa-calendar-edit"></i> Edit Booking';
            
            // Set form values
            guestSelect.value = booking.guestId;
            roomSelect.value = booking.roomId;
            checkInDate.value = booking.checkInDate;
            checkOutDate.value = booking.checkOutDate;
            document.getElementById('adults').value = booking.adults;
            document.getElementById('children').value = booking.children || 0;
            totalPrice.value = booking.totalPrice;
            document.getElementById('booking-status').value = booking.status;
            document.getElementById('special-requests').value = booking.specialRequests || '';
            
            updateCheckOutMinDate();
            openBookingModal();
        }
    }
    
    function handleBookingSubmit(e) {
        e.preventDefault();
        
        const bookingId = document.getElementById('booking-id').value;
        const roomId = roomSelect.value;
        const room = rooms.find(r => r.id === roomId);
        
        if (!room) {
            alert('Please select a valid room');
            return;
        }
        
        const bookingData = {
            guestId: guestSelect.value,
            roomId: roomId,
            checkInDate: checkInDate.value,
            checkOutDate: checkOutDate.value,
            adults: parseInt(document.getElementById('adults').value),
            children: parseInt(document.getElementById('children').value) || 0,
            totalPrice: parseFloat(totalPrice.value),
            status: document.getElementById('booking-status').value,
            specialRequests: document.getElementById('special-requests').value
        };
        
        // Validation
        if (!bookingData.guestId || !bookingData.roomId || !bookingData.checkInDate || 
            !bookingData.checkOutDate || isNaN(bookingData.totalPrice)) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (new Date(bookingData.checkOutDate) <= new Date(bookingData.checkInDate)) {
            alert('Check-out date must be after check-in date');
            return;
        }
        
        if (bookingId) {
            // Update existing booking
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index !== -1) bookings[index] = { ...bookings[index], ...bookingData };
        } else {
            // Create new booking
            const newBooking = {
                id: Date.now().toString(),
                ...bookingData
            };
            bookings.push(newBooking);
            
            // Update room status if booking is active
            if (bookingData.status === 'checked-in') {
                room.status = 'occupied';
            }
        }
        
        saveAllData();
        closeBookingModal();
        displayBookings();
    }
    
    function updateCheckOutMinDate() {
        if (checkInDate.value) {
            checkOutDate.min = checkInDate.value;
            
            // If current check-out is before new check-in, reset it
            if (checkOutDate.value && new Date(checkOutDate.value) <= new Date(checkInDate.value)) {
                const nextDay = new Date(checkInDate.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutDate.value = nextDay.toISOString().split('T')[0];
            }
            
            calculateTotalPrice();
        }
    }
    
    function calculateTotalPrice() {
        if (roomSelect.value && checkInDate.value && checkOutDate.value) {
            const room = rooms.find(r => r.id === roomSelect.value);
            if (room) {
                const pricePerNight = parseFloat(room.price);
                const nights = Math.ceil(
                    (new Date(checkOutDate.value) - new Date(checkInDate.value)) / (1000 * 60 * 60 * 24)
                );
                totalPrice.value = (pricePerNight * nights).toFixed(2);
            }
        } else {
            totalPrice.value = '';
        }
    }
    
    function saveAllData() {
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    }
    
    function openBookingModal() {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeBookingModal() {
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

function loadGuests() {
    try {
        const guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        const guestSelect = document.getElementById('guest-select');
        
        if (!guestSelect) {
            console.error('Guest select element not found');
            return;
        }
        
        // Clear and add default option
        guestSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Guest';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        guestSelect.appendChild(defaultOption);
        
        // Add guest options
        if (guests.length === 0) {
            const noGuestOption = document.createElement('option');
            noGuestOption.value = '';
            noGuestOption.textContent = 'No guests available';
            noGuestOption.disabled = true;
            guestSelect.appendChild(noGuestOption);
        } else {
            guests.forEach(guest => {
                const option = document.createElement('option');
                option.value = guest.id;
                
                // Create display text with name and contact info
                let displayText = guest.name;
                if (guest.email || guest.phone) {
                    displayText += ' (';
                    if (guest.email) displayText += guest.email;
                    if (guest.email && guest.phone) displayText += ', ';
                    if (guest.phone) displayText += guest.phone;
                    displayText += ')';
                }
                
                option.textContent = displayText;
                guestSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading guests:', error);
    }
}

function loadRooms() {
    try {
        const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
        const roomSelect = document.getElementById('room-select');
        
        if (!roomSelect) {
            console.error('Room select element not found');
            return;
        }
        
        // Clear and add default option
        roomSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Room';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        roomSelect.appendChild(defaultOption);
        
        // Filter available rooms
        const availableRooms = rooms.filter(room => room.status === 'available');
        
        // Add room options
        if (availableRooms.length === 0) {
            const noRoomOption = document.createElement('option');
            noRoomOption.value = '';
            noRoomOption.textContent = 'No available rooms';
            noRoomOption.disabled = true;
            roomSelect.appendChild(noRoomOption);
        } else {
            availableRooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                
                // Create detailed display text
                let displayText = `Room ${room.number}`;
                if (room.type) displayText += ` - ${room.type}`;
                if (room.price) displayText += ` - $${room.price}/night`;
                if (room.capacity) displayText += ` - ${room.capacity} person(s)`;
                
                option.textContent = displayText;
                option.dataset.price = room.price;
                option.dataset.capacity = room.capacity || 1;
                roomSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadGuests();
    loadRooms();
    
    // Refresh data when opening modal
    document.getElementById('add-booking-btn').addEventListener('click', () => {
        loadGuests();
        loadRooms();
        document.getElementById('check-in-date').valueAsDate = new Date();
    });
    
    // Auto-refresh when rooms/guests might have changed
    window.addEventListener('storage', (event) => {
        if (event.key === 'hotelGuests') loadGuests();
        if (event.key === 'hotelRooms') loadRooms();
    });
});