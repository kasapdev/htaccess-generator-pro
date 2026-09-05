# Htaccess Generator Pro

Generate correct, ready-to-use Apache `.htaccess` snippets — HTTPS redirects, caching, compression and security headers — from a checklist, entirely offline.

> A premium, zero-dependency `.htaccess` workbench for backend and hosting work. Flip on the rules you need — force HTTPS, canonical www/non-www, custom error pages, gzip/deflate compression, browser caching by file type, directory-listing lockdown, security headers, IP blocking — and get one combined, correctly-ordered `.htaccess` file, ready to copy or download. Nothing is sent anywhere.

## Overview

Htaccess Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. Each rule is a real Apache directive block (mod_rewrite, mod_deflate, mod_expires, mod_headers) written the way you'd hand-write it yourself, not fabricated syntax. Toggle rules on the left, watch the combined, syntax-highlighted `.htaccess` build live on the right.

## Features

- **Force HTTPS redirect** — a correct `mod_rewrite` block that 301-redirects any plain HTTP request to HTTPS.
- **www / non-www redirect** — pick a direction (force `www.` or strip it) and get the matching `RewriteCond`/`RewriteRule` pair.
- **Custom error pages** — `ErrorDocument` directives for 401, 403, 404 and 500, each with an editable path.
- **Gzip / Deflate compression** — a `mod_deflate` block covering HTML, CSS, JS, JSON, XML, SVG and web fonts.
- **Browser caching headers** — a `mod_expires` block with independently configurable lifetimes for images, CSS/JS, web fonts and HTML.
- **Disable directory listing** — `Options -Indexes`.
- **Basic security headers** — `mod_headers` block setting `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` and an optional custom `Content-Security-Policy`; untick any individual header you don't need.
- **Deny by IP** — pick Apache 2.4 (`<RequireAll>`/`Require not ip`) or Apache 2.2 (`Order`/`Deny from`) syntax, with the other version's equivalent included as a comment, for one or more IPs/CIDR ranges (one per line).
- **Live combined preview** with syntax highlighting, line count, copy and **Download `.htaccess`**.
- **Auto-persist** — your rule selections and field values are saved to `localStorage` and restored on return.
- **Dark & light themes**, fully responsive down to 360px, accessible, keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/htaccess-generator-pro.git
cd htaccess-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Flip on the rules you need in the left column — some reveal extra fields (redirect direction, error paths, cache durations, IPs to block).
2. Watch the **`.htaccess` preview** panel on the right update live, combining every enabled rule into one correctly-ordered file.
3. **Copy** the result (<kbd>Ctrl/⌘</kbd>+<kbd>C</kbd>) or **Download** it directly as `.htaccess` (<kbd>Ctrl/⌘</kbd>+<kbd>S</kbd>).
4. Drop the file into your site's root (or a subdirectory, for scoped rules) on any Apache server with the relevant modules enabled (`mod_rewrite`, `mod_deflate`, `mod_expires`, `mod_headers`).
5. **Reset** restores the sensible defaults (compression, caching, no-indexing and security headers on).

## Keyboard Shortcuts

| Action                  | Shortcut                       |
| ------------------------ | ------------------------------ |
| Copy `.htaccess`         | <kbd>Ctrl/⌘</kbd> + <kbd>C</kbd> |
| Download `.htaccess`     | <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> |
| Show shortcuts help      | <kbd>?</kbd>                    |
| Close dialog             | <kbd>Esc</kbd>                  |

## Screenshots

> _Screenshots coming soon._

## Roadmap

- [ ] Presets for common stacks (WordPress, static SPA, Laravel public/)
- [ ] Nginx-equivalent config export for side-by-side comparison
- [ ] HSTS header toggle with configurable max-age
- [ ] Rewrite rule tester against a sample URL
- [ ] Import an existing `.htaccess` and pre-fill the checklist from it

## License

MIT Licensed. Part of the [Web Utility Suite](https://github.com/kasapdev).
