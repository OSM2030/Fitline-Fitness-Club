// FitLine Fitness Club — script.js
// Backend: Formspree + Google Sheets + Make.com (all free)

// ─── CHANGE ONLY THESE TWO LINES ───────────────────────────────
const FORMSPREE_ID = 'xzdwbyzj';  // from formspree.io after signup
const WA_NUMBER    = '919665197143';        // keep as-is (country code + number)
// ────────────────────────────────────────────────────────────────

// ── THEME TOGGLE ──
const html  = document.documentElement;
const saved = localStorage.getItem('fl-theme') || 'light';
html.setAttribute('data-theme', saved);

function applyThemeIcons(theme) {
  ['iconSun','iconSunM'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = theme === 'light' ? 'block' : 'none';
  });
  ['iconMoon','iconMoonM'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = theme === 'dark' ? 'block' : 'none';
  });
}
applyThemeIcons(saved);

function toggleTheme() {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('fl-theme', next);
  applyThemeIcons(next);
}
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('themeToggleMob')?.addEventListener('click', toggleTheme);

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) navLinks?.classList.remove('open');
});

// ── DIET TABS ──
document.querySelectorAll('.dtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.diet-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('dp-' + tab.dataset.tab)?.classList.add('active');
  });
});
const goalParam = new URLSearchParams(window.location.search).get('goal');
if (goalParam) document.querySelector(`.dtab[data-tab="${goalParam}"]`)?.click();

// ── SCROLL REVEAL ──
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.plan-card,.svc-card,.meal-card,.feat-item,.why-item,.trainer-card,.cinfo-block')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

// ── ENQUIRY FORM ──────────────────────────────────────────────────
// Flow:
//   1. If Formspree ID is set → POST to Formspree (sends email to Shubham)
//      Formspree can also trigger Make.com → writes to Google Sheet
//   2. Fallback: open WhatsApp with pre-filled message (no backend needed)
// ─────────────────────────────────────────────────────────────────
async function submitEnquiry(e) {
  e.preventDefault();
  const form    = e.target;
  const btn     = form.querySelector('button[type="submit"]');
  const success = document.getElementById('formSuccess');
  const data    = new FormData(form);

  const name    = data.get('name')    || '';
  const phone   = data.get('phone')   || '';
  const goal    = data.get('goal')    || '';
  const plan    = data.get('plan')    || 'Not selected';
  const message = data.get('message') || '';

  btn.textContent = 'Sending...';
  btn.disabled    = true;

  // Attempt Formspree if ID is configured
  if (FORMSPREE_ID !== 'YOUR_FORMSPREE_ID') {
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  'POST',
        headers: { Accept: 'application/json' },
        body:    data,
      });
      if (res.ok) {
        success.style.display = 'block';
        success.textContent   = '✅ Enquiry sent! Shubham will contact you within 24 hours. You can also call 9665197143 directly.';
        form.reset();
        btn.textContent = 'Send via WhatsApp →';
        btn.disabled    = false;
        return;
      }
    } catch (err) {
      console.warn('Formspree unavailable, falling back to WhatsApp');
    }
  }

  // WhatsApp fallback (always works, no setup required)
  const text = encodeURIComponent(
    `Hi FitLine Fitness Club! Membership enquiry:\n\nName: ${name}\nPhone: ${phone}\nGoal: ${goal}\nPlan: ${plan}\nMessage: ${message || 'None'}`
  );
  success.style.display = 'block';
  success.textContent   = '✅ Opening WhatsApp. You can also call us directly: 9665197143';
  form.reset();
  btn.textContent = 'Send via WhatsApp →';
  btn.disabled    = false;
  setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank'), 600);
}

/*
══════════════════════════════════════════════════════════════
  STEP-BY-STEP BACKEND SETUP (DO THIS IN ORDER)
══════════════════════════════════════════════════════════════

STEP 1 — Formspree (5 min)
───────────────────────────
1. Go to formspree.io → Create free account
2. New Form → name it "FitLine Enquiry"
3. Copy the Form ID (e.g. xpzgabcd)
4. Open this file in VS Code
5. Change line 4:
     const FORMSPREE_ID = 'xpzgabcd';
6. Push to GitHub → done
Now every enquiry emails Shubham automatically.

STEP 2 — Google Sheet (10 min)
───────────────────────────────
1. Go to sheets.google.com → New Sheet
2. Name it "FitLine Members"
3. Create these columns in row 1:
   A=Name  B=Phone  C=Email  D=Goal  E=Plan
   F=JoinDate  G=ExpiryDate  H=Status  I=Notes
4. Share the sheet with your Gmail (make.com will use it)

STEP 3 — Make.com scenarios (30 min)
──────────────────────────────────────
Sign up at make.com (free, 1000 ops/month)

SCENARIO 1 — "New enquiry → Sheet + Welcome"
  Trigger:  Formspree → Watch Submissions
  Action 1: Google Sheets → Add Row (map all fields + calculate expiry)
  Action 2: Gmail → Send welcome email to member

SCENARIO 2 — "Daily expiry check → Reminder"
  Trigger:  Schedule → Every day at 9:00 AM
  Action 1: Google Sheets → Search Rows where ExpiryDate = TODAY+3
  Action 2: Gmail → Send renewal reminder to member phone/email

SCENARIO 3 — "Expired → Alert Shubham"
  Trigger:  Schedule → Every day at 9:00 AM
  Action 1: Google Sheets → Search Rows where ExpiryDate = TODAY
  Action 2: Gmail → Notify Shubham: "Member X expired today"

STEP 4 — Test it
─────────────────
Fill the enquiry form on your website → check:
  ✓ Shubham receives email from Formspree
  ✓ Row appears in Google Sheet (via Make)
  ✓ Member receives welcome message
══════════════════════════════════════════════════════════════
*/