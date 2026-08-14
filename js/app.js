/* ==========================================================================
   Application logic: language switching, conditional fields, validation,
   submission and the printable client copy.
   ========================================================================== */

(function () {
  'use strict';

  const V = window.V;
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const LANG_KEY = 'rsa-kyc-lang';
  let lang = 'ar';
  let lastSubmission = null;   /* retained so the PDF can be re-printed */

  /* --- Translation ------------------------------------------------------ */
  function t(key, params) {
    let s = (window.I18N[lang] && window.I18N[lang][key]) || key;
    if (params) {
      for (const k in params) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    }
    return s;
  }

  /* ======================================================================
     Nationality
     ====================================================================== */
  const DIVIDER = '__divider__';

  function buildCountryOptions() {
    const select = $('#nationality');
    const previous = select.value;
    const idx = lang === 'en' ? 1 : 2;

    const collator = new Intl.Collator(lang === 'en' ? 'en' : 'ar', { sensitivity: 'base' });
    const rest = window.COUNTRIES
      .filter(c => c[0] !== 'SA')
      .sort((a, b) => collator.compare(a[idx], b[idx]));

    const saudi = window.COUNTRIES.find(c => c[0] === 'SA');

    const opt = (value, label, attrs = '') => `<option value="${value}"${attrs}>${label}</option>`;

    select.innerHTML =
      opt('', t('f.nationality.ph'), ' disabled selected hidden') +
      opt('SA', saudi[idx]) +
      opt(DIVIDER, '──────────', ' disabled') +
      rest.map(c => opt(c[0], c[idx])).join('');

    /* Keep the client's choice across a language switch. */
    if (previous && previous !== DIVIDER) select.value = previous;
  }

  /* An empty nationality is treated as the Saudi case so the form opens on
     the most common path — National ID label, +966 dialling tag — rather than
     defaulting to "Iqama" before the client has chosen anything. Nationality
     carries its own required rule, so nothing can be submitted unset. */
  const isSaudi = () => {
    const v = $('#nationality').value;
    return v === '' || v === 'SA';
  };

  /* The identity field is one input whose meaning depends on nationality:
     National ID for Saudis, Iqama (residence) number for everyone else. */
  function syncIdentityField() {
    const saudi = isSaudi();
    const input = $('#idNumber');

    $('#idNumber-label').textContent = t(saudi ? 'f.id.sa' : 'f.id.other');
    $('#idNumber-label').setAttribute('data-i18n', saudi ? 'f.id.sa' : 'f.id.other');
    $('#idNumber-hint').textContent = t(saudi ? 'f.id.hint.sa' : 'f.id.hint.other');
    $('#idNumber-hint').setAttribute('data-i18n', saudi ? 'f.id.hint.sa' : 'f.id.hint.other');
    input.placeholder = saudi ? '1XXXXXXXXX' : '2XXXXXXXXX';

    /* Re-check an already-filled value against the new rule. */
    if (input.value.trim()) validateField(input);
  }

  /* ======================================================================
     Dialling code
     ====================================================================== */
  /* The flag is derived from the ISO code itself — each letter maps to its
     regional indicator symbol — so no flag data ships with the page. A
     platform without flag glyphs falls back to drawing the two letters,
     which is a perfectly good label. */
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

    /* The code is what the client is picking, so it leads the label; the
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
     is closed, and every label is restored the moment the client is about to
     read the list. Restoring on focus covers the keyboard and the iOS wheel
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

  /* The dialling code follows nationality — a Saudi client gets +966, an
     Egyptian one +20 — but only as a starting point. Residency and phone
     origin often diverge, so the client is free to override it afterwards,
     and picking a nationality again is what resets it. */
  function syncPhoneField() {
    const nationality = $('#nationality').value;
    if (nationality && nationality !== DIVIDER && window.DIAL_CODES[nationality]) {
      $('#phone-cc').value = nationality;
      collapseCodeLabel();
    }
    syncPhoneRule();
  }

  /* Hint, placeholder and validation all key off the chosen dialling code
     rather than nationality, so they stay truthful after an override. */
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
     shown rather than chosen by the visitor — viewing an Arabic client copy
     must not overwrite a staff member's own English preference. */
  function applyLanguage(next, persist = true) {
    lang = next;
    const dict = window.I18N[lang];

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

    buildCountryOptions();
    buildDialOptions();
    syncIdentityField();
    /* A language switch relabels the dialling codes but must not undo a
       manual choice among them, so the rule is refreshed without deriving
       the code from nationality again. */
    syncPhoneRule();

    /* Re-render every validation message currently on screen. */
    $$('.error-msg[data-err-key]').forEach(el => { el.textContent = t(el.dataset.errKey); });
    renderFormError();

    if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) {} }
  }

  /* ======================================================================
     Validation
     ====================================================================== */

  /* Each rule returns null when valid, or an i18n key describing the fault. */
  const RULES = {
    fullName: v => (!v.trim() ? 'e.required' : !V.fullName(v) ? 'e.name' : null),
    nationality: v => (!v || v === DIVIDER ? 'e.select' : null),
    idNumber: v => {
      if (!v.trim()) return 'e.required';
      return V.idNumber(v, isSaudi()) ? null : (isSaudi() ? 'e.id.sa' : 'e.id.other');
    },
    address: v => (!v.trim() ? 'e.required' : null),
    /* Keyed off the dialling code, not nationality: +966 gets the strict
       Saudi mobile rule, everything else the E.164 length check. */
    phone: v => {
      if (!v.trim()) return 'e.required';
      if (dialCountry() === 'SA') return V.saudiMobile(v) ? null : 'e.phone';
      return V.intlNational(v, dialCode()) ? null : 'e.phone.intl';
    },
    email: v => (!v.trim() ? 'e.required' : !V.email(v) ? 'e.email' : null),

    employerName:    v => (!v.trim() ? 'e.required' : null),
    employerAddress: v => (!v.trim() ? 'e.required' : null),
    jobTitle:        v => (!v.trim() ? 'e.required' : null),

    annualIncome: v => (!v.trim() ? 'e.required' : !V.amount(v) ? 'e.income' : null),
    bankName:     v => (!v.trim() ? 'e.required' : null),
    iban: v => {
      if (!v.trim()) return 'e.required';
      if (!V.ibanStructure(v)) {
        return V.cleanIban(v).startsWith('SA') ? 'e.iban.sa' : 'e.iban';
      }
      return V.ibanChecksum(v) ? null : 'e.iban';
    },

    /* Only required once its parent option is ticked. */
    incomeSourceOther: v =>
      ($('#incomeSourceOther-wrap').classList.contains('is-open') && !v.trim())
        ? 'e.required' : null,
    workTypeOther: v =>
      ($('#workTypeOther-wrap').classList.contains('is-open') && !v.trim())
        ? 'e.required' : null
  };

  /* The i18n key is kept on the element so a language switch can re-render
     every visible message — including group and acknowledgement errors,
     which have no entry in RULES and so cannot simply be re-validated. */
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
      const c = window.SUBMIT.CONFIG;
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

  /* Checkbox and radio groups carry their message on the group, not a field. */
  function validateGroup(name, blockSel, errId, errKey) {
    const block = $(blockSel);
    const errEl = $('#' + errId);
    const chosen = $$(`input[name="${name}"]`).some(i => i.checked);
    return setFieldError(block, errEl, chosen ? null : errKey);
  }

  function validateAll() {
    const failures = [];

    Object.keys(RULES).forEach(id => {
      const el = document.getElementById(id);
      if (el && !validateField(el)) failures.push(el);
    });

    if (!validateGroup('incomeSource', '#q-income', 'incomeSource-err', 'e.choose')) {
      failures.push($('#q-income input'));
    }
    if (!validateGroup('workType', '#q-work', 'workType-err', 'e.choose')) {
      failures.push($('#q-work input'));
    }

    const ack = $('#acknowledge');
    if (!setFieldError($('#q-ack'), $('#acknowledge-err'), ack.checked ? null : 'e.ack')) {
      failures.push(ack);
    }

    return failures;
  }

  /* ======================================================================
     Data collection
     ====================================================================== */
  function collect() {
    const nat = $('#nationality');
    const saudi = isSaudi();

    const sources = $$('input[name="incomeSource"]:checked').map(i =>
      i.value === 'salary' ? t('q.income.salary')
                           : `${t('q.income.other')}: ${$('#incomeSourceOther').value.trim()}`);

    const work = $('input[name="workType"]:checked');
    const workLabel = !work ? ''
      : work.value === 'self' ? t('q.work.self')
      : `${t('q.work.other')}: ${$('#workTypeOther').value.trim()}`;

    return {
      fullName: $('#fullName').value.trim(),
      nationality: nat.value,
      nationalityLabel: nat.options[nat.selectedIndex] ? nat.options[nat.selectedIndex].text : '',
      isSaudi: saudi,
      idNumber: V.digitsOnly($('#idNumber').value),
      address: $('#address').value.trim(),
      /* Stored in full international form so the firm can dial it directly. */
      phone: dialCountry() === 'SA'
        ? '+966' + V.normalizeSaudiMobile($('#phone').value)
        : V.toE164($('#phone').value, dialCode()),
      email: $('#email').value.trim(),

      employerName: $('#employerName').value.trim(),
      employerAddress: $('#employerAddress').value.trim(),
      jobTitle: $('#jobTitle').value.trim(),

      annualIncome: V.formatAmount($('#annualIncome').value),
      bankName: $('#bankName').value.trim(),
      iban: V.cleanIban($('#iban').value),

      incomeSources: sources.join('، ') || '—',
      workType: workLabel || '—',
      otherFinancial: $('#otherFinancial').value.trim(),

      acknowledge: $('#acknowledge').checked,
      botcheck: $('input[name="botcheck"]').checked ? 'on' : ''
    };
  }

  /* ======================================================================
     Printable client copy
     ====================================================================== */
  function buildPrintSummary(data, reference) {
    const esc = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const row = (label, value, ltr) =>
      `<div class="p-row"><div class="k">${esc(label)}</div>` +
      `<div class="v${ltr ? ' ltr' : ''}">${esc(value || '—')}</div></div>`;

    const section = (title, rows) =>
      `<div class="p-section"><h3>${esc(title)}</h3>${rows.join('')}</div>`;

    const dateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory',
      { year: 'numeric', month: 'long', day: 'numeric' });

    $('#print-summary').innerHTML = `
      <div class="p-head">
        <img src="assets/brand/logo-horizontal.png" alt="${esc(t('brand.alt'))}">
        <div class="p-meta">
          <div><span class="lbl">${esc(t('p.ref'))}:</span> <span class="ref">${esc(reference)}</span></div>
          <div><span class="lbl">${esc(t('p.date'))}:</span> ${esc(dateStr)}</div>
        </div>
      </div>

      <div class="p-title">${esc(t('p.title'))}</div>

      ${section(t('sec.1'), [
        row(t('f.name'), data.fullName),
        row(t('f.nationality'), data.nationalityLabel),
        row(t(data.isSaudi ? 'f.id.sa' : 'f.id.other'), data.idNumber, true),
        row(t('f.address'), data.address),
        row(t('f.phone'), data.phone, true),
        row(t('f.email'), data.email, true)
      ])}

      ${section(t('sec.2'), [
        row(t('f.employer'), data.employerName),
        row(t('f.employerAddress'), data.employerAddress),
        row(t('f.jobTitle'), data.jobTitle)
      ])}

      ${section(t('sec.3'), [
        row(t('f.income') + ' (' + t('f.currency') + ')', data.annualIncome, true),
        row(t('f.bank'), data.bankName),
        row(t('f.iban'), V.formatIban(data.iban), true)
      ])}

      ${section(t('sec.4'), [
        row(t('q.income'), data.incomeSources),
        row(t('q.work'), data.workType),
        row(t('f.notes'), data.otherFinancial)
      ])}

      <div class="p-ack">
        <div>${esc(t('ack.text'))}</div>
        ${lang === 'en'
          ? `<div class="p-ack-ar" style="margin-block-start:2.5mm">${esc(window.I18N.ar['ack.text'])}</div>`
          : ''}
        <div class="p-ack-confirm">✓ ${esc(t('ack.confirm'))} — ${esc(data.fullName)}</div>
      </div>

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
       would be reported to the client as a failed submission. */
    let reference;
    try {
      reference = await window.SUBMIT.send(data, lang);
    } catch (err) {
      console.error('[KYC] submission failed:', err);
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
    $('#kyc-form').style.display = 'none';
    const confirm = $('#confirm');
    confirm.classList.add('is-open');
    confirm.focus();
    confirm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ======================================================================
     Client copy (opened from the link in the notification email)

     The whole submission rides in the URL fragment, so the firm rebuilds the
     identical printable copy through the same buildPrintSummary path the
     client used — not a second rendering that could drift out of step.
     ====================================================================== */
  function copyToken() {
    const m = /(?:^|[#&])copy=([^&]+)/.exec(location.hash || '');
    return m ? m[1] : null;
  }

  async function enterCopyMode(token) {
    $('.form-intro').style.display = 'none';
    $('#kyc-form').style.display = 'none';

    const view = $('#copy-view');
    view.classList.add('is-open');

    let payload;
    try {
      payload = await window.SUBMIT.decodeCopy(token);
    } catch (err) {
      console.error('[KYC] could not read client-copy link:', err);
      /* The reference and the download button are meaningless without a
         readable payload, so leave only the explanation. */
      $('#copy-ref-box').style.display = 'none';
      $('#copy-download-btn').style.display = 'none';
      const body = $('#copy-body');
      body.dataset.i18n = 'copy.error';
      body.textContent = t('copy.error');
      return;
    }

    /* Render in the language the client filled the form in, so the copy
       matches the one they downloaded. The switcher is hidden rather than
       left inert: the values inside the copy are already fixed in the
       client's language and cannot be re-translated. */
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
  /* The footer address ships with a Google Maps href so it works without JS.
     On Apple platforms, point it at Apple Maps instead — that URL opens the
     native Maps app on iOS/macOS and a web map everywhere else. Both drop the
     pin on the office itself rather than searching for the street. */
  const MAP_COORDS = '24.7019569,46.6962026';
  const MAP_LABEL = 'مكتب المحامية روان صالح الغامدي';

  function setupMapLink() {
    const link = $('#map-link');
    if (!link) return;
    const ua = navigator.userAgent || '';
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(ua) ||
      (navigator.maxTouchPoints > 1 && /Mac/.test(ua));
    if (isApple) {
      link.href = 'https://maps.apple.com/?ll=' + MAP_COORDS +
        '&q=' + encodeURIComponent(MAP_LABEL);
    }
  }

  function init() {
    /* Language: stored choice wins, otherwise Arabic. */
    let stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (_) {}
    applyLanguage(stored === 'en' ? 'en' : 'ar');

    setupMapLink();

    /* An email copy link takes over the page entirely — the recipient is the
       firm collecting a PDF, not a client filling anything in. */
    const token = copyToken();
    if (token) {
      enterCopyMode(token);
      return;
    }

    $$('.lang-switch button').forEach(b =>
      b.addEventListener('click', () => applyLanguage(b.dataset.lang)));

    $('#nationality').addEventListener('change', () => {
      syncIdentityField();
      syncPhoneField();
      validateField($('#nationality'));
    });

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
    $$('#kyc-form input, #kyc-form select, #kyc-form textarea').forEach(el => {
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

    /* IBAN: uppercase and grouped in fours as the client types. */
    $('#iban').addEventListener('input', e => {
      const el = e.target;
      const atEnd = el.selectionStart === el.value.length;
      el.value = V.formatIban(el.value);
      if (atEnd) el.setSelectionRange(el.value.length, el.value.length);
    });

    /* Income: thousands separators once the client leaves the field. */
    $('#annualIncome').addEventListener('blur', e => {
      if (e.target.value.trim() && V.amount(e.target.value)) {
        e.target.value = V.formatAmount(e.target.value);
      }
    });

    /* "Other" options reveal their free-text input. */
    $$('[data-reveal]').forEach(input => {
      input.addEventListener('change', () => {
        const wrap = document.getElementById(input.dataset.reveal);
        const open = input.checked;
        wrap.classList.toggle('is-open', open);
        if (open) wrap.querySelector('input').focus();
        else {
          const field = wrap.querySelector('input');
          field.value = '';
          const c = wrap.closest('.field') || wrap.closest('.q-block');
          if (c) { c.classList.remove('is-invalid'); }
          const errEl = document.getElementById(field.id + '-err');
          if (errEl) errEl.textContent = '';
        }
      });
    });

    /* Radios are exclusive, so choosing "Self-employed" must close "Other". */
    $$('input[name="workType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value !== 'other' && radio.checked) {
          const wrap = $('#workTypeOther-wrap');
          wrap.classList.remove('is-open');
          $('#workTypeOther').value = '';
        }
      });
    });

    /* Clear a group error as soon as any option in it is chosen. */
    $$('input[name="incomeSource"]').forEach(i => i.addEventListener('change', () =>
      validateGroup('incomeSource', '#q-income', 'incomeSource-err', 'e.choose')));
    $$('input[name="workType"]').forEach(i => i.addEventListener('change', () =>
      validateGroup('workType', '#q-work', 'workType-err', 'e.choose')));
    $('#acknowledge').addEventListener('change', e =>
      setFieldError($('#q-ack'), $('#acknowledge-err'), e.target.checked ? null : 'e.ack'));

    $('#kyc-form').addEventListener('submit', onSubmit);

    $('#download-btn').addEventListener('click', () => {
      if (!lastSubmission) return;
      buildPrintSummary(lastSubmission.data, lastSubmission.reference);
      window.print();
    });

    $('#another-btn').addEventListener('click', () => {
      $('#kyc-form').reset();
      $$('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      $$('.error-msg').forEach(el => { el.textContent = ''; delete el.dataset.errKey; });
      $$('.reveal').forEach(el => el.classList.remove('is-open'));
      hideFormError();
      lastSubmission = null;
      buildCountryOptions();
      $('#phone-cc').value = 'SA';
      buildDialOptions();
      syncIdentityField();
      syncPhoneField();
      $('#confirm').classList.remove('is-open');
      $('#kyc-form').style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
