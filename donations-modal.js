// donations-modal.js - Donations Page Modal Logic
(() => {
    // Generate unique donation code (6 characters)
    function generateDonationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Process and resize image to base64
    function processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Global function to copy donation code
    window.copyDonationCode = function () {
        const codeElement = document.getElementById('generatedDonationCode');
        const copyBtn = document.getElementById('copyDonationCodeBtn');

        if (codeElement) {
            const code = codeElement.textContent;

            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(() => {
                    // Show success feedback
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅ تم النسخ!';
                    copyBtn.style.background = 'rgba(16, 185, 129, 0.4)';
                    copyBtn.style.borderColor = 'rgba(16, 185, 129, 0.6)';

                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.background = 'rgba(255,255,255,0.25)';
                        copyBtn.style.borderColor = 'rgba(255,255,255,0.4)';
                    }, 2000);
                }).catch(err => {
                    alert('فشل النسخ. يرجى نسخ الكود يدوياً.');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅ تم النسخ!';
                    copyBtn.style.background = 'rgba(16, 185, 129, 0.4)';
                    copyBtn.style.borderColor = 'rgba(16, 185, 129, 0.6)';

                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.background = 'rgba(255,255,255,0.25)';
                        copyBtn.style.borderColor = 'rgba(255,255,255,0.4)';
                    }, 2000);
                } catch (err) {
                    alert('فشل النسخ. يرجى نسخ الكود يدوياً.');
                }
                document.body.removeChild(textArea);
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const openDonationsPageBtn = document.getElementById('openDonationsPageBtn');
        const donationsPageModal = document.getElementById('donationsPageModal');
        const closeDonationsPage = document.getElementById('closeDonationsPage');
        const showDonationFormBtn = document.getElementById('showDonationFormBtn');
        const donationFormContainer = document.getElementById('donationFormContainer');
        const cancelDonationFormBtn = document.getElementById('cancelDonationFormBtn');
        const modalDonationForm = document.getElementById('modalDonationForm');
        const modalContributionsList = document.getElementById('modalContributionsList');
        const modalTotalContributionsEl = document.getElementById('modalTotalContributions');
        const modalTotalBooksEl = document.getElementById('modalTotalBooks');

        // Image upload elements
        const donationImageInput = document.getElementById('modalDonationImage');
        const donationImagePreview = document.getElementById('modalDonationImagePreview');
        const donationImagePreviewImg = document.getElementById('modalDonationImagePreviewImg');
        const removeDonationImageBtn = document.getElementById('removeDonationImage');


        // Get donations reference from global db
        const donationsRef = db.collection("donations");

        // Handle donation image upload and preview
        if (donationImageInput) {
            donationImageInput.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        donationImagePreviewImg.src = e.target.result;
                        donationImagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    donationImagePreview.style.display = 'none';
                    donationImagePreviewImg.src = '';
                }
            });
        }

        // Remove donation image
        if (removeDonationImageBtn) {
            removeDonationImageBtn.addEventListener('click', () => {
                donationImageInput.value = '';
                donationImagePreview.style.display = 'none';
                donationImagePreviewImg.src = '';
            });
        }

        // Open Donations Page Modal
        if (openDonationsPageBtn) {
            openDonationsPageBtn.addEventListener('click', () => {
                donationsPageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Close Donations Page Modal
        if (closeDonationsPage) {
            closeDonationsPage.addEventListener('click', () => {
                donationsPageModal.classList.remove('active');
                document.body.style.overflow = '';
                // Hide form when closing
                if (donationFormContainer) donationFormContainer.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        if (donationsPageModal) {
            donationsPageModal.addEventListener('click', (e) => {
                if (e.target === donationsPageModal) {
                    donationsPageModal.classList.remove('active');
                    document.body.style.overflow = '';
                    if (donationFormContainer) donationFormContainer.style.display = 'none';
                }
            });
        }

        // Show donation form
        if (showDonationFormBtn) {
            showDonationFormBtn.addEventListener('click', () => {
                if (donationFormContainer) {
                    // Generate donation code when opening the form
                    const newDonationCode = generateDonationCode();

                    // Store it in a data attribute for later use
                    modalDonationForm.setAttribute('data-donation-code', newDonationCode);

                    // Display the code in the form
                    const codeDisplayElement = document.getElementById('generatedDonationCode');
                    if (codeDisplayElement) {
                        codeDisplayElement.textContent = newDonationCode;
                    }

                    donationFormContainer.style.display = 'block';
                    donationFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        // Cancel/Hide donation form
        if (cancelDonationFormBtn) {
            cancelDonationFormBtn.addEventListener('click', () => {
                if (donationFormContainer) donationFormContainer.style.display = 'none';
                if (modalDonationForm) modalDonationForm.reset();
            });
        }

        // Listen for ALL donations and update modal
        donationsRef.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            const allDonations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter out test/demo donations
            const testPatterns = ['تجريبي', 'مساهم تجريبي', 'test', 'Test', 'TEST', 'demo', 'Demo', 'قثثقف'];
            const filteredDonations = allDonations.filter(donation => {
                const name = donation.name || '';
                return !testPatterns.some(pattern =>
                    name.includes(pattern) || name.toLowerCase().includes(pattern.toLowerCase())
                );
            });

            // Update modal statistics (using filtered data)
            const totalBooks = filteredDonations.reduce((sum, donation) => {
                return sum + parseInt(donation.itemsCount || 0);
            }, 0);

            if (modalTotalContributionsEl) modalTotalContributionsEl.textContent = filteredDonations.length;
            if (modalTotalBooksEl) modalTotalBooksEl.textContent = totalBooks;

            // Render contributions in modal
            if (modalContributionsList) {
                if (filteredDonations.length > 0) {
                    modalContributionsList.innerHTML = filteredDonations.map((donation, index) => {
                        const firstLetter = donation.name ? donation.name.charAt(0) : '?';
                        const date = donation.createdAt?.seconds
                            ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            : 'تاريخ غير محدد';

                        return `
                            <div class="contribution-item" style="animation-delay: ${index * 0.1}s;">
                                <div class="contribution-badge">
                                    <span>✨</span>
                                    <span>متبرع #${filteredDonations.length - index}</span>
                                </div>

                                <div class="contribution-header">
                                    <div class="contribution-avatar">${firstLetter}</div>
                                    <div class="contribution-name-section">
                                        <h3>${donation.name || 'غير معروف'}</h3>
                                        <div class="contribution-date">
                                            <span>📅</span>
                                            <span>${date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="contribution-details">
                                    <div class="detail-row">
                                        <div class="detail-icon">📚</div>
                                        <div class="detail-content">
                                            <div class="detail-label">عدد الكتب/الشيتات</div>
                                            <div class="detail-value">${donation.itemsCount || 0} كتاب/شيت</div>
                                        </div>
                                    </div>

                                    ${donation.subjectNames ? `
                                    <div class="detail-row">
                                        <div class="detail-icon">📖</div>
                                        <div class="detail-content">
                                            <div class="detail-label">أسماء المواد</div>
                                            <div class="detail-value">${donation.subjectNames}</div>
                                        </div>
                                    </div>
                                    ` : ''}

                                    ${donation.professorName ? `
                                    <div class="detail-row">
                                        <div class="detail-icon">👨‍🏫</div>
                                        <div class="detail-content">
                                            <div class="detail-label">اسم الدكتور</div>
                                            <div class="detail-value">${donation.professorName}</div>
                                        </div>
                                    </div>
                                    ` : ''}

                                    <div class="detail-row">
                                        <div class="detail-icon">📱</div>
                                        <div class="detail-content">
                                            <div class="detail-label">معلومات التواصل</div>
                                            <div class="detail-value contact-info">${donation.contact || 'لا توجد معلومات'}</div>
                                        </div>
                                    </div>

                                    ${donation.notes ? `
                                        <div class="contribution-notes">
                                            <div class="detail-row" style="background: transparent; padding: 0;">
                                                <div class="detail-icon">📝</div>
                                                <div class="detail-content">
                                                    <div class="detail-label">ملاحظات</div>
                                                    <div class="detail-value">${donation.notes}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}

                                    ${donation.donationImage ? `
                                        <div class="contribution-image">
                                            <div class="detail-row" style="background: transparent; padding: 0;">
                                                <div class="detail-icon">📷</div>
                                                <div class="detail-content">
                                                    <div class="detail-label">صورة المادة</div>
                                                    <img src="${donation.donationImage}" alt="صورة المادة" 
                                                         style="max-width: 100%; border-radius: 10px; margin-top: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>

                                <button class="btn-delete-donation" onclick="window.openDeleteDonationModal('${donation.id}')" 
                                        style="width: 100%; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                                    🗑️ حذف التبرع
                                </button>
                            </div>
                        `;
                    }).join('');
                } else {
                    modalContributionsList.innerHTML = `
                        <div class="contributions-empty">
                            <h3>لا توجد مساهمات حالياً 📭</h3>
                            <p>كن أول من يساهم في نشر العلم!</p>
                        </div>
                    `;
                }
            }
        }, (error) => {
            console.log("Modal donations fetch error:", error);
        });

        // Handle modal donation form submission
        if (modalDonationForm) {
            modalDonationForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = modalDonationForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;
                submitBtn.innerText = 'جاري الإرسال...';
                submitBtn.disabled = true;

                try {
                    // Get the pre-generated donation code from form data attribute
                    const donationCode = modalDonationForm.getAttribute('data-donation-code');

                    if (!donationCode) {
                        alert('حدث خطأ في توليد الكود. يرجى إغلاق النموذج وفتحه مرة أخرى.');
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                        return;
                    }

                    // Process image if exists
                    let donationImageBase64 = "";
                    if (donationImageInput && donationImageInput.files[0]) {
                        submitBtn.innerText = 'جاري معالجة الصورة...';
                        donationImageBase64 = await processImage(donationImageInput.files[0]);
                    }

                    const donorData = {
                        name: document.getElementById('modalDonorName').value,
                        itemsCount: document.getElementById('modalItemsCount').value,
                        subjectNames: document.getElementById('modalSubjectNames').value,
                        professorName: document.getElementById('modalProfessorName').value,
                        contact: document.getElementById('modalContactInfo').value,
                        notes: document.getElementById('modalNotes').value,
                        donationCode: donationCode,
                        donationImage: donationImageBase64,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    submitBtn.innerText = 'جاري الحفظ...';
                    await donationsRef.add(donorData);

                    alert(`شكراً لك يا ${donorData.name}! 🌹\n\nتم تسجيل اسمك في لوحة الشرف.\n\n🔑 تذكير بكود التبرع الخاص بك:\n${donationCode}\n\nسنتواصل معك قريباً لاستلام الكتب.`);

                    modalDonationForm.reset();

                    // Reset image preview
                    if (donationImagePreview) donationImagePreview.style.display = 'none';
                    if (donationImagePreviewImg) donationImagePreviewImg.src = '';

                    // Hide form after successful submission
                    if (donationFormContainer) donationFormContainer.style.display = 'none';

                    // Scroll to contributions list
                    if (modalContributionsList) {
                        modalContributionsList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                } catch (error) {
                    console.error("Error adding donation:", error);
                    alert("حدث خطأ أثناء الإرسال. تأكد من الاتصال بالإنترنت.");
                } finally {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Delete Donation Modal Logic
        const deleteDonationModalOverlay = document.getElementById('deleteDonationModalOverlay');
        const deleteDonationForm = document.getElementById('deleteDonationForm');
        const deleteDonationCodeInput = document.getElementById('deleteDonationCode');
        const deleteDonationError = document.getElementById('deleteDonationError');
        const closeDeleteDonationModalBtn = document.getElementById('closeDeleteDonationModal');
        let currentDeleteDonationId = null;

        // Open delete donation modal
        window.openDeleteDonationModal = (donationId) => {
            currentDeleteDonationId = donationId;
            if (deleteDonationCodeInput) deleteDonationCodeInput.value = '';
            if (deleteDonationError) deleteDonationError.style.display = 'none';
            if (deleteDonationModalOverlay) {
                deleteDonationModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        // Close delete donation modal
        window.closeDeleteDonationModal = () => {
            if (deleteDonationModalOverlay) {
                deleteDonationModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            currentDeleteDonationId = null;
        };

        // Close button
        if (closeDeleteDonationModalBtn) {
            closeDeleteDonationModalBtn.addEventListener('click', window.closeDeleteDonationModal);
        }

        // Close on overlay click
        if (deleteDonationModalOverlay) {
            deleteDonationModalOverlay.addEventListener('click', (e) => {
                if (e.target === deleteDonationModalOverlay) {
                    window.closeDeleteDonationModal();
                }
            });
        }

        // Handle delete donation form submission
        if (deleteDonationForm) {
            deleteDonationForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!currentDeleteDonationId) return;

                const enteredCode = deleteDonationCodeInput.value.trim().toUpperCase();

                try {
                    // Get the donation document to verify code
                    const donationDoc = await donationsRef.doc(currentDeleteDonationId).get();

                    if (!donationDoc.exists) {
                        alert('❌ التبرع غير موجود!');
                        window.closeDeleteDonationModal();
                        return;
                    }

                    const donationData = donationDoc.data();
                    const correctCode = donationData.donationCode;

                    // Verify code
                    if (enteredCode !== correctCode) {
                        if (deleteDonationError) deleteDonationError.style.display = 'block';
                        if (deleteDonationCodeInput) {
                            deleteDonationCodeInput.value = '';
                            deleteDonationCodeInput.focus();
                        }
                        return;
                    }

                    // Code is correct, proceed with deletion
                    const submitBtn = deleteDonationForm.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.textContent;
                    submitBtn.textContent = 'جاري الحذف...';
                    submitBtn.disabled = true;

                    await donationsRef.doc(currentDeleteDonationId).delete();

                    alert('✅ تم حذف التبرع بنجاح!');
                    window.closeDeleteDonationModal();

                } catch (error) {
                    console.error('Error deleting donation:', error);
                    alert('❌ حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.');
                }
            });
        }
    });
})();
