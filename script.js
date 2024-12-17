// Card data for each level
const allCards = [
    { level: 1, cards: ["./images/card1-1.webp", "./images/card1-2.webp"], name: "Rainbow Forest" },
    { level: 2, cards: ["./images/card2-1.jpg", "./images/card2-2.jpg"], name: "Candy Castle" },
    { level: 3, cards: ["./images/card3-1.jpg", "./images/card3-2.jpg"], name: "Magic Garden" },
    { level: 4, cards: ["./images/card4-1.jpg", "./images/card4-2.jpg"], name: "Star Island" },
    { level: 5, cards: ["./images/card5-1.jpg", "./images/card5-2.jpg"], name: "Dragon Peak" }
];

// Cache selected cards
let selectedCards = JSON.parse(localStorage.getItem('selectedCards')) || [];
const maxCards = 5;

// Initialize main page
document.addEventListener('DOMContentLoaded', () => {
    renderOwnedCards();
    updateLevelButtons();
    initializeServiceWorker();
    initializeScrollEffects();
    initializeModal();
});

// Initialize modal functionality
function initializeModal() {
    const cardModal = document.getElementById('cardModal');
    const closeButton = cardModal.querySelector('.btn-close');

    // Handle modal close button
    closeButton.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(cardModal);
        if (modal) modal.hide();
    });

    // Handle escape key
    cardModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = bootstrap.Modal.getInstance(cardModal);
            if (modal) modal.hide();
        }
    });
}

// Initialize scroll effects
function initializeScrollEffects() {
    const cards = document.querySelectorAll('.img-thumbnail');
    const buttons = document.querySelectorAll('.level-btn');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
    buttons.forEach(button => observer.observe(button));
}

// Initialize service worker for offline functionality
async function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('service-worker.js');
            console.log('ServiceWorker registration successful');
        } catch (err) {
            console.log('ServiceWorker registration failed: ', err);
        }
    }
}

// Update level buttons with proper styling and names
function updateLevelButtons() {
    const levelContainer = document.getElementById('level-buttons');
    if (!levelContainer) return;

    levelContainer.innerHTML = '';
    allCards.forEach((levelData, index) => {
        // 檢查這個關卡是否已經選過卡片
        const hasSelectedCard = levelData.cards.some(card =>
            selectedCards.includes(card)
        );

        // 如果這個關卡還沒有選過卡片，才顯示按鈕
        if (!hasSelectedCard) {
            const button = document.createElement('button');
            button.className = 'level-btn btn';
            button.dataset.level = levelData.level;
            button.textContent = `Level ${levelData.level}: ${levelData.name}`;
            button.setAttribute('aria-label', `Play Level ${levelData.level}: ${levelData.name}`);
            button.addEventListener('click', () => openLevel(levelData.level));

            // Add animation class with delay
            setTimeout(() => {
                button.classList.add('new-button');
            }, index * 100);

            levelContainer.appendChild(button);
        }
    });

    // 檢查是否所有關卡都已經選過卡片
    const allLevelsSelected = allCards.every(levelData =>
        levelData.cards.some(card => selectedCards.includes(card))
    );

    // 如果所有關卡都選過了，顯示完成訊息
    if (allLevelsSelected) {
        const message = document.createElement('div');
        message.className = 'empty-message';
        message.textContent = 'All levels completed! You can view your collection above.';
        levelContainer.appendChild(message);
    }
}

// Open level modal with card options
function openLevel(level) {
    if (selectedCards.length >= maxCards) {
        showMessage('Collection Complete!', 'You have collected all available cards.');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('cardModal'));
    const cardOptionsContainer = document.getElementById('card-options');
    const modalTitle = document.querySelector('.modal-title');

    modalTitle.textContent = `Choose Your Card - ${allCards.find(l => l.level == level).name}`;
    cardOptionsContainer.innerHTML = '';

    const levelCards = allCards.find(l => l.level == level).cards;

    levelCards.forEach((card, index) => {
        const cardCol = document.createElement('div');
        cardCol.className = 'col-6';

        const cardImg = document.createElement('img');
        cardImg.src = card;
        cardImg.className = 'img-thumbnail card-choice';
        cardImg.dataset.card = card;
        cardImg.setAttribute('alt', `Card option ${index + 1} for level ${level}`);
        cardImg.setAttribute('role', 'button');
        cardImg.setAttribute('tabindex', '0');

        // Add error handling for image loading
        cardImg.onerror = function () {
            this.src = './images/placeholder.webp';
            console.error(`Failed to load image: ${card}`);
        };

        // Add keyboard support
        cardImg.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCard(card, level);
                modal.hide();
            }
        });

        // Add touch and click handlers for card selection only
        const handleSelect = () => {
            selectCard(card, level);
            modal.hide();
        };

        cardImg.addEventListener('click', handleSelect);
        cardImg.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent any default touch behavior
            handleSelect();
        });

        cardCol.appendChild(cardImg);
        cardOptionsContainer.appendChild(cardCol);
    });

    modal.show();
}

// Show message with animation
function showMessage(title, message) {
    const toast = document.createElement('div');
    toast.className = 'pixel-toast';
    toast.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Select and save card
function selectCard(card, level) {
    if (!selectedCards.includes(card)) {
        selectedCards.push(card);
        localStorage.setItem('selectedCards', JSON.stringify(selectedCards));

        // Update UI with animations
        const modal = bootstrap.Modal.getInstance(document.getElementById('cardModal'));
        if (modal) modal.hide();

        setTimeout(() => {
            updateLevelButtons();
            renderOwnedCards();

            // 計算已完成的關卡數量
            const completedLevels = allCards.filter(levelData =>
                levelData.cards.some(c => selectedCards.includes(c))
            ).length;

            // 顯示進度
            const totalLevels = allCards.length;
            const progress = Math.round((completedLevels / totalLevels) * 100);
            showMessage('Level Complete!', `Progress: ${completedLevels}/${totalLevels} Levels (${progress}%)`);
        }, 300); // Wait for modal to close
    }
}

// Render owned cards with animation
function renderOwnedCards() {
    const container = document.getElementById('owned-cards');
    container.innerHTML = '';

    if (selectedCards.length === 0) {
        const message = document.createElement('div');
        message.className = 'empty-message';
        message.textContent = 'Begin Your Adventure! Select a Level to Start';
        container.style.display = 'grid';
        container.appendChild(message);
        return;
    }

    container.style.display = '';

    selectedCards.forEach((card, index) => {
        const img = document.createElement('img');
        img.src = card;
        img.className = 'img-thumbnail collected-card';

        // Add animation class with delay
        setTimeout(() => {
            img.classList.add('new-card');
        }, index * 100);

        // Add error handling for image loading
        img.onerror = function () {
            this.src = './images/placeholder.webp';
            console.error(`Failed to load image: ${card}`);
        };

        // 觸控處理
        let touchStartTime;
        let touchStartY;
        let isTouchMoved = false;

        img.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
            isTouchMoved = false;
            img.style.transform = 'scale(0.95)';
        });

        img.addEventListener('touchmove', () => {
            isTouchMoved = true;
        });

        img.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - touchStartTime;
            const verticalMove = Math.abs(touchEndY - touchStartY);

            img.style.transform = '';

            // 只有在快速點擊且沒有明顯移動時才觸發
            if (!isTouchMoved && touchDuration < 300 && verticalMove < 10) {
                showFullscreen(card);
            }
        });

        // 只添加一個點擊事件處理器
        img.addEventListener('click', () => showFullscreen(card));

        container.appendChild(img);
    });
}

// Show card in fullscreen with error handling
function showFullscreen(card) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Card View</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    touch-action: manipulation;
                }
                img {
                    max-width: 95%;
                    max-height: 95vh;
                    object-fit: contain;
                    image-rendering: pixelated;
                }
                .close-hint {
                    position: fixed;
                    bottom: 20px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    color: #fff;
                    font-family: "Press Start 2P", cursive;
                    font-size: 12px;
                    opacity: 0.8;
                }
                .error-message {
                    color: #ff6b6b;
                    font-family: "Press Start 2P", cursive;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 4px solid #ff6b6b;
                    border-radius: 8px;
                    max-width: 80%;
                    margin: 20px;
                }
                .offline-indicator {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ffd700;
                    color: #000;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-family: "Press Start 2P", cursive;
                    font-size: 10px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .offline-indicator.show {
                    opacity: 1;
                }
            </style>
        </head>
        <body>
            <div id="offline-indicator" class="offline-indicator">OFFLINE MODE</div>
            <img src="${card}" 
                onerror="this.style.display='none'; document.body.innerHTML += '<div class=\\'error-message\\'>Failed to load image<br>Please check your connection</div>'"
                onclick="window.close()">
            <div class="close-hint">Tap anywhere to close</div>
            <script>
                // Check offline status
                function updateOfflineStatus() {
                    const indicator = document.getElementById('offline-indicator');
                    if (!navigator.onLine) {
                        indicator.classList.add('show');
                    } else {
                        indicator.classList.remove('show');
                    }
                }
                
                window.addEventListener('online', updateOfflineStatus);
                window.addEventListener('offline', updateOfflineStatus);
                updateOfflineStatus(); // Initial check
            </script>
        </body>
        </html>
    `);
}

// Hidden reset functionality with vibration feedback
let resetClickCount = 0;
let resetTimeout;
document.getElementById('hidden-reset-btn').addEventListener('click', () => {
    resetClickCount++;

    // Add vibration feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
        resetClickCount = 0;
    }, 2000);

    if (resetClickCount >= 3) {
        showMessage('Reset Complete', 'Your collection has been reset.');
        localStorage.clear();
        location.reload();
    }
});

// PWA installation handling
let deferredPrompt;
const installPrompt = document.getElementById('install-prompt');
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installPrompt.classList.add('show');

    // Hide the prompt after 5 seconds
    setTimeout(() => {
        installPrompt.classList.remove('show');
    }, 5000);
});

installButton.addEventListener('click', async () => {
    // Hide the prompt
    installPrompt.classList.remove('show');
    // Show the install prompt
    if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // Clear the deferredPrompt variable
        deferredPrompt = null;
    }
});

// Hide the install prompt if the PWA is already installed
window.addEventListener('appinstalled', () => {
    installPrompt.classList.remove('show');
    deferredPrompt = null;
});

// Check if the app is running in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    installPrompt.style.display = 'none';
}
