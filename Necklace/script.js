document.addEventListener('DOMContentLoaded', () => {
    // ========== MOBILE MENU TOGGLE ==========
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.getElementById('closeMenu');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('overlay');
    
    const toggleMobileMenu = (action) => {
        if (action === 'open') {
            mobileNav.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu('open'));
    closeMenuBtn.addEventListener('click', () => toggleMobileMenu('close'));
    overlay.addEventListener('click', () => toggleMobileMenu('close'));
    
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu('close'));
    });

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.08)';
        }
    });
    
    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== NEW PRODUCT PAGE FILTERING LOGIC ==========
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const materialFilter = document.getElementById('material');
    const productCards = document.querySelectorAll('.product-card');
    const filterButton = document.querySelector('.filter-button');

    // 1. Update Price Display on Slider Input
    priceRange.addEventListener('input', (e) => {
        priceValue.textContent = e.target.value;
    });

    // 2. Apply Filters on Button Click
    const applyFilters = () => {
        const selectedMaterial = materialFilter.value;
        const maxPrice = parseInt(priceRange.value);

        productCards.forEach(card => {
            const cardMaterial = card.getAttribute('data-material');
            const cardPrice = parseInt(card.getAttribute('data-price'));
            
            // Check Material Filter
            const materialMatch = selectedMaterial === 'all' || cardMaterial === selectedMaterial;
            
            // Check Price Filter
            const priceMatch = cardPrice <= maxPrice;

            // Show product only if both filters match
            if (materialMatch && priceMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
    
    filterButton.addEventListener('click', applyFilters);
});