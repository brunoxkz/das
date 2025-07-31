<?php
/**
 * Template for displaying single insights
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        
        <?php while (have_posts()) : the_post(); ?>
        
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            
            <!-- Post Header -->
            <header class="entry-header" style="margin-bottom: 2rem; text-align: center;">
                
                <!-- Breadcrumb -->
                <nav style="margin-bottom: 1rem;">
                    <a href="<?php echo home_url('/insights'); ?>" style="color: #0066FF; text-decoration: none; font-size: 0.875rem;">
                        ← Back to Insights
                    </a>
                </nav>
                
                <!-- Title -->
                <h1 class="entry-title" style="font-size: 2.5rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">
                    <?php the_title(); ?>
                </h1>
                
                <!-- Meta Info -->
                <div class="entry-meta" style="color: #6b7280; font-size: 0.875rem;">
                    <time datetime="<?php echo get_the_date('c'); ?>">
                        <?php echo get_the_date('F j, Y'); ?>
                    </time>
                    <?php if (get_the_author()) : ?>
                        <span style="margin: 0 0.5rem;">•</span>
                        <span>By <?php the_author(); ?></span>
                    <?php endif; ?>
                </div>
                
                <!-- Featured Image -->
                <?php if (has_post_thumbnail()) : ?>
                    <div style="margin: 2rem 0;">
                        <?php the_post_thumbnail('large', array(
                            'style' => 'width: 100%; height: 400px; object-fit: cover; border-radius: 12px;'
                        )); ?>
                    </div>
                <?php endif; ?>
                
            </header>
            
            <!-- Post Content -->
            <div class="entry-content" style="line-height: 1.8; color: #374151; font-size: 1.125rem;">
                <?php
                the_content();
                
                wp_link_pages(array(
                    'before' => '<div class="page-links" style="margin: 2rem 0; text-align: center;">',
                    'after'  => '</div>',
                    'link_before' => '<span style="display: inline-block; padding: 0.5rem 1rem; margin: 0 0.25rem; background: #f3f4f6; border-radius: 6px; text-decoration: none;">',
                    'link_after' => '</span>',
                ));
                ?>
            </div>
            
            <!-- Post Footer -->
            <footer class="entry-footer" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                
                <!-- Tags -->
                <?php
                $tags = get_the_tags();
                if ($tags) :
                ?>
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #111827; margin-bottom: 1rem;">Tags:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        <?php foreach ($tags as $tag) : ?>
                            <a href="<?php echo get_tag_link($tag->term_id); ?>" 
                               style="background: #f3f4f6; color: #374151; padding: 0.25rem 0.75rem; border-radius: 20px; text-decoration: none; font-size: 0.875rem;">
                                <?php echo $tag->name; ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Share Buttons -->
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #111827; margin-bottom: 1rem;">Share this insight:</h4>
                    <div style="display: flex; gap: 1rem;">
                        <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode(get_permalink()); ?>&text=<?php echo urlencode(get_the_title()); ?>" 
                           target="_blank" 
                           style="background: #1da1f2; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.875rem;">
                            Twitter
                        </a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode(get_permalink()); ?>" 
                           target="_blank" 
                           style="background: #0077b5; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.875rem;">
                            LinkedIn
                        </a>
                        <a href="mailto:?subject=<?php echo urlencode(get_the_title()); ?>&body=<?php echo urlencode(get_permalink()); ?>" 
                           style="background: #6b7280; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.875rem;">
                            Email
                        </a>
                    </div>
                </div>
                
            </footer>
            
        </article>
        
        <?php endwhile; ?>
        
        <!-- Related Insights -->
        <section style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
            <h3 style="font-size: 1.75rem; font-weight: 700; color: #111827; margin-bottom: 2rem;">
                Related Insights
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <?php
                $related_insights = new WP_Query(array(
                    'post_type' => 'insight',
                    'posts_per_page' => 3,
                    'post__not_in' => array(get_the_ID()),
                    'orderby' => 'rand'
                ));
                
                if ($related_insights->have_posts()) :
                    while ($related_insights->have_posts()) : $related_insights->the_post();
                ?>
                <article style="background: #f8fafc; border-radius: 12px; padding: 1.5rem;">
                    <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">
                        <a href="<?php the_permalink(); ?>" style="color: #111827; text-decoration: none;">
                            <?php the_title(); ?>
                        </a>
                    </h4>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
                        <?php echo wp_trim_words(get_the_excerpt(), 15, '...'); ?>
                    </p>
                    <a href="<?php the_permalink(); ?>" style="color: #0066FF; text-decoration: none; font-size: 0.875rem; font-weight: 600;">
                        Read More →
                    </a>
                </article>
                <?php 
                    endwhile;
                    wp_reset_postdata();
                endif;
                ?>
            </div>
        </section>
        
    </div>
</main>

<?php
get_footer();
?>