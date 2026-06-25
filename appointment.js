/**
 * Callora — Appointment Booking Form Handler
 * Uses EmailJS for sending form submissions.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  IMPORTANT: Replace the placeholder values below with   │
 * │  your actual EmailJS credentials before deploying.      │
 * │                                                         │
 * │  1. YOUR_PUBLIC_KEY  → EmailJS Dashboard > Account >    │
 * │                        API Keys > Public Key            │
 * │  2. YOUR_SERVICE_ID  → EmailJS Dashboard > Email        │
 * │                        Services > Service ID            │
 * │  3. YOUR_TEMPLATE_ID → EmailJS Dashboard > Email        │
 * │                        Templates > Template ID          │
 * └─────────────────────────────────────────────────────────┘
 */

// ============================================================
// EmailJS Configuration — Replace these placeholder values
// ============================================================
const EMAILJS_PUBLIC_KEY = 'OG-AkzN3HNAKtmEsF';      // ← Replace with your EmailJS Public Key
const EMAILJS_SERVICE_ID = 'service_ukx8niu';      // ← Replace with your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_0xc4dre';    // ← Replace with your EmailJS Template ID

// ============================================================
// Initialize EmailJS
// ============================================================
(function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
    });
  } else {
    console.warn('EmailJS SDK not loaded. Form submission will not work.');
  }
})();

// ============================================================
// DOM Elements
// ============================================================
const form = document.getElementById('appointmentForm');
const formCard = document.getElementById('formCard');
const submitBtn = document.getElementById('submitBtn');
const successState = document.getElementById('successState');
const errorToast = document.getElementById('errorToast');
const errorToastMessage = document.getElementById('errorToastMessage');
const retryBtn = document.getElementById('retryBtn');

// ============================================================
// Validation Rules
// ============================================================
const validators = {
  fullName: {
    element: () => document.getElementById('fullName'),
    errorEl: () => document.getElementById('fullNameError'),
    validate: (value) => value.trim().length >= 2,
    message: 'Please enter your full name',
  },
  email: {
    element: () => document.getElementById('email'),
    errorEl: () => document.getElementById('emailError'),
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: 'Please enter a valid email address',
  },
  phone: {
    element: () => document.getElementById('phone'),
    errorEl: () => document.getElementById('phoneError'),
    validate: (value) => /^[\+]?[\d\s\-\(\)]{7,20}$/.test(value.trim()),
    message: 'Please enter a valid phone number',
  },
  service: {
    element: () => document.getElementById('service'),
    errorEl: () => document.getElementById('serviceError'),
    validate: (value) => value !== '',
    message: 'Please select a service',
  },
};

// ============================================================
// Real-time Validation — clear errors on input
// ============================================================
Object.keys(validators).forEach((key) => {
  const config = validators[key];
  const el = config.element();
  if (!el) return;

  const eventType = el.tagName === 'SELECT' ? 'change' : 'input';

  el.addEventListener(eventType, () => {
    if (config.validate(el.value)) {
      el.classList.remove('error');
      const errorEl = config.errorEl();
      if (errorEl) errorEl.classList.remove('visible');
    }
  });

  // Also clear on blur if valid
  el.addEventListener('blur', () => {
    if (el.value && config.validate(el.value)) {
      el.classList.remove('error');
      const errorEl = config.errorEl();
      if (errorEl) errorEl.classList.remove('visible');
    }
  });
});

// ============================================================
// Validate All Fields
// ============================================================
function validateForm() {
  let isValid = true;
  let firstErrorField = null;

  Object.keys(validators).forEach((key) => {
    const config = validators[key];
    const el = config.element();
    const errorEl = config.errorEl();
    if (!el) return;

    if (!config.validate(el.value)) {
      isValid = false;
      el.classList.add('error');
      if (errorEl) {
        errorEl.querySelector('span').textContent = config.message;
        errorEl.classList.add('visible');
      }
      if (!firstErrorField) firstErrorField = el;
    } else {
      el.classList.remove('error');
      if (errorEl) errorEl.classList.remove('visible');
    }
  });

  // Scroll to first error field on mobile
  if (firstErrorField) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

// ============================================================
// Collect Form Data
// ============================================================
function getFormData() {
  return {
    fullName: document.getElementById('fullName')?.value.trim() || '',
    companyName: document.getElementById('companyName')?.value.trim() || 'Not provided',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    service: document.getElementById('service')?.value || '',
    meetingDate: document.getElementById('meetingDate')?.value || 'Not specified',
    meetingTime: document.getElementById('meetingTime')?.value || 'Not specified',
    budget: document.getElementById('budget')?.value.trim() || 'Not specified',
    description: document.getElementById('description')?.value.trim() || 'Not provided',
  };
}

// ============================================================
// Set Loading State
// ============================================================
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// ============================================================
// Show Success
// ============================================================
function showSuccess() {
  formCard.style.display = 'none';
  successState.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Show / Hide Error Toast
// ============================================================
let errorToastTimeout = null;

function showError(message) {
  if (errorToastTimeout) clearTimeout(errorToastTimeout);

  errorToastMessage.textContent = message || 'Something went wrong. Please try again.';
  errorToast.classList.add('visible');

  errorToastTimeout = setTimeout(() => {
    hideError();
  }, 8000);
}

function hideError() {
  errorToast.classList.remove('visible');
  if (errorToastTimeout) {
    clearTimeout(errorToastTimeout);
    errorToastTimeout = null;
  }
}

// ============================================================
// Send Email via EmailJS
// ============================================================
async function sendEmail(data) {
  // Build the template params — these should match your EmailJS template variables
  const templateParams = {
    from_name: data.fullName,
    from_email: data.email,
    to_email: 'callora330@gmail.com',
    phone: data.phone,
    company_name: data.companyName,
    service: data.service,
    meeting_date: data.meetingDate,
    meeting_time: data.meetingTime,
    budget: data.budget,
    description: data.description,
    // Full message body for email
    message: `
New Appointment Request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Name: ${data.fullName}
Company: ${data.companyName}
Email: ${data.email}
Phone: ${data.phone}

Service Required: ${data.service}
Preferred Date: ${data.meetingDate}
Preferred Time: ${data.meetingTime}
Project Budget: ${data.budget}

Project Description:
${data.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent from Callora Appointment Form
    `.trim(),
  };

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// ============================================================
// Form Submit Handler
// ============================================================
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideError();

  // Validate
  if (!validateForm()) return;

  // Collect data
  const formData = getFormData();

  // Show loading
  setLoading(true);

  try {
    await sendEmail(formData);
    showSuccess();
  } catch (error) {
    console.error('EmailJS Error:', error);
    showError('Failed to send your request. Please check your connection and try again.');
    setLoading(false);
  }
});

// ============================================================
// Retry Button
// ============================================================
retryBtn.addEventListener('click', function () {
  hideError();
  form.dispatchEvent(new Event('submit', { cancelable: true }));
});

// ============================================================
// Set minimum date to today for the date picker
// ============================================================
(function setMinDate() {
  const dateInput = document.getElementById('meetingDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
})();
