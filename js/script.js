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
            };

            const carImage = document.getElementById("car-image").files[0];
            if (carImage) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    carData.image = e.target.result;

                    // Salvar no localStorage
                    const cars = JSON.parse(localStorage.getItem("carsForSale")) || [];
                    cars.push(carData);
                    localStorage.setItem("carsForSale", JSON.stringify(cars));

                    // Exibir mensagem de confirmação
                    document.getElementById("sell-response").textContent = `Proposta enviada com sucesso! ID do Veículo: ${carData.id}. Nossa equipe entrará em contato em breve.`;
                    document.getElementById("sell-car-form").reset();

                    // Fechar o modal após o envio
                    sellCarModal.classList.add("hidden");

                    // Iniciar análise da IA
                    await analyzeCarData(carData);
                };
                reader.readAsDataURL(carImage);
            }
        });
    } else {
        console.error("Formulário 'sell-car-form' não encontrado!");
    }

    // Função para análise da IA
    async function analyzeCarData(carData) {
        const chatMessages = document.getElementById("chat-messages");

        try {
            const response = await fetch("http://localhost:3000/api/analyze-car", {
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
                    const response = await fetch("http://localhost:3000/api/chat", {
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
});