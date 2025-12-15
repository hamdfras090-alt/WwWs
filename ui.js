// ui.js - Handles all UI interactions that don't depend on the database

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const roleModalOverlay = document.getElementById('roleModalOverlay');
    const roleStudentBtn = document.getElementById('roleStudentBtn');
    const roleAssistantBtn = document.getElementById('roleAssistantBtn');
    const roleDoctorBtn = document.getElementById('roleDoctorBtn');
    const openPublishBtn = document.getElementById('openPublishModalBtn');

    // Toggle Switch Elements
    const roleToggleContainer = document.getElementById('roleToggleContainer');
    const roleToggleStudent = document.getElementById('roleToggleStudent');
    const roleToggleTA = document.getElementById('roleToggleTA');
    const roleToggleDoctor = document.getElementById('roleToggleDoctor');
    const roleToggle = document.querySelector('.role-toggle');

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');

    const modalOverlay = document.getElementById('modalOverlay');
    const publishModalOverlay = document.getElementById('publishModalOverlay');
    const closePublishBtn = document.getElementById('closePublishModal');
    const closeModalBtn = document.getElementById('closeModal');

    // --- Role Selection Logic ---
    // Using sessionStorage so the modal appears every time the user opens the website
    const savedRole = sessionStorage.getItem('userRole');

    // Function to update UI based on role
    function updateUIForRole(role) {
        // Update "Add Material" button visibility
        // Both doctor and assistant can add materials
        if (openPublishBtn) {
            openPublishBtn.style.display = (role === 'doctor' || role === 'assistant') ? 'block' : 'none';
        }

        // Update toggle switch state
        if (roleToggle) {
            roleToggle.setAttribute('data-active-role', role);
        }

        // Update active class on toggle buttons
        if (roleToggleStudent && roleToggleTA && roleToggleDoctor) {
            roleToggleStudent.classList.remove('active');
            roleToggleTA.classList.remove('active');
            roleToggleDoctor.classList.remove('active');

            if (role === 'student') {
                roleToggleStudent.classList.add('active');
            } else if (role === 'assistant') {
                roleToggleTA.classList.add('active');
            } else if (role === 'doctor') {
                roleToggleDoctor.classList.add('active');
            }
        }
    }

    // If user has already selected a role, hide the role modal and show toggle
    if (savedRole) {
        // User has already selected a role, hide modal completely
        if (roleModalOverlay) {
            roleModalOverlay.style.opacity = '0';
            roleModalOverlay.style.pointerEvents = 'none';
            // Hide it after animation
            setTimeout(() => {
                roleModalOverlay.style.display = 'none';
            }, 300);
        }

        // Show toggle switch
        if (roleToggleContainer) {
            roleToggleContainer.style.display = 'block';
        }

        // Update UI based on saved role
        updateUIForRole(savedRole);
    } else {
        // No saved role, the modal is already visible via CSS
        // Just ensure toggle and button are hidden until role is selected
        if (roleToggleContainer) {
            roleToggleContainer.style.display = 'none';
        }
        if (openPublishBtn) {
            openPublishBtn.style.display = 'none';
        }
    }

    // Handle initial role selection from modal
    if (roleStudentBtn && roleAssistantBtn && roleDoctorBtn) {
        roleStudentBtn.addEventListener('click', () => {
            // Save user role (session only)
            sessionStorage.setItem('userRole', 'student');

            // Hide modal with animation
            if (roleModalOverlay) {
                roleModalOverlay.style.opacity = '0';
                roleModalOverlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    roleModalOverlay.style.display = 'none';
                }, 300);
            }

            // Show toggle switch
            if (roleToggleContainer) {
                roleToggleContainer.style.display = 'block';
            }

            // Update UI
            updateUIForRole('student');
        });

        roleAssistantBtn.addEventListener('click', () => {
            // Save user role (session only)
            sessionStorage.setItem('userRole', 'assistant');

            // Hide modal with animation
            if (roleModalOverlay) {
                roleModalOverlay.style.opacity = '0';
                roleModalOverlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    roleModalOverlay.style.display = 'none';
                }, 300);
            }

            // Show toggle switch
            if (roleToggleContainer) {
                roleToggleContainer.style.display = 'block';
            }

            // Update UI
            updateUIForRole('assistant');
        });

        roleDoctorBtn.addEventListener('click', () => {
            // Save user role (session only)
            sessionStorage.setItem('userRole', 'doctor');

            // Hide modal with animation
            if (roleModalOverlay) {
                roleModalOverlay.style.opacity = '0';
                roleModalOverlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    roleModalOverlay.style.display = 'none';
                }, 300);
            }

            // Show toggle switch
            if (roleToggleContainer) {
                roleToggleContainer.style.display = 'block';
            }

            // Update UI
            updateUIForRole('doctor');
        });
    }

    // Handle toggle switch clicks
    if (roleToggleStudent && roleToggleTA && roleToggleDoctor) {
        roleToggleStudent.addEventListener('click', () => {
            sessionStorage.setItem('userRole', 'student');
            updateUIForRole('student');
        });

        roleToggleTA.addEventListener('click', () => {
            sessionStorage.setItem('userRole', 'assistant');
            updateUIForRole('assistant');
        });

        roleToggleDoctor.addEventListener('click', () => {
            sessionStorage.setItem('userRole', 'doctor');
            updateUIForRole('doctor');
        });
    }

    // --- Theme Toggle ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Export close function globally for other scripts to use
    window.closeModal = () => {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // --- Modal Closing Logic (Generic) ---
    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const closeDeleteBtn = document.getElementById('closeDeleteModal');

    // Close Modals on Overlay Click
    window.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            window.closeModal();
        }
        if (e.target === publishModalOverlay) {
            publishModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (e.target === deleteModalOverlay) {
            if (window.closeDeleteModal) {
                window.closeDeleteModal();
            }
        }
    });

    // Keys
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                window.closeModal();
            } else if (publishModalOverlay && publishModalOverlay.classList.contains('active')) {
                publishModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            } else if (deleteModalOverlay && deleteModalOverlay.classList.contains('active')) {
                if (window.closeDeleteModal) {
                    window.closeDeleteModal();
                }
            } else if (document.getElementById('deleteDonationModalOverlay') && document.getElementById('deleteDonationModalOverlay').classList.contains('active')) {
                if (window.closeDeleteDonationModal) {
                    window.closeDeleteDonationModal();
                }
            }
        }
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', window.closeModal);
    if (closePublishBtn) {
        closePublishBtn.addEventListener('click', () => {
            publishModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    if (closeDeleteBtn) {
        closeDeleteBtn.addEventListener('click', () => {
            if (window.closeDeleteModal) {
                window.closeDeleteModal();
            }
        });
    }

    // --- Test Yourself Button ---
    const testYourselfBtn = document.getElementById('testYourselfBtn');
    const testYourselfModal = document.getElementById('testYourselfModal');
    const closeTestYourselfModal = document.getElementById('closeTestYourselfModal');

    if (testYourselfBtn && testYourselfModal) {
        // Open modal when clicking the FAB
        testYourselfBtn.addEventListener('click', () => {
            testYourselfModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal when clicking the close button
        if (closeTestYourselfModal) {
            closeTestYourselfModal.addEventListener('click', () => {
                testYourselfModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close modal when clicking outside
        testYourselfModal.addEventListener('click', (e) => {
            if (e.target === testYourselfModal) {
                testYourselfModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Add Test Yourself modal to ESC key handling
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (testYourselfModal && testYourselfModal.classList.contains('active')) {
                testYourselfModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

});
