const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let gameRunning = false;
let gameOver = false;

// Bouton de démarrage
const startBtn = document.createElement('button');
startBtn.textContent = 'Commencer le jeu';
startBtn.style.position = 'absolute';
startBtn.style.top = '50%';
startBtn.style.left = '50%';
startBtn.style.transform = 'translate(-50%, -50%)';
startBtn.style.padding = '10px 20px';
startBtn.style.fontSize = '20px';
startBtn.style.backgroundColor = '#ffffff';
startBtn.style.color = '#000000';
startBtn.style.border = 'none';
startBtn.style.cursor = 'pointer';
document.body.appendChild(startBtn);

startBtn.addEventListener('click', startGame);

function startGame() {
    gameRunning = true;
    gameOver = false;
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    placeFood();
    startBtn.style.display = 'none';
    gameLoop();
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            return;
        }
    }
}

function draw() {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Serpent
    ctx.fillStyle = '#ffffff';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    // Fruit
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    if (gameOver) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 100);
        startBtn.style.display = 'block';
        startBtn.textContent = 'Rejouer';
    }
}

function update() {
    if (!gameRunning || gameOver) return;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        setTimeout(gameLoop, 100);
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.key === 'ArrowUp' && direction.y === 0) direction = {x: 0, y: -1};
    else if (e.key === 'ArrowDown' && direction.y === 0) direction = {x: 0, y: 1};
    else if (e.key === 'ArrowLeft' && direction.x === 0) direction = {x: -1, y: 0};
    else if (e.key === 'ArrowRight' && direction.x === 0) direction = {x: 1, y: 0};
});