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

const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.getElementById('siteHeader');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
const desktopNavLinks = document.querySelectorAll('.nav-links a');
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

const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');
const surveyForm = document.getElementById('surveyForm');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const showStatus = (target, message, type) => {
  target.innerHTML = `<div class="status-message ${type}">${message}</div>`;
};

const setButtonLoading = (button, isLoading, loadingText, defaultText) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
};

const updateScrollEffects = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${scrollPercent}%`;

  if (scrollTop > 40) siteHeader.classList.add('scrolled');
  else siteHeader.classList.remove('scrolled');
};

window.addEventListener('scroll', updateScrollEffects);
updateScrollEffects();

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      desktopNavLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${id}`);
      });
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('main section[id], #hero').forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const openMobileMenu = () => {
  mobileMenu.classList.add('open');
  document.body.classList.add('no-scroll');
};

const closeMobileMenu = () => {
  mobileMenu.classList.remove('open');
  document.body.classList.remove('no-scroll');
};

hamburger.addEventListener('click', openMobileMenu);
mobileClose.addEventListener('click', closeMobileMenu);
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
  });
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    showStatus(status, 'Bitte fülle alle Felder aus.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus(status, 'Bitte gib eine gültige E-Mail-Adresse ein.', 'error');
    return;
  }

  try {
    setButtonLoading(submitBtn, true, 'Wird gesendet...', 'ABSENDEN');
    await supabaseInsert('contacts', { name, email, message });
    showStatus(status, 'Nachricht erfolgreich gesendet.', 'success');
    contactForm.reset();
  } catch {
    showStatus(status, 'Fehler beim Senden. Bitte versuche es erneut.', 'error');
  } finally {
    setButtonLoading(submitBtn, false, 'Wird gesendet...', 'ABSENDEN');
  }
});

newsletterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('newsletterStatus');
  const submitBtn = document.getElementById('newsletterSubmit');

  const name = document.getElementById('newsletterName').value.trim();
  const email = document.getElementById('newsletterEmail').value.trim();

  if (!name || !email) {
    showStatus(status, 'Bitte fülle alle Felder aus.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus(status, 'Bitte gib eine gültige E-Mail-Adresse ein.', 'error');
    return;
  }

  try {
    const exists = await newsletterExists(email);
    if (exists) {
      showStatus(status, 'Diese E-Mail ist bereits angemeldet.', 'error');
      return;
    }

    setButtonLoading(submitBtn, true, 'Wird gespeichert...', 'ANMELDEN');
    await supabaseInsert('newsletter', { name, email });
    showStatus(status, 'Erfolgreich zum Newsletter angemeldet.', 'success');
    newsletterForm.reset();
  } catch {
    showStatus(status, 'Fehler beim Speichern. Bitte versuche es erneut.', 'error');
  } finally {
    setButtonLoading(submitBtn, false, 'Wird gespeichert...', 'ANMELDEN');
  }
});

document.getElementById('surveyTriggerBtn').addEventListener('click', function() {
  document.querySelector('nav').style.display = 'none';
  document.querySelectorAll('section, header, footer').forEach(el => {
    el.style.display = 'none';
  });
  const survey = document.getElementById('hiddenSurvey');
  survey.style.display = 'block';
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});

document.getElementById('backToMainBtn').addEventListener('click', function() {
  document.getElementById('hiddenSurvey').style.display = 'none';
  document.querySelector('nav').style.display = '';
  document.querySelectorAll('section, header, footer').forEach(el => {
    el.style.display = '';
  });
  const target = document.getElementById('surveyMain') || document.getElementById('survey');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
});

surveyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('surveyStatus');
  const submitBtn = document.getElementById('surveySubmit');

  const name = document.getElementById('surveyName').value.trim();
  const email = document.getElementById('surveyEmail').value.trim();
  const q1 = surveyForm.querySelector('input[name="q1"]:checked')?.value || '';
  const q2 = surveyForm.querySelector('input[name="q2"]:checked')?.value || '';
  const q3 = document.getElementById('surveyChallenge').value.trim();
  const q4 = surveyForm.querySelector('input[name="q4"]:checked')?.value || '';

  if (!name || !email || !q1 || !q2 || !q4) {
    showStatus(status, 'Bitte fülle alle Pflichtfelder aus.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus(status, 'Bitte gib eine gültige E-Mail-Adresse ein.', 'error');
    return;
  }

  try {
    setButtonLoading(submitBtn, true, 'Wird gesendet...', 'ABSENDEN');
    await supabaseInsert('surveys', { name, email, q1, q2, q3, q4 });
    showStatus(status, 'Umfrage erfolgreich gesendet.', 'success');
    surveyForm.reset();
    setTimeout(() => {
      document.getElementById('backToMainBtn').click();
    }, 2500);
  } catch {
    showStatus(status, 'Fehler beim Senden. Bitte versuche es erneut.', 'error');
  } finally {
    setButtonLoading(submitBtn, false, 'Wird gesendet...', 'ABSENDEN');
  }
});

const openPrivacyModal = (event) => {
  if (event) event.preventDefault();
  privacyModal.classList.add('open');
  privacyModal.setAttribute('aria-hidden', 'false');
};

const closePrivacyModal = () => {
  privacyModal.classList.remove('open');
  privacyModal.setAttribute('aria-hidden', 'true');
};

privacyOpenBtn.addEventListener('click', openPrivacyModal);
privacyCloseBtn.addEventListener('click', closePrivacyModal);
privacyCookieLink.addEventListener('click', openPrivacyModal);
privacyModal.addEventListener('click', (event) => {
  if (event.target === privacyModal) closePrivacyModal();
});

if (localStorage.getItem('cookieAccepted') === '1') {
  cookieBanner.style.display = 'none';
} else {
  cookieBanner.style.display = 'flex';
}

cookieAcceptBtn.addEventListener('click', () => {
  localStorage.setItem('cookieAccepted', '1');
  cookieBanner.style.display = 'none';
});
