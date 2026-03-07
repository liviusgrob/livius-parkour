const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(res.status);
}

async function newsletterExists(email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter?email=eq.${encodeURIComponent(email)}&select=email`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  return (await res.json()).length > 0;
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

const mainContent = document.getElementById('mainContent');
const surveyPage = document.getElementById('surveyPage');
const surveyTrigger = document.getElementById('surveyTrigger');
const surveyBack = document.getElementById('surveyBack');

const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');
const surveyForm = document.getElementById('surveyForm');

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
  { threshold: 0.35 }
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
  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get('name')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    message: formData.get('message')?.toString().trim()
  };

  try {
    setButtonLoading(submitBtn, true, 'Wird gesendet...', 'ABSENDEN');
    await supabaseInsert('contacts', payload);
    showStatus(status, 'Danke! Deine Nachricht wurde gesendet.', 'success');
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
  const formData = new FormData(newsletterForm);
  const payload = {
    name: formData.get('name')?.toString().trim(),
    email: formData.get('email')?.toString().trim()
  };

  try {
    setButtonLoading(submitBtn, true, 'Wird gesendet...', 'ANMELDEN');
    if (await newsletterExists(payload.email)) {
      showStatus(status, 'Diese E-Mail ist bereits angemeldet.', 'error');
      return;
    }
    await supabaseInsert('newsletter', payload);
    showStatus(status, 'Du bist erfolgreich im Newsletter eingetragen.', 'success');
    newsletterForm.reset();
  } catch {
    showStatus(status, 'Fehler bei der Anmeldung. Bitte versuche es erneut.', 'error');
  } finally {
    setButtonLoading(submitBtn, false, 'Wird gesendet...', 'ANMELDEN');
  }
});

const hideMainSections = () => {
  mainContent.style.display = 'none';
  surveyPage.classList.add('active');
  surveyPage.setAttribute('aria-hidden', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showMainSections = () => {
  surveyPage.classList.remove('active');
  surveyPage.setAttribute('aria-hidden', 'true');
  mainContent.style.display = '';
  document.getElementById('survey').scrollIntoView({ behavior: 'smooth' });
};

surveyTrigger.addEventListener('click', hideMainSections);
surveyBack.addEventListener('click', showMainSections);

surveyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('surveyStatus');
  const submitBtn = document.getElementById('surveySubmit');
  const formData = new FormData(surveyForm);

  const payload = {
    name: formData.get('name')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    question_1: formData.get('q1'),
    question_2: formData.get('q2'),
    question_3: formData.get('q3'),
    question_4: formData.get('q4')
  };

  try {
    setButtonLoading(submitBtn, true, 'Wird gesendet...', 'ABSENDEN');
    await supabaseInsert('surveys', payload);
    showStatus(status, 'Danke für deine Antworten!', 'success');
    surveyForm.reset();
  } catch {
    showStatus(status, 'Fehler beim Absenden der Umfrage.', 'error');
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

if (localStorage.getItem('cookieAccepted') !== '1') {
  cookieBanner.classList.add('show');
}

cookieAcceptBtn.addEventListener('click', () => {
  localStorage.setItem('cookieAccepted', '1');
  cookieBanner.classList.remove('show');
});
