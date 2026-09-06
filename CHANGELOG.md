# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-06

### Fixed

- Ctrl/Cmd+C no longer breaks native text copying when focus is inside a
  form field (the deny-IP textarea, error-path inputs, or the CSP value
  input). Previously the global keyboard-shortcut dispatcher called
  `preventDefault()` on every Ctrl/Cmd+C keypress before checking whether
  the app's copy handler actually ran, so selecting and copying text out
  of an input field silently did nothing. The dispatcher (`assets/js/core.js`)
  now only suppresses the default browser action when a shortcut handler
  doesn't explicitly decline (by returning `false`), and the `mod+c`
  handler (`js/app.js`) returns `false` while typing so the browser's
  normal copy behavior runs instead.

## [1.0.0] - Initial release

### Added

- Checklist-driven Apache `.htaccess` generator: force HTTPS redirect,
  www/non-www canonicalization, custom error pages, gzip/deflate
  compression, browser caching headers, directory-listing lockdown,
  security headers (with optional CSP), and deny-by-IP (Apache 2.2 and
  2.4+ syntax).
- Live, syntax-highlighted combined preview with line count.
- Copy and download actions, keyboard shortcuts, and a shortcuts help modal.
- Auto-persisted rule selections via `localStorage`.
- Dark/light themes, fully responsive layout.
