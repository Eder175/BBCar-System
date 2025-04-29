// Interatividade para os botões da seção Hero
document.querySelectorAll('.hero-buttons a').forEach(button => {
    button.addEventListener('click', (e) => {
        if (button.getAttribute('href') === '#contact') {
            e.preventDefault();
            alert('Funcionalidade de IA em desenvolvimento! Fique atento para novidades.');
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

// Efeito de rolagem suave para links de âncora com debounce
let scrollTimeout;
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }, 100);
        }
    });
});

// FAQ accordion functionality (caso exista na página About)
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('i');
        answer.classList.toggle('active');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
        button.setAttribute('aria-expanded', answer.classList.contains('active') ? 'true' : 'false');
    });
});

// Mobile menu toggle com acessibilidade
const mobileMenuButton = document.querySelector('.md\\:hidden button');
const navMenu = document.querySelector('nav');
if (mobileMenuButton && navMenu) {
    mobileMenuButton.setAttribute('aria-label', 'Toggle mobile menu');
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('hidden');
        navMenu.classList.toggle('flex');
        navMenu.classList.toggle('flex-col');
        navMenu.classList.toggle('absolute');
        navMenu.classList.toggle('top-16');
        navMenu.classList.toggle('left-0');
        navMenu.classList.toggle('w-full');
        navMenu.classList.toggle('bg-bbcar-dark');
        navMenu.classList.toggle('p-4');
        mobileMenuButton.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
}

// Carrossel de carros com auto-scroll e pausa ao passar o mouse
const carousel = document.getElementById('car-carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

if (carousel && prevBtn && nextBtn) {
    let scrollPosition = 0;
    const cardWidth = carousel.querySelector('.min-w-full').offsetWidth;
    let autoScrollInterval;

    const scrollCarousel = (direction) => {
        if (direction === 'next') {
            scrollPosition += cardWidth;
            if (scrollPosition >= carousel.scrollWidth - cardWidth) {
                scrollPosition = 0;
            }
        } else {
            scrollPosition -= cardWidth;
            if (scrollPosition < 0) {
                scrollPosition = carousel.scrollWidth - cardWidth;
            }
        }
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    };

    // Iniciar auto-scroll
    const startAutoScroll = () => {
        autoScrollInterval = setInterval(() => {
            scrollCarousel('next');
        }, 5000);
    };

    // Parar auto-scroll
    const stopAutoScroll = () => {
        clearInterval(autoScrollInterval);
    };

    // Eventos dos botões
    nextBtn.addEventListener('click', () => {
        stopAutoScroll();
        scrollCarousel('next');
        startAutoScroll();
    });

    prevBtn.addEventListener('click', () => {
        stopAutoScroll();
        scrollCarousel('prev');
        startAutoScroll();
    });

    // Pausar auto-scroll ao passar o mouse
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);

    // Iniciar o auto-scroll ao carregar a página
    startAutoScroll();
}

// Lazy loading para imagens
document.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy');
});

// Validação do formulário de newsletter
const newsletterForm = document.querySelector('footer .flex');
const emailInput = newsletterForm?.querySelector('input[type="email"]');
const submitButton = newsletterForm?.querySelector('button');

if (emailInput && submitButton) {
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            alert('Por favor, insira um e-mail.');
            return;
        }

        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        alert('Inscrição realizada com sucesso! Você receberá nossas novidades em breve.');
        emailInput.value = '';
    });
}