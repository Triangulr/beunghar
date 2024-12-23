// Ensure the DOM is fully loaded before running scripts

document.addEventListener('DOMContentLoaded', () => {
        const menuToggle = document.querySelector('.js-menu-toggle');
        const fullscreenMenu = document.querySelector('.fullscreen-menu');
    
        menuToggle.addEventListener('click', () => {
            fullscreenMenu.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    
        // Close the menu when a link is clicked
        fullscreenMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                fullscreenMenu.classList.remove('active');
                menuToggle.classList.remove('is-active');
            }
        });
    
    

    // Video scaling on scroll
    const videoSection = document.getElementById('video-section');
    const video = document.getElementById('dynamic-video');
    if (videoSection && video) {
        window.addEventListener('scroll', () => {
            const sectionRect = videoSection.getBoundingClientRect();
            const sectionHeight = window.innerHeight;

            if (sectionRect.bottom < 0 || sectionRect.top > sectionHeight) {
                video.style.transform = 'scale(0.8)'; // Shrink when out of view
            } else {
                video.style.transform = 'scale(1)'; // Reset to normal size when in view
            }
        });
    }

    // Progress bar dynamic update
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '70%'; // Example: Update progress dynamically
    }

    // Load the default section
    showSection('home');

    // Event listener for login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            handleLogin(email, password);
        });
    }

    // Testimonial slider
    const testimonials = document.querySelectorAll('.testimonial-item');
    if (testimonials.length > 0) {
        let currentIndex = 0;
        const totalTestimonials = testimonials.length;

        function showTestimonial(index) {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });
        }

        // Auto-slide testimonials
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            showTestimonial(currentIndex);
        }, 3000); // Change testimonial every 3 seconds

        showTestimonial(currentIndex); // Show the first testimonial
    }
}); 


// Function to show a specific section
function showSection(id) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    } else {
        console.error(`Section with ID "${id}" not found.`);
    }
}

// Function to check membership status
function checkMembership() {
    const hasMembership = confirm("Do you have a membership? Click 'OK' for Yes and 'Cancel' for No.");
    showSection(hasMembership ? 'members-area' : 'sign-in');
}

// Function to handle login logic
function handleLogin(email, password) {
    if (!email || !password) {
        displayError('Please enter both email and password.');
        return;
    }

    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }
            return response.json();
        })
        .then(() => {
            alert('Login successful!');
            showSection('members-area');
        })
        .catch(error => displayError(error.message));
}

// Function to handle registration logic
function handleRegistration(email, password) {
    if (!email || !password) {
        displayError('Please enter both email and password.');
        return;
    }

    fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('User already exists');
            }
            return response.json();
        })
        .then(() => {
            alert('Registration successful! You can now log in.');
            showSection('sign-in');
        })
        .catch(error => displayError(error.message));
}

// Navigation to specific modules
function navigateToModule(moduleId) {
    const moduleRoutes = {
        module1: 'module1.html',
        module2: 'module2.html',
        module3: 'module3.html'
    };

    if (moduleRoutes[moduleId]) {
        window.location.href = moduleRoutes[moduleId];
    } else {
        console.error('Module not found');
    }
}

function toggleMenu() {
    const menu = document.getElementById('fullscreenMenu');
    const body = document.body;
    menu.classList.toggle('active');
    if (menu.classList.contains('active')) {
        body.style.overflow = 'hidden';
        body.setAttribute('aria-hidden', 'true');
    } else {
        body.style.overflow = 'auto';
        body.removeAttribute('aria-hidden');
    }
}

// Set the user's email address dynamically
const userEmail = 'user@example.com';
document.getElementById('userEmail').href = `mailto:${userEmail}`;
document.getElementById('userEmail').textContent = userEmail;

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Video scaling on scroll
const videoSection = document.getElementById('video-section');
const video = document.getElementById('dynamic-video');

window.addEventListener('scroll', () => {
const sectionRect = videoSection.getBoundingClientRect();
const windowHeight = window.innerHeight;

// Calculate the distance from the middle of the viewport to the middle of the video section
const distance = Math.abs((sectionRect.top + sectionRect.bottom) / 2 - windowHeight / 2);

// Calculate the scaling factor based on distance
const maxDistance = windowHeight / 2 + videoSection.offsetHeight / 2;
const scale = Math.max(0.5, 1 - distance / maxDistance);

video.style.transform = `scale(${scale})`;
});

function navigateToModule(module) {
    window.location.href = `${module}.html`;
}

--test-

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.fullscreen-menu');
    const closeMenuButton = document.querySelector('.close-menu');

    function toggleMenu() {
        const isOpen = menu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }

    menuToggle.addEventListener('click', toggleMenu);
    closeMenuButton.addEventListener('click', toggleMenu);
});


document.querySelectorAll('details').forEach((faq) => {
    faq.addEventListener('toggle', () => {
        if (faq.open) {
            document.querySelectorAll('details[open]').forEach((openFaq) => {
                if (openFaq !== faq) {
                    openFaq.removeAttribute('open');
                }
            });
        }
    });
});

function openModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Modal with ID ' + modalId + ' not found.');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error('Modal with ID ' + modalId + ' not found.');
    }
}

// Optional: Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    Array.from(modals).forEach((modal) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const progressTrackers = document.querySelectorAll(".progress-tracker");

    progressTrackers.forEach((tracker) => {
        const progressBar = tracker.querySelector(".progress-bar .progress-fill");
        const progressDetails = tracker.querySelectorAll(".progress-details li");
        const progressButton = tracker.querySelector(".progress-button");

        let completedSteps = 0;

        const updateProgress = () => {
            const percentage = (completedSteps / progressDetails.length) * 100;
            progressBar.style.width = `${percentage}%`;

            progressDetails.forEach((step, idx) => {
                if (idx < completedSteps) {
                    step.classList.add("completed");
                } else {
                    step.classList.remove("completed");
                }
            });
        };

        progressButton.addEventListener("click", () => {
            if (completedSteps < progressDetails.length) {
                completedSteps++;
                updateProgress();
            } else {
                alert("All lessons completed!");
            }
        });

        updateProgress();
    });
});
