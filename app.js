// ============================================
// 🎁 GIFT FARM - Полностью рабочий кликер
// ============================================

class GiftFarm {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.BOT_USERNAME = 'gift_farm_bot'; // ЗАМЕНИТЕ НА СВОЙ
        
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
        
        this.upgradesConfig = [
            { id: 'hamster', name: '🐹 Хомяк-сборщик', baseCost: 10, costMultiplier: 1.15, pps: 1, desc: '+1 часть/сек' },
            { id: 'robot', name: '🤖 Робот-упаковщик', baseCost: 50, costMultiplier: 1.2, pps: 5, desc: '+5 частей/сек' },
            { id: 'factory', name: '🏭 Мини-фабрика', baseCost: 250, costMultiplier: 1.25, pps: 25, desc: '+25 частей/сек' },
            { id: 'station', name: '🚀 Орбитальная станция', baseCost: 1500, costMultiplier: 1.3, pps: 150, desc: '+150 частей/сек' },
            { id: 'quantum', name: '🌌 Квантовый генератор', baseCost: 10000, costMultiplier: 1.35, pps: 800, desc: '+800 частей/сек' },
            { id: 'wormhole', name: '🕳️ Червоточина', baseCost: 50000, costMultiplier: 1.4, pps: 5000, desc: '+5000 частей/сек' },
            { id: 'timemachine', name: '⏰ Машина времени', baseCost: 250000, costMultiplier: 1.5, pps: 30000, desc: '+30000 частей/сек' }
        ];
        
        this.giftsConfig = {
            gift_heart:  { name: 'Сердечко', emoji: '❤️', rarity: 'common', parts: 100 },
            gift_star:   { name: 'Звезда', emoji: '⭐', rarity: 'common', parts: 100 },
            gift_flower: { name: 'Цветок', emoji: '🌸', rarity: 'common', parts: 100 },
            gift_cookie: { name: 'Печенька', emoji: '🍪', rarity: 'common', parts: 100 },
            gift_ring:   { name: 'Кольцо', emoji: '💍', rarity: 'uncommon', parts: 500 },
            gift_crown:  { name: 'Корона', emoji: '👑', rarity: 'uncommon', parts: 500 },
            gift_gem:    { name: 'Драгоценность', emoji: '💎', rarity: 'uncommon', parts: 500 },
            gift_rocket: { name: 'Ракета', emoji: '🚀', rarity: 'uncommon', parts: 500 },
            gift_rainbow: { name: 'Радуга', emoji: '🌈', rarity: 'rare', parts: 2500 },
            gift_phoenix: { name: 'Феникс', emoji: '🦅', rarity: 'rare', parts: 2500 },
            gift_unicorn: { name: 'Единорог', emoji: '🦄', rarity: 'rare', parts: 2500 },
            gift_dragon:  { name: 'Дракон', emoji: '🐉', rarity: 'epic', parts: 10000 },
            gift_galaxy:  { name: 'Галактика', emoji: '🌌', rarity: 'epic', parts: 10000 },
            gift_blackhole: { name: 'Чёрная дыра', emoji: '🕳️', rarity: 'legendary', parts: 50000 },
            gift_infinity:  { name: 'Бесконечность', emoji: '♾️', rarity: 'legendary', parts: 50000 },
            gift_universe:  { name: 'Вселенная', emoji: '🌠', rarity: 'mythic', parts: 250000 },
            gift_god:       { name: 'Божественный дар', emoji: '👁️', rarity: 'mythic', parts: 250000 }
        };
        
        this.shopItems = [
            { id: 'booster_double', name: '🔨 Двойной клик', desc: 'x2 частей за клик на 10 минут', price: 5, type: 'booster' },
            { id: 'booster_auto', name: '⚡ Автокликер', desc: 'Авто-клик на 5 минут', price: 15, type: 'booster' },
            { id: 'booster_lucky', name: '🍀 Час удачи', desc: '+50% к редким подаркам на 1 час', price: 30, type: 'booster' },
            { id: 'pack_basic', name: '🎁 Набор подарков', desc: '5 случайных подарков', price: 10, type: 'instant' },
            { id: 'pack_rare', name: '💫 Редкий набор', desc: '3 подарка Rare или выше', price: 50, type: 'instant' },
            { id: 'pack_epic', name: '✨ Эпический набор', desc: '1 Epic подарок', price: 150, type: 'instant' }
        ];
        
        this.mergeSlots = [null, null, null];
        this.currentFilter = 'all';
        this.activeBoosters = {};
        this.elements = {};
        this.idleInterval = null;
        this.saveInterval = null;
        
        this.init();
    }
    
    init() {
        // Инициализируем Telegram
        this.tg.ready();
        this.tg.expand();
        
        // Проверяем, что DOM загружен
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('🎁 Начинаем инициализацию Gift Farm...');
        
        // Кэшируем DOM
        this.cacheElements();
        
        // Проверяем, что элементы найдены
        if (!this.elements.clickZone) {
            console.error('❌ click-zone не найден!');
            return;
        }
        
        // Загружаем данные
        this.loadGame();
        
        // Запускаем idle
        this.startIdleMechanics();
        
        // Автосохранение
        this.startAutoSave();
        
        // Привязываем события
        this.bindEvents();
        
        // Платежи
        this.setupPaymentHandler();
        
        // Обновляем UI
        this.updateUI();
        this.renderUpgrades();
        this.renderShop();
        this.renderInventory();
        
        console.log('✅ Gift Farm готов!', {
            parts: this.gameState.parts,
            pps: this.getTotalPPS(),
            gifts: this.getTotalGiftsCount()
        });
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
        
        console.log('📦 DOM элементы закэшированы');
    }
    
    // ============================================
    // КЛИКЕР - ГЛАВНАЯ ЛОГИКА
    // ============================================
    
    handleClick(event) {
        // Предотвращаем двойное срабатывание
        event.preventDefault();
        
        let clickValue = 1;
        
        // Проверяем бустеры
        if (this.activeBoosters && this.activeBoosters.doubleClick) {
            clickValue *= 2;
        }
        
        // Начисляем части
        this.gameState.parts += clickValue;
        this.gameState.partsEarnedForGift += clickValue;
        this.gameState.totalClicks++;
        this.gameState.sessionClicks++;
        
        // Визуальные эффекты
        this.showClickEffect(event, clickValue);
        this.spawnParticles(event);
        
        // Анимация подарка
        if (this.elements.giftEmoji) {
            this.elements.giftEmoji.classList.add('pressed');
            setTimeout(() => {
                if (this.elements.giftEmoji) {
                    this.elements.giftEmoji.classList.remove('pressed');
                }
            }, 150);
        }
        
        // Тактильный отклик
        this.hapticFeedback('light');
        
        // Проверяем создание подарка
        if (this.gameState.partsEarnedForGift >= this.gameState.partsForNextGift) {
            const extra = this.gameState.partsEarnedForGift - this.gameState.partsForNextGift;
            this.createRandomGift();
            this.gameState.partsEarnedForGift = extra;
            this.gameState.partsForNextGift = this.getNextGiftCost();
            this.hapticFeedback('success');
        }
        
        // Обновляем UI
        this.updateUI();
    }
    
    showClickEffect(event, value) {
        if (!this.elements.clickEffect || !this.elements.clickZone) return;
        
        const effect = this.elements.clickEffect;
        const rect = this.elements.clickZone.getBoundingClientRect();
        
        // Используем координаты из события
        let x, y;
        if (event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX - rect.left;
            y = event.changedTouches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        
        effect.textContent = `+${value}`;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        effect.className = 'click-effect show';
        
        setTimeout(() => {
            if (effect) {
                effect.className = 'click-effect';
            }
        }, 1000);
    }
    
    spawnParticles(event) {
        if (!this.elements.particlesContainer || !this.elements.clickZone) return;
        
        const container = this.elements.particlesContainer;
        const rect = this.elements.clickZone.getBoundingClientRect();
        
        let x, y;
        if (event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX - rect.left;
            y = event.changedTouches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        
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
                if (particle && particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
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
        
        // Бонус удачи
        if (this.activeBoosters && this.activeBoosters.luckyHour) {
            if (Math.random() < 0.5) {
                const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                const idx = order.indexOf(rarity);
                if (idx < order.length - 1) rarity = order[idx + 1];
            }
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
    
    getNextGiftCost() {
        return Math.floor(100 + this.getTotalGiftsCount() * 5);
    }
    
    getTotalPPS() {
        if (!this.gameState.upgrades) return 0;
        let total = 0;
        this.upgradesConfig.forEach(u => {
            total += u.pps * (this.gameState.upgrades[u.id] || 0);
        });
        total += Math.floor(this.getTotalGiftsCount() * 0.1);
        return total;
    }
    
    getTotalGiftsCount() {
        if (!this.gameState.gifts) return 0;
        return Object.values(this.gameState.gifts).reduce((a, b) => a + b, 0);
    }
    
    // ============================================
    // IDLE МЕХАНИКА
    // ============================================
    
    startIdleMechanics() {
        if (this.idleInterval) clearInterval(this.idleInterval);
        
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
    
    // ============================================
    // СОХРАНЕНИЯ
    // ============================================
    
    saveGame() {
        this.gameState.lastSaveTime = Date.now();
        const data = JSON.stringify(this.gameState);
        localStorage.setItem('giftFarmState', data);
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.setItem('giftFarmState', data, (err) => {
                if (err) console.warn('CloudStorage save error:', err);
            });
        }
    }
    
    loadGame() {
        const saved = localStorage.getItem('giftFarmState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...parsed };
                console.log('💾 Игра загружена');
            } catch (e) {
                console.error('Ошибка загрузки:', e);
            }
        }
        
        this.gameState.lastOnlineTime = Date.now();
        
        // Оффлайн заработок
        const offlineSeconds = Math.floor((Date.now() - (this.gameState.lastOnlineTime || Date.now())) / 1000);
        if (offlineSeconds > 10 && this.getTotalPPS() > 0) {
            const earned = Math.floor(this.getTotalPPS() * offlineSeconds * 0.3);
            if (earned > 0) {
                this.gameState.parts += earned;
                this.showToast(`⏰ За ${this.formatTime(offlineSeconds)} добыто ${this.formatNumber(earned)} частей`);
            }
        }
    }
    
    startAutoSave() {
        if (this.saveInterval) clearInterval(this.saveInterval);
        this.saveInterval = setInterval(() => this.saveGame(), 10000);
    }
    
    // ============================================
    // ПЛАТЕЖИ TELEGRAM STARS
    // ============================================
    
    setupPaymentHandler() {
        this.tg.onEvent('invoiceClosed', (data) => {
            console.log('💰 Результат оплаты:', data.status);
            
            if (data.status === 'paid') {
                const pending = this.gameState.pendingTransaction;
                if (pending && Date.now() - pending.timestamp < 1800000) {
                    this.grantItem(pending.itemId, pending.itemType, pending.itemName);
                    this.gameState.pendingTransaction = null;
                }
            } else {
                this.gameState.pendingTransaction = null;
            }
        });
    }
    
    buyShopItem(item) {
        const txnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.gameState.pendingTransaction = {
            transactionId: txnId,
            itemId: item.id,
            itemType: item.type,
            itemName: item.name,
            price: item.price,
            timestamp: Date.now()
        };
        
        console.log(`💎 Запрос ${item.price} Stars за: ${item.name}`);
        
        this.tg.openInvoice({
            title: item.name,
            description: item.desc,
            currency: 'XTR',
            prices: [{ label: item.name, amount: item.price * 100 }],
            payload: JSON.stringify({ txn_id: txnId, item_id: item.id }),
            provider_token: '',
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            is_flexible: false
        });
    }
    
    grantItem(itemId, itemType, itemName) {
        console.log(`✅ Выдаём: ${itemName}`);
        
        switch (itemType) {
            case 'booster':
                this.activateBooster(itemId);
                break;
            case 'instant':
                this.openPack(itemId);
                break;
        }
        
        this.showToast(`✅ Получено: ${itemName}!`);
        this.saveGame();
    }
    
    activateBooster(id) {
        if (!this.activeBoosters) this.activeBoosters = {};
        
        switch (id) {
            case 'booster_double':
                this.activeBoosters.doubleClick = true;
                setTimeout(() => {
                    this.activeBoosters.doubleClick = false;
                    this.showToast('⏰ Двойной клик закончился');
                }, 600000);
                break;
            case 'booster_auto':
                this.activeBoosters.autoClicker = true;
                const interval = setInterval(() => {
                    if (!this.activeBoosters.autoClicker) {
                        clearInterval(interval);
                        return;
                    }
                    const fakeEvent = { clientX: 150, clientY: 200 };
                    this.handleClick(fakeEvent);
                }, 100);
                setTimeout(() => {
                    this.activeBoosters.autoClicker = false;
                    this.showToast('⏰ Автокликер закончился');
                }, 300000);
                break;
            case 'booster_lucky':
                this.activeBoosters.luckyHour = true;
                setTimeout(() => {
                    this.activeBoosters.luckyHour = false;
                    this.showToast('⏰ Час удачи закончился');
                }, 3600000);
                break;
        }
    }
    
    openPack(id) {
        switch (id) {
            case 'pack_basic':
                for (let i = 0; i < 5; i++) this.createRandomGift();
                break;
            case 'pack_rare':
                for (let i = 0; i < 3; i++) {
                    const roll = Math.random();
                    let rarity;
                    if (roll < 0.1) rarity = 'mythic';
                    else if (roll < 0.3) rarity = 'legendary';
                    else if (roll < 0.6) rarity = 'epic';
                    else rarity = 'rare';
                    
                    const gifts = Object.entries(this.giftsConfig).filter(([_, c]) => c.rarity === rarity);
                    if (gifts.length > 0) {
                        const [giftId] = gifts[Math.floor(Math.random() * gifts.length)];
                        this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                    }
                }
                break;
            case 'pack_epic':
                const epics = Object.entries(this.giftsConfig).filter(([_, c]) => c.rarity === 'epic');
                if (epics.length > 0) {
                    const [giftId, config] = epics[Math.floor(Math.random() * epics.length)];
                    this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
                    this.showGiftModal(giftId, config);
                }
                break;
        }
        this.renderInventory(this.currentFilter);
    }
    
    // ============================================
    // UI
    // ============================================
    
    updateUI() {
        if (this.elements.partsCount) {
            this.elements.partsCount.textContent = this.formatNumber(this.gameState.parts);
        }
        if (this.elements.ppsCount) {
            this.elements.ppsCount.textContent = this.formatNumber(this.getTotalPPS());
        }
        if (this.elements.progressFill && this.elements.progressText) {
            const progress = Math.min((this.gameState.partsEarnedForGift / this.gameState.partsForNextGift) * 100, 100);
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.progressText.textContent = 
                `${this.formatNumber(this.gameState.partsEarnedForGift)} / ${this.formatNumber(this.gameState.partsForNextGift)}`;
        }
        if (this.elements.clickCounter) {
            this.elements.clickCounter.textContent = `Сессия: ${this.gameState.sessionClicks} кликов`;
        }
    }
    
    showGiftModal(giftId, config) {
        if (!this.elements.giftModal) return;
        
        this.elements.giftDisplay.textContent = config.emoji;
        this.elements.giftName.textContent = config.name;
        
        const tag = this.elements.giftRarityTag;
        tag.textContent = this.getRarityName(config.rarity);
        tag.className = `gift-rarity-tag ${config.rarity}`;
        
        this.elements.giftDesc.textContent = 
            `Редкость: ${this.getRarityName(config.rarity)}\nВ коллекции: ${this.gameState.gifts[giftId]} шт.`;
        
        this.elements.giftModal.classList.add('active');
    }
    
    closeGiftModal() {
        if (this.elements.giftModal) {
            this.elements.giftModal.classList.remove('active');
        }
    }
    
    // ============================================
    // АПГРЕЙДЫ
    // ============================================
    
    renderUpgrades() {
        if (!this.elements.upgradesList) return;
        this.elements.upgradesList.innerHTML = '';
        
        this.upgradesConfig.forEach(upgrade => {
            const level = this.gameState.upgrades[upgrade.id] || 0;
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
            const maxLevel = 100;
            
            const card = document.createElement('div');
            card.className = `upgrade-card ${level > 0 ? 'owned' : ''}`;
            card.innerHTML = `
                <div class="upgrade-icon">${upgrade.name.split(' ')[0]}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-effect">${upgrade.desc}</div>
                    ${level > 0 ? `<div class="upgrade-count">Ур. ${level} (+${upgrade.pps * level}/сек)</div>` : ''}
                </div>
                <button class="upgrade-buy ${level >= maxLevel ? 'max-level' : ''}" 
                        ${level >= maxLevel ? 'disabled' : ''}>
                    ${level >= maxLevel ? 'MAX' : `⚡ ${this.formatNumber(cost)}`}
                </button>
            `;
            
            this.elements.upgradesList.appendChild(card);
            
            const btn = card.querySelector('.upgrade-buy');
            if (btn && !btn.disabled) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.buyUpgrade(upgrade.id);
                });
            }
        });
    }
    
    buyUpgrade(id) {
        const upgrade = this.upgradesConfig.find(u => u.id === id);
        if (!upgrade) return;
        
        const level = this.gameState.upgrades[id] || 0;
        if (level >= 100) return;
        
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
        if (this.gameState.parts >= cost) {
            this.gameState.parts -= cost;
            this.gameState.upgrades[id] = level + 1;
            this.updateUI();
            this.renderUpgrades();
            this.saveGame();
            this.hapticFeedback('success');
            this.showToast(`✅ ${upgrade.name} ур. ${level + 1}`);
        } else {
            this.hapticFeedback('error');
            this.showToast('❌ Недостаточно частей');
        }
    }
    
    // ============================================
    // ИНВЕНТАРЬ
    // ============================================
    
    renderInventory(filter = 'all') {
        if (!this.elements.giftsGrid) return;
        
        this.currentFilter = filter;
        const container = this.elements.giftsGrid;
        container.innerHTML = '';
        
        if (!this.gameState.gifts || Object.keys(this.gameState.gifts).length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">📦 Нет подарков. Кликайте на ферме!</div>';
            if (this.elements.inventoryBadge) this.elements.inventoryBadge.style.display = 'none';
            return;
        }
        
        let has = false;
        Object.entries(this.gameState.gifts).forEach(([id, count]) => {
            const c = this.giftsConfig[id];
            if (!c || count <= 0) return;
            if (filter !== 'all' && c.rarity !== filter) return;
            
            has = true;
            const card = document.createElement('div');
            card.className = 'gift-card' + (this.mergeSlots.includes(id) ? ' selected' : '');
            card.setAttribute('data-rarity', c.rarity);
            card.innerHTML = `
                <span class="gift-count">${count}</span>
                <div class="gift-emoji-display">${c.emoji}</div>
                <div class="gift-name-display">${c.name}</div>
                <div class="gift-rarity-display">${this.getRarityName(c.rarity)}</div>
            `;
            card.addEventListener('click', () => this.selectForMerge(id, c));
            container.appendChild(card);
        });
        
        if (!has && filter !== 'all') {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">Нет подарков этой редкости</div>';
        }
        
        const total = this.getTotalGiftsCount();
        if (this.elements.inventoryBadge) {
            this.elements.inventoryBadge.style.display = total > 0 ? 'flex' : 'none';
            this.elements.inventoryBadge.textContent = total > 99 ? '99+' : total;
        }
    }
    
    selectForMerge(giftId) {
        const idx = this.mergeSlots.indexOf(giftId);
        if (idx !== -1) {
            this.mergeSlots[idx] = null;
        } else {
            if (this.mergeSlots.some(s => s && s !== giftId)) {
                this.showToast('❌ Одинаковые подарки!');
                return;
            }
            const empty = this.mergeSlots.indexOf(null);
            if (empty === -1) {
                this.showToast('Макс. 3 подарка');
                return;
            }
            if (this.mergeSlots.filter(s => s === giftId).length >= (this.gameState.gifts[giftId] || 0)) {
                this.showToast('Недостаточно');
                return;
            }
            this.mergeSlots[empty] = giftId;
        }
        
        this.updateMergeSlotsUI();
        this.renderInventory(this.currentFilter);
        
        const filled = this.mergeSlots.filter(s => s).length;
        if (this.elements.mergeBtn) {
            this.elements.mergeBtn.disabled = filled !== 3;
            this.elements.mergeBtn.textContent = filled === 3 ? '🔨 Объединить!' : `🔨 ${3 - filled} ещё`;
        }
    }
    
    updateMergeSlotsUI() {
        this.elements.mergeSlots?.forEach((slot, i) => {
            const id = this.mergeSlots[i];
            if (id && this.giftsConfig[id]) {
                slot.textContent = this.giftsConfig[id].emoji;
                slot.className = 'merge-slot filled';
            } else {
                slot.textContent = '';
                slot.className = 'merge-slot empty';
            }
        });
    }
    
    mergeGifts() {
        const filled = this.mergeSlots.filter(s => s);
        if (filled.length !== 3) return;
        
        const giftId = filled[0];
        if ((this.gameState.gifts[giftId] || 0) < 3) return;
        
        const config = this.giftsConfig[giftId];
        const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const idx = order.indexOf(config.rarity);
        if (idx >= order.length - 1) {
            this.showToast('❌ Мифические не мержатся');
            return;
        }
        
        this.gameState.gifts[giftId] -= 3;
        if (this.gameState.gifts[giftId] <= 0) delete this.gameState.gifts[giftId];
        
        const next = Object.entries(this.giftsConfig).filter(([_, c]) => c.rarity === order[idx + 1]);
        if (next.length > 0) {
            const [newId, newConfig] = next[Math.floor(Math.random() * next.length)];
            this.gameState.gifts[newId] = (this.gameState.gifts[newId] || 0) + 1;
            this.showToast(`🔨 ${newConfig.emoji} ${newConfig.name}!`, order[idx + 1]);
        }
        
        this.mergeSlots = [null, null, null];
        this.updateMergeSlotsUI();
        this.renderInventory(this.currentFilter);
        this.updateUI();
        this.saveGame();
        this.hapticFeedback('success');
        
        if (this.elements.mergeBtn) {
            this.elements.mergeBtn.disabled = true;
            this.elements.mergeBtn.textContent = '🔨 Выберите 3';
        }
    }
    
    // ============================================
    // МАГАЗИН
    // ============================================
    
    renderShop() {
        if (!this.elements.shopItems) return;
        this.elements.shopItems.innerHTML = '';
        
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;padding:12px;margin-bottom:8px;';
        header.innerHTML = '<div style="font-size:28px;">💎</div><div style="font-size:12px;color:var(--tg-theme-hint);">Оплата Звёздами Telegram</div>';
        this.elements.shopItems.appendChild(header);
        
        this.shopItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.innerHTML = `
                <div class="shop-icon">${item.name.split(' ')[0]}</div>
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc}</div>
                </div>
                <button class="shop-price">⭐ ${item.price}</button>
            `;
            this.elements.shopItems.appendChild(card);
            
            card.querySelector('.shop-price').addEventListener('click', (e) => {
                e.stopPropagation();
                this.buyShopItem(item);
            });
        });
    }
    
    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    
    switchScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`${name}-screen`);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-screen') === name);
        });
        
        if (name === 'inventory') this.renderInventory();
        if (name === 'upgrades') this.renderUpgrades();
        if (name === 'shop') this.renderShop();
    }
    
    // ============================================
    // СОБЫТИЯ
    // ============================================
    
    bindEvents() {
        console.log('🔗 Привязываем события...');
        
        // Клик по gift-container
        if (this.elements.clickZone) {
            // Удаляем старые обработчики (на всякий случай)
            const newZone = this.elements.clickZone.cloneNode(true);
            this.elements.clickZone.parentNode.replaceChild(newZone, this.elements.clickZone);
            this.elements.clickZone = newZone;
            
            // Добавляем обработчики
            this.elements.clickZone.addEventListener('click', (e) => {
                this.handleClick(e);
            });
            
            this.elements.clickZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleClick(e);
            }, { passive: false });
            
            console.log('✅ Кликер привязан');
        } else {
            console.error('❌ click-zone не найден!');
        }
        
        // Навигация
        this.elements.navBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchScreen(btn.getAttribute('data-screen'));
            });
        });
        
        this.elements.backBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.switchScreen('main'));
        });
        
        // Модальное окно
        this.elements.closeModal?.addEventListener('click', () => this.closeGiftModal());
        this.elements.giftModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.giftModal) this.closeGiftModal();
        });
        
        // Мерж
        this.elements.mergeBtn?.addEventListener('click', () => this.mergeGifts());
        
        // Фильтры
        this.elements.rarityBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.rarityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderInventory(btn.getAttribute('data-rarity'));
            });
        });
        
        // Сохранение
        window.addEventListener('beforeunload', () => this.saveGame());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.saveGame();
        });
        
        console.log('✅ Все события привязаны');
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
    
    showToast(msg, type = '') {
        if (!this.elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
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
    
    formatTime(sec) {
        if (sec < 60) return `${sec}с`;
        if (sec < 3600) return `${Math.floor(sec / 60)}м`;
        return `${Math.floor(sec / 3600)}ч`;
    }
    
    getRarityName(r) {
        return { common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный', mythic: 'Мифический' }[r] || r;
    }
}

// ============================================
// ЗАПУСК
// ============================================

let game;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Запуск Gift Farm...');
    game = new GiftFarm();
    window.game = game;
});
