// ============================================
// 🎁 GIFT FARM - Telegram Mini App Clicker
// ============================================

class GiftFarm {
    constructor() {
        // Telegram WebApp
        this.tg = window.Telegram.WebApp;
        
        // Состояние игры
        this.gameState = {
            parts: 0,                    // Частицы для создания подарков
            stars: 0,                    // Telegram Stars
            gifts: {},                   // Коллекция подарков {giftType: count}
            upgrades: {},                // Купленные улучшения {upgradeId: level}
            totalClicks: 0,
            sessionClicks: 0,
            partsForNextGift: 100,
            partsEarnedForGift: 0,
            lastSaveTime: Date.now(),
            lastOnlineTime: Date.now()
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
            // Обычные
            gift_heart:       { name: 'Сердечко', emoji: '❤️', rarity: 'common', parts: 100 },
            gift_star:        { name: 'Звезда', emoji: '⭐', rarity: 'common', parts: 100 },
            gift_flower:      { name: 'Цветок', emoji: '🌸', rarity: 'common', parts: 100 },
            gift_cookie:      { name: 'Печенька', emoji: '🍪', rarity: 'common', parts: 100 },
            // Необычные
            gift_ring:        { name: 'Кольцо', emoji: '💍', rarity: 'uncommon', parts: 500 },
            gift_crown:       { name: 'Корона', emoji: '👑', rarity: 'uncommon', parts: 500 },
            gift_gem:         { name: 'Драгоценность', emoji: '💎', rarity: 'uncommon', parts: 500 },
            gift_rocket:      { name: 'Ракета', emoji: '🚀', rarity: 'uncommon', parts: 500 },
            // Редкие
            gift_rainbow:     { name: 'Радуга', emoji: '🌈', rarity: 'rare', parts: 2500 },
            gift_phoenix:     { name: 'Феникс', emoji: '🦅', rarity: 'rare', parts: 2500 },
            gift_unicorn:     { name: 'Единорог', emoji: '🦄', rarity: 'rare', parts: 2500 },
            // Эпические
            gift_dragon:      { name: 'Дракон', emoji: '🐉', rarity: 'epic', parts: 10000 },
            gift_galaxy:      { name: 'Галактика', emoji: '🌌', rarity: 'epic', parts: 10000 },
            // Легендарные
            gift_blackhole:   { name: 'Чёрная дыра', emoji: '🕳️', rarity: 'legendary', parts: 50000 },
            gift_infinity:    { name: 'Бесконечность', emoji: '♾️', rarity: 'legendary', parts: 50000 },
            // Мифические
            gift_universe:    { name: 'Вселенная', emoji: '🌠', rarity: 'mythic', parts: 250000 },
            gift_god:         { name: 'Божественный дар', emoji: '👁️', rarity: 'mythic', parts: 250000 }
        };
        
        // Конфиг магазина
        this.shopItems = [
            { id: 'double_click', name: '🔨 Двойной клик', desc: 'x2 частей за клик на 10 минут', price: 5, type: 'booster' },
            { id: 'auto_clicker', name: '⚡ Автокликер', desc: 'Авто-клик 10 раз/сек на 5 минут', price: 15, type: 'booster' },
            { id: 'lucky_hour', name: '🍀 Час удачи', desc: 'Шанс редкого подарка +50% на 1 час', price: 30, type: 'booster' },
            { id: 'gift_pack', name: '🎁 Набор подарков', desc: '5 случайных подарков', price: 10, type: 'instant' },
            { id: 'rare_pack', name: '💫 Редкий набор', desc: '3 подарка Rare или выше', price: 50, type: 'instant' },
            { id: 'epic_pack', name: '✨ Эпический набор', desc: '1 гарантированный Epic подарок', price: 150, type: 'instant' }
        ];
        
        // Выбранные для мержа подарки
        this.mergeSlots = [null, null, null];
        this.currentFilter = 'all';
        
        // DOM элементы
        this.elements = {};
        
        // Интервалы
        this.idleInterval = null;
        this.saveInterval = null;
        
        // Инициализация
        this.init();
    }
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    init() {
        this.tg.ready();
        this.tg.expand();
        
        // Кэшируем DOM элементы
        this.cacheElements();
        
        // Загружаем сохранения
        this.loadGame();
        
        // Запускаем idle-механику
        this.startIdleMechanics();
        
        // Запускаем автосохранение
        this.startAutoSave();
        
        // Привязываем события
        this.bindEvents();
        
        // Обновляем UI
        this.updateUI();
        this.renderUpgrades();
        this.renderShop();
        this.renderInventory();
        
        // Применяем тему
        this.applyTheme();
        
        console.log('🎁 Gift Farm инициализирована!', this.gameState);
    }
    
    cacheElements() {
        this.elements = {
            // Ресурсы
            partsCount: document.getElementById('parts-count'),
            starsCount: document.getElementById('stars-count'),
            ppsCount: document.getElementById('pps-count'),
            
            // Кликер
            clickZone: document.getElementById('click-zone'),
            giftEmoji: document.getElementById('gift-emoji'),
            clickEffect: document.getElementById('click-effect'),
            particlesContainer: document.getElementById('particles-container'),
            clickCounter: document.getElementById('click-counter'),
            
            // Прогресс
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            
            // Навигация
            navBtns: document.querySelectorAll('.nav-btn'),
            screens: document.querySelectorAll('.screen'),
            backBtns: document.querySelectorAll('.back-btn'),
            
            // Инвентарь
            giftsGrid: document.getElementById('gifts-grid'),
            inventoryBadge: document.getElementById('inventory-badge'),
            mergeSlots: document.querySelectorAll('.merge-slot'),
            mergeBtn: document.getElementById('merge-btn'),
            rarityBtns: document.querySelectorAll('.rarity-btn'),
            
            // Апгрейды
            upgradesList: document.getElementById('upgrades-list'),
            
            // Магазин
            shopItems: document.getElementById('shop-items'),
            shopBalance: document.getElementById('shop-balance'),
            buyStarsBtn: document.getElementById('buy-stars-btn'),
            
            // Модальное окно
            giftModal: document.getElementById('gift-modal'),
            giftDisplay: document.getElementById('gift-display'),
            giftName: document.getElementById('gift-name'),
            giftRarityTag: document.getElementById('gift-rarity-tag'),
            giftDesc: document.getElementById('gift-desc'),
            closeModal: document.getElementById('close-modal'),
            
            // Toast
            toastContainer: document.getElementById('toast-container')
        };
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
        
        // Пробуем CloudStorage
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.getItem('giftFarmState', (err, value) => {
                if (!err && value) {
                    try {
                        const cloudState = JSON.parse(value);
                        // Сравниваем даты сохранения
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
        
        if (offlineSeconds > 10) {
            const pps = this.getTotalPPS();
            const earned = Math.floor(pps * offlineSeconds * 0.3); // 30% эффективности оффлайн
            
            if (earned > 0 && pps > 0) {
                this.gameState.parts += earned;
                this.showToast(`⏰ Вы отсутствовали ${this.formatTime(offlineSeconds)}\nЗа это время добыто ${this.formatNumber(earned)} частей!`);
            }
        }
        
        this.gameState.lastOnlineTime = now;
    }
    
    saveGame() {
        this.gameState.lastSaveTime = Date.now();
        const stateString = JSON.stringify(this.gameState);
        
        // LocalStorage
        localStorage.setItem('giftFarmState', stateString);
        
        // CloudStorage
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.setItem('giftFarmState', stateString);
        }
    }
    
    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 10000); // Каждые 10 секунд
    }
    
    // ============================================
    // IDLE МЕХАНИКА
    // ============================================
    
    startIdleMechanics() {
        this.idleInterval = setInterval(() => {
            const pps = this.getTotalPPS();
            if (pps > 0) {
                this.gameState.parts += pps;
                
                // Автоматический прогресс к подарку
                this.gameState.partsEarnedForGift += pps;
                
                // Проверяем, не накопилось ли на подарок
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
        let total = 0;
        if (!this.gameState.upgrades) return 0;
        
        this.upgradesConfig.forEach(upgrade => {
            const level = this.gameState.upgrades[upgrade.id] || 0;
            total += upgrade.pps * level;
        });
        
        // Бонус от количества подарков
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
        // Базовое значение клика
        let clickValue = 1;
        
        // Проверяем активен ли бустер двойного клика
        if (this.activeBoosters?.doubleClick) {
            clickValue *= 2;
        }
        
        // Добавляем части
        this.gameState.parts += clickValue;
        this.gameState.partsEarnedForGift += clickValue;
        this.gameState.totalClicks++;
        this.gameState.sessionClicks++;
        
        // Создаём визуальный эффект
        this.createClickEffect(e, clickValue);
        this.createParticles(e);
        
        // Анимируем подарок
        this.elements.giftEmoji.classList.add('pressed');
        setTimeout(() => {
            this.elements.giftEmoji.classList.remove('pressed');
        }, 150);
        
        // Тактильный отклик
        this.hapticFeedback('light');
        
        // Проверяем, можно ли создать подарок
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
        // Базовая стоимость + увеличение от количества открытых подарков
        const totalGifts = this.getTotalGiftsCount();
        return Math.floor(100 + totalGifts * 5);
    }
    
    createRandomGift() {
        const rarityRoll = Math.random();
        let selectedRarity;
        
        // Шансы выпадения
        if (rarityRoll < 0.005) selectedRarity = 'mythic';       // 0.5%
        else if (rarityRoll < 0.02) selectedRarity = 'legendary';  // 1.5%
        else if (rarityRoll < 0.07) selectedRarity = 'epic';       // 5%
        else if (rarityRoll < 0.20) selectedRarity = 'rare';       // 13%
        else if (rarityRoll < 0.45) selectedRarity = 'uncommon';   // 25%
        else selectedRarity = 'common';                            // 55%
        
        // Бонус от бустера удачи
        if (this.activeBoosters?.luckyHour) {
            if (Math.random() < 0.5) {
                // Повышаем редкость
                const upgradeOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                const currentIndex = upgradeOrder.indexOf(selectedRarity);
                if (currentIndex < upgradeOrder.length - 1) {
                    selectedRarity = upgradeOrder[currentIndex + 1];
                }
            }
        }
        
        // Выбираем случайный подарок нужной редкости
        const possibleGifts = Object.entries(this.giftsConfig)
            .filter(([_, config]) => config.rarity === selectedRarity);
        
        const randomGift = possibleGifts[Math.floor(Math.random() * possibleGifts.length)];
        const [giftId, giftConfig] = randomGift;
        
        // Добавляем в инвентарь
        if (!this.gameState.gifts) this.gameState.gifts = {};
        this.gameState.gifts[giftId] = (this.gameState.gifts[giftId] || 0) + 1;
        
        // Показываем модальное окно
        this.showGiftModal(giftId, giftConfig);
        
        // Toast уведомление для редких подарков
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
        
        // Позиционируем около точки клика
        const rect = this.elements.clickZone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        
        // Сбрасываем анимацию
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
        
        // Анимация
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
            
            // Обработчик покупки
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
            return;
        }
        
        let hasGifts = false;
        
        Object.entries(this.gameState.gifts).forEach(([giftId, count]) => {
            const config = this.giftsConfig[giftId];
            if (!config) return;
            
            if (filter !== 'all' && config.rarity !== filter) return;
            if (count <= 0) return;
            
            hasGifts = true;
            
            const card = document.createElement('div');
            card.className = 'gift-card';
            card.setAttribute('data-rarity', config.rarity);
            card.setAttribute('data-gift-id', giftId);
            card.innerHTML = `
                <span class="gift-count">${count}</span>
                <div class="gift-emoji-display">${config.emoji}</div>
                <div class="gift-name-display">${config.name}</div>
                <div class="gift-rarity-display">${this.getRarityName(config.rarity)}</div>
            `;
            
            // Выделяем выбранные для мержа
            if (this.mergeSlots.includes(giftId)) {
                card.classList.add('selected');
            }
            
            card.addEventListener('click', () => this.selectForMerge(giftId, config));
            container.appendChild(card);
        });
        
        if (!hasGifts) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--tg-theme-hint)">
                    Нет подарков этой редкости
                </div>
            `;
        }
        
        // Обновляем бейдж
        const totalGifts = this.getTotalGiftsCount();
        if (totalGifts > 0) {
            this.elements.inventoryBadge.style.display = 'flex';
            this.elements.inventoryBadge.textContent = totalGifts;
        } else {
            this.elements.inventoryBadge.style.display = 'none';
        }
    }
    
    selectForMerge(giftId, config) {
        const count = this.gameState.gifts[giftId] || 0;
        
        // Проверяем, не выбран ли уже
        const existingIndex = this.mergeSlots.indexOf(giftId);
        if (existingIndex !== -1) {
            // Убираем из слота
            this.mergeSlots[existingIndex] = null;
            this.updateMergeSlots();
            this.renderInventory(this.currentFilter);
            return;
        }
        
        // Проверяем, что все выбранные слоты того же типа
        const otherGiftInSlots = this.mergeSlots.find(slot => slot !== null && slot !== giftId);
        if (otherGiftInSlots) {
            this.showToast('❌ Выберите одинаковые подарки для мержа!');
            return;
        }
        
        // Ищем пустой слот
        const emptySlotIndex = this.mergeSlots.indexOf(null);
        if (emptySlotIndex === -1) {
            // Все слоты заняты
            if (count >= 3) {
                // Заменяем последний слот
                this.mergeSlots[2] = giftId;
            } else {
                this.showToast('Выберите не более 3 подарков');
                return;
            }
        } else {
            // Проверяем, хватает ли количества
            const alreadySelected = this.mergeSlots.filter(s => s === giftId).length;
            if (alreadySelected >= count) {
                this.showToast('Недостаточно подарков этого типа!');
                return;
            }
            this.mergeSlots[emptySlotIndex] = giftId;
        }
        
        this.updateMergeSlots();
        this.renderInventory(this.currentFilter);
        
        // Активируем кнопку мержа если 3 слота заполнены
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
            } else {
                slot.textContent = '';
                slot.className = 'merge-slot empty';
            }
        });
    }
    
    mergeGifts() {
        const filledSlots = this.mergeSlots.filter(s => s !== null);
        if (filledSlots.length !== 3) return;
        
        const giftId = filledSlots[0];
        const config = this.giftsConfig[giftId];
        
        if (!config) return;
        
        // Проверяем, хватает ли подарков
        if ((this.gameState.gifts[giftId] || 0) < 3) {
            this.showToast('❌ Недостаточно подарков!');
            return;
        }
        
        // Находим следующий уровень редкости
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
        
        // Тратим 3 подарка
        this.gameState.gifts[giftId] -= 3;
        if (this.gameState.gifts[giftId] <= 0) {
            delete this.gameState.gifts[giftId];
        }
        
        // Получаем случайный подарок следующей редкости
        const [newGiftId, newConfig] = possibleUpgrades[Math.floor(Math.random() * possibleUpgrades.length)];
        this.gameState.gifts[newGiftId] = (this.gameState.gifts[newGiftId] || 0) + 1;
        
        // Очищаем слоты
        this.mergeSlots = [null, null, null];
        this.updateMergeSlots();
        this.elements.mergeBtn.disabled = true;
        this.elements.mergeBtn.textContent = '🔨 Выберите 3 одинаковых подарка';
        
        this.hapticFeedback('success');
        this.showToast(`🔨 Создан: ${newConfig.emoji} ${newConfig.name}!`, nextRarity);
        
        this.renderInventory(this.currentFilter);
        this.updateUI();
    }
    
    // ============================================
    // МАГАЗИН
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
            this.showToast('❌ Недостаточно Stars! Купите их в магазине.');
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
        this.updateUI();
    }
    
    activateBooster(boosterId) {
        if (!this.activeBoosters) this.activeBoosters = {};
        
        switch (boosterId) {
            case 'double_click':
                this.activeBoosters.doubleClick = true;
                setTimeout(() => {
                    this.activeBoosters.doubleClick = false;
                    this.showToast('⏰ Двойной клик закончился!');
                }, 600000); // 10 минут
                break;
            case 'auto_clicker':
                this.activeBoosters.autoClicker = true;
                const autoClickInterval = setInterval(() => {
                    if (!this.activeBoosters.autoClicker) {
                        clearInterval(autoClickInterval);
                        return;
                    }
                    this.handleClick({ clientX: 0, clientY: 0 });
                }, 100);
                setTimeout(() => {
                    this.activeBoosters.autoClicker = false;
                    this.showToast('⏰ Автокликер закончился!');
                }, 300000); // 5 минут
                break;
            case 'lucky_hour':
                this.activeBoosters.luckyHour = true;
                setTimeout(() => {
                    this.activeBoosters.luckyHour = false;
                    this.showToast('⏰ Час удачи закончился!');
                }, 3600000); // 1 час
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
                    // Гарантированно rare или выше
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
    }
    
    // ============================================
    // STARS ПОКУПКА (Telegram Payments)
    // ============================================
    
    buyStars() {
        // Здесь должна быть интеграция с Telegram Payments API
        // Для MVP показываем информацию
        if (this.tg.isVersionAtLeast('6.1')) {
            this.showToast('💎 Для покупки Stars используйте официальный магазин Telegram');
            this.tg.openTelegramLink('https://t.me/durgerkingbot'); // Заглушка
        } else {
            this.showToast('Обновите Telegram для покупки Stars');
        }
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ UI
    // ============================================
    
    updateUI() {
        // Ресурсы
        this.elements.partsCount.textContent = this.formatNumber(this.gameState.parts);
        this.elements.starsCount.textContent = this.formatNumber(this.gameState.stars);
        this.elements.ppsCount.textContent = this.formatNumber(this.getTotalPPS());
        
        // Прогресс
        const progress = (this.gameState.partsEarnedForGift / this.gameState.partsForNextGift) * 100;
        this.elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
        this.elements.progressText.textContent = 
            `${this.formatNumber(this.gameState.partsEarnedForGift)} / ${this.formatNumber(this.gameState.partsForNextGift)}`;
        
        // Счётчик кликов
        this.elements.clickCounter.textContent = `Сессия: ${this.gameState.sessionClicks} кликов`;
        
        // Баланс в магазине
        if (this.elements.shopBalance) {
            this.elements.shopBalance.textContent = this.gameState.stars;
        }
    }
    
    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    
    switchScreen(screenName) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Обновляем навигацию
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-screen') === screenName);
        });
        
        // Дополнительные действия
        if (screenName === 'inventory') {
            this.renderInventory();
        }
        if (screenName === 'upgrades') {
            this.renderUpgrades();
        }
        if (screenName === 'shop') {
            this.elements.shopBalance.textContent = this.gameState.stars;
        }
    }
    
    // ============================================
    // СОБЫТИЯ
    // ============================================
    
    bindEvents() {
        // Клик по подарку
        this.elements.clickZone.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Предотвращаем зум при двойном тапе
        this.elements.clickZone.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        // Навигация
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.getAttribute('data-screen');
                this.switchScreen(screen);
                this.hapticFeedback('light');
            });
        });
        
        // Кнопки назад
        this.elements.backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchScreen('main');
                this.hapticFeedback('light');
            });
        });
        
        // Закрытие модального окна
        this.elements.closeModal.addEventListener('click', () => {
            this.closeGiftModal();
        });
        
        this.elements.giftModal.addEventListener('click', (e) => {
            if (e.target === this.elements.giftModal) {
                this.closeGiftModal();
            }
        });
        
        // Мерж
        this.elements.mergeBtn.addEventListener('click', () => {
            this.mergeGifts();
        });
        
        // Фильтры редкости
        this.elements.rarityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.rarityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderInventory(btn.getAttribute('data-rarity'));
            });
        });
        
        // Покупка Stars
        this.elements.buyStarsBtn.addEventListener('click', () => {
            this.buyStars();
        });
        
        // Обработка изменений темы Telegram
        this.tg.onEvent('themeChanged', () => {
            this.applyTheme();
        });
        
        // Сохранение при закрытии
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        // Сохранение при сворачивании
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveGame();
            } else {
                this.calculateOfflineEarnings();
                this.updateUI();
            }
        });
    }
    
    // ============================================
    // ТЕМА
    // ============================================
    
    applyTheme() {
        const themeParams = this.tg.themeParams;
        if (themeParams.bg_color) {
            document.documentElement.style.setProperty('--tg-theme-bg', themeParams.bg_color);
        }
        if (themeParams.text_color) {
            document.documentElement.style.setProperty('--tg-theme-text', themeParams.text_color);
        }
        if (themeParams.button_color) {
            document.documentElement.style.setProperty('--tg-theme-button', themeParams.button_color);
        }
        if (themeParams.secondary_bg_color) {
            document.documentElement.style.setProperty('--tg-theme-secondary-bg', themeParams.secondary_bg_color);
        }
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
    window.game = game; // Для отладки
});
