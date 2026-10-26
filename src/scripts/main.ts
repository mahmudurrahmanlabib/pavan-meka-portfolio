import { site } from '../data/site';

declare global {
  interface Window {
    __ready?: boolean;
  }
}

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canObserve = 'IntersectionObserver' in window;
if (reduceMotion) root.classList.add('no-motion');
window.__ready = true;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* Toast */

const toastEl = document.querySelector<HTMLElement>('.toast');
let toastTimer: number | undefined;

function toast(text: string) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* Copy email: any [data-copy] button, or the C key */

async function copyEmail(trigger?: HTMLElement) {
  try {
    await navigator.clipboard.writeText(site.email);
  } catch {
    window.location.href = `mailto:${site.email}`;
    return;
  }
  toast('Email copied');
  if (trigger?.hasAttribute('data-copy-label')) {
    trigger.textContent = 'Copied';
    setTimeout(() => (trigger.textContent = 'Copy'), 1600);
  }
}

document
  .querySelectorAll<HTMLElement>('[data-copy]')
  .forEach((el) => el.addEventListener('click', () => copyEmail(el)));

const kbd = document.querySelector('kbd');
document.addEventListener('keydown', (e) => {
  if (e.key?.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]')) return;
  kbd?.classList.add('pressed');
  setTimeout(() => kbd?.classList.remove('pressed'), 150);
  copyEmail();
});

/* Local time next to the location */

const clock = document.querySelector<HTMLElement>('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: clock.dataset.tz,
    hour: 'numeric',
    minute: '2-digit',
  });
  const tick = () => (clock.textContent = ` · ${fmt.format(new Date())}`);
  tick();
  setInterval(tick, 30_000);
}

/* Theme: a circle grows out of the toggle where View Transitions are supported */

const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(dark: boolean) {
  if (dark) root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  themeMeta?.setAttribute('content', dark ? '#0d0d0d' : '#ffffff');
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch {}
}

if (root.dataset.theme === 'dark') themeMeta?.setAttribute('content', '#0d0d0d');

toggle?.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  if (!document.startViewTransition || reduceMotion) return setTheme(dark);

  const rect = toggle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document
    .startViewTransition(() => setTheme(dark))
    .ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
});

/* Scroll reveal, staggered per batch, with stat pills counting up */

function countUp(el: HTMLElement, delay: number) {
  const match = (el.dataset.stat ?? '').match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return;
  const [, prefix, number, suffix] = match;
  const target = parseFloat(number);
  const decimals = number.split('.')[1]?.length ?? 0;
  const duration = 1200;

  el.textContent = prefix + (0).toFixed(decimals) + suffix;
  setTimeout(() => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, delay);
}

const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduceMotion || !canObserve) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          const delay = Math.min(i, 6) * 80;
          el.style.setProperty('--d', `${delay}ms`);
          el.classList.add('in');
          el.querySelectorAll<HTMLElement>('[data-stat]').forEach((stat) => countUp(stat, delay + 250));
          io.unobserve(el);
        });
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
}

/* Highlight the nav link for the section being read */

const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
const navTargets = navLinks.map((a) => document.querySelector<HTMLElement>(a.hash));
let navQueued = false;

function updateNav() {
  navQueued = false;
  const line = innerHeight * 0.35;
  const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  let active = -1;
  navTargets.forEach((target, i) => {
    if (target && target.getBoundingClientRect().top <= line) active = i;
  });
  if (atBottom) active = navTargets.length - 1;
  navLinks.forEach((a, i) => a.classList.toggle('active', i === active));
}

addEventListener(
  'scroll',
  () => {
    if (navQueued) return;
    navQueued = true;
    requestAnimationFrame(updateNav);
  },
  { passive: true },
);
updateNav();

/* Contact: the conversation plays out once, with typing dots before each reply */

const chat = document.querySelector<HTMLElement>('[data-chat]');
const turns = chat ? [...chat.querySelectorAll<HTMLElement>('[data-turn]')] : [];

async function playChat() {
  for (const turn of turns) {
    if (turn.hasAttribute('data-typing')) {
      turn.classList.add('is-typing');
      await wait(650);
      turn.classList.remove('is-typing');
    } else {
      await wait(200);
    }
    turn.classList.add('shown');
    await wait(220);
  }
}

if (chat) {
  if (reduceMotion || !canObserve) {
    turns.forEach((turn) => turn.classList.add('shown'));
  } else {
    const chatIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        chatIo.disconnect();
        playChat();
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    chatIo.observe(chat);
  }
}
