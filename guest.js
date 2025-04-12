document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const guestsTable = document.getElementById('guests-table').querySelector('tbody');
    const guestForm = document.getElementById('guest-form');
    const guestModal = document.getElementById('guest-modal');
    const addGuestBtn = document.getElementById('add-guest-btn');
    const closeModal = document.querySelector('.close-modal');
    const guestSearch = document.getElementById('guest-search');
    const guestFilter = document.getElementById('guest-filter');
    const guestRoomSelect = document.getElementById('guest-room');

    // Guests state
    let guests = JSON.parse(localStorage.getItem('hotelGuests')) || [];

    // Load guests on page load
    displayGuests();
    loadAvailableRooms();

    // Event Listeners
    addGuestBtn.addEventListener('click', () => {
        guestForm.reset();
        document.getElementById('guest-id').value = '';
        document.getElementById('guest-modal-title').textContent = 'Add New Guest';
        openGuestModal();
    });

    closeModal.addEventListener('click', closeGuestModal);

    window.addEventListener('click', e => {
        if (e.target === guestModal) closeGuestModal();
    });

    guestSearch.addEventListener('input', displayGuests);
    guestFilter.addEventListener('change', displayGuests);

    guestForm.addEventListener('submit', handleGuestSubmit);

    // Functions

    function loadAvailableRooms() {
        const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
        guestRoomSelect.innerHTML = '<option value="">Select Room</option>';
        
        rooms.filter(room => room.status === 'available').forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `Room ${room.number} (${room.type})`;
            guestRoomSelect.appendChild(option);
        });
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function displayGuests() {
        const searchTerm = guestSearch.value.toLowerCase();
        const filter = guestFilter.value;

        const filteredGuests = guests.filter(guest => {
            const matchSearch =
                guest.name.toLowerCase().includes(searchTerm) ||
                guest.phone.toLowerCase().includes(searchTerm) ||
                (guest.email && guest.email.toLowerCase().includes(searchTerm)) ||
                (guest.idNumber && guest.idNumber.toLowerCase().includes(searchTerm));

            const matchFilter = filter === 'all' || guest.status === filter;
            return matchSearch && matchFilter;
        });

        guestsTable.innerHTML = filteredGuests.length
            ? ''
            : '<tr><td colspan="8" class="no-guests">No guests found</td></tr>';

        filteredGuests.forEach(guest => {
            const statusClass = `status-${guest.status.replace(' ', '-')}`;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${guest.idNumber || 'N/A'}</td>
                <td><strong>${guest.name}</strong></td>
                <td>${guest.phone}</td>
                <td>${guest.email || 'N/A'}</td>
                <td>${formatDate(guest.checkIn)}</td>
                <td>${formatDate(guest.checkOut)}</td>
                <td><span class="guest-status ${statusClass}">${guest.status.toUpperCase()}</span></td>
                <td class="guest-actions">
                    <button class="btn-primary btn-edit" data-id="${guest.id}">Edit</button>
                    <button class="btn-primary btn-delete" data-id="${guest.id}">Delete</button>
                </td>
            `;

            guestsTable.appendChild(row);
        });

        attachGuestActionListeners();
    }

    function attachGuestActionListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn =>
            btn.addEventListener('click', handleEditGuest)
        );

        document.querySelectorAll('.btn-delete').forEach(btn =>
            btn.addEventListener('click', handleDeleteGuest)
        );
    }

    function handleGuestSubmit(e) {
        e.preventDefault();

        const guestId = document.getElementById('guest-id').value;
        const guestData = {
            name: document.getElementById('guest-name').value.trim(),
            phone: document.getElementById('guest-phone').value.trim(),
            email: document.getElementById('guest-email').value.trim(),
            nationality: document.getElementById('guest-nationality').value.trim(),
            idType: document.getElementById('guest-id-type').value,
            idNumber: document.getElementById('guest-id-number').value.trim(),
            address: document.getElementById('guest-address').value.trim(),
            checkIn: document.getElementById('guest-checkin').value,
            checkOut: document.getElementById('guest-checkout').value,
            room: document.getElementById('guest-room').value,
            status: document.getElementById('guest-status').value,
            notes: document.getElementById('guest-notes').value.trim()
        };

        if (!guestData.name || !guestData.phone || !guestData.idNumber) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (guestId) {
            const index = guests.findIndex(g => g.id === guestId);
            if (index !== -1) guests[index] = { ...guests[index], ...guestData };
        } else {
            const newGuest = {
                id: Date.now().toString(),
                ...guestData,
                createdAt: new Date().toISOString()
            };
            guests.push(newGuest);
        }

        updateStorageAndDisplay();
        closeGuestModal();
    }

    function handleEditGuest(e) {
        const guestId = e.target.dataset.id;
        const guest = guests.find(g => g.id === guestId);

        if (guest) {
            document.getElementById('guest-modal-title').textContent = 'Edit Guest';
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

    function handleDeleteGuest(e) {
        const guestId = e.target.dataset.id;

        if (confirm('Are you sure you want to delete this guest?')) {
            guests = guests.filter(guest => guest.id !== guestId);
            updateStorageAndDisplay();
        }
    }

    function updateStorageAndDisplay() {
        localStorage.setItem('hotelGuests', JSON.stringify(guests));
        displayGuests();
    }

    function openGuestModal() {
        guestModal.classList.add('active');
        guestModal.classList.add('fade-in');
    }

    function closeGuestModal() {
        guestModal.classList.remove('active');
    }
});