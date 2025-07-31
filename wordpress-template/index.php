<?php
/**
 * The main template file
 * 
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <?php if (have_posts()) : ?>
        
        <?php if (is_home() && !is_front_page()) : ?>
            <header class="page-header">
                <div class="container">
                    <h1 class="page-title"><?php single_post_title(); ?></h1>
                </div>
            </header>
        <?php endif; ?>
        
        <div class="container">
            <div class="row">
                <div class="col-lg-8">
                    <div class="posts-container">
                        <?php
                        // Start the Loop
                        while (have_posts()) :
                            the_post();
                            
                            /*
                             * Include the Post-Type-specific template for the content.
                             * If you want to override this in a child theme, then include a file
                             * called content-___.php (where ___ is the Post Type name) and that will be used instead.
                             */
                            get_template_part('template-parts/content', get_post_type());
                            
                        endwhile;
                        
                        // Navigation
                        the_posts_navigation(array(
                            'prev_text' => __('Older posts', 'b2c2-template'),
                            'next_text' => __('Newer posts', 'b2c2-template'),
                        ));
                        ?>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <?php get_sidebar(); ?>
                </div>
            </div>
        </div>
        
    <?php else : ?>
        
        <div class="container">
            <div class="no-posts-found">
                <h2><?php _e('Nothing here', 'b2c2-template'); ?></h2>
                <p><?php _e('It looks like nothing was found at this location. Maybe try one of the links below or a search?', 'b2c2-template'); ?></p>
                <?php get_search_form(); ?>
            </div>
        </div>
        
    <?php endif; ?>
    
</main>

<?php get_footer(); ?>