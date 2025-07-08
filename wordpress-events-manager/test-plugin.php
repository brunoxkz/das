<?php
/**
 * Script de teste para verificar o plugin Vendzz Events Manager
 * 
 * Este arquivo deve ser executado em um ambiente WordPress
 * para testar se o plugin está funcionando corretamente
 */

// Verificar se o WordPress está carregado
if (!defined('ABSPATH')) {
    die('Este script deve ser executado em um ambiente WordPress');
}

// Verificar se o plugin está ativo
if (!class_exists('VendzzEventsManager')) {
    die('Plugin Vendzz Events Manager não está ativo');
}

// Verificar se o Events Calendar Pro está ativo
if (!class_exists('Tribe__Events__Pro__Main') && !class_exists('TribeEventsPro')) {
    die('Events Calendar Pro não está ativo');
}

echo "<h1>Teste do Plugin Vendzz Events Manager</h1>";

// Testar instância do plugin
$plugin = VendzzEventsManager::get_instance();
if ($plugin) {
    echo "<p>✅ Plugin instanciado com sucesso</p>";
} else {
    echo "<p>❌ Erro ao instanciar o plugin</p>";
}

// Testar classe de banco de dados
if (class_exists('VendzzEventsDatabase')) {
    echo "<p>✅ Classe VendzzEventsDatabase carregada</p>";
    
    $database = new VendzzEventsDatabase();
    
    // Testar contagem de eventos
    $count = $database->count_events();
    echo "<p>📊 Total de eventos encontrados: " . $count . "</p>";
    
    // Testar busca de eventos
    $events = $database->get_events(array('per_page' => 5));
    echo "<p>📋 Eventos encontrados (primeiros 5):</p>";
    
    if (!empty($events)) {
        echo "<ul>";
        foreach ($events as $event) {
            echo "<li>ID: " . $event['id'] . " - " . esc_html($event['title']) . " (" . $event['status'] . ")</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>Nenhum evento encontrado</p>";
    }
    
    // Testar venues
    $venues = $database->get_venues();
    echo "<p>🏢 Venues encontrados: " . count($venues) . "</p>";
    
    // Testar categorias
    $categories = $database->get_event_categories();
    echo "<p>📂 Categorias encontradas: " . count($categories) . "</p>";
    
} else {
    echo "<p>❌ Classe VendzzEventsDatabase não encontrada</p>";
}

// Testar estrutura de arquivos
echo "<h2>Estrutura de Arquivos</h2>";

$files_to_check = array(
    'vendzz-events-manager.php' => 'Arquivo principal',
    'includes/class-events-database.php' => 'Classe de banco de dados',
    'assets/css/admin.css' => 'Estilos CSS',
    'assets/js/admin.js' => 'JavaScript'
);

foreach ($files_to_check as $file => $description) {
    $file_path = plugin_dir_path(__FILE__) . $file;
    if (file_exists($file_path)) {
        echo "<p>✅ " . $description . " (" . $file . ")</p>";
    } else {
        echo "<p>❌ " . $description . " (" . $file . ") - ARQUIVO NÃO ENCONTRADO</p>";
    }
}

// Testar hooks
echo "<h2>Hooks do WordPress</h2>";

$hooks_to_check = array(
    'admin_menu' => 'Menu administrativo',
    'wp_ajax_vendzz_get_events' => 'AJAX para buscar eventos',
    'wp_ajax_vendzz_update_event' => 'AJAX para atualizar evento',
    'wp_ajax_vendzz_republish_event' => 'AJAX para republicar evento'
);

foreach ($hooks_to_check as $hook => $description) {
    if (has_action($hook)) {
        echo "<p>✅ " . $description . " (" . $hook . ")</p>";
    } else {
        echo "<p>❌ " . $description . " (" . $hook . ") - HOOK NÃO REGISTRADO</p>";
    }
}

// Testar tabela de logs
global $wpdb;
$table_name = $wpdb->prefix . 'vendzz_events_log';
$table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

if ($table_exists) {
    echo "<p>✅ Tabela de logs criada: " . $table_name . "</p>";
} else {
    echo "<p>⚠️ Tabela de logs não encontrada: " . $table_name . "</p>";
}

// Testar constantes
echo "<h2>Constantes do Plugin</h2>";

$constants_to_check = array(
    'VENDZZ_EVENTS_VERSION' => 'Versão do plugin',
    'VENDZZ_EVENTS_PLUGIN_URL' => 'URL do plugin',
    'VENDZZ_EVENTS_PLUGIN_PATH' => 'Caminho do plugin'
);

foreach ($constants_to_check as $constant => $description) {
    if (defined($constant)) {
        echo "<p>✅ " . $description . ": " . constant($constant) . "</p>";
    } else {
        echo "<p>❌ " . $description . " (" . $constant . ") - CONSTANTE NÃO DEFINIDA</p>";
    }
}

// Testar capacidades do usuário
echo "<h2>Capacidades do Usuário</h2>";

if (current_user_can('manage_options')) {
    echo "<p>✅ Usuário tem permissão para gerenciar opções</p>";
} else {
    echo "<p>❌ Usuário não tem permissão para gerenciar opções</p>";
}

// Resumo
echo "<h2>Resumo do Teste</h2>";
echo "<p>Se todos os itens acima estão marcados com ✅, o plugin está funcionando corretamente.</p>";
echo "<p>Se há itens marcados com ❌, verifique os erros e corrija-os.</p>";
echo "<p>Para testar a interface, vá para o painel administrativo do WordPress e procure pelo menu 'Eventos Manager'.</p>";