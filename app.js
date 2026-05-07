// ============================================
// 🎁 GIFT FARM - Telegram Mini App Clicker
// ДОНАТ ТОЛЬКО ЧЕРЕЗ TELEGRAM STARS
// ============================================

class GiftFarm {
    constructor() {
        this.tg = window.Telegram.WebApp;
        
        // ID бота
        this.BOT_USERNAME = 'gift_farm_bot'; // ЗАМЕНИТЕ НА СВОЙ
        
        // Состояние игры
        this.gameState = {
            parts: 0,
            gifts: {},
            upgrades: {},
            totalClicks: 0,
            sessionClicks: 0,
            partsForNextGift: 100,
            partsEarnedForGift: 0,
            lastSaveTime: Date.now(),
            lastOnlineTime: Date.now(),
            pendingTransaction: null
        };
        
        // Конфиг улучшений (покупаются за части)
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
        
        // ТОВАРЫ МАГАЗИНА (цены в Telegram Stars)
        this.shopItems = [
            { 
                id: 'booster_double', 
                name: '🔨 Двойной клик', 
                desc: 'x2 частей за клик на 10 минут', 
                price: 5,  // 5 Telegram Stars
                type: 'booster' 
            },
            { 
                id: 'booster_auto', 
                name: '⚡ Автокликер', 
                desc: 'Авто-клик 10 раз/сек на 5 минут', 
                price: 15, // 15 Telegram Stars
                type: 'booster' 
            },
            { 
                id: 'booster_lucky', 
                name: '🍀 Час удачи', 
                desc: 'Шанс редкого подарка +50% на 1 час', 
                price: 30, // 30 Telegram Stars
                type: 'booster' 
            },
            { 
                id: 'pack_basic', 
                name: '🎁 Набор подарков', 
                desc: '5 случайных подарков', 
                price: 10, // 10 Telegram Stars
                type: 'instant' 
            },
            { 
                id: 'pack_rare', 
                name: '💫 Редкий набор', 
                desc: '3 подарка Rare или выше', 
                price: 50, // 50 Telegram Stars
                type: 'instant' 
            },
            { 
                id: 'pack_epic', 
                name: '✨ Эпический набор', 
                desc: '1 гарантированный Epic подарок', 
                price: 150, // 150 Telegram Stars
                type: 'instant' 
            }
        ];
        
        this.mergeSlots = [null, null, null];
        this.currentFilter = 'all';
        this.elements = {};
        
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
        
        // Настройка обработчика платежей
        this.setupPaymentHandler();
        
        this.updateUI();
        this.renderUpgrades();
        this.renderShop();
        this.renderInventory();
        this.applyTheme();
        
        console.log('🎁 Gift Farm готов! Оплата через Telegram Stars');
    }
    
    cacheElements() {
        this.elements = {
            partsCount: document.getElementById('parts-count'),
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
    // ОБРАБОТЧИК ПЛАТЕЖЕЙ TELEGRAM STARS
    // ============================================
    
    setupPaymentHandler() {
        // Слушаем закрытие счёта
        this.tg.onEvent('invoiceClosed', (eventData) => {
            console.log('💰 Результат оплаты:', eventData);
            
            if (eventData.status === 'paid') {
                this.handleSuccessfulPayment(eventData);
            } else if (eventData.status === 'cancelled') {
                this.showToast('💎 Оплата отменена');
            } else if (eventData.status === 'failed') {
                this.showToast('❌ Ошибка оплаты');
            }
            
            this.gameState.pendingTransaction = null;
        });
    }
    
    // ПОКУПКА ТОВАРА ЗА TELEGRAM STARS
    buyShopItem(item) {
        // ВСЕГДА запрашиваем оплату через Telegram Stars
        this.requestStarsPayment(item);
    }
    
    requestStarsPayment(item) {
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Сохраняем что покупаем
        this.gameState.pendingTransaction = {
            transactionId,
            itemId: item.id,
            itemType: item.type,
            itemName: item.name,
            price: item.price,
            timestamp: Date.now()
        };
        
        console.log(`💎 Запрос оплаты: ${item.name} за ${item.price} Stars`);
        
        // Открываем счёт в Telegram Stars
        this.tg.openInvoice({
            title: item.name,
            description: item.desc,
            currency: 'XTR', // ВАЖНО: код валюты Telegram Stars
            prices: [{
                label: item.name,
                amount: item.price * 100 // Сумма в минимальных единицах
            }],
            payload: JSON.stringify({
                transaction_id: transactionId,
                item_id: item.id,
                item_type: item.type,
                price: item.price
            }),
            provider_token: '', // Для Stars пустой
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            is_flexible: false
        });
    }
    
    handleSuccessfulPayment(eventData) {
        const pending = this.gameState.pendingTransaction;
        
        if (!pending) {
            console.warn('⚠️ Нет данных о транзакции');
            return;
        }
        
        // Проверяем время (макс 30 минут на оплату)
        if (Date.now() - pending.timestamp > 1800000) {
            console.warn('⚠️ Транзакция просрочена');
            return;
        }
        
        console.log(`✅ Оплата получена: ${pending.itemName}`);
        
        // Начисляем товар
        this.grantItem(pending.itemId, pending.itemType);
        
        // Эффект
        this.showPaymentSuccess(pending.itemName, pending.price);
        
        // Сохраняем
        this.saveGame();
    }
    
    grantItem(itemId, itemType) {
        switch (itemType) {
            case 'booster':
                this.activateBooster(itemId);
                break;
            case 'instant':
                this.openPurchasedPack(itemId);
                break;
        }
    }
    
    activateBooster(boosterId) {
        if (!this.activeBoosters) this.activeBoosters = {};
        
        switch (boosterId) {
            case 'booster_double':
                this.activeBoosters.doubleClick = true;
                this.showToast('🔨 Двойной клик на 10 минут!');
                setTimeout(() => {
                    this.activeBoosters.doubleClick = false;
                    this.showToast('⏰ Двойной клик закончился');
                }, 600000);
                break;
                
            case 'booster_auto':
                this.activeBoosters.autoClicker = true;
                this.showToast('⚡ Автокликер на 5 минут!');
                const interval = setInterval(() => {
                    if (!this.activeBoosters.autoClicker) {
                        clearInterval(interval);
                        return;
                    }
                    this.handleClick({ 
                        clientX: Math.random() * 200 + 100, 
                        clientY: Math.random() * 200 + 100 
                    });
                }, 100);
                setTimeout(() => {
                    this.activeBoosters.autoClicker = false;
                    this.showToast('⏰ Автокликер закончился');
                }, 300000);
                break;
                
            case 'booster_lucky':
                this.activeBoosters.luckyHour = true;
                this.showToast('🍀 Час удачи! +50% к редким подаркам');
                setTimeout(() => {
                    this.activeBoosters.luckyHour = false;
                    this.showToast('⏰ Час удачи закончился');
                }, 3600000);
                break;
        }
    }
    
    openPurchasedPack(packId) {
        switch (packId) {
            case 'pack_basic':
                for (let i = 0; i < 5; i++) {
                    this.createRandomGift();
                }
                this.showToast('🎁 Получено 5 подарков!');
                break;
                
            case 'pack_rare':
                for (let i = 0; i < 3; i++) {
                    const roll = Math.random();
                    let rarity;
                    if (roll < 0.1) rarity = 'mythic';
                    else if (roll < 0.3) rarity = 'legendary';
                    else if (roll < 0.6) rarity = 'epic';
                    else rarity = 'rare';
                    
                    const gifts = Object.entries(this.giftsConfig)
                        .filter(([_, c]) => c.rarity === rarity);
                    if (gifts.length > 0) {
                        const [giftId, config] = gifts[Math.floor(Math.random() * gifts.length)];
                        this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                    }
                }
                this.showToast('💫 Редкие подарки получены!');
                break;
                
            case 'pack_epic':
                const epicGifts = Object.entries(this.giftsConfig)
                    .filter(([_, c]) => c.rarity === 'epic');
                if (epicGifts.length > 0) {
                    const [giftId, config] = epicGifts[Math.floor(Math.random() * epicGifts.length)];
                    this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                    this.showGiftModal(giftId, config);
                }
                break;
        }
        
        this.renderInventory(this.currentFilter);
    }
    
    showPaymentSuccess(itemName, price) {
        const toast = document.createElement('div');
        toast.className = 'toast legendary';
        toast.style.cssText = `
            background: linear-gradient(135deg, rgba(100, 180, 255, 0.3), rgba(100, 150, 255, 0.2));
            border: 2px solid #64b5f6;
            font-size: 15px;
            padding: 18px;
            text-align: center;
        `;
        toast.innerHTML = `
            <div style="font-size:36px;margin-bottom:6px;">💎</div>
            <div style="font-weight:700;">${itemName}</div>
            <div style="font-size:12px;color:var(--tg-theme-hint);margin-top:4px;">
                Спасибо за поддержку! ⭐ ${price} Stars
            </div>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        this.hapticFeedback('success');
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
    
    // ============================================
    // СОХРАНЕНИЯ
    // ============================================
    
    saveGame() {
        this.gameState.lastSaveTime = Date.now();
        localStorage.setItem('giftFarmState', JSON.stringify(this.gameState));
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.setItem('giftFarmState', JSON.stringify(this.gameState));
        }
    }
    
    loadGame() {
        const saved = localStorage.getItem('giftFarmState');
        if (saved) {
            try {
                this.gameState = { ...this.gameState, ...JSON.parse(saved) };
                this.gameState.lastOnlineTime = Date.now();
            } catch (e) {
                console.error('Ошибка загрузки:', e);
            }
        }
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.getItem('giftFarmState', (err, value) => {
                if (!err && value) {
                    try {
                        const cloud = JSON.parse(value);
                        if (cloud.lastSaveTime > this.gameState.lastSaveTime) {
                            this.gameState = { ...this.gameState, ...cloud };
                            this.gameState.lastOnlineTime = Date.now();
                        }
                    } catch (e) {}
                }
                this.calculateOfflineEarnings();
                this.updateUI();
            });
        } else {
            this.calculateOfflineEarnings();
        }
    }
    
    calculateOfflineEarnings() {
        const offlineSeconds = Math.floor((Date.now() - this.gameState.lastOnlineTime) / 1000);
        if (offlineSeconds > 10 && this.getTotalPPS() > 0) {
            const earned = Math.floor(this.getTotalPPS() * offlineSeconds * 0.3);
            if (earned > 0) {
                this.gameState.parts += earned;
                this.showToast(`⏰ За ${this.formatTime(offlineSeconds)} добыто ${this.formatNumber(earned)} частей`);
            }
        }
        this.gameState.lastOnlineTime = Date.now();
    }
    
    startAutoSave() {
        this.saveInterval = setInterval(() => this.saveGame(), 10000);
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
                    const extra = this.gameState.partsEarnedForGift - this.gameState.partsForNextGift;
                    this.createRandomGift();
                    this.gameState.partsEarnedForGift = extra;
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
            total += upgrade.pps * (this.gameState.upgrades[upgrade.id] || 0);
        });
        total += Math.floor(this.getTotalGiftsCount() * 0.1);
        return total;
    }
    
    getTotalGiftsCount() {
        if (!this.gameState.gifts) return 0;
        return Object.values(this.gameState.gifts).reduce((a, b) => a + b, 0);
    }
    
    // ============================================
    // КЛИКЕР
    // ============================================
    
    handleClick(e) {
        let value = 1;
        if (this.activeBoosters?.doubleClick) value *= 2;
        
        this.gameState.parts += value;
        this.gameState.partsEarnedForGift += value;
        this.gameState.totalClicks++;
        this.gameState.sessionClicks++;
        
        this.createClickEffect(e, value);
        this.createParticles(e);
        
        this.elements.giftEmoji.classList.add('pressed');
        setTimeout(() => this.elements.giftEmoji.classList.remove('pressed'), 150);
        
        this.hapticFeedback('light');
        
        if (this.gameState.partsEarnedForGift >= this.gameState.partsForNextGift) {
            const extra = this.gameState.partsEarnedForGift - this.gameState.partsForNextGift;
            this.createRandomGift();
            this.gameState.partsEarnedForGift = extra;
            this.gameState.partsForNextGift = this.getNextGiftCost();
            this.hapticFeedback('success');
        }
        
        this.updateUI();
    }
    
    getNextGiftCost() {
        return Math.floor(100 + this.getTotalGiftsCount() * 5);
    }
    
    createRandomGift() {
        const roll = Math.random();
        let rarity;
        if (roll < 0.005) rarity = 'mythic';
        else if (roll < 0.02) rarity = 'legendary';
        else if (roll < 0.07) rarity = 'epic';
        else if (roll < 0.20) rarity = 'rare';
        else if (roll < 0.45) rarity = 'uncommon';
        else rarity = 'common';
        
        if (this.activeBoosters?.luckyHour && Math.random() < 0.5) {
            const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
            const idx = order.indexOf(rarity);
            if (idx < order.length - 1) rarity = order[idx + 1];
        }
        
        const possible = Object.entries(this.giftsConfig).filter(([_, c]) => c.rarity === rarity);
        if (possible.length === 0) return;
        
        const [giftId, config] = possible[Math.floor(Math.random() * possible.length)];
        
        if (!this.gameState.gifts) this.gameState.gifts = {};
        this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
        
        this.showGiftModal(giftId, config);
        
        if (['epic', 'legendary', 'mythic'].includes(rarity)) {
            this.showToast(`🎉 ${config.emoji} ${config.name}!`, rarity);
        }
    }
    
    // ============================================
    // ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
    // ============================================
    
    createClickEffect(e, value) {
        const effect = this.elements.clickEffect;
        effect.textContent = `+${value}`;
        effect.className = 'click-effect show';
        
        const rect = this.elements.clickZone.getBoundingClientRect();
        effect.style.left = `${e.clientX - rect.left}px`;
        effect.style.top = `${e.clientY - rect.top}px`;
        
        setTimeout(() => effect.className = 'click-effect', 100);
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
            setTimeout(() => particle.remove(), 800);
        }
    }
    
    // ============================================
    // МОДАЛЬНОЕ ОКНО
    // ============================================
    
    showGiftModal(giftId, config) {
        this.elements.giftDisplay.textContent = config.emoji;
        this.elements.giftName.textContent = config.name;
        
        const tag = this.elements.giftRarityTag;
        tag.textContent = this.getRarityName(config.rarity);
        tag.className = `gift-rarity-tag ${config.rarity}`;
        
        this.elements.giftDesc.textContent = 
            `Редкость: ${this.getRarityName(config.rarity)}\nКоличество: ${this.gameState.gifts[giftId]} шт.`;
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
        this.elements.upgradesList.innerHTML = '';
        
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
                    ${level > 0 ? `<div class="upgrade-count">Уровень: ${level} (+${upgrade.pps * level}/сек)</div>` : ''}
                </div>
                <button class="upgrade-buy ${level >= maxLevel ? 'max-level' : ''}" 
                        data-id="${upgrade.id}"
                        ${level >= maxLevel ? 'disabled' : ''}>
                    ${level >= maxLevel ? 'MAX' : `⚡ ${this.formatNumber(cost)}`}
                </button>
            `;
            
            this.elements.upgradesList.appendChild(card);
            card.querySelector('.upgrade-buy').addEventListener('click', () => this.buyUpgrade(upgrade.id));
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
        if (level >= 100) return;
        
        const cost = this.getUpgradeCost(upgrade);
        if (this.gameState.parts >= cost) {
            this.gameState.parts -= cost;
            this.gameState.upgrades[upgradeId] = level + 1;
            this.updateUI();
            this.renderUpgrades();
            this.saveGame();
            this.hapticFeedback('success');
            this.showToast(`✅ ${upgrade.name}: уровень ${level + 1}`);
        } else {
            this.hapticFeedback('error');
            this.showToast('❌ Недостаточно частей');
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
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">📦 Пока нет подарков</div>`;
            this.elements.inventoryBadge.style.display = 'none';
            return;
        }
        
        let has = false;
        Object.entries(this.gameState.gifts).forEach(([id, count]) => {
            const config = this.giftsConfig[id];
            if (!config || count <= 0) return;
            if (filter !== 'all' && config.rarity !== filter) return;
            
            has = true;
            const card = document.createElement('div');
            card.className = 'gift-card' + (this.mergeSlots.includes(id) ? ' selected' : '');
            card.setAttribute('data-rarity', config.rarity);
            card.innerHTML = `
                <span class="gift-count">${count}</span>
                <div class="gift-emoji-display">${config.emoji}</div>
                <div class="gift-name-display">${config.name}</div>
                <div class="gift-rarity-display">${this.getRarityName(config.rarity)}</div>
            `;
            card.addEventListener('click', () => this.selectForMerge(id, config));
            container.appendChild(card);
        });
        
        if (!has && filter !== 'all') {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">Нет подарков этой редкости</div>`;
        }
        
        const total = this.getTotalGiftsCount();
        this.elements.inventoryBadge.style.display = total > 0 ? 'flex' : 'none';
        this.elements.inventoryBadge.textContent = total > 99 ? '99+' : total;
    }
    
    selectForMerge(giftId, config) {
        const idx = this.mergeSlots.indexOf(giftId);
        if (idx !== -1) {
            this.mergeSlots[idx] = null;
        } else {
            if (this.mergeSlots.some(s => s !== null && s !== giftId)) {
                this.showToast('❌ Выберите одинаковые подарки');
                return;
            }
            const empty = this.mergeSlots.indexOf(null);
            if (empty === -1) {
                this.showToast('Максимум 3 подарка');
                return;
            }
            if (this.mergeSlots.filter(s => s === giftId).length >= (this.gameState.gifts[giftId] || 0)) {
                this.showToast('Недостаточно подарков');
                return;
            }
            this.mergeSlots[empty] = giftId;
        }
        
        this.updateMergeSlots();
        this.renderInventory(this.currentFilter);
        
        const filled = this.mergeSlots.filter(s => s !== null).length;
        this.elements.mergeBtn.disabled = filled !== 3;
        this.elements.mergeBtn.textContent = filled === 3 ? '🔨 Объединить' : `🔨 Выберите ещё ${3 - filled}`;
    }
    
    updateMergeSlots() {
        this.elements.mergeSlots.forEach((slot, i) => {
            const giftId = this.mergeSlots[i];
            if (giftId && this.giftsConfig[giftId]) {
                slot.textContent = this.giftsConfig[giftId].emoji;
                slot.className = 'merge-slot filled';
                slot.onclick = () => {
                    this.mergeSlots[i] = null;
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
        const filled = this.mergeSlots.filter(s => s !== null);
        if (filled.length !== 3) return;
        
        const giftId = filled[0];
        if ((this.gameState.gifts[giftId] || 0) < 3) return;
        
        const config = this.giftsConfig[giftId];
        const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const idx = order.indexOf(config.rarity);
        if (idx >= order.length - 1) {
            this.showToast('❌ Мифические нельзя объединить');
            return;
        }
        
        this.gameState.gifts[giftId] -= 3;
        if (this.gameState.gifts[giftId] <= 0) delete this.gameState.gifts[giftId];
        
        const next = Object.entries(this.giftsConfig).filter(([_, c]) => c.rarity === order[idx + 1]);
        const [newId, newConfig] = next[Math.floor(Math.random() * next.length)];
        this.gameState.gifts[newId] = (this.gameState.gifts[newId] || 0) + 1;
        
        this.mergeSlots = [null, null, null];
        this.updateMergeSlots();
        this.elements.mergeBtn.disabled = true;
        this.elements.mergeBtn.textContent = '🔨 Выберите 3 одинаковых подарка';
        
        this.hapticFeedback('success');
        this.showToast(`🔨 ${newConfig.emoji} ${newConfig.name}!`, order[idx + 1]);
        
        this.renderInventory(this.currentFilter);
        this.updateUI();
        this.saveGame();
    }
    
    // ============================================
    // МАГАЗИН (обновлённый)
    // ============================================
    
    renderShop() {
        const container = this.elements.shopItems;
        container.innerHTML = '';
        
        // Заголовок магазина
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;padding:12px;margin-bottom:8px;';
        header.innerHTML = `
            <div style="font-size:28px;margin-bottom:4px;">💎</div>
            <div style="font-size:14px;color:var(--tg-theme-hint);">
                Все покупки оплачиваются<br><strong style="color:#64b5f6;">Звёздами Telegram</strong>
            </div>
        `;
        container.appendChild(header);
        
        this.shopItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.style.cssText = `
                background: rgba(100, 180, 255, 0.05);
                border: 1px solid rgba(100, 180, 255, 0.2);
            `;
            card.innerHTML = `
                <div class="shop-icon">${item.name.split(' ')[0]}</div>
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc}</div>
                </div>
                <button class="shop-price" style="
                    background: linear-gradient(135deg, #64b5f6, #42a5f5);
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                ">
                    ⭐ ${item.price}
                </button>
            `;
            
            container.appendChild(card);
            card.querySelector('.shop-price').addEventListener('click', () => {
                this.buyShopItem(item);
            });
        });
        
        // Информация о Stars
        const info = document.createElement('div');
        info.style.cssText = 'text-align:center;padding:16px;font-size:11px;color:var(--tg-theme-hint);';
        info.innerHTML = '🔒 Безопасная оплата через Telegram<br>Звёзды списываются с вашего счета';
        container.appendChild(info);
    }
    
    // ============================================
    // НАВИГАЦИЯ И СОБЫТИЯ
    // ============================================
    
    switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`${screenName}-screen`);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-screen') === screenName);
        });
        
        if (screenName === 'inventory') this.renderInventory();
        if (screenName === 'upgrades') this.renderUpgrades();
        if (screenName === 'shop') this.renderShop();
    }
    
    bindEvents() {
        this.elements.clickZone.addEventListener('click', (e) => this.handleClick(e));
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
        
        this.elements.closeModal.addEventListener('click', () => this.closeGiftModal());
        this.elements.giftModal.addEventListener('click', (e) => {
            if (e.target === this.elements.giftModal) this.closeGiftModal();
        });
        
        this.elements.mergeBtn.addEventListener('click', () => this.mergeGifts());
        
        this.elements.rarityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.rarityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderInventory(btn.getAttribute('data-rarity'));
            });
        });
        
        window.addEventListener('beforeunload', () => this.saveGame());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveGame();
            } else {
                this.calculateOfflineEarnings();
                this.updateUI();
            }
        });
        
        this.tg.onEvent('themeChanged', () => this.applyTheme());
    }
    
    applyTheme() {
        const p = this.tg.themeParams;
        if (p.bg_color) document.documentElement.style.setProperty('--tg-theme-bg', p.bg_color);
        if (p.text_color) document.documentElement.style.setProperty('--tg-theme-text', p.text_color);
        if (p.button_color) document.documentElement.style.setProperty('--tg-theme-button', p.button_color);
        if (p.secondary_bg_color) document.documentElement.style.setProperty('--tg-theme-secondary-bg', p.secondary_bg_color);
    }
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    updateUI() {
        this.elements.partsCount.textContent = this.formatNumber(this.gameState.parts);
        this.elements.ppsCount.textContent = this.formatNumber(this.getTotalPPS());
        
        const progress = Math.min((this.gameState.partsEarnedForGift / this.gameState.partsForNextGift) * 100, 100);
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = 
            `${this.formatNumber(this.gameState.partsEarnedForGift)} / ${this.formatNumber(this.gameState.partsForNextGift)}`;
        
        this.elements.clickCounter.textContent = `Сессия: ${this.gameState.sessionClicks} кликов`;
    }
    
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
        return `${Math.floor(seconds / 3600)} ч`;
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
// ЗАПУСК
// ============================================

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new GiftFarm();
    window.game = game;
});
