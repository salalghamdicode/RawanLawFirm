/* ==========================================================================
   Bilingual copy for the KYC form.
   Every user-visible string lives here — nothing is hard-coded in index.html.
   Applied via [data-i18n] (text), [data-i18n-ph] (placeholder) and
   [data-i18n-aria] (aria-label). See js/app.js -> applyLanguage().
   ========================================================================== */

window.I18N = {
  ar: {
    dir: 'rtl',
    /* --- Document ------------------------------------------------------- */
    'meta.title': 'نموذج اعرف عميلك | روان صالح عبدالله الغامدي',
    'meta.desc': 'نموذج اعرف عميلك الإلكتروني لمكتب روان صالح عبدالله الغامدي للمحاماة والاستشارات القانونية والتوثيق.',

    /* --- Header --------------------------------------------------------- */
    'brand.alt': 'روان صالح عبدالله الغامدي — محاماة واستشارات قانونية وتوثيق',
    'tagline.1': 'محاماة',
    'tagline.2': 'استشارات قانونية',
    'tagline.3': 'توثيق',
    'lang.aria': 'اختيار اللغة',
    'lang.ar': 'العربية',
    'lang.en': 'English',

    /* --- Intro ---------------------------------------------------------- */
    'intro.title': 'نموذج اعرف عميلك',
    'intro.body': 'نرجو تعبئة البيانات التالية بدقة، حيث تُستخدم لأغراض التحقق من الهوية والالتزام بالمتطلبات النظامية. جميع الحقول المعلَّمة بعلامة (*) إلزامية.',

    /* --- Sections ------------------------------------------------------- */
    'sec.1': 'المعلومات الشخصية',
    'sec.2': 'معلومات جهة العمل',
    'sec.3': 'المعلومات المالية',
    'sec.4': 'معلومات عامة',
    'sec.5': 'الإقرار',

    /* --- Personal ------------------------------------------------------- */
    'f.name': 'الاسم الكامل',
    'f.name.ph': 'الاسم الأول واسم الأب واسم العائلة',
    'f.nationality': 'الجنسية',
    'f.nationality.ph': 'اختر الجنسية',
    'f.id.sa': 'رقم الهوية الوطنية',
    'f.id.other': 'رقم الإقامة',
    'f.id.hint.sa': 'عشرة أرقام تبدأ بالرقم ١',
    'f.id.hint.other': 'عشرة أرقام تبدأ بالرقم ٢',
    'f.address': 'العنوان الوطني',
    'f.address.ph': 'المدينة، الحي، الشارع، الرمز البريدي',
    'f.phone': 'رقم الجوال',
    'f.phone.ph': '5X XXX XXXX',
    'f.phone.ph.intl': 'XXX XXX XXX',
    'f.phone.hint': 'رقم جوال سعودي مكوّن من ٩ أرقام يبدأ بالرقم ٥',
    'f.phone.hint.intl': 'اختر رمز الدولة ثم أدخل الرقم بدون الصفر في أوله',
    'f.phone.cc.aria': 'رمز الدولة',
    'f.email': 'البريد الإلكتروني',
    'f.email.ph': 'name@example.com',

    /* --- Employer ------------------------------------------------------- */
    'f.employer': 'اسم جهة العمل',
    'f.employer.ph': 'اسم الشركة أو الجهة',
    'f.employerAddress': 'عنوان جهة العمل',
    'f.employerAddress.ph': 'المدينة، الحي، الشارع',
    'f.jobTitle': 'المسمى الوظيفي',
    'f.jobTitle.ph': 'المسمى الوظيفي الحالي',

    /* --- Financial ------------------------------------------------------ */
    'f.income': 'الدخل السنوي التقريبي',
    'f.income.ph': '0',
    'f.income.hint': 'بالريال السعودي، بشكل تقريبي',
    'f.currency': 'ر.س',
    'f.bank': 'اسم البنك',
    'f.bank.ph': 'اختر أو اكتب اسم البنك',
    'f.iban': 'رقم الآيبان',
    'f.iban.ph': 'SA00 0000 0000 0000 0000 0000',
    'f.iban.hint': 'يبدأ بـ SA ويتكوّن من ٢٤ خانة',

    /* --- General -------------------------------------------------------- */
    'q.income': 'مصادر الدخل',
    'q.income.hint': 'يمكن اختيار أكثر من مصدر',
    'q.income.salary': 'راتب وظيفي',
    'q.income.other': 'مصدر آخر',
    'q.income.other.ph': 'يرجى تحديد مصدر الدخل',
    'q.work': 'طبيعة العمل',
    'q.work.self': 'عمل حر / لحسابه الخاص',
    'q.work.other': 'غير ذلك',
    'q.work.other.ph': 'يرجى تحديد طبيعة العمل',
    'f.notes': 'أي معلومات مالية أخرى',
    'f.notes.ph': 'اختياري — أضف أي معلومات مالية ترى أهمية ذكرها',

    /* --- Acknowledgement ------------------------------------------------
       The Arabic wording below is the operative text and is reproduced
       verbatim in both language modes.                                    */
    'ack.text': 'أقر بصحة المعلومات والبيانات المدونة في هذا النموذج وأن عنوان المراسلة هو نفس العنوان الشخصي الدائم وأنه ليس عنوان حفظ أو عنوان يخص الغير. كما أقر أن جميع البيانات في هذا النموذج تخص مالك الحساب الرئيسي وليس المفوض.',
    'ack.confirm': 'أقر بصحة ما ورد أعلاه',
    'ack.original.label': 'النص الأصلي (عربي)',

    /* --- Actions -------------------------------------------------------- */
    'btn.submit': 'إرسال النموذج',
    'btn.sending': 'جارٍ الإرسال…',
    'btn.download': 'تحميل نسخة (PDF)',
    'btn.another': 'تعبئة نموذج آخر',

    /* --- Validation ----------------------------------------------------- */
    'e.required': 'هذا الحقل مطلوب',
    'e.select': 'يرجى الاختيار من القائمة',
    'e.choose': 'يرجى اختيار خيار واحد على الأقل',
    'e.name': 'يرجى إدخال الاسم الكامل (اسمين على الأقل)',
    'e.id.sa': 'رقم الهوية الوطنية يجب أن يكون ١٠ أرقام ويبدأ بالرقم ١',
    'e.id.other': 'رقم الإقامة يجب أن يكون ١٠ أرقام ويبدأ بالرقم ٢',
    'e.phone': 'رقم جوال غير صحيح — يجب أن يبدأ بالرقم ٥ ويتكوّن من ٩ أرقام',
    'e.phone.intl': 'رقم جوال غير صحيح',
    'e.email': 'البريد الإلكتروني غير صحيح',
    'e.income': 'يرجى إدخال مبلغ صحيح',
    'e.iban': 'رقم آيبان غير صحيح — تحقّق من الأرقام المدخلة',
    'e.iban.sa': 'الآيبان السعودي يجب أن يبدأ بـ SA ويتكوّن من ٢٤ خانة',
    'e.ack': 'يجب الموافقة على الإقرار قبل الإرسال',
    'e.summary': 'يوجد {n} حقل يحتاج إلى مراجعة. تم الانتقال إلى أول حقل.',
    'e.send': 'تعذّر إرسال النموذج. يرجى المحاولة مرة أخرى، أو التواصل معنا على {phone} أو {email}.',

    /* --- Confirmation --------------------------------------------------- */
    'ok.title': 'تم استلام النموذج بنجاح',
    'ok.body': 'شكرًا لك. تم إرسال بياناتك إلى المكتب وسيتم التواصل معك في أقرب وقت. يُرجى الاحتفاظ بالرقم المرجعي أدناه.',
    'ok.ref': 'الرقم المرجعي',
    'ok.hint': 'ننصح بتحميل نسخة من النموذج للرجوع إليها عند الحاجة.',

    /* --- Client copy opened from the email link -------------------------- */
    'copy.title': 'نسخة العميل',
    'copy.body': 'هذه نسخة النموذج كما عبّأها العميل. اضغط على الزر أدناه لتحميلها بصيغة PDF.',
    'copy.error': 'تعذّرت قراءة هذا الرابط. قد يكون قد اقتُطع عند نسخه من البريد الإلكتروني — يُرجى فتحه مباشرة من الرسالة الأصلية.',

    /* --- Print ---------------------------------------------------------- */
    'p.title': 'نموذج اعرف عميلك',
    'p.date': 'تاريخ التعبئة',
    'p.ref': 'الرقم المرجعي',
    'p.foot': 'هذه نسخة من النموذج المُقدَّم إلكترونيًا، وقد تم استلام النسخة الأصلية لدى المكتب.',

    /* --- Footer --------------------------------------------------------- */
    'ft.phone': '+966 548 548 270',
    'ft.email': 'rawan@rsalawfirm.co',
    'ft.address': 'السعودية، الرياض، طريق الامير محمد بن عبدالعزيز، العليا',
    'ft.license': 'ترخيص المحاماة رقم 113/41 — أعمال وخدمات التوثيق / ترخيص وزارة العدل رقم 1913/41',
    'ft.rights': 'جميع الحقوق محفوظة © {year} مكتب روان صالح عبدالله الغامدي للمحاماة'
  },

  en: {
    dir: 'ltr',
    /* --- Document ------------------------------------------------------- */
    'meta.title': 'Know Your Client Form | Rawan Saleh A. Alghamdi',
    'meta.desc': 'Online Know Your Client (KYC) form for Rawan Saleh A. Alghamdi Law Firm, Legal Advisory & Notary.',

    /* --- Header --------------------------------------------------------- */
    'brand.alt': 'Rawan Saleh A. Alghamdi — Law Firm, Legal Advisory & Notary',
    'tagline.1': 'Law Firm',
    'tagline.2': 'Legal Advisory',
    'tagline.3': 'Notary',
    'lang.aria': 'Select language',
    'lang.ar': 'العربية',
    'lang.en': 'English',

    /* --- Intro ---------------------------------------------------------- */
    'intro.title': 'Know Your Client Form',
    'intro.body': 'Please complete the following information accurately. It is used to verify your identity and to meet our regulatory obligations. Fields marked with an asterisk (*) are required.',

    /* --- Sections ------------------------------------------------------- */
    'sec.1': 'Personal Information',
    'sec.2': 'Employer Information',
    'sec.3': 'Financial Information',
    'sec.4': 'General Information',
    'sec.5': 'Acknowledgement',

    /* --- Personal ------------------------------------------------------- */
    'f.name': 'Full name',
    'f.name.ph': 'First, father’s and family name',
    'f.nationality': 'Nationality',
    'f.nationality.ph': 'Select nationality',
    'f.id.sa': 'National ID number',
    'f.id.other': 'Residence (Iqama) number',
    'f.id.hint.sa': 'Ten digits, beginning with 1',
    'f.id.hint.other': 'Ten digits, beginning with 2',
    'f.address': 'National address',
    'f.address.ph': 'City, district, street, postal code',
    'f.phone': 'Mobile number',
    'f.phone.ph': '5X XXX XXXX',
    'f.phone.ph.intl': 'XXX XXX XXX',
    'f.phone.hint': 'Saudi mobile number — 9 digits beginning with 5',
    'f.phone.hint.intl': 'Pick your country code, then the number without its leading zero',
    'f.phone.cc.aria': 'Country dialling code',
    'f.email': 'Email address',
    'f.email.ph': 'name@example.com',

    /* --- Employer ------------------------------------------------------- */
    'f.employer': 'Employer name',
    'f.employer.ph': 'Company or organisation name',
    'f.employerAddress': 'Employer address',
    'f.employerAddress.ph': 'City, district, street',
    'f.jobTitle': 'Job title',
    'f.jobTitle.ph': 'Your current job title',

    /* --- Financial ------------------------------------------------------ */
    'f.income': 'Approximate annual income',
    'f.income.ph': '0',
    'f.income.hint': 'In Saudi Riyals, approximate',
    'f.currency': 'SAR',
    'f.bank': 'Bank name',
    'f.bank.ph': 'Select or type your bank',
    'f.iban': 'IBAN',
    'f.iban.ph': 'SA00 0000 0000 0000 0000 0000',
    'f.iban.hint': 'Begins with SA and is 24 characters long',

    /* --- General -------------------------------------------------------- */
    'q.income': 'Sources of income',
    'q.income.hint': 'Select all that apply',
    'q.income.salary': 'Job salary',
    'q.income.other': 'Other',
    'q.income.other.ph': 'Please specify your source of income',
    'q.work': 'Nature of work',
    'q.work.self': 'Self-employed',
    'q.work.other': 'Other',
    'q.work.other.ph': 'Please specify the nature of the work',
    'f.notes': 'Any other financial information',
    'f.notes.ph': 'Optional — add anything else you consider relevant',

    /* --- Acknowledgement ------------------------------------------------ */
    'ack.text': 'I acknowledge that the information and data recorded in this form are accurate, that the correspondence address is the same as my permanent personal address, and that it is neither a hold-mail address nor an address belonging to a third party. I further acknowledge that all data in this form belongs to the principal account holder and not to an authorised representative.',
    'ack.confirm': 'I confirm the above is true and accurate',
    'ack.original.label': 'Original text (Arabic)',

    /* --- Actions -------------------------------------------------------- */
    'btn.submit': 'Submit form',
    'btn.sending': 'Sending…',
    'btn.download': 'Download a copy (PDF)',
    'btn.another': 'Submit another form',

    /* --- Validation ----------------------------------------------------- */
    'e.required': 'This field is required',
    'e.select': 'Please choose from the list',
    'e.choose': 'Please select at least one option',
    'e.name': 'Please enter your full name (at least two names)',
    'e.id.sa': 'A National ID must be 10 digits beginning with 1',
    'e.id.other': 'An Iqama number must be 10 digits beginning with 2',
    'e.phone': 'Invalid mobile number — 9 digits beginning with 5',
    'e.phone.intl': 'Invalid mobile number',
    'e.email': 'Please enter a valid email address',
    'e.income': 'Please enter a valid amount',
    'e.iban': 'Invalid IBAN — please check the digits entered',
    'e.iban.sa': 'A Saudi IBAN begins with SA and is 24 characters long',
    'e.ack': 'You must accept the acknowledgement before submitting',
    'e.summary': '{n} field(s) need attention. Jumped to the first one.',
    'e.send': 'The form could not be sent. Please try again, or contact us on {phone} or {email}.',

    /* --- Confirmation --------------------------------------------------- */
    'ok.title': 'Your form has been received',
    'ok.body': 'Thank you. Your details have been sent to the firm and we will be in touch shortly. Please keep the reference number below for your records.',
    'ok.ref': 'Reference number',
    'ok.hint': 'We recommend downloading a copy of the form for your records.',

    /* --- Client copy opened from the email link -------------------------- */
    'copy.title': 'Client copy',
    'copy.body': 'This is the form exactly as the client completed it. Use the button below to download it as a PDF.',
    'copy.error': 'This link could not be read. It may have been truncated when copied out of the email — please open it directly from the original message.',

    /* --- Print ---------------------------------------------------------- */
    'p.title': 'Know Your Client Form',
    'p.date': 'Date submitted',
    'p.ref': 'Reference',
    'p.foot': 'This is a copy of the form submitted online. The original has been received by the firm.',

    /* --- Footer --------------------------------------------------------- */
    'ft.phone': '+966 548 548 270',
    'ft.email': 'rawan@rsalawfirm.co',
    'ft.address': 'Al Olaya, Prince Mohammed bin Abdulaziz Road, Riyadh, Saudi Arabia',
    'ft.license': 'Lawyer License No. 113/41 — Notary Public Services / M.O.J. License No. 1913/41',
    'ft.rights': '© {year} Rawan Saleh A. Alghamdi Law Firm. All rights reserved.'
  }
};
