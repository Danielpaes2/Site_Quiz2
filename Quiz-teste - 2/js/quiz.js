const TOTAL_QUESTIONS = 10;
const QUIZ_JSON_PATH = "./bd/dados.json";
let QUIZ_DATA = null;

const OPTION_META = [
  { letter: "A", icon: "◆", className: "option-a" },
  { letter: "B", icon: "◈", className: "option-b" },
  { letter: "C", icon: "✦", className: "option-c" },
  { letter: "D", icon: "■", className: "option-d" },
];

function createAttemptId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCurrentAttemptId() {
  let attemptId = localStorage.getItem("currentQuizAttemptId");

  if (!attemptId) {
    attemptId = createAttemptId();
    localStorage.setItem("currentQuizAttemptId", attemptId);
  }

  return attemptId;
}

function getPlayerName() {
  return (localStorage.getItem("currentPlayer") || "").trim();
}

function requirePlayerName() {
  if (!getPlayerName()) {
    window.location.href = "home.html";
    return false;
  }

  return true;
}

async function loadQuizData() {
  if (QUIZ_DATA) return QUIZ_DATA;

  try {
    const response = await fetch(QUIZ_JSON_PATH);

    if (!response.ok) {
      throw new Error(
        `Falha ao carregar ${QUIZ_JSON_PATH}: ${response.status}`,
      );
    }

    const data = await response.json();
    QUIZ_DATA = data;
    return data;
  } catch (error) {
    console.error("Erro ao carregar perguntas:", error);
    return null;
  }
}

function getCurrentQuestionId() {
  const match = window.location.pathname.match(/q(\d+)\.html$/i);
  return match ? Number(match[1]) : null;
}

function safeParseStorage(key, storage = localStorage) {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      `Falha ao parsear ${key} de ${storage === sessionStorage ? "sessionStorage" : "localStorage"}:`,
      error,
    );
    return null;
  }
}

function getStoredQuizAnswers() {
  return (
    safeParseStorage("quizAnswers", localStorage) ||
    safeParseStorage("quizAnswers", sessionStorage) ||
    {}
  );
}

function buildChosenAnswersFromStorage(answers) {
  const ids = Object.keys(answers).sort((a, b) => Number(a) - Number(b));
  const questionMap = new Map((QUIZ_DATA?.quiz || []).map((q) => [q.id, q]));

  return ids.map((id) => {
    const answer = answers[id];
    const questionId = Number(id);
    const question = questionMap.get(questionId);

    return {
      perguntaId: questionId,
      pergunta: question?.question ?? `Pergunta ${questionId}`,
      opcaoEscolhida: answer.selected,
      respostaEscolhida:
        question?.options?.[answer.selected] ?? `Opcao ${answer.selected + 1}`,
      opcaoCorreta: question?.correct ?? null,
      respostaCorreta:
        question?.options?.[question.correct] ??
        "Resposta correta nao disponivel.",
      acertou: Boolean(answer.correct),
      respondidaEm: answer.answeredAt || null,
    };
  });
}

function saveAnswersInBrowser(answers) {
  const answersJSON = JSON.stringify(answers);
  const chosenAnswersJSON = JSON.stringify(
    buildChosenAnswersFromStorage(answers),
  );

  localStorage.setItem("quizAnswers", answersJSON);
  sessionStorage.setItem("quizAnswers", answersJSON);
  localStorage.setItem("respostasEscolhidas", chosenAnswersJSON);
  sessionStorage.setItem("respostasEscolhidas", chosenAnswersJSON);
  localStorage.setItem("respostas_salvas_json", chosenAnswersJSON);
  sessionStorage.setItem("respostas_salvas_json", chosenAnswersJSON);
}

function getNextQuestionPage(questionId) {
  if (questionId >= 1 && questionId < TOTAL_QUESTIONS) {
    return `q${questionId + 1}.html`;
  }

  return "resultado.html";
}

function isQuestionPage() {
  return Boolean(
    document.querySelector(".question-box") && getCurrentQuestionId(),
  );
}

function renderQuestionPage() {
  const questionId = getCurrentQuestionId();
  const questionData = QUIZ_DATA?.quiz?.find((q) => q.id === questionId);

  if (!questionData) {
    console.warn(`Questão ${questionId} não encontrada no JSON.`);
    return;
  }

  const box = document.querySelector(".question-box");

  if (!box) return;

  box.innerHTML = `
    <p class="question-counter">Pergunta ${questionId}/${TOTAL_QUESTIONS}</p>
    <h1 id="questionTitle" class="question-title">${questionData.question}</h1>
    <div id="answersContainer" class="answers"></div>
  `;

  const answersContainer = box.querySelector("#answersContainer");

  questionData.options.forEach((option, index) => {
    const meta = OPTION_META[index] || {
      letter: String(index + 1),
      icon: "•",
      className: "option-extra",
    };
    const button = document.createElement("button");
    button.className = `option ${meta.className}`;
    button.type = "button";
    button.dataset.optionLetter = meta.letter;

    const badge = document.createElement("span");
    badge.className = "option-badge";
    badge.textContent = meta.letter;

    const icon = document.createElement("span");
    icon.className = "option-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = meta.icon;

    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = option;

    button.append(badge, icon, label);
    button.addEventListener("click", () => {
      const buttons = answersContainer.querySelectorAll(".option");

      buttons.forEach((item) => {
        item.disabled = true;
        item.classList.remove("is-selected");
      });

      button.classList.add("is-selected");
      answerQuestion(questionId, index, index === questionData.correct);
      setTimeout(() => {
        nextQuestion(getNextQuestionPage(questionId));
      }, 260);
    });

    answersContainer.appendChild(button);
  });
}

function answerQuestion(questionId, selected, correct) {
  if (!requirePlayerName()) return;

  const answers = getStoredQuizAnswers();

  answers[questionId] = {
    selected,
    correct,
    answeredAt: new Date().toISOString(),
  };

  saveAnswersInBrowser(answers);
  localStorage.setItem("currentQuizAttemptId", getCurrentAttemptId());
}

function getProgressPercent() {
  const answers = getStoredQuizAnswers();
  const answered = Object.keys(answers).length;
  return Math.min(100, (answered / TOTAL_QUESTIONS) * 100);
}

function updateProgress() {
  const percent = getProgressPercent();

  localStorage.setItem("quizProgress", percent);
  sessionStorage.setItem("quizProgress", percent);
}

function nextQuestion(page) {
  updateProgress();
  window.location.href = page;
}

function calculateScore() {
  const answers = getStoredQuizAnswers();
  let score = 0;

  Object.values(answers).forEach((answer) => {
    if (answer && answer.correct) score++;
  });

  return score;
}

function saveScore() {
  const player = getPlayerName();

  if (!player) return;

  const score = calculateScore();
  const savedAnswers = getStoredQuizAnswers();
  const answered = Object.keys(savedAnswers).length;
  const lastSavedKey = localStorage.getItem("lastSavedScoreKey");
  const currentKey = `${player}:${score}:${answered}`;

  if (answered === 0 || lastSavedKey === currentKey) return;

  let ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  ranking.push({
    name: player,
    score,
    answered,
    date: new Date().toISOString(),
  });

  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 20);

  localStorage.setItem("nebulaRanking", JSON.stringify(ranking));
  localStorage.setItem("lastSavedScoreKey", currentKey);
}

function resetQuiz() {
  localStorage.removeItem("quizAnswers");
  localStorage.removeItem("quizProgress");
  localStorage.removeItem("quizResult");
  localStorage.removeItem("lastQuizResult");
  localStorage.removeItem("respostasEscolhidas");
  localStorage.removeItem("respostas_salvas_json");
  localStorage.removeItem("lastSavedScoreKey");
  localStorage.removeItem("currentQuizAttemptId");
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");
  sessionStorage.removeItem("lastQuizResult");
  sessionStorage.removeItem("respostasEscolhidas");
  sessionStorage.removeItem("respostas_salvas_json");
}

function renderProgress() {
  const progress = getProgressPercent();
  const bar = document.getElementById("progressBar");
  const label = document.querySelector(".progress-percent");

  if (!bar) {
    if (label) label.textContent = `${Math.round(progress)}%`;
    return;
  }

  const preservePosition = bar.style.width === "" || bar.style.width === "0%";

  if (preservePosition) {
    bar.style.transition = "none";
  }

  bar.style.width = `${progress}%`;
  if (label) label.textContent = `${Math.round(progress)}%`;

  if (preservePosition) {
    requestAnimationFrame(() => {
      bar.style.transition = "";
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.body.dataset.requiresPlayer === "true") {
    if (!requirePlayerName()) return;
  }

  if (isQuestionPage()) {
    const data = await loadQuizData();

    if (data) {
      renderQuestionPage();
      renderProgress();
    }
  }
});
