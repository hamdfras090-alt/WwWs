// notifications.js - Browser Notifications System

// Check if browser supports notifications
function isNotificationSupported() {
    return 'Notification' in window;
}

// Get notification permission status
function getNotificationPermission() {
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission;
}

// Request notification permission
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        alert('عذراً، متصفحك لا يدعم الإشعارات 😔');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            localStorage.setItem('notificationsEnabled', 'true');
            updateNotificationButton(true);

            // Show welcome notification
            showNotification(
                '🎉 تم تفعيل الإشعارات!',
                'سنخبرك عند إضافة مواد جديدة',
                'sheetaty_logo.jpg'
            );

            return true;
        } else if (permission === 'denied') {
            alert('⚠️ تم رفض الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Disable notifications
function disableNotifications() {
    localStorage.setItem('notificationsEnabled', 'false');
    updateNotificationMenu(false);
    closeNotificationMenu();
    alert('تم إيقاف الإشعارات ✓');
}

// Show a notification
function showNotification(title, body, icon = null) {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return;
    }

    const notificationOptions = {
        body: body,
        icon: icon || 'sheetaty_logo.jpg',
        badge: 'sheetaty_logo.jpg',
        vibrate: [200, 100, 200],
        tag: 'sheetaty-notification',
        requireInteraction: false,
        silent: false
    };

    try {
        const notification = new Notification(title, notificationOptions);

        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Handle notification click
        notification.onclick = function () {
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Toggle notification menu
function toggleNotificationMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('notificationMenu');
    if (!menu) return;

    if (menu.style.display === 'none' || !menu.classList.contains('active')) {
        menu.style.display = 'block';
        setTimeout(() => menu.classList.add('active'), 10);
    } else {
        closeNotificationMenu();
    }
}

// Close notification menu
function closeNotificationMenu() {
    const menu = document.getElementById('notificationMenu');
    if (!menu) return;
    menu.classList.remove('active');
    setTimeout(() => menu.style.display = 'none', 300);
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('notificationMenu');
    const bell = document.getElementById('notificationBell');

    if (menu && bell && !menu.contains(e.target) && !bell.contains(e.target)) {
        closeNotificationMenu();
    }
});

// Update notification menu UI
function updateNotificationMenu(enabled) {
    const menuItem = document.getElementById('toggleNotificationItem');
    if (!menuItem) return;

    if (enabled) {
        menuItem.innerHTML = `
            <span class="notification-menu-icon">🔔</span>
            <span class="notification-menu-text">إيقاف الإشعارات</span>
        `;
        menuItem.classList.add('enabled');
        menuItem.onclick = disableNotifications;
    } else {
        menuItem.innerHTML = `
            <span class="notification-menu-icon">🔕</span>
            <span class="notification-menu-text">تفعيل الإشعارات</span>
        `;
        menuItem.classList.remove('enabled');
        menuItem.onclick = requestNotificationPermission;
    }
}

// Update notification button UI (now updates menu instead)
function updateNotificationButton(enabled) {
    updateNotificationMenu(enabled);
}

// Check if notifications are enabled
function areNotificationsEnabled() {
    return localStorage.getItem('notificationsEnabled') === 'true' &&
        Notification.permission === 'granted';
}

// Initialize notification button
function initializeNotificationButton() {
    // Check current status
    const enabled = areNotificationsEnabled();
    updateNotificationMenu(enabled);

    // Show/hide based on browser support
    const container = document.querySelector('.notification-container');
    if (!isNotificationSupported() && container) {
        container.style.display = 'none';
    }
}

// Monitor for new materials and send notifications
function startNotificationListener(db) {
    if (!db) {
        console.error('Firebase not initialized');
        return;
    }

    const subjectsRef = db.collection('subjects');

    // Keep track of current materials count
    let previousMaterialIds = new Set();
    let isFirstLoad = true;

    subjectsRef.onSnapshot((snapshot) => {
        if (isFirstLoad) {
            // On first load, just store the IDs
            snapshot.docs.forEach(doc => {
                previousMaterialIds.add(doc.id);
            });
            isFirstLoad = false;
            return;
        }

        // Check for new materials
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && !previousMaterialIds.has(change.doc.id)) {
                // New material detected!
                const material = change.doc.data();

                // Only notify if notifications are enabled
                if (areNotificationsEnabled()) {
                    showNotification(
                        '📚 مادة جديدة أُضيفت!',
                        `${material.title} - ${material.doctors || 'دكتور جديد'}`,
                        material.image || 'sheetaty_logo.jpg'
                    );
                }

                previousMaterialIds.add(change.doc.id);
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeNotificationButton();

    // Start listening for new materials (requires firebase db)
    // Will be called from script.js after Firebase is initialized
});

// Make toggle function global
window.toggleNotificationMenu = toggleNotificationMenu;

// Export functions for use in other scripts
window.notificationSystem = {
    requestPermission: requestNotificationPermission,
    disable: disableNotifications,
    show: showNotification,
    isEnabled: areNotificationsEnabled,
    startListener: startNotificationListener
};
