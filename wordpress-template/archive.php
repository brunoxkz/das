<?php
/**
 * The template for displaying archive pages
 */

get_header(); ?>

<main id="primary" class="site-main">
    <div class="container">
        <?php if (have_posts()) : ?>
            
            <header class="page-header">
                <?php
                the_archive_title('<h1 class="page-title">', '</h1>');
                the_archive_description('<div class="archive-description">', '</div>');
                ?>
            </header>
            
            <div class="archive-content">
                <div class="row">
                    <?php
                    while (have_posts()) :
                        the_post();
                    ?>
                        <div class="col-md-6 col-lg-4">
                            <article id="post-<?php the_ID(); ?>" <?php post_class('archive-item'); ?>>
                                <?php if (has_post_thumbnail()) : ?>
                                    <div class="post-thumbnail">
                                        <a href="<?php the_permalink(); ?>">
                                            <?php the_post_thumbnail('medium'); ?>
                                        </a>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="post-content">
                                    <?php
                                    if (get_post_type() === 'press_release') {
                                        $terms = get_the_terms(get_the_ID(), 'news_category');
                                        if ($terms && !is_wp_error($terms)) {
                                            echo '<span class="post-category">' . esc_html($terms[0]->name) . '</span>';
                                        } else {
                                            echo '<span class="post-category">Press Release</span>';
                                        }
                                    } else {
                                        $categories = get_the_category();
                                        if ($categories) {
                                            echo '<span class="post-category">' . esc_html($categories[0]->name) . '</span>';
                                        }
                                    }
                                    ?>
                                    
                                    <h3 class="post-title">
                                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                    </h3>
                                    
                                    <div class="post-meta">
                                        <span class="post-date"><?php echo get_the_date(); ?></span>
                                    </div>
                                    
                                    <div class="post-excerpt">
                                        <?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?>
                                    </div>
                                    
                                    <a href="<?php the_permalink(); ?>" class="read-more">
                                        <?php _e('Read more', 'b2c2-template'); ?> >
                                    </a>
                                </div>
                            </article>
                        </div>
                    <?php endwhile; ?>
                </div>
                
                <?php
                the_posts_pagination(array(
                    'prev_text' => __('Previous', 'b2c2-template'),
                    'next_text' => __('Next', 'b2c2-template'),
                ));
                ?>
            </div>
            
        <?php else : ?>
            
            <div class="no-posts-found">
                <h2><?php _e('Nothing found', 'b2c2-template'); ?></h2>
                <p><?php _e('It seems we can\'t find what you\'re looking for. Perhaps searching can help.', 'b2c2-template'); ?></p>
                <?php get_search_form(); ?>
            </div>
            
        <?php endif; ?>
    </div>
</main>

<style>
.page-header {
    text-align: center;
    padding: 3rem 0;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
}

.page-title {
    margin-bottom: 1rem;
    font-size: 2.5rem;
    font-weight: 700;
}

.archive-description {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
}

.archive-item {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    margin-bottom: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.archive-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.post-thumbnail {
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.post-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.archive-item:hover .post-thumbnail img {
    transform: scale(1.05);
}

.post-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.post-category {
    display: inline-block;
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.post-title {
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
    line-height: 1.3;
}

.post-title a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
}

.post-title a:hover {
    color: #0066FF;
}

.post-meta {
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;
}

.post-excerpt {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
    flex: 1;
}

.read-more {
    color: #0066FF;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-decoration: none;
    transition: color 0.3s ease;
    margin-top: auto;
}

.read-more:hover {
    color: #0052CC;
    text-decoration: none;
}

.no-posts-found {
    text-align: center;
    padding: 4rem 2rem;
    background: #f8f9fa;
    border-radius: 15px;
}

.no-posts-found h2 {
    margin-bottom: 1rem;
    color: #333;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    gap: 0.5rem;
}

.pagination .page-numbers {
    display: inline-block;
    padding: 12px 16px;
    color: #666;
    background: white;
    border: 2px solid #ddd;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.pagination .page-numbers:hover,
.pagination .page-numbers.current {
    background: #0066FF;
    color: white;
    border-color: #0066FF;
}

@media (max-width: 768px) {
    .page-header {
        padding: 2rem 1rem;
    }
    
    .page-title {
        font-size: 2rem;
    }
    
    .archive-content .row {
        margin: 0;
    }
    
    .archive-content [class*="col-"] {
        padding: 0 0 2rem 0;
    }
}
</style>

<?php get_footer(); ?>