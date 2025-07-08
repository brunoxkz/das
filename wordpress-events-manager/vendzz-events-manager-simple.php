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

// Definir constantes
define('VENDZZ_EVENTS_VERSION', '1.0.0');
define('VENDZZ_EVENTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VENDZZ_EVENTS_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Verificar PHP
if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Vendzz Events Manager requer PHP 7.4+. Versão atual: ' . PHP_VERSION . '</p></div>';
    });
    return;
}

// Classe principal simplificada
class VendzzEventsManagerSimple {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_vendzz_get_events', array($this, 'ajax_get_events'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
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
    
    public function admin_page() {
        // Verificar se Events Calendar Pro está ativo
        if (!$this->is_events_calendar_pro_active()) {
            echo '<div class="notice notice-error"><p>Events Calendar Pro não está instalado ou ativo.</p></div>';
            return;
        }
        
        ?>
        <div class="wrap">
            <h1>Vendzz Events Manager</h1>
            <p>Gerenciador de eventos do Events Calendar Pro</p>
            
            <div id="vendzz-events-list">
                <h2>Eventos Encontrados</h2>
                <?php $this->display_events(); ?>
            </div>
        </div>
        <?php
    }
    
    private function display_events() {
        $events = $this->get_events_from_database();
        
        if (empty($events)) {
            echo '<p>Nenhum evento encontrado.</p>';
            return;
        }
        
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>ID</th><th>Título</th><th>Status</th><th>Data Início</th><th>Ações</th></tr></thead>';
        echo '<tbody>';
        
        foreach ($events as $event) {
            echo '<tr>';
            echo '<td>' . esc_html($event->ID) . '</td>';
            echo '<td><strong>' . esc_html($event->post_title) . '</strong></td>';
            echo '<td>' . esc_html($event->post_status) . '</td>';
            echo '<td>' . esc_html($this->get_event_start_date($event->ID)) . '</td>';
            echo '<td>';
            echo '<a href="' . get_edit_post_link($event->ID) . '">Editar</a> | ';
            echo '<a href="' . get_permalink($event->ID) . '" target="_blank">Ver</a>';
            echo '</td>';
            echo '</tr>';
        }
        
        echo '</tbody>';
        echo '</table>';
    }
    
    private function get_events_from_database() {
        global $wpdb;
        
        $sql = "SELECT * FROM {$wpdb->posts} WHERE post_type = 'tribe_events' AND post_status IN ('publish', 'draft') ORDER BY post_date DESC LIMIT 50";
        
        return $wpdb->get_results($sql);
    }
    
    private function get_event_start_date($event_id) {
        $start_date = get_post_meta($event_id, '_EventStartDate', true);
        if ($start_date) {
            return date('d/m/Y H:i', strtotime($start_date));
        }
        return '-';
    }
    
    private function is_events_calendar_pro_active() {
        return class_exists('Tribe__Events__Pro__Main') || class_exists('TribeEventsPro') || function_exists('tribe_get_events');
    }
    
    public function ajax_get_events() {
        check_ajax_referer('vendzz_events_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissão negada');
        }
        
        $events = $this->get_events_from_database();
        
        wp_send_json_success($events);
    }
    
    public function activate() {
        // Verificar versão do WordPress
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            wp_die('Este plugin requer WordPress 5.0 ou superior.');
        }
        
        // Verificar se Events Calendar Pro está ativo
        if (!$this->is_events_calendar_pro_active()) {
            wp_die('Este plugin requer o Events Calendar Pro para funcionar.');
        }
        
        // Criar opção de versão
        add_option('vendzz_events_version', VENDZZ_EVENTS_VERSION);
    }
    
    public function deactivate() {
        // Limpeza básica
        delete_option('vendzz_events_version');
    }
}

// Inicialização segura
function vendzz_events_manager_simple_init() {
    try {
        VendzzEventsManagerSimple::get_instance();
    } catch (Exception $e) {
        add_action('admin_notices', function() use ($e) {
            echo '<div class="notice notice-error"><p>Erro no Vendzz Events Manager: ' . esc_html($e->getMessage()) . '</p></div>';
        });
        error_log('Vendzz Events Manager Error: ' . $e->getMessage());
    }
}

// Inicializar apenas se não houver erros
if (!function_exists('vendzz_events_manager_simple_init')) {
    add_action('plugins_loaded', 'vendzz_events_manager_simple_init');
} else {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>Conflito de função detectado no Vendzz Events Manager.</p></div>';
    });
}