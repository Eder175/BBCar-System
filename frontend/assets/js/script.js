// Interatividade para os botões da seção Hero
document.querySelectorAll('.hero-buttons a').forEach(button => {
    button.addEventListener('click', (e) => {
        if (button.getAttribute('href') === '#fale-com-ia') {
            e.preventDefault();
            alert('Funcionalidade em desenvolvimento! Fique atento para novidades.');
        }
    });
});

// Interatividade para o botão "Quero Ser Associado"
document.querySelectorAll('.partner-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'pages/partners.html';
    });
});

// Efeito de rolagem suave para links de âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// FAQ accordion functionality
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('i');
        answer.classList.toggle('active');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });
});

// Mobile menu toggle
const mobileMenuButton = document.querySelector('.md\\:hidden button');
const navMenu = document.querySelector('nav');
if (mobileMenuButton && navMenu) {
    mobileMenuButton.addEventListener('click', () => {
        navMenu.classList.toggle('hidden');
        navMenu.classList.toggle('flex');
        navMenu.classList.toggle('flex-col');
        navMenu.classList.toggle('absolute');
        navMenu.classList.toggle('top-16');
        navMenu.classList.toggle('left-0');
        navMenu.classList.toggle('w-full');
        navMenu.classList.toggle('bg-bbcar-dark');
        navMenu.classList.toggle('p-4');
    });
}

// Carrossel de carros
const carousel = document.getElementById('car-carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

if (carousel && prevBtn && nextBtn) {
    let scrollPosition = 0;
    const cardWidth = carousel.querySelector('.min-w-full').offsetWidth;

    nextBtn.addEventListener('click', () => {
        scrollPosition += cardWidth;
        if (scrollPosition >= carousel.scrollWidth) {
            scrollPosition = 0;
        }
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        scrollPosition -= cardWidth;
        if (scrollPosition < 0) {
            scrollPosition = carousel.scrollWidth - cardWidth;
        }
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });

    // Auto-scroll do carrossel a cada 5 segundos
    setInterval(() => {
        scrollPosition += cardWidth;
        if (scrollPosition >= carousel.scrollWidth) {
            scrollPosition = 0;
        }
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }, 5000);
}