/**
 * utils.js
 * Helper utilities for formatting, escaping, clipboard, YouTube parsing, and UI toast.
 */

import { ICON, AVATAR_PALETTE, SOFTWARE_OPTIONS } from './components.js';
export { ICON, AVATAR_PALETTE, SOFTWARE_OPTIONS };

// Circular-safe JSON stringify safeguard
(function() {
    var _origStringify = JSON.stringify;
    if (_origStringify) {
        JSON.stringify = function(val, replacer, space) {
            try {
                return _origStringify(val, replacer, space);
            } catch (e) {
                if (e && e.message && e.message.indexOf('circular') !== -1) {
                    var seen = new WeakSet();
                    return _origStringify(val, function(key, value) {
                        if (typeof value === 'object' && value !== null) {
                            if (value instanceof Node || value instanceof Window) return '[DOM Node]';
                            if (seen.has(value)) return '[Circular]';
                            seen.add(value);
                        }
                        if (typeof replacer === 'function') return replacer(key, value);
                        return value;
                    }, space);
                }
                throw e;
            }
        };
    }
})();

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateKode(len) {
    len = len || 6;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var k = '';
    for (var i = 0; i < len; i++) k += chars.charAt(Math.floor(Math.random() * chars.length));
    return k;
}

export function getYoutubeId(url) {
    if (!url) return null;
    var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?/]+)/,
        /youtube\.com\/shorts\/([^&\s?/]+)/
    ];
    for (var p = 0; p < patterns.length; p++) {
        var m = url.match(patterns[p]);
        if (m) return m[1];
    }
    return null;
}

export function embedYoutube(id) {
    return 'https://www.youtube.com/embed/' + id + '?rel=0&autoplay=1';
}

export function thumbYoutube(id) {
    return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
}

export function formatNumber(n) {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

export function formatRupiah(n) {
    var val = Number(n) || 0;
    if (val === 0) return 'Gratis';
    return 'Rp ' + val.toLocaleString('id-ID');
}

export function formatDate(timestamp) {
    if (!timestamp) return '';
    var date;
    if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        return '';
    }
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ratioCss(r) {
    return (r || '16:9').replace(':', '/');
}

export function showToast(msg, type) {
    type = type || 'info';
    var c = document.getElementById('toastContainer');
    if (!c) {
        c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    var icon = type === 'success' ? (ICON.check || '') : type === 'error' ? (ICON.alert || '') : (ICON.check || '');
    t.innerHTML = icon + '<span>' + msg + '</span>';
    c.appendChild(t);
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transform = 'translateY(6px)';
        t.style.transition = '0.2s';
        setTimeout(function() { t.remove(); }, 220);
    }, 2600);
}

export function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('Kode preset "' + text + '" berhasil disalin!', 'success');
        }).catch(function() { fallbackCopy(text); });
    } else {
        fallbackCopy(text);
    }
}

export function fallbackCopy(text) {
    var input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
        showToast('Kode preset "' + text + '" berhasil disalin!', 'success');
    } catch (e) {
        showToast('Gagal menyalin teks', 'error');
    }
    document.body.removeChild(input);
}
