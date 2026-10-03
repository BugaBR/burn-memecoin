/**
 * $BURN - Memecoin Website Logic & Interactions (English Edition)
 * Includes: Particle Canvas (Fire Embers), Web Audio Fire Synthesizer,
 * CA Copy Toast, Interactive Bonding Curve Calculator, Degen Quote Generator & FAQ Accordion.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. RISING FIRE EMBERS PARTICLE SYSTEM
  // ==========================================
  const canvas = document.getElementById('emberCanvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const emberColors = [
    'rgba(255, 69, 0, ',   // Red-orange
    'rgba(255, 140, 0, ',  // Dark orange
    'rgba(255, 180, 0, ',  // Amber gold
    'rgba(255, 215, 0, ',  // Bright yellow
    'rgba(238, 77, 45, '   // Crimson fire
  ];

  class Ember {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10 + Math.random() * 20;
      this.size = Math.random() * 2.8 + 1.2;
      this.speedY = Math.random() * 1.5 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.colorBase = emberColors[Math.floor(Math.random() * emberColors.length)];
      this.alpha = Math.random() * 0.7 + 0.3;
      this.fadeSpeed = Math.random() * 0.003 + 0.002;
      this.oscillation = Math.random() * Math.PI * 2;
      this.oscillationSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
      this.y -= this.speedY;
      this.oscillation += this.oscillationSpeed;
      this.x += this.speedX + Math.sin(this.oscillation) * 0.4;
      this.alpha -= this.fadeSpeed;

      if (this.y < -10 || this.alpha <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.colorBase}${this.alpha})`;
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
      ctx.fill();
    }
  }

  // Create pool of particles
  const particleCount = Math.min(Math.floor(window.innerWidth / 14), 75);
  const embers = Array.from({ length: particleCount }, () => new Ember());

  function animateEmbers() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < embers.length; i++) {
      embers[i].update();
      embers[i].draw();
    }
    requestAnimationFrame(animateEmbers);
  }
  animateEmbers();


  // ==========================================
  // 2. WEB AUDIO API SYNTHESIZER (AMBIENT FIRE & FX)
  // ==========================================
  let audioCtx = null;
  let isFirePlaying = false;
  let fireNoiseNode = null;
  let fireGainNode = null;
  let crackleInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Generate gentle ambient campfire crackle with Web Audio
  function startFireAudio() {
    initAudioContext();
    if (isFirePlaying) return;

    // Buffer of pink-ish noise for whoosh/wind
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04; // low volume
      b6 = white * 0.115926;
    }

    fireNoiseNode = audioCtx.createBufferSource();
    fireNoiseNode.buffer = noiseBuffer;
    fireNoiseNode.loop = true;

    // Filter to simulate low frequency roar
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    fireGainNode = audioCtx.createGain();
    fireGainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

    fireNoiseNode.connect(filter);
    filter.connect(fireGainNode);
    fireGainNode.connect(audioCtx.destination);
    fireNoiseNode.start();

    // Random crackle bursts
    crackleInterval = setInterval(() => {
      if (!isFirePlaying) return;
      if (Math.random() > 0.4) {
        playSingleCrackle();
      }
    }, 180);

    isFirePlaying = true;
    updateAudioUI(true);
  }

  function stopFireAudio() {
    if (fireNoiseNode) {
      try { fireNoiseNode.stop(); } catch (e) {}
      fireNoiseNode.disconnect();
    }
    if (crackleInterval) {
      clearInterval(crackleInterval);
    }
    isFirePlaying = false;
    updateAudioUI(false);
  }

  function playSingleCrackle() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const bandpass = audioCtx.createBiquadFilter();

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200 + Math.random() * 2500, audioCtx.currentTime);
    bandpass.Q.setValueAtTime(3 + Math.random() * 5, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.04 + Math.random() * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.05);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 800, now);

    osc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Play a rewarding futuristic "whoosh / flame igniter" sound effect
  function playIgniteFx() {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const now = audioCtx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Audio Toggle UI Handlers
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');
  const mobileSoundToggle = document.getElementById('mobileSoundToggle');
  const mobileSoundIcon = document.getElementById('mobileSoundIcon');

  function updateAudioUI(playing) {
    if (playing) {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high text-red-500 animate-pulse';
      if (soundText) soundText.textContent = 'Fire On 🔥';
      if (mobileSoundIcon) mobileSoundIcon.className = 'fa-solid fa-volume-high text-red-500';
    } else {
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
      if (soundText) soundText.textContent = 'Sound 🔥';
      if (mobileSoundIcon) mobileSoundIcon.className = 'fa-solid fa-volume-xmark';
    }
  }

  function handleSoundToggle() {
    if (isFirePlaying) {
      stopFireAudio();
    } else {
      startFireAudio();
    }
  }

  if (soundToggleBtn) soundToggleBtn.addEventListener('click', handleSoundToggle);
  if (mobileSoundToggle) mobileSoundToggle.addEventListener('click', handleSoundToggle);


  // ==========================================
  // 3. COPY CONTRACT ADDRESS (CA) & TOAST
  // ==========================================
  const copyCaBtn = document.getElementById('copyCaBtn');
  const caAddressEl = document.getElementById('caAddress');
  const copyBtnText = document.getElementById('copyBtnText');
  const toast = document.getElementById('toastNotification');

  if (copyCaBtn && caAddressEl) {
    copyCaBtn.addEventListener('click', () => {
      const address = caAddressEl.innerText.trim();
      navigator.clipboard.writeText(address).then(() => {
        // Play ignite sound
        playIgniteFx();

        // UI button state feedback
        copyBtnText.innerText = 'Copied! 🔥';
        copyCaBtn.classList.add('bg-emerald-600', 'text-white');
        
        // Show Toast
        toast.classList.add('show');

        setTimeout(() => {
          copyBtnText.innerText = 'Copy CA';
          copyCaBtn.classList.remove('bg-emerald-600', 'text-white');
        }, 2200);

        setTimeout(() => {
          toast.classList.remove('show');
        }, 3500);
      }).catch(err => {
        console.error('Failed to copy CA:', err);
      });
    });
  }


  // ==========================================
  // 4. INTERACTIVE BONDING CURVE CALCULATOR
  // ==========================================
  const solInput = document.getElementById('solInput');
  const burnOutput = document.getElementById('burnOutput');
  const TOKENS_PER_SOL_RATE = 12500000; // Mock rate based on pump.fun tier

  function updateCalculator() {
    if (!solInput || !burnOutput) return;
    const solVal = parseFloat(solInput.value);
    if (isNaN(solVal) || solVal <= 0) {
      burnOutput.innerText = '0';
      return;
    }
    const estimatedBurn = Math.floor(solVal * TOKENS_PER_SOL_RATE);
    // Format to standard English numeric string with commas (e.g. 12,500,000)
    burnOutput.innerText = estimatedBurn.toLocaleString('en-US');
  }

  if (solInput) {
    solInput.addEventListener('input', updateCalculator);
    updateCalculator();
  }


  // ==========================================
  // 5. DEGEN HYPE QUOTE GENERATOR (ENGLISH)
  // ==========================================
  const hypeQuotes = [
    "\"Paper hands turn to ashes. Diamond hands forge diamonds in the fire of $BURN!\"",
    "\"If you can't handle the 100x heat, stay out of the kitchen! 🔥\"",
    "\"Bears tried to short the flame and got roasted on Pump.fun.\"",
    "\"Zero taxes, 100% burn. The unstoppable math of winners heading to Raydium.\"",
    "\"The moon is too cold for us. Our real destination is the solar core! 🚀☀️\"",
    "\"Buy the spark before it turns into an unstoppable wildfire!\"",
    "\"1 SOL into $BURN today or eternal FOMO on your X timeline tomorrow.\""
  ];

  const hypeQuoteEl = document.getElementById('hypeQuote');
  const generateHypeBtn = document.getElementById('generateHypeBtn');
  const soundFxBtn = document.getElementById('soundFxBtn');

  if (generateHypeBtn && hypeQuoteEl) {
    generateHypeBtn.addEventListener('click', () => {
      playIgniteFx();
      hypeQuoteEl.style.opacity = '0';
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * hypeQuotes.length);
        hypeQuoteEl.innerText = hypeQuotes[randomIndex];
        hypeQuoteEl.style.opacity = '1';
      }, 200);
    });
  }

  if (soundFxBtn) {
    soundFxBtn.addEventListener('click', () => {
      playIgniteFx();
      for (let i = 0; i < 5; i++) {
        setTimeout(playSingleCrackle, i * 80);
      }
    });
  }


  // ==========================================
  // 6. ACCORDION FAQ LOGIC
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');
    const icon = questionBtn.querySelector('i');

    questionBtn.addEventListener('click', () => {
      const isOpen = answerDiv.style.maxHeight && answerDiv.style.maxHeight !== '0px';

      // Close all others
      faqItems.forEach(otherItem => {
        const otherAnswer = otherItem.querySelector('.faq-answer');
        const otherIcon = otherItem.querySelector('.faq-question i');
        otherAnswer.style.maxHeight = '0px';
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        otherItem.classList.remove('border-amber-500/80');
      });

      if (!isOpen) {
        answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        item.classList.add('border-amber-500/80');
      }
    });
  });


  // ==========================================
  // 7. MOBILE NAVIGATION MENU
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });

    // Close menu when clicking any nav link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

});

// -------------------------------------------------
// 1. TAB SWITCHING LOGIC
// -------------------------------------------------
const tabButtons = document.querySelectorAll('.pg-tab-btn');
const tabPanes   = document.querySelectorAll('.pg-tab-pane');

function activateTab(targetId) {
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetId);
  });
  tabPanes.forEach(pane => {
    pane.classList.toggle('hidden', pane.id !== targetId);
  });
  localStorage.setItem('burnPlaygroundTab', targetId);
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.target));
});

const savedTab = localStorage.getItem('burnPlaygroundTab');
if (savedTab) {
  activateTab(savedTab);
} else if (tabButtons.length) {
  activateTab(tabButtons[0].dataset.target);
}

// -------------------------------------------------
// 2. BURN THE JEET – WHACK‑A‑MOLE STYLE GAME
// -------------------------------------------------
const whackOverlay   = document.getElementById('whackOverlay');
const whackStartBtn  = document.getElementById('whackStartBtn');
const whackScoreEl   = document.getElementById('whackScore');
const whackTimerEl   = document.getElementById('whackTimer');
const whackTweetBtn  = document.getElementById('whackTweetBtn');

let whackScore = 0;
let whackTime  = 30; // seconds
let whackTimerId = null;
let whackRunning = false;

const TARGETS = [
  {emoji: '🧻',   score: 5},   // paper
  {emoji: '🐻',   score: 15},  // bear
  {emoji: '💎',   score: 30}   // diamond
];

function randomizePits() {
  const pits = document.querySelectorAll('.lava-pit');
  pits.forEach(pit => {
    pit.innerHTML = '';
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const span = document.createElement('span');
    span.className = 'target-item';
    span.textContent = target.emoji;
    span.dataset.score = target.score;
    pit.appendChild(span);
  });
}

function handleWhack(event) {
  if (!whackRunning) return;
  const target = event.currentTarget.querySelector('.target-item');
  if (!target) return;
  const points = Number(target.dataset.score);
  whackScore += points;
  whackScoreEl.textContent = whackScore;
  event.currentTarget.classList.add('hit');
  setTimeout(() => event.currentTarget.classList.remove('hit'), 200);
  playIgniteFx();
  setTimeout(randomizePits, 500);
}

function startWhackGame() {
  whackScore = 0;
  whackTime  = 30;
  whackScoreEl.textContent = whackScore;
  whackTimerEl.textContent = whackTime;
  whackOverlay.classList.add('hidden');
  whackRunning = true;
  const pits = document.querySelectorAll('.lava-pit');
  pits.forEach(pit => pit.addEventListener('click', handleWhack));
  whackTimerId = setInterval(() => {
    whackTime--;
    whackTimerEl.textContent = whackTime;
    if (whackTime <= 0) endWhackGame();
  }, 1000);
  randomizePits();
}

function endWhackGame() {
  whackRunning = false;
  clearInterval(whackTimerId);
  const pits = document.querySelectorAll('.lava-pit');
  pits.forEach(pit => pit.removeEventListener('click', handleWhack));
  const finalOverlay = document.getElementById('whackEndOverlay');
  finalOverlay.querySelector('#finalWhackScore').textContent = whackScore;
  finalOverlay.classList.remove('hidden');
  if (whackTweetBtn) {
    const tweet = encodeURIComponent(`I just scored ${whackScore} in Burn the Jeet! #BurnMemecoin`);
    whackTweetBtn.href = `https://twitter.com/intent/tweet?text=${tweet}`;
  }
}

const whackRestartBtn = document.getElementById('whackRestartBtn');
if (whackRestartBtn) {
  whackRestartBtn.addEventListener('click', () => {
    document.getElementById('whackEndOverlay').classList.add('hidden');
    startWhackGame();
  });
}
if (whackStartBtn) whackStartBtn.addEventListener('click', startWhackGame);

// -------------------------------------------------
// 3. CATCH THE SOL – CANVAS SIDE‑SCROLLER
// -------------------------------------------------
const catchCanvas = document.getElementById('catchCanvas');
const catchCtx    = catchCanvas?.getContext('2d');
const catchOverlay = document.getElementById('catchOverlay');
const catchStartBtn = document.getElementById('catchStartBtn');
const catchScoreEl = document.getElementById('catchScore');
const catchLivesEl = document.getElementById('catchLives');
const catchTweetBtn = document.getElementById('catchTweetBtn');

let catchGame = null;

function initCatchGame() {
  if (!catchCanvas) return null;
  const state = {
    playerX: catchCanvas.width / 2,
    playerY: catchCanvas.height - 30,
    width: 30,
    height: 30,
    speed: 4,
    score: 0,
    lives: 3,
    objects: [],
    lastSpawn: 0,
    running: false,
    keys: {left: false, right: false}
  };

  function drawPlayer() {
    catchCtx.fillStyle = '#ff4500';
    catchCtx.beginPath();
    catchCtx.arc(state.playerX, state.playerY, 15, 0, Math.PI * 2);
    catchCtx.fill();
  }
  function drawObject(obj) {
    catchCtx.fillStyle = obj.color;
    catchCtx.font = '24px sans-serif';
    catchCtx.fillText(obj.emoji, obj.x, obj.y);
  }
  function spawnObject() {
    const types = [
      {emoji: '🟡', points: 10, color: '#ffd700', speed: 2},
      {emoji: '🪣', points: -1, color: '#00bfff', speed: 2.5},
      {emoji: '💧', points: -2, color: '#1e90ff', speed: 3}
    ];
    const choice = types[Math.floor(Math.random() * types.length)];
    state.objects.push({
      x: Math.random() * catchCanvas.width,
      y: -30,
      emoji: choice.emoji,
      points: choice.points,
      color: choice.color,
      speed: choice.speed
    });
  }
  function updateObjects() {
    state.objects.forEach(o => o.y += o.speed);
    state.objects = state.objects.filter(o => o.y < catchCanvas.height + 30);
  }
  function checkCollisions() {
    state.objects.forEach((obj, idx) => {
      const dx = Math.abs(state.playerX - obj.x);
      const dy = Math.abs(state.playerY - obj.y);
      if (dx < 20 && dy < 20) {
        if (obj.points > 0) state.score += obj.points;
        else state.lives += obj.points;
        state.objects.splice(idx, 1);
      }
    });
  }
  function render() {
    catchCtx.clearRect(0, 0, catchCanvas.width, catchCanvas.height);
    drawPlayer();
    state.objects.forEach(drawObject);
  }
  function loop(timestamp) {
    if (!state.running) return;
    const now = timestamp;
    if (!state.lastFrame) state.lastFrame = now;
    const delta = now - state.lastFrame;
    state.lastFrame = now;
    if (now - state.lastSpawn > 800) { spawnObject(); state.lastSpawn = now; }
    if (state.keys.left) state.playerX -= state.speed;
    if (state.keys.right) state.playerX += state.speed;
    state.playerX = Math.max(15, Math.min(catchCanvas.width - 15, state.playerX));
    updateObjects();
    checkCollisions();
    catchScoreEl.textContent = state.score;
    catchLivesEl.textContent = state.lives;
    if (state.lives <= 0) { endCatchGame(state); return; }
    render();
    requestAnimationFrame(loop);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = true;
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = false;
  });
  const leftBtn = document.getElementById('mobileLeftBtn');
  const rightBtn = document.getElementById('mobileRightBtn');
  if (leftBtn) leftBtn.addEventListener('touchstart', () => state.keys.left = true);
  if (rightBtn) rightBtn.addEventListener('touchstart', () => state.keys.right = true);
  if (leftBtn) leftBtn.addEventListener('touchend', () => state.keys.left = false);
  if (rightBtn) rightBtn.addEventListener('touchend', () => state.keys.right = false);

  return {
    start() { state.running = true; state.lastSpawn = performance.now(); state.lastFrame = performance.now(); requestAnimationFrame(loop); },
    stop() { state.running = false; },
    getState() { return {score: state.score, lives: state.lives}; }
  };
}

function startCatchGame() {
  catchOverlay.classList.add('hidden');
  catchGame = initCatchGame();
  catchGame?.start();
}
function endCatchGame(finalState) {
  catchGame?.stop();
  const endOverlay = document.getElementById('catchEndOverlay');
  endOverlay.querySelector('#finalCatchScore').textContent = finalState.score;
  endOverlay.classList.remove('hidden');
  if (catchTweetBtn) {
    const tweet = encodeURIComponent(`I scored ${finalState.score} in Catch the SOL! #BurnMemecoin`);
    catchTweetBtn.href = `https://twitter.com/intent/tweet?text=${tweet}`;
  }
}
const catchRestartBtn = document.getElementById('catchRestartBtn');
if (catchRestartBtn) {
  catchRestartBtn.addEventListener('click', () => {
    document.getElementById('catchEndOverlay').classList.add('hidden');
    startCatchGame();
  });
}
if (catchStartBtn) catchStartBtn.addEventListener('click', startCatchGame);

// -------------------------------------------------
// 4. MEME FORGE – CANVAS IMAGE EDITOR
// -------------------------------------------------
const memeCanvas      = document.getElementById('memeCanvas');
const memeCtx         = memeCanvas?.getContext('2d');
const memeTemplateBtns = document.querySelectorAll('.meme-tpl-btn');
const memeUploadInput = document.getElementById('memeImageUpload');
const memeTopInput    = document.getElementById('memeTopText');
const memeBottomInput = document.getElementById('memeBottomText');
const memeFontSize    = document.getElementById('memeFontSize');
const memeDownloadBtn = document.getElementById('downloadMemeBtn');
const memeTweetBtn    = document.getElementById('tweetMemeBtn');

let currentTemplate = null;
let userImage = null;

function loadTemplate(src) {
  const img = new Image();
  img.onload = () => { currentTemplate = img; drawMeme(); };
  img.src = src;
}
function drawMeme() {
  if (!memeCtx) return;
  const w = memeCanvas.width = 500;
  const h = memeCanvas.height = 500;
  memeCtx.clearRect(0,0,w,h);
  if (currentTemplate) memeCtx.drawImage(currentTemplate,0,0,w,h);
  if (userImage) {
    const ratio = Math.min(w/userImage.width, h/userImage.height);
    const imgW = userImage.width * ratio * 0.8;
    const imgH = userImage.height * ratio * 0.8;
    memeCtx.drawImage(userImage, (w-imgW)/2, (h-imgH)/2, imgW, imgH);
  }
  const fontSize = Number(memeFontSize?.value) || 40;
  memeCtx.font = `${fontSize}px Impact, Arial Black, sans-serif`;
  memeCtx.textAlign = 'center';
  memeCtx.fillStyle = 'white';
  memeCtx.strokeStyle = 'black';
  memeCtx.lineWidth = fontSize * 0.07;
  const drawText = (txt, y) => {
    if (!txt) return;
    memeCtx.fillText(txt.toUpperCase(), w/2, y);
    memeCtx.strokeText(txt.toUpperCase(), w/2, y);
  };
  drawText(memeTopInput?.value, fontSize + 10);
  drawText(memeBottomInput?.value, h - 10);
}

memeTemplateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    memeTemplateBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTemplate(btn.dataset.src);
  });
});
if (memeUploadInput) {
  memeUploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { userImage = img; drawMeme(); };
    img.src = URL.createObjectURL(file);
  });
}
[memeTopInput, memeBottomInput, memeFontSize].forEach(el => {
  if (el) el.addEventListener('input', drawMeme);
});
if (memeDownloadBtn) {
  memeDownloadBtn.addEventListener('click', () => {
    const dataURL = memeCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'burn_meme.png';
    a.click();
  });
}
if (memeTweetBtn) {
  memeTweetBtn.addEventListener('click', () => {
    const tweet = encodeURIComponent('Check out my $BURN meme! #BurnMemecoin');
    memeTweetBtn.href = `https://twitter.com/intent/tweet?text=${tweet}`;
  });
}

// -------------------------------------------------
// 5. HALL OF FLAME – GALLERY LIGHTBOX
// -------------------------------------------------
const galleryModal   = document.getElementById('galleryModal');
const modalImg       = document.getElementById('galleryImg');
const modalTitle     = document.getElementById('galleryTitle');
const modalDesc      = document.getElementById('galleryDesc');
const modalCloseBtn  = document.getElementById('closeGalleryModal');

document.querySelectorAll('.gallery-trigger').forEach(el => {
  el.addEventListener('click', () => {
    const src   = el.dataset.src;
    const title = el.dataset.title || '';
    const desc  = el.dataset.desc  || '';
    if (modalImg) modalImg.src = src;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    galleryModal?.classList.remove('hidden');
  });
});
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => galleryModal?.classList.add('hidden'));
}
if (galleryModal) {
  galleryModal.addEventListener('click', e => {
    if (e.target === galleryModal) galleryModal.classList.add('hidden');
  });
}

// -------------------------------------------------
// 6. SOUNDBOARD – PLAY PRE‑LOADED SOUNDS
// -------------------------------------------------
const soundboardButtons = document.querySelectorAll('.soundboard-btn[data-sound]');
const soundBuffers = {};
function loadSound(name, url) {
  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { soundBuffers[name] = decoded; })
    .catch(console.error);
}
// Add placeholder URLs – replace with real .wav files in assets/ if desired
loadSound('flamethrower', 'assets/flamethrower.wav');
loadSound('paperhand',    'assets/paperhand.wav');
loadSound('airhorn',      'assets/airhorn.wav');
loadSound('solana',       'assets/solana.wav');
loadSound('chaching',     'assets/chaching.wav');
loadSound('rocket',       'assets/rocket.wav');
function playSound(name) {
  if (!audioCtx || !soundBuffers[name]) return;
  const source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[name];
  source.connect(audioCtx.destination);
  source.start();
}
soundboardButtons.forEach(btn => {
  const snd = btn.dataset.sound;
  btn.addEventListener('click', () => {
    initAudioContext();
    playSound(snd);
  });
});
