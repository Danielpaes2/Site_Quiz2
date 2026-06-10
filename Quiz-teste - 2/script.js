/* ==========================================
   CONFIGURAÇÕES
========================================== */

let QUESTIONS = [];

// Carregar perguntas do JSON
async function loadQuestionsFromJSON() {
  try {
    const response = await fetch("./bd/dados.json");
    const data = await response.json();
    QUESTIONS = data.quiz;
    // Após carregar as perguntas, popular as páginas
    populateQuestionsToUI();
  } catch (error) {
    console.error("Erro ao carregar perguntas:", error);
  }
}

// Carregar as perguntas ao iniciar
loadQuestionsFromJSON();

/* ==========================================
   ESTADO DO QUIZ
========================================== */

let playerName = "";
let playerAnswers = {};
let score = 0;

/* ==========================================
   ELEMENTOS
========================================== */

const pages = document.querySelectorAll(".page");

const homePage = document.getElementById("homePage");
const startPage = document.getElementById("startPage");

const quizPage1 = document.getElementById("quizPage1");
const quizPage2 = document.getElementById("quizPage2");
const quizPage3 = document.getElementById("quizPage3");

const resultPage = document.getElementById("resultPage");

const rankingList = document.getElementById("rankingList");

const playerInput = document.getElementById("playerName");

/* ==========================================
   NAVEGAÇÃO
========================================== */

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  animatePage(pageId);
}

/* ==========================================
   ANIMAÇÕES
========================================== */

function animatePage(id) {
  anime({
    targets:
      "#" +
      id +
      " .quiz-container, #" +
      id +
      " .home-container, #" +
      id +
      " .start-container, #" +
      id +
      " .result-container",

    translateY: [50, 0],

    opacity: [0, 1],

    duration: 1200,

    easing: "easeOutExpo",
  });
}

/* ==========================================
   HOME
========================================== */

document.getElementById("enterBtn").addEventListener("click", () => {
  const name = playerInput.value.trim();

  if (name.length < 3) {
    alert("Digite um nome válido.");

    return;
  }

  playerName = name;

  showPage("startPage");
});

/* ==========================================
   START
========================================== */

document.getElementById("startQuizBtn").addEventListener("click", () => {
  showPage("quizPage1");
});

/* ==========================================
   CRIAR QUESTÕES
========================================== */

function createQuestion(question) {
  const template = document.getElementById("questionTemplate");

  const clone = template.content.cloneNode(true);

  clone.querySelector(".question-text").textContent = question.question;

  const answersContainer = clone.querySelector(".answers");

  question.options.forEach((option, index) => {
    const answer = document.createElement("button");

    answer.className = "answer-btn";

    answer.textContent = option;

    answer.addEventListener("click", () => {
      const parent = answer.parentElement;

      parent.querySelectorAll(".answer-btn").forEach((btn) => {
        btn.classList.remove("selected");
      });

      answer.classList.add("selected");

      playerAnswers[question.id] = index;

      updateProgress();
    });

    answersContainer.appendChild(answer);
  });

  return clone;
}

/* ==========================================
   DISTRIBUIÇÃO
========================================== */

function populateQuestionsToUI() {
  const page1 = document.getElementById("questionsPage1");

  const page2 = document.getElementById("questionsPage2");

  const page3 = document.getElementById("questionsPage3");

  QUESTIONS.slice(0, 4).forEach((q) => {
    page1.appendChild(createQuestion(q));
  });

  QUESTIONS.slice(4, 7).forEach((q) => {
    page2.appendChild(createQuestion(q));
  });

  QUESTIONS.slice(7, 10).forEach((q) => {
    page3.appendChild(createQuestion(q));
  });
}

// Será chamada após carregar o JSON

/* ==========================================
   PROGRESSO
========================================== */

function updateProgress() {
  const totalAnswered = Object.keys(playerAnswers).length;

  const percentage = (totalAnswered / 10) * 100;

  document.getElementById("progressBar").style.width = percentage + "%";

  document.getElementById("progressBar2").style.width = percentage + "%";

  document.getElementById("progressBar3").style.width = percentage + "%";
}

/* ==========================================
   VALIDAÇÃO
========================================== */

function validateQuestions(start, end) {
  for (let i = start; i <= end; i++) {
    if (playerAnswers[i] === undefined) {
      return false;
    }
  }

  return true;
}

/* ==========================================
   PAGINA 1
========================================== */

document.getElementById("toPage2").addEventListener("click", () => {
  if (!validateQuestions(1, 4)) {
    alert("Responda todas as perguntas.");

    return;
  }

  showPage("quizPage2");
});

/* ==========================================
   PAGINA 2
========================================== */

document.getElementById("toPage3").addEventListener("click", () => {
  if (!validateQuestions(5, 7)) {
    alert("Responda todas as perguntas.");

    return;
  }

  showPage("quizPage3");
});

/* ==========================================
   FINALIZAR
========================================== */

document.getElementById("finishQuizBtn").addEventListener("click", () => {
  if (!validateQuestions(8, 10)) {
    alert("Responda todas as perguntas.");

    return;
  }

  finishQuiz();
});

/* ==========================================
   RESULTADO
========================================== */

function finishQuiz() {
  score = 0;

  QUESTIONS.forEach((q) => {
    if (playerAnswers[q.id] === q.correct) {
      score++;
    }
  });

  const wrong = 10 - score;

  document.getElementById("correctAnswers").textContent = score;

  document.getElementById("wrongAnswers").textContent = wrong;

  const survival = document.getElementById("survivalMessage");

  if (score >= 8) {
    survival.innerHTML = "🚀 Você sobreviveria à invasão alienígena!";
  } else if (score >= 5) {
    survival.innerHTML = "🛸 Você teria chances de sobreviver.";
  } else {
    survival.innerHTML = "☠️ Você provavelmente seria capturado.";
  }

  saveRanking();

  showPage("resultPage");

  createChart(score, wrong);
}

/* ==========================================
   GRÁFICO
========================================== */

let chartInstance = null;

function createChart(correct, wrong) {
  const ctx = document.getElementById("resultChart");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["Acertos", "Erros"],

      datasets: [
        {
          data: [correct, wrong],

          backgroundColor: ["#00ff88", "#ff4444"],
        },
      ],
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
    },
  });
}

/* ==========================================
   RANKING
========================================== */

function saveRanking() {
  let ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  ranking.push({
    name: playerName,

    score: score,
  });

  ranking.sort((a, b) => b.score - a.score);

  localStorage.setItem(
    "nebulaRanking",

    JSON.stringify(ranking),
  );

  loadRanking();
}

function loadRanking() {
  let ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  rankingList.innerHTML = "";

  ranking.slice(0, 10).forEach((player, index) => {
    const li = document.createElement("li");

    li.innerHTML = `${index + 1} - ${player.name} (${player.score}/10)`;

    rankingList.appendChild(li);
  });
}

loadRanking();

/* ==========================================
   TRY AGAIN
========================================== */

document.getElementById("tryAgainBtn").addEventListener("click", () => {
  location.reload();
});

/* ==========================================
   BACKGROUNDS DINÂMICOS
========================================== */

document.documentElement.style.setProperty(
  "--home-bg",
  `url(${VISUAL_CONFIG.homeBackground})`,
);

document.documentElement.style.setProperty(
  "--start-bg",
  `url(${VISUAL_CONFIG.startBackground})`,
);

document.documentElement.style.setProperty(
  "--quiz-bg",
  `url(${VISUAL_CONFIG.quizBackground})`,
);

document.documentElement.style.setProperty(
  "--result-bg",
  `url(${VISUAL_CONFIG.resultBackground})`,
);

/* ==========================================
   ANIMAÇÃO INICIAL
========================================== */

anime({
  targets: ".game-title",

  scale: [0.8, 1],

  duration: 2000,

  direction: "alternate",

  loop: true,

  easing: "easeInOutSine",
});
