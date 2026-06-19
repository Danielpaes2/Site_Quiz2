// =========================
// RESPOSTA
// =========================

function answerQuestion(questionId, selected, correct) {
  const answers = JSON.parse(localStorage.getItem("quizAnswers")) || {};

  answers[questionId] = {
    selected,
    correct,
  };

  localStorage.setItem("quizAnswers", JSON.stringify(answers));
}

// =========================
// PROGRESSO
// =========================

function updateProgress() {
  const answers = JSON.parse(localStorage.getItem("quizAnswers")) || {};

  const answered = Object.keys(answers).length;

  const percent = (answered / 10) * 100;

  localStorage.setItem("quizProgress", percent);
}

// =========================
// PRÓXIMA QUESTÃO
// =========================

function nextQuestion(page) {
  updateProgress();

  window.location.href = page;
}

// =========================
// RESULTADO
// =========================

function calculateScore() {
  const answers = JSON.parse(localStorage.getItem("quizAnswers")) || {};

  let score = 0;

  Object.values(answers).forEach((answer) => {
    if (answer.correct) {
      score++;
    }
  });

  return score;
}

// =========================
// RANKING
// =========================

function saveScore() {
  const player = localStorage.getItem("currentPlayer");

  const score = calculateScore();

  let ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  ranking.push({
    name: player,
    score: score,
  });

  ranking.sort((a, b) => b.score - a.score);

  localStorage.setItem(
    "nebulaRanking",

    JSON.stringify(ranking),
  );
}

// =========================
// LIMPAR
// =========================

function resetQuiz() {
  localStorage.removeItem("quizAnswers");

  localStorage.removeItem("quizProgress");
}

function renderProgress() {
  const progress = localStorage.getItem("quizProgress") || 0;

  const bar = document.getElementById("progressBar");
  const label = document.querySelector(".progress-percent");

  if (bar) {
    bar.style.width = progress + "%";
  }

  if (label) {
    label.textContent = Math.round(progress) + "%";
  }
}

