/**
 * state.js
 * Centralized global state management for the application.
 */

export const state = {
    allTemplates: [],
    allCreators: [],
    userOrders: [],
    userNotifications: [],
    creatorWithdrawals: [],
    likedTemplateIds: new Set(),
    viewedTemplates: {},
    
    currentUser: null,
    currentUserCreator: null,
    currentUserCreatorId: null,
    isCreator: false,
    isAdmin: false,
    dataLoaded: false,
    firebaseInitialized: false,

    currentView: 'home',
    currentCreator: null,
    currentProfileTab: 'templates',
    currentAkunTab: 'profile',
    currentAdminTab: 'creators',
    adminCreatorSearch: '',
    adminCreatorFilterStatus: 'all',
    
    activeFilter: 'all',
    activeRatio: null,
    activeSort: 'terbaru',
    cariSearchQuery: '',
    pendingHash: null,

    unsubscribeTemplates: null,
    unsubscribeCreators: null,
    
    cardGrid: null
};

export function getCardGrid() {
    if (!state.cardGrid) {
        state.cardGrid = document.getElementById('cardGrid');
    }
    return state.cardGrid;
}
