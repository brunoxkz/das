/**
 * Editor de Eventos Recorrentes - Interface JavaScript
 */

jQuery(document).ready(function($) {
    
    // Variáveis globais
    let currentEvent = null;
    let occurrences = [];
    
    // Inicializar editor
    function initRecurringEditor() {
        bindEvents();
        setupDatePickers();
        setupModals();
    }
    
    // Binding de eventos
    function bindEvents() {
        // Botão para abrir editor
        $(document).on('click', '.edit-recurring-event', function() {
            const eventId = $(this).data('event-id');
            openRecurringEditor(eventId);
        });
        
        // Adicionar nova ocorrência
        $(document).on('click', '#add-occurrence-btn', function() {
            showAddOccurrenceModal();
        });
        
        // Salvar nova ocorrência
        $(document).on('click', '#save-new-occurrence', function() {
            saveNewOccurrence();
        });
        
        // Editar ocorrência existente
        $(document).on('click', '.edit-occurrence', function() {
            const occurrenceId = $(this).data('occurrence-id');
            editOccurrence(occurrenceId);
        });
        
        // Excluir ocorrência
        $(document).on('click', '.delete-occurrence', function() {
            const occurrenceId = $(this).data('occurrence-id');
            if (confirm('Tem certeza que deseja excluir esta ocorrência?')) {
                deleteOccurrence(occurrenceId);
            }
        });
        
        // Salvar alterações no evento
        $(document).on('click', '#save-event-changes', function() {
            saveEventChanges();
        });
        
        // Gerar ocorrências automáticas
        $(document).on('click', '#generate-occurrences', function() {
            generateOccurrences();
        });
        
        // Fechar modais
        $(document).on('click', '.close-modal', function() {
            closeModals();
        });
    }
    
    // Abrir editor de evento recorrente
    function openRecurringEditor(eventId) {
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_get_recurring_event',
                event_id: eventId,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    currentEvent = response.data;
                    occurrences = response.data.occurrences;
                    buildEditorInterface();
                    showRecurringEditor();
                } else {
                    alert('Erro ao carregar evento: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                alert('Erro de conexão ao carregar evento');
            }
        });
    }
    
    // Construir interface do editor
    function buildEditorInterface() {
        const editorHtml = `
            <div id="recurring-event-editor" class="vendzz-modal">
                <div class="vendzz-modal-content">
                    <div class="vendzz-modal-header">
                        <h2>Editor de Evento Recorrente</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    
                    <div class="vendzz-modal-body">
                        <div class="vendzz-editor-tabs">
                            <button class="vendzz-tab-btn active" data-tab="info">Informações</button>
                            <button class="vendzz-tab-btn" data-tab="occurrences">Ocorrências (${occurrences.length})</button>
                            <button class="vendzz-tab-btn" data-tab="recurrence">Recorrência</button>
                        </div>
                        
                        <div class="vendzz-tab-content">
                            <!-- Aba Informações -->
                            <div id="info-tab" class="vendzz-tab-panel active">
                                ${buildInfoPanel()}
                            </div>
                            
                            <!-- Aba Ocorrências -->
                            <div id="occurrences-tab" class="vendzz-tab-panel">
                                ${buildOccurrencesPanel()}
                            </div>
                            
                            <!-- Aba Recorrência -->
                            <div id="recurrence-tab" class="vendzz-tab-panel">
                                ${buildRecurrencePanel()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="vendzz-modal-footer">
                        <button type="button" class="vendzz-btn vendzz-btn-primary" id="save-event-changes">
                            Salvar Alterações
                        </button>
                        <button type="button" class="vendzz-btn vendzz-btn-secondary close-modal">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        $('#recurring-event-editor').remove();
        $('body').append(editorHtml);
        
        // Binding para tabs
        $('.vendzz-tab-btn').on('click', function() {
            const tabId = $(this).data('tab');
            switchTab(tabId);
        });
    }
    
    // Construir painel de informações
    function buildInfoPanel() {
        return `
            <div class="vendzz-form-group">
                <label for="event-title">Título do Evento</label>
                <input type="text" id="event-title" value="${currentEvent.title}" class="vendzz-form-control">
            </div>
            
            <div class="vendzz-form-group">
                <label for="event-description">Descrição</label>
                <textarea id="event-description" rows="4" class="vendzz-form-control">${currentEvent.description}</textarea>
            </div>
            
            <div class="vendzz-form-row">
                <div class="vendzz-form-group">
                    <label for="event-status">Status</label>
                    <select id="event-status" class="vendzz-form-control">
                        <option value="publish" ${currentEvent.status === 'publish' ? 'selected' : ''}>Publicado</option>
                        <option value="draft" ${currentEvent.status === 'draft' ? 'selected' : ''}>Rascunho</option>
                        <option value="private" ${currentEvent.status === 'private' ? 'selected' : ''}>Privado</option>
                    </select>
                </div>
                
                <div class="vendzz-form-group">
                    <label for="event-venue">Local</label>
                    <select id="event-venue" class="vendzz-form-control">
                        <option value="">Selecione um local</option>
                        ${buildVenueOptions()}
                    </select>
                </div>
            </div>
            
            <div class="vendzz-form-row">
                <div class="vendzz-form-group">
                    <label for="event-start-date">Data/Hora Início</label>
                    <input type="datetime-local" id="event-start-date" value="${formatDateForInput(currentEvent.start_date)}" class="vendzz-form-control">
                </div>
                
                <div class="vendzz-form-group">
                    <label for="event-end-date">Data/Hora Fim</label>
                    <input type="datetime-local" id="event-end-date" value="${formatDateForInput(currentEvent.end_date)}" class="vendzz-form-control">
                </div>
            </div>
        `;
    }
    
    // Construir painel de ocorrências
    function buildOccurrencesPanel() {
        let html = `
            <div class="vendzz-occurrences-header">
                <h3>Gerenciar Ocorrências</h3>
                <button type="button" class="vendzz-btn vendzz-btn-primary" id="add-occurrence-btn">
                    + Nova Ocorrência
                </button>
            </div>
            
            <div class="vendzz-occurrences-list">
        `;
        
        if (occurrences.length === 0) {
            html += '<p class="vendzz-no-occurrences">Nenhuma ocorrência encontrada.</p>';
        } else {
            occurrences.forEach(function(occurrence) {
                html += `
                    <div class="vendzz-occurrence-item" data-occurrence-id="${occurrence.id}">
                        <div class="vendzz-occurrence-info">
                            <h4>${occurrence.title}</h4>
                            <p class="vendzz-occurrence-date">
                                <strong>Início:</strong> ${occurrence.formatted_start}<br>
                                <strong>Fim:</strong> ${occurrence.formatted_end}
                            </p>
                            <span class="vendzz-occurrence-status ${occurrence.status}">
                                ${occurrence.status}
                            </span>
                        </div>
                        
                        <div class="vendzz-occurrence-actions">
                            <button type="button" class="vendzz-btn vendzz-btn-small edit-occurrence" data-occurrence-id="${occurrence.id}">
                                Editar
                            </button>
                            ${!occurrence.is_parent ? `
                                <button type="button" class="vendzz-btn vendzz-btn-small vendzz-btn-danger delete-occurrence" data-occurrence-id="${occurrence.id}">
                                    Excluir
                                </button>
                            ` : '<span class="vendzz-parent-label">Evento Principal</span>'}
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        
        return html;
    }
    
    // Construir painel de recorrência
    function buildRecurrencePanel() {
        return `
            <div class="vendzz-form-group">
                <label for="recurrence-type">Tipo de Recorrência</label>
                <select id="recurrence-type" class="vendzz-form-control">
                    <option value="">Não repetir</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                </select>
            </div>
            
            <div class="vendzz-form-group">
                <label for="recurrence-end-date">Repetir até</label>
                <input type="date" id="recurrence-end-date" class="vendzz-form-control">
            </div>
            
            <div class="vendzz-form-group">
                <button type="button" class="vendzz-btn vendzz-btn-secondary" id="generate-occurrences">
                    Gerar Ocorrências Automáticas
                </button>
                <p class="vendzz-help-text">
                    Isso criará automaticamente as ocorrências baseadas na regra de recorrência selecionada.
                </p>
            </div>
        `;
    }
    
    // Mostrar modal de adicionar ocorrência
    function showAddOccurrenceModal() {
        const modalHtml = `
            <div id="add-occurrence-modal" class="vendzz-modal">
                <div class="vendzz-modal-content vendzz-modal-small">
                    <div class="vendzz-modal-header">
                        <h3>Nova Ocorrência</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    
                    <div class="vendzz-modal-body">
                        <div class="vendzz-form-group">
                            <label for="new-occurrence-title">Título</label>
                            <input type="text" id="new-occurrence-title" value="${currentEvent.title}" class="vendzz-form-control">
                        </div>
                        
                        <div class="vendzz-form-row">
                            <div class="vendzz-form-group">
                                <label for="new-occurrence-start">Data/Hora Início</label>
                                <input type="datetime-local" id="new-occurrence-start" class="vendzz-form-control">
                            </div>
                            
                            <div class="vendzz-form-group">
                                <label for="new-occurrence-end">Data/Hora Fim</label>
                                <input type="datetime-local" id="new-occurrence-end" class="vendzz-form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="vendzz-modal-footer">
                        <button type="button" class="vendzz-btn vendzz-btn-primary" id="save-new-occurrence">
                            Criar Ocorrência
                        </button>
                        <button type="button" class="vendzz-btn vendzz-btn-secondary close-modal">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        $('#add-occurrence-modal').remove();
        $('body').append(modalHtml);
        $('#add-occurrence-modal').show();
    }
    
    // Salvar nova ocorrência
    function saveNewOccurrence() {
        const title = $('#new-occurrence-title').val();
        const startDate = $('#new-occurrence-start').val();
        const endDate = $('#new-occurrence-end').val();
        
        if (!title || !startDate || !endDate) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_add_occurrence',
                parent_event_id: currentEvent.id,
                title: title,
                start_date: startDate,
                end_date: endDate,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    alert('Ocorrência criada com sucesso!');
                    closeModals();
                    openRecurringEditor(currentEvent.id); // Recarregar editor
                } else {
                    alert('Erro ao criar ocorrência: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                alert('Erro de conexão ao criar ocorrência');
            }
        });
    }
    
    // Excluir ocorrência
    function deleteOccurrence(occurrenceId) {
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_delete_occurrence',
                occurrence_id: occurrenceId,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    alert('Ocorrência excluída com sucesso!');
                    openRecurringEditor(currentEvent.id); // Recarregar editor
                } else {
                    alert('Erro ao excluir ocorrência: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                alert('Erro de conexão ao excluir ocorrência');
            }
        });
    }
    
    // Salvar alterações no evento
    function saveEventChanges() {
        const data = {
            title: $('#event-title').val(),
            description: $('#event-description').val(),
            status: $('#event-status').val(),
            venue_id: $('#event-venue').val(),
            start_date: $('#event-start-date').val(),
            end_date: $('#event-end-date').val(),
            recurrence: $('#recurrence-type').val()
        };
        
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_update_recurring_event',
                event_id: currentEvent.id,
                event_data: JSON.stringify(data),
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    alert('Evento atualizado com sucesso!');
                    closeModals();
                    location.reload(); // Recarregar página principal
                } else {
                    alert('Erro ao atualizar evento: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                alert('Erro de conexão ao atualizar evento');
            }
        });
    }
    
    // Gerar ocorrências automáticas
    function generateOccurrences() {
        const recurrenceType = $('#recurrence-type').val();
        const endDate = $('#recurrence-end-date').val();
        
        if (!recurrenceType) {
            alert('Selecione um tipo de recorrência');
            return;
        }
        
        if (!endDate) {
            alert('Defina uma data limite para a recorrência');
            return;
        }
        
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_generate_occurrences',
                event_id: currentEvent.id,
                recurrence_rule: recurrenceType,
                end_date: endDate,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    alert(`${response.data.count} ocorrências geradas com sucesso!`);
                    openRecurringEditor(currentEvent.id); // Recarregar editor
                } else {
                    alert('Erro ao gerar ocorrências: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                alert('Erro de conexão ao gerar ocorrências');
            }
        });
    }
    
    // Funções auxiliares
    function switchTab(tabId) {
        $('.vendzz-tab-btn').removeClass('active');
        $('.vendzz-tab-panel').removeClass('active');
        
        $(`[data-tab="${tabId}"]`).addClass('active');
        $(`#${tabId}-tab`).addClass('active');
    }
    
    function showRecurringEditor() {
        $('#recurring-event-editor').show();
    }
    
    function closeModals() {
        $('.vendzz-modal').hide();
    }
    
    function showLoading() {
        // Implementar loading
    }
    
    function hideLoading() {
        // Implementar hide loading
    }
    
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    function buildVenueOptions() {
        // Implementar carregamento de venues
        return '<option value="">Carregando...</option>';
    }
    
    function setupDatePickers() {
        // Configurar date pickers se necessário
    }
    
    function setupModals() {
        // Configurar comportamento dos modais
        $(document).on('click', '.close-modal', function() {
            closeModals();
        });
        
        $(document).on('click', '.vendzz-modal', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    }
    
    // Expor objeto global para uso externo
    window.VendzzRecurringEditor = {
        init: initRecurringEditor,
        openEditor: openRecurringEditor,
        closeEditor: closeModals
    };
    
    // Inicializar
    initRecurringEditor();
});