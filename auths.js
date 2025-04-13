// auth.js - User authentication data module
const Auth = {
    currentUser: null,
    
    initialize: function() {
        // Check if user is logged in (you would typically check session/cookies)
        this.currentUser = this.getUserData();
    },
    
    getUserData: function() {
        // In a real app, this would come from your backend API
        // For now, we'll use localStorage with a fallback to default data
        const savedUser = localStorage.getItem('hotelAuthUser');
        
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        
        // Default user data structure
        return {
            id: 1,
            fullName: '',
            email: '',
            phone: '',
            position: '',
            joinDate: new Date().toISOString(),
            profileImage: 'https://via.placeholder.com/150',
            stats: {
                bookingsManaged: 0,
                guestRating: 0,
                avgResponse: '0 min'
            },
            lastLogin: new Date().toISOString()
        };
    },
    
    updateUserData: function(updatedData) {
        // Merge updated data with existing data
        this.currentUser = {
            ...this.currentUser,
            ...updatedData,
            stats: {
                ...this.currentUser.stats,
                ...(updatedData.stats || {})
            }
        };
        
        // Save to localStorage
        localStorage.setItem('hotelAuthUser', JSON.stringify(this.currentUser));
        
        // In a real app, you would send this to your backend
        return true;
    },
    
    updateProfileImage: function(imageUrl) {
        if (!this.currentUser) return false;
        
        this.currentUser.profileImage = imageUrl;
        localStorage.setItem('hotelAuthUser', JSON.stringify(this.currentUser));
        return true;
    },
    
    isAuthenticated: function() {
        return this.currentUser !== null;
    }
};

// Initialize when loaded
Auth.initialize();