/**
 * AORO - Main JavaScript
 * Handles mobile menu, scroll animations, and smooth scrolling
 */

// ===================================
// MOBILE MENU TOGGLE
// ===================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    const expanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded);

    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class for navbar background
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// SMOOTH SCROLLING
// ===================================
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');

        // Handle home link
        if (targetId === '#' || targetId === '#home') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// INTERSECTION OBSERVER - SCROLL ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Callback function for intersection observer
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Add staggered animation delay for elements in the same container
            const container = entry.target.closest('.events-grid, .gallery-grid, .about-values, .join-benefits');
            if (container) {
                const items = Array.from(container.children);
                const index = items.indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.1}s`;
            }

            // Optional: Stop observing after animation
            // observer.unobserve(entry.target);
        }
    });
};

// Create observer
const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observe all elements with fade-in classes
const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
animatedElements.forEach(element => {
    observer.observe(element);
});

// ===================================
// NETLIFY FORM HANDLING
// ===================================
const notifyForm = document.getElementById('notifyForm');
const membershipForm = document.getElementById('membershipForm'); // Keep for backward compatibility
const formSuccess = document.getElementById('formSuccess');
const activeForm = notifyForm || membershipForm;

if (activeForm) {
    activeForm.addEventListener('submit', async (e) => {
        // Don't prevent default - let Netlify handle the submission
        // But we can show custom success message if desired

        // Optional: Show loading state
        const submitButton = activeForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Joining...';
        submitButton.disabled = true;
    });
}

// Check URL for Netlify form success parameter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true' || window.location.pathname.includes('success')) {
    if (activeForm && formSuccess) {
        activeForm.style.display = 'none';
        formSuccess.classList.add('active');

        // Scroll to success message
        setTimeout(() => {
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// ===================================
// GALLERY ITEM HOVER EFFECT
// ===================================
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        // Optional: Add lightbox functionality here
        // For now, just add a subtle scale effect on click
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
            item.style.transform = 'scale(1)';
        }, 200);
    });
});

// ===================================
// PARALLAX EFFECT FOR HERO (Optional)
// ===================================
const heroBackground = document.querySelector('.hero-background');

if (heroBackground) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;

        // Only apply parallax on larger screens
        if (window.innerWidth > 768) {
            heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// ===================================
// IMAGE LAZY LOADING FALLBACK
// ===================================
// Modern browsers support native lazy loading, but this provides a fallback
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for older browsers
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lazysizes@5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===================================
// SCROLL TO TOP ON PAGE LOAD
// ===================================
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// ===================================
// PERFORMANCE: Throttle scroll events
// ===================================
function throttle(func, wait) {
    let timeout;
    let lastTime = 0;

    return function executedFunction(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastTime;

        if (timeSinceLastCall >= wait) {
            func.apply(this, args);
            lastTime = now;
        }
    };
}

// Apply throttle to scroll-heavy operations if needed
// Example: window.addEventListener('scroll', throttle(yourFunction, 100));

// ===================================
// ACCESSIBILITY: Focus management
// ===================================
// Ensure focus is visible for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Add focus styles via CSS when keyboard-nav class is present
const style = document.createElement('style');
style.textContent = `
    body.keyboard-nav *:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);

// ===================================
// CONSOLE WELCOME MESSAGE
// ===================================
console.log('%c🏔️ AORO ', 'background: #0F1E21; color: #FFB347; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%cWelcome to AORO. Keen to collaborate? Reach out at hello@aoro.co', 'font-size: 12px; color: #666;');

// ===================================
// PERFORMANCE MONITORING (Optional)
// ===================================
if ('PerformanceObserver' in window) {
    // Monitor page load performance
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        // Log to console in development
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);

        // Optional: Send to analytics
        // analytics.track('Page Load', { time: pageLoadTime });
    });
}

// ===================================
// PRELOAD CRITICAL IMAGES
// ===================================
function preloadImages() {
    const criticalImages = [
        '/images/hero/hero-bg.jpg',
        // Add other critical images here
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadImages);
} else {
    preloadImages();
}

// ===================================
// UTILITY: Check if element is in viewport
// ===================================
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===================================
// CUSTOM EVENT: Page Loaded
// ===================================
window.addEventListener('load', () => {
    // Dispatch custom event when page is fully loaded
    const pageLoadedEvent = new CustomEvent('pageFullyLoaded', {
        detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(pageLoadedEvent);

    // Add loaded class to body
    document.body.classList.add('page-loaded');
});

// ===================================
// EMAIL VALIDATION HELPER
// ===================================
const emailInput = document.getElementById('email');

if (emailInput) {
    emailInput.addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            this.style.borderColor = '#FFB347';
        } else {
            this.style.borderColor = '';
        }
    });
}

// ===================================
// RESPONSIVE IMAGES: Update srcset on resize (if needed)
// ===================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Handle any resize-specific logic here
        // For example, recalculate layouts or update image sources

        // Re-check if we should show/hide mobile menu
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});

// ===================================
// ANALYTICS HELPER (Ready for integration)
// ===================================
function trackEvent(category, action, label) {
    // Ready for Google Analytics, Plausible, or other analytics
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });

    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

// Track CTA clicks
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        trackEvent('CTA', 'Click', buttonText);
    });
});

// Track social link clicks
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', function() {
        const platform = this.getAttribute('aria-label') || 'Unknown';
        trackEvent('Social', 'Click', platform);
    });
});

// Track form submission
if (activeForm) {
    activeForm.addEventListener('submit', function() {
        const formName = notifyForm ? 'Notify Form' : 'Membership Form';
        trackEvent('Form', 'Submit', formName);
    });
}

// ===================================
// INIT: Initialize all components
// ===================================
function init() {
    console.log('🚀 AORO initialized');

    // Add any initialization code here
    // For example: Initialize third-party libraries, set up event listeners, etc.
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
