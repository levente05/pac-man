const board = document.getElementById("game-board");
let width = 20; // Normál játék tábla szélessége
let height = 20; // Normál játék tábla magassága
let pacManPosition = 210;
let ghostPositions = [188, 191, 171];
let currentDirection = "right";
let walls = generateWalls();
let points = [];
let score = 0;
let lives = 3;
let level = 1;
let minigamePlayed = false;

// Véletlenszerű falgenerálás (pontok elérhetőségével)
function generateWalls() {
  const wallCount = Math.floor((width * height) / 5);
  const newWalls = [];
  while (newWalls.length < wallCount) {
    const wall = Math.floor(Math.random() * width * height);
    if (
      !newWalls.includes(wall) &&
      wall !== pacManPosition &&
      !ghostPositions.includes(wall)
    ) {
      newWalls.push(wall);
    }
  }
  return makeAccessible(newWalls);
}

// Elérhetőségi ellenőrzés
function makeAccessible(walls) {
  const reachable = new Set();
  const queue = [pacManPosition];
  const visited = new Set();

  while (queue.length > 0) {
    const position = queue.shift();
    reachable.add(position);

    const directions = [-1, 1, -width, width];
    for (let dir of directions) {
      const nextPos = position + dir;
      if (
        nextPos >= 0 &&
        nextPos < width * height &&
        !walls.includes(nextPos) &&
        !visited.has(nextPos)
      ) {
        visited.add(nextPos);
        queue.push(nextPos);
      }
    }
  }
  return walls.filter((wall) => !reachable.has(wall));
}

// Tábla generálása
function createBoard() {
  board.innerHTML = "";
  points = [];
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (walls.includes(i)) {
      cell.classList.add("wall");
    } else if (i !== pacManPosition && !ghostPositions.includes(i)) {
      points.push(i);
      cell.classList.add("point");
    }
    board.appendChild(cell);
  }
  updateBoard();
}

// Tábla frissítése
function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.classList.remove("pacman", "ghost", "point");
    if (index === pacManPosition) cell.classList.add("pacman");
    if (ghostPositions.includes(index)) cell.classList.add("ghost");
    if (points.includes(index)) cell.classList.add("point");
  });
}

// Mozgás kezelése (nyilak és WASD)
document.addEventListener("keydown", (e) => {
  let newPosition = pacManPosition;
  const keyMap = {
    ArrowUp: -width,
    ArrowDown: width,
    ArrowLeft: -1,
    ArrowRight: 1,
    w: -width,
    s: width,
    a: -1,
    d: 1,
  };
  if (keyMap[e.key] !== undefined) {
    newPosition += keyMap[e.key];
    if (["ArrowUp", "w"].includes(e.key)) currentDirection = "up";
    if (["ArrowDown", "s"].includes(e.key)) currentDirection = "down";
    if (["ArrowLeft", "a"].includes(e.key)) currentDirection = "left";
    if (["ArrowRight", "d"].includes(e.key)) currentDirection = "right";
  }
  if (
    newPosition >= 0 &&
    newPosition < width * height &&
    !walls.includes(newPosition)
  ) {
    pacManPosition = newPosition;
    eatPoint();
    updateBoard();
    checkCollisions();
  }
});

// Tábla frissítése
function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.classList.remove(
      "pacman",
      "ghost",
      "point",
      "right",
      "left",
      "up",
      "down"
    );
    if (index === pacManPosition) {
      cell.classList.add("pacman", currentDirection);
    }
    if (ghostPositions.includes(index)) cell.classList.add("ghost");
    if (points.includes(index)) cell.classList.add("point");
  });
}

// Pontgyűjtés
function eatPoint() {
  if (points.includes(pacManPosition)) {
    points = points.filter((point) => point !== pacManPosition);
    score++;
    document.getElementById("score").textContent = score;
    if (points.length === 0) {
      nextLevel();
    }
  }
}

// Szellemek mozgása
function moveGhosts() {
  ghostPositions = ghostPositions.map((position) => {
    const directions = [-1, 1, -width, width];
    const validMoves = directions
      .map((d) => position + d)
      .filter(
        (newPos) =>
          newPos >= 0 &&
          newPos < width * height &&
          !walls.includes(newPos) &&
          newPos !== position
      );
    return (
      validMoves[Math.floor(Math.random() * validMoves.length)] || position
    );
  });
  checkCollisions();
}

// Ütközések ellenőrzése
function checkCollisions() {
  if (ghostPositions.includes(pacManPosition)) {
    lives--;
    document.getElementById("lives").textContent = lives;
    if (lives <= 0 && !minigamePlayed) {
      startMiniGame();
    } else if (lives <= 0) {
      alert("Game Over!");
      resetGame();
    } else {
      resetLevel();
    }
  }
}

// Minijáték indítása
function startMiniGame() {
  minigamePlayed = true; // Csak egyszer játszható
  alert("Minijáték: Tarts ki 30 másodpercig a szellemek elkerülésével!");

  // Minijáték tábla beállítása
  width = 10;
  height = 10;
  ghostPositions = [14, 85];
  pacManPosition = 55;
  walls = []; // Nincsenek falak a minijátékban
  createBoard();

  let timeLeft = 30;
  const timer = setInterval(() => {
    moveGhosts();
    updateBoard();
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("+1 élet! Visszatérés a főjátékhoz.");
      lives = 1;
      document.getElementById("lives").textContent = lives;
      width = 20;
      height = 20;
      resetLevel();
    } else {
      timeLeft--;
    }
  }, 500);
}

// Következő szint
function nextLevel() {
  level++;
  document.getElementById("level").textContent = level;
  walls = generateWalls();
  ghostPositions.push(Math.floor(Math.random() * width * height));
  createBoard();
}

// Szint újraindítása
function resetLevel() {
  pacManPosition = 210;
  ghostPositions = [188, 191, 171];
  walls = generateWalls();
  createBoard();
}

// Játék újraindítása
function resetGame() {
  lives = 3;
  score = 0;
  level = 1;
  pacManPosition = 210;
  ghostPositions = [188, 191, 171];
  walls = generateWalls();
  minigamePlayed = false;
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
  document.getElementById("level").textContent = level;
  createBoard();
}

// Fő játék indítása
document.getElementById("start-button").addEventListener("click", () => {
  createBoard();
  setInterval(() => {
    moveGhosts();
    updateBoard();
  }, 500);
});
