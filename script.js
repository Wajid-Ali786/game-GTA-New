/* script.js */

// Game Variables
let player, gameArea, scoreElement, healthElement;
let score = 0;
let health = 100;
let gameInterval;
let level = 1;  // Initialize level
let enemySpeed = 5;  // Initial enemy fall speed
let enemySpawnRate = 1500;  // Initial spawn rate (in ms)
let powerupRate = 0.05;  // Probability of powerup spawning

// Audio Files

const powerupSound = new Audio('./audio/powerup.mp3');
const levelupSound = new Audio('./audio/levelup.mp3');
const powerupCollectSound = new Audio('./audio/powerup-collect.mp3');

const collisionSound = new Audio('./audio/collision.mp3');
collisionSound.preload = 'auto';  // Preload the audio file

// Pause/Play Button functionality
const pausePlayButton = document.getElementById('pausePlayButton');
pausePlayButton.addEventListener('click', togglePausePlay);

let isGamePaused = false;

function togglePausePlay() {
    if (isGamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    isGamePaused = true;
    clearInterval(gameInterval);  // Stop spawning objects
    pausePlayButton.innerHTML = '<i class="fas fa-play"></i>';  // Change button to Play (FontAwesome Play icon)
    pausePlayButton.title = 'Resume Game';  // Tooltip when paused
}

function resumeGame() {
    isGamePaused = false;
    gameInterval = setInterval(spawnObject, enemySpawnRate);  // Resume spawning objects
    pausePlayButton.innerHTML = '<i class="fas fa-pause"></i>';  // Change button to Pause (FontAwesome Pause icon)
    pausePlayButton.title = 'Pause Game';  // Tooltip when playing
}

// Initialization
window.onload = () => {
    // Start Button setup
    const startButton = document.getElementById('startButton');
    const startButtonContainer = document.getElementById('startButtonContainer');

    startButton.addEventListener('click', () => {
        startButtonContainer.style.display = 'none'; // Hide the start button container
        initializeGame(); // Start the game
    });
};

// Game Initialization Function
function initializeGame() {
    player = document.getElementById('player');
    gameArea = document.getElementById('gameArea');
    scoreElement = document.getElementById('score');
    healthElement = document.getElementById('health');

    // Move player with mouse
    document.addEventListener('mousemove', movePlayer);

    // Start spawning objects and powerups
    gameInterval = setInterval(spawnObject, enemySpawnRate);
}


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

// Spawn Object (Enemies and Power-ups)
function spawnObject() {
    const object = document.createElement('div');
    object.className = 'object';

    // Randomize position
    const x = Math.random() * (gameArea.clientWidth - 60); // Object width is 60px
    object.style.left = `${x}px`;

    // Determine if this is a power-up or an enemy
    if (Math.random() < powerupRate) {
        object.classList.add('powerup');  // Power-up class
        object.style.backgroundColor = "green"; // Power-up color
    } else {
        object.classList.add('enemy');  // Enemy class
        object.style.backgroundColor = "red"; // Enemy color
    }

    gameArea.appendChild(object);

    // Animate object falling
    let objectY = 0;
    const objectFall = setInterval(() => {
        objectY += enemySpeed;  // Increase fall speed with level
        object.style.top = `${objectY}px`;

        // Check collision with player
        if (isCollision(player, object)) {
            gameArea.removeChild(object);
            clearInterval(objectFall);

            if (object.classList.contains('enemy')) {
                decreaseHealth(10); // Decrease health on enemy collision
                collisionSound.play(); // Play collision sound
            } else if (object.classList.contains('powerup')) {
                increaseHealth(20); // Increase health on power-up
                powerupCollectSound.play(); // Play power-up collection sound
            }
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

// Increase Health (Power-up Effect)
function increaseHealth(amount) {
    health = Math.min(100, health + amount);  // Max health is 100
    healthElement.innerText = health;
}

// Increase Score
function increaseScore(points) {
    score += points;
    scoreElement.innerText = score;

    // Check if the player leveled up
    if (score >= level * 50) {
        increaseLevel();
    }
}

// Increase Level (Increase difficulty)
function increaseLevel() {
    level++;
    enemySpeed += 1;  // Increase enemy speed
    enemySpawnRate = Math.max(500, enemySpawnRate - 100);  // Decrease spawn rate, minimum 500ms
    powerupRate += 0.02;  // Increase power-up spawn rate
    levelupSound.play();  // Play level-up sound

    // Update level display
    const levelElement = document.getElementById('level');
    levelElement.innerText = level; // Update the level on UI

    // Restart spawn interval with updated spawn rate
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnObject, enemySpawnRate);

    // Update UI for level-up message or effects
    updateUI();
}



// Update UI on Level Up
function updateUI() {
    const levelUpMessage = document.getElementById('levelUpMessage');
    levelUpMessage.innerText = `Congratulations! You've reached level ${level}`;
    
    // Make the message visible
    levelUpMessage.style.display = 'block'; 
    levelUpMessage.style.animation = 'fadeIn 1s ease-out';  // Animation for fade-in effect

    // Optionally, hide it after a few seconds
    setTimeout(() => {
        levelUpMessage.style.display = 'none';
    }, 2000);
}

// End Game
function endGame() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}


// End Game
function endGame() {
    clearInterval(gameInterval);

    // Create a custom end game message
    const endGameOverlay = document.createElement('div');
    endGameOverlay.id = 'endGameOverlay';
    endGameOverlay.innerHTML = `
        <div class="endGameMessage">
            <h2>Game Over!</h2>
            <p>Your Score: ${score}</p>
            <button id="restartButton">Restart Game</button>
        </div>
    `;
    document.body.appendChild(endGameOverlay);

    // Restart Game Button functionality
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', () => {
        resetGame();  // Reset game variables
        document.body.removeChild(endGameOverlay);  // Remove the overlay
        initializeGame();  // Restart the game
    });
}

// Reset Game
function resetGame() {
    score = 0;
    health = 100;
    level = 1; // Reset level
    enemySpeed = 5;  // Reset enemy speed
    enemySpawnRate = 1500;  // Reset spawn rate
    powerupRate = 0.05;  // Reset power-up rate
    scoreElement.innerText = score;
    healthElement.innerText = health;

    // Remove all objects
    document.querySelectorAll('.object').forEach(object => object.remove());

    // Restart game
    gameInterval = setInterval(spawnObject, enemySpawnRate);
}
