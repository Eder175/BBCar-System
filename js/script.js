// Modal "Venda seu Veículo"
const sellCarLink = document.getElementById('sell-car-link');
const sellCarModal = document.getElementById('sell-car-modal');
const closeSellModal = document.getElementById('close-sell-modal');
const sellCarForm = document.getElementById('sell-car-form');
const sellResponse = document.getElementById('sell-response');
const carImagesInput = document.getElementById('car-images');
const imageGallery = document.getElementById('image-gallery');
const nftResult = document.getElementById('nft-result');
const nftMessage = document.getElementById('nft-message');
const nftLink = document.getElementById('nft-link');

// Token de autenticação (armazenado no localStorage)
let authToken = localStorage.getItem('authToken');

// Função para fazer login e obter o token
async function login() {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: '123456',
            }),
        });

        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            console.log('Login bem-sucedido! Token:', authToken);
        } else {
            console.error('Erro ao fazer login:', data.error);
            alert('Erro ao fazer login. Verifique as credenciais.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Tente novamente.');
    }
}

// Tentar fazer login ao carregar a página
window.addEventListener('load', async () => {
    if (!authToken) {
        await login();
    }
});

sellCarLink.addEventListener('click', () => {
    console.log("Link 'Venda seu Veículo' clicado!");
    sellCarModal.classList.remove('hidden');
});

closeSellModal.addEventListener('click', () => {
    console.log("Botão de fechar modal clicado!");
    sellCarModal.classList.add('hidden');
    sellResponse.textContent = '';
    nftResult.classList.add('hidden');
});

// Exibir imagens no upload
carImagesInput.addEventListener('change', () => {
    imageGallery.innerHTML = '';
    const files = carImagesInput.files;
    if (files.length > 5) {
        alert('Você pode enviar no máximo 5 imagens.');
        carImagesInput.value = '';
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(files[i]);
        img.style.maxWidth = '100px';
        img.style.margin = '5px';
        imageGallery.appendChild(img);
    }
});

// Enviar proposta e gerar NFT
sellCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!authToken) {
        alert('Você precisa estar logado para enviar uma proposta.');
        await login();
        return;
    }

    const formData = new FormData(sellCarForm);
    const carData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        endereco: formData.get('endereco'),
        cidade: formData.get('cidade'),
        concelho: formData.get('concelho'),
        pais: formData.get('pais'),
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        ano: formData.get('ano'),
        motor: formData.get('motor'),
        km: formData.get('km'),
        cor: formData.get('cor'),
        iuc: formData.get('iuc'),
        ipo: formData.get('ipo'),
        matricula: formData.get('matricula'),
        condicao: formData.get('condicao'),
        observacoes: formData.get('observacoes'),
        preco: formData.get('preco'),
        images: []
    };

    // Adicionar imagens ao carData
    const files = carImagesInput.files;
    for (let i = 0; i < files.length; i++) {
        carData.images.push(files[i].name);
    }

    try {
        // Enviar proposta para o backend
        const response = await fetch('http://localhost:3001/api/analyze-car', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(carData),
        });

        if (response.status === 401 || response.status === 403) {
            // Token expirado ou inválido, tentar fazer login novamente
            await login();
            // Tentar novamente a requisição com o novo token
            const retryResponse = await fetch('http://localhost:3001/api/analyze-car', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(carData),
            });
            const retryData = await retryResponse.json();
            if (!retryResponse.ok) {
                throw new Error(retryData.error || 'Erro ao enviar proposta após novo login.');
            }
            handleResponse(retryData);
        } else {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao enviar proposta.');
            }
            handleResponse(data);
        }
    } catch (error) {
        console.error('Erro ao enviar proposta:', error);
        sellResponse.textContent = 'Erro ao enviar proposta. Tente novamente.';
    }
});

function handleResponse(data) {
    sellResponse.textContent = data.report;

    if (data.nftResult && data.nftResult.nftId) {
        nftMessage.textContent = data.nftResult.message;
        nftLink.href = data.nftResult.explorerLink;
        nftLink.textContent = 'Ver Transação na Blockchain';
        nftResult.classList.remove('hidden');
    } else {
        sellResponse.textContent += ` (Erro ao gerar NFT: ${data.nftResult?.error || 'Desconhecido'})`;
    }

    // Salvar a proposta no localStorage (futuramente substituir por banco de dados)
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    proposals.push({ ...data, carData });
    localStorage.setItem('proposals', JSON.stringify(proposals));
}

// Função para adicionar ao carrinho
function addToCart(carName, price) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ name: carName, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${carName} foi adicionado ao carrinho!`);
}

// Chatbot functionality
const chatbotBtn = document.getElementById('chatbot-btn');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatbotBtn.addEventListener('click', () => {
    console.log("Botão do chatbot clicado!");
    chatWindow.classList.toggle('hidden');
});

closeChat.addEventListener('click', () => {
    console.log("Botão de fechar chat clicado!");
    chatWindow.classList.add('hidden');
});

chatInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value.trim();
        if (message) {
            console.log("Mensagem enviada pelo usuário:", message);
            const userMessage = document.createElement('p');
            userMessage.innerHTML = `<strong>Você:</strong> ${message}`;
            chatMessages.appendChild(userMessage);

            chatInput.value = '';

            if (!authToken) {
                alert('Você precisa estar logado para usar o chat.');
                await login();
                return;
            }

            try {
                console.log("Enviando requisição para o backend...");
                const response = await fetch('http://localhost:3001/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ message }),
                });

                if (response.status === 401 || response.status === 403) {
                    // Token expirado ou inválido, tentar fazer login novamente
                    await login();
                    const retryResponse = await fetch('http://localhost:3001/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ message }),
                    });
                    const retryData = await retryResponse.json();
                    if (!retryResponse.ok) {
                        throw new Error(retryData.error || 'Erro ao enviar mensagem após novo login.');
                    }
                    handleChatResponse(retryData);
                } else {
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'Erro ao enviar mensagem.');
                    }
                    handleChatResponse(data);
                }
            } catch (error) {
                console.error('Erro ao enviar mensagem para a IA:', error);
                const errorMessage = document.createElement('p');
                errorMessage.innerHTML = `<strong>IA:</strong> Desculpe, houve um erro. Tente novamente!`;
                chatMessages.appendChild(errorMessage);
            }
        }
    }
});

function handleChatResponse(data) {
    const aiMessage = document.createElement('p');
    aiMessage.innerHTML = `<strong>IA:</strong> ${data.reply}`;
    chatMessages.appendChild(aiMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}