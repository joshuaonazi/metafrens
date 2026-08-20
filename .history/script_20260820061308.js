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

  // =========================================
  // EVENTS CALENDAR — dynamic month grid
  // =========================================
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calGrid = document.getElementById('calGrid');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Icons cycle through these events so the grid stays visually varied.
  const eventIcons = [
    '<path d="M12 2 3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M9 22h6"/>',
    '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    '<path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z"/>',
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  ];

  // --- Demo event data, keyed by day-of-month (1–31) ---
  // These repeat on that day-of-month in every month so the calendar has
  // something to show while you page around. Replace this with real,
  // date-specific data when you have it — see the commented example below
  // for the recommended format (one entry per exact date, not repeating).
  const demoEventsByDay = {
    1:  { title: 'Community Kickoff',  time: '11:00 AM – 1:00 PM',  icon: 0 },
    3:  { title: 'Web3 Workshop',      time: '02:00 PM – 04:00 PM', icon: 1 },
    5:  { title: 'Founder Talks',      time: '06:00 PM – 08:00 PM', icon: 2 },
    9:  { title: 'AI in Web3 Panel',   time: '05:00 PM – 07:00 PM', icon: 4 },
    13: { title: 'Community AMA',      time: '04:00 PM – 05:30 PM', icon: 5 },
    18: { title: 'Build Session #12',  time: '02:00 PM – 05:00 PM', icon: 3 },
    24: { title: 'Product Demo Day',   time: '03:00 PM – 06:00 PM', icon: 4 },
    27: { title: 'Networking Mixer',   time: '06:00 PM – 09:00 PM', icon: 2 }
  };

  /* --- To switch to real, per-date events instead of the day-of-month
     demo above, replace demoEventsByDay with something keyed by full
     date ("YYYY-M-D", month is 1-indexed here) and update getEventFor()
     to read from it, e.g.:

     const realEvents = {
       '2026-8-14': { title: 'MetaFrens Community AMA', time: '4:00 PM – 5:30 PM', icon: 5 },
       '2026-9-3':  { title: 'Genesis NFT Drop',         time: '12:00 PM – 1:00 PM', icon: 1 },
     };
     function getEventFor(year, month, day) {
       return realEvents[`${year}-${month + 1}-${day}`];
     }
  */
  function getEventFor(year, month, day) {
    return demoEventsByDay[day];
  }

  let calDate = new Date(2026, 7, 1); // starts August 2026 (month is 0-indexed)

  function buildCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    calMonthLabel.textContent = `${monthNames[month]} ${year}`;

    // Clear previously generated day cells (keep the 7 .cal-dow headers)
    calGrid.querySelectorAll('.cal-cell').forEach(cell => cell.remove());

    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // JS getDay(): 0=Sun..6=Sat. Convert to a Monday-first offset (0=Mon..6=Sun).
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < leadingBlanks; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      fragment.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';

      const daynum = document.createElement('span');
      daynum.className = 'cal-daynum';
      daynum.textContent = day;
      cell.appendChild(daynum);

      const eventData = getEventFor(year, month, day);
      if (eventData) {
        const shortMonth = monthNames[month].slice(0, 3);
        const eventEl = document.createElement('div');
        eventEl.className = 'cal-event';
        eventEl.innerHTML = `
          <div class="cal-event-top">
            <span class="cal-event-date"><i class="cal-dot"></i>${day} ${shortMonth}</span>
            <span class="cal-event-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${eventIcons[eventData.icon % eventIcons.length]}</svg>
            </span>
          </div>
          <p class="cal-event-title">${eventData.title}</p>
          <p class="cal-event-time">${eventData.time}</p>
        `;
        cell.appendChild(eventEl);
      }

      fragment.appendChild(cell);
    }

    // Trailing blanks so the last row completes a full week visually
    const totalCells = leadingBlanks + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      fragment.appendChild(cell);
    }

    calGrid.appendChild(fragment);
  }

  calPrev?.addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() - 1);
    buildCalendar(calDate);
  });

  calNext?.addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() + 1);
    buildCalendar(calDate);
  });

  buildCalendar(calDate);

});