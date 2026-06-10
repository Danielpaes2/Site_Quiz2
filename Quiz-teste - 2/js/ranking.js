// =========================
// ESTRELAS
// =========================

const space = document.getElementById("space");

for (let i = 0; i < 200; i++) {
  const star = document.createElement("div");

  star.classList.add("star");

  const size = Math.random() * 3 + 1;

  star.style.width = size + "px";

  star.style.height = size + "px";

  star.style.left = Math.random() * 100 + "vw";

  star.style.top = Math.random() * 100 + "vh";

  star.style.animationDelay = Math.random() * 2 + "s";

  space.appendChild(star);
}

// =========================
// METEOROS
// =========================

function createMeteor() {
  const meteor = document.createElement("div");

  meteor.classList.add("meteor");

  meteor.style.top = Math.random() * 200 + "px";

  document.body.appendChild(meteor);

  setTimeout(() => {
    meteor.remove();
  }, 6000);
}

setInterval(createMeteor, 2500);

// =========================
// RANKING
// =========================

const rankingList = document.getElementById("rankingList");

function medal(pos) {
  if (pos === 0) return "🥇";
  if (pos === 1) return "🥈";
  if (pos === 2) return "🥉";

  return `${pos + 1}º`;
}

function loadRanking() {
  if (!rankingList) return;

  const ranking = JSON.parse(localStorage.getItem("nebulaRanking")) || [];

  rankingList.innerHTML = "";

  ranking.slice(0, 10).forEach((player, index) => {
    const li = document.createElement("li");

    li.innerHTML = `${medal(index)}
 ${player.name}
 (${player.score}/10)`;

    rankingList.appendChild(li);
  });
}

loadRanking();

// =========================
// SALVAR JOGADOR
// =========================

const saveButton = document.getElementById("savePlayer");

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const name = document.getElementById("playerName").value.trim();

    if (name.length < 3) {
      alert("Digite um nome válido.");

      return;
    }

    localStorage.setItem("currentPlayer", name);

    window.location.href = "start.html";
  });
}
