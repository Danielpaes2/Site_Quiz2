const scoreText = document.getElementById("scoreText");
const survivalRank = document.getElementById("survivalRank");
const resultMessage = document.getElementById("resultMessage");
const chartPanel = document.querySelector(".chart-panel");
const resultChart = document.getElementById("resultChart");
const profileChart = document.getElementById("profileChart");
const profileIcon = document.getElementById("profileIcon");
const profileTraits = document.getElementById("profileTraits");
let profileChartInstance = null;

const PROFILE_ORDER = ["A", "B", "C", "D"];
const PROFILE_BY_LETTER = {
  A: {
    key: "A",
    name: "Cooperador corajoso",
    icon: "A",
    color: "#ffcf5a",
    aura: "coragem",
    motto: "Escudo erguido, equipe viva.",
    traits: ["Lideranca", "Impulso", "Protecao"],
    description:
      "Valoriza acao e trabalho em equipe, mas pode assumir riscos excessivos quando alguem precisa de ajuda.",
    narrative:
      "Na primeira noite da invasao, voce seria a pessoa chamando sobreviventes pelo radio, dividindo suprimentos e abrindo caminho sob fogo alienigena. Sua coragem manteria o grupo unido, desde que voce lembrasse que um heroi tambem precisa voltar para o abrigo.",
  },
  B: {
    key: "B",
    name: "Sobrevivente cauteloso",
    icon: "B",
    color: "#68d8ff",
    aura: "cautela",
    motto: "Passos baixos, olhos vivos.",
    traits: ["Silencio", "Defesa", "Paciencia"],
    description:
      "Evita erros impulsivos e observa antes de agir, porem pode perder oportunidades importantes se esperar demais.",
    narrative:
      "Voce sobreviveria escolhendo rotas escuras, estoques discretos e esconderijos com saida dupla. Enquanto outros correriam para a luz estranha no ceu, voce estaria contando baterias, ouvindo passos metalicos e esperando o momento certo de se mover.",
  },
  C: {
    key: "C",
    name: "Estrategista analitico",
    icon: "C",
    color: "#35ff8c",
    aura: "estrategia",
    motto: "Calculo frio, fuga quente.",
    traits: ["Leitura", "Adaptacao", "Plano"],
    description:
      "Equilibra riscos e beneficios, aumentando as chances de adaptacao em um cenario imprevisivel.",
    narrative:
      "Voce trataria a invasao como um tabuleiro vivo: mapearia padroes das naves, testaria hipoteses pequenas e mudaria de plano antes que o inimigo entendesse seu ritmo. Sua melhor arma seria transformar informacao em vantagem.",
  },
  D: {
    key: "D",
    name: "Independente pragmatico",
    icon: "D",
    color: "#ff7a90",
    aura: "independencia",
    motto: "Pouco ruido, muita solucao.",
    traits: ["Autonomia", "Improviso", "Foco"],
    description:
      "Confia em si mesmo e em solucoes proprias, mas pode enfrentar dificuldades por agir sozinho.",
    narrative:
      "Voce sobreviveria longe dos grandes grupos, consertando equipamentos com o que tivesse no bolso e criando rotas proprias pela cidade ocupada. Sua independencia seria poderosa, mas aliancas pontuais poderiam transformar uma fuga boa em uma vitoria real.",
  },
};

const SPECIAL_PROFILE = {
  key: "SPECIAL",
  name: "O Adaptador Supremo",
  icon: "?",
  color: "#ffffff",
  aura: "🌟 Resultado Especial Desbloqueavel",
  motto:
    "Os invasores estudam padroes. Voce sobrevive porque nao esta preso a nenhum deles.",
  traits: [
    "Flexibilidade extrema",
    "Excelente adaptacao",
    "Emocao + logica",
    "Solo ou equipe",
    "Sobrevivencia: ⭐⭐⭐⭐⭐",
  ],
  description:
    "Empate entre dois ou mais perfis. Pouquissimas pessoas conseguem alcancar este resultado secreto.",
  narrative:
    "Parabens! Voce desbloqueou o perfil secreto — O Adaptador Supremo. Enquanto a maioria depende de um unico estilo de sobrevivencia, voce demonstra equilibrio entre lideranca, estrategia, cautela e adaptacao. Voce muda sua abordagem conforme a situacao exige, usando a caracteristica certa no momento certo.",
};

function readStorageJSON(key, storage = localStorage) {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Erro ao ler ${key}:`, error);
    return null;
  }
}

function getSavedAnswers() {
  const localAnswers = readStorageJSON("quizAnswers", localStorage);
  const sessionAnswers = readStorageJSON("quizAnswers", sessionStorage);

  if (localAnswers || sessionAnswers) {
    return localAnswers || sessionAnswers || {};
  }

  const lastResult =
    readStorageJSON("lastQuizResult", localStorage) ||
    readStorageJSON("lastQuizResult", sessionStorage);
  const currentAttemptId = localStorage.getItem("currentQuizAttemptId");

  if (!currentAttemptId || lastResult?.attemptId === currentAttemptId) {
    return lastResult?.answers || {};
  }

  return {};
}

function countProfiles(answers) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };

  Object.values(answers || {}).forEach((answer) => {
    const letter = PROFILE_ORDER[Number(answer?.selected)];
    if (letter) counts[letter] += 1;
  });

  return counts;
}

function getDominantProfile(counts) {
  return PROFILE_ORDER.reduce((winner, letter) => {
    if (counts[letter] > counts[winner]) return letter;
    return winner;
  }, "A");
}

function getTopProfiles(counts) {
  const maxCount = Math.max(...Object.values(counts));

  return PROFILE_ORDER.filter((letter) => counts[letter] === maxCount);
}

function buildChosenAnswersJSON(answers, quizData) {
  const ids = Object.keys(answers).sort((a, b) => Number(a) - Number(b));
  const questionMap = new Map((quizData?.quiz || []).map((q) => [q.id, q]));

  return ids.map((id) => {
    const answer = answers[id];
    const questionId = Number(id);
    const question = questionMap.get(questionId);
    const chosenLetter = PROFILE_ORDER[Number(answer.selected)] || "?";

    return {
      perguntaId: questionId,
      pergunta: question?.question ?? "Texto nao disponivel.",
      letraEscolhida: chosenLetter,
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

function saveResultData(data) {
  const stored = readStorageJSON("quizResults") || [];
  const answersJSON = JSON.stringify(data.answers || {});
  const chosenAnswersJSON = JSON.stringify(data.respostasEscolhidas || []);
  const resultJSON = JSON.stringify(data);
  const existingIndex = stored.findIndex(
    (result) => result.attemptId && result.attemptId === data.attemptId,
  );

  if (existingIndex >= 0) {
    stored[existingIndex] = data;
  } else {
    stored.push(data);
  }

  localStorage.setItem("quizAnswers", answersJSON);
  sessionStorage.setItem("quizAnswers", answersJSON);
  localStorage.setItem("respostasEscolhidas", chosenAnswersJSON);
  sessionStorage.setItem("respostasEscolhidas", chosenAnswersJSON);
  localStorage.setItem("respostas_salvas_json", chosenAnswersJSON);
  sessionStorage.setItem("respostas_salvas_json", chosenAnswersJSON);
  localStorage.setItem("quizResult", resultJSON);
  sessionStorage.setItem("quizResult", resultJSON);
  localStorage.setItem("quizResults", JSON.stringify(stored));
  localStorage.setItem("lastQuizResult", resultJSON);
  sessionStorage.setItem("lastQuizResult", resultJSON);
}

function saveProfileRanking(data) {
  const ranking = readStorageJSON("nebulaRanking") || [];
  const currentKey = `${data.player}:${data.profileName}:${data.score}:${data.answered}`;
  const lastSavedKey = localStorage.getItem("lastSavedScoreKey");

  if (!data.player || data.answered === 0 || lastSavedKey === currentKey)
    return;

  const existingIndex = ranking.findIndex(
    (item) => item.name?.toLowerCase() === data.player.toLowerCase(),
  );
  const rankingItem = {
    name: data.player,
    profileLetter: data.profileLetter,
    profileName: data.profileName,
    profileCounts: data.profileCounts,
    score: data.score,
    answered: data.answered,
    isSpecial: Boolean(data.isSpecial),
    date: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    ranking[existingIndex] = rankingItem;
  } else {
    ranking.push(rankingItem);
  }

  ranking.sort((a, b) => {
    if (Boolean(b.isSpecial) !== Boolean(a.isSpecial)) {
      return Number(Boolean(b.isSpecial)) - Number(Boolean(a.isSpecial));
    }

    if ((b.score || 0) !== (a.score || 0))
      return (b.score || 0) - (a.score || 0);
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  localStorage.setItem("nebulaRanking", JSON.stringify(ranking.slice(0, 20)));
  localStorage.setItem("lastSavedScoreKey", currentKey);
}

function renderProfileCard(
  profile,
  chosenCount,
  answeredCount,
  tiedLetters = [],
) {
  const resultCard = document.querySelector(".result-card");

  resultCard?.classList.toggle("is-special-result", profile.key === "SPECIAL");
  survivalRank.textContent = profile.name;
  profileIcon.textContent = profile.icon;
  profileIcon.classList.toggle("pixel-question", profile.key === "SPECIAL");
  profileIcon.style.borderColor = profile.color;
  profileIcon.style.color = profile.color;
  profileIcon.style.boxShadow = `0 0 20px ${profile.color}66, inset 0 0 18px ${profile.color}22`;

  profileTraits.innerHTML = `
    <span class="profile-aura" style="color: ${profile.color}">${profile.aura}</span>
    <strong>${profile.motto}</strong>
    <p>${profile.description}</p>
    <div>${profile.traits.map((trait) => `<em>${trait}</em>`).join("")}</div>
  `;

  if (profile.key === "SPECIAL") {
    scoreText.textContent = `Empate desbloqueado: ${tiedLetters.join(", ")} com ${chosenCount}/${answeredCount} escolhas`;
  } else {
    scoreText.textContent = `Perfil dominante: ${chosenCount}/${answeredCount} escolhas`;
  }

  resultMessage.textContent = profile.narrative;
}

function renderRpgChart(counts, activeLetters, answeredCount) {
  const maxCount = Math.max(...Object.values(counts), 1);

  resultChart.innerHTML = PROFILE_ORDER.map((letter) => {
    const profile = PROFILE_BY_LETTER[letter];
    const count = counts[letter];
    const percentOfQuiz = answeredCount
      ? Math.round((count / answeredCount) * 100)
      : 0;
    const barWidth =
      count === 0 ? 0 : Math.max(8, Math.round((count / maxCount) * 100));
    const activeClass = activeLetters.includes(letter) ? " is-dominant" : "";

    return `
      <article class="rpg-bar${activeClass}" style="--profile-color: ${profile.color}">
        <div class="rpg-bar-head">
          <span class="rpg-letter">${letter}</span>
          <strong>${profile.name}</strong>
          <em>${count}</em>
        </div>
        <div class="rpg-track" aria-hidden="true">
          <span style="width: ${barWidth}%"></span>
        </div>
        <p>${percentOfQuiz}% das escolhas</p>
      </article>
    `;
  }).join("");
}

function renderProfileChart(counts) {
  if (!profileChart) return;

  const labels = PROFILE_ORDER.map((letter) => PROFILE_BY_LETTER[letter].name);
  const data = PROFILE_ORDER.map((letter) => counts[letter]);
  const colors = PROFILE_ORDER.map((letter) => PROFILE_BY_LETTER[letter].color);

  if (profileChartInstance) {
    profileChartInstance.destroy();
    profileChartInstance = null;
  }

  const ctx = profileChart.getContext("2d");
  const radarGradient = ctx.createLinearGradient(0, 0, 0, profileChart.height);
  radarGradient.addColorStop(0, "rgba(255, 209, 102, 0.72)");
  radarGradient.addColorStop(0.45, "rgba(255, 135, 87, 0.45)");
  radarGradient.addColorStop(1, "rgba(38, 172, 255, 0.18)");

  profileChartInstance = new Chart(profileChart, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Perfil RPG",
          data,
          backgroundColor: radarGradient,
          borderColor: "rgba(255, 209, 102, 0.92)",
          borderWidth: 4,
          pointBackgroundColor: colors,
          pointBorderColor: "rgba(255,255,255,0.95)",
          pointBorderWidth: 3,
          pointRadius: 9,
          pointHoverRadius: 12,
          fill: true,
          tension: 0.35,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#d7ecff",
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 13,
              weight: "700",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(6, 10, 28, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#e9f7ff",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          bodyFont: {
            weight: "700",
          },
        },
        title: {
          display: true,
          text: "Radar RPG",
          color: "#91e6ff",
          font: {
            size: 16,
            weight: "800",
          },
          padding: {
            bottom: 14,
          },
        },
      },
      scales: {
        r: {
          angleLines: {
            color: "rgba(255,255,255,0.18)",
          },
          grid: {
            color: "rgba(255,255,255,0.12)",
          },
          pointLabels: {
            color: "#c8e9ff",
            font: {
              size: 13,
              weight: "700",
            },
          },
          ticks: {
            display: false,
            beginAtZero: true,
          },
          suggestedMin: 0,
          suggestedMax: Math.max(...data, 5),
        },
      },
    },
  });
}

async function initResultPage() {
  try {
    const playerName = getPlayerName();
    const savedAnswers = getSavedAnswers();
    const answeredCount = Object.keys(savedAnswers).length;
    const hasAnswers = answeredCount > 0;

    if (!playerName) {
      window.location.href = "home.html";
      return;
    }

    if (!hasAnswers) {
      survivalRank.textContent = "Nenhuma resposta registrada.";
      scoreText.textContent = `${playerName}, complete a missao para liberar seu perfil.`;
      resultMessage.textContent =
        "Volte ao inicio e responda o quiz para gerar sua ficha de sobrevivente.";
      if (chartPanel) chartPanel.style.display = "none";
      return;
    }

    const counts = countProfiles(savedAnswers);
    const topProfiles = getTopProfiles(counts);
    const hasTie = topProfiles.length > 1;
    const dominantLetter = hasTie ? "SPECIAL" : getDominantProfile(counts);
    const profile = hasTie
      ? SPECIAL_PROFILE
      : PROFILE_BY_LETTER[dominantLetter];
    const topCount = hasTie ? counts[topProfiles[0]] : counts[dominantLetter];
    const quizData = await loadQuizData();
    const respostasEscolhidas = buildChosenAnswersJSON(savedAnswers, quizData);
    const resultData = {
      attemptId: localStorage.getItem("currentQuizAttemptId"),
      player: playerName,
      profileLetter: dominantLetter,
      profileName: profile.name,
      profileCounts: counts,
      tiedProfiles: hasTie ? topProfiles : [],
      isSpecial: hasTie,
      answered: answeredCount,
      score: topCount,
      rank: profile.name,
      message: profile.narrative,
      answers: savedAnswers,
      respostasEscolhidas,
      date: new Date().toISOString(),
    };

    renderProfileCard(profile, topCount, answeredCount, topProfiles);
    renderRpgChart(
      counts,
      hasTie ? topProfiles : [dominantLetter],
      answeredCount,
    );
    renderProfileChart(counts);
    saveProfileRanking(resultData);
    saveResultData(resultData);
  } catch (error) {
    console.error("Erro ao inicializar pagina de resultado:", error);
    survivalRank.textContent = "Erro ao carregar resultado.";
    resultMessage.textContent =
      "Ocorreu um problema ao exibir seus resultados. Recarregue a pagina.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initResultPage();
});

function restartQuiz() {
  resetQuiz();
  window.location.href = "home.html";
}
