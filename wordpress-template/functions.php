<?php
/**
 * B2C2 Corporate Template Functions
 * 100% Elementor Compatible WordPress Theme
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
function b2c2_theme_setup() {
    // Add theme support for various features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    add_theme_support('custom-logo');
    add_theme_support('customize-selective-refresh-widgets');
    add_theme_support('post-formats', array(
        'aside',
        'gallery',
        'quote',
        'image',
        'video'
    ));
    
    // Add support for responsive embeds
    add_theme_support('responsive-embeds');
    
    // Add support for editor styles
    add_theme_support('editor-styles');
    
    // Add support for wide alignment
    add_theme_support('align-wide');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => esc_html__('Primary Menu', 'b2c2-template'),
        'footer' => esc_html__('Footer Menu', 'b2c2-template'),
        'mobile' => esc_html__('Mobile Menu', 'b2c2-template'),
    ));
    
    // Set content width
    $GLOBALS['content_width'] = 1140;
}
add_action('after_setup_theme', 'b2c2_theme_setup');

// Enqueue styles and scripts
function b2c2_enqueue_assets() {
    // Main stylesheet
    wp_enqueue_style('b2c2-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Google Fonts
    wp_enqueue_style('b2c2-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap', array(), '1.0.0');
    
    // Font Awesome
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', array(), '6.0.0');
    
    // Main JavaScript (apenas se existir)
    if (file_exists(get_template_directory() . '/assets/js/main.js')) {
        wp_enqueue_script('b2c2-main', get_template_directory_uri() . '/assets/js/main.js', array('jquery'), '1.0.0', true);
    }
    
    // CSS adicional para responsividade avançada
    wp_add_inline_style('b2c2-style', '
        .hero-section { min-height: 100vh; display: flex; align-items: center; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .institutional-solutions { padding: 4rem 0; }
        @media (max-width: 768px) {
            .hero-section { min-height: 80vh; padding: 2rem 0; }
            .news-grid { grid-template-columns: 1fr; gap: 1rem; }
        }
    ');
    
    // Comment reply script
    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'b2c2_enqueue_assets');

// Elementor Support
function b2c2_elementor_support() {
    // Add Elementor support
    add_theme_support('elementor');
    
    // Add support for Elementor Pro features
    add_theme_support('elementor-pro');
    
    // Custom breakpoints for responsive design
    add_theme_support('custom-breakpoints');
}
add_action('after_setup_theme', 'b2c2_elementor_support');

// Register widget areas
function b2c2_widgets_init() {
    register_sidebar(array(
        'name'          => esc_html__('Sidebar', 'b2c2-template'),
        'id'            => 'sidebar-1',
        'description'   => esc_html__('Add widgets here.', 'b2c2-template'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => esc_html__('Footer Area 1', 'b2c2-template'),
        'id'            => 'footer-1',
        'description'   => esc_html__('Footer widget area 1.', 'b2c2-template'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => esc_html__('Footer Area 2', 'b2c2-template'),
        'id'            => 'footer-2',
        'description'   => esc_html__('Footer widget area 2.', 'b2c2-template'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => esc_html__('Footer Area 3', 'b2c2-template'),
        'id'            => 'footer-3',
        'description'   => esc_html__('Footer widget area 3.', 'b2c2-template'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => esc_html__('Footer Area 4', 'b2c2-template'),
        'id'            => 'footer-4',
        'description'   => esc_html__('Footer widget area 4.', 'b2c2-template'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'b2c2_widgets_init');

// Custom Post Types
function b2c2_register_post_types() {
    // News/Press Releases
    register_post_type('press_release', array(
        'labels' => array(
            'name' => 'Press Releases',
            'singular_name' => 'Press Release',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Press Release',
            'edit_item' => 'Edit Press Release',
            'new_item' => 'New Press Release',
            'view_item' => 'View Press Release',
            'search_items' => 'Search Press Releases',
            'not_found' => 'No press releases found',
            'not_found_in_trash' => 'No press releases found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'news'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-megaphone',
        'show_in_rest' => true,
    ));
    
    // Services
    register_post_type('service', array(
        'labels' => array(
            'name' => 'Services',
            'singular_name' => 'Service',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Service',
            'edit_item' => 'Edit Service',
            'new_item' => 'New Service',
            'view_item' => 'View Service',
            'search_items' => 'Search Services',
            'not_found' => 'No services found',
            'not_found_in_trash' => 'No services found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'services'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-portfolio',
        'show_in_rest' => true,
    ));
    
    // Institutional Solutions (baseado no B2C2 real)
    register_post_type('institutional_solution', array(
        'labels' => array(
            'name' => 'Institutional Solutions',
            'singular_name' => 'Institutional Solution',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Solution',
            'edit_item' => 'Edit Solution',
            'new_item' => 'New Solution',
            'view_item' => 'View Solution',
            'search_items' => 'Search Solutions',
            'not_found' => 'No solutions found',
            'not_found_in_trash' => 'No solutions found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'solutions'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'),
        'menu_icon' => 'dashicons-portfolio',
        'show_in_rest' => true,
    ));
    
    // Events (presente no B2C2)
    register_post_type('event', array(
        'labels' => array(
            'name' => 'Events',
            'singular_name' => 'Event',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Event',
            'edit_item' => 'Edit Event',
            'new_item' => 'New Event',
            'view_item' => 'View Event',
            'search_items' => 'Search Events',
            'not_found' => 'No events found',
            'not_found_in_trash' => 'No events found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'events'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-calendar-alt',
        'show_in_rest' => true,
    ));
    
    // Insights (para "Institutional Insights")
    register_post_type('insight', array(
        'labels' => array(
            'name' => 'Insights',
            'singular_name' => 'Insight',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Insight',
            'edit_item' => 'Edit Insight',
            'new_item' => 'New Insight',
            'view_item' => 'View Insight',
            'search_items' => 'Search Insights',
            'not_found' => 'No insights found',
            'not_found_in_trash' => 'No insights found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'insights'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-lightbulb',
        'show_in_rest' => true,
    ));
}
add_action('init', 'b2c2_register_post_types');

// Custom Taxonomies
function b2c2_register_taxonomies() {
    // News Categories
    register_taxonomy('news_category', 'press_release', array(
        'labels' => array(
            'name' => 'News Categories',
            'singular_name' => 'News Category',
            'search_items' => 'Search News Categories',
            'all_items' => 'All News Categories',
            'edit_item' => 'Edit News Category',
            'update_item' => 'Update News Category',
            'add_new_item' => 'Add New News Category',
            'new_item_name' => 'New News Category Name',
            'menu_name' => 'Categories',
        ),
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'news-category'),
        'show_in_rest' => true,
    ));
    
    // Service Categories
    register_taxonomy('service_category', 'service', array(
        'labels' => array(
            'name' => 'Service Categories',
            'singular_name' => 'Service Category',
            'search_items' => 'Search Service Categories',
            'all_items' => 'All Service Categories',
            'edit_item' => 'Edit Service Category',
            'update_item' => 'Update Service Category',
            'add_new_item' => 'Add New Service Category',
            'new_item_name' => 'New Service Category Name',
            'menu_name' => 'Categories',
        ),
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'service-category'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'b2c2_register_taxonomies');

// Add Elementor locations support and custom conditions
function b2c2_elementor_locations() {
    if (did_action('elementor/loaded')) {
        // Register header location
        \Elementor\Plugin::$instance->locations_manager->register_all_core_location();
    }
}
add_action('init', 'b2c2_elementor_locations');

// Make custom post types available in Elementor
function b2c2_elementor_cpt_support() {
    // Custom Post Types support
    $cpt_support = get_option('elementor_cpt_support');
    
    if (!$cpt_support) {
        $cpt_support = array('page', 'post', 'press_release', 'service', 'institutional_solution', 'event', 'insight');
        update_option('elementor_cpt_support', $cpt_support);
    } else {
        $cpt_support = array_merge($cpt_support, array('press_release', 'service', 'institutional_solution', 'event', 'insight'));
        update_option('elementor_cpt_support', $cpt_support);
    }
}
add_action('after_setup_theme', 'b2c2_elementor_cpt_support');

// Enhance Elementor compatibility for theme
function b2c2_elementor_theme_support() {
    add_theme_support('elementor');
    add_theme_support('elementor-pro');
    
    // Support for Elementor color schemes
    add_theme_support('elementor-color-schemes');
    
    // Support for Elementor typography schemes
    add_theme_support('elementor-typography-schemes');
    
    // Custom CSS loading
    add_theme_support('elementor-custom-css');
}
add_action('after_setup_theme', 'b2c2_elementor_theme_support');

// Register dynamic content for Elementor
function b2c2_register_elementor_dynamic_tags($dynamic_tags) {
    \Elementor\Plugin::$instance->dynamic_tags->register_group('b2c2-theme', [
        'title' => 'B2C2 Theme'
    ]);
}
add_action('elementor/dynamic_tags/register_tags', 'b2c2_register_elementor_dynamic_tags');

// Customize excerpt length
function b2c2_excerpt_length($length) {
    return 30;
}
add_filter('excerpt_length', 'b2c2_excerpt_length');

// Customize excerpt more
function b2c2_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'b2c2_excerpt_more');

// Add custom fields support for Elementor
function b2c2_add_elementor_support() {
    add_post_type_support('page', 'custom-fields');
    add_post_type_support('post', 'custom-fields');
    add_post_type_support('press_release', 'custom-fields');
    add_post_type_support('service', 'custom-fields');
    add_post_type_support('team_member', 'custom-fields');
}
add_action('init', 'b2c2_add_elementor_support');

// Custom logo support
function b2c2_custom_logo_setup() {
    $defaults = array(
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
        'header-text' => array('site-title', 'site-description'),
    );
    add_theme_support('custom-logo', $defaults);
}
add_action('after_setup_theme', 'b2c2_custom_logo_setup');

// Custom Navigation Walker
class B2C2_Nav_Walker extends Walker_Nav_Menu {
    function start_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "\n$indent<ul class=\"sub-menu\">\n";
    }

    function end_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "$indent</ul>\n";
    }

    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        $class_names = $value = '';
        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;
        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';
        $id = apply_filters('nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        $output .= $indent . '<li' . $id . $value . $class_names .'>';
        $attributes = ! empty($item->attr_title) ? ' title="' . esc_attr($item->attr_title) .'"' : '';
        $attributes .= ! empty($item->target) ? ' target="' . esc_attr($item->target ) .'"' : '';
        $attributes .= ! empty($item->xfn) ? ' rel="' . esc_attr($item->xfn ) .'"' : '';
        $attributes .= ! empty($item->url) ? ' href="' . esc_attr($item->url ) .'"' : '';
        $item_output = isset($args->before) ? $args->before : '';
        $item_output .= '<a' . $attributes . ' style="color: #374151; text-decoration: none; font-weight: 500; padding: 0.5rem 0; transition: color 0.3s ease;">';
        $item_output .= (isset($args->link_before) ? $args->link_before : '') . apply_filters('the_title', $item->title, $item->ID) . (isset($args->link_after) ? $args->link_after : '');
        $item_output .= '</a>';
        $item_output .= isset($args->after) ? $args->after : '';
        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }

    function end_el(&$output, $item, $depth = 0, $args = null) {
        $output .= "</li>\n";
    }
}

// Fallback menu function
function b2c2_fallback_menu() {
    echo '<ul class="primary-menu" style="display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem;">
            <li><a href="' . home_url('/') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Home</a></li>
            <li><a href="' . home_url('/solutions') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Solutions</a></li>
            <li><a href="' . home_url('/insights') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Insights</a></li>
            <li><a href="' . home_url('/news') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">News</a></li>
            <li><a href="' . home_url('/contact') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Contact</a></li>
          </ul>';
}

// Customizer settings
function b2c2_customize_register($wp_customize) {
    // Site Identity improvements
    $wp_customize->get_setting('blogname')->transport = 'postMessage';
    $wp_customize->get_setting('blogdescription')->transport = 'postMessage';
    
    // Colors section
    $wp_customize->add_section('b2c2_colors', array(
        'title' => __('Theme Colors', 'b2c2-template'),
        'priority' => 30,
    ));
    
    // Primary color
    $wp_customize->add_setting('primary_color', array(
        'default' => '#0066FF',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'primary_color', array(
        'label' => __('Primary Color', 'b2c2-template'),
        'section' => 'b2c2_colors',
        'settings' => 'primary_color',
    )));
    
    // Secondary color
    $wp_customize->add_setting('secondary_color', array(
        'default' => '#764ba2',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'secondary_color', array(
        'label' => __('Secondary Color', 'b2c2-template'),
        'section' => 'b2c2_colors',
        'settings' => 'secondary_color',
    )));
    
    // Footer section
    $wp_customize->add_section('b2c2_footer', array(
        'title' => __('Footer Settings', 'b2c2-template'),
        'priority' => 35,
    ));
    
    // Footer text
    $wp_customize->add_setting('footer_text', array(
        'default' => __('© 2025 Your Company Name. All rights reserved.', 'b2c2-template'),
        'sanitize_callback' => 'wp_kses_post',
    ));
    
    $wp_customize->add_control('footer_text', array(
        'label' => __('Footer Text', 'b2c2-template'),
        'section' => 'b2c2_footer',
        'type' => 'textarea',
    ));
    
    // Homepage Statistics section
    $wp_customize->add_section('b2c2_stats', array(
        'title' => __('Homepage Statistics', 'b2c2-template'),
        'priority' => 35,
    ));
    
    // Statistics title
    $wp_customize->add_setting('stats_section_title', array(
        'default' => 'Institutional-grade Performance',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('stats_section_title', array(
        'label' => __('Statistics Section Title', 'b2c2-template'),
        'section' => 'b2c2_stats',
        'type' => 'text',
    ));
    
    // Statistics subtitle
    $wp_customize->add_setting('stats_section_subtitle', array(
        'default' => 'Trusted by institutions globally with industry-leading metrics',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('stats_section_subtitle', array(
        'label' => __('Statistics Section Subtitle', 'b2c2-template'),
        'section' => 'b2c2_stats',
        'type' => 'text',
    ));
    
    // Statistics items (4 stats)
    for ($i = 1; $i <= 4; $i++) {
        $wp_customize->add_setting("stat_{$i}_number", array(
            'default' => $i === 1 ? '$500B+' : ($i === 2 ? '200+' : ($i === 3 ? '24/7' : '15ms')),
            'sanitize_callback' => 'sanitize_text_field',
        ));
        
        $wp_customize->add_control("stat_{$i}_number", array(
            'label' => __("Statistic {$i} Number", 'b2c2-template'),
            'section' => 'b2c2_stats',
            'type' => 'text',
        ));
        
        $wp_customize->add_setting("stat_{$i}_label", array(
            'default' => $i === 1 ? 'Monthly Trading Volume' : ($i === 2 ? 'Institutional Clients' : ($i === 3 ? 'Market Coverage' : 'Average Latency')),
            'sanitize_callback' => 'sanitize_text_field',
        ));
        
        $wp_customize->add_control("stat_{$i}_label", array(
            'label' => __("Statistic {$i} Label", 'b2c2-template'),
            'section' => 'b2c2_stats',
            'type' => 'text',
        ));
    }
    
    // Social media section
    $wp_customize->add_section('b2c2_social', array(
        'title' => __('Social Media', 'b2c2-template'),
        'priority' => 40,
    ));
    
    // Social media links
    $social_sites = array(
        'facebook' => 'Facebook',
        'twitter' => 'Twitter',
        'linkedin' => 'LinkedIn',
        'instagram' => 'Instagram',
        'youtube' => 'YouTube',
    );
    
    foreach ($social_sites as $social_site => $label) {
        $wp_customize->add_setting($social_site, array(
            'default' => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        
        $wp_customize->add_control($social_site, array(
            'label' => $label . ' URL',
            'section' => 'b2c2_social',
            'type' => 'url',
        ));
    }
}
add_action('customize_register', 'b2c2_customize_register');

// Output custom colors CSS
function b2c2_custom_colors_css() {
    $primary_color = get_theme_mod('primary_color', '#0066FF');
    $secondary_color = get_theme_mod('secondary_color', '#764ba2');
    
    ?>
    <style type="text/css">
        :root {
            --primary-color: <?php echo esc_attr($primary_color); ?>;
            --secondary-color: <?php echo esc_attr($secondary_color); ?>;
        }
        
        .btn-primary,
        .cta-button {
            background-color: var(--primary-color) !important;
        }
        
        .hero-section {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%) !important;
        }
        
        a,
        .text-primary {
            color: var(--primary-color) !important;
        }
        
        .feature-icon {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%) !important;
        }
    </style>
    <?php
}
add_action('wp_head', 'b2c2_custom_colors_css');

// Add theme support for WooCommerce
function b2c2_woocommerce_support() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
}
add_action('after_setup_theme', 'b2c2_woocommerce_support');

// Custom body classes
function b2c2_body_classes($classes) {
    // Add class if Elementor is active
    if (did_action('elementor/loaded')) {
        $classes[] = 'elementor-active';
    }
    
    // Add class for mobile menu
    $classes[] = 'has-mobile-menu';
    
    return $classes;
}
add_filter('body_class', 'b2c2_body_classes');

// Security enhancements
function b2c2_security_headers() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}
add_action('send_headers', 'b2c2_security_headers');

// Performance optimizations
function b2c2_performance_optimizations() {
    // Remove WordPress version from head
    remove_action('wp_head', 'wp_generator');
    
    // Remove RSD link
    remove_action('wp_head', 'rsd_link');
    
    // Remove Windows Live Writer link
    remove_action('wp_head', 'wlwmanifest_link');
    
    // Remove shortlink
    remove_action('wp_head', 'wp_shortlink_wp_head');
    
    // Disable emoji scripts
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
}
add_action('init', 'b2c2_performance_optimizations');

// Admin customizations
function b2c2_admin_styles() {
    echo '<style>
        .post-type-press_release .dashicons-megaphone:before { color: #0066FF; }
        .post-type-service .dashicons-portfolio:before { color: #764ba2; }
        .post-type-team_member .dashicons-groups:before { color: #28a745; }
    </style>';
}
add_action('admin_head', 'b2c2_admin_styles');

// Custom image sizes
function b2c2_image_sizes() {
    add_image_size('news-thumbnail', 400, 250, true);
    add_image_size('service-thumbnail', 350, 200, true);
    add_image_size('team-thumbnail', 300, 300, true);
    add_image_size('hero-image', 1920, 800, true);
}
add_action('after_setup_theme', 'b2c2_image_sizes');

// Template loader for Elementor
function b2c2_elementor_template_loader($template) {
    if (is_singular() && get_post_meta(get_the_ID(), '_elementor_edit_mode', true)) {
        $elementor_template = locate_template('elementor-template.php');
        if ($elementor_template) {
            return $elementor_template;
        }
    }
    return $template;
}
add_filter('template_include', 'b2c2_elementor_template_loader');

?>