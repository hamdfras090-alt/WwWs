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

    // View Switch Elements
    const homeView = document.getElementById('homeView');
    const sheetatyView = document.getElementById('sheetatyView');
    const openSheetatyBtn = document.getElementById('openSheetatyModalBtn');
    const mainLogoHome = document.getElementById('mainLogoHome');

    // Sheetaty Feature Elements
    const addSheetatyBtnHeader = document.getElementById('addSheetatyBtnHeader');
    const sheetatyMaterialModal = document.getElementById('sheetatyMaterialModal');
    const closeSheetatyMaterialModal = document.getElementById('closeSheetatyMaterialModal');
    const sheetatyMaterialForm = document.getElementById('sheetatyMaterialForm');
    const sheetatyResourcesList = document.getElementById('sheetatyResourcesList');
    const shMaterialImage = document.getElementById('shMaterialImage');
    const shImagePreview = document.getElementById('shImagePreview');
    const shImagePreviewImg = document.getElementById('shImagePreviewImg');
    const sheetatySearch = document.getElementById('sheetatySearch');

    const sheetatyDeleteModal = document.getElementById('sheetatyDeleteModal');
    const closeSheetatyDelete = document.getElementById('closeSheetatyDelete');
    const confirmShDelete = document.getElementById('confirmShDelete');
    const shDeleteSecret = document.getElementById('shDeleteSecret');

    const SECRET_KEY = "mk990";
    let pendingDeleteId = null;

    // --- Default View: Sheetaty ---
    if (homeView && sheetatyView) {
        homeView.style.display = 'none';
        sheetatyView.style.display = 'block';
        if (addSheetatyBtnHeader) addSheetatyBtnHeader.style.display = 'flex';
    }

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

    // --- View Switching Logic ---
    if (openSheetatyBtn) {
        openSheetatyBtn.addEventListener('click', () => {
            if (homeView && sheetatyView) {
                homeView.style.display = 'none';
                sheetatyView.style.display = 'block';
                if (addSheetatyBtnHeader) addSheetatyBtnHeader.style.display = 'flex';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                loadSheetatyItems();
            }
        });
    }

    if (mainLogoHome) {
        mainLogoHome.addEventListener('click', () => {
            if (homeView && sheetatyView) {
                sheetatyView.style.display = 'none';
                homeView.style.display = 'block';
                if (addSheetatyBtnHeader) addSheetatyBtnHeader.style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // --- Sheetaty Core Logic ---

    // Search Logic
    if (sheetatySearch) {
        sheetatySearch.addEventListener('input', (e) => {
            loadSheetatyItems(e.target.value);
        });
    }

    // Open Modal
    if (addSheetatyBtnHeader) {
        addSheetatyBtnHeader.addEventListener('click', () => {
            sheetatyMaterialModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close Modal
    const closeShModal = () => {
        sheetatyMaterialModal.classList.remove('active');
        document.body.style.overflow = '';
        sheetatyMaterialForm.reset();
        shImagePreview.style.display = 'none';
    };

    if (closeSheetatyMaterialModal) closeSheetatyMaterialModal.addEventListener('click', closeShModal);

    // Image Preview
    if (shMaterialImage) {
        shMaterialImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    shImagePreviewImg.src = event.target.result;
                    shImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form Submit
    if (sheetatyMaterialForm) {
        sheetatyMaterialForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pass = document.getElementById('shSecretKey').value;
            if (pass !== SECRET_KEY) {
                alert('❌ كلمة السر غير صحيحة!');
                return;
            }

            const newItem = {
                id: Date.now(),
                subject: document.getElementById('shSubjectName').value,
                professor: document.getElementById('shProfessorName').value,
                telegram: document.getElementById('shTelegramLink').value,
                image: shImagePreviewImg.src || '',
                date: new Date().toLocaleDateString('ar-EG')
            };

            const items = JSON.parse(localStorage.getItem('sheetatyItems') || '[]');
            items.unshift(newItem);
            localStorage.setItem('sheetatyItems', JSON.stringify(items));

            alert('✅ تم إضافة المادة بنجاح!');
            closeShModal();
            loadSheetatyItems();
        });
    }

    // Load & Filter Items
    function loadSheetatyItems(query = "") {
        if (!sheetatyResourcesList) return;
        let items = JSON.parse(localStorage.getItem('sheetatyItems') || '[]');

        if (query) {
            const lowerQuery = query.toLowerCase();
            items = items.filter(item =>
                item.subject.toLowerCase().includes(lowerQuery) ||
                item.professor.toLowerCase().includes(lowerQuery)
            );
        }

        sheetatyResourcesList.innerHTML = '';

        if (items.length === 0) {
            sheetatyResourcesList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted); animation: fadeIn 0.8s ease-out;">
                    <p style="font-size: 1.2rem;">${query ? 'لا توجد نتائج تطابق بحثك... 🔍' : 'لا توجد مواد مضافة حالياً. استخدم زر (+) في الأعلى لإضافة مادة! ✨'}</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
            card.innerHTML = `
                <div style="position: relative; overflow: hidden; height: 220px;">
                    ${item.image ? `<img src="${item.image}" class="card-image" style="height: 100%;" alt="subject">` : `<div style="height:100%; background:var(--gradient-main); opacity:0.1; display:flex; align-items:center; justify-content:center; font-size:4rem;">📖</div>`}
                    <button class="sh-delete-overlay" onclick="window.openDeleteSh(${item.id})" title="حذف المادة">
                        🗑️
                    </button>
                </div>
                <div class="card-content" style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <span class="card-tag" style="margin-bottom: 0; background: rgba(16, 185, 129, 0.1); color: #10b981;">مادة دراسية</span>
                        <small style="color: var(--text-muted); font-size: 0.75rem;">${item.date}</small>
                    </div>
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.4rem;">${item.subject}</h3>
                    <p class="doctors-name" style="margin-bottom: 1.5rem;">👨‍🏫 الدكتور: ${item.professor}</p>
                    <div class="card-footer" style="padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                        <a href="${item.telegram}" target="_blank" class="btn-view" style="text-decoration:none; background: var(--gradient-main); width: 100%; text-align: center; padding: 12px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span>ذهاب للمادة</span>
                            <span style="font-size: 1.2rem;">🚀</span>
                        </a>
                    </div>
                </div>
            `;
            sheetatyResourcesList.appendChild(card);
        });
    }

    // Global Delete Functions
    window.openDeleteSh = (id) => {
        pendingDeleteId = id;
        sheetatyDeleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    if (closeSheetatyDelete) {
        closeSheetatyDelete.addEventListener('click', () => {
            sheetatyDeleteModal.classList.remove('active');
            document.body.style.overflow = '';
            shDeleteSecret.value = '';
        });
    }

    if (confirmShDelete) {
        confirmShDelete.addEventListener('click', () => {
            if (shDeleteSecret.value === SECRET_KEY) {
                let items = JSON.parse(localStorage.getItem('sheetatyItems') || '[]');
                items = items.filter(i => i.id !== pendingDeleteId);
                localStorage.setItem('sheetatyItems', JSON.stringify(items));

                alert('🗑️ تم حذف المادة بنجاح');
                sheetatyDeleteModal.classList.remove('active');
                document.body.style.overflow = '';
                shDeleteSecret.value = '';
                loadSheetatyItems(sheetatySearch ? sheetatySearch.value : "");
            } else {
                alert('❌ كلمة السر غير صحيحة!');
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
    const bottomCloseDakerAiModal = document.getElementById('bottomCloseDakerAiModal');

    if (dakerAiBtn) {
        dakerAiBtn.addEventListener('click', () => {
            if (dakerAiModal) {
                dakerAiModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    const closeDakerAction = () => {
        if (dakerAiModal) {
            dakerAiModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (closeDakerAiModal) {
        closeDakerAiModal.addEventListener('click', closeDakerAction);
    }
    if (bottomCloseDakerAiModal) {
        bottomCloseDakerAiModal.addEventListener('click', closeDakerAction);
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
        if (e.target === sheetatyMaterialModal) closeShModal();
        if (e.target === sheetatyDeleteModal) {
            sheetatyDeleteModal.classList.remove('active');
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
            if (sheetatyMaterialModal) closeShModal();
            if (sheetatyDeleteModal) {
                sheetatyDeleteModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Initial load
    loadSheetatyItems();
});
