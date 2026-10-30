/* Dikke Zeehond - public recruitment form.
   No cookies, localStorage, trackers or external libraries.
   Uses the same POST /api/contact contract as the supplied Home.tsx.
   The backend must validate, limit requests and only confirm accepted mail.
*/
(function () {
  'use strict';
  const ROLES = ['Bediening', 'Bar', 'Keuken', 'Afwas', 'Allround', 'Nog niet zeker'];
  const WORK_TYPES = ['In overleg', 'Een bijbaan', 'Werk tijdens mijn tussenjaar', 'Seizoenswerk', 'Een vaste baan / nieuwe uitdaging'];
  const START_MODES = ['Zo snel mogelijk', 'Vanaf een datum', 'In overleg'];
  const HOURS = ['In overleg', 'Tot 8 uur', '8 tot 16 uur', '16 tot 24 uur', '24 tot 32 uur', '32 tot 40 uur'];
  const PERIODS = ['In overleg', 'Een paar weken', '1 tot 3 maanden', '3 tot 6 maanden', 'Langer / voor langere tijd', 'Tot een bepaalde datum'];
  const EXPERIENCE = ['Bespreken we samen', 'Nog geen horeca-ervaring', 'Een beetje ervaring', 'Al meerdere jaren ervaring'];
  const CONTACTS = ['E-mail', 'Bellen', 'WhatsApp'];
  const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);
  const oneOf = (value, values, fallback) => values.includes(value) ? value : fallback;
  const isoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0,10) === value;
  function today() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  function normalize(raw) {
    return {
      roles: [...new Set(Array.isArray(raw.roles) ? raw.roles.filter(r => ROLES.includes(r)) : [])],
      workType: oneOf(raw.workType, WORK_TYPES, 'In overleg'),
      startMode: oneOf(raw.startMode, START_MODES, 'In overleg'),
      startDate: clean(raw.startDate, 10),
      hours: oneOf(raw.hours, HOURS, 'In overleg'),
      period: oneOf(raw.period, PERIODS, 'In overleg'),
      endDate: clean(raw.endDate, 10),
      availability: clean(raw.availability, 400),
      name: clean(raw.name, 150), email: clean(raw.email, 254), phone: clean(raw.phone, 40),
      contactPreference: oneOf(raw.contactPreference, CONTACTS, 'E-mail'),
      experience: oneOf(raw.experience, EXPERIENCE, 'Bespreken we samen'),
      salaryMode: raw.salaryMode === 'Ik heb een bedrag in gedachten' ? raw.salaryMode : 'Bespreken we samen',
      salary: clean(raw.salary, 12),
      salaryUnit: raw.salaryUnit === 'bruto per maand' ? raw.salaryUnit : 'bruto per uur',
      note: clean(raw.note, 1200), website: clean(raw.website, 200),
    };
  }
  function validateStep(d, step, currentDate) {
    const errors = [];
    const add = (id, message) => errors.push({ id, message });
    const date = currentDate || today();
    if (step === 0 && !d.roles.length) add('roles-group', 'Kies wat je leuk lijkt, of tik op "Nog niet zeker".');
    if (step === 1) {
      if (d.startMode === 'Vanaf een datum' && (!isoDate(d.startDate) || d.startDate < date)) add('startDate', 'Kies een geldige startdatum vanaf vandaag, of kies "In overleg".');
      if (d.period === 'Tot een bepaalde datum') {
        const earliest = d.startMode === 'Vanaf een datum' && isoDate(d.startDate) ? d.startDate : date;
        if (!isoDate(d.endDate) || d.endDate < earliest) add('endDate', 'Kies een einddatum die niet voor je startdatum ligt.');
      }
    }
    if (step === 2) {
      if (!d.name) add('name', 'Vul je naam in, dan weten we met wie we kennismaken.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) add('email', 'Vul een geldig e-mailadres in.');
      const digits = d.phone.replace(/\D/g, '');
      if (d.phone && (digits.length < 7 || digits.length > 16)) add('phone', 'Controleer je telefoonnummer, inclusief eventueel je landcode.');
      if (d.contactPreference !== 'E-mail' && !d.phone) add('phone', 'Vul voor bellen of WhatsApp je telefoonnummer in, of kies e-mail.');
      if (d.salaryMode === 'Ik heb een bedrag in gedachten') {
        if (!/^\d{1,5}([,.]\d{1,2})?$/.test(d.salary) || Number(d.salary.replace(',', '.')) <= 0) add('salary', 'Vul een positief bedrag in, bijvoorbeeld 16,50. Of kies "Bespreken we samen".');
      }
    }
    return errors;
  }
  function displayDate(value) {
    if (!isoDate(value)) return value || 'In overleg';
    const [y, m, d] = value.split('-');
    return d + '-' + m + '-' + y;
  }
  function salaryText(d) {
    if (d.salaryMode !== 'Ik heb een bedrag in gedachten') return 'Bespreken we samen';
    return 'EUR ' + Number(d.salary.replace(',', '.')).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + d.salaryUnit + ' (wens, geen afspraak)';
  }
  function summary(d) {
    return [
      ['Werk', d.roles.join(', ') || 'Nog niet gekozen'], ['Ik zoek', d.workType],
      ['Start', d.startMode === 'Vanaf een datum' ? displayDate(d.startDate) : d.startMode],
      ['Uren', d.hours], ['Periode', d.period === 'Tot een bepaalde datum' ? 'Tot ' + displayDate(d.endDate) : d.period],
      ['Beschikbaar', d.availability || 'In overleg'], ['Ervaring', d.experience],
      ['Loonwens', salaryText(d)], ['Contact', d.contactPreference],
    ];
  }
  function buildPayload(d, reference) {
    const lines = ['AANMELDING WERKEN BIJ DIKKE ZEEHOND', 'Referentie: ' + reference,
      '', 'Naam: ' + d.name, 'E-mail: ' + d.email, 'Telefoon: ' + (d.phone || 'Niet opgegeven'), '',
      ...summary(d).map(([key, value]) => key + ': ' + value), '',
      'Toelichting / vraag: ' + (d.note || 'Geen'), '',
      'Bron: Aanmeldpagina werken bij Dikke Zeehond.',
      'De kandidaat wil kennismaken. Voorkeuren en loonwens zijn geen gemaakte afspraken.'];
    return { name: d.name, email: d.email, phone: d.phone, message: lines.join('\n'), website: d.website, topic: 'Werken bij' };
  }
  function isAccepted(statusOK, contentType, body) {
    if (!statusOK || !String(contentType).toLowerCase().includes('application/json') || !body || typeof body !== 'object') return false;
    if (body.error || body.ok === false || body.success === false) return false;
    return body.ok === true || body.success === true;
  }
  // Pure functions are exported for local, offline tests. They are not a server API.
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalize, validateStep, summary, buildPayload, isAccepted, isoDate, salaryText };
  if (typeof document === 'undefined') return;

  // A poster QR or old homepage link can contain #aanmelden. On a phone,
  // show the team photo first on initial entry rather than skipping the intro.
  // This runs once; the skip link and subsequent form-step scrolling still work.
  if (window.matchMedia('(max-width: 760px)').matches && window.location.hash === '#aanmelden') {
    try {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    } catch {
      // Restricted/local previews can block replaceState. The form remains usable.
    }
  }

  const form = document.getElementById('job-form');
  if (!form) return;
  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const title = document.getElementById('step-title');
  const caption = document.getElementById('step-caption');
  const errorBox = document.getElementById('form-error');
  const counter = document.getElementById('step-counter');
  const submitButton = document.getElementById('submit-button');
  const originalSubmit = submitButton.textContent;
  const demo = location.protocol === 'file:' || new URLSearchParams(location.search).get('demo') === '1';
  document.getElementById('demo-banner').hidden = !demo;
  let active = 0, sending = false, reference = '', controller = null;
  const headings = [
    ['Wat past bij jou?', 'Kies wat je leuk lijkt. Je hoeft het nog niet zeker te weten.'],
    ['Wanneer past het?', 'Een paar diensten of een nieuwe start: geef je voorkeuren door.'],
    ['Even kennismaken.', 'Alleen je naam en e-mailadres zijn verplicht. De rest mag je overslaan.'],
  ];
  function data() {
    const entries = new FormData(form);
    const raw = Object.fromEntries(entries.entries());
    raw.roles = entries.getAll('roles');
    return normalize(raw);
  }
  function clearErrors() {
    errorBox.hidden = true; errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }
  function showErrors(errors) {
    errorBox.textContent = errors.map(e => e.message).join(' ');
    errorBox.hidden = false;
    errors.forEach(e => {
      const el = document.getElementById(e.id);
      if (!el) return;
      el.setAttribute('aria-invalid', 'true');
      const details = el.closest('details'); if (details) details.open = true;
    });
    errorBox.focus();
  }
  function refreshReview() {
    const list = document.getElementById('review-list');
    list.replaceChildren();
    summary(data()).forEach(([key, value]) => {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = key; dd.textContent = value;
      row.append(dt, dd); list.append(row);
    });
  }
  function showStep(index, focus) {
    active = Math.max(0, Math.min(2, index));
    clearErrors();
    steps.forEach((el, n) => { el.hidden = n !== active; });
    title.textContent = headings[active][0]; caption.textContent = headings[active][1];
    counter.textContent = 'Stap ' + (active + 1) + ' van 3';
    document.querySelectorAll('.progress li').forEach((el, n) => {
      if (n === active) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      el.classList.toggle('done', n < active);
    });
    if (active === 2) refreshReview();
    if (focus) {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      title.focus({ preventScroll: true });
      document.getElementById('aanmelden').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function toggleConditional(wrapperId, visible) {
    const wrapper = document.getElementById(wrapperId); wrapper.hidden = !visible;
    wrapper.querySelectorAll('input,select,textarea').forEach(el => { el.disabled = !visible; });
    // If wrapper itself is a label, querySelectorAll includes its input as intended.
  }
  function conditions() {
    const d = data();
    toggleConditional('start-date-wrap', d.startMode === 'Vanaf een datum');
    toggleConditional('end-date-wrap', d.period === 'Tot een bepaalde datum');
    toggleConditional('salary-wrap', d.salaryMode === 'Ik heb een bedrag in gedachten');
    document.getElementById('startDate').min = today();
    document.getElementById('endDate').min = d.startMode === 'Vanaf een datum' && isoDate(d.startDate) ? d.startDate : today();
    const needsPhone = d.contactPreference !== 'E-mail';
    document.getElementById('phone').required = needsPhone;
    document.getElementById('phone-hint').textContent = needsPhone ? 'Nodig voor ' + d.contactPreference.toLowerCase() : 'Optioneel';
    if (active === 2) refreshReview();
  }
  function next() {
    if (sending) return;
    const errors = validateStep(data(), active);
    if (errors.length) { showErrors(errors); return; }
    showStep(active + 1, true);
  }
  form.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', next));
  form.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => { if (!sending) showStep(active - 1, true); }));
  form.addEventListener('change', event => {
    if (event.target.name === 'roles' && event.target.checked) {
      const unsure = event.target.value === 'Nog niet zeker';
      form.querySelectorAll('input[name=roles]').forEach(el => {
        if (el !== event.target && (unsure || el.value === 'Nog niet zeker')) el.checked = false;
      });
    }
    clearErrors(); conditions();
  });
  form.addEventListener('input', () => { if (active === 2) refreshReview(); });
  document.getElementById('privacy-toggle').addEventListener('click', event => {
    const box = document.getElementById('privacy-info'); box.hidden = !box.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
  });
  function success(id) {
    form.reset();
    document.getElementById('form-wrap').hidden = true;
    const panel = document.getElementById('success-panel'); panel.hidden = false;
    document.getElementById('success-reference').textContent = 'Jouw referentie: ' + id;
    if (demo) {
      document.getElementById('success-eyebrow').textContent = 'Voorbeeld afgerond';
      document.getElementById('success-title').textContent = 'Zo makkelijk gaat het.';
      document.getElementById('success-message').textContent = 'Dit was een proefaanmelding. Er is niets verstuurd of opgeslagen. Op de live website verschijnt hier de bevestiging zodra de server de aanmelding accepteert.';
    }
    panel.focus(); panel.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (active < 2) { next(); return; }
    const d = data();
    for (let n = 0; n < 3; n++) {
      const errors = validateStep(d, n);
      if (errors.length) { showStep(n, true); showErrors(errors); return; }
    }
    if (d.website) { showErrors([{ id: 'website', message: 'Versturen lukt niet. Ververs de pagina of mail ons rechtstreeks.' }]); return; }
    if (!reference) {
      const token = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
      reference = 'DZ-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + token.toUpperCase();
    }
    if (demo) { success(reference); return; }
    sending = true; clearErrors(); form.setAttribute('aria-busy', 'true');
    const controls = Array.from(form.querySelectorAll('button,input,select,textarea')).filter(el => !el.disabled);
    controls.forEach(el => { el.disabled = true; });
    submitButton.textContent = 'Even versturen...';
    controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(buildPayload(d, reference)), signal: controller.signal,
      });
      const type = response.headers.get('content-type') || '';
      const result = type.toLowerCase().includes('application/json') ? await response.json().catch(() => null) : null;
      if (!isAccepted(response.ok, type, result)) {
        throw new Error(response.status === 429 ? 'Te veel pogingen. Probeer het later nog eens of mail ons.' : 'We konden de ontvangst niet bevestigen. Je antwoorden blijven staan. Mail bij twijfel info@dikkezeehond.nl met referentie ' + reference + '.');
      }
      success(reference);
    } catch (error) {
      const message = error && error.name === 'AbortError'
        ? 'Het versturen duurt te lang; ontvangst is niet bevestigd. Je antwoorden blijven staan. Mail bij twijfel info@dikkezeehond.nl met referentie ' + reference + '.'
        : error instanceof Error && (error.message.startsWith('We konden') || error.message.startsWith('Te veel'))
          ? error.message
          : 'Geen verbinding met het formulier. Je antwoorden blijven staan. Probeer later opnieuw of mail info@dikkezeehond.nl.';
      showErrors([{ id: 'submit-button', message }]);
    } finally {
      window.clearTimeout(timer); controller = null; sending = false;
      controls.forEach(el => { el.disabled = false; }); form.removeAttribute('aria-busy');
      submitButton.textContent = originalSubmit;
    }
  });
  window.addEventListener('pagehide', () => { if (controller) controller.abort(); });
  conditions(); showStep(0, false);
})();
