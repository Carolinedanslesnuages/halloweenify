/**
 * src/halloweenify.ts
 *
 * Package Halloweenify : Thème de décoration minimaliste et configurable.
 * Inclut une bulle d'aide pour le logo déplaçable.
 * * [VERSION 4 - THÈME "PUMPKIN ORANGE" + SURCHARGE HEADER/FOOTER]
 */

export type LogoPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type HalloweenifyOptions = {
  force?: boolean;
  startDate?: string;
  endDate?: string;
  backgroundTexturePath?: string | null;
  overlayLogoPath?: string | null;
  faviconPath?: string | null;
  spiderOpacity?: number;
  logoPosition?: LogoPosition;
  enableWebs?: boolean;
  enableCursor?: boolean;
  enableLogo?: boolean;
  enableTitleEmoji?: boolean;
  enableScrollbar?: boolean;
  enableConsoleMessage?: boolean;
  enableGhostLinks?: boolean;
  enableFont?: boolean;
  enableFavicon?: boolean;
  enableUserToggle?: boolean;
  showDragHint?: boolean;
  exposeCleanup?: boolean;
};

// --- Constantes ---
const STYLE_ID = 'spooky-style';
const LOGO_ID = 'spooky-overlay-logo';
const GHOST_LINK_ID = 'spooky-ghost-link';
const CLEANUP_FN = '__halloweenify_remove';
const DEFAULT_FAVICON_ID = 'spooky-original-favicon';
const USER_DISABLE_KEY = 'halloweenify_disabled_until';
const TOGGLE_BUTTON_ID = 'spooky-toggle-button';
const HINT_BUBBLE_ID = 'spooky-hint-bubble';
const THEME_COLOR_META_ID = 'spooky-theme-color';

// --- Variables globales ---
let isDragging = false;
let dragTarget: HTMLElement | null = null;
let offsetX = 0;
let offsetY = 0;
let originalTitle: string | null = null;
let originalFaviconHref: string | null = null;
let ghostLinkElement: HTMLDivElement | null = null;
let ghostLinkListenerAttached = false;
let hintBubbleTimeout: ReturnType<typeof setTimeout> | null = null;

// --- Fonctions utilitaires ---

function isWithinSpookyDateRange(startDateStr?: string, endDateStr?: string): boolean {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const defaultStartMonth = 9; // Octobre
  const defaultStartDate = 31;
  const defaultEndMonth = 9;
  const defaultEndDate = 31;

  let startMonth = defaultStartMonth;
  let startDate = defaultStartDate;
  let endMonth = defaultEndMonth;
  let endDate = defaultEndDate;

  const parseDate = (dateStr: string | undefined | null): { month: number, day: number } | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      if (!isNaN(month) && !isNaN(day) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { month, day };
      }
    }
    return null;
  };

  const parsedStart = parseDate(startDateStr);
  const parsedEnd = parseDate(endDateStr);

  if (parsedStart) {
    startMonth = parsedStart.month;
    startDate = parsedStart.day;
  }
  if (parsedEnd) {
    endMonth = parsedEnd.month;
    endDate = parsedEnd.day;
  } else if (parsedStart) {
    endMonth = startMonth;
    endDate = startDate;
  }

  if (startMonth === endMonth) {
    return currentMonth === startMonth && currentDate >= startDate && currentDate <= endDate;
  } else if (startMonth < endMonth) {
    return (currentMonth === startMonth && currentDate >= startDate) ||
           (currentMonth > startMonth && currentMonth < endMonth) ||
           (currentMonth === endMonth && currentDate <= endDate);
  } else {
     return (currentMonth === startMonth && currentDate >= startDate) ||
            (currentMonth > startMonth) ||
            (currentMonth < endMonth) ||
            (currentMonth === endMonth && currentDate <= endDate);
  }
}

function urlHasSpookyFlag(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('spooky') === 'true';
  } catch {
    return false;
  }
}

function makeSpiderWebDataUri(): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g stroke='%23888' stroke-width='.5' fill='none'><circle cx='50' cy='50' r='36'/><path d='M50 14V86M14 50H86M26 24L74 76M74 24L26 76'/><circle cx='50' cy='50' r='4' stroke='%23777' stroke-width='.6'/></g></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeEmojiCursorUri(emoji: string, size = 32): string {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewport='0 0 ${size} ${size}'><text x='0' y='${size * 0.8}' font-size='${size * 0.9}px'>${emoji}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function isThemeDisabledByUser(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return false;
    try {
        const disabledUntilStr = localStorage.getItem(USER_DISABLE_KEY);
        if (!disabledUntilStr) return false;
        const disabledUntilTimestamp = parseInt(disabledUntilStr, 10);
        if (isNaN(disabledUntilTimestamp)) {
            localStorage.removeItem(USER_DISABLE_KEY);
            return false;
        }
        return Date.now() < disabledUntilTimestamp;
    } catch (e) {
        console.error("Halloweenify: Error accessing localStorage.", e);
        return false;
    }
}

function disableThemeForToday(): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    try {
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        localStorage.setItem(USER_DISABLE_KEY, endOfToday.getTime().toString());
    } catch (e) {
        console.error("Halloweenify: Error setting localStorage.", e);
    }
}


// --- Fonctions de Drag-and-Drop ---

function handleDragMove(e: MouseEvent) {
  if (!isDragging || !dragTarget) return;
  e.preventDefault();
  const newX = e.clientX - offsetX;
  const newY = e.clientY - offsetY;
  dragTarget.style.left = `${newX}px`;
  dragTarget.style.top = `${newY}px`;
}

function handleDragEnd() {
  if (dragTarget) {
    dragTarget.classList.remove('is-dragging');
  }
  isDragging = false;
  dragTarget = null;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}


// --- Fonctions d'injection et de suppression ---

/**
 * Injecte la balise meta "theme-color" pour la barre de titre mobile
 */
function injectThemeColorMeta(color: string): void {
  if (typeof document === 'undefined') return;
  let meta = document.getElementById(THEME_COLOR_META_ID) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.id = THEME_COLOR_META_ID;
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
}

/**
 * Retire la balise meta "theme-color"
 */
function removeThemeColorMeta(): void {
    if (typeof document === 'undefined') return;
    const meta = document.getElementById(THEME_COLOR_META_ID);
    if (meta?.parentNode) {
        meta.parentNode.removeChild(meta);
    }
}

/**
 * [NOUVEAU THÈME ORANGE]
 * Injecte le CSS du thème dans le <head>
 */
function injectTheme(
  options: Required<Pick<HalloweenifyOptions, 'spiderOpacity' | 'backgroundTexturePath' | 'enableWebs' | 'enableCursor' | 'enableFont' | 'enableScrollbar' | 'enableGhostLinks' | 'logoPosition' | 'enableUserToggle' | 'showDragHint'>>
): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const {
    spiderOpacity,
    backgroundTexturePath,
    enableWebs,
    enableCursor,
    enableFont,
    enableScrollbar,
    enableGhostLinks,
    logoPosition,
    enableUserToggle,
    showDragHint
  } = options;

  const spiderWebUri = makeSpiderWebDataUri();

  const cursorStyle = enableCursor
    ? `cursor: url('${makeEmojiCursorUri('🎃')}') 0 0, auto !important;` // Citrouille
    : '';

  // [NOUVEAU THÈME] Variables CSS pour le mode lumineux "Pumpkin Spice"
  const lightThemeBg = '#FAF8F1'; // Parchemin
  let backgroundAndColorStyles = `
    :root {
      /* Palette "Pumpkin Spice" (Lumineux) */
      --spooky-bg: ${lightThemeBg};
      --spooky-text: #222222;       /* Gris foncé (Contraste 17:1) */
      --spooky-heading: #D95B00;    /* Orange foncé (Contraste 5.4:1) */
      --spooky-link: #5D3A9B;       /* Violet (Contraste 5.3:1) */

      /* Composants */
      --spooky-scrollbar-track: #e0ddd5;
      --spooky-scrollbar-thumb: var(--spooky-heading);
      --spooky-scrollbar-border: var(--spooky-bg);
      
      --spooky-toggle-bg: #D95B00;
      --spooky-toggle-text: #FFFFFF;
      --spooky-toggle-hover-bg: #FFA500;
      --spooky-toggle-hover-text: #000000;

      --spooky-hint-bg: #333333;
      --spooky-hint-text: #FFFFFF;
      --spooky-hint-border: var(--spooky-heading);

      --spooky-logo-border: var(--spooky-heading);
    }
    
    html, body { 
      background-color: var(--spooky-bg) !important; 
      color: var(--spooky-text) !important; 
    }
    h1, h2, h3 { 
      color: var(--spooky-heading) !important; 
    }
    a { 
      color: var(--spooky-link) !important; 
      text-decoration: underline dotted rgba(0,0,0,0.3);
    }
  `;
  
  injectThemeColorMeta(lightThemeBg);

  if (backgroundTexturePath) {
    // [NOUVEAU THÈME] Mode Texturé "Midnight Pumpkin"
    const darkThemeBg = '#181818'; // Nuit
    backgroundAndColorStyles = `
    :root {
      /* Palette "Midnight Pumpkin" (Sombre) */
      --spooky-bg: ${darkThemeBg};
      --spooky-text: #E0E0E0;         /* Gris spectral (Contraste 15:1) */
      --spooky-heading: #FFA500;      /* Orange Vif (Contraste 11.7:1) */
      --spooky-link: #C490FF;         /* Violet clair (Contraste 7.5:1) */

      /* Composants */
      --spooky-scrollbar-track: #222222;
      --spooky-scrollbar-thumb: var(--spooky-heading);
      --spooky-scrollbar-border: var(--spooky-bg);
      
      --spooky-toggle-bg: #FFA500;
      --spooky-toggle-text: #000000; /* Contraste 5.1:1 */
      --spooky-toggle-hover-bg: #FFC500;
      --spooky-toggle-hover-text: #000000;

      --spooky-hint-bg: #E0E0E0;
      --spooky-hint-text: ${darkThemeBg};
      --spooky-hint-border: var(--spooky-heading);

      --spooky-logo-border: var(--spooky-heading);
    }

    html, body {
      background-color: var(--spooky-bg) !important; /* Couleur de repli */
      background-image: url("${backgroundTexturePath}") !important;
      background-repeat: tile !important;
      color: var(--spooky-text) !important;
    }
    h1, h2, h3 { 
      color: var(--spooky-heading) !important; 
    }
    a { 
      color: var(--spooky-link) !important; 
      text-decoration: underline dashed rgba(196, 144, 255, 0.25); 
    }
    `;
    
    injectThemeColorMeta(darkThemeBg);
  }

  const fontStyles = enableFont ? `
@import url('https://fonts.googleapis.com/css2?family=Creepster&display.swap');
h1, h2, h3 { 
  font-family: 'Creepster', cursive !important; 
  letter-spacing: 0.5px; 
  color: var(--spooky-heading) !important;
}
` : `
h1, h2, h3 { 
  color: var(--spooky-heading) !important; 
}
`;

  const websStyle = enableWebs ? `
/* Toiles d'araignée */
body::before, body::after {
  content: ''; position: fixed; width: 300px; height: 300px;
  background-image: url("${spiderWebUri}"); background-size: contain; background-repeat: no-repeat;
  opacity: ${Math.max(0, Math.min(1, spiderOpacity))}; pointer-events: none; z-index: 9998;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)); transform: translateY(-8px);
}
body::before { top: 0px; left: 0px; transform: rotate(-8deg) translateY(-8px); }
body::after  { top: 0px; right: 0px; transform: rotate(8deg) translateY(-8px); }
` : '';

  const scrollbarStyle = enableScrollbar ? `
/* Scrollbar */
::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-track { background: var(--spooky-scrollbar-track); }
::-webkit-scrollbar-thumb {
  background-color: var(--spooky-scrollbar-thumb); border-radius: 6px;
  border: 2px solid var(--spooky-scrollbar-border);
}
* { scrollbar-width: thin; scrollbar-color: var(--spooky-scrollbar-thumb) var(--spooky-scrollbar-track); }
` : '';

 const ghostLinkStyle = enableGhostLinks ? `
  /* Ghost Link */
  #${GHOST_LINK_ID} {
    position: fixed; font-size: 20px; pointer-events: none; opacity: 0;
    transition: opacity 0.2s ease-out, transform 0.2s ease-out; z-index: 10001;
    transform: translate(-50%, -100%);
  }
  #${GHOST_LINK_ID}.visible { opacity: 0.8; }
 ` : '';

  // [NOUVEAU] Styles pour surcharger le header et le footer
  const headerFooterOverrideStyle = `
  header, footer {
    color: var(--spooky-text) !important;
  }
  header h1, header h2, header h3,
  footer h1, footer h2, footer h3 {
    color: var(--spooky-heading) !important;
  }
  header a, footer a {
    color: var(--spooky-link) !important;
  }
  `;

  let logoPositionStyle = '';
  let hintTop = '50%';
  let hintLeft = '50%';
  let hintTransform = 'translate(calc(-50% + 220px), -120%)';

  switch(logoPosition) {
    case 'top-left':
      logoPositionStyle = `top: 20px; left: 20px; transform: translate(0, 0);`;
      hintTop = '20px'; hintLeft = '20px'; hintTransform = 'translate(160px, 0)';
      break;
    case 'top-right':
      logoPositionStyle = `top: 20px; right: 20px; left: auto; transform: translate(0, 0);`;
      hintTop = '20px'; hintLeft = 'auto'; hintTransform = 'translate(calc(-100% - 20px), 0)';
      break;
    case 'bottom-left':
      logoPositionStyle = `bottom: 20px; top: auto; left: 20px; transform: translate(0, 0);`;
      hintTop = 'auto'; hintLeft = '20px'; hintTransform = 'translate(160px, -100%)';
      break;
    case 'bottom-right':
      logoPositionStyle = `bottom: 20px; top: auto; right: 20px; left: auto; transform: translate(0, 0);`;
      hintTop = 'auto'; hintLeft = 'auto'; hintTransform = 'translate(calc(-100% - 20px), -100%)';
      break;
    default: // center
      logoPositionStyle = `top: 50%; left: 50%; transform: translate(-50%, -50%);`;
      break;
  }

  // Utilise les variables CSS pour un contraste élevé
  const toggleButtonStyle = enableUserToggle ? `
#${TOGGLE_BUTTON_ID} {
  position: fixed; bottom: 10px; left: 10px;
  background: var(--spooky-toggle-bg);
  color: var(--spooky-toggle-text);
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px; padding: 2px 6px; font-size: 10px; font-family: sans-serif;
  cursor: pointer; z-index: 10002; text-decoration: none; opacity: 0.8;
  transition: opacity 0.2s, background-color 0.2s, color 0.2s;
}
#${TOGGLE_BUTTON_ID}:hover {
  opacity: 1; 
  background: var(--spooky-toggle-hover-bg); 
  color: var(--spooky-toggle-hover-text);
}
` : '';

  // Utilise les variables CSS pour la bulle
  const hintBubbleStyle = showDragHint ? `
#${HINT_BUBBLE_ID} {
    position: fixed; top: ${hintTop}; left: ${hintLeft};
    ${logoPosition === 'top-right' || logoPosition === 'bottom-right' ? 'right: 20px;' : ''}
    ${logoPosition === 'bottom-left' || logoPosition === 'bottom-right' ? 'bottom: 20px;' : ''}
    transform: ${hintTransform}; background-color: var(--spooky-hint-bg);
    color: var(--spooky-hint-text); padding: 8px 12px; border-radius: 5px;
    font-size: 12px; font-family: sans-serif; border: 1px solid var(--spooky-hint-border);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10000; opacity: 1;
    transition: opacity 0.5s ease-out 0.2s; pointer-events: none;
}
#${HINT_BUBBLE_ID}.fade-out { opacity: 0; }
#${HINT_BUBBLE_ID}::after {
  content: ''; position: absolute;
  ${logoPosition.includes('right') ? 'right: -6px;' : 'left: -6px;'}
  ${logoPosition.includes('bottom') ? 'bottom: 10px;' : 'top: 10px;'}
  border-width: 6px; border-style: solid;
  border-color: ${logoPosition.includes('right')
      ? 'transparent transparent transparent var(--spooky-hint-border)'
      : 'transparent var(--spooky-hint-border) transparent transparent'};
}
` : '';


  const css = `
/* halloweenify: THÈME ORANGE (High Contrast) */
${enableFont ? "@import url('https://fonts.googleapis.com/css2?family=Creepster&display.swap');" : ''}

html, body { min-height: 100vh; margin: 0; padding: 0; }

/* Styles de couleur de base (variables définies ci-dessus) */
${backgroundAndColorStyles}

/* Styles communs */
body { ${cursorStyle} }
${fontStyles}
${scrollbarStyle}
${websStyle}
${ghostLinkStyle}

/* [NOUVEAU] Surcharge Header/Footer */
${headerFooterOverrideStyle}

/* Style pour le logo de la sorcière (déplaçable) */
#${LOGO_ID} {
  position: fixed; ${logoPositionStyle}
  width: 90%; max-width: 400px; max-height: 80vh; object-fit: contain;
  z-index: 9997; pointer-events: auto !important; cursor: default; opacity: 0.9;
  filter: drop-shadow(0 4px 15px rgba(0,0,0,0.3)); border: 2px dashed transparent;
  transition: border-color 0.3s ease, left 0.1s linear, top 0.1s linear;
}
/* Utilise la variable à fort contraste pour la bordure */
#${LOGO_ID}.is-draggable { 
  cursor: grab; 
  border-color: var(--spooky-logo-border); 
}
#${LOGO_ID}.is-dragging { 
  cursor: grabbing; opacity: 0.8; z-index: 10000; 
  transition: border-color 0.3s ease; 
}

/* Style pour la bulle d'aide (si activée) */
${hintBubbleStyle}

/* Style pour le bouton toggle (si activée) */
${toggleButtonStyle}
`.trim();

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.type = 'text/css';
  styleEl.appendChild(document.createTextNode(css));

  const head = document.head ?? document.getElementsByTagName('head')[0] ?? document.documentElement;
  head.appendChild(styleEl);
}

// Fonction pour retirer la bulle d'aide
function removeHintBubble(): void {
  if (typeof document === 'undefined') return;
  if (hintBubbleTimeout) {
      clearTimeout(hintBubbleTimeout); // Annule le timer si actif
      hintBubbleTimeout = null;
  }
  const bubble = document.getElementById(HINT_BUBBLE_ID);
  if (bubble?.parentNode) {
    bubble.parentNode.removeChild(bubble);
  }
}

/**
 * Crée et injecte l'image du logo avec la logique de drag-and-drop
 * Ajoute la bulle d'aide
 */
function injectLogoImage(logoPath: string, showHint: boolean): void {
  if (typeof document === 'undefined' || !document.body) return;
  if (document.getElementById(LOGO_ID)) return;

  const imgEl = document.createElement('img');
  imgEl.id = LOGO_ID;
  imgEl.src = logoPath;
  imgEl.alt = "Illustration d'Halloween";

  let isDraggable = false;

  // Injecter la bulle d'aide SI showHint est true
  let hintBubble: HTMLDivElement | null = null;
  if (showHint) {
    hintBubble = document.createElement('div');
    hintBubble.id = HINT_BUBBLE_ID;
    hintBubble.textContent = 'JOYEUX HALLOWEEN ! Double-cliquez pour me déplacer !';
    hintBubble.style.opacity = '1';
    document.body.appendChild(hintBubble);

    // Timer pour faire disparaître la bulle après 5 secondes
    hintBubbleTimeout = setTimeout(() => {
        if (hintBubble) {
            hintBubble.classList.add('fade-out');
            // Supprimer l'élément après la transition CSS (0.5s + 0.2s délai)
            setTimeout(() => removeHintBubble(), 700);
        }
    }, 5000); // 5 secondes
  }

  imgEl.ondblclick = (e) => {
    e.preventDefault();
    isDraggable = !isDraggable;
    imgEl.classList.toggle('is-draggable', isDraggable);
    removeHintBubble();
  };

  // 2. Clic pour commencer le déplacement
  imgEl.onmousedown = (e: MouseEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    // Cache la bulle si l'utilisateur commence à déplacer
    removeHintBubble();

    isDragging = true;
    dragTarget = imgEl;
    imgEl.classList.add('is-dragging');
    
    const rect = imgEl.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    if (imgEl.style.transform.includes('translate')) {
        imgEl.style.top = `${rect.top}px`;
        imgEl.style.left = `${rect.left}px`;
        imgEl.style.transform = 'none';
        imgEl.style.right = 'auto';
        imgEl.style.bottom = 'auto';
    }

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd, { once: true });
  };

  document.body.appendChild(imgEl);
}

/**
 * Gère l'effet "Ghost Link"
 */
function setupGhostLinks(): void {
  if (typeof document === 'undefined' || ghostLinkListenerAttached) return;

  ghostLinkElement = document.createElement('div');
  ghostLinkElement.id = GHOST_LINK_ID;
  ghostLinkElement.textContent = '👻';
  document.body.appendChild(ghostLinkElement);

  const showGhost = (e: MouseEvent) => {
    if (ghostLinkElement) {
        ghostLinkElement.style.left = `${e.clientX}px`;
        ghostLinkElement.style.top = `${e.clientY}px`;
        ghostLinkElement.classList.add('visible');
    }
  };

  const hideGhost = () => {
    if (ghostLinkElement) {
        ghostLinkElement.classList.remove('visible');
    }
  };

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', showGhost);
    link.addEventListener('mouseleave', hideGhost);
  });

  ghostLinkListenerAttached = true;
}

/**
 * Retire l'effet "Ghost Link"
 */
 function removeGhostLinks(): void {
  if (typeof document === 'undefined' || !ghostLinkListenerAttached) return;

  if (ghostLinkElement?.parentNode) {
    ghostLinkElement.parentNode.removeChild(ghostLinkElement);
    ghostLinkElement = null;
  }
  
  ghostLinkListenerAttached = false;
}

/**
 * Change le favicon
 */
function setFavicon(faviconPath: string): void {
  if (typeof document === 'undefined') return;

  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  let head = document.getElementsByTagName('head')[0];

  // Sauvegarde de l'original
  if (link && link.href && !document.getElementById(DEFAULT_FAVICON_ID)) {
    originalFaviconHref = link.href;
    const originalLink = link.cloneNode(true) as HTMLLinkElement;
    originalLink.id = DEFAULT_FAVICON_ID;
    originalLink.setAttribute('data-halloweenify-original', 'true');
    originalLink.style.display = 'none'; // Cache l'original
    head.appendChild(originalLink);
  } else if (!link && !document.getElementById(DEFAULT_FAVICON_ID)) {
      originalFaviconHref = null;
      const placeholder = document.createElement('meta');
      placeholder.id = DEFAULT_FAVICON_ID;
      placeholder.setAttribute('data-halloweenify-original', 'true');
      head.appendChild(placeholder);
  }

  // Crée ou met à jour le lien favicon
  if (!link || link.getAttribute('data-halloweenify-original') === 'true') {
     link = document.createElement('link');
     link.rel = 'shortcut icon';
     head.appendChild(link);
  }

  link.type = 'image/x-icon';
  link.href = faviconPath;
}


/**
 * Restaure le favicon original
 */
function restoreFavicon(): void {
    if (typeof document === 'undefined') return;
    
    const currentFavicon: HTMLLinkElement | null = document.querySelector("link[rel*='icon']:not([data-halloweenify-original])");
    const originalPlaceholder: HTMLElement | null = document.getElementById(DEFAULT_FAVICON_ID);

    if (currentFavicon?.parentNode) {
        currentFavicon.parentNode.removeChild(currentFavicon);
    }

    if (originalPlaceholder) {
        if (originalPlaceholder.nodeName === 'LINK') {
            const originalLink = originalPlaceholder as HTMLLinkElement;
             const newFavicon = document.createElement('link');
             newFavicon.rel = originalLink.rel || 'shortcut icon';
             newFavicon.type = originalLink.type || 'image/x-icon';
             newFavicon.href = originalLink.href;
             document.head.appendChild(newFavicon);
        }
        
        if (originalPlaceholder.parentNode) {
            originalPlaceholder.parentNode.removeChild(originalPlaceholder);
        }
    }
    originalFaviconHref = null;
}


/**
 * Ajoute l'emoji au titre de l'onglet
 */
function setSpookyTitle(): void {
  if (typeof document === 'undefined') return;
  if (originalTitle === null) {
    originalTitle = document.title;
  }
  if (!document.title.startsWith('🎃')) { // [THÈME ORANGE]
    document.title = '🎃 ' + originalTitle;
  }
}

/**
 * Restaure le titre original
 */
function restoreTitle(): void {
  if (typeof document === 'undefined' || originalTitle === null) return;
  document.title = originalTitle;
  originalTitle = null;
}

/**
 * Injecte le bouton toggle
 */
function injectToggleButton(): void {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById(TOGGLE_BUTTON_ID)) return;

    const button = document.createElement('button');
    button.id = TOGGLE_BUTTON_ID;
    button.textContent = '🎃 Désactiver le thème'; // [THÈME ORANGE]
    button.setAttribute('aria-label', 'Disable Halloween theme for today');
    button.onclick = (e) => {
        e.stopPropagation();
        removeHalloweenify();
        disableThemeForToday();
    };
    document.body.appendChild(button);
}

/**
 * Retire le bouton toggle
 */
function removeToggleButton(): void {
    if (typeof document === 'undefined') return;
    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (button?.parentNode) {
        button.parentNode.removeChild(button);
    }
}


/**
 * Retire le thème Halloween précédemment injecté et nettoie tout
 */
export function removeHalloweenify(): void {
  if (typeof document === 'undefined') return;
  
  // Retire CSS, Logo, Toggle Button, Hint Bubble
  const style = document.getElementById(STYLE_ID);
  if (style?.parentNode) style.parentNode.removeChild(style);

  const logoImage = document.getElementById(LOGO_ID);
  if (logoImage?.parentNode) logoImage.parentNode.removeChild(logoImage);

  removeToggleButton();
  removeHintBubble();
  removeThemeColorMeta(); // Nettoie la balise meta

  // Nettoyage des listeners globaux de drag&drop
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  isDragging = false;
  dragTarget = null;

  // Nettoyage des autres fonctionnalités
  removeGhostLinks();
  restoreFavicon();
  restoreTitle();

  // Nettoyage du hook global
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any)[CLEANUP_FN]) {
      try { delete (window as any)[CLEANUP_FN]; } catch { (window as any)[CLEANUP_FN] = undefined; }
    }
  } catch { /* ignore */ }
}

/**
 * Fonction principale du package halloweenify
 */
export default function halloweenify(options: HalloweenifyOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (isThemeDisabledByUser()) {
      console.log('Halloweenify: Theme disabled by user for today.');
      return;
  }

  // Options par défaut
  const defaultOptions: Required<Omit<HalloweenifyOptions, 'force' | 'startDate' | 'endDate' | 'backgroundTexturePath' | 'overlayLogoPath' | 'faviconPath' | 'logoPosition' | 'exposeCleanup' | 'spiderOpacity'>> = {
      enableWebs: true,
      enableCursor: true,
      enableLogo: true,
      enableTitleEmoji: true,
      enableScrollbar: true,
      enableConsoleMessage: true,
      enableGhostLinks: true,
      enableFont: true,
      enableFavicon: true,
      enableUserToggle: true,
      showDragHint: true,
  };

  const finalOptions = { ...defaultOptions, ...options };

  const shouldForce = Boolean(finalOptions.force);
  const shouldApply = shouldForce || urlHasSpookyFlag() || isWithinSpookyDateRange(finalOptions.startDate, finalOptions.endDate);

  if (!shouldApply) return;

  const spiderOpacity = finalOptions.spiderOpacity ?? 0.2;
  const backgroundTexturePath = finalOptions.backgroundTexturePath || null;
  const logoPath = finalOptions.overlayLogoPath || null;
  const faviconPath = finalOptions.faviconPath || null;
  const logoPosition = finalOptions.logoPosition || 'center';

  function run(): void {
    if (finalOptions.enableConsoleMessage) {
      console.log(
        '%c🎃 Happy Halloween from halloweenify! 🎃', // [THÈME ORANGE]
        'color: #FFA500; background: #181818; font-size: 1.2em; padding: 4px; border-radius: 4px; font-weight: bold;'
      );
    }

    // Injecter le CSS (nouveau thème orange)
    injectTheme({
        spiderOpacity,
        backgroundTexturePath,
        enableWebs: finalOptions.enableWebs,
        enableCursor: finalOptions.enableCursor,
        enableFont: finalOptions.enableFont,
        enableScrollbar: finalOptions.enableScrollbar,
        enableGhostLinks: finalOptions.enableGhostLinks,
        logoPosition,
        enableUserToggle: finalOptions.enableUserToggle,
        showDragHint: finalOptions.showDragHint,
    });
    
    // Injecter l'image du logo (et la bulle si activée)
    if (finalOptions.enableLogo && logoPath) {
      injectLogoImage(logoPath, finalOptions.showDragHint);
    }

    if (finalOptions.enableFavicon && faviconPath) { 
      setFavicon(faviconPath);
    }
    
    if (finalOptions.enableTitleEmoji) {
      setSpookyTitle();
    }
    
    if (finalOptions.enableGhostLinks) {
      setupGhostLinks();
    }

    if (finalOptions.enableUserToggle) {
        injectToggleButton();
    }

    if (finalOptions.exposeCleanup) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)[CLEANUP_FN] = removeHalloweenify;
      } catch {
        /* ignore */
      }
    }
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}