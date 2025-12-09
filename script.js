// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainMenu = document.getElementById('mainMenu');

mobileMenuBtn.addEventListener('click', () => {
    mainMenu.classList.toggle('active');
    
    // Change icon based on menu state
    const icon = mobileMenuBtn.querySelector('i');
    if (mainMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
const menuLinks = document.querySelectorAll('#mainMenu a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mainMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Product Slider
const productsSlider = document.getElementById('productsSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderDots = document.getElementById('sliderDots');

let currentSlide = 0;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let slidesPerView = getSlidesPerView();
const totalSlides = document.querySelectorAll('.product-card').length;

// Create dots for slider
function createDots() {
    sliderDots.innerHTML = '';
    const totalDots = Math.ceil(totalSlides / slidesPerView);
    
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            goToSlide(i * slidesPerView);
        });
        
        sliderDots.appendChild(dot);
    }
}

// Update active dot
function updateDots() {
    const dots = document.querySelectorAll('.slider-dot');
    const activeDotIndex = Math.floor(currentSlide / slidesPerView);
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeDotIndex);
    });
}

// Get slides per view based on screen width
function getSlidesPerView() {
    if (window.innerWidth <= 768) {
        return 1;
    } else if (window.innerWidth <= 992) {
        return 2;
    } else {
        return 3;
    }
}

// Initialize slider
function initSlider() {
    slidesPerView = getSlidesPerView();
    createDots();
    updateSliderPosition();
    
    // Add touch events for mobile
    productsSlider.addEventListener('touchstart', touchStart);
    productsSlider.addEventListener('touchmove', touchMove);
    productsSlider.addEventListener('touchend', touchEnd);
}

// Go to specific slide
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSliderPosition();
}

// Update slider position
function updateSliderPosition() {
    const slideWidth = productsSlider.clientWidth / slidesPerView;
    currentTranslate = -currentSlide * slideWidth;
    productsSlider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
}

// Touch events for mobile swipe
function touchStart(event) {
    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    productsSlider.style.cursor = 'grabbing';
}

function touchMove(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
}

function touchEnd() {
    cancelAnimationFrame(animationID);
    isDragging = false;
    
    const movedBy = currentTranslate - prevTranslate;
    const slideWidth = productsSlider.clientWidth / slidesPerView;
    
    // If moved enough, change slide
    if (movedBy < -50 && currentSlide < totalSlides - slidesPerView) {
        currentSlide++;
    }
    
    if (movedBy > 50 && currentSlide > 0) {
        currentSlide--;
    }
    
    updateSliderPosition();
    productsSlider.style.cursor = 'grab';
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function animation() {
    if (isDragging) {
        productsSlider.style.transform = `translateX(${currentTranslate}px)`;
        requestAnimationFrame(animation);
    }
}

// Event listeners for slider buttons
prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateSliderPosition();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentSlide < totalSlides - slidesPerView) {
        currentSlide++;
        updateSliderPosition();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const newSlidesPerView = getSlidesPerView();
    if (newSlidesPerView !== slidesPerView) {
        slidesPerView = newSlidesPerView;
        // Adjust current slide if needed
        if (currentSlide > totalSlides - slidesPerView) {
            currentSlide = Math.max(0, totalSlides - slidesPerView);
        }
        initSlider();
    }
    updateSliderPosition();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    
    // Add click event to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const link = this.querySelector('a');
                if (link) {
                    // You can add your redirect logic here
                    console.log(`Clicked on ${this.querySelector('h3').textContent}`);
                    // link.click();
                }
            }
        });
    });
    
    // Set initial transform for slider
    setTimeout(() => {
        updateSliderPosition();
    }, 100);
});