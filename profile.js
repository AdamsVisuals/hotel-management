document.addEventListener('DOMContentLoaded', function() {
    // Debugging initialization
    console.log('Profile page initialized');
    
    // DOM Elements
    const editProfileBtn = document.getElementById('editProfileBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const profileForm = document.getElementById('profileForm');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const profileImage = document.getElementById('profileImage');

    // Verify all elements exist
    if (!editProfileBtn || !closeModalBtn || !editProfileModal || !profileForm || !uploadOverlay || !profileImageUpload || !profileImage) {
        console.error('Critical elements missing from page');
        return;
    }

    // User data management
    const USER_DATA_KEY = 'hotelUserProfile';
    const USER_IMAGE_KEY = 'hotelUserProfileImage';

    // Initialize profile
    function initProfile() {
        console.log('Initializing profile...');
        const savedData = localStorage.getItem(USER_DATA_KEY);
        const savedImage = localStorage.getItem(USER_IMAGE_KEY);
        
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                displayProfileData(userData);
                console.log('Loaded user data from storage');
            } catch (e) {
                console.error('Error parsing saved data:', e);
                loadDefaultProfile();
            }
        } else {
            loadDefaultProfile();
        }
        
        if (savedImage) {
            profileImage.src = savedImage;
            console.log('Loaded profile image from storage');
        }
    }

    function loadDefaultProfile() {
        console.log('Loading default profile data');
        const defaultData = {
            fullName: 'Adams Visuals',
            email: 'adamsvisualsllc@gmail.com',
            phone: '+255 744 726 945',
            position: 'Computer Networking Engineer',
            joinDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            stats: {
                bookingsManaged: 150,
                guestRating: 4.5,
                avgResponse: '10 min'
            }
        };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(defaultData));
        displayProfileData(defaultData);
    }

    // Display profile data
    function displayProfileData(data) {
        console.log('Displaying profile data:', data);
        document.getElementById('userFullName').textContent = data.fullName;
        document.getElementById('userEmail').textContent = data.email;
        document.getElementById('userPhone').textContent = data.phone;
        document.getElementById('userPosition').textContent = data.position;
        document.getElementById('userJoinDate').textContent = data.joinDate;
        
        if (data.stats) {
            document.getElementById('bookingsManaged').textContent = 
                data.stats.bookingsManaged.toLocaleString();
            document.getElementById('guestRating').textContent = 
                data.stats.guestRating.toFixed(1) + '/5.0';
            document.getElementById('avgResponse').textContent = 
                data.stats.avgResponse;
        }
    }

    // Modal control functions
    function openEditModal() {
        console.log('Opening edit modal');
        const savedData = JSON.parse(localStorage.getItem(USER_DATA_KEY));
        document.getElementById('editFullName').value = savedData.fullName;
        document.getElementById('editEmail').value = savedData.email;
        document.getElementById('editPhone').value = savedData.phone;
        document.getElementById('editPosition').value = savedData.position;
        editProfileModal.style.display = 'flex';
        console.log('Modal should be visible now');
    }

    function closeEditModal() {
        editProfileModal.style.display = 'none';
    }

    // Event listeners
    editProfileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openEditModal();
    });

    closeModalBtn.addEventListener('click', closeEditModal);

    window.addEventListener('click', function(event) {
        if (event.target === editProfileModal) {
            closeEditModal();
        }
    });

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Profile form submitted');
        
        const updatedData = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            position: document.getElementById('editPosition').value,
            joinDate: document.getElementById('userJoinDate').textContent,
            stats: {
                bookingsManaged: parseInt(document.getElementById('bookingsManaged').textContent.replace(/,/g, '')),
                guestRating: parseFloat(document.getElementById('guestRating').textContent),
                avgResponse: document.getElementById('avgResponse').textContent
            }
        };
        
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
        displayProfileData(updatedData);
        closeEditModal();
        showToast('Profile updated successfully!');
    });

    uploadOverlay.addEventListener('click', function() {
        profileImageUpload.click();
    });

    profileImageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                localStorage.setItem(USER_IMAGE_KEY, event.target.result);
                profileImage.src = event.target.result;
                showToast('Profile picture updated!');
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Initialize the page
    initProfile();
});