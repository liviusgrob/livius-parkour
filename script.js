const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return true;
}

async function newsletterExists(email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter?email=eq.${encodeURIComponent(email)}&select=email`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await res.json();
  return data.length > 0;
}

function showFormMessage(elementId, message, isSuccess) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  el.style.padding = '1rem';
  el.style.borderRadius = '8px';
  el.style.marginTop = '1rem';
  el.style.fontWeight = '600';
  if (isSuccess) {
    el.style.background = 'rgba(76,175,80,0.15)';
    el.style.border = '1px solid rgba(76,175,80,0.4)';
    el.style.color = '#4CAF50';
  } else {
    el.style.background = 'rgba(255,0,48,0.12)';
    el.style.border = '1px solid rgba(255,0,48,0.3)';
    el.style.color = '#FF0030';
  }
}

const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.getElementById('siteHeader');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
const revealItems = document.querySelectorAll('.reveal');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const cookieBanner = document.getElementById('cookieBanner');
const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');
const privacyModal = document.getElementById('privacyModal');
const privacyOpenBtn = document.getElementById('privacyOpenBtn');
const privacyCloseBtn = document.getElementById('privacyCloseBtn');
const privacyCookieLink = document.getElementById('privacyCookieLink');

const updateScrollEffects = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${scrollPercent}%`;

  if (!siteHeader) return;
  if (scrollTop > 40) siteHeader.classList.add('scrolled');
  else siteHeader.classList.remove('scrolled');
};

window.addEventListener('scroll', updateScrollEffects);
updateScrollEffects();

const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
  root: null,
  rootMargin: '-40% 0px -55% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const id = entry.target.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, revealObs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const openMobileMenu = () => {
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  document.body.classList.add('no-scroll');
};

const closeMobileMenu = () => {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  document.body.classList.remove('no-scroll');
};

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
mobileMenuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
  });
});

function showSurvey() {
  // Hide nav
  const nav = document.querySelector('nav');
  if (nav) nav.style.setProperty('display', 'none', 'important');
  
  // Hide all sections and header and footer
  document.querySelectorAll('section, header, footer').forEach(el => {
    if (el.id !== 'hiddenSurvey') {
      el.style.setProperty('display', 'none', 'important');
    }
  });
  
  // Show survey
  const survey = document.getElementById('hiddenSurvey');
  if (survey) {
    survey.style.setProperty('display', 'block', 'important');
    survey.style.setProperty('position', 'relative', 'important');
    survey.style.setProperty('z-index', '1', 'important');
  }
  
  // Force scroll to absolute top
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function hideSurvey() {
  // Hide survey
  const survey = document.getElementById('hiddenSurvey');
  if (survey) survey.style.setProperty('display', 'none', 'important');
  
  // Show nav
  const nav = document.querySelector('nav');
  if (nav) nav.style.removeProperty('display');
  
  // Show all sections
  document.querySelectorAll('section, header, footer').forEach(el => {
    el.style.removeProperty('display');
  });
  
  // Scroll to survey section
  const target = document.getElementById('surveyMain') || document.getElementById('survey');
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

const triggerBtn = document.getElementById('surveyTriggerBtn');
if (triggerBtn) triggerBtn.addEventListener('click', showSurvey);

const backBtn = document.getElementById('backToMainBtn');
if (backBtn) backBtn.addEventListener('click', hideSurvey);

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    if (!name || !email || !message) {
      showFormMessage('contactFormMessage', 'Bitte alle Felder ausfüllen.', false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormMessage('contactFormMessage', 'Bitte eine gültige E-Mail eingeben.', false);
      return;
    }
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet...';
    try {
      await supabaseInsert('contacts', { name, email, message });
      showFormMessage('contactFormMessage', 'Nachricht erhalten — ich melde mich bald.', true);
      contactForm.reset();
    } catch (err) {
      showFormMessage('contactFormMessage', 'Etwas hat nicht geklappt. Schreib mir direkt: livius.grob@gmx.ch', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'ABSENDEN';
    }
  });
}

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('newsletter-name')?.value.trim();
    const email = document.getElementById('newsletter-email')?.value.trim();
    if (!name || !email) {
      showFormMessage('newsletterFormMessage', 'Bitte alle Felder ausfüllen.', false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormMessage('newsletterFormMessage', 'Bitte eine gültige E-Mail eingeben.', false);
      return;
    }
    const btn = newsletterForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Wird gespeichert...';
    try {
      const exists = await newsletterExists(email);
      if (exists) {
        showFormMessage('newsletterFormMessage', 'Diese E-Mail ist bereits angemeldet.', false);
        return;
      }
      await supabaseInsert('newsletter', { name, email });
      showFormMessage('newsletterFormMessage', 'Bist dabei — bis Montag.', true);
      newsletterForm.reset();
    } catch (err) {
      showFormMessage('newsletterFormMessage', 'Hat nicht geklappt. Versuch es nochmal.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'ANMELDEN';
    }
  });
}

const surveyForm = document.getElementById('surveyForm');
if (surveyForm) {
  surveyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('surveyName')?.value.trim();
    const email = document.getElementById('surveyEmail')?.value.trim();
    const q1 = document.querySelector('input[name="q1"]:checked')?.value;
    const q2 = document.querySelector('input[name="q2"]:checked')?.value;
    const q3 = document.getElementById('q3')?.value.trim();
    const q4 = document.querySelector('input[name="q4"]:checked')?.value;
    if (!name || !email || !q1 || !q2 || !q4) {
      showFormMessage('surveyFormMessage', 'Bitte alle Pflichtfelder ausfüllen.', false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormMessage('surveyFormMessage', 'Bitte eine gültige E-Mail eingeben.', false);
      return;
    }
    const btn = surveyForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet...';
    try {
      await supabaseInsert('surveys', { name, email, q1, q2, q3, q4 });
      showFormMessage('surveyFormMessage', 'Danke — das hilft mir wirklich weiter.', true);
      surveyForm.reset();
      setTimeout(() => hideSurvey(), 2500);
    } catch (err) {
      showFormMessage('surveyFormMessage', 'Hat nicht geklappt. Versuch es nochmal.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'ABSENDEN';
    }
  });
}

const openPrivacyModal = (event) => {
  if (event) event.preventDefault();
  if (!privacyModal) return;
  privacyModal.classList.add('open');
  privacyModal.setAttribute('aria-hidden', 'false');
};

const closePrivacyModal = () => {
  if (!privacyModal) return;
  privacyModal.classList.remove('open');
  privacyModal.setAttribute('aria-hidden', 'true');
};

if (privacyOpenBtn) privacyOpenBtn.addEventListener('click', openPrivacyModal);
if (privacyCloseBtn) privacyCloseBtn.addEventListener('click', closePrivacyModal);
if (privacyCookieLink) privacyCookieLink.addEventListener('click', openPrivacyModal);
if (privacyModal) {
  privacyModal.addEventListener('click', (event) => {
    if (event.target === privacyModal) closePrivacyModal();
  });
}

if (cookieBanner) {
  if (localStorage.getItem('cookieAccepted') === '1') {
    cookieBanner.style.display = 'none';
  } else {
    cookieBanner.style.display = 'flex';
  }
}

if (cookieAcceptBtn) {
  cookieAcceptBtn.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', '1');
    if (cookieBanner) cookieBanner.style.display = 'none';
  });
}
