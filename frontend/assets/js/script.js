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

// Carrossel de carros com auto-scroll, pausa ao passar o mouse e dots
const carousel = document.getElementById('car-carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dots = document.querySelectorAll('.carousel-dot');

if (carousel && prevBtn && nextBtn) {
    let scrollPosition = 0;
    const cardWidth = carousel.querySelector('.carousel-item').offsetWidth;
    let autoScrollInterval;
    let currentIndex = 0;

    const updateDots = () => {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    };

    const scrollCarousel = (direction) => {
        const totalItems = carousel.children.length;
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalItems;
            scrollPosition = currentIndex * cardWidth;
        } else {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            scrollPosition = currentIndex * cardWidth;
        }
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        updateDots();
    };

    const goToSlide = (index) => {
        currentIndex = index;
        scrollPosition = index * cardWidth;
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        updateDots();
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

    // Eventos dos dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoScroll();
            goToSlide(index);
            startAutoScroll();
        });
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

// Modal de Boas-Vindas
const welcomeModal = document.getElementById('welcome-modal');
const welcomeCloseModal = document.querySelector('#welcome-modal .modal-close');

window.addEventListener('load', () => {
    welcomeModal.style.display = 'block';
});

welcomeCloseModal.addEventListener('click', () => {
    welcomeModal.style.display = 'none';
});

welcomeModal.addEventListener('click', (e) => {
    if (e.target === welcomeModal) {
        welcomeModal.style.display = 'none';
    }
});

// Modal da IA (Simulação Temporária)
const aiModal = document.getElementById('ai-modal');
const aiCloseModal = document.querySelector('#ai-modal .modal-close');
const aiButton = document.querySelector('.ai-button');

aiButton.addEventListener('click', (e) => {
    e.preventDefault();
    aiModal.style.display = 'block';
});

aiCloseModal.addEventListener('click', () => {
    aiModal.style.display = 'none';
});

aiModal.addEventListener('click', (e) => {
    if (e.target === aiModal) {
        aiModal.style.display = 'none';
    }
});