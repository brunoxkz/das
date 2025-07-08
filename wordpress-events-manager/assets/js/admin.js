jQuery(document).ready(function($) {
    'use strict';
    
    let currentPage = 1;
    let isLoading = false;
    let totalPages = 1;
    
    // Inicializar página
    init();
    
    function init() {
        bindEvents();
        loadEvents();
        initModal();
    }
    
    function bindEvents() {
        // Filtros
        $('#search-events').on('input', debounce(loadEvents, 500));
        $('#filter-status, #filter-recurrence').on('change', loadEvents);
        $('#refresh-events').on('click', loadEvents);
        
        // Botões de ação
        $(document).on('click', '.edit-event', handleEditEvent);
        $(document).on('click', '.republish-event', handleRepublishEvent);
        
        // Paginação
        $(document).on('click', '.pagination button', handlePagination);
        
        // Formulário de edição
        $('#event-edit-form').on('submit', handleSaveEvent);
    }
    
    function initModal() {
        $('#event-edit-modal').dialog({
            autoOpen: false,
            width: 600,
            height: 500,
            modal: true,
            resizable: true,
            buttons: {
                'Salvar': function() {
                    $('#event-edit-form').submit();
                },
                'Cancelar': function() {
                    $(this).dialog('close');
                }
            }
        });
    }
    
    function loadEvents() {
        if (isLoading) return;
        
        isLoading = true;
        showLoadingSpinner();
        
        const data = {
            action: 'vendzz_get_events',
            nonce: vendzz_events_ajax.nonce,
            search: $('#search-events').val(),
            status: $('#filter-status').val(),
            recurrence: $('#filter-recurrence').val(),
            page: currentPage
        };
        
        $.post(vendzz_events_ajax.ajax_url, data)
            .done(function(response) {
                if (response.success) {
                    displayEvents(response.data);
                    updatePagination(response.data);
                } else {
                    showMessage(response.data || vendzz_events_ajax.strings.error, 'error');
                }
            })
            .fail(function(xhr, status, error) {
                console.error('AJAX Error:', error);
                showMessage(vendzz_events_ajax.strings.error, 'error');
            })
            .always(function() {
                isLoading = false;
                hideLoadingSpinner();
            });
    }
    
    function displayEvents(data) {
        const container = $('#events-container');
        
        if (!data.events || data.events.length === 0) {
            container.html(`
                <div class="no-events">
                    <h3>Nenhum evento encontrado</h3>
                    <p>Não há eventos que correspondam aos filtros selecionados.</p>
                </div>
            `);
            return;
        }
        
        let html = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Status</th>
                        <th>Data/Hora</th>
                        <th>Local</th>
                        <th>Recorrência</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.events.forEach(function(event) {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            const statusClass = event.status;
            const recurrenceClass = event.is_recurring ? 'recurring' : 'single';
            
            html += `
                <tr>
                    <td>
                        <div class="event-title">${escapeHtml(event.title)}</div>
                        <div class="event-meta">ID: ${event.id}</div>
                    </td>
                    <td>
                        <span class="event-status ${statusClass}">${getStatusLabel(event.status)}</span>
                    </td>
                    <td>
                        <div class="event-meta">
                            <strong>Início:</strong> ${formatDateTime(startDate)}<br>
                            <strong>Fim:</strong> ${formatDateTime(endDate)}
                        </div>
                    </td>
                    <td>
                        <div class="event-meta">${escapeHtml(event.venue || 'Não definido')}</div>
                    </td>
                    <td>
                        <span class="event-recurrence ${recurrenceClass}">
                            ${escapeHtml(event.recurrence_info)}
                        </span>
                    </td>
                    <td>
                        <div class="event-actions">
                            <button class="action-btn edit edit-event" data-event-id="${event.id}">
                                ✏️ Editar
                            </button>
                            <button class="action-btn republish republish-event" data-event-id="${event.id}">
                                🔄 Republicar
                            </button>
                            <a href="${event.view_url}" class="action-btn view" target="_blank">
                                👁️ Ver
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.html(html);
    }
    
    function updatePagination(data) {
        totalPages = data.total_pages;
        currentPage = data.current_page;
        
        if (totalPages <= 1) {
            $('.pagination').remove();
            return;
        }
        
        let paginationHtml = '<div class="pagination">';
        
        // Botão anterior
        paginationHtml += `
            <button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                « Anterior
            </button>
        `;
        
        // Páginas numeradas
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            const activeClass = i === currentPage ? 'current-page' : '';
            paginationHtml += `
                <button class="${activeClass}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Botão próximo
        paginationHtml += `
            <button ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                Próximo »
            </button>
        `;
        
        paginationHtml += '</div>';
        
        // Remover paginação existente e adicionar nova
        $('.pagination').remove();
        $('#events-container').after(paginationHtml);
        
        // Adicionar informações sobre total de eventos
        const infoHtml = `
            <div class="events-info">
                <p>Mostrando ${data.events.length} de ${data.total_events} eventos (Página ${currentPage} de ${totalPages})</p>
            </div>
        `;
        $('.events-info').remove();
        $('.pagination').after(infoHtml);
    }
    
    function handlePagination(e) {
        const page = parseInt($(e.target).data('page'));
        if (page && page !== currentPage && page >= 1 && page <= totalPages) {
            currentPage = page;
            loadEvents();
        }
    }
    
    function handleEditEvent(e) {
        const eventId = $(e.target).data('event-id');
        
        if (!eventId) {
            showMessage('ID do evento não encontrado', 'error');
            return;
        }
        
        showLoadingOverlay();
        
        $.post(vendzz_events_ajax.ajax_url, {
            action: 'vendzz_get_event_details',
            nonce: vendzz_events_ajax.nonce,
            event_id: eventId
        })
        .done(function(response) {
            if (response.success) {
                populateEditForm(response.data);
                $('#event-edit-modal').dialog('open');
            } else {
                showMessage(response.data || 'Erro ao carregar detalhes do evento', 'error');
            }
        })
        .fail(function() {
            showMessage('Erro ao carregar detalhes do evento', 'error');
        })
        .always(function() {
            hideLoadingOverlay();
        });
    }
    
    function populateEditForm(eventData) {
        $('#event-id').val(eventData.id);
        $('#event-title').val(eventData.title);
        $('#event-description').val(eventData.description);
        $('#event-status').val(eventData.status);
        $('#event-venue').val(eventData.venue);
        
        // Converter datas para formato datetime-local
        if (eventData.start_date) {
            const startDate = new Date(eventData.start_date);
            $('#event-start-date').val(formatDateTimeLocal(startDate));
        }
        
        if (eventData.end_date) {
            const endDate = new Date(eventData.end_date);
            $('#event-end-date').val(formatDateTimeLocal(endDate));
        }
        
        // Mostrar informações de recorrência
        if (eventData.recurrence_info) {
            $('#recurrence-info').html(`
                <strong>Recorrência atual:</strong> ${eventData.recurrence_info}
                <br><small>Nota: As configurações de recorrência são gerenciadas pelo Events Calendar Pro e não podem ser editadas aqui.</small>
            `);
        } else {
            $('#recurrence-info').html('<em>Este é um evento único (sem recorrência)</em>');
        }
    }
    
    function handleSaveEvent(e) {
        e.preventDefault();
        
        const formData = {
            action: 'vendzz_update_event',
            nonce: vendzz_events_ajax.nonce,
            event_id: $('#event-id').val(),
            event_title: $('#event-title').val(),
            event_description: $('#event-description').val(),
            event_status: $('#event-status').val(),
            event_start_date: $('#event-start-date').val(),
            event_end_date: $('#event-end-date').val(),
            event_venue: $('#event-venue').val()
        };
        
        // Validação básica
        if (!formData.event_title || !formData.event_start_date || !formData.event_end_date) {
            showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Validar se data de fim é posterior à data de início
        const startDate = new Date(formData.event_start_date);
        const endDate = new Date(formData.event_end_date);
        
        if (endDate <= startDate) {
            showMessage('A data de fim deve ser posterior à data de início', 'error');
            return;
        }
        
        showLoadingOverlay();
        
        $.post(vendzz_events_ajax.ajax_url, formData)
            .done(function(response) {
                if (response.success) {
                    showMessage('Evento atualizado com sucesso', 'success');
                    $('#event-edit-modal').dialog('close');
                    loadEvents(); // Recarregar lista de eventos
                } else {
                    showMessage(response.data || 'Erro ao atualizar evento', 'error');
                }
            })
            .fail(function() {
                showMessage('Erro ao atualizar evento', 'error');
            })
            .always(function() {
                hideLoadingOverlay();
            });
    }
    
    function handleRepublishEvent(e) {
        const eventId = $(e.target).data('event-id');
        
        if (!eventId) {
            showMessage('ID do evento não encontrado', 'error');
            return;
        }
        
        if (!confirm(vendzz_events_ajax.strings.confirm_republish)) {
            return;
        }
        
        showLoadingOverlay();
        
        $.post(vendzz_events_ajax.ajax_url, {
            action: 'vendzz_republish_event',
            nonce: vendzz_events_ajax.nonce,
            event_id: eventId
        })
        .done(function(response) {
            if (response.success) {
                showMessage(response.data.message || 'Evento republicado com sucesso', 'success');
                loadEvents(); // Recarregar lista de eventos
                
                // Mostrar link para editar novo evento
                if (response.data.edit_url) {
                    setTimeout(function() {
                        if (confirm('Deseja editar o evento republicado?')) {
                            window.open(response.data.edit_url, '_blank');
                        }
                    }, 1000);
                }
            } else {
                showMessage(response.data || 'Erro ao republicar evento', 'error');
            }
        })
        .fail(function() {
            showMessage('Erro ao republicar evento', 'error');
        })
        .always(function() {
            hideLoadingOverlay();
        });
    }
    
    // Funções utilitárias
    function showLoadingSpinner() {
        $('#events-container').html(`
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${vendzz_events_ajax.strings.loading}</p>
            </div>
        `);
    }
    
    function hideLoadingSpinner() {
        // A função displayEvents() substituirá o conteúdo
    }
    
    function showLoadingOverlay() {
        if ($('.loading-overlay').length === 0) {
            $('body').append(`
                <div class="loading-overlay">
                    <div class="spinner"></div>
                </div>
            `);
        }
    }
    
    function hideLoadingOverlay() {
        $('.loading-overlay').remove();
    }
    
    function showMessage(message, type) {
        // Remover mensagens existentes
        $('.vendzz-message').remove();
        
        const messageHtml = `
            <div class="vendzz-message ${type} show">
                ${escapeHtml(message)}
            </div>
        `;
        
        $('.wrap h1').after(messageHtml);
        
        // Auto-remover após 5 segundos
        setTimeout(function() {
            $('.vendzz-message').fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }
    
    function getStatusLabel(status) {
        const labels = {
            'publish': 'Publicado',
            'draft': 'Rascunho',
            'private': 'Privado',
            'trash': 'Lixeira'
        };
        return labels[status] || status;
    }
    
    function formatDateTime(date) {
        if (!date || isNaN(date)) return 'Data inválida';
        
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function formatDateTimeLocal(date) {
        if (!date || isNaN(date)) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});

// Adicionar estilos CSS inline para informações de eventos
jQuery(document).ready(function($) {
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .events-info {
                text-align: center;
                margin: 15px 0;
                color: #666;
                font-size: 13px;
            }
            
            .events-info p {
                margin: 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
                border: 1px solid #dee2e6;
            }
        `)
        .appendTo('head');
});