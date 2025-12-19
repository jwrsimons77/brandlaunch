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
const toastNotification = document.getElementById('toastNotification');

const activeForm = notifyForm;
const successCopy = 'Welcome to AORO — coordinates incoming.';
const errorCopy = 'We hit a snag. Give it another shot in a moment.';
let toastHideTimeout;

const resetToastState = () => {
    if (!toastNotification) return;

    toastNotification.classList.remove('toast-notification--success', 'toast-notification--error', 'show');
};

const showToast = (message, type = 'success') => {
    if (!toastNotification) return;

    resetToastState();
    toastNotification.textContent = message;
    toastNotification.classList.add(`toast-notification--${type}`, 'show');

    clearTimeout(toastHideTimeout);
    toastHideTimeout = setTimeout(() => {
        resetToastState();
    }, 4800);
};

if (toastNotification) {
    toastNotification.addEventListener('click', () => {
        resetToastState();
        clearTimeout(toastHideTimeout);
    });
}

const handleFormSuccess = () => {
    if (activeForm) {
        activeForm.reset();
    }
    showToast(successCopy, 'success');
};

if (activeForm) {
    activeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Performance: Start timing
        const perfStart = performance.now();

        const submitButton = activeForm.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : null;

        // Performance: Immediate visual feedback (<10ms)
        if (submitButton) {
            submitButton.textContent = 'Joining...';
            submitButton.disabled = true;
        }

        const isLocalEnv = ['localhost', '127.0.0.1'].includes(window.location.hostname);

        const restoreSubmitState = () => {
            if (submitButton && originalText) {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        };

        // Performance: Streamlined data extraction (do once, use twice)
        const formData = new FormData(activeForm);
        const nameValue = formData.get('name');
        const emailValue = formData.get('email');

        const encodedFormData = new URLSearchParams();
        formData.forEach((value, key) => {
            encodedFormData.append(key, value);
        });
        if (!encodedFormData.has('form-name')) {
            const formName = activeForm.getAttribute('name');
            if (formName) {
                encodedFormData.append('form-name', formName);
            }
        }

        if (isLocalEnv) {
            await new Promise((resolve) => setTimeout(resolve, 600));

            handleFormSuccess();

            restoreSubmitState();

            return;
        }

        try {
            const action = activeForm.getAttribute('action') || '/';

            // Performance: Primary form submission (critical path)
            const response = await fetch(action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: encodedFormData.toString()
            });

            if (!response.ok) {
                throw new Error(`Form submission failed with status ${response.status}`);
            }

            // Performance: Show success immediately after Netlify form submission
            // Don't wait for email send - it's non-critical for user feedback
            const perfNetlifyDone = performance.now();
            console.log(`⚡ Form submitted in ${Math.round(perfNetlifyDone - perfStart)}ms`);

            handleFormSuccess();
            restoreSubmitState();

            // Performance: Fire-and-forget email send (non-blocking)
            // This happens AFTER success UI is shown
            if (nameValue && emailValue) {
                fetch('/.netlify/functions/form-submission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            name: nameValue,
                            email: emailValue
                        }
                    })
                }).then(functionResponse => {
                    if (!functionResponse.ok) {
                        // Log but don't show error to user - they're already subscribed
                        console.warn('Email send failed (non-critical):', functionResponse.status);
                    } else {
                        const perfTotal = performance.now();
                        console.log(`⚡ Total with email: ${Math.round(perfTotal - perfStart)}ms`);
                    }
                }).catch(emailError => {
                    // Log but don't show error to user - they're already subscribed
                    console.warn('Email send error (non-critical):', emailError);
                });
            } else {
                console.warn('Notify form missing name or email; skipping function trigger.');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showToast(errorCopy, 'error');
            restoreSubmitState();
        }
    });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true' || window.location.pathname.includes('success')) {
    handleFormSuccess();

    if (urlParams.get('success') === 'true') {
        urlParams.delete('success');
        const query = urlParams.toString();
        const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
    }
}

// ===================================
// HERO IMAGE MODAL
// ===================================
const heroArtwork = document.querySelector('.hero-drop-artwork');
const heroImageModal = document.getElementById('heroImageModal');

if (heroArtwork && heroImageModal) {
    const heroArtworkImg = heroArtwork.querySelector('img');
    const heroModalImg = heroImageModal.querySelector('.image-modal__img');
    const heroModalClose = heroImageModal.querySelector('.image-modal__close');
    const heroModalBackdrop = heroImageModal.querySelector('.image-modal__backdrop');

    const openHeroModal = () => {
        if (heroArtworkImg && heroModalImg) {
            heroModalImg.src = heroArtworkImg.src;
            heroModalImg.alt = heroArtworkImg.alt;
        }

        heroImageModal.classList.add('image-modal--open');
        heroImageModal.setAttribute('aria-hidden', 'false');
    };

    const closeHeroModal = () => {
        heroImageModal.classList.remove('image-modal--open');
        heroImageModal.setAttribute('aria-hidden', 'true');
        heroArtwork.focus();
    };

    const handleHeroArtworkActivate = (event) => {
        if (event.type === 'keydown') {
            const key = event.key;
            if (key !== 'Enter' && key !== ' ') {
                return;
            }
            event.preventDefault();
        }

        openHeroModal();
    };

    heroArtwork.addEventListener('click', handleHeroArtworkActivate);
    heroArtwork.addEventListener('keydown', handleHeroArtworkActivate);

    if (heroModalClose) {
        heroModalClose.addEventListener('click', closeHeroModal);
    }

    if (heroModalBackdrop) {
        heroModalBackdrop.addEventListener('click', closeHeroModal);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && heroImageModal.classList.contains('image-modal--open')) {
            closeHeroModal();
        }
    });
}

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
        trackEvent('Form', 'Submit', 'Notify Form');
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
