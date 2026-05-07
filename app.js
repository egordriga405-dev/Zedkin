// ============================================
// 🎁 GIFT FARM - Telegram Mini App Clicker
// С интеграцией Telegram Stars Payments
// ============================================

class GiftFarm {
    constructor() {
        // Telegram WebApp
        this.tg = window.Telegram.WebApp;
        
        // ID бота (замените на свой!)
        this.BOT_USERNAME = 'Zamedkin_bot'; // Например: 'gift_farm_bot'
        
        // Состояние игры
        this.gameState = {
            parts: 0,
            stars: 0,
            gifts: {},
            upgrades: {},
            totalClicks: 0,
            sessionClicks: 0,
            partsForNextGift: 100,
            partsEarnedForGift: 0,
            lastSaveTime: Date.now(),
            lastOnlineTime: Date.now(),
            pendingInvoice: null // Для отслеживания платежей
        };
        
        // Конфиг улучшений
        this.upgradesConfig = [
            { id: 'hamster', name: '🐹 Хомяк-сборщик', baseCost: 10, costMultiplier: 1.15, pps: 1, desc: '+1 часть/сек' },
            { id: 'robot', name: '🤖 Робот-упаковщик', baseCost: 50, costMultiplier: 1.2, pps: 5, desc: '+5 частей/сек' },
            { id: 'factory', name: '🏭 Мини-фабрика', baseCost: 250, costMultiplier: 1.25, pps: 25, desc: '+25 частей/сек' },
            { id: 'station', name: '🚀 Орбитальная станция', baseCost: 1500, costMultiplier: 1.3, pps: 150, desc: '+150 частей/сек' },
            { id: 'quantum', name: '🌌 Квантовый генератор', baseCost: 10000, costMultiplier: 1.35, pps: 800, desc: '+800 частей/сек' },
            { id: 'wormhole', name: '🕳️ Червоточина', baseCost: 50000, costMultiplier: 1.4, pps: 5000, desc: '+5000 частей/сек' },
            { id: 'timemachine', name: '⏰ Машина времени', baseCost: 250000, costMultiplier: 1.5, pps: 30000, desc: '+30000 частей/сек' }
        ];
        
        // Конфиг подарков
        this.giftsConfig = {
            gift_heart:       { name: 'Сердечко', emoji: '❤️', rarity: 'common', parts: 100 },
            gift_star:        { name: 'Звезда', emoji: '⭐', rarity: 'common', parts: 100 },
            gift_flower:      { name: 'Цветок', emoji: '🌸', rarity: 'common', parts: 100 },
            gift_cookie:      { name: 'Печенька', emoji: '🍪', rarity: 'common', parts: 100 },
            gift_ring:        { name: 'Кольцо', emoji: '💍', rarity: 'uncommon', parts: 500 },
            gift_crown:       { name: 'Корона', emoji: '👑', rarity: 'uncommon', parts: 500 },
            gift_gem:         { name: 'Драгоценность', emoji: '💎', rarity: 'uncommon', parts: 500 },
            gift_rocket:      { name: 'Ракета', emoji: '🚀', rarity: 'uncommon', parts: 500 },
            gift_rainbow:     { name: 'Радуга', emoji: '🌈', rarity: 'rare', parts: 2500 },
            gift_phoenix:     { name: 'Феникс', emoji: '🦅', rarity: 'rare', parts: 2500 },
            gift_unicorn:     { name: 'Единорог', emoji: '🦄', rarity: 'rare', parts: 2500 },
            gift_dragon:      { name: 'Дракон', emoji: '🐉', rarity: 'epic', parts: 10000 },
            gift_galaxy:      { name: 'Галактика', emoji: '🌌', rarity: 'epic', parts: 10000 },
            gift_blackhole:   { name: 'Чёрная дыра', emoji: '🕳️', rarity: 'legendary', parts: 50000 },
            gift_infinity:    { name: 'Бесконечность', emoji: '♾️', rarity: 'legendary', parts: 50000 },
            gift_universe:    { name: 'Вселенная', emoji: '🌠', rarity: 'mythic', parts: 250000 },
            gift_god:         { name: 'Божественный дар', emoji: '👁️', rarity: 'mythic', parts: 250000 }
        };
        
        // Конфиг магазина с ценами в Stars
        this.shopItems = [
            { id: 'double_click', name: '🔨 Двойной клик', desc: 'x2 частей за клик на 10 минут', price: 5, type: 'booster' },
            { id: 'auto_clicker', name: '⚡ Автокликер', desc: 'Авто-клик 10 раз/сек на 5 минут', price: 15, type: 'booster' },
            { id: 'lucky_hour', name: '🍀 Час удачи', desc: 'Шанс редкого подарка +50% на 1 час', price: 30, type: 'booster' },
            { id: 'gift_pack', name: '🎁 Набор подарков', desc: '5 случайных подарков', price: 10, type: 'instant' },
            { id: 'rare_pack', name: '💫 Редкий набор', desc: '3 подарка Rare или выше', price: 50, type: 'instant' },
            { id: 'epic_pack', name: '✨ Эпический набор', desc: '1 гарантированный Epic подарок', price: 150, type: 'instant' }
        ];
        
        // Пакеты Stars для покупки
        this.starPackages = [
            { id: 'stars_50', amount: 50, price: 99, currency: 'RUB', name: '50 Stars' },
            { id: 'stars_100', amount: 100, price: 179, currency: 'RUB', name: '100 Stars' },
            { id: 'stars_250', amount: 250, price: 399, currency: 'RUB', name: '250 Stars' },
            { id: 'stars_500', amount: 500, price: 749, currency: 'RUB', name: '500 Stars' },
            { id: 'stars_1000', amount: 1000, price: 1390, currency: 'RUB', name: '1000 Stars' },
            { id: 'stars_5000', amount: 5000, price: 6490, currency: 'RUB', name: '5000 Stars' }
        ];
        
        this.mergeSlots = [null, null, null];
        this.currentFilter = 'all';
        
        // DOM элементы
        this.elements = {};
        
        // Интервалы
        this.idleInterval = null;
        this.saveInterval = null;
        
        this.init();
    }
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    init() {
        this.tg.ready();
        this.tg.expand();
        
        this.cacheElements();
        this.loadGame();
        this.startIdleMechanics();
        this.startAutoSave();
        this.bindEvents();
        
        // Инициализация платежей
        this.initPayments();
        
        this.updateUI();
        this.renderUpgrades();
        this.renderShop();
        this.renderInventory();
        this.applyTheme();
        
        console.log('🎁 Gift Farm инициализирована!', this.gameState);
    }
    
    cacheElements() {
        this.elements = {
            partsCount: document.getElementById('parts-count'),
            starsCount: document.getElementById('stars-count'),
            ppsCount: document.getElementById('pps-count'),
            
            clickZone: document.getElementById('click-zone'),
            giftEmoji: document.getElementById('gift-emoji'),
            clickEffect: document.getElementById('click-effect'),
            particlesContainer: document.getElementById('particles-container'),
            clickCounter: document.getElementById('click-counter'),
            
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            
            navBtns: document.querySelectorAll('.nav-btn'),
            screens: document.querySelectorAll('.screen'),
            backBtns: document.querySelectorAll('.back-btn'),
            
            giftsGrid: document.getElementById('gifts-grid'),
            inventoryBadge: document.getElementById('inventory-badge'),
            mergeSlots: document.querySelectorAll('.merge-slot'),
            mergeBtn: document.getElementById('merge-btn'),
            rarityBtns: document.querySelectorAll('.rarity-btn'),
            
            upgradesList: document.getElementById('upgrades-list'),
            
            shopItems: document.getElementById('shop-items'),
            shopBalance: document.getElementById('shop-balance'),
            buyStarsBtn: document.getElementById('buy-stars-btn'),
            
            giftModal: document.getElementById('gift-modal'),
            giftDisplay: document.getElementById('gift-display'),
            giftName: document.getElementById('gift-name'),
            giftRarityTag: document.getElementById('gift-rarity-tag'),
            giftDesc: document.getElementById('gift-desc'),
            closeModal: document.getElementById('close-modal'),
            
            toastContainer: document.getElementById('toast-container')
        };
    }
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ ПЛАТЕЖЕЙ
    // ============================================
    
    initPayments() {
        // Проверяем поддержку платежей
        if (this.tg.isVersionAtLeast('6.1')) {
            console.log('✅ Telegram Payments поддерживаются (v6.1+)');
        } else {
            console.warn('⚠️ Обновите Telegram для поддержки платежей');
        }
        
        // Слушаем события платежей
        this.tg.onEvent('invoiceClosed', (eventData) => {
            console.log('💰 Счёт закрыт:', eventData);
            
            if (eventData.status === 'paid') {
                this.handleSuccessfulPayment(eventData);
            } else if (eventData.status === 'cancelled') {
                this.showToast('❌ Оплата отменена');
            } else if (eventData.status === 'failed') {
                this.showToast('❌ Ошибка оплаты. Попробуйте позже');
            }
            
            // Очищаем pending invoice
            this.gameState.pendingInvoice = null;
        });
    }
    
    // ============================================
    // ПОКУПКА STARS (Telegram Payments API)
    // ============================================
    
    buyStars() {
        // Показываем выбор пакета Stars
        this.showStarsPackageModal();
    }
    
    showStarsPackageModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'stars-package-modal';
        
        let packagesHTML = this.starPackages.map(pkg => `
            <div class="stars-package-card" style="
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,215,0,0.3);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                transition: all 0.3s;
            " onclick="game.purchaseStarsPackage('${pkg.id}')">
                <div>
                    <div style="font-weight:700;font-size:16px;">⭐ ${pkg.name}</div>
                    <div style="color:var(--tg-theme-hint);font-size:12px;margin-top:4px;">
                        ${pkg.amount} звёзд для покупок
                    </div>
                </div>
                <div style="
                    background: linear-gradient(135deg, #ffd700, #ff8f00);
                    color: #000;
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 16px;
                ">
                    ${pkg.price} ${pkg.currency}
                </div>
            </div>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 360px;">
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
                <h2 style="margin-bottom:16px;">💎 Купить Telegram Stars</h2>
                <p style="color:var(--tg-theme-hint);font-size:13px;margin-bottom:16px;">
                    Звёзды используются для покупки бустеров, наборов подарков и ускорения прогресса
                </p>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${packagesHTML}
                </div>
                <p style="font-size:11px;color:var(--tg-theme-hint);margin-top:12px;text-align:center;">
                    🔒 Безопасная оплата через Telegram
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    purchaseStarsPackage(packageId) {
        const pkg = this.starPackages.find(p => p.id === packageId);
        if (!pkg) return;
        
        // Закрываем модальное окно выбора
        const modal = document.getElementById('stars-package-modal');
        if (modal) modal.remove();
        
        // Проверяем поддержку платежей
        if (!this.tg.isVersionAtLeast('6.1')) {
            this.showToast('❌ Обновите Telegram для покупки звёзд');
            return;
        }
        
        // Создаём инвойс
        this.createInvoice(pkg);
    }
    
    // Заменяем метод createInvoice в вашем app.js
createInvoice(pkg) {
    // Генерируем уникальный ID транзакции
    const transactionId = `stars_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Сохраняем информацию о pending платеже
    this.gameState.pendingInvoice = {
        transactionId,
        packageId: pkg.id,
        amount: pkg.amount,
        timestamp: Date.now()
    };

    console.log(`💎 Открываем счёт на ${pkg.amount} Звёзд...`);
    
    // Выставляем счёт через Telegram API
    this.tg.openInvoice({
        title: `Покупка ${pkg.amount} Stars`,
        description: `Звёзды для Gift Farm. Можно использовать для покупки бустеров и наборов подарков.`,
        currency: 'XTR', // Специальный код для Telegram Stars [citation:7]
        prices: [{
            label: `${pkg.amount} Telegram Stars`,
            amount: pkg.price * 100 // Цена в копейках/центах (для отображения в UI Telegram)
        }],
        payload: JSON.stringify({
            type: 'stars_purchase',
            transaction_id: transactionId,
            package_id: pkg.id,
            amount: pkg.amount,
            user_id: this.tg.initDataUnsafe?.user?.id || 'anonymous'
        }),
        // Для Звёзд provider_token оставляем пустым [citation:7]
        provider_token: '',
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        send_phone_number_to_provider: false,
        send_email_to_provider: false,
        is_flexible: false
    });
}
    
    // ============================================
    // ОБРАБОТКА УСПЕШНОГО ПЛАТЕЖА
    // ============================================
    
    handleSuccessfulPayment(eventData) {
        const pendingInvoice = this.gameState.pendingInvoice;
        
        if (!pendingInvoice) {
            console.warn('⚠️ Нет информации оpending платеже');
            // Всё равно пробуем обработать
            this.addStarsFromPayload(eventData);
            return;
        }
        
        // Проверяем, что прошло не более 30 минут
        const timeDiff = Date.now() - pendingInvoice.timestamp;
        if (timeDiff > 1800000) {
            console.warn('⚠️ Платёж просрочен');
            return;
        }
        
        // Начисляем звёзды
        this.addStars(pendingInvoice.amount, pendingInvoice.transactionId);
        
        // Сохраняем игру
        this.saveGame();
    }
    
    addStarsFromPayload(eventData) {
        // Пробуем извлечь данные из payload
        try {
            const payload = JSON.parse(eventData.payload || '{}');
            if (payload.amount) {
                this.addStars(payload.amount, payload.transaction_id);
            }
        } catch (e) {
            console.error('Ошибка парсинга payload:', e);
        }
    }
    
    addStars(amount, transactionId) {
        this.gameState.stars += amount;
        
        // Показываем анимацию получения звёзд
        this.showStarsAnimation(amount);
        
        // Сохраняем
        this.saveGame();
        this.updateUI();
        
        console.log(`✅ Начислено ${amount} Stars. Транзакция: ${transactionId}`);
        console.log(`💰 Баланс: ${this.gameState.stars} Stars`);
    }
    
    showStarsAnimation(amount) {
        // Создаём специальное уведомление
        const toast = document.createElement('div');
        toast.className = 'toast legendary';
        toast.style.cssText = `
            background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,143,0,0.2));
            border: 2px solid #ffd700;
            font-size: 16px;
            padding: 20px;
            animation: legendaryToast 0.5s ease-out;
        `;
        toast.innerHTML = `
            <div style="font-size:40px;margin-bottom:8px;">💎</div>
            <div style="font-weight:700;">+${amount} Stars!</div>
            <div style="font-size:12px;color:var(--tg-theme-hint);">Спасибо за поддержку! 🌟</div>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Звуковой сигнал (если доступен)
        this.hapticFeedback('success');
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }
    
    // ============================================
    // АЛЬТЕРНАТИВНЫЙ МЕТОД: ПРЯМАЯ ССЫЛКА
    // ============================================
    
    buyStarsAlternative() {
        // Если API не работает, открываем бота для покупки
        const message = encodeURIComponent('/buy_stars');
        const botUrl = `https://t.me/${this.BOT_USERNAME}?start=buy_stars`;
        
        this.tg.openTelegramLink(botUrl);
        
        this.showToast('💎 Открываем бота для покупки звёзд...');
    }
    
    // ============================================
    // МАГАЗИН (обновлённый рендер)
    // ============================================
    
    renderShop() {
        const container = this.elements.shopItems;
        container.innerHTML = '';
        
        this.shopItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.innerHTML = `
                <div class="shop-icon">${item.name.split(' ')[0]}</div>
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc}</div>
                </div>
                <button class="shop-price" data-id="${item.id}">
                    ⭐ ${item.price}
                </button>
            `;
            
            container.appendChild(card);
            
            const buyBtn = card.querySelector('.shop-price');
            buyBtn.addEventListener('click', () => this.buyShopItem(item));
        });
    }
    
    buyShopItem(item) {
        if (this.gameState.stars < item.price) {
            this.showToast('❌ Недостаточно Stars! 💎');
            
            // Предлагаем купить звёзды
            setTimeout(() => {
                this.showToast('💎 Нажмите "Купить Stars" для пополнения');
            }, 1500);
            
            this.hapticFeedback('error');
            return;
        }
        
        this.gameState.stars -= item.price;
        
        switch (item.type) {
            case 'booster':
                this.activateBooster(item.id);
                break;
            case 'instant':
                this.openItemPack(item.id);
                break;
        }
        
        this.hapticFeedback('success');
        this.showToast(`✅ Куплено: ${item.name}!`);
        this.saveGame();
        this.updateUI();
    }
    
    activateBooster(boosterId) {
        if (!this.activeBoosters) this.activeBoosters = {};
        const boosterTimes = {
            'double_click': 600000,    // 10 минут
            'auto_clicker': 300000,     // 5 минут
            'lucky_hour': 3600000       // 1 час
        };
        
        const duration = boosterTimes[boosterId] || 300000;
        
        switch (boosterId) {
            case 'double_click':
                this.activeBoosters.doubleClick = true;
                this.showToast('🔨 Двойной клик активирован на 10 минут!');
                setTimeout(() => {
                    this.activeBoosters.doubleClick = false;
                    this.showToast('⏰ Двойной клик закончился!');
                }, duration);
                break;
                
            case 'auto_clicker':
                this.activeBoosters.autoClicker = true;
                this.showToast('⚡ Автокликер активирован на 5 минут!');
                const autoClickInterval = setInterval(() => {
                    if (!this.activeBoosters.autoClicker) {
                        clearInterval(autoClickInterval);
                        return;
                    }
                    // Симулируем клик
                    const fakeEvent = { 
                        clientX: Math.random() * 200 + 100, 
                        clientY: Math.random() * 200 + 100 
                    };
                    this.handleClick(fakeEvent);
                }, 100);
                setTimeout(() => {
                    this.activeBoosters.autoClicker = false;
                    this.showToast('⏰ Автокликер закончился!');
                }, duration);
                break;
                
            case 'lucky_hour':
                this.activeBoosters.luckyHour = true;
                this.showToast('🍀 Час удачи активирован! +50% к шансу редких подарков');
                setTimeout(() => {
                    this.activeBoosters.luckyHour = false;
                    this.showToast('⏰ Час удачи закончился!');
                }, duration);
                break;
        }
    }
    
    openItemPack(packId) {
        switch (packId) {
            case 'gift_pack':
                for (let i = 0; i < 5; i++) {
                    this.createRandomGift();
                }
                this.showToast('🎁 Открыт набор из 5 подарков!');
                break;
            case 'rare_pack':
                for (let i = 0; i < 3; i++) {
                    const roll = Math.random();
                    let rarity;
                    if (roll < 0.1) rarity = 'mythic';
                    else if (roll < 0.3) rarity = 'legendary';
                    else if (roll < 0.6) rarity = 'epic';
                    else rarity = 'rare';
                    
                    const possibleGifts = Object.entries(this.giftsConfig)
                        .filter(([_, c]) => c.rarity === rarity);
                    const [giftId, config] = possibleGifts[Math.floor(Math.random() * possibleGifts.length)];
                    
                    this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                }
                this.showToast('💫 Открыт редкий набор!');
                break;
            case 'epic_pack':
                const epicGifts = Object.entries(this.giftsConfig)
                    .filter(([_, c]) => c.rarity === 'epic');
                const [giftId, config] = epicGifts[Math.floor(Math.random() * epicGifts.length)];
                this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                this.showGiftModal(giftId, config);
                break;
        }
        
        this.renderInventory(this.currentFilter);
        this.saveGame();
    }
    
    // ============================================
    // ЗАГРУЗКА / СОХРАНЕНИЕ
    // ============================================
    
    loadGame() {
        const saved = localStorage.getItem('giftFarmState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...parsed };
                this.gameState.lastOnlineTime = Date.now();
                console.log('💾 Игра загружена из localStorage');
            } catch (e) {
                console.error('Ошибка загрузки:', e);
            }
        }
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.getItem('giftFarmState', (err, value) => {
                if (!err && value) {
                    try {
                        const cloudState = JSON.parse(value);
                        if (cloudState.lastSaveTime > this.gameState.lastSaveTime) {
                            this.gameState = { ...this.gameState, ...cloudState };
                            this.gameState.lastOnlineTime = Date.now();
                            console.log('☁️ Игра загружена из CloudStorage');
                        }
                    } catch (e) {
                        console.error('Ошибка загрузки из CloudStorage:', e);
                    }
                }
                this.calculateOfflineEarnings();
                this.updateUI();
            });
        } else {
            this.calculateOfflineEarnings();
        }
    }
    
    calculateOfflineEarnings() {
        const now = Date.now();
        const offlineSeconds = Math.floor((now - this.gameState.lastOnlineTime) / 1000);
        
        if (offlineSeconds > 10 && this.getTotalPPS() > 0) {
            const pps = this.getTotalPPS();
            const earned = Math.floor(pps * offlineSeconds * 0.3);
            
            if (earned > 0) {
                this.gameState.parts += earned;
                this.showToast(`⏰ Вы отсутствовали ${this.formatTime(offlineSeconds)}\nЗа это время добыто ${this.formatNumber(earned)} частей!`);
            }
        }
        
        this.gameState.lastOnlineTime = now;
    }
    
    saveGame() {
        this.gameState.lastSaveTime = Date.now();
        const stateString = JSON.stringify(this.gameState);
        
        localStorage.setItem('giftFarmState', stateString);
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.setItem('giftFarmState', stateString);
        }
    }
    
    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 10000);
    }
    
    // ============================================
    // IDLE МЕХАНИКА
    // ============================================
    
    startIdleMechanics() {
        this.idleInterval = setInterval(() => {
            const pps = this.getTotalPPS();
            if (pps > 0) {
                this.gameState.parts += pps;
                this.gameState.partsEarnedForGift += pps;
                
                if (this.gameState.partsEarnedForGift >= this.gameState.partsForNextGift) {
                    const extraProgress = this.gameState.partsEarnedForGift - this.gameState.partsForNextGift;
                    this.createRandomGift();
                    this.gameState.partsEarnedForGift = extraProgress;
                    this.gameState.partsForNextGift = this.getNextGiftCost();
                }
                
                this.updateUI();
            }
        }, 1000);
    }
    
    getTotalPPS() {
        if (!this.gameState.upgrades) return 0;
        let total = 0;
        
        this.upgradesConfig.forEach(upgrade => {
            const level = this.gameState.upgrades[upgrade.id] || 0;
            total += upgrade.pps * level;
        });
        
        const totalGifts = this.getTotalGiftsCount();
        total += Math.floor(totalGifts * 0.1);
        
        return total;
    }
    
    getTotalGiftsCount() {
        if (!this.gameState.gifts) return 0;
        return Object.values(this.gameState.gifts).reduce((sum, count) => sum + count, 0);
    }
    
    // ============================================
    // КЛИКЕР
    // ============================================
    
    handleClick(e) {
        let clickValue = 1;
        
        if (this.activeBoosters?.doubleClick) {
            clickValue *= 2;
        }
        
        this.gameState.parts += clickValue;
        this.gameState.partsEarnedForGift += clickValue;
        this.gameState.totalClicks++;
        this.gameState.sessionClicks++;
        
        this.createClickEffect(e, clickValue);
        this.createParticles(e);
        
        this.elements.giftEmoji.classList.add('pressed');
        setTimeout(() => {
            this.elements.giftEmoji.classList.remove('pressed');
        }, 150);
        
        this.hapticFeedback('light');
        
        if (this.gameState.partsEarnedForGift >= this.gameState.partsForNextGift) {
            const extraProgress = this.gameState.partsEarnedForGift - this.gameState.partsForNextGift;
            this.createRandomGift();
            this.gameState.partsEarnedForGift = extraProgress;
            this.gameState.partsForNextGift = this.getNextGiftCost();
            this.hapticFeedback('success');
        }
        
        this.updateUI();
    }
    
    getNextGiftCost() {
        const totalGifts = this.getTotalGiftsCount();
        return Math.floor(100 + totalGifts * 5);
    }
    
    createRandomGift() {
        const rarityRoll = Math.random();
        let selectedRarity;
        
        if (rarityRoll < 0.005) selectedRarity = 'mythic';
        else if (rarityRoll < 0.02) selectedRarity = 'legendary';
        else if (rarityRoll < 0.07) selectedRarity = 'epic';
        else if (rarityRoll < 0.20) selectedRarity = 'rare';
        else if (rarityRoll < 0.45) selectedRarity = 'uncommon';
        else selectedRarity = 'common';
        
        if (this.activeBoosters?.luckyHour) {
            if (Math.random() < 0.5) {
                const upgradeOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                const currentIndex = upgradeOrder.indexOf(selectedRarity);
                if (currentIndex < upgradeOrder.length - 1) {
                    selectedRarity = upgradeOrder[currentIndex + 1];
                }
            }
        }
        
        const possibleGifts = Object.entries(this.giftsConfig)
            .filter(([_, config]) => config.rarity === selectedRarity);
        
        const randomGift = possibleGifts[Math.floor(Math.random() * possibleGifts.length)];
        const [giftId, giftConfig] = randomGift;
        
        if (!this.gameState.gifts) this.gameState.gifts = {};
        this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
        
        this.showGiftModal(giftId, giftConfig);
        
        if (['epic', 'legendary', 'mythic'].includes(selectedRarity)) {
            this.showToast(`🎉 ${giftConfig.emoji} ${giftConfig.name}!`, selectedRarity);
        }
        
        return { giftId, giftConfig };
    }
    
    // ============================================
    // ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
    // ============================================
    
    createClickEffect(e, value) {
        const effect = this.elements.clickEffect;
        effect.textContent = `+${value}`;
        effect.className = 'click-effect show';
        
        const rect = this.elements.clickZone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        
        setTimeout(() => {
            effect.className = 'click-effect';
        }, 100);
    }
    
    createParticles(e) {
        const container = this.elements.particlesContainer;
        const rect = this.elements.clickZone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const emojis = ['✨', '💫', '⭐', '💛', '🎀'];
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('span');
            particle.className = 'particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--x', `${(Math.random() - 0.5) * 120}px`);
            particle.style.setProperty('--y', `${(Math.random() - 0.5) * 120 - 50}px`);
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }
    
    // ============================================
    // МОДАЛЬНОЕ ОКНО ПОДАРКА
    // ============================================
    
    showGiftModal(giftId, giftConfig) {
        this.elements.giftDisplay.textContent = giftConfig.emoji;
        this.elements.giftName.textContent = giftConfig.name;
        
        const rarityTag = this.elements.giftRarityTag;
        rarityTag.textContent = this.getRarityName(giftConfig.rarity);
        rarityTag.className = `gift-rarity-tag ${giftConfig.rarity}`;
        
        this.elements.giftDesc.textContent = `Редкость: ${this.getRarityName(giftConfig.rarity)}\nКоличество: ${this.gameState.gifts[giftId] || 1} шт.`;
        this.elements.giftModal.classList.add('active');
        
        const reveal = document.getElementById('gift-reveal');
        reveal.style.animation = 'none';
        reveal.offsetHeight;
        reveal.style.animation = 'revealPop 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    closeGiftModal() {
        this.elements.giftModal.classList.remove('active');
    }
    
    // ============================================
    // АПГРЕЙДЫ
    // ============================================
    
    renderUpgrades() {
        const container = this.elements.upgradesList;
        container.innerHTML = '';
        
        this.upgradesConfig.forEach(upgrade => {
            const level = this.gameState.upgrades[upgrade.id] || 0;
            const cost = this.getUpgradeCost(upgrade);
            const maxLevel = 100;
            
            const card = document.createElement('div');
            card.className = `upgrade-card ${level > 0 ? 'owned' : ''}`;
            card.innerHTML = `
                <div class="upgrade-icon">${upgrade.name.split(' ')[0]}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-effect">${upgrade.desc}</div>
                    ${level > 0 ? `<div class="upgrade-count">Уровень: ${level} | Эффект: +${upgrade.pps * level}/сек</div>` : ''}
                </div>
                <button class="upgrade-buy ${level >= maxLevel ? 'max-level' : ''}" 
                        data-id="${upgrade.id}"
                        ${level >= maxLevel ? 'disabled' : ''}>
                    ${level >= maxLevel ? 'MAX' : `⚡ ${this.formatNumber(cost)}`}
                </button>
            `;
            
            container.appendChild(card);
            
            const buyBtn = card.querySelector('.upgrade-buy');
            buyBtn.addEventListener('click', () => this.buyUpgrade(upgrade.id));
        });
    }
    
    getUpgradeCost(upgrade) {
        const level = this.gameState.upgrades[upgrade.id] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = this.upgradesConfig.find(u => u.id === upgradeId);
        if (!upgrade) return;
        
        const level = this.gameState.upgrades[upgradeId] || 0;
        const cost = this.getUpgradeCost(upgrade);
        
        if (level >= 100) {
            this.showToast('Максимальный уровень!');
            return;
        }
        
        if (this.gameState.parts >= cost) {
            this.gameState.parts -= cost;
            this.gameState.upgrades[upgradeId] = level + 1;
            
            this.hapticFeedback('success');
            this.showToast(`✅ ${upgrade.name}: уровень ${level + 1}!`);
            
            this.updateUI();
            this.renderUpgrades();
            this.saveGame();
        } else {
            this.hapticFeedback('error');
            this.showToast('❌ Недостаточно частей!');
        }
    }
    
    // ============================================
    // ИНВЕНТАРЬ
    // ============================================
    
    renderInventory(filter = 'all') {
        this.currentFilter = filter;
        const container = this.elements.giftsGrid;
        container.innerHTML = '';
        
        if (!this.gameState.gifts || Object.keys(this.gameState.gifts).length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">
                    📦 Пока нет подарков<br>Кликайте на ферме, чтобы создавать их!
                </div>
            `;
            this.elements.inventoryBadge.style.display = 'none';
            return;
        }
        
        let hasGifts = false;
        
        Object.entries(this.gameState.gifts).forEach(([giftId, count]) => {
            const config = this.giftsConfig[giftId];
            if (!config || count <= 0) return;
            if (filter !== 'all' && config.rarity !== filter) return;
            
            hasGifts = true;
            
            const card = document.createElement('div');
            card.className = 'gift-card';
            card.setAttribute('data-rarity', config.rarity);
            card.setAttribute('data-gift-id', giftId);
            
            if (this.mergeSlots.includes(giftId)) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <span class="gift-count">${count}</span>
                <div class="gift-emoji-display">${config.emoji}</div>
                <div class="gift-name-display">${config.name}</div>
                <div class="gift-rarity-display">${this.getRarityName(config.rarity)}</div>
            `;
            
            card.addEventListener('click', () => this.selectForMerge(giftId, config));
            container.appendChild(card);
        });
        
        if (!hasGifts && filter !== 'all') {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">
                    Нет подарков этой редкости
                </div>
            `;
        }
        
        const totalGifts = this.getTotalGiftsCount();
        if (totalGifts > 0) {
            this.elements.inventoryBadge.style.display = 'flex';
            this.elements.inventoryBadge.textContent = totalGifts > 99 ? '99+' : totalGifts;
        } else {
            this.elements.inventoryBadge.style.display = 'none';
        }
    }
    
    selectForMerge(giftId, config) {
        const count = this.gameState.gifts[giftId] || 0;
        
        const existingIndex = this.mergeSlots.indexOf(giftId);
        if (existingIndex !== -1) {
            this.mergeSlots[existingIndex] = null;
            this.updateMergeSlots();
            this.renderInventory(this.currentFilter);
            return;
        }
        
        const otherGiftInSlots = this.mergeSlots.find(slot => slot !== null && slot !== giftId);
        if (otherGiftInSlots) {
            this.showToast('❌ Выберите одинаковые подарки для мержа!');
            return;
        }
        
        const emptySlotIndex = this.mergeSlots.indexOf(null);
        if (emptySlotIndex === -1) {
            this.showToast('Выберите не более 3 подарков');
            return;
        }
        
        const alreadySelected = this.mergeSlots.filter(s => s === giftId).length;
        if (alreadySelected >= count) {
            this.showToast('Недостаточно подарков этого типа!');
            return;
        }
        
        this.mergeSlots[emptySlotIndex] = giftId;
        
        this.updateMergeSlots();
        this.renderInventory(this.currentFilter);
        
        const filledSlots = this.mergeSlots.filter(s => s !== null);
        if (filledSlots.length === 3) {
            this.elements.mergeBtn.disabled = false;
            this.elements.mergeBtn.textContent = '🔨 Объединить (создать подарок выше)';
        } else {
            this.elements.mergeBtn.disabled = true;
            this.elements.mergeBtn.textContent = `🔨 Выберите ещё ${3 - filledSlots.length} подарка`;
        }
    }
    
    updateMergeSlots() {
        this.elements.mergeSlots.forEach((slot, index) => {
            const giftId = this.mergeSlots[index];
            if (giftId && this.giftsConfig[giftId]) {
                slot.textContent = this.giftsConfig[giftId].emoji;
                slot.className = 'merge-slot filled';
                slot.onclick = () => {
                    this.mergeSlots[index] = null;
                    this.updateMergeSlots();
                    this.renderInventory(this.currentFilter);
                    this.elements.mergeBtn.disabled = true;
                    this.elements.mergeBtn.textContent = '🔨 Выберите 3 одинаковых подарка';
                };
            } else {
                slot.textContent = '';
                slot.className = 'merge-slot empty';
                slot.onclick = null;
            }
        });
    }
    
    mergeGifts() {
        const filledSlots = this.mergeSlots.filter(s => s !== null);
        if (filledSlots.length !== 3) return;
        
        const giftId = filledSlots[0];
        const config = this.giftsConfig[giftId];
        
        if (!config) return;
        if ((this.gameState.gifts[giftId] || 0) < 3) {
            this.showToast('❌ Недостаточно подарков!');
            return;
        }
        
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const currentIndex = rarityOrder.indexOf(config.rarity);
        
        if (currentIndex >= rarityOrder.length - 1) {
            this.showToast('❌ Мифические подарки нельзя объединить!');
            return;
        }
        
        const nextRarity = rarityOrder[currentIndex + 1];
        const possibleUpgrades = Object.entries(this.giftsConfig)
            .filter(([_, c]) => c.rarity === nextRarity);
        
        if (possibleUpgrades.length === 0) return;
        
        this.gameState.gifts[giftId] -= 3;
        if (this.gameState.gifts[giftId] <= 0) {
            delete this.gameState.gifts[giftId];
        }
        
        const [newGiftId, newConfig] = possibleUpgrades[Math.floor(Math.random() * possibleUpgrades.length)];
        this.gameState.gifts[newGiftId] = (this.gameState.gifts[newGiftId] || 0) + 1;
        
        this.mergeSlots = [null, null, null];
        this.updateMergeSlots();
        this.elements.mergeBtn.disabled = true;
        this.elements.mergeBtn.textContent = '🔨 Выберите 3 одинаковых подарка';
        
        this.hapticFeedback('success');
        this.showToast(`🔨 Создан: ${newConfig.emoji} ${newConfig.name}!`, nextRarity);
        
        this.renderInventory(this.currentFilter);
        this.updateUI();
        this.saveGame();
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ UI
    // ============================================
    
    updateUI() {
        this.elements.partsCount.textContent = this.formatNumber(this.gameState.parts);
        this.elements.starsCount.textContent = this.gameState.stars;
        this.elements.ppsCount.textContent = this.formatNumber(this.getTotalPPS());
        
        const progress = Math.min((this.gameState.partsEarnedForGift / this.gameState.partsForNextGift) * 100, 100);
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = 
            `${this.formatNumber(this.gameState.partsEarnedForGift)} / ${this.formatNumber(this.gameState.partsForNextGift)}`;
        
        this.elements.clickCounter.textContent = `Сессия: ${this.gameState.sessionClicks} кликов`;
        
        if (this.elements.shopBalance) {
            this.elements.shopBalance.textContent = this.gameState.stars;
        }
    }
    
    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    
    switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-screen') === screenName);
        });
        
        if (screenName === 'inventory') this.renderInventory();
        if (screenName === 'upgrades') this.renderUpgrades();
        if (screenName === 'shop') this.elements.shopBalance.textContent = this.gameState.stars;
    }
    
    // ============================================
    // СОБЫТИЯ
    // ============================================
    
    bindEvents() {
        this.elements.clickZone.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        this.elements.clickZone.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) e.preventDefault();
        });
        
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchScreen(btn.getAttribute('data-screen'));
                this.hapticFeedback('light');
            });
        });
        
        this.elements.backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchScreen('main');
                this.hapticFeedback('light');
            });
        });
        
        this.elements.closeModal.addEventListener('click', () => {
            this.closeGiftModal();
        });
        
        this.elements.giftModal.addEventListener('click', (e) => {
            if (e.target === this.elements.giftModal) this.closeGiftModal();
        });
        
        // Мерж
        this.elements.mergeBtn.addEventListener('click', () => {
            this.mergeGifts();
        });
        
        // Фильтры
        this.elements.rarityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.rarityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderInventory(btn.getAttribute('data-rarity'));
            });
        });
        
        // Кнопка покупки Stars (основная)
        this.elements.buyStarsBtn.addEventListener('click', () => {
            this.buyStars();
        });
        
        // Сохранение при закрытии
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveGame();
            } else {
                this.calculateOfflineEarnings();
                this.updateUI();
            }
        });
        
        // Обработка темы
        this.tg.onEvent('themeChanged', () => {
            this.applyTheme();
        });
    }
    
    // ============================================
    // ТЕМА
    // ============================================
    
    applyTheme() {
        const themeParams = this.tg.themeParams;
        if (themeParams.bg_color) document.documentElement.style.setProperty('--tg-theme-bg', themeParams.bg_color);
        if (themeParams.text_color) document.documentElement.style.setProperty('--tg-theme-text', themeParams.text_color);
        if (themeParams.button_color) document.documentElement.style.setProperty('--tg-theme-button', themeParams.button_color);
        if (themeParams.secondary_bg_color) document.documentElement.style.setProperty('--tg-theme-secondary-bg', themeParams.secondary_bg_color);
    }
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    hapticFeedback(type) {
        if (this.tg.HapticFeedback) {
            try {
                if (type === 'success' || type === 'error') {
                    this.tg.HapticFeedback.notificationOccurred(type);
                } else {
                    this.tg.HapticFeedback.impactOccurred(type);
                }
            } catch (e) {}
        }
    }
    
    showToast(message, type = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    formatTime(seconds) {
        if (seconds < 60) return `${seconds} сек`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
        return `${Math.floor(seconds / 3600)} ч ${Math.floor((seconds % 3600) / 60)} мин`;
    }
    
    getRarityName(rarity) {
        const names = {
            common: 'Обычный',
            uncommon: 'Необычный',
            rare: 'Редкий',
            epic: 'Эпический',
            legendary: 'Легендарный',
            mythic: 'Мифический'
        };
        return names[rarity] || rarity;
    }
}

// ============================================
// ЗАПУСК ИГРЫ
// ============================================

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new GiftFarm();
    window.game = game;
});
