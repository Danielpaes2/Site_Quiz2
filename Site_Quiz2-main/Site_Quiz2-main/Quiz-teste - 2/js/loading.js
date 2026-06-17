const fill = document.getElementById("loadingFill");

const percent = document.getElementById("loadingPercent");
let progress = 0;

anime({
  targets: ".loading-title",
  scale: [0.8, 1],
  duration: 1500,
  direction: "alternate",
  loop: true,
});

const loading = setInterval(() => {
  progress++;

  fill.style.width = progress + "%";

  percent.innerHTML = progress + "%";

  if (progress >= 100) {
    clearInterval(loading);

    anime({
      targets: ".loading-container",

      opacity: [1, 0],

      duration: 800,

      easing: "easeInExpo",

      complete: () => {
        window.location.href = "home.html";
      },
    });
  }
}, 25);
