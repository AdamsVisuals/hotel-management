document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const staffTable = document.getElementById('staff-table').querySelector('tbody');
    const staffForm = document.getElementById('staff-form');
    const staffModal = document.getElementById('staff-modal');
    const addStaffBtn = document.getElementById('add-staff-btn');
    const closeModal = document.querySelector('.close-modal');
    const staffSearch = document.getElementById('staff-search');
    const staffFilter = document.getElementById('staff-filter');

    // Staff state
    let staffMembers = JSON.parse(localStorage.getItem('hotelStaff')) || [];

    // Load staff on page load
    displayStaff();

    // Event Listeners
    addStaffBtn.addEventListener('click', () => {
        staffForm.reset();
        document.getElementById('staff-id').value = '';
        document.getElementById('staff-modal-title').textContent = 'Add Staff Member';
        document.getElementById('staff-hire-date').valueAsDate = new Date();
        openStaffModal();
    });

    closeModal.addEventListener('click', closeStaffModal);

    window.addEventListener('click', e => {
        if (e.target === staffModal) closeStaffModal();
    });

    staffSearch.addEventListener('input', displayStaff);
    staffFilter.addEventListener('change', displayStaff);

    staffForm.addEventListener('submit', handleStaffSubmit);

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

    function displayStaff() {
        const searchTerm = staffSearch.value.toLowerCase();
        const filter = staffFilter.value;

        const filteredStaff = staffMembers.filter(staff => {
            const matchSearch =
                staff.name.toLowerCase().includes(searchTerm) ||
                staff.position.toLowerCase().includes(searchTerm) ||
                staff.email.toLowerCase().includes(searchTerm);

            const matchFilter = filter === 'all' || staff.position === filter;
            return matchSearch && matchFilter;
        });

        staffTable.innerHTML = filteredStaff.length
            ? ''
            : '<tr><td colspan="8" class="no-staff"><i class="fas fa-user-slash"></i> No staff members found</td></tr>';

        filteredStaff.forEach(staff => {
            const statusClass = `status-${staff.status.replace(' ', '-')}`;
            const positionClass = `position-${staff.position}`;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td data-label="ID">${staff.id.substring(0, 6)}</td>
                <td data-label="Name"><strong>${staff.name}</strong></td>
                <td data-label="Position" class="${positionClass}">${staff.position.charAt(0).toUpperCase() + staff.position.slice(1)}</td>
                <td data-label="Contact">
                    <div>${staff.phone}</div>
                    <small>${staff.email}</small>
                </td>
                <td data-label="Hire Date">${formatDate(staff.hireDate)}</td>
                <td data-label="Salary">${formatCurrency(staff.salary)}</td>
                <td data-label="Status"><span class="staff-status ${statusClass}">${staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}</span></td>
                <td data-label="Actions" class="staff-actions">
                    <button class="btn-edit" data-id="${staff.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" data-id="${staff.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;

            staffTable.appendChild(row);
        });

        attachStaffActionListeners();
    }

    function attachStaffActionListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn =>
            btn.addEventListener('click', handleEditStaff)
        );

        document.querySelectorAll('.btn-delete').forEach(btn =>
            btn.addEventListener('click', handleDeleteStaff)
        );
    }

    function handleStaffSubmit(e) {
        e.preventDefault();

        const staffId = document.getElementById('staff-id').value;
        const staffData = {
            name: document.getElementById('staff-name').value.trim(),
            position: document.getElementById('staff-position').value,
            email: document.getElementById('staff-email').value.trim(),
            phone: document.getElementById('staff-phone').value.trim(),
            hireDate: document.getElementById('staff-hire-date').value,
            salary: parseFloat(document.getElementById('staff-salary').value),
            address: document.getElementById('staff-address').value.trim(),
            status: document.getElementById('staff-status').value,
            shift: document.getElementById('staff-shift').value,
            notes: document.getElementById('staff-notes').value.trim()
        };

        if (!staffData.name || !staffData.email || !staffData.phone || isNaN(staffData.salary)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (staffId) {
            const index = staffMembers.findIndex(s => s.id === staffId);
            if (index !== -1) staffMembers[index] = { ...staffMembers[index], ...staffData };
        } else {
            const newStaff = {
                id: Date.now().toString(),
                ...staffData
            };
            staffMembers.push(newStaff);
        }

        updateStorageAndDisplay();
        closeStaffModal();
    }

    function handleEditStaff(e) {
        const staffId = e.target.dataset.id;
        const staff = staffMembers.find(s => s.id === staffId);

        if (staff) {
            document.getElementById('staff-modal-title').textContent = 'Edit Staff Member';
            document.getElementById('staff-id').value = staff.id;
            document.getElementById('staff-name').value = staff.name;
            document.getElementById('staff-position').value = staff.position;
            document.getElementById('staff-email').value = staff.email;
            document.getElementById('staff-phone').value = staff.phone;
            document.getElementById('staff-hire-date').value = staff.hireDate;
            document.getElementById('staff-salary').value = staff.salary;
            document.getElementById('staff-address').value = staff.address || '';
            document.getElementById('staff-status').value = staff.status;
            document.getElementById('staff-shift').value = staff.shift || 'morning';
            document.getElementById('staff-notes').value = staff.notes || '';

            openStaffModal();
        }
    }

    function handleDeleteStaff(e) {
        const staffId = e.target.dataset.id;

        if (confirm('Are you sure you want to delete this staff member?')) {
            staffMembers = staffMembers.filter(staff => staff.id !== staffId);
            updateStorageAndDisplay();
        }
    }

    function updateStorageAndDisplay() {
        localStorage.setItem('hotelStaff', JSON.stringify(staffMembers));
        displayStaff();
    }

    function openStaffModal() {
        staffModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeStaffModal() {
        staffModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});