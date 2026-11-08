// Pori vai Suomi - Pelin moottori
// Kysymykset ladataan automaattisesti erillisestä questions.js -tiedostosta!
const HEADLINES = window.HEADLINES || [];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let seenIds = [];
let currentDeck = [];
let currentIndex = 0;
let score = 0;

function setButtonsDisabled(disabled) {
  const btnPori = document.getElementById('btn-pori') || document.getElementById('btn-kouvola');
  const btnSuomi = document.getElementById('btn-suomi') || document.getElementById('btn-klaukkala');
  if (btnPori) btnPori.disabled = disabled;
  if (btnSuomi) btnSuomi.disabled = disabled;
}

function initGame() {
  let pool = HEADLINES.filter(h => !seenIds.includes(h.id));
  if (pool.length < 10) {
    pool = [...HEADLINES];
    seenIds = [];
  }
  const shuffled = shuffleArray(pool);
  currentDeck = shuffled.slice(0, 10);
  currentDeck.forEach(h => seenIds.push(h.id));

  currentIndex = 0;
  score = 0;
  const modal = document.getElementById('game-over-modal');
  if (modal) modal.style.display = 'none';
  const quizCard = document.querySelector('.quiz-card');
  if (quizCard) quizCard.style.display = 'block';
  updateScore();
  loadQuestion();
}

function loadQuestion() {
  const item = currentDeck[currentIndex];
  document.getElementById('current-num').textContent = currentIndex + 1;
  document.getElementById('total-num').textContent = currentDeck.length;
  document.getElementById('paper-source').textContent = 'Lähde salattu 🔒';
  document.getElementById('headline-text').textContent = item.maskedText;
  
  // Nollaa näkymä ja painikkeet
  document.getElementById('options-grid').style.display = 'grid';
  document.getElementById('feedback-panel').style.display = 'none';
  setButtonsDisabled(false);
}

function answer(choice) {
  const item = currentDeck[currentIndex];
  const isCorrect = choice === item.city;
  
  if (isCorrect) {
    score++;
    updateScore();
  }
  
  // Paljasta lähde ja oikea otsikko
  document.getElementById('paper-source').textContent = 'Lähde: ' + item.source;
  document.getElementById('headline-text').innerHTML = item.fullText.replace(
    item.inflectedWord,
    '<span style="color:#facc15; text-decoration: underline;">' + item.inflectedWord + '</span>'
  );
  
  // Palaute
  const feedbackStatus = document.getElementById('feedback-status');
  const locationLabel = item.city === 'Pori' 
    ? 'Porissa' 
    : 'muualla Suomessa (' + item.inflectedWord + ')';

  if (isCorrect) {
    feedbackStatus.textContent = 'OIKEIN! 👍 Tapahtui ' + locationLabel + '.';
    feedbackStatus.className = 'feedback-status correct';
  } else {
    feedbackStatus.textContent = 'VÄÄRIN! ❌ Tapahtui ' + locationLabel + '.';
    feedbackStatus.className = 'feedback-status wrong';
  }
  
  document.getElementById('context-note').textContent = item.contextNote || '';
  document.getElementById('source-link').href = item.url;
  document.getElementById('source-link').textContent = 'Lue alkuperäinen uutinen (' + item.source + ') ↗';
  
  setButtonsDisabled(true);
  document.getElementById('feedback-panel').style.display = 'block';
}

function updateScore() {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = score;
}

function nextQuestion() {
  if (currentIndex + 1 < currentDeck.length) {
    currentIndex++;
    loadQuestion();
  } else {
    showGameOver();
  }
}

function showGameOver() {
  const quizCard = document.querySelector('.quiz-card');
  if (quizCard) quizCard.style.display = 'none';
  const modal = document.getElementById('game-over-modal');
  if (modal) modal.style.display = 'block';
  document.getElementById('final-score-text').textContent = 'Sait ' + score + ' / ' + currentDeck.length + ' pistettä!';
  
  let verdict = '';
  if (score === currentDeck.length) {
    verdict = 'Täydellistä! Olet aito Pori & Suomi -uutistietäjä!';
  } else if (score >= currentDeck.length * 0.7) {
    verdict = 'Hieno tulos! Seuraat selvästi kotimaan uutisia silmä kovana.';
  } else {
    verdict = 'Kohtalainen tulos! Pieni opintoretki Satakuntaan tai lehtikatsaukseen voisi olla paikallaan.';
  }
  document.getElementById('verdict-text').textContent = verdict;
  const whatsappBtn = document.getElementById('whatsapp-share-btn');
  if (whatsappBtn) {
    const appUrl = window.location.href;
    const shareText = encodeURIComponent('Pori vai Suomi? -uutisvisa 🗞️ Sain ' + score + ' / ' + currentDeck.length + ' pistettä! Erotatko sinä Porin ja muun Suomen omituisuudet toisistaan? Pelaa täällä: ' + appUrl);
    whatsappBtn.href = 'https://api.whatsapp.com/send?text=' + shareText;
  }
}

// Käynnistä peli
initGame();
