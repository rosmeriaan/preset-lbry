/**
 * firebase.js
 * Firebase initialization, Authentication helpers, and Firestore services.
 */

import { state } from './state.js';
import { showToast } from './utils.js';

export var auth = null;
export var db = null;
export var firebase = typeof window !== 'undefined' ? window.firebase : null;
export var firebaseInitialized = false;

const firebaseConfig = {
    apiKey: "AIzaSyDTqzvWQUcR4piWnprU7baAp-CRgbWRFxE",
    authDomain: "preset-lbry.firebaseapp.com",
    projectId: "preset-lbry",
    storageBucket: "preset-lbry.firebasestorage.app",
    messagingSenderId: "753769822591",
    appId: "1:753769822591:web:7cd6eae45f4a8c4936c24a",
    measurementId: "G-CCT5VC473G"
};

export function initFirebase(onAuthChanged, onTemplatesUpdated, onCreatorsUpdated) {
    if (typeof window.firebase === 'undefined') {
        console.error('Firebase SDK not found on window');
        state.dataLoaded = true;
        return;
    }

    try {
        if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
        }
        auth = window.firebase.auth();
        db = window.firebase.firestore();
        firebase = window.firebase;
        firebaseInitialized = true;
        db.enablePersistence({ synchronizeTabs: true }).catch(function() {});
        state.firebaseInitialized = true;

        // Attach Auth State Listener to sync login session
        auth.onAuthStateChanged(function(user) {
            if (onAuthChanged) {
                onAuthChanged(user);
            }
        });

        // Handle redirect result if signInWithRedirect was triggered
        auth.getRedirectResult().then(function(result) {
            if (result && result.user) {
                showToast('Selamat datang, ' + (result.user.displayName || result.user.email) + '!', 'success');
            }
        }).catch(function(err) {
            if (err && err.code !== 'auth/credential-already-in-use') {
                console.warn('Redirect auth result:', err.message);
            }
        });

        subscribeTemplates(onTemplatesUpdated);
        subscribeCreators(onCreatorsUpdated);
    } catch (e) {
        console.error('Firebase init error:', e.message);
        state.allTemplates = [];
        state.allCreators = [];
        state.dataLoaded = true;
    }
}

// ===== AUTH HELPERS =====
export function signInWithGoogle() {
    if (!auth) {
        showToast('Firebase Auth belum siap.', 'error');
        return Promise.reject('Auth not ready');
    }
    const provider = new window.firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider)
        .then(function(result) {
            const user = result.user;
            showToast('Selamat datang, ' + (user.displayName || user.email) + '!', 'success');
            const m = document.getElementById('loginModal');
            if (m) m.classList.remove('active');
            return user;
        })
        .catch(function(err) {
            if (err.code === 'auth/popup-blocked') {
                auth.signInWithRedirect(provider);
            } else if (err.code !== 'auth/popup-closed-by-user') {
                showToast(err.message || 'Gagal masuk dengan Google', 'error');
            }
            throw err;
        });
}

export function loginWithEmail(email, password) {
    if (!auth) return Promise.reject(new Error('Firebase belum siap.'));
    return auth.signInWithEmailAndPassword(email, password);
}

export function registerWithEmail(email, password) {
    if (!auth) return Promise.reject(new Error('Firebase belum siap.'));
    return auth.createUserWithEmailAndPassword(email, password);
}

export function signOutUser() {
    if (!auth) return Promise.resolve();
    return auth.signOut();
}

// ===== CREATORS =====
export function addCreator(data) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    if (data.uid) {
        return db.collection('creators').doc(data.uid).set(data);
    }
    return db.collection('creators').add(data);
}

export function checkIfCreator(uid) {
    if (!uid || !db) return Promise.resolve(false);
    return db.collection('creators').doc(uid).get()
        .then(function(doc) {
            if (doc.exists) {
                state.isCreator = true;
                const creatorData = doc.data() || {};
                creatorData.id = doc.id;
                if (state.currentUser && state.currentUser.photoURL && creatorData.photoURL !== state.currentUser.photoURL) {
                    creatorData.photoURL = state.currentUser.photoURL;
                    db.collection('creators').doc(uid).update({ photoURL: state.currentUser.photoURL }).catch(function() {});
                }
                state.currentUserCreator = creatorData;
                state.currentUserCreatorId = uid;
                return true;
            }

            // Fallback 1: check in loaded creators
            const found = state.allCreators.find(function(c) {
                return c.uid === uid || (state.currentUser && state.currentUser.email && c.email && c.email.toLowerCase() === state.currentUser.email.toLowerCase());
            });
            if (found) {
                state.isCreator = true;
                state.currentUserCreator = found;
                state.currentUserCreatorId = found.id || found.uid || uid;
                return true;
            }

            // Fallback 2: query firestore where uid == uid
            return db.collection('creators').where('uid', '==', uid).get()
                .then(function(snapshot) {
                    if (!snapshot.empty) {
                        const firstDoc = snapshot.docs[0];
                        state.isCreator = true;
                        const data = firstDoc.data() || {};
                        data.id = firstDoc.id;
                        state.currentUserCreator = data;
                        state.currentUserCreatorId = firstDoc.id;
                        return true;
                    }
                    state.isCreator = false;
                    state.currentUserCreator = null;
                    state.currentUserCreatorId = null;
                    return false;
                });
        })
        .catch(function() {
            state.isCreator = false;
            state.currentUserCreator = null;
            state.currentUserCreatorId = null;
            return false;
        });
}

export function updateCreator(docId, data) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    if (!docId) return Promise.reject(new Error('Missing creator identifier'));

    // Try direct document update first
    const docRef = db.collection('creators').doc(docId);
    return docRef.get().then(function(snap) {
        if (snap.exists) {
            return docRef.update(data);
        }
        // Fallback: search by uid
        return db.collection('creators').where('uid', '==', docId).get().then(function(querySnap) {
            if (!querySnap.empty) {
                return querySnap.docs[0].ref.update(data);
            }
            // Fallback: search by name
            return db.collection('creators').where('name', '==', docId).get().then(function(nameSnap) {
                if (!nameSnap.empty) {
                    return nameSnap.docs[0].ref.update(data);
                }
                // If not exists yet, create or merge with docId
                return docRef.set(data, { merge: true });
            });
        });
    });
}

// ===== TEMPLATES CRUD =====
export function addTemplate(data) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    return db.collection('templates').add(data);
}

export function updateTemplate(docId, data) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    return db.collection('templates').doc(docId).update(data);
}

export function deleteTemplate(docId) {
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    return db.collection('templates').doc(docId).delete();
}

export function incrementField(docId, field, amount) {
    amount = amount || 1;
    if (!db) return Promise.reject(new Error('Firestore not ready'));
    return db.collection('templates').doc(docId).update({
        [field]: window.firebase.firestore.FieldValue.increment(amount)
    });
}

// ===== VIEWS & LIKES =====
export function hasUserViewed(templateId, userId) {
    if (!db || !userId) return Promise.resolve(false);
    return db.collection('templates').doc(templateId).collection('views').doc(userId).get()
        .then(function(doc) { return doc.exists; });
}

export function recordView(templateId, userId) {
    if (!db || !userId) return Promise.resolve();
    return db.collection('templates').doc(templateId).collection('views').doc(userId).set({
        viewedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        userId: userId
    });
}

export function hasUserLiked(templateId, userId) {
    if (!db || !userId) return Promise.resolve(false);
    return db.collection('templates').doc(templateId).collection('likes').doc(userId).get()
        .then(function(doc) { return doc.exists; });
}

export function toggleLike(templateId, userId) {
    if (!db || !userId) return Promise.reject(new Error('Not logged in'));
    const templateRef = db.collection('templates').doc(templateId);
    const likeRef = templateRef.collection('likes').doc(userId);

    return db.runTransaction(function(transaction) {
        return transaction.get(templateRef).then(function(doc) {
            if (!doc.exists) throw new Error('Template tidak ditemukan');
            return transaction.get(likeRef).then(function(likeDoc) {
                const currentLikes = doc.data().likes || 0;
                if (likeDoc.exists) {
                    transaction.delete(likeRef);
                    transaction.update(templateRef, { likes: window.firebase.firestore.FieldValue.increment(-1) });
                    return { action: 'unliked', newLikes: currentLikes - 1 };
                } else {
                    transaction.set(likeRef, {
                        likedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                        userId: userId
                    });
                    transaction.update(templateRef, { likes: window.firebase.firestore.FieldValue.increment(1) });
                    return { action: 'liked', newLikes: currentLikes + 1 };
                }
            });
        });
    });
}

// ===== MARKETPLACE HELPERS =====
export function addOrder(orderData) {
    if (!db) return Promise.resolve(null);
    return db.collection('orders').add(orderData);
}

export function fetchOrdersForUser(uid) {
    if (!db) return Promise.resolve([]);
    return db.collection('orders')
        .where('buyerUid', '==', uid)
        .get()
        .then(function(snapshot) {
            const orders = [];
            snapshot.forEach(function(doc) {
                const data = doc.data();
                data.id = doc.id;
                orders.push(data);
            });
            return orders.sort(function(a, b) {
                return (b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0) - (a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0);
            });
        }).catch(function() { return []; });
}

export function addWithdrawal(withdrawalData) {
    if (!db) return Promise.resolve(null);
    return db.collection('withdrawals').add(withdrawalData);
}

export function fetchWithdrawalsForCreator(uid) {
    if (!db) return Promise.resolve([]);
    return db.collection('withdrawals')
        .where('creatorUid', '==', uid)
        .get()
        .then(function(snapshot) {
            const list = [];
            snapshot.forEach(function(doc) {
                const data = doc.data();
                data.id = doc.id;
                list.push(data);
            });
            return list.sort(function(a, b) {
                return (b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0) - (a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0);
            });
        }).catch(function() { return []; });
}

export function addNotification(notifData) {
    if (!db) return Promise.resolve(null);
    return db.collection('notifications').add(notifData);
}

export function fetchNotificationsForUser(uid) {
    if (!db) return Promise.resolve([]);
    return db.collection('notifications')
        .where('recipientUid', '==', uid)
        .get()
        .then(function(snapshot) {
            const notifs = [];
            snapshot.forEach(function(doc) {
                const data = doc.data();
                data.id = doc.id;
                notifs.push(data);
            });
            return notifs.sort(function(a, b) {
                return (b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0) - (a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0);
            });
        }).catch(function() { return []; });
}

// ===== SUBSCRIPTIONS =====
export function subscribeTemplates(callback) {
    if (!db) {
        state.allTemplates = [];
        state.dataLoaded = true;
        if (callback) callback();
        return;
    }
    if (state.unsubscribeTemplates) state.unsubscribeTemplates();
    state.unsubscribeTemplates = db.collection('templates')
        .orderBy('createdAt', 'desc')
        .onSnapshot(function(snapshot) {
            const list = [];
            snapshot.forEach(function(doc) {
                const data = doc.data();
                data.id = doc.id;
                list.push(data);
            });
            state.allTemplates = list;
            state.dataLoaded = true;
            if (callback) callback();
        }, function(err) {
            console.warn('Templates subscription error:', err.message);
            state.allTemplates = [];
            state.dataLoaded = true;
            if (callback) callback();
        });
}

export function subscribeCreators(callback) {
    if (!db) {
        state.allCreators = [];
        if (callback) callback();
        return;
    }
    if (state.unsubscribeCreators) state.unsubscribeCreators();
    state.unsubscribeCreators = db.collection('creators')
        .orderBy('name')
        .onSnapshot(function(snapshot) {
            const list = [];
            snapshot.forEach(function(doc) {
                const data = doc.data();
                data.id = doc.id;
                list.push(data);
            });
            state.allCreators = list;
            if (state.currentUser && state.currentUserCreatorId) {
                const updated = state.allCreators.find(function(c) {
                    return c.id === state.currentUserCreatorId || c.uid === state.currentUserCreatorId;
                });
                if (updated) {
                    if (state.currentUser.photoURL && !updated.photoURL) {
                        updated.photoURL = state.currentUser.photoURL;
                    }
                    state.currentUserCreator = updated;
                }
            }
            if (callback) callback();
        }, function(err) {
            console.warn('Creators subscription error:', err.message);
            state.allCreators = [];
            if (callback) callback();
        });
}
