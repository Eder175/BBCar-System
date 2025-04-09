const canvas = document.getElementById("carrinhoCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const carrinho = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 30,
    color: "#ff0000",
    speed: 5,
    dx: 0,
    dy: 0
};

function desenharCarrinho() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = carrinho.color;
    ctx.fillRect(carrinho.x, carrinho.y, carrinho.width, carrinho.height);
}

function atualizarCarrinho() {
    carrinho.x += carrinho.dx;
    carrinho.y += carrinho.dy;

    if (carrinho.x < 0) carrinho.x = 0;
    if (carrinho.y < 0) carrinho.y = 0;
    if (carrinho.x + carrinho.width > canvas.width) carrinho.x = canvas.width - carrinho.width;
    if (carrinho.y + carrinho.height > canvas.height) carrinho.y = canvas.height - carrinho.height;

    desenharCarrinho();
    requestAnimationFrame(atualizarCarrinho);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") carrinho.dx = carrinho.speed;
    if (event.key === "ArrowLeft") carrinho.dx = -carrinho.speed;
    if (event.key === "ArrowUp") carrinho.dy = -carrinho.speed;
    if (event.key === "ArrowDown") carrinho.dy = carrinho.speed;
});

document.addEventListener("keyup", () => {
    carrinho.dx = 0;
    carrinho.dy = 0;
});

atualizarCarrinho();