const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

async function supabaseInsert(table, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
  return true;
}

async function newsletterExists(email) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter?email=eq.${encodeURIComponent(email)}&select=email`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await response.json();
  return data.length > 0;
}

function showMessage(elementId, message, isSuccess = true) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${isSuccess ? 'success' : 'error'}`;
  element.style.display = 'block';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function setupScrollProgress() {
  const scrollProgress = document.querySelector('.scroll-progress');
  if (!scrollProgress) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = `${(scrolled / maxHeight) * 100}%`;
  });
}

function setupRevealAnimations() {
  const targets = document.querySelectorAll('.reveal, [data-animation="slide-up"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((el) => observer.observe(el));
}

function setupNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
    });
  });
}

function setupPrivacyModal() {
  const privacyModal = document.getElementById('privacyModal');
  const privacyLinkFooter = document.getElementById('privacyLinkFooter');
  const privacyCookieLink = document.getElementById('privacyCookieLink');
  const closeBtn = document.querySelector('.modal-close-btn');

  const openModal = (e) => {
    e.preventDefault();
    if (!privacyModal) return;
    privacyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!privacyModal) return;
    privacyModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (privacyLinkFooter) privacyLinkFooter.addEventListener('click', openModal);
  if (privacyCookieLink) privacyCookieLink.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) closeModal();
    });
  }
}

function setupCookieBanner() {
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');

  if (!cookieBanner || !cookieAcceptBtn) return;

  const accepted = localStorage.getItem('cookieAccepted') === 'true';
  if (accepted) {
    cookieBanner.style.display = 'none';
  }

  cookieAcceptBtn.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', 'true');
    cookieBanner.style.display = 'none';
    showToast('Cookie-Hinweis gespeichert');
  });
}

function setupSurveyToggle() {
  const surveyTriggerBtn = document.getElementById('surveyTriggerBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const hiddenSurvey = document.getElementById('hiddenSurvey');

  if (surveyTriggerBtn && hiddenSurvey) {
    surveyTriggerBtn.addEventListener('click', () => {
      document.querySelectorAll('section.section, header, footer').forEach((section) => {
        section.style.display = 'none';
      });
      hiddenSurvey.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (backToMainBtn && hiddenSurvey) {
    backToMainBtn.addEventListener('click', () => {
      document.querySelectorAll('section.section, header, footer').forEach((section) => {
        section.style.display = 'flex';
      });
      const footer = document.querySelector('footer');
      if (footer) footer.style.display = 'block';
      hiddenSurvey.style.display = 'none';
      const surveyMain = document.getElementById('surveyMain');
      if (surveyMain) {
        window.scrollTo({ top: surveyMain.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupScrollProgress();
  setupRevealAnimations();
  setupNavigation();
  setupPrivacyModal();
  setupCookieBanner();
  setupSurveyToggle();

  const scrollBtn = document.getElementById('scrollBtn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      if (!name || !email || !message) {
        showMessage('contactFormMessage', 'Bitte alle Felder ausfüllen.', false);
        return;
      }
      if (!emailRegex.test(email)) {
        showMessage('contactFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
      try {
        await supabaseInsert('contacts', { name, email, message });
        showMessage('contactFormMessage', '✅ Vielen Dank! Deine Nachricht wurde gesendet.', true);
        contactForm.reset();
      } catch (error) {
        showMessage('contactFormMessage', '❌ Fehler beim Senden. Schreib mir direkt an hallo@liviusparkour.ch', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Absenden';
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
        showMessage('newsletterFormMessage', 'Bitte alle Felder ausfüllen.', false);
        return;
      }
      if (!emailRegex.test(email)) {
        showMessage('newsletterFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }

      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gespeichert...';
      try {
        const exists = await newsletterExists(email);
        if (exists) {
          showMessage('newsletterFormMessage', 'Diese E-Mail ist bereits angemeldet.', false);
          return;
        }
        await supabaseInsert('newsletter', { name, email });
        showMessage('newsletterFormMessage', '✅ Erfolgreich angemeldet!', true);
        newsletterForm.reset();
      } catch (error) {
        showMessage('newsletterFormMessage', '❌ Fehler beim Speichern. Bitte versuche es erneut.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Newsletter abonnieren';
      }
    });
  }

  const surveyForm = document.getElementById('surveyForm');
  const backToMainBtn = document.getElementById('backToMainBtn');
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
        showMessage('surveyFormMessage', 'Bitte alle Pflichtfelder ausfüllen.', false);
        return;
      }
      if (!emailRegex.test(email)) {
        showMessage('surveyFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }

      const submitBtn = surveyForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
      try {
        await supabaseInsert('surveys', { name, email, q1, q2, q3, q4 });
        showMessage('surveyFormMessage', '✅ Vielen Dank für deine Teilnahme!', true);
        surveyForm.reset();
        setTimeout(() => { if (backToMainBtn) backToMainBtn.click(); }, 3000);
      } catch (error) {
        showMessage('surveyFormMessage', '❌ Fehler beim Senden. Bitte versuche es erneut.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Umfrage absenden';
      }
    });
  }
});
