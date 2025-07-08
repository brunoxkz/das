<?php
/**
 * Plugin Name: Vendzz Events Manager
 * Plugin URI: https://vendzz.com.br
 * Description: Plugin para gerenciar eventos do Events Calendar Pro - ler, editar e republicar eventos com recorrência
 * Version: 1.0.0
 * Author: Vendzz
 * Author URI: https://vendzz.com.br
 * Text Domain: vendzz-events-manager
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes do plugin
define('VENDZZ_EVENTS_VERSION', '1.0.0');
define('VENDZZ_EVENTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VENDZZ_EVENTS_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Verificar se o WordPress está carregado
if (!function_exists('add_action')) {
    exit('Acesso negado');
}

// Verificar versão do PHP
if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Vendzz Events Manager requer PHP 7.4 ou superior. Versão atual: ' . PHP_VERSION . '</p></div>';
    });
    return;
}

// Incluir classes necessárias
if (file_exists(VENDZZ_EVENTS_PLUGIN_PATH . 'includes/class-events-database.php')) {
    require_once VENDZZ_EVENTS_PLUGIN_PATH . 'includes/class-events-database.php';
} else {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Vendzz Events Manager: Arquivo de classe não encontrado.</p></div>';
    });
    return;
}

/**
 * Classe principal do plugin
 */
class VendzzEventsManager {
    
    private static $instance = null;
    private $database;
    
    /**
     * Singleton pattern
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Construtor
     */
    private function __construct() {
        try {
            // Verificar se a classe existe antes de instanciar
            if (!class_exists('VendzzEventsDatabase')) {
                throw new Exception('Classe VendzzEventsDatabase não encontrada');
            }
            
            $this->database = new VendzzEventsDatabase();
            $this->init_hooks();
        } catch (Exception $e) {
            add_action('admin_notices', function() use ($e) {
                echo '<div class="notice notice-error"><p>Erro no Vendzz Events Manager: ' . esc_html($e->getMessage()) . '</p></div>';
            });
            return;
        }
    }
    
    /**
     * Inicializar hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_ajax_vendzz_get_events', array($this, 'ajax_get_events'));
        add_action('wp_ajax_vendzz_update_event', array($this, 'ajax_update_event'));
        add_action('wp_ajax_vendzz_republish_event', array($this, 'ajax_republish_event'));
        add_action('wp_ajax_vendzz_get_event_details', array($this, 'ajax_get_event_details'));
        
        // Hook para ativação do plugin
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Inicialização
     */
    public function init() {
        // Verificar se o Events Calendar Pro está ativo
        if (!$this->is_events_calendar_pro_active()) {
            add_action('admin_notices', array($this, 'events_calendar_pro_notice'));
            return;
        }
        
        // Carregar textdomain
        load_plugin_textdomain('vendzz-events-manager', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }
    
    /**
     * Verificar se Events Calendar Pro está ativo
     */
    private function is_events_calendar_pro_active() {
        return class_exists('Tribe__Events__Pro__Main') || class_exists('TribeEventsPro');
    }
    
    /**
     * Aviso se Events Calendar Pro não estiver ativo
     */
    public function events_calendar_pro_notice() {
        ?>
        <div class="notice notice-error">
            <p>
                <strong><?php _e('Vendzz Events Manager', 'vendzz-events-manager'); ?>:</strong>
                <?php _e('Este plugin requer o Events Calendar Pro para funcionar. Por favor, instale e ative o Events Calendar Pro.', 'vendzz-events-manager'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Adicionar menu do admin
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Vendzz Events Manager', 'vendzz-events-manager'),
            __('Eventos Manager', 'vendzz-events-manager'),
            'manage_options',
            'vendzz-events-manager',
            array($this, 'admin_page'),
            'dashicons-calendar-alt',
            30
        );
    }
    
    /**
     * Enqueue scripts do admin
     */
    public function admin_enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_vendzz-events-manager') {
            return;
        }
        
        wp_enqueue_script('jquery');
        wp_enqueue_script('jquery-ui-datepicker');
        wp_enqueue_script('jquery-ui-dialog');
        wp_enqueue_style('jquery-ui-style', '//code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css');
        
        wp_enqueue_script(
            'vendzz-events-admin',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'jquery-ui-datepicker', 'jquery-ui-dialog'),
            VENDZZ_EVENTS_VERSION,
            true
        );
        
        wp_enqueue_style(
            'vendzz-events-admin',
            VENDZZ_EVENTS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            VENDZZ_EVENTS_VERSION
        );
        
        wp_localize_script('vendzz-events-admin', 'vendzz_events_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('vendzz_events_nonce'),
            'strings' => array(
                'loading' => __('Carregando...', 'vendzz-events-manager'),
                'error' => __('Erro ao processar solicitação', 'vendzz-events-manager'),
                'success' => __('Operação realizada com sucesso', 'vendzz-events-manager'),
                'confirm_republish' => __('Tem certeza que deseja republicar este evento?', 'vendzz-events-manager'),
                'confirm_delete' => __('Tem certeza que deseja excluir este evento?', 'vendzz-events-manager'),
            )
        ));
    }
    
    /**
     * Página do admin
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Vendzz Events Manager', 'vendzz-events-manager'); ?></h1>
            
            <div class="vendzz-events-header">
                <div class="vendzz-events-filters">
                    <input type="text" id="search-events" placeholder="<?php _e('Buscar eventos...', 'vendzz-events-manager'); ?>">
                    <select id="filter-status">
                        <option value=""><?php _e('Todos os Status', 'vendzz-events-manager'); ?></option>
                        <option value="publish"><?php _e('Publicado', 'vendzz-events-manager'); ?></option>
                        <option value="draft"><?php _e('Rascunho', 'vendzz-events-manager'); ?></option>
                        <option value="private"><?php _e('Privado', 'vendzz-events-manager'); ?></option>
                    </select>
                    <select id="filter-recurrence">
                        <option value=""><?php _e('Todos os Tipos', 'vendzz-events-manager'); ?></option>
                        <option value="recurring"><?php _e('Recorrentes', 'vendzz-events-manager'); ?></option>
                        <option value="single"><?php _e('Únicos', 'vendzz-events-manager'); ?></option>
                    </select>
                    <button id="refresh-events" class="button button-primary"><?php _e('Atualizar', 'vendzz-events-manager'); ?></button>
                </div>
            </div>
            
            <div id="events-container">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p><?php _e('Carregando eventos...', 'vendzz-events-manager'); ?></p>
                </div>
            </div>
            
            <!-- Modal para edição de eventos -->
            <div id="event-edit-modal" title="<?php _e('Editar Evento', 'vendzz-events-manager'); ?>">
                <form id="event-edit-form">
                    <input type="hidden" id="event-id" name="event_id">
                    
                    <div class="form-group">
                        <label for="event-title"><?php _e('Título:', 'vendzz-events-manager'); ?></label>
                        <input type="text" id="event-title" name="event_title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-description"><?php _e('Descrição:', 'vendzz-events-manager'); ?></label>
                        <textarea id="event-description" name="event_description" rows="4"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-start-date"><?php _e('Data de Início:', 'vendzz-events-manager'); ?></label>
                        <input type="datetime-local" id="event-start-date" name="event_start_date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-end-date"><?php _e('Data de Fim:', 'vendzz-events-manager'); ?></label>
                        <input type="datetime-local" id="event-end-date" name="event_end_date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-venue"><?php _e('Local:', 'vendzz-events-manager'); ?></label>
                        <input type="text" id="event-venue" name="event_venue">
                    </div>
                    
                    <div class="form-group">
                        <label for="event-status"><?php _e('Status:', 'vendzz-events-manager'); ?></label>
                        <select id="event-status" name="event_status">
                            <option value="publish"><?php _e('Publicado', 'vendzz-events-manager'); ?></option>
                            <option value="draft"><?php _e('Rascunho', 'vendzz-events-manager'); ?></option>
                            <option value="private"><?php _e('Privado', 'vendzz-events-manager'); ?></option>
                        </select>
                    </div>
                    
                    <div class="form-group recurrence-options">
                        <label><?php _e('Configurações de Recorrência:', 'vendzz-events-manager'); ?></label>
                        <div id="recurrence-info"></div>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }
    
    /**
     * AJAX: Obter eventos
     */
    public function ajax_get_events() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        $search = sanitize_text_field($_POST['search'] ?? '');
        $status = sanitize_text_field($_POST['status'] ?? '');
        $recurrence = sanitize_text_field($_POST['recurrence'] ?? '');
        $page = intval($_POST['page'] ?? 1);
        $per_page = 20;
        
        $args = array(
            'search' => $search,
            'status' => $status,
            'recurrence' => $recurrence,
            'page' => $page,
            'per_page' => $per_page,
            'orderby' => 'start_date',
            'order' => 'ASC'
        );
        
        // Usar a classe de banco de dados para obter os eventos
        $events = $this->database->get_events($args);
        $total_events = $this->database->count_events($args);
        $total_pages = ceil($total_events / $per_page);
        
        wp_send_json_success(array(
            'events' => $events,
            'total_pages' => $total_pages,
            'total_events' => $total_events,
            'current_page' => $page
        ));
    }
    
    /**
     * AJAX: Obter detalhes do evento
     */
    public function ajax_get_event_details() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error(__('ID do evento inválido', 'vendzz-events-manager'));
        }
        
        // Usar a classe de banco de dados para obter detalhes completos
        $event_details = $this->database->get_event_details($event_id);
        
        if (!$event_details) {
            wp_send_json_error(__('Evento não encontrado', 'vendzz-events-manager'));
        }
        
        // Formatar dados para o frontend
        $formatted_details = array(
            'id' => $event_details['id'],
            'title' => $event_details['title'],
            'description' => $event_details['content'],
            'status' => $event_details['status'],
            'start_date' => $event_details['meta']['start_date'],
            'end_date' => $event_details['meta']['end_date'],
            'venue' => $event_details['venue'] ? $event_details['venue']['name'] : '',
            'venue_id' => $event_details['venue'] ? $event_details['venue']['id'] : '',
            'recurrence' => $event_details['meta']['recurrence'],
            'recurrence_info' => $event_details['recurrence_info'],
            'all_day' => $event_details['all_day'],
            'cost' => $event_details['cost'],
            'url' => $event_details['url'],
            'timezone' => $event_details['timezone'],
            'organizer' => $event_details['organizer'],
            'categories' => $event_details['categories'],
            'tags' => $event_details['tags']
        );
        
        wp_send_json_success($formatted_details);
    }
    
    /**
     * AJAX: Atualizar evento
     */
    public function ajax_update_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        $event_id = intval($_POST['event_id']);
        $title = sanitize_text_field($_POST['event_title']);
        $description = wp_kses_post($_POST['event_description']);
        $status = sanitize_text_field($_POST['event_status']);
        $start_date = sanitize_text_field($_POST['event_start_date']);
        $end_date = sanitize_text_field($_POST['event_end_date']);
        $venue = sanitize_text_field($_POST['event_venue']);
        
        if (!$event_id || !$title || !$start_date || !$end_date) {
            wp_send_json_error(__('Dados obrigatórios faltando', 'vendzz-events-manager'));
        }
        
        // Atualizar post
        $post_data = array(
            'ID' => $event_id,
            'post_title' => $title,
            'post_content' => $description,
            'post_status' => $status
        );
        
        $result = wp_update_post($post_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        // Atualizar metadados do evento
        update_post_meta($event_id, '_EventStartDate', $start_date);
        update_post_meta($event_id, '_EventEndDate', $end_date);
        
        // Atualizar venue se fornecido
        if (!empty($venue)) {
            $venue_id = $this->get_or_create_venue($venue);
            update_post_meta($event_id, '_EventVenueID', $venue_id);
        }
        
        wp_send_json_success(__('Evento atualizado com sucesso', 'vendzz-events-manager'));
    }
    
    /**
     * AJAX: Republicar evento
     */
    public function ajax_republish_event() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        $event_id = intval($_POST['event_id']);
        
        if (!$event_id) {
            wp_send_json_error(__('ID do evento inválido', 'vendzz-events-manager'));
        }
        
        $event = get_post($event_id);
        
        if (!$event || $event->post_type !== 'tribe_events') {
            wp_send_json_error(__('Evento não encontrado', 'vendzz-events-manager'));
        }
        
        // Criar novo post baseado no evento original
        $new_post_data = array(
            'post_type' => 'tribe_events',
            'post_title' => $event->post_title . ' - ' . __('Republicado', 'vendzz-events-manager'),
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
            'message' => __('Evento republicado com sucesso', 'vendzz-events-manager'),
            'new_event_id' => $new_event_id,
            'edit_url' => get_edit_post_link($new_event_id)
        ));
    }
    
    /**
     * Formatar informações de recorrência
     */
    private function format_recurrence_info($recurrence) {
        if (empty($recurrence)) {
            return __('Evento único', 'vendzz-events-manager');
        }
        
        $recurrence_data = maybe_unserialize($recurrence);
        
        if (!is_array($recurrence_data)) {
            return __('Recorrência personalizada', 'vendzz-events-manager');
        }
        
        $info = array();
        
        if (isset($recurrence_data['rules'])) {
            foreach ($recurrence_data['rules'] as $rule) {
                $type = $rule['type'] ?? '';
                $interval = $rule['custom']['interval'] ?? 1;
                
                switch ($type) {
                    case 'Daily':
                        $info[] = sprintf(__('Diário (a cada %d dia(s))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Weekly':
                        $info[] = sprintf(__('Semanal (a cada %d semana(s))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Monthly':
                        $info[] = sprintf(__('Mensal (a cada %d mês(es))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Yearly':
                        $info[] = sprintf(__('Anual (a cada %d ano(s))', 'vendzz-events-manager'), $interval);
                        break;
                    default:
                        $info[] = __('Recorrência personalizada', 'vendzz-events-manager');
                }
            }
        }
        
        return !empty($info) ? implode(', ', $info) : __('Recorrência personalizada', 'vendzz-events-manager');
    }
    
    /**
     * Obter ou criar venue
     */
    private function get_or_create_venue($venue_name) {
        // Procurar venue existente
        $existing_venue = get_page_by_title($venue_name, OBJECT, 'tribe_venue');
        
        if ($existing_venue) {
            return $existing_venue->ID;
        }
        
        // Criar novo venue
        $venue_data = array(
            'post_type' => 'tribe_venue',
            'post_title' => $venue_name,
            'post_status' => 'publish'
        );
        
        return wp_insert_post($venue_data);
    }
    
    /**
     * Ativar plugin
     */
    public function activate() {
        // Verificar se o WordPress suporta a versão mínima
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            wp_die(__('Este plugin requer WordPress 5.0 ou superior.', 'vendzz-events-manager'));
        }
        
        // Criar tabelas personalizadas se necessário
        $this->create_tables();
        
        // Definir opções padrão
        add_option('vendzz_events_version', VENDZZ_EVENTS_VERSION);
    }
    
    /**
     * Desativar plugin
     */
    public function deactivate() {
        // Limpar caches e scheduled hooks se necessário
        wp_clear_scheduled_hook('vendzz_events_cleanup');
    }
    
    /**
     * Criar tabelas personalizadas
     */
    private function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'vendzz_events_log';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_id bigint(20) NOT NULL,
            action varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            details text,
            PRIMARY KEY (id),
            KEY event_id (event_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Função de inicialização segura
function vendzz_events_manager_init() {
    // Verificar se todas as dependências estão carregadas
    if (!class_exists('VendzzEventsManager')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-error"><p>Erro fatal: Classe VendzzEventsManager não foi definida corretamente.</p></div>';
        });
        return;
    }
    
    // Verificar se o Events Calendar Pro está ativo
    if (!class_exists('Tribe__Events__Pro__Main') && !class_exists('TribeEventsPro')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-error"><p>Vendzz Events Manager requer o plugin Events Calendar Pro para funcionar.</p></div>';
        });
        return;
    }
    
    // Inicializar plugin
    try {
        VendzzEventsManager::get_instance();
    } catch (Exception $e) {
        add_action('admin_notices', function() use ($e) {
            echo '<div class="notice notice-error"><p>Erro ao inicializar Vendzz Events Manager: ' . esc_html($e->getMessage()) . '</p></div>';
        });
        error_log('Vendzz Events Manager Error: ' . $e->getMessage());
    }
}

// Inicializar após todos os plugins carregarem
add_action('plugins_loaded', 'vendzz_events_manager_init');