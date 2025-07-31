// Content Script - Injeta sidebar dark moderna
(function() {
    'use strict';

    // Verificar se já foi inicializado para evitar duplicação
    if (window.sidebarProductivityLoaded) {
        return;
    }
    window.sidebarProductivityLoaded = true;

    let sidebarContainer = null;
    let isVisible = false;
    let sidebarApp = null;
    let initializationAttempts = 0;
    const MAX_INIT_ATTEMPTS = 3;

    // Criar sidebar dark moderna
    function createSidebar() {
        if (sidebarContainer) return;

        sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'productivity-sidebar-container';
        sidebarContainer.innerHTML = `
            <div id="productivity-sidebar">
                <!-- Header -->
                <div class="sidebar-header">
                    <h1>📋 To-Do + Pomodoro</h1>
                    <button id="closeSidebarBtn" class="close-sidebar-btn">×</button>
                </div>
                
                <!-- Seção Pomodoro -->
                <div class="sidebar-section">
                    <h2>🍅 Timer Pomodoro</h2>
                    <div class="timer-display">
                        <div class="timer-status" id="timerPhase">ELEVE SUA ENERGIA</div>
                        <div class="timer-time" id="timerDisplay">25:00</div>
                        <div class="timer-session">Sessão 1 de 4</div>
                        
                        <div class="timer-controls">
                            <button id="startPauseBtn" class="btn">▶ Iniciar</button>
                            <button id="resetBtn" class="btn">⏹ Reset</button>
                            <button id="soundBtn" class="btn">🔊 Sons</button>
                        </div>
                    </div>
                    
                    <div class="sound-buttons" id="ambientControls" style="display: none;">
                        <button class="sound-btn" data-sound="rain">🌧️ Chuva</button>
                        <button class="sound-btn" data-sound="ocean">🌊 Oceano</button>
                        <button class="sound-btn" data-sound="forest">🌲 Floresta</button>
                        <button class="sound-btn" data-sound="cafe">☕ Café</button>
                        <button class="sound-btn" data-sound="white">📡 Ruído</button>
                    </div>
                </div>
                
                <!-- Seção Todo -->
                <div class="sidebar-section">
                    <h2>📝 Listas de Tarefas</h2>
                    <button id="addColumnBtn" class="btn">+ Nova Lista</button>
                    
                    <div class="todo-lists" id="columnsContainer">
                        <!-- Listas serão inseridas aqui -->
                    </div>
                </div>
                
                <!-- Modais -->
                <div id="taskModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <h3 id="modalTitle">Adicionar Tarefa</h3>
                        <input type="text" id="taskInput" placeholder="Digite o nome da tarefa...">
                        <div class="modal-buttons">
                            <button id="saveTaskBtn" class="btn">Salvar</button>
                            <button id="cancelTaskBtn" class="btn">Cancelar</button>
                        </div>
                    </div>
                </div>
                
                <div id="columnModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <h3 id="columnModalTitle">Nova Lista</h3>
                        <input type="text" id="columnInput" placeholder="Digite o nome da lista...">
                        <div class="modal-buttons">
                            <button id="saveColumnBtn" class="btn">Salvar</button>
                            <button id="cancelColumnBtn" class="btn">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(sidebarContainer);
        adjustPageLayout(true);
        initializeSidebarApp();
        
        // Configurar o botão de fechar com verificação robusta
        const closeBtn = document.getElementById('closeSidebarBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        }
        
        isVisible = true;
        
        // Salvar estado no storage
        try {
            chrome.runtime.sendMessage({
                action: "saveSidebarState",
                visible: true
            });
        } catch (error) {
            console.log('Sidebar: Erro ao salvar estado:', error);
        }
    }

    // Ajustar layout da página
    function adjustPageLayout(show) {
        const body = document.body;
        if (show) {
            body.classList.add('sidebar-active');
            body.style.transition = 'margin-left 0.3s ease';
            // Evitar que a página seja empurrada demais
            body.style.boxSizing = 'border-box';
        } else {
            body.classList.remove('sidebar-active');
            body.style.marginLeft = '0';
            body.style.maxWidth = '100%';
            body.style.overflow = 'visible';
        }
    }

    // Inicializar aplicação da sidebar
    function initializeSidebarApp() {
        sidebarApp = new SidebarApp();
    }

    // Alternar visibilidade da sidebar
    function toggleSidebar() {
        if (isVisible) {
            if (sidebarContainer) {
                sidebarContainer.remove();
                sidebarContainer = null;
            }
            adjustPageLayout(false);
            isVisible = false;
            
            // Salvar estado
            try {
                chrome.runtime.sendMessage({
                    action: "saveSidebarState",
                    visible: false
                });
            } catch (error) {
                console.log('Sidebar: Erro ao salvar estado:', error);
            }
        } else {
            createSidebar();
        }
    }

    // Sistema de inicialização robusta
    function initializeExtension() {
        initializationAttempts++;
        
        if (initializationAttempts > MAX_INIT_ATTEMPTS) {
            console.log('Sidebar: Máximo de tentativas de inicialização atingido');
            return;
        }

        // Verificar se DOM está pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initializeExtension, 100);
            });
            return;
        }

        // Verificar se document.body existe
        if (!document.body) {
            setTimeout(initializeExtension, 100);
            return;
        }

        // Carregar estado salvo da sidebar
        try {
            chrome.storage.local.get(['sidebarVisible'], (result) => {
                if (result.sidebarVisible && !isVisible) {
                    createSidebar();
                }
            });
        } catch (error) {
            console.log('Sidebar: Erro ao carregar estado:', error);
        }

        // Configurar listener para mensagens do background script
        try {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request.action === "toggleSidebar") {
                    toggleSidebar();
                    sendResponse({success: true, visible: isVisible});
                    return true;
                }
            });
        } catch (error) {
            console.log('Sidebar: Erro ao configurar listener:', error);
        }

        console.log('Sidebar: Extensão inicializada com sucesso');
    }

    // Verificar se a página é válida para a extensão
    function isValidPage() {
        const url = window.location.href;
        const invalidPatterns = [
            'chrome://', 'chrome-extension://', 'moz-extension://', 
            'about:', 'edge://', 'opera://', 'file://'
        ];
        
        return !invalidPatterns.some(pattern => url.startsWith(pattern));
    }

    // Inicializar quando o script carregar, mas só em páginas válidas
    if (isValidPage()) {
        initializeExtension();
    }

    // Listener adicional para mudanças de página (SPAs)
    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('load', () => {
            if (isValidPage() && !window.sidebarProductivityLoaded) {
                initializeExtension();
            }
        });
    }

    // Clase principal da aplicação
    class SidebarApp {
        constructor() {
            this.columns = this.getColumns();
            this.currentTask = null;
            this.currentColumn = null;
            this.editingTask = null;
            this.editingColumn = null;
            
            // Pomodoro
            this.isRunning = false;
            this.isPaused = false;
            this.currentSession = 1;
            this.totalSessions = 4;
            this.timeRemaining = 25 * 60;
            this.isBreak = false;
            this.currentSound = null;
            this.currentSoundType = null;
            this.audioContext = null;
            
            this.init();
        }

        init() {
            this.setupPomodoro();
            this.setupAmbientControls();
            this.setupTodoSystem();
            this.renderColumns();
        }

        setupPomodoro() {
            // Elementos DOM
            this.timerDisplay = document.getElementById('timerDisplay');
            this.timerPhase = document.getElementById('timerPhase');
            this.startPauseBtn = document.getElementById('startPauseBtn');
            this.resetBtn = document.getElementById('resetBtn');
            this.soundBtn = document.getElementById('soundBtn');
            this.ambientControls = document.getElementById('ambientControls');
            
            if (this.startPauseBtn) this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
            if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.resetTimer());
            if (this.soundBtn) this.soundBtn.addEventListener('click', () => this.toggleAmbientControls());
            
            this.updateDisplay();
        }

        setupAmbientControls() {
            const ambientBtns = document.querySelectorAll('#productivity-sidebar .sound-btn');
            ambientBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const soundType = btn.dataset.sound;
                    this.toggleAmbientSound(soundType, btn);
                });
            });
        }

        setupTodoSystem() {
            const addColumnBtn = document.getElementById('addColumnBtn');
            if (addColumnBtn) {
                addColumnBtn.addEventListener('click', () => this.openColumnModal());
            }
            
            // Criar lista inicial se não existir
            if (this.getColumns().length === 0) {
                this.createColumn('📋 Tarefas');
            }
            
            this.setupModals();
        }

        setupModals() {
            // Modal de tarefa
            const taskModal = document.getElementById('taskModal');
            const saveTaskBtn = document.getElementById('saveTaskBtn');
            const cancelTaskBtn = document.getElementById('cancelTaskBtn');
            
            if (saveTaskBtn) saveTaskBtn.addEventListener('click', () => this.saveTask());
            if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
            
            // Modal de coluna
            const columnModal = document.getElementById('columnModal');
            const saveColumnBtn = document.getElementById('saveColumnBtn');
            const cancelColumnBtn = document.getElementById('cancelColumnBtn');
            
            if (saveColumnBtn) saveColumnBtn.addEventListener('click', () => this.saveColumn());
            if (cancelColumnBtn) cancelColumnBtn.addEventListener('click', () => this.closeColumnModal());
        }

        // Timer Pomodoro
        toggleTimer() {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        }

        startTimer() {
            this.isRunning = true;
            this.isPaused = false;
            this.startPauseBtn.textContent = '⏸ Pausar';
            
            this.timer = setInterval(() => {
                this.timeRemaining--;
                this.updateDisplay();
                
                if (this.timeRemaining <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }

        pauseTimer() {
            this.isRunning = false;
            this.isPaused = true;
            this.startPauseBtn.textContent = '▶ Continuar';
            clearInterval(this.timer);
        }

        resetTimer() {
            this.isRunning = false;
            this.isPaused = false;
            this.timeRemaining = this.isBreak ? 5 * 60 : 25 * 60;
            this.startPauseBtn.textContent = '▶ Iniciar';
            clearInterval(this.timer);
            this.updateDisplay();
        }

        completeSession() {
            clearInterval(this.timer);
            this.isRunning = false;
            
            if (this.isBreak) {
                this.isBreak = false;
                this.timeRemaining = 25 * 60;
                this.timerPhase.textContent = `Foco - Sessão ${this.currentSession} de ${this.totalSessions}`;
            } else {
                this.currentSession++;
                if (this.currentSession > this.totalSessions) {
                    this.currentSession = 1;
                    this.timeRemaining = 20 * 60; // Pausa longa
                    this.timerPhase.textContent = 'ELEVE SUA ENERGIA - Pausa Longa';
                } else {
                    this.timeRemaining = 5 * 60; // Pausa curta
                    this.timerPhase.textContent = 'Pausa Curta';
                }
                this.isBreak = true;
            }
            
            this.startPauseBtn.textContent = '▶ Iniciar';
            this.updateDisplay();
            this.showNotification();
        }

        updateDisplay() {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        showNotification() {
            if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: this.isBreak ? 'Hora do intervalo!' : 'Hora de focar!',
                    icon: '/icon48.png'
                });
            }
        }

        toggleAmbientControls() {
            if (!this.ambientControls) return;
            const isVisible = this.ambientControls.style.display !== 'none';
            this.ambientControls.style.display = isVisible ? 'none' : 'grid';
        }

        toggleAmbientSound(soundType, btnElement) {
            document.querySelectorAll('#productivity-sidebar .sound-btn').forEach(btn => btn.classList.remove('active'));
            
            if (this.currentSound) {
                this.stopAmbientSound();
            }
            
            if (this.currentSoundType === soundType) {
                this.currentSoundType = null;
                return;
            }
            
            btnElement.classList.add('active');
            this.currentSoundType = soundType;
            this.playAmbientSound(soundType);
        }

        async playAmbientSound(type) {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Gerar som procedural
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch(type) {
                case 'rain':
                    oscillator.type = 'pink';
                    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    break;
                case 'ocean':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                    break;
                case 'forest':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    break;
                case 'cafe':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                    break;
                case 'white':
                    oscillator.type = 'white';
                    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            oscillator.start();
            this.currentSound = oscillator;
        }

        stopAmbientSound() {
            if (this.currentSound) {
                this.currentSound.stop();
                this.currentSound = null;
            }
        }

        // Sistema To-Do
        getColumns() {
            return JSON.parse(localStorage.getItem('todoColumns') || '[]');
        }

        saveColumns(columns) {
            localStorage.setItem('todoColumns', JSON.stringify(columns));
            this.columns = columns;
        }

        createColumn(name) {
            const newColumn = {
                id: Date.now().toString(),
                name: name,
                tasks: []
            };
            const columns = this.getColumns();
            columns.push(newColumn);
            this.saveColumns(columns);
            this.renderColumns();
        }

        renderColumns() {
            const container = document.getElementById('columnsContainer');
            if (!container) return;

            const columns = this.getColumns();
            container.innerHTML = '';

            columns.forEach(column => {
                const columnElement = document.createElement('div');
                columnElement.className = 'todo-list';
                columnElement.innerHTML = `
                    <div class="list-header">
                        <h3 class="list-title">${column.name}</h3>
                        <button class="add-task-btn" data-column-id="${column.id}">+</button>
                    </div>
                    <div class="tasks-container">
                        ${column.tasks.map(task => `
                            <div class="task-item">
                                <span class="task-text">${task.text}</span>
                                <div class="task-actions">
                                    <button class="edit-task-btn" data-column-id="${column.id}" data-task-id="${task.id}">✏️</button>
                                    <button class="delete-task-btn" data-column-id="${column.id}" data-task-id="${task.id}">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(columnElement);
            });

            this.setupColumnEvents();
        }

        setupColumnEvents() {
            // Botões de adicionar tarefa
            document.querySelectorAll('#productivity-sidebar .add-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    this.openTaskModal(columnId);
                });
            });
            
            // Botões de editar tarefa
            document.querySelectorAll('#productivity-sidebar .edit-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    const taskId = e.target.dataset.taskId;
                    this.openTaskModal(columnId, taskId);
                });
            });
            
            // Botões de deletar tarefa
            document.querySelectorAll('#productivity-sidebar .delete-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    const taskId = e.target.dataset.taskId;
                    this.deleteTask(columnId, taskId);
                });
            });
        }

        openTaskModal(columnId, taskId = null) {
            this.currentColumn = columnId;
            this.editingTask = taskId;
            
            const modal = document.getElementById('taskModal');
            const title = document.getElementById('modalTitle');
            const input = document.getElementById('taskInput');
            
            if (taskId) {
                const task = this.getTask(columnId, taskId);
                title.textContent = 'Editar Tarefa';
                input.value = task ? task.text : '';
            } else {
                title.textContent = 'Adicionar Tarefa';
                input.value = '';
            }
            
            modal.style.display = 'flex';
            input.focus();
        }

        closeTaskModal() {
            document.getElementById('taskModal').style.display = 'none';
            this.currentColumn = null;
            this.editingTask = null;
        }

        saveTask() {
            const input = document.getElementById('taskInput');
            const text = input.value.trim();
            
            if (!text) return;
            
            const columns = this.getColumns();
            const column = columns.find(c => c.id === this.currentColumn);
            
            if (this.editingTask) {
                const task = column.tasks.find(t => t.id === this.editingTask);
                if (task) task.text = text;
            } else {
                column.tasks.push({
                    id: Date.now().toString(),
                    text: text
                });
            }
            
            this.saveColumns(columns);
            this.renderColumns();
            this.closeTaskModal();
        }

        deleteTask(columnId, taskId) {
            const columns = this.getColumns();
            const column = columns.find(c => c.id === columnId);
            column.tasks = column.tasks.filter(t => t.id !== taskId);
            this.saveColumns(columns);
            this.renderColumns();
        }

        getTask(columnId, taskId) {
            const columns = this.getColumns();
            const column = columns.find(c => c.id === columnId);
            return column ? column.tasks.find(t => t.id === taskId) : null;
        }

        openColumnModal() {
            const modal = document.getElementById('columnModal');
            const input = document.getElementById('columnInput');
            modal.style.display = 'flex';
            input.focus();
        }

        closeColumnModal() {
            document.getElementById('columnModal').style.display = 'none';
        }

        saveColumn() {
            const input = document.getElementById('columnInput');
            const name = input.value.trim();
            
            if (!name) return;
            
            this.createColumn(name);
            this.closeColumnModal();
            input.value = '';
        }
    }

    // Listener para mensagens da extensão
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleSidebar') {
            toggleSidebar();
            sendResponse({success: true});
        }
    });

    // Pedir permissão para notificações
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

})();