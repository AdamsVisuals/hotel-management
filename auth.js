document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (simulated)
    if (localStorage.getItem('isLoggedIn') === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Password strength indicator (for signup)
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
});

function checkPasswordStrength(password) {
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Reset all bars
    strengthBars.forEach(bar => bar.classList.remove('active'));
    
    // Very weak (less than 6 chars)
    if (password.length < 6) {
        strengthBars[0].classList.add('active');
        strengthText.textContent = 'Very weak';
        strengthText.style.color = 'var(--danger)';
        return;
    }
    
    // Weak (6+ chars, no special)
    if (password.length >= 6 && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strengthBars[0].classList.add('active');
        strengthBars[1].classList.add('active');
        strengthText.textContent = 'Weak';
        strengthText.style.color = 'var(--warning)';
        return;
    }
    
    // Medium (6+ chars with special, no number)
    if (password.length >= 6 && /[!@#$%^&*(),.?":{}|<>]/.test(password) && !/\d/.test(password)) {
        strengthBars[0].classList.add('active');
        strengthBars[1].classList.add('active');
        strengthText.textContent = 'Medium';
        strengthText.style.color = 'var(--warning)';
        return;
    }
    
    // Strong (6+ chars with special and number)
    if (password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password) && /\d/.test(password)) {
        strengthBars[0].classList.add('active');
        strengthBars[1].classList.add('active');
        strengthBars[2].classList.add('active');
        strengthText.textContent = 'Strong';
        strengthText.style.color = 'var(--success)';
        return;
    }
    
    // Default
    strengthText.textContent = 'Password strength';
    strengthText.style.color = 'var(--gray)';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Reset errors
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    
    // Validate email
    if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Simulate authentication (in a real app, this would be an API call)
    // For demo purposes, we'll accept any password with 6+ chars and valid email
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
    }
    
    // Redirect to dashboard
    window.location.href = 'index.html';
}

function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset errors
    document.getElementById('nameError').textContent = '';
    document.getElementById('signupEmailError').textContent = '';
    document.getElementById('signupPasswordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    
    // Validate name
    if (name.length < 3) {
        document.getElementById('nameError').textContent = 'Name must be at least 3 characters';
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        document.getElementById('signupEmailError').textContent = 'Please enter a valid email address';
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        document.getElementById('signupPasswordError').textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        return;
    }
    
    // Simulate user creation (in a real app, this would be an API call)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        document.getElementById('signupEmailError').textContent = 'Email already registered';
        return;
    }
    
    // Add new user
    users.push({
        name: name,
        email: email,
        password: password // In a real app, never store plain text passwords!
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login the new user
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    // Redirect to dashboard
    window.location.href = 'index.html';
}