// Content Script - Injeta a sidebar nas páginas web
(function() {
    'use strict';

    let sidebarContainer = null;
    let isVisible = false;
    let sidebarApp = null;

    // Criar a sidebar
    function createSidebar() {
        if (sidebarContainer) return;

        // Container principal da sidebar
        sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'productivity-sidebar-container';
        sidebarContainer.innerHTML = `
            <div id="productivity-sidebar" class="sidebar-content">
                <!-- Botão de fechar sidebar -->
                <button class="close-sidebar" id="closeSidebarBtn" title="Fechar Sidebar">×</button>
                
                <!-- Header -->
                <div class="header">
                    <h1>📋 To-Do + Pomodoro</h1>
                </div>
                
                <!-- Sistema Pomodoro -->
                <div class="pomodoro-section">
                    <div class="motivation-text">ELEVE SUA ENERGIA</div>
                    
                    <div class="pomodoro-timer">
                        <div class="timer-display" id="timerDisplay">25:00</div>
                        <div class="timer-phase" id="timerPhase">Foco - Sessão 1 de 4</div>
                        
                        <div class="timer-controls">
                            <button id="startPauseBtn" class="timer-btn primary">▶ Iniciar</button>
                            <button id="resetBtn" class="timer-btn">⏹ Reset</button>
                            <button id="soundBtn" class="timer-btn">🔊 Sons</button>
                        </div>
                    </div>
                    
                    <div class="ambient-controls" id="ambientControls" style="display: none;">
                        <button class="ambient-btn" data-sound="rain">🌧️ Chuva</button>
                        <button class="ambient-btn" data-sound="ocean">🌊 Oceano</button>
                        <button class="ambient-btn" data-sound="forest">🌲 Floresta</button>
                        <button class="ambient-btn" data-sound="cafe">☕ Café</button>
                        <button class="ambient-btn" data-sound="white">📡 Ruído</button>
                    </div>
                </div>
                
                <!-- Conteúdo principal -->
                <div class="main-content">
                    <!-- Seção Todo -->
                    <div class="todo-section">
                        <div class="todo-header">
                            <h2>📝 Listas de Tarefas</h2>
                            <button id="addColumnBtn" class="add-column-btn">+ Nova Lista</button>
                        </div>
                        
                        <!-- Container de colunas (layout vertical) -->
                        <div class="columns-container" id="columnsContainer">
                            <!-- Colunas serão inseridas dinamicamente aqui -->
                        </div>
                    </div>
                </div>
                
                <!-- Modal para adicionar/editar tarefa -->
                <div id="taskModal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2 id="modalTitle">Adicionar Tarefa</h2>
                        <input type="text" id="taskInput" placeholder="Digite o nome da tarefa..." autocomplete="off">
                        <div class="modal-actions">
                            <button id="saveTaskBtn" class="modal-btn primary">Salvar</button>
                            <button id="cancelTaskBtn" class="modal-btn secondary">Cancelar</button>
                        </div>
                    </div>
                </div>
                
                <!-- Modal para adicionar/editar coluna -->
                <div id="columnModal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2 id="columnModalTitle">Nova Lista</h2>
                        <input type="text" id="columnInput" placeholder="Digite o nome da lista..." autocomplete="off">
                        <div class="modal-actions">
                            <button id="saveColumnBtn" class="modal-btn primary">Salvar</button>
                            <button id="cancelColumnBtn" class="modal-btn secondary">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Inserir no documento
        document.body.appendChild(sidebarContainer);

        // Ajustar o body para dar espaço à sidebar
        adjustPageLayout(true);

        // Inicializar a aplicação da sidebar
        initializeSidebarApp();

        // Configurar botão de fechar
        document.getElementById('closeSidebarBtn').addEventListener('click', toggleSidebar);

        isVisible = true;
    }

    // Ajustar layout da página
    function adjustPageLayout(show) {
        const body = document.body;
        const html = document.documentElement;
        
        if (show) {
            body.style.marginLeft = '280px';
            body.style.transition = 'margin-left 0.3s ease';
            html.style.transition = 'margin-left 0.3s ease';
        } else {
            body.style.marginLeft = '0';
        }
    }

    // Remover a sidebar
    function removeSidebar() {
        if (sidebarContainer) {
            sidebarContainer.remove();
            sidebarContainer = null;
            adjustPageLayout(false);
            isVisible = false;
            
            // Limpar instância da aplicação
            if (sidebarApp) {
                if (sidebarApp.stopAmbientSound) {
                    sidebarApp.stopAmbientSound();
                }
                sidebarApp = null;
            }
        }
    }

    // Toggle da sidebar
    function toggleSidebar() {
        if (isVisible) {
            removeSidebar();
        } else {
            createSidebar();
        }
    }

    // Inicializar aplicação da sidebar (código adaptado do sidebar.js)
    function initializeSidebarApp() {
        sidebarApp = new SidebarApp();
    }

    // Classe da aplicação sidebar (simplificada para content script)
    class SidebarApp {
        constructor() {
            this.init();
        }

        init() {
            this.setupPomodoro();
            this.setupTodoSystem();
            this.setupModalListeners();
            this.setupAmbientControls();
            
            // Configurar listeners dos botões principais
            const addColumnBtn = document.getElementById('addColumnBtn');
            if (addColumnBtn) {
                addColumnBtn.addEventListener('click', () => this.openColumnModal());
            }
            
            // Criar uma lista inicial se não existir
            if (this.getColumns().length === 0) {
                this.createColumn('📋 Tarefas');
            }
            
            // Renderizar colunas existentes
            this.renderColumns();
        }

        setupPomodoro() {
            this.isRunning = false;
            this.isPaused = false;
            this.currentSession = 1;
            this.totalSessions = 4;
            this.timeRemaining = 25 * 60;
            this.isBreak = false;
            this.currentSound = null;
            this.audioContext = null;
            
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
            const ambientBtns = document.querySelectorAll('#productivity-sidebar .ambient-btn');
            ambientBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const soundType = btn.dataset.sound;
                    this.toggleAmbientSound(soundType, btn);
                });
            });
        }

        toggleAmbientControls() {
            if (!this.ambientControls) return;
            const isVisible = this.ambientControls.style.display !== 'none';
            this.ambientControls.style.display = isVisible ? 'none' : 'flex';
        }

        toggleAmbientSound(soundType, btnElement) {
            document.querySelectorAll('#productivity-sidebar .ambient-btn').forEach(btn => btn.classList.remove('active'));
            
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
            try {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                this.stopAmbientSound();
                this.currentSound = this.createProceduralSound(type);
            } catch (error) {
                console.log('Erro ao reproduzir som ambiente:', error);
            }
        }

        createProceduralSound(type) {
            const ctx = this.audioContext;
            let oscillator, gainNode, filter;
            
            switch(type) {
                case 'rain':
                    gainNode = ctx.createGain();
                    gainNode.gain.value = 0.2;
                    
                    const bufferSize = ctx.sampleRate;
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    
                    const source = ctx.createBufferSource();
                    source.buffer = buffer;
                    source.loop = true;
                    
                    filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.value = 800;
                    
                    source.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    source.start();
                    
                    return { source, gainNode, filter };
                    
                case 'ocean':
                    oscillator = ctx.createOscillator();
                    gainNode = ctx.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(0.5, ctx.currentTime);
                    gainNode.gain.value = 0.15;
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    oscillator.start();
                    
                    return { oscillator, gainNode };
                    
                default:
                    return null;
            }
        }

        stopAmbientSound() {
            if (this.currentSound) {
                try {
                    if (this.currentSound.source) this.currentSound.source.stop();
                    if (this.currentSound.oscillator) this.currentSound.oscillator.stop();
                } catch (e) {}
                this.currentSound = null;
            }
        }

        toggleTimer() {
            if (!this.isRunning) {
                this.startTimer();
            } else {
                this.pauseTimer();
            }
        }

        startTimer() {
            this.isRunning = true;
            this.isPaused = false;
            if (this.startPauseBtn) {
                this.startPauseBtn.textContent = '⏸ Pausar';
                this.startPauseBtn.classList.remove('primary');
            }
            
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
            if (this.startPauseBtn) {
                this.startPauseBtn.textContent = '▶ Continuar';
                this.startPauseBtn.classList.add('primary');
            }
            clearInterval(this.timer);
        }

        resetTimer() {
            this.isRunning = false;
            this.isPaused = false;
            this.currentSession = 1;
            this.isBreak = false;
            this.timeRemaining = 25 * 60;
            if (this.startPauseBtn) {
                this.startPauseBtn.textContent = '▶ Iniciar';
                this.startPauseBtn.classList.add('primary');
            }
            clearInterval(this.timer);
            this.updateDisplay();
        }

        completeSession() {
            clearInterval(this.timer);
            this.isRunning = false;
            
            if (this.isBreak) {
                this.isBreak = false;
                this.currentSession++;
                this.timeRemaining = 25 * 60;
            } else {
                this.isBreak = true;
                if (this.currentSession >= this.totalSessions) {
                    this.timeRemaining = 20 * 60;
                    this.currentSession = 1;
                } else {
                    this.timeRemaining = 5 * 60;
                }
            }
            
            if (this.startPauseBtn) {
                this.startPauseBtn.textContent = '▶ Iniciar';
                this.startPauseBtn.classList.add('primary');
            }
            this.updateDisplay();
        }

        updateDisplay() {
            if (!this.timerDisplay) return;
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timerPhase) {
                if (this.isBreak) {
                    if (this.timeRemaining === 20 * 60) {
                        this.timerPhase.textContent = 'Pausa Longa - Eleve sua energia! ⚡';
                    } else {
                        this.timerPhase.textContent = 'Pausa Curta - Respire fundo 🌸';
                    }
                } else {
                    this.timerPhase.textContent = `Foco - Sessão ${this.currentSession} de ${this.totalSessions}`;
                }
            }
        }

        setupTodoSystem() {
            this.currentColumnId = null;
            this.currentTaskId = null;
            this.isEditingColumn = false;
            this.isEditingTask = false;
        }

        setupModalListeners() {
            // Modal de tarefas
            const taskModal = document.getElementById('taskModal');
            if (taskModal) {
                const taskCloseBtn = taskModal.querySelector('.close');
                const saveTaskBtn = document.getElementById('saveTaskBtn');
                const cancelTaskBtn = document.getElementById('cancelTaskBtn');
                const taskInput = document.getElementById('taskInput');
                
                if (taskCloseBtn) taskCloseBtn.addEventListener('click', () => this.closeTaskModal());
                if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
                if (saveTaskBtn) saveTaskBtn.addEventListener('click', () => this.saveTask());
                
                if (taskInput) {
                    taskInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') this.saveTask();
                        if (e.key === 'Escape') this.closeTaskModal();
                    });
                }
            }
            
            // Modal de colunas
            const columnModal = document.getElementById('columnModal');
            if (columnModal) {
                const columnCloseBtn = columnModal.querySelector('.close');
                const saveColumnBtn = document.getElementById('saveColumnBtn');
                const cancelColumnBtn = document.getElementById('cancelColumnBtn');
                const columnInput = document.getElementById('columnInput');
                
                if (columnCloseBtn) columnCloseBtn.addEventListener('click', () => this.closeColumnModal());
                if (cancelColumnBtn) cancelColumnBtn.addEventListener('click', () => this.closeColumnModal());
                if (saveColumnBtn) saveColumnBtn.addEventListener('click', () => this.saveColumn());
                
                if (columnInput) {
                    columnInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') this.saveColumn();
                        if (e.key === 'Escape') this.closeColumnModal();
                    });
                }
            }
        }

        getColumns() {
            try {
                return JSON.parse(localStorage.getItem('todoColumns') || '[]');
            } catch {
                return [];
            }
        }

        saveColumns(columns) {
            localStorage.setItem('todoColumns', JSON.stringify(columns));
        }

        createColumn(name) {
            const columns = this.getColumns();
            const newColumn = {
                id: Date.now().toString(),
                name: name,
                tasks: []
            };
            columns.push(newColumn);
            this.saveColumns(columns);
            return newColumn;
        }

        renderColumns() {
            const container = document.getElementById('columnsContainer');
            if (!container) return;
            
            const columns = this.getColumns();
            
            if (columns.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhuma lista criada ainda. Clique em "Nova Lista" para começar.</div>';
                return;
            }
            
            container.innerHTML = columns.map(column => `
                <div class="column" data-column-id="${column.id}">
                    <div class="column-header">
                        <div class="column-title">${column.name}</div>
                        <div class="column-actions">
                            <button class="column-btn add-task-btn" data-column-id="${column.id}">+ Tarefa</button>
                            <button class="column-btn edit-column-btn" data-column-id="${column.id}">✏️</button>
                            <button class="column-btn danger delete-column-btn" data-column-id="${column.id}">🗑️</button>
                        </div>
                    </div>
                    <div class="tasks-list" id="tasks-${column.id}">
                        ${this.renderTasks(column.tasks, column.id)}
                    </div>
                </div>
            `).join('');
            
            // Configurar eventos dos botões
            this.setupColumnEvents();
        }

        setupColumnEvents() {
            // Botões de adicionar tarefa
            document.querySelectorAll('#productivity-sidebar .add-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    this.addTask(columnId);
                });
            });
            
            // Botões de editar coluna
            document.querySelectorAll('#productivity-sidebar .edit-column-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    this.editColumn(columnId);
                });
            });
            
            // Botões de deletar coluna
            document.querySelectorAll('#productivity-sidebar .delete-column-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    this.deleteColumn(columnId);
                });
            });
            
            // Botões de editar tarefa
            document.querySelectorAll('#productivity-sidebar .edit-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const columnId = e.target.dataset.columnId;
                    const taskId = e.target.dataset.taskId;
                    this.editTask(columnId, taskId);
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

        renderTasks(tasks, columnId) {
            if (tasks.length === 0) {
                return '<div class="empty-state">Nenhuma tarefa ainda</div>';
            }
            
            return tasks.map(task => `
                <div class="task-item" data-task-id="${task.id}" data-column-id="${columnId}">
                    <div class="task-content">
                        <div class="task-text">${task.text}</div>
                        <div class="task-actions">
                            <button class="task-btn edit-task-btn" data-column-id="${columnId}" data-task-id="${task.id}">✏️</button>
                            <button class="task-btn danger delete-task-btn" data-column-id="${columnId}" data-task-id="${task.id}">🗑️</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        addTask(columnId) {
            this.currentColumnId = columnId;
            this.isEditingTask = false;
            this.openTaskModal();
        }

        editTask(columnId, taskId) {
            this.currentColumnId = columnId;
            this.currentTaskId = taskId;
            this.isEditingTask = true;
            
            const columns = this.getColumns();
            const column = columns.find(c => c.id === columnId);
            const task = column.tasks.find(t => t.id === taskId);
            
            const taskInput = document.getElementById('taskInput');
            const modalTitle = document.getElementById('modalTitle');
            if (taskInput) taskInput.value = task.text;
            if (modalTitle) modalTitle.textContent = 'Editar Tarefa';
            this.openTaskModal();
        }

        deleteTask(columnId, taskId) {
            if (!confirm('Excluir esta tarefa?')) return;
            
            const columns = this.getColumns();
            const column = columns.find(c => c.id === columnId);
            column.tasks = column.tasks.filter(t => t.id !== taskId);
            
            this.saveColumns(columns);
            this.renderColumns();
        }

        editColumn(columnId) {
            this.currentColumnId = columnId;
            this.isEditingColumn = true;
            
            const columns = this.getColumns();
            const column = columns.find(c => c.id === columnId);
            
            const columnInput = document.getElementById('columnInput');
            const columnModalTitle = document.getElementById('columnModalTitle');
            if (columnInput) columnInput.value = column.name;
            if (columnModalTitle) columnModalTitle.textContent = 'Editar Lista';
            this.openColumnModal();
        }

        deleteColumn(columnId) {
            if (!confirm('Excluir esta lista e todas as suas tarefas?')) return;
            
            const columns = this.getColumns();
            const updatedColumns = columns.filter(c => c.id !== columnId);
            
            this.saveColumns(updatedColumns);
            this.renderColumns();
        }

        openTaskModal() {
            const modal = document.getElementById('taskModal');
            if (modal) {
                modal.style.display = 'block';
                const taskInput = document.getElementById('taskInput');
                if (taskInput) taskInput.focus();
            }
        }

        closeTaskModal() {
            const modal = document.getElementById('taskModal');
            if (modal) modal.style.display = 'none';
            const taskInput = document.getElementById('taskInput');
            if (taskInput) taskInput.value = '';
            this.currentTaskId = null;
        }

        saveTask() {
            const taskInput = document.getElementById('taskInput');
            if (!taskInput) return;
            
            const text = taskInput.value.trim();
            if (!text) return;
            
            const columns = this.getColumns();
            const column = columns.find(c => c.id === this.currentColumnId);
            
            if (this.isEditingTask) {
                const task = column.tasks.find(t => t.id === this.currentTaskId);
                task.text = text;
            } else {
                const newTask = {
                    id: Date.now().toString(),
                    text: text,
                    completed: false
                };
                column.tasks.push(newTask);
            }
            
            this.saveColumns(columns);
            this.renderColumns();
            this.closeTaskModal();
        }

        openColumnModal() {
            const modal = document.getElementById('columnModal');
            if (modal) {
                modal.style.display = 'block';
                const columnInput = document.getElementById('columnInput');
                if (columnInput) columnInput.focus();
            }
        }

        closeColumnModal() {
            const modal = document.getElementById('columnModal');
            if (modal) modal.style.display = 'none';
            const columnInput = document.getElementById('columnInput');
            if (columnInput) columnInput.value = '';
            this.currentColumnId = null;
            this.isEditingColumn = false;
        }

        saveColumn() {
            const columnInput = document.getElementById('columnInput');
            if (!columnInput) return;
            
            const name = columnInput.value.trim();
            if (!name) return;
            
            if (this.isEditingColumn) {
                const columns = this.getColumns();
                const column = columns.find(c => c.id === this.currentColumnId);
                column.name = name;
                this.saveColumns(columns);
            } else {
                this.createColumn(name);
            }
            
            this.renderColumns();
            this.closeColumnModal();
        }
    }

    // Verificar se deve mostrar sidebar automaticamente
    chrome.storage.local.get(['sidebarVisible'], function(result) {
        if (result.sidebarVisible !== false) {
            createSidebar();
        }
    });

    // Listener para mensagens do background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "toggleSidebar") {
            toggleSidebar();
            // Salvar estado
            chrome.storage.local.set({sidebarVisible: isVisible});
        }
        sendResponse({visible: isVisible});
    });

})();