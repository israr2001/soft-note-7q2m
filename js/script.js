(function () {
  "use strict";

  const landing = document.getElementById("landing");
  const mainSite = document.getElementById("main-site");
  const giftBox = document.getElementById("gift-box");
  const burstLayer = document.getElementById("burst-layer");
  const bgDecor = document.getElementById("bg-decor");
  const cardModal = document.getElementById("card-modal");
  const modalClose = document.getElementById("modal-close");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const easterEgg = document.getElementById("easter-egg");
  const easterModal = document.getElementById("easter-modal");
  const easterClose = document.getElementById("easter-close");
  const surpriseEnBtn = document.getElementById("surprise-en-btn");
  const surpriseEnMsg = document.getElementById("surprise-en-msg");
  const surpriseUrBtn = document.getElementById("surprise-ur-btn");
  const surpriseUrMsg = document.getElementById("surprise-ur-msg");
  const celebrateBtn = document.getElementById("celebrate-btn");
  const replayBtn = document.getElementById("replay-btn");
  const musicToggle = document.getElementById("music-toggle");
  const musicFab = document.getElementById("music-fab");
  const cakeBtn = document.getElementById("cake-btn");
  const bgMusic = document.getElementById("bg-music");
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");

  const englishSurprises = [
    "You are officially allowed extra cake today. ❤️",
    "Your childish side is safe with me. 😄",
    "Another year older, still adorably impossible.",
    "Your smile deserves its own celebration.",
    "Future wife privilege: unlimited teasing. ❤️"
  ];

  const romanUrduSurprises = [
    "Aaj aapka birthday hai, is liye aapko thori extra shararat ki permission hai. ❤️",
    "Aapki muskurahat meri favorite cheezon mein se aik hai.",
    "Future wife ho, is liye tang karna mera haq banta hai. 😄",
    "Allah aapki har dua ko khushi mein badal de. ❤️"
  ];

  let lastEnglish = -1;
  let lastUrdu = -1;
  let eggClicks = 0;
  let musicOn = false;
  let statsAnimated = false;
  let candlesBlown = false;
  let confettiPieces = [];
  let confettiRunning = false;

  const lockScreen = document.getElementById("lock-screen");
  const lockForm = document.getElementById("lock-form");
  const lockInput = document.getElementById("lock-input");
  const lockError = document.getElementById("lock-error");
  const unlockKey = "tayyabaGiftUnlock";
  const giftConfig = window.GIFT_CONFIG || {};
  const accessPassword = String(giftConfig.accessPassword || "").trim().toLowerCase();
  const rememberDays = Number(giftConfig.rememberDays) || 30;

  function isRemembered() {
    try {
      const raw = localStorage.getItem(unlockKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data && data.until && Date.now() < data.until;
    } catch (err) {
      return false;
    }
  }

  function rememberUnlock() {
    const until = Date.now() + rememberDays * 24 * 60 * 60 * 1000;
    localStorage.setItem(unlockKey, JSON.stringify({ until: until }));
  }

  function revealGift() {
    lockScreen.hidden = true;
    landing.hidden = false;
    document.body.classList.add("landing-lock");
    startMusic();
  }

  if (isRemembered()) {
    revealGift();
  } else {
    landing.hidden = true;
    lockScreen.hidden = false;
    document.body.classList.add("landing-lock");
  }

  lockForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const entered = String(lockInput.value || "").trim().toLowerCase();
    if (entered && entered === accessPassword) {
      lockError.hidden = true;
      rememberUnlock();
      revealGift();
      return;
    }
    lockError.hidden = false;
    lockInput.value = "";
    lockInput.classList.add("is-wrong");
    lockInput.focus();
    setTimeout(function () { lockInput.classList.remove("is-wrong"); }, 450);
  });

  spawnBackgroundDecor();
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  function buzz(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (err) {}
    }
  }

  // Little hearts wherever she taps.
  const tapEmojis = ["💗", "✨", "🌸", "💫"];
  document.addEventListener("pointerdown", function (event) {
    if (!lockScreen.hidden) return;
    for (let i = 0; i < 3; i += 1) {
      const el = document.createElement("span");
      el.className = "tap-heart";
      el.textContent = tapEmojis[Math.floor(Math.random() * tapEmojis.length)];
      el.style.left = event.clientX + "px";
      el.style.top = event.clientY + "px";
      el.style.setProperty("--x", (Math.random() * 70 - 35) + "px");
      el.style.setProperty("--r", (Math.random() * 50 - 25) + "deg");
      el.style.animationDelay = (i * 0.07) + "s";
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 1300);
    }
  }, { passive: true });

  // Scroll progress bar for the main site.
  const progressBar = document.querySelector("#scroll-progress i");
  window.addEventListener("scroll", function () {
    if (!progressBar || mainSite.hidden) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progressBar.style.width = (ratio * 100) + "%";
  }, { passive: true });

  giftBox.addEventListener("click", openGift);
  replayBtn.addEventListener("click", replaySurprise);
  celebrateBtn.addEventListener("click", function () {
    buzz([15, 30, 15]);
    launchConfetti(140);
    burstHearts();
  });

  document.querySelectorAll(".balloon").forEach(function (balloon) {
    balloon.addEventListener("click", function () {
      if (balloon.classList.contains("popped")) return;
      balloon.classList.add("popped");
      buzz(20);
      popBalloonBits(balloon);
      setTimeout(function () { balloon.hidden = true; }, 500);
    });
  });

  if (cakeBtn) {
    cakeBtn.addEventListener("click", function () {
      if (candlesBlown) return;
      candlesBlown = true;
      cakeBtn.classList.add("is-blown");
      buzz([15, 40, 15]);
      launchConfetti(24);
      spawnClickHearts(cakeBtn);
    });
  }

  document.querySelectorAll(".dash-card").forEach(function (card) {
    card.addEventListener("click", function () {
      const target = document.getElementById(card.getAttribute("data-target"));
      if (!target) return;
      card.classList.add("is-opened");
      modalIcon.textContent = target.getAttribute("data-icon") || "";
      modalTitle.textContent = target.getAttribute("data-title") || "";
      modalBody.innerHTML = target.innerHTML;
      modalBody.lang = target.lang || "en";
      buzz(12);
      showModal(cardModal);
      spawnClickHearts(card);
    });
  });

  modalClose.addEventListener("click", function () { hideModal(cardModal); });
  cardModal.addEventListener("click", function (event) {
    if (event.target === cardModal) hideModal(cardModal);
  });

  surpriseEnBtn.addEventListener("click", function () {
    setSurpriseMessage(surpriseEnMsg, nextUnique(englishSurprises, lastEnglish, function (i) { lastEnglish = i; }));
    spawnClickHearts(surpriseEnBtn);
  });

  surpriseUrBtn.addEventListener("click", function () {
    setSurpriseMessage(surpriseUrMsg, nextUnique(romanUrduSurprises, lastUrdu, function (i) { lastUrdu = i; }));
    spawnClickHearts(surpriseUrBtn);
  });

  easterEgg.addEventListener("click", function () {
    eggClicks += 1;
    easterEgg.textContent = eggClicks >= 5 ? "💗" : "🤍";
    if (eggClicks >= 5) {
      eggClicks = 0;
      showModal(easterModal);
    }
  });

  easterClose.addEventListener("click", function () { hideModal(easterModal); });
  easterModal.addEventListener("click", function (event) {
    if (event.target === easterModal) hideModal(easterModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hideModal(cardModal);
      hideModal(easterModal);
    }
  });

  musicToggle.addEventListener("click", toggleMusic);
  if (musicFab) musicFab.addEventListener("click", toggleMusic);

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.id === "stats" && !statsAnimated) {
          statsAnimated = true;
          animateStats();
        }
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  function openGift() {
    startMusic();
    buzz([15, 30, 15, 30, 30]);
    giftBox.classList.add("is-opening");
    burstHearts();
    launchConfetti(90);

    setTimeout(function () {
      landing.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      landing.style.opacity = "0";
      landing.style.transform = "scale(1.04)";
    }, 700);

    setTimeout(function () {
      landing.hidden = true;
      mainSite.hidden = false;
      document.body.classList.remove("landing-lock");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 1400);
  }

  function replaySurprise() {
    hideModal(cardModal);
    hideModal(easterModal);
    mainSite.hidden = true;
    landing.hidden = false;
    landing.style.opacity = "1";
    landing.style.transform = "none";
    giftBox.classList.remove("is-opening");
    document.body.classList.add("landing-lock");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function showModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function hideModal(modal) {
    modal.hidden = true;
    if (cardModal.hidden && easterModal.hidden) {
      document.body.style.overflow = "";
    }
  }

  function setSurpriseMessage(el, message) {
    el.textContent = message;
    el.classList.remove("is-fresh");
    void el.offsetWidth; // restart the pop animation
    el.classList.add("is-fresh");
  }

  function nextUnique(list, lastIndex, setLast) {
    if (list.length === 1) return list[0];
    let index = lastIndex;
    while (index === lastIndex) {
      index = Math.floor(Math.random() * list.length);
    }
    setLast(index);
    return list[index];
  }

  function spawnBackgroundDecor() {
    const pieces = ["❤️", "✨", "🌸", "⭐", "💗", "✿", "✧"];
    for (let i = 0; i < 22; i += 1) {
      const el = document.createElement("span");
      el.className = "float-item";
      el.textContent = pieces[i % pieces.length];
      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = 12 + Math.random() * 18 + "px";
      el.style.animationDuration = 10 + Math.random() * 16 + "s";
      el.style.animationDelay = (Math.random() * -18) + "s";
      bgDecor.appendChild(el);
    }
  }

  function burstHearts() {
    const hearts = ["❤️", "💗", "✨", "🌸", "⭐", "💫"];
    for (let i = 0; i < 18; i += 1) {
      const el = document.createElement("span");
      el.className = "burst-heart";
      el.textContent = hearts[i % hearts.length];
      const angle = (Math.PI * 2 * i) / 18;
      const distance = 90 + Math.random() * 140;
      el.style.setProperty("--x", Math.cos(angle) * distance + "px");
      el.style.setProperty("--y", Math.sin(angle) * distance + "px");
      burstLayer.appendChild(el);
      setTimeout(function () { el.remove(); }, 1300);
    }
  }

  function spawnClickHearts(button) {
    const rect = button.getBoundingClientRect();
    for (let i = 0; i < 6; i += 1) {
      const el = document.createElement("span");
      el.className = "burst-heart";
      el.textContent = i % 2 === 0 ? "💗" : "✨";
      el.style.left = rect.left + rect.width / 2 + "px";
      el.style.top = rect.top + rect.height / 2 + "px";
      el.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
      el.style.setProperty("--y", (-40 - Math.random() * 90) + "px");
      burstLayer.appendChild(el);
      setTimeout(function () { el.remove(); }, 1200);
    }
  }

  function animateStats() {
    document.querySelectorAll(".stat-number").forEach(function (el) {
      const target = Number(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  let fallbackCtx = null;
  let fallbackNodes = [];

  function setMusicUi(on) {
    musicOn = on;
    musicToggle.setAttribute("aria-pressed", on ? "true" : "false");
    musicToggle.textContent = on ? "🔊 Music On" : "🔇 Music Off";
  }

  function startFallbackMusic() {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (fallbackCtx && fallbackCtx.state !== "closed") {
      if (fallbackCtx.state === "suspended") fallbackCtx.resume();
      setMusicUi(true);
      return;
    }

    fallbackCtx = new AudioContextClass();
    var master = fallbackCtx.createGain();
    master.gain.value = 0.08;
    master.connect(fallbackCtx.destination);

    var notes = [261.63, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63, 293.66];
    var step = 0;

    function playStep() {
      if (!fallbackCtx || fallbackCtx.state === "closed") return;
      var osc = fallbackCtx.createOscillator();
      var gain = fallbackCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[step % notes.length];
      gain.gain.setValueAtTime(0, fallbackCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.9, fallbackCtx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, fallbackCtx.currentTime + 2.4);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      osc.stop(fallbackCtx.currentTime + 2.5);
      step += 1;
      fallbackNodes = [master];
    }

    playStep();
    var timer = window.setInterval(playStep, 900);
    fallbackNodes.push({ stop: function () { window.clearInterval(timer); } });
    setMusicUi(true);
  }

  function stopFallbackMusic() {
    fallbackNodes.forEach(function (node) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (err) {}
    });
    fallbackNodes = [];
    if (fallbackCtx) {
      fallbackCtx.close();
      fallbackCtx = null;
    }
  }

  function startMusic() {
    if (musicOn) return;
    bgMusic.volume = 0.35;
    var playPromise = bgMusic.play();
    if (playPromise && playPromise.then) {
      playPromise.then(function () {
        setMusicUi(true);
      }).catch(function () {
        startFallbackMusic();
      });
      return;
    }
    startFallbackMusic();
  }

  function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    stopFallbackMusic();
    setMusicUi(false);
  }

  function toggleMusic() {
    if (!musicOn) startMusic();
    else stopMusic();
  }

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function launchConfetti(count) {
    const colors = ["#f4c7d9", "#d9c8f0", "#e8c97a", "#ffffff", "#d46a8c", "#ffe4f0"];
    for (let i = 0; i < count; i += 1) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 80,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[i % colors.length],
        speed: 2 + Math.random() * 3.4,
        drift: Math.random() * 2 - 1,
        rotate: Math.random() * 360,
        spin: Math.random() * 8 - 4
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(drawConfetti);
    }
  }

  function drawConfetti(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces = confettiPieces.filter(function (piece) {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotate += piece.spin;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotate * Math.PI) / 180);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
      return piece.y < canvas.height + 40;
    });

    if (confettiPieces.length) {
      requestAnimationFrame(drawConfetti);
    } else {
      confettiRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
})();
