const fill = document.getElementById("loadingFill");
const percent = document.getElementById("loadingPercent");
const loadingContainer = document.querySelector(".loading-container");
let progress = 0;

const loading = setInterval(() => {
  progress++;

  fill.style.width = `${progress}%`;
  percent.textContent = `${progress}%`;

  if (progress >= 100) {
    clearInterval(loading);
    loadingContainer.style.transition = "opacity 0.45s ease, transform 0.45s ease";
    loadingContainer.style.opacity = "0";
    loadingContainer.style.transform = "translateY(-10px)";

    setTimeout(() => {
      window.location.href = "home.html";
    }, 450);
  }
}, 18);
