# Google Sign-In — Setup Guide

Properties Pak supports "Continue with Google" alongside the existing email and
password sign-in. This document covers the Google Cloud Console steps, the
environment variables, and what happens in the database.

> **No new database or table is required.** The existing `users` table gains one
> nullable column (`google_id`), and `password_hash` becomes nullable because a
> Google-only account has no password to store.

---

## 1. Create the OAuth consent screen

1. Go to <https://console.cloud.google.com/> and sign in with the Google account
   that should own the project (a company account is best, so it survives staff
   changes).
2. Create a project, or pick an existing one, from the project picker at the top.
3. Open **APIs & Services → OAuth consent screen**.
4. Choose **External** (unless you have Google Workspace and only want your own
   organisation's members to sign in).
5. Fill in the required fields:
   - **App name** — `Properties Pak`
   - **User support email** — `info@propertiespak.com`
   - **App domain** — `https://propertiespak.com`
   - **Developer contact information** — `info@propertiespak.com`
6. On the **Scopes** screen add only these two non-sensitive scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`

   The app asks for `openid email profile` in one request, which covers all
   three. Adding more scopes triggers a Google security review, which can take
   weeks — avoid it unless you genuinely need more data.
7. On the **Test users** screen, add your own Google address so you can sign in
   while the app is in testing mode.
8. Save. While the app status is **Testing**, only listed test users can sign
   in. When you are ready, press **Publish app** to allow anyone. Publishing
   with only the scopes above needs no verification review.

---

## 2. Create the OAuth client

1. Open **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. **Application type**: `Web application`.
4. **Name**: `Properties Pak web`.
5. Under **Authorised redirect URIs**, add **exactly**:

   ```
   https://propertiespak.com/api/auth/google/callback
   ```

   For local development, add a second entry:

   ```
   http://localhost:3000/api/auth/google/callback
   ```

   That is the only redirect URI the app ever uses — every entry point
   (`/login` sign-in, `/login` register, `/list-property`) goes through the same
   callback, which then forwards the visitor to the right page using a
   site-relative path stored in a cookie.

   For a Vercel preview deployment you would add its own URI too, but note that
   preview URLs change on every deploy — see the note on
   `GOOGLE_REDIRECT_URI` below.
6. Click **Create**. Google shows a **Client ID** and **Client secret**. Copy
   both somewhere safe; the secret is shown only once.

> The redirect URI must match **character for character** — including `https`,
> the absence of a trailing slash, and `www` if your canonical host uses it.
> A single typo produces `redirect_uri_mismatch` with no other explanation.

---

## 3. Set the environment variables

Locally, add these to `.env.local`:

```bash
GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
# Optional. Leave unset to derive the URI from the request host.
# GOOGLE_REDIRECT_URI=https://propertiespak.com/api/auth/google/callback
```

On Vercel, add the same keys under **Project → Settings → Environment
Variables** for the Production environment (and Preview, if you registered a
preview redirect URI).

Rules that the app enforces:

- The "Continue with Google" button only appears when **both**
  `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Until then the login
  page looks exactly as it did before.
- `GOOGLE_CLIENT_SECRET` is only ever read on the server. It is never sent to
  the browser.

### About `GOOGLE_REDIRECT_URI`

If it is unset, the app builds the callback URL from the incoming request host,
so `localhost:3000`, a Vercel preview deployment, and production all work
without extra configuration — as long as each host's URI is registered in
Google Cloud Console.

If you set it, that one fixed URI is always used, which is useful when you want
production to be the only accepted destination. The downside is that signing in
from a preview deployment will then fail with `redirect_uri_mismatch`, because
the request arrives at the preview host but Google is told to return to
production.

---

## 4. What the database change looks like

Both statements run automatically the first time the app touches the database
(`ensureSeeded` in `src/db/seed.ts`), so there is nothing to run by hand:

```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text;
CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx
  ON users (google_id) WHERE google_id IS NOT NULL AND google_id <> '';
```

`password_hash` becomes nullable, `google_id` is added, and the partial unique
index stops one Google account from mapping to two Properties Pak accounts
while still allowing the many rows that have no Google link.

Existing accounts are untouched — they keep their password hash and simply have
an empty `google_id` until the owner links Google by signing in once with the
same email address.

---

## 5. How account linking works

`users.email` is unique, so the first Google sign-in for a given address has to
decide between "sign in" and "create". The rules, in order:

| Situation | Result |
| --- | --- |
| No account with this email | A new account is created. No password is stored. |
| An account exists and is already linked to this Google id | Signed straight in. This is the returning visitor path. |
| An account exists with this email but no Google link, **and** Google reports the email as verified | The account is linked, then signed in. |
| An account exists with this email, has a password, and Google reports the email as **unverified** | Refused, with a message asking the person to sign in with their password first. |
| An account exists with this email and is linked to a **different** Google account | Refused, with a message naming the conflict. |

The unverified case matters: without it, anyone who could receive a
verification-style email at an address could attach their own Google account to
someone else's existing account. Note that Properties Pak's own registration
never verifies email addresses, so a Google-verified email is in fact the
*stronger* proof of ownership here — which is why verified linking is allowed
automatically.

When linking, `name` and `avatar_url` are only filled in if they were empty, so
nothing the account owner typed by hand is ever overwritten.

---

## 6. Security notes

- **CSRF** — a random 256-bit `state` token is stored in an httpOnly cookie and
  compared with the one Google echoes back, using a length-checked
  `timingSafeEqual`. A forged callback cannot ride on someone else's session.
- **Token validation** — the `id_token` is fetched straight from Google's token
  endpoint over TLS. Its `iss`, `aud` and `exp` claims are checked, so a token
  minted for another client or another issuer cannot open a session here.
- **Cookies** — the state cookie reuses `sessionCookieOptions`, which issues
  `SameSite=None; Secure; Partitioned` on preview hosts so it survives the
  cross-site redirect back from Google, and plain `Lax` on localhost.
- **Open redirects** — the post-login destination is held in the cookie, not in
  the URL, and is rejected unless it is a site-relative path. A third party
  cannot bounce a freshly signed-in user to an external site.
- **Sign-out** — unchanged. The session cookie is deleted, which ends both
  password and Google sessions alike.

A deliberate simplification: **PKCE is not used.** It protects against an
authorisation code being intercepted in transit, which matters for public
clients that cannot keep a secret. This app is a confidential client with a
server-side secret, so the code exchange is already protected by TLS plus the
client secret.

---

## 7. Testing

```bash
# 1. Set the credentials in .env.local, then:
npm run dev

# 2. Open the login page and confirm the button is visible:
curl -s http://localhost:3000/login | grep -c "Continue with Google"

# 3. Walk the flow in a browser. Expect:
#    /login  →  accounts.google.com  →  /account (signed in)
```

Things to check by hand, since a scripted test cannot complete a Google consent
screen:

1. A brand new Google account creates a Properties Pak account and lands on
   `/account`.
2. Signing in again with the same Google account returns to `/account` without
   creating a second row in `users`.
3. An account created earlier with a password links to Google when the email is
   verified, and its shortlist is still there afterwards.
4. Pressing **Cancel** on the Google screen returns to `/login` with "Google
   sign-in was cancelled."
5. With `GOOGLE_CLIENT_ID` unset, the button disappears and the login page is
   unchanged.

### Known limitation inside the Arena sandbox preview

The live preview is served inside an iframe. Google's consent screen sets
`X-Frame-Options: DENY` and refuses to render in a frame, so the button will not
work from the embedded preview. **Open the preview URL directly in a browser
tab** to test it. This is a property of Google's page, not of this app.

The sandbox also has no outbound access to `googleapis.com`, so the round trip
cannot be exercised from inside the sandbox at all. The code is verified with
`npm run typecheck`, `npm run lint` and `npm run build` only.

---

## 8. Files involved

| File | Role |
| --- | --- |
| `src/lib/google-oauth.ts` | Builds the Google URL, verifies `state`, exchanges the code, validates the `id_token`. |
| `src/app/api/auth/google/route.ts` | `GET` — starts the handshake and redirects to Google. |
| `src/app/api/auth/google/callback/route.ts` | `GET` — finishes it and redirects to `/account` or `/login?error=…`. |
| `src/lib/auth.ts` | `signInWithGoogle` — find-or-create-and-link, plus the null-password guard in `loginUser`. |
| `src/db/schema.ts` | `passwordHash` nullable, `googleId` added. |
| `src/db/seed.ts` | The idempotent `ALTER TABLE` statements. |
| `src/components/icons.tsx` | `IconGoogle`. |
| `src/app/login/page.tsx` | The button on both the sign-in and the create-an-account forms. |
| `src/app/list-property/page.tsx` | A sign-in shortcut above the listing form, for signed-out visitors. |
| `src/components/listing-form.tsx` | Recognises an already-signed-in visitor and swaps the password block for a confirmation. |

### The three entry points

| Where | Label | Returns to |
| --- | --- | --- |
| `/login` — sign in | Continue with Google | `/account` |
| `/login` — create an account | Sign up with Google | `/account` |
| `/list-property` | Continue with Google | `/list-property` |

On `/list-property` the shortcut sits **above** the form rather than inside it.
The listing form is long, and signing in with Google is a full-page redirect —
placing it before any typing means there is nothing to lose, and the visitor
returns already authenticated so the listing attaches to their account without
a password ever being set. Once signed in, the account block at the bottom of
the form drops the checkbox and the password field and simply confirms that the
listing will go to their account.
