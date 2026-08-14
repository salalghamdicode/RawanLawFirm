/* ==========================================================================
   Submission adapter.

   GitHub Pages serves static files only, so the form is delivered by a
   third-party form backend. Everything configurable lives in CONFIG below —
   the rest of the app never names a provider.
   ========================================================================== */

window.SUBMIT = (function () {
  'use strict';

  const CONFIG = {
    /* ------------------------------------------------------------------
       ACCESS KEY — replace with the key emailed to you by Web3Forms after
       verifying rawan@rawanlawfirm.com at https://web3forms.com
       The key is public by design (it ships in client-side HTML either
       way). If it is ever abused, generate a new one and paste it here.
       ------------------------------------------------------------------ */
    provider:  'web3forms',
    accessKey: '9eba9dcd-868c-41e0-8014-0cb2a4b8e0bc',

    /* Where submissions land. Web3Forms sends to the address that owns the
       access key; this is recorded here for documentation only. */
    recipient: 'rawan@rawanlawfirm.com',

    /* Email a copy to the client as well.
       Web3Forms' autoresponder is a PRO feature ($18/mo) and its access key
       is bound to a single verified recipient, so this cannot work on the
       free tier. Two ways to turn it on:
         1. Upgrade the Web3Forms account, then set clientCopy: true; or
         2. Set provider: 'formsubmit' below — FormSubmit is free, needs no
            registration, and supports _autoresponse. See README.md.
       The PDF download on the confirmation screen covers the client's need
       for a record in the meantime.                                       */
    clientCopy: false,

    /* Optional Cloudflare Turnstile. Leave empty to rely on the honeypot
       alone. If set, add the Turnstile widget script to index.html. */
    turnstileSiteKey: '',

    /* Fallback contacts shown if delivery fails. */
    firmPhone: '+966 548 548 270',
    firmEmail: 'rawan@rsalawfirm.co',

    /* Base address used to build the client-copy link placed in the email.
       This must match the domain configured in GitHub Pages — see README §3.
       Serving the form from anywhere else (including localhost) still works;
       the link simply always points here, which is the whole point: the
       recipient opens it on their own machine, not the sender's.

       Leave empty only to fall back to whatever address the form was served
       from — useful when testing the link locally. */
    siteUrl: 'https://kyc.rawanlawfirm.com/'
  };

  const ENDPOINTS = {
    web3forms:  'https://api.web3forms.com/submit',
    formsubmit: 'https://formsubmit.co/ajax/'
  };

  /* --- Reference number -------------------------------------------------
     RSA-<year>-<4 digits>, e.g. RSA-2026-0431. Short enough to read over
     the phone; the firm disambiguates by name and date if two ever collide. */
  function makeReference() {
    const year = new Date().getFullYear();
    let n;
    if (window.crypto && window.crypto.getRandomValues) {
      n = window.crypto.getRandomValues(new Uint16Array(1))[0] % 10000;
    } else {
      n = Math.floor(Math.random() * 10000);
    }
    return `RSA-${year}-${String(n).padStart(4, '0')}`;
  }

  /* --- Client-copy link -------------------------------------------------
     The email carries a link that reopens this page and rebuilds the very
     same printable copy the client can download, so the firm gets the
     identical PDF rather than a second rendering of the data.

     There is no server and no storage, so the submission travels inside the
     link's fragment (#copy=…). A fragment is never sent to the host — the
     browser keeps it locally — so opening the link puts nothing on the wire
     and leaves no copy behind on GitHub Pages.

     Only the fields the printed copy actually shows are carried, and they
     travel as a bare ordered array rather than a named object — field names
     would be a third of the payload. COPY_FIELDS is therefore positional:
     reorder or insert anything and every link already sitting in an inbox
     becomes unreadable, so bump COPY_VERSION whenever this list changes and
     old links will say so plainly instead of rendering a scrambled PDF. */
  const COPY_VERSION = 2;

  const COPY_FIELDS = [
    'fullName', 'nationalityLabel', 'isSaudi', 'idNumber', 'address', 'phone',
    'email', 'employerName', 'employerAddress', 'jobTitle', 'annualIncome',
    'bankName', 'iban', 'incomeSources', 'workType', 'otherFinancial'
  ];

  /* base64url — btoa alone mangles Arabic, and '+' and '/' would not survive
     being pasted out of an email client. */
  function toBase64url(bytes) {
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64url(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  /* Arabic costs two bytes a character in UTF-8 and base64 adds a third on
     top, so an uncompressed link runs past 1,100 characters — long enough
     that mail clients wrap it and it stops being one clickable thing.
     Deflating first roughly halves it. CompressionStream is absent on older
     browsers, so the first character of the token records which form it is
     in: 'z' deflated, 'p' plain. */
  const canCompress = typeof CompressionStream === 'function';
  const canDecompress = typeof DecompressionStream === 'function';

  async function pipe(bytes, stream) {
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return new Uint8Array(await new Response(stream.readable).arrayBuffer());
  }

  async function encodeCopy(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    if (!canCompress) return 'p' + toBase64url(bytes);
    return 'z' + toBase64url(await pipe(bytes, new CompressionStream('deflate-raw')));
  }

  async function decodeCopy(token) {
    const form = token.charAt(0);
    let bytes = fromBase64url(token.slice(1));

    if (form === 'z') {
      if (!canDecompress) throw new Error('This browser cannot read compressed links.');
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } else if (form !== 'p') {
      throw new Error('Unrecognised client-copy link format.');
    }

    const arr = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(arr) || arr[0] !== COPY_VERSION) {
      throw new Error('Unrecognised client-copy link format.');
    }

    const d = {};
    COPY_FIELDS.forEach((k, i) => { d[k] = arr[i + 3]; });
    return { v: arr[0], r: arr[1], l: arr[2], d };
  }

  /* A link built from location.origin is only meaningful to whoever is
     already on that origin — during local testing that is a localhost
     address the recipient's machine will never resolve. */
  function isLocalOrigin() {
    return location.protocol === 'file:'
      || /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
  }

  async function copyLink(data, reference, lang) {
    const payload = [COPY_VERSION, reference, lang]
      .concat(COPY_FIELDS.map(k => data[k]));

    const base = (CONFIG.siteUrl || (location.origin + location.pathname)).split('#')[0];
    return base + '#copy=' + await encodeCopy(payload);
  }

  /* --- Payload ----------------------------------------------------------
     Keys are bilingual labels so the email body reads cleanly in the
     firm's inbox regardless of which language the client used. */
  async function buildPayload(data, reference, lang) {
    const link = await copyLink(data, reference, lang);

    /* Say so in the email rather than shipping a link that silently resolves
       to nothing on the recipient's machine. */
    const linkValue = (!CONFIG.siteUrl && isLocalOrigin())
      ? link + '  ← LOCAL TEST ONLY. This address exists only on the machine '
             + 'that submitted the form. Set siteUrl in js/submit.js to the '
             + 'live domain before going live.'
      : link;

    const subject = lang === 'en'
      ? `KYC Form — ${reference} — ${data.fullName}`
      : `نموذج اعرف عميلك — ${reference} — ${data.fullName}`;

    const body = {
      'الرقم المرجعي / Reference':            reference,
      'لغة التعبئة / Form language':          lang === 'en' ? 'English' : 'العربية',
      'تاريخ الإرسال / Submitted':            new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh' }) + ' (Riyadh)',

      '— المعلومات الشخصية / Personal —':     '',
      'الاسم الكامل / Full name':             data.fullName,
      'الجنسية / Nationality':                data.nationalityLabel,
      [data.isSaudi
        ? 'رقم الهوية الوطنية / National ID'
        : 'رقم الإقامة / Iqama number']:      data.idNumber,
      'العنوان / Address':                    data.address,
      'رقم الجوال / Mobile':                  data.phone,
      'البريد الإلكتروني / Email':            data.email,

      '— جهة العمل / Employer —':             '',
      'اسم جهة العمل / Employer name':        data.employerName,
      'عنوان جهة العمل / Employer address':   data.employerAddress,
      'المسمى الوظيفي / Job title':           data.jobTitle,

      '— المعلومات المالية / Financial —':    '',
      'الدخل السنوي / Annual income (SAR)':   data.annualIncome,
      'اسم البنك / Bank name':                data.bankName,
      'الآيبان / IBAN':                       data.iban,

      '— معلومات عامة / General —':           '',
      'مصادر الدخل / Sources of income':      data.incomeSources,
      'طبيعة العمل / Nature of work':         data.workType,
      'معلومات مالية أخرى / Other financial info': data.otherFinancial || '—',

      '— الإقرار / Acknowledgement —':        '',
      'تم الإقرار / Acknowledged':            data.acknowledge ? 'نعم / Yes' : 'لا / No',

      '— نسخة PDF / PDF copy —':              '',
      'تحميل نسخة العميل (PDF) / Download the client copy (PDF)': linkValue
    };

    if (CONFIG.provider === 'formsubmit') {
      return Object.assign(body, {
        _subject: subject,
        _replyto: data.email,
        _template: 'table',
        _captcha: 'false',
        ...(CONFIG.clientCopy ? { _autoresponse: autoresponseText(reference, lang) } : {})
      });
    }

    return Object.assign(body, {
      access_key: CONFIG.accessKey,
      subject,
      from_name: 'KYC Form — Rawan Saleh A. Alghamdi',
      replyto: data.email,
      botcheck: data.botcheck || '',
      ...(CONFIG.clientCopy ? { autoresponse: autoresponseText(reference, lang) } : {})
    });
  }

  function autoresponseText(reference, lang) {
    return lang === 'en'
      ? `Thank you for completing the Know Your Client form.\n\n`
        + `Your reference number is ${reference}. Please keep it for your records; `
        + `we will be in touch shortly.\n\nRawan Saleh A. Alghamdi Law Firm`
      : `شكرًا لتعبئتكم نموذج اعرف عميلك.\n\n`
        + `الرقم المرجعي الخاص بكم هو ${reference}. يُرجى الاحتفاظ به للرجوع إليه، `
        + `وسيتم التواصل معكم في أقرب وقت.\n\nمكتب روان صالح عبدالله الغامدي للمحاماة`;
  }

  /* --- Send ------------------------------------------------------------- */
  async function send(data, lang) {
    if (CONFIG.provider === 'web3forms'
        && CONFIG.accessKey.startsWith('REPLACE_WITH')) {
      throw new Error(
        'Web3Forms access key is not configured. Set CONFIG.accessKey in js/submit.js.'
      );
    }

    const reference = makeReference();
    const url = CONFIG.provider === 'formsubmit'
      ? ENDPOINTS.formsubmit + encodeURIComponent(CONFIG.recipient)
      : ENDPOINTS.web3forms;

    /* Built before the request opens, so a fault in assembling the body is
       never reported to the client as a network failure. */
    const body = JSON.stringify(await buildPayload(data, reference, lang));

    /* A stalled connection would otherwise leave the button spinning with no
       way out. Abort after 30s and let the caller show the fallback contacts. */
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
        signal: ctrl.signal
      });
    } catch (err) {
      throw new Error(
        err.name === 'AbortError'
          ? 'Delivery timed out after 30s.'
          : `Could not reach the form service (${err.message}). `
            + 'Check the connection, or whether an ad/tracker blocker is '
            + 'blocking ' + new URL(url).host + '.'
      );
    } finally {
      clearTimeout(timer);
    }

    let json = {};
    try { json = await res.json(); } catch (_) { /* non-JSON error page */ }

    if (!res.ok || json.success === false) {
      throw new Error(json.message || `Delivery failed (HTTP ${res.status})`);
    }
    return reference;
  }

  return { send, makeReference, copyLink, decodeCopy, CONFIG };
})();
