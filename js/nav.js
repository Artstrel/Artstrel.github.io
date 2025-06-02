document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.close-menu-btn');
    const links = document.querySelectorAll('.mobile-menu-overlay a');

    function isMobileViewActive() {
        return getComputedStyle(hamburger).display !== 'none';
    }

    function openMenu() {
        if (!isMobileViewActive() && !mobileMenu.classList.contains('open')) return; 
        
        mobileMenu.style.display = 'flex'; 
        setTimeout(() => {
            mobileMenu.classList.add('open');
        }, 10); 
        document.body.style.overflow = 'hidden'; 
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        setTimeout(() => {
            if (!mobileMenu.classList.contains('open')) {
                 mobileMenu.style.display = 'none';
            }
        }, 300); 
        document.body.style.overflow = ''; 
    }

    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); 
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    links.forEach(link => {
        link.addEventListener('click', closeMenu); 
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (!isMobileViewActive() && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });
});
