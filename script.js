// script.js - Refactored for Compat/File:// support
(() => {
    // Global subjects array
    let subjects = [];

    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('searchInput');
        const resultsGrid = document.getElementById('resultsGrid');
        const modalBody = document.getElementById('modalBody');
        const modalOverlay = document.getElementById('modalOverlay');

        // Publish Modal Elements
        const openPublishBtn = document.getElementById('openPublishModalBtn');
        const publishModalOverlay = document.getElementById('publishModalOverlay');
        const publishForm = document.getElementById('publishForm');

        // Firestore Collection Ref (Compat)
        // db is available globally from firebase-init.js
        const subjectsRef = db.collection("subjects");

        // --- Real-time Data Listener ---
        const q = subjectsRef.orderBy("createdAt", "desc");

        // Show loading state initially
        resultsGrid.innerHTML = '<p style="text-align:center; padding: 20px;">جاري تحميل المواد...</p>';


        q.onSnapshot((snapshot) => {
            subjects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            renderCards(subjects, resultsGrid);

            // Auto-Seed ONLY ONCE if empty and not seeded before
            // Using localStorage to prevent multiple seeding
            const hasSeeded = localStorage.getItem('hasSeededEcon1');
            if (subjects.length === 0 && !hasSeeded) {
                seedEconomics1();
                localStorage.setItem('hasSeededEcon1', 'true');
            }

        }, (error) => {
            console.error("Error fetching data:", error);
            resultsGrid.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ في تحميل البيانات. تأكد من الاتصال بالإنترنت.</p>';
        });

        // --- Start Notification Listener ---
        // Initialize notification monitoring for new materials
        if (window.notificationSystem && window.notificationSystem.startListener) {
            window.notificationSystem.startListener(db);
        }


        // --- Seeding Function ---
        async function seedEconomics1() {
            console.log("Seeding Database with Economics 1...");
            try {
                await subjectsRef.add({
                    title: "اقتصاد 1",
                    code: "ECON101",
                    department: "اقتصاد",
                    description: "مقدمة في علم الاقتصاد، الطلب والعرض، ونظرية المستهلك.",
                    image: "images/economics1/cover_new.jpg",
                    doctors: "د. رشيد مفتاح - د. جلال عبيدر",
                    linkText: "دراسة او تحميل",
                    externalLink: "https://limewire.com/d/rTrUP#mTNmCK2ku1",
                    ratings: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.error("Error seeding data:", e);
            }
        }


        // --- Search Functionality ---
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const queryText = e.target.value.toLowerCase();

                // Filter Global
                const filteredGlobal = subjects.filter(subject =>
                    (subject.title && subject.title.toLowerCase().includes(queryText)) ||
                    (subject.code && subject.code.toLowerCase().includes(queryText)) ||
                    (subject.department && subject.department.toLowerCase().includes(queryText))
                );
                renderCards(filteredGlobal, resultsGrid);
            });
        }

        // Helper function to calculate average rating
        function calculateAverageRating(ratings) {
            if (!ratings || ratings.length === 0) return 0;
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            return sum / ratings.length;
        }

        // Helper function to render stars
        function renderStars(average, isInteractive = false) {
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                let starClass = 'star';
                if (i <= Math.floor(average)) {
                    starClass += ' filled';
                } else if (i === Math.ceil(average) && average % 1 !== 0) {
                    starClass += ' half-filled';
                }
                starsHTML += `<span class="${starClass}" ${isInteractive ? `data-rating="${i}"` : ''}>⭐</span>`;
            }
            return starsHTML;
        }

        function renderCards(data, container) {
            container.innerHTML = '';

            if (data.length === 0) {
                if (container === resultsGrid) {
                    container.innerHTML = '<p style="text-align:center;">لا توجد مواد حالياً.</p>';
                }
                return;
            }

            data.forEach((subject, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.animation = `fadeIn 0.5s ease-out forwards ${index * 0.1}s`;
                const imgSrc = subject.image || 'sheetaty_logo.jpg';

                // Calculate rating info
                const ratings = subject.ratings || [];
                const averageRating = calculateAverageRating(ratings);
                const ratingCount = ratings.length;

                // onerror fallback to local logo as well
                card.innerHTML = `
                    <img src="${imgSrc}" alt="${subject.title}" class="card-image" onerror="this.src='sheetaty_logo.jpg'">
                    <div class="card-content">
                        <span class="card-tag">${subject.department || 'عام'}</span>
                        <h3>${subject.title}</h3>
                        ${subject.doctors ? `<p class="doctors-name">${subject.doctors}</p>` : ''}
                        <div class="card-footer">
                            <span class="code-badge">${subject.code || '-'}</span>
                            <button class="btn-view" onclick="window.openModal('${subject.id}')">تصفح المادة 👈</button>
                        </div>
                        <div class="rating-container">
                            <div class="rating-stars">
                                ${renderStars(averageRating)}
                            </div>
                            <div class="rating-info">
                                <span class="rating-average">${averageRating.toFixed(1)}</span>
                                <span class="rating-count">(${ratingCount} تقييم)</span>
                            </div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        window.openModal(subject.id);
                    }
                });
                container.appendChild(card);
            });
        }

        // --- Publish Logic ---
        // --- Publish Logic ---
        if (openPublishBtn) {
            openPublishBtn.addEventListener('click', () => {
                publishModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Image Preview Logic
        const pubImageFile = document.getElementById('pubImageFile');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');

        if (pubImageFile) {
            pubImageFile.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        imagePreview.src = e.target.result;
                        imagePreviewContainer.style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                } else {
                    imagePreviewContainer.style.display = 'none';
                    imagePreview.src = '';
                }
            });
        }

        if (publishForm) {
            publishForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = publishForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'جاري النشر...';
                submitBtn.disabled = true;

                // Function to resize and get Base64
                const processImage = (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (event) => {
                            const img = new Image();
                            img.src = event.target.result;
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800; // Resize to max 800px width
                                const scaleSize = MAX_WIDTH / img.width;
                                const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                                const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);

                                // Compress to JPEG with 0.7 quality
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                resolve(dataUrl);
                            };
                            img.onerror = (err) => reject(err);
                        };
                        reader.onerror = (err) => reject(err);
                    });
                };

                let imageBase64 = "";
                const fileInput = document.getElementById('pubImageFile');

                try {
                    if (fileInput && fileInput.files[0]) {
                        // Use the resizing function
                        submitBtn.textContent = 'جاري معالجة الصورة...';
                        imageBase64 = await processImage(fileInput.files[0]);
                    }

                    await subjectsRef.add({
                        title: document.getElementById('pubTitle').value,
                        doctors: document.getElementById('pubDoctors').value,
                        externalLink: document.getElementById('pubShareLink').value,
                        code: "N/A",
                        department: "عام",
                        description: "تمت الإضافة بواسطة الدكتور",
                        image: imageBase64,
                        ratings: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    alert('تم نشر المادة بنجاح! سيراها الطلاب فوراً.');
                    publishForm.reset();
                    // Reset preview
                    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

                    publishModalOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                } catch (error) {
                    console.error("Error adding document: ", error);
                    alert('حدث خطأ أثناء النشر. يرجى المحاولة مرة أخرى.');
                } finally {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Expose functions via window for click handlers
        window.getSubjectById = (id) => {
            return subjects.find(s => s.id === id);
        };

        window.openModal = (id) => {
            const subject = subjects.find(s => s.id === id);
            if (!subject) return;

            const imgSrc = subject.image || 'sheetaty_logo.jpg';

            // Check if user is a doctor (only doctor can delete, not assistant)
            const userRole = sessionStorage.getItem('userRole');
            const isDoctor = userRole === 'doctor';

            modalBody.innerHTML = `
                <span class="card-tag" style="margin-bottom: 1rem;">${subject.department || 'عام'}</span>
                <h2>${subject.title}</h2>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">${subject.doctors || ''}</p>
                ${subject.image ? `<img src="${imgSrc}" alt="${subject.title}" class="modal-image" onerror="this.src='sheetaty_logo.jpg'">` : ''} 
                
                <p>${subject.description || ''}</p>
                
                ${window.initializeRatingInModal ? window.initializeRatingInModal(subject, subjectsRef, renderStars, calculateAverageRating) : ''}
                
                <div id="modalActions" class="modal-actions">
                    ${subject.externalLink ? `
                    <button class="btn-primary" style="background-color: #0070f3;" onclick="window.open('${subject.externalLink}', '_blank')">
                       ${subject.linkText || '🔥 تنزيل / معاينة'}
                    </button>` : ''}
                    ${isDoctor ? `
                    <button class="btn-primary" style="background-color: #ef4444;" onclick="window.openDeleteModal('${subject.id}')">
                        🗑️ حذف المادة
                    </button>` : ''}
                    <button class="btn-secondary" onclick="window.closeModal()">
                        إغلاق
                    </button>
                </div>
            `;

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // --- Delete Modal Logic ---
        const deleteModalOverlay = document.getElementById('deleteModalOverlay');
        const deleteForm = document.getElementById('deleteForm');
        const deleteCodeInput = document.getElementById('deleteCode');
        const deleteError = document.getElementById('deleteError');
        let currentDeleteId = null;

        // Open delete modal
        window.openDeleteModal = (id) => {
            currentDeleteId = id;
            deleteCodeInput.value = '';
            deleteError.style.display = 'none';
            deleteModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // Close delete modal
        window.closeDeleteModal = () => {
            deleteModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            currentDeleteId = null;
        };

        // Handle delete form submission
        if (deleteForm) {
            deleteForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const enteredCode = deleteCodeInput.value.trim();
                const VALID_CODE = 'mk990';

                // Check if code is correct
                if (enteredCode !== VALID_CODE) {
                    deleteError.style.display = 'block';
                    deleteCodeInput.value = '';
                    deleteCodeInput.focus();
                    return;
                }

                // Code is correct, proceed with deletion
                if (!currentDeleteId) return;

                const submitBtn = deleteForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'جاري الحذف...';
                submitBtn.disabled = true;

                try {
                    await subjectsRef.doc(currentDeleteId).delete();

                    alert('✅ تم حذف المادة بنجاح!');

                    // Close both modals
                    window.closeDeleteModal();
                    window.closeModal();
                } catch (error) {
                    console.error('Error deleting document:', error);
                    alert('❌ حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.');
                } finally {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }

    });
})();
