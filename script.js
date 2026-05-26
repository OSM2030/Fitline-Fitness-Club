// FitLine Fitness Club — script.js
// Backend: Formspree + Google Sheets + Make.com (all free)

// ─── CHANGE ONLY THESE TWO LINES ───────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxxkptWX67tHfOdRElbOKdOW1FZBYWZBRrX_7qUXSSAQX2QTaCFE_ycYlyBfsGU5_8xqg/exec";
const WA_NUMBER  = '919665197143';
// ────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────

// ─────────────────────────────
// THEME TOGGLE
// ─────────────────────────────

const root = document.documentElement;

const themeBtns = document.querySelectorAll(
  "#themeToggle, #themeToggleMob"
);

themeBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const currentTheme =
      root.getAttribute("data-theme");

    const nextTheme =
      currentTheme === "dark"
        ? "light"
        : "dark";

    root.setAttribute(
      "data-theme",
      nextTheme
    );

    // SAVE THEME
    localStorage.setItem(
      "fitline-theme",
      nextTheme
    );

  });

});

// LOAD SAVED THEME

const savedTheme =
  localStorage.getItem("fitline-theme");

if(savedTheme){

  root.setAttribute(
    "data-theme",
    savedTheme
  );

}

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
// ── ENQUIRY FORM ─────────────────────────────

const enquiryForm = document.querySelector(".enq-form");

if (enquiryForm) {

  enquiryForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitBtn =
      enquiryForm.querySelector("button");

    const formData =
      new FormData(enquiryForm);

    // PHONE VALIDATION
    const phone =
      formData.get("phone");

    if (!/^[0-9]{10}$/.test(phone)) {

      alert("Please enter valid 10-digit mobile number");

      return;

    }

    // PREVENT MULTIPLE CLICKS
    submitBtn.disabled = true;

    submitBtn.innerHTML =
      "Processing...";

    try {

      // FORMSPREE SUBMIT
      const response = await fetch(
  SCRIPT_URL,
  {
    method: "POST",
    body: formData
  }
);

      if (response.ok) {

        showSuccess();

      } else {

        alert("Something went wrong. Please try again.");

      }

    } catch (error) {

      alert("Network error. Please try again.");

    }

    // ENABLE BUTTON AGAIN
    submitBtn.disabled = false;

    submitBtn.innerHTML =
      "Activate Membership →";

  });

}

function showSuccess() {

  const success =
    document.getElementById("formSuccess");

  success.style.display = "block";

  success.innerHTML =
    "✅ Enquiry submitted successfully! Our team will contact you soon 💪";

  success.style.color = "#22c55e";

  document
    .querySelector(".enq-form")
    .reset();

}

/*
══════════════════════════════════════════════════════════════
  STEP-BY-STEP BACKEND SETUP (DO THIS IN ORDER)
══════════════════════════════════════════════════════════════


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