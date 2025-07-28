const road = document.querySelector('.road');
const scoreDisplay = document.querySelector('.score');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
let carPosition = 50; // Percentage of the road width
let score = 0;
let obstacleSpeed = 3;
let obstacleCreationInterval;
let obstacles = [];
let gameOver = false; // Flag to check if the game is over

// Create the car element
const car = document.createElement('div');
car.classList.add('car');
road.appendChild(car);

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (gameOver) return; // Prevent car movement if the game is over
    const roadWidth = road.clientWidth;
    const carWidth = car.clientWidth;

    if (e.key === 'ArrowLeft' && carPosition > 0) {
        carPosition -= 10;
        if (carPosition < 0) carPosition = 0; // Prevent moving beyond the left boundary
    } else if (e.key === 'ArrowRight' && carPosition < 100 - (carWidth / roadWidth) * 100) {
        carPosition += 10;
        if (carPosition > 100 - (carWidth / roadWidth) * 100) {
            carPosition = 100 - (carWidth / roadWidth) * 100; // Prevent moving beyond the right boundary
        }
    }
    car.style.left = carPosition + '%';
});
function startGame() {
    gameOver = false; // Reset game over flag
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    road.innerHTML = ''; // Clear any existing obstacles

    // Re-add the car to the road and reset its position and state
    road.appendChild(car);
    car.style.left = '50%'; // Reset car position
    carPosition = 50; // Reset car position variable
    car.classList.remove('crash'); // Remove crash effect to restore the car

    obstacles = []; // Reset obstacles array
    obstacleCreationInterval = setInterval(createObstacle, 2000); // Create new obstacles every 2 seconds
    gameLoop(); // Start the game loop
}

function restartGame() {
    clearInterval(obstacleCreationInterval); // Stop the obstacle creation
    startGame(); // Restart the game
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = Math.random() * (road.clientWidth - 50) + 'px'; // Adjust for new car width
    obstacle.style.top = '-100px'; // Start above the screen
    road.appendChild(obstacle);
    obstacles.push(obstacle); // Add to the array of active obstacles
}

function gameLoop() {
    if (gameOver) return; // Stop the game loop if the game is over

    obstacles.forEach((obstacle, index) => {
        let obstacleTop = parseInt(obstacle.style.top);
        obstacleTop += obstacleSpeed;

        // Check if the obstacle is out of bounds
        if (obstacleTop > road.clientHeight) {
            obstacle.remove();
            obstacles.splice(index, 1); // Remove from the DOM and the array
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        } else if (isCollision(obstacle)) {
            endGame(); // Stop the game on collision
        } else {
            obstacle.style.top = obstacleTop + 'px';
        }
    });

    requestAnimationFrame(gameLoop); // Continue the game loop
}

function isCollision(obstacle) {
    const carRect = car.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    return !(
        carRect.right < obstacleRect.left ||
        carRect.left > obstacleRect.right ||
        carRect.bottom < obstacleRect.top ||
        carRect.top > obstacleRect.bottom
    );
}
function endGame() {
    clearInterval(obstacleCreationInterval); // Stop creating new obstacles
    gameOver = true; // Set the game over flag to true

    // Change the car to a "damaged" version for crash effect
    car.classList.add('crash');

    // Optional: Add a small delay before showing the "Game Over" alert
    setTimeout(() => {
        alert(`Game Over! Score: ${score}`);
        restartBtn.style.display = 'block'; // Show the play again button
    }, 500); // Delay for 500ms to let the crash effect play
}
