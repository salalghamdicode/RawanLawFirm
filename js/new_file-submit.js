/* ==========================================================================
   Submission adapter for the claim-intake form.

   GitHub Pages serves static files only, so the form is delivered by a
   third-party form backend — the same arrangement as the KYC form. This page
   uses FormSubmit rather than Web3Forms for one reason: it carries file
   attachments on the free tier. Web3Forms' attachments are a paid feature,
   capped at a single 5 MB file, so المستندات could not work through it.

   The KYC form (js/submit.js) is untouched and keeps using Web3Forms.
   ========================================================================== */

window.CASE_SUBMIT = (function () {
  'use strict';

  const CONFIG = {
    provider: 'formsubmit',

    /* Where submissions land. FormSubmit needs no signup and no key, but the
       FIRST submission to a new address triggers a one-time activation email
       to that address which must be accepted before anything else arrives. */
    recipient: 'rawan@rawanlawfirm.com',

    /* FormSubmit caps the sum of all attachments at 10 MB. Enforced here as
       well as in the UI, so an oversized payload is refused before it costs
       the applicant a long upload that the endpoint would only reject. */
    maxTotalBytes: 10 * 1024 * 1024,
    maxFiles: 10,

    /* Fallback contacts shown if delivery fails. */
    firmPhone: '+966 548 548 270',
    firmEmail: 'rawan@rsalawfirm.co',

    /* Base address used to build the applicant-copy link placed in the email.
       This must match the domain configured in GitHub Pages. Serving the form
       from anywhere else (including localhost) still works; the link simply
       always points here, which is the whole point: the recipient opens it on
       their own machine, not the sender's.

       Leave empty only to fall back to whatever address the form was served
       from — useful when testing the link locally.

       The page lives at new_file/index.html so that GitHub Pages serves it
       from the extensionless URL below: a request for /new_file is answered
       with a 301 to /new_file/, which resolves to the directory's index.
       Must match wherever the form is actually published. */
    siteUrl: 'https://rawanlawfirm.com/new_file/'
  };

  const ENDPOINT = 'https://formsubmit.co/ajax/';

  /* --- Reference number -------------------------------------------------
     RSA-<year>-<4 digits>, e.g. RSA-2026-0431. Short enough to read over
     the phone; the firm disambiguates by name and date if two ever collide.
     Same format as the KYC form so the office handles one kind of number. */
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

  /* --- Applicant-copy link ----------------------------------------------
     The email carries a link that reopens this page and rebuilds the very
     same printable copy the applicant can download, so the firm gets the
     identical PDF rather than a second rendering of the data.

     There is no server and no storage, so the submission travels inside the
     link's fragment (#copy=…). A fragment is never sent to the host — the
     browser keeps it locally — so opening the link puts nothing on the wire
     and leaves no copy behind on GitHub Pages.

     Attached file BYTES cannot ride in a URL, so only their names travel.
     The files themselves live in the notification email.

     Fields travel as a bare ordered array rather than a named object — field
     names would be a third of the payload. COPY_FIELDS is therefore
     positional: reorder or insert anything and every link already sitting in
     an inbox becomes unreadable, so bump COPY_VERSION whenever this list
     changes and old links will say so plainly instead of rendering a
     scrambled PDF.

     COPY_FORM leads the payload so a KYC link opened on this page — or one of
     these opened on the KYC page — is rejected with the plain "unreadable
     link" message rather than rendering another form's fields in these slots. */
  const COPY_FORM = 'CASE';
  const COPY_VERSION = 1;

  const COPY_FIELDS = [
    'fullName', 'idNumber', 'phone', 'email',
    'caseSubject', 'requests', 'documentsText', 'fileNames'
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
     top, so an uncompressed link runs long enough that mail clients wrap it
     and it stops being one clickable thing. Deflating first roughly halves
     it. CompressionStream is absent on older browsers, so the first character
     of the token records which form it is in: 'z' deflated, 'p' plain. */
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
      throw new Error('Unrecognised applicant-copy link format.');
    }

    const arr = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(arr) || arr[0] !== COPY_FORM || arr[1] !== COPY_VERSION) {
      throw new Error('Unrecognised applicant-copy link format.');
    }

    const d = {};
    COPY_FIELDS.forEach((k, i) => { d[k] = arr[i + 4]; });
    return { v: arr[1], r: arr[2], l: arr[3], d };
  }

  /* A link built from location.origin is only meaningful to whoever is
     already on that origin — during local testing that is a localhost
     address the recipient's machine will never resolve. */
  function isLocalOrigin() {
    return location.protocol === 'file:'
      || /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
  }

  async function copyLink(data, reference, lang) {
    const payload = [COPY_FORM, COPY_VERSION, reference, lang]
      .concat(COPY_FIELDS.map(k => data[k]));

    const base = (CONFIG.siteUrl || (location.origin + location.pathname)).split('#')[0];
    return base + '#copy=' + await encodeCopy(payload);
  }

  /* --- Payload ----------------------------------------------------------
     Keys are bilingual labels so the email body reads cleanly in the firm's
     inbox regardless of which language the applicant used. */
  async function buildFields(data, reference, lang) {
    const link = await copyLink(data, reference, lang);

    /* Say so in the email rather than shipping a link that silently resolves
       to nothing on the recipient's machine. */
    const linkValue = (!CONFIG.siteUrl && isLocalOrigin())
      ? link + '  ← LOCAL TEST ONLY. This address exists only on the machine '
             + 'that submitted the form. Set siteUrl in js/new_file-submit.js '
             + 'to the live domain before going live.'
      : link;

    const subject = lang === 'en'
      ? `Claim Intake — ${reference} — ${data.fullName}`
      : `نموذج قيد دعوى — ${reference} — ${data.fullName}`;

    const attached = (data.fileNames && data.fileNames.length)
      ? data.fileNames.join('\n')
      : (lang === 'en' ? 'None' : 'لا يوجد');

    return {
      'الرقم المرجعي / Reference':        reference,
      'لغة التعبئة / Form language':      lang === 'en' ? 'English' : 'العربية',
      'تاريخ الإرسال / Submitted':        new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh' }) + ' (Riyadh)',

      '— بيانات مقدم الطلب / Applicant —': '',
      'الاسم / Full name':                data.fullName,
      'رقم الهوية / ID number':           data.idNumber,
      'رقم الجوال / Mobile':              data.phone,
      'البريد الإلكتروني / Email':        data.email,

      '— موضوع الدعوى / Subject —':       '',
      'وصف الدعوى / Description':         data.caseSubject,

      '— الطلبات / Requests —':           '',
      'الطلبات / Requests':               data.requests,

      '— المستندات / Documents —':        '',
      'وصف المستندات / Described':        data.documentsText || '—',
      'الملفات المرفقة / Attached files': attached,

      '— نسخة PDF / PDF copy —':          '',
      'تحميل نسخة مقدم الطلب (PDF) / Download the applicant copy (PDF)': linkValue,

      /* FormSubmit control fields. _template: 'table' gives a readable HTML
         table; _captcha: 'false' suppresses the interstitial, which an AJAX
         submission can never satisfy. */
      _subject: subject,
      _replyto: data.email,
      _template: 'table',
      _captcha: 'false'
    };
  }

  /* --- Send -------------------------------------------------------------
     Sent as multipart/form-data rather than JSON, because that is the only
     shape that can carry the attachments. The Content-Type header is
     deliberately NOT set: the browser has to write it itself so the multipart
     boundary is included, and setting it by hand produces a body the endpoint
     cannot parse.                                                          */
  async function send(data, files, lang) {
    const reference = makeReference();

    const total = (files || []).reduce((sum, f) => sum + f.size, 0);
    if (total > CONFIG.maxTotalBytes) {
      throw new Error(
        `Attachments total ${(total / 1048576).toFixed(1)} MB, over the `
        + `${CONFIG.maxTotalBytes / 1048576} MB limit.`
      );
    }

    /* Built before the request opens, so a fault in assembling the body is
       never reported to the applicant as a network failure. */
    const fields = await buildFields(data, reference, lang);
    const body = new FormData();
    Object.keys(fields).forEach(k => body.append(k, fields[k]));

    /* Honeypot: forwarded as-is so FormSubmit can drop bot submissions. */
    body.append('_honey', data.honey || '');

    /* Distinct keys — a repeated key is not reliably read as a list. */
    (files || []).forEach((f, i) => body.append(`attachment${i + 1}`, f, f.name));

    /* A stalled connection would otherwise leave the button spinning with no
       way out. Uploads are slower than a JSON post, so the ceiling is higher
       here than the KYC form's 30s. */
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 120000);

    const url = ENDPOINT + encodeURIComponent(CONFIG.recipient);

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        signal: ctrl.signal
      });
    } catch (err) {
      throw new Error(
        err.name === 'AbortError'
          ? 'Delivery timed out after 120s. The attachments may be too large '
            + 'for the connection.'
          : `Could not reach the form service (${err.message}). `
            + 'Check the connection, or whether an ad/tracker blocker is '
            + 'blocking ' + new URL(url).host + '.'
      );
    } finally {
      clearTimeout(timer);
    }

    let json = {};
    try { json = await res.json(); } catch (_) { /* non-JSON error page */ }

    /* FormSubmit reports success as the STRING "true", not a boolean, so this
       tests for an explicit failure rather than for a truthy success. */
    const failed = json.success === false || json.success === 'false';
    if (!res.ok || failed) {
      throw new Error(json.message || `Delivery failed (HTTP ${res.status})`);
    }
    return reference;
  }

  return { send, makeReference, copyLink, decodeCopy, CONFIG };
})();
