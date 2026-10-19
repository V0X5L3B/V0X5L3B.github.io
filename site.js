// The site behind the gate: theme switch and copying the Discord username.
const THEME = 'v0x-theme';
const site = document.getElementById('inside');
const themeBtn = document.getElementById('theme');

function setTheme(theme) {
  site.dataset.theme = theme;
  const next = theme === 'light' ? 'Dark' : 'Light';
  themeBtn.textContent = next;
  themeBtn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} theme`);
}

let saved = 'dark';
try { saved = localStorage.getItem(THEME) === 'light' ? 'light' : 'dark'; } catch (e) {}
setTheme(saved);

themeBtn.addEventListener('click', () => {
  const theme = site.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(theme);
  try { localStorage.setItem(THEME, theme); } catch (e) {}
});

const copyBtn = document.getElementById('copy-discord');
copyBtn.addEventListener('click', async () => {
  const label = copyBtn.textContent;
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    copyBtn.textContent = 'Copied';
  } catch (e) {
    copyBtn.textContent = copyBtn.dataset.copy;
  }
  setTimeout(() => { copyBtn.textContent = label; }, 1600);
});

// Start at the top each time the site is unlocked.
new MutationObserver(() => { if (!site.hidden) window.scrollTo(0, 0); })
  .observe(site, { attributes: true, attributeFilter: ['hidden'] });
