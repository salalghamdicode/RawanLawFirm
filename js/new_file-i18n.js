/* ==========================================================================
   Bilingual copy for the file-opening form.
   Every user-visible string lives here — nothing is hard-coded in
   new_file.html. Applied via [data-i18n] (text), [data-i18n-ph]
   (placeholder) and [data-i18n-aria] (aria-label).
   See js/new_file-app.js -> applyLanguage().

   Kept in its own namespace so this page and the KYC page can never collide
   over a key, even if both scripts are ever loaded together.
   ========================================================================== */

window.I18N_CASE = {
  ar: {
    dir: 'rtl',
    /* --- Document ------------------------------------------------------- */
    'meta.title': 'نموذج فتح ملف | روان صالح عبدالله الغامدي',
    'meta.desc': 'نموذج فتح ملف إلكتروني لمكتب روان صالح عبدالله الغامدي للمحاماة والاستشارات القانونية والتوثيق.',

    /* --- Header --------------------------------------------------------- */
    'brand.alt': 'روان صالح عبدالله الغامدي — محاماة واستشارات قانونية وتوثيق',
    'tagline.1': 'محاماة',
    'tagline.2': 'استشارات قانونية',
    'tagline.3': 'توثيق',
    'lang.aria': 'اختيار اللغة',
    'lang.ar': 'العربية',
    'lang.en': 'English',

    /* --- Intro ---------------------------------------------------------- */
    'intro.title': 'نموذج فتح ملف',
    'intro.body': 'يرجى تعبئة البيانات التالية بدقة، حيث تُستخدم المعلومات والبيانات المقدمة لغرض فتح ملف للعميل لدى المكتب، ودراسة الموضوع وتقييمه قانونيًا، وإعداد ومتابعة الخدمات القانونية ذات الصلة. جميع الحقول المعلَّمة بعلامة (*) إلزامية.',

    /* --- Sections ------------------------------------------------------- */
    'sec.1': 'بيانات مقدم الطلب',
    'sec.2': 'موضوع الطلب',
    'sec.3': 'الطلبات',
    'sec.4': 'المستندات',

    /* --- Applicant ------------------------------------------------------ */
    'f.name': 'الاسم',
    'f.name.ph': 'الاسم الأول واسم الأب واسم العائلة',
    'f.id': 'رقم الهوية',
    'f.id.hint': 'عشرة أرقام تبدأ بالرقم ١ (هوية وطنية) أو ٢ (إقامة)',
    'f.phone': 'رقم الجوال',
    'f.phone.ph': '5X XXX XXXX',
    'f.phone.ph.intl': 'XXX XXX XXX',
    'f.phone.hint': 'رقم جوال سعودي مكوّن من ٩ أرقام يبدأ بالرقم ٥',
    'f.phone.hint.intl': 'اختر رمز الدولة ثم أدخل الرقم بدون الصفر في أوله',
    'f.phone.cc.aria': 'رمز الدولة',
    'f.email': 'البريد الإلكتروني',
    'f.email.ph': 'name@example.com',

    /* --- Request ---------------------------------------------------------- */
    'q.reqtype': 'نوع الطلب',
    'q.reqtype.litigation': 'دعوى قضائية',
    'q.reqtype.consultation': 'استشارة قانونية',
    'q.reqtype.drafting': 'صياغة ومراجعة قانونية (عقود، اتفاقيات، خطابات، مذكرات وغيرها)',
    'q.reqtype.demand': 'مطالبة قانونية',
    'q.reqtype.negotiation': 'تفاوض وتسوية',
    'q.reqtype.enforcement': 'تنفيذ',
    'q.reqtype.corporate': 'خدمات الشركات',
    'q.reqtype.ip': 'ملكية فكرية',
    'q.reqtype.notary': 'توثيق',
    'q.reqtype.other': 'أخرى',
    'q.reqtype.other.ph': 'يرجى تحديد نوع الطلب',

    /* --- Case ----------------------------------------------------------- */
    'f.case': 'وصف مبسط لموضوع الطلب',
    'f.case.ph': 'اشرح موضوع طلبك بإيجاز، مع ذكر أهم الوقائع',
    'f.case.hint': 'يكفي وصف موجز وواضح — سيتواصل المكتب معك لاستكمال التفاصيل',

    /* --- Requests ------------------------------------------------------- */
    'f.requests': 'الطلبات',
    'f.requests.ph': '١- إلزام المدعى عليه بـ…\n٢- التعويض عن…',
    'f.requests.hint': 'اكتب كل طلب في سطر مستقل',

    /* --- Documents ------------------------------------------------------ */
    'q.docs': 'المستندات',
    'q.docs.hint': 'يمكن وصف المستندات كتابةً أو إرفاقها أو كليهما',
    'f.docs.text': 'وصف المستندات كتابةً',
    'f.docs.text.ph': 'مثال: صك الملكية، عقد الإيجار، كشف حساب بنكي، محضر الشرطة',
    'f.docs.upload': 'إرفاق المستندات',
    'f.docs.drop': 'اسحب الملفات إلى هنا أو اضغط للاختيار',
    'f.docs.types': 'PDF أو JPG أو PNG أو DOC — بحد أقصى ١٠ ميجابايت لجميع الملفات',
    'f.docs.count': 'الملفات المرفقة ({n})',
    'f.docs.remove': 'إزالة الملف',
    'f.docs.none': 'لم تُرفق ملفات',

    /* --- Actions -------------------------------------------------------- */
    'btn.submit': 'إرسال النموذج',
    'btn.sending': 'جارٍ الإرسال…',
    'btn.download': 'تحميل نسخة (PDF)',
    'btn.another': 'تعبئة نموذج آخر',

    /* --- Validation ----------------------------------------------------- */
    'e.required': 'هذا الحقل مطلوب',
    'e.name': 'يرجى إدخال الاسم الكامل (اسمين على الأقل)',
    'e.id': 'رقم الهوية يجب أن يكون ١٠ أرقام ويبدأ بالرقم ١ أو ٢',
    'e.phone': 'رقم جوال غير صحيح — يجب أن يبدأ بالرقم ٥ ويتكوّن من ٩ أرقام',
    'e.phone.intl': 'رقم جوال غير صحيح',
    'e.email': 'البريد الإلكتروني غير صحيح',
    'e.reqtype': 'يرجى اختيار نوع الطلب',
    'e.reqtype.other': 'يرجى تحديد نوع الطلب',
    'e.case.short': 'يرجى إعطاء وصف أوضح لموضوع الطلب',
    'e.docs': 'يرجى وصف المستندات كتابةً أو إرفاقها',
    'e.file.type': 'نوع الملف «{name}» غير مقبول. الأنواع المقبولة: PDF، JPG، PNG، DOC',
    'e.file.size': 'تجاوز الحجم الإجمالي المسموح ({max}). لم تتم إضافة «{name}».',
    'e.file.count': 'الحد الأقصى {max} ملفات.',
    'e.summary': 'يوجد {n} حقل يحتاج إلى مراجعة. تم الانتقال إلى أول حقل.',
    'e.send': 'تعذّر إرسال النموذج. يرجى المحاولة مرة أخرى، أو التواصل معنا على {phone} أو {email}.',

    /* --- Confirmation --------------------------------------------------- */
    'ok.title': 'تم استلام النموذج بنجاح',
    'ok.body': 'شكرًا لك. تم إرسال بياناتك ومستنداتك إلى المكتب وسيتم التواصل معك في أقرب وقت. يُرجى الاحتفاظ بالرقم المرجعي أدناه.',
    'ok.ref': 'الرقم المرجعي',
    'ok.hint': 'ننصح بتحميل نسخة من النموذج للرجوع إليها عند الحاجة.',

    /* --- Client copy opened from the email link -------------------------- */
    'copy.title': 'نسخة مقدم الطلب',
    'copy.body': 'هذه نسخة النموذج كما عبّأها مقدم الطلب. اضغط على الزر أدناه لتحميلها بصيغة PDF.',
    'copy.error': 'تعذّرت قراءة هذا الرابط. قد يكون قد اقتُطع عند نسخه من البريد الإلكتروني — يُرجى فتحه مباشرة من الرسالة الأصلية.',

    /* --- Print ---------------------------------------------------------- */
    'p.title': 'نموذج فتح ملف',
    'p.date': 'تاريخ التعبئة',
    'p.ref': 'الرقم المرجعي',
    'p.attached': 'الملفات المرفقة',
    'p.foot': 'هذه نسخة من النموذج المُقدَّم إلكترونيًا، وقد تم استلام النسخة الأصلية لدى المكتب.',

    /* --- Footer --------------------------------------------------------- */
    'ft.phone': '+966 548 548 270',
    'ft.email': 'rawan@rsalawfirm.co',
    'ft.address': 'السعودية، الرياض، طريق الامير محمد بن عبدالعزيز، العليا',
    'ft.license': 'ترخيص المحاماة رقم 41/113 — أعمال وخدمات التوثيق / ترخيص وزارة العدل رقم 41/1913',
    'ft.rights': 'جميع الحقوق محفوظة © {year} مكتب روان صالح عبدالله الغامدي للمحاماة'
  },

  en: {
    dir: 'ltr',
    /* --- Document ------------------------------------------------------- */
    'meta.title': 'File Opening Form | Rawan Saleh A. Alghamdi',
    'meta.desc': 'Online file opening form for Rawan Saleh A. Alghamdi Law Firm, Legal Advisory & Notary.',

    /* --- Header --------------------------------------------------------- */
    'brand.alt': 'Rawan Saleh A. Alghamdi — Law Firm, Legal Advisory & Notary',
    'tagline.1': 'Law Firm',
    'tagline.2': 'Legal Advisory',
    'tagline.3': 'Notary',
    'lang.aria': 'Select language',
    'lang.ar': 'العربية',
    'lang.en': 'English',

    /* --- Intro ---------------------------------------------------------- */
    'intro.title': 'File Opening Form',
    'intro.body': 'Please complete the following information accurately. The information and data provided are used to open a client file with the firm, to study the matter and assess it legally, and to prepare and follow up on the related legal services. Fields marked with an asterisk (*) are required.',

    /* --- Sections ------------------------------------------------------- */
    'sec.1': 'Applicant Details',
    'sec.2': 'Subject of the Request',
    'sec.3': 'Requests',
    'sec.4': 'Documents',

    /* --- Applicant ------------------------------------------------------ */
    'f.name': 'Full name',
    'f.name.ph': 'First, father’s and family name',
    'f.id': 'ID number',
    'f.id.hint': 'Ten digits, beginning with 1 (National ID) or 2 (Iqama)',
    'f.phone': 'Mobile number',
    'f.phone.ph': '5X XXX XXXX',
    'f.phone.ph.intl': 'XXX XXX XXX',
    'f.phone.hint': 'Saudi mobile number — 9 digits beginning with 5',
    'f.phone.hint.intl': 'Pick your country code, then the number without its leading zero',
    'f.phone.cc.aria': 'Country dialling code',
    'f.email': 'Email address',
    'f.email.ph': 'name@example.com',

    /* --- Request ---------------------------------------------------------- */
    'q.reqtype': 'Type of request',
    'q.reqtype.litigation': 'Court claim (litigation)',
    'q.reqtype.consultation': 'Legal consultation',
    'q.reqtype.drafting': 'Legal drafting and review (contracts, agreements, letters, memoranda and the like)',
    'q.reqtype.demand': 'Legal demand',
    'q.reqtype.negotiation': 'Negotiation and settlement',
    'q.reqtype.enforcement': 'Enforcement',
    'q.reqtype.corporate': 'Corporate services',
    'q.reqtype.ip': 'Intellectual property',
    'q.reqtype.notary': 'Notarisation',
    'q.reqtype.other': 'Other',
    'q.reqtype.other.ph': 'Please specify the type of request',

    /* --- Case ----------------------------------------------------------- */
    'f.case': 'Brief description of the request',
    'f.case.ph': 'Briefly explain your request, noting the most important facts',
    'f.case.hint': 'A short, clear summary is enough — the firm will contact you for the details',

    /* --- Requests ------------------------------------------------------- */
    'f.requests': 'Requests',
    'f.requests.ph': '1. Order the defendant to…\n2. Compensation for…',
    'f.requests.hint': 'Write each request on its own line',

    /* --- Documents ------------------------------------------------------ */
    'q.docs': 'Documents',
    'q.docs.hint': 'You may describe the documents in writing, attach them, or both',
    'f.docs.text': 'Describe the documents in writing',
    'f.docs.text.ph': 'For example: title deed, lease contract, bank statement, police report',
    'f.docs.upload': 'Attach documents',
    'f.docs.drop': 'Drag files here, or click to choose',
    'f.docs.types': 'PDF, JPG, PNG or DOC — 10 MB maximum for all files',
    'f.docs.count': 'Attached files ({n})',
    'f.docs.remove': 'Remove file',
    'f.docs.none': 'No files attached',

    /* --- Actions -------------------------------------------------------- */
    'btn.submit': 'Submit form',
    'btn.sending': 'Sending…',
    'btn.download': 'Download a copy (PDF)',
    'btn.another': 'Submit another form',

    /* --- Validation ----------------------------------------------------- */
    'e.required': 'This field is required',
    'e.name': 'Please enter your full name (at least two names)',
    'e.id': 'An ID number must be 10 digits beginning with 1 or 2',
    'e.phone': 'Invalid mobile number — 9 digits beginning with 5',
    'e.phone.intl': 'Invalid mobile number',
    'e.email': 'Please enter a valid email address',
    'e.reqtype': 'Please select the type of request',
    'e.reqtype.other': 'Please specify the type of request',
    'e.case.short': 'Please give a clearer description of the request',
    'e.docs': 'Please describe the documents in writing or attach them',
    'e.file.type': '“{name}” is not an accepted file type. Accepted: PDF, JPG, PNG, DOC',
    'e.file.size': 'That exceeds the total size allowed ({max}). “{name}” was not added.',
    'e.file.count': 'A maximum of {max} files is allowed.',
    'e.summary': '{n} field(s) need attention. Jumped to the first one.',
    'e.send': 'The form could not be sent. Please try again, or contact us on {phone} or {email}.',

    /* --- Confirmation --------------------------------------------------- */
    'ok.title': 'Your form has been received',
    'ok.body': 'Thank you. Your details and documents have been sent to the firm and we will be in touch shortly. Please keep the reference number below for your records.',
    'ok.ref': 'Reference number',
    'ok.hint': 'We recommend downloading a copy of the form for your records.',

    /* --- Client copy opened from the email link -------------------------- */
    'copy.title': 'Applicant copy',
    'copy.body': 'This is the form exactly as the applicant completed it. Use the button below to download it as a PDF.',
    'copy.error': 'This link could not be read. It may have been truncated when copied out of the email — please open it directly from the original message.',

    /* --- Print ---------------------------------------------------------- */
    'p.title': 'File Opening Form',
    'p.date': 'Date submitted',
    'p.ref': 'Reference',
    'p.attached': 'Attached files',
    'p.foot': 'This is a copy of the form submitted online. The original has been received by the firm.',

    /* --- Footer --------------------------------------------------------- */
    'ft.phone': '+966 548 548 270',
    'ft.email': 'rawan@rsalawfirm.co',
    'ft.address': 'Al Olaya, Prince Mohammed bin Abdulaziz Road, Riyadh, Saudi Arabia',
    'ft.license': 'Lawyer License No. 41/113 — Notary Public Services / M.O.J. License No. 41/1913',
    'ft.rights': '© {year} Rawan Saleh A. Alghamdi Law Firm. All rights reserved.'
  }
};
