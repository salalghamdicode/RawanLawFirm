/* ==========================================================================
   Validation helpers — pure functions, no DOM access.
   Consumed by js/app.js.
   ========================================================================== */

window.V = (function () {
  'use strict';

  /* Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits map to ASCII.
     A client typing on an Arabic keyboard will produce these, and every
     numeric rule below assumes ASCII, so normalise before anything else. */
  function toLatinDigits(s) {
    return String(s == null ? '' : s)
      .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
      .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48));
  }

  const digitsOnly = s => toLatinDigits(s).replace(/\D/g, '');
  const trim       = s => String(s == null ? '' : s).trim();

  /* --- Identity ---------------------------------------------------------
     Saudi National IDs are 10 digits beginning with 1; Iqama (residence)
     numbers are 10 digits beginning with 2. */
  const nationalId = v => /^1\d{9}$/.test(digitsOnly(v));
  const iqama      = v => /^2\d{9}$/.test(digitsOnly(v));
  const idNumber   = (v, isSaudi) => (isSaudi ? nationalId(v) : iqama(v));

  /* --- Name -------------------------------------------------------------
     At least two name parts, each two or more characters. */
  function fullName(v) {
    const parts = trim(v).split(/\s+/).filter(p => p.length >= 2);
    return parts.length >= 2;
  }

  /* --- Email ------------------------------------------------------------ */
  const email = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(trim(v));

  /* --- Phone ------------------------------------------------------------
     Accepts 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX and
     reduces all of them to the 9-digit national form 5XXXXXXXX. */
  function normalizeSaudiMobile(v) {
    let d = digitsOnly(v);
    if (d.startsWith('00966')) d = d.slice(5);
    else if (d.startsWith('966')) d = d.slice(3);
    if (d.startsWith('0')) d = d.slice(1);
    return d;
  }
  const saudiMobile = v => /^5\d{8}$/.test(normalizeSaudiMobile(v));

  /* Non-Saudi clients may hold a foreign number, so only a loose sanity
     check applies: 7–15 digits, the E.164 range. */
  const intlMobile = v => /^\d{7,15}$/.test(digitsOnly(v));

  /* --- Money ------------------------------------------------------------ */
  function parseAmount(v) {
    const s = toLatinDigits(v)
      .replace(/٫/g, '.')      /* Arabic decimal separator  ٫ */
      .replace(/[,\s٬]/g, ''); /* Arabic thousands separator ٬ */
    const n = Number(s);
    return s !== '' && Number.isFinite(n) ? n : NaN;
  }
  function amount(v) {
    const n = parseAmount(v);
    return Number.isFinite(n) && n >= 0 && n < 1e15;
  }
  function formatAmount(v) {
    const n = parseAmount(v);
    return Number.isFinite(n) ? n.toLocaleString('en-US') : '';
  }

  /* --- IBAN -------------------------------------------------------------
     ISO 13616: move the first four characters to the end, convert letters
     to digits (A=10 … Z=35), then the whole number mod 97 must equal 1.
     The value is far wider than a JS Number, so fold it chunk by chunk. */
  const IBAN_LENGTH = { SA: 24, AE: 23, BH: 22, KW: 30, QA: 29, OM: 23, JO: 30, EG: 29, GB: 22 };

  /* Strip spaces, hyphens and any bidi control marks an RTL editor may inject. */
  const cleanIban = v =>
    toLatinDigits(v).replace(/[\s\-\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, '').toUpperCase();

  function ibanChecksum(v) {
    const s = cleanIban(v);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return false;
    const re = s.slice(4) + s.slice(0, 4);
    let rem = 0;
    for (const ch of re) {
      const part = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
      for (const d of part) rem = (rem * 10 + Number(d)) % 97;
    }
    return rem === 1;
  }

  /* Structure only — used to give a more specific message than "invalid". */
  function ibanStructure(v) {
    const s = cleanIban(v);
    const cc = s.slice(0, 2);
    const expected = IBAN_LENGTH[cc];
    if (!/^[A-Z]{2}\d{2}/.test(s)) return false;
    return expected ? s.length === expected : s.length >= 15 && s.length <= 34;
  }

  const iban = v => ibanStructure(v) && ibanChecksum(v);

  /* Display grouping: SA44 2000 0001 2345 6789 1234 */
  function formatIban(v) {
    return cleanIban(v).replace(/(.{4})/g, '$1 ').trim();
  }

  return {
    toLatinDigits, digitsOnly, trim,
    nationalId, iqama, idNumber,
    fullName, email,
    normalizeSaudiMobile, saudiMobile, intlMobile,
    parseAmount, amount, formatAmount,
    cleanIban, iban, ibanChecksum, ibanStructure, formatIban,
    IBAN_LENGTH
  };
})();
