<?php
/**
 * Template for displaying Insights page
 * Based on B2C2.com insights structure
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- Page Header -->
    <section class="page-header" style="padding: 4rem 0; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; text-align: center;">
            <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; margin-bottom: 1rem;">
                Insights
            </h1>
            <p style="font-size: 1.2rem; opacity: 0.9; max-width: 800px; margin: 0 auto;">
                In-depth analysis and insights from our team of digital asset experts
            </p>
        </div>
    </section>

    <!-- Featured Insights -->
    <section class="featured-insights" style="padding: 6rem 0; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Latest Insights
                </h2>
                <p style="font-size: 1.1rem; color: #6B7280; max-width: 600px; margin: 0 auto;">
                    Stay ahead with our latest market analysis and industry insights
                </p>
            </div>

            <?php
            $insights_query = new WP_Query(array(
                'post_type' => 'insight',
                'posts_per_page' => 6,
                'post_status' => 'publish',
                'orderby' => 'date',
                'order' => 'DESC'
            ));
            
            if ($insights_query->have_posts()) :
            ?>
                <div class="insights-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                    <?php while ($insights_query->have_posts()) : $insights_query->the_post(); ?>
                        <article class="insight-card" style="background: #f8f9fa; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <?php if (has_post_thumbnail()) : ?>
                                <div class="card-image" style="width: 100%; height: 200px; overflow: hidden;">
                                    <?php the_post_thumbnail('medium_large', array('style' => 'width: 100%; height: 100%; object-fit: cover;')); ?>
                                </div>
                            <?php endif; ?>
                            
                            <div class="card-content" style="padding: 2rem;">
                                <div class="card-meta" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <span style="color: #0066FF; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                                        Insight
                                    </span>
                                    <span style="color: #6B7280; font-size: 0.875rem;">
                                        <?php echo get_the_date('F j, Y'); ?>
                                    </span>
                                </div>
                                
                                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.4; color: #111827;">
                                    <a href="<?php the_permalink(); ?>" style="color: inherit; text-decoration: none;">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>
                                
                                <div class="excerpt" style="color: #6B7280; margin-bottom: 1.5rem; line-height: 1.6;">
                                    <?php the_excerpt(); ?>
                                </div>
                                
                                <a href="<?php the_permalink(); ?>" style="color: #0066FF; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                                    Read full insight
                                    <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
                                </a>
                            </div>
                        </article>
                    <?php endwhile; ?>
                </div>
            <?php 
                wp_reset_postdata();
            else :
            ?>
                <div style="text-align: center; padding: 4rem 0;">
                    <p style="color: #6B7280; font-size: 1.1rem;">No insights available at the moment.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section" style="padding: 6rem 0; background: #111827; color: white;">
        <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 2rem; text-align: center;">
            <h2 style="font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; margin-bottom: 1rem;">
                Stay Informed
            </h2>
            <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; line-height: 1.6;">
                Subscribe to receive our latest insights and market analysis directly to your inbox.
            </p>
            
            <form class="newsletter-form" style="display: flex; gap: 1rem; max-width: 400px; margin: 0 auto; flex-wrap: wrap;">
                <input type="email" placeholder="Enter your email" required style="flex: 1; padding: 1rem; border: 1px solid #374151; border-radius: 6px; background: #1F2937; color: white; min-width: 250px;">
                <button type="submit" style="padding: 1rem 2rem; background: #0066FF; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.3s ease;">
                    Subscribe
                </button>
            </form>
        </div>
    </section>

</main>

<?php get_footer(); ?>