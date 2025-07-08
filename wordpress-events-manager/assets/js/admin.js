/**
 * JavaScript do painel administrativo do Vendzz Events Manager
 */

(function($) {
    'use strict';

    // Variáveis globais
    const VendzzEventsManager = {
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        
        // Elementos DOM
        elements: {
            searchInput: $('#vendzz-search-input'),
            statusFilter: $('#vendzz-status-filter'),
            recurrenceFilter: $('#vendzz-recurrence-filter'),
            filterButton: $('#vendzz-filter-button'),
            eventsContainer: $('#vendzz-events-container'),
            paginationContainer: $('#vendzz-pagination-container'),
            modal: $('#vendzz-event-modal'),
            modalForm: $('#vendzz-event-form')
        },
        
        // Inicializar
        init: function() {
            this.bindEvents();
            this.loadEvents();
        },
        
        // Vincular eventos
        bindEvents: function() {
            const self = this;
            
            // Filtros
            this.elements.filterButton.on('click', function() {
                self.currentPage = 1;
                self.loadEvents();
            });
            
            // Enter no campo de busca
            this.elements.searchInput.on('keypress', function(e) {
                if (e.which === 13) {
                    self.currentPage = 1;
                    self.loadEvents();
                }
            });
            
            // Paginação
            $(document).on('click', '.vendzz-pagination-btn', function() {
                const page = $(this).data('page');
                if (page && page !== self.currentPage) {
                    self.currentPage = page;
                    self.loadEvents();
                }
            });
            
            // Ações dos eventos
            $(document).on('click', '.vendzz-edit-event', function() {
                const eventId = $(this).data('event-id');
                self.editEvent(eventId);
            });
            
            $(document).on('click', '.vendzz-republish-event', function() {
                const eventId = $(this).data('event-id');
                self.republishEvent(eventId);
            });
            
            // Modal
            $(document).on('click', '.vendzz-modal-close', function() {
                self.closeModal();
            });
            
            $(document).on('click', '.vendzz-modal', function(e) {
                if (e.target === this) {
                    self.closeModal();
                }
            });
            
            // Formulário do modal
            this.elements.modalForm.on('submit', function(e) {
                e.preventDefault();
                self.saveEvent();
            });
            
            // Tecla ESC para fechar modal
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    self.closeModal();
                }
            });
        },
        
        // Carregar eventos
        loadEvents: function() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.showLoading();
            
            const data = {
                action: 'vendzz_get_events',
                nonce: vendzz_ajax.nonce,
                search: this.elements.searchInput.val(),
                status: this.elements.statusFilter.val(),
                recurrence: this.elements.recurrenceFilter.val(),
                page: this.currentPage
            };
            
            $.ajax({
                url: vendzz_ajax.ajax_url,
                type: 'POST',
                data: data,
                success: (response) => {
                    this.isLoading = false;
                    
                    if (response.success) {
                        this.renderEvents(response.data.events);
                        this.renderPagination(response.data);
                    } else {
                        this.showError(response.data || 'Erro ao carregar eventos');
                    }
                },
                error: (xhr, status, error) => {
                    this.isLoading = false;
                    this.showError('Erro na requisição: ' + error);
                }
            });
        },
        
        // Renderizar eventos
        renderEvents: function(events) {
            let html = '';
            
            if (events.length === 0) {
                html = '<div class="vendzz-text-center"><p>Nenhum evento encontrado.</p></div>';
            } else {
                html = '<div class="vendzz-events-table">';
                html += '<table>';
                html += '<thead>';
                html += '<tr>';
                html += '<th>Título</th>';
                html += '<th>Status</th>';
                html += '<th>Data de Início</th>';
                html += '<th>Data de Fim</th>';
                html += '<th>Local</th>';
                html += '<th>Recorrência</th>';
                html += '<th>Ações</th>';
                html += '</tr>';
                html += '</thead>';
                html += '<tbody>';
                
                events.forEach(event => {
                    html += '<tr>';
                    html += '<td><strong>' + this.escapeHtml(event.title) + '</strong></td>';
                    html += '<td><span class="vendzz-event-status ' + event.status + '">' + this.getStatusLabel(event.status) + '</span></td>';
                    html += '<td>' + this.formatDate(event.start_date) + '</td>';
                    html += '<td>' + this.formatDate(event.end_date) + '</td>';
                    html += '<td>' + this.escapeHtml(event.venue || '-') + '</td>';
                    html += '<td><span class="vendzz-recurrence-type ' + (event.is_recurring ? 'recurring' : 'single') + '">' + this.escapeHtml(event.recurrence_info) + '</span></td>';
                    html += '<td>';
                    html += '<div class="vendzz-event-actions">';
                    html += '<button class="edit vendzz-edit-event" data-event-id="' + event.id + '">Editar</button>';
                    html += '<button class="republish vendzz-republish-event" data-event-id="' + event.id + '">Republicar</button>';
                    if (event.view_url) {
                        html += '<a href="' + event.view_url + '" target="_blank" class="view">Ver</a>';
                    }
                    html += '</div>';
                    html += '</td>';
                    html += '</tr>';
                });
                
                html += '</tbody>';
                html += '</table>';
                html += '</div>';
            }
            
            this.elements.eventsContainer.html(html);
        },
        
        // Renderizar paginação
        renderPagination: function(data) {
            let html = '';
            
            if (data.total_pages > 1) {
                html += '<div class="vendzz-events-pagination">';
                html += '<div class="vendzz-pagination-info">';
                html += 'Mostrando página ' + data.current_page + ' de ' + data.total_pages + ' (' + data.total_events + ' eventos)';
                html += '</div>';
                html += '<div class="vendzz-pagination-controls">';
                
                // Botão anterior
                if (data.current_page > 1) {
                    html += '<button class="vendzz-pagination-btn" data-page="' + (data.current_page - 1) + '">« Anterior</button>';
                } else {
                    html += '<button class="vendzz-pagination-btn" disabled>« Anterior</button>';
                }
                
                // Números das páginas
                const startPage = Math.max(1, data.current_page - 2);
                const endPage = Math.min(data.total_pages, data.current_page + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                    if (i === data.current_page) {
                        html += '<button class="vendzz-pagination-btn active" data-page="' + i + '">' + i + '</button>';
                    } else {
                        html += '<button class="vendzz-pagination-btn" data-page="' + i + '">' + i + '</button>';
                    }
                }
                
                // Botão próximo
                if (data.current_page < data.total_pages) {
                    html += '<button class="vendzz-pagination-btn" data-page="' + (data.current_page + 1) + '">Próxima »</button>';
                } else {
                    html += '<button class="vendzz-pagination-btn" disabled>Próxima »</button>';
                }
                
                html += '</div>';
                html += '</div>';
            }
            
            this.elements.paginationContainer.html(html);
        },
        
        // Editar evento
        editEvent: function(eventId) {
            const data = {
                action: 'vendzz_get_event_details',
                nonce: vendzz_ajax.nonce,
                event_id: eventId
            };
            
            $.ajax({
                url: vendzz_ajax.ajax_url,
                type: 'POST',
                data: data,
                success: (response) => {
                    if (response.success) {
                        this.openModal(response.data);
                    } else {
                        this.showError(response.data || 'Erro ao carregar detalhes do evento');
                    }
                },
                error: (xhr, status, error) => {
                    this.showError('Erro na requisição: ' + error);
                }
            });
        },
        
        // Republicar evento
        republishEvent: function(eventId) {
            if (!confirm('Tem certeza que deseja republicar este evento?')) {
                return;
            }
            
            const data = {
                action: 'vendzz_republish_event',
                nonce: vendzz_ajax.nonce,
                event_id: eventId
            };
            
            $.ajax({
                url: vendzz_ajax.ajax_url,
                type: 'POST',
                data: data,
                success: (response) => {
                    if (response.success) {
                        this.showSuccess(response.data.message);
                        this.loadEvents();
                    } else {
                        this.showError(response.data || 'Erro ao republicar evento');
                    }
                },
                error: (xhr, status, error) => {
                    this.showError('Erro na requisição: ' + error);
                }
            });
        },
        
        // Abrir modal
        openModal: function(eventData) {
            // Preencher formulário
            $('#vendzz-event-id').val(eventData.id);
            $('#vendzz-event-title').val(eventData.title);
            $('#vendzz-event-description').val(eventData.description);
            $('#vendzz-event-status').val(eventData.status);
            $('#vendzz-event-start-date').val(eventData.start_date);
            $('#vendzz-event-end-date').val(eventData.end_date);
            $('#vendzz-event-venue').val(eventData.venue);
            
            // Mostrar modal
            this.elements.modal.addClass('active');
            $('body').addClass('modal-open');
        },
        
        // Fechar modal
        closeModal: function() {
            this.elements.modal.removeClass('active');
            $('body').removeClass('modal-open');
            this.elements.modalForm[0].reset();
        },
        
        // Salvar evento
        saveEvent: function() {
            const formData = {
                action: 'vendzz_update_event',
                nonce: vendzz_ajax.nonce,
                event_id: $('#vendzz-event-id').val(),
                title: $('#vendzz-event-title').val(),
                description: $('#vendzz-event-description').val(),
                status: $('#vendzz-event-status').val(),
                start_date: $('#vendzz-event-start-date').val(),
                end_date: $('#vendzz-event-end-date').val(),
                venue: $('#vendzz-event-venue').val()
            };
            
            $.ajax({
                url: vendzz_ajax.ajax_url,
                type: 'POST',
                data: formData,
                success: (response) => {
                    if (response.success) {
                        this.showSuccess(response.data.message);
                        this.closeModal();
                        this.loadEvents();
                    } else {
                        this.showError(response.data || 'Erro ao salvar evento');
                    }
                },
                error: (xhr, status, error) => {
                    this.showError('Erro na requisição: ' + error);
                }
            });
        },
        
        // Mostrar loading
        showLoading: function() {
            this.elements.eventsContainer.html('<div class="vendzz-loading"><div class="spinner"></div>Carregando eventos...</div>');
        },
        
        // Mostrar mensagem de sucesso
        showSuccess: function(message) {
            const html = '<div class="vendzz-message success">' + this.escapeHtml(message) + '</div>';
            $('.vendzz-events-manager').prepend(html);
            
            setTimeout(() => {
                $('.vendzz-message').fadeOut();
            }, 3000);
        },
        
        // Mostrar mensagem de erro
        showError: function(message) {
            const html = '<div class="vendzz-message error">' + this.escapeHtml(message) + '</div>';
            $('.vendzz-events-manager').prepend(html);
            
            setTimeout(() => {
                $('.vendzz-message').fadeOut();
            }, 5000);
        },
        
        // Formatar data
        formatDate: function(dateString) {
            if (!dateString) return '-';
            
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Obter label do status
        getStatusLabel: function(status) {
            const labels = {
                'publish': 'Publicado',
                'draft': 'Rascunho',
                'private': 'Privado',
                'trash': 'Lixeira'
            };
            
            return labels[status] || status;
        },
        
        // Escapar HTML
        escapeHtml: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };
    
    // Inicializar quando o documento estiver pronto
    $(document).ready(function() {
        // Verificar se estamos na página do plugin
        if ($('.vendzz-events-manager').length > 0) {
            VendzzEventsManager.init();
        }
    });

})(jQuery);