// ui.js - Simplified for Donation Focus
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const roleModalOverlay = document.getElementById('roleModalOverlay');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModal');
    const donationsPageModal = document.getElementById('donationsPageModal');
    const heroDonationBtn = document.getElementById('heroDonationBtn');

    // --- Entry Animation / Role Modal Check ---
    const savedRole = sessionStorage.getItem('userRole');

    if (savedRole) {
        if (roleModalOverlay) {
            roleModalOverlay.style.display = 'none';
        }
    }

    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            sessionStorage.setItem('userRole', 'student');
            if (roleModalOverlay) {
                roleModalOverlay.style.opacity = '0';
                roleModalOverlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    roleModalOverlay.style.display = 'none';
                }, 300);
            }
        });
    }

    // --- Hero Donation Button Logic ---
    if (heroDonationBtn) {
        heroDonationBtn.addEventListener('click', () => {
            if (donationsPageModal) {
                donationsPageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // --- Theme Toggle ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            // Add animation class
            themeToggle.classList.add('theme-anim');
            setTimeout(() => themeToggle.classList.remove('theme-anim'), 500);

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
            }
        });
    }


    // --- Daker AI Modal Logic ---
    const dakerAiBtn = document.getElementById('dakerAiBtn');
    const dakerAiModal = document.getElementById('dakerAiModal');
    const closeDakerAiModal = document.getElementById('closeDakerAiModal');

    if (dakerAiBtn) {
        dakerAiBtn.addEventListener('click', () => {
            if (dakerAiModal) {
                dakerAiModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeDakerAiModal) {
        closeDakerAiModal.addEventListener('click', () => {
            if (dakerAiModal) {
                dakerAiModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Global Modal Close ---
    window.closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', window.closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modalOverlay) window.closeModal();
        if (e.target === donationsPageModal) {
            donationsPageModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (e.target === dakerAiModal) {
            dakerAiModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeModal();
            if (donationsPageModal) {
                donationsPageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (dakerAiModal) {
                dakerAiModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});
