// Sistema To-Do List - Sidebar Extension
class TodoManager {
    constructor() {
        this.columns = [];
        this.currentEditingTask = null;
        this.currentEditingColumn = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderBoard();
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