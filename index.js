/* =====================================================================
   CONFIG
   ===================================================================== */
const WHATSAPP_NUMBER = "919876543210"; // replace with Tripnova's real WhatsApp business number

function waLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* =====================================================================
   THEME TOGGLE (persisted, respects system preference on first visit)
   ===================================================================== */
const root = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
function applyTheme(mode){
  root.setAttribute('data-theme', mode);
  themeIcon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
  localStorage.setItem('tripnova-theme', mode);
}
(function initTheme(){
  const saved = localStorage.getItem('tripnova-theme');
  if(saved){ applyTheme(saved); }
  else{
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();
document.getElementById('themeToggle').addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* =====================================================================
   MOBILE NAV
   ===================================================================== */
const mobileNavToggle = document.getElementById('mobileNavToggle');
const mobileNav = document.getElementById('mobileNav');
mobileNavToggle.addEventListener('click', () => {
  mobileNav.style.display = mobileNav.style.display === 'none' ? 'block' : 'none';
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.style.display = 'none'));

/* =====================================================================
   BOARDING PASS: swap + search
   ===================================================================== */
const fromCity = document.getElementById('fromCity');
const toCity = document.getElementById('toCity');
document.getElementById('swapBtn').addEventListener('click', () => {
  // swap between the two select values where possible
  const fromVal = fromCity.value;
  const toVal = toCity.value;
  const fromHasOption = [...fromCity.options].some(o => o.value === toVal);
  const toHasOption = [...toCity.options].some(o => o.value === fromVal);
  if(fromHasOption && toHasOption){
    fromCity.value = toVal;
    toCity.value = fromVal;
  }
});
document.getElementById('passSearchBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const from = fromCity.value, to = toCity.value;
  const date = document.getElementById('depDate').value || 'flexible dates';
  const travelers = document.getElementById('travelers').value || '1';
  const msg = `Hi Tripnova! I'd like a quote for a trip from ${from} to ${to}, departing ${date}, for ${travelers} traveler(s).`;
  window.open(waLink(msg), '_blank');
});

/* =====================================================================
   PACKAGE ENQUIRE BUTTONS
   ===================================================================== */
document.querySelectorAll('.enquire-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pkg = btn.getAttribute('data-pkg');
    window.open(waLink(`Hi Tripnova! I'm interested in the "${pkg}" package. Could you share more details?`), '_blank');
  });
});

/* =====================================================================
   NAV / FLOAT / CONTACT WHATSAPP LINKS
   ===================================================================== */
const defaultMsg = "Hi Tripnova! I'd like some help planning a trip.";
['navWhatsapp','floatWhatsapp','contactWhatsapp'].forEach(id => {
  const el = document.getElementById(id);
  if(el) el.href = waLink(defaultMsg);
});

/* =====================================================================
   QUERY FORM
   ===================================================================== */
const queryForm = document.getElementById('queryForm');
const formSuccess = document.getElementById('formSuccess');
queryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!queryForm.checkValidity()){
    queryForm.reportValidity();
    return;
  }
  formSuccess.classList.add('show');
  queryForm.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});

document.getElementById('whatsappFormBtn').addEventListener('click', () => {
  const name = document.getElementById('qName').value || 'there';
  const from = document.getElementById('qFrom').value || '(not specified)';
  const to = document.getElementById('qTo').value || '(not specified)';
  const date = document.getElementById('qDate').value || 'flexible dates';
  const travelers = document.getElementById('qTravelers').value || '1';
  const notes = document.getElementById('qMsg').value;
  let msg = `Hi Tripnova! I'm ${name}. I'd like to travel from ${from} to ${to}, around ${date}, for ${travelers} traveler(s).`;
  if(notes) msg += ` Notes: ${notes}`;
  window.open(waLink(msg), '_blank');
});

document.getElementById('newsletterBtn').addEventListener('click', (e) => {
  const input = e.target.previousElementSibling;
  if(input.value && input.checkValidity()){
    input.value = '';
    input.placeholder = 'Subscribed! ✓';
    setTimeout(() => input.placeholder = 'Your email', 3000);
  } else {
    input.reportValidity();
  }
});

/* =====================================================================
   SCROLL REVEAL
   ===================================================================== */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: .15 });
revealEls.forEach(el => io.observe(el));

/* =====================================================================
   ANIMATED COUNTERS
   ===================================================================== */
const counters = document.querySelectorAll('[data-count]');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = el.hasAttribute('data-decimal');
    const divisor = isDecimal ? 10 : 1;
    let current = 0;
    const step = Math.max(target / 60, 1);
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = isDecimal ? (current / divisor).toFixed(1) : Math.floor(current).toLocaleString();
      if(current < target) requestAnimationFrame(tick);
    };
    tick();
    counterIO.unobserve(el);
  });
}, { threshold: .5 });
counters.forEach(el => counterIO.observe(el));

/* =====================================================================
   LIQUID GLASS BOTTOM NAV — active state via scrollspy
   ===================================================================== */
const liquidLinks = document.querySelectorAll('.liquid-nav a');
const spySections = ['top','routes','packages','gallery','query']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const spyIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = entry.target.id;
      liquidLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
spySections.forEach(sec => spyIO.observe(sec));
