document.addEventListener('DOMContentLoaded', function () {
    const cards = Array.from(document.querySelectorAll('.dish-card'));
    const triggerSections = Array.from(document.querySelectorAll('.sticky-card-section'));

    function isDesktop() {
        return window.innerWidth > 1024;
    }

    function resetAllCardStates() {
        cards.forEach(card => {
            card.classList.remove('is-active', 'is-previous', 'is-next', 'is-mobile-visible');
            card.style.opacity = '';
            card.style.transform = '';
        });
        triggerSections.forEach(section => {
            section.style.height = '';
        });
    }

    function handleMobileLayout() {
        resetAllCardStates();

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-mobile-visible');
                }
            });
        }, observerOptions);

        cards.forEach(card => {
            if (!isDesktop()) {
                 observer.observe(card);
            } else {
                 observer.unobserve(card);
            }
        });
    }

    function animateDesktopCards() {
        if (!isDesktop()) {
            return;
        }

        let activeCardIndex = -1;
        const viewportCenterY = window.innerHeight / 2;
        const triggerOffset = window.innerHeight * 0.25;

        for (let i = triggerSections.length - 1; i >= 0; i--) {
            const sectionRect = triggerSections[i].getBoundingClientRect();
            if (sectionRect.top < triggerOffset && sectionRect.bottom > triggerOffset) {
                activeCardIndex = i;
                break;
            }
        }
        
        if (activeCardIndex === -1 && triggerSections.length > 0) {
            const firstSectionRect = triggerSections[0].getBoundingClientRect();
            if (firstSectionRect.top <= 0 && firstSectionRect.bottom > triggerOffset) {
                 activeCardIndex = 0;
            }
            const lastSectionRect = triggerSections[triggerSections.length - 1].getBoundingClientRect();
            if (lastSectionRect.top < triggerOffset && lastSectionRect.bottom <= window.innerHeight && lastSectionRect.bottom > 0) {
                 activeCardIndex = triggerSections.length - 1;
            }
        }

        cards.forEach((card, idx) => {
            card.classList.remove('is-active', 'is-previous', 'is-next');
            if (idx < activeCardIndex) {
                card.classList.add('is-previous');
            } else if (idx === activeCardIndex) {
                card.classList.add('is-active');
            } else {
                card.classList.add('is-next');
            }
        });
    }

    function setupEventListenersAndState() {
        resetAllCardStates();

        window.removeEventListener('scroll', animateDesktopCards);
        window.removeEventListener('scroll', handleMobileLayout);

        if (isDesktop()) {
            window.addEventListener('scroll', animateDesktopCards, { passive: true });
            animateDesktopCards();
        } else {
            handleMobileLayout();
        }
    }

    if (cards.length > 0 && triggerSections.length > 0 && triggerSections.length === cards.length) {
        setupEventListenersAndState();
        window.addEventListener('resize', setupEventListenersAndState);
    } else {
        if (cards.length === 0) {
            console.warn('Card.js: No elements with class .dish-card found.');
        }
        if (triggerSections.length === 0) {
            console.warn('Card.js: No elements with class .sticky-card-section found.');
        }
        if (triggerSections.length !== cards.length) {
            console.warn('Card.js: Mismatch between number of .dish-card and .sticky-card-section elements. Animations might not work correctly.');
        }
    }
});
