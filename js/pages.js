/**
 * Preset Library - Pages & View Renderers Module
 * Handles all view logic, page rendering, marketplace, dashboards, and profile templates.
 */

import { state } from './state.js';
import { 
    ICON, 
    AVATAR_PALETTE, 
    escapeHtml, 
    formatNumber, 
    formatRupiah, 
    formatDate, 
    ratioCss, 
    getYoutubeId, 
    embedYoutube, 
    thumbYoutube, 
    showToast,
    copyToClipboard
} from './utils.js';
import { 
    db, 
    firebase, 
    addCreator, 
    updateCreator, 
    addTemplate, 
    updateTemplate, 
    deleteTemplate, 
    incrementField, 
    toggleLike, 
    addOrder, 
    addNotification, 
    addWithdrawal,
    subscribeCreators
} from './firebase.js';
import { 
    renderAvatarHtml, 
    renderAvatarPickerHtml, 
    bindAvatarPickerEvents, 
    renderSoftwareCheckboxesHtml, 
    getSelectedSoftwareValues,
    openDetail,
    closeDetail,
    isCreatorVerified,
    renderVerifiedBadgeHtml,
    renderSkeletonCard,
    renderSkeletonGrid
} from './components.js';

// DOM container reference
const getCardGrid = () => document.getElementById('cardGrid');

// ===== CARD RENDERING =====
export function renderCard(t) {
    const ytId = t.linkYoutube ? getYoutubeId(t.linkYoutube) : null;
    const isFree = t.license === 'free';
    const priceLabel = isFree ? 'Gratis' : formatRupiah(t.harga || 0);
    const ratio = t.aspectRatio || '16:9';
    const creatorParam = t.creatorUid ? { uid: t.creatorUid, name: t.creator } : t.creator;
    const creatorAvatar = renderAvatarHtml(creatorParam, 'card-creator-avatar', 16);
    const verifiedBadge = renderVerifiedBadgeHtml(creatorParam, 14);
    
    return `<article class="card" data-id="${t.id}" data-creator="${escapeHtml(t.creator || '')}" data-kode="${escapeHtml(t.kode || '')}" tabindex="0" role="button" aria-label="${escapeHtml(t.judul || '')}">
        <div class="thumb" style="aspect-ratio:${ratioCss(ratio)}">
            <div class="thumb-fallback">${ICON.noVideo}</div>
            ${ytId ? `<img class="thumb-img" src="${thumbYoutube(ytId)}" alt="" loading="lazy" onerror="this.remove()"><span class="play-badge">${ICON.play}</span>` : ''}
            <span class="ratio-tag">${ratio}</span>
            ${t.kode ? `<button class="card-quick-code" data-kode="${escapeHtml(t.kode)}" title="Salin Kode Preset">${ICON.copy} ${escapeHtml(t.kode)}</button>` : ''}
        </div>
        <div class="card-info">
            <h3 class="card-title">${escapeHtml(t.judul || 'Tanpa judul')}</h3>
            <div class="card-creator">
                ${creatorAvatar}
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;">
                    ${escapeHtml(t.creator || 'Anonim')}
                    ${verifiedBadge}
                </span>
            </div>
            <div class="card-foot">
                <span class="price ${isFree ? 'free' : 'paid'}">${priceLabel}</span>
                <div class="card-stats">
                    <span class="likes" title="Suka">${ICON.heart}${formatNumber(t.likes || 0)}</span>
                    <span class="uses" title="Unduhan">${ICON.download}${formatNumber(t.uses || 0)}</span>
                </div>
            </div>
        </div>
    </article>`;
}

// ===== EMPTY STATES =====
export function emptyStateHtml(kind) {
    if (kind === 'creators') {
        return `<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">
            ${ICON.users || ''}
            <div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada kreator terdaftar</div>
            <div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Jadilah kreator pertama yang mempublikasikan preset di komunitas.</div>
        </div>`;
    }
    if (kind === 'creator-profile') {
        return `<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">
            ${ICON.noVideo}
            <div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada karya</div>
            <div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Kreator ini belum membagikan template apapun.</div>
        </div>`;
    }
    if (kind === 'home') {
        return `<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">
            ${ICON.noVideo}
            <div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Belum ada preset yang diunggah</div>
            <div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Preset dari database Firebase akan otomatis tampil di sini.</div>
        </div>`;
    }
    return `<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">
        ${ICON.search}
        <div class="title" style="font-size:1.15rem;font-weight:700;margin-top:0.5rem;color:var(--text);">Tidak menemukan hasil yang cocok</div>
        <div class="sub" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;">Coba kata kunci lain atau cari nama kreator.</div>
    </div>`;
}

// ===== FILTER LOGIC =====
export function getFiltered() {
    let result = (state.allTemplates || []).slice();
    const sInput = document.getElementById('searchInput');
    const mInput = document.getElementById('searchInputMobile');
    const q = (state.cariSearchQuery || (sInput ? sInput.value : '') || (mInput ? mInput.value : '') || '').toLowerCase().trim();
    
    if (q) {
        result = result.filter(t => {
            return (t.judul || '').toLowerCase().indexOf(q) !== -1 ||
                (t.kode || '').toLowerCase().indexOf(q) !== -1 ||
                (t.kategori || '').toLowerCase().indexOf(q) !== -1 ||
                (t.creator || '').toLowerCase().indexOf(q) !== -1 ||
                (t.deskripsi || '').toLowerCase().indexOf(q) !== -1;
        });
    }
    
    if (state.activeFilter === 'preset') result = result.filter(t => t.kategori === 'Preset');
    else if (state.activeFilter === 'assets') result = result.filter(t => t.kategori === 'Assets');
    else if (state.activeFilter === 'lainnya') result = result.filter(t => t.kategori !== 'Preset' && t.kategori !== 'Assets');
    else if (state.activeFilter === 'free') result = result.filter(t => t.license === 'free');
    else if (state.activeFilter === 'paid') result = result.filter(t => t.license === 'paid');
    
    if (state.activeRatio) result = result.filter(t => t.aspectRatio === state.activeRatio);
    
    if (state.currentView === 'creators' && state.currentCreator) {
        result = result.filter(t => (t.creator || '').toLowerCase() === state.currentCreator.toLowerCase());
    }

    if (state.activeSort === 'populer') {
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (state.activeSort === 'terbanyak') {
        result.sort((a, b) => (b.uses || 0) - (a.uses || 0));
    } else {
        result.sort((a, b) => {
            const timeA = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
        });
    }
    return result;
}

// ===== CONTEXT LINE =====
export function updateContextLine() {
    const contextLine = document.getElementById('contextLine');
    if (!contextLine) return;
    const total = state.allTemplates.length;
    const creators = state.allCreators.length;
    
    if (state.currentView === 'creators' && !state.currentCreator) {
        contextLine.innerHTML = `<strong>${creators}</strong> kreator sudah bergabung di Preset Library.`;
        return;
    }
    if (state.currentView === 'creators' && state.currentCreator) {
        contextLine.innerHTML = `Karya dari <strong>${escapeHtml(state.currentCreator)}</strong>`;
        return;
    }
    contextLine.innerHTML = `<strong>${total}</strong> template dari <strong>${creators}</strong> kreator Indonesia.`;
}

// ===== CARI / EXPLORE VIEW =====
export function renderCariView() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;
    let container = document.getElementById('cariResultsContainer');
    if (!container) {
        cardGrid.innerHTML = '<div id="cariResultsContainer"></div>';
    }
    updateCariResults();
}

export function updateCariResults() {
    const container = document.getElementById('cariResultsContainer');
    if (!container) return;

    if (!state.dataLoaded) {
        container.innerHTML = renderSkeletonGrid(8);
        return;
    }

    const query = (state.cariSearchQuery || '').toLowerCase().trim();

    if (query) {
        const templates = (state.allTemplates || []).filter(t => {
            return (t.judul || '').toLowerCase().indexOf(query) !== -1 ||
                (t.kode || '').toLowerCase().indexOf(query) !== -1 ||
                (t.kategori || '').toLowerCase().indexOf(query) !== -1 ||
                (t.creator || '').toLowerCase().indexOf(query) !== -1 ||
                (t.deskripsi || '').toLowerCase().indexOf(query) !== -1;
        });

        if (templates.length === 0) {
            container.innerHTML = emptyStateHtml('search');
        } else {
            container.innerHTML = `<div class="explore-cat-section">
                <div class="section-header" style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                    <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                        ${ICON.search} Hasil Pencarian "${escapeHtml(query)}"
                    </h3>
                    <span class="sub-text" style="font-size: 0.78rem; color: var(--text-muted);">${templates.length} template ditemukan</span>
                </div>
                <div class="grid">${templates.map(renderCard).join('')}</div>
            </div>`;
        }
        return;
    }

    function buildCatSection(title, iconSymbol, subText, list) {
        let cardsHtml = '';
        const limitedList = (list || []).slice(0, 5);
        if (!limitedList || limitedList.length === 0) {
            cardsHtml = '<div class="empty-section-notice" style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.82rem; background: var(--bg-alt); border-radius: var(--radius); border: 1px dashed var(--border-soft);">Belum ada preset untuk kategori ini</div>';
        } else {
            cardsHtml = `<div class="grid">${limitedList.map(renderCard).join('')}</div>`;
        }

        return `<section class="explore-cat-section" style="margin-bottom: 2.2rem;">
            <div class="section-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                <div>
                    <h3 style="font-family: var(--font-display); font-size: 1.08rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 0.4rem; margin: 0;">
                        <span>${iconSymbol}</span> <span>${escapeHtml(title)}</span>
                    </h3>
                    <span class="sub-text" style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem; display: block;">${escapeHtml(subText)}</span>
                </div>
            </div>
            ${cardsHtml}
        </section>`;
    }

    const listTerbaru = (state.allTemplates || []).slice().sort((a, b) => {
        const timeA = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
    });

    const listBanyakDipakai = (state.allTemplates || []).slice().sort((a, b) => (b.uses || 0) - (a.uses || 0));
    const listBanyakDisukai = (state.allTemplates || []).slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const listRatio916 = (state.allTemplates || []).filter(t => (t.aspectRatio || '16:9') === '9:16');
    const listRatio11 = (state.allTemplates || []).filter(t => (t.aspectRatio || '16:9') === '1:1');
    const listRatio169 = (state.allTemplates || []).filter(t => (t.aspectRatio || '16:9') === '16:9');
    const listRatio45 = (state.allTemplates || []).filter(t => (t.aspectRatio || '16:9') === '4:5');

    let html = '';
    html += buildCatSection('Paling Terbaru', ICON.zap, 'Preset & template baru yang diunggah', listTerbaru);
    html += buildCatSection('Paling Banyak Dipakai', ICON.download, 'Preset paling sering diunduh & digunakan', listBanyakDipakai);
    html += buildCatSection('Paling Banyak Disukai', ICON.heart, 'Preset dengan jumlah suka terbanyak', listBanyakDisukai);
    html += buildCatSection('Ratio 9:16', ICON.mobile, 'Format Vertikal (TikTok / Reels / Shorts)', listRatio916);
    html += buildCatSection('Ratio 1:1', ICON.square, 'Format Persegi (Post Instagram)', listRatio11);
    html += buildCatSection('Ratio 16:9', ICON.monitor, 'Format Lanskap (YouTube & Screen)', listRatio169);
    html += buildCatSection('Ratio 4:5', ICON.image, 'Format Potret Feed (Instagram Portrait)', listRatio45);

    container.innerHTML = html;
}

// ===== CREATOR DIRECTORY & PROFILE =====
export function renderCreatorDirectory() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;
    const creators = state.allCreators.slice();
    
    if (state.isCreator && (state.currentUserCreatorId || state.currentUserCreator)) {
        const myUid = state.currentUserCreatorId || (state.currentUserCreator && state.currentUserCreator.uid);
        const myName = state.currentUserCreator && state.currentUserCreator.name;
        const myIndex = creators.findIndex(c => (myUid && (c.id === myUid || c.uid === myUid)) || (myName && (c.name || '').toLowerCase() === (myName || '').toLowerCase()));
        if (myIndex > 0) {
            const myCard = creators.splice(myIndex, 1)[0];
            creators.unshift(myCard);
        }
    }

    let html = '';

    if (!state.isCreator) {
        html += `<div class="creator-register-banner">
            <div class="creator-register-banner-left">
                <div class="creator-register-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                </div>
                <div class="creator-register-info">
                    <div class="creator-register-badge">${ICON.sparkle || ''} Program Kreator Preset</div>
                    <h2 class="creator-register-title">Bergabung Sebagai Kreator Preset</h2>
                    <p class="creator-register-desc">Bagikan preset video kamu, bangun audiens editor, dan mulai hasilkan pendapatan dari setiap karya.</p>
                    <div class="creator-register-pills">
                        <span class="creator-register-pill">${ICON.upload || ''} Upload Preset Video</span>
                        <span class="creator-register-pill">${ICON.coin || ''} Monetisasi Karya</span>
                        <span class="creator-register-pill">${ICON.badgeCheck || ''} Profil Kreator & Portofolio</span>
                    </div>
                </div>
            </div>
            <div class="creator-register-btn-wrap">
                <button type="button" class="btn-banner-register" id="bannerRegisterCreatorBtn">
                    <span>Daftar Jadi Kreator</span>
                    ${ICON.arrowRight || ''}
                </button>
            </div>
        </div>`;
    } else {
        const myCount = (state.allTemplates || []).filter(t => {
            return (state.currentUserCreator && (t.creator || '').toLowerCase() === (state.currentUserCreator.name || '').toLowerCase()) || (state.currentUser && t.creatorUid === state.currentUser.uid);
        }).length;

        html += `<div class="creator-active-banner">
            <div class="creator-active-info">
                <div class="creator-active-badge">${ICON.badgeCheck || ICON.crown || ''}</div>
                <div>
                    <div style="font-weight:700;font-size:0.92rem;color:var(--text);display:flex;align-items:center;gap:0.4rem;">
                        Kamu adalah Kreator Terverifikasi
                        <span style="font-size:0.68rem;background:var(--accent);color:#fff;padding:0.1rem 0.45rem;border-radius:10px;font-weight:600;">Aktif</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.1rem;">
                        ${myCount} template telah kamu publikasikan di katalog preset
                    </div>
                </div>
            </div>
            <div class="creator-active-actions">
                <button class="btn btn-secondary btn-sm" id="creatorActiveDashboardBtn" style="font-size:0.78rem;padding:0.35rem 0.85rem;">${ICON.chart || ''} Dashboard</button>
                <button class="btn btn-primary btn-sm" id="creatorActiveUploadBtn" style="font-size:0.78rem;padding:0.35rem 0.85rem;">${ICON.plusBox || ''} Upload Preset</button>
            </div>
        </div>`;
    }

    html += `<div class="creator-directory-top">
        <span class="title">${ICON.users} Semua Kreator (${creators.length})</span>
    </div>`;

    if (creators.length === 0 && state.isCreator) {
        html += emptyStateHtml('creators');
        cardGrid.innerHTML = html;
        return;
    }
    html += '<div class="creator-grid">';

    if (!state.isCreator) {
        html += `<div class="creator-card register-creator-card" id="registerCreatorCardBtn">
            <div class="register-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
            </div>
            <div class="name">Daftar Kreator</div>
            <div class="sub">Mulai bagikan karya</div>
            <div class="count">
                <span>+ Daftar</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
        </div>`;
    }

    creators.forEach(c => {
        const displayName = c.displayName || c.name || '';
        const count = (state.allTemplates || []).filter(t => (t.creator || '').toLowerCase() === (c.name || '').toLowerCase()).length;
        const isMe = state.isCreator && state.currentUserCreator && ((state.currentUserCreator.name && (c.name || '').toLowerCase() === state.currentUserCreator.name.toLowerCase()) || (state.currentUserCreatorId && (c.id === state.currentUserCreatorId || c.uid === state.currentUserCreatorId)));
        const verifiedBadge = renderVerifiedBadgeHtml(c, 15);
        html += `<div class="creator-card ${isMe ? 'my-creator-card' : ''}" data-creator="${escapeHtml(c.name || '')}" ${isMe ? 'style="border:1px solid var(--accent);background:rgba(var(--accent-rgb, 99, 102, 241), 0.03);"' : ''}>
            ${renderAvatarHtml(c, 'creator-card-avatar', 44)}
            <div class="name" style="display:inline-flex;align-items:center;justify-content:center;gap:3px;">
                ${escapeHtml(displayName)}
                ${verifiedBadge}
                ${isMe ? ' <span style="font-size:0.7rem;background:var(--accent);color:#fff;padding:0.1rem 0.4rem;border-radius:10px;margin-left:0.3rem;">Kamu</span>' : ''}
            </div>
            <div class="sub">${escapeHtml(c.software || '')}</div>
            <div class="count">${count} template</div>
        </div>`;
    });
    html += '</div>';
    cardGrid.innerHTML = html;

    const bannerBtn = document.getElementById('bannerRegisterCreatorBtn');
    if (bannerBtn) {
        bannerBtn.addEventListener('click', () => {
            if (!state.currentUser) {
                showToast('Silakan masuk terlebih dahulu untuk mendaftar sebagai kreator', 'info');
                if (window.openLoginModal) window.openLoginModal();
                return;
            }
            if (window.goToView) window.goToView('profile');
        });
    }

    const activeDashBtn = document.getElementById('creatorActiveDashboardBtn');
    if (activeDashBtn) {
        activeDashBtn.addEventListener('click', () => {
            if (window.goToView) window.goToView('dashboard');
        });
    }

    const activeUploadBtn = document.getElementById('creatorActiveUploadBtn');
    if (activeUploadBtn) {
        activeUploadBtn.addEventListener('click', () => {
            if (window.openUploadFlow) window.openUploadFlow();
        });
    }

    cardGrid.querySelectorAll('.creator-card').forEach(el => {
        if (el.id === 'registerCreatorCardBtn') {
            el.addEventListener('click', () => {
                if (!state.currentUser) {
                    showToast('Silakan masuk terlebih dahulu untuk mendaftar sebagai kreator', 'info');
                    if (window.openLoginModal) window.openLoginModal();
                    return;
                }
                if (window.goToView) window.goToView('profile');
            });
            return;
        }
        el.addEventListener('click', function() {
            state.currentCreator = this.dataset.creator;
            state.currentView = 'creators';
            if (window.updateNavActiveState) window.updateNavActiveState();
            render();
            if (window.updateUrl) window.updateUrl();
        });
    });
}

export function buildProfileHeader(name) {
    const c = state.allCreators.find(cr => (cr.name || '').toLowerCase() === name.toLowerCase());
    const count = (state.allTemplates || []).filter(t => (t.creator || '').toLowerCase() === name.toLowerCase()).length;
    const displayName = c && c.displayName ? escapeHtml(c.displayName) : escapeHtml(name);
    const bio = c && c.bio ? escapeHtml(c.bio) : 'Belum menambahkan bio.';
    const software = c && c.software ? escapeHtml(c.software) : '';
    const portfolio = c && c.portfolio ? c.portfolio : '';
    const wa = c && c.wa ? c.wa : '';
    const email = c && c.email ? c.email : '';
    const isOwnProfile = state.currentUser && c && c.uid === state.currentUser.uid;
    const isOwnerViewer = state.isAdmin || (state.currentUser && (state.currentUser.email === 'namskyfr@gmail.com' || state.currentUser.email === 'owner@presetlibrary.com' || state.currentUser.email === 'admin@presetlibrary.com'));
    const verifiedStatus = isCreatorVerified(c || name);
    const verifiedBadge = renderVerifiedBadgeHtml(c || name, 20);

    let ownerVerifyBtnHtml = '';
    if (isOwnerViewer) {
        if (verifiedStatus) {
            ownerVerifyBtnHtml = `<button type="button" class="btn-owner-badge-action is-verified" id="ownerToggleVerifyBtn" 
                data-id="${c ? (c.id || c.uid || '') : ''}" 
                data-uid="${c ? (c.uid || '') : ''}" 
                data-username="${escapeHtml(c ? c.name : name)}" 
                data-action="revoke" 
                title="Owner: Klik untuk menghapus centang biru">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>Hapus Centang</span>
            </button>`;
        } else {
            ownerVerifyBtnHtml = `<button type="button" class="btn-owner-badge-action not-verified" id="ownerToggleVerifyBtn" 
                data-id="${c ? (c.id || c.uid || '') : ''}" 
                data-uid="${c ? (c.uid || '') : ''}" 
                data-username="${escapeHtml(c ? c.name : name)}" 
                data-action="grant" 
                title="Owner: Klik untuk memberikan centang biru ke kreator ini">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2l2.4 2.8 3.7-.4 1.2 3.5 3.3 1.7-1 3.6 2.1 3.1-2.9 2.3-.2 3.7-3.7.8-1.9 3.2L12 21l-3 1.4-1.9-3.2-3.7-.8-.2-3.7-2.9-2.3 2.1-3.1-1-3.6 3.3-1.7 1.2-3.5 3.7.4L12 2z"/></svg>
                <span>+ Beri Centang</span>
            </button>`;
        }
    }

    return `<button class="back-link" id="backToCreators">${ICON.arrowLeft} Semua kreator</button>
    <div class="profile-header">
        ${renderAvatarHtml(c || name, 'profile-avatar', 64)}
        <div class="info">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <h1 style="margin:0;display:inline-flex;align-items:center;gap:4px;">
                    ${displayName}
                    ${verifiedBadge}
                </h1>
                ${ownerVerifyBtnHtml}
                ${isOwnProfile ? `<button class="edit-profile-icon-btn" id="editProfileBtn" title="Edit Profil" aria-label="Edit Profil">${ICON.edit}</button>` : ''}
            </div>
            ${software ? `<div class="role">${software}</div>` : ''}
            <div class="bio">${bio}</div>
            <div class="stats"><span><strong>${count}</strong> template</span></div>
            ${portfolio ? `<a class="portfolio-link" href="${portfolio}" target="_blank" rel="noopener">${ICON.ext} Lihat portfolio</a>` : ''}
            ${wa ? `<div class="contact-row" style="margin-top:0.3rem;">${ICON.wa} <a href="https://wa.me/${wa}" target="_blank" rel="noopener">${wa}</a></div>` : ''}
            ${email ? `<div class="contact-row">${ICON.mail} <a href="mailto:${email}">${email}</a></div>` : ''}
        </div>
    </div>`;
}

export function bindProfileHeaderEvents() {
    const back = document.getElementById('backToCreators');
    if (back) {
        back.addEventListener('click', () => {
            state.currentCreator = null;
            render();
            if (window.updateUrl) window.updateUrl();
        });
    }
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
    }
    const ownerBtn = document.getElementById('ownerToggleVerifyBtn');
    if (ownerBtn) {
        ownerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.dataset.action;
            const docId = this.dataset.id;
            const uid = this.dataset.uid;
            const username = this.dataset.username;
            const willVerify = action === 'grant';

            this.disabled = true;
            this.innerHTML = `<span>${willVerify ? 'Memverifikasi...' : 'Mencabut...'}</span>`;

            const updateData = {
                isVerified: willVerify,
                verified: willVerify,
                verifiedAt: willVerify ? (window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : new Date()) : null
            };

            const targetKey = docId || uid || username;
            updateCreator(targetKey, updateData)
                .then(() => {
                    const target = state.allCreators.find(cr => (cr.id && cr.id === docId) || (cr.uid && cr.uid === uid) || (cr.name || '').toLowerCase() === (username || '').toLowerCase());
                    if (target) {
                        target.isVerified = willVerify;
                        target.verified = willVerify;
                    }
                    if (state.currentUserCreator && ((state.currentUserCreator.id && state.currentUserCreator.id === docId) || (state.currentUserCreator.uid && state.currentUserCreator.uid === uid) || (state.currentUserCreator.name || '').toLowerCase() === (username || '').toLowerCase())) {
                        state.currentUserCreator.isVerified = willVerify;
                        state.currentUserCreator.verified = willVerify;
                    }

                    if (willVerify) {
                        if (uid || (target && target.uid)) {
                            addNotification({
                                recipientUid: uid || target.uid,
                                title: 'Lencana Centang Biru Resmi!',
                                message: 'Selamat! Akun kreator Anda telah resmi diverifikasi dengan Lencana Centang Biru oleh Owner Preset Library.',
                                type: 'verified',
                                read: false,
                                createdAt: window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : new Date()
                            }).catch(() => {});
                        }
                        showToast(`Centang biru berhasil diberikan ke @${username}!`, 'success');
                    } else {
                        showToast(`Centang biru @${username} berhasil dihapus.`, 'info');
                    }

                    render();
                })
                .catch(err => {
                    showToast('Gagal mengubah verifikasi: ' + err.message, 'error');
                    this.disabled = false;
                    render();
                });
        });
    }
}

// ===== PROFILE & REGISTRATION PAGE =====
export function renderProfilePage() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;

    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) filterBar.style.display = 'none';

    if (!state.currentUser) {
        cardGrid.innerHTML = `<div class="empty-state" style="padding: 3rem 1rem;">
            ${ICON.user}
            <div class="title" style="font-size:1.1rem;margin-top:0.5rem;">Akun Anda</div>
            <div class="sub">Masuk untuk melihat profil, mengelola template, dan menyimpan suka.</div>
            <button class="btn btn-primary" id="profileLoginBtn" style="margin-top:1rem;padding:0.6rem 1.4rem;">${ICON.user} Masuk dengan Google</button>
        </div>`;
        const loginBtn = document.getElementById('profileLoginBtn');
        if (loginBtn) loginBtn.addEventListener('click', () => { if (window.openLoginModal) window.openLoginModal(); });
        return;
    }

    if (!state.isCreator || !state.currentUserCreator) {
        const defaultName = (state.currentUser && state.currentUser.displayName) ? state.currentUser.displayName : '';
        const defaultEmail = (state.currentUser && state.currentUser.email) ? state.currentUser.email : '';
        const suggestedUsername = defaultEmail ? defaultEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20) : '';

        cardGrid.innerHTML = `<div class="profile-page-card-wrap">
            <div class="section-header" style="margin-bottom:1.2rem;text-align:center;">
                <h2 style="font-family:var(--font-display);font-size:1.2rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
                    ${ICON.userPlus} Daftar sebagai Kreator
                </h2>
                <p class="sub-text" style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem;">Lengkapi profil kreator kamu untuk mulai membagikan preset &amp; asset.</p>
            </div>
            <div class="multistep-progress" id="pageStepProgress">
                <div class="step-pill active" data-step="1"><span class="step-num">1</span><span class="step-label">Profil</span></div>
                <div class="step-divider">&rarr;</div>
                <div class="step-pill" data-step="2"><span class="step-num">2</span><span class="step-label">Kontak</span></div>
                <div class="step-divider">&rarr;</div>
                <div class="step-pill" data-step="3"><span class="step-num">3</span><span class="step-label">Portfolio</span></div>
                <div class="step-divider">&rarr;</div>
                <div class="step-pill" data-step="4"><span class="step-num">4</span><span class="step-label">Konfirmasi</span></div>
            </div>
            <form id="pageRegisterCreatorForm">
                <div class="multistep-viewport">
                    <div class="multistep-track" id="pageStepTrack">
                        <div class="multistep-slide" data-slide="1">
                            <div class="form-section-card">
                                <div class="section-card-title">
                                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span>Identitas &amp; Visual Kreator</span>
                                </div>
                                <div class="form-group">
                                    <label>Username * (unik, untuk tautan profil)</label>
                                    <input type="text" id="prUsername" required placeholder="username_kamu" value="${escapeHtml(suggestedUsername)}" pattern="[a-zA-Z0-9_]{3,20}" />
                                    <div class="username-hint" id="prUsernameHint">Min 3 karakter, hanya huruf/angka/garis bawah.</div>
                                </div>
                                <div class="form-group">
                                    <label>Nama Tampilan *</label>
                                    <input type="text" id="prDisplayName" required placeholder="Nama Lengkap / Studio" value="${escapeHtml(defaultName)}" />
                                </div>
                                <div class="form-group">
                                    <label>Bio Singkat</label>
                                    <textarea id="prBio" rows="2" placeholder="Ceritakan gaya editing atau keahlianmu..."></textarea>
                                </div>
                                ${renderAvatarPickerHtml(AVATAR_PALETTE[0].bg, 'pr')}
                                <div class="form-group" style="margin-top:0.75rem;">
                                    <label>Software yang Digunakan * <span style="font-size:0.72rem;font-weight:normal;color:var(--text-muted);">(Bisa pilih lebih dari 1)</span></label>
                                    ${renderSoftwareCheckboxesHtml('pr')}
                                </div>
                            </div>
                            <div class="multistep-actions">
                                <button type="button" class="btn btn-primary btn-next-step" style="width:100%;">Lanjut &rarr;</button>
                            </div>
                        </div>
                        <div class="multistep-slide" data-slide="2">
                            <div class="form-section-card">
                                <div class="section-card-title">
                                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    <span>Informasi Kontak</span>
                                </div>
                                <div class="form-group">
                                    <label>No. WhatsApp (opsional)</label>
                                    <input type="text" id="prWa" placeholder="628xxxxxxxx" />
                                </div>
                                <div class="form-group">
                                    <label>Email Kontak (opsional)</label>
                                    <input type="email" id="prEmail" placeholder="kreator@email.com" value="${escapeHtml(defaultEmail)}" />
                                </div>
                            </div>
                            <div class="multistep-actions form-actions">
                                <button type="button" class="btn btn-secondary btn-prev-step">&larr; Kembali</button>
                                <button type="button" class="btn btn-primary btn-next-step">Lanjut &rarr;</button>
                            </div>
                        </div>
                        <div class="multistep-slide" data-slide="3">
                            <div class="form-section-card">
                                <div class="section-card-title">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                    <span>Tautan Portofolio &amp; Media</span>
                                </div>
                                <div class="form-group">
                                    <label>Portfolio / Social Media (opsional)</label>
                                    <input type="url" id="prPortfolio" placeholder="https://instagram.com/..." />
                                </div>
                            </div>
                            <div class="multistep-actions form-actions">
                                <button type="button" class="btn btn-secondary btn-prev-step">&larr; Kembali</button>
                                <button type="button" class="btn btn-primary btn-next-step">Lanjut &rarr;</button>
                            </div>
                        </div>
                        <div class="multistep-slide" data-slide="4">
                            <div class="form-section-card">
                                <div class="section-card-title">
                                    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    <span>Tinjauan Data Kreator</span>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-item"><span class="summary-label">Username</span><span class="summary-val mono" id="prSumUsername">—</span></div>
                                    <div class="summary-item"><span class="summary-label">Nama Tampilan</span><span class="summary-val" id="prSumDisplayName">—</span></div>
                                    <div class="summary-item"><span class="summary-label">Bio</span><span class="summary-val" id="prSumBio">—</span></div>
                                    <div class="summary-item"><span class="summary-label">Software</span><span class="summary-val" id="prSumSoftware">—</span></div>
                                    <div class="summary-item"><span class="summary-label">No. WhatsApp</span><span class="summary-val" id="prSumWa">—</span></div>
                                    <div class="summary-item"><span class="summary-label">Email Kontak</span><span class="summary-val" id="prSumEmail">—</span></div>
                                    <div class="summary-item"><span class="summary-label">Portfolio</span><span class="summary-val" id="prSumPortfolio">—</span></div>
                                </div>
                            </div>
                            <div class="multistep-actions form-actions">
                                <button type="button" class="btn btn-secondary btn-prev-step">&larr; Kembali</button>
                                <button type="submit" class="btn btn-primary" style="flex:1;">Daftar sebagai Kreator</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>`;
        bindPageRegisterCreatorEvents();
        return;
    }

    const c = state.currentUserCreator;
    const myTemplates = (state.allTemplates || []).filter(t => t.creatorUid === state.currentUser.uid || (t.creator || '').toLowerCase() === (c.name || '').toLowerCase());
    const myLiked = (state.allTemplates || []).filter(t => state.likedTemplateIds && state.likedTemplateIds.has(t.id));

    if (state.currentProfileTab === 'profile') state.currentProfileTab = 'templates';

    const html = `<div class="profile-page-view">
        <div class="profile-header">
            ${renderAvatarHtml(c || state.currentUser, 'profile-avatar', 64)}
            <div class="info">
                <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                    <h1 style="margin:0;display:inline-flex;align-items:center;gap:4px;">
                        ${escapeHtml(c.displayName || c.name || '')}
                        ${renderVerifiedBadgeHtml(c, 20)}
                    </h1>
                    <button class="edit-profile-icon-btn" id="inlineEditProfileBtn" title="Edit Profil" aria-label="Edit Profil">${ICON.edit}</button>
                </div>
                <div class="role">@${escapeHtml(c.name || '')} &bull; ${escapeHtml(c.software || 'Kreator')}</div>
                <div class="bio">${escapeHtml(c.bio || 'Belum ada bio.')}</div>
                <div class="stats">
                    <span><strong>${myTemplates.length}</strong> template dipublikasi</span>
                    <span><strong>${myLiked.length}</strong> template disukai</span>
                </div>
                ${c.portfolio ? `<a class="portfolio-link" href="${c.portfolio}" target="_blank" rel="noopener">${ICON.ext} Lihat portfolio</a>` : ''}
                ${c.wa ? `<div class="contact-row" style="margin-top:0.3rem;">${ICON.wa} <a href="https://wa.me/${c.wa}" target="_blank" rel="noopener">${c.wa}</a></div>` : ''}
                ${c.email ? `<div class="contact-row">${ICON.mail} <a href="mailto:${c.email}">${c.email}</a></div>` : ''}
            </div>
        </div>
        <div class="profile-page-tabs">
            <button class="${state.currentProfileTab === 'templates' ? 'active' : ''}" data-ptab="templates">${ICON.grid || ''} Template Saya (${myTemplates.length})</button>
            <button class="${state.currentProfileTab === 'liked' ? 'active' : ''}" data-ptab="liked">${ICON.heart || ''} Disukai (${myLiked.length})</button>
        </div>
        <div id="profileTabContent"></div>
    </div>`;

    cardGrid.innerHTML = html;
    bindProfilePageTabEvents(myTemplates);
    renderProfileTabContent(myTemplates);
}

export function openEditProfileModal() {
    state.currentAkunTab = 'profile';
    updateAkunTabsUI();
    renderAkunContent();
    const modal = document.getElementById('akunModal');
    if (modal) modal.classList.add('active');
}
if (typeof window !== 'undefined') window.openEditProfileModal = openEditProfileModal;

export function bindProfilePageTabEvents(myTemplates) {
    const inlineEditBtn = document.getElementById('inlineEditProfileBtn');
    if (inlineEditBtn) {
        inlineEditBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
    }
    document.querySelectorAll('.profile-page-tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            const ptab = this.dataset.ptab;
            state.currentProfileTab = ptab;
            document.querySelectorAll('.profile-page-tabs button').forEach(b => {
                b.classList.toggle('active', b.dataset.ptab === ptab);
            });
            renderProfileTabContent(myTemplates);
        });
    });
}

export function renderProfileTabContent(myTemplates) {
    const container = document.getElementById('profileTabContent');
    if (!container) return;

    if (state.currentProfileTab === 'liked') {
        container.innerHTML = renderAkunLikedTemplates();
        bindAkunLikedEvents();
    } else {
        if (myTemplates.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 2.5rem 0;">
                ${ICON.plusBox || ''}
                <div class="title" style="margin-top:0.5rem;">Belum ada template</div>
                <div class="sub">Kamu belum mempublikasikan template. Yuk, unggah preset pertama kamu!</div>
                <button class="btn btn-primary" id="profileUploadCtaBtn" style="margin-top:0.8rem;padding:0.5rem 1.2rem;">Upload Preset</button>
            </div>`;
            const uploadCta = document.getElementById('profileUploadCtaBtn');
            if (uploadCta && window.openUploadFlow) uploadCta.addEventListener('click', window.openUploadFlow);
        } else {
            let html = `<div class="result-line">${myTemplates.length} template dipublikasikan</div>`;
            html += `<div class="grid">${myTemplates.map(renderCard).join('')}</div>`;
            container.innerHTML = html;
        }
    }
}

export function bindPageRegisterCreatorEvents() {
    bindAvatarPickerEvents('pr');
    if (window.setupMultiStepForm) {
        window.setupMultiStepForm({
            formEl: document.getElementById('pageRegisterCreatorForm'),
            progressEl: document.getElementById('pageStepProgress'),
            trackEl: document.getElementById('pageStepTrack'),
            prefix: 'pr'
        });
    }
    const unInput = document.getElementById('prUsername');
    if (unInput) {
        unInput.addEventListener('input', function() {
            const val = this.value.trim();
            const hint = document.getElementById('prUsernameHint');
            if (!hint) return;
            if (val.length < 3) {
                hint.innerHTML = 'Min 3 karakter. <span class="cross">&cross;</span> Terlalu pendek';
                return;
            }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
                hint.innerHTML = 'Hanya huruf/angka/garis bawah. <span class="cross">&cross;</span> Tidak valid';
                return;
            }
            const exists = state.allCreators.some(c => (c.name || '').toLowerCase() === val.toLowerCase());
            if (exists) {
                hint.innerHTML = 'Username sudah dipakai. <span class="cross">&cross;</span>';
            } else {
                hint.innerHTML = 'Tersedia. <span class="check">&check;</span>';
            }
        });
    }

    const form = document.getElementById('pageRegisterCreatorForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!state.currentUser || !db) { showToast('Firebase belum siap', 'error'); return; }
            const name = document.getElementById('prUsername').value.trim();
            const displayName = document.getElementById('prDisplayName').value.trim();
            if (!name || !displayName) { showToast('Username dan nama tampilan wajib diisi', 'error'); return; }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) { showToast('Username tidak valid', 'error'); return; }
            if (state.allCreators.some(c => (c.name || '').toLowerCase() === name.toLowerCase())) {
                showToast('Username sudah terdaftar', 'error');
                return;
            }
            const software = getSelectedSoftwareValues('pr');
            if (!software) { showToast('Pilih software yang digunakan', 'error'); return; }

            const sourceType = (document.getElementById('prAvatarSourceType') && document.getElementById('prAvatarSourceType').value) || 'custom';
            const avatarColor = (document.getElementById('prAvatarColor') && document.getElementById('prAvatarColor').value) || AVATAR_PALETTE[0].bg;
            const photoURL = (sourceType === 'google' && state.currentUser && state.currentUser.photoURL) ? state.currentUser.photoURL : '';

            const data = {
                name: name,
                displayName: displayName,
                bio: document.getElementById('prBio').value.trim(),
                software: software,
                wa: document.getElementById('prWa').value.trim(),
                email: document.getElementById('prEmail').value.trim(),
                portfolio: document.getElementById('prPortfolio').value.trim(),
                avatarColor: avatarColor,
                photoURL: photoURL,
                avatarSource: sourceType,
                uid: state.currentUser.uid,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            addCreator(data)
                .then(() => {
                    showToast('Selamat! Kamu sekarang terdaftar sebagai kreator', 'success');
                    state.isCreator = true;
                    state.currentUserCreator = data;
                    state.currentUserCreatorId = state.currentUser.uid;
                    if (window.buildDesktopNav) window.buildDesktopNav();
                    if (window.buildMobileNav) window.buildMobileNav();
                    subscribeCreators();
                    renderProfilePage();
                })
                .catch(err => { showToast('Gagal daftar: ' + err.message, 'error'); });
        });
    }
}

// ===== PURCHASES PAGE =====
export function renderPurchasesPage() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;

    if (!state.currentUser) {
        cardGrid.innerHTML = `<div class="empty-state">
            ${ICON.user}
            <div class="title">Masuk untuk Melihat Pembelian</div>
            <div class="sub">Riwayat transaksi dan file preset yang telah Anda beli tersimpan di sini.</div>
            <button class="btn btn-primary" id="purchasesLoginBtn" style="margin-top:1rem;">Masuk Sekarang</button>
        </div>`;
        const pLogin = document.getElementById('purchasesLoginBtn');
        if (pLogin && window.openLoginModal) pLogin.addEventListener('click', window.openLoginModal);
        return;
    }

    const myPurchases = (state.userOrders || []).filter(o => o.buyerUid === state.currentUser.uid);

    if (myPurchases.length === 0) {
        cardGrid.innerHTML = `<div class="empty-state">
            ${ICON.coin || ''}
            <div class="title">Belum Ada Transaksi</div>
            <div class="sub">Anda belum pernah membeli preset berbayar. Jelajahi pustaka preset berkualitas sekarang!</div>
            <button class="btn btn-primary" id="purchasesExploreBtn" style="margin-top:1rem;">Jelajahi Preset Berbayar</button>
        </div>`;
        const pExplore = document.getElementById('purchasesExploreBtn');
        if (pExplore && window.goToView) pExplore.addEventListener('click', () => window.goToView('cari'));
        return;
    }

    let html = `<div class="section-header" style="margin-bottom:1.5rem;">
        <h2>${ICON.coin || ''} Riwayat Pembelian Saya (${myPurchases.length})</h2>
        <p class="sub-text">Semua preset berbayar yang telah Anda beli tersimpan permanen di akun Anda.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1rem;">`;

    myPurchases.forEach(order => {
        const template = state.allTemplates.find(t => t.id === order.templateId) || {};
        const dateStr = formatDate(order.createdAt);

        html += `<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:1.2rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
            <div style="flex:1;min-width:240px;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">
                    <span class="mono" style="font-size:0.8rem;font-weight:700;color:var(--text-muted);">${order.orderNumber || order.id}</span>
                    <span class="order-status-pill success" style="display:inline-flex;align-items:center;gap:3px;">${ICON.check} Lunas</span>
                </div>
                <div style="font-size:1.05rem;font-weight:700;color:var(--text-primary);">${escapeHtml(order.templateTitle || template.judul || 'Preset Video')}</div>
                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.2rem;">Kreator: @${escapeHtml(order.creatorName || 'Kreator')} &bull; ${dateStr}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:1.1rem;font-weight:800;color:var(--accent);margin-bottom:0.5rem;">${formatRupiah(order.totalAmount)}</div>
                <div style="display:flex;gap:0.5rem;">
                    <button class="btn btn-secondary btn-sm open-inv-btn" data-order-id="${order.id}">${ICON.receipt} Struk Invois</button>
                    <button class="btn btn-primary btn-sm open-dl-btn" data-template-id="${order.templateId}">Unduh File ${ICON.download || ''}</button>
                </div>
            </div>
        </div>`;
    });

    html += '</div>';
    cardGrid.innerHTML = html;

    cardGrid.querySelectorAll('.open-inv-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const order = myPurchases.find(o => o.id === this.dataset.orderId);
            if (order) openInvoiceModal(order);
        });
    });

    cardGrid.querySelectorAll('.open-dl-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tmpl = state.allTemplates.find(t => t.id === this.dataset.templateId);
            if (tmpl) openDetail(tmpl);
        });
    });
}

// ===== CREATOR DASHBOARD =====
export function renderCreatorDashboardPage() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;

    if (!state.currentUser || !state.isCreator || !state.currentUserCreator) {
        cardGrid.innerHTML = `<div class="empty-state">
            ${ICON.userPlus}
            <div class="title">Akses Khusus Kreator</div>
            <div class="sub">Daftarkan akun Anda sebagai kreator untuk mengakses dashboard statistik penjualan dan penarikan saldo.</div>
            <button class="btn btn-primary" id="dashRegisterBtn" style="margin-top:1rem;">${ICON.userPlus} Daftar Kreator</button>
        </div>`;
        const regBtn = document.getElementById('dashRegisterBtn');
        if (regBtn && window.goToView) regBtn.addEventListener('click', () => window.goToView('profile'));
        return;
    }

    state.currentCreatorDashTab = state.currentCreatorDashTab || 'overview';
    state.creatorDashOrderSearch = state.creatorDashOrderSearch || '';

    const creator = state.currentUserCreator;
    const creatorDisplayName = creator.displayName || creator.name || 'Kreator';
    const creatorUsername = creator.name || 'kreator';
    const verified = isCreatorVerified(creator);

    const mySales = (state.userOrders || []).filter(o => (o.creatorUid === state.currentUser.uid || (o.creatorName && o.creatorName.toLowerCase() === creatorUsername.toLowerCase())) && o.status === 'paid');
    const myTemplates = (state.allTemplates || []).filter(t => t.creatorUid === state.currentUser.uid || (t.creator && t.creator.toLowerCase() === creatorUsername.toLowerCase()));

    const totalGross = mySales.reduce((sum, o) => sum + Number(o.itemPrice || 0), 0);
    const platformFeeRate = 0.10;
    const netRevenue = Math.floor(totalGross * (1 - platformFeeRate));

    const withdrawn = (state.creatorWithdrawals || []).filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.amount || 0), 0);
    const pendingWithdraw = (state.creatorWithdrawals || []).filter(w => w.status === 'pending').reduce((sum, w) => sum + Number(w.amount || 0), 0);
    const availableBalance = Math.max(0, netRevenue - withdrawn - pendingWithdraw);

    const totalLikes = myTemplates.reduce((sum, t) => sum + Number(t.likes || 0), 0);
    const totalViews = myTemplates.reduce((sum, t) => sum + Number(t.views || 0), 0);
    const avgOrderVal = mySales.length > 0 ? Math.round(totalGross / mySales.length) : 0;

    let html = `<div class="creator-dash-container">
        <!-- HERO IDENTITY HEADER -->
        <div class="creator-dash-hero">
            <div class="creator-hero-profile">
                ${renderAvatarHtml(creator, 'creator-hero-avatar', 56)}
                <div class="creator-hero-meta">
                    <h2>
                        <span>${escapeHtml(creatorDisplayName)}</span>
                        ${renderVerifiedBadgeHtml(creator, 18)}
                    </h2>
                    <div class="sub-handle">
                        <span class="mono">@${escapeHtml(creatorUsername)}</span>
                        <span class="creator-pill-tag">${ICON.badgeCheck} Partner Resmi</span>
                        ${creator.software ? `<span style="font-size:0.75rem;color:var(--text-muted);">• ${escapeHtml(creator.software)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="creator-hero-actions">
                <button class="btn btn-primary btn-sm" id="creatorHeroUploadBtn">
                    ${ICON.plusBox} Upload Preset
                </button>
                <button class="btn btn-secondary btn-sm" id="creatorHeroViewProfileBtn">
                    ${ICON.user} Toko Publik
                </button>
                <button class="btn btn-secondary btn-sm" id="creatorHeroEditProfileBtn">
                    ${ICON.edit} Edit Profil
                </button>
            </div>
        </div>

        <!-- 4 EXECUTIVE KPI METRICS -->
        <div class="creator-kpi-grid">
            <div class="creator-kpi-card" style="border-top:3px solid var(--accent);">
                <div class="creator-kpi-head">
                    <span class="creator-kpi-label">Saldo Siap Cair</span>
                    <div class="creator-kpi-icon-wrap" style="background:rgba(20,184,166,0.15);color:var(--accent);">
                        ${ICON.wallet}
                    </div>
                </div>
                <div class="creator-kpi-val" style="color:var(--accent);">${formatRupiah(availableBalance)}</div>
                <div class="creator-kpi-footer">
                    <button class="btn btn-primary btn-sm" id="withdrawBtn" style="width:100%;margin-top:0.4rem;padding:0.45rem 0.6rem;font-size:0.78rem;" ${availableBalance < 10000 ? 'disabled title="Minimal penarikan Rp 10.000"' : ''}>
                        ${ICON.bank} Tarik Saldo
                    </button>
                </div>
            </div>

            <div class="creator-kpi-card">
                <div class="creator-kpi-head">
                    <span class="creator-kpi-label">Pendapatan Bersih (90%)</span>
                    <div class="creator-kpi-icon-wrap" style="background:rgba(16,185,129,0.12);color:#10b981;">
                        ${ICON.trendingUp}
                    </div>
                </div>
                <div class="creator-kpi-val">${formatRupiah(netRevenue)}</div>
                <div class="creator-kpi-footer">
                    <span>Kotor: ${formatRupiah(totalGross)}</span>
                    <span class="creator-kpi-badge">${ICON.trend} 90% Share</span>
                </div>
            </div>

            <div class="creator-kpi-card">
                <div class="creator-kpi-head">
                    <span class="creator-kpi-label">Preset Terjual</span>
                    <div class="creator-kpi-icon-wrap" style="background:rgba(59,130,246,0.12);color:#3b82f6;">
                        ${ICON.shoppingBag}
                    </div>
                </div>
                <div class="creator-kpi-val">${mySales.length} Transaksi</div>
                <div class="creator-kpi-footer">
                    <span>Rata-rata: ${formatRupiah(avgOrderVal)}</span>
                    <span style="font-size:0.7rem;color:var(--text-muted);">${myTemplates.length} Preset</span>
                </div>
            </div>

            <div class="creator-kpi-card">
                <div class="creator-kpi-head">
                    <span class="creator-kpi-label">Performa & Jangkauan</span>
                    <div class="creator-kpi-icon-wrap" style="background:rgba(245,158,11,0.12);color:#f59e0b;">
                        ${ICON.activity || ICON.sparkle}
                    </div>
                </div>
                <div class="creator-kpi-val">${formatNumber(totalLikes)} Disukai</div>
                <div class="creator-kpi-footer">
                    <span>${formatNumber(totalViews)} Dilihat Pembeli</span>
                    <span class="creator-kpi-badge" style="color:#d97706;background:rgba(245,158,11,0.1);">${ICON.heart} Engagement</span>
                </div>
            </div>
        </div>

        <!-- DASHBOARD NAVIGATION SUB-TABS -->
        <div class="creator-dash-nav">
            <button class="creator-dash-tab ${state.currentCreatorDashTab === 'overview' ? 'active' : ''}" data-ctab="overview">
                ${ICON.chart} Ringkasan &amp; Analitik
            </button>
            <button class="creator-dash-tab ${state.currentCreatorDashTab === 'orders' ? 'active' : ''}" data-ctab="orders">
                ${ICON.receipt} Riwayat Penjualan (${mySales.length})
            </button>
            <button class="creator-dash-tab ${state.currentCreatorDashTab === 'withdrawals' ? 'active' : ''}" data-ctab="withdrawals">
                ${ICON.bank} Penarikan Dana (${(state.creatorWithdrawals || []).length})
            </button>
            <button class="creator-dash-tab ${state.currentCreatorDashTab === 'presets' ? 'active' : ''}" data-ctab="presets">
                ${ICON.package} Manajemen Preset (${myTemplates.length})
            </button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div id="creatorTabContent">
            ${renderCreatorTabContent(state.currentCreatorDashTab, {
                mySales,
                myTemplates,
                availableBalance,
                withdrawn,
                pendingWithdraw,
                netRevenue,
                totalGross
            })}
        </div>
    </div>`;

    cardGrid.innerHTML = html;
    bindCreatorDashboardEvents(availableBalance);
}

// ===== RENDER SUB-TAB CONTENT =====
function renderCreatorTabContent(tab, data) {
    if (tab === 'orders') {
        return renderCreatorOrdersTabHtml(data.mySales);
    } else if (tab === 'withdrawals') {
        return renderCreatorWithdrawalsTabHtml(data);
    } else if (tab === 'presets') {
        return renderCreatorPresetsTabHtml(data.myTemplates);
    }
    return renderCreatorOverviewTabHtml(data);
}

// ===== TAB 1: OVERVIEW & ANALYTICS =====
function renderCreatorOverviewTabHtml(data) {
    const { mySales, myTemplates } = data;

    // Calculate last 7 days revenue for chart
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const now = new Date();
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const dEnd = new Date(d);
        dEnd.setHours(23, 59, 59, 999);

        const matchingSales = (mySales || []).filter(s => {
            if (!s.createdAt) return false;
            const sDate = s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
            return sDate >= d && sDate <= dEnd;
        });

        const dayRev = matchingSales.reduce((sum, s) => sum + Math.floor(Number(s.itemPrice || 0) * 0.9), 0);
        daysData.push({
            label: dayNames[d.getDay()],
            dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
            revenue: dayRev,
            count: matchingSales.length
        });
    }

    const maxRev = Math.max(...daysData.map(d => d.revenue), 10000);

    // Aggregate Top Presets by sales
    const presetSalesMap = {};
    (mySales || []).forEach(s => {
        const key = s.templateId || s.templateTitle || 'Unknown';
        if (!presetSalesMap[key]) {
            presetSalesMap[key] = {
                title: s.templateTitle || 'Preset',
                count: 0,
                revenue: 0,
                thumb: ''
            };
            const match = (myTemplates || []).find(t => t.id === s.templateId || t.judul === s.templateTitle);
            if (match) {
                presetSalesMap[key].thumb = thumbYoutube(getYoutubeId(match.linkYoutube));
            }
        }
        presetSalesMap[key].count += 1;
        presetSalesMap[key].revenue += Math.floor(Number(s.itemPrice || 0) * 0.9);
    });

    const topPresets = Object.values(presetSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

    return `<div class="creator-analytics-grid">
        <!-- 7-DAY REVENUE BAR CHART -->
        <div class="creator-content-card">
            <div class="creator-card-header">
                <h3>${ICON.chart} Grafik Pendapatan 7 Hari Terakhir</h3>
                <span class="status-chip success">${ICON.checkCircle} Real-time</span>
            </div>
            
            <div class="chart-bar-container">
                ${daysData.map(d => {
                    const pct = Math.max(8, Math.round((d.revenue / maxRev) * 100));
                    return `<div class="chart-day-col">
                        <div class="chart-tooltip-text">${formatRupiah(d.revenue)} (${d.count} order)</div>
                        <div class="chart-day-bar" style="height:${pct}%;"></div>
                        <span class="chart-day-label">${d.label}</span>
                    </div>`;
                }).join('')}
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.76rem;color:var(--text-muted);padding-top:0.4rem;">
                <span>Total 7 Hari: <strong>${formatRupiah(daysData.reduce((s, d) => s + d.revenue, 0))}</strong></span>
                <span>Rata-rata: <strong>${formatRupiah(Math.round(daysData.reduce((s, d) => s + d.revenue, 0) / 7))} / hari</strong></span>
            </div>
        </div>

        <!-- TOP SELLING PRESETS LEADERBOARD -->
        <div class="creator-content-card">
            <div class="creator-card-header">
                <h3>${ICON.starFilled} Preset Terlaris</h3>
                <span style="font-size:0.75rem;color:var(--text-muted);">Top Penjualan</span>
            </div>

            <div class="creator-leaderboard-list">
                ${topPresets.length === 0 ? `
                    <div style="text-align:center;padding:2rem 1rem;color:var(--text-muted);font-size:0.84rem;">
                        ${ICON.shoppingBag}
                        <p style="margin-top:0.5rem;">Belum ada data penjualan preset berbayar.</p>
                    </div>
                ` : topPresets.map((p, idx) => `
                    <div class="creator-leaderboard-item">
                        <div class="creator-lb-left">
                            <span class="creator-lb-rank">#${idx + 1}</span>
                            ${p.thumb ? `<img src="${p.thumb}" class="creator-lb-thumb" alt="${escapeHtml(p.title)}" />` : `<div class="creator-lb-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);">${ICON.image}</div>`}
                            <div class="creator-lb-info">
                                <span class="creator-lb-title">${escapeHtml(p.title)}</span>
                                <span class="creator-lb-sub">${p.count} kali terjual</span>
                            </div>
                        </div>
                        <div class="creator-lb-revenue">
                            <div class="creator-lb-amount">+${formatRupiah(p.revenue)}</div>
                            <div class="creator-lb-count">Pendapatan Bersih</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <!-- CREATOR BEST PRACTICES & TIPS -->
    <div class="creator-content-card" style="margin-top:1.25rem;">
        <div class="creator-card-header">
            <h3>${ICON.sparkles || ICON.sparkle} Panduan &amp; Tips Sukses Kreator</h3>
            <span class="creator-pill-tag">${ICON.shield} Standard Kualitas</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
            <div style="background:var(--bg-alt);padding:1rem;border-radius:12px;border:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:0.4rem;font-weight:700;color:var(--text-main);font-size:0.86rem;margin-bottom:0.3rem;">
                    ${ICON.sparkle} Video Preview Menarik
                </div>
                <p style="margin:0;font-size:0.78rem;color:var(--text-muted);line-height:1.5;">Gunakan video preview YouTube atau CapCut beresolusi tinggi agar calon pembeli dapat melihat hasil transisi preset secara jelas.</p>
            </div>
            <div style="background:var(--bg-alt);padding:1rem;border-radius:12px;border:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:0.4rem;font-weight:700;color:var(--text-main);font-size:0.86rem;margin-bottom:0.3rem;">
                    ${ICON.link} Direct Link Google Drive / AM
                </div>
                <p style="margin:0;font-size:0.78rem;color:var(--text-muted);line-height:1.5;">Pastikan akses file Google Drive disetel ke "Siapa saja yang memiliki link" agar pembeli otomatis mendapat akses file setelah checkout.</p>
            </div>
            <div style="background:var(--bg-alt);padding:1rem;border-radius:12px;border:1px solid var(--border-color);">
                <div style="display:flex;align-items:center;gap:0.4rem;font-weight:700;color:var(--text-main);font-size:0.86rem;margin-bottom:0.3rem;">
                    ${ICON.share} Bagikan Link ke Komunitas
                </div>
                <p style="margin:0;font-size:0.78rem;color:var(--text-muted);line-height:1.5;">Sertakan kode unik preset Anda di caption TikTok, IG Reels, dan YouTube Shorts untuk mengalirkan traffic langsung ke halaman profil Anda.</p>
            </div>
        </div>
    </div>`;
}

// ===== TAB 2: ORDERS & SALES TRANSACTIONS =====
function renderCreatorOrdersTabHtml(sales) {
    const query = (state.creatorDashOrderSearch || '').toLowerCase().trim();
    let list = (sales || []).slice();

    if (query) {
        list = list.filter(s => {
            const num = (s.orderNumber || s.id || '').toLowerCase();
            const title = (s.templateTitle || '').toLowerCase();
            const buyer = (s.buyerName || '').toLowerCase();
            return num.includes(query) || title.includes(query) || buyer.includes(query);
        });
    }

    let html = `<div class="creator-content-card">
        <div class="creator-card-header">
            <h3>${ICON.receipt} Riwayat Penjualan Preset (${sales.length})</h3>
            <div class="creator-search-box">
                ${ICON.search}
                <input type="text" id="creatorOrderSearchInput" placeholder="Cari no. pesanan, judul, pembeli..." value="${escapeHtml(state.creatorDashOrderSearch || '')}" />
            </div>
        </div>`;

    if (list.length === 0) {
        html += `<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
            ${ICON.receipt}
            <p style="margin-top:0.6rem;font-size:0.9rem;">${query ? 'Tidak ada transaksi yang cocok dengan pencarian.' : 'Belum ada transaksi penjualan berbayar.'}</p>
        </div>`;
    } else {
        html += `<div style="overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>No. Pesanan</th>
                        <th>Preset Terjual</th>
                        <th>Pembeli</th>
                        <th>Pendapatan Bersih</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th style="text-align:right;">Aksi</th>
                    </tr>
                </thead>
                <tbody>`;
        
        list.forEach(s => {
            const netAmount = Math.floor(Number(s.itemPrice || 0) * 0.9);
            html += `<tr>
                <td class="mono" style="font-weight:700;color:var(--text-main);">${escapeHtml(s.orderNumber || s.id)}</td>
                <td>
                    <div style="font-weight:700;color:var(--text-main);">${escapeHtml(s.templateTitle || 'Preset')}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">Harga: ${formatRupiah(s.itemPrice)}</div>
                </td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(s.buyerName || 'User')}</div>
                    ${s.buyerEmail ? `<div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(s.buyerEmail)}</div>` : ''}
                </td>
                <td style="color:var(--accent);font-weight:800;">+${formatRupiah(netAmount)}</td>
                <td style="font-size:0.78rem;color:var(--text-secondary);">${formatDate(s.createdAt)}</td>
                <td>
                    <span class="status-chip success">${ICON.check} Lunas</span>
                </td>
                <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm creator-inv-btn" data-id="${s.id}" style="font-size:0.74rem;padding:0.3rem 0.65rem;">
                        ${ICON.receipt} Struk
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
    }

    html += `</div>`;
    return html;
}

// ===== TAB 3: WITHDRAWALS & PAYOUTS =====
function renderCreatorWithdrawalsTabHtml(data) {
    const { availableBalance, withdrawn, pendingWithdraw } = data;
    const withdrawals = (state.creatorWithdrawals || []).filter(w => w.creatorUid === state.currentUser.uid);

    let html = `<div class="creator-content-card">
        <div class="payout-summary-bar">
            <div class="payout-summary-item">
                <span class="p-label">Total Telah Dicairkan</span>
                <span class="p-val" style="color:#10b981;">${formatRupiah(withdrawn)}</span>
            </div>
            <div class="payout-summary-item">
                <span class="p-label">Sedang Diproses Admin</span>
                <span class="p-val" style="color:#f59e0b;">${formatRupiah(pendingWithdraw)}</span>
            </div>
            <div class="payout-summary-item">
                <span class="p-label">Saldo Siap Dicairkan</span>
                <span class="p-val" style="color:var(--accent);">${formatRupiah(availableBalance)}</span>
            </div>
        </div>

        <div class="creator-card-header">
            <h3>${ICON.bank} Riwayat Pengajuan Penarikan Saldo (${withdrawals.length})</h3>
            <button class="btn btn-primary btn-sm" id="tabWithdrawBtn" ${availableBalance < 10000 ? 'disabled title="Minimal penarikan Rp 10.000"' : ''}>
                ${ICON.wallet} Ajukan Penarikan
            </button>
        </div>`;

    if (withdrawals.length === 0) {
        html += `<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
            ${ICON.bank}
            <p style="margin-top:0.6rem;font-size:0.9rem;">Belum ada riwayat penarikan dana.</p>
        </div>`;
    } else {
        html += `<div style="overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Tanggal Pengajuan</th>
                        <th>Bank / E-Wallet</th>
                        <th>No. Rekening / HP</th>
                        <th>Nama Penerima</th>
                        <th>Nominal</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>`;

        withdrawals.forEach(w => {
            let statusBadge = `<span class="status-chip pending">${ICON.clock} Menunggu Diproses</span>`;
            if (w.status === 'completed') {
                statusBadge = `<span class="status-chip success">${ICON.checkCircle} Berhasil Ditransfer</span>`;
            } else if (w.status === 'rejected') {
                statusBadge = `<span class="status-chip" style="background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);">${ICON.alert} Ditolak</span>`;
            }

            html += `<tr>
                <td style="font-size:0.8rem;">${formatDate(w.createdAt)}</td>
                <td><span class="bank-badge">${escapeHtml(w.bank || 'Bank')}</span></td>
                <td class="mono" style="font-weight:600;">${escapeHtml(w.accountNumber || '-')}</td>
                <td>${escapeHtml(w.accountHolder || '-')}</td>
                <td style="font-weight:800;color:var(--text-main);">${formatRupiah(w.amount)}</td>
                <td>${statusBadge}</td>
            </tr>`;
        });

        html += `</tbody></table></div>`;
    }

    html += `</div>`;
    return html;
}

// ===== TAB 4: PRESETS MANAGEMENT =====
function renderCreatorPresetsTabHtml(templates) {
    let html = `<div class="creator-content-card">
        <div class="creator-card-header">
            <h3>${ICON.package} Manajemen Preset Portofolio (${templates.length})</h3>
            <button class="btn btn-primary btn-sm" id="tabAddPresetBtn">
                ${ICON.plusBox} Tambah Preset Baru
            </button>
        </div>`;

    if (templates.length === 0) {
        html += `<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
            ${ICON.package}
            <p style="margin-top:0.6rem;font-size:0.9rem;">Anda belum mengunggah preset.</p>
        </div>`;
    } else {
        html += `<div style="display:flex;flex-direction:column;">`;
        templates.forEach(t => {
            const ytId = getYoutubeId(t.linkYoutube);
            const thumb = ytId ? thumbYoutube(ytId) : '';
            const isPaid = t.license === 'paid';

            html += `<div class="creator-preset-row">
                <div class="creator-preset-left">
                    ${thumb ? `<img src="${thumb}" class="creator-preset-thumb" alt="${escapeHtml(t.judul)}" />` : `<div class="creator-preset-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);">${ICON.image}</div>`}
                    <div class="creator-preset-details">
                        <div class="creator-preset-name">${escapeHtml(t.judul || 'Tanpa Judul')}</div>
                        <div class="creator-preset-meta">
                            <span class="mono" style="font-size:0.72rem;background:var(--bg-alt);padding:1px 6px;border-radius:4px;border:1px solid var(--border-color);">#${escapeHtml(t.kode || t.id.slice(0,6))}</span>
                            <span>${escapeHtml(t.kategori || 'Preset')} (${escapeHtml(t.aspectRatio || '16:9')})</span>
                            <span class="status-chip ${isPaid ? 'pending' : 'success'}" style="font-size:0.68rem;padding:1px 6px;">
                                ${isPaid ? `${ICON.coin} ${formatRupiah(t.harga)}` : 'Gratis'}
                            </span>
                            <span>${t.likes || 0} ${ICON.heart}</span>
                            <span>${t.views || 0} ${ICON.eye}</span>
                        </div>
                    </div>
                </div>
                <div class="creator-preset-actions">
                    <button class="btn btn-secondary btn-sm preset-action-view" data-id="${t.id}" title="Lihat Preview">
                        ${ICON.eye}
                    </button>
                    <button class="btn btn-secondary btn-sm preset-action-edit" data-id="${t.id}" title="Edit Preset">
                        ${ICON.edit}
                    </button>
                    <button class="btn btn-secondary btn-sm preset-action-copy" data-kode="${t.kode || ''}" title="Salin Link Preset">
                        ${ICON.link}
                    </button>
                    <button class="btn btn-secondary btn-sm preset-action-delete" data-id="${t.id}" data-judul="${escapeHtml(t.judul)}" title="Hapus Preset" style="color:#ef4444;">
                        ${ICON.trash}
                    </button>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

// ===== BIND CREATOR DASHBOARD EVENTS =====
function bindCreatorDashboardEvents(availableBalance) {
    // Top Hero Buttons
    const heroUpload = document.getElementById('creatorHeroUploadBtn');
    if (heroUpload && window.openUploadFlow) {
        heroUpload.addEventListener('click', () => window.openUploadFlow());
    }

    const heroProfile = document.getElementById('creatorHeroViewProfileBtn');
    if (heroProfile && window.goToView) {
        heroProfile.addEventListener('click', () => window.goToView('creators', state.currentUserCreator));
    }

    const heroEditProfile = document.getElementById('creatorHeroEditProfileBtn');
    if (heroEditProfile && window.openEditProfileModal) {
        heroEditProfile.addEventListener('click', () => window.openEditProfileModal());
    }

    // Withdraw CTAs
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => openWithdrawModal(availableBalance));
    }

    const tabWithdrawBtn = document.getElementById('tabWithdrawBtn');
    if (tabWithdrawBtn) {
        tabWithdrawBtn.addEventListener('click', () => openWithdrawModal(availableBalance));
    }

    // Sub-Tabs Switching
    document.querySelectorAll('.creator-dash-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            state.currentCreatorDashTab = this.dataset.ctab;
            renderCreatorDashboardPage();
        });
    });

    // Orders search
    const orderSearch = document.getElementById('creatorOrderSearchInput');
    if (orderSearch) {
        orderSearch.addEventListener('input', function() {
            state.creatorDashOrderSearch = this.value;
            const container = document.getElementById('creatorTabContent');
            if (container) {
                const creator = state.currentUserCreator;
                const creatorUsername = (creator && creator.name) || '';
                const mySales = (state.userOrders || []).filter(o => (o.creatorUid === state.currentUser.uid || (o.creatorName && o.creatorName.toLowerCase() === creatorUsername.toLowerCase())) && o.status === 'paid');
                container.innerHTML = renderCreatorOrdersTabHtml(mySales);
                bindCreatorTabInteractiveEvents(availableBalance);
            }
        });
    }

    // Presets tab add button
    const addPresetBtn = document.getElementById('tabAddPresetBtn');
    if (addPresetBtn && window.openUploadFlow) {
        addPresetBtn.addEventListener('click', () => window.openUploadFlow());
    }

    bindCreatorTabInteractiveEvents(availableBalance);
}

function bindCreatorTabInteractiveEvents(availableBalance) {
    // Invoice buttons
    document.querySelectorAll('.creator-inv-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const o = (state.userOrders || []).find(ord => ord.id === this.dataset.id);
            if (o) openInvoiceModal(o);
        });
    });

    // Preset Action Buttons
    document.querySelectorAll('.preset-action-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const t = (state.allTemplates || []).find(tpl => tpl.id === this.dataset.id);
            if (t) openDetail(t);
        });
    });

    document.querySelectorAll('.preset-action-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const t = (state.allTemplates || []).find(tpl => tpl.id === this.dataset.id);
            if (t && window.openEditTemplateModal) window.openEditTemplateModal(t);
        });
    });

    document.querySelectorAll('.preset-action-copy').forEach(btn => {
        btn.addEventListener('click', function() {
            const kode = this.dataset.kode;
            if (kode) {
                const url = window.location.origin + window.location.pathname + '#t=' + kode;
                copyToClipboard(url);
                showToast('Link preset berhasil disalin ke clipboard!', 'success');
            }
        });
    });

    document.querySelectorAll('.preset-action-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const judul = this.dataset.judul;
            if (confirm(`Apakah Anda yakin ingin menghapus preset "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
                deleteTemplate(id).then(() => {
                    showToast(`Preset "${judul}" berhasil dihapus.`, 'info');
                    state.allTemplates = (state.allTemplates || []).filter(tpl => tpl.id !== id);
                    renderCreatorDashboardPage();
                }).catch(err => {
                    showToast('Gagal menghapus preset: ' + err.message, 'error');
                });
            }
        });
    });
}

// ===== UPGRADED PROFESSIONAL WITHDRAW MODAL =====
export function openWithdrawModal(maxAmount) {
    const modal = document.getElementById('withdrawModal');
    const content = document.getElementById('withdrawContent');
    if (!modal || !content) return;

    content.innerHTML = `<div class="modal-head">
        <h2>${ICON.wallet} Pengajuan Penarikan Saldo</h2>
        <button class="modal-close" id="closeWithdrawModal">${ICON.close}</button>
    </div>
    <form id="withdrawForm" style="margin-top:1.2rem;">
        <div class="form-group">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                <label style="margin:0;font-weight:700;">Nominal Penarikan *</label>
                <span style="font-size:0.75rem;color:var(--accent);font-weight:700;">Saldo: ${formatRupiah(maxAmount)}</span>
            </div>
            <input type="number" id="wAmount" required min="10000" max="${maxAmount}" value="${maxAmount}" placeholder="Minimal Rp 10.000" />
            <div class="withdraw-quick-presets">
                <button type="button" class="withdraw-quick-btn" data-pct="0.25">25%</button>
                <button type="button" class="withdraw-quick-btn" data-pct="0.50">50%</button>
                <button type="button" class="withdraw-quick-btn" data-pct="0.75">75%</button>
                <button type="button" class="withdraw-quick-btn" data-pct="1.00">100% (Semua)</button>
            </div>
        </div>

        <div class="form-group" style="margin-top:1rem;">
            <label style="font-weight:700;">Pilih Bank / E-Wallet Tujuan *</label>
            <select id="wBank" required>
                <option value="BCA">Bank BCA (Bank Central Asia)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BRI">Bank BRI (Bank Rakyat Indonesia)</option>
                <option value="BNI">Bank BNI (Bank Negara Indonesia)</option>
                <option value="GoPay">E-Wallet GoPay</option>
                <option value="DANA">E-Wallet DANA</option>
                <option value="OVO">E-Wallet OVO</option>
                <option value="ShopeePay">E-Wallet ShopeePay</option>
            </select>
        </div>

        <div class="form-group">
            <label style="font-weight:700;">Nomor Rekening / No. HP E-Wallet *</label>
            <input type="text" id="wAccount" required placeholder="Contoh: 1234567890 / 08123456789" />
        </div>

        <div class="form-group">
            <label style="font-weight:700;">Nama Pemilik Rekening *</label>
            <input type="text" id="wName" required placeholder="Sesuai nama di buku tabungan/e-wallet" value="${escapeHtml((state.currentUserCreator && state.currentUserCreator.displayName) || '')}" />
        </div>

        <!-- BREAKDOWN SUMMARY BOX -->
        <div style="background:var(--bg-alt);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem 1rem;margin-top:1.2rem;font-size:0.8rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                <span style="color:var(--text-muted);">Biaya Administrasi:</span>
                <span style="color:#10b981;font-weight:700;">Rp 0 (Gratis)</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                <span style="color:var(--text-muted);">Estimasi Pencairan:</span>
                <span style="color:var(--text-main);font-weight:600;">1x24 Jam Hari Kerja</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:0.4rem;border-top:1px dashed var(--border-color);font-weight:800;">
                <span>Total Dana Diterima:</span>
                <span id="withdrawTotalReceive" style="color:var(--accent);font-size:0.95rem;">${formatRupiah(maxAmount)}</span>
            </div>
        </div>

        <div style="margin-top:1.4rem;display:flex;gap:0.8rem;">
            <button type="button" class="btn btn-secondary" id="cancelWithdrawBtn" style="flex:1;">Batal</button>
            <button type="submit" class="btn btn-primary" style="flex:2;">
                ${ICON.bank} Kirim Pengajuan
            </button>
        </div>
    </form>`;

    modal.classList.add('active');

    const amountInput = document.getElementById('wAmount');
    const totalReceiveEl = document.getElementById('withdrawTotalReceive');

    if (amountInput && totalReceiveEl) {
        amountInput.addEventListener('input', function() {
            const val = parseInt(this.value, 10) || 0;
            totalReceiveEl.textContent = formatRupiah(val);
        });
    }

    document.querySelectorAll('.withdraw-quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pct = parseFloat(this.dataset.pct);
            const val = Math.floor(maxAmount * pct);
            if (amountInput) {
                amountInput.value = val;
                if (totalReceiveEl) totalReceiveEl.textContent = formatRupiah(val);
            }
        });
    });

    document.getElementById('closeWithdrawModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('cancelWithdrawBtn').addEventListener('click', () => modal.classList.remove('active'));

    document.getElementById('withdrawForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseInt(document.getElementById('wAmount').value, 10);
        const bank = document.getElementById('wBank').value;
        const account = document.getElementById('wAccount').value.trim();
        const name = document.getElementById('wName').value.trim();

        if (!amount || amount < 10000 || amount > maxAmount) {
            showToast('Jumlah penarikan minimal Rp 10.000 dan tidak melebihi saldo tersedia', 'error');
            return;
        }
        if (!account || !name) {
            showToast('Lengkapi nomor rekening dan nama pemilik akun', 'error');
            return;
        }

        const withdrawalData = {
            creatorUid: state.currentUser.uid,
            creatorName: (state.currentUserCreator && state.currentUserCreator.name) || 'Kreator',
            amount: amount,
            bank: bank,
            accountNumber: account,
            accountHolder: name,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        addWithdrawal(withdrawalData).then(() => {
            showToast('Pengajuan penarikan berhasil dikirim! Tim admin akan segera mentransfer dana.', 'success');
            modal.classList.remove('active');
            state.creatorWithdrawals.unshift(Object.assign({}, withdrawalData, { createdAt: new Date() }));
            renderCreatorDashboardPage();
        }).catch(err => {
            showToast('Gagal mengajukan penarikan: ' + err.message, 'error');
        });
    });
}

// ===== ADMIN PANEL =====
export function renderAdminPanelPage() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;

    if (!state.currentUser || (state.currentUser.email !== 'namskyfr@gmail.com' && !state.isAdmin)) {
        cardGrid.innerHTML = `<div class="empty-state">
            ${ICON.alert || ''}
            <div class="title">Akses Terbatasi (Admin Portal)</div>
            <div class="sub">Halaman ini khusus untuk manajemen sistem dan moderasi marketplace platform.</div>
        </div>`;
        return;
    }

    const totalOrdersCount = (state.userOrders || []).length;
    const totalPlatformGMV = (state.userOrders || []).filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const totalPlatformRevenue = (state.userOrders || []).filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.platformFee || 1000) + Math.floor(Number(o.itemPrice || 0) * 0.1), 0);
    const verifiedCreatorsCount = (state.allCreators || []).filter(c => isCreatorVerified(c)).length;

    let html = `<div class="section-header" style="margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
        <div>
            <h2 style="color:#f59e0b;display:flex;align-items:center;gap:0.5rem;margin:0;">${ICON.shield} Admin Moderation Center</h2>
            <p class="sub-text" style="margin-top:0.25rem;">Pusat kontrol moderasi kreator, pemberian centang biru resmi, dan transaksi platform.</p>
        </div>
    </div>
    
    <div class="dash-stats" style="margin-bottom:1.5rem;">
        <div class="stat-card">
            <span class="label">Total Kreator Terdaftar</span>
            <span class="val" style="color:var(--text);">${state.allCreators.length} Kreator</span>
        </div>
        <div class="stat-card">
            <span class="label">Kreator Centang Biru</span>
            <span class="val" style="color:#1d9bf0;">${verifiedCreatorsCount} Terverifikasi</span>
        </div>
        <div class="stat-card">
            <span class="label">Total Platform GMV</span>
            <span class="val" style="color:var(--accent);">${formatRupiah(totalPlatformGMV)}</span>
        </div>
        <div class="stat-card">
            <span class="label">Komisi Platform</span>
            <span class="val" style="color:var(--green);">${formatRupiah(totalPlatformRevenue)}</span>
        </div>
    </div>

    <div class="admin-tabs-nav">
        <button class="admin-tab-btn ${state.currentAdminTab === 'creators' ? 'active' : ''}" data-atab="creators">
            ${ICON.badgeCheck || ICON.users} Moderasi Kreator &amp; Centang Biru (${state.allCreators.length})
        </button>
        <button class="admin-tab-btn ${state.currentAdminTab === 'transactions' ? 'active' : ''}" data-atab="transactions">
            ${ICON.coin || ''} Riwayat Transaksi Platform (${totalOrdersCount})
        </button>
    </div>`;

    if (state.currentAdminTab === 'creators') {
        const unverifiedCount = state.allCreators.length - verifiedCreatorsCount;
        html += `<div class="admin-filter-bar-wrap">
            <div class="admin-search-box">
                ${ICON.search}
                <input type="text" id="adminCreatorSearchInput" placeholder="Cari nama, @username, software, atau email..." value="${escapeHtml(state.adminCreatorSearch || '')}" />
            </div>
            <div class="admin-filter-chips">
                <button class="admin-filter-chip ${state.adminCreatorFilterStatus === 'all' ? 'active' : ''}" data-status="all">Semua (${state.allCreators.length})</button>
                <button class="admin-filter-chip ${state.adminCreatorFilterStatus === 'verified' ? 'active' : ''}" data-status="verified">${ICON.badgeCheck} Terverifikasi (${verifiedCreatorsCount})</button>
                <button class="admin-filter-chip ${state.adminCreatorFilterStatus === 'unverified' ? 'active' : ''}" data-status="unverified">Belum Verifikasi (${unverifiedCount})</button>
            </div>
        </div>
        <div id="adminCreatorTableContainer">
            ${renderAdminCreatorTableHtml()}
        </div>`;
    } else {
        html += `<div style="margin-top:0.5rem;">
            <h3 style="font-size:1.05rem;margin-bottom:0.85rem;display:flex;align-items:center;gap:0.4rem;">
                ${ICON.folder} Seluruh Transaksi Marketplace
            </h3>`;

        if (state.userOrders.length === 0) {
            html += '<div style="background:var(--card-bg);padding:2rem;border-radius:12px;border:1px solid var(--border);text-align:center;color:var(--text-muted);">Belum ada riwayat transaksi.</div>';
        } else {
            html += `<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:12px;overflow-x:auto;">
                <table class="admin-table">
                    <thead><tr><th>No. Pesanan</th><th>Preset</th><th>Pembeli</th><th>Kreator</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody>`;
            state.userOrders.forEach(o => {
                html += `<tr>
                    <td class="mono">${o.orderNumber || o.id}</td>
                    <td><strong>${escapeHtml(o.templateTitle || 'Preset')}</strong></td>
                    <td>${escapeHtml(o.buyerName || 'Pembeli')}</td>
                    <td>@${escapeHtml(o.creatorName || 'Kreator')}</td>
                    <td style="font-weight:700;">${formatRupiah(o.totalAmount)}</td>
                    <td><span class="order-status-pill success" style="display:inline-flex;align-items:center;gap:4px;">${ICON.check} ${o.status.toUpperCase()}</span></td>
                    <td><button class="btn btn-secondary btn-sm admin-inv-btn" data-id="${o.id}">${ICON.receipt} Struk</button></td>
                </tr>`;
            });
            html += '</tbody></table></div>';
        }
        html += '</div>';
    }

    cardGrid.innerHTML = html;
    bindAdminPanelEvents();
}

export function renderAdminCreatorTableHtml() {
    let list = (state.allCreators || []).slice();
    const query = (state.adminCreatorSearch || '').toLowerCase().trim();
    if (query) {
        list = list.filter(c => {
            const name = (c.name || '').toLowerCase();
            const dName = (c.displayName || '').toLowerCase();
            const soft = (c.software || '').toLowerCase();
            const email = (c.email || '').toLowerCase();
            return name.includes(query) || dName.includes(query) || soft.includes(query) || email.includes(query);
        });
    }

    if (state.adminCreatorFilterStatus === 'verified') {
        list = list.filter(c => isCreatorVerified(c));
    } else if (state.adminCreatorFilterStatus === 'unverified') {
        list = list.filter(c => !isCreatorVerified(c));
    }

    if (list.length === 0) {
        return '<div style="background:var(--card-bg);padding:2.5rem 1rem;border-radius:12px;border:1px solid var(--border);text-align:center;color:var(--text-muted);"><p style="margin:0;font-size:0.9rem;">Tidak ada kreator yang cocok dengan filter atau pencarian.</p></div>';
    }

    let html = `<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:12px;overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Kreator</th>
                    <th>Kontak</th>
                    <th>Software</th>
                    <th>Preset</th>
                    <th>Status Lencana</th>
                    <th style="text-align:right;">Aksi Moderasi</th>
                </tr>
            </thead>
            <tbody>`;

    list.forEach(c => {
        const verified = isCreatorVerified(c);
        const count = (state.allTemplates || []).filter(t => (t.creator || '').toLowerCase() === (c.name || '').toLowerCase()).length;
        const avatarHtml = renderAvatarHtml(c, 'admin-creator-avatar', 36);
        const displayName = c.displayName || c.name || 'Kreator';

        html += `<tr>
            <td>
                <div class="creator-admin-avatar-name">
                    ${avatarHtml}
                    <div class="creator-admin-meta">
                        <div class="name-row">
                            <span>${escapeHtml(displayName)}</span>
                            ${renderVerifiedBadgeHtml(c, 15)}
                        </div>
                        <div class="sub-row mono">@${escapeHtml(c.name || '')}</div>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-size:0.8rem;">
                    ${c.email ? `<div style="color:var(--text);">${escapeHtml(c.email)}</div>` : '<div style="color:var(--text-muted);">-</div>'}
                    ${c.wa ? `<div style="color:var(--text-muted);font-size:0.75rem;">WA: ${escapeHtml(c.wa)}</div>` : ''}
                </div>
            </td>
            <td>
                <span style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(c.software || '-')}</span>
            </td>
            <td>
                <span style="font-weight:600;font-size:0.85rem;">${count}</span>
            </td>
            <td>
                ${verified ? 
                    `<span class="order-status-pill success" style="background:rgba(29, 155, 240, 0.12);color:#1d9bf0;border:1px solid rgba(29, 155, 240, 0.3);display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="#1d9bf0"><path d="M12 2l2.4 2.8 3.7-.4 1.2 3.5 3.3 1.7-1 3.6 2.1 3.1-2.9 2.3-.2 3.7-3.7.8-1.9 3.2L12 21l-3 1.4-1.9-3.2-3.7-.8-.2-3.7-2.9-2.3 2.1-3.1-1-3.6 3.3-1.7 1.2-3.5 3.7.4L12 2z"/></svg> Centang Biru Aktif
                    </span>` : 
                    `<span class="order-status-pill" style="background:var(--surface-sunk);color:var(--text-muted);border:1px solid var(--border);font-size:0.75rem;">
                        Belum Terverifikasi
                    </span>`
                }
            </td>
            <td style="text-align:right;">
                ${verified ? 
                    `<button class="btn btn-outline-danger btn-sm admin-verify-toggle-btn" data-id="${c.id}" data-uid="${c.uid || c.id}" data-action="revoke" data-name="${escapeHtml(displayName)}" data-username="${escapeHtml(c.name || '')}" style="font-size:0.75rem;padding:0.32rem 0.75rem;display:inline-flex;align-items:center;gap:4px;">
                        ${ICON.close} Cabut Centang Biru
                    </button>` : 
                    `<button class="btn btn-primary btn-sm admin-verify-toggle-btn" data-id="${c.id}" data-uid="${c.uid || c.id}" data-action="grant" data-name="${escapeHtml(displayName)}" data-username="${escapeHtml(c.name || '')}" style="background:#1d9bf0;border-color:#1d9bf0;color:#fff;font-size:0.75rem;padding:0.32rem 0.75rem;display:inline-flex;align-items:center;gap:4px;">
                        ${ICON.badgeCheck} Beri Centang Biru
                    </button>`
                }
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    return html;
}

export function bindAdminPanelEvents() {
    const searchInput = document.getElementById('adminCreatorSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            state.adminCreatorSearch = this.value;
            const container = document.getElementById('adminCreatorTableContainer');
            if (container) {
                container.innerHTML = renderAdminCreatorTableHtml();
                bindAdminVerifyActionButtons();
            }
        });
    }

    document.querySelectorAll('.admin-filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            state.adminCreatorFilterStatus = this.dataset.status;
            document.querySelectorAll('.admin-filter-chip').forEach(c => c.classList.toggle('active', c.dataset.status === state.adminCreatorFilterStatus));
            const container = document.getElementById('adminCreatorTableContainer');
            if (container) {
                container.innerHTML = renderAdminCreatorTableHtml();
                bindAdminVerifyActionButtons();
            }
        });
    });

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            state.currentAdminTab = this.dataset.atab;
            renderAdminPanelPage();
        });
    });

    document.querySelectorAll('.admin-inv-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const o = state.userOrders.find(ord => ord.id === this.dataset.id);
            if (o) openInvoiceModal(o);
        });
    });

    bindAdminVerifyActionButtons();
}

export function bindAdminVerifyActionButtons() {
    document.querySelectorAll('.admin-verify-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!state.currentUser || (state.currentUser.email !== 'namskyfr@gmail.com' && !state.isAdmin)) {
                showToast('Hanya admin atau owner yang berhak mengubah centang biru', 'error');
                return;
            }

            const docId = this.dataset.id;
            const uid = this.dataset.uid;
            const action = this.dataset.action;
            const username = this.dataset.username;
            const willVerify = action === 'grant';

            this.disabled = true;
            this.textContent = willVerify ? 'Memverifikasi...' : 'Mencabut...';

            const updateData = {
                isVerified: willVerify,
                verified: willVerify,
                verifiedAt: willVerify ? firebase.firestore.FieldValue.serverTimestamp() : null
            };

            updateCreator(docId, updateData)
                .then(() => {
                    // Update in-memory state
                    const target = state.allCreators.find(c => c.id === docId || c.uid === uid || (c.name || '').toLowerCase() === username.toLowerCase());
                    if (target) {
                        target.isVerified = willVerify;
                        target.verified = willVerify;
                    }
                    if (state.currentUserCreator && (state.currentUserCreator.id === docId || state.currentUserCreator.uid === uid || (state.currentUserCreator.name || '').toLowerCase() === username.toLowerCase())) {
                        state.currentUserCreator.isVerified = willVerify;
                        state.currentUserCreator.verified = willVerify;
                    }

                    if (willVerify) {
                        addNotification({
                            userId: uid || docId,
                            title: 'Lencana Centang Biru Resmi',
                            message: 'Selamat! Akun Anda telah resmi diverifikasi dengan Lencana Centang Biru oleh Admin.',
                            type: 'verified',
                            read: false
                        }).catch(() => {});
                        showToast(`Centang biru berhasil diberikan ke @${username}!`, 'success');
                    } else {
                        showToast(`Centang biru @${username} berhasil dicabut.`, 'info');
                    }

                    renderAdminPanelPage();
                })
                .catch(err => {
                    showToast('Gagal mengubah status verifikasi: ' + err.message, 'error');
                    this.disabled = false;
                    this.innerHTML = willVerify ? `${ICON.badgeCheck} Beri Centang Biru` : `${ICON.close} Cabut Centang Biru`;
                });
        });
    });
}

// ===== AKUN / PROFILE EDIT FORM =====
export function renderAkunContent() {
    const container = document.getElementById('akunTabContent');
    if (container) {
        container.innerHTML = renderAkunProfileForm();
        bindAkunProfileEvents();
    }
}

export function renderAkunProfileForm() {
    if (!state.currentUserCreator) return '<p style="color:var(--text-muted);">Data kreator tidak ditemukan.</p>';
    const c = state.currentUserCreator;
    const currentPhoto = c.photoURL || (state.currentUser && state.currentUser.photoURL) || '';
    return `<form id="akunProfileForm">
        <div class="form-section-card">
            <div class="section-card-title">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Identitas &amp; Visual Kreator</span>
            </div>
            <div class="form-group">
                <label>Username *</label>
                <input type="text" id="aUsername" required value="${escapeHtml(c.name || '')}" pattern="[a-zA-Z0-9_]{3,20}" />
                <div class="username-hint" id="aUsernameHint">Min 3 karakter, hanya huruf/angka/garis bawah.</div>
            </div>
            <div class="form-group">
                <label>Nama Tampilan *</label>
                <input type="text" id="aDisplayName" required value="${escapeHtml(c.displayName || c.name || '')}" />
            </div>
            <div class="form-group">
                <label>Bio</label>
                <textarea id="aBio" rows="2">${escapeHtml(c.bio || '')}</textarea>
            </div>
            ${renderAvatarPickerHtml(c.avatarColor, 'a', currentPhoto)}
            <div class="form-group" style="margin-top:0.75rem;">
                <label>Software yang Digunakan <span style="font-size:0.72rem;font-weight:normal;color:var(--text-muted);">(Bisa pilih lebih dari 1)</span></label>
                ${renderSoftwareCheckboxesHtml('a', c.software || '')}
            </div>
        </div>
        <div class="form-section-card">
            <div class="section-card-title">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Kontak &amp; Tautan</span>
            </div>
            <div class="form-group">
                <label>No. WhatsApp</label>
                <input type="text" id="aWa" value="${escapeHtml(c.wa || '')}" placeholder="628xxxxxxxx" />
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="aEmail" value="${escapeHtml(c.email || '')}" placeholder="kreator@email.com" />
            </div>
            <div class="form-group">
                <label>Portfolio</label>
                <input type="url" id="aPortfolio" value="${escapeHtml(c.portfolio || '')}" placeholder="https://..." />
            </div>
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" style="width:100%;">Simpan Perubahan</button>
        </div>
    </form>`;
}

export function bindAkunProfileEvents() {
    bindAvatarPickerEvents('a');
    const unInput = document.getElementById('aUsername');
    if (unInput) {
        unInput.addEventListener('input', function() {
            const val = this.value.trim();
            const hint = document.getElementById('aUsernameHint');
            if (!hint) return;
            if (val.length < 3) {
                hint.innerHTML = 'Min 3 karakter. <span class="cross">&cross;</span> Terlalu pendek';
                return;
            }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
                hint.innerHTML = 'Hanya huruf/angka/garis bawah. <span class="cross">&cross;</span> Tidak valid';
                return;
            }
            const exists = state.allCreators.some(c => (c.name || '').toLowerCase() === val.toLowerCase() && c.id !== state.currentUserCreatorId);
            if (exists) {
                hint.innerHTML = 'Username sudah dipakai. <span class="cross">&cross;</span>';
            } else {
                hint.innerHTML = 'Tersedia. <span class="check">&check;</span>';
            }
        });
    }
    const form = document.getElementById('akunProfileForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!db || !state.currentUserCreatorId) { showToast('Firebase belum siap', 'error'); return; }
            const username = document.getElementById('aUsername').value.trim();
            const displayName = document.getElementById('aDisplayName').value.trim();
            const bio = document.getElementById('aBio').value.trim();
            const software = getSelectedSoftwareValues('a');
            const wa = document.getElementById('aWa').value.trim();
            const email = document.getElementById('aEmail').value.trim();
            const portfolio = document.getElementById('aPortfolio').value.trim();
            if (!username || !displayName) { showToast('Username dan nama tampilan wajib diisi', 'error'); return; }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { showToast('Username tidak valid', 'error'); return; }
            const exists = state.allCreators.some(c => (c.name || '').toLowerCase() === username.toLowerCase() && c.id !== state.currentUserCreatorId);
            if (exists) { showToast('Username sudah digunakan', 'error'); return; }
            const sourceType = (document.getElementById('aAvatarSourceType') && document.getElementById('aAvatarSourceType').value) || 'custom';
            const avatarColor = (document.getElementById('aAvatarColor') && document.getElementById('aAvatarColor').value) || AVATAR_PALETTE[0].bg;
            const photoURL = (sourceType === 'google' && state.currentUser && state.currentUser.photoURL) ? state.currentUser.photoURL : (sourceType === 'custom' ? '' : ((state.currentUserCreator && state.currentUserCreator.photoURL) || ''));
            const data = { name: username, displayName: displayName, bio: bio, software: software, wa: wa, email: email, portfolio: portfolio, avatarColor: avatarColor, photoURL: photoURL, avatarSource: sourceType };
            updateCreator(state.currentUserCreatorId, data)
                .then(() => {
                    showToast('Profil berhasil diperbarui!', 'success');
                    state.currentUserCreator = Object.assign({}, state.currentUserCreator, data);
                    render();
                    renderAkunContent();
                })
                .catch(err => { showToast('Gagal: ' + err.message, 'error'); });
        });
    }
}

export function renderAkunLikedTemplates() {
    const liked = (state.allTemplates || []).filter(t => state.likedTemplateIds && state.likedTemplateIds.has(t.id));
    if (liked.length === 0) {
        return `<div class="empty-state" style="padding:1.5rem 0;">
            ${ICON.heart}
            <div class="title">Belum ada yang disukai</div>
            <div class="sub">Like template yang kamu suka untuk menyimpannya di sini.</div>
        </div>`;
    }
    let html = `<div class="result-line">${liked.length} template disukai</div>`;
    html += '<div class="liked-mini-grid">';
    liked.forEach(t => {
        const ytId = t.linkYoutube ? getYoutubeId(t.linkYoutube) : null;
        const imgSrc = ytId ? thumbYoutube(ytId) : '';
        html += `<div class="liked-mini-card" data-id="${t.id}" data-creator="${escapeHtml(t.creator || '')}" data-kode="${escapeHtml(t.kode || '')}">
            <div class="mini-thumb">${imgSrc ? `<img src="${imgSrc}" alt="" loading="lazy">` : ICON.noVideo}</div>
            <div class="mini-info">${escapeHtml(t.judul || 'Tanpa judul')}</div>
        </div>`;
    });
    html += '</div>';
    return html;
}

export function bindAkunLikedEvents() {
    document.querySelectorAll('.liked-mini-card').forEach(card => {
        card.addEventListener('click', function() {
            const t = state.allTemplates.find(tm => tm.id === this.dataset.id);
            if (!t) return;
            const akunModal = document.getElementById('akunModal');
            if (akunModal) akunModal.classList.remove('active');
            const username = t.creator || 'anonim';
            const kode = t.kode || '';
            const newHash = '#/' + encodeURIComponent(username) + '/' + kode;
            if (window.location.hash !== newHash) history.pushState(null, '', newHash);
            openDetail(t);
        });
    });
}

export function updateAkunTabsUI() {
    document.querySelectorAll('.akun-section-tabs button').forEach(b => {
        b.classList.toggle('active', b.dataset.akunTab === state.currentAkunTab);
    });
}

// ===== MARKETPLACE & CHECKOUT ENGINE =====
export function openCheckoutModal(template) {
    if (!template || !state.currentUser) {
        showToast('Silakan masuk terlebih dahulu untuk melakukan checkout', 'warning');
        return;
    }
    const modal = document.getElementById('checkoutModal');
    const content = document.getElementById('checkoutContent');
    if (!modal || !content) return;

    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);
    const itemPrice = Number(template.harga || 0);
    const platformFee = 1000;
    const totalAmount = itemPrice + platformFee;

    let selectedMethod = 'qris';

    content.innerHTML = `<div class="modal-head">
        <h2>${ICON.coin || ''} Checkout &amp; Pembayaran</h2>
        <button class="modal-close" id="closeCheckoutModal">${ICON.close}</button>
    </div>
    <div class="checkout-summary">
        <div style="font-weight:700;font-size:1.05rem;margin-bottom:0.3rem;">${escapeHtml(template.judul || '')}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Kreator: @${escapeHtml(template.creator || 'Anonim')} &bull; Kategori: ${escapeHtml(template.kategori || '')}</div>
        <div class="row" style="margin-top:0.8rem;"><span>Harga Preset</span><span>${formatRupiah(itemPrice)}</span></div>
        <div class="row"><span>Biaya Layanan Terverifikasi</span><span>${formatRupiah(platformFee)}</span></div>
        <div class="row total"><span>Total Pembayaran</span><span style="color:var(--accent);font-size:1.15rem;">${formatRupiah(totalAmount)}</span></div>
    </div>
    <div style="margin-top:1.2rem;">
        <label style="font-weight:700;font-size:0.85rem;display:block;margin-bottom:0.5rem;">Pilih Metode Pembayaran Fast-Pay:</label>
        <div class="payment-methods">
            <div class="pm-card active" data-method="qris"><strong>${ICON.qr} QRIS / E-Wallet</strong><span>GoPay, OVO, DANA, ShopeePay, LinkAja</span></div>
            <div class="pm-card" data-method="vabca"><strong>${ICON.card} Virtual Account BCA</strong><span>Transfer Instan 24 Jam Otomatis</span></div>
            <div class="pm-card" data-method="vamandiri"><strong>${ICON.card} Bank Mandiri VA</strong><span>Transfer Instan Livin Mandiri</span></div>
        </div>
    </div>
    <div id="paymentDetailsBox" style="margin-top:1rem;background:var(--card-bg);padding:1rem;border-radius:12px;border:1px solid var(--border);text-align:center;">
        <div id="qrisBox">
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">Scan QRIS di bawah dengan aplikasi m-Banking atau E-Wallet pilihan Anda:</div>
            <div style="background:#fff;padding:1rem;display:inline-block;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <svg viewBox="0 0 100 100" width="140" height="140">
                    <path d="M0,0 h30 v30 h-30 z M40,0 h10 v10 h-10 z M60,0 h40 v40 h-40 z M0,40 h10 v10 h-10 z M20,40 h20 v10 h-20 z M50,40 h10 v10 h-10 z M70,40 h10 v10 h-10 z M0,60 h40 v40 h-40 z M50,60 h20 v20 h-20 z M80,60 h20 v10 h-20 z M50,90 h10 v10 h-10 z M70,90 h30 v10 h-30 z" fill="#000"/>
                    <rect x="8" y="8" width="14" height="14" fill="#fff"/>
                    <rect x="11" y="11" width="8" height="8" fill="#000"/>
                    <rect x="68" y="8" width="24" height="24" fill="#fff"/>
                    <rect x="73" y="13" width="14" height="14" fill="#000"/>
                    <rect x="8" y="68" width="24" height="24" fill="#fff"/>
                    <rect x="13" y="73" width="14" height="14" fill="#000"/>
                </svg>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">Nomor Pesanan: <strong class="mono">${orderNumber}</strong></div>
        </div>
        <div id="vaBox" style="display:none;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Nomor Virtual Account Pembayaran:</div>
            <div class="mono" style="font-size:1.3rem;font-weight:800;color:var(--accent);margin:0.5rem 0;letter-spacing:1px;">88012${Math.floor(Math.random() * 8999999 + 1000000)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Transfer sesuai nominal tepat: <strong>${formatRupiah(totalAmount)}</strong></div>
        </div>
    </div>
    <div style="margin-top:1.2rem;display:flex;gap:0.8rem;">
        <button class="btn btn-secondary" id="cancelCheckoutBtn" style="flex:1;">Batal</button>
        <button class="btn btn-primary" id="confirmPaymentBtn" style="flex:2;padding:0.75rem;font-weight:700;box-shadow:0 4px 14px rgba(20,184,166,0.3);">${ICON.bolt || ICON.shield} Bayar &amp; Dapatkan Akses (Lunas)</button>
    </div>`;

    modal.classList.add('active');

    document.getElementById('closeCheckoutModal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('cancelCheckoutBtn').addEventListener('click', () => modal.classList.remove('active'));

    content.querySelectorAll('.pm-card').forEach(card => {
        card.addEventListener('click', function() {
            content.querySelectorAll('.pm-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedMethod = this.dataset.method;
            const qrisBox = document.getElementById('qrisBox');
            const vaBox = document.getElementById('vaBox');
            if (selectedMethod === 'qris') {
                if (qrisBox) qrisBox.style.display = 'block';
                if (vaBox) vaBox.style.display = 'none';
            } else {
                if (qrisBox) qrisBox.style.display = 'none';
                if (vaBox) vaBox.style.display = 'block';
            }
        });
    });

    document.getElementById('confirmPaymentBtn').addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = (ICON.sync || '') + ' Memproses Verifikasi...';

        const orderData = {
            orderNumber: orderNumber,
            templateId: template.id,
            templateTitle: template.judul || '',
            templateKode: template.kode || '',
            creatorName: template.creator || '',
            creatorUid: template.creatorUid || '',
            buyerUid: state.currentUser.uid,
            buyerEmail: state.currentUser.email || 'pembeli@user.com',
            buyerName: state.currentUser.displayName || state.currentUser.email || 'Pembeli',
            itemPrice: itemPrice,
            platformFee: platformFee,
            totalAmount: totalAmount,
            paymentMethod: selectedMethod.toUpperCase(),
            status: 'paid',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            paidAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        addOrder(orderData).then(docRef => {
            const orderId = docRef ? docRef.id : orderNumber;
            const fullOrder = { id: orderId, ...orderData, createdAt: new Date() };
            state.userOrders.unshift(fullOrder);
            
            incrementField(template.id, 'uses', 1).catch(() => {});
            
            if (template.creatorUid) {
                addNotification({
                    recipientUid: template.creatorUid,
                    title: 'Penjualan Preset Baru!',
                    message: orderData.buyerName + ' telah membeli preset "' + template.judul + '" seharga ' + formatRupiah(itemPrice) + '.',
                    type: 'sale',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                }).catch(() => {});
            }

            showToast('Pembayaran Berhasil! Akses preset terbuka.', 'success');
            modal.classList.remove('active');
            openInvoiceModal(fullOrder, template);
            render();
        }).catch(err => {
            showToast('Gagal memproses transaksi: ' + err.message, 'error');
            this.disabled = false;
            this.innerHTML = (ICON.bolt || ICON.shield) + ' Bayar &amp; Dapatkan Akses (Lunas)';
        });
    });
}
if (typeof window !== 'undefined') window.openCheckoutModal = openCheckoutModal;

export function openInvoiceModal(order, templateObj) {
    const modal = document.getElementById('invoiceModal');
    const content = document.getElementById('invoiceContent');
    if (!modal || !content) return;

    const template = templateObj || state.allTemplates.find(t => t.id === order.templateId) || {};
    const dateStr = formatDate(order.createdAt || new Date());

    content.innerHTML = `<div class="printable-invoice">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--border);padding-bottom:1rem;margin-bottom:1.2rem;">
            <div>
                <h2 style="font-family:var(--font-display);color:var(--accent);font-size:1.3rem;margin-bottom:0.2rem;">PresetLibrary</h2>
                <div style="font-size:0.75rem;color:var(--text-muted);">Bukti Transaksi Resmi Platform Marketplace</div>
            </div>
            <div style="text-align:right;">
                <div class="mono" style="font-size:0.85rem;font-weight:700;color:var(--text-primary);">${order.orderNumber || order.id}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${dateStr}</div>
                <span class="order-status-pill success" style="margin-top:0.3rem;display:inline-flex;align-items:center;gap:4px;">${ICON.checkCircle} LUNAS / PAID</span>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-size:0.82rem;margin-bottom:1.2rem;background:var(--card-bg);padding:0.8rem;border-radius:8px;">
            <div>
                <div style="color:var(--text-muted);font-size:0.72rem;">DIBELI OLEH:</div>
                <strong>${escapeHtml(order.buyerName || 'Pembeli')}</strong>
                <div style="color:var(--text-secondary);">${escapeHtml(order.buyerEmail || '')}</div>
            </div>
            <div>
                <div style="color:var(--text-muted);font-size:0.72rem;">KREATOR PRESET:</div>
                <strong>@${escapeHtml(order.creatorName || 'Kreator')}</strong>
                <div style="color:var(--text-secondary);">Metode: ${escapeHtml(order.paymentMethod || 'QRIS')}</div>
            </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.83rem;margin-bottom:1.2rem;">
            <thead>
                <tr style="border-bottom:1px solid var(--border);text-align:left;color:var(--text-muted);font-size:0.75rem;">
                    <th style="padding:0.5rem 0;">Item Preset &amp; License</th>
                    <th style="padding:0.5rem 0;text-align:right;">Harga</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:0.6rem 0;">
                        <strong>${escapeHtml(order.templateTitle || template.judul || 'Preset Video')}</strong>
                        <div style="font-size:0.72rem;color:var(--text-muted);">Kode: ${escapeHtml(order.templateKode || template.kode || '')} &bull; Lisensi Komersial Standard</div>
                    </td>
                    <td style="padding:0.6rem 0;text-align:right;font-weight:600;">${formatRupiah(order.itemPrice)}</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:0.6rem 0;color:var(--text-muted);">Biaya Layanan Terverifikasi</td>
                    <td style="padding:0.6rem 0;text-align:right;color:var(--text-muted);">${formatRupiah(order.platformFee || 1000)}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td style="padding:0.8rem 0;font-weight:700;">TOTAL PEMBAYARAN</td>
                    <td style="padding:0.8rem 0;text-align:right;font-weight:800;font-size:1.1rem;color:var(--accent);">${formatRupiah(order.totalAmount)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="background:var(--green-soft);padding:1rem;border-radius:10px;border:1px solid rgba(16,185,129,0.3);margin-bottom:1.2rem;">
            <div style="font-weight:700;color:var(--green);font-size:0.88rem;margin-bottom:0.4rem;display:flex;align-items:center;gap:0.35rem;">${ICON.key} Akses Unduh File Preset Dibuka:</div>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
                ${template.linkProject ? `<a href="${template.linkProject}" target="_blank" class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 0.8rem;">${ICON.folder || ''} Buka Link Project AM/NV</a>` : ''}
                ${template.linkDrive ? `<a href="${template.linkDrive}" target="_blank" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.8rem;">${ICON.download || ''} Unduh dari Google Drive Private</a>` : ''}
            </div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:0.8rem;">
            <button class="btn btn-secondary" id="closeInvoiceModalBtn">${ICON.arrowLeft || ''} Kembali</button>
            <button class="btn btn-primary" onclick="window.print();">${ICON.download || ''} Cetak Struk / Simpan PDF</button>
        </div>
    </div>`;

    modal.classList.add('active');
    document.getElementById('closeInvoiceModalBtn').addEventListener('click', () => modal.classList.remove('active'));
}

// ===== NOTIFICATIONS MODAL =====
export function openNotifModal() {
    const modal = document.getElementById('notifModal');
    const content = document.getElementById('notifContent');
    if (!modal || !content) return;

    let html = `<div class="modal-head">
        <h2>${ICON.bell} Notifikasi Akun</h2>
        <button class="modal-close" id="closeNotifModal">${ICON.close}</button>
    </div>`;

    if (state.userNotifications.length === 0) {
        html += '<div class="empty-state" style="padding:2rem 0;"><div class="title">Belum Ada Notifikasi</div><div class="sub">Notifikasi penjualan preset dan pembaruan sistem akan muncul di sini.</div></div>';
    } else {
        html += '<div style="display:flex;flex-direction:column;gap:0.8rem;margin-top:1rem;">';
        state.userNotifications.forEach(n => {
            html += `<div class="notif-item ${n.read ? '' : 'unread'}" style="background:var(--card-bg);padding:0.8rem 1rem;border-radius:10px;border:1px solid var(--border);">
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.2rem;">${escapeHtml(n.title)}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(n.message)}</div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem;">${formatDate(n.createdAt)}</div>
            </div>`;
        });
        html += '</div>';
    }

    content.innerHTML = html;
    modal.classList.add('active');

    document.getElementById('closeNotifModal').addEventListener('click', () => modal.classList.remove('active'));

    const badge = document.getElementById('notifCount');
    if (badge) badge.style.display = 'none';
}
if (typeof window !== 'undefined') window.openNotifModal = openNotifModal;

// ===== MAIN RENDER HUB =====
export function render() {
    updateContextLine();
    const cardGrid = getCardGrid();
    if (!cardGrid) return;

    if (!state.dataLoaded) {
        cardGrid.innerHTML = renderSkeletonGrid(12);
        return;
    }

    if (state.currentView === 'cari' || state.currentView === 'search') {
        renderCariView();
        return;
    }

    if (state.currentView === 'profile' || state.currentView === 'akun') {
        renderProfilePage();
        return;
    }

    if (state.currentView === 'purchases') {
        renderPurchasesPage();
        return;
    }

    if (state.currentView === 'dashboard') {
        renderCreatorDashboardPage();
        return;
    }

    if (state.currentView === 'admin') {
        renderAdminPanelPage();
        return;
    }

    const filtered = getFiltered();
    let html = '';
    
    if (state.currentView === 'creators' && state.currentCreator) {
        html += buildProfileHeader(state.currentCreator);
        if (filtered.length === 0) {
            html += emptyStateHtml('creator-profile');
            cardGrid.innerHTML = html;
            bindProfileHeaderEvents();
            return;
        }
    }
    
    if (state.currentView === 'creators' && !state.currentCreator) {
        renderCreatorDirectory();
        return;
    }
    
    if (filtered.length === 0) {
        cardGrid.innerHTML = html + emptyStateHtml(state.currentView === 'home' ? 'home' : 'search');
        return;
    }
    
    if (state.currentView !== 'home') {
        html += `<div class="result-line">${filtered.length} template</div>`;
    }
    html += `<div class="grid">${filtered.map(renderCard).join('')}</div>`;
    cardGrid.innerHTML = html;
    
    if (state.currentView === 'creators' && state.currentCreator) {
        bindProfileHeaderEvents();
    }
}
