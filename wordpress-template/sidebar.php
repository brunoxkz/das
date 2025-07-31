<?php
/**
 * The sidebar containing the main widget area
 */

if (!is_active_sidebar('sidebar-1')) {
    return;
}
?>

<aside id="secondary" class="widget-area">
    <div class="sidebar-content">
        <?php dynamic_sidebar('sidebar-1'); ?>
        
        <!-- Default widgets if no widgets are active -->
        <?php if (!is_active_sidebar('sidebar-1')) : ?>
            <div class="widget">
                <h3 class="widget-title"><?php _e('Recent News', 'b2c2-template'); ?></h3>
                <ul>
                    <?php
                    $recent_posts = wp_get_recent_posts(array(
                        'numberposts' => 5,
                        'post_status' => 'publish'
                    ));
                    foreach ($recent_posts as $post) :
                    ?>
                        <li>
                            <a href="<?php echo get_permalink($post['ID']); ?>">
                                <?php echo $post['post_title']; ?>
                            </a>
                            <small><?php echo get_the_date('', $post['ID']); ?></small>
                        </li>
                    <?php endforeach; wp_reset_query(); ?>
                </ul>
            </div>
            
            <div class="widget">
                <h3 class="widget-title"><?php _e('Categories', 'b2c2-template'); ?></h3>
                <ul>
                    <?php wp_list_categories(array('title_li' => '')); ?>
                </ul>
            </div>
            
            <div class="widget">
                <h3 class="widget-title"><?php _e('Newsletter', 'b2c2-template'); ?></h3>
                <p><?php _e('Stay updated with our latest news and insights.', 'b2c2-template'); ?></p>
                <form class="newsletter-form" action="#" method="post">
                    <input type="email" name="email" placeholder="<?php _e('Your email', 'b2c2-template'); ?>" required>
                    <button type="submit" class="btn btn-primary"><?php _e('Subscribe', 'b2c2-template'); ?></button>
                </form>
            </div>
        <?php endif; ?>
    </div>
</aside><!-- #secondary -->