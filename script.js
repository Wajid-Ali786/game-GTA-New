/* script.js */

// Game Variables
let player, gameArea, scoreElement, healthElement;
let score = 0;
let health = 100;
let gameInterval;

// Initialization
window.onload = () => {
    player = document.getElementById('player');
    gameArea = document.getElementById('gameArea');
    scoreElement = document.getElementById('score');
    healthElement = document.getElementById('health');

    // Move player with mouse
    document.addEventListener('mousemove', movePlayer);

    // Start spawning objects
    gameInterval = setInterval(spawnObject, 1500);
};

// Move Player
function movePlayer(event) {
    const rect = gameArea.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    // Prevent player from moving outside game area
    x = Math.max(0, Math.min(x, gameArea.clientWidth - player.offsetWidth));
    y = Math.max(0, Math.min(y, gameArea.clientHeight - player.offsetHeight));

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
}

// Spawn Object
function spawnObject() {
    const object = document.createElement('div');
    object.className = 'object';

    // Randomize position
    const x = Math.random() * (gameArea.clientWidth - 60); // Object width is 60px
    object.style.left = `${x}px`;

    gameArea.appendChild(object);

    // Animate object falling
    let objectY = 0;
    const objectFall = setInterval(() => {
        objectY += 5;
        object.style.top = `${objectY}px`;

        // Check collision with player
        if (isCollision(player, object)) {
            gameArea.removeChild(object);
            clearInterval(objectFall);
            decreaseHealth(10); // Decrease health on collision
        }

        // Remove object if it exits the game area
        if (objectY > gameArea.clientHeight) {
            gameArea.removeChild(object);
            clearInterval(objectFall);
            increaseScore(5); // Increase score for dodging an object
        }
    }, 30);
}

// Collision Detection
function isCollision(player, object) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    return !(
        playerRect.top > objectRect.bottom ||
        playerRect.bottom < objectRect.top ||
        playerRect.left > objectRect.right ||
        playerRect.right < objectRect.left
    );
}

// Decrease Health
function decreaseHealth(amount) {
    health -= amount;
    health = Math.max(0, health);
    healthElement.innerText = health;

    if (health === 0) {
        endGame();
    }
}

// Increase Score
function increaseScore(points) {
    score += points;
    scoreElement.innerText = score;
}

// End Game
function endGame() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}

// Reset Game
function resetGame() {
    score = 0;
    health = 100;
    scoreElement.innerText = score;
    healthElement.innerText = health;

    // Remove all objects
    document.querySelectorAll('.object').forEach(object => object.remove());

    // Restart game
    gameInterval = setInterval(spawnObject, 1500);
}
