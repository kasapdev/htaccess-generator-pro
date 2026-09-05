/* =====================================================================
   Htaccess Generator Pro — app.js
   Builds a combined, real, syntactically-correct .htaccess file from a
   checklist of toggles. Classic script, depends on window.WUS.
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'htaccessgen.state';

  var els = {
    https: document.getElementById('ruleHttps'),
    www: document.getElementById('ruleWww'),
    wwwFields: document.getElementById('wwwFields'),
    wwwDirection: document.getElementById('wwwDirection'),
    errors: document.getElementById('ruleErrors'),
    errorFields: document.getElementById('errorFields'),
    err403: document.getElementById('err403'),
    err404: document.getElementById('err404'),
    err401: document.getElementById('err401'),
    err500: document.getElementById('err500'),
    compress: document.getElementById('ruleCompress'),
    cache: document.getElementById('ruleCache'),
    cacheFields: document.getElementById('cacheFields'),
    cacheImages: document.getElementById('cacheImages'),
    cacheAssets: document.getElementById('cacheAssets'),
    cacheFonts: document.getElementById('cacheFonts'),
    cacheHtml: document.getElementById('cacheHtml'),
    indexes: document.getElementById('ruleIndexes'),
    headers: document.getElementById('ruleHeaders'),
    headersFields: document.getElementById('headersFields'),
    hdrFrame: document.getElementById('hdrFrame'),
    hdrContentType: document.getElementById('hdrContentType'),
    hdrXss: document.getElementById('hdrXss'),
    hdrReferrer: document.getElementById('hdrReferrer'),
    hdrCsp: document.getElementById('hdrCsp'),
    cspValue: document.getElementById('cspValue'),
    deny: document.getElementById('ruleDeny'),
    denyFields: document.getElementById('denyFields'),
    denyVersion: document.getElementById('denyVersion'),
    denyIps: document.getElementById('denyIps')
  };

  var outputCode = document.getElementById('outputCode');
  var emptyState = document.getElementById('emptyState');
  var outputStats = document.getElementById('outputStats');
  var statusBadge = document.getElementById('statusBadge');
  var statusText = document.getElementById('statusText');

  var lastOutput = '';

  /* Toggle sub-field visibility for rules that have extra inputs. */
  var subFieldMap = [
    [els.www, els.wwwFields],
    [els.errors, els.errorFields],
    [els.cache, els.cacheFields],
    [els.headers, els.headersFields],
    [els.deny, els.denyFields]
  ];
  function wireSubFields() {
    subFieldMap.forEach(function (pair) {
      var toggle = pair[0], fields = pair[1];
      toggle.addEventListener('change', function () {
        fields.hidden = !toggle.checked;
        render();
      });
    });
  }

  /* Cache duration <select> values are already human-readable Apache
     "access plus <n> <unit>" fragments (e.g. "1 year", "0 seconds") —
     used as-is, no conversion needed. */

  /* ===================== Rule builders ===================== */

  function ruleHttps() {
    return [
      '# ---- Force HTTPS redirect ----',
      'RewriteEngine On',
      'RewriteCond %{HTTPS} off',
      'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'
    ].join('\n');
  }

  function ruleWww(direction) {
    var lines = ['# ---- www / non-www redirect ----', 'RewriteEngine On'];
    if (direction === 'strip-www') {
      lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
      lines.push('RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]');
    } else {
      lines.push('RewriteCond %{HTTP_HOST} !^www\\. [NC]');
      lines.push('RewriteCond %{HTTP_HOST} !^$');
      lines.push('RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
    }
    return lines.join('\n');
  }

  function ruleErrors(paths) {
    var lines = ['# ---- Custom error pages ----'];
    var any = false;
    [['401', paths.err401], ['403', paths.err403], ['404', paths.err404], ['500', paths.err500]].forEach(function (pair) {
      var code = pair[0], path = (pair[1] || '').trim();
      if (path) { lines.push('ErrorDocument ' + code + ' ' + path); any = true; }
    });
    return any ? lines.join('\n') : '';
  }

  function ruleCompress() {
    return [
      '# ---- Gzip / Deflate compression ----',
      '<IfModule mod_deflate.c>',
      '  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript',
      '  AddOutputFilterByType DEFLATE application/javascript application/x-javascript',
      '  AddOutputFilterByType DEFLATE application/json application/xml application/rss+xml',
      '  AddOutputFilterByType DEFLATE image/svg+xml application/font-woff application/vnd.ms-fontobject',
      '</IfModule>'
    ].join('\n');
  }

  function ruleCache(images, assets, fonts, html) {
    var lines = [
      '# ---- Browser caching headers ----',
      '<IfModule mod_expires.c>',
      '  ExpiresActive On',
      '  ExpiresByType image/jpeg "access plus ' + images + '"',
      '  ExpiresByType image/png "access plus ' + images + '"',
      '  ExpiresByType image/gif "access plus ' + images + '"',
      '  ExpiresByType image/webp "access plus ' + images + '"',
      '  ExpiresByType image/svg+xml "access plus ' + images + '"',
      '  ExpiresByType image/x-icon "access plus ' + images + '"',
      '  ExpiresByType text/css "access plus ' + assets + '"',
      '  ExpiresByType application/javascript "access plus ' + assets + '"',
      '  ExpiresByType text/javascript "access plus ' + assets + '"',
      '  ExpiresByType font/woff "access plus ' + fonts + '"',
      '  ExpiresByType font/woff2 "access plus ' + fonts + '"',
      '  ExpiresByType application/font-woff2 "access plus ' + fonts + '"',
      '  ExpiresByType application/vnd.ms-fontobject "access plus ' + fonts + '"',
      '  ExpiresByType font/ttf "access plus ' + fonts + '"',
      '  ExpiresByType text/html "access plus ' + html + '"',
      '</IfModule>'
    ];
    return lines.join('\n');
  }

  function ruleIndexes() {
    return [
      '# ---- Disable directory listing ----',
      'Options -Indexes'
    ].join('\n');
  }

  function ruleHeaders(opts) {
    var body = [];
    if (opts.frame) body.push('  Header always set X-Frame-Options "SAMEORIGIN"');
    if (opts.contentType) body.push('  Header always set X-Content-Type-Options "nosniff"');
    if (opts.xss) body.push('  Header always set X-XSS-Protection "1; mode=block"');
    if (opts.referrer) body.push('  Header always set Referrer-Policy "strict-origin-when-cross-origin"');
    if (opts.csp && opts.cspValue) body.push('  Header always set Content-Security-Policy "' + opts.cspValue.replace(/"/g, '\\"') + '"');
    if (!body.length) return '';
    return [
      '# ---- Basic security headers (requires mod_headers) ----',
      '<IfModule mod_headers.c>'
    ].concat(body, ['</IfModule>']).join('\n');
  }

  function ruleDeny(rawIps, version) {
    var ips = rawIps.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!ips.length) return '';
    var lines = ['# ---- Deny by IP ----'];
    if (version === '2.2') {
      lines.push('# Apache 2.2 syntax');
      lines.push('Order allow,deny');
      ips.forEach(function (ip) { lines.push('Deny from ' + ip); });
      lines.push('Allow from all');
      lines.push('');
      lines.push('# Apache 2.4+ equivalent:');
      lines.push('# <RequireAll>');
      lines.push('#   Require all granted');
      ips.forEach(function (ip) { lines.push('#   Require not ip ' + ip); });
      lines.push('# </RequireAll>');
    } else {
      lines.push('# Apache 2.4+ syntax');
      lines.push('<RequireAll>');
      lines.push('  Require all granted');
      ips.forEach(function (ip) { lines.push('  Require not ip ' + ip); });
      lines.push('</RequireAll>');
      lines.push('');
      lines.push('# Apache 2.2 equivalent:');
      lines.push('# Order allow,deny');
      ips.forEach(function (ip) { lines.push('# Deny from ' + ip); });
      lines.push('# Allow from all');
    }
    return lines.join('\n');
  }

  /* ===================== Assembly ===================== */

  function highlight(text) {
    return WUS.escapeHtml(text)
      .replace(/^(#.*)$/gm, '<span class="cmt">$1</span>')
      .replace(/^(\s*)([A-Za-z][A-Za-z0-9]*)(?=\s|$)/gm, function (m, ws, word) {
        var directives = ['RewriteEngine', 'RewriteCond', 'RewriteRule', 'ErrorDocument', 'Options',
          'AddOutputFilterByType', 'ExpiresActive', 'ExpiresByType', 'Header', 'Require', 'Order', 'Allow', 'Deny'];
        if (directives.indexOf(word) > -1) return ws + '<span class="dir">' + word + '</span>';
        return m;
      });
  }

  function render() {
    var blocks = [];

    if (els.https.checked) blocks.push(ruleHttps());
    if (els.www.checked) blocks.push(ruleWww(els.wwwDirection.value));
    if (els.errors.checked) {
      var errBlock = ruleErrors({ err401: els.err401.value, err403: els.err403.value, err404: els.err404.value, err500: els.err500.value });
      if (errBlock) blocks.push(errBlock);
    }
    if (els.compress.checked) blocks.push(ruleCompress());
    if (els.cache.checked) blocks.push(ruleCache(els.cacheImages.value, els.cacheAssets.value, els.cacheFonts.value, els.cacheHtml.value));
    if (els.indexes.checked) blocks.push(ruleIndexes());
    if (els.headers.checked) {
      var hdrBlock = ruleHeaders({
        frame: els.hdrFrame.checked,
        contentType: els.hdrContentType.checked,
        xss: els.hdrXss.checked,
        referrer: els.hdrReferrer.checked,
        csp: els.hdrCsp.checked,
        cspValue: els.cspValue.value.trim()
      });
      if (hdrBlock) blocks.push(hdrBlock);
    }
    if (els.deny.checked) {
      var denyBlock = ruleDeny(els.denyIps.value, els.denyVersion.value);
      if (denyBlock) blocks.push(denyBlock);
    }

    var text = blocks.join('\n\n');
    lastOutput = text;

    if (!text) {
      outputCode.innerHTML = '';
      emptyState.classList.remove('is-hidden');
      outputStats.textContent = '0 lines';
    } else {
      outputCode.innerHTML = highlight(text);
      emptyState.classList.add('is-hidden');
      outputStats.textContent = text.split('\n').length + ' lines';
    }

    var activeCount = [els.https, els.www, els.errors, els.compress, els.cache, els.indexes, els.headers, els.deny]
      .filter(function (el) { return el.checked; }).length;
    statusBadge.classList.toggle('is-active', activeCount > 0);
    statusText.textContent = activeCount + (activeCount === 1 ? ' rule active' : ' rules active');

    persistDebounced();
  }

  /* ===================== Actions ===================== */

  function copyOutput() {
    if (!lastOutput) { WUS.toast('No rules enabled yet', 'error'); return; }
    WUS.copy(lastOutput, '.htaccess copied to clipboard');
  }

  function downloadOutput() {
    if (!lastOutput) { WUS.toast('No rules enabled yet', 'error'); return; }
    WUS.download('.htaccess', lastOutput, 'text/plain;charset=utf-8');
    WUS.toast('Downloaded .htaccess');
  }

  function resetAll() {
    document.querySelectorAll('.rule-toggle').forEach(function (el) { el.checked = false; });
    els.compress.checked = true;
    els.cache.checked = true;
    els.indexes.checked = true;
    els.headers.checked = true;
    els.hdrFrame.checked = true;
    els.hdrContentType.checked = true;
    els.hdrXss.checked = true;
    els.hdrReferrer.checked = true;
    els.hdrCsp.checked = false;
    els.cspValue.value = "default-src 'self'";
    els.cacheImages.value = '1 year';
    els.cacheAssets.value = '1 month';
    els.cacheFonts.value = '1 year';
    els.cacheHtml.value = '0 seconds';
    els.denyVersion.value = '2.4';
    els.denyIps.value = '';
    els.wwwDirection.value = 'add-www';
    els.err401.value = ''; els.err403.value = '';
    els.err404.value = '/errors/404.html'; els.err500.value = '/errors/500.html';
    subFieldMap.forEach(function (pair) { pair[1].hidden = !pair[0].checked; });
    render();
    WUS.toast('Reset to defaults');
  }

  /* ===================== Persistence ===================== */

  function persist() {
    WUS.store.set(STORE_KEY, {
      https: els.https.checked,
      www: els.www.checked, wwwDirection: els.wwwDirection.value,
      errors: els.errors.checked, err401: els.err401.value, err403: els.err403.value, err404: els.err404.value, err500: els.err500.value,
      compress: els.compress.checked,
      cache: els.cache.checked, cacheImages: els.cacheImages.value, cacheAssets: els.cacheAssets.value, cacheFonts: els.cacheFonts.value, cacheHtml: els.cacheHtml.value,
      indexes: els.indexes.checked,
      headers: els.headers.checked,
      hdrFrame: els.hdrFrame.checked, hdrContentType: els.hdrContentType.checked,
      hdrXss: els.hdrXss.checked, hdrReferrer: els.hdrReferrer.checked,
      hdrCsp: els.hdrCsp.checked, cspValue: els.cspValue.value,
      deny: els.deny.checked, denyVersion: els.denyVersion.value, denyIps: els.denyIps.value
    });
  }
  var persistDebounced = WUS.debounce(persist, 300);

  function restore() {
    var s = WUS.store.get(STORE_KEY, null);
    if (!s) return;
    els.https.checked = !!s.https;
    els.www.checked = !!s.www; if (s.wwwDirection) els.wwwDirection.value = s.wwwDirection;
    els.errors.checked = !!s.errors;
    if (typeof s.err401 === 'string') els.err401.value = s.err401;
    if (typeof s.err403 === 'string') els.err403.value = s.err403;
    if (typeof s.err404 === 'string') els.err404.value = s.err404;
    if (typeof s.err500 === 'string') els.err500.value = s.err500;
    els.compress.checked = s.compress !== false;
    els.cache.checked = s.cache !== false;
    if (s.cacheImages) els.cacheImages.value = s.cacheImages;
    if (s.cacheAssets) els.cacheAssets.value = s.cacheAssets;
    if (s.cacheFonts) els.cacheFonts.value = s.cacheFonts;
    if (s.cacheHtml) els.cacheHtml.value = s.cacheHtml;
    els.indexes.checked = s.indexes !== false;
    els.headers.checked = s.headers !== false;
    els.hdrFrame.checked = s.hdrFrame !== false;
    els.hdrContentType.checked = s.hdrContentType !== false;
    els.hdrXss.checked = s.hdrXss !== false;
    els.hdrReferrer.checked = s.hdrReferrer !== false;
    els.hdrCsp.checked = !!s.hdrCsp;
    if (typeof s.cspValue === 'string' && s.cspValue) els.cspValue.value = s.cspValue;
    els.deny.checked = !!s.deny;
    if (s.denyVersion) els.denyVersion.value = s.denyVersion;
    if (typeof s.denyIps === 'string') els.denyIps.value = s.denyIps;

    subFieldMap.forEach(function (pair) { pair[1].hidden = !pair[0].checked; });
  }

  /* ===================== Shortcuts help modal ===================== */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'C'], desc: 'Copy .htaccess' },
    { keys: ['mod', 'S'], desc: 'Download .htaccess' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) { if (e.target === helpBackdrop) closeHelp(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp(); });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  /* ===================== Wiring ===================== */

  wireSubFields();

  document.getElementById('btnCopy').addEventListener('click', copyOutput);
  document.getElementById('btnDownload').addEventListener('click', downloadOutput);
  document.getElementById('btnReset').addEventListener('click', resetAll);

  [els.https, els.compress, els.cache, els.indexes, els.headers,
   els.hdrFrame, els.hdrContentType, els.hdrXss, els.hdrReferrer, els.hdrCsp].forEach(function (el) {
    el.addEventListener('change', render);
  });
  [els.wwwDirection, els.err401, els.err403, els.err404, els.err500,
   els.cacheImages, els.cacheAssets, els.cacheFonts, els.cacheHtml,
   els.cspValue, els.denyVersion, els.denyIps].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  WUS.registerShortcut('mod+c', function () {
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    copyOutput();
  }, 'Copy .htaccess');
  WUS.registerShortcut('mod+s', function () { downloadOutput(); }, 'Download .htaccess');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* ===================== Init ===================== */
  buildShortcutTable();
  restore();
  render();
})();
