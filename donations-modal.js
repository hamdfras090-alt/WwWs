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
        const viewAllDonationsBtn = document.getElementById('viewAllDonationsBtn');
        const heroDonationBtn = document.getElementById('heroDonationBtn');


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

        if (viewAllDonationsBtn) {
            viewAllDonationsBtn.addEventListener('click', () => {
                donationsPageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (heroDonationBtn) {
            heroDonationBtn.addEventListener('click', () => {
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

        // --- Donation Detail Modal Logic ---
        const donationDetailModal = document.getElementById('donationDetailModal');
        const donationDetailBody = document.getElementById('donationDetailBody');
        const closeDonationDetailModal = document.getElementById('closeDonationDetailModal');

        if (closeDonationDetailModal) {
            closeDonationDetailModal.addEventListener('click', () => {
                donationDetailModal.classList.remove('active');
            });
        }

        let currentDonationsData = [];

        window.openDonationDetail = (id) => {
            const donation = currentDonationsData.find(d => d.id === id);
            if (!donation) return;

            const date = donation.createdAt?.seconds
                ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('ar-EG', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }) : 'تاريخ غير محدد';

            donationDetailBody.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: var(--gradient-main); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold; margin: 0 auto 1rem;">
                        ${donation.name.charAt(0)}
                    </div>
                    <h2 style="color: var(--text-main); margin-bottom: 0.5rem;">${donation.name}</h2>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">📅 ${date}</span>
                </div>

                <div class="contribution-details" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="detail-row" style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 15px;">
                        <span style="font-size: 1.5rem; margin-left: 10px;">📖</span>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">المواد المتبرع بها</div>
                            <div style="font-weight: 700; color: var(--text-main);">${donation.subjectNames || 'غير محدد'}</div>
                        </div>
                    </div>

                    <div class="detail-row" style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 15px;">
                        <span style="font-size: 1.5rem; margin-left: 10px;">👨‍🏫</span>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">اسم الدكتور</div>
                            <div style="font-weight: 700; color: var(--text-main);">${donation.professorName || 'غير محدد'}</div>
                        </div>
                    </div>

                    <div class="detail-row" style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 15px;">
                        <span style="font-size: 1.5rem; margin-left: 10px;">📚</span>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">الكمية</div>
                            <div style="font-weight: 700; color: var(--text-main);">${donation.itemsCount} كتب/شيتات</div>
                        </div>
                    </div>

                    <div class="detail-row" style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 15px;">
                        <span style="font-size: 1.5rem; margin-left: 10px;">📱</span>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">معلومات التواصل</div>
                            <div style="font-weight: 700; color: var(--primary-color); word-break: break-all;">${donation.contact || 'لا توجد معلومات'}</div>
                        </div>
                    </div>

                    ${donation.notes ? `
                        <div style="background: rgba(16, 185, 129, 0.05); padding: 1.5rem; border-radius: 15px; border-right: 4px solid var(--primary-color);">
                            <div style="font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                                📝 ملاحظات
                            </div>
                            <p style="color: var(--text-muted); line-height: 1.6; font-style: italic;">${donation.notes}</p>
                        </div>
                    ` : ''}

                    ${donation.donationImage ? `
                        <div style="margin-top: 1rem;">
                            <div style="font-weight: 700; margin-bottom: 1rem;">📷 صورة المادة:</div>
                            <img src="${donation.donationImage}" alt="صورة المادة" style="width: 100%; border-radius: 15px; box-shadow: var(--shadow);">
                        </div>
                    ` : ''}
                </div>

                <div style="margin-top: 2rem; display: flex; gap: 10px;">
                    <button class="btn-delete-donation" onclick="window.closeDonationDetail(); window.openDeleteDonationModal('${donation.id}')" style="flex: 1; margin: 0;">
                        🗑️ حذف من موقعنا
                    </button>
                    <button class="btn-secondary" onclick="window.closeDonationDetail()" style="flex: 1;">
                        إغلاق
                    </button>
                </div>
            `;

            donationDetailModal.classList.add('active');
        };

        window.closeDonationDetail = () => {
            donationDetailModal.classList.remove('active');
        };

        // Listen for ALL donations and update modal

        donationsRef.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            const allDonations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter out test/demo donations
            const testPatterns = ['تجريبي', 'مساهم تجريبي', 'test', 'Test', 'TEST', 'demo', 'Demo', 'قثثقف', 'أحمد', 'احمد'];
            const filteredDonations = allDonations.filter(donation => {
                const name = donation.name || '';
                return !testPatterns.some(pattern =>
                    name.includes(pattern) || name.toLowerCase().includes(pattern.toLowerCase())
                );
            });

            currentDonationsData = filteredDonations;


            // Update modal statistics (using filtered data)
            const totalBooks = filteredDonations.reduce((sum, donation) => {
                return sum + parseInt(donation.itemsCount || 0);
            }, 0);

            if (modalTotalContributionsEl) modalTotalContributionsEl.textContent = filteredDonations.length;
            if (modalTotalBooksEl) modalTotalBooksEl.textContent = totalBooks;

            // Sync with main page elements if they exist
            const mainContributionsList = document.getElementById('contributionsList');
            const mainTotalContributionsEl = document.getElementById('totalContributions');
            const mainTotalBooksEl = document.getElementById('totalBooks');
            const mainDonorsGrid = document.getElementById('donorsGrid');
            const mainDonorsSection = document.getElementById('donorsSection');

            if (mainTotalContributionsEl) mainTotalContributionsEl.textContent = filteredDonations.length;
            if (mainTotalBooksEl) mainTotalBooksEl.textContent = totalBooks;

            if (mainContributionsList) {
                renderContributionList(filteredDonations, mainContributionsList);
            }

            if (modalContributionsList) {
                renderContributionList(filteredDonations, modalContributionsList);
            }

            // Honor Board Sync (Horizontal scroll using Simple View cards)
            if (mainDonorsGrid) {
                if (filteredDonations.length > 0) {
                    mainDonorsGrid.innerHTML = filteredDonations.slice(0, 20).map(donation => {
                        const firstLetter = donation.name ? donation.name.charAt(0) : '?';
                        return `
                            <div class="contribution-item simple-view" onclick="window.openDonationDetail('${donation.id}')" 
                                 style="min-width: 300px; flex-shrink: 0; cursor: pointer; border-radius: 20px; padding: 1.5rem;">
                                <div class="contribution-header" style="border: none; margin: 0; padding: 0; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <div class="contribution-avatar" style="width: 50px; height: 50px; font-size: 1.2rem; flex-shrink: 0;">${firstLetter}</div>
                                    <div class="contribution-name-section" style="flex-grow: 1;">
                                        <h3 style="font-size: 1.1rem; margin: 0;">${donation.name || 'غير معروف'}</h3>
                                        <div style="font-size: 0.85rem; color: var(--primary-color); font-weight: 700; margin-top: 2px;">📖 ${donation.subjectNames || 'مادة غير محددة'}</div>
                                    </div>
                                    ${donation.donationImage ? `
                                        <div class="simple-card-image" style="flex-shrink: 0;">
                                            <img src="${donation.donationImage}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 12px; border: 2px solid var(--primary-color);">
                                        </div>
                                    ` : '<div style="font-size: 2rem; opacity: 0.2;">📄</div>'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 12px; margin-bottom: 12px;">
                                    <div style="font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                                        <span>👨‍🏫 د.</span>
                                        <span style="font-weight: 600;">${donation.professorName || 'غير متوفر'}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: var(--primary-color); display: flex; align-items: center; gap: 6px; word-break: break-all;">
                                        <span>📱 التواصل:</span>
                                        <span style="font-weight: 600;">${donation.contact || 'انقر للتفاصيل'}</span>
                                    </div>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                                    <span style="background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 20px;">📚 ${donation.itemsCount} كتب</span>
                                    <span style="font-weight: 700;">انقر للتفاصيل 👉</span>
                                </div>
                            </div>

                        `;
                    }).join('');
                }
            }



            function renderContributionList(donations, container) {
                if (donations.length > 0) {
                    container.innerHTML = donations.map((donation, index) => {
                        const firstLetter = donation.name ? donation.name.charAt(0) : '?';
                        const date = donation.createdAt?.seconds
                            ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            : 'تاريخ غير محدد';

                        return `
                            <div class="contribution-item simple-view" onclick="window.openDonationDetail('${donation.id}')" 
                                 style="animation-delay: ${index * 0.1}s; cursor: pointer; border-radius: 20px; padding: 1.5rem;">
                                <div class="contribution-header" style="border: none; margin: 0; padding: 0; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <div class="contribution-avatar" style="width: 50px; height: 50px; font-size: 1.2rem; flex-shrink: 0;">${firstLetter}</div>
                                    <div class="contribution-name-section" style="flex-grow: 1;">
                                        <h3 style="font-size: 1.1rem; margin: 0;">${donation.name || 'غير معروف'}</h3>
                                        <div style="font-size: 0.85rem; color: var(--primary-color); font-weight: 700; margin-top: 2px;">📖 ${donation.subjectNames || 'مادة غير محددة'}</div>
                                    </div>
                                    ${donation.donationImage ? `
                                        <div class="simple-card-image" style="flex-shrink: 0;">
                                            <img src="${donation.donationImage}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 12px; border: 2px solid var(--primary-color);">
                                        </div>
                                    ` : '<div style="font-size: 2rem; opacity: 0.2;">📄</div>'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 12px; margin-bottom: 12px;">
                                    <div style="font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                                        <span>👨‍🏫 د.</span>
                                        <span style="font-weight: 600;">${donation.professorName || 'غير متوفر'}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: var(--primary-color); display: flex; align-items: center; gap: 6px; word-break: break-all;">
                                        <span>📱 التواصل:</span>
                                        <span style="font-weight: 600;">${donation.contact || 'انقر للتفاصيل'}</span>
                                    </div>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                                    <span style="background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 20px;">📚 ${donation.itemsCount} كتب</span>
                                    <span style="font-weight: 700;">انقر للتفاصيل 👉</span>
                                </div>
                            </div>

                        `;

                    }).join('');
                } else {
                    container.innerHTML = `
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
