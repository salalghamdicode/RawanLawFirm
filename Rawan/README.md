# Know Your Client (KYC) Form — Rawan Saleh A. Alghamdi Law Firm

A bilingual (Arabic / English) client-intake form, styled to the firm's brand and
built as plain static files. Completed forms are emailed to the firm, the client
gets an on-screen confirmation with a reference number, and can download a
branded PDF copy.

**No build step.** HTML, CSS and vanilla JS — open `index.html` and it runs.

---

## 1. Set the email destination (required before going live)

The form does not work until an access key is set. GitHub Pages can only serve
static files, so email delivery goes through [Web3Forms](https://web3forms.com).

1. Go to <https://web3forms.com>, enter **rawan@rawanlawfirm.com**, and press
   *Create Access Key*.
2. Confirm the verification email that arrives at that address.
3. Open [`js/submit.js`](js/submit.js) and replace the placeholder:

   ```js
   accessKey: 'REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY',
   ```

4. Commit and push. Send yourself a test submission.

The free tier covers **250 submissions per month**.

> The access key is meant to live in client-side code and is safe to publish —
> it can only deliver mail to the verified address above. If it ever attracts
> spam, generate a new key and replace this one.

---

## 2. Deploy to GitHub Pages

> **Plan requirement:** GitHub Pages publishes from a **private** repository only
> on Pro, Team or Enterprise plans. On the **Free** plan the repository must be
> **public** for the site to build. The source — including the access key above —
> is then readable by anyone. No client data is ever stored in the repository;
> submissions travel from the browser straight to Web3Forms and on to the firm's
> inbox.

1. Push this folder to the repository.
2. **Settings → Pages → Build and deployment**
   Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)`

That publishes the form at `https://<username>.github.io/<repo>/`, which is
enough to use it. To put it on the firm's own domain, see **§3**.

`.nojekyll` is present so GitHub serves every file as-is. `CNAME.example` is
only a template — GitHub writes the real `CNAME` file itself when you set a
custom domain in its settings, so you never need to rename it.

---

## 3. Pointing the GoDaddy domain at the form

The firm's domain is **`rawanlawfirm.com`**, registered at GoDaddy and using
GoDaddy's nameservers (`ns75/ns76.domaincontrol.com`).

### Use `kyc.rawanlawfirm.com`, not the bare domain

As of writing, `rawanlawfirm.com` serves nothing but GoDaddy's parking page, so
the bare domain *is* technically free to use. Prefer the subdomain anyway:

- It leaves the bare domain available for the firm's actual website later.
  Putting an intake form at `rawanlawfirm.com` means moving it the day a real
  website is built.
- It is one DNS record instead of eight.
- It cannot disturb the existing parked-domain records by accident.

> **The firm's email is not at risk either way.** `rawanlawfirm.com` delivers
> mail through Microsoft 365 (`rawanlawfirm-com.mail.protection.outlook.com`),
> and mail routing is controlled by `MX` and `TXT` records. Everything in this
> section touches only `A`/`CNAME` records, which have no bearing on email.
> **Do not edit or delete the `MX` record, or the `TXT` record beginning
> `v=spf1`** — those are what keep `rawan@rawanlawfirm.com` working.

### Step 1 — Turn on GitHub Pages

1. Push this folder to the repository.
2. **Settings → Pages → Build and deployment** —
   Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)`.
3. Wait for the first build to finish, and confirm the site loads at
   `https://<username>.github.io/<repo>/` before touching DNS. If it does not
   work here, a custom domain will not fix it.

### Step 2 — Add the DNS record at GoDaddy

1. Sign in at [godaddy.com](https://godaddy.com).
2. Open **My Products**, find the domain, and press **DNS** (on some accounts:
   the **⋮** menu → *Manage DNS*).
3. Press **Add New Record** and enter:

   | Field | Value |
   |-------|-------|
   | Type  | `CNAME` |
   | Name  | `kyc` |
   | Value | `<username>.github.io` |
   | TTL   | `600 seconds` (or the shortest offered) |

   Enter the **Name** as just `kyc` — not the full `kyc.rawanlawfirm.com`. GoDaddy
   appends the domain itself, and typing the whole thing produces
   `kyc.rawanlawfirm.com.rawanlawfirm.com`.

   The **Value** is your GitHub *user* site — `<username>.github.io` with no
   repository name, no `https://`, and no trailing slash. A trailing dot is
   fine if GoDaddy adds one.

4. **Save.**

> The short TTL is deliberate: it keeps the wait short if a value needs
> correcting. Once the site is confirmed working you can raise it to an hour.

### Step 3 — Tell GitHub about the domain

1. **Settings → Pages → Custom domain** — enter `kyc.rawanlawfirm.com`, press
   **Save**. GitHub commits a `CNAME` file to the repository for you.
2. GitHub now runs a DNS check. It may say *"Domain's DNS record could not be
   retrieved"* for a while — this is normal; the record has not propagated yet.
   Give it 10–30 minutes (GoDaddy is usually quick, but it can take up to 48
   hours) and re-check.
3. Once the check passes, tick **Enforce HTTPS**. The certificate can take up to
   24 hours to issue; the box stays greyed out until it is ready.

### Step 4 — The emailed PDF links

Already done — [`js/submit.js`](js/submit.js) is set to:

```js
siteUrl: 'https://kyc.rawanlawfirm.com/',
```

**This must match whatever domain you configure in Step 3.** If you choose a
different subdomain, or the bare domain, change this line to match and bump
every `?v=` in `index.html` (see §8) before pushing.

It exists because the download link in each notification email would otherwise
be built from whatever address the form was served from. Submitting from your
own machine while testing would then send the firm a `http://localhost:8000/…`
link that resolves to nothing on their computer — which is exactly what happens
when `siteUrl` is left empty.

### Step 5 — Check it end to end

1. Open `https://kyc.rawanlawfirm.com` — padlock present, form loads.
2. Submit a real test entry.
3. In the email that arrives, open the *Download the client copy (PDF)* link
   and confirm it shows the client copy and prints.

Step 3 is the one to watch. The firm's mail is Microsoft 365, and some tenants
have **Safe Links** enabled, which rewrites URLs in incoming mail to pass
through `safelinks.protection.outlook.com`. The client copy carries its data in
the URL's `#fragment`, and link rewriters do not always preserve fragments. If
the link opens the form but shows *"this link could not be read"*, that is the
cause — copy the raw URL out of the email body and paste it into the address
bar instead. Worth checking once on the first real test rather than discovering
it later.

### If it does not work

| Symptom | Cause |
|---------|-------|
| GitHub says the DNS record can't be retrieved | Not propagated yet. Wait, then re-save the custom domain. |
| Browser shows the GoDaddy parking page | The `kyc` CNAME is missing, or an older `kyc` A record is overriding it — delete any other record with the same name. |
| Certificate never issues / *Enforce HTTPS* stays greyed out | Remove the custom domain in GitHub, save, re-add it, save. This restarts certificate issuance. |
| `NET::ERR_CERT_COMMON_NAME_INVALID` | The certificate has not issued yet. Wait; do not tick *Enforce HTTPS* early. |
| Emailed link still points at `localhost` | `siteUrl` not set (Step 4), or the browser is running a cached `submit.js` — bump `?v=`. |

### Using the bare domain instead

If you would rather serve the form at `rawanlawfirm.com` itself, GoDaddy cannot
put a `CNAME` on the apex, so it takes eight records instead of one:

| Type   | Name | Value |
|--------|------|-------|
| `A`    | `@`  | `185.199.108.153` |
| `A`    | `@`  | `185.199.109.153` |
| `A`    | `@`  | `185.199.110.153` |
| `A`    | `@`  | `185.199.111.153` |
| `AAAA` | `@`  | `2606:50c0:8000::153` |
| `AAAA` | `@`  | `2606:50c0:8001::153` |
| `AAAA` | `@`  | `2606:50c0:8002::153` |
| `AAAA` | `@`  | `2606:50c0:8003::153` |

First delete the two `A` records currently on `@` (`3.33.130.190` and
`15.197.148.33` — GoDaddy's parking page), or they will conflict. Leave the
`MX`, `TXT` and `www` records alone. Then set the custom domain in GitHub to
`rawanlawfirm.com` and change `siteUrl` in `js/submit.js` to match.

---

## 4. Emailing the client a copy

The client currently receives their copy as a **PDF download** on the
confirmation screen. An automatic *email* copy is off by default because
Web3Forms' autoresponder is a paid feature and its access key can only deliver
to one verified address.

Two ways to switch it on, both in [`js/submit.js`](js/submit.js):

**Option A — upgrade Web3Forms** (~$18/month)

```js
clientCopy: true,
```

**Option B — switch provider to FormSubmit** (free, no signup)

```js
provider:  'formsubmit',
clientCopy: true,
```

FormSubmit supports `_autoresponse` at no cost. The first submission triggers a
one-time confirmation email to `rawan@rawanlawfirm.com` that must be accepted.

---

## 5. The PDF link in the notification email

Every notification email ends with a field named *Download the client copy
(PDF)*. Opening that link reopens this site, rebuilds the **exact same**
printable copy the client sees, and offers it for download — it runs the same
`buildPrintSummary` code path, so the two documents cannot drift apart.

There is no server and no database, so the submission travels inside the link's
**fragment** (`…/#copy=…`). A fragment is never transmitted to the host, which
means opening the link sends nothing over the network and stores no copy of the
client's data on GitHub Pages. The data lives only in the email and in that URL.

Practical consequences:

- **It may not render as a clickable link.** Web3Forms sends a fixed HTML table
  and supports no HTML, templates or markdown in field values, so whether the
  URL becomes clickable is entirely up to the receiving mail client. Some
  linkify it, some show it as plain text to be copied and pasted. There is no
  way around this on Web3Forms; making it reliably clickable would mean moving
  to a provider that accepts an HTML body.
- **The link is about 530 characters.** The payload is packed as a positional
  array and deflate-compressed before base64 encoding, which more than halves
  it. That keeps it inside the length most mail clients handle without wrapping
  — wrapping is what breaks copy-and-paste.
- **Anyone holding the link can view the submission**, exactly as anyone holding
  the email can — the email body already lists every field in plain text. Treat
  the link with the same care as the email itself.
- **Set `siteUrl`** (§3, Step 4). Otherwise the link points at whatever address
  the form was served from. A link built during local testing is flagged in the
  email as *LOCAL TEST ONLY* so it cannot be mistaken for a working one.
- **`COPY_VERSION`** in `js/submit.js` guards the link format. Because fields
  travel positionally, reordering `COPY_FIELDS` invalidates links already sitting
  in inboxes — bump the version when that list changes and old links say so
  plainly instead of rendering a scrambled document.
- **Truncated or unreadable links** show a plain explanation rather than a broken
  form, in the language of the page.

---

## 6. Layout

```
index.html            the form — one page, both languages
css/tokens.css        brand palette, type scale, spacing
css/main.css          layout and components (RTL-safe logical properties)
css/print.css         the branded one-page PDF the client downloads
js/i18n.js            every user-visible string, Arabic and English
js/countries.js       generated bilingual ISO 3166 list (249 countries)
js/validate.js        ID/Iqama, IBAN, phone, email, amount rules
js/submit.js          email provider config and delivery
js/app.js             language switching, conditional fields, validation
fonts/                self-hosted Tajawal, Inter, Cormorant Garamond
assets/brand/         logos, watermark and icons extracted from the source art
assets/*.jpeg         original brand artwork supplied by the firm
test/validate.test.js validation test suite
```

### Editing the wording

All copy lives in `js/i18n.js` as `ar` and `en` blocks sharing the same keys.
Change a string there and it updates everywhere it appears, including the PDF.
Nothing user-visible is hard-coded in `index.html`.

---

## 7. Behaviour worth knowing

- **Arabic is the default**; the choice is remembered in `localStorage`.
- **Nationality** lists Saudi Arabia first, then a divider, then all 249 ISO
  countries sorted alphabetically in whichever language is active. The selected
  country survives a language switch.
- **The identity field follows nationality** — *National ID* (10 digits starting
  with 1) for Saudis, *Residence / Iqama* (10 digits starting with 2) otherwise.
  The label, hint, placeholder and validation rule all swap together.
- **The `+966` dial prefix** is shown for Saudi nationals and hidden for others,
  who may enter an international number.
- **Arabic-Indic numerals** (٠١٢٣٤٥٦٧٨٩) are accepted in every numeric field.
- **IBANs** are checked with the ISO 13616 mod-97 checksum, not just length.
- **The acknowledgement's Arabic wording is the operative text** and is shown
  beneath the English translation when the page is in English.
- **The PDF** is produced by the browser's own print engine rather than a JS PDF
  library, so Arabic letters are correctly shaped and joined and the text stays
  selectable.

---

## 8. Running and testing locally

```bash
python3 -m http.server 8000     # then open http://localhost:8000
node test/validate.test.js      # validation rules
```

### After editing any CSS or JS, bump the cache version

The stylesheets and scripts are linked with a version marker:

```html
<link rel="stylesheet" href="css/main.css?v=1">
<script src="js/submit.js?v=1"></script>
```

Browsers cache these files aggressively, so a visitor who has used the form
before will keep running the **old** copy after you deploy a change — including
a change to the access key. Increment every `?v=` in `index.html` (1 → 2 → 3…)
whenever you edit a file in `css/` or `js/`, and every browser refetches.

While developing locally, a hard reload (**⇧⌘R**) bypasses the cache without
bumping the version.

---

## 9. A note on the data

Submissions include national ID numbers, IBANs and income figures. On this
setup they pass through Web3Forms' servers before reaching the firm's inbox.
If the firm would prefer that no third-party form vendor ever holds this data,
the alternative is hosting on Cloudflare Pages (free, works with private
repositories) with a small serverless function that sends mail directly through
a provider such as Resend. That change touches only `js/submit.js` plus one new
function file.
