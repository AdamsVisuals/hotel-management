document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const guestsTable = document.getElementById('guests-table').querySelector('tbody');
    const guestForm = document.getElementById('guest-form');
    const guestModal = document.getElementById('guest-modal');
    const addGuestBtn = document.getElementById('add-guest-btn');
    const closeModal = document.querySelector('.close-modal');
    const guestSearch = document.getElementById('guest-search');
    const guestFilter = document.getElementById('guest-filter');
    const guestRoomSelect = document.getElementById('guest-room');
    
    // Status icons mapping
    const statusIcons = {
        'checked-in': 'fa-sign-in-alt',
        'checked-out': 'fa-sign-out-alt',
        'vip': 'fa-crown',
        'no-show': 'fa-user-slash'
    };
    
    // Initialize guests data from localStorage or create empty array
    let guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
    
    // Load available rooms from room management
    function loadAvailableRooms() {
        const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
        guestRoomSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a room';
        guestRoomSelect.appendChild(defaultOption);
        
        // Add available rooms
        rooms.filter(room => room.status === 'available').forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `Room ${room.number} (${room.type})`;
            guestRoomSelect.appendChild(option);
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Display all guests
    function displayGuests() {
        const searchTerm = guestSearch.value.toLowerCase();
        const filterValue = guestFilter.value;
        
        const filteredGuests = guests.filter(guest => {
            const matchesSearch = 
                guest.name.toLowerCase().includes(searchTerm) ||
                guest.phone.toLowerCase().includes(searchTerm) ||
                (guest.email && guest.email.toLowerCase().includes(searchTerm)) ||
                (guest.idNumber && guest.idNumber.toLowerCase().includes(searchTerm));
            
            const matchesFilter = filterValue === 'all' || guest.status === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        guestsTable.innerHTML = '';
        
        if (filteredGuests.length === 0) {
            guestsTable.innerHTML = `
                <tr class="no-guests">
                    <td colspan="8">
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas fa-user-times" style="font-size: 24px; color: #6c757d;"></i>
                            <p style="margin-top: 10px;">No guests found matching your criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredGuests.forEach(guest => {
            const statusIcon = statusIcons[guest.status] || 'fa-user';
            const statusClass = `status-${guest.status.replace(' ', '-')}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Guest ID">${guest.idNumber || 'N/A'}</td>
                <td data-label="Name"><strong>${guest.name}</strong></td>
                <td data-label="Phone">${guest.phone}</td>
                <td data-label="Email">${guest.email || 'N/A'}</td>
                <td data-label="Check-In">${formatDate(guest.checkIn)}</td>
                <td data-label="Check-Out">${formatDate(guest.checkOut)}</td>
                <td data-label="Status">
                    <span class="guest-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${guest.status.replace('-', ' ').toUpperCase()}
                    </span>
                </td>
                <td data-label="Actions">
                    <div class="table-actions">
                        <button class="btn-table btn-view" data-id="${guest.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-table btn-edit" data-id="${guest.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-table btn-delete" data-id="${guest.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            guestsTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', handleViewGuest);
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEditGuest);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteGuest);
        });
    }
    
    // Handle form submission (add/edit guest)
    guestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const guestId = document.getElementById('guest-id').value;
        const guestData = {
            name: document.getElementById('guest-name').value,
            phone: document.getElementById('guest-phone').value,
            email: document.getElementById('guest-email').value,
            nationality: document.getElementById('guest-nationality').value,
            idType: document.getElementById('guest-id-type').value,
            idNumber: document.getElementById('guest-id-number').value,
            address: document.getElementById('guest-address').value,
            checkIn: document.getElementById('guest-checkin').value,
            checkOut: document.getElementById('guest-checkout').value,
            room: document.getElementById('guest-room').value,
            status: document.getElementById('guest-status').value,
            notes: document.getElementById('guest-notes').value
        };
        
        if (guestId) {
            // Update existing guest
            const index = guests.findIndex(g => g.id === guestId);
            if (index !== -1) {
                guests[index] = { ...guests[index], ...guestData };
            }
        } else {
            // Add new guest
            const newGuest = {
                id: Date.now().toString(),
                ...guestData,
                createdAt: new Date().toISOString()
            };
            guests.push(newGuest);
        }
        
        // Save to localStorage and refresh display
        localStorage.setItem('hotelGuests', JSON.stringify(guests));
        displayGuests();
        closeGuestModal();
    });
    
    // Handle view guest
    function handleViewGuest(e) {
        const guestId = e.target.getAttribute('data-id') || 
                      e.target.closest('button').getAttribute('data-id');
        const guest = guests.find(g => g.id === guestId);
        
        if (guest) {
            // In a real app, you might open a view-only modal or redirect to a detail page
            alert(`Viewing guest: ${guest.name}\nPhone: ${guest.phone}\nStatus: ${guest.status}`);
        }
    }
    
    // Handle edit guest
    function handleEditGuest(e) {
        const guestId = e.target.getAttribute('data-id') || 
                      e.target.closest('button').getAttribute('data-id');
        const guest = guests.find(g => g.id === guestId);
        
        if (guest) {
            document.getElementById('guest-modal-title').innerHTML = 
                `<i class="fas fa-user-edit"></i> Edit Guest`;
            document.getElementById('guest-id').value = guest.id;
            document.getElementById('guest-name').value = guest.name;
            document.getElementById('guest-phone').value = guest.phone;
            document.getElementById('guest-email').value = guest.email || '';
            document.getElementById('guest-nationality').value = guest.nationality || '';
            document.getElementById('guest-id-type').value = guest.idType || 'passport';
            document.getElementById('guest-id-number').value = guest.idNumber || '';
            document.getElementById('guest-address').value = guest.address || '';
            document.getElementById('guest-checkin').value = guest.checkIn || '';
            document.getElementById('guest-checkout').value = guest.checkOut || '';
            document.getElementById('guest-room').value = guest.room || '';
            document.getElementById('guest-status').value = guest.status || 'checked-in';
            document.getElementById('guest-notes').value = guest.notes || '';
            
            loadAvailableRooms();
            openGuestModal();
        }
    }
    
    // Handle delete guest
    function handleDeleteGuest(e) {
        const guestId = e.target.getAttribute('data-id') || 
                      e.target.closest('button').getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this guest?')) {
            guests = guests.filter(guest => guest.id !== guestId);
            localStorage.setItem('hotelGuests', JSON.stringify(guests));
            displayGuests();
        }
    }
    
    // Open modal for adding new guest
    addGuestBtn.addEventListener('click', function() {
        document.getElementById('guest-modal-title').innerHTML = 
            `<i class="fas fa-user-plus"></i> Add New Guest`;
        document.getElementById('guest-id').value = '';
        guestForm.reset();
        loadAvailableRooms();
        openGuestModal();
    });
    
    // Close modal
    closeModal.addEventListener('click', closeGuestModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === guestModal) {
            closeGuestModal();
        }
    });
    
    // Search and filter functionality
    guestSearch.addEventListener('input', displayGuests);
    guestFilter.addEventListener('change', displayGuests);
    
    // Helper functions
    function openGuestModal() {
        guestModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeGuestModal() {
        guestModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Initial display
    displayGuests();
});