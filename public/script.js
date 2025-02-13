// Ensure the DOM is fully loaded before running scripts
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

    document.addEventListener("DOMContentLoaded", function () {
        const header = document.querySelector("header");
    
        if (!header) return;
    
        function updateHeader() {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }
            });
        }
    
        window.addEventListener("scroll", updateHeader, { passive: true });
        updateHeader();
    });

    // Load the default section
    showSection('home')

    document.querySelectorAll('.benefit').forEach((benefit) => {
        benefit.addEventListener('click', () => {
          // Toggle the open class on the clicked benefit
          benefit.classList.toggle('open');
          
          // Optionally close other benefits
          document.querySelectorAll('.benefit').forEach((otherBenefit) => {
            if (otherBenefit !== benefit) {
              otherBenefit.classList.remove('open');
            }
          });
        });
      });

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

    // Set the user's email address dynamically
    const userEmail = 'user@example.com';
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.href = `mailto:${userEmail}`;
        userEmailElement.textContent = userEmail;
    }


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


// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

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

// --test--



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

const toggleMenu = () => {
  const navbar = document.getElementById('nav-container');
  navbar.classList.toggle('active');
};
