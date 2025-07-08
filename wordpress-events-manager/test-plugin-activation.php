<?php
/**
 * Teste de ativação do plugin WordPress
 * Script para diagnosticar problemas de ativação
 */

// Simular ambiente WordPress básico
define('ABSPATH', '/var/www/html/');
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Constantes do plugin
define('VENDZZ_EVENTS_VERSION', '1.0.0');
define('VENDZZ_EVENTS_PLUGIN_PATH', __DIR__ . '/');
define('VENDZZ_EVENTS_PLUGIN_URL', 'https://example.com/wp-content/plugins/vendzz-events-manager/');

// Funções WordPress simuladas
function plugin_dir_path($file) {
    return dirname($file) . '/';
}

function plugin_dir_url($file) {
    return 'https://example.com/wp-content/plugins/vendzz-events-manager/';
}

function version_compare($version1, $operator, $version2) {
    return version_compare($version1, $version2, $operator);
}

function get_bloginfo($show = '') {
    return '6.0';
}

function deactivate_plugins($plugin) {
    echo "🔴 PLUGIN DESATIVADO: $plugin\n";
}

function wp_die($message) {
    echo "💀 ERRO FATAL: $message\n";
    exit(1);
}

function update_option($option, $value) {
    echo "✅ OPÇÃO ATUALIZADA: $option = $value\n";
}

function add_option($option, $value) {
    echo "✅ OPÇÃO ADICIONADA: $option = $value\n";
}

function wp_cache_flush() {
    echo "🧹 CACHE LIMPO\n";
}

function function_exists($function_name) {
    return function_exists($function_name);
}

function file_exists($filename) {
    return file_exists($filename);
}

function plugin_basename($file) {
    return basename($file);
}

function add_action($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
    echo "🔗 HOOK ADICIONADO: $hook\n";
}

function class_exists($class_name) {
    return class_exists($class_name);
}

function register_activation_hook($file, $function) {
    echo "📝 HOOK DE ATIVAÇÃO REGISTRADO\n";
}

function register_deactivation_hook($file, $function) {
    echo "📝 HOOK DE DESATIVAÇÃO REGISTRADO\n";
}

function current_user_can($capability) {
    return true;
}

function admin_url($path) {
    return 'https://example.com/wp-admin/' . $path;
}

function wp_create_nonce($action) {
    return 'test_nonce_' . $action;
}

function wp_send_json_error($data) {
    echo "❌ ERRO AJAX: " . json_encode($data) . "\n";
}

function wp_send_json_success($data) {
    echo "✅ SUCESSO AJAX: " . json_encode($data) . "\n";
}

function check_ajax_referer($action, $query_arg = false) {
    return true;
}

function wp_localize_script($handle, $object_name, $l10n) {
    echo "📜 SCRIPT LOCALIZADO: $handle -> $object_name\n";
}

function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false) {
    echo "📜 SCRIPT ENFILEIRADO: $handle\n";
}

function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {
    echo "🎨 ESTILO ENFILEIRADO: $handle\n";
}

function add_submenu_page($parent_slug, $page_title, $menu_title, $capability, $menu_slug, $function = '') {
    echo "📋 SUBMENU ADICIONADO: $menu_title\n";
}

function get_post($post_id) {
    return (object) array(
        'ID' => $post_id,
        'post_type' => 'tribe_events',
        'post_title' => 'Evento Teste',
        'post_status' => 'publish'
    );
}

function is_plugin_active($plugin) {
    return false; // Simular que Events Calendar Pro não está ativo
}

// Definir variáveis superglobais
$_POST = array();

echo "🚀 INICIANDO TESTE DE ATIVAÇÃO DO PLUGIN\n";
echo "===========================================\n\n";

echo "📁 VERIFICANDO ESTRUTURA DE ARQUIVOS:\n";
$required_files = array(
    'vendzz-events-manager-fixed.php',
    'includes/class-recurring-events-editor.php',
    'includes/class-events-database.php',
    'assets/js/admin.js',
    'assets/js/recurring-events-editor.js',
    'assets/css/admin.css'
);

foreach ($required_files as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ $file - ENCONTRADO\n";
    } else {
        echo "❌ $file - NÃO ENCONTRADO\n";
    }
}

echo "\n📦 CARREGANDO PLUGIN PRINCIPAL:\n";

try {
    // Incluir o plugin principal
    include_once __DIR__ . '/vendzz-events-manager-fixed.php';
    
    echo "✅ Plugin principal carregado com sucesso\n";
    
    // Verificar se a classe principal existe
    if (class_exists('VendzzEventsManagerFixed')) {
        echo "✅ Classe VendzzEventsManagerFixed encontrada\n";
        
        // Instanciar o plugin
        $plugin = VendzzEventsManagerFixed::get_instance();
        echo "✅ Plugin instanciado com sucesso\n";
        
        // Simular ativação
        echo "\n🔄 SIMULANDO ATIVAÇÃO DO PLUGIN:\n";
        $plugin->activate();
        
        echo "\n🎉 PLUGIN ATIVADO COM SUCESSO!\n";
        
    } else {
        echo "❌ Classe VendzzEventsManagerFixed não encontrada\n";
    }
    
} catch (Exception $e) {
    echo "💀 ERRO DURANTE O CARREGAMENTO: " . $e->getMessage() . "\n";
    echo "📍 LINHA: " . $e->getLine() . "\n";
    echo "📄 ARQUIVO: " . $e->getFile() . "\n";
} catch (Error $e) {
    echo "💀 ERRO FATAL: " . $e->getMessage() . "\n";
    echo "📍 LINHA: " . $e->getLine() . "\n";
    echo "📄 ARQUIVO: " . $e->getFile() . "\n";
}

echo "\n===========================================\n";
echo "✅ TESTE CONCLUÍDO\n";