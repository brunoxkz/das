// Background script for Vendzz Pomodoro Timer
let timerState = {
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'work',
    startTime: null
};

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Vendzz Pomodoro Timer installed');
    
    // Initialize default settings
    chrome.storage.sync.set({
        pomodoroSettings: {
            work: 25,
            break: 5,
            longBreak: 15
        },
        pomodoroStats: {
            todayCount: 0,
            totalCount: 0,
            focusTime: 0
        }
    });
});

// Handle notifications click
chrome.notifications.onClicked.addListener((notificationId) => {
    // Open popup or perform action when notification is clicked
    chrome.action.openPopup();
});

// Handle alarm for timer completion
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroTimer') {
        // Timer completed
        showCompletionNotification();
        updateStats();
    }
});

function showCompletionNotification() {
    const title = timerState.mode === 'work' ? 'Pomodoro Concluído!' : 'Pausa Terminada!';
    const message = timerState.mode === 'work' ? 
        'Hora de fazer uma pausa! Você merece.' : 
        'Hora de voltar ao trabalho! Vamos lá!';
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message,
        priority: 2
    });
}

function updateStats() {
    chrome.storage.sync.get(['pomodoroStats'], (result) => {
        let stats = result.pomodoroStats || {
            todayCount: 0,
            totalCount: 0,
            focusTime: 0
        };
        
        if (timerState.mode === 'work') {
            stats.todayCount++;
            stats.totalCount++;
            stats.focusTime += 25; // Default work time
        }
        
        chrome.storage.sync.set({ pomodoroStats: stats });
    });
}

// Reset daily stats at midnight
function resetDailyStats() {
    chrome.storage.sync.get(['pomodoroStats'], (result) => {
        if (result.pomodoroStats) {
            result.pomodoroStats.todayCount = 0;
            chrome.storage.sync.set({ pomodoroStats: result.pomodoroStats });
        }
    });
}

// Check for daily reset
function checkDailyReset() {
    chrome.storage.sync.get(['lastResetDate'], (result) => {
        const today = new Date().toDateString();
        const lastReset = result.lastResetDate;
        
        if (lastReset !== today) {
            resetDailyStats();
            chrome.storage.sync.set({ lastResetDate: today });
        }
    });
}

// Check daily reset on startup
checkDailyReset();

// Set up daily reset alarm
chrome.alarms.create('dailyReset', {
    when: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
    periodInMinutes: 24 * 60 // Every 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        checkDailyReset();
    }
});