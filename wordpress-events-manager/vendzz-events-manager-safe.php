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
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Vendzz Events Manager requer PHP 7.4 ou superior. Versão atual: ' . PHP_VERSION . '</p></div>';
    });
    return;
}

// Definir constantes
if (!defined('VENDZZ_EVENTS_VERSION')) {
    define('VENDZZ_EVENTS_VERSION', '1.0.0');
}
if (!defined('VENDZZ_EVENTS_PLUGIN_URL')) {
    define('VENDZZ_EVENTS_PLUGIN_URL', plugin_dir_url(__FILE__));
}
if (!defined('VENDZZ_EVENTS_PLUGIN_PATH')) {
    define('VENDZZ_EVENTS_PLUGIN_PATH', plugin_dir_path(__FILE__));
}

// Classe principal simplificada
class VendzzEventsManagerSafe {
    
    private static $instance = null;
    private $editor_loaded = false;
    
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Hooks de ativação/desativação
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Aguardar WordPress carregar completamente
        add_action('plugins_loaded', array($this, 'init_plugin'));
    }
    
    public function init_plugin() {
        // Verificar se podemos carregar o plugin
        if (!$this->can_load_plugin()) {
            return;
        }
        
        // Registrar hooks básicos
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_vendzz_get_events', array($this, 'ajax_get_events'));
        add_action('wp_ajax_vendzz_republish_event', array($this, 'ajax_republish_event'));
        
        // Carregar editor de eventos recorrentes
        $this->load_recurring_editor();
    }
    
    private function can_load_plugin() {
        // Verificar se estamos no admin
        if (!is_admin()) {
            return false;
        }
        
        // Verificar arquivos obrigatórios
        $required_files = array(
            'includes/class-recurring-events-editor.php',
            'assets/js/admin.js',
            'assets/css/admin.css'
        );
        
        foreach ($required_files as $file) {
            if (!file_exists(VENDZZ_EVENTS_PLUGIN_PATH . $file)) {
                add_action('admin_notices', array($this, 'missing_files_notice'));
                return false;
            }
        }
        
        return true;
    }
    
    private function load_recurring_editor() {
        if ($this->editor_loaded) {
            return;
        }
        
        $editor_file = VENDZZ_EVENTS_PLUGIN_PATH . 'includes/class-recurring-events-editor.php';
        
        if (file_exists($editor_file)) {
            require_once $editor_file;
            
            if (class_exists('VendzzRecurringEventsEditor')) {
                $this->editor_loaded = true;
                
                // Registrar endpoints AJAX
                add_action('wp_ajax_vendzz_get_recurring_event', array($this, 'ajax_get_recurring_event'));
                add_action('wp_ajax_vendzz_add_occurrence', array($this, 'ajax_add_occurrence'));
                add_action('wp_ajax_vendzz_delete_occurrence', array($this, 'ajax_delete_occurrence'));
                add_action('wp_ajax_vendzz_update_recurring_event', array($this, 'ajax_update_recurring_event'));
                add_action('wp_ajax_vendzz_generate_occurrences', array($this, 'ajax_generate_occurrences'));
            }
        }
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            'Vendzz Events Manager',
            'Vendzz Events',
            'manage_options',
            'vendzz-events-manager',
            array($this, 'admin_page')
        );
    }
    
    public function enqueue_scripts($hook) {
        if ($hook !== 'tools_page_vendzz-events-manager') {
            return;
        }
        
        wp_enqueue_script('jquery');
        
        wp_enqueue_style(
            'vendzz-events-admin-css',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            VENDZZ_EVENTS_VERSION
        );
        
        wp_enqueue_script(
            'vendzz-events-admin-js',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            VENDZZ_EVENTS_VERSION,
            true
        );
        
        if ($this->editor_loaded) {
            wp_enqueue_script(
                'vendzz-events-editor-js',
                VENDZZ_EVENTS_PLUGIN_URL . 'assets/js/recurring-events-editor.js',
                array('jquery'),
                VENDZZ_EVENTS_VERSION,
                true
            );
        }
        
        wp_localize_script(
            'vendzz-events-admin-js',
            'vendzz_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('vendzz_events_nonce'),
                'editor_loaded' => $this->editor_loaded
            )
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap vendzz-events-manager">
            <h1>Vendzz Events Manager</h1>
            
            <?php if (!$this->is_events_calendar_pro_active()): ?>
                <div class="notice notice-warning">
                    <p>Events Calendar Pro não está ativo. Algumas funcionalidades podem não estar disponíveis.</p>
                </div>
            <?php endif; ?>
            
            <div class="vendzz-events-content">
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
                            </select>
                        </div>
                        <div class="vendzz-filter-group">
                            <button type="button" id="vendzz-filter-button">Filtrar</button>
                        </div>
                    </div>
                </div>
                
                <div class="vendzz-events-list">
                    <div class="vendzz-loading">
                        <div class="spinner"></div>
                        <span>Carregando eventos...</span>
                    </div>
                    
                    <div id="vendzz-events-container"></div>
                    
                    <div class="vendzz-pagination">
                        <button id="vendzz-prev-page" disabled>Anterior</button>
                        <span id="vendzz-page-info">Página 1 de 1</span>
                        <button id="vendzz-next-page" disabled>Próxima</button>
                    </div>
                </div>
            </div>
        </div>
        
        <?php if ($this->editor_loaded): ?>
        <!-- Modal do Editor de Eventos Recorrentes -->
        <div id="vendzz-recurring-editor-modal" class="vendzz-modal">
            <div class="vendzz-modal-content">
                <div class="vendzz-modal-header">
                    <h2>Editor de Eventos Recorrentes</h2>
                    <button class="close-modal" onclick="closeRecurringEditor()">&times;</button>
                </div>
                <div class="vendzz-modal-body">
                    <div id="vendzz-recurring-editor-content"></div>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <?php
    }
    
    // AJAX: Obter eventos
    public function ajax_get_events() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $args = array(
            'post_type' => 'tribe_events',
            'posts_per_page' => 10,
            'post_status' => 'any'
        );
        
        $query = new WP_Query($args);
        $events = array();
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $events[] = array(
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'status' => get_post_status(),
                    'date' => get_the_date(),
                    'recurring' => get_post_meta(get_the_ID(), '_EventRecurrence', true) ? true : false
                );
            }
        }
        
        wp_reset_postdata();
        wp_send_json_success($events);
    }
    
    // AJAX: Republicar evento
    public function ajax_republish_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error('ID do evento inválido');
        }
        
        $result = wp_update_post(array(
            'ID' => $event_id,
            'post_status' => 'publish'
        ));
        
        if ($result) {
            wp_send_json_success('Evento republicado com sucesso');
        } else {
            wp_send_json_error('Erro ao republicar evento');
        }
    }
    
    // AJAX: Obter evento recorrente
    public function ajax_get_recurring_event() {
        if (!$this->editor_loaded) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error('ID do evento inválido');
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
        if (!$this->editor_loaded) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        $occurrence_data = $_POST['occurrence'];
        
        if (!$event_id || !$occurrence_data) {
            wp_send_json_error('Dados inválidos');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->add_occurrence($event_id, $occurrence_data);
        
        if ($result) {
            wp_send_json_success('Ocorrência adicionada com sucesso');
        } else {
            wp_send_json_error('Erro ao adicionar ocorrência');
        }
    }
    
    // AJAX: Excluir ocorrência
    public function ajax_delete_occurrence() {
        if (!$this->editor_loaded) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permissão negada');
        }
        
        $occurrence_id = intval($_POST['occurrence_id']);
        
        if (!$occurrence_id) {
            wp_send_json_error('ID da ocorrência inválido');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->delete_occurrence($occurrence_id);
        
        if ($result) {
            wp_send_json_success('Ocorrência excluída com sucesso');
        } else {
            wp_send_json_error('Erro ao excluir ocorrência');
        }
    }
    
    // AJAX: Atualizar evento recorrente
    public function ajax_update_recurring_event() {
        if (!$this->editor_loaded) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        $event_data = $_POST['event_data'];
        
        if (!$event_id || !$event_data) {
            wp_send_json_error('Dados inválidos');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->update_recurring_event($event_id, $event_data);
        
        if ($result) {
            wp_send_json_success('Evento atualizado com sucesso');
        } else {
            wp_send_json_error('Erro ao atualizar evento');
        }
    }
    
    // AJAX: Gerar ocorrências
    public function ajax_generate_occurrences() {
        if (!$this->editor_loaded) {
            wp_send_json_error('Editor de eventos recorrentes não disponível');
        }
        
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permissão negada');
        }
        
        $event_id = intval($_POST['event_id']);
        $pattern = sanitize_text_field($_POST['pattern']);
        $count = intval($_POST['count']);
        
        if (!$event_id || !$pattern || !$count) {
            wp_send_json_error('Dados inválidos');
        }
        
        $editor = new VendzzRecurringEventsEditor();
        $result = $editor->generate_occurrences($event_id, $pattern, $count);
        
        if ($result) {
            wp_send_json_success('Ocorrências geradas com sucesso');
        } else {
            wp_send_json_error('Erro ao gerar ocorrências');
        }
    }
    
    // Verificar se Events Calendar Pro está ativo
    private function is_events_calendar_pro_active() {
        return class_exists('Tribe__Events__Pro__Main') || 
               class_exists('TribeEventsPro') || 
               function_exists('tribe_get_events');
    }
    
    // Notices
    public function missing_files_notice() {
        echo '<div class="notice notice-error"><p>Vendzz Events Manager: Arquivos obrigatórios não encontrados. Por favor, reinstale o plugin.</p></div>';
    }
    
    public function activate() {
        // Verificação básica
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die('Este plugin requer PHP 7.4 ou superior. Versão atual: ' . PHP_VERSION);
        }
        
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die('Este plugin requer WordPress 5.0 ou superior.');
        }
        
        // Salvar versão
        add_option('vendzz_events_version', VENDZZ_EVENTS_VERSION);
        
        // Limpar cache
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }
    
    public function deactivate() {
        delete_option('vendzz_events_version');
    }
}

// Inicializar plugin
function vendzz_events_manager_init() {
    return VendzzEventsManagerSafe::get_instance();
}

// Garantir que o plugin seja carregado
add_action('plugins_loaded', 'vendzz_events_manager_init', 1);

// Inicializar imediatamente se já estamos na fase correta
if (did_action('plugins_loaded')) {
    vendzz_events_manager_init();
}