import { translations } from './data.js'
import './style.css'

// State
const supportedLangs = ['en', 'de', 'ml', 'hi'];
const getBrowserLang = () => {
  const browserLang = navigator.language.split('-')[0];
  return supportedLangs.includes(browserLang) ? browserLang : 'en';
};

// Initial state - will be updated by location check if not set manually
let currentLang = localStorage.getItem('lang') || 'en'; // Default to EN first, update later
let isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
let userLocation = { country: 'Unknown', countryCode: 'US', timezone: 'UTC' };

// DOM Elements
const contentElements = {
  'nav-about': (t) => t.nav.about,
  'nav-timeline': (t) => t.nav.timeline,
  'nav-projects': (t) => t.nav.projects,
  'hero-name': (t) => t.hero.name,
  'hero-role': (t) => t.hero.role,
  'hero-sub': (t) => t.hero.sub,
  'about-title': (t) => t.about.title,
  'about-desc': (t) => t.about.desc,
  'lang-title': (t) => t.languages.title,
  'lang-desc': (t) => t.languages.desc,
  'timeline-title': (t) => t.timeline.title,
  'projects-title': (t) => t.projects.title,
  'footer-rights': (t) => t.footer.rights,
  'footer-email': (t) => t.footer.email,
  'current-lang-label': () => currentLang.toUpperCase()
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  updateContent();

  // Theme Toggle Listener
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // System Theme Listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!('theme' in localStorage)) {
      isDark = e.matches;
      applyTheme();
    }
  });

  // Initialize Scroll Animations
  setupScrollAnimations();

  // Geolocation & Time
  initLocationAndTime();
});

// Theme Logic
function applyTheme() {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
}

// Language Logic
// Language Logic
window.switchLang = (lang, btn) => {
  if (lang === currentLang) {
    if (btn) {
      const shaker = btn.querySelector('.shake-wrapper') || btn;
      shaker.classList.remove('animate-shake');
      void shaker.offsetWidth;
      shaker.classList.add('animate-shake');
      setTimeout(() => shaker.classList.remove('animate-shake'), 820);
    }
    return;
  }

  // Visual Anchoring: Find specific element in middle of viewport
  const centerEl = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  const anchor = centerEl ? (centerEl.closest('[id]')) : null;

  // Save both the anchor and its relative position to the viewport top
  let anchorTopOffset = 0;
  if (anchor) {
    anchorTopOffset = anchor.getBoundingClientRect().top;
  }

  // Fallback: Percentage of scroll
  const scrollRatio = window.scrollY / (document.body.scrollHeight - window.innerHeight);

  document.body.classList.add('lang-switching');

  setTimeout(() => {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateContent();

    requestAnimationFrame(() => {
      // Restore Scroll Position
      if (anchor && document.getElementById(anchor.id)) {
        const newAnchor = document.getElementById(anchor.id);
        const newAnchorPos = newAnchor.getBoundingClientRect().top;
        window.scrollBy(0, newAnchorPos - anchorTopOffset);
      } else {
        // Fallback to ratio if anchor is lost
        const newTotalHeight = document.body.scrollHeight - window.innerHeight;
        window.scrollTo(0, scrollRatio * newTotalHeight);
      }

      document.body.classList.remove('lang-switching');
    });
  }, 300);
}

function updateContent() {
  const t = translations[currentLang];

  // Update Text Elements
  for (const [id, getVal] of Object.entries(contentElements)) {
    const el = document.getElementById(id);
    if (el) el.textContent = getVal(t);
  }

  // Update Timeline
  renderTimeline(t.timeline.steps);

  // Update Projects
  renderProjects(t.projects.items);
}

function renderTimeline(steps) {
  const container = document.getElementById('timeline-container');
  container.innerHTML = ''; // Clear

  steps.forEach((step, index) => {
    // Alternating layout for Desktop
    const isEven = index % 2 === 0;

    const item = document.createElement('div');
    // Mobile: Flex row, Dot left. Desktop: Dot center.
    // We use a relative container.
    // Desktop: Left item content is right-aligned and placed left. Right item content is left-aligned and placed right.

    const alignmentClass = isEven
      ? 'md:flex-row-reverse md:text-right'
      : 'md:flex-row md:text-left';

    // Actually, simple structure:
    // Container is flex column generally.
    // Inner Item:
    // Mobile: Padding left.
    // Desktop: width 50%.

    // Let's use specific classes for left/right positioning
    const desktopClasses = isEven
      ? 'md:mr-auto md:pr-12 md:text-right'
      : 'md:ml-auto md:pl-12 md:text-left';

    item.className = `relative z-10 mb-12 flex items-center w-full md:w-1/2 ${desktopClasses}`;
    // Fix: The item itself shouldn't be w-1/2 if we want flex centering?
    // Let's change approach:
    // We append the card to container. Container is the line wrapper.
    // We need to position the card relative to the center line.

    // Better HTML structure for this item:
    // <div class="relative w-full overflow-hidden"> ... </div> ?
    // No, timeline-container is the reference.

    // Let's just generate the inner HTML string with correct classes

    const contentHtml = `
      <div class="relative pl-12 md:pl-0 w-full">
         <!-- Dot -->
         <div class="absolute left-4 md:left-auto ${isEven ? 'md:-right-4' : 'md:-left-4'} top-1 w-4 h-4 bg-brand-accent rounded-full border-4 border-white dark:border-brand-dark z-20 transform -translate-x-1/2 md:translate-x-0"></div>
         
         <!-- Card -->
         <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <span class="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-brand-accent uppercase bg-blue-50 dark:bg-blue-900/30 rounded-full">
              ${step.year}
            </span>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">${step.title}</h3>
            <p class="text-slate-600 dark:text-slate-300 mb-2">${step.desc}</p>
            <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center ${isEven ? 'md:justify-end' : ''}">
               <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               ${step.location}
            </span>
         </div>
      </div>
    `;

    // We need a wrapper to position it left or right on desktop
    // Wait, the logic above for alignmentClass was:
    // If Even (0): Right aligned text? No, usually start left.
    // Let's say Index 0: Left side. Index 1: Right side.

    // Wrapper div
    const wrapper = document.createElement('div');
    // Mobile: w-full. Desktop: w-1/2.
    // If Left: md:mr-auto (pushes to left).
    // If Right: md:ml-auto (pushes to right).

    const posClass = isEven ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8 md:text-left';
    // On mobile, always full width, pl-0.
    // The dot logic needs to handle mobile (left) vs desktop (center).

    const isUpcoming = ['Upcoming', 'Bevorstehend', 'ഉടൻ', 'आगामी'].includes(step.year);
    const opacityClass = isUpcoming ? 'opacity-95' : '';
    const cardFont = isUpcoming ? 'font-mono text-xs md:text-sm' : 'text-slate-600 dark:text-slate-300';
    const tagClass = isUpcoming
      ? 'text-green-500 bg-green-500/10 border-green-500/20'
      : 'text-brand-accent bg-brand-accent/5 border-brand-accent/10';

    // Dot or Spinner
    let dotHtml = `<div class="absolute left-[15px] top-8 w-4 h-4 bg-brand-accent rounded-full border-4 border-white dark:border-brand-dark z-20 ${isEven ? 'md:right-[-9px] md:left-auto' : 'md:left-[-9px]'} transform md:translate-y-0"></div>`;

    if (isUpcoming) {
      dotHtml = `
        <div class="absolute left-[7px] md:${isEven ? 'right-[-17px] left-auto' : 'left-[-17px]'} top-[26px] z-30 flex items-center justify-center w-8 h-8 bg-brand-light dark:bg-brand-dark rounded-full">
          <svg class="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      `;
    }

    const statusBarHtml = isUpcoming ? `
      <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <div class="flex justify-between text-[10px] mb-1 font-mono uppercase tracking-widest text-slate-400">
          <span>Status: Initializing</span>
          <span class="text-green-500">15%</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-700/50 h-1 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full w-[15%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
        </div>
      </div>
    ` : '';

    wrapper.id = `timeline-item-${index}`;
    wrapper.className = `relative mb-12 w-full md:w-1/2 ${isEven ? 'md:mr-auto md:pr-12 md:text-right' : 'md:ml-auto md:pl-12 md:text-left'} pl-12 md:pl-0 ${opacityClass}`;

    wrapper.innerHTML = `
        ${dotHtml}
        <div class="bg-white dark:bg-brand-dark/40 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
            <span class="inline-block mb-3 text-xs font-mono font-bold tracking-tighter uppercase px-2 py-0.5 rounded border ${tagClass}">
              ${step.year}
            </span>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-500 transition-colors uppercase tracking-tight">${step.title}</h3>
            <p class="${cardFont} leading-relaxed mb-4">${step.desc}</p>
             <div class="text-[11px] font-mono text-slate-500 dark:text-slate-500 flex items-center ${isEven ? 'md:justify-end' : ''}">
               <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               ${step.location}
            </div>
            ${statusBarHtml}
        </div>
    `;

    container.appendChild(wrapper);
  });
}

function renderProjects(items) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.id = `project-item-${index}`;
    card.className = 'group relative p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-brand-accent dark:hover:border-brand-accent transition-colors duration-300 overflow-hidden';

    card.innerHTML = `
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-accent transition-colors">${item.title}</h3>
      <p class="text-slate-600 dark:text-slate-300 mb-6">${item.desc}</p>
      <a href="${item.link}" class="inline-flex items-center font-medium text-brand-accent hover:opacity-80 transition-opacity">
        View Project
        <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
      </a>
    `;
    container.appendChild(card);
  });
}

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        entry.target.classList.remove('opacity-0');

        // Remove animation class after it finishes to avoid clashing with hover transforms
        const onAnimationEnd = () => {
          entry.target.classList.remove('animate-fade-in-up');
          entry.target.removeEventListener('animationend', onAnimationEnd);
        };
        entry.target.addEventListener('animationend', onAnimationEnd);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe Section Headings
  document.querySelectorAll('section h2').forEach(el => {
    el.classList.add('opacity-0');
    observer.observe(el);
  });

  // Observe Timeline Container (we can do children individually in render logic too)
  const timelineContainer = document.getElementById('timeline-container');
  if (timelineContainer) observer.observe(timelineContainer);

  // Observe Projects Container
  const projectsContainer = document.getElementById('projects-container');
  if (projectsContainer) observer.observe(projectsContainer);

  // Note: lang-grid itself is not observed to avoid double-animation with its delayed children

  // Observe Elements with .animate-on-scroll class (newly added)
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// Location and Time Logic
async function initLocationAndTime() {
  const timeEl = document.getElementById('widget-time');
  const countryEl = document.getElementById('widget-country');
  const flagEl = document.getElementById('widget-flag');

  try {
    // Check if we already have location stored to avoid API calls on every reload (optional, but good practice)
    // For now, let's fetch always to ensure accuracy.

    // Using ipwho.is as it is free and has fewer restrictions
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) throw new Error('Location fetch failed');
    const data = await response.json();

    if (!data.success) throw new Error(data.message || 'Location lookup failed');

    userLocation = {
      country: data.country,
      countryCode: data.country_code, // e.g., 'DE', 'US', 'IN'
      timezone: data.timezone.id,
      flag: getFlagEmoji(data.country_code || 'US')
    };

    // Update UI
    if (countryEl) countryEl.textContent = userLocation.country;
    if (flagEl) flagEl.textContent = userLocation.flag;

    // Default Language Logic (Only if user hasn't manually set it yet)
    if (!localStorage.getItem('lang')) {
      if (userLocation.countryCode === 'DE') {
        window.switchLang('de');
      } else {
        // Default to EN for everywhere else as per requirement
        window.switchLang('en');
      }
    }

  } catch (error) {
    console.error('Location detection failed:', error);
    if (countryEl) countryEl.textContent = 'Earth';
    // Fallback: Use browser language or EN
    if (!localStorage.getItem('lang')) {
      // Just keep default (EN) or logic from before
    }
  }

  // Start Clock
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const timeEl = document.getElementById('widget-time');
  if (!timeEl) return;

  // Use user's timezone if valid, else local system time
  const timeString = new Date().toLocaleTimeString('en-US', {
    // timeZone: userLocation.timezone, // Actually, "local time" typically means the user's local time as perceived by browser
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  timeEl.textContent = timeString;
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
