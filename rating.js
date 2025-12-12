// rating.js - Rating System Functions

// Add rating functionality to modal
function initializeRatingInModal(subject, subjectsRef, renderStars, calculateAverageRating) {
    // Calculate rating info  
    const ratings = subject.ratings || [];
    const averageRating = calculateAverageRating(ratings);
    const ratingCount = ratings.length;

    // Check if user has already rated this subject
    const userRatingKey = `rated_${subject.id}`;
    const hasRated = localStorage.getItem(userRatingKey);

    let ratingHTML = `
        <!-- Rating Section -->
        <div class="rating-modal-section">
            <h3>⭐ تقييم المادة</h3>
            <div class="rating-container" style="justify-content: center; border: none; padding: 0;">
                <div class="rating-stars">
                    ${renderStars(averageRating)}
                </div>
                <div class="rating-info">
                    <span class="rating-average">${averageRating.toFixed(1)}</span>
                    <span class="rating-count">(${ratingCount} تقييم)</span>
                </div>
            </div>
            
            ${hasRated ? `
                <div class="rating-submitted">
                    ✅ شكراً! لقد قيّمت هذه المادة بالفعل
                </div>
            ` : `
                <p style="text-align: center; margin: 1rem 0; color: var(--text-muted);">قيّم هذه المادة:</p>
                <div class="rating-modal-stars" id="ratingModalStars">
                    ${renderStars(0, true)}
                </div>
                <div id="ratingMessage" style="text-align: center; color: var(--text-muted); font-size: 0.9rem;"></div>
            `}
        </div>
    `;

    // Set up event listeners after HTML is inserted
    setTimeout(() => {
        if (!hasRated) {
            const ratingStars = document.querySelectorAll('#ratingModalStars .star');
            const ratingMessage = document.getElementById('ratingMessage');

            ratingStars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    highlightStars(index + 1);
                    ratingMessage.textContent = `تقييمك: ${index + 1} ${index + 1 === 1 ? 'نجمة' : 'نجوم'}`;
                });

                star.addEventListener('click', async () => {
                    const rating = index + 1;

                    try {
                        // Update ratings in Firestore
                        const currentRatings = subject.ratings || [];
                        currentRatings.push(rating);

                        await subjectsRef.doc(subject.id).update({
                            ratings: currentRatings
                        });

                        // Mark as rated in localStorage
                        localStorage.setItem(userRatingKey, rating.toString());

                        // Show success message
                        ratingMessage.innerHTML = '<span style="color: #10b981; font-weight: 600;">✅ شكراً على تقييمك!</span>';

                        // Disable further rating
                        setTimeout(() => {
                            const ratingSection = document.querySelector('.rating-modal-section');
                            ratingSection.innerHTML = `
                                <h3>⭐ تقييم المادة</h3>
                                <div class="rating-container" style="justify-content: center; border: none; padding: 0;">
                                    <div class="rating-stars">
                                        ${renderStars(calculateAverageRating(currentRatings))}
                                    </div>
                                    <div class="rating-info">
                                        <span class="rating-average">${calculateAverageRating(currentRatings).toFixed(1)}</span>
                                        <span class="rating-count">(${currentRatings.length} تقييم)</span>
                                    </div>
                                </div>
                                <div class="rating-submitted">
                                    ✅ شكراً! لقد قيّمت هذه المادة بالفعل
                                </div>
                            `;
                        }, 1500);

                    } catch (error) {
                        console.error('Error submitting rating:', error);
                        ratingMessage.innerHTML = '<span style="color: #ef4444;">❌ حدث خطأ، حاول مرة أخرى</span>';
                    }
                });
            });

            // Reset stars on mouse leave
            const starsContainer = document.getElementById('ratingModalStars');
            if (starsContainer) {
                starsContainer.addEventListener('mouseleave', () => {
                    highlightStars(0);
                    ratingMessage.textContent = '';
                });
            }
        }
    }, 100);

    return ratingHTML;
}

function highlightStars(count) {
    const stars = document.querySelectorAll('#ratingModalStars .star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Export functions
window.initializeRatingInModal = initializeRatingInModal;
window.highlightStars = highlightStars;
