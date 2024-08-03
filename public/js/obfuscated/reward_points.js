window.onload = function() {
    triggerConfetti();

    // Get startTime from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const startTime = urlParams.get('startTime');

    // Initialize the countdown based on the presence of startTime
    if (startTime) {
        initializeCountdown(new Date(startTime));
    } else {
        initializeCountdown();
    }
};

// Function to initialize countdown timer
function initializeCountdown(startTime = null) {
    let countdown;

    if (startTime) {
        // Calculate countdown from 48 hours minus the time elapsed since startTime
        const now = new Date();
        const elapsed = Math.max(0, now - startTime);
        countdown = Math.max(0, 48 * 60 * 60 - Math.floor(elapsed / 1000)); // in seconds
        if (elapsed >= 48 * 60 * 60 * 1000) { // 48 hours in milliseconds
            document.getElementById('timer').innerHTML = 'Your reward has been successfully Delivered';
            // document.getElementById('statusMessage').innerHTML  = 'Your reward has been successfully delivered';
            return; // Exit the function to stop further execution
        }
    } else {
        // Default countdown from 48 hours
        countdown = 48 * 60 * 60; // in seconds
    }

    const timerElement = document.getElementById('timer');

    function updateTimer() {
        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;

        timerElement.innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (countdown > 0) {
            countdown--;
            setTimeout(updateTimer, 1000);
        }
    }

    updateTimer();
}

function goHome() {
    window.location.href = '/';
}

function triggerConfetti() {
    const duration = 2 * 1000; 
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 1 }
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Tailwind CSS config
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
