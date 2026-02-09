class PomodoroApp {
    constructor() {
        this.timer = null;
        this.timeLeft = 0;
        this.isRunning = false;
        this.currentSession = 'focus';
        this.sessionCount = 1;
        this.totalSessions = 0;
        
        this.settings = {
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15
        };
        
        this.initElements();
        this.loadFromStorage();
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
    }
    
    initElements() {
        this.timerEl = document.getElementById('timer');
        this.sessionTypeEl = document.getElementById('session-type');
        this.sessionCountEl = document.getElementById('session-count');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.completedSessionsEl = document.getElementById('completed-sessions');
        this.totalTimeEl = document.getElementById('total-time');
        this.resetDayBtn = document.getElementById('reset-day');
        
        this.focusDurationEl = document.getElementById('focus-duration');
        this.shortBreakEl = document.getElementById('short-break');
        this.longBreakEl = document.getElementById('long-break');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.resetDayBtn.addEventListener('click', () => this.resetDay());
        
        this.focusDurationEl.addEventListener('change', () => this.updateSettings());
        this.shortBreakEl.addEventListener('change', () => this.updateSettings());
        this.longBreakEl.addEventListener('change', () => this.updateSettings());
        
        window.addEventListener('beforeunload', () => this.saveToStorage());
    }
    
    start() {
        if (!this.isRunning) {
            if (this.timeLeft === 0) {
                this.timeLeft = this.getCurrentDuration() * 60;
            }
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timer = setInterval(() => this.tick(), 1000);
        }
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.getCurrentDuration() * 60;
        this.updateDisplay();
        this.updateProgress();
    }
    
    tick() {
        this.timeLeft--;
        this.updateDisplay();
        this.updateProgress();
        
        if (this.timeLeft <= 0) {
            this.sessionComplete();
        }
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.currentSession === 'focus') {
            this.totalSessions++;
            this.saveStats();
        }
        
        this.nextSession();
        this.showNotification();
    }
    
    nextSession() {
        if (this.currentSession === 'focus') {
            if (this.sessionCount === 4) {
                this.currentSession = 'longBreak';
                this.sessionCount = 1;
            } else {
                this.currentSession = 'shortBreak';
                this.sessionCount++;
            }
        } else {
            this.currentSession = 'focus';
        }
        
        this.timeLeft = this.getCurrentDuration() * 60;
        this.updateSessionDisplay();
        this.updateDisplay();
        this.updateProgress();
    }
    
    getCurrentDuration() {
        switch (this.currentSession) {
            case 'focus': return this.settings.focusDuration;
            case 'shortBreak': return this.settings.shortBreak;
            case 'longBreak': return this.settings.longBreak;
            default: return this.settings.focusDuration;
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        const totalTime = this.getCurrentDuration() * 60;
        const progress = (totalTime - this.timeLeft) / totalTime;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (progress * circumference);
        this.progressBar.style.strokeDashoffset = offset;
    }
    
    updateSessionDisplay() {
        const sessionTypes = {
            focus: 'Focus Session',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        
        this.sessionTypeEl.textContent = sessionTypes[this.currentSession];
        this.sessionCountEl.textContent = this.sessionCount;
        
        document.body.className = this.currentSession === 'focus' ? '' : 'break-session';
    }
    
    updateSettings() {
        this.settings.focusDuration = parseInt(this.focusDurationEl.value);
        this.settings.shortBreak = parseInt(this.shortBreakEl.value);
        this.settings.longBreak = parseInt(this.longBreakEl.value);
        
        if (!this.isRunning) {
            this.timeLeft = this.getCurrentDuration() * 60;
            this.updateDisplay();
            this.updateProgress();
        }
        
        this.saveToStorage();
    }
    
    showNotification() {
        const messages = {
            focus: 'Break time! Take a rest.',
            shortBreak: 'Break over! Ready to focus?',
            longBreak: 'Long break over! Ready for a new cycle?'
        };
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: messages[this.currentSession],
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2381c784"/></svg>'
            });
        }
        
        // Visual notification
        document.body.style.background = this.currentSession === 'focus' ? 
            'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 
            'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
        
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        }, 2000);
    }
    
    updateStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        const todayStats = stats[today] || { sessions: 0, totalTime: 0 };
        
        this.completedSessionsEl.textContent = todayStats.sessions;
        
        const hours = Math.floor(todayStats.totalTime / 60);
        const minutes = todayStats.totalTime % 60;
        this.totalTimeEl.textContent = `${hours}h ${minutes}m`;
    }
    
    saveStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
        if (!stats[today]) {
            stats[today] = { sessions: 0, totalTime: 0 };
        }
        
        stats[today].sessions++;
        stats[today].totalTime += this.settings.focusDuration;
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        this.updateStats();
    }
    
    resetDay() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        delete stats[today];
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        this.updateStats();
    }
    
    saveToStorage() {
        const state = {
            timeLeft: this.timeLeft,
            currentSession: this.currentSession,
            sessionCount: this.sessionCount,
            isRunning: this.isRunning,
            settings: this.settings,
            timestamp: Date.now()
        };
        localStorage.setItem('pomodoroState', JSON.stringify(state));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('pomodoroState');
        if (!saved) {
            this.timeLeft = this.settings.focusDuration * 60;
            return;
        }
        
        try {
            const state = JSON.parse(saved);
            const timeDiff = (Date.now() - state.timestamp) / 1000;
            
            // If more than 1 hour passed, reset
            if (timeDiff > 3600) {
                this.timeLeft = this.settings.focusDuration * 60;
                return;
            }
            
            this.currentSession = state.currentSession;
            this.sessionCount = state.sessionCount;
            this.settings = { ...this.settings, ...state.settings };
            
            // Update settings inputs
            this.focusDurationEl.value = this.settings.focusDuration;
            this.shortBreakEl.value = this.settings.shortBreak;
            this.longBreakEl.value = this.settings.longBreak;
            
            if (state.isRunning && state.timeLeft > timeDiff) {
                this.timeLeft = Math.max(0, state.timeLeft - Math.floor(timeDiff));
                this.start();
            } else {
                this.timeLeft = state.timeLeft || this.getCurrentDuration() * 60;
            }
            
            this.updateSessionDisplay();
        } catch (e) {
            this.timeLeft = this.settings.focusDuration * 60;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroApp();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});