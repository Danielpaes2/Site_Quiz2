// =========================
// NAVE
// =========================

anime({
  targets: ".spaceship",

  translateX: [-800, 0],

  opacity: [0, 1],

  duration: 2000,

  easing: "easeOutExpo",
});

// =========================
// CAIXA DA QUESTÃO
// =========================

anime({
  targets: ".question-box",

  translateX: [800, 0],

  opacity: [0, 1],

  duration: 2000,

  easing: "easeOutExpo",
});

// =========================
// TÍTULO
// =========================

anime({
  targets: ".question-title",

  scale: [0.6, 1],

  opacity: [0, 1],

  duration: 1500,

  delay: 400,
});

// =========================
// FLOAT
// =========================

anime({
  targets: ".spaceship",

  translateY: [-15, 15],

  duration: 3000,

  direction: "alternate",

  loop: true,

  easing: "easeInOutSine",
});
