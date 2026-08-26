/**
 * Preset Library - Main Application Entry Point
 * Coordinates routing, event bindings, auth UI synchronization, and modals.
 */

import { state } from './state.js';
import { 
    ICON, 
    AVATAR_PALETTE, 
    generateKode, 
    showToast, 
    copyToClipboard,
    escapeHtml
} from './utils.js';
import { 
    auth, 
    db, 
    firebase, 
    firebaseInitialized,
    initFirebase,
    signInWithGoogle,
    checkIfCreator,
    fetchOrdersForUser,
    fetchNotificationsForUser,
    fetchWithdrawalsForCreator,
    addTemplate,
    updateTemplate,
    addCreator,
    toggleLike,
    subscribeCreators
} from './firebase.js';
import { 
    renderAvatarHtml, 
    bindAvatarPickerEvents, 
    getSelectedSoftwareValues,
    openDetail,
    closeDetail,
    renderSkeletonGrid
} from './components.js';
import { 
    render, 
    renderCariView, 
    updateCariResults, 
    renderCreatorDirectory, 
    renderProfilePage, 
    renderPurchasesPage, 
    renderCreatorDashboardPage, 
    renderAdminPanelPage, 
    renderAkunLikedTemplates, 
    bindAkunLikedEvents, 
    openEditProfileModal,
    openNotifModal
} from './pages.js';

// ===== GLOBAL EXPOSURES FOR COMPATIBILITY =====
window.goToView = goToView;
window.openLoginModal = openLoginModal;
window.openRegisterModal = openRegisterModal;
window.openUploadFlow = openUploadFlow;
window.openEditTemplateModal = openEditTemplateModal;
window.openEditProfileModal = openEditProfileModal;
window.openNotifModal = openNotifModal;
window.setupMultiStepForm = setupMultiStepForm;
window.buildDesktopNav = buildDesktopNav;
window.buildMobileNav = buildMobileNav;
window.updateNavActiveState = updateNavActiveState;
window.updateHeaderTitle = updateHeaderTitle;
window.updateUrl = updateUrl;
window.render = render;

// ===== ROUTING & HASH CONTROLLER =====
export function processHash(hash) {
    if (!hash || hash === '/' || hash === '#') {
        state.currentView = 'explore';
        state.currentCreator = null;
        state.cariSearchQuery = '';
        state.activeRatio = null;
        applyRatioChipUI();
        updateNavActiveState();
        render();
        return;
    }

    const parts = hash.split('/').filter(Boolean);
    const first = parts[0] ? decodeURIComponent(parts[0]) : '';
    const second = parts[1] ? decodeURIComponent(parts[1]) : '';

    if (first === 'cari' || first === 'search') {
        state.currentView = 'cari';
        state.currentCreator = null;
        if (second) {
            setSearchQuery(second, null);
        }
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'creators') {
        state.currentView = 'creators';
        state.currentCreator = second || null;
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'profile' || first === 'akun') {
        state.currentView = 'profile';
        state.currentCreator = null;
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'purchases') {
        state.currentView = 'purchases';
        state.currentCreator = null;
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'dashboard') {
        state.currentView = 'dashboard';
        state.currentCreator = null;
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'admin') {
        state.currentView = 'admin';
        state.currentCreator = null;
        updateNavActiveState();
        render();
        return;
    }

    if (first === 'explore') {
        state.currentView = 'explore';
        state.currentCreator = null;
        updateNavActiveState();
        render();
        return;
    }

    // Pattern #/creator/kode
    if (first && second) {
        const found = state.allTemplates.find(t => {
            const matchCreator = (t.creator || '').toLowerCase() === first.toLowerCase();
            const matchKode = (t.kode || '').toLowerCase() === second.toLowerCase();
            return matchCreator && matchKode;
        });
        if (found) {
            state.currentView = 'explore';
            state.currentCreator = null;
            updateNavActiveState();
            render();
            openDetail(found);
            return;
        }
    }

    state.currentView = 'explore';
    state.currentCreator = null;
    updateNavActiveState();
    render();
}

export function updateUrl() {
    let newHash = '';
    if (state.currentView === 'explore') {
        newHash = '';
    } else if (state.currentView === 'cari') {
        newHash = state.cariSearchQuery ? '#/cari/' + encodeURIComponent(state.cariSearchQuery) : '#/cari';
    } else if (state.currentView === 'creators') {
        newHash = state.currentCreator ? '#/creators/' + encodeURIComponent(state.currentCreator) : '#/creators';
    } else if (state.currentView === 'profile') {
        newHash = '#/profile';
    } else if (state.currentView === 'purchases') {
        newHash = '#/purchases';
    } else if (state.currentView === 'dashboard') {
        newHash = '#/dashboard';
    } else if (state.currentView === 'admin') {
        newHash = '#/admin';
    }
    
    if (window.location.hash !== newHash) {
        history.pushState(null, '', newHash || window.location.pathname);
    }
}

export function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (!state.dataLoaded) {
        state.pendingHash = hash;
        return;
    }
    processHash(hash);
}

export function goToView(view) {
    state.currentView = view;
    state.currentCreator = null;
    updateNavActiveState();
    if (view === 'creators') renderCreatorDirectory();
    else render();
    updateUrl();
}

// ===== NAVIGATION BUILDERS =====
export function updateHeaderTitle() {
    const logoText = document.getElementById('logoText');
    const logoLink = document.getElementById('logoLink');
    let titleText = 'Preset Library';
    let docTitle = 'Preset Library — Komunitas Kreator';

    if (state.currentView === 'explore' || state.currentView === 'home') {
        titleText = 'Preset Library';
        docTitle = 'Preset Library — Komunitas Kreator';
    } else if (state.currentView === 'cari' || state.currentView === 'search') {
        titleText = 'Explore';
        docTitle = 'Explore — Preset Library';
    } else if (state.currentView === 'creators') {
        titleText = 'Kreator';
        docTitle = 'Kreator — Preset Library';
    } else if (state.currentView === 'profile' || state.currentView === 'akun') {
        titleText = 'Profile';
        docTitle = 'Profile — Preset Library';
    } else if (state.currentView === 'purchases') {
        titleText = 'Pembelian';
        docTitle = 'Pembelian — Preset Library';
    } else if (state.currentView === 'dashboard' || state.currentView === 'wallet') {
        titleText = 'Dashboard';
        docTitle = 'Dashboard — Preset Library';
    } else if (state.currentView === 'admin') {
        titleText = 'Admin';
        docTitle = 'Admin Moderasi — Preset Library';
    } else if (state.currentView === 'tentang') {
        titleText = 'Tentang';
        docTitle = 'Tentang — Preset Library';
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
    document.title = docTitle;

    // Header buttons visibility:
    // 1. Icon search di setiap halaman KECUALI di dashboard dan profil
    // 2. Icon titik tiga HANYA di profil
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

export function buildDesktopNav() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    
    let html = `
        <button class="nav-item ${state.currentView === 'explore' ? 'active' : ''}" data-view="explore">${ICON.home || ICON.compass} Beranda</button>
        <button class="nav-item ${state.currentView === 'cari' ? 'active' : ''}" data-view="cari">${ICON.search} Cari</button>
        <button class="nav-item ${state.currentView === 'creators' ? 'active' : ''}" data-view="creators">${ICON.users} Kreator</button>
    `;

    if (state.currentUser) {
        html += `<button class="nav-item ${state.currentView === 'purchases' ? 'active' : ''}" data-view="purchases">${ICON.coin || ''} Pembelian</button>`;
        if (state.isCreator) {
            html += `<button class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">${ICON.chart || ''} Dashboard</button>`;
        }
    }

    if (state.isAdmin) {
        html += `<button class="nav-item ${state.currentView === 'admin' ? 'active' : ''}" data-view="admin" style="color:#f59e0b;font-weight:700;">${ICON.shield || ''} Admin</button>`;
    }

    if (state.currentUser) {
        html += `<button class="nav-upload-desktop" id="headerUploadBtn" title="Upload Template">${ICON.plusBox || ''} <span>Upload</span></button>`;
    }

    nav.innerHTML = html;

    nav.querySelectorAll('button[data-view]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const view = this.dataset.view;
            if (view === 'explore') {
                state.activeRatio = null;
                applyRatioChipUI();
            }
            goToView(view);
        });
    });

    const upBtn = document.getElementById('headerUploadBtn');
    if (upBtn) {
        upBtn.addEventListener('click', () => openUploadFlow());
    }
}

export function buildMobileNav() {
    const nav = document.querySelector('.mobile-nav');
    if (!nav) return;

    let html = `
        <button data-nav="explore" class="${state.currentView === 'explore' ? 'active' : ''}">${ICON.home || ICON.compass}<span>Beranda</span></button>
        <button data-nav="cari" class="${state.currentView === 'cari' ? 'active' : ''}">${ICON.search}<span>Cari</span></button>
        <button class="nav-upload-mobile" data-nav="upload" aria-label="Upload Template">${ICON.plusBox}</button>
        <button data-nav="creators" class="${state.currentView === 'creators' ? 'active' : ''}">${ICON.users}<span>Kreator</span></button>
        <button data-nav="profile" class="${state.currentView === 'profile' ? 'active' : ''}">${ICON.user}<span>Profile</span></button>
    `;

    nav.innerHTML = html;

    nav.querySelectorAll('button[data-nav]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const navTarget = this.dataset.nav;
            if (navTarget === 'upload') {
                openUploadFlow();
                return;
            }
            if (navTarget === 'explore') {
                state.activeRatio = null;
                applyRatioChipUI();
            }
            goToView(navTarget);
        });
    });
}

export function updateNavActiveState() {
    document.querySelectorAll('#mainNav button[data-view]').forEach(b => {
        b.classList.toggle('active', b.dataset.view === state.currentView);
    });
    document.querySelectorAll('.mobile-nav button[data-nav]').forEach(b => {
        if (b.dataset.nav !== 'upload') {
            b.classList.toggle('active', b.dataset.nav === state.currentView);
        }
    });

    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
        filterBar.style.display = (state.currentView === 'explore' || state.currentView === 'home' || (state.currentView === 'creators' && state.currentCreator)) ? 'flex' : 'none';
    }

    updateHeaderTitle();
}

export function applyRatioChipUI() {
    document.querySelectorAll('.ratio-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.ratio === state.activeRatio);
    });
}

// ===== RECENT SEARCHES (LOCALSTORAGE) =====
const RECENT_SEARCHES_KEY = 'preset_recent_searches';

export function getRecentSearches() {
    try {
        const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .filter(item => typeof item === 'string' && item.trim().length > 0)
                .map(item => item.trim())
                .slice(0, 5);
        }
    } catch (e) {
        console.warn('Failed to parse recent searches from localStorage:', e);
    }
    return [];
}

export function saveRecentSearch(query) {
    if (!query || typeof query !== 'string') return;
    const clean = query.trim();
    if (clean.length < 1) return;
    try {
        const current = getRecentSearches();
        const filtered = current.filter(item => item.toLowerCase() !== clean.toLowerCase());
        const updated = [clean, ...filtered].slice(0, 5);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        renderRecentSearchesOverlay();
        return updated;
    } catch (e) {
        console.warn('Failed to save recent search to localStorage:', e);
    }
}

export function removeRecentSearch(query) {
    if (!query) return;
    try {
        const current = getRecentSearches();
        const updated = current.filter(item => item.toLowerCase() !== query.trim().toLowerCase());
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        renderRecentSearchesOverlay();
        return updated;
    } catch (e) {
        console.warn('Failed to remove recent search from localStorage:', e);
    }
}

export function clearRecentSearches() {
    try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        renderRecentSearchesOverlay();
    } catch (e) {
        console.warn('Failed to clear recent searches from localStorage:', e);
    }
}

export function renderRecentSearchesOverlay() {
    const panel = document.getElementById('searchRecentPanel');
    if (!panel) return;

    const searchInput = document.getElementById('searchInput');
    const filterQuery = (searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '');

    const allRecent = getRecentSearches();
    const recent = filterQuery 
        ? allRecent.filter(q => q.toLowerCase().indexOf(filterQuery) !== -1)
        : allRecent;

    const suggestions = ['#cinematic', '#lightroom', '#vlog', '#moody', '#aesthetic', '#capcut'];

    let html = '<div class="search-recent-panel-inner">';

    if (allRecent.length > 0) {
        html += `
            <div class="recent-search-header">
                <div class="recent-search-title">
                    ${ICON.history || ICON.clock || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}
                    <span>${filterQuery ? 'Riwayat Cocok' : 'Pencarian Terakhir'}</span>
                </div>
                <button type="button" class="recent-search-clear-all" id="clearAllRecentSearches">Hapus Semua</button>
            </div>
        `;

        if (recent.length > 0) {
            html += `
                <div class="recent-search-list">
                    ${recent.map(q => `
                        <div class="recent-search-item" data-query="${escapeHtml(q)}" tabindex="0" role="button" aria-label="Cari ${escapeHtml(q)}">
                            <div class="recent-search-item-left">
                                <span class="recent-icon">${ICON.clock || ICON.history || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}</span>
                                <span class="recent-query-text">${escapeHtml(q)}</span>
                            </div>
                            <button type="button" class="recent-search-remove-btn" data-remove-query="${escapeHtml(q)}" title="Hapus dari riwayat" aria-label="Hapus ${escapeHtml(q)} dari riwayat">
                                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            html += `
                <div class="recent-search-empty">
                    <span class="recent-search-empty-icon">${ICON.search || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7.5"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>'}</span>
                    <span class="recent-search-empty-text">Tekan <strong>Enter</strong> untuk mencari "<em>${escapeHtml(filterQuery)}</em>"</span>
                </div>
            `;
        }
    } else {
        html += `
            <div class="recent-search-empty">
                <span class="recent-search-empty-icon">${ICON.history || ICON.clock || '<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}</span>
                <span class="recent-search-empty-text">Belum ada riwayat pencarian (5 pencarian terakhir akan tersimpan)</span>
            </div>
        `;
    }

    html += `
        <div class="recent-search-suggestions">
            <span class="suggestions-label">Populer:</span>
            ${suggestions.map(s => `<button type="button" class="search-suggestion-chip" data-query="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
        </div>
    `;

    html += '</div>';
    panel.innerHTML = html;

    bindRecentSearchEvents();
}

export function bindRecentSearchEvents() {
    const panel = document.getElementById('searchRecentPanel');
    if (!panel) return;

    // Handle clicking a recent search item
    panel.querySelectorAll('.recent-search-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.recent-search-remove-btn')) return;
            const query = this.dataset.query;
            if (query) {
                saveRecentSearch(query);
                setSearchQuery(query, null);
                if (state.currentView !== 'cari') goToView('cari');
            }
        });
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const query = this.dataset.query;
                if (query) {
                    saveRecentSearch(query);
                    setSearchQuery(query, null);
                    if (state.currentView !== 'cari') goToView('cari');
                }
            }
        });
    });

    // Handle removing a single item
    panel.querySelectorAll('.recent-search-remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const query = this.dataset.removeQuery;
            if (query) {
                removeRecentSearch(query);
            }
        });
    });

    // Handle clear all
    const clearAllBtn = panel.querySelector('#clearAllRecentSearches');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            clearRecentSearches();
        });
    }

    // Handle clicking popular suggestion chips
    panel.querySelectorAll('.search-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            const query = this.dataset.query;
            if (query) {
                saveRecentSearch(query);
                setSearchQuery(query, null);
                if (state.currentView !== 'cari') goToView('cari');
            }
        });
    });
}

// ===== SEARCH CONTROLLER =====
export function setSearchQuery(val, sourceId) {
    state.cariSearchQuery = val || '';
    const q = state.cariSearchQuery.trim().toLowerCase();

    const inputs = [
        { el: document.getElementById('searchInput'), clear: document.getElementById('clearDesktopSearch') },
        { el: document.getElementById('searchInputMobile'), clear: document.getElementById('clearMobileSearch') },
        { el: document.getElementById('homeSearchInput'), clear: document.getElementById('clearHomeSearch') },
        { el: document.getElementById('explorePageSearch'), clear: document.getElementById('clearExploreSearch') }
    ];

    inputs.forEach(item => {
        if (item.el && item.el.id !== sourceId) {
            item.el.value = state.cariSearchQuery;
        }
        if (item.clear) {
            item.clear.style.display = state.cariSearchQuery ? 'inline-flex' : 'none';
        }
    });

    document.querySelectorAll('.hashtag-pill').forEach(pill => {
        const tag = (pill.dataset.tag || '').toLowerCase();
        pill.classList.toggle('active', !!(q && tag && q.indexOf(tag) !== -1));
    });

    if (state.currentView === 'cari') {
        updateCariResults();
    } else if (q.length > 0) {
        goToView('cari');
    } else {
        render();
    }
}

export function setupSearchBindings() {
    const headerSearchToggle = document.getElementById('headerSearchToggle');
    const closeSearchOverlayBtn = document.getElementById('closeSearchOverlayBtn');
    const siteHeader = document.getElementById('siteHeader');
    const searchInput = document.getElementById('searchInput');

    if (headerSearchToggle) {
        headerSearchToggle.addEventListener('click', e => {
            e.stopPropagation();
            if (siteHeader) siteHeader.classList.add('search-active');
            renderRecentSearchesOverlay();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        });
    }

    if (closeSearchOverlayBtn) {
        closeSearchOverlayBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (siteHeader) siteHeader.classList.remove('search-active');
            setSearchQuery('', null);
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && siteHeader && siteHeader.classList.contains('search-active')) {
            siteHeader.classList.remove('search-active');
        }
    });

    // Close search overlay on click outside
    document.addEventListener('click', e => {
        if (siteHeader && siteHeader.classList.contains('search-active')) {
            const overlay = document.getElementById('headerSearchOverlay');
            const toggle = document.getElementById('headerSearchToggle');
            if (overlay && !overlay.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
                siteHeader.classList.remove('search-active');
            }
        }
    });

    const searchConfig = [
        { inputId: 'searchInput', clearId: 'clearDesktopSearch' },
        { inputId: 'searchInputMobile', clearId: 'clearMobileSearch' },
        { inputId: 'homeSearchInput', clearId: 'clearHomeSearch' },
        { inputId: 'explorePageSearch', clearId: 'clearExploreSearch' }
    ];

    searchConfig.forEach(cfg => {
        const input = document.getElementById(cfg.inputId);
        const clearBtn = document.getElementById(cfg.clearId);

        if (input) {
            input.addEventListener('input', function() {
                setSearchQuery(this.value, cfg.inputId);
            });
            input.addEventListener('focus', function() {
                if (cfg.inputId === 'searchInput') {
                    renderRecentSearchesOverlay();
                }
                if (this.value && state.currentView !== 'cari') {
                    goToView('cari');
                }
            });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const val = this.value.trim();
                    if (val) {
                        saveRecentSearch(val);
                        setSearchQuery(val, cfg.inputId);
                        if (state.currentView !== 'cari') {
                            goToView('cari');
                        }
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', e => {
                e.stopPropagation();
                setSearchQuery('', null);
                if (input) input.focus();
            });
        }
    });

    document.addEventListener('click', e => {
        const pill = e.target.closest('.hashtag-pill');
        if (pill) {
            const tag = pill.dataset.tag || '';
            if (tag) {
                if (state.cariSearchQuery.toLowerCase().indexOf(tag.toLowerCase()) !== -1) {
                    setSearchQuery('', null);
                } else {
                    const tagQuery = '#' + tag;
                    saveRecentSearch(tagQuery);
                    setSearchQuery(tagQuery, null);
                }
                if (state.currentView !== 'cari') goToView('cari');
            }
        }
    });

    const mobileSearchToggleBtn = document.getElementById('mobileSearchToggle');
    if (mobileSearchToggleBtn) {
        mobileSearchToggleBtn.addEventListener('click', () => {
            const bar = document.getElementById('mobileSearchBar');
            if (bar) {
                bar.classList.toggle('open');
                if (bar.classList.contains('open')) {
                    const mInput = document.getElementById('searchInputMobile');
                    if (mInput) mInput.focus();
                }
            }
        });
    }

    // Initial render of recent searches in overlay
    renderRecentSearchesOverlay();
}

// ===== AUTH / LOGIN MODALS & UI SYNC =====
export function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        const lf = document.getElementById('loginForm');
        const rf = document.getElementById('registerAuthForm');
        const lt = document.getElementById('loginModalTitle');
        const le = document.getElementById('loginError');
        const re = document.getElementById('registerError');
        if (lf) lf.style.display = 'block';
        if (rf) rf.style.display = 'none';
        if (lt) lt.textContent = 'Masuk';
        if (le) { le.style.display = 'none'; le.textContent = ''; }
        if (re) { re.style.display = 'none'; re.textContent = ''; }
        modal.classList.add('active');
    }
}

export function promptLogin(msg) {
    const promptMsg = document.getElementById('loginPromptMsg');
    if (promptMsg) {
        if (msg) {
            promptMsg.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M21 2l-2 2m-1.5 1.5l-3 3m-3.5 3.5a6 6 0 1 1-8.5 8.5 6 6 0 0 1 8.5-8.5z"/></svg> ${escapeHtml(msg)}`;
            promptMsg.style.display = 'block';
        } else {
            promptMsg.style.display = 'none';
        }
    }
    openLoginModal();
}

export function openRegisterModal() {
    if (!state.currentUser) {
        showToast('Silakan masuk terlebih dahulu', 'info');
        openLoginModal();
        return;
    }
    if (state.isCreator) {
        showToast('Anda sudah terdaftar sebagai kreator', 'info');
        return;
    }
    goToView('profile');
}

export function updateAuthUI(user) {
    state.currentUser = user;
    const badge = document.getElementById('userBadge');
    const loginBtn = document.getElementById('loginBtn');
    const notifWrap = document.getElementById('notifWrap');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    const menuAdminBtn = document.getElementById('menuAdminBtn');

    if (user) {
        if (badge) badge.style.display = 'inline-flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (notifWrap) notifWrap.style.display = 'inline-flex';

        if (user.email === 'namskyfr@gmail.com') {
            state.isAdmin = true;
        }

        if (menuAdminBtn) {
            menuAdminBtn.style.display = state.isAdmin ? 'flex' : 'none';
        }

        const displayName = user.displayName || user.email || 'User';
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = displayName;

        const userAvatarWrapEl = document.getElementById('userAvatarWrap');
        if (userAvatarWrapEl) {
            userAvatarWrapEl.innerHTML = renderAvatarHtml(user, 'avatar-header-badge', 26);
        }

        updateHeaderTitle();

        if (firebaseInitialized && db) {
            checkIfCreator(user.uid).then(() => {
                buildDesktopNav();
                buildMobileNav();
                if (state.isCreator) {
                    fetchWithdrawalsForCreator(user.uid).then(withdrawals => {
                        state.creatorWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];
                        if (state.currentView === 'wallet' && typeof window.renderCreatorWalletPage === 'function') {
                            window.renderCreatorWalletPage();
                        }
                    }).catch(() => {
                        state.creatorWithdrawals = [];
                    });
                }
            });

            fetchOrdersForUser(user.uid).then(orders => {
                state.userOrders = Array.isArray(orders) ? orders : [];
                if (state.currentView === 'purchases') renderPurchasesPage();
            }).catch(() => {
                state.userOrders = [];
            });

            fetchNotificationsForUser(user.uid).then(notifs => {
                state.userNotifications = Array.isArray(notifs) ? notifs : [];
                const unreadCount = (state.userNotifications || []).filter(n => n && !n.read).length;
                const notifCountBadge = document.getElementById('notifCount');
                if (notifCountBadge) {
                    if (unreadCount > 0) {
                        notifCountBadge.textContent = unreadCount;
                        notifCountBadge.style.display = 'flex';
                    } else {
                        notifCountBadge.style.display = 'none';
                    }
                }
            }).catch(() => {
                state.userNotifications = [];
            });
        }
    } else {
        if (badge) badge.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (notifWrap) notifWrap.style.display = 'none';
        if (profileMenuToggle) profileMenuToggle.style.display = 'none';
        if (menuAdminBtn) menuAdminBtn.style.display = 'none';
        state.isCreator = false;
        state.isAdmin = false;
        state.currentUserCreator = null;
        state.currentUserCreatorId = null;
        state.viewedTemplates = {};
        state.userOrders = [];
        state.userNotifications = [];
        state.creatorWithdrawals = [];
        state.likedTemplateIds = new Set();
        buildDesktopNav();
        buildMobileNav();
    }
    updateHeaderTitle();
    buildDesktopNav();
    buildMobileNav();
}

// ===== UPLOAD FLOW =====
export function openUploadFlow() {
    if (!state.currentUser) {
        showToast('Yuk masuk atau daftar akun terlebih dahulu!', 'info');
        promptLogin('Silakan masuk atau daftar akun gratis untuk mengunggah preset');
        return;
    }
    if (!state.isCreator) {
        showToast('Daftar sebagai kreator dulu, ya', 'info');
        openRegisterModal();
        return;
    }
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Upload Template';
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.reset();
    const fKodeEl = document.getElementById('fKode');
    if (fKodeEl) fKodeEl.value = generateKode(6);
    const priceWrapper = document.getElementById('priceWrapper');
    if (priceWrapper) priceWrapper.classList.remove('active');
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    if (customCategoryGroup) customCategoryGroup.style.display = 'none';
    updateFileLinksVisibility('free');
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) uploadModal.classList.add('active');
}

export function updateFileLinksVisibility(license) {
    const section = document.getElementById('fileLinksSection');
    const hint = document.getElementById('fileLinksHint');
    if (!section) return;
    if (license === 'paid') {
        section.style.opacity = '0.4';
        section.style.pointerEvents = 'none';
        if (hint) hint.innerHTML = 'Untuk template <strong>berbayar</strong>, link tidak ditampilkan. Pembeli akan menghubungi kamu via WA/email yang terdaftar.';
    } else {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
        if (hint) hint.innerHTML = 'Untuk template <strong>gratis</strong>, sertakan link download atau project.';
    }
}

// ===== EDIT TEMPLATE MODAL =====
export function openEditTemplateModal(template) {
    if (!template) return;
    document.getElementById('eTEditId').value = template.id;
    document.getElementById('eTJudul').value = template.judul || '';
    const eTKodeEl = document.getElementById('eTKode');
    if (eTKodeEl) eTKodeEl.value = template.kode || generateKode(6);
    const kat = template.kategori || 'Preset';
    if (kat === 'Preset' || kat === 'Assets') {
        document.getElementById('eTKategori').value = kat;
        document.getElementById('eTCustomCategoryGroup').style.display = 'none';
        document.getElementById('eTCustomKategori').removeAttribute('required');
    } else {
        document.getElementById('eTKategori').value = 'Lainnya';
        document.getElementById('eTCustomCategoryGroup').style.display = 'block';
        document.getElementById('eTCustomKategori').value = kat;
        document.getElementById('eTCustomKategori').setAttribute('required', 'required');
    }
    const st = template.style || '';
    const styleSel = document.getElementById('eTStyle');
    const customStyleGroup = document.getElementById('eTStyleCustomGroup');
    const customStyleInput = document.getElementById('eTCustomStyle');
    if (styleSel) {
        if (['JJ (Jedag-Jedug)', 'Motion Graphic', 'Cinematic', 'Vlog'].indexOf(st) !== -1) {
            styleSel.value = st;
            if (customStyleGroup) customStyleGroup.style.display = 'none';
        } else if (st) {
            styleSel.value = 'Lainnya';
            if (customStyleGroup) customStyleGroup.style.display = 'block';
            if (customStyleInput) customStyleInput.value = st;
        } else {
            styleSel.value = '';
            if (customStyleGroup) customStyleGroup.style.display = 'none';
        }
    }

    document.getElementById('eTDeskripsi').value = template.deskripsi || '';
    document.getElementById('eTLinkYoutube').value = template.linkYoutube || '';
    document.getElementById('eTAspect').value = template.aspectRatio || '16:9';
    document.getElementById('eTLicense').value = template.license || 'free';
    document.getElementById('eTHarga').value = template.harga || '';
    document.getElementById('eTLinkProject').value = template.linkProject || '';
    document.getElementById('eTLinkDrive').value = template.linkDrive || '';
    document.getElementById('eTLinkAsset1').value = template.linkAsset1 || '';
    document.getElementById('eTLinkAsset2').value = template.linkAsset2 || '';

    const isPaid = template.license === 'paid';
    const wrap = document.getElementById('eTPriceWrapper');
    if (wrap) {
        if (isPaid) wrap.classList.add('active');
        else wrap.classList.remove('active');
    }

    const section = document.getElementById('eTFileLinksSection');
    const hint = document.getElementById('eTFileLinksHint');
    if (section && hint) {
        if (isPaid) {
            section.style.opacity = '0.4';
            section.style.pointerEvents = 'none';
            hint.innerHTML = 'Untuk template <strong>berbayar</strong>, link tidak ditampilkan.';
        } else {
            section.style.opacity = '1';
            section.style.pointerEvents = 'auto';
            hint.innerHTML = 'Untuk template <strong>gratis</strong>, sertakan link download.';
        }
    }

    const editModal = document.getElementById('editTemplateModal');
    if (editModal) editModal.classList.add('active');
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
            pills.forEach(pill => {
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

        const setVal = (id, val) => {
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
            if (state.allCreators.some(c => (c.name || '').toLowerCase() === unVal.toLowerCase())) {
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
        config.formEl.querySelectorAll('.btn-next-step').forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    updateStepUI(currentStep + 1);
                }
            });
        });

        config.formEl.querySelectorAll('.btn-prev-step').forEach(btn => {
            btn.addEventListener('click', () => {
                updateStepUI(currentStep - 1);
            });
        });

        config.formEl.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT' && currentStep < 4) {
                e.preventDefault();
                if (validateStep(currentStep)) {
                    updateStepUI(currentStep + 1);
                }
            }
        });
    }

    if (config.progressEl) {
        config.progressEl.querySelectorAll('.step-pill').forEach(pill => {
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
        reset: () => {
            currentStep = 1;
            updateStepUI(1);
        },
        updateStepUI: updateStepUI,
        getCurrentStep: () => currentStep,
        validateStep: validateStep
    };
}

// ===== ATTACH ALL APPLICATION EVENT LISTENERS =====
export function attachEventListeners() {
    const cardGrid = document.getElementById('cardGrid');

    if (cardGrid) {
        cardGrid.addEventListener('click', e => {
            const quickCodeBtn = e.target.closest('.card-quick-code');
            if (quickCodeBtn) {
                e.stopPropagation();
                e.preventDefault();
                const code = quickCodeBtn.dataset.kode;
                if (code) copyToClipboard(code);
                return;
            }
            const likesBtn = e.target.closest('.card-stats .likes');
            if (likesBtn) {
                e.stopPropagation();
                e.preventDefault();
                if (!state.currentUser) {
                    showToast('Yuk masuk atau daftar akun terlebih dahulu untuk menyukai preset!', 'info');
                    promptLogin('Silakan masuk atau daftar akun gratis untuk menyukai preset');
                    return;
                }
                const card = e.target.closest('.card');
                if (card && card.dataset.id) {
                    const id = card.dataset.id;
                    const isCurrentlyLiked = state.likedTemplateIds.has(id);
                    if (isCurrentlyLiked) {
                        state.likedTemplateIds.delete(id);
                        const tpl = state.allTemplates.find(t => t.id === id);
                        if (tpl) tpl.likes = Math.max(0, (tpl.likes || 0) - 1);
                    } else {
                        state.likedTemplateIds.add(id);
                        const tpl2 = state.allTemplates.find(t => t.id === id);
                        if (tpl2) tpl2.likes = (tpl2.likes || 0) + 1;
                    }
                    render();
                    toggleLike(id, state.currentUser.uid).catch(err => {
                        console.warn('Toggle like error:', (err && err.message) || String(err));
                    });
                }
                return;
            }
            const card = e.target.closest('.card');
            if (!card) return;
            const t = state.allTemplates.find(tm => tm.id === card.dataset.id);
            if (!t) return;
            const username = t.creator || 'anonim';
            const kode = t.kode || '';
            const newHash = '#/' + encodeURIComponent(username) + '/' + kode;
            if (window.location.hash !== newHash) history.pushState(null, '', newHash);
            openDetail(t);
        });

        cardGrid.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target.closest('.card');
            if (!card) return;
            e.preventDefault();
            card.click();
        });
    }

    // Category chips
    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            state.activeFilter = this.dataset.filter;
            document.querySelectorAll('.cat-chip').forEach(c => c.classList.toggle('active', c === this));
            render();
        });
    });

    // Ratio chips
    document.querySelectorAll('.ratio-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            state.activeRatio = (state.activeRatio === this.dataset.ratio) ? null : this.dataset.ratio;
            applyRatioChipUI();
            render();
            updateUrl();
        });
    });

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            state.activeSort = this.value;
            render();
        });
    }

    // Search
    setupSearchBindings();

    // Logo click
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', e => {
            e.preventDefault();
            goToView('explore');
            state.activeRatio = null;
            applyRatioChipUI();
        });
    }

    // 3-dots profile menu & About modal
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    const profileMenuDropdown = document.getElementById('profileMenuDropdown');
    const menuAdminBtn = document.getElementById('menuAdminBtn');
    const menuTentangBtn = document.getElementById('menuTentangBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    const closeAboutModal = document.getElementById('closeAboutModal');

    if (profileMenuToggle) {
        profileMenuToggle.addEventListener('click', e => {
            e.stopPropagation();
            if (profileMenuDropdown) {
                profileMenuDropdown.classList.toggle('active');
            }
        });
    }

    if (menuAdminBtn) {
        menuAdminBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (profileMenuDropdown) profileMenuDropdown.classList.remove('active');
            goToView('admin');
        });
    }

    if (menuTentangBtn) {
        menuTentangBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (profileMenuDropdown) profileMenuDropdown.classList.remove('active');
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) aboutModal.classList.add('active');
        });
    }

    if (menuLogoutBtn) {
        menuLogoutBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (profileMenuDropdown) profileMenuDropdown.classList.remove('active');
            if (state.currentUser && auth) {
                auth.signOut().then(() => {
                    showToast('Berhasil keluar dari akun', 'success');
                    goToView('explore');
                }).catch(err => {
                    showToast('Gagal keluar: ' + err.message, 'error');
                });
            } else {
                promptLogin('Silakan masuk atau daftar akun gratis');
            }
        });
    }

    if (closeAboutModal) {
        closeAboutModal.addEventListener('click', () => {
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) aboutModal.classList.remove('active');
        });
    }

    document.addEventListener('click', e => {
        if (profileMenuDropdown && profileMenuDropdown.classList.contains('active')) {
            if (!e.target.closest('#profileMenuDropdown') && !e.target.closest('#profileMenuToggle')) {
                profileMenuDropdown.classList.remove('active');
            }
        }
    });

    // Upload Form Bindings
    const closeUploadModal = document.getElementById('closeUploadModal');
    if (closeUploadModal) {
        closeUploadModal.addEventListener('click', () => {
            const modal = document.getElementById('uploadModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const form = document.getElementById('uploadForm');
            if (form) form.reset();
            const fKodeEl = document.getElementById('fKode');
            if (fKodeEl) fKodeEl.value = generateKode(6);
            const priceWrapper = document.getElementById('priceWrapper');
            if (priceWrapper) priceWrapper.classList.remove('active');
            const customCategoryGroup = document.getElementById('customCategoryGroup');
            if (customCategoryGroup) customCategoryGroup.style.display = 'none';
            updateFileLinksVisibility('free');
        });
    }

    const fRandomKodeBtn = document.getElementById('fRandomKodeBtn');
    if (fRandomKodeBtn) {
        fRandomKodeBtn.addEventListener('click', () => {
            const fKodeEl = document.getElementById('fKode');
            if (fKodeEl) fKodeEl.value = generateKode(6);
        });
    }

    const eTRandomKodeBtn = document.getElementById('eTRandomKodeBtn');
    if (eTRandomKodeBtn) {
        eTRandomKodeBtn.addEventListener('click', () => {
            const eTKodeEl = document.getElementById('eTKode');
            if (eTKodeEl) eTKodeEl.value = generateKode(6);
        });
    }

    ['fKode', 'eTKode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10);
            });
        }
    });

    const fLicense = document.getElementById('fLicense');
    if (fLicense) {
        fLicense.addEventListener('change', function() {
            const wrap = document.getElementById('priceWrapper');
            const harga = document.getElementById('fHarga');
            if (this.value === 'paid') {
                if (wrap) wrap.classList.add('active');
                if (harga) harga.setAttribute('required', 'required');
            } else {
                if (wrap) wrap.classList.remove('active');
                if (harga) {
                    harga.removeAttribute('required');
                    harga.value = '';
                }
            }
            updateFileLinksVisibility(this.value);
        });
    }

    const fKategori = document.getElementById('fKategori');
    if (fKategori) {
        fKategori.addEventListener('change', function() {
            const customGroup = document.getElementById('customCategoryGroup');
            const customInput = document.getElementById('fCustomKategori');
            if (this.value === 'Lainnya') {
                if (customGroup) customGroup.style.display = 'block';
                if (customInput) customInput.setAttribute('required', 'required');
            } else {
                if (customGroup) customGroup.style.display = 'none';
                if (customInput) {
                    customInput.removeAttribute('required');
                    customInput.value = '';
                }
            }
        });
    }

    const fStyle = document.getElementById('fStyle');
    if (fStyle) {
        fStyle.addEventListener('change', function() {
            const customGroup = document.getElementById('fStyleCustomGroup');
            const customInput = document.getElementById('fCustomStyle');
            if (this.value === 'Lainnya') {
                if (customGroup) customGroup.style.display = 'block';
                if (customInput) customInput.setAttribute('required', 'required');
            } else {
                if (customGroup) customGroup.style.display = 'none';
                if (customInput) {
                    customInput.removeAttribute('required');
                    customInput.value = '';
                }
            }
        });
    }

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!state.currentUser || !db) { showToast('Firebase belum siap atau Anda belum login', 'error'); return; }
            if (!state.isCreator || !state.currentUserCreator) { showToast('Anda belum terdaftar sebagai kreator', 'error'); return; }

            const judul = document.getElementById('fJudul').value.trim();
            let rawKode = (document.getElementById('fKode') ? document.getElementById('fKode').value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10) : '');
            if (!rawKode) rawKode = generateKode(6);

            let kategori = document.getElementById('fKategori').value;
            const customKategori = document.getElementById('fCustomKategori').value.trim();
            if (kategori === 'Lainnya') {
                if (!customKategori) { showToast('Tulis nama kategori lainnya', 'error'); return; }
                kategori = customKategori;
            }

            let style = document.getElementById('fStyle') ? document.getElementById('fStyle').value : '';
            const customStyle = document.getElementById('fCustomStyle') ? document.getElementById('fCustomStyle').value.trim() : '';
            if (style === 'Lainnya') {
                style = customStyle || 'Lainnya';
            }

            const deskripsi = document.getElementById('fDeskripsi').value.trim();
            const linkYoutube = document.getElementById('fLinkYoutube').value.trim();
            const aspect = document.getElementById('fAspect').value;
            const license = document.getElementById('fLicense').value;
            const harga = parseInt(document.getElementById('fHarga').value, 10) || 0;
            const linkProject = document.getElementById('fLinkProject').value.trim();
            const linkDrive = document.getElementById('fLinkDrive').value.trim();
            const linkAsset1 = document.getElementById('fLinkAsset1').value.trim();
            const linkAsset2 = document.getElementById('fLinkAsset2').value.trim();

            if (!judul || !kategori || !aspect) { showToast('Judul, kategori, dan aspect ratio wajib diisi', 'error'); return; }
            if (license === 'paid' && !harga) { showToast('Isi harga untuk template berbayar', 'error'); return; }

            const data = {
                judul: judul,
                kategori: kategori,
                style: style,
                deskripsi: deskripsi,
                linkYoutube: linkYoutube,
                aspectRatio: aspect,
                license: license,
                harga: harga,
                linkProject: license === 'free' ? linkProject : '',
                linkDrive: license === 'free' ? linkDrive : '',
                linkAsset1: license === 'free' ? linkAsset1 : '',
                linkAsset2: license === 'free' ? linkAsset2 : '',
                creator: state.currentUserCreator.name || 'Anonim',
                creatorUid: state.currentUser.uid,
                kode: rawKode,
                likes: 0,
                uses: 0,
                views: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            addTemplate(data)
                .then(() => {
                    showToast('Template berhasil dipublikasikan!', 'success');
                    document.getElementById('uploadModal').classList.remove('active');
                    uploadForm.reset();
                    const wrap = document.getElementById('priceWrapper');
                    if (wrap) wrap.classList.remove('active');
                    const catGroup = document.getElementById('customCategoryGroup');
                    if (catGroup) catGroup.style.display = 'none';
                    updateFileLinksVisibility('free');
                })
                .catch(err => { showToast('Gagal upload: ' + err.message, 'error'); });
        });
    }

    // Modal register creator
    setupMultiStepForm({
        formEl: document.getElementById('registerCreatorForm'),
        progressEl: document.getElementById('modalStepProgress'),
        trackEl: document.getElementById('modalStepTrack'),
        prefix: 'r'
    });

    const rUsernameEl = document.getElementById('rUsername');
    if (rUsernameEl) {
        rUsernameEl.addEventListener('input', function() {
            const val = this.value.trim();
            const hint = document.getElementById('usernameHint');
            if (val.length < 3) {
                if (hint) hint.innerHTML = 'Min 3 karakter, hanya huruf/angka/garis bawah. <span class="cross">&cross;</span> Terlalu pendek';
                this.dataset.checked = 'false';
                return;
            }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
                if (hint) hint.innerHTML = 'Min 3 karakter, hanya huruf/angka/garis bawah. <span class="cross">&cross;</span> Karakter tidak valid';
                this.dataset.checked = 'false';
                return;
            }
            const exists = state.allCreators.some(c => (c.name || '').toLowerCase() === val.toLowerCase());
            if (exists) {
                if (hint) hint.innerHTML = 'Min 3 karakter, hanya huruf/angka/garis bawah. <span class="cross">&cross;</span> Username sudah dipakai';
                this.dataset.checked = 'false';
            } else {
                if (hint) hint.innerHTML = 'Min 3 karakter, hanya huruf/angka/garis bawah. <span class="check">&check;</span> Tersedia';
                this.dataset.checked = 'true';
            }
        });
    }

    const regCreatorFormEl = document.getElementById('registerCreatorForm');
    if (regCreatorFormEl) {
        regCreatorFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!state.currentUser || !db) { showToast('Firebase belum siap atau Anda belum login', 'error'); return; }
            const nameEl = document.getElementById('rUsername');
            const name = nameEl ? nameEl.value.trim() : '';
            const displayNameEl = document.getElementById('rDisplayName');
            const displayName = displayNameEl ? displayNameEl.value.trim() : '';
            if (!name) { showToast('Username wajib diisi', 'error'); return; }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) { showToast('Username hanya huruf/angka/garis bawah, min 3 karakter', 'error'); return; }
            if (!displayName) { showToast('Nama tampilan wajib diisi', 'error'); return; }
            if (state.allCreators.some(c => (c.name || '').toLowerCase() === name.toLowerCase())) { showToast('Username sudah terdaftar', 'error'); return; }
            const software = getSelectedSoftwareValues('r');
            if (!software) { showToast('Pilih software yang digunakan', 'error'); return; }
            const bioEl = document.getElementById('rBio');
            const waEl = document.getElementById('rWa');
            const emailEl = document.getElementById('rEmail');
            const portEl = document.getElementById('rPortfolio');
            const sourceType = (document.getElementById('rAvatarSourceType') && document.getElementById('rAvatarSourceType').value) || 'custom';
            const avatarColor = (document.getElementById('rAvatarColor') && document.getElementById('rAvatarColor').value) || AVATAR_PALETTE[0].bg;
            const photoURL = (sourceType === 'google' && state.currentUser && state.currentUser.photoURL) ? state.currentUser.photoURL : '';
            const data = {
                name: name,
                displayName: displayName,
                bio: bioEl ? bioEl.value.trim() : '',
                software: software,
                wa: waEl ? waEl.value.trim() : '',
                email: emailEl ? emailEl.value.trim() : '',
                portfolio: portEl ? portEl.value.trim() : '',
                avatarColor: avatarColor,
                photoURL: photoURL,
                avatarSource: sourceType,
                uid: state.currentUser.uid,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            addCreator(data)
                .then(() => {
                    showToast('Selamat! Kamu sekarang kreator Preset Library', 'success');
                    regCreatorFormEl.reset();
                    const modal = document.getElementById('registerCreatorModal');
                    if (modal) modal.classList.remove('active');
                    state.isCreator = true;
                    state.currentUserCreator = data;
                    state.currentUserCreatorId = state.currentUser.uid;
                    buildDesktopNav();
                    buildMobileNav();
                    subscribeCreators();
                    if (state.currentView === 'creators' && !state.currentCreator) renderCreatorDirectory();
                    else render();
                })
                .catch(err => { showToast('Gagal daftar: ' + err.message, 'error'); });
        });
    }

    const cancelRegBtn = document.getElementById('cancelRegister');
    if (cancelRegBtn) {
        cancelRegBtn.addEventListener('click', () => {
            const modal = document.getElementById('registerCreatorModal');
            if (modal) modal.classList.remove('active');
        });
    }
    const closeRegBtn = document.getElementById('closeRegisterModal');
    if (closeRegBtn) {
        closeRegBtn.addEventListener('click', () => {
            const modal = document.getElementById('registerCreatorModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // Edit Template Events
    const eTKategori = document.getElementById('eTKategori');
    if (eTKategori) {
        eTKategori.addEventListener('change', function() {
            const customGroup = document.getElementById('eTCustomCategoryGroup');
            const customInput = document.getElementById('eTCustomKategori');
            if (this.value === 'Lainnya') {
                if (customGroup) customGroup.style.display = 'block';
                if (customInput) customInput.setAttribute('required', 'required');
            } else {
                if (customGroup) customGroup.style.display = 'none';
                if (customInput) {
                    customInput.removeAttribute('required');
                    customInput.value = '';
                }
            }
        });
    }

    const eTStyle = document.getElementById('eTStyle');
    if (eTStyle) {
        eTStyle.addEventListener('change', function() {
            const customGroup = document.getElementById('eTStyleCustomGroup');
            const customInput = document.getElementById('eTCustomStyle');
            if (this.value === 'Lainnya') {
                if (customGroup) customGroup.style.display = 'block';
                if (customInput) customInput.setAttribute('required', 'required');
            } else {
                if (customGroup) customGroup.style.display = 'none';
                if (customInput) {
                    customInput.removeAttribute('required');
                    customInput.value = '';
                }
            }
        });
    }

    const eTLicense = document.getElementById('eTLicense');
    if (eTLicense) {
        eTLicense.addEventListener('change', function() {
            const wrap = document.getElementById('eTPriceWrapper');
            const section = document.getElementById('eTFileLinksSection');
            const hint = document.getElementById('eTFileLinksHint');
            if (this.value === 'paid') {
                if (wrap) wrap.classList.add('active');
                if (section) {
                    section.style.opacity = '0.4';
                    section.style.pointerEvents = 'none';
                }
                if (hint) hint.innerHTML = 'Untuk template <strong>berbayar</strong>, link tidak ditampilkan.';
            } else {
                if (wrap) wrap.classList.remove('active');
                if (section) {
                    section.style.opacity = '1';
                    section.style.pointerEvents = 'auto';
                }
                if (hint) hint.innerHTML = 'Untuk template <strong>gratis</strong>, sertakan link download.';
            }
        });
    }

    const editTemplateForm = document.getElementById('editTemplateForm');
    if (editTemplateForm) {
        editTemplateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!db) { showToast('Firebase belum siap', 'error'); return; }
            const id = document.getElementById('eTEditId').value;
            if (!id) { showToast('ID template tidak ditemukan', 'error'); return; }

            const judul = document.getElementById('eTJudul').value.trim();
            let rawKode = (document.getElementById('eTKode') ? document.getElementById('eTKode').value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10) : '');
            if (!rawKode) rawKode = generateKode(6);

            let kategori = document.getElementById('eTKategori').value;
            const customKategori = document.getElementById('eTCustomKategori').value.trim();
            if (kategori === 'Lainnya') {
                if (!customKategori) { showToast('Tulis nama kategori lainnya', 'error'); return; }
                kategori = customKategori;
            }

            let style = document.getElementById('eTStyle') ? document.getElementById('eTStyle').value : '';
            const customStyle = document.getElementById('eTCustomStyle') ? document.getElementById('eTCustomStyle').value.trim() : '';
            if (style === 'Lainnya') {
                style = customStyle || 'Lainnya';
            }

            const deskripsi = document.getElementById('eTDeskripsi').value.trim();
            const linkYoutube = document.getElementById('eTLinkYoutube').value.trim();
            const aspect = document.getElementById('eTAspect').value;
            const license = document.getElementById('eTLicense').value;
            const harga = parseInt(document.getElementById('eTHarga').value, 10) || 0;
            const linkProject = document.getElementById('eTLinkProject').value.trim();
            const linkDrive = document.getElementById('eTLinkDrive').value.trim();
            const linkAsset1 = document.getElementById('eTLinkAsset1').value.trim();
            const linkAsset2 = document.getElementById('eTLinkAsset2').value.trim();

            if (!judul || !kategori || !aspect) { showToast('Judul, kategori, dan aspect ratio wajib diisi', 'error'); return; }
            if (license === 'paid' && !harga) { showToast('Isi harga untuk template berbayar', 'error'); return; }

            const data = {
                judul: judul,
                kode: rawKode,
                kategori: kategori,
                style: style,
                deskripsi: deskripsi,
                linkYoutube: linkYoutube,
                aspectRatio: aspect,
                license: license,
                harga: harga,
                linkProject: license === 'free' ? linkProject : '',
                linkDrive: license === 'free' ? linkDrive : '',
                linkAsset1: license === 'free' ? linkAsset1 : '',
                linkAsset2: license === 'free' ? linkAsset2 : ''
            };

            updateTemplate(id, data)
                .then(() => {
                    showToast('Template berhasil diperbarui!', 'success');
                    document.getElementById('editTemplateModal').classList.remove('active');
                    const idx = state.allTemplates.findIndex(t => t.id === id);
                    if (idx !== -1) state.allTemplates[idx] = Object.assign({}, state.allTemplates[idx], data);
                    render();
                })
                .catch(err => { showToast('Gagal update: ' + err.message, 'error'); });
        });
    }

    const closeEditTemplateModal = document.getElementById('closeEditTemplateModal');
    if (closeEditTemplateModal) {
        closeEditTemplateModal.addEventListener('click', () => {
            const modal = document.getElementById('editTemplateModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const cancelEditTemplate = document.getElementById('cancelEditTemplate');
    if (cancelEditTemplate) {
        cancelEditTemplate.addEventListener('click', () => {
            const modal = document.getElementById('editTemplateModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // Login & Register Form Handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!auth) { showToast('Firebase belum siap.', 'error'); return; }
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');
            if (errorEl) errorEl.style.display = 'none';
            const btn = document.getElementById('loginSubmitBtn');
            if (btn) {
                btn.textContent = 'Memproses...';
                btn.disabled = true;
            }
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    showToast('Selamat datang kembali!', 'success');
                    const m = document.getElementById('loginModal');
                    if (m) m.classList.remove('active');
                    loginForm.reset();
                })
                .catch(err => {
                    if (errorEl) {
                        errorEl.style.display = 'block';
                        let msg = err.message;
                        if (err.code === 'auth/user-not-found') msg = 'Email tidak terdaftar';
                        else if (err.code === 'auth/wrong-password') msg = 'Password salah';
                        else if (err.code === 'auth/invalid-email') msg = 'Format email tidak valid';
                        else if (err.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
                        errorEl.textContent = msg;
                    }
                    showToast(err.message, 'error');
                })
                .finally(() => {
                    if (btn) {
                        btn.textContent = 'Masuk';
                        btn.disabled = false;
                    }
                });
        });
    }

    const registerAuthForm = document.getElementById('registerAuthForm');
    if (registerAuthForm) {
        registerAuthForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!auth) { showToast('Firebase belum siap.', 'error'); return; }
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const errorEl = document.getElementById('registerError');
            if (errorEl) errorEl.style.display = 'none';
            if (password.length < 6) {
                if (errorEl) {
                    errorEl.style.display = 'block';
                    errorEl.textContent = 'Password minimal 6 karakter';
                }
                showToast('Password minimal 6 karakter', 'error');
                return;
            }
            const btn = document.getElementById('registerSubmitBtn');
            if (btn) {
                btn.textContent = 'Memproses...';
                btn.disabled = true;
            }
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    showToast('Akun berhasil dibuat! Silakan daftar sebagai kreator.', 'success');
                    const m = document.getElementById('loginModal');
                    if (m) m.classList.remove('active');
                    registerAuthForm.reset();
                    setTimeout(openRegisterModal, 500);
                })
                .catch(err => {
                    if (errorEl) {
                        errorEl.style.display = 'block';
                        let msg = err.message;
                        if (err.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar';
                        else if (err.code === 'auth/invalid-email') msg = 'Format email tidak valid';
                        else if (err.code === 'auth/weak-password') msg = 'Password terlalu lemah (min 6 karakter)';
                        errorEl.textContent = msg;
                    }
                    showToast(err.message, 'error');
                })
                .finally(() => {
                    if (btn) {
                        btn.textContent = 'Daftar';
                        btn.disabled = false;
                    }
                });
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (auth) auth.signOut().then(() => showToast('Berhasil keluar', 'info')).catch(() => {});
        });
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openLoginModal());
    }

    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', () => {
            const m = document.getElementById('loginModal');
            if (m) m.classList.remove('active');
        });
    }

    const cancelLoginBtn = document.getElementById('cancelLogin');
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', () => {
            const m = document.getElementById('loginModal');
            if (m) m.classList.remove('active');
        });
    }

    const cancelAuthRegBtn = document.getElementById('cancelRegisterAuth');
    if (cancelAuthRegBtn) {
        cancelAuthRegBtn.addEventListener('click', () => {
            const m = document.getElementById('loginModal');
            if (m) m.classList.remove('active');
        });
    }

    const closeAkunBtn = document.getElementById('closeAkunModal');
    if (closeAkunBtn) {
        closeAkunBtn.addEventListener('click', () => {
            const modal = document.getElementById('akunModal');
            if (modal) modal.classList.remove('active');
        });
    }

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('.akun-section-tabs button').forEach(tabBtn => {
        tabBtn.addEventListener('click', function() {
            document.querySelectorAll('.akun-section-tabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const targetTab = this.dataset.tab;
            const tabProfil = document.getElementById('tabProfileContent');
            const tabLiked = document.getElementById('tabLikedContent');
            if (tabProfil && tabLiked) {
                if (targetTab === 'liked') {
                    tabProfil.style.display = 'none';
                    tabLiked.style.display = 'block';
                    tabLiked.innerHTML = renderAkunLikedTemplates();
                    bindAkunLikedEvents();
                } else {
                    tabProfil.style.display = 'block';
                    tabLiked.style.display = 'none';
                }
            }
        });
    });

    const switchToRegisterBtn = document.getElementById('switchToRegister');
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', () => {
            const lf = document.getElementById('loginForm');
            const rf = document.getElementById('registerAuthForm');
            const lt = document.getElementById('loginModalTitle');
            const le = document.getElementById('loginError');
            const re = document.getElementById('registerError');
            if (lf) lf.style.display = 'none';
            if (rf) rf.style.display = 'block';
            if (lt) lt.textContent = 'Daftar Akun';
            if (le) le.style.display = 'none';
            if (re) re.style.display = 'none';
        });
    }

    const switchToLoginBtn = document.getElementById('switchToLogin');
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', () => {
            const lf = document.getElementById('loginForm');
            const rf = document.getElementById('registerAuthForm');
            const lt = document.getElementById('loginModalTitle');
            const le = document.getElementById('loginError');
            const re = document.getElementById('registerError');
            if (lf) lf.style.display = 'block';
            if (rf) rf.style.display = 'none';
            if (lt) lt.textContent = 'Masuk';
            if (le) le.style.display = 'none';
            if (re) re.style.display = 'none';
        });
    }

    const googleModalLoginBtn = document.getElementById('googleModalLoginBtn');
    if (googleModalLoginBtn) {
        googleModalLoginBtn.addEventListener('click', () => signInWithGoogle());
    }

    const userBadgeEl = document.getElementById('userBadge');
    if (userBadgeEl) {
        userBadgeEl.addEventListener('click', () => goToView('profile'));
    }

    const notifWrap = document.getElementById('notifWrap');
    if (notifWrap) {
        notifWrap.addEventListener('click', () => openNotifModal());
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            const activeInput = document.activeElement;
            if (activeInput && activeInput.tagName === 'INPUT' && activeInput.type === 'text') {
                activeInput.blur();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const expInput = document.getElementById('explorePageSearch');
            const homeInput = document.getElementById('homeSearchInput');
            const deskInput = document.getElementById('searchInput');
            const mobInput = document.getElementById('searchInputMobile');

            if (state.currentView === 'cari' && expInput) {
                expInput.focus();
                expInput.select();
            } else if (homeInput && homeInput.offsetParent !== null) {
                homeInput.focus();
                homeInput.select();
            } else if (deskInput && deskInput.offsetParent !== null) {
                deskInput.focus();
                deskInput.select();
            } else if (mobInput) {
                const bar = document.getElementById('mobileSearchBar');
                if (bar) bar.classList.add('open');
                mobInput.focus();
                mobInput.select();
            }
        }
    });

    window.addEventListener('hashchange', handleHashChange);
}

// ===== INITIALIZATION =====
export function init() {
    const cardGrid = document.getElementById('cardGrid');
    if (cardGrid) {
        cardGrid.innerHTML = renderSkeletonGrid(12);
    }
    
    attachEventListeners();
    initFirebase(
        (user) => {
            updateAuthUI(user);
        },
        () => {
            if (state.pendingHash) {
                const h = state.pendingHash;
                state.pendingHash = null;
                processHash(h);
            } else {
                render();
            }
        },
        () => {
            if (state.currentUser) {
                checkIfCreator(state.currentUser.uid).then(() => {
                    buildDesktopNav();
                    buildMobileNav();
                    if (state.currentView === 'creators' || state.currentView === 'profile' || state.currentView === 'dashboard' || state.currentView === 'admin') {
                        render();
                    }
                });
            } else if (state.currentView === 'creators' || state.currentView === 'profile' || state.currentView === 'admin') {
                render();
            }
        }
    );

    setTimeout(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            if (state.dataLoaded) {
                processHash(hash);
            } else {
                state.pendingHash = hash;
            }
        } else {
            processHash('');
        }
    }, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
