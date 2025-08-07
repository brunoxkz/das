<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e('Skip to content', 'b2c2-template'); ?></a>

    <!-- B2C2 Header Exato -->
    <header id="masthead" class="site-header" style="background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #f0f0f0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            <div class="header-content" style="display: flex; align-items: center; justify-content: space-between; height: 80px;">
                
                <!-- B2C2 Logo -->
                <div class="site-branding" style="display: flex; align-items: center;">
                    <?php
                    if (has_custom_logo()) {
                        echo '<a href="' . esc_url(home_url('/')) . '" style="display: flex; align-items: center;">';
                        echo wp_get_attachment_image(get_theme_mod('custom_logo'), 'full', false, array(
                            'style' => 'height: 32px; width: auto;',
                            'alt' => get_bloginfo('name')
                        ));
                        echo '</a>';
                    } else {
                        ?>
                        <a href="<?php echo esc_url(home_url('/')); ?>" style="text-decoration: none; color: #1a1a1a;">
                            <div style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                B2C2
                            </div>
                        </a>
                        <?php
                    }
                    ?>
                </div>

                <!-- B2C2 Navigation Menu -->
                <nav id="site-navigation" class="main-navigation" style="display: flex; align-items: center;">
                    
                    <div class="nav-menu" style="display: flex; align-items: center; gap: 3rem;">
                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location' => 'primary',
                                'menu_id'        => 'primary-menu',
                                'container'      => false,
                                'menu_class'     => 'primary-menu',
                                'items_wrap'     => '<ul id="%1$s" class="%2$s" style="display: flex; list-style: none; margin: 0; padding: 0; gap: 3rem; align-items: center;">%3$s</ul>',
                                'walker'         => new B2C2_Nav_Walker(),
                                'fallback_cb'    => function() {
                                    echo '<ul class="primary-menu" style="display: flex; list-style: none; margin: 0; padding: 0; gap: 3rem; align-items: center;">
                                            <li><a href="' . home_url('/solutions') . '" style="color: #333; text-decoration: none; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; transition: color 0.2s ease;">Solutions</a></li>
                                            <li><a href="' . home_url('/about') . '" style="color: #333; text-decoration: none; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; transition: color 0.2s ease;">About</a></li>
                                            <li><a href="' . home_url('/insights') . '" style="color: #333; text-decoration: none; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; transition: color 0.2s ease;">Insights</a></li>
                                            <li><a href="' . home_url('/join-b2c2') . '" style="color: #333; text-decoration: none; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; transition: color 0.2s ease;">Join B2C2</a></li>
                                          </ul>';
                                }
                            )
                        );
                        ?>
                    </div>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="menu-toggle mobile-menu-toggle" style="display: none; background: none; border: none; font-size: 1.5rem; color: #333; cursor: pointer; margin-left: 1rem;">
                        <span style="display: block; width: 20px; height: 2px; background: #333; margin: 4px 0; transition: 0.3s;"></span>
                        <span style="display: block; width: 20px; height: 2px; background: #333; margin: 4px 0; transition: 0.3s;"></span>
                        <span style="display: block; width: 20px; height: 2px; background: #333; margin: 4px 0; transition: 0.3s;"></span>
                    </button>
                </nav><!-- #site-navigation -->
            </div>
        </div>
    </header><!-- #masthead -->