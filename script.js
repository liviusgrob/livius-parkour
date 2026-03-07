// ================= KONFIGURATION =================
const ADMIN_CREDENTIALS = {
  username: "LiviusGrob",
  password: "P@rk0ur!2026$ecur3#"
};
const STORAGE_KEYS = {
  CONTACTS: 'livius_contacts',
  NEWSLETTER: 'livius_newsletter',
  SURVEYS: 'livius_surveys'
};

// ================= GLOBALE VARIABLEN =================
let selectedDataEntries = new Set(); // Set für ausgewählte Daten-IDs
let currentTab = 'contacts'; // Aktuell aktiver Tab

// ================= SUBTILE ANIMATIONEN =================
// Scroll-Progress-Indikator
function setupScrollProgress() {
  const scrollProgress = document.querySelector('.scroll-progress');
  if (!scrollProgress) return;
  
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';
  });
}

// Scroll-Triggered Animations
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animation]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(el => observer.observe(el));
}

// ================= HILFSFUNKTIONEN =================
function getStoredData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('localStorage nicht verfügbar');
    return [];
  }
}

function storeData(key, newEntry) {
  try {
    const allData = getStoredData(key);
    const entryWithTimestamp = {
      ...newEntry,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    allData.push(entryWithTimestamp);
    localStorage.setItem(key, JSON.stringify(allData));
    return true;
  } catch (error) {
    console.log('Speicherung fehlgeschlagen');
    return true;
  }
}

function updateData(key, updatedData) {
  try {
    localStorage.setItem(key, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.log('Update fehlgeschlagen');
    return false;
  }
}

function showMessage(elementId, message, isSuccess = true) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      alert(message);
      return;
    }
    element.textContent = message;
    element.className = `form-message ${isSuccess ? 'success' : 'error'}`;
    element.style.display = 'block';
    if (isSuccess) {
      setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
          element.style.opacity = '1';
        }, 500);
      }, 4000);
    }
  } catch (error) {
    console.error('Fehler in showMessage:', error);
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
      if (toast.parentNode) document.body.removeChild(toast);
    }, 500);
  }, 2500);
}

// ================= COOKIE FUNKTIONALITÄT =================
const COOKIE_PREFS_KEY = 'livius_cookie_preferences';

function getCookiePreferences() {
  try {
    const prefs = localStorage.getItem(COOKIE_PREFS_KEY);
    return prefs ? JSON.parse(prefs) : {
      analytics: false, preferences: false, marketing: false, social: false
    };
  } catch (error) {
    return { analytics: false, preferences: false, marketing: false, social: false };
  }
}

function saveCookiePreferences(analytics, preferences, marketing, social) {
  try {
    const prefs = {
      analytics, preferences, marketing, social,
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.log('Cookie-Präferenzen konnten nicht gespeichert werden');
  }
}

function showCookiePopup() {
  setTimeout(() => {
    const cookiePopup = document.getElementById('cookiePopup');
    if (cookiePopup) {
      cookiePopup.classList.add('active');
      document.body.style.overflow = 'hidden';
      const prefs = getCookiePreferences();
      ['analyticsCookies', 'preferenceCookies', 'marketingCookies', 'socialCookies'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = prefs[id.replace('Cookies', '')];
      });
    }
  }, 1000);
}

// ================= MODIFIZIERTE COOKIE-POPUP FUNKTION =================
function setupCookiePopup() {
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptAllBtn = document.getElementById('acceptAllBtn');
  const configureBtn = document.getElementById('configureBtn');
  const saveSelectionBtn = document.getElementById('saveSelectionBtn');

  // Event-Listener für Configure Button
  if (configureBtn) {
    configureBtn.addEventListener('click', function() {
      document.querySelectorAll('.cookie-type.optional').forEach(el => {
        el.style.display = 'block';
      });
      configureBtn.style.display = 'none';
      if (saveSelectionBtn) saveSelectionBtn.style.display = 'flex';
    });
  }

  // Event-Listener für Accept All Button
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', function() {
      const analyticsToggle = document.getElementById('analyticsCookies');
      const preferenceToggle = document.getElementById('preferenceCookies');
      const marketingToggle = document.getElementById('marketingCookies');
      const socialToggle = document.getElementById('socialCookies');
      
      if (analyticsToggle) analyticsToggle.checked = true;
      if (preferenceToggle) preferenceToggle.checked = true;
      if (marketingToggle) marketingToggle.checked = true;
      if (socialToggle) socialToggle.checked = true;
      
      saveCookiePreferences(true, true, true, true);
      
      cookiePopup.classList.remove('active');
      document.body.style.overflow = 'auto';
      showToast('Alle Cookies akzeptiert.', 'success');
    });
  }

  // Event-Listener für Save Selection Button
  if (saveSelectionBtn) {
    saveSelectionBtn.addEventListener('click', function() {
      const analyticsToggle = document.getElementById('analyticsCookies');
      const preferenceToggle = document.getElementById('preferenceCookies');
      const marketingToggle = document.getElementById('marketingCookies');
      const socialToggle = document.getElementById('socialCookies');
      
      const analytics = analyticsToggle ? analyticsToggle.checked : false;
      const preferences = preferenceToggle ? preferenceToggle.checked : false;
      const marketing = marketingToggle ? marketingToggle.checked : false;
      const social = socialToggle ? socialToggle.checked : false;
      
      saveCookiePreferences(analytics, preferences, marketing, social);
      
      cookiePopup.classList.remove('active');
      document.body.style.overflow = 'auto';
      showToast('Cookie-Einstellungen gespeichert.', 'success');
    });
  }

  // KEIN SCHLIEßEN-BUTTON MEHR - Benutzer MUSS Cookies auswählen
  // RÜTTEL-EFFEKT BEI KLICK AUSSERHALB
  if (cookiePopup) {
    cookiePopup.addEventListener('click', (e) => {
      if (e.target === cookiePopup) {
        const popupBox = cookiePopup.querySelector('.cookie-popup');
        popupBox.classList.add('shake');
        popupBox.classList.add('pulse-border');
        
        setTimeout(() => {
          popupBox.classList.remove('shake');
          popupBox.classList.remove('pulse-border');
        }, 500);
        
        // Kurzes Aufleuchten des Overlays
        cookiePopup.style.backgroundColor = 'rgba(255, 0, 61, 0.1)';
        setTimeout(() => { cookiePopup.style.backgroundColor = ''; }, 300);
        
        // Zeige Hinweis
        showTemporaryHint("Bitte wählen Sie Ihre Cookie-Einstellungen aus", 'info');
      }
    });
  }
  
  // Verhindert Klicks innerhalb des Popups das Schließen
  const cookieContent = document.querySelector('.cookie-popup');
  if (cookieContent) {
    cookieContent.addEventListener('click', (e) => e.stopPropagation());
  }
}

// ================= VERBESSERTE DATENSCHUTZ-MODAL-FUNKTION =================
function setupPrivacyModal() {
  const privacyModal = document.getElementById('privacyModal');
  const privacyLink = document.getElementById('privacyLinkFooter');
  const privacyLinkInCookie = document.getElementById('privacyLink');
  const closePrivacyBtn = document.querySelector('.modal-close-btn');
  const modalBox = document.querySelector('.modal-box');
  
  // Event-Listener für Datenschutz-Link in Footer
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Starte X-Button Animation nach kurzer Verzögerung
      setTimeout(() => {
        if (closePrivacyBtn) {
          closePrivacyBtn.classList.add('pulse-x');
          setTimeout(() => {
            closePrivacyBtn.classList.remove('pulse-x');
          }, 3000);
        }
      }, 500);
    });
  }
  
  // Event-Listener für Datenschutz-Link im Cookie-Popup
  if (privacyLinkInCookie) {
    privacyLinkInCookie.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Speichere Cookie-Popup-Status
      const cookiePopup = document.getElementById('cookiePopup');
      const wasCookieActive = cookiePopup.classList.contains('active');
      
      // Schließe Cookie-Popup temporär
      if (cookiePopup && wasCookieActive) {
        cookiePopup.classList.remove('active');
      }
      
      // Öffne Datenschutz-Modal
      privacyModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Starte X-Button Animation nach kurzer Verzögerung
      setTimeout(() => {
        if (closePrivacyBtn) {
          closePrivacyBtn.classList.add('pulse-x');
          setTimeout(() => {
            closePrivacyBtn.classList.remove('pulse-x');
          }, 3000);
        }
      }, 500);
      
      // Spezielle Behandlung für X-Button
      const tempCloseHandler = () => {
        privacyModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Wenn Cookie-Popup vorher aktiv war, öffne es wieder
        if (wasCookieActive) {
          setTimeout(() => {
            cookiePopup.classList.add('active');
            document.body.style.overflow = 'hidden';
          }, 100);
        }
      };
      
      // Entferne alten Event-Listener falls vorhanden
      closePrivacyBtn.removeEventListener('click', tempCloseHandler);
      closePrivacyBtn.addEventListener('click', tempCloseHandler, { once: true });
    });
  }
  
  // Event-Listener für X-Button in Datenschutz-Modal
  if (closePrivacyBtn && privacyModal) {
    const closeHandler = () => {
      privacyModal.classList.remove('active');
      document.body.style.overflow = 'auto';
      
      // Wenn Cookie-Popup noch nicht entschieden wurde, zeige es wieder
      const cookiePopup = document.getElementById('cookiePopup');
      const cookiePrefs = getCookiePreferences();
      const hasMadeChoice = cookiePrefs.analytics || cookiePrefs.preferences || 
                           cookiePrefs.marketing || cookiePrefs.social;
      
      if (!hasMadeChoice && cookiePopup) {
        setTimeout(() => {
          cookiePopup.classList.add('active');
          document.body.style.overflow = 'hidden';
        }, 500);
      }
    };
    
    closePrivacyBtn.addEventListener('click', closeHandler);
  }
  
  // Event-Listener für Klick außerhalb des Modals - ROTER RAND + X-ANIMATION
  if (privacyModal && modalBox) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        // KEIN automatisches Schließen mehr
        // ROTER RAND-Animation für Modal-Box
        modalBox.classList.add('pulse-border');
        
        // X-BUTTON ANIMATION (rot aufleuchten und drehen)
        if (closePrivacyBtn) {
          closePrivacyBtn.classList.add('pulse-x');
          
          // Entferne Animationen nach Abschluss
          setTimeout(() => {
            modalBox.classList.remove('pulse-border');
          }, 800);
          
          setTimeout(() => {
            closePrivacyBtn.classList.remove('pulse-x');
          }, 1000);
        }
        
        // Kurzes Aufleuchten des Overlays
        privacyModal.style.backgroundColor = 'rgba(255, 0, 61, 0.15)';
        setTimeout(() => { privacyModal.style.backgroundColor = ''; }, 300);
        
        // Zusätzliches visuelles Feedback - kurzer Hinweis
        showTemporaryHint("Bitte schließen Sie das Fenster mit dem X-Button oben rechts", 'info');
      }
    });
  }
  
  // Verhindert Klicks innerhalb des Modals das Schließen
  if (modalBox) {
    modalBox.addEventListener('click', (e) => e.stopPropagation());
  }
}

// ================= HILFSFUNKTION FÜR VISUELLES FEEDBACK =================
function showTemporaryHint(message, type = 'info') {
  // Erstelle temporäres Hinweis-Element
  const hint = document.createElement('div');
  hint.className = 'temporary-hint';
  hint.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${type === 'info' ? 'rgba(33, 150, 243, 0.9)' : type === 'error' ? 'rgba(255, 0, 61, 0.9)' : 'rgba(255, 152, 0, 0.9)'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    font-weight: 600;
    z-index: 20000;
    text-align: center;
    max-width: 80%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: fadeInOut 2s ease;
    pointer-events: none;
  `;
  
  // Icon basierend auf Typ
  const icon = type === 'info' ? 'fa-info-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
  hint.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  
  document.body.appendChild(hint);
  
  // Entferne nach Animation
  setTimeout(() => {
    if (hint.parentNode) {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (hint.parentNode) document.body.removeChild(hint);
      }, 500);
    }
  }, 2000);
}

// ================= ADMIN DATENVERWALTUNGS-FUNKTIONEN =================
function updateSelectedCount() {
  const selectedCountElement = document.getElementById('selectedCount');
  if (selectedCountElement) {
    selectedCountElement.textContent = `${selectedDataEntries.size} ausgewählt`;
  }
}

function selectAllEntries() {
  const currentTabContent = document.getElementById(`${currentTab}Tab`);
  if (currentTabContent) {
    const checkboxes = currentTabContent.querySelectorAll('.data-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      const entryId = checkbox.getAttribute('data-id');
      selectedDataEntries.add(entryId);
      
      // Visuelles Feedback für ausgewählten Eintrag
      const entryElement = checkbox.closest('.data-entry');
      if (entryElement) {
        entryElement.classList.add('selected');
      }
    });
    updateSelectedCount();
    showToast(`${checkboxes.length} Einträge ausgewählt`, 'info');
  }
}

function deselectAllEntries() {
  const currentTabContent = document.getElementById(`${currentTab}Tab`);
  if (currentTabContent) {
    const checkboxes = currentTabContent.querySelectorAll('.data-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      const entryId = checkbox.getAttribute('data-id');
      selectedDataEntries.delete(entryId);
      
      // Visuelles Feedback entfernen
      const entryElement = checkbox.closest('.data-entry');
      if (entryElement) {
        entryElement.classList.remove('selected');
      }
    });
    updateSelectedCount();
    showToast('Alle Einträge abgewählt', 'info');
  }
}

function deleteSelectedEntries() {
  if (selectedDataEntries.size === 0) {
    showToast('Keine Einträge zum Löschen ausgewählt', 'error');
    return;
  }
  
  if (!confirm(`Möchten Sie ${selectedDataEntries.size} ausgewählte Einträge wirklich löschen?`)) {
    return;
  }
  
  try {
    const storageKey = STORAGE_KEYS[currentTab.toUpperCase()];
    let data = getStoredData(storageKey);
    
    // Filtere ausgewählte Einträge heraus
    const originalLength = data.length;
    data = data.filter(entry => !selectedDataEntries.has(entry.id.toString()));
    
    if (updateData(storageKey, data)) {
      const deletedCount = originalLength - data.length;
      selectedDataEntries.clear();
      updateSelectedCount();
      
      // Aktualisiere die Anzeige
      loadAdminData();
      
      showToast(`${deletedCount} Einträge wurden gelöscht`, 'success');
    } else {
      showToast('Fehler beim Löschen der Einträge', 'error');
    }
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    showToast('Fehler beim Löschen der Einträge', 'error');
  }
}

function downloadSelectedEntries() {
  if (selectedDataEntries.size === 0) {
    showToast('Keine Einträge zum Herunterladen ausgewählt', 'error');
    return;
  }
  
  try {
    const storageKey = STORAGE_KEYS[currentTab.toUpperCase()];
    const allData = getStoredData(storageKey);
    
    // Filtere ausgewählte Einträge
    const selectedData = allData.filter(entry => selectedDataEntries.has(entry.id.toString()));
    
    if (selectedData.length === 0) {
      showToast('Keine Daten zum Herunterladen gefunden', 'error');
      return;
    }
    
    const exportData = {
      exportDate: new Date().toISOString(),
      dataType: currentTab,
      selectedCount: selectedData.length,
      entries: selectedData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `livius_${currentTab}_auswahl_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
    showToast(`${selectedData.length} ausgewählte Einträge heruntergeladen`, 'success');
    
  } catch (error) {
    console.error('Fehler beim Herunterladen:', error);
    showToast('Fehler beim Herunterladen der Daten', 'error');
  }
}

function setupCheckboxEventListeners() {
  // Event-Listener für Checkbox-Klicks
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('data-checkbox')) {
      const checkbox = e.target;
      const entryId = checkbox.getAttribute('data-id');
      const entryElement = checkbox.closest('.data-entry');
      
      if (checkbox.checked) {
        selectedDataEntries.add(entryId);
        if (entryElement) {
          entryElement.classList.add('selected');
        }
      } else {
        selectedDataEntries.delete(entryId);
        if (entryElement) {
          entryElement.classList.remove('selected');
        }
      }
      
      updateSelectedCount();
    }
  });
}

// ================= INITIALISIERUNG =================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Livius Parkour Website geladen');
  
  // Setup Animationen
  setupScrollProgress();
  setupScrollAnimations();
  
  // Setup Funktionen
  showCookiePopup();
  setupPrivacyModal();
  setupCookiePopup();
  setupCheckboxEventListeners();

  // Verstecke Umfrage
  const hiddenSurvey = document.getElementById('hiddenSurvey');
  if (hiddenSurvey) hiddenSurvey.style.display = 'none';

  // Navigation
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  // Scroll Animation
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    reveals.forEach(section => {
      if (section.getBoundingClientRect().top < window.innerHeight - 100) {
        section.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // Scroll Button
  const scrollBtn = document.getElementById('scrollBtn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) aboutSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    });
  }

  // ================= FORMULARE =================
  // Kontaktformular
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();
      if (!name || !email || !message) {
        showMessage('contactFormMessage', 'Bitte alle Felder ausfüllen.', false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('contactFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }
      const contactData = { name, email, message };
      if (storeData(STORAGE_KEYS.CONTACTS, contactData)) {
        showMessage('contactFormMessage', '✅ Vielen Dank für deine Nachricht! Die Daten wurden erfolgreich gespeichert.');
        contactForm.reset();
      }
    });
  }

  // Newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('newsletter-name')?.value.trim();
      const email = document.getElementById('newsletter-email')?.value.trim();
      if (!name || !email) {
        showMessage('newsletterFormMessage', 'Bitte alle Felder ausfüllen.', false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('newsletterFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }
      try {
        const existing = getStoredData(STORAGE_KEYS.NEWSLETTER);
        if (existing.some(entry => entry.email === email)) {
          showMessage('newsletterFormMessage', 'Diese E-Mail-Adresse ist bereits angemeldet.', false);
          return;
        }
      } catch (error) {}
      const newsletterData = { name, email };
      if (storeData(STORAGE_KEYS.NEWSLETTER, newsletterData)) {
        showMessage('newsletterFormMessage', '✅ Super! Deine Anmeldung wurde erfolgreich gespeichert.');
        newsletterForm.reset();
      }
    });
  }

  // ================= UMFAGE =================
  const surveyTriggerBtn = document.getElementById('surveyTriggerBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  if (surveyTriggerBtn && hiddenSurvey) {
    surveyTriggerBtn.addEventListener('click', function() {
      const sectionsToHide = document.querySelectorAll('section.section, header, footer');
      sectionsToHide.forEach(element => {
        if (element.id !== 'hiddenSurvey') element.style.display = 'none';
      });
      hiddenSurvey.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (backToMainBtn && hiddenSurvey) {
    backToMainBtn.addEventListener('click', function() {
      const sectionsToShow = document.querySelectorAll('section.section, header, footer');
      sectionsToShow.forEach(element => element.style.display = 'block');
      hiddenSurvey.style.display = 'none';
      const surveyMain = document.getElementById('surveyMain');
      if (surveyMain) window.scrollTo({ 
        top: surveyMain.offsetTop - 80, 
        behavior: 'smooth' 
      });
    });
  }
  const surveyForm = document.getElementById('surveyForm');
  if (surveyForm) {
    surveyForm.addEventListener('submit', function(e) {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('surveyFormMessage', 'Bitte eine gültige E-Mail-Adresse eingeben.', false);
        return;
      }
      const surveyData = { name, email, q1, q2, q3, q4 };
      if (storeData(STORAGE_KEYS.SURVEYS, surveyData)) {
        showMessage('surveyFormMessage', '✅ Vielen Dank für deine Teilnahme! Deine Antworten wurden gespeichert.');
        surveyForm.reset();
        setTimeout(() => { if (backToMainBtn) backToMainBtn.click(); }, 3000);
      }
    });
  }

  // ================= ADMIN-BEREICH =================
  const adminToggleBtn = document.getElementById('adminToggleBtn');
  const adminOverlay = document.getElementById('adminOverlay');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  let lastScrollPosition = 0;
  
  if (adminToggleBtn && adminOverlay) {
    adminToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lastScrollPosition = window.scrollY;
      adminOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      const adminLoginForm = document.getElementById('adminLoginForm');
      const adminDataView = document.getElementById('adminDataView');
      if (adminLoginForm) adminLoginForm.style.display = 'block';
      if (adminDataView) adminDataView.style.display = 'none';
      document.getElementById('adminUser').value = '';
      document.getElementById('adminPass').value = '';
      const loginMsg = document.getElementById('adminLoginMessage');
      if (loginMsg) { loginMsg.textContent = ''; loginMsg.style.display = 'none'; }
    });
  }
  
  if (closeAdminBtn && adminOverlay) {
    closeAdminBtn.addEventListener('click', () => {
      adminOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      window.scrollTo(0, lastScrollPosition);
    });
  }
  
  if (adminOverlay) {
    adminOverlay.addEventListener('click', (e) => {
      if (e.target === adminOverlay) {
        adminOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        window.scrollTo(0, lastScrollPosition);
      }
    });
  }
  
  const adminBox = document.querySelector('.admin-box');
  if (adminBox) adminBox.addEventListener('click', (e) => e.stopPropagation());

  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('adminUser')?.value.trim();
      const password = document.getElementById('adminPass')?.value;
      if (!username || !password) {
        showMessage('adminLoginMessage', 'Bitte Benutzername und Passwort eingeben.', false);
        return;
      }
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        showMessage('adminLoginMessage', '✅ Login erfolgreich! Lade Daten...', true);
        setTimeout(() => {
          this.style.display = 'none';
          const adminDataView = document.getElementById('adminDataView');
          if (adminDataView) adminDataView.style.display = 'block';
          document.getElementById('adminLoginMessage').style.display = 'none';
          loadAdminData();
        }, 1000);
      } else {
        showMessage('adminLoginMessage', '❌ Falsche Login-Daten. Bitte versuche es erneut.', false);
      }
    });
  }

  // Tab-Wechsel Event-Listener
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentTab = this.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
      const tabContent = document.getElementById(`${currentTab}Tab`);
      if (tabContent) tabContent.style.display = 'block';
      
      // Leere die Auswahl beim Tab-Wechsel
      selectedDataEntries.clear();
      updateSelectedCount();
      
      // Entferne "selected" Klasse von allen Einträgen im neuen Tab
      const checkboxes = tabContent.querySelectorAll('.data-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const entryElement = checkbox.closest('.data-entry');
        if (entryElement) {
          entryElement.classList.remove('selected');
        }
      });
    });
  });

  // Event-Listener für Admin-Kontrollbuttons
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
  
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', selectAllEntries);
  }
  
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', deselectAllEntries);
  }
  
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', deleteSelectedEntries);
  }
  
  if (downloadSelectedBtn) {
    downloadSelectedBtn.addEventListener('click', downloadSelectedEntries);
  }

  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', function() {
      try {
        const allData = {
          exportDate: new Date().toISOString(),
          contacts: getStoredData(STORAGE_KEYS.CONTACTS),
          newsletter: getStoredData(STORAGE_KEYS.NEWSLETTER),
          surveys: getStoredData(STORAGE_KEYS.SURVEYS)
        };
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `livius_website_daten_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        showToast('Alle Daten wurden als JSON exportiert.', 'success');
      } catch (error) {
        console.error('Fehler beim Exportieren:', error);
        showToast('Fehler beim Exportieren der Daten', 'error');
      }
    });
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      document.getElementById('adminDataView').style.display = 'none';
      document.getElementById('adminLoginForm').style.display = 'block';
      document.getElementById('adminLoginForm').reset();
      const loginMsg = document.getElementById('adminLoginMessage');
      if (loginMsg) { loginMsg.textContent = ''; loginMsg.style.display = 'none'; }
      selectedDataEntries.clear();
      updateSelectedCount();
    });
  }
});

function loadAdminData() {
  try {
    const contacts = getStoredData(STORAGE_KEYS.CONTACTS);
    const newsletter = getStoredData(STORAGE_KEYS.NEWSLETTER);
    const surveys = getStoredData(STORAGE_KEYS.SURVEYS);
    
    // Update Counters in Tab-Buttons
    document.getElementById('contactsCount').textContent = contacts.length;
    document.getElementById('newsletterCount').textContent = newsletter.length;
    document.getElementById('surveysCount').textContent = surveys.length;
    
    // Leere die aktuelle Auswahl
    selectedDataEntries.clear();
    updateSelectedCount();
    
    // Kontakte rendern
    let contactsHTML = '';
    if (contacts.length === 0) {
      contactsHTML = '<p class="no-data">Noch keine Kontaktanfragen.</p>';
    } else {
      contacts.forEach((contact) => {
        const date = contact.timestamp ? new Date(contact.timestamp).toLocaleString('de-CH') : 'Unbekannt';
        contactsHTML += `
          <div class="data-entry" data-id="${contact.id}">
            <input type="checkbox" class="data-checkbox" data-id="${contact.id}">
            <strong>${contact.name} (${contact.email})</strong>
            <p>${contact.message}</p>
            <small>${date}</small>
          </div>`;
      });
    }
    document.getElementById('contactsList').innerHTML = contactsHTML;
    
    // Newsletter rendern
    let newsletterHTML = '';
    if (newsletter.length === 0) {
      newsletterHTML = '<p class="no-data">Noch keine Newsletter-Anmeldungen.</p>';
    } else {
      newsletter.forEach((entry) => {
        const date = entry.timestamp ? new Date(entry.timestamp).toLocaleString('de-CH') : 'Unbekannt';
        newsletterHTML += `
          <div class="data-entry" data-id="${entry.id}">
            <input type="checkbox" class="data-checkbox" data-id="${entry.id}">
            <strong>${entry.name}</strong>
            <p>${entry.email}</p>
            <small>${date}</small>
          </div>`;
      });
    }
    document.getElementById('newsletterList').innerHTML = newsletterHTML;
    
    // Umfragen rendern
    const q1Labels = { tutorials: 'Tutorials & Technik', shorts: 'Kurze Parkour-Clips', training: 'Trainingspläne', behind: 'Behind the Scenes' };
    const q2Labels = { daily: 'Täglich', weekly: 'Mehrmals pro Woche', monthly: 'Ein paar Mal im Monat', rarely: 'Selten' };
    const q4Labels = { yes: 'Ja, auf jeden Fall!', maybe: 'Vielleicht', no: 'Nein, eher nicht' };
    
    let surveysHTML = '';
    if (surveys.length === 0) {
      surveysHTML = '<p class="no-data">Noch keine Umfrage-Antworten.</p>';
    } else {
      surveys.forEach((survey) => {
        const date = survey.timestamp ? new Date(survey.timestamp).toLocaleString('de-CH') : 'Unbekannt';
        surveysHTML += `
          <div class="data-entry" data-id="${survey.id}">
            <input type="checkbox" class="data-checkbox" data-id="${survey.id}">
            <strong>${survey.name} (${survey.email})</strong>
            <p><strong>Bevorzugter Inhalt:</strong> ${q1Labels[survey.q1] || survey.q1}</p>
            <p><strong>Konsumhäufigkeit:</strong> ${q2Labels[survey.q2] || survey.q2}</p>
            <p><strong>Workshop-Interesse:</strong> ${q4Labels[survey.q4] || survey.q4}</p>
            ${survey.q3 ? `<p><strong>Herausforderung:</strong> ${survey.q3}</p>` : ''}
            <small>${date}</small>
          </div>`;
      });
    }
    document.getElementById('surveysList').innerHTML = surveysHTML;
    
  } catch (error) {
    console.error('Fehler beim Laden der Admin-Daten:', error);
    const messageElement = document.getElementById('adminLoginMessage');
    if (messageElement) {
      messageElement.textContent = '❌ Fehler beim Laden der Daten.';
      messageElement.className = 'form-message error';
      messageElement.style.display = 'block';
    }
  }
}