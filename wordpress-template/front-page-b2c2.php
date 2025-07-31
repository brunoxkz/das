<?php
/**
 * The template for displaying the front page
 * Replicação EXATA do B2C2.com - Senior Developer Audit 2025
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- Hero Section - EXATO como B2C2.com -->
    <section class="hero-section" style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 8rem 0; text-align: center; position: relative; overflow: hidden; min-height: 100vh; display: flex; align-items: center;">
        <div class="container" style="position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 2rem; font-weight: 700; line-height: 1.2; max-width: 1000px; margin-left: auto; margin-right: auto;">
                More than just a liquidity provider,<br>
                B2C2 is a digital asset pioneer building<br>
                the ecosystem of the future
            </h1>
            <p style="font-size: 1.3rem; margin-bottom: 3rem; max-width: 900px; margin-left: auto; margin-right: auto; opacity: 0.9; line-height: 1.6;">
                B2C2's success is built on a foundation of proprietary crypto-native technology combined with an innovative range of products, making the firm the partner of choice for diverse institutions globally.
            </p>
        </div>
        <!-- Decorative background elements -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 30% 50%, rgba(0,102,255,0.1) 0%, transparent 50%); z-index: 1;"></div>
    </section>

    <!-- Featured News Cards - Como no B2C2 original -->
    <section class="featured-news" style="padding: 4rem 0; background: #f8f9fa;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="news-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                <?php
                // Query for latest featured news
                $featured_query = new WP_Query(array(
                    'post_type' => array('press_release', 'post'),
                    'posts_per_page' => 4,
                    'post_status' => 'publish',
                    'orderby' => 'date',
                    'order' => 'DESC',
                    'meta_query' => array(
                        array(
                            'key' => 'featured',
                            'value' => '1',
                            'compare' => '='
                        )
                    )
                ));
                
                if ($featured_query->have_posts()) :
                    while ($featured_query->have_posts()) : $featured_query->the_post();
                ?>
                    <article class="featured-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="card-image" style="width: 100%; height: 200px; overflow: hidden;">
                                <?php the_post_thumbnail('medium_large', array('style' => 'width: 100%; height: 100%; object-fit: cover;')); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="card-content" style="padding: 2rem;">
                            <span class="card-category" style="color: #6B7280; font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                                <?php 
                                if (get_post_type() === 'press_release') {
                                    echo 'Press Release';
                                } else {
                                    $category = get_the_category();
                                    echo $category ? $category[0]->name : 'News';
                                }
                                ?>
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

    <!-- Institutional Solutions Section - EXATO como B2C2 -->
    <section class="institutional-solutions" id="solutions" style="padding: 6rem 0; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header" style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Institutional solutions
                </h2>
                <p style="font-size: 1.1rem; color: #6B7280; max-width: 600px; margin: 0 auto;">
                    Our large and growing client base around the world trusts us to deliver seamless execution 24/7.
                </p>
                <a href="/solutions" style="color: #0066FF; font-weight: 500; text-decoration: none; margin-top: 1rem; display: inline-block;">
                    Explore institutional solutions >
                </a>
            </div>
            
            <div class="solutions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                <!-- Trading Overview -->
                <div class="solution-card" style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s ease;">
                    <div class="solution-icon" style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-line" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">Trading overview</h3>
                    <a href="/solutions/trading-overview" style="color: #0066FF; font-weight: 500; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 0.5rem;">Learn more</span>
                        <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                    </a>
                </div>
                
                <!-- OTC Products -->
                <div class="solution-card" style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s ease;">
                    <div class="solution-icon" style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-cube" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">OTC Products</h3>
                    <a href="/solutions/product" style="color: #0066FF; font-weight: 500; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 0.5rem;">Learn more</span>
                        <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                    </a>
                </div>
                
                <!-- Liquidity Partner -->
                <div class="solution-card" style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s ease;">
                    <div class="solution-icon" style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-handshake" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">Liquidity Partner</h3>
                    <a href="/solutions/liquidity-partner" style="color: #0066FF; font-weight: 500; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 0.5rem;">Learn more</span>
                        <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                    </a>
                </div>
                
                <!-- Client Onboarding -->
                <div class="solution-card" style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s ease;">
                    <div class="solution-icon" style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-plus" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">Client onboarding</h3>
                    <a href="/client-onboarding" style="color: #0066FF; font-weight: 500; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 0.5rem;">Learn more</span>
                        <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Latest News Section - Como no B2C2 -->
    <section class="latest-news" style="padding: 6rem 0; background: #F9FAFB;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header" style="margin-bottom: 3rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Latest news
                </h2>
            </div>
            
            <div class="news-list" style="display: grid; gap: 2rem;">
                <?php
                // Query for latest news
                $latest_news = new WP_Query(array(
                    'post_type' => array('press_release', 'post'),
                    'posts_per_page' => 5,
                    'post_status' => 'publish',
                    'orderby' => 'date',
                    'order' => 'DESC'
                ));
                
                if ($latest_news->have_posts()) :
                    while ($latest_news->have_posts()) : $latest_news->the_post();
                ?>
                    <article class="news-item" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 2rem;">
                        <div class="news-logo" style="flex-shrink: 0; width: 60px; height: 60px; background: #111827; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-weight: 700; font-size: 0.875rem;">B2C2</span>
                        </div>
                        
                        <div class="news-content" style="flex-grow: 1;">
                            <span style="color: #6B7280; font-size: 0.875rem; font-weight: 500;">
                                <?php 
                                if (get_post_type() === 'press_release') {
                                    echo 'Press release';
                                } else {
                                    echo 'News';
                                }
                                ?>
                            </span>
                            <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; color: #111827;">
                                <a href="<?php the_permalink(); ?>" style="color: inherit; text-decoration: none;">
                                    <?php the_title(); ?>
                                </a>
                            </h3>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="color: #6B7280; font-size: 0.875rem;">
                                    <?php echo get_the_date('F j, Y'); ?>
                                </span>
                                <a href="<?php the_permalink(); ?>" style="color: #0066FF; font-weight: 500; text-decoration: none; font-size: 0.875rem;">
                                    Read more >
                                </a>
                            </div>
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

    <!-- Events Section -->
    <section class="events-section" style="padding: 6rem 0; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header" style="margin-bottom: 3rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Events
                </h2>
            </div>
            
            <?php
            $events_query = new WP_Query(array(
                'post_type' => 'event',
                'posts_per_page' => 3,
                'post_status' => 'publish',
                'orderby' => 'meta_value',
                'meta_key' => 'event_date',
                'order' => 'ASC'
            ));
            
            if ($events_query->have_posts()) :
            ?>
                <div class="events-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <?php while ($events_query->have_posts()) : $events_query->the_post(); ?>
                        <article class="event-card" style="background: #F9FAFB; padding: 2rem; border-radius: 12px; border: 1px solid #E5E7EB;">
                            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">
                                <?php the_title(); ?>
                            </h3>
                            <div class="event-meta" style="color: #6B7280; font-size: 0.875rem; margin-bottom: 1rem;">
                                <?php 
                                $event_date = get_field('event_date');
                                if ($event_date) {
                                    echo date('F j, Y', strtotime($event_date));
                                }
                                ?>
                            </div>
                            <div class="event-excerpt" style="color: #374151; margin-bottom: 1.5rem;">
                                <?php the_excerpt(); ?>
                            </div>
                            <a href="<?php the_permalink(); ?>" style="color: #0066FF; font-weight: 500; text-decoration: none;">
                                Learn more >
                            </a>
                        </article>
                    <?php endwhile; ?>
                </div>
            <?php 
                wp_reset_postdata();
            else :
            ?>
                <p style="color: #6B7280; font-style: italic;">No items found.</p>
            <?php endif; ?>
        </div>
    </section>

    <!-- Newsletter Subscription - Como no B2C2 -->
    <section class="newsletter-section" style="padding: 6rem 0; background: #111827; color: white;">
        <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 2rem; text-align: center;">
            <h2 style="font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; margin-bottom: 1rem;">
                Subscribe
            </h2>
            <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; line-height: 1.6;">
                Sign up to our news alerts to receive our regular newsletter and institutional insights into the crypto market direct to your inbox.
            </p>
            
            <form class="newsletter-form" style="display: flex; gap: 1rem; max-width: 400px; margin: 0 auto 2rem; flex-wrap: wrap;">
                <input type="email" placeholder="Enter your email" required style="flex: 1; padding: 1rem; border: 1px solid #374151; border-radius: 6px; background: #1F2937; color: white; min-width: 250px;">
                <button type="submit" style="padding: 1rem 2rem; background: #0066FF; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.3s ease;">
                    Subscribe
                </button>
            </form>
            
            <p style="font-size: 0.75rem; color: #9CA3AF; line-height: 1.5;">
                B2C2 does not transact with or provide any service to any retail investor or consumer. By subscribing to our content, you represent that you are not a retail investor or consumer. Please refer to our disclaimer for further information.
            </p>
        </div>
    </section>

    <!-- Institutional Insights - Como no B2C2 -->
    <section class="insights-section" style="padding: 6rem 0; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div class="section-header" style="margin-bottom: 3rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Institutional Insights
                </h2>
            </div>
            
            <div class="insights-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                <?php
                // Query for insights
                $insights_query = new WP_Query(array(
                    'post_type' => 'insight',
                    'posts_per_page' => 4,
                    'post_status' => 'publish',
                    'orderby' => 'date',
                    'order' => 'DESC'
                ));
                
                if ($insights_query->have_posts()) :
                    while ($insights_query->have_posts()) : $insights_query->the_post();
                ?>
                    <article class="insight-card" style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; transition: transform 0.3s ease;">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="insight-image" style="width: 100%; height: 200px; overflow: hidden;">
                                <?php the_post_thumbnail('medium_large', array('style' => 'width: 100%; height: 100%; object-fit: cover;')); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="insight-content" style="padding: 2rem;">
                            <span class="insight-category" style="color: #6B7280; font-size: 0.875rem; font-weight: 500;">
                                Insights
                            </span>
                            
                            <p style="color: #6B7280; font-size: 0.875rem; margin: 0.5rem 0;">
                                <?php echo get_the_date('F j, Y'); ?>
                            </p>
                            
                            <h3 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0; line-height: 1.4; color: #111827;">
                                <a href="<?php the_permalink(); ?>" style="color: inherit; text-decoration: none;">
                                    <?php the_title(); ?>
                                </a>
                            </h3>
                            
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

</main>

<?php get_footer(); ?>