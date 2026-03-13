document.addEventListener('DOMContentLoaded', () => {

    // ===== LOGIN PAGE LOGIC =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('loginBtn');
        const togglePassword = document.getElementById('togglePassword');
        const passwordReqs = document.getElementById('passwordReqs');

        // Validation elements
        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-upper');
        const reqLower = document.getElementById('req-lower');
        const reqNumber = document.getElementById('req-number');
        const reqSpecial = document.getElementById('req-special');

        // Toggle Password Visibility
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Toggle emoji char based on state, visually representing eye open/close
            togglePassword.innerHTML = type === 'password' ? '&#128065;' : '&#10006;'; // cross or eye
        });

        // Show requirements box on focus
        passwordInput.addEventListener('focus', () => {
            passwordReqs.classList.add('show');
        });

        // Password Validation Logic
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            let isValid = true;

            // 1. Length (>= 8)
            if (val.length >= 8) {
                reqLength.className = 'valid';
            } else {
                reqLength.className = 'invalid';
                isValid = false;
            }

            // 2. Uppercase
            if (/[A-Z]/.test(val)) {
                reqUpper.className = 'valid';
            } else {
                reqUpper.className = 'invalid';
                isValid = false;
            }

            // 3. Lowercase
            if (/[a-z]/.test(val)) {
                reqLower.className = 'valid';
            } else {
                reqLower.className = 'invalid';
                isValid = false;
            }

            // 4. Number
            if (/[0-9]/.test(val)) {
                reqNumber.className = 'valid';
            } else {
                reqNumber.className = 'invalid';
                isValid = false;
            }

            // 5. Special Character
            if (/[@$!%*?&]/.test(val)) {
                reqSpecial.className = 'valid';
            } else {
                reqSpecial.className = 'invalid';
                isValid = false;
            }

            // Toggle Submit Button
            if (isValid) {
                loginBtn.removeAttribute('disabled');
            } else {
                loginBtn.setAttribute('disabled', 'true');
            }
        });

        // Form Submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            btn.innerHTML = 'Authenticating...';
            btn.style.opacity = '0.8';

            // Mock an API call duration
            setTimeout(() => {
                window.location.href = 'plan.html';
            }, 1000);
        });
    }

    // ===== PLAN PAGE LOGIC =====
    const monthlyAmountInput = document.getElementById('monthlyAmount');
    if (monthlyAmountInput) {
        const totalPayableEl = document.getElementById('totalPayable');
        const bonusAmountEl = document.getElementById('bonusAmount');
        const totalValueEl = document.getElementById('totalValue');
        const startPlanBtn = document.getElementById('startPlanBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        // Calculate and update the UI based on monthly amount
        function calculatePlan() {
            const monthly = parseInt(monthlyAmountInput.value) || 0;

            // Scheme logic: Pay for 11 months, get 1 month as bonus
            const payable = monthly * 11;
            const bonus = monthly;
            const total = payable + bonus; // Or monthly * 12

            // Format numbers to Indian Rupee Locale
            const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(amount);

            totalPayableEl.textContent = formatCurrency(payable);
            bonusAmountEl.textContent = '+' + formatCurrency(bonus);
            totalValueEl.textContent = formatCurrency(total);
        }

        // Attach listeners
        monthlyAmountInput.addEventListener('input', calculatePlan);
        monthlyAmountInput.addEventListener('change', calculatePlan); // for arrows

        startPlanBtn.addEventListener('click', () => {
            alert('Your Jewellery Chit Plan has been successfully created! You will be redirected to payment gateway.');
        });

        logoutBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Initialize values on page load
        calculatePlan();
    }
});
