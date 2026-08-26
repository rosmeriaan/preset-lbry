/**
 * components.js
 * UI components, icons, navigation builders, avatar generators, cards, and modal controllers.
 */

import { state } from './state.js';
import {
    escapeHtml,
    formatNumber,
    formatRupiah,
    formatDate,
    getYoutubeId,
    thumbYoutube,
    embedYoutube,
    ratioCss,
    getInitials,
    copyToClipboard,
    showToast
} from './utils.js';
import {
    db,
    hasUserViewed,
    recordView,
    hasUserLiked,
    toggleLike,
    incrementField,
    deleteTemplate
} from './firebase.js';

// ===== ICONS =====
export const ICON = {
    play: '<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff" stroke="none"><path d="M6 4l14 8-14 8V4z"/></svg>',
    download: '<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M20.8 8.6c0 4.4-8.8 10.4-8.8 10.4S3.2 13 3.2 8.6a4.8 4.8 0 0 1 8.8-2.7 4.8 4.8 0 0 1 8.8 2.7z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M4 20l1.4-4.1A8 8 0 1 1 8.8 19L4 20z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    folder: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>',
    noVideo: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="1.4"><rect x="2.5" y="6" width="19" height="12" rx="1.5"/><circle cx="9" cy="12" r="2.6"/><line x1="16" y1="9.5" x2="18.5" y2="9.5"/><line x1="16" y1="12.5" x2="18.5" y2="12.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7.5"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    ext: '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16" r="0.6"/></svg>',
    userPlus: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="2" x2="19" y2="8"/><line x1="16" y1="5" x2="22" y2="5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z"/></svg>',
    coin: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2.2"><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10"/></svg>',
    compass: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    plusBox: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    trend: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    trendingUp: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    arrowDownLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>',
    arrowUpRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
    zap: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    key: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:3px;"><path d="M21 2l-2 2m-1.5 1.5l-3 3m-3.5 3.5a6 6 0 1 1-8.5 8.5 6 6 0 0 1 8.5-8.5z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M2 20h20v2H2zM2 5l5 6 5-7 5 7 5-6v12H2z"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    dice: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:2px;"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><circle cx="8.5" cy="15.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    square: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    image: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    qr: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>',
    bank: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v4"/><path d="M12 14v4"/><path d="M16 14v4"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>',
    shoppingBag: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    package: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.55" y2="4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    layers: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    upload: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    badgeCheck: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 2.8 3.7-.4 1.2 3.5 3.3 1.7-1 3.6 2.1 3.1-2.9 2.3-.2 3.7-3.7.8-1.9 3.2L12 21l-3 1.4-1.9-3.2-3.7-.8-.2-3.7-2.9-2.3 2.1-3.1-1-3.6 3.3-1.7 1.2-3.5 3.7.4L12 2z"/><polyline points="9 12 11 14 15 10"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    verifiedBadge: '<svg viewBox="0 0 24 24" width="14" height="14" class="verified-badge-svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><path fill="#1d9bf0" d="M12 2l2.4 2.8 3.7-.4 1.2 3.5 3.3 1.7-1 3.6 2.1 3.1-2.9 2.3-.2 3.7-3.7.8-1.9 3.2L12 21l-3 1.4-1.9-3.2-3.7-.8-.2-3.7-2.9-2.3 2.1-3.1-1-3.6 3.3-1.7 1.2-3.5 3.7.4L12 2z"/><path fill="#ffffff" d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    starFilled: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    history: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 15"/></svg>',
    tag: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    activity: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    filter: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>'
};

// ===== CENTANG BIRU (VERIFIED BADGE) HELPERS =====
export function isCreatorVerified(creatorOrNameOrUid) {
    if (!creatorOrNameOrUid) return false;
    let creator = null;
    if (typeof creatorOrNameOrUid === 'object') {
        if (creatorOrNameOrUid.isVerified === true || creatorOrNameOrUid.verified === true) return true;
        const uid = creatorOrNameOrUid.uid || creatorOrNameOrUid.creatorUid || creatorOrNameOrUid.id;
        const name = (creatorOrNameOrUid.name || creatorOrNameOrUid.creator || '').toLowerCase();
        creator = state.allCreators.find(function(c) {
            return (uid && (c.uid === uid || c.id === uid)) ||
                   (name && (c.name || '').toLowerCase() === name);
        });
    } else if (typeof creatorOrNameOrUid === 'string') {
        const query = creatorOrNameOrUid.toLowerCase();
        creator = state.allCreators.find(function(c) {
            return (c.uid === creatorOrNameOrUid || c.id === creatorOrNameOrUid) ||
                   (c.name || '').toLowerCase() === query ||
                   (c.displayName || '').toLowerCase() === query;
        });
    }
    if (creator) {
        return creator.isVerified === true || creator.verified === true;
    }
    return false;
}

export function renderVerifiedBadgeHtml(creatorOrNameOrUid, sizePx) {
    if (!isCreatorVerified(creatorOrNameOrUid)) return '';
    const size = sizePx || 14;
    return '<span class="verified-badge-blue" title="Kreator Terverifikasi (Centang Biru Resmi)" aria-label="Centang Biru Terverifikasi" style="display:inline-flex;align-items:center;margin-left:3px;vertical-align:middle;flex-shrink:0;">' +
        '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" style="display:block;">' +
            '<path fill="#1d9bf0" d="M12 2l2.4 2.8 3.7-.4 1.2 3.5 3.3 1.7-1 3.6 2.1 3.1-2.9 2.3-.2 3.7-3.7.8-1.9 3.2L12 21l-3 1.4-1.9-3.2-3.7-.8-.2-3.7-2.9-2.3 2.1-3.1-1-3.6 3.3-1.7 1.2-3.5 3.7.4L12 2z"/>' +
            '<path fill="#ffffff" d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z"/>' +
        '</svg>' +
    '</span>';
}

// ===== SKELETON SCREEN GENERATOR =====
export function renderSkeletonCard(index) {
    const i = typeof index === 'number' ? index : 0;
    const aspectRatios = ['16/9', '9/16', '16/9', '1/1', '9/16', '16/9', '4/5', '16/9'];
    const titleWidths = ['85%', '92%', '78%', '88%', '95%', '70%', '82%', '90%'];
    const creatorWidths = ['45%', '55%', '40%', '60%', '48%', '52%', '42%', '50%'];
    const ratio = aspectRatios[i % aspectRatios.length];
    const tWidth = titleWidths[i % titleWidths.length];
    const cWidth = creatorWidths[i % creatorWidths.length];

    return '<article class="card is-skeleton" aria-hidden="true">' +
        '<div class="thumb skel" style="aspect-ratio:' + ratio + ';">' +
            '<span class="ratio-tag skel" style="width:30px;height:14px;border:none;background:rgba(255,255,255,0.4);"></span>' +
        '</div>' +
        '<div class="card-info">' +
            '<div class="skel-line skel" style="width:' + tWidth + ';height:13px;margin-bottom:6px;border-radius:4px;"></div>' +
            '<div class="skel-creator">' +
                '<div class="skel-avatar skel"></div>' +
                '<div class="skel-line skel" style="width:' + cWidth + ';height:10px;margin-top:0;border-radius:3px;"></div>' +
            '</div>' +
            '<div class="skel-foot">' +
                '<div class="skel-line skel" style="width:38px;height:12px;margin-top:0;border-radius:3px;"></div>' +
                '<div class="skel-stats">' +
                    '<div class="skel-line skel" style="width:24px;height:10px;margin-top:0;border-radius:3px;"></div>' +
                    '<div class="skel-line skel" style="width:24px;height:10px;margin-top:0;border-radius:3px;"></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</article>';
}

export function renderSkeletonGrid(count) {
    const total = typeof count === 'number' ? count : 12;
    let cardsHtml = '';
    for (let i = 0; i < total; i++) {
        cardsHtml += renderSkeletonCard(i);
    }
    return '<div class="grid is-loading is-skeleton" aria-busy="true" aria-label="Memuat data...">' + cardsHtml + '</div>';
}

// ===== AVATAR PALETTE & SOFTWARE CONSTANTS =====
export const AVATAR_PALETTE = [
    { bg: '#a8672b', label: 'Cokelat Amber' },
    { bg: '#2563eb', label: 'Biru Samudra' },
    { bg: '#7c3aed', label: 'Ungu Elegan' },
    { bg: '#db2777', label: 'Merah Muda' },
    { bg: '#dc2626', label: 'Merah Cerah' },
    { bg: '#d97706', label: 'Kuning Emas' },
    { bg: '#059669', label: 'Hijau Zamrud' },
    { bg: '#0284c7', label: 'Biru Langit' },
    { bg: '#4f46e5', label: 'Indigo' },
    { bg: '#0d9488', label: 'Teal' },
    { bg: '#334155', label: 'Abu-Abu Slate' },
    { bg: '#ea580c', label: 'Oranye Jingga' }
];

export const SOFTWARE_OPTIONS = [
    'Alight Motion',
    'CapCut',
    'Node Video',
    'Premiere Pro',
    'After Effects',
    'DaVinci Resolve',
    'KineMaster',
    'Canva',
    'Photoshop / Illustrator',
    'Lainnya'
];

// ===== AVATAR HELPERS =====
export function getAvatarStyle(creatorOrName) {
    if (!creatorOrName) return 'background: ' + AVATAR_PALETTE[0].bg + '; color: #ffffff;';
    let colorHex = '';
    let nameStr = '';
    if (typeof creatorOrName === 'object' && creatorOrName !== null) {
        nameStr = creatorOrName.displayName || creatorOrName.name || '';
        if (creatorOrName.avatarColor) {
            colorHex = creatorOrName.avatarColor;
        }
    } else if (typeof creatorOrName === 'string') {
        nameStr = creatorOrName;
        const matched = state.allCreators.find(function(c) {
            return (c.name || '').toLowerCase() === creatorOrName.toLowerCase() ||
                   (c.displayName || '').toLowerCase() === creatorOrName.toLowerCase();
        });
        if (matched && matched.avatarColor) {
            colorHex = matched.avatarColor;
        }
    }
    if (!colorHex) {
        let hash = 0;
        for (let i = 0; i < nameStr.length; i++) {
            hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % AVATAR_PALETTE.length;
        colorHex = AVATAR_PALETTE[index].bg;
    }
    return 'background: ' + colorHex + '; color: #ffffff;';
}

export function renderAvatarHtml(userOrCreatorOrName, extraClass, sizePx) {
    extraClass = extraClass || '';
    let name = '';
    let photoURL = '';
    let obj = null;

    if (userOrCreatorOrName && typeof userOrCreatorOrName === 'object' && userOrCreatorOrName !== null) {
        obj = userOrCreatorOrName;
        name = obj.displayName || obj.name || obj.email || 'User';
        photoURL = obj.photoURL || obj.photoUrl || obj.avatarUrl || obj.avatar || '';
        if (!photoURL) {
            const matched = state.allCreators.find(function(c) {
                return (obj.uid && (c.uid === obj.uid || c.id === obj.uid)) ||
                       (obj.creatorUid && (c.uid === obj.creatorUid || c.id === obj.creatorUid)) ||
                       (obj.name && (c.name || '').toLowerCase() === (obj.name || '').toLowerCase()) ||
                       (obj.creator && (c.name || '').toLowerCase() === (obj.creator || '').toLowerCase()) ||
                       (obj.displayName && (c.displayName || '').toLowerCase() === (obj.displayName || '').toLowerCase());
            });
            if (matched) {
                photoURL = matched.photoURL || matched.photoUrl || '';
            }
        }
        if (!photoURL && state.currentUser && (
            (obj.uid && state.currentUser.uid === obj.uid) ||
            (obj.email && state.currentUser.email === obj.email) ||
            (obj.name && state.currentUser.displayName && state.currentUser.displayName.toLowerCase() === (obj.name || '').toLowerCase())
        )) {
            photoURL = state.currentUser.photoURL || '';
        }
    } else if (typeof userOrCreatorOrName === 'string') {
        name = userOrCreatorOrName;
        const matched = state.allCreators.find(function(c) {
            return (c.name || '').toLowerCase() === name.toLowerCase() ||
                   (c.displayName || '').toLowerCase() === name.toLowerCase() ||
                   c.uid === name ||
                   c.id === name;
        });
        if (matched) {
            photoURL = matched.photoURL || matched.photoUrl || '';
        }
        if (!photoURL && state.currentUser && (
            (state.currentUser.displayName && state.currentUser.displayName.toLowerCase() === name.toLowerCase()) ||
            (state.currentUser.email && state.currentUser.email.toLowerCase() === name.toLowerCase()) ||
            state.currentUser.uid === name ||
            (state.currentUserCreator && (state.currentUserCreator.name || '').toLowerCase() === name.toLowerCase())
        )) {
            photoURL = state.currentUser.photoURL || '';
        }
    }

    const safeName = escapeHtml(name || 'User');
    const initials = getInitials(name || 'User');
    const sizeStyle = sizePx ? 'width:' + sizePx + 'px;height:' + sizePx + 'px;min-width:' + sizePx + 'px;min-height:' + sizePx + 'px;' : '';
    const fallbackBg = getAvatarStyle(obj || name);

    if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
        const safeUrl = escapeHtml(photoURL.trim());
        return '<div class="avatar ' + extraClass + '" style="' + sizeStyle + ';margin:0;flex-shrink:0;overflow:hidden;position:relative;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;"><img src="' + safeUrl + '" alt="' + safeName + '" class="avatar-img" referrerpolicy="no-referrer" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;margin:0;" onerror="this.style.display=\'none\'; if(this.nextElementSibling) this.nextElementSibling.style.display=\'flex\';" /><div class="avatar-fallback" style="' + fallbackBg + ';display:none;width:100%;height:100%;border-radius:50%;align-items:center;justify-content:center;font-weight:600;font-size:0.8em;margin:0;">' + initials + '</div></div>';
    }
    return '<div class="avatar ' + extraClass + '" style="' + fallbackBg + ';' + sizeStyle + ';margin:0;flex-shrink:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:600;">' + initials + '</div>';
}

export function renderAvatarPickerHtml(selectedColor, idPrefix, currentPhotoURL) {
    idPrefix = idPrefix || 'a';
    const hasGoogle = !!(state.currentUser && state.currentUser.photoURL);
    const googlePhoto = (state.currentUser && state.currentUser.photoURL) || currentPhotoURL || '';
    const isGoogleActive = hasGoogle && (currentPhotoURL === googlePhoto || (!currentPhotoURL && !selectedColor));
    const currentHex = selectedColor || (AVATAR_PALETTE[0] ? AVATAR_PALETTE[0].bg : '#6366F1');

    let html = '<div class="avatar-selection-wrapper" id="' + idPrefix + 'AvatarSelectionWrapper">';
    
    // Live preview box
    html += '<div class="avatar-live-preview-box">';
    html += '<div class="avatar-live-preview-circle" id="' + idPrefix + 'LiveAvatarPreview" style="background:' + currentHex + ';">';
    if (isGoogleActive && googlePhoto) {
        html += '<img src="' + escapeHtml(googlePhoto) + '" alt="Google Photo" referrerpolicy="no-referrer" onerror="this.style.display=\'none\';" />';
    } else {
        const currentInitials = state.currentUser ? getInitials(state.currentUser.displayName || state.currentUser.email || 'K') : 'K';
        html += '<span>' + currentInitials + '</span>';
    }
    html += '</div>';
    html += '<div class="avatar-live-preview-info">';
    html += '<span class="avatar-preview-title">Foto Profil Kreator</span>';
    html += '<span class="avatar-preview-sub" id="' + idPrefix + 'AvatarModeSub">' + (isGoogleActive ? 'Menggunakan foto akun Google' : 'Warna &amp; inisial kustom') + '</span>';
    html += '</div>';
    html += '</div>';

    // Source choice (Google vs Custom) if user has Google photo
    if (hasGoogle) {
        html += '<div class="avatar-source-options">';
        html += '<label class="avatar-source-chip ' + (isGoogleActive ? 'active' : '') + '" id="' + idPrefix + 'OptGoogle">';
        html += '<input type="radio" name="' + idPrefix + 'AvatarSource" value="google" ' + (isGoogleActive ? 'checked' : '') + ' style="display:none;" />';
        html += '<span class="chip-google-icon"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg></span>';
        html += '<span>Pakai Foto Google</span>';
        html += '</label>';
        html += '<label class="avatar-source-chip ' + (!isGoogleActive ? 'active' : '') + '" id="' + idPrefix + 'OptCustom">';
        html += '<input type="radio" name="' + idPrefix + 'AvatarSource" value="custom" ' + (!isGoogleActive ? 'checked' : '') + ' style="display:none;" />';
        html += '<span>Warna &amp; RGB Kustom</span>';
        html += '</label>';
        html += '</div>';
    }

    // Color & RGB controls
    html += '<div class="avatar-color-controls" id="' + idPrefix + 'ColorControls" style="' + (isGoogleActive ? 'display:none;' : '') + '">';
    html += '<div class="avatar-color-label">Pilih Warna Palet atau RGB Kustom:</div>';
    html += '<div class="avatar-color-picker" id="' + idPrefix + 'AvatarColorPicker">';
    AVATAR_PALETTE.forEach(function(item) {
        const isSel = (!isGoogleActive && (currentHex.toLowerCase() === item.bg.toLowerCase()));
        html += '<button type="button" class="color-swatch ' + (isSel ? 'selected' : '') + '" data-color="' + item.bg + '" style="background:' + item.bg + ';" title="' + item.label + '"><span class="swatch-check">&#10003;</span></button>';
    });
    // RGB native picker wrap
    html += '<div class="rgb-picker-wrap" title="Pilih Warna RGB Bebas">';
    html += '<input type="color" id="' + idPrefix + 'RgbNativePicker" class="rgb-native-input" value="' + currentHex + '" />';
    html += '<button type="button" class="btn-custom-rgb" id="' + idPrefix + 'RgbPickerBtn">';
    html += '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 4.36a2 2 0 0 1 2.83 2.83l-1.42 1.42-2.83-2.83 1.42-1.42z"/></svg>';
    html += '<span>RGB</span>';
    html += '<span class="rgb-color-preview-pill" id="' + idPrefix + 'RgbColorPill" style="background:' + currentHex + ';"></span>';
    html += '</button>';
    html += '</div>';
    html += '</div>';

    html += '<div class="rgb-val-indicator" id="' + idPrefix + 'RgbValIndicator">';
    html += 'Kode Warna: <strong class="mono" id="' + idPrefix + 'RgbHexDisplay">' + currentHex.toUpperCase() + '</strong>';
    html += '</div>';
    html += '</div>';

    // Hidden inputs
    html += '<input type="hidden" id="' + idPrefix + 'AvatarColor" value="' + currentHex + '" />';
    html += '<input type="hidden" id="' + idPrefix + 'AvatarPhotoURL" value="' + (isGoogleActive ? escapeHtml(googlePhoto) : '') + '" />';
    html += '<input type="hidden" id="' + idPrefix + 'AvatarSourceType" value="' + (isGoogleActive ? 'google' : 'custom') + '" />';
    html += '</div>';

    return html;
}

export function bindAvatarPickerEvents(idPrefix) {
    const wrapper = document.getElementById(idPrefix + 'AvatarSelectionWrapper');
    if (!wrapper) return;

    const previewCircle = document.getElementById(idPrefix + 'LiveAvatarPreview');
    const subLabel = document.getElementById(idPrefix + 'AvatarModeSub');
    const colorControls = document.getElementById(idPrefix + 'ColorControls');
    const colorHidden = document.getElementById(idPrefix + 'AvatarColor');
    const photoHidden = document.getElementById(idPrefix + 'AvatarPhotoURL');
    const sourceHidden = document.getElementById(idPrefix + 'AvatarSourceType');
    const rgbPicker = document.getElementById(idPrefix + 'RgbNativePicker');
    const rgbPill = document.getElementById(idPrefix + 'RgbColorPill');
    const rgbHexDisplay = document.getElementById(idPrefix + 'RgbHexDisplay');
    const picker = document.getElementById(idPrefix + 'AvatarColorPicker');

    function getCurrentDisplayName() {
        const nameInput = document.getElementById(idPrefix + 'DisplayName') || document.getElementById(idPrefix + 'Username');
        let nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal && state.currentUser) nameVal = state.currentUser.displayName || state.currentUser.email || 'K';
        return nameVal || 'K';
    }

    function updatePreview() {
        const isGoogle = sourceHidden && sourceHidden.value === 'google';
        const googlePhoto = (state.currentUser && state.currentUser.photoURL) || (photoHidden ? photoHidden.value : '');
        const color = (colorHidden && colorHidden.value) ? colorHidden.value : '#6366F1';
        const name = getCurrentDisplayName();
        const initials = getInitials(name);

        if (isGoogle && googlePhoto) {
            if (previewCircle) {
                previewCircle.style.background = '#e2e8f0';
                previewCircle.innerHTML = '<img src="' + escapeHtml(googlePhoto) + '" alt="' + escapeHtml(name) + '" referrerpolicy="no-referrer" onerror="this.style.display=\'none\';" />';
            }
            if (subLabel) subLabel.textContent = 'Menggunakan foto akun Google';
            if (colorControls) colorControls.style.display = 'none';
        } else {
            if (previewCircle) {
                previewCircle.style.background = color;
                previewCircle.innerHTML = '<span>' + initials + '</span>';
            }
            if (subLabel) subLabel.textContent = 'Warna & inisial kustom';
            if (colorControls) colorControls.style.display = 'flex';
        }
        if (rgbPill) rgbPill.style.background = color;
        if (rgbHexDisplay) rgbHexDisplay.textContent = color.toUpperCase();
    }

    // Google vs Custom radio options
    const optGoogle = document.getElementById(idPrefix + 'OptGoogle');
    const optCustom = document.getElementById(idPrefix + 'OptCustom');
    if (optGoogle) {
        optGoogle.addEventListener('click', function() {
            if (sourceHidden) sourceHidden.value = 'google';
            if (photoHidden && state.currentUser) photoHidden.value = state.currentUser.photoURL || '';
            optGoogle.classList.add('active');
            if (optCustom) optCustom.classList.remove('active');
            updatePreview();
        });
    }
    if (optCustom) {
        optCustom.addEventListener('click', function() {
            if (sourceHidden) sourceHidden.value = 'custom';
            if (photoHidden) photoHidden.value = '';
            optCustom.classList.add('active');
            if (optGoogle) optGoogle.classList.remove('active');
            updatePreview();
        });
    }

    // Swatches
    if (picker) {
        picker.querySelectorAll('.color-swatch').forEach(function(swatch) {
            swatch.addEventListener('click', function() {
                picker.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('selected'); });
                this.classList.add('selected');
                const color = this.dataset.color;
                if (colorHidden) colorHidden.value = color;
                if (rgbPicker) rgbPicker.value = color;
                if (sourceHidden) sourceHidden.value = 'custom';
                if (photoHidden) photoHidden.value = '';
                if (optCustom) optCustom.classList.add('active');
                if (optGoogle) optGoogle.classList.remove('active');
                updatePreview();
            });
        });
    }

    // RGB native picker
    if (rgbPicker) {
        rgbPicker.addEventListener('input', function() {
            const color = this.value;
            if (colorHidden) colorHidden.value = color;
            if (picker) {
                picker.querySelectorAll('.color-swatch').forEach(function(s) {
                    s.classList.toggle('selected', (s.dataset.color || '').toLowerCase() === color.toLowerCase());
                });
            }
            if (sourceHidden) sourceHidden.value = 'custom';
            if (photoHidden) photoHidden.value = '';
            if (optCustom) optCustom.classList.add('active');
            if (optGoogle) optGoogle.classList.remove('active');
            updatePreview();
        });
    }

    // Live update initials when typing
    const nameInput = document.getElementById(idPrefix + 'DisplayName') || document.getElementById(idPrefix + 'Username');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            updatePreview();
        });
    }
}

// ===== SOFTWARE CHECKBOX HELPERS =====
export function updateSoftwareChipState(group) {
    if (!group) return;
    group.querySelectorAll('.software-chip').forEach(function(chip) {
        const cb = chip.querySelector('input[type="checkbox"]');
        if (cb) {
            chip.classList.toggle('checked', cb.checked);
        }
    });
}

export function toggleSoftwareCustomInput(prefix) {
    const group = document.getElementById(prefix + 'SoftwareGroup');
    const customInput = document.getElementById(prefix + 'SoftwareCustom');
    if (group) {
        updateSoftwareChipState(group);
    }
    if (!group || !customInput) return;
    const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
    const values = Array.from(checkboxes).map(cb => cb.value);
    if (values.includes('Lainnya')) {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
}

export function renderSoftwareCheckboxesHtml(prefix, currentSoftwareStr) {
    currentSoftwareStr = currentSoftwareStr || '';
    const selectedList = currentSoftwareStr.split(',').map(s => s.trim()).filter(Boolean);
    let html = '<div class="software-checkbox-grid" id="' + prefix + 'SoftwareGroup">';
    let hasCustom = false;
    let customVal = '';

    SOFTWARE_OPTIONS.forEach(function(opt) {
        const isChecked = selectedList.indexOf(opt) !== -1;
        html += '<label class="software-chip' + (isChecked ? ' checked' : '') + '">';
        html += '<input type="checkbox" name="' + prefix + 'SoftwareOption" value="' + escapeHtml(opt) + '"' + (isChecked ? ' checked' : '') + '>';
        html += '<span class="chip-check"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
        html += '<span class="chip-label">' + escapeHtml(opt) + '</span>';
        html += '</label>';
    });

    const customItems = selectedList.filter(function(s) { return SOFTWARE_OPTIONS.indexOf(s) === -1; });
    if (customItems.length > 0) {
        hasCustom = true;
        customVal = customItems.join(', ');
    }

    html += '</div>';
    html += '<input type="text" id="' + prefix + 'SoftwareCustom" class="form-control" placeholder="Tulis software lainnya (pisahkan koma)..." value="' + escapeHtml(customVal) + '" style="display:' + (hasCustom || selectedList.indexOf('Lainnya') !== -1 ? 'block' : 'none') + ';margin-top:0.5rem;" />';
    return html;
}

export function getSelectedSoftwareValues(prefix) {
    const group = document.getElementById(prefix + 'SoftwareGroup');
    if (!group) return '';
    const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
    const values = Array.from(checkboxes).map(function(cb) { return cb.value; });
    if (values.indexOf('Lainnya') !== -1) {
        const customVal = (document.getElementById(prefix + 'SoftwareCustom') ? document.getElementById(prefix + 'SoftwareCustom').value : '').trim();
        const filtered = values.filter(function(v) { return v !== 'Lainnya'; });
        if (customVal) filtered.push(customVal);
        return filtered.join(', ');
    }
    return values.join(', ');
}

export function resetSoftwareCheckboxes(prefix) {
    const group = document.getElementById(prefix + 'SoftwareGroup');
    if (group) {
        group.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
        updateSoftwareChipState(group);
    }
    const customInput = document.getElementById(prefix + 'SoftwareCustom');
    if (customInput) {
        customInput.value = '';
        customInput.style.display = 'none';
    }
}

// ===== CARDS & EMPTY STATES =====
export function renderCard(t) {
    const ytId = t.linkYoutube ? getYoutubeId(t.linkYoutube) : null;
    const isFree = t.license === 'free';
    const priceLabel = isFree ? 'Gratis' : formatRupiah(t.harga || 0);
    const ratio = t.aspectRatio || '16:9';
    const creatorAvatar = renderAvatarHtml(t.creatorUid ? { uid: t.creatorUid, name: t.creator } : t.creator, 'card-creator-avatar', 16);

    return '<article class="card" data-id="' + t.id + '" data-creator="' + escapeHtml(t.creator || '') + '" data-kode="' + escapeHtml(t.kode || '') + '" tabindex="0" role="button" aria-label="' + escapeHtml(t.judul || '') + '">' +
        '<div class="thumb" style="aspect-ratio:' + ratioCss(ratio) + '">' +
            '<div class="thumb-fallback">' + ICON.noVideo + '</div>' +
            (ytId ? '<img class="thumb-img" src="' + thumbYoutube(ytId) + '" alt="" loading="lazy" onerror="this.remove()"><span class="play-badge">' + ICON.play + '</span>' : '') +
            '<span class="ratio-tag">' + ratio + '</span>' +
            (t.kode ? '<button class="card-quick-code" data-kode="' + escapeHtml(t.kode) + '" title="Salin Kode Preset">' + ICON.copy + ' ' + escapeHtml(t.kode) + '</button>' : '') +
        '</div>' +
        '<div class="card-info">' +
            '<h3 class="card-title">' + escapeHtml(t.judul || 'Tanpa judul') + '</h3>' +
            '<div class="card-creator">' + creatorAvatar + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;gap:2px;">' + escapeHtml(t.creator || 'Anonim') + renderVerifiedBadgeHtml(t.creatorUid ? { uid: t.creatorUid, name: t.creator } : t.creator, 12) + '</span></div>' +
            '<div class="card-foot">' +
                '<span class="price ' + (isFree ? 'free' : 'paid') + '">' + priceLabel + '</span>' +
                '<div class="card-stats">' +
                    '<span class="likes" title="Suka">' + ICON.heart + formatNumber(t.likes || 0) + '</span>' +
                    '<span class="uses" title="Unduhan">' + ICON.download + formatNumber(t.uses || 0) + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</article>';
}

export function emptyStateHtml(kind) {
    if (kind === 'creators') {
        return '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">' + (ICON.users || '') + '<div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada kreator terdaftar</div><div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Jadilah kreator pertama yang mempublikasikan preset di komunitas.</div></div>';
    }
    if (kind === 'creator-profile') {
        return '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">' + ICON.noVideo + '<div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada karya</div><div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Kreator ini belum membagikan template apapun.</div></div>';
    }
    if (kind === 'home') {
        return '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">' + ICON.noVideo + '<div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada preset yang diunggah</div><div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Preset dari database Firebase akan otomatis tampil di sini.</div></div>';
    }
    return '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">' + ICON.search + '<div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Tidak menemukan hasil yang cocok</div><div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Coba kata kunci lain atau cari nama kreator.</div></div>';
}

// ===== NAVIGATION BUILDERS =====
export function buildDesktopNav(handlers) {
    const mainNav = document.getElementById('mainNav');
    if (!mainNav) return;
    mainNav.innerHTML = '';

    const homeBtn = document.createElement('button');
    homeBtn.dataset.view = 'home';
    homeBtn.dataset.navLabel = 'home';
    homeBtn.textContent = 'Home';
    homeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('home');
        state.activeRatio = null;
        if (handlers && handlers.applyRatioChipUI) handlers.applyRatioChipUI();
    });
    mainNav.appendChild(homeBtn);

    const cariBtn = document.createElement('button');
    cariBtn.dataset.view = 'cari';
    cariBtn.dataset.navLabel = 'cari';
    cariBtn.textContent = 'Jelajah';
    cariBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('cari');
    });
    mainNav.appendChild(cariBtn);

    const kreatorBtn = document.createElement('button');
    kreatorBtn.dataset.view = 'creators';
    kreatorBtn.dataset.navLabel = 'creators';
    kreatorBtn.textContent = 'Kreator';
    kreatorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.currentCreator = null;
        if (handlers && handlers.goToView) handlers.goToView('creators');
    });
    mainNav.appendChild(kreatorBtn);

    if (state.currentUser) {
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'nav-upload-desktop';
        uploadBtn.id = 'headerUploadBtn';
        uploadBtn.dataset.view = 'upload';
        uploadBtn.dataset.navLabel = 'upload';
        uploadBtn.title = 'Upload Template';
        uploadBtn.innerHTML = ICON.plusBox + ' <span>Upload</span>';
        uploadBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (handlers && handlers.openUploadFlow) handlers.openUploadFlow();
        });
        mainNav.appendChild(uploadBtn);
    }

    const profileBtn = document.createElement('button');
    profileBtn.dataset.view = 'profile';
    profileBtn.dataset.navLabel = 'profile';
    profileBtn.textContent = 'Profile';
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('profile');
    });
    mainNav.appendChild(profileBtn);

    updateNavActiveState();
}

export function buildMobileNav(handlers) {
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) return;
    mobileNav.innerHTML = '';

    const homeBtn = document.createElement('button');
    homeBtn.dataset.nav = 'home';
    homeBtn.dataset.navLabel = 'home';
    homeBtn.innerHTML = ICON.home + '<span>Home</span>';
    homeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('home');
        state.activeRatio = null;
        if (handlers && handlers.applyRatioChipUI) handlers.applyRatioChipUI();
    });
    mobileNav.appendChild(homeBtn);

    const jelajahBtn = document.createElement('button');
    jelajahBtn.dataset.nav = 'cari';
    jelajahBtn.dataset.navLabel = 'cari';
    jelajahBtn.innerHTML = ICON.compass + '<span>Jelajah</span>';
    jelajahBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('cari');
    });
    mobileNav.appendChild(jelajahBtn);

    const plusBtn = document.createElement('button');
    plusBtn.className = 'nav-upload-mobile';
    plusBtn.dataset.nav = 'upload';
    plusBtn.dataset.navLabel = 'upload';
    plusBtn.setAttribute('aria-label', 'Upload Template');
    plusBtn.innerHTML = ICON.plusBox;
    plusBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.openUploadFlow) handlers.openUploadFlow();
    });
    mobileNav.appendChild(plusBtn);

    const kreatorBtn = document.createElement('button');
    kreatorBtn.dataset.nav = 'creators';
    kreatorBtn.dataset.navLabel = 'creators';
    kreatorBtn.innerHTML = ICON.users + '<span>Kreator</span>';
    kreatorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.currentCreator = null;
        if (handlers && handlers.goToView) handlers.goToView('creators');
    });
    mobileNav.appendChild(kreatorBtn);

    const profileBtn = document.createElement('button');
    profileBtn.dataset.nav = 'profile';
    profileBtn.dataset.navLabel = 'profile';
    profileBtn.innerHTML = ICON.user + '<span>Profile</span>';
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (handlers && handlers.goToView) handlers.goToView('profile');
    });
    mobileNav.appendChild(profileBtn);

    updateNavActiveState();
}

export function updateNavActiveState() {
    const mainNav = document.getElementById('mainNav');
    const mobileNav = document.getElementById('mobileNav');
    const navLabel = (state.currentView === 'home') ? 'home' :
        (state.currentView === 'cari' || state.currentView === 'search') ? 'cari' :
        (state.currentView === 'creators') ? 'creators' :
        (state.currentView === 'upload') ? 'upload' :
        (state.currentView === 'profile') ? 'profile' : 'home';

    if (mainNav) {
        mainNav.querySelectorAll('button').forEach(function(b) {
            const label = b.dataset.navLabel || b.dataset.view || b.textContent.toLowerCase().trim();
            b.classList.toggle('active', label === navLabel);
        });
    }

    if (mobileNav) {
        mobileNav.querySelectorAll('button').forEach(function(b) {
            const label = b.dataset.navLabel || b.dataset.nav;
            b.classList.toggle('active', label === navLabel);
        });
    }

    const logoText = document.getElementById('logoText');
    const logoLink = document.getElementById('logoLink');
    let titleText = 'Preset Library';
    if (state.currentView === 'cari' || state.currentView === 'search') {
        titleText = 'Explore';
    } else if (state.currentView === 'creators') {
        titleText = 'Kreator';
    } else if (state.currentView === 'profile' || state.currentView === 'akun') {
        titleText = 'Profile';
    } else if (state.currentView === 'purchases') {
        titleText = 'Pembelian';
    } else if (state.currentView === 'dashboard') {
        titleText = 'Dashboard';
    } else if (state.currentView === 'admin') {
        titleText = 'Admin';
    }

    if (logoText) {
        logoText.textContent = titleText;
    } else if (logoLink) {
        const img = logoLink.querySelector('img');
        if (img) {
            logoLink.innerHTML = '';
            logoLink.appendChild(img);
            const span = document.createElement('span');
            span.id = 'logoText';
            span.textContent = titleText;
            logoLink.appendChild(span);
        } else {
            logoLink.textContent = titleText;
        }
    }

    const headerSearchToggle = document.getElementById('headerSearchToggle');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    const profileMenuDropdown = document.getElementById('profileMenuDropdown');
    const menuLogoutText = document.getElementById('menuLogoutText');

    const isDashboard = state.currentView === 'dashboard' || state.currentView === 'wallet';
    const isProfile = state.currentView === 'profile' || state.currentView === 'akun';

    if (headerSearchToggle) {
        if (isDashboard || isProfile) {
            headerSearchToggle.style.display = 'none';
        } else {
            headerSearchToggle.style.display = 'inline-flex';
        }
    }

    if (profileMenuToggle) {
        if (isProfile) {
            profileMenuToggle.style.display = 'inline-flex';
        } else {
            profileMenuToggle.style.display = 'none';
            if (profileMenuDropdown) profileMenuDropdown.classList.remove('active');
        }
    }

    if (menuLogoutText) {
        menuLogoutText.textContent = state.currentUser ? 'Keluar Akun' : 'Masuk / Daftar';
    }
}

export function updateContextLine() {
    const contextLine = document.getElementById('contextLine');
    if (!contextLine) return;
    const total = state.allTemplates.length;
    const creators = state.allCreators.length;
    if (state.currentView === 'creators' && !state.currentCreator) {
        contextLine.innerHTML = '<strong>' + creators + '</strong> kreator sudah bergabung di Preset Library.';
        return;
    }
    if (state.currentView === 'creators' && state.currentCreator) {
        contextLine.innerHTML = 'Karya dari <strong>' + escapeHtml(state.currentCreator) + '</strong>';
        return;
    }
    contextLine.innerHTML = '<strong>' + total + '</strong> template dari <strong>' + creators + '</strong> kreator Indonesia.';
}

// ===== MULTI-STEP FORM HELPER =====
export function setupMultiStepForm(config) {
    let currentStep = 1;
    const totalSteps = 4;

    function updateStepUI(targetStep) {
        currentStep = Math.max(1, Math.min(totalSteps, targetStep));

        if (config.trackEl) {
            config.trackEl.style.transform = 'translateX(-' + ((currentStep - 1) * 100) + '%)';
        }

        if (config.progressEl) {
            const pills = config.progressEl.querySelectorAll('.step-pill');
            pills.forEach(function(pill) {
                const s = parseInt(pill.dataset.step, 10);
                pill.classList.toggle('active', s === currentStep);
                pill.classList.toggle('completed', s < currentStep);
            });
        }

        if (currentStep === 4) {
            updateSummary();
        }
    }

    function updateSummary() {
        const prefix = config.prefix;
        const usernameVal = (document.getElementById(prefix + 'Username') ? document.getElementById(prefix + 'Username').value : '').trim();
        const displayVal = (document.getElementById(prefix + 'DisplayName') ? document.getElementById(prefix + 'DisplayName').value : '').trim();
        const bioVal = (document.getElementById(prefix + 'Bio') ? document.getElementById(prefix + 'Bio').value : '').trim();
        const softwareVal = getSelectedSoftwareValues(prefix);
        const waVal = (document.getElementById(prefix + 'Wa') ? document.getElementById(prefix + 'Wa').value : '').trim();
        const emailVal = (document.getElementById(prefix + 'Email') ? document.getElementById(prefix + 'Email').value : '').trim();
        const portfolioVal = (document.getElementById(prefix + 'Portfolio') ? document.getElementById(prefix + 'Portfolio').value : '').trim();

        const setVal = function(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '—';
        };

        setVal(prefix + 'SumUsername', usernameVal ? '@' + usernameVal : '—');
        setVal(prefix + 'SumDisplayName', displayVal);
        setVal(prefix + 'SumBio', bioVal);
        setVal(prefix + 'SumSoftware', softwareVal);
        setVal(prefix + 'SumWa', waVal);
        setVal(prefix + 'SumEmail', emailVal);
        setVal(prefix + 'SumPortfolio', portfolioVal);
    }

    function validateStep(step) {
        const prefix = config.prefix;
        if (step === 1) {
            const unEl = document.getElementById(prefix + 'Username');
            const dnEl = document.getElementById(prefix + 'DisplayName');

            const unVal = unEl ? unEl.value.trim() : '';
            const dnVal = dnEl ? dnEl.value.trim() : '';
            const swVal = getSelectedSoftwareValues(prefix);

            if (!unVal) {
                showToast('Username wajib diisi', 'error');
                if (unEl) unEl.focus();
                return false;
            }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(unVal)) {
                showToast('Username minimal 3 karakter, hanya huruf/angka/garis bawah', 'error');
                if (unEl) unEl.focus();
                return false;
            }
            if (unEl && unEl.dataset.checked === 'false') {
                showToast('Username sudah dipakai atau tidak valid', 'error');
                if (unEl) unEl.focus();
                return false;
            }
            if (state.allCreators.some(function(c) { return (c.name || '').toLowerCase() === unVal.toLowerCase(); })) {
                showToast('Username sudah terdaftar', 'error');
                if (unEl) unEl.focus();
                return false;
            }
            if (!dnVal) {
                showToast('Nama Tampilan wajib diisi', 'error');
                if (dnEl) dnEl.focus();
                return false;
            }
            if (!swVal) {
                showToast('Pilih setidaknya 1 software yang digunakan', 'error');
                return false;
            }
            return true;
        } else if (step === 2) {
            const emailEl = document.getElementById(prefix + 'Email');
            if (emailEl && emailEl.value.trim()) {
                if (!emailEl.checkValidity()) {
                    showToast('Format email tidak valid', 'error');
                    emailEl.focus();
                    return false;
                }
            }
            return true;
        } else if (step === 3) {
            const portEl = document.getElementById(prefix + 'Portfolio');
            if (portEl && portEl.value.trim()) {
                if (!portEl.checkValidity()) {
                    showToast('Format URL portfolio tidak valid (gunakan http:// atau https://)', 'error');
                    portEl.focus();
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    if (config.formEl) {
        config.formEl.querySelectorAll('.btn-next-step').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (validateStep(currentStep)) {
                    updateStepUI(currentStep + 1);
                }
            });
        });

        config.formEl.querySelectorAll('.btn-prev-step').forEach(function(btn) {
            btn.addEventListener('click', function() {
                updateStepUI(currentStep - 1);
            });
        });

        config.formEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT' && currentStep < 4) {
                e.preventDefault();
                if (validateStep(currentStep)) {
                    updateStepUI(currentStep + 1);
                }
            }
        });
    }

    if (config.progressEl) {
        config.progressEl.querySelectorAll('.step-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
                const targetStep = parseInt(this.dataset.step, 10);
                if (targetStep < currentStep) {
                    updateStepUI(targetStep);
                } else if (targetStep > currentStep) {
                    let canAdvance = true;
                    for (let s = currentStep; s < targetStep; s++) {
                        if (!validateStep(s)) {
                            canAdvance = false;
                            break;
                        }
                    }
                    if (canAdvance) updateStepUI(targetStep);
                }
            });
        });
    }

    return {
        reset: function() {
            currentStep = 1;
            updateStepUI(1);
        },
        updateStepUI: updateStepUI,
        getCurrentStep: function() { return currentStep; },
        validateStep: validateStep
    };
}

// ===== DETAIL MODAL (3-SLIDE INTERFACE) =====
export function closeDetail() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
    const content = document.getElementById('detailContent');
    if (content) {
        // Pause iframe
        const iframe = content.querySelector('iframe');
        if (iframe) iframe.src = '';
    }
}

export function openDetail(template, callbacks) {
    if (!template || !template.id) {
        showToast('Template tidak ditemukan', 'error');
        return;
    }
    const ytId = template.linkYoutube ? getYoutubeId(template.linkYoutube) : null;
    const isFree = template.license === 'free';
    const content = document.getElementById('detailContent');
    if (!content) return;
    const userId = state.currentUser ? state.currentUser.uid : null;

    // View tracker
    const viewKey = userId ? userId + '_' + template.id : 'anon_' + template.id;
    if (!state.viewedTemplates[viewKey]) {
        state.viewedTemplates[viewKey] = true;
        if (userId) {
            hasUserViewed(template.id, userId).then(function(exists) {
                if (!exists) {
                    incrementField(template.id, 'views', 1).catch(function() {});
                    recordView(template.id, userId).catch(function() {});
                    const viewEl = document.getElementById('detailViewCount');
                    if (viewEl) {
                        const curr = parseInt(viewEl.textContent.replace(/\D/g, '')) || 0;
                        viewEl.textContent = formatNumber(curr + 1);
                    }
                    const tpl = state.allTemplates.find(function(t) { return t.id === template.id; });
                    if (tpl) tpl.views = (tpl.views || 0) + 1;
                }
            }).catch(function() {});
        } else {
            incrementField(template.id, 'views', 1).catch(function() {});
            const viewEl = document.getElementById('detailViewCount');
            if (viewEl) {
                const curr = parseInt(viewEl.textContent.replace(/\D/g, '')) || 0;
                viewEl.textContent = formatNumber(curr + 1);
            }
            const tpl = state.allTemplates.find(function(t) { return t.id === template.id; });
            if (tpl) tpl.views = (tpl.views || 0) + 1;
        }
    }

    // Lookup creator object
    const creatorObj = state.allCreators.find(function(c) {
        return (template.creatorUid && c.uid === template.creatorUid) ||
               (c.name && c.name.toLowerCase() === (template.creator || '').toLowerCase()) ||
               c.id === template.creatorUid;
    }) || {};

    const creatorDisplayName = creatorObj.displayName || creatorObj.name || template.creator || 'Kreator';
    const creatorUsername = creatorObj.name || template.creator || 'kreator';
    const creatorSoftware = creatorObj.software || template.kategori || 'Video Editor';
    const creatorWa = creatorObj.wa || template.creatorWa || '';
    let cleanWa = creatorWa.replace(/\D/g, '');
    if (cleanWa.startsWith('08')) {
        cleanWa = '628' + cleanWa.slice(2);
    } else if (cleanWa.startsWith('8')) {
        cleanWa = '628' + cleanWa.slice(1);
    }

    const isPurchased = state.userOrders.some(function(o) {
        return o.templateId === template.id && (o.status === 'paid' || o.status === 'completed');
    });
    const isOwner = state.currentUser && (template.creatorUid === state.currentUser.uid || state.isAdmin);
    const uploadDate = formatDate(template.createdAt);

    let likedState = state.likedTemplateIds.has(template.id);
    if (userId) {
        hasUserLiked(template.id, userId).then(function(liked) {
            likedState = liked;
            if (liked) state.likedTemplateIds.add(template.id);
            else state.likedTemplateIds.delete(template.id);
            const btn = document.getElementById('likeBtn');
            if (btn) {
                btn.classList.toggle('liked', liked);
            }
        }).catch(function() {});
    } else {
        likedState = false;
    }

    // Default buyer name
    let buyerDefaultName = '';
    if (state.currentUser) {
        buyerDefaultName = state.currentUser.displayName || (state.currentUserCreator && state.currentUserCreator.displayName) || '';
        if (!buyerDefaultName && state.currentUser.email) {
            buyerDefaultName = state.currentUser.email.split('@')[0];
        }
    }

    // ===== SLIDE 1: PREVIEW & KREATOR =====
    const slide1Html = '<div class="detail-preview" style="aspect-ratio:' + ratioCss(template.aspectRatio || '16:9') + '">' +
        (ytId ? '<iframe src="' + embedYoutube(ytId) + '" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#8a8578;">' + ICON.noVideo + '</div>') +
    '</div>' +
    '<div class="detail-caption-box">' +
        '<div class="detail-caption-title">' + escapeHtml(template.judul || 'Tanpa Judul') + '</div>' +
        '<div class="detail-meta-row">' +
            '<span class="tag ' + (isFree ? 'free' : 'paid') + '">' + (isFree ? 'Gratis' : formatRupiah(template.harga || 0)) + '</span>' +
            '<span class="tag">' + escapeHtml(template.kategori || 'Semua') + '</span>' +
            (template.aspectRatio ? '<span class="tag mono">' + escapeHtml(template.aspectRatio) + '</span>' : '') +
            (template.style ? '<span class="tag style-tag">' + escapeHtml(template.style) + '</span>' : '') +
            (template.kode ? '<button class="tag mono tag-code-copy" id="copyCodeBtn" title="Klik untuk menyalin kode preset" data-kode="' + escapeHtml(template.kode) + '">' + ICON.copy + ' ' + escapeHtml(template.kode) + '</button>' : '') +
        '</div>' +
    '</div>' +
    '<div class="detail-creator-card" id="detailCreatorCard" data-creator="' + escapeHtml(creatorUsername) + '">' +
        '<div class="detail-creator-left">' +
            renderAvatarHtml(creatorObj.uid ? creatorObj : (template.creatorUid ? { uid: template.creatorUid, name: template.creator } : template.creator), 'detail-creator-avatar', 38) +
            '<div class="detail-creator-info">' +
                '<div class="name" style="display:inline-flex;align-items:center;gap:3px;">' + escapeHtml(creatorDisplayName) + renderVerifiedBadgeHtml(creatorObj.uid ? creatorObj : (template.creatorUid ? { uid: template.creatorUid, name: template.creator } : template.creator), 16) + '</div>' +
                '<div class="creator-meta">@' + escapeHtml(creatorUsername) + ' &bull; ' + escapeHtml(creatorSoftware) + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="detail-creator-right">' +
            '<span>Lihat Profil</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</div>' +
    '</div>' +
    '<div class="detail-engagement-bar">' +
        '<div class="detail-stats-group">' +
            '<span class="detail-stat-item">' + ICON.download + '<span id="detailUsesCount">' + formatNumber(template.uses || 0) + '</span> unduhan</span>' +
            '<span class="detail-stat-item">' + ICON.eye + '<span id="detailViewCount">' + formatNumber(template.views || 0) + '</span> dilihat</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:0.4rem;">' +
            '<button class="detail-stat-btn ' + (likedState ? 'liked' : '') + '" id="likeBtn" data-id="' + template.id + '">' + ICON.heart + ' <span id="detailLikeCount">' + formatNumber(template.likes || 0) + '</span> Suka</button>' +
            '<button class="detail-stat-btn" id="shareDetailBtn" title="Bagikan link preset">' + ICON.share + ' Bagikan</button>' +
        '</div>' +
    '</div>' +
    '<div class="detail-slide-footer">' +
        '<button class="btn btn-primary" id="goToSlide2Btn">Lihat Deskripsi &amp; File &rarr;</button>' +
    '</div>';

    // ===== SLIDE 2: DESKRIPSI & DOWNLOAD =====
    let linksHtml = '';
    if (isFree) {
        const links = [];
        if (template.linkProject) links.push({ label: 'Buka Project Preset (XML / 5MB / JSON)', url: template.linkProject, icon: ICON.folder });
        if (template.linkDrive) links.push({ label: 'Unduh File dari Google Drive', url: template.linkDrive, icon: ICON.download });
        if (template.linkAsset1) links.push({ label: 'Asset Tambahan 1', url: template.linkAsset1, icon: ICON.link });
        if (template.linkAsset2) links.push({ label: 'Asset Tambahan 2', url: template.linkAsset2, icon: ICON.link });
        if (links.length) {
            linksHtml = '<div class="detail-links">';
            links.forEach(function(l) {
                linksHtml += '<a href="' + l.url + '" target="_blank" rel="noopener" data-template-id="' + template.id + '"><span class="link-label-wrap">' + l.icon + l.label + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>';
            });
            linksHtml += '</div>';
        }
    } else {
        if (isPurchased) {
            const links2 = [];
            if (template.linkProject) links2.push({ label: 'Buka Project Preset (Unlocked)', url: template.linkProject, icon: ICON.folder });
            if (template.linkDrive) links2.push({ label: 'Unduh File dari Drive (Unlocked)', url: template.linkDrive, icon: ICON.download });
            if (template.linkAsset1) links2.push({ label: 'Asset Tambahan 1', url: template.linkAsset1, icon: ICON.link });
            if (template.linkAsset2) links2.push({ label: 'Asset Tambahan 2', url: template.linkAsset2, icon: ICON.link });
            if (links2.length) {
                linksHtml = '<div class="detail-links" style="margin-top:0.6rem;">';
                links2.forEach(function(l) {
                    linksHtml += '<a href="' + l.url + '" target="_blank" rel="noopener" data-template-id="' + template.id + '" style="border-color:var(--accent);background:var(--accent-soft);"><span class="link-label-wrap">' + l.icon + l.label + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></a>';
                });
                linksHtml += '</div>';
            }
        } else {
            linksHtml = '<div class="detail-info-card" style="margin-top:0.75rem;border:1.5px dashed rgba(20, 184, 166, 0.4);background:var(--accent-soft);">' +
                '<div style="font-weight:700;color:var(--accent-dark);font-size:0.85rem;display:flex;align-items:center;gap:0.4rem;">' + (ICON.lock || '') + ' File Terkunci (Preset Berbayar)</div>' +
                '<p style="font-size:0.76rem;color:var(--text-secondary);margin:0.35rem 0 0.6rem;">Dapatkan akses link project, file XML, dan asset lengkap dengan memesan langsung di Slide 3.</p>' +
                '<button class="btn btn-primary" id="slide2ToOrderBtn" style="width:100%;font-size:0.82rem;padding:0.55rem;">Pesan / Beli Preset Ini (' + formatRupiah(template.harga || 0) + ') &rarr;</button>' +
            '</div>';
        }
    }

    let ownerActions = '';
    if (isOwner) {
        ownerActions = '<div class="preset-owner-actions"><button class="btn btn-secondary" id="editPresetBtn" data-id="' + template.id + '">' + ICON.edit + ' Edit Preset</button><button class="btn btn-danger" id="deletePresetBtn" data-id="' + template.id + '">' + ICON.trash + ' Hapus Preset</button></div>';
    }

    const slide2Html = '<div class="detail-info-card">' +
        '<div class="detail-info-row"><span>Status Lisensi:</span><strong>' + (isFree ? 'Gratis (Free to use)' : 'Berbayar &mdash; ' + formatRupiah(template.harga || 0)) + '</strong></div>' +
        (uploadDate ? '<div class="detail-info-row"><span>Tanggal Diunggah:</span><strong>' + uploadDate + '</strong></div>' : '') +
        (template.kode ? '<div class="detail-info-row"><span>Kode Unik:</span><strong style="font-family:var(--font-mono);">' + escapeHtml(template.kode) + '</strong></div>' : '') +
    '</div>' +
    '<div class="detail-info-card">' +
        '<div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);margin-bottom:0.3rem;">Deskripsi Preset</div>' +
        '<div class="detail-desc-text">' + (template.deskripsi ? escapeHtml(template.deskripsi) : '<span style="color:var(--text-muted);">Tidak ada deskripsi tambahan dari kreator.</span>') + '</div>' +
    '</div>' +
    '<div class="detail-specs-grid">' +
        '<div class="detail-spec-item"><div class="label">Kategori / Software</div><div class="value">' + escapeHtml(template.kategori || 'Video Preset') + '</div></div>' +
        '<div class="detail-spec-item"><div class="label">Rasio Layar (Aspect)</div><div class="value" style="font-family:var(--font-mono);">' + escapeHtml(template.aspectRatio || '16:9') + '</div></div>' +
        (template.style ? '<div class="detail-spec-item" style="grid-column:1/-1;"><div class="label">Style Editing</div><div class="value">' + escapeHtml(template.style) + '</div></div>' : '') +
    '</div>' +
    linksHtml +
    ownerActions +
    '<div class="detail-slide-footer">' +
        '<button class="btn btn-secondary" id="backToSlide1Btn">&larr; Preview</button>' +
        '<button class="btn btn-primary" id="goToSlide3Btn">' + (isFree ? 'Info Lisensi &rarr;' : 'Pesan / Beli Preset &rarr;') + '</button>' +
    '</div>';

    // ===== SLIDE 3: PEMESANAN / ORDER (KHUSUS PRESET BERBAYAR) =====
    let slide3Html = '';
    if (!isFree) {
        const defaultTarget = cleanWa ? 'wa' : 'checkout';
        slide3Html = '<div class="detail-order-summary">' +
            '<div class="item-info">' +
                '<h4>' + escapeHtml(template.judul || 'Preset Video') + '</h4>' +
                '<p>Oleh: <strong>@' + escapeHtml(creatorUsername) + '</strong> &bull; Kode: <span style="font-family:var(--font-mono);">' + escapeHtml(template.kode || '-') + '</span></p>' +
            '</div>' +
            '<div class="detail-order-price">' + formatRupiah(template.harga || 0) + '</div>' +
        '</div>' +
        '<div class="order-form-card">' +
            '<div class="order-form-title">' +
                '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Data Pemesanan &amp; Tujuan</span>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="orderBuyerName">Nama Lengkap / Panggilan Kamu *</label>' +
                '<input type="text" id="orderBuyerName" placeholder="Contoh: Budi Pratama" value="' + escapeHtml(buyerDefaultName) + '" maxlength="50" autocomplete="name" />' +
            '</div>' +
            '<div class="form-group" style="margin-top:0.6rem;">' +
                '<label>Pilih Cara / Saluran Pemesanan:</label>' +
                '<div class="order-channel-grid">' +
                    '<label class="order-channel-chip ' + (defaultTarget === 'wa' ? 'active' : '') + '" id="channelChipWa">' +
                        '<input type="radio" name="orderChannel" value="wa" ' + (defaultTarget === 'wa' ? 'checked' : '') + ' />' +
                        '<span>WhatsApp Kreator</span>' +
                    '</label>' +
                    '<label class="order-channel-chip ' + (defaultTarget === 'checkout' ? 'active' : '') + '" id="channelChipCheckout">' +
                        '<input type="radio" name="orderChannel" value="checkout" ' + (defaultTarget === 'checkout' ? 'checked' : '') + ' />' +
                        '<span>Checkout QRIS / VA</span>' +
                    '</label>' +
                '</div>' +
            '</div>' +
            '<div class="detail-msg-preview-box">' +
                '<div class="detail-msg-preview-header">' +
                    '<span>Format Pesan Otomatis:</span>' +
                    '<button class="copy-msg-btn" id="copyOrderMsgBtn">' + ICON.copy + ' Salin Pesan</button>' +
                '</div>' +
                '<div class="detail-msg-preview-content" id="orderMsgPreviewText"></div>' +
            '</div>' +
            '<div style="margin-top:0.85rem;">' +
                '<button class="btn btn-primary" id="executeOrderBtn" style="width:100%;padding:0.75rem;font-size:0.9rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:0.5rem;box-shadow:0 4px 14px rgba(20,184,166,0.25);">' +
                    (defaultTarget === 'wa' ? (ICON.wa || '') + ' Kirim Pesanan via WhatsApp' : (ICON.coin || '') + ' Beli Sekarang &mdash; ' + formatRupiah(template.harga || 0)) +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="detail-slide-footer">' +
            '<button class="btn btn-secondary" id="backToSlide2Btn">&larr; Kembali ke Deskripsi</button>' +
        '</div>';
    } else {
        slide3Html = '<div class="detail-info-card" style="text-align:center;padding:1.4rem 1rem;background:var(--green-soft);border-color:rgba(16,185,129,0.3);">' +
            '<div style="width:48px;height:48px;border-radius:50%;background:rgba(16,185,129,0.15);color:var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem;">' +
                '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
            '</div>' +
            '<div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:0.3rem;">Preset Ini 100% Gratis</div>' +
            '<p style="font-size:0.8rem;color:var(--text-secondary);max-width:340px;margin:0 auto 0.9rem;">Kamu dapat mengunduh dan memakai preset ini secara bebas. Jangan lupa tinggalkan tanda suka (Like) atau bagikan ke teman-temanmu!</p>' +
            '<div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;">' +
                '<button class="btn btn-primary" id="slide3FreeLikeBtn" style="font-size:0.8rem;">' + ICON.heart + ' Sukai Preset Ini</button>' +
                '<button class="btn btn-secondary" id="slide3FreeShareBtn" style="font-size:0.8rem;">' + ICON.share + ' Bagikan Preset</button>' +
            '</div>' +
        '</div>' +
        '<div class="detail-slide-footer">' +
            '<button class="btn btn-secondary" id="backToSlide2Btn">&larr; Kembali ke Deskripsi</button>' +
            '<button class="btn btn-primary" id="slide3BackToDownloadBtn">Unduh File di Slide 2 &rarr;</button>' +
        '</div>';
    }

    // Assemble the complete 3-Slide Modal HTML
    content.innerHTML = '<div class="detail-modal-header">' +
        '<div class="title-wrap">' +
            '<h2>' + escapeHtml(template.judul || 'Detail Preset') + '</h2>' +
            '<div class="sub-meta">Oleh <strong>@' + escapeHtml(creatorUsername) + '</strong> &bull; ' + (isFree ? 'Gratis' : formatRupiah(template.harga || 0)) + '</div>' +
        '</div>' +
        '<button class="modal-close" id="closeDetailModal" title="Tutup"><svg viewBox="0 0 24 24" width="17" height="17"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>' +
    '<div class="detail-slide-tabs">' +
        '<button class="detail-tab-btn active" data-slide="0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>1. Preview</span></button>' +
        '<button class="detail-tab-btn" data-slide="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>2. Deskripsi</span></button>' +
        '<button class="detail-tab-btn" data-slide="2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span>3. ' + (isFree ? 'Lisensi' : 'Pesan') + '</span>' + (!isFree ? '<span class="tab-badge">' + formatRupiah(template.harga || 0) + '</span>' : '') + '</button>' +
    '</div>' +
    '<div class="detail-viewport">' +
        '<div class="detail-slides-track" id="detailSlidesTrack">' +
            '<div class="detail-slide-pane" id="detailSlide1">' + slide1Html + '</div>' +
            '<div class="detail-slide-pane" id="detailSlide2">' + slide2Html + '</div>' +
            '<div class="detail-slide-pane" id="detailSlide3">' + slide3Html + '</div>' +
        '</div>' +
    '</div>';

    const detailModal = document.getElementById('detailModal');
    if (detailModal) detailModal.classList.add('active');

    // ===== SLIDE CONTROLLER =====
    let currentDetailSlide = 0;
    function setDetailSlide(idx) {
        currentDetailSlide = Math.max(0, Math.min(2, idx));
        const track = document.getElementById('detailSlidesTrack');
        if (track) {
            track.style.transform = 'translateX(-' + (currentDetailSlide * 33.33333) + '%)';
        }
        document.querySelectorAll('.detail-tab-btn').forEach(function(btn) {
            btn.classList.toggle('active', parseInt(btn.dataset.slide) === currentDetailSlide);
        });
        const activePane = document.getElementById('detailSlide' + (currentDetailSlide + 1));
        if (activePane) activePane.scrollTop = 0;
    }

    document.querySelectorAll('.detail-tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const slideIdx = parseInt(this.dataset.slide) || 0;
            setDetailSlide(slideIdx);
        });
    });

    // Navigation buttons
    const btnTo2 = document.getElementById('goToSlide2Btn');
    if (btnTo2) btnTo2.addEventListener('click', function() { setDetailSlide(1); });

    const btnBack1 = document.getElementById('backToSlide1Btn');
    if (btnBack1) btnBack1.addEventListener('click', function() { setDetailSlide(0); });

    const btnTo3 = document.getElementById('goToSlide3Btn');
    if (btnTo3) btnTo3.addEventListener('click', function() { setDetailSlide(2); });

    const btnBack2 = document.getElementById('backToSlide2Btn');
    if (btnBack2) btnBack2.addEventListener('click', function() { setDetailSlide(1); });

    const s2OrderBtn = document.getElementById('slide2ToOrderBtn');
    if (s2OrderBtn) s2OrderBtn.addEventListener('click', function() { setDetailSlide(2); });

    const s3BackToDl = document.getElementById('slide3BackToDownloadBtn');
    if (s3BackToDl) s3BackToDl.addEventListener('click', function() { setDetailSlide(1); });

    // Close Button
    const closeBtn = document.getElementById('closeDetailModal');
    if (closeBtn) closeBtn.addEventListener('click', closeDetail);

    // Copy Preset Code
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const code = this.dataset.kode;
            if (code) copyToClipboard(code);
        });
    }

    // Creator Profile Click
    const creatorCard = document.getElementById('detailCreatorCard');
    if (creatorCard) {
        creatorCard.addEventListener('click', function() {
            closeDetail();
            state.currentCreator = this.dataset.creator;
            state.currentView = 'creators';
            updateNavActiveState();
            if (callbacks && callbacks.render) callbacks.render();
            if (callbacks && callbacks.updateUrl) callbacks.updateUrl();
        });
    }

    // Share Button
    const shareBtn = document.getElementById('shareDetailBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const username = template.creator || 'anonim';
            const kode = template.kode || '';
            const shareUrl = window.location.origin + window.location.pathname + '#/' + encodeURIComponent(username) + '/' + kode;
            if (navigator.share) {
                navigator.share({
                    title: template.judul || 'Preset Video',
                    text: 'Cek preset ' + (template.judul || '') + ' oleh @' + username + ' di Preset Library!',
                    url: shareUrl
                }).catch(function() {});
            } else {
                copyToClipboard(shareUrl);
            }
        });
    }

    // Slide 3 Dynamic Message
    function getGeneratedOrderMessage() {
        const nameInput = document.getElementById('orderBuyerName');
        const buyerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : '(nama)';
        const judul = template.judul || 'Preset Video';
        const harga = formatRupiah(template.harga || 0);
        const kode = template.kode ? ' (Kode: ' + template.kode + ')' : '';
        
        // Specific user format requirement:
        // "hai, aku (nama) mau pesan (judul preset) seharga (harganya)"
        return 'hai, aku ' + buyerName + ' mau pesan ' + judul + ' seharga ' + harga + kode;
    }

    function refreshOrderMessagePreview() {
        const previewEl = document.getElementById('orderMsgPreviewText');
        if (previewEl) {
            previewEl.textContent = getGeneratedOrderMessage();
        }
    }

    const buyerNameInput = document.getElementById('orderBuyerName');
    if (buyerNameInput) {
        buyerNameInput.addEventListener('input', refreshOrderMessagePreview);
    }
    refreshOrderMessagePreview();

    // Channel Radios
    const channelRadios = document.querySelectorAll('input[name="orderChannel"]');
    channelRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            const selectedVal = this.value;
            document.querySelectorAll('.order-channel-chip').forEach(function(chip) {
                const chipRadio = chip.querySelector('input');
                chip.classList.toggle('active', chipRadio && chipRadio.checked);
            });
            const executeBtn = document.getElementById('executeOrderBtn');
            if (executeBtn) {
                if (selectedVal === 'wa') {
                    executeBtn.innerHTML = (ICON.wa || '') + ' Kirim Pesanan via WhatsApp';
                } else {
                    executeBtn.innerHTML = (ICON.coin || '') + ' Beli Sekarang &mdash; ' + formatRupiah(template.harga || 0);
                }
            }
        });
    });

    // Copy Message Button
    const copyMsgBtn = document.getElementById('copyOrderMsgBtn');
    if (copyMsgBtn) {
        copyMsgBtn.addEventListener('click', function() {
            const msg = getGeneratedOrderMessage();
            copyToClipboard(msg);
        });
    }

    // Execute Order Button
    const executeBtn = document.getElementById('executeOrderBtn');
    if (executeBtn) {
        executeBtn.addEventListener('click', function() {
            const selectedRadio = document.querySelector('input[name="orderChannel"]:checked');
            const channel = selectedRadio ? selectedRadio.value : 'wa';
            const nameInput = document.getElementById('orderBuyerName');
            const rawName = nameInput ? nameInput.value.trim() : '';

            if (channel === 'wa') {
                if (!rawName) {
                    showToast('Silakan masukkan nama kamu terlebih dahulu', 'warning');
                    if (nameInput) nameInput.focus();
                    return;
                }
                const msg = getGeneratedOrderMessage();
                const targetWa = cleanWa || '6281234567890';
                const waUrl = 'https://wa.me/' + targetWa + '?text=' + encodeURIComponent(msg);
                window.open(waUrl, '_blank');
            } else {
                if (!state.currentUser) {
                    showToast('Yuk masuk atau daftar akun dulu untuk membeli preset!', 'info');
                    if (callbacks && callbacks.promptLogin) {
                        callbacks.promptLogin('Silakan masuk atau daftar akun gratis untuk membeli preset ini');
                    }
                    return;
                }
                closeDetail();
                if (callbacks && callbacks.openCheckoutModal) {
                    callbacks.openCheckoutModal(template);
                }
            }
        });
    }

    // Free Slide 3 Likes / Share
    const freeLikeBtn = document.getElementById('slide3FreeLikeBtn');
    if (freeLikeBtn) {
        freeLikeBtn.addEventListener('click', function() {
            const likeBtn = document.getElementById('likeBtn');
            if (likeBtn) likeBtn.click();
        });
    }
    const freeShareBtn = document.getElementById('slide3FreeShareBtn');
    if (freeShareBtn) {
        freeShareBtn.addEventListener('click', function() {
            const shareBtn = document.getElementById('shareDetailBtn');
            if (shareBtn) shareBtn.click();
        });
    }

    // Like Button
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (!id || !db) return;
            if (!state.currentUser) {
                showToast('Yuk masuk atau daftar akun dulu untuk menyukai preset!', 'info');
                if (callbacks && callbacks.promptLogin) {
                    callbacks.promptLogin('Silakan masuk atau daftar akun gratis untuk menyukai preset ini');
                }
                return;
            }
            const countEl = document.getElementById('detailLikeCount');
            const currentCount = parseInt(countEl.textContent.replace(/\D/g, '')) || 0;
            const isCurrentlyLiked = this.classList.contains('liked');

            if (isCurrentlyLiked) {
                this.classList.remove('liked');
                countEl.textContent = formatNumber(Math.max(0, currentCount - 1));
                state.likedTemplateIds.delete(id);
                const tpl = state.allTemplates.find(function(t) { return t.id === id; });
                if (tpl) tpl.likes = Math.max(0, (tpl.likes || 0) - 1);
            } else {
                this.classList.add('liked');
                countEl.textContent = formatNumber(currentCount + 1);
                state.likedTemplateIds.add(id);
                const tpl2 = state.allTemplates.find(function(t) { return t.id === id; });
                if (tpl2) tpl2.likes = (tpl2.likes || 0) + 1;
            }

            toggleLike(id, state.currentUser.uid)
                .then(function(result) {
                    const finalLikes = result.newLikes;
                    countEl.textContent = formatNumber(finalLikes);
                    if (result.action === 'liked') {
                        likeBtn.classList.add('liked');
                        state.likedTemplateIds.add(id);
                    } else {
                        likeBtn.classList.remove('liked');
                        state.likedTemplateIds.delete(id);
                    }
                    const tpl = state.allTemplates.find(function(t) { return t.id === id; });
                    if (tpl) tpl.likes = finalLikes;
                })
                .catch(function(err) {
                    showToast('Gagal: ' + err.message, 'error');
                    const tpl = state.allTemplates.find(function(t) { return t.id === id; });
                    if (tpl) {
                        countEl.textContent = formatNumber(tpl.likes || 0);
                        if (state.likedTemplateIds.has(id)) {
                            likeBtn.classList.add('liked');
                        } else {
                            likeBtn.classList.remove('liked');
                        }
                    }
                });
        });
    }

    // Owner Delete & Edit
    const deleteBtn = document.getElementById('deletePresetBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const id = this.dataset.id;
            if (!id || !db) return;
            if (!confirm('Yakin ingin menghapus preset ini? Tindakan ini tidak bisa dibatalkan.')) return;
            deleteTemplate(id)
                .then(function() {
                    showToast('Preset berhasil dihapus', 'success');
                    closeDetail();
                    const idx = state.allTemplates.findIndex(function(t) { return t.id === id; });
                    if (idx !== -1) state.allTemplates.splice(idx, 1);
                    state.likedTemplateIds.delete(id);
                    if (callbacks && callbacks.render) callbacks.render();
                    if (callbacks && callbacks.updateUrl) callbacks.updateUrl();
                })
                .catch(function(err) { showToast('Gagal hapus: ' + err.message, 'error'); });
        });
    }

    const editBtn = document.getElementById('editPresetBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const id = this.dataset.id;
            const tpl = state.allTemplates.find(function(t) { return t.id === id; });
            if (!tpl) return;
            closeDetail();
            if (callbacks && callbacks.openEditTemplateModal) {
                callbacks.openEditTemplateModal(tpl);
            }
        });
    }

    // Increment uses on download link click
    content.querySelectorAll('.detail-links a').forEach(function(link) {
        link.addEventListener('click', function() {
            const templateId = this.dataset.templateId;
            if (templateId) {
                incrementField(templateId, 'uses', 1).catch(function() {});
                const usesEl = document.getElementById('detailUsesCount');
                if (usesEl) {
                    const curr = parseInt(usesEl.textContent.replace(/\D/g, '')) || 0;
                    usesEl.textContent = formatNumber(curr + 1);
                }
                const tpl = state.allTemplates.find(function(t) { return t.id === templateId; });
                if (tpl) tpl.uses = (tpl.uses || 0) + 1;
            }
        });
    });
}

// Global hook for software chips checkbox changes
if (typeof document !== 'undefined') {
    document.addEventListener('change', function(e) {
        if (e.target && e.target.matches && e.target.matches('.software-chip input[type="checkbox"]')) {
            const name = e.target.getAttribute('name') || '';
            const prefix = name.replace('SoftwareOption', '');
            if (prefix) {
                toggleSoftwareCustomInput(prefix);
            }
        }
    });
}
