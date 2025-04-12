// Room Management Logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const roomsList = document.getElementById('rooms-list');
    const roomForm = document.getElementById('room-form');
    const roomModal = document.getElementById('room-modal');
    const addRoomBtn = document.getElementById('add-room-btn');
    const closeModal = document.querySelector('.close-modal');
    const roomSearch = document.getElementById('room-search');
    const roomFilter = document.getElementById('room-filter');
    
    // Initialize rooms data from localStorage or create empty array
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    
    // Display all rooms
    function displayRooms() {
        const searchTerm = roomSearch.value.toLowerCase();
        const filterValue = roomFilter.value;
        
        const filteredRooms = rooms.filter(room => {
            const matchesSearch = 
                room.number.toLowerCase().includes(searchTerm) ||
                room.type.toLowerCase().includes(searchTerm) ||
                room.description.toLowerCase().includes(searchTerm);
            
            const matchesFilter = filterValue === 'all' || room.status === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        roomsList.innerHTML = '';
        
        if (filteredRooms.length === 0) {
            roomsList.innerHTML = '<p class="no-rooms">No rooms found</p>';
            return;
        }
        
        filteredRooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            const statusClass = `status-${room.status}`;
            
            roomCard.innerHTML = `
                <div class="room-card-header">
                    <h3 class="room-card-title">Room ${room.number}</h3>
                </div>
                <div class="room-card-body">
                    <p class="room-card-details">
                        <strong>Type:</strong> ${room.type}<br>
                        <strong>Price:</strong> $${room.price}/night<br>
                        <strong>Description:</strong> ${room.description || 'N/A'}
                    </p>
                    <span class="room-card-status ${statusClass}">${room.status}</span>
                    <div class="room-card-actions">
                        <button class="btn-primary btn-edit" data-id="${room.id}">Edit</button>
                        <button class="btn-primary btn-delete" data-id="${room.id}">Delete</button>
                    </div>
                </div>
            `;
            
            roomsList.appendChild(roomCard);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEditRoom);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteRoom);
        });
    }
    
    // Handle form submission (add/edit room)
    roomForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const roomId = document.getElementById('room-id').value;
        const roomData = {
            number: document.getElementById('room-number').value,
            type: document.getElementById('room-type').value,
            price: document.getElementById('room-price').value,
            status: document.getElementById('room-status').value,
            description: document.getElementById('room-description').value
        };
        
        if (roomId) {
            // Update existing room
            const index = rooms.findIndex(r => r.id === roomId);
            if (index !== -1) {
                rooms[index] = { ...rooms[index], ...roomData };
            }
        } else {
            // Add new room
            const newRoom = {
                id: Date.now().toString(),
                ...roomData
            };
            rooms.push(newRoom);
        }
        
        // Save to localStorage and refresh display
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        displayRooms();
        closeRoomModal();
    });
    
    // Handle edit room
    function handleEditRoom(e) {
        const roomId = e.target.getAttribute('data-id');
        const room = rooms.find(r => r.id === roomId);
        
        if (room) {
            document.getElementById('room-modal-title').textContent = 'Edit Room';
            document.getElementById('room-id').value = room.id;
            document.getElementById('room-number').value = room.number;
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-status').value = room.status;
            document.getElementById('room-description').value = room.description || '';
            
            openRoomModal();
        }
    }
    
    // Handle delete room
    function handleDeleteRoom(e) {
        const roomId = e.target.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this room?')) {
            rooms = rooms.filter(room => room.id !== roomId);
            localStorage.setItem('hotelRooms', JSON.stringify(rooms));
            displayRooms();
        }
    }
    
    // Open modal for adding new room
    addRoomBtn.addEventListener('click', function() {
        document.getElementById('room-modal-title').textContent = 'Add New Room';
        document.getElementById('room-id').value = '';
        roomForm.reset();
        openRoomModal();
    });
    
    // Close modal
    closeModal.addEventListener('click', closeRoomModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === roomModal) {
            closeRoomModal();
        }
    });
    
    // Search and filter functionality
    roomSearch.addEventListener('input', displayRooms);
    roomFilter.addEventListener('change', displayRooms);
    
    // Helper functions
    function openRoomModal() {
        roomModal.style.display = 'flex';
    }
    
    function closeRoomModal() {
        roomModal.style.display = 'none';
    }
    
    // Initial display
    displayRooms();
});