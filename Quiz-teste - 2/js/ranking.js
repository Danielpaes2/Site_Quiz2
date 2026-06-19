const space = document.getElementById("space");
const isCompactScreen = window.matchMedia("(max-width: 768px)").matches;

if (space) {
  const starTotal = isCompactScreen ? 70 : 150;

  for (let i = 0; i < starTotal; i++) {
    const star = document.createElement("div");
    const size = Math.random() * 2.5 + 1;

    star.classList.add("star");
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDelay = `${Math.random() * 2}s`;

    space.appendChild(star);
  }
}

function createMeteor() {
  const meteor = document.createElement("div");

  meteor.classList.add("meteor");
  meteor.style.top = `${Math.random() * window.innerHeight}px`;
  meteor.style.opacity = "0.92";

  document.body.appendChild(meteor);

  setTimeout(() => {
    meteor.remove();
  }, 7000);
}

setInterval(createMeteor, 2600);

const rankingList = document.getElementById("rankingList");
const saveButton = document.getElementById("savePlayer");
const nameInput = document.getElementById("playerName");
const nameError = document.getElementById("nameError");

function medal(position) {
  return String(position + 1).padStart(2, "0");
}

function loadRanking() {
  if (!rankingList) return;

  const ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-ranking";
    li.textContent = "Seja o primeiro comandante do ranking.";
    rankingList.appendChild(li);
    return;
  }

  ranking.slice(0, 10).forEach((player, index) => {
    const li = document.createElement("li");
    const profile = player.profileName || "Perfil antigo";
    const badge = player.isSpecial
      ? "SECRETO"
      : player.profileLetter || `${player.score || 0}/10`;
    const scoreText = player.profileName
      ? `${badge} · ${player.score || 0}/${player.answered || 10}`
      : `${player.score || 0}/10`;

    if (player.isSpecial) li.classList.add("ranking-special");

    li.innerHTML = `
      <span>${medal(index)}</span>
      <strong>${player.name}<small>${profile}</small></strong>
      <em>${scoreText}</em>
    `;

    rankingList.appendChild(li);
  });
}

function startPlayer() {
  const name = nameInput.value.trim();

  if (name.length < 2) {
    nameError.textContent = "Digite seu nome para entrar no quiz.";
    nameInput.focus();
    return;
  }

  const ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];
  const duplicate = ranking.some(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );

  if (duplicate) {
    nameError.textContent =
      "Este nome já está no ranking. Use outro nome para continuar.";
    nameInput.focus();
    return;
  }

  localStorage.setItem("currentPlayer", name);
  localStorage.setItem(
    "currentQuizAttemptId",
    window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  localStorage.removeItem("quizAnswers");
  localStorage.removeItem("quizProgress");
  localStorage.removeItem("quizResult");
  localStorage.removeItem("lastQuizResult");
  localStorage.removeItem("respostasEscolhidas");
  localStorage.removeItem("respostas_salvas_json");
  localStorage.removeItem("lastSavedScoreKey");
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");
  sessionStorage.removeItem("lastQuizResult");
  sessionStorage.removeItem("respostasEscolhidas");
  sessionStorage.removeItem("respostas_salvas_json");

  window.location.href = "start.html";
}

loadRanking();

if (saveButton && nameInput) {
  saveButton.addEventListener("click", startPlayer);

  nameInput.addEventListener("input", () => {
    nameError.textContent = "";
  });

  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") startPlayer();
  });
}
