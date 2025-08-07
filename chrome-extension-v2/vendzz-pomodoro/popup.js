class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.currentMode = 'work';
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timer = null;
        this.settings = {
            work: 25,
            break: 5,
            longBreak: 15
        };
        this.stats = {
            todayCount: 0,
            totalCount: 0,
            focusTime: 0
        };
        
        this.initializeElements();
        this.loadSettings();
        this.loadStats();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.workBtn = document.getElementById('workBtn');
        this.breakBtn = document.getElementById('breakBtn');
        this.longBreakBtn = document.getElementById('longBreakBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.todayCountSpan = document.getElementById('todayCount');
        this.totalCountSpan = document.getElementById('totalCount');
        this.focusTimeSpan = document.getElementById('focusTime');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.workBtn.addEventListener('click', () => this.setMode('work'));
        this.breakBtn.addEventListener('click', () => this.setMode('break'));
        this.longBreakBtn.addEventListener('click', () => this.setMode('longBreak'));
        
        this.workTimeInput.addEventListener('change', () => this.updateSettings());
        this.breakTimeInput.addEventListener('change', () => this.updateSettings());
        this.longBreakTimeInput.addEventListener('change', () => this.updateSettings());
    }
    
    start() {
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.settings[this.currentMode] * 60;
        this.updateDisplay();
    }
    
    complete() {
        this.pause();
        
        // Update stats
        if (this.currentMode === 'work') {
            this.stats.todayCount++;
            this.stats.totalCount++;
            this.stats.focusTime += this.settings.work;
        }
        
        this.saveStats();
        this.updateStatsDisplay();
        
        // Show notification
        this.showNotification();
        
        // Auto-switch to break
        if (this.currentMode === 'work') {
            const nextMode = this.stats.todayCount % 4 === 0 ? 'longBreak' : 'break';
            this.setMode(nextMode);
        } else {
            this.setMode('work');
        }
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.settings[mode] * 60;
        this.updateDisplay();
        this.updateModeButtons();
    }
    
    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        if (this.currentMode === 'work') {
            this.workBtn.classList.add('active');
        } else if (this.currentMode === 'break') {
            this.breakBtn.classList.add('active');
        } else if (this.currentMode === 'longBreak') {
            this.longBreakBtn.classList.add('active');
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateSettings() {
        this.settings.work = parseInt(this.workTimeInput.value) || 25;
        this.settings.break = parseInt(this.breakTimeInput.value) || 5;
        this.settings.longBreak = parseInt(this.longBreakTimeInput.value) || 15;
        
        this.saveSettings();
        this.reset();
    }
    
    updateStatsDisplay() {
        this.todayCountSpan.textContent = this.stats.todayCount;
        this.totalCountSpan.textContent = this.stats.totalCount;
        
        const hours = Math.floor(this.stats.focusTime / 60);
        const minutes = this.stats.focusTime % 60;
        this.focusTimeSpan.textContent = `${hours}h ${minutes}m`;
    }
    
    showNotification() {
        const title = this.currentMode === 'work' ? 'Pomodoro Concluído!' : 'Pausa Terminada!';
        const message = this.currentMode === 'work' ? 
            'Hora de fazer uma pausa! Você merece.' : 
            'Hora de voltar ao trabalho! Vamos lá!';
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        });
    }
    
    loadSettings() {
        chrome.storage.sync.get(['pomodoroSettings'], (result) => {
            if (result.pomodoroSettings) {
                this.settings = { ...this.settings, ...result.pomodoroSettings };
                this.workTimeInput.value = this.settings.work;
                this.breakTimeInput.value = this.settings.break;
                this.longBreakTimeInput.value = this.settings.longBreak;
                this.reset();
            }
        });
    }
    
    saveSettings() {
        chrome.storage.sync.set({ pomodoroSettings: this.settings });
    }
    
    loadStats() {
        chrome.storage.sync.get(['pomodoroStats'], (result) => {
            if (result.pomodoroStats) {
                this.stats = { ...this.stats, ...result.pomodoroStats };
            }
            this.updateStatsDisplay();
        });
    }
    
    saveStats() {
        chrome.storage.sync.set({ pomodoroStats: this.stats });
    }
}

// Initialize the timer when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});