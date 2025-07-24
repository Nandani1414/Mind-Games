

const board = document.getElementById('game-board');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');
const levelSelect = document.getElementById('level-select');
const timeSelect = document.getElementById('time-select');
const timerDisplay = document.getElementById('timer');

const allSymbols = ['🕊️','🦜','🐧','🦚','🪺','🦩','🐦','🦆','🦅','🦉','🐓','🦃'];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let currentSymbols = [];
let totalSeconds = 0;
let countdown;
let timeUp = false;
let elapsedSeconds = 0;

restartButton.addEventListener('click', restartGame);
nextLevelButton.addEventListener('click', goToNextLevel);
levelSelect.addEventListener('change', restartGame);
timeSelect.addEventListener('change', restartGame);

function getSymbolsForLevel(level) {
  const pairCount = level === 'medium' ? 6 : level === 'hard' ? 8 : 4;
  const selected = allSymbols.slice(0, pairCount);
  const duplicated = [...selected, ...selected];
  return duplicated.sort(() => Math.random() - 0.5);
}

function createCard(symbol) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front"></div>
      <div class="card-back">${symbol}</div>
    </div>`;
  card.addEventListener("click", () => flipCard(card));
  board.appendChild(card);
}

function flipCard(card) {
  if (lockBoard || timeUp || card === firstCard || card.classList.contains('flip')) return;
  card.classList.add('flip');
  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    checkMatch();
  }
}

function checkMatch() {
  const match =
    firstCard.querySelector('.card-back').textContent ===
    secondCard.querySelector('.card-back').textContent;

  if (match) {
    disableCards();
    matchedPairs++;
    if (matchedPairs === currentSymbols.length / 2) {
      clearInterval(countdown);
      statusText.textContent = `🎉 You won in ${formatTime(elapsedSeconds)}!`;
      restartButton.style.display = 'inline-block';
      nextLevelButton.style.display = levelSelect.value !== 'hard' ? 'inline-block' : 'none';
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener("click", () => flipCard(firstCard));
  secondCard.removeEventListener("click", () => flipCard(secondCard));
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 800);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function startTimer() {
  clearInterval(countdown);
  totalSeconds = parseInt(timeSelect.value) * 60;
  elapsedSeconds = 0;
  timeUp = false;
  updateTimerDisplay();

  countdown = setInterval(() => {
    totalSeconds--;
    elapsedSeconds++;
    updateTimerDisplay();

    if (totalSeconds <= 0) {
      clearInterval(countdown);
      endGameDueToTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  timerDisplay.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function endGameDueToTimeout() {
  lockBoard = true;
  timeUp = true;
  statusText.textContent = "⏰ Time's up! Try again?";
  restartButton.style.display = 'inline-block';
  nextLevelButton.style.display = 'none';
  document.querySelectorAll('.card').forEach(card => {
    card.style.pointerEvents = 'none';
  });
}

function restartGame() {
  board.innerHTML = '';
  restartButton.style.display = 'none';
  nextLevelButton.style.display = 'none';
  statusText.textContent = '🔍 Find all matching pairs!';
  matchedPairs = 0;
  resetBoard();
  timeUp = false;

  const level = levelSelect.value;
  currentSymbols = getSymbolsForLevel(level);

  const columns = level === 'easy' ? 4 : 4;
  board.style.gridTemplateColumns = `repeat(${columns}, 80px)`;

  currentSymbols.forEach(symbol => createCard(symbol));

  startTimer();
}

function goToNextLevel() {
  if (levelSelect.value === 'easy') levelSelect.value = 'medium';
  else if (levelSelect.value === 'medium') levelSelect.value = 'hard';
  restartGame();
}

restartGame(); // auto start on load
