/* ─── Progress bar ─── */
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progress.style.width = pct + '%';
});

/* ─── Nav shadow ─── */
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.boxShadow =
    window.scrollY > 50 ? '0 1px 24px rgba(0,0,0,.4)' : 'none';
});

/* ─── Fade-up on scroll ─── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ─── Skill tabs ─── */
const tabs = document.querySelectorAll('.skill-tab');
const panels = document.querySelectorAll('.skill-panel');

function activateTab(tabEl) {
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  tabEl.classList.add('active');
  const id = 'tab-' + tabEl.dataset.tab;
  const panel = document.getElementById(id);
  if (panel) {
    panel.classList.add('active');
    // animate bars inside this panel
    panel.querySelectorAll('.skill-bar-item').forEach(item => {
      const fill = item.querySelector('.sbi-fill');
      const pct = item.dataset.pct || 0;
      // reset then animate
      fill.style.width = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { fill.style.width = pct + '%'; });
      });
    });
  }
}

tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));

/* ─── Animate bars when skills section enters viewport ─── */
const skillsSection = document.getElementById('skills');
let skillsAnimated = false;

const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !skillsAnimated) {
      skillsAnimated = true;
      // animate bars in the currently active panel
      const activePanel = document.querySelector('.skill-panel.active');
      if (activePanel) {
        activePanel.querySelectorAll('.skill-bar-item').forEach((item, i) => {
          const fill = item.querySelector('.sbi-fill');
          const pct = item.dataset.pct || 0;
          fill.style.width = '0';
          setTimeout(() => { fill.style.width = pct + '%'; }, i * 100);
        });
      }
    }
  });
}, { threshold: 0.2 });

if (skillsSection) skillsObserver.observe(skillsSection);

/* ─── Metrics counter animation ─── */
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
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
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); metricsObserver.disconnect(); }
  });
}, { threshold: 0.3 });

const metricsSection = document.getElementById('metrics');
if (metricsSection) metricsObserver.observe(metricsSection);

/* ─── Contact form ─── */
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
window.handleSubmit = handleSubmit;
