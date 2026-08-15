/* ==========================================================================
   Claim-intake form: language switching, attachments, validation,
   submission and the printable applicant copy.

   Structured to mirror js/app.js so the two forms read the same way. The
   phone-field machinery is deliberately duplicated rather than imported:
   sharing it would mean editing js/app.js and index.html, and the live KYC
   form is not worth disturbing for it.
   ========================================================================== */

(function () {
  'use strict';

  const V = window.V;
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const LANG_KEY = 'rsa-kyc-lang';   /* shared with the KYC page on purpose */
  let lang = 'ar';
  let lastSubmission = null;   /* retained so the PDF can be re-printed */

  /* Attachments are held here rather than read back off the input: a
     FileList is immutable, so removing one file would otherwise mean
     rebuilding the whole selection. The FormData is assembled from this
     array at submit time. */
  let files = [];

  /* Rejection messages carry parameters, so the key alone is not enough to
     re-render them after a language switch. */
  let fileError = null;

  /* --- Translation ------------------------------------------------------ */
  function t(key, params) {
    let s = (window.I18N_CASE[lang] && window.I18N_CASE[lang][key]) || key;
    if (params) {
      for (const k in params) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    }
    return s;
  }

  /* ======================================================================
     Dialling code
     ====================================================================== */
  /* The flag is derived from the ISO code itself — each letter maps to its
     regional indicator symbol — so no flag data ships with the page. A
     platform without flag glyphs falls back to drawing the two letters,
     which is a perfectly good label. */
  const DIVIDER = '__divider__';

  const flag = iso => String.fromCodePoint(
    ...[...iso].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));

  const dialCountry = () => {
    const v = $('#phone-cc').value;
    return v && v !== DIVIDER ? v : 'SA';
  };
  const dialCode = () => window.DIAL_CODES[dialCountry()] || '966';

  function buildDialOptions() {
    const select = $('#phone-cc');
    const previous = select.value;
    const idx = lang === 'en' ? 1 : 2;

    const collator = new Intl.Collator(lang === 'en' ? 'en' : 'ar', { sensitivity: 'base' });
    const rest = window.COUNTRIES
      .filter(c => c[0] !== 'SA')
      .sort((a, b) => collator.compare(a[idx], b[idx]));

    const saudi = window.COUNTRIES.find(c => c[0] === 'SA');

    /* The code is what the applicant is picking, so it leads the label; the
       country name follows to make the list readable and type-searchable.
       The full label is kept in data-full — see collapseCodeLabel. */
    const opt = c => {
      const label = `${flag(c[0])} +${window.DIAL_CODES[c[0]]} ${c[idx]}`;
      return `<option value="${c[0]}" data-full="${label}">${label}</option>`;
    };

    select.innerHTML =
      opt(saudi) +
      `<option value="${DIVIDER}" disabled>──────────</option>` +
      rest.map(opt).join('');

    select.value = previous && previous !== DIVIDER ? previous : 'SA';
    collapseCodeLabel();
  }

  /* A native select can only ever show the selected option's own text when
     closed, and "🇸🇦 +966 المملكة العربية السعودية" does not fit the tag. Any
     clip lands mid-word — and under bidi an Arabic name clipped inside an LTR
     control shows its tail, which reads as mojibake rather than as a name.

     So the selected option holds a short flag-and-code label while the control
     is closed, and every label is restored the moment the applicant is about
     to read the list. Restoring on focus covers the keyboard and the iOS wheel
     alike, both of which focus the control before opening it. */
  const codeOptions = () => Array.prototype.slice.call($('#phone-cc').options);

  function expandCodeLabels() {
    codeOptions().forEach(o => { if (o.dataset.full) o.text = o.dataset.full; });
  }

  function collapseCodeLabel() {
    expandCodeLabels();
    const o = $('#phone-cc').options[$('#phone-cc').selectedIndex];
    if (o && o.value !== DIVIDER) {
      o.text = flag(o.value) + ' +' + window.DIAL_CODES[o.value];
    }
  }

  /* Hint, placeholder and validation all key off the chosen dialling code,
     so they stay truthful whichever country is selected. */
  function syncPhoneRule() {
    const saudi = dialCountry() === 'SA';
    const hint = $('#phone-hint');
    const key = saudi ? 'f.phone.hint' : 'f.phone.hint.intl';

    hint.textContent = t(key);
    hint.setAttribute('data-i18n', key);
    $('#phone').placeholder = saudi ? t('f.phone.ph') : t('f.phone.ph.intl');

    if ($('#phone').value.trim()) validateField($('#phone'));
  }

  /* ======================================================================
     Language
     ====================================================================== */
  /* `persist` is false when the language is dictated by the document being
     shown rather than chosen by the visitor — viewing an Arabic applicant
     copy must not overwrite a staff member's own English preference. */
  function applyLanguage(next, persist = true) {
    lang = next;
    const dict = window.I18N_CASE[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir;

    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-alt]').forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-i18n-content]').forEach(el => { el.content = t(el.dataset.i18nContent); });

    document.title = t('meta.title');
    $('#copyright').textContent = t('ft.rights', { year: new Date().getFullYear() });

    $$('.lang-switch button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

    buildDialOptions();
    syncPhoneRule();
    renderFileList();

    /* Re-render every validation message currently on screen. */
    $$('.error-msg[data-err-key]').forEach(el => { el.textContent = t(el.dataset.errKey); });
    renderFileError();
    renderFormError();

    if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) {} }
  }

  /* ======================================================================
     Attachments
     ====================================================================== */
  const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

  /* Sizes are numerals and read left-to-right in both languages, so they are
     formatted with en-US grouping regardless of the active language. */
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  const totalBytes = () => files.reduce((sum, f) => sum + f.size, 0);

  function setFileError(key, params) {
    fileError = key ? { key, params } : null;
    renderFileError();
  }

  function renderFileError() {
    $('#file-err').textContent = fileError ? t(fileError.key, fileError.params) : '';
  }

  /* Files are validated one at a time so a single bad file in a multi-file
     drop does not discard the good ones alongside it. */
  function addFiles(list) {
    const max = window.CASE_SUBMIT.CONFIG.maxTotalBytes;
    const maxFiles = window.CASE_SUBMIT.CONFIG.maxFiles;
    let error = null;

    Array.from(list).forEach(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        error = { key: 'e.file.type', params: { name: f.name } };
        return;
      }
      /* Same name and size twice over is a re-drop, not a second document. */
      if (files.some(x => x.name === f.name && x.size === f.size)) return;

      if (files.length >= maxFiles) {
        error = { key: 'e.file.count', params: { max: maxFiles } };
        return;
      }
      if (totalBytes() + f.size > max) {
        error = {
          key: 'e.file.size',
          params: { name: f.name, max: formatBytes(max) }
        };
        return;
      }
      files.push(f);
    });

    setFileError(error && error.key, error && error.params);
    renderFileList();
    /* Adding a file can be what satisfies the block, so clear a live error. */
    if ($('#q-docs').classList.contains('is-invalid')) validateDocuments();
  }

  function removeFile(index) {
    files.splice(index, 1);
    setFileError(null);
    renderFileList();
    if ($('#q-docs').classList.contains('is-invalid')) validateDocuments();
  }

  function renderFileList() {
    const list = $('#file-list');
    list.innerHTML = '';

    $('#file-total').textContent = files.length
      ? t('f.docs.count', { n: files.length }) + ' — ' + formatBytes(totalBytes())
      : '';

    files.forEach((f, i) => {
      const li = document.createElement('li');

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'f-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke-width', '1.8');
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"'
                     + ' stroke-linecap="round" stroke-linejoin="round"/>'
                     + '<path d="M14 2v6h6" stroke-linecap="round" stroke-linejoin="round"/>';

      const name = document.createElement('span');
      name.className = 'f-name';
      name.textContent = f.name;          /* textContent — never innerHTML */

      const size = document.createElement('span');
      size.className = 'f-size';
      size.textContent = formatBytes(f.size);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'f-remove';
      btn.setAttribute('aria-label', t('f.docs.remove') + ': ' + f.name);
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"'
                    + ' stroke-width="2.2" stroke-linecap="round" aria-hidden="true">'
                    + '<path d="M18 6 6 18M6 6l12 12"/></svg>';
      btn.addEventListener('click', () => removeFile(i));

      li.append(icon, name, size, btn);
      list.appendChild(li);
    });
  }

  /* ======================================================================
     Validation
     ====================================================================== */

  /* Each rule returns null when valid, or an i18n key describing the fault. */
  const RULES = {
    fullName: v => (!v.trim() ? 'e.required' : !V.fullName(v) ? 'e.name' : null),

    /* One field for both documents: a National ID opens with 1, an Iqama
       with 2. There is no nationality select on this form, so either is
       accepted rather than making the applicant declare which they hold. */
    idNumber: v => {
      if (!v.trim()) return 'e.required';
      return (V.nationalId(v) || V.iqama(v)) ? null : 'e.id';
    },

    /* Keyed off the dialling code: +966 gets the strict Saudi mobile rule,
       everything else the E.164 length check. */
    phone: v => {
      if (!v.trim()) return 'e.required';
      if (dialCountry() === 'SA') return V.saudiMobile(v) ? null : 'e.phone';
      return V.intlNational(v, dialCode()) ? null : 'e.phone.intl';
    },

    email: v => (!v.trim() ? 'e.required' : !V.email(v) ? 'e.email' : null),

    /* A one-word answer is not a description the firm can act on. */
    caseSubject: v => (!v.trim() ? 'e.required' : v.trim().length < 20 ? 'e.case.short' : null),

    requests: v => (!v.trim() ? 'e.required' : null)
  };

  /* The i18n key is kept on the element so a language switch can re-render
     every visible message — including the documents-group error, which has
     no entry in RULES and so cannot simply be re-validated. */
  function setFieldError(container, errEl, key) {
    if (key) {
      container.classList.add('is-invalid');
      errEl.dataset.errKey = key;
      errEl.textContent = t(key);
      return false;
    }
    container.classList.remove('is-invalid');
    delete errEl.dataset.errKey;
    errEl.textContent = '';
    return true;
  }

  /* --- Form-level message (validation summary or delivery failure) ------- */
  function showFormError(key, params) {
    const el = $('#form-error');
    el.dataset.msgKey = key;
    el.dataset.msgN = (params && params.n) || '';
    renderFormError();
    el.classList.add('is-open');
  }

  function renderFormError() {
    const el = $('#form-error');
    const key = el.dataset.msgKey;
    if (!key) return;
    if (key === 'e.send') {
      const c = window.CASE_SUBMIT.CONFIG;
      el.innerHTML = t('e.send', {
        phone: `<a href="tel:${c.firmPhone.replace(/\s/g, '')}" dir="ltr">${c.firmPhone}</a>`,
        email: `<a href="mailto:${c.firmEmail}" dir="ltr">${c.firmEmail}</a>`
      });
    } else {
      el.textContent = t(key, { n: el.dataset.msgN });
    }
  }

  function hideFormError() {
    const el = $('#form-error');
    el.classList.remove('is-open');
    delete el.dataset.msgKey;
  }

  function validateField(el) {
    const rule = RULES[el.id];
    if (!rule) return true;
    const container = el.closest('.field') || el.closest('.q-block');
    const errEl = document.getElementById(el.id + '-err');
    if (!container || !errEl) return true;

    const key = rule(el.value);
    el.setAttribute('aria-invalid', key ? 'true' : 'false');
    return setFieldError(container, errEl, key);
  }

  /* المستندات may be written, attached, or both — so neither half is required
     on its own, but the block as a whole is. The message therefore lands on
     the block, the same shape the KYC form uses for its checkbox groups. */
  function validateDocuments() {
    const ok = $('#documentsText').value.trim() !== '' || files.length > 0;
    return setFieldError($('#q-docs'), $('#documents-err'), ok ? null : 'e.docs');
  }

  function validateAll() {
    const failures = [];

    Object.keys(RULES).forEach(id => {
      const el = document.getElementById(id);
      if (el && !validateField(el)) failures.push(el);
    });

    if (!validateDocuments()) failures.push($('#documentsText'));

    return failures;
  }

  /* ======================================================================
     Data collection
     ====================================================================== */
  function collect() {
    return {
      fullName: $('#fullName').value.trim(),
      idNumber: V.digitsOnly($('#idNumber').value),
      /* Stored in full international form so the firm can dial it directly. */
      phone: dialCountry() === 'SA'
        ? '+966' + V.normalizeSaudiMobile($('#phone').value)
        : V.toE164($('#phone').value, dialCode()),
      email: $('#email').value.trim(),

      caseSubject: $('#caseSubject').value.trim(),
      requests: $('#requests').value.trim(),

      documentsText: $('#documentsText').value.trim(),
      /* Name and raw byte count as a positional pair — compact enough for the
         copy link, and formatted at render time so the PDF and the email can
         present it differently. */
      fileNames: files.map(f => [f.name, f.size]),

      honey: $('input[name="_honey"]').value
    };
  }

  /* ======================================================================
     Printable applicant copy
     ====================================================================== */
  function buildPrintSummary(data, reference) {
    const esc = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    /* `pre` preserves the line breaks the applicant typed — the requests are
       entered one per line and must print that way. */
    const row = (label, value, cls) =>
      `<div class="p-row"><div class="k">${esc(label)}</div>` +
      `<div class="v${cls ? ' ' + cls : ''}">${esc(value || '—')}</div></div>`;

    const rowHtml = (label, html) =>
      `<div class="p-row"><div class="k">${esc(label)}</div>` +
      `<div class="v">${html}</div></div>`;

    const section = (title, rows) =>
      `<div class="p-section"><h3>${esc(title)}</h3>${rows.join('')}</div>`;

    const fileRows = (data.fileNames || []).map(f =>
      `<li>${esc(f[0])} <span class="f-size">${esc(formatBytes(f[1]))}</span></li>`).join('');

    const filesHtml = fileRows
      ? `<ul class="p-docs">${fileRows}</ul>`
      : esc(t('f.docs.none'));

    const dateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory',
      { year: 'numeric', month: 'long', day: 'numeric' });

    $('#print-summary').innerHTML = `
      <div class="p-head">
        <img src="../kyc/assets/brand/logo-horizontal.png" alt="${esc(t('brand.alt'))}">
        <div class="p-meta">
          <div><span class="lbl">${esc(t('p.ref'))}:</span> <span class="ref">${esc(reference)}</span></div>
          <div><span class="lbl">${esc(t('p.date'))}:</span> ${esc(dateStr)}</div>
        </div>
      </div>

      <div class="p-title">${esc(t('p.title'))}</div>

      ${section(t('sec.1'), [
        row(t('f.name'), data.fullName),
        row(t('f.id'), data.idNumber, 'ltr'),
        row(t('f.phone'), data.phone, 'ltr'),
        row(t('f.email'), data.email, 'ltr')
      ])}

      ${section(t('sec.2'), [
        row(t('f.case'), data.caseSubject, 'pre')
      ])}

      ${section(t('sec.3'), [
        row(t('f.requests'), data.requests, 'pre')
      ])}

      ${section(t('sec.4'), [
        row(t('f.docs.text'), data.documentsText, 'pre'),
        rowHtml(t('p.attached'), filesHtml)
      ])}

      <div class="p-foot">
        <div>${esc(t('p.foot'))}</div>
        <div class="ltr">${esc(t('ft.phone'))} · ${esc(t('ft.email'))}</div>
        <div>${esc(t('ft.address'))}</div>
        <div class="ltr">${esc(t('ft.license'))}</div>
      </div>`;
  }

  /* ======================================================================
     Submission
     ====================================================================== */
  async function onSubmit(e) {
    e.preventDefault();

    hideFormError();

    const failures = validateAll();
    if (failures.length) {
      const first = failures[0];
      showFormError('e.summary', { n: failures.length });
      first.focus({ preventScroll: true });
      (first.closest('.field') || first.closest('.q-block') || first)
        .scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = $('#submit-btn');
    const label = $('#submit-label');
    btn.disabled = true;
    btn.classList.add('is-sending');
    label.textContent = t('btn.sending');

    const data = collect();

    /* Only the delivery itself is guarded. Drawing the confirmation screen
       must sit outside the try, or a DOM slip after a *successful* send
       would be reported to the applicant as a failed submission. */
    let reference;
    try {
      reference = await window.CASE_SUBMIT.send(data, files, lang);
    } catch (err) {
      console.error('[CASE] submission failed:', err);
      showFormError('e.send');
      $('#form-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-sending');
      label.textContent = t('btn.submit');
    }

    lastSubmission = { data, reference };

    $('#ref-value').textContent = reference;
    $('#case-form').style.display = 'none';
    const confirm = $('#confirm');
    confirm.classList.add('is-open');
    confirm.focus();
    confirm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ======================================================================
     Applicant copy (opened from the link in the notification email)

     The whole submission rides in the URL fragment, so the firm rebuilds the
     identical printable copy through the same buildPrintSummary path the
     applicant used — not a second rendering that could drift out of step.
     ====================================================================== */
  function copyToken() {
    const m = /(?:^|[#&])copy=([^&]+)/.exec(location.hash || '');
    return m ? m[1] : null;
  }

  async function enterCopyMode(token) {
    $('.form-intro').style.display = 'none';
    $('#case-form').style.display = 'none';

    const view = $('#copy-view');
    view.classList.add('is-open');

    let payload;
    try {
      payload = await window.CASE_SUBMIT.decodeCopy(token);
    } catch (err) {
      console.error('[CASE] could not read applicant-copy link:', err);
      /* The reference and the download button are meaningless without a
         readable payload, so leave only the explanation. */
      $('#copy-ref-box').style.display = 'none';
      $('#copy-download-btn').style.display = 'none';
      const body = $('#copy-body');
      body.dataset.i18n = 'copy.error';
      body.textContent = t('copy.error');
      return;
    }

    /* Render in the language the applicant filled the form in, so the copy
       matches the one they downloaded. The switcher is hidden rather than
       left inert: the values inside the copy are already fixed in the
       applicant's language and cannot be re-translated. */
    applyLanguage(payload.l === 'en' ? 'en' : 'ar', false);
    $('.lang-switch').style.display = 'none';

    $('#copy-ref').textContent = payload.r;
    lastSubmission = { data: payload.d, reference: payload.r };

    $('#copy-download-btn').addEventListener('click', () => {
      buildPrintSummary(payload.d, payload.r);
      window.print();
    });

    view.focus();
  }

  /* ======================================================================
     Wiring
     ====================================================================== */
  function init() {
    /* Language: stored choice wins, otherwise Arabic. */
    let stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (_) {}
    applyLanguage(stored === 'en' ? 'en' : 'ar');

    /* An email copy link takes over the page entirely — the recipient is the
       firm collecting a PDF, not an applicant filling anything in. */
    const token = copyToken();
    if (token) {
      enterCopyMode(token);
      return;
    }

    $$('.lang-switch button').forEach(b =>
      b.addEventListener('click', () => applyLanguage(b.dataset.lang)));

    /* Overriding the code re-checks the number against the new country. The
       label swap keeps the closed control readable; see collapseCodeLabel. */
    $('#phone-cc').addEventListener('focus', expandCodeLabels);
    $('#phone-cc').addEventListener('mousedown', expandCodeLabels);
    $('#phone-cc').addEventListener('blur', collapseCodeLabel);
    $('#phone-cc').addEventListener('change', () => {
      collapseCodeLabel();
      syncPhoneRule();
    });

    /* Validate on blur, and clear a live error as soon as it is fixed. */
    $$('#case-form input, #case-form select, #case-form textarea').forEach(el => {
      if (!RULES[el.id]) return;
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        const container = el.closest('.field') || el.closest('.q-block');
        if (container && container.classList.contains('is-invalid')) validateField(el);
      });
    });

    /* Identity is digits only. */
    $('#idNumber').addEventListener('input', e => {
      e.target.value = V.digitsOnly(e.target.value).slice(0, 10);
    });

    /* --- Documents ----------------------------------------------------- */
    const input = $('#documentsFiles');
    const zone = $('#dropzone');

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      addFiles(input.files);
      /* Cleared so picking the same file twice still fires a change event. */
      input.value = '';
    });

    ['dragenter', 'dragover'].forEach(ev =>
      zone.addEventListener(ev, e => {
        e.preventDefault();
        zone.classList.add('is-dragover');
      }));

    ['dragleave', 'dragend'].forEach(ev =>
      zone.addEventListener(ev, () => zone.classList.remove('is-dragover')));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    /* Dropping anywhere else must not make the browser navigate to the file. */
    ['dragover', 'drop'].forEach(ev =>
      document.addEventListener(ev, e => {
        if (!zone.contains(e.target)) e.preventDefault();
      }));

    /* Writing a description is the other way to satisfy the block. */
    $('#documentsText').addEventListener('input', () => {
      if ($('#q-docs').classList.contains('is-invalid')) validateDocuments();
    });

    $('#case-form').addEventListener('submit', onSubmit);

    $('#download-btn').addEventListener('click', () => {
      if (!lastSubmission) return;
      buildPrintSummary(lastSubmission.data, lastSubmission.reference);
      window.print();
    });

    $('#another-btn').addEventListener('click', () => {
      $('#case-form').reset();
      $$('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      $$('.error-msg').forEach(el => { el.textContent = ''; delete el.dataset.errKey; });
      hideFormError();
      files = [];
      setFileError(null);
      renderFileList();
      lastSubmission = null;
      $('#phone-cc').value = 'SA';
      buildDialOptions();
      syncPhoneRule();
      $('#confirm').classList.remove('is-open');
      $('#case-form').style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
