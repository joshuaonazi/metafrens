// =========================================
// METAFRENS — MAIN SCRIPT
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // --- Dark / light theme toggle ---
  // Initial theme (on page load) is set synchronously in <head> to avoid
  // a flash of the wrong theme — this just handles clicking the toggle.
  const themeToggle = document.getElementById('themeToggle');

  themeToggle?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('metafrens-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('metafrens-theme', 'light');
    }
  });

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

  document.querySelectorAll('.team-track').forEach(track => {
    Array.from(track.children).forEach(member => {
      track.appendChild(member.cloneNode(true));
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

    // ===== Mobile event details modal =====
  const eventModalOverlay = document.getElementById('eventModalOverlay');
  const eventModalClose = document.getElementById('eventModalClose');
  const eventModalTitle = document.getElementById('eventModalTitle');
  const eventModalTime = document.getElementById('eventModalTime');
  const eventModalXLink = document.getElementById('eventModalXLink');
  const eventModalCalBtn = document.getElementById('eventModalCalBtn');

  function openEventModal(ev) {
    eventModalTitle.textContent = ev.title;
    eventModalTime.textContent = ev.time;

    if (ev.link) {
      eventModalXLink.href = ev.link;
      eventModalXLink.style.display = 'flex';
    } else {
      eventModalXLink.style.display = 'none';
    }

    eventModalCalBtn.onclick = () => addToCalendar(ev);
    eventModalCalBtn.style.display = ev.startUTC ? 'flex' : 'none';

    eventModalOverlay.classList.add('open');
  }

  function closeEventModal() {
    eventModalOverlay.classList.remove('open');
  }

  eventModalClose.addEventListener('click', closeEventModal);
  eventModalOverlay.addEventListener('click', (e) => {
    if (e.target === eventModalOverlay) closeEventModal();
  });

  // ICS Generator + Add to Calendar on each event box
  function fmtICS(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function isApplePlatform() {
  return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document || /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function makeICSBlobUrl(ev) {
  const end = new Date(ev.startUTC.getTime() + ev.durationMinutes * 60000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${ev.title.replace(/\s+/g, '-')}-${fmtICS(ev.startUTC)}@metafrens`,
    `DTSTAMP:${fmtICS(new Date())}`,
    `DTSTART:${fmtICS(ev.startUTC)}`,
    `DTEND:${fmtICS(end)}`,
    `SUMMARY:${ev.title}`,
    ev.link ? `URL:${ev.link}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function makeGoogleCalUrl(ev) {
  const end = new Date(ev.startUTC.getTime() + ev.durationMinutes * 60000);
  const dates = `${fmtICS(ev.startUTC)}/${fmtICS(end)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates,
    details: ev.link ? `More info: ${ev.link}` : ''
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function addToCalendar(ev) {
  if (isApplePlatform()) {
    const url = makeICSBlobUrl(ev);
    window.open(url, '_blank');
    // Free the blob shortly after — the browser has already opened it
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } else {
    window.open(makeGoogleCalUrl(ev), '_blank');
  }
}

  // --- Recurring weekly events ---
  // Alpha Nights = every Friday, Metafrens Hangout = every Sunday.
  // These repeat automatically in every month, forever — no per-date
  // data needed. One-off events added via the team dashboard
  // (admin.html) are fetched from Firestore below and layered on top,
  // keyed the same way ("YYYY-M-D") so they take priority over the
  // recurring schedule on any day they land on.
  const specialEvents = {};

  function getEventFor(year, month, day) {
    const key = `${year}-${month + 1}-${day}`;
    if (specialEvents[key]) return specialEvents[key];

    const dayOfWeek = new Date(year, month, day).getDay(); // 0=Sun..6=Sat
    const recurringStart = new Date(Date.UTC(year, month, day, 20, 0)); // 8:00 PM UTC
    const metafrensXLink = 'https://x.com/Metafrens01';

    if (dayOfWeek === 5) {
      return { title: 'Alpha Night', time: '8:00 PM UTC', icon: 4, startUTC: recurringStart, durationMinutes: 60, link: metafrensXLink };
    }
    if (dayOfWeek === 0) {
      return { title: 'Metafrens Hangout', time: '8:00 PM UTC', icon: 5, startUTC: recurringStart, durationMinutes: 60, link: metafrensXLink };
    }
    return null;
  }

  let calDate = new Date();
  calDate.setDate(1); // normalize to the 1st, so month navigation doesn't skip months

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

        const contentHtml = `
          <div class="cal-event-top">
            <span class="cal-event-date"><i class="cal-dot"></i>${day} ${shortMonth}</span>
            <span class="cal-event-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${eventIcons[eventData.icon % eventIcons.length]}</svg>
            </span>
          </div>
          <p class="cal-event-title">${eventData.title}</p>
          <p class="cal-event-time">${eventData.time}</p>
        `;

        // Most of the card is a real link to X, when one exists
        if (eventData.link) {
          eventEl.innerHTML = `<a class="cal-event-link" href="${eventData.link}" target="_blank" rel="noopener noreferrer">${contentHtml}</a>`;
        } else {
          eventEl.innerHTML = `<div class="cal-event-link">${contentHtml}</div>`;
        }

        // A separate, sibling button (not nested inside the link above) —
        // opens the visitor's own calendar app directly (Apple on iOS,
        // Google everywhere else) instead of downloading a file
        if (eventData.startUTC) {
          const addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'cal-event-add';
          addBtn.title = 'Add to calendar';
          addBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M12 11v6M9 14h6"/></svg>`;
          addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCalendar(eventData);
          });
          eventEl.appendChild(addBtn);
        }

                // On small screens, tapping the card opens a details popup instead
        // of navigating away directly — gives room for both actions clearly.
        if (window.innerWidth <= 600) {
          eventEl.querySelector('.cal-event-link').addEventListener('click', (e) => {
            e.preventDefault();
            openEventModal(eventData);
          });
        }

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

    // --- Pull one-off events added via the team dashboard (admin.html) ---
  // Read-only here: this site only READS from Supabase, never writes.
  // Requires the same Supabase project/keys as admin.html.
  (async () => {
    try {
      // ===== Must match the values in admin.html exactly =====
      const SUPABASE_URL = "https://xgodiozmztigjssltlnd.supabase.co";
      const SUPABASE_ANON_KEY = "sb_publishable_pSz15pbT1--qwepB0u2TGA_ig2VZ2mX";
      // =========================================================

      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      async function refreshEvents() {
        const { data, error } = await supabaseClient.from('events').select('*');
        if (error) return;
        Object.keys(specialEvents).forEach(key => delete specialEvents[key]);
        (data || []).forEach((ev) => {
          const startDate = new Date(ev.start_utc);
          const timeLabel = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', timeZone: 'UTC'
          }) + ' UTC';
          specialEvents[ev.date_key] = {
            title: ev.title,
            time: timeLabel,
            icon: ev.icon,
            link: ev.link,
            startUTC: startDate,
            durationMinutes: ev.duration_minutes
          };
        });
        buildCalendar(calDate);
      }

      await refreshEvents();

      supabaseClient
        .channel('public-events-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, refreshEvents)
        .subscribe();

    } catch (err) {
      console.warn('Dashboard events unavailable:', err.message);
    }
  })();

});