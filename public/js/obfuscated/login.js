// Input Validation Functions
function validateName(name) {
    return /^[A-Za-z\s]+$/.test(name);
}

function validateDOB(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18 && age <= 120 && birthDate <= today;
}

function validatePAN(pan) {
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
    return panPattern.test(pan);
}

// Real-time Validation
const inputs = document.querySelectorAll("#login-form input");
inputs.forEach(input => {
    input.addEventListener('input', validateInput);
});

function validateInput(event) {
    const input = event.target;
    const errorId = input.id + "Error";
    const errorElement = document.getElementById(errorId);

    switch (input.id) {
        case 'name':
            errorElement.textContent = validateName(input.value) ? "" : "Name must contain only alphabets";
            break;
        case 'dob':
            errorElement.textContent = validateDOB(input.value) ? "" : "Invalid DOB (age 18-120, no future dates)";
            break;
        case 'pan':
            errorElement.textContent = validatePAN(input.value) ? "" : "Invalid PAN format (e.g., ABCDE1234F)";
            break;
        case 'phoneNumber':
            errorElement.textContent = input.value.length < 10 ? "Mobile number must be at least 10 digits" : "";
            break;
    }
}

// Phone Number Input Formatting
const phoneNumberInput = document.getElementById('phoneNumber');
phoneNumberInput.addEventListener('input', () => {
    phoneNumberInput.value = phoneNumberInput.value.replace(/\D/g, '').substring(0, 10);
});

// PAN Input Formatting and Validation
const panInput = document.getElementById('pan');
const panError = document.getElementById('panError');

panInput.addEventListener('input', () => {
    const panValue = panInput.value.toUpperCase(); // Convert to uppercase
    panInput.value = panValue.replace(/[^A-Z0-9]/g, '').substring(0, 10);

    if (panValue.length !== 10) {
        panError.textContent = "PAN should be 10 characters long.";
    } else {
        panError.textContent = "";
    }
});

// Date of Birth Display Handling
document.getElementById('dob').addEventListener('input', function() {
    const dobInput = document.getElementById('dob');
    const dobDisplay = document.getElementById('dobDisplay');
    if (dobInput.value) {
        dobDisplay.classList.add('hidden');
    } else {
        dobDisplay.classList.remove('hidden');
    }
});

// Show OTP Form
function showOTPForm(phoneNumber) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('otp-form').style.display = 'block';

    const existingPhoneDisplay = document.getElementById('otp-form').querySelector('p');
    const existingChangeNumberButton = document.getElementById('otp-form').querySelector('button.change-number');
    const existingVerifyButton = document.getElementById('otp-form').querySelector('button.verify-otp');

    if (existingPhoneDisplay) existingPhoneDisplay.remove();
    if (existingChangeNumberButton) existingChangeNumberButton.remove();
    if (existingVerifyButton) existingVerifyButton.remove();

    const phoneDisplay = document.createElement('p');
    phoneDisplay.id = "phone-display";
    phoneDisplay.textContent = `OTP sent to: ${phoneNumber}`;
    phoneDisplay.classList.add("text-gray-700", "mb-2");
    document.getElementById('otp-form').insertBefore(phoneDisplay, document.getElementById('otp-form').firstChild);

    const changeNumberButton = document.createElement('button');
    changeNumberButton.textContent = "Change Number";
    changeNumberButton.classList.add("change-number", "bg-gray-300", "hover:bg-gray-400", "text-gray-800", "font-bold", "py-2", "px-4", "rounded", "mb-4");
    changeNumberButton.addEventListener('click', () => {
        document.getElementById('otp-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    document.getElementById('otp-form').insertBefore(changeNumberButton, document.getElementById('otp-form').firstChild);
}

// Send OTP
async function sendOTP() {
    const name = document.getElementById('name').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const code = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const pan = document.getElementById('pan').value.trim();
    const phone = code + phoneNumber;

    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(el => el.textContent = "");

    const button = document.querySelector("#login-form button");
    const form = document.getElementById('login-form');

    const existingError = form.querySelector('.text-red-500');
    if (existingError) existingError.remove();

    if (!name || !dob || !phoneNumber || !pan) {
        displayError('All fields are required');
        return;
    }

    if (!validateName(name)) {
        displayError('Name must contain only alphabets');
        return;
    }

    if (!validateDOB(dob)) {
        displayError('Invalid Date of Birth. Age must be between 18 and 120 years.');
        return;
    }

    if (phoneNumber.length < 10) {
        displayError('Mobile number must be at least 10 digits');
        return;
    }

    if (!validatePAN(pan)) {
        displayError('Invalid PAN number format');
        return;
    }

    button.disabled = true;
    button.textContent = "Sending OTP...";

    try {
        const response = await fetch('/sendOTP', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('OTP sent successfully');
            showOTPForm(phone);
        } else {
            displayError('Failed to send OTP');
        }
    } catch (error) {
        console.error(error);
        displayError('Failed to send OTP');
    } finally {
        button.disabled = false;
        button.textContent = "Send OTP";
    }
}

// Display Error Message
function displayError(message) {
    const button = document.querySelector("#login-form button");
    const errorMessageElement = document.createElement('p');
    errorMessageElement.textContent = message;
    errorMessageElement.classList.add("text-red-500", "text-sm", "error-message");
    button.parentNode.insertBefore(errorMessageElement, button);
}

// Verify OTP
function verifyOTP() {
    const verifyButton = document.getElementById('verifyButton'); // Get the button element
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    const otp = document.getElementById('otp').value;
    const code = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const phone =  code+phoneNumber
    console.log(otp,code,phone)

    const userData = {
        name: document.getElementById('name').value,
        dob: document.getElementById('dob').value,
        phone: phone,
        pan: document.getElementById('pan').value
    };

    fetch('/verifyOTP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp,userData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const queryParams = new URLSearchParams(userData).toString();
            window.location.href = `/reward?${queryParams}`;
        } else {
            console.log(data.error)
            if(data.error==='number already exist'){
                window.location.href = `/rewardpoints?startTime=${encodeURIComponent(data.startTime)}`;
                return
            }
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            let errorElement = document.getElementById('otpError'); 
            if (!errorElement) { 
              errorElement = document.createElement('p'); 
              errorElement.id = 'otpError';  
              document.getElementById('otp').parentNode.appendChild(errorElement); 
            }
        
            // 2. Display the Error Message
            errorElement.style.color = 'red';
            errorElement.textContent = 'Invalid OTP';
        }
    });
}


// Resend OTP
function resendOTP() {
    sendOTP();
    let errorElement = document.getElementById('otpError');

    if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.id = 'otpError';
        const otpParent = document.getElementById('otp').parentNode;
        if (otpParent) {
            otpParent.appendChild(errorElement);
        } else {
            console.error("Parent element with ID 'otp' not found.");
        }
    }

    errorElement.style.color = 'green';
    errorElement.textContent = 'OTP sent again...';
}

// Tailwind Configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'my-primary': '#AF3014',
            },
        },
    },
    variants: {
        extend: {
            borderStyle: ['hover'],
        }
    }
};
