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

    <header id="masthead" class="site-header" style="background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; position: sticky; top: 0; z-index: 1000;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="header-content" style="display: flex; align-items: center; justify-content: space-between;">
                <div class="site-branding" style="display: flex; align-items: center;">
                    <?php
                    if (has_custom_logo()) {
                        the_custom_logo();
                    } else {
                        if (is_front_page() && is_home()) :
                            ?>
                            <h1 class="site-title" style="margin: 0; font-size: 1.75rem; font-weight: 700; color: #111827;">
                                <a href="<?php echo esc_url(home_url('/')); ?>" rel="home" style="text-decoration: none; color: inherit;">
                                    <?php bloginfo('name'); ?>
                                </a>
                            </h1>
                            <?php
                        else :
                            ?>
                            <p class="site-title" style="margin: 0; font-size: 1.75rem; font-weight: 700; color: #111827;">
                                <a href="<?php echo esc_url(home_url('/')); ?>" rel="home" style="text-decoration: none; color: inherit;">
                                    <?php bloginfo('name'); ?>
                                </a>
                            </p>
                            <?php
                        endif;
                    }
                    ?>
                </div><!-- .site-branding -->

                <nav id="site-navigation" class="main-navigation" style="display: flex; align-items: center; gap: 2rem;">
                    <button class="menu-toggle mobile-menu-toggle" style="display: none; background: none; border: none; font-size: 1.5rem; color: #111827; cursor: pointer;">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <div class="nav-menu" style="display: flex; align-items: center; gap: 2rem;">
                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location' => 'primary',
                                'menu_id'        => 'primary-menu',
                                'container'      => false,
                                'menu_class'     => 'primary-menu',
                                'items_wrap'     => '<ul id="%1$s" class="%2$s" style="display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem;">%3$s</ul>',
                                'fallback_cb'    => function() {
                                    echo '<ul class="primary-menu" style="display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem;">
                                            <li><a href="' . home_url('/') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Home</a></li>
                                            <li><a href="' . home_url('/solutions') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Solutions</a></li>
                                            <li><a href="' . home_url('/insights') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Insights</a></li>
                                            <li><a href="' . home_url('/news') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">News</a></li>
                                            <li><a href="' . home_url('/contact') . '" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Contact</a></li>
                                          </ul>';
                                }
                            )
                        );
                        ?>
                        
                        <a href="/client-onboarding" style="background: #0066FF; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: background 0.3s ease;">
                            Client Portal
                        </a>
                    </div>
                </nav><!-- #site-navigation -->
            </div>
        </div>
    </header><!-- #masthead -->