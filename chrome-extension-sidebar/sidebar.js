// Sidebar To-Do + Pomodoro - Versão Preto e Branco Otimizada
class SidebarApp {
    constructor() {
        this.init();
    }

    init() {
        // Sistema Pomodoro
        this.setupPomodoro();
        
        // Sistema Todo
        this.setupTodoSystem();
        
        // Setup dos modais
        this.setupModalListeners();
        
        // Controles de som ambiente
        this.setupAmbientControls();
        
        // Configurar listeners dos botões principais
        document.getElementById('addColumnBtn').addEventListener('click', () => this.openColumnModal());
        
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
        this.timeRemaining = 25 * 60; // 25 minutos em segundos
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
        
        // Event listeners
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.soundBtn.addEventListener('click', () => this.toggleAmbientControls());
        
        this.updateDisplay();
    }

    setupAmbientControls() {
        const ambientBtns = document.querySelectorAll('.ambient-btn');
        ambientBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const soundType = btn.dataset.sound;
                this.toggleAmbientSound(soundType, btn);
            });
        });
    }

    toggleAmbientControls() {
        const isVisible = this.ambientControls.style.display !== 'none';
        this.ambientControls.style.display = isVisible ? 'none' : 'flex';
    }

    toggleAmbientSound(soundType, btnElement) {
        // Remove active de todos os botões
        document.querySelectorAll('.ambient-btn').forEach(btn => btn.classList.remove('active'));
        
        // Para o som atual se houver
        if (this.currentSound) {
            this.stopAmbientSound();
        }
        
        // Se é o mesmo som, apenas para
        if (this.currentSoundType === soundType) {
            this.currentSoundType = null;
            return;
        }
        
        // Ativa novo som
        btnElement.classList.add('active');
        this.currentSoundType = soundType;
        this.playAmbientSound(soundType);
    }

    async playAmbientSound(type) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Para o som anterior
            this.stopAmbientSound();
            
            // Cria novo som baseado no tipo
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
                // Som de chuva usando ruído branco filtrado
                gainNode = ctx.createGain();
                gainNode.gain.value = 0.3;
                
                const bufferSize = ctx.sampleRate * 2;
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
                filter.frequency.value = 1000;
                
                source.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(ctx.destination);
                source.start();
                
                return { source, gainNode, filter };
                
            case 'ocean':
                // Som de oceano
                oscillator = ctx.createOscillator();
                gainNode = ctx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.value = 0.2;
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.start();
                
                return { oscillator, gainNode };
                
            case 'forest':
                // Som de floresta (pássaros + vento)
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                gainNode = ctx.createGain();
                
                osc1.type = 'triangle';
                osc1.frequency.value = 200;
                osc2.type = 'sine';
                osc2.frequency.value = 100;
                
                gainNode.gain.value = 0.15;
                
                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc1.start();
                osc2.start();
                
                return { oscillator: osc1, oscillator2: osc2, gainNode };
                
            case 'cafe':
                // Som de café (murmúrio + ruído suave)
                gainNode = ctx.createGain();
                gainNode.gain.value = 0.25;
                
                const bufferSize2 = ctx.sampleRate;
                const buffer2 = ctx.createBuffer(1, bufferSize2, ctx.sampleRate);
                const data2 = buffer2.getChannelData(0);
                
                for (let i = 0; i < bufferSize2; i++) {
                    data2[i] = (Math.random() * 2 - 1) * 0.5;
                }
                
                const source2 = ctx.createBufferSource();
                source2.buffer = buffer2;
                source2.loop = true;
                
                source2.connect(gainNode);
                gainNode.connect(ctx.destination);
                source2.start();
                
                return { source: source2, gainNode };
                
            case 'white':
                // Ruído branco
                gainNode = ctx.createGain();
                gainNode.gain.value = 0.1;
                
                const bufferSize3 = ctx.sampleRate * 2;
                const buffer3 = ctx.createBuffer(1, bufferSize3, ctx.sampleRate);
                const data3 = buffer3.getChannelData(0);
                
                for (let i = 0; i < bufferSize3; i++) {
                    data3[i] = Math.random() * 2 - 1;
                }
                
                const source3 = ctx.createBufferSource();
                source3.buffer = buffer3;
                source3.loop = true;
                
                source3.connect(gainNode);
                gainNode.connect(ctx.destination);
                source3.start();
                
                return { source: source3, gainNode };
        }
    }

    stopAmbientSound() {
        if (this.currentSound) {
            try {
                if (this.currentSound.source) this.currentSound.source.stop();
                if (this.currentSound.oscillator) this.currentSound.oscillator.stop();
                if (this.currentSound.oscillator2) this.currentSound.oscillator2.stop();
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
        this.startPauseBtn.textContent = '⏸ Pausar';
        this.startPauseBtn.classList.remove('primary');
        
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
        this.startPauseBtn.classList.add('primary');
        clearInterval(this.timer);
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 1;
        this.isBreak = false;
        this.timeRemaining = 25 * 60;
        this.startPauseBtn.textContent = '▶ Iniciar';
        this.startPauseBtn.classList.add('primary');
        clearInterval(this.timer);
        this.updateDisplay();
    }

    completeSession() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Notificação do sistema
        if (Notification.permission === 'granted') {
            if (this.isBreak) {
                new Notification('Pausa terminada!', {
                    body: 'Hora de voltar ao foco! 💪',
                    icon: '/icon48.png'
                });
            } else {
                new Notification('Sessão completa!', {
                    body: 'Hora da pausa! 🎉',
                    icon: '/icon48.png'
                });
            }
        }
        
        if (this.isBreak) {
            // Volta para sessão de trabalho
            this.isBreak = false;
            this.currentSession++;
            this.timeRemaining = 25 * 60;
        } else {
            // Vai para pausa
            this.isBreak = true;
            
            if (this.currentSession >= this.totalSessions) {
                // Pausa longa após 4 sessões
                this.timeRemaining = 20 * 60; // 20 minutos
                this.currentSession = 1;
            } else {
                // Pausa curta
                this.timeRemaining = 5 * 60; // 5 minutos
            }
        }
        
        this.startPauseBtn.textContent = '▶ Iniciar';
        this.startPauseBtn.classList.add('primary');
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
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

    setupTodoSystem() {
        this.currentColumnId = null;
        this.currentTaskId = null;
        this.isEditingColumn = false;
        this.isEditingTask = false;
        
        // Solicitar permissão para notificações
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    setupModalListeners() {
        // Modal de tarefas
        const taskModal = document.getElementById('taskModal');
        const taskCloseBtn = taskModal.querySelector('.close');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');
        const taskInput = document.getElementById('taskInput');
        
        taskCloseBtn.addEventListener('click', () => this.closeTaskModal());
        cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        saveTaskBtn.addEventListener('click', () => this.saveTask());
        
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTask();
            if (e.key === 'Escape') this.closeTaskModal();
        });
        
        // Modal de colunas
        const columnModal = document.getElementById('columnModal');
        const columnCloseBtn = columnModal.querySelector('.close');
        const saveColumnBtn = document.getElementById('saveColumnBtn');
        const cancelColumnBtn = document.getElementById('cancelColumnBtn');
        const columnInput = document.getElementById('columnInput');
        
        columnCloseBtn.addEventListener('click', () => this.closeColumnModal());
        cancelColumnBtn.addEventListener('click', () => this.closeColumnModal());
        saveColumnBtn.addEventListener('click', () => this.saveColumn());
        
        columnInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveColumn();
            if (e.key === 'Escape') this.closeColumnModal();
        });
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) this.closeTaskModal();
            if (e.target === columnModal) this.closeColumnModal();
        });
    }

    // Gerenciamento de dados
    getColumns() {
        return JSON.parse(localStorage.getItem('todoColumns') || '[]');
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

    // Renderização
    renderColumns() {
        const container = document.getElementById('columnsContainer');
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
                        <button class="column-btn" onclick="app.addTask('${column.id}')">+ Tarefa</button>
                        <button class="column-btn" onclick="app.editColumn('${column.id}')">✏️</button>
                        <button class="column-btn danger" onclick="app.deleteColumn('${column.id}')">🗑️</button>
                    </div>
                </div>
                <div class="tasks-list" id="tasks-${column.id}">
                    ${this.renderTasks(column.tasks, column.id)}
                </div>
            </div>
        `).join('');
        
        this.setupDragAndDrop();
    }

    renderTasks(tasks, columnId) {
        if (tasks.length === 0) {
            return '<div class="empty-state">Nenhuma tarefa ainda</div>';
        }
        
        return tasks.map(task => `
            <div class="task-item" draggable="true" data-task-id="${task.id}" data-column-id="${columnId}">
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-actions">
                        <button class="task-btn" onclick="app.editTask('${columnId}', '${task.id}')">✏️</button>
                        <button class="task-btn danger" onclick="app.deleteTask('${columnId}', '${task.id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        const taskLists = document.querySelectorAll('.tasks-list');
        
        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', '');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });
            
            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });
            
            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                
                const draggedItem = document.querySelector('.dragging');
                if (!draggedItem) return;
                
                const sourceColumnId = draggedItem.dataset.columnId;
                const targetColumnId = list.id.replace('tasks-', '');
                const taskId = draggedItem.dataset.taskId;
                
                if (sourceColumnId !== targetColumnId) {
                    this.moveTask(taskId, sourceColumnId, targetColumnId);
                }
            });
        });
    }

    // Ações de tarefas
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
        
        document.getElementById('taskInput').value = task.text;
        document.getElementById('modalTitle').textContent = 'Editar Tarefa';
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

    moveTask(taskId, sourceColumnId, targetColumnId) {
        const columns = this.getColumns();
        const sourceColumn = columns.find(c => c.id === sourceColumnId);
        const targetColumn = columns.find(c => c.id === targetColumnId);
        
        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        const task = sourceColumn.tasks.splice(taskIndex, 1)[0];
        
        targetColumn.tasks.push(task);
        
        this.saveColumns(columns);
        this.renderColumns();
    }

    // Ações de colunas
    editColumn(columnId) {
        this.currentColumnId = columnId;
        this.isEditingColumn = true;
        
        const columns = this.getColumns();
        const column = columns.find(c => c.id === columnId);
        
        document.getElementById('columnInput').value = column.name;
        document.getElementById('columnModalTitle').textContent = 'Editar Lista';
        this.openColumnModal();
    }

    deleteColumn(columnId) {
        if (!confirm('Excluir esta lista e todas as suas tarefas?')) return;
        
        const columns = this.getColumns();
        const updatedColumns = columns.filter(c => c.id !== columnId);
        
        this.saveColumns(updatedColumns);
        this.renderColumns();
    }

    // Modais
    openTaskModal() {
        document.getElementById('taskModal').style.display = 'block';
        document.getElementById('taskInput').focus();
    }

    closeTaskModal() {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskInput').value = '';
        this.currentTaskId = null;
    }

    saveTask() {
        const text = document.getElementById('taskInput').value.trim();
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
        document.getElementById('columnModal').style.display = 'block';
        document.getElementById('columnInput').focus();
    }

    closeColumnModal() {
        document.getElementById('columnModal').style.display = 'none';
        document.getElementById('columnInput').value = '';
        this.currentColumnId = null;
        this.isEditingColumn = false;
    }

    saveColumn() {
        const name = document.getElementById('columnInput').value.trim();
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

// Função global para fechar a sidebar
function closeSidebar() {
    if (confirm('Deseja fechar a sidebar? Você pode reabri-la clicando no ícone da extensão.')) {
        window.close();
    }
}

// Inicializar aplicação
const app = new SidebarApp();

// Otimização de memória - limpeza periódica
setInterval(() => {
    if (window.gc && typeof window.gc === 'function') {
        window.gc();
    }
}, 300000); // A cada 5 minutos