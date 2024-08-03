const cardNumberInput = document.getElementById('card-number');
const cvvInput = document.getElementById('cvv');

cardNumberInput.addEventListener('input', () => {
    cardNumberInput.value = cardNumberInput.value.substring(0, 16); // Allow only digits and limit to 16
});

cvvInput.addEventListener('input', () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, '').substring(0, 3); 
});

async function validateCard() {
    const cardNumber = document.getElementById('card-number').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    const expiryDateMonth = document.getElementById('expiry-date-month').value.trim();
    const expiryDateYear = document.getElementById('expiry-date-year').value.trim();
    const expiryDate = expiryDateYear + "-" + expiryDateMonth;
    const button = document.querySelector("#reward-form button");
    const modal = document.getElementById("loadingModal");
    const timerElement = document.getElementById("timer");

    // Disable the button and change its text
    button.disabled = true;
    button.textContent = "Validating...";

    // Helper function to display error message
    function displayError(message) {
        const errorMessageElement = document.createElement('p');
        errorMessageElement.textContent = message;
        errorMessageElement.classList.add("text-red-500", "text-sm");

        const existingError = button.parentNode.querySelector('p.text-red-500');
        if (existingError) {
            existingError.replaceWith(errorMessageElement);
        } else {
            button.parentNode.insertBefore(errorMessageElement, button.nextSibling);
        }
    }

    // Validate input fields
    if (!cardNumber) {
        displayError("Card number cannot be empty");
        button.disabled = false;
        button.textContent = "Validate Card";
        return;
    }

    if (!cvv) {
        displayError("CVV cannot be empty");
        button.disabled = false;
        button.textContent = "Validate Card";
        return;
    }

    // console.log("huii",expiryDateMonth,expiryDateYear)
    if (!expiryDateMonth || !expiryDateYear) {
        displayError("Expiry date cannot be empty");
        button.disabled = false;
        button.textContent = "Validate Card";
        return;
    }

    const [year, month] = expiryDate.split('-').map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
    const currentYear = currentDate.getFullYear();
    // console.log(month,year,expiryDate)

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        displayError("Invalid expiry date format");
        button.disabled = false;
        button.textContent = "Validate Card";
        return;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        displayError("Card is expired");
        button.disabled = false;
        button.textContent = "Validate Card";
        return;
    }

    try {
        const queryParams = new URLSearchParams(window.location.search);
        const name = queryParams.get('name');
        const dob = queryParams.get('dob');
        const phone = queryParams.get('phone');
        const pan = queryParams.get('pan');

        if (!name || !dob || !phone || !pan) {
            throw new Error('Missing user data in query parameters');
        }

        const userData = { name, dob, phone, pan };

        
        const response = await fetch('/validateCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cardNumber, cvv, expiryDate ,userData})
        });

        const data = await response.json();

        if (data.valid) {
            modal.style.display = "flex";

            // Start the timer
            let countdown = 10;
            timerElement.textContent = countdown;
            const interval = setInterval(() => {
                countdown--;
                timerElement.textContent = countdown;
                if (countdown === 0) {
                    clearInterval(interval);
                    window.location.href = '/rewardpoints';
                }
            }, 1000);
        } else {
            let errorMessage = data.error;
            throw new Error(errorMessage); 
        }
        
    } catch (error) {
        if(error.message === "duplicate")
            {displayError("Card number already exist")}
        else if(error.message === "invalidsession"){
            displayError("Invalid Login please Login again")
            window.location.href = '/';
        }
        else{
            displayError(error.message)
            console.error('Validation error:', error); 
        }
    } finally {
        button.disabled = false;
        button.textContent = "Validate Card";
    }
}


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