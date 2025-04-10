document.addEventListener("DOMContentLoaded", () => {
    // Função para adicionar ao carrinho
    window.addToCart = function(carName, price) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push({ name: carName, price: price });
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${carName} foi adicionado ao carrinho!`);
    };

    // Abrir e fechar o modal de "Venda seu Veículo"
    const sellCarLink = document.getElementById("sell-car-link");
    const sellCarModal = document.getElementById("sell-car-modal");
    const closeSellModal = document.getElementById("close-sell-modal");

    if (sellCarLink) {
        sellCarLink.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Link 'Venda seu Veículo' clicado!");
            if (sellCarModal) {
                sellCarModal.classList.remove("hidden");
            } else {
                console.error("Modal 'sell-car-modal' não encontrado!");
            }
        });
    } else {
        console.error("Elemento 'sell-car-link' não encontrado!");
    }

    if (closeSellModal) {
        closeSellModal.addEventListener("click", () => {
            console.log("Botão de fechar modal clicado!");
            if (sellCarModal) {
                sellCarModal.classList.add("hidden");
            } else {
                console.error("Modal 'sell-car-modal' não encontrado!");
            }
        });
    } else {
        console.error("Elemento 'close-sell-modal' não encontrado!");
    }

    // Exibir prévia das imagens selecionadas
    const carImagesInput = document.getElementById("car-images");
    const imageGallery = document.getElementById("image-gallery");

    if (carImagesInput) {
        carImagesInput.addEventListener("change", () => {
            imageGallery.innerHTML = ""; // Limpar galeria
            const files = carImagesInput.files;

            if (files.length > 5) {
                alert("Você pode enviar no máximo 5 fotos.");
                carImagesInput.value = "";
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.alt = "Prévia da imagem do carro";
                    imageGallery.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Função para enviar proposta de venda e análise da IA
    const sellCarForm = document.getElementById("sell-car-form");
    if (sellCarForm) {
        sellCarForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const carData = {
                id: "CAR-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value,
                telefone: document.getElementById("telefone").value,
                endereco: document.getElementById("endereco").value,
                cidade: document.getElementById("cidade").value,
                concelho: document.getElementById("concelho").value,
                pais: document.getElementById("pais").value,
                marca: document.getElementById("marca").value,
                modelo: document.getElementById("modelo").value,
                ano: document.getElementById("ano").value,
                motor: document.getElementById("motor").value,
                km: document.getElementById("km").value,
                cor: document.getElementById("cor").value,
                iuc: document.getElementById("iuc").value,
                ipo: document.getElementById("ipo").value,
                condicao: document.getElementById("condicao").value,
                observacoes: document.getElementById("observacoes").value,
                preco: document.getElementById("preco").value,
                images: [],
                status: "Pendente" // Adicionando status inicial
            };

            const carImages = document.getElementById("car-images").files;
            if (carImages.length > 0) {
                const promises = Array.from(carImages).map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });
                });

                carData.images = await Promise.all(promises);

                // Salvar no localStorage com a chave "propostas" em vez de "carsForSale"
                const propostas = JSON.parse(localStorage.getItem("propostas")) || [];
                propostas.push(carData);
                localStorage.setItem("propostas", JSON.stringify(propostas));

                // Exibir mensagem de confirmação
                document.getElementById("sell-response").textContent = `Proposta enviada com sucesso! ID do Veículo: ${carData.id}. Nossa equipe entrará em contato em breve.`;
                document.getElementById("sell-car-form").reset();
                imageGallery.innerHTML = ""; // Limpar galeria

                // Fechar o modal após o envio
                sellCarModal.classList.add("hidden");

                // Iniciar análise da IA
                await analyzeCarData(carData);
            } else {
                document.getElementById("sell-response").textContent = "Por favor, selecione pelo menos uma foto do carro.";
            }
        });
    } else {
        console.error("Formulário 'sell-car-form' não encontrado!");
    }

    // Função para análise da IA
    async function analyzeCarData(carData) {
        const chatMessages = document.getElementById("chat-messages");

        try {
            const response = await fetch("http://localhost:3001/api/analyze-car", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(carData),
            });

            const data = await response.json();
            const report = data.report.replace(/\n/g, "<br>");

            // Exibir o relatório no chat
            setTimeout(() => {
                chatMessages.innerHTML += `<p>${report}</p>`;
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Abrir o chat automaticamente para mostrar o relatório
                document.getElementById("chat-window").classList.remove("hidden");
                document.getElementById("chatbot-btn").classList.add("hidden");
            }, 1000);
        } catch (error) {
            console.error("Erro ao analisar o carro:", error);
            chatMessages.innerHTML += `<p><strong>IA:</strong> Desculpe, houve um erro ao analisar o carro. Tente novamente mais tarde.</p>`;
        }
    }

    // Chatbot
    const chatBtn = document.getElementById("chatbot-btn");
    const chatWindow = document.getElementById("chat-window");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const closeChat = document.getElementById("close-chat");

    if (chatBtn) {
        chatBtn.addEventListener("click", () => {
            console.log("Botão 'Fale com a IA da BBcar' clicado!");
            chatWindow.classList.remove("hidden");
            chatBtn.classList.add("hidden");
        });
    } else {
        console.error("Elemento 'chatbot-btn' não encontrado!");
    }

    if (closeChat) {
        closeChat.addEventListener("click", () => {
            console.log("Botão de fechar clicado!");
            chatWindow.classList.add("hidden");
            chatBtn.classList.remove("hidden");
        });
    } else {
        console.error("Elemento 'close-chat' não encontrado!");
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", async (e) => {
            if (e.key === "Enter" && chatInput.value.trim() !== "") {
                const userMessage = chatInput.value;
                chatMessages.innerHTML += `<p><strong>Você:</strong> ${userMessage}</p>`;

                try {
                    const response = await fetch("http://localhost:3001/api/chat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ message: userMessage }),
                    });

                    const data = await response.json();
                    const reply = data.reply;

                    setTimeout(() => {
                        chatMessages.innerHTML += `<p><strong>IA:</strong> ${reply}</p>`;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 500);
                } catch (error) {
                    console.error("Erro ao enviar mensagem para a IA:", error);
                    chatMessages.innerHTML += `<p><strong>IA:</strong> Desculpe, houve um erro. Tente novamente.</p>`;
                }

                chatInput.value = "";
            }
        });
    } else {
        console.error("Elemento 'chat-input' não encontrado!");
    }

    // Função para carregar as propostas (Tarefa 42)
    function loadPropostas() {
        const propostasBody = document.getElementById('propostas-body');
        if (!propostasBody) return;

        // Carregar propostas do localStorage
        const propostas = JSON.parse(localStorage.getItem('propostas')) || [];

        propostasBody.innerHTML = '';
        propostas.forEach((proposta, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${proposta.nome}</td>
                <td>${proposta.marca} ${proposta.modelo} (${proposta.ano})</td>
                <td>€ ${proposta.preco}</td>
                <td>${proposta.status || 'Pendente'}</td>
                <td>
                    <button class="btn" onclick="approveProposta(${index})">Aprovar</button>
                    <button class="btn-secondary" onclick="rejectProposta(${index})">Rejeitar</button>
                </td>
            `;
            propostasBody.appendChild(row);
        });
    }

    // Função para aprovar uma proposta
    window.approveProposta = function(index) {
        const propostas = JSON.parse(localStorage.getItem('propostas')) || [];
        propostas[index].status = 'Aprovada';
        localStorage.setItem('propostas', JSON.stringify(propostas));
        showNotification(`Proposta de ${propostas[index].nome} aprovada com sucesso!`);
        loadPropostas();
    };

    // Função para rejeitar uma proposta
    window.rejectProposta = function(index) {
        const propostas = JSON.parse(localStorage.getItem('propostas')) || [];
        propostas[index].status = 'Rejeitada';
        localStorage.setItem('propostas', JSON.stringify(propostas));
        showNotification(`Proposta de ${propostas[index].nome} rejeitada.`);
        loadPropostas();
    };

    // Função para exibir notificação
    function showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.remove('hidden');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    }

    // Carregar as propostas ao abrir a página
    loadPropostas();
});