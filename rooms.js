document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const roomSearch = document.getElementById('roomSearch');
    const roomStatusFilter = document.getElementById('roomStatusFilter');
    const addRoomBtn = document.getElementById('addRoomBtn');
    const roomsTable = document.getElementById('roomsTable').querySelector('tbody');
    const roomModal = document.getElementById('roomModal');
    const roomForm = document.getElementById('roomForm');
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Mock data - in real app, you'll fetch this from your API
    let rooms = [
        { id: 1, roomNumber: '101', type: 'standard', pricePerNight: 99.99, status: 'available' },
        { id: 2, roomNumber: '201', type: 'deluxe', pricePerNight: 149.99, status: 'occupied' },
        { id: 3, roomNumber: '301', type: 'suite', pricePerNight: 199.99, status: 'maintenance' }
    ];

    // Initialize room management
    renderRoomsTable();

    // Event listeners
    roomSearch.addEventListener('input', filterRooms);
    roomStatusFilter.addEventListener('change', filterRooms);
    addRoomBtn.addEventListener('click', () => openRoomModal());
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => closeRoomModal()));
    roomForm.addEventListener('submit', handleRoomSubmit);

    // Render rooms table
    function renderRoomsTable(filteredRooms = rooms) {
        roomsTable.innerHTML = '';
        
        if (filteredRooms.length === 0) {
            roomsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No rooms found</td>
                </tr>
            `;
            return;
        }
        
        filteredRooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${room.roomNumber}</td>
                <td>${formatType(room.type)}</td>
                <td>$${room.pricePerNight.toFixed(2)}</td>
                <td><span class="status-badge status-${room.status}">${formatStatus(room.status)}</span></td>
                <td class="table-actions">
                    <button class="btn-icon btn-edit" data-id="${room.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${room.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            roomsTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editRoom(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteRoom(parseInt(btn.dataset.id)));
        });
    }

    // Filter rooms
    function filterRooms() {
        const searchTerm = roomSearch.value.toLowerCase();
        const statusFilter = roomStatusFilter.value;
        
        const filteredRooms = rooms.filter(room => {
            const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        renderRoomsTable(filteredRooms);
    }

    // Open room modal for adding/editing
    function openRoomModal(roomId = null) {
        if (roomId) {
            // Edit mode
            const room = rooms.find(r => r.id === roomId);
            if (!room) return;
            
            modalTitle.textContent = 'Edit Room';
            document.getElementById('roomId').value = room.id;
            document.getElementById('roomNumber').value = room.roomNumber;
            document.getElementById('roomType').value = room.type;
            document.getElementById('roomPrice').value = room.pricePerNight;
            document.getElementById('roomStatus').value = room.status;
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Room';
            roomForm.reset();
            document.getElementById('roomId').value = '';
        }
        
        roomModal.classList.add('active');
    }

    // Close room modal
    function closeRoomModal() {
        roomModal.classList.remove('active');
    }

    // Handle room form submission
    function handleRoomSubmit(e) {
        e.preventDefault();
        
        const roomId = document.getElementById('roomId').value;
        const roomData = {
            roomNumber: document.getElementById('roomNumber').value,
            type: document.getElementById('roomType').value,
            pricePerNight: parseFloat(document.getElementById('roomPrice').value),
            status: document.getElementById('roomStatus').value
        };
        
        if (roomId) {
            // Update existing room
            const index = rooms.findIndex(r => r.id === parseInt(roomId));
            rooms[index] = { ...rooms[index], ...roomData };
        } else {
            // Create new room
            const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
            rooms.push({ id: newId, ...roomData });
        }
        
        closeRoomModal();
        renderRoomsTable();
        showAlert('success', `Room ${roomId ? 'updated' : 'added'} successfully`);
    }

    // Edit room
    function editRoom(roomId) {
        openRoomModal(roomId);
    }

    // Delete room
    function deleteRoom(roomId) {
        if (!confirm('Are you sure you want to delete this room?')) return;
        
        rooms = rooms.filter(room => room.id !== roomId);
        renderRoomsTable();
        showAlert('success', 'Room deleted successfully');
    }

    // Helper functions
    function formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});