// ============================================
// Telegram Mini App - Заметки
// ============================================

class NotesApp {
    constructor() {
        // Инициализация Telegram WebApp
        this.tg = window.Telegram.WebApp;
        
        // Данные пользователя
        this.user = this.tg.initDataUnsafe?.user || null;
        this.userId = this.user?.id || 'anonymous';
        
        // Состояние приложения
        this.notes = [];
        this.currentNoteId = null;
        this.isDarkTheme = false;
        
        // DOM элементы
        this.screens = {
            main: document.getElementById('main-screen'),
            editor: document.getElementById('editor-screen')
        };
        
        this.elements = {
            notesList: document.getElementById('notes-list'),
            addNoteBtn: document.getElementById('add-note-btn'),
            backBtn: document.getElementById('back-btn'),
            saveBtn: document.getElementById('save-btn'),
            noteTitle: document.getElementById('note-title'),
            noteContent: document.getElementById('note-content'),
            noteColor: document.getElementById('note-color'),
            noteId: document.getElementById('note-id'),
            editorTitle: document.getElementById('editor-title'),
            themeToggle: document.getElementById('theme-toggle')
        };
        
        // Инициализация
        this.init();
    }
    
    init() {
        // Настройка Telegram WebApp
        this.tg.ready();
        this.tg.expand();
        
        // Применяем тему Telegram
        this.applyTelegramTheme();
        
        // Загружаем заметки
        this.loadNotes();
        
        // Навешиваем обработчики событий
        this.bindEvents();
        
        // Показываем MainButton Telegram если нужно
        this.setupMainButton();
        
        // Настраиваем BackButton
        this.setupBackButton();
        
        console.log('Приложение инициализировано', {
            user: this.user,
            theme: this.tg.colorScheme
        });
    }
    
    // ============================================
    // Работа с темами
    // ============================================
    
    applyTelegramTheme() {
        // Получаем цвета из Telegram
        const themeParams = this.tg.themeParams;
        
        // Применяем CSS переменные
        document.documentElement.style.setProperty('--tg-theme-bg', themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text', themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint', themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link', themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button', themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text', themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg', themeParams.secondary_bg_color || '#f0f0f0');
        
        // Применяем тему
        this.isDarkTheme = this.tg.colorScheme === 'dark';
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        
        // Тактильный отклик
        this.hapticImpact('light');
        
        console.log('Тема переключена:', this.isDarkTheme ? 'тёмная' : 'светлая');
    }
    
    // ============================================
    // Тактильный отклик
    // ============================================
    
    hapticImpact(style = 'light') {
        if (this.tg.HapticFeedback) {
            try {
                this.tg.HapticFeedback.impactOccurred(style);
            } catch (e) {
                console.log('Haptic не поддерживается');
            }
        }
    }
    
    hapticNotification(type = 'success') {
        if (this.tg.HapticFeedback) {
            try {
                this.tg.HapticFeedback.notificationOccurred(type);
            } catch (e) {
                console.log('Haptic notification не поддерживается');
            }
        }
    }
    
    // ============================================
    // Работа с данными
    // ============================================
    
    loadNotes() {
        // Пробуем загрузить из Telegram Cloud Storage или localStorage
        const cloudKey = `notes_${this.userId}`;
        
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.getItem(cloudKey, (error, value) => {
                if (!error && value) {
                    try {
                        this.notes = JSON.parse(value);
                        console.log('Заметки загружены из CloudStorage');
                    } catch (e) {
                        this.loadFromLocalStorage();
                    }
                } else {
                    this.loadFromLocalStorage();
                }
                this.renderNotes();
            });
        } else {
            this.loadFromLocalStorage();
            this.renderNotes();
        }
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('notes');
        if (saved) {
            try {
                this.notes = JSON.parse(saved);
                console.log('Заметки загружены из localStorage');
            } catch (e) {
                this.notes = [];
            }
        } else {
            this.notes = [];
        }
    }
    
    saveNotes() {
        const cloudKey = `notes_${this.userId}`;
        
        // Сохраняем в CloudStorage
        if (this.tg.CloudStorage) {
            this.tg.CloudStorage.setItem(cloudKey, JSON.stringify(this.notes), (error) => {
                if (error) {
                    console.error('Ошибка сохранения в CloudStorage:', error);
                    // Fallback на localStorage
                    localStorage.setItem('notes', JSON.stringify(this.notes));
                } else {
                    console.log('Заметки сохранены в CloudStorage');
                }
            });
        }
        
        // Всегда сохраняем в localStorage как fallback
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
    
    // ============================================
    // Навигация между экранами
    // ============================================
    
    showScreen(screenName) {
        Object.keys(this.screens).forEach(key => {
            const screen = this.screens[key];
            if (key === screenName) {
                screen.classList.add('active');
                screen.classList.remove('slide-out-left', 'slide-in-right');
            } else {
                // Анимируем уход
                if (screen.classList.contains('active')) {
                    screen.classList.remove('active');
                }
            }
        });
        
        // Управляем Telegram BackButton
        if (screenName === 'editor') {
            this.tg.BackButton.show();
        } else {
            this.tg.BackButton.hide();
        }
    }
    
    // ============================================
    // Управление заметками
    // ============================================
    
    openEditor(noteId = null) {
        this.currentNoteId = noteId;
        
        if (noteId) {
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                this.elements.editorTitle.textContent = 'Редактирование';
                this.elements.noteTitle.value = note.title;
                this.elements.noteContent.value = note.content;
                this.elements.noteColor.value = note.color;
                this.elements.noteId.value = note.id;
            }
        } else {
            this.elements.editorTitle.textContent = 'Новая заметка';
            this.elements.noteTitle.value = '';
            this.elements.noteContent.value = '';
            this.elements.noteColor.value = '#FFD93D';
            this.elements.noteId.value = '';
        }
        
        this.showScreen('editor');
        this.hapticImpact('light');
        
        // Фокус на заголовок
        setTimeout(() => {
            this.elements.noteTitle.focus();
        }, 300);
    }
    
    saveNote() {
        const title = this.elements.noteTitle.value.trim();
        const content = this.elements.noteContent.value.trim();
        const color = this.elements.noteColor.value;
        const noteId = this.elements.noteId.value;
        
        if (!title && !content) {
            this.showToast('Введите заголовок или текст');
            this.hapticNotification('error');
            return;
        }
        
        if (noteId) {
            // Редактирование существующей заметки
            const index = this.notes.findIndex(n => n.id === noteId);
            if (index !== -1) {
                this.notes[index] = {
                    ...this.notes[index],
                    title,
                    content,
                    color,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Создание новой заметки
            const newNote = {
                id: Date.now().toString(),
                title: title || 'Без заголовка',
                content,
                color,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
        }
        
        this.saveNotes();
        this.renderNotes();
        this.showScreen('main');
        
        this.hapticNotification('success');
        this.showToast(noteId ? 'Заметка обновлена' : 'Заметка создана');
    }
    
    deleteNote(noteId, event) {
        event.stopPropagation(); // Предотвращаем открытие редактора
        
        if (confirm('Удалить заметку?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.saveNotes();
            this.renderNotes();
            
            this.hapticNotification('success');
            this.showToast('Заметка удалена');
        }
    }
    
    renderNotes() {
        const list = this.elements.notesList;
        
        if (this.notes.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет заметок</p>
                    <p class="hint">Нажмите кнопку +, чтобы создать первую</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.notes.map(note => `
            <div class="note-card" 
                 style="background-color: ${note.color}"
                 onclick="app.openEditor('${note.id}')">
                <button class="delete-btn" onclick="app.deleteNote('${note.id}', event)">
                    ✕
                </button>
                <h3>${this.escapeHtml(note.title) || 'Без заголовка'}</h3>
                <p>${this.escapeHtml(note.content) || ''}</p>
                <div class="date">
                    ${this.formatDate(note.updatedAt)}
                </div>
            </div>
        `).join('');
    }
    
    // ============================================
    // Telegram MainButton
    // ============================================
    
    setupMainButton() {
        // Настраиваем главную кнопку Telegram (показывается на главном экране)
        this.tg.MainButton.setText('Добавить заметку')
            .onClick(() => {
                this.openEditor();
            });
        
        // Показываем кнопку только на главном экране
        this.tg.MainButton.show();
    }
    
    setupBackButton() {
        this.tg.BackButton.onClick(() => {
            this.showScreen('main');
        });
    }
    
    // ============================================
    // Обработчики событий
    // ============================================
    
    bindEvents() {
        // Главный экран
        this.elements.addNoteBtn.addEventListener('click', () => {
            this.openEditor();
        });
        
        // Редактор
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main');
            this.hapticImpact('light');
        });
        
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveNote();
        });
        
        // Переключение темы
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Отслеживание изменений темы в Telegram
        this.tg.onEvent('themeChanged', () => {
            this.applyTelegramTheme();
        });
        
        // Обработка нажатия аппаратной кнопки "Назад" на Android
        document.addEventListener('backbutton', (e) => {
            if (this.screens.editor.classList.contains('active')) {
                this.showScreen('main');
                e.preventDefault();
            }
        });
        
        // Обработка жестов свайпа для iOS
        this.setupSwipeGestures();
    }
    
    // ============================================
    // Жесты
    // ============================================
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            // Свайп вправо на экране редактора - возврат назад
            if (deltaX > 80 && deltaY < 50 && this.screens.editor.classList.contains('active')) {
                this.showScreen('main');
                this.hapticImpact('light');
            }
        });
    }
    
    // ============================================
    // Утилиты
    // ============================================
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Только что';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`;
        
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ============================================
// Запуск приложения
// ============================================

// Инициализируем приложение после загрузки DOM
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NotesApp();
    // Делаем app глобально доступным для onclick в HTML
    window.app = app;
});
