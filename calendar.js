document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.querySelector('.live-calendar-shell');
  if (!calendar) return;

  const source = calendar.dataset.calendarSource;
  const title = calendar.querySelector('[data-calendar-title]');
  const grid = calendar.querySelector('[data-calendar-grid]');
  const details = calendar.querySelector('[data-calendar-details]');
  const previous = calendar.querySelector('[data-calendar-previous]');
  const next = calendar.querySelector('[data-calendar-next]');
  const categoryClass = {
    'Holiday/ School Closed': 'calendar-event--closed',
    'Benchmark Testing': 'calendar-event--testing',
    'Standardized Testing': 'calendar-event--testing',
    'Start/End of Quarter': 'calendar-event--quarter',
    'School Events': 'calendar-event--event',
    'First day for students': 'calendar-event--event',
    'Last Day of School': 'calendar-event--event',
    'Staff Orientation': 'calendar-event--staff',
    'Parent Orientation': 'calendar-event--staff'
  };
  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  let events = [];
  let selectedDate = null;
  let displayedMonth = new Date();
  displayedMonth.setDate(1);

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && text[index + 1] === '\n') index += 1;
        row.push(cell);
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }
    row.push(cell);
    if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }

  function parseDate(value) {
    const [year, month, day] = value.trim().split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function eventsForDate(date) {
    const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return events.filter(event => timestamp >= event.start.getTime() && timestamp <= event.end.getTime());
  }

  function showDetails(date) {
    const dayEvents = eventsForDate(date);
    selectedDate = dateKey(date);
    if (!dayEvents.length) {
      details.innerHTML = `<p><strong>${dateFormatter.format(date)}</strong><br>No scheduled school events.</p>`;
    } else {
      details.innerHTML = `<p class="live-calendar-details-date">${dateFormatter.format(date)}</p><ul>${dayEvents.map(event => `<li><span class="calendar-event ${categoryClass[event.category] || 'calendar-event--event'}">${event.category}</span><span>${event.event}</span></li>`).join('')}</ul>`;
    }
    renderCalendar();
  }

  function renderCalendar() {
    title.textContent = monthFormatter.format(displayedMonth);
    grid.innerHTML = '';
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const leadingDays = firstDay.getDay();

    for (let index = 0; index < leadingDays; index += 1) {
      grid.insertAdjacentHTML('beforeend', '<div class="live-calendar-day live-calendar-day--empty" aria-hidden="true"></div>');
    }

    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      const dayEvents = eventsForDate(date);
      const isSelected = selectedDate === dateKey(date);
      const eventButtons = dayEvents.slice(0, 2).map(event => `<span class="calendar-event ${categoryClass[event.category] || 'calendar-event--event'}">${event.event}</span>`).join('');
      const overflow = dayEvents.length > 2 ? `<span class="calendar-event-more">+${dayEvents.length - 2} more</span>` : '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `live-calendar-day${dayEvents.length ? ' live-calendar-day--has-event' : ''}${isSelected ? ' live-calendar-day--selected' : ''}`;
      button.setAttribute('aria-label', `${dateFormatter.format(date)}${dayEvents.length ? `, ${dayEvents.map(event => event.event).join(', ')}` : ''}`);
      button.innerHTML = `<span class="live-calendar-date">${day}</span><span class="live-calendar-events">${eventButtons}${overflow}</span>`;
      button.addEventListener('click', () => showDetails(date));
      grid.appendChild(button);
    }
  }

  previous.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  next.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  fetch(source)
    .then(response => {
      if (!response.ok) throw new Error('Unable to load the live calendar.');
      return response.text();
    })
    .then(text => {
      const rows = parseCsv(text);
      events = rows.slice(1).map(row => ({
        start: parseDate(row[0]),
        end: parseDate(row[1]),
        event: row[2],
        category: row[3]
      })).filter(event => !Number.isNaN(event.start.getTime()) && !Number.isNaN(event.end.getTime()) && event.event);
      if (!events.length) throw new Error('No calendar events are available yet.');
      const today = new Date();
      const firstEvent = events.reduce((earliest, event) => event.start < earliest ? event.start : earliest, events[0].start);
      const lastEvent = events.reduce((latest, event) => event.end > latest ? event.end : latest, events[0].end);
      if (today >= firstEvent && today <= lastEvent) displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      else displayedMonth = new Date(firstEvent.getFullYear(), firstEvent.getMonth(), 1);
      renderCalendar();
    })
    .catch(() => {
      grid.innerHTML = '<p class="live-calendar-loading">The live calendar is temporarily unavailable. Please use the PDF version below.</p>';
    });
});
