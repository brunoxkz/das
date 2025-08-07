<?php
/**
 * The template for displaying all single posts
 */

get_header(); ?>

<main id="primary" class="site-main">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <?php
                while (have_posts()) :
                    the_post();
                ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>
                        <header class="entry-header">
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
                            
                            <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                            
                            <div class="entry-meta">
                                <span class="posted-on">
                                    <i class="fas fa-calendar"></i>
                                    <?php echo get_the_date(); ?>
                                </span>
                                <?php if (get_the_author()) : ?>
                                    <span class="byline">
                                        <i class="fas fa-user"></i>
                                        <?php the_author(); ?>
                                    </span>
                                <?php endif; ?>
                            </div>
                        </header>

                        <?php if (has_post_thumbnail()) : ?>
                            <div class="post-thumbnail">
                                <?php the_post_thumbnail('large'); ?>
                            </div>
                        <?php endif; ?>

                        <div class="entry-content">
                            <?php
                            the_content(sprintf(
                                wp_kses(
                                    /* translators: %s: Name of current post. Only visible to screen readers */
                                    __('Continue reading<span class="screen-reader-text"> "%s"</span>', 'b2c2-template'),
                                    array(
                                        'span' => array(
                                            'class' => array(),
                                        ),
                                    )
                                ),
                                wp_kses_post(get_the_title())
                            ));

                            wp_link_pages(array(
                                'before' => '<div class="page-links">' . esc_html__('Pages:', 'b2c2-template'),
                                'after'  => '</div>',
                            ));
                            ?>
                        </div>

                        <footer class="entry-footer">
                            <?php
                            $tags_list = get_the_tag_list('', esc_html_x(', ', 'list item separator', 'b2c2-template'));
                            if ($tags_list) {
                                /* translators: 1: list of tags. */
                                printf('<span class="tags-links">' . esc_html__('Tagged %1$s', 'b2c2-template') . '</span>', $tags_list); // WPCS: XSS OK.
                            }
                            ?>
                        </footer>
                    </article>

                    <?php
                    // Post navigation
                    the_post_navigation(array(
                        'prev_text' => '<span class="nav-subtitle">' . esc_html__('Previous:', 'b2c2-template') . '</span> <span class="nav-title">%title</span>',
                        'next_text' => '<span class="nav-subtitle">' . esc_html__('Next:', 'b2c2-template') . '</span> <span class="nav-title">%title</span>',
                    ));

                    // If comments are open or we have at least one comment, load up the comment template.
                    if (comments_open() || get_comments_number()) :
                        comments_template();
                    endif;

                endwhile; // End of the loop.
                ?>
            </div>
            
            <div class="col-lg-4">
                <?php get_sidebar(); ?>
            </div>
        </div>
    </div>
</main>

<style>
.single-post {
    background: white;
    padding: 3rem;
    border-radius: 15px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.08);
    margin-bottom: 3rem;
}

.post-category {
    display: inline-block;
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.4rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.entry-title {
    margin-bottom: 1rem;
    color: #333;
    line-height: 1.2;
}

.entry-meta {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    color: #666;
    font-size: 0.9rem;
}

.entry-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.post-thumbnail {
    margin-bottom: 2rem;
    border-radius: 10px;
    overflow: hidden;
}

.post-thumbnail img {
    width: 100%;
    height: auto;
    display: block;
}

.entry-content {
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
}

.entry-content h2,
.entry-content h3,
.entry-content h4 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #333;
}

.entry-content p {
    margin-bottom: 1.5rem;
}

.entry-content ul,
.entry-content ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
}

.entry-content blockquote {
    background: #f8f9fa;
    border-left: 4px solid #0066FF;
    padding: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    border-radius: 5px;
}

.entry-footer {
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
    margin-top: 2rem;
}

.tags-links {
    color: #666;
    font-size: 0.9rem;
}

.tags-links a {
    color: #0066FF;
    text-decoration: none;
    margin: 0 0.25rem;
}

.tags-links a:hover {
    text-decoration: underline;
}

.post-navigation {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 3rem;
}

.post-navigation .nav-links {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
}

.post-navigation a {
    flex: 1;
    text-decoration: none;
    color: #333;
    transition: color 0.3s ease;
}

.post-navigation a:hover {
    color: #0066FF;
}

.nav-subtitle {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.nav-title {
    display: block;
    font-weight: 600;
}

@media (max-width: 768px) {
    .single-post {
        padding: 2rem 1.5rem;
    }
    
    .entry-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .post-navigation .nav-links {
        flex-direction: column;
    }
}
</style>

<?php get_footer(); ?>