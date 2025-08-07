<?php
/**
 * Template for displaying press release archive (News page)
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        
        <!-- Page Header -->
        <header class="page-header" style="text-align: center; margin-bottom: 4rem;">
            <h1 style="font-size: 3rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">
                Company News
            </h1>
            <p style="font-size: 1.125rem; color: #6b7280; max-width: 600px; margin: 0 auto;">
                Latest press releases, announcements, and company updates
            </p>
        </header>
        
        <!-- Filter Categories (editável via WordPress) -->
        <?php
        $news_categories = get_terms(array(
            'taxonomy' => 'news_category',
            'hide_empty' => true,
        ));
        
        if (!empty($news_categories) && !is_wp_error($news_categories)) :
        ?>
        <div class="category-filter" style="text-align: center; margin-bottom: 3rem;">
            <div style="display: inline-flex; background: #f8fafc; border-radius: 12px; padding: 0.5rem; gap: 0.5rem;">
                <a href="<?php echo get_post_type_archive_link('press_release'); ?>" 
                   style="padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; color: #374151; background: white;">
                    All News
                </a>
                <?php foreach ($news_categories as $category) : ?>
                <a href="<?php echo get_term_link($category); ?>" 
                   style="padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; color: #374151; transition: background 0.3s ease;">
                    <?php echo $category->name; ?>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- News Grid -->
        <div class="news-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
            
            <?php if (have_posts()) : ?>
                <?php while (have_posts()) : the_post(); ?>
                
                <article style="background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.3s ease;">
                    
                    <!-- Featured Image -->
                    <?php if (has_post_thumbnail()) : ?>
                    <div style="position: relative; height: 200px; overflow: hidden;">
                        <a href="<?php the_permalink(); ?>">
                            <?php the_post_thumbnail('medium_large', array(
                                'style' => 'width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;'
                            )); ?>
                        </a>
                        
                        <!-- Category Badge -->
                        <?php
                        $categories = get_the_terms(get_the_ID(), 'news_category');
                        if ($categories && !is_wp_error($categories)) :
                            $category = array_shift($categories);
                        ?>
                        <span style="position: absolute; top: 1rem; left: 1rem; background: #0066FF; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                            <?php echo $category->name; ?>
                        </span>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Content -->
                    <div style="padding: 1.5rem;">
                        
                        <!-- Date -->
                        <time style="color: #9ca3af; font-size: 0.875rem; font-weight: 500;">
                            <?php echo get_the_date('F j, Y'); ?>
                        </time>
                        
                        <!-- Title -->
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0.5rem 0 1rem; line-height: 1.4;">
                            <a href="<?php the_permalink(); ?>" style="color: inherit; text-decoration: none;">
                                <?php the_title(); ?>
                            </a>
                        </h2>
                        
                        <!-- Excerpt -->
                        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">
                            <?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?>
                        </p>
                        
                        <!-- Read More -->
                        <a href="<?php the_permalink(); ?>" 
                           style="color: #0066FF; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                            Read Full Release →
                        </a>
                        
                    </div>
                </article>
                
                <?php endwhile; ?>
                
            <?php else : ?>
                
                <!-- No posts message -->
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                    <h3 style="font-size: 1.5rem; color: #6b7280; margin-bottom: 1rem;">
                        No press releases found
                    </h3>
                    <p style="color: #9ca3af;">
                        Check back soon for company news and announcements.
                    </p>
                </div>
                
            <?php endif; ?>
            
        </div>
        
        <!-- Pagination -->
        <?php if (function_exists('the_posts_pagination')) : ?>
        <div style="margin-top: 4rem; text-align: center;">
            <?php
            the_posts_pagination(array(
                'prev_text' => '← Previous',
                'next_text' => 'Next →',
                'before_page_number' => '<span class="screen-reader-text">Page </span>',
            ));
            ?>
        </div>
        <?php endif; ?>
        
    </div>
</main>

<?php
get_footer();
?>