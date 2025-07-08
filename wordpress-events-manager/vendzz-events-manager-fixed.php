<?php
/**
 * Plugin Name: Vendzz Events Manager
 * Plugin URI: https://vendzz.com.br
 * Description: Plugin para gerenciar eventos do Events Calendar Pro - ler, editar e republicar eventos com recorrência
 * Version: 1.0.0
 * Author: Vendzz
 * Author URI: https://vendzz.com.br
 * Text Domain: vendzz-events-manager
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * License: GPL v2 or later
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Verificar PHP
if (version_compare(PHP_VERSION, '7.4', '<')) {
    return;
}

// Definir constantes
define('VENDZZ_EVENTS_VERSION', '1.0.0');
define('VENDZZ_EVENTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VENDZZ_EVENTS_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Classe principal
class VendzzEventsManagerFixed {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_vendzz_get_events', array($this, 'ajax_get_events'));
        add_action('wp_ajax_vendzz_republish_event', array($this, 'ajax_republish_event'));
        
        // Endpoints para editor de eventos recorrentes
        add_action('wp_ajax_vendzz_get_recurring_event', array($this, 'ajax_get_recurring_event'));
        add_action('wp_ajax_vendzz_add_occurrence', array($this, 'ajax_add_occurrence'));
        add_action('wp_ajax_vendzz_delete_occurrence', array($this, 'ajax_delete_occurrence'));
        add_action('wp_ajax_vendzz_update_recurring_event', array($this, 'ajax_update_recurring_event'));
        add_action('wp_ajax_vendzz_generate_occurrences', array($this, 'ajax_generate_occurrences'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Incluir classe do editor de eventos recorrentes
        $this->include_recurring_editor();
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Eventos Manager',
            'Eventos Manager',
            'manage_options',
            'vendzz-events-manager',
            array($this, 'admin_page'),
            'dashicons-calendar-alt',
            30
        );
    }
    
    public function enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_vendzz-events-manager') {
            return;
        }
        
        wp_enqueue_script('jquery');
        wp_enqueue_script(
            'vendzz-events-admin',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            VENDZZ_EVENTS_VERSION,
            true
        );
        
        wp_enqueue_script(
            'vendzz-recurring-editor',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/js/recurring-events-editor.js',
            array('jquery'),
            VENDZZ_EVENTS_VERSION,
            true
        );
        
        wp_localize_script('vendzz-events-admin', 'vendzz_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('vendzz_events_nonce')
        ));
        
        wp_enqueue_style(
            'vendzz-events-admin',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            VENDZZ_EVENTS_VERSION
        );
        
        // Localizar scripts com dados necessários
        wp_localize_script(
            'vendzz-events-admin',
            'vendzz_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('vendzz_events_nonce')
            )
        );
    }
    
    public function admin_page() {
        if (!$this->is_events_calendar_pro_active()) {
            echo '<div class="notice notice-error"><p>Events Calendar Pro não está instalado ou ativo.</p></div>';
            return;
        }
        
        ?>
        <div class="wrap vendzz-events-manager">
            <div class="vendzz-events-header">
                <div>
                    <h1>Vendzz Events Manager</h1>
                    <p class="description">Gerenciador de eventos do Events Calendar Pro</p>
                </div>
            </div>
            
            <div class="vendzz-events-filters">
                <h2>Filtros</h2>
                <div class="vendzz-filters-row">
                    <div class="vendzz-filter-group">
                        <label for="vendzz-search-input">Buscar:</label>
                        <input type="text" id="vendzz-search-input" placeholder="Digite o título do evento">
                    </div>
                    <div class="vendzz-filter-group">
                        <label for="vendzz-status-filter">Status:</label>
                        <select id="vendzz-status-filter">
                            <option value="">Todos</option>
                            <option value="publish">Publicado</option>
                            <option value="draft">Rascunho</option>
                            <option value="private">Privado</option>
                        </select>
                    </div>
                    <div class="vendzz-filter-group">
                        <button type="button" id="vendzz-filter-button">Filtrar</button>
                    </div>
                </div>
            </div>
            
            <div id="vendzz-events-container">
                <div class="vendzz-loading">
                    <div class="spinner"></div>
                    Carregando eventos...
                </div>
            </div>
            
            <div id="vendzz-pagination-container"></div>
        </div>
        
        <!-- Modal do Editor de Eventos Recorrentes -->
        <div id="vendzz-recurring-editor-modal" class="vendzz-modal">
            <div class="vendzz-modal-content">
                <div class="vendzz-modal-header">
                    <h3>Editor de Eventos Recorrentes</h3>
                    <button class="close-modal" onclick="closeRecurringEditor()">&times;</button>
                </div>
                <div class="vendzz-modal-body">
                    <div id="vendzz-recurring-editor-content">
                        <!-- Conteúdo do editor será carregado aqui -->
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        // Função para fechar o modal
        function closeRecurringEditor() {
            document.getElementById('vendzz-recurring-editor-modal').style.display = 'none';
        }
        
        // Fechar modal clicando fora
        document.getElementById('vendzz-recurring-editor-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeRecurringEditor();
            }
        });
        
        // Inicializar o editor recorrente quando disponível
        jQuery(document).ready(function($) {
            if (typeof VendzzRecurringEditor !== 'undefined') {
                VendzzRecurringEditor.init();
            }
        });
        </script>
        
        <?php
    }
    
    public function ajax_get_events() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $search = sanitize_text_field($_POST['search'] ?? '');
        $status = sanitize_text_field($_POST['status'] ?? '');
        $page = intval($_POST['page'] ?? 1);
        
        $events = $this->get_events($search, $status, $page);
        $total = $this->count_events($search, $status);
        
        $response = array(
            'events' => $events,
            'total_events' => $total,
            'current_page' => $page,
            'total_pages' => ceil($total / 20)
        );
        
        wp_send_json_success($response);
    }
    
    public function ajax_republish_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error('ID do evento inválido');
        }
        
        $event = get_post($event_id);
        
        if (!$event || $event->post_type !== 'tribe_events') {
            wp_send_json_error('Evento não encontrado');
        }
        
        // Criar novo post baseado no evento original
        $new_post_data = array(
            'post_type' => 'tribe_events',
            'post_title' => $event->post_title . ' - Republicado',
            'post_content' => $event->post_content,
            'post_status' => 'publish',
            'post_author' => get_current_user_id()
        );
        
        $new_event_id = wp_insert_post($new_post_data);
        
        if (is_wp_error($new_event_id)) {
            wp_send_json_error($new_event_id->get_error_message());
        }
        
        // Copiar metadados do evento original
        $meta_keys = array(
            '_EventStartDate',
            '_EventEndDate',
            '_EventVenueID',
            '_EventRecurrence',
            '_EventAllDay'
        );
        
        foreach ($meta_keys as $meta_key) {
            $meta_value = get_post_meta($event_id, $meta_key, true);
            if (!empty($meta_value)) {
                update_post_meta($new_event_id, $meta_key, $meta_value);
            }
        }
        
        wp_send_json_success(array(
            'message' => 'Evento republicado com sucesso',
            'new_event_id' => $new_event_id,
            'edit_url' => get_edit_post_link($new_event_id)
        ));
    }
    
    private function get_events($search = '', $status = '', $page = 1) {
        global $wpdb;
        
        $offset = ($page - 1) * 20;
        
        $where = array("post_type = 'tribe_events'");
        
        if (!empty($search)) {
            $where[] = $wpdb->prepare("post_title LIKE %s", '%' . $wpdb->esc_like($search) . '%');
        }
        
        if (!empty($status)) {
            $where[] = $wpdb->prepare("post_status = %s", $status);
        } else {
            $where[] = "post_status IN ('publish', 'draft', 'private')";
        }
        
        $where_clause = implode(' AND ', $where);
        
        $sql = "SELECT p.ID, p.post_title, p.post_status, p.post_date, 
                       em_start.meta_value as start_date,
                       em_end.meta_value as end_date,
                       em_venue.meta_value as venue_id,
                       em_recur.meta_value as recurrence
                FROM {$wpdb->posts} p
                LEFT JOIN {$wpdb->postmeta} em_start ON p.ID = em_start.post_id AND em_start.meta_key = '_EventStartDate'
                LEFT JOIN {$wpdb->postmeta} em_end ON p.ID = em_end.post_id AND em_end.meta_key = '_EventEndDate'
                LEFT JOIN {$wpdb->postmeta} em_venue ON p.ID = em_venue.post_id AND em_venue.meta_key = '_EventVenueID'
                LEFT JOIN {$wpdb->postmeta} em_recur ON p.ID = em_recur.post_id AND em_recur.meta_key = '_EventRecurrence'
                WHERE {$where_clause}
                ORDER BY p.post_date DESC
                LIMIT %d OFFSET %d";
        
        $results = $wpdb->get_results($wpdb->prepare($sql, 20, $offset));
        
        $events = array();
        foreach ($results as $result) {
            $venue_name = '';
            if ($result->venue_id) {
                $venue = get_post($result->venue_id);
                if ($venue) {
                    $venue_name = $venue->post_title;
                }
            }
            
            $events[] = array(
                'id' => $result->ID,
                'title' => $result->post_title,
                'status' => $result->post_status,
                'start_date' => $result->start_date,
                'end_date' => $result->end_date,
                'venue' => $venue_name,
                'is_recurring' => !empty($result->recurrence),
                'recurrence_info' => !empty($result->recurrence) ? 'Evento recorrente' : 'Evento único',
                'edit_url' => get_edit_post_link($result->ID),
                'view_url' => get_permalink($result->ID)
            );
        }
        
        return $events;
    }
    
    private function count_events($search = '', $status = '') {
        global $wpdb;
        
        $where = array("post_type = 'tribe_events'");
        
        if (!empty($search)) {
            $where[] = $wpdb->prepare("post_title LIKE %s", '%' . $wpdb->esc_like($search) . '%');
        }
        
        if (!empty($status)) {
            $where[] = $wpdb->prepare("post_status = %s", $status);
        } else {
            $where[] = "post_status IN ('publish', 'draft', 'private')";
        }
        
        $where_clause = implode(' AND ', $where);
        
        $sql = "SELECT COUNT(*) FROM {$wpdb->posts} WHERE {$where_clause}";
        
        return $wpdb->get_var($sql);
    }
    
    private function is_events_calendar_pro_active() {
        return class_exists('Tribe__Events__Pro__Main') || 
               class_exists('TribeEventsPro') || 
               function_exists('tribe_get_events');
    }
    
    public function activate() {
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            wp_die('Este plugin requer WordPress 5.0 ou superior.');
        }
        
        add_option('vendzz_events_version', VENDZZ_EVENTS_VERSION);
    }
    
    public function deactivate() {
        delete_option('vendzz_events_version');
    }
    
    // Incluir classe do editor de eventos recorrentes
    private function include_recurring_editor() {
        $editor_file = VENDZZ_EVENTS_PLUGIN_PATH . 'includes/class-recurring-events-editor.php';
        if (file_exists($editor_file)) {
            require_once $editor_file;
        }
    }
    
    // AJAX: Obter evento recorrente
    public function ajax_get_recurring_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error('ID do evento inválido');
        }
        
        if (!class_exists('VendzzRecurringEventsEditor')) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $event = $editor->get_recurring_event($event_id);
        
        if (!$event) {
            wp_send_json_error('Evento não encontrado');
        }
        
        wp_send_json_success($event);
    }
    
    // AJAX: Adicionar ocorrência
    public function ajax_add_occurrence() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $parent_event_id = intval($_POST['parent_event_id']);
        $title = sanitize_text_field($_POST['title']);
        $start_date = sanitize_text_field($_POST['start_date']);
        $end_date = sanitize_text_field($_POST['end_date']);
        
        if (!$parent_event_id || !$start_date || !$end_date) {
            wp_send_json_error('Dados obrigatórios não fornecidos');
        }
        
        if (!class_exists('VendzzRecurringEventsEditor')) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $occurrence_id = $editor->add_occurrence($parent_event_id, $start_date, $end_date, $title);
        
        if (!$occurrence_id) {
            wp_send_json_error('Erro ao criar ocorrência');
        }
        
        wp_send_json_success(array(
            'occurrence_id' => $occurrence_id,
            'message' => 'Ocorrência criada com sucesso'
        ));
    }
    
    // AJAX: Excluir ocorrência
    public function ajax_delete_occurrence() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $occurrence_id = intval($_POST['occurrence_id']);
        
        if (!$occurrence_id) {
            wp_send_json_error('ID da ocorrência inválido');
        }
        
        if (!class_exists('VendzzRecurringEventsEditor')) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->delete_occurrence($occurrence_id);
        
        if (!$result) {
            wp_send_json_error('Erro ao excluir ocorrência');
        }
        
        wp_send_json_success('Ocorrência excluída com sucesso');
    }
    
    // AJAX: Atualizar evento recorrente
    public function ajax_update_recurring_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        $event_data = json_decode(stripslashes($_POST['event_data']), true);
        
        if (!$event_id || !$event_data) {
            wp_send_json_error('Dados do evento inválidos');
        }
        
        if (!class_exists('VendzzRecurringEventsEditor')) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->update_recurring_event($event_id, $event_data);
        
        if (!$result) {
            wp_send_json_error('Erro ao atualizar evento');
        }
        
        wp_send_json_success('Evento atualizado com sucesso');
    }
    
    // AJAX: Gerar ocorrências automáticas
    public function ajax_generate_occurrences() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        $recurrence_rule = sanitize_text_field($_POST['recurrence_rule']);
        $end_date = sanitize_text_field($_POST['end_date']);
        
        if (!$event_id || !$recurrence_rule) {
            wp_send_json_error('Dados obrigatórios não fornecidos');
        }
        
        if (!class_exists('VendzzRecurringEventsEditor')) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $occurrences = $editor->generate_occurrences($event_id, $recurrence_rule, $end_date);
        
        if (!$occurrences) {
            wp_send_json_error('Erro ao gerar ocorrências');
        }
        
        wp_send_json_success(array(
            'count' => count($occurrences),
            'occurrences' => $occurrences
        ));
    }
}

// Inicialização
function vendzz_events_manager_fixed_init() {
    if (is_admin()) {
        VendzzEventsManagerFixed::get_instance();
    }
}

add_action('plugins_loaded', 'vendzz_events_manager_fixed_init');