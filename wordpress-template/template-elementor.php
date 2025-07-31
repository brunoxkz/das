<?php
/**
 * Template for Elementor pages
 * Provides full-width layout for Elementor editing
 */

get_header(); ?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">
        
        <?php while (have_posts()) : the_post(); ?>
            
            <div class="elementor-page">
                <?php the_content(); ?>
            </div>
            
        <?php endwhile; ?>
        
    </main>
</div>

<?php get_footer(); ?>