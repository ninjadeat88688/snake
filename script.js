const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;

let tileCountWidth = 0;
let tileCountHeight = 0;

// Function to set canvas size
function setCanvasSize() {
    // Small delay to ensure viewport has updated on mobile
    setTimeout(() => {
        let margin = 3; // 16px * 2
        const scoreBoardHeight = 60; // Estimation de la hauteur du bandeau

        let newWidth = window.innerWidth - margin;
        let newHeight = window.innerHeight - margin - scoreBoardHeight;
        
        // Recalculate tile counts with margin for easier gameplay near edges
        tileCountWidth = Math.floor(newWidth / gridSize);
        tileCountHeight = Math.floor(newHeight / gridSize);

        let tileCountWidthpx = tileCountWidth * gridSize;
        let tileCountHeightpx = tileCountHeight * gridSize;
        let marginWidth = Math.floor((window.innerWidth - tileCountWidthpx) / 2);
        let marginHeight = Math.floor((window.innerHeight - tileCountHeightpx - scoreBoardHeight) / 2);
        canvas.width = tileCountWidthpx -marginWidth -20 ;
        canvas.height = tileCountHeightpx-marginHeight -80;
        // canvas.style.width = tileCountWidthpx + 'px';
        // canvas.style.height = tileCountHeightpx + 'px';

        
        // Reposition start button if visible
        if (!gameRunning) {
            startBtn.style.top = '50%';
            startBtn.style.left = '50%';
        }
    }, 100);
}

setCanvasSize();

window.addEventListener('resize', setCanvasSize);
// Add orientation change listener for mobile devices
window.addEventListener('orientationchange', () => {
    // Delay to allow viewport to update
    setTimeout(setCanvasSize, 200);
});

let appleImage = new Image();
appleImage.src = 'images/Pomme.svg';

let snakeHeadImage = new Image();
snakeHeadImage.src = 'images/snake-head.svg';

let snakeBodyImage = new Image();
snakeBodyImage.src = 'images/snake-body.svg';

let croquePomme = new Audio("son/croquepomme.mp3");


let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let gameRunning = false;
let gameOver = false;
let inputQueue = [];
let startTime = 0;

// Référence au bandeau
const scoreBoard = document.getElementById('score');

// Bouton de démarrage
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    startGame();
});

let lastUpdate = 0;

function startGame() {
    gameRunning = true;
    gameOver = false;
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    inputQueue = [];
    startTime = Date.now();
    placeFood();
    startBtn.style.display = 'none';
    lastUpdate = Date.now();
    gameLoop();
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCountWidth);
    food.y = Math.floor(Math.random() * tileCountHeight);
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
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) {
            // Tête du serpent
            if (snakeHeadImage.complete) {
                ctx.save();
                // Positionner au centre du segment
                const middleGrid = gridSize / 2;
                const centerX = segment.x * gridSize + middleGrid;
                const centerY = segment.y * gridSize + middleGrid;
                ctx.translate(centerX, centerY);

                // Calculer l'angle de rotation selon la direction
                let angle = 0;
                if (direction.x === 1) angle = 0; // droite
                else if (direction.x === -1) angle = Math.PI; // gauche
                else if (direction.y === -1) angle = -Math.PI / 2; // haut
                else if (direction.y === 1) angle = Math.PI / 2; // bas

                ctx.rotate(angle);
                ctx.drawImage(snakeHeadImage, -middleGrid, -middleGrid, gridSize, gridSize);
                ctx.restore();
            } else {
                ctx.fillStyle = '#bd04f5';
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            }
        } else {
            // Corps du serpent
            if (snakeBodyImage.complete) {
                ctx.save();
                const centerX = segment.x * gridSize + gridSize / 2;
                const centerY = segment.y * gridSize + gridSize / 2;
                ctx.translate(centerX, centerY);

                // Calculer l'angle de rotation pour le corps
                let angle = 0;
                const prevSegment = snake[i - 1];
                const nextSegment = snake[i + 1];

                if (nextSegment) {
                    // Segment du milieu - s'orienter entre précédent et suivant
                    const dx = nextSegment.x - prevSegment.x;
                    const dy = nextSegment.y - prevSegment.y;
                    if (dx === 1) angle = 0; // horizontal droite
                    else if (dx === -1) angle = Math.PI; // horizontal gauche
                    else if (dy === 1) angle = Math.PI / 2; // vertical bas
                    else if (dy === -1) angle = -Math.PI / 2; // vertical haut
                } else {
                    // Dernier segment (queue) - s'orienter par rapport au précédent
                    const dx = segment.x - prevSegment.x;
                    const dy = segment.y - prevSegment.y;
                    if (dx === 1) angle = 0;
                    else if (dx === -1) angle = Math.PI;
                    else if (dy === 1) angle = Math.PI / 2;
                    else if (dy === -1) angle = -Math.PI / 2;
                }

                ctx.rotate(angle);
                ctx.drawImage(snakeBodyImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
                ctx.restore();
            } else {
                ctx.fillStyle = '#750099';
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            }
        }
    }
    
    printFruit();

    // Mettre à jour le bandeau
    updateScoreBoard();

    printGameOver();
}

function printFruit() {
// Fruit
    if (appleImage.complete) {
        ctx.drawImage(appleImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        return;
    } 
        
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function updateScoreBoard() {
    const elapsedTime = gameRunning ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    scoreBoard.textContent = `Score: ${score} | Temps joué: ${timeString}`;
}

function printGameOver() {
 if (!gameOver) return;

 ctx.fillStyle = '#ffffff';
 ctx.font = '40px Arial';
 const gameOverText = 'Game Over';
 const textWidth = ctx.measureText(gameOverText).width;
 ctx.fillText(gameOverText, canvas.width / 2 - textWidth / 2, canvas.height / 2 - 60);
 startBtn.style.display = 'block';
 startBtn.textContent = 'Rejouer';
}

/*
Met a jour les coordonnées du serpent.
Vérifie les collisions avec les murs et le corps du serpent, et gère la consommation de nourriture.
Si le serpent mange la nourriture, le score augmente et une nouvelle nourriture est placée.
Si le serpent entre en collision avec un mur ou lui-même, le jeu se termine.
*/
function update() {
    // si je ne suis pas en partie ou que j'ai perdu je ne re dessine pas
    if (!gameRunning || gameOver) return;

    // Calculer la nouvelle position de la tête du serpent en fonction de la direction actuelle
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);

    // Vérifier si le serpent a mangé la nourriture
    if (head.x === food.x && head.y === food.y) {
        score++;
        croquePomme.play();
        placeFood();
    } else {
        snake.pop();
    }

    // Vérifier les collisions avec les murs et le corps du serpent
    if (head.x < 0 || head.x >= tileCountWidth || head.y < 0 || head.y >= tileCountHeight) {
        gameOver = true;
    }

    // Vérifier les collisions avec le corps du serpent
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }

    if (inputQueue.length > 0) {
        const newDir = inputQueue[0];
        const newHead = {x: snake[0].x + newDir.x, y: snake[0].y + newDir.y};
        let collision = false;
        for (let i = 1; i < snake.length; i++) {
            if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
                collision = true;
                break;
            }
        }
        if (!collision) {
            direction = inputQueue.shift();
        } else {
            inputQueue.shift(); // Discard the invalid move
        }
    }
}

/*
La boucle de jeu principale qui met à jour et dessine le jeu à intervalles réguliers.
*/
function gameLoop() {
    const now = Date.now();
    if (now - lastUpdate > 150) {
        update();
        lastUpdate = now;
    }
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

let touchStartX = 0;
let touchStartY = 0;

// Gestion des entrées clavier pour les flèches directionnelles
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    let newDir = null;
    if (e.key === 'ArrowUp' && direction.y === 0) newDir = {x: 0, y: -1};
    else if (e.key === 'ArrowDown' && direction.y === 0) newDir = {x: 0, y: 1};
    else if (e.key === 'ArrowLeft' && direction.x === 0) newDir = {x: -1, y: 0};
    else if (e.key === 'ArrowRight' && direction.x === 0) newDir = {x: 1, y: 0};
    if (newDir) {
        inputQueue.push(newDir);
    }
});

// Gestion des entrées tactiles pour les swipes sur mobile
document.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

document.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    let newDir = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 30 && direction.x === 0) newDir = {x: 1, y: 0}; // Right
        else if (deltaX < -30 && direction.x === 0) newDir = {x: -1, y: 0}; // Left
    } else {
        // Vertical swipe
        if (deltaY > 30 && direction.y === 0) newDir = {x: 0, y: 1}; // Down
        else if (deltaY < -30 && direction.y === 0) newDir = {x: 0, y: -1}; // Up
    }
    if (newDir) {
        inputQueue.push(newDir);
    }
    e.preventDefault();
});