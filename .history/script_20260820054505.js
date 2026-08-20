// =========================================
// METAFRENS — MAIN SCRIPT
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // --- Header shadow on scroll ---
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // --- Mobile menu toggle ---
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    menuToggle.classList.toggle('active');
  });

  // Close mobile menu after tapping a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });

  // --- Scrollspy: highlight active nav link based on section in view ---
  const headerHeight = header.offsetHeight;

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: `-${headerHeight + 10}px 0px -60% 0px`,
    threshold: 0.1
  });

  sections.forEach(section => spyObserver.observe(section));

});

// Calendar nav buttons — starts at August 2026, scrolls forward/back indefinitely
const calPrev = document.getElementById('calPrev');
const calNext = document.getElementById('calNext');
const calMonthLabel = document.getElementById('calMonthLabel');

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Start date: August 2026
let calDate = new Date(2026, 7, 1); // month is 0-indexed, so 7 = August

function renderCalMonth() {
  calMonthLabel.textContent = `${monthNames[calDate.getMonth()]} ${calDate.getFullYear()}`;
}

calPrev?.addEventListener('click', () => {
  calDate.setMonth(calDate.getMonth() - 1);
  renderCalMonth();
});

calNext?.addEventListener('click', () => {
  calDate.setMonth(calDate.getMonth() + 1);
  renderCalMonth();
});

renderCalMonth(); // set initial label on load