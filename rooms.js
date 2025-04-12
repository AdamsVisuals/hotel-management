document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const roomsList = document.getElementById('rooms-list');
    const roomForm = document.getElementById('room-form');
    const roomModal = document.getElementById('room-modal');
    const addRoomBtn = document.getElementById('add-room-btn');
    const closeModal = document.querySelector('.close-modal');
    const roomSearch = document.getElementById('room-search');
    const roomFilter = document.getElementById('room-filter');

    // Rooms state
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];

    // Load rooms on page load
    displayRooms();

    // Event Listeners
    addRoomBtn.addEventListener('click', () => {
        roomForm.reset();
        document.getElementById('room-id').value = '';
        document.getElementById('room-modal-title').textContent = 'Add New Room';
        openRoomModal();
    });

    closeModal.addEventListener('click', closeRoomModal);

    window.addEventListener('click', e => {
        if (e.target === roomModal) closeRoomModal();
    });

    roomSearch.addEventListener('input', displayRooms);
    roomFilter.addEventListener('change', displayRooms);

    roomForm.addEventListener('submit', handleRoomSubmit);

    // Functions

    function displayRooms() {
        const searchTerm = roomSearch.value.toLowerCase();
        const filter = roomFilter.value;

        const filteredRooms = rooms.filter(room => {
            const matchSearch =
                room.number.toLowerCase().includes(searchTerm) ||
                room.type.toLowerCase().includes(searchTerm) ||
                room.description.toLowerCase().includes(searchTerm);

            const matchFilter = filter === 'all' || room.status === filter;
            return matchSearch && matchFilter;
        });

        roomsList.innerHTML = filteredRooms.length
            ? ''
            : '<p class="no-rooms">No rooms found</p>';

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

        attachRoomActionListeners();
    }

    function attachRoomActionListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn =>
            btn.addEventListener('click', handleEditRoom)
        );

        document.querySelectorAll('.btn-delete').forEach(btn =>
            btn.addEventListener('click', handleDeleteRoom)
        );
    }

    function handleRoomSubmit(e) {
        e.preventDefault();

        const roomId = document.getElementById('room-id').value;
        const roomData = {
            number: document.getElementById('room-number').value.trim(),
            type: document.getElementById('room-type').value.trim(),
            price: parseFloat(document.getElementById('room-price').value),
            status: document.getElementById('room-status').value,
            description: document.getElementById('room-description').value.trim()
        };

        if (!roomData.number || !roomData.type || isNaN(roomData.price)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (roomId) {
            const index = rooms.findIndex(r => r.id === roomId);
            if (index !== -1) rooms[index] = { ...rooms[index], ...roomData };
        } else {
            const newRoom = {
                id: Date.now().toString(),
                ...roomData
            };
            rooms.push(newRoom);
        }

        updateStorageAndDisplay();
        closeRoomModal();
    }

    function handleEditRoom(e) {
        const roomId = e.target.dataset.id;
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

    function handleDeleteRoom(e) {
        const roomId = e.target.dataset.id;

        if (confirm('Are you sure you want to delete this room?')) {
            rooms = rooms.filter(room => room.id !== roomId);
            updateStorageAndDisplay();
        }
    }

    function updateStorageAndDisplay() {
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        displayRooms();
    }

    function openRoomModal() {
        roomModal.classList.add('active');
        roomModal.classList.add('fade-in');
    }

    function closeRoomModal() {
        roomModal.classList.remove('active');
    }
});