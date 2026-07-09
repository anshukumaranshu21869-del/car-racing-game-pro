const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");
const menu = document.getElementById("menu");
const gameOverBox = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const boostBtn = document.getElementById("boostBtn");

let gameStarted = false;
let score = 0;
let coins = 0;
let highScore = localStorage.getItem("racingHighScoreV2") || 0;

highScoreText.textContent = highScore;

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 430,
  height: window.innerHeight - 128,
  backgroundColor: "#111",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: {
    create,
    update
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

let sceneRef;
let player;
let cursors;
let roadLines = [];
let enemies;
let coinGroup;
let speed = 5;
let laneX = [115, 215, 315];
let currentLane = 1;
let isBoosting = false;

function create() {
  sceneRef = this;

  createRoad(this);
  createPlayer(this);
  createEnemies(this);
  createCoins(this);

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.overlap(player, enemies, crashGame, null, this);
  this.physics.add.overlap(player, coinGroup, collectCoin, null, this);

  setupControls();
}

function createRoad(scene) {
  const width = config.width;
  const height = config.height;

  scene.add.rectangle(width / 2, height / 2, width, height, 0x2b2b2b);
  scene.add.rectangle(28, height / 2, 10, height, 0xffffff);
  scene.add.rectangle(width - 28, height / 2, 10, height, 0xffffff);

  for (let i = 0; i < 6; i++) {
    let line = scene.add.rectangle(width / 2, i * 140, 8, 80, 0xffffff);
    roadLines.push(line);
  }

  scene.add.text(10, 10, "PRO V2", {
    fontSize: "16px",
    color: "#ffd700"
  });
}

function createPlayer(scene) {
  player = scene.add.text(laneX[currentLane], config.height - 90, "🏎️", {
    fontSize: "48px"
  });
  player.setOrigin(0.5);

  scene.physics.add.existing(player);
  player.body.setSize(42, 70);
  player.body.setOffset(8, 2);
}

function createEnemies(scene) {
  enemies = scene.physics.add.group();

  for (let i = 0; i < 4; i++) {
    let enemy = scene.add.text(
      laneX[Math.floor(Math.random() * 3)],
      -150 - i * 180,
      randomCar(),
      { fontSize: "44px" }
    );

    enemy.setOrigin(0.5);
    scene.physics.add.existing(enemy);
    enemy.body.setSize(40, 65);
    enemy.body.setOffset(8, 4);
    enemies.add(enemy);
  }
}

function createCoins(scene) {
  coinGroup = scene.physics.add.group();

  for (let i = 0; i < 3; i++) {
    let coin = scene.add.text(
      laneX[Math.floor(Math.random() * 3)],
      -250 - i * 300,
      "🪙",
      { fontSize: "32px" }
    );

    coin.setOrigin(0.5);
    scene.physics.add.existing(coin);
    coin.body.setSize(30, 30);
    coinGroup.add(coin);
  }
}

function update() {
  if (!gameStarted) return;

  let activeSpeed = isBoosting ? speed + 5 : speed;

  moveRoad(activeSpeed);
  moveEnemies(activeSpeed);
  moveCoins(activeSpeed);

  score += isBoosting ? 3 : 1;
  scoreText.textContent = score;

  if (score % 700 === 0) {
    speed += 0.7;
  }

  if (cursors.left.isDown) moveLeft();
  if (cursors.right.isDown) moveRight();
}

function moveRoad(activeSpeed) {
  roadLines.forEach(line => {
    line.y += activeSpeed;
    if (line.y > config.height + 50) {
      line.y = -80;
    }
  });
}

function moveEnemies(activeSpeed) {
  enemies.children.iterate(enemy => {
    enemy.y += activeSpeed;

    if (enemy.y > config.height + 80) {
      enemy.y = -150;
      enemy.x = laneX[Math.floor(Math.random() * 3)];
      enemy.setText(randomCar());
    }
  });
}

function moveCoins(activeSpeed) {
  coinGroup.children.iterate(coin => {
    coin.y += activeSpeed;

    if (coin.y > config.height + 60) {
      coin.y = -260;
      coin.x = laneX[Math.floor(Math.random() * 3)];
    }
  });
}

function moveLeft() {
  if (!gameStarted) return;
  if (currentLane > 0) {
    currentLane--;
    sceneRef.tweens.add({
      targets: player,
      x: laneX[currentLane],
      duration: 120,
      ease: "Power2"
    });
  }
}

function moveRight() {
  if (!gameStarted) return;
  if (currentLane < 2) {
    currentLane++;
    sceneRef.tweens.add({
      targets: player,
      x: laneX[currentLane],
      duration: 120,
      ease: "Power2"
    });
  }
}

function collectCoin(playerObj, coin) {
  coins++;
  coinsText.textContent = coins;
  score += 100;
  coin.y = -300;
  coin.x = laneX[Math.floor(Math.random() * 3)];
}

function crashGame() {
  gameStarted = false;

  finalScoreText.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("racingHighScoreV2", highScore);
    highScoreText.textContent = highScore;
  }

  sceneRef.cameras.main.shake(300, 0.02);
  sceneRef.cameras.main.flash(250, 255, 0, 0);

  setTimeout(() => {
    gameOverBox.style.display = "flex";
  }, 350);
}

function randomCar() {
  const cars = ["🚗", "🚙", "🚕", "🚓", "🚚"];
  return cars[Math.floor(Math.random() * cars.length)];
}

function startGame() {
  score = 0;
  coins = 0;
  speed = 5;
  currentLane = 1;
  isBoosting = false;

  scoreText.textContent = score;
  coinsText.textContent = coins;

  player.x = laneX[currentLane];

  enemies.children.iterate((enemy, i) => {
    enemy.y = -150 - i * 180;
    enemy.x = laneX[Math.floor(Math.random() * 3)];
  });

  coinGroup.children.iterate((coin, i) => {
    coin.y = -250 - i * 300;
    coin.x = laneX[Math.floor(Math.random() * 3)];
  });

  menu.style.display = "none";
  gameOverBox.style.display = "none";
  gameStarted = true;
}

function setupControls() {
  startBtn.onclick = startGame;
  restartBtn.onclick = startGame;

  leftBtn.onclick = moveLeft;
  rightBtn.onclick = moveRight;

  boostBtn.onmousedown = () => isBoosting = true;
  boostBtn.onmouseup = () => isBoosting = false;

  boostBtn.ontouchstart = () => isBoosting = true;
  boostBtn.ontouchend = () => isBoosting = false;
}
