document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addGuestBtn = document.getElementById('addGuestBtn');
    const guestModal = document.getElementById('guestModal');
    const guestForm = document.getElementById('guestForm');
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const guestSearch = document.getElementById('guestSearch');
    const guestFilter = document.getElementById('guestFilter');
    const guestsTable = document.getElementById('guestsTable').querySelector('tbody');
    const refreshBtn = document.getElementById('refreshBtn');
    const roomNumberSelect = document.getElementById('roomNumber');
    
    // Guest data and pagination
    let guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [
        { roomNumber: '101', type: 'standard', status: 'available' },
        { roomNumber: '102', type: 'standard', status: 'available' },
        { roomNumber: '201', type: 'deluxe', status: 'available' },
        { roomNumber: '202', type: 'deluxe', status: 'available' },
        { roomNumber: '301', type: 'suite', status: 'available' }
    ];
    
    let currentPage = 1;
    const guestsPerPage = 10;
    
    // Initialize the page
    initGuestManagement();
    
    // Event Listeners
    addGuestBtn.addEventListener('click', () => openGuestModal());
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeGuestModal));
    guestForm.addEventListener('submit', handleGuestSubmit);
    guestSearch.addEventListener('input', filterGuests);
    guestFilter.addEventListener('change', filterGuests);
    refreshBtn.addEventListener('click', initGuestManagement);
    
    // Initialize guest management
    function initGuestManagement() {
        updateRoomNumberSelect();
        updateStats();
        renderGuestsTable();
        renderPagination();
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('hotelGuests', JSON.stringify(guests));
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    }
    
    // Update room number select options
    function updateRoomNumberSelect(selectedRoom = '') {
        roomNumberSelect.innerHTML = '<option value="">Select Room</option>';
        
        // Add available rooms
        const availableRooms = rooms.filter(room => 
            room.status === 'available' || room.roomNumber === selectedRoom
        );
        
        availableRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.roomNumber;
            option.textContent = `${room.roomNumber} (${room.type})`;
            if (room.roomNumber === selectedRoom) {
                option.selected = true;
            }
            roomNumberSelect.appendChild(option);
        });
    }
    
    // Render guests table
    function renderGuestsTable(filteredGuests = guests) {
        guestsTable.innerHTML = '';
        
        const paginatedGuests = paginateGuests(filteredGuests);
        
        if (paginatedGuests.length === 0) {
            guestsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No guests found</td>
                </tr>
            `;
            return;
        }
        
        paginatedGuests.forEach(guest => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="guest-info-cell">
                        <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
                        <small class="guest-type ${guest.guestType}">${formatGuestType(guest.guestType)}</small>
                    </div>
                </td>
                <td>
                    <div class="guest-contact">${guest.email}<br>${guest.phone}</div>
                </td>
                <td>${guest.roomNumber}</td>
                <td>${formatDateTime(guest.checkInDate)}</td>
                <td>${guest.status === 'checked-out' ? formatDateTime(guest.checkOutDate) : '--'}</td>
                <td><span class="status-badge status-${guest.status}">${formatStatus(guest.status)}</span></td>
                <td class="table-actions-cell">
                    <button class="btn-icon btn-edit" data-id="${guest.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${guest.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${guest.status === 'current' ? `
                    <button class="btn-icon btn-checkout" data-id="${guest.id}">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            guestsTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editGuest(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteGuest(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.btn-checkout').forEach(btn => {
            btn.addEventListener('click', () => checkoutGuest(parseInt(btn.dataset.id)));
        });
    }
    
    // Paginate guests
    function paginateGuests(guestsData) {
        const startIndex = (currentPage - 1) * guestsPerPage;
        return guestsData.slice(startIndex, startIndex + guestsPerPage);
    }
    
    // Render pagination
    function renderPagination(filteredGuests = guests) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderGuestsTable(filteredGuests);
                renderPagination(filteredGuests);
            }
        });
        pagination.appendChild(prevBtn);
        
        // Page buttons
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderGuestsTable(filteredGuests);
                renderPagination(filteredGuests);
            });
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderGuestsTable(filteredGuests);
                renderPagination(filteredGuests);
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    // Filter guests
    function filterGuests() {
        const searchTerm = guestSearch.value.toLowerCase();
        const filterValue = guestFilter.value;
        
        let filteredGuests = guests;
        
        // Apply search filter
        if (searchTerm) {
            filteredGuests = filteredGuests.filter(guest => 
                guest.firstName.toLowerCase().includes(searchTerm) ||
                guest.lastName.toLowerCase().includes(searchTerm) ||
                guest.email.toLowerCase().includes(searchTerm) ||
                guest.phone.includes(searchTerm) ||
                guest.roomNumber.includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (filterValue !== 'all') {
            filteredGuests = filteredGuests.filter(guest => {
                if (filterValue === 'current') return guest.status === 'current';
                if (filterValue === 'checked-out') return guest.status === 'checked-out';
                if (filterValue === 'vip') return guest.guestType === 'vip';
                return true;
            });
        }
        
        currentPage = 1;
        renderGuestsTable(filteredGuests);
        renderPagination(filteredGuests);
    }
    
    // Update statistics cards
    function updateStats() {
        document.getElementById('totalGuests').textContent = guests.length;
        document.getElementById('currentGuests').textContent = guests.filter(g => g.status === 'current').length;
        document.getElementById('checkedOutGuests').textContent = guests.filter(g => g.status === 'checked-out').length;
        document.getElementById('vipGuests').textContent = guests.filter(g => g.guestType === 'vip').length;
    }
    
    // Open guest modal
    function openGuestModal(guestId = null) {
        if (guestId) {
            // Edit mode
            const guest = guests.find(g => g.id === guestId);
            if (!guest) return;
            
            modalTitle.textContent = 'Edit Guest';
            document.getElementById('guestId').value = guest.id;
            document.getElementById('firstName').value = guest.firstName;
            document.getElementById('lastName').value = guest.lastName;
            document.getElementById('email').value = guest.email;
            document.getElementById('phone').value = guest.phone;
            document.getElementById('idType').value = guest.idType;
            document.getElementById('idNumber').value = guest.idNumber;
            document.getElementById('guestType').value = guest.guestType;
            document.getElementById('specialRequests').value = guest.specialRequests || '';
            
            // Format dates for datetime-local input
            document.getElementById('checkInDate').value = formatDateTimeForInput(guest.checkInDate);
            document.getElementById('checkOutDate').value = guest.checkOutDate ? formatDateTimeForInput(guest.checkOutDate) : '';
            
            // Update room select
            updateRoomNumberSelect(guest.roomNumber);
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Guest';
            guestForm.reset();
            document.getElementById('guestId').value = '';
            document.getElementById('checkInDate').value = formatDateTimeForInput(new Date().toISOString());
            
            // Update room select
            updateRoomNumberSelect();
        }
        
        guestModal.classList.add('active');
    }
    
    // Close guest modal
    function closeGuestModal() {
        guestModal.classList.remove('active');
    }
    
    // Handle guest form submission
    function handleGuestSubmit(e) {
        e.preventDefault();
        
        const guestId = document.getElementById('guestId').value;
        const formData = new FormData(guestForm);
        const guestData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!guestData.firstName || !guestData.lastName || !guestData.email || 
            !guestData.phone || !guestData.roomNumber || !guestData.checkInDate) {
            showAlert('error', 'Please fill in all required fields');
            return;
        }
        
        // Validate check-out date is after check-in if provided
        if (guestData.checkOutDate && new Date(guestData.checkOutDate) <= new Date(guestData.checkInDate)) {
            showAlert('error', 'Check-out date must be after check-in date');
            return;
        }
        
        try {
            if (guestId) {
                // Update existing guest
                const index = guests.findIndex(g => g.id === parseInt(guestId));
                if (index !== -1) {
                    // Free up the old room if changing rooms
                    if (guests[index].roomNumber !== guestData.roomNumber) {
                        freeRoom(guests[index].roomNumber);
                        occupyRoom(guestData.roomNumber);
                    }
                    
                    guests[index] = { 
                        ...guests[index],
                        ...guestData,
                        id: parseInt(guestId),
                        checkInDate: new Date(guestData.checkInDate).toISOString(),
                        checkOutDate: guestData.checkOutDate ? new Date(guestData.checkOutDate).toISOString() : null,
                        status: guestData.status || 'current'
                    };
                    
                    showAlert('success', 'Guest updated successfully');
                }
            } else {
                // Add new guest
                const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
                
                // Occupy the room
                occupyRoom(guestData.roomNumber);
                
                guests.unshift({ 
                    id: newId,
                    ...guestData,
                    status: 'current',
                    checkInDate: new Date(guestData.checkInDate).toISOString(),
                    checkOutDate: guestData.checkOutDate ? new Date(guestData.checkOutDate).toISOString() : null
                });
                
                showAlert('success', 'Guest added successfully');
            }
            
            closeGuestModal();
            saveData();
            updateStats();
            renderGuestsTable();
            renderPagination();
        } catch (error) {
            showAlert('error', 'Error saving guest: ' + error.message);
        }
    }
    
    // Mark a room as occupied
    function occupyRoom(roomNumber) {
        const roomIndex = rooms.findIndex(r => r.roomNumber === roomNumber);
        if (roomIndex !== -1) {
            rooms[roomIndex].status = 'occupied';
            saveData();
        }
    }
    
    // Mark a room as available
    function freeRoom(roomNumber) {
        const roomIndex = rooms.findIndex(r => r.roomNumber === roomNumber);
        if (roomIndex !== -1) {
            rooms[roomIndex].status = 'available';
            saveData();
        }
    }
    
    // Edit guest
    function editGuest(guestId) {
        openGuestModal(guestId);
    }
    
    // Delete guest
    function deleteGuest(guestId) {
        if (confirm('Are you sure you want to delete this guest?')) {
            const guest = guests.find(g => g.id === guestId);
            if (guest) {
                // Free up the room
                freeRoom(guest.roomNumber);
                
                // Remove the guest
                guests = guests.filter(g => g.id !== guestId);
                
                saveData();
                updateStats();
                renderGuestsTable();
                renderPagination();
                showAlert('success', 'Guest deleted successfully');
            }
        }
    }
    
    // Checkout guest
    function checkoutGuest(guestId) {
        if (confirm('Checkout this guest?')) {
            const guest = guests.find(g => g.id === guestId);
            if (guest) {
                // Free up the room
                freeRoom(guest.roomNumber);
                
                // Update guest status
                guest.status = 'checked-out';
                guest.checkOutDate = new Date().toISOString();
                
                saveData();
                updateStats();
                renderGuestsTable();
                showAlert('success', 'Guest checked out successfully');
            }
        }
    }
    
    // Helper functions
    function formatDateTime(dateString) {
        if (!dateString) return '--';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString(undefined, options);
    }
    
    function formatDateTimeForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    }
    
    function formatStatus(status) {
        return status === 'current' ? 'Checked In' : 'Checked Out';
    }
    
    function formatGuestType(type) {
        return type.toUpperCase();
    }
    
    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
});