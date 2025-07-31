<?php
/**
 * The template for displaying the front page
 * 
 * This template is based on the B2C2.com design and structure
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title fade-in-up">
                    <?php echo get_theme_mod('hero_title', 'More than just a liquidity provider, we are digital asset pioneers building the ecosystem of the future'); ?>
                </h1>
                <p class="hero-subtitle fade-in-up">
                    <?php echo get_theme_mod('hero_subtitle', 'Our success is built on a foundation of proprietary crypto-native technology combined with an innovative range of products, making us the partner of choice for diverse institutions globally.'); ?>
                </p>
                <a href="<?php echo get_theme_mod('hero_cta_link', '#services'); ?>" class="cta-button fade-in-up">
                    <?php echo get_theme_mod('hero_cta_text', 'Explore Our Solutions'); ?>
                </a>
            </div>
        </div>
    </section>

    <!-- Latest News Section -->
    <section class="news-section" id="news">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo get_theme_mod('news_section_title', 'Latest News'); ?></h2>
                <p class="section-subtitle"><?php echo get_theme_mod('news_section_subtitle', 'Stay updated with our latest announcements and market insights'); ?></p>
            </div>
            
            <div class="news-grid">
                <?php
                // Query for press releases or latest posts
                $news_query = new WP_Query(array(
                    'post_type' => array('press_release', 'post'),
                    'posts_per_page' => 6,
                    'post_status' => 'publish',
                    'orderby' => 'date',
                    'order' => 'DESC'
                ));
                
                if ($news_query->have_posts()) :
                    while ($news_query->have_posts()) : $news_query->the_post();
                ?>
                    <article class="news-card fade-in-up">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="news-image-container">
                                <?php the_post_thumbnail('news-thumbnail', array('class' => 'news-image')); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="news-content">
                            <?php
                            // Get post type or category
                            if (get_post_type() === 'press_release') {
                                $terms = get_the_terms(get_the_ID(), 'news_category');
                                if ($terms && !is_wp_error($terms)) {
                                    echo '<span class="news-category">' . esc_html($terms[0]->name) . '</span>';
                                } else {
                                    echo '<span class="news-category">Press Release</span>';
                                }
                            } else {
                                $categories = get_the_category();
                                if ($categories) {
                                    echo '<span class="news-category">' . esc_html($categories[0]->name) . '</span>';
                                }
                            }
                            ?>
                            
                            <h3 class="news-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>
                            
                            <div class="news-date"><?php echo get_the_date(); ?></div>
                            
                            <div class="news-excerpt">
                                <?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?>
                            </div>
                            
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                <?php _e('Read more', 'b2c2-template'); ?> >
                            </a>
                        </div>
                    </article>
                <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                ?>
                    <!-- Demo News Cards -->
                    <article class="news-card fade-in-up">
                        <div class="news-image-container">
                            <img src="https://via.placeholder.com/400x250/667eea/ffffff?text=News+Image" alt="Demo News" class="news-image">
                        </div>
                        <div class="news-content">
                            <span class="news-category">Press Release</span>
                            <h3 class="news-title">
                                <a href="#">Company Partners with Leading Financial Institution</a>
                            </h3>
                            <div class="news-date"><?php echo date('F j, Y'); ?></div>
                            <div class="news-excerpt">
                                We are excited to announce our strategic partnership with a major financial institution to expand our global reach and capabilities.
                            </div>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                    
                    <article class="news-card fade-in-up">
                        <div class="news-image-container">
                            <img src="https://via.placeholder.com/400x250/764ba2/ffffff?text=Market+Insights" alt="Demo News" class="news-image">
                        </div>
                        <div class="news-content">
                            <span class="news-category">Insights</span>
                            <h3 class="news-title">
                                <a href="#">Q4 2024: Market Analysis and Future Outlook</a>
                            </h3>
                            <div class="news-date"><?php echo date('F j, Y', strtotime('-1 week')); ?></div>
                            <div class="news-excerpt">
                                Our comprehensive analysis of Q4 market trends and what to expect in the coming quarters.
                            </div>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                    
                    <article class="news-card fade-in-up">
                        <div class="news-image-container">
                            <img src="https://via.placeholder.com/400x250/28a745/ffffff?text=Technology" alt="Demo News" class="news-image">
                        </div>
                        <div class="news-content">
                            <span class="news-category">Technology</span>
                            <h3 class="news-title">
                                <a href="#">Introducing Next-Generation Trading Platform</a>
                            </h3>
                            <div class="news-date"><?php echo date('F j, Y', strtotime('-2 weeks')); ?></div>
                            <div class="news-excerpt">
                                Our latest technology upgrade brings enhanced performance and new features to our trading platform.
                            </div>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Institutional Solutions Section -->
    <section class="features-section" id="services">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo get_theme_mod('services_section_title', 'Institutional Solutions'); ?></h2>
                <p class="section-subtitle"><?php echo get_theme_mod('services_section_subtitle', 'Our large and growing client base around the world trusts us to deliver seamless execution 24/7.'); ?></p>
            </div>
            
            <div class="features-grid">
                <?php
                // Query for services
                $services_query = new WP_Query(array(
                    'post_type' => 'service',
                    'posts_per_page' => 4,
                    'post_status' => 'publish',
                    'orderby' => 'menu_order',
                    'order' => 'ASC'
                ));
                
                if ($services_query->have_posts()) :
                    while ($services_query->have_posts()) : $services_query->the_post();
                ?>
                    <div class="feature-card fade-in-up">
                        <div class="feature-icon">
                            <?php
                            $icon = get_post_meta(get_the_ID(), 'service_icon', true);
                            if ($icon) {
                                echo '<i class="' . esc_attr($icon) . '"></i>';
                            } else {
                                echo '<i class="fas fa-chart-line"></i>';
                            }
                            ?>
                        </div>
                        <h3 class="feature-title"><?php the_title(); ?></h3>
                        <p class="feature-description">
                            <?php echo wp_trim_words(get_the_content(), 25, '...'); ?>
                        </p>
                        <a href="<?php the_permalink(); ?>" class="btn btn-outline">
                            <?php _e('Learn More', 'b2c2-template'); ?>
                        </a>
                    </div>
                <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                ?>
                    <!-- Demo Service Cards -->
                    <div class="feature-card fade-in-up">
                        <div class="feature-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="feature-title">Trading Overview</h3>
                        <p class="feature-description">
                            Comprehensive trading solutions with advanced analytics and real-time market data to optimize your trading strategies.
                        </p>
                        <a href="#" class="btn btn-outline">Learn More</a>
                    </div>
                    
                    <div class="feature-card fade-in-up">
                        <div class="feature-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h3 class="feature-title">OTC Products</h3>
                        <p class="feature-description">
                            Over-the-counter trading products designed for institutional clients with customized solutions and competitive pricing.
                        </p>
                        <a href="#" class="btn btn-outline">Learn More</a>
                    </div>
                    
                    <div class="feature-card fade-in-up">
                        <div class="feature-icon">
                            <i class="fas fa-water"></i>
                        </div>
                        <h3 class="feature-title">Liquidity Partner</h3>
                        <p class="feature-description">
                            Deep liquidity pools and smart routing technology to ensure optimal execution across multiple venues and asset classes.
                        </p>
                        <a href="#" class="btn btn-outline">Learn More</a>
                    </div>
                    
                    <div class="feature-card fade-in-up">
                        <div class="feature-icon">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <h3 class="feature-title">Client Onboarding</h3>
                        <p class="feature-description">
                            Streamlined onboarding process with dedicated support team to get you started quickly and efficiently.
                        </p>
                        <a href="#" class="btn btn-outline">Learn More</a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Institutional Insights Section -->
    <section class="insights-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo get_theme_mod('insights_section_title', 'Institutional Insights'); ?></h2>
                <p class="section-subtitle"><?php echo get_theme_mod('insights_section_subtitle', 'Expert analysis and market insights to help you make informed decisions'); ?></p>
            </div>
            
            <div class="insights-grid">
                <?php
                // Query for insights posts
                $insights_query = new WP_Query(array(
                    'post_type' => 'post',
                    'posts_per_page' => 3,
                    'post_status' => 'publish',
                    'category_name' => 'insights',
                    'orderby' => 'date',
                    'order' => 'DESC'
                ));
                
                if ($insights_query->have_posts()) :
                    while ($insights_query->have_posts()) : $insights_query->the_post();
                ?>
                    <article class="insight-card fade-in-up">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="insight-image-container">
                                <?php the_post_thumbnail('medium', array('class' => 'insight-image')); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="insight-content">
                            <span class="insight-category">Insights</span>
                            <div class="insight-date"><?php echo get_the_date(); ?></div>
                            <h3 class="insight-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                <?php _e('Read more', 'b2c2-template'); ?> >
                            </a>
                        </div>
                    </article>
                <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                ?>
                    <!-- Demo Insight Cards -->
                    <article class="insight-card fade-in-up">
                        <div class="insight-image-container">
                            <img src="https://via.placeholder.com/350x200/667eea/ffffff?text=Market+Analysis" alt="Demo Insight" class="insight-image">
                        </div>
                        <div class="insight-content">
                            <span class="insight-category">Insights</span>
                            <div class="insight-date"><?php echo date('F j, Y'); ?></div>
                            <h3 class="insight-title">
                                <a href="#">Digital Asset Market Trends: What to Watch in 2025</a>
                            </h3>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                    
                    <article class="insight-card fade-in-up">
                        <div class="insight-image-container">
                            <img src="https://via.placeholder.com/350x200/764ba2/ffffff?text=Regulatory+Update" alt="Demo Insight" class="insight-image">
                        </div>
                        <div class="insight-content">
                            <span class="insight-category">Insights</span>
                            <div class="insight-date"><?php echo date('F j, Y', strtotime('-1 week')); ?></div>
                            <h3 class="insight-title">
                                <a href="#">Regulatory Landscape: Navigating Global Compliance</a>
                            </h3>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                    
                    <article class="insight-card fade-in-up">
                        <div class="insight-image-container">
                            <img src="https://via.placeholder.com/350x200/28a745/ffffff?text=Technology+Focus" alt="Demo Insight" class="insight-image">
                        </div>
                        <div class="insight-content">
                            <span class="insight-category">Insights</span>
                            <div class="insight-date"><?php echo date('F j, Y', strtotime('-2 weeks')); ?></div>
                            <h3 class="insight-title">
                                <a href="#">The Future of Institutional Trading Technology</a>
                            </h3>
                            <a href="#" class="read-more">Read more ></a>
                        </div>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Newsletter Subscription Section -->
    <section class="newsletter-section bg-light">
        <div class="container">
            <div class="newsletter-content text-center">
                <h2><?php echo get_theme_mod('newsletter_title', 'Subscribe to Our Newsletter'); ?></h2>
                <p><?php echo get_theme_mod('newsletter_subtitle', 'Sign up to our news alerts to receive our regular newsletter and institutional insights into the market direct to your inbox.'); ?></p>
                
                <form class="newsletter-signup-form" action="#" method="post">
                    <div class="form-row">
                        <input type="email" name="newsletter_email" placeholder="<?php _e('Enter your email address', 'b2c2-template'); ?>" required>
                        <button type="submit" class="btn btn-primary">
                            <?php _e('Subscribe', 'b2c2-template'); ?>
                        </button>
                    </div>
                    <p class="newsletter-disclaimer">
                        <?php _e('We do not transact with or provide any service to retail investors. By subscribing, you represent that you are not a retail investor.', 'b2c2-template'); ?>
                    </p>
                </form>
            </div>
        </div>
    </section>

</main>

<style>
/* Additional styles for front page */
.insights-section {
    padding: 100px 0;
    background: white;
}

.insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.insight-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

.insight-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.insight-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.insight-content {
    padding: 1.5rem;
}

.insight-category {
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

.insight-date {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.insight-title {
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.insight-title a {
    color: #333;
    text-decoration: none;
}

.insight-title a:hover {
    color: #0066FF;
}

.newsletter-section {
    padding: 80px 0;
}

.newsletter-content {
    max-width: 600px;
    margin: 0 auto;
}

.newsletter-signup-form {
    margin-top: 2rem;
}

.form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-row input {
    flex: 1;
    padding: 15px 20px;
    border: 2px solid #ddd;
    border-radius: 50px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease;
}

.form-row input:focus {
    border-color: #0066FF;
}

.newsletter-disclaimer {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
    }
    
    .insights-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<?php get_footer(); ?>