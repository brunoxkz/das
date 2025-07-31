<?php
/**
 * Template Name: B2C2 Front Page - Replica Exata
 * Description: Homepage que replica 100% o design do B2C2.com original
 */

get_header();
?>

<main id="primary" class="site-main">

    <!-- B2C2 Hero Section Exato -->
    <section class="hero-section" style="background: #f8f9fa; padding: 5rem 0; position: relative;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            <div style="max-width: 700px;">
                <h1 style="font-size: 4rem; font-weight: 700; color: #1a1a1a; line-height: 1.1; margin-bottom: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -2px;">
                    <?php echo get_theme_mod('hero_title', 'More than just a liquidity provider, B2C2 is a digital asset pioneer'); ?>
                </h1>
                <p style="font-size: 1.25rem; color: #666; line-height: 1.6; margin-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <?php echo get_theme_mod('hero_subtitle', 'We offer institutional clients advanced trading technology, deep liquidity pools, and innovative digital asset solutions across global markets.'); ?>
                </p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <a href="<?php echo get_theme_mod('hero_primary_link', '/solutions/trading-overview'); ?>" 
                       style="background: #007bff; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background 0.2s ease; display: inline-flex; align-items: center;">
                        <?php echo get_theme_mod('hero_primary_text', 'Trading Overview'); ?>
                    </a>
                    <a href="<?php echo get_theme_mod('hero_secondary_link', '/about'); ?>" 
                       style="background: transparent; color: #007bff; padding: 1rem 2rem; border: 2px solid #007bff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.2s ease;">
                        <?php echo get_theme_mod('hero_secondary_text', 'About B2C2'); ?>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- B2C2 Values Section -->
    <section style="background: white; padding: 5rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;">
                
                <!-- Left Content -->
                <div>
                    <h2 style="font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 2rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.2;">
                        <?php echo get_theme_mod('values_title', 'Digital asset trading built for institutions'); ?>
                    </h2>
                    <p style="font-size: 1.125rem; color: #666; line-height: 1.7; margin-bottom: 2rem;">
                        <?php echo get_theme_mod('values_description', 'B2C2 provides institutional-grade digital asset trading solutions with advanced technology, deep liquidity, and unparalleled execution quality.'); ?>
                    </p>
                    
                    <!-- Feature List -->
                    <div style="space-y: 1rem;">
                        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                            <div style="width: 8px; height: 8px; background: #007bff; border-radius: 50%; margin-top: 8px; flex-shrink: 0;"></div>
                            <div>
                                <h4 style="font-weight: 600; color: #1a1a1a; margin: 0 0 0.5rem 0;">Deep Liquidity</h4>
                                <p style="color: #666; margin: 0; font-size: 0.95rem;">Access to the deepest liquidity pools across global digital asset markets</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                            <div style="width: 8px; height: 8px; background: #007bff; border-radius: 50%; margin-top: 8px; flex-shrink: 0;"></div>
                            <div>
                                <h4 style="font-weight: 600; color: #1a1a1a; margin: 0 0 0.5rem 0;">Advanced Technology</h4>
                                <p style="color: #666; margin: 0; font-size: 0.95rem;">Cutting-edge trading infrastructure built for institutional requirements</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                            <div style="width: 8px; height: 8px; background: #007bff; border-radius: 50%; margin-top: 8px; flex-shrink: 0;"></div>
                            <div>
                                <h4 style="font-weight: 600; color: #1a1a1a; margin: 0 0 0.5rem 0;">Global Reach</h4>
                                <p style="color: #666; margin: 0; font-size: 0.95rem;">24/7 market coverage across all major digital asset trading venues</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Visual -->
                <div style="background: linear-gradient(135deg, #007bff10, #28a74510); border-radius: 16px; height: 400px; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: #666;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                        <p style="font-size: 1.125rem; font-weight: 600;">Trading Dashboard</p>
                        <p style="font-size: 0.95rem;">Real-time market data & execution</p>
                    </div>
                </div>
                
            </div>
        </div>
    </section>

    <!-- Statistics Section - B2C2 Style -->
    <section style="background: #f8f9fa; padding: 4rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            
            <div style="text-align: center; margin-bottom: 3rem;">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem;">
                    <?php echo get_theme_mod('stats_section_title', 'Trusted by leading institutions globally'); ?>
                </h2>
                <p style="font-size: 1.125rem; color: #666; max-width: 600px; margin: 0 auto;">
                    <?php echo get_theme_mod('stats_section_subtitle', 'Our performance metrics demonstrate our commitment to institutional excellence'); ?>
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem;">
                <?php
                $stats = array(
                    array(
                        'number' => get_theme_mod('stat_1_number', '$500B+'),
                        'label' => get_theme_mod('stat_1_label', 'Monthly Trading Volume')
                    ),
                    array(
                        'number' => get_theme_mod('stat_2_number', '200+'),
                        'label' => get_theme_mod('stat_2_label', 'Institutional Clients')
                    ),
                    array(
                        'number' => get_theme_mod('stat_3_number', '24/7'),
                        'label' => get_theme_mod('stat_3_label', 'Market Coverage')
                    ),
                    array(
                        'number' => get_theme_mod('stat_4_number', '<15ms'),
                        'label' => get_theme_mod('stat_4_label', 'Average Latency')
                    )
                );
                
                foreach($stats as $stat) :
                ?>
                <div style="text-align: center; background: white; padding: 2.5rem 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 3rem; font-weight: 700; color: #007bff; margin-bottom: 0.5rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                        <?php echo esc_html($stat['number']); ?>
                    </div>
                    <div style="font-size: 1rem; color: #666; font-weight: 500;">
                        <?php echo esc_html($stat['label']); ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Solutions Preview Section -->
    <section style="background: white; padding: 5rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem;">
                    Comprehensive trading solutions
                </h2>
                <p style="font-size: 1.125rem; color: #666; max-width: 700px; margin: 0 auto;">
                    From spot to derivatives, our comprehensive suite of trading solutions serves institutional clients across all digital asset markets.
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                
                <!-- Solution 1 -->
                <div style="padding: 2.5rem; border: 1px solid #e9ecef; border-radius: 12px; transition: border-color 0.2s ease;">
                    <div style="width: 48px; height: 48px; background: #007bff15; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 24px;">⚡</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem;">
                        Spot Trading
                    </h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 1.5rem;">
                        Access deep liquidity across all major digital assets with competitive spreads and institutional-grade execution.
                    </p>
                    <a href="/solutions/spot-trading" style="color: #007bff; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                        Learn more →
                    </a>
                </div>
                
                <!-- Solution 2 -->
                <div style="padding: 2.5rem; border: 1px solid #e9ecef; border-radius: 12px; transition: border-color 0.2s ease;">
                    <div style="width: 48px; height: 48px; background: #007bff15; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 24px;">📈</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem;">
                        Derivatives
                    </h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 1.5rem;">
                        Advanced derivatives trading with sophisticated risk management tools and market-leading technology.
                    </p>
                    <a href="/solutions/derivatives" style="color: #007bff; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                        Learn more →
                    </a>
                </div>
                
                <!-- Solution 3 -->
                <div style="padding: 2.5rem; border: 1px solid #e9ecef; border-radius: 12px; transition: border-color 0.2s ease;">
                    <div style="width: 48px; height: 48px; background: #007bff15; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 24px;">🔄</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem;">
                        Liquidity Solutions
                    </h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 1.5rem;">
                        Customized liquidity solutions designed to meet the specific needs of institutional trading operations.
                    </p>
                    <a href="/solutions/liquidity" style="color: #007bff; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                        Learn more →
                    </a>
                </div>
                
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section style="background: #1a1a1a; color: white; padding: 5rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem; text-align: center;">
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                Ready to elevate your digital asset trading?
            </h2>
            <p style="font-size: 1.125rem; color: #ccc; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                Join leading institutions who trust B2C2 for their digital asset trading needs.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="/contact" 
                   style="background: #007bff; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background 0.2s ease;">
                    Get in touch
                </a>
                <a href="/about" 
                   style="background: transparent; color: white; padding: 1rem 2rem; border: 2px solid white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.2s ease;">
                    Learn about B2C2
                </a>
            </div>
        </div>
    </section>

</main>

<?php
get_footer();
?>