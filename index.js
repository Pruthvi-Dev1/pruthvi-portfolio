// Progress bar
const progress = document.getElementById('progress');

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progress.style.width = pct + '%';
});

// Fade-up animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

// Counter animation for metrics
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 40;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target + '+';
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + '+';
      }
    }, 40);
  });
}

const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounters();
      metricsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const metricsSection = document.getElementById('metrics');
if (metricsSection) {
  metricsObserver.observe(metricsSection);
}

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 50 ? '0 1px 24px rgba(0,0,0,0.4)' : 'none';
});

// Contact form handler
function handleSubmit(event) {
  event.preventDefault();
  const btn = event.target.querySelector('.form-submit');
  btn.textContent = 'Message Sent! ✓';
  btn.style.background = 'var(--green)';

  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    event.target.reset();
  }, 3000);
}

// Make handleSubmit globally accessible
window.handleSubmit = handleSubmit;