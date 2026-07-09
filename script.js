const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const highScoreEl = document.getElementById("highScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");

let score = 0;
let coins = 0;
let highScore = localStorage.getItem("carHighScore") || 0;
let speed = 5;
let playerX = 45;
let gameRunning = false;
let enemies = [];
let coinItems = [];
let gameLoop;

highScoreEl.innerText = highScore;

function startGame() {
  score = 0;
  coins = 0;
  speed = 5;
  playerX = 45;
  enemies = [];
  coinItems = [];
  gameRunning = true;

  scoreEl.innerText = score;
  coinsEl.innerText = coins;
  player.style.left = playerX + "%";

  document.querySelectorAll(".enemy, .coin").forEach(item => item.remove());

  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  createEnemies();
  createCoins();

  clearInterval(gameLoop);
  gameLoop = setInterval(updateGame, 30);
}

function restartGame() {
  startGame();
}

function createEnemies() {
  for (let i = 0; i < 3; i++) {
    let enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerText = "🚗";
    enemy.style.left = randomLane() + "%";
    enemy.style.top = (-200 - i * 250) + "px";
    gameArea.appendChild(enemy);
    enemies.push(enemy);
  }
}

function createCoins() {
  for (let i = 0; i < 2; i++) {
    let coin = document.createElement("div");
    coin.className = "coin";
    coin.innerText = "🪙";
    coin.style.left = randomLane() + "%";
    coin.style.top = (-350 - i * 400) + "px";
    gameArea.appendChild(coin);
    coinItems.push(coin);
  }
}

function randomLane() {
  const lanes = [18, 45, 72];
  return lanes[Math.floor(Math.random() * lanes.length)];
}

function updateGame() {
  if (!gameRunning) return;

  score++;
  scoreEl.innerText = score;

  if (score % 500 === 0) {
    speed += 1;
  }

  moveRoadLines();
  moveEnemies();
  moveCoins();
  checkCollision();
}

function moveRoadLines() {
  document.querySelectorAll(".road-line").forEach(line => {
    let top = parseInt(line.style.top || line.offsetTop);
    top += speed;

    if (top > gameArea.offsetHeight) {
      top = -100;
    }

    line.style.top = top + "px";
  });
}

function moveEnemies() {
  enemies.forEach(enemy => {
    let top = parseInt(enemy.style.top);
    top += speed;

    if (top > gameArea.offsetHeight) {
      top = -120;
      enemy.style.left = randomLane() + "%";
    }

    enemy.style.top = top + "px";
  });
}

function moveCoins() {
  coinItems.forEach(coin => {
    let top = parseInt(coin.style.top);
    top += speed;

    if (top > gameArea.offsetHeight) {
      top = -250;
      coin.style.left = randomLane() + "%";
    }

    coin.style.top = top + "px";

    if (isCollide(player, coin)) {
      coins++;
      coinsEl.innerText = coins;
      coin.style.top = "-300px";
      coin.style.left = randomLane() + "%";
      score += 100;
    }
  });
}

function checkCollision() {
  enemies.forEach(enemy => {
    if (isCollide(player, enemy)) {
      endGame();
    }
  });
}

function isCollide(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);

  finalScoreEl.innerText = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("carHighScore", highScore);
    highScoreEl.innerText = highScore;
  }

  gameOverScreen.style.display = "flex";
}

function moveLeft() {
  if (!gameRunning) return;
  if (playerX > 18) {
    playerX -= 27;
    player.style.left = playerX + "%";
  }
}

function moveRight() {
  if (!gameRunning) return;
  if (playerX < 72) {
    playerX += 27;
    player.style.left = playerX + "%";
  }
}

document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});
