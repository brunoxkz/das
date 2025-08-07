<?php
/**
 * The template for displaying single press releases
 * Based on B2C2.com press release structure
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <?php while (have_posts()) : the_post(); ?>
        
        <article id="post-<?php the_ID(); ?>" <?php post_class('press-release-single'); ?>>
            
            <!-- Hero Section for Press Release -->
            <section class="press-release-hero" style="background: linear-gradient(135deg, #111827 0%, #1F2937 100%); color: white; padding: 4rem 0; margin-bottom: 3rem;">
                <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
                    <div class="press-release-meta" style="margin-bottom: 1rem;">
                        <span style="color: #6B7280; font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                            Press Release
                        </span>
                        <span style="color: #6B7280; margin: 0 1rem;">•</span>
                        <time datetime="<?php echo get_the_date('c'); ?>" style="color: #6B7280; font-size: 0.875rem;">
                            <?php echo get_the_date('F j, Y'); ?>
                        </time>
                    </div>
                    
                    <h1 class="press-release-title" style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem; max-width: 800px;">
                        <?php the_title(); ?>
                    </h1>
                    
                    <?php if (has_excerpt()) : ?>
                        <div class="press-release-excerpt" style="font-size: 1.2rem; opacity: 0.9; line-height: 1.6; max-width: 700px;">
                            <?php the_excerpt(); ?>
                        </div>
                    <?php endif; ?>
                </div>
            </section>
            
            <!-- Featured Image -->
            <?php if (has_post_thumbnail()) : ?>
                <div class="press-release-image" style="margin-bottom: 3rem;">
                    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
                        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                            <?php the_post_thumbnail('large', array('style' => 'width: 100%; height: auto; display: block;')); ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Press Release Content -->
            <div class="press-release-content" style="padding: 0 0 4rem;">
                <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 2rem;">
                    <div class="entry-content" style="font-size: 1.1rem; line-height: 1.8; color: #374151;">
                        <?php the_content(); ?>
                    </div>
                    
                    <!-- Press Release Footer -->
                    <footer class="press-release-footer" style="margin-top: 3rem; padding: 2rem; background: #F9FAFB; border-radius: 12px; border-left: 4px solid #0066FF;">
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">
                            About B2C2
                        </h3>
                        <p style="color: #6B7280; margin-bottom: 0;">
                            B2C2 is a digital asset pioneer building the ecosystem of the future. Our success is built on a foundation of proprietary crypto-native technology combined with an innovative range of products, making us the partner of choice for diverse institutions globally.
                        </p>
                        
                        <!-- Social Share -->
                        <div class="social-share" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #E5E7EB;">
                            <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">
                                Share this press release:
                            </h4>
                            <div style="display: flex; gap: 1rem;">
                                <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode(get_permalink()); ?>&text=<?php echo urlencode(get_the_title()); ?>" 
                                   target="_blank" 
                                   style="display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: #1DA1F2; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
                                    <i class="fab fa-twitter" style="margin-right: 0.5rem;"></i>
                                    Twitter
                                </a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode(get_permalink()); ?>" 
                                   target="_blank" 
                                   style="display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: #0A66C2; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
                                    <i class="fab fa-linkedin" style="margin-right: 0.5rem;"></i>
                                    LinkedIn
                                </a>
                                <a href="mailto:?subject=<?php echo urlencode(get_the_title()); ?>&body=<?php echo urlencode(get_permalink()); ?>" 
                                   style="display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: #374151; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
                                    <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
                                    Email
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
            
        </article>
        
        <!-- Related Press Releases -->
        <section class="related-press-releases" style="padding: 4rem 0; background: #F9FAFB;">
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
                <h2 style="font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; margin-bottom: 2rem; color: #111827; text-align: center;">
                    Related Press Releases
                </h2>
                
                <div class="related-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                    <?php
                    // Query for related press releases
                    $related_query = new WP_Query(array(
                        'post_type' => 'press_release',
                        'posts_per_page' => 3,
                        'post_status' => 'publish',
                        'post__not_in' => array(get_the_ID()),
                        'orderby' => 'date',
                        'order' => 'DESC'
                    ));
                    
                    if ($related_query->have_posts()) :
                        while ($related_query->have_posts()) : $related_query->the_post();
                    ?>
                        <article class="related-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                            <?php if (has_post_thumbnail()) : ?>
                                <div style="width: 100%; height: 200px; overflow: hidden;">
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_post_thumbnail('medium_large', array('style' => 'width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;')); ?>
                                    </a>
                                </div>
                            <?php endif; ?>
                            
                            <div style="padding: 2rem;">
                                <span style="color: #6B7280; font-size: 0.875rem; font-weight: 500;">
                                    Press Release
                                </span>
                                
                                <h3 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0; line-height: 1.4;">
                                    <a href="<?php the_permalink(); ?>" style="color: #111827; text-decoration: none;">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>
                                
                                <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 1rem;">
                                    <?php echo get_the_date('F j, Y'); ?>
                                </p>
                                
                                <a href="<?php the_permalink(); ?>" style="color: #0066FF; font-weight: 500; text-decoration: none; font-size: 0.875rem;">
                                    Read more >
                                </a>
                            </div>
                        </article>
                    <?php 
                        endwhile;
                        wp_reset_postdata();
                    endif;
                    ?>
                </div>
            </div>
        </section>
        
    <?php endwhile; ?>
    
</main>

<style>
/* Responsive adjustments */
@media (max-width: 768px) {
    .press-release-hero {
        padding: 2rem 0 !important;
        margin-bottom: 2rem !important;
    }
    
    .press-release-content {
        padding: 0 0 2rem !important;
    }
    
    .related-press-releases {
        padding: 2rem 0 !important;
    }
    
    .related-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
    }
    
    .social-share div {
        flex-wrap: wrap !important;
        gap: 0.5rem !important;
    }
}

@media (max-width: 480px) {
    .press-release-hero .container,
    .press-release-content .container,
    .related-press-releases .container {
        padding: 0 1rem !important;
    }
    
    .press-release-footer {
        padding: 1.5rem !important;
    }
    
    .social-share div a {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.75rem !important;
    }
}

/* Hover effects */
.related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.related-card:hover img {
    transform: scale(1.05);
}

.social-share a:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>

<?php get_footer(); ?>