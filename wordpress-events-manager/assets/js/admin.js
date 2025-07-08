/**
 * JavaScript para o painel administrativo do Vendzz Events Manager
 */

jQuery(document).ready(function($) {
    
    // Variáveis globais
    let currentPage = 1;
    let isLoading = false;
    
    // Carregar eventos na inicialização
    loadEvents();
    
    // Bind dos eventos
    bindEvents();
    
    function bindEvents() {
        // Filtrar eventos
        $('#vendzz-filter-button').on('click', function() {
            currentPage = 1;
            loadEvents();
        });
        
        // Busca por Enter
        $('#vendzz-search-input').on('keypress', function(e) {
            if (e.which === 13) {
                currentPage = 1;
                loadEvents();
            }
        });
        
        // Republicar evento
        $(document).on('click', '.vendzz-republish-btn', function() {
            const eventId = $(this).data('event-id');
            const eventTitle = $(this).data('event-title');
            
            if (confirm('Tem certeza que deseja republicar o evento "' + eventTitle + '"?')) {
                republishEvent(eventId);
            }
        });
        
        // Paginação
        $(document).on('click', '.vendzz-pagination-btn', function() {
            const page = $(this).data('page');
            if (page && page !== currentPage) {
                currentPage = page;
                loadEvents();
            }
        });
        
        // Editor de eventos recorrentes
        $(document).on('click', '.edit-recurring-event', function() {
            const eventId = $(this).data('event-id');
            if (eventId) {
                // Verificar se o editor está disponível
                if (typeof window.VendzzRecurringEditor !== 'undefined') {
                    window.VendzzRecurringEditor.openEditor(eventId);
                } else {
                    showError('Editor de eventos recorrentes não está disponível.');
                }
            }
        });
    }
    
    function loadEvents() {
        if (isLoading) return;
        
        isLoading = true;
        showLoading();
        
        const search = $('#vendzz-search-input').val();
        const status = $('#vendzz-status-filter').val();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_get_events',
                search: search,
                status: status,
                page: currentPage,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                isLoading = false;
                hideLoading();
                
                if (response.success) {
                    displayEvents(response.data.events);
                    displayPagination(response.data);
                } else {
                    showError('Erro ao carregar eventos: ' + response.data);
                }
            },
            error: function() {
                isLoading = false;
                hideLoading();
                showError('Erro de conexão ao carregar eventos');
            }
        });
    }
    
    function displayEvents(events) {
        let html = '';
        
        if (events.length === 0) {
            html = '<div class="vendzz-no-events">Nenhum evento encontrado.</div>';
        } else {
            html = `
                <table class="wp-list-table widefat fixed striped vendzz-events-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Status</th>
                            <th>Data Início</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            events.forEach(function(event) {
                const statusClass = event.status === 'publish' ? 'vendzz-status-published' : 'vendzz-status-draft';
                const startDate = event.start_date ? formatDate(event.start_date) : '-';
                const recurringBadge = event.is_recurring ? 
                    '<span class="vendzz-recurring-badge">Recorrente</span>' : 
                    '<span class="vendzz-single-badge">Único</span>';
                
                html += `
                    <tr>
                        <td>${event.id}</td>
                        <td>
                            <strong>${event.title}</strong>
                            ${event.venue ? '<br><small>Local: ' + event.venue + '</small>' : ''}
                        </td>
                        <td><span class="vendzz-status ${statusClass}">${event.status}</span></td>
                        <td>${startDate}</td>
                        <td>${recurringBadge}</td>
                        <td>
                            <div class="vendzz-actions">
                                <a href="${event.edit_url}" class="button button-small">Editar</a>
                                <a href="${event.view_url}" class="button button-small" target="_blank">Ver</a>
                                <button type="button" class="button button-small button-primary edit-recurring-event" data-event-id="${event.id}">
                                    Editor Recorrente
                                </button>
                                <button type="button" class="button button-small vendzz-republish-btn" data-event-id="${event.id}" data-event-title="${event.title}">
                                    Republicar
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        }
        
        $('#vendzz-events-container').html(html);
    }
    
    function displayPagination(data) {
        if (data.total_pages <= 1) {
            $('#vendzz-pagination-container').html('');
            return;
        }
        
        let html = '<div class="vendzz-pagination">';
        
        // Botão Anterior
        if (data.current_page > 1) {
            html += `<button type="button" class="button vendzz-pagination-btn" data-page="${data.current_page - 1}">« Anterior</button>`;
        }
        
        // Números das páginas
        for (let i = 1; i <= data.total_pages; i++) {
            const activeClass = i === data.current_page ? 'button-primary' : '';
            html += `<button type="button" class="button vendzz-pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        // Botão Próximo
        if (data.current_page < data.total_pages) {
            html += `<button type="button" class="button vendzz-pagination-btn" data-page="${data.current_page + 1}">Próximo »</button>`;
        }
        
        html += '</div>';
        
        // Informações da paginação
        html += `<div class="vendzz-pagination-info">
            Mostrando ${((data.current_page - 1) * 20) + 1} a ${Math.min(data.current_page * 20, data.total_events)} de ${data.total_events} eventos
        </div>`;
        
        $('#vendzz-pagination-container').html(html);
    }
    
    function republishEvent(eventId) {
        showLoading();
        
        $.ajax({
            url: vendzz_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'vendzz_republish_event',
                event_id: eventId,
                nonce: vendzz_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    showSuccess('Evento republicado com sucesso!');
                    loadEvents(); // Recarregar lista
                } else {
                    showError('Erro ao republicar evento: ' + response.data);
                }
            },
            error: function() {
                hideLoading();
                showError('Erro de conexão ao republicar evento');
            }
        });
    }
    
    function showLoading() {
        $('#vendzz-events-container').html(`
            <div class="vendzz-loading">
                <div class="spinner is-active"></div>
                <p>Carregando eventos...</p>
            </div>
        `);
    }
    
    function hideLoading() {
        // Loading será substituído pelo conteúdo
    }
    
    function showError(message) {
        $('#vendzz-events-container').html(`
            <div class="notice notice-error">
                <p>${message}</p>
            </div>
        `);
    }
    
    function showSuccess(message) {
        // Criar notificação de sucesso
        $('body').append(`
            <div class="notice notice-success is-dismissible vendzz-notice">
                <p>${message}</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dispensar este aviso.</span>
                </button>
            </div>
        `);
        
        // Auto-remover após 5 segundos
        setTimeout(function() {
            $('.vendzz-notice').fadeOut();
        }, 5000);
        
        // Permitir fechar manualmente
        $('.notice-dismiss').on('click', function() {
            $(this).closest('.notice').fadeOut();
        });
    }
    
    function formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
});