/* Tests for js/validate.js — run with:  node test/validate.test.js
   No dependencies; exits non-zero on failure. */

const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'js', 'validate.js'));
const V = global.window.V;

let fails = 0;
function t(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? '  ok  ' : '  FAIL'}  ${label}` +
    (ok ? '' : `\n           got=${JSON.stringify(got)}  want=${JSON.stringify(want)}`));
}

console.log('\nIBAN (mod-97, ISO 13616):');
t('valid published Saudi IBAN',       V.iban('SA0380000000608010167519'), true);
t('spaced and lower-case',            V.iban('sa03 8000 0000 6080 1016 7519'), true);
t('single digit altered',             V.iban('SA0380000000608010167518'), false);
t('valid UK IBAN',                    V.iban('GB82WEST12345698765432'), true);
t('SA too short',                     V.iban('SA038000000060801016'), false);
t('Arabic-Indic digits accepted',     V.iban('SA٠٣٨٠٠٠٠٠٠٠٦٠٨٠١٠١٦٧٥١٩'), true);
t('grouped for display',              V.formatIban('SA0380000000608010167519'), 'SA03 8000 0000 6080 1016 7519');
t('structure vs checksum separable',  [V.ibanStructure('SA0380000000608010167518'),
                                       V.ibanChecksum('SA0380000000608010167518')], [true, false]);

console.log('\nNational ID / Iqama:');
t('1… is a National ID',              V.idNumber('1012345678', true), true);
t('2… rejected as a National ID',     V.idNumber('2012345678', true), false);
t('2… is an Iqama',                   V.idNumber('2012345678', false), true);
t('1… rejected as an Iqama',          V.idNumber('1012345678', false), false);
t('Arabic-Indic digits accepted',     V.idNumber('١٠١٢٣٤٥٦٧٨', true), true);
t('nine digits rejected',             V.idNumber('101234567', true), false);
t('eleven digits rejected',           V.idNumber('10123456789', true), false);

console.log('\nSaudi mobile:');
['0501234567', '501234567', '+966501234567', '00966501234567', '٠٥٠١٢٣٤٥٦٧', '+966 50 123 4567']
  .forEach(p => t(`accepts ${p}`, V.saudiMobile(p), true));
t('normalises to national form',      V.normalizeSaudiMobile('+966 50 123 4567'), '501234567');
t('rejects a landline',               V.saudiMobile('0112345678'), false);
t('rejects too few digits',           V.saudiMobile('50123456'), false);

console.log('\nName, email, amount:');
t('single name rejected',             V.fullName('محمد'), false);
t('two names accepted',               V.fullName('محمد الغامدي'), true);
t('initials do not count',            V.fullName('A B'), false);
t('valid email',                      V.email('a.b@example.co'), true);
t('missing TLD rejected',             V.email('a@b'), false);
t('comma thousands parsed',           V.parseAmount('120,000'), 120000);
t('Arabic separators parsed',         V.parseAmount('١٢٠٬٠٠٠'), 120000);
t('empty is NaN',                     Number.isNaN(V.parseAmount('')), true);
t('formats with separators',          V.formatAmount('480000'), '480,000');

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nAll validation tests passed\n');
process.exit(fails ? 1 : 0);
