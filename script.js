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
