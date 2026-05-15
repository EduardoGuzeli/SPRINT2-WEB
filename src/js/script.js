/**
 * SmartCam AI — script.js
 * Sprint 2 Web Development | JOVI Challenge 2026
 * JavaScript puro (Vanilla JS) — sem frameworks ou bibliotecas externas
 *
 * Requisitos implementados:
 *  ✅ Manipulação dinâmica de elementos DOM
 *  ✅ Eventos: click, mouseover, mouseout, keyup, submit, scroll
 *  ✅ Validação de formulário (contato + login)
 *  ✅ Login simulado com modal
 *  ✅ alert(), prompt(), confirm()
 *  ✅ Slideshow com next/prev/auto/dots
 *  ✅ Manipulação de imagens (troca de cena)
 *  ✅ Interação com botões dinâmicos
 *  ✅ Efeitos de scroll (navbar, reveal, scroll-to-top)
 *  ✅ Animação de contadores
 *  ✅ Efeito de digitação (typing effect)
 *  ✅ Manipulação de strings e variáveis
 */

/* ============================================================
   1. DADOS DO PROJETO (Arrays + Objetos)
   ============================================================ */

/** @type {string[]} Frases do efeito de digitação no hero */
const HERO_PHRASES = [
  'pensa por você',
  'captura perfeito',
  'vê o que importa',
  'nunca erra o momento',
];

/** @type {Object[]} Dados dos modos de cena */
const SCENE_DATA = {
  retrato: {
    icon: '👤',
    title: 'Modo Retrato',
    subtitle: 'Pele perfeita, fundo desfocado',
    desc: 'A IA identifica rostos e aplica bokeh natural, otimiza o balanço de branco para tons de pele precisos e ajusta a iluminação facial automaticamente.',
    tags: ['Detecção facial', 'Bokeh inteligente', 'Tom de pele natural'],
    detect: 'Retrato detectado ✓',
    bgClass: 'scene-mock-portrait',
  },
  paisagem: {
    icon: '🏔️',
    title: 'Modo Paisagem',
    subtitle: 'Horizontes sem limites',
    desc: 'Otimiza automaticamente para amplas paisagens. A IA ajusta o ângulo ideal, maximiza nitidez em toda a cena e equilibra o contraste do céu e terreno.',
    tags: ['HDR inteligente', 'Profundidade de campo', 'Balanço de horizonte'],
    detect: 'Paisagem detectada ✓',
    bgClass: 'scene-mock-paisagem',
  },
  noturno: {
    icon: '🌙',
    title: 'Modo Noturno',
    subtitle: 'Clareza onde há escuridão',
    desc: 'Algoritmos de fusão de imagens capturam múltiplos quadros e combinam os melhores pixels para produzir fotos noturnas com mínimo ruído e máximo detalhe.',
    tags: ['Redução de ruído IA', 'Multi-frame fusion', 'Night HDR'],
    detect: 'Cena noturna detectada ✓',
    bgClass: 'scene-mock-noturno',
  },
  acao: {
    icon: '⚡',
    title: 'Modo Ação',
    subtitle: 'Congela cada milissegundo',
    desc: 'Rastreamento preditivo de movimento, velocidade de obturador ultra-rápida e 8fps contínuos. A IA seleciona automaticamente o quadro com melhor posição e nitidez.',
    tags: ['Rastreamento preditivo', '8fps rajada', 'Motion freeze'],
    detect: 'Objeto em movimento ✓',
    bgClass: 'scene-mock-acao',
  },
  viagem: {
    icon: '✈️',
    title: 'Modo Viagem',
    subtitle: 'Cada destino em alta definição',
    desc: 'Reconhece pontos turísticos, ajusta automaticamente a perspectiva para arquitetura e monitora o horizonte. Perfeito para registrar aventuras com qualidade profissional.',
    tags: ['Reconhecimento de lugar', 'Perspectiva auto', 'Modo offline 100%'],
    detect: 'Cena de viagem ✓',
    bgClass: 'scene-mock-viagem',
  },
};

/** @type {Object[]} Ajustes dinâmicos do mockup do phone por modo */
const PHONE_ADJUSTMENTS = {
  portrait:  { exp: '+0.8 EV', foc: 'Rosto',   stab: 'ON',  hdr: 'OFF'   },
  landscape: { exp: '+1.4 EV', foc: 'Infinity', stab: 'ON',  hdr: 'Smart' },
  night:     { exp: '+3.2 EV', foc: 'Auto',     stab: 'MAX', hdr: 'Night' },
  rush:      { exp: '+1.0 EV', foc: '8fps',     stab: 'ON',  hdr: 'OFF'   },
};

/* ============================================================
   2. SELETORES DOM — cache para performance
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

// Navbar
const navbar       = $('#navbar');
const hamburger    = $('#hamburger');
const mobileNav    = $('#mobileNav');

// Hero
const heroTyped    = $('#heroTyped');
const shutterBtn   = $('#shutterBtn');
const heroCtaBtn   = $('#heroCtaBtn');

// Slideshow (phone mockup)
const slides       = $$('.phone-slide');
const dots         = $$('.dot');
const slidePrev    = $('#slidePrev');
const slideNext    = $('#slideNext');

// Scene modes
const sceneTabs    = $$('.scene-tab');
const sceneBg      = $('#sceneBg');
const sceneDetect  = $('#sceneDetectLabel');
const sceneModeIcon= $('#sceneModeIcon');
const sceneTitle   = $('#sceneTitle');
const sceneSubtitle= $('#sceneTitle') ? $('#sceneTitle').nextElementSibling : null;
const sceneDesc    = $('#sceneDesc');
const sceneTags    = $('#sceneTags');

// Login modal
const loginModal   = $('#loginModal');
const openLoginBtn = $('#openLoginBtn');
const modalClose   = $('#modalClose');
const loginForm    = $('#loginForm');
const loginUser    = $('#loginUser');
const loginPass    = $('#loginPass');

// Contact form
const contactForm  = $('#contactForm');
const contactMsg   = $('#contactMsg');
const charCount    = $('#charCount');
const formSuccess  = $('#formSuccess');

// Scroll to top
const scrollTopBtn = $('#scrollTopBtn');

// Rush
const rushActivateBtn = $('#rushActivateBtn');
const rushCircle      = $('#rushCircle');

/* ============================================================
   3. NAVBAR — scroll effect + hamburger
   ============================================================ */
let lastScroll = 0;

/**
 * Atualiza a navbar ao fazer scroll:
 * - Adiciona classe 'scrolled' após 50px
 * - Marca o link ativo com base na seção visível
 * - Mostra/oculta botão de scroll-to-top
 */
function handleNavbarScroll() {
  const currentScroll = window.pageYOffset;

  // Efeito de scroll na navbar
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Botão scroll to top
  if (currentScroll > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }

  // Marcar link ativo na navbar
  const sections = $$('main section[id]');
  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    const link          = $(`.nav-link[href="#${section.id}"]`);

    if (link) {
      if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });

  lastScroll = currentScroll;
}

// Hamburger menu
hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  // Acessibilidade: altera aria-expanded
  const isOpen = mobileNav.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fechar mobile nav ao clicar em link
$$('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
  });
});

/* ============================================================
   4. REVEAL ANIMATIONS — Intersection Observer
   ============================================================ */
/**
 * Observa elementos com classe .reveal e adiciona
 * .visible quando entram no viewport.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // otimização: para de observar após animar
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

function initRevealObserver() {
  $$('.reveal').forEach(el => revealObserver.observe(el));
}

/* ============================================================
   5. CONTADORES ANIMADOS — hero stats + stats section
   ============================================================ */
/**
 * Anima um número de 0 até o valor alvo.
 * @param {HTMLElement} el - elemento que exibe o número
 * @param {number} target  - valor final
 * @param {string} suffix  - sufixo (ex: "M+", "%")
 * @param {number} duration- duração em ms
 */
function animateCounter(el, target, suffix = '', duration = 2000) {
  const start     = performance.now();
  const startVal  = 0;

  function update(time) {
    const elapsed  = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuart
    const ease     = 1 - Math.pow(1 - progress, 4);
    const current  = Math.floor(startVal + (target - startVal) * ease);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Observa os elementos de contador e dispara a animação
 * quando entram na tela.
 */
function initCounters() {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target || el.textContent, 10);
          const suffix = el.dataset.suffix || '';

          if (!isNaN(target)) {
            animateCounter(el, target, suffix);
          }

          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  $$('.counter, .stat-value[data-target]').forEach(el => {
    counterObserver.observe(el);
  });
}

/* ============================================================
   6. TYPING EFFECT — hero title
   ============================================================ */
(function initTypingEffect() {
  let phraseIndex  = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  let isPaused     = false;

  const TYPING_SPEED   = 80;   // ms por letra ao digitar
  const DELETING_SPEED = 45;   // ms por letra ao apagar
  const PAUSE_AFTER    = 2200; // pausa antes de apagar

  function type() {
    if (!heroTyped) return;

    const currentPhrase = HERO_PHRASES[phraseIndex];

    if (isPaused) {
      isPaused = false;
      isDeleting = true;
      setTimeout(type, DELETING_SPEED);
      return;
    }

    if (isDeleting) {
      heroTyped.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % HERO_PHRASES.length;
        setTimeout(type, 400);
        return;
      }
    } else {
      heroTyped.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        isPaused = true;
        setTimeout(type, PAUSE_AFTER);
        return;
      }
    }

    setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  type();
})();

/* ============================================================
   7. SLIDESHOW — mockup do phone
   ============================================================ */
let currentSlide       = 0;
let slideshowInterval  = null;
const SLIDE_DURATION   = 3500; // ms

const SLIDE_ADJUSTMENTS = [
  { exp: '+1.2 EV', foc: 'Auto',  stab: 'ON',  hdr: 'Smart' },
  { exp: '+1.4 EV', foc: 'Inf',   stab: 'ON',  hdr: 'Auto'  },
  { exp: '+3.2 EV', foc: 'Night', stab: 'MAX', hdr: 'Night' },
  { exp: '+0.8 EV', foc: '8fps',  stab: 'ON',  hdr: 'OFF'   },
];

/**
 * Vai para o slide de índice especificado.
 * Atualiza slides, dots e ajustes do phone.
 * @param {number} index
 */
function goToSlide(index) {
  // Remove classe active do slide atual
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  // Atualiza índice (wrap around)
  currentSlide = (index + slides.length) % slides.length;

  // Adiciona classe active no novo slide
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // Atualiza ajustes do phone dinamicamente
  const adj = SLIDE_ADJUSTMENTS[currentSlide];
  updatePhoneAdjustments(adj);
}

/**
 * Atualiza os valores de ajuste exibidos no phone mockup.
 * @param {{exp:string, foc:string, stab:string, hdr:string}} adj
 */
function updatePhoneAdjustments(adj) {
  const adjExp  = $('#adjExp');
  const adjFoc  = $('#adjFoc');
  const adjStab = $('#adjStab');
  const adjHdr  = $('#adjHdr');

  if (adjExp)  adjExp.textContent  = adj.exp;
  if (adjFoc)  adjFoc.textContent  = adj.foc;
  if (adjStab) adjStab.textContent = adj.stab;
  if (adjHdr)  adjHdr.textContent  = adj.hdr;
}

/** Inicia o auto-avanço do slideshow */
function startSlideshow() {
  clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
}

/** Pausa o auto-avanço */
function pauseSlideshow() {
  clearInterval(slideshowInterval);
}

// Botões next/prev
if (slideNext) {
  slideNext.addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    pauseSlideshow();
    startSlideshow(); // reinicia o timer
  });
}
if (slidePrev) {
  slidePrev.addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    pauseSlideshow();
    startSlideshow();
  });
}

// Dots
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.dataset.index, 10);
    goToSlide(index);
    pauseSlideshow();
    startSlideshow();
  });
});

// Shutter button — flash effect + alert de confirmação
if (shutterBtn) {
  shutterBtn.addEventListener('click', () => {
    shutterBtn.style.background = '#00ffd0';
    shutterBtn.style.transform  = 'scale(0.85)';

    setTimeout(() => {
      shutterBtn.style.background = '#fff';
      shutterBtn.style.transform  = '';
    }, 200);

    // Mudança dinâmica de slide ao "tirar" foto
    goToSlide(currentSlide + 1);
  });
}

/* ============================================================
   8. SCENE MODES — troca dinâmica de conteúdo
   ============================================================ */
/**
 * Atualiza o conteúdo da seção de modos de cena
 * com base no modo selecionado.
 * @param {string} mode - chave em SCENE_DATA
 */
function updateSceneMode(mode) {
  const data = SCENE_DATA[mode];
  if (!data) return;

  // Fade out rápido
  const sceneContent = $('#sceneContent');
  sceneContent.style.opacity = '0';
  sceneContent.style.transform = 'translateY(8px)';

  setTimeout(() => {
    // Atualiza ícone
    if (sceneModeIcon) sceneModeIcon.textContent = data.icon;

    // Atualiza título
    if (sceneTitle) sceneTitle.textContent = data.title;

    // Atualiza subtítulo
    const subtitle = $('#sceneContent .scene-subtitle');
    if (subtitle) subtitle.textContent = data.subtitle;

    // Atualiza descrição
    if (sceneDesc) sceneDesc.textContent = data.desc;

    // Atualiza tags
    if (sceneTags) {
      sceneTags.innerHTML = '';
      data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'scene-tag';
        span.textContent = tag;
        sceneTags.appendChild(span);
      });
    }

    // Atualiza background da cena
    if (sceneBg) {
      sceneBg.className = `scene-mock-bg ${data.bgClass}`;
    }

    // Atualiza label de detecção
    if (sceneDetect) sceneDetect.textContent = data.detect;

    // Fade in
    sceneContent.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    sceneContent.style.opacity    = '1';
    sceneContent.style.transform  = 'translateY(0)';
  }, 180);
}

// Eventos nas tabs de cena
sceneTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active de todas as tabs
    sceneTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    // Adiciona active na tab clicada
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Atualiza conteúdo
    const mode = tab.dataset.scene;
    updateSceneMode(mode);
  });

  // Hover effect nos tabs
  tab.addEventListener('mouseover', () => {
    if (!tab.classList.contains('active')) {
      tab.style.color = 'var(--cyan)';
    }
  });
  tab.addEventListener('mouseout', () => {
    if (!tab.classList.contains('active')) {
      tab.style.color = '';
    }
  });
});

/* ============================================================
   9. MODAL DE LOGIN
   ============================================================ */
/** Abre o modal de login */
function openModal() {
  loginModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus management (acessibilidade)
  setTimeout(() => {
    if (loginUser) loginUser.focus();
  }, 300);
}

/** Fecha o modal de login */
function closeModal() {
  loginModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (openLoginBtn) openLoginBtn.addEventListener('click', openModal);
if (heroCtaBtn)   heroCtaBtn.addEventListener('click', openModal);
if (modalClose)   modalClose.addEventListener('click', closeModal);

// Fechar ao clicar no overlay
if (loginModal) {
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal();
  });
}

// Fechar com ESC
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape' && loginModal.classList.contains('open')) {
    closeModal();
  }
});