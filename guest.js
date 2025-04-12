document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const guestSearch = document.getElementById('guestSearch');
    const guestStatusFilter = document.getElementById('guestStatusFilter');
    const addGuestBtn = document.getElementById('addGuestBtn');
    const guestsTable = document.getElementById('guestsTable').querySelector('tbody');
    const guestModal = document.getElementById('guestModal');
    const guestForm = document.getElementById('guestForm');
    const guestModalTitle = document.getElementById('guestModalTitle');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Guest data and filters
    let guests = [];
    let rooms = [];
    let currentPage = 1;
    const guestsPerPage = 10;

    // Initialize guest management
    initGuestManagement();

    // Event listeners
    guestSearch.addEventListener('input', filterGuests);
    guestStatusFilter.addEventListener('change', filterGuests);
    addGuestBtn.addEventListener('click', () => openGuestModal());
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => closeGuestModal()));
    guestForm.addEventListener('submit', handleGuestSubmit);

    // Initialize guest management
    async function initGuestManagement() {
        await fetchRooms();
        await fetchGuests();
        updateSummaryCards();
    }

    // Fetch guests from API
    async function fetchGuests() {
        try {
            // In a real app, this would be an API call
            // Mock data for demonstration
            guests = [
                {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 555-123-4567',
                    idType: 'passport',
                    idNumber: 'AB1234567',
                    roomNumber: '101',
                    guestType: 'regular',
                    checkInDate: '2023-06-15',
                    checkOutDate: '2023-06-20',
                    status: 'checked-in',
                    specialRequests: 'Extra pillows please'
                },
                {
                    id: 2,
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1 555-987-6543',
                    idType: 'driver-license',
                    idNumber: 'DL87654321',
                    roomNumber: '201',
                    guestType: 'vip',
                    checkInDate: '2023-06-10',
                    checkOutDate: '2023-06-18',
                    status: 'checked-in',
                    specialRequests: 'Champagne in room on arrival'
                },
                {
                    id: 3,
                    firstName: 'Robert',
                    lastName: 'Johnson',
                    email: 'robert.j@example.com',
                    phone: '+1 555-456-7890',
                    idType: 'national-id',
                    idNumber: 'ID987654',
                    roomNumber: '301',
                    guestType: 'regular',
                    checkInDate: '2023-06-05',
                    checkOutDate: '2023-06-12',
                    status: 'checked-out',
                    specialRequests: ''
                }
            ];
            
            renderGuestsTable();
            renderPagination();
        } catch (error) {
            showAlert('error', 'Failed to load guests: ' + error.message);
        }
    }

    // Fetch rooms from API
    async function fetchRooms() {
        try {
            // In a real app, this would be an API call
            // Mock data for demonstration
            rooms = [
                { roomNumber: '101', type: 'standard', status: 'occupied' },
                { roomNumber: '201', type: 'deluxe', status: 'occupied' },
                { roomNumber: '301', type: 'suite', status: 'available' },
                { roomNumber: '102', type: 'standard', status: 'available' },
                { roomNumber: '202', type: 'deluxe', status: 'maintenance' }
            ];
        } catch (error) {
            showAlert('error', 'Failed to load rooms: ' + error.message);
        }
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
                    <div class="guest-info">
                        <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
                        <small class="guest-type ${guest.guestType}">${formatGuestType(guest.guestType)}</small>
                    </div>
                </td>
                <td>
                    <div class="guest-contact">
                        <div>${guest.email}</div>
                        <small>${guest.phone}</small>
                    </div>
                </td>
                <td>${guest.roomNumber}</td>
                <td>${formatDate(guest.checkInDate)}</td>
                <td>${formatDate(guest.checkOutDate)}</td>
                <td><span class="status-badge status-${guest.status}">${formatStatus(guest.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-icon btn-edit" data-id="${guest.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${guest.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${guest.status === 'checked-in' ? `
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
    function paginateGuests(guests) {
        const startIndex = (currentPage - 1) * guestsPerPage;
        return guests.slice(startIndex, startIndex + guestsPerPage);
    }

    // Render pagination
    function renderPagination(filteredGuests = guests) {
        const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
        const pagination = document.getElementById('guestsPagination');
        pagination.innerHTML = '';
        
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
        for (let i = 1; i <= totalPages; i++) {
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
        const statusFilter = guestStatusFilter.value;
        
        const filteredGuests = guests.filter(guest => {
            const matchesSearch = 
                guest.firstName.toLowerCase().includes(searchTerm) ||
                guest.lastName.toLowerCase().includes(searchTerm) ||
                guest.email.toLowerCase().includes(searchTerm) ||
                guest.phone.toLowerCase().includes(searchTerm) ||
                guest.roomNumber.toLowerCase().includes(searchTerm);
            
            const matchesStatus = 
                statusFilter === 'all' || 
                (statusFilter === 'checked-in' && guest.status === 'checked-in') ||
                (statusFilter === 'checked-out' && guest.status === 'checked-out') ||
                (statusFilter === 'vip' && guest.guestType === 'vip');
            
            return matchesSearch && matchesStatus;
        });
        
        currentPage = 1;
        renderGuestsTable(filteredGuests);
        renderPagination(filteredGuests);
    }

    // Update summary cards
    function updateSummaryCards() {
        document.getElementById('totalGuests').textContent = guests.length;
        document.getElementById('checkedInGuests').textContent = 
            guests.filter(g => g.status === 'checked-in').length;
        document.getElementById('checkedOutGuests').textContent = 
            guests.filter(g => g.status === 'checked-out').length;
        document.getElementById('vipGuests').textContent = 
            guests.filter(g => g.guestType === 'vip').length;
    }

    // Open guest modal for adding/editing
    function openGuestModal(guestId = null) {
        if (guestId) {
            // Edit mode
            const guest = guests.find(g => g.id === guestId);
            if (!guest) return;
            
            guestModalTitle.textContent = 'Edit Guest';
            document.getElementById('guestId').value = guest.id;
            document.getElementById('firstName').value = guest.firstName;
            document.getElementById('lastName').value = guest.lastName;
            document.getElementById('email').value = guest.email;
            document.getElementById('phone').value = guest.phone;
            document.getElementById('idType').value = guest.idType;
            document.getElementById('idNumber').value = guest.idNumber;
            document.getElementById('guestType').value = guest.guestType;
            document.getElementById('checkInDate').value = guest.checkInDate;
            document.getElementById('checkOutDate').value = guest.checkOutDate;
            document.getElementById('specialRequests').value = guest.specialRequests || '';
            
            // Set room number options
            updateRoomNumberSelect(guest.roomNumber);
        } else {
            // Add mode
            guestModalTitle.textContent = 'Add New Guest';
            guestForm.reset();
            document.getElementById('guestId').value = '';
            
            // Set room number options
            updateRoomNumberSelect();
        }
        
        guestModal.classList.add('active');
    }

    // Update room number select options
    function updateRoomNumberSelect(selectedRoom = '') {
        const roomNumberSelect = document.getElementById('roomNumber');
        roomNumberSelect.innerHTML = '';
        
        // Add available rooms
        const availableRooms = rooms.filter(room => 
            room.status === 'available' || room.roomNumber === selectedRoom
        );
        
        if (availableRooms.length === 0) {
            roomNumberSelect.innerHTML = '<option value="">No available rooms</option>';
            return;
        }
        
        availableRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.roomNumber;
            option.textContent = `${room.roomNumber} (${room.type})`;
            option.selected = room.roomNumber === selectedRoom;
            roomNumberSelect.appendChild(option);
        });
    }

    // Close guest modal
    function closeGuestModal() {
        guestModal.classList.remove('active');
    }

    // Handle guest form submission
    async function handleGuestSubmit(e) {
        e.preventDefault();
        
        const guestId = document.getElementById('guestId').value;
        const guestData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            idType: document.getElementById('idType').value,
            idNumber: document.getElementById('idNumber').value,
            roomNumber: document.getElementById('roomNumber').value,
            guestType: document.getElementById('guestType').value,
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            specialRequests: document.getElementById('specialRequests').value,
            status: 'checked-in' // Default status for new guests
        };
        
        try {
            if (guestId) {
                // Update existing guest
                const index = guests.findIndex(g => g.id === parseInt(guestId));
                guests[index] = { ...guests[index], ...guestData };
            } else {
                // Create new guest
                const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
                guests.push({ id: newId, ...guestData });
                
                // Update room status to occupied
                const roomIndex = rooms.findIndex(r => r.roomNumber === guestData.roomNumber);
                if (roomIndex !== -1) {
                    rooms[roomIndex].status = 'occupied';
                }
            }
            
            closeGuestModal();
            await fetchGuests(); // In real app, this would be API call
            updateSummaryCards();
            showAlert('success', `Guest ${guestId ? 'updated' : 'added'} successfully`);
        } catch (error) {
            showAlert('error', error.message);
        }
    }

    // Edit guest
    function editGuest(guestId) {
        openGuestModal(guestId);
    }

    // Delete guest
    function deleteGuest(guestId) {
        if (!confirm('Are you sure you want to delete this guest?')) return;
        
        guests = guests.filter(guest => guest.id !== guestId);
        renderGuestsTable();
        updateSummaryCards();
        showAlert('success', 'Guest deleted successfully');
    }

    // Checkout guest
    function checkoutGuest(guestId) {
        if (!confirm('Checkout this guest?')) return;
        
        const guestIndex = guests.findIndex(g => g.id === guestId);
        if (guestIndex !== -1) {
            guests[guestIndex].status = 'checked-out';
            
            // Update room status to available
            const roomNumber = guests[guestIndex].roomNumber;
            const roomIndex = rooms.findIndex(r => r.roomNumber === roomNumber);
            if (roomIndex !== -1) {
                rooms[roomIndex].status = 'available';
            }
            
            renderGuestsTable();
            updateSummaryCards();
            showAlert('success', 'Guest checked out successfully');
        }
    }

    // Helper functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function formatGuestType(type) {
        return type.toUpperCase();
    }

    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} show`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
});