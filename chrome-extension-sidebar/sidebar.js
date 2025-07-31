// Sistema To-Do List + Pomodoro - Sidebar Extension
class TodoManager {
    constructor() {
        this.columns = [];
        this.currentEditingTask = null;
        this.currentEditingColumn = null;
        
        // Sistema Pomodoro Ultra-Otimizado
        this.pomodoro = {
            isRunning: false,
            currentPhase: 'focus', // focus, shortBreak, longBreak
            timeRemaining: 25 * 60, // 25 minutos em segundos
            currentCycle: 1,
            maxCycles: 4,
            timer: null,
            audio: null,
            currentSound: ''
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupPomodoroListeners();
        this.renderBoard();
        this.updatePomodoroDisplay();
    }

    // Carregar dados do storage
    async loadData() {
        try {
            const result = await chrome.storage.local.get(['todoColumns']);
            this.columns = result.todoColumns || this.getDefaultColumns();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.columns = this.getDefaultColumns();
        }
    }

    // Colunas padrão
    getDefaultColumns() {
        return [
            {
                id: 'todo',
                title: 'A Fazer',
                tasks: []
            },
            {
                id: 'doing',
                title: 'Fazendo',
                tasks: []
            },
            {
                id: 'done',
                title: 'Concluído',
                tasks: []
            }
        ];
    }

    // Salvar dados no storage
    async saveData() {
        try {
            await chrome.storage.local.set({ todoColumns: this.columns });
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Adicionar nova coluna
        document.getElementById('addColumnBtn').addEventListener('click', () => {
            this.openColumnModal();
        });

        // Modais
        this.setupModalListeners();
    }

    // Sistema Pomodoro Ultra-Otimizado (Consumo de RAM Mínimo)
    setupPomodoroListeners() {
        // Botão Start/Pause
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.togglePomodoro();
        });

        // Botão Reset
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetPomodoro();
        });

        // Botão Som
        document.getElementById('soundBtn').addEventListener('click', () => {
            this.toggleSoundSelector();
        });

        // Seletor de som ambiente
        document.getElementById('ambientSound').addEventListener('change', (e) => {
            this.changeAmbientSound(e.target.value);
        });
    }

    // Toggle Pomodoro
    togglePomodoro() {
        if (this.pomodoro.isRunning) {
            this.pausePomodoro();
        } else {
            this.startPomodoro();
        }
    }

    // Iniciar Pomodoro
    startPomodoro() {
        this.pomodoro.isRunning = true;
        document.getElementById('startPauseBtn').innerHTML = '⏸️';
        
        // Timer ultra-eficiente (atualiza apenas uma vez por segundo)
        this.pomodoro.timer = setInterval(() => {
            this.pomodoro.timeRemaining--;
            
            if (this.pomodoro.timeRemaining <= 0) {
                this.pomodoroFinished();
            } else {
                this.updatePomodoroDisplay();
            }
        }, 1000);
        
        this.updatePomodoroDisplay();
    }

    // Pausar Pomodoro
    pausePomodoro() {
        this.pomodoro.isRunning = false;
        document.getElementById('startPauseBtn').innerHTML = '▶️';
        
        if (this.pomodoro.timer) {
            clearInterval(this.pomodoro.timer);
            this.pomodoro.timer = null;
        }
    }

    // Reset Pomodoro
    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoro.currentPhase = 'focus';
        this.pomodoro.timeRemaining = 25 * 60;
        this.pomodoro.currentCycle = 1;
        this.updatePomodoroDisplay();
        this.updateProgressDots();
    }

    // Pomodoro Finalizado
    pomodoroFinished() {
        this.pausePomodoro();
        
        // Determinar próxima fase
        if (this.pomodoro.currentPhase === 'focus') {
            if (this.pomodoro.currentCycle >= this.pomodoro.maxCycles) {
                // Pausa longa (20 min)
                this.pomodoro.currentPhase = 'longBreak';
                this.pomodoro.timeRemaining = 20 * 60;
                this.pomodoro.currentCycle = 1;
                this.showEnergyMessage();
            } else {
                // Pausa curta (5 min)
                this.pomodoro.currentPhase = 'shortBreak';
                this.pomodoro.timeRemaining = 5 * 60;
            }
        } else {
            // Voltar ao foco
            this.pomodoro.currentPhase = 'focus';
            this.pomodoro.timeRemaining = 25 * 60;
            if (this.pomodoro.currentCycle < this.pomodoro.maxCycles) {
                this.pomodoro.currentCycle++;
            }
        }
        
        this.updatePomodoroDisplay();
        this.updateProgressDots();
        
        // Notificação simples (sem consumir RAM)
        this.showNotification();
    }

    // Mostrar mensagem de energia (pausa longa)
    showEnergyMessage() {
        const message = document.createElement('div');
        message.className = 'energy-message';
        message.innerHTML = '⚡ ELEVE SUA ENERGIA! ⚡<br><small>Pausa longa - 20 minutos</small>';
        document.body.appendChild(message);
        
        // Remover após 4 segundos
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 4000);
    }

    // Notificação simples
    showNotification() {
        const phases = {
            focus: 'Tempo de foco!',
            shortBreak: 'Pausa curta - 5 min',
            longBreak: 'Pausa longa - 20 min'
        };
        
        // Usar notificação do navegador se permitida
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: phases[this.pomodoro.currentPhase]
            });
        }
    }

    // Atualizar display do Pomodoro
    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoro.timeRemaining / 60);
        const seconds = this.pomodoro.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = timeString;
        
        const phases = {
            focus: 'Foco',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };
        
        document.getElementById('timerPhase').textContent = phases[this.pomodoro.currentPhase];
        this.updateProgressDots();
    }

    // Atualizar dots de progresso
    updateProgressDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.className = 'dot';
            if (index < this.pomodoro.currentCycle - 1) {
                dot.classList.add('completed');
            } else if (index === this.pomodoro.currentCycle - 1 && this.pomodoro.currentPhase === 'focus') {
                dot.classList.add('current');
            }
        });
    }

    // Toggle seletor de som
    toggleSoundSelector() {
        const selector = document.getElementById('soundSelector');
        const isVisible = selector.style.display !== 'none';
        selector.style.display = isVisible ? 'none' : 'block';
        
        const btn = document.getElementById('soundBtn');
        btn.classList.toggle('active', !isVisible);
    }

    // Sons ambientais ultra-otimizados (geração procedural - zero RAM)
    changeAmbientSound(soundType) {
        // Parar som atual
        if (this.pomodoro.audio && this.pomodoro.audio.stop) {
            this.pomodoro.audio.stop();
            this.pomodoro.audio = null;
        }
        
        if (!soundType) {
            this.pomodoro.currentSound = '';
            return;
        }
        
        this.pomodoro.currentSound = soundType;
        this.playAmbientSound(soundType);
    }

    // Reproduzir sons ambientais (geração por Web Audio API - ultra eficiente)
    playAmbientSound(type) {
        // Usar Web Audio API para gerar sons sem arquivos (economiza RAM)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const sounds = {
                rain: () => this.generateRainSound(audioContext),
                ocean: () => this.generateOceanSound(audioContext),
                forest: () => this.generateForestSound(audioContext),
                cafe: () => this.generateCafeSound(audioContext),
                white: () => this.generateWhiteNoise(audioContext)
            };
            
            if (sounds[type]) {
                sounds[type]();
            }
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    // Geração procedural de som de chuva (ultra-leve)
    generateRainSound(ctx) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        source.buffer = buffer;
        source.loop = true;
        source.connect(filter);
        filter.connect(ctx.destination);
        source.start();
        
        this.pomodoro.audio = { stop: () => source.stop() };
    }

    // Geração procedural de oceano
    generateOceanSound(ctx) {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const wave1 = Math.sin(i * 0.001) * 0.3;
            const wave2 = Math.sin(i * 0.0015) * 0.2;
            const noise = (Math.random() * 2 - 1) * 0.05;
            data[i] = wave1 + wave2 + noise;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.start();
        
        this.pomodoro.audio = { stop: () => source.stop() };
    }

    // Ruído branco ultra-eficiente
    generateWhiteNoise(ctx) {
        const bufferSize = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.start();
        
        this.pomodoro.audio = { stop: () => source.stop() };
    }

    // Sons de floresta e café (placeholder - mesma técnica)
    generateForestSound(ctx) { this.generateRainSound(ctx); }
    generateCafeSound(ctx) { this.generateWhiteNoise(ctx); }

    // Configurar listeners dos modais
    setupModalListeners() {
        // Modal de tarefa
        const taskModal = document.getElementById('taskModal');
        const taskClose = taskModal.querySelector('.close');
        const taskInput = document.getElementById('taskInput');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');

        taskClose.addEventListener('click', () => this.closeTaskModal());
        cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        saveTaskBtn.addEventListener('click', () => this.saveTask());

        // Enter para salvar tarefa
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveTask();
            }
        });

        // Modal de coluna
        const columnModal = document.getElementById('columnModal');
        const columnClose = columnModal.querySelector('.close');
        const columnInput = document.getElementById('columnInput');
        const saveColumnBtn = document.getElementById('saveColumnBtn');
        const cancelColumnBtn = document.getElementById('cancelColumnBtn');

        columnClose.addEventListener('click', () => this.closeColumnModal());
        cancelColumnBtn.addEventListener('click', () => this.closeColumnModal());
        saveColumnBtn.addEventListener('click', () => this.saveColumn());

        // Enter para salvar coluna
        columnInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveColumn();
            }
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                this.closeTaskModal();
            }
            if (e.target === columnModal) {
                this.closeColumnModal();
            }
        });
    }

    // Renderizar o board
    renderBoard() {
        const board = document.getElementById('todoBoard');
        board.innerHTML = '';

        if (this.columns.length === 0) {
            board.innerHTML = '<div class="empty-state">Nenhuma coluna encontrada. Clique em "Nova Coluna" para começar.</div>';
            return;
        }

        this.columns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            board.appendChild(columnElement);
        });
    }

    // Criar elemento de coluna
    createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.columnId = column.id;

        const tasksHtml = column.tasks.map(task => 
            `<div class="task-item" data-task-id="${task.id}">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-actions">
                    <button class="task-btn edit-task-btn" title="Editar">✏️</button>
                    <button class="task-btn delete-task-btn" title="Excluir">🗑️</button>
                </div>
            </div>`
        ).join('');

        columnDiv.innerHTML = `
            <div class="column-header">
                <div class="column-title" contenteditable="false">${this.escapeHtml(column.title)}</div>
                <div class="column-actions">
                    <button class="column-btn edit-column-btn" title="Editar coluna">✏️</button>
                    <button class="column-btn delete-column-btn" title="Excluir coluna">🗑️</button>
                </div>
            </div>
            <div class="task-list">
                ${tasksHtml}
                <button class="add-task-btn">+ Adicionar tarefa</button>
            </div>
        `;

        this.setupColumnListeners(columnDiv);
        return columnDiv;
    }

    // Configurar listeners da coluna
    setupColumnListeners(columnDiv) {
        const columnId = columnDiv.dataset.columnId;
        
        // Adicionar tarefa
        const addTaskBtn = columnDiv.querySelector('.add-task-btn');
        addTaskBtn.addEventListener('click', () => {
            this.openTaskModal(columnId);
        });

        // Editar coluna
        const editColumnBtn = columnDiv.querySelector('.edit-column-btn');
        editColumnBtn.addEventListener('click', () => {
            this.openColumnModal(columnId);
        });

        // Excluir coluna
        const deleteColumnBtn = columnDiv.querySelector('.delete-column-btn');
        deleteColumnBtn.addEventListener('click', () => {
            this.deleteColumn(columnId);
        });

        // Listeners das tarefas
        const taskItems = columnDiv.querySelectorAll('.task-item');
        taskItems.forEach(taskItem => {
            const taskId = taskItem.dataset.taskId;
            
            // Editar tarefa
            const editBtn = taskItem.querySelector('.edit-task-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openTaskModal(columnId, taskId);
            });

            // Excluir tarefa
            const deleteBtn = taskItem.querySelector('.delete-task-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(columnId, taskId);
            });
        });
    }

    // Abrir modal de tarefa
    openTaskModal(columnId, taskId = null) {
        const modal = document.getElementById('taskModal');
        const input = document.getElementById('taskInput');
        const title = document.getElementById('modalTitle');

        this.currentEditingTask = { columnId, taskId };

        if (taskId) {
            const task = this.getTask(columnId, taskId);
            title.textContent = 'Editar Tarefa';
            input.value = task ? task.text : '';
        } else {
            title.textContent = 'Adicionar Tarefa';
            input.value = '';
        }

        modal.style.display = 'block';
        input.focus();
    }

    // Fechar modal de tarefa
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.style.display = 'none';
        this.currentEditingTask = null;
    }

    // Salvar tarefa
    async saveTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (!text) {
            input.focus();
            return;
        }

        const { columnId, taskId } = this.currentEditingTask;

        if (taskId) {
            // Editar tarefa existente
            this.updateTask(columnId, taskId, text);
        } else {
            // Adicionar nova tarefa
            this.addTask(columnId, text);
        }

        await this.saveData();
        this.renderBoard();
        this.closeTaskModal();
    }

    // Abrir modal de coluna
    openColumnModal(columnId = null) {
        const modal = document.getElementById('columnModal');
        const input = document.getElementById('columnInput');
        const title = document.getElementById('columnModalTitle');

        this.currentEditingColumn = columnId;

        if (columnId) {
            const column = this.getColumn(columnId);
            title.textContent = 'Editar Coluna';
            input.value = column ? column.title : '';
        } else {
            title.textContent = 'Adicionar Coluna';
            input.value = '';
        }

        modal.style.display = 'block';
        input.focus();
    }

    // Fechar modal de coluna
    closeColumnModal() {
        const modal = document.getElementById('columnModal');
        modal.style.display = 'none';
        this.currentEditingColumn = null;
    }

    // Salvar coluna
    async saveColumn() {
        const input = document.getElementById('columnInput');
        const title = input.value.trim();

        if (!title) {
            input.focus();
            return;
        }

        if (this.currentEditingColumn) {
            // Editar coluna existente
            this.updateColumn(this.currentEditingColumn, title);
        } else {
            // Adicionar nova coluna
            const newColumn = {
                id: 'col_' + Date.now(),
                title: title,
                tasks: []
            };
            this.columns.push(newColumn);
        }

        await this.saveData();
        this.renderBoard();
        this.closeColumnModal();
    }

    // Adicionar tarefa
    addTask(columnId, text) {
        const column = this.getColumn(columnId);
        if (column) {
            const newTask = {
                id: 'task_' + Date.now(),
                text: text,
                createdAt: new Date().toISOString()
            };
            column.tasks.push(newTask);
        }
    }

    // Atualizar tarefa
    updateTask(columnId, taskId, text) {
        const column = this.getColumn(columnId);
        if (column) {
            const task = column.tasks.find(t => t.id === taskId);
            if (task) {
                task.text = text;
                task.updatedAt = new Date().toISOString();
            }
        }
    }

    // Excluir tarefa
    async deleteTask(columnId, taskId) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }

        const column = this.getColumn(columnId);
        if (column) {
            column.tasks = column.tasks.filter(t => t.id !== taskId);
            await this.saveData();
            this.renderBoard();
        }
    }

    // Atualizar coluna
    updateColumn(columnId, title) {
        const column = this.getColumn(columnId);
        if (column) {
            column.title = title;
        }
    }

    // Excluir coluna
    async deleteColumn(columnId) {
        const column = this.getColumn(columnId);
        const taskCount = column ? column.tasks.length : 0;
        
        let confirmMessage = 'Tem certeza que deseja excluir esta coluna?';
        if (taskCount > 0) {
            confirmMessage += `\n\nEla contém ${taskCount} tarefa(s) que serão perdidas.`;
        }

        if (!confirm(confirmMessage)) {
            return;
        }

        this.columns = this.columns.filter(c => c.id !== columnId);
        await this.saveData();
        this.renderBoard();
    }

    // Obter coluna por ID
    getColumn(columnId) {
        return this.columns.find(c => c.id === columnId);
    }

    // Obter tarefa por ID
    getTask(columnId, taskId) {
        const column = this.getColumn(columnId);
        return column ? column.tasks.find(t => t.id === taskId) : null;
    }

    // Escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new TodoManager();
});