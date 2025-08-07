<?php
/**
 * Template Name: B2C2 Front Page - Replica Exata
 * Description: Homepage que replica 100% o design do B2C2.com original
 */

get_header();
?>

<main id="primary" class="site-main">

    <!-- B2C2 Hero Section com Gradiente Roxo -->
    <section class="hero-section" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 6rem 0; min-height: 80vh; display: flex; align-items: center; position: relative; overflow: hidden;">
        
        <!-- Background Pattern -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px); background-size: 50px 50px;"></div>
        
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem; position: relative; z-index: 2;">
            <div style="max-width: 900px;">
                
                <!-- Título Principal com Texto Rotativo -->
                <h1 class="hero-title-animated" style="font-size: 4.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 2rem; color: white; letter-spacing: -2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <span class="text-rotating">More than just a liquidity provider,</span><br>
                    <span class="text-rotating-2">B2C2 is a digital asset pioneer</span><br>
                    <span class="text-rotating-3">building the ecosystem of the future</span>
                </h1>
                
                <!-- Carrossel de Subtítulos -->
                <div class="subtitle-carousel" style="height: 80px; overflow: hidden; margin-bottom: 3rem; position: relative;">
                    <p class="carousel-text active" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255,255,255,0.9); max-width: 700px; font-weight: 300; transition: all 0.5s ease; position: absolute; top: 0;">
                        B2C2's success is built on a foundation of proprietary crypto-native technology combined with an innovative range of products
                    </p>
                    <p class="carousel-text" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255,255,255,0.9); max-width: 700px; font-weight: 300; transition: all 0.5s ease; opacity: 0; position: absolute; top: 0;">
                        Making the firm the partner of choice for diverse institutions globally with seamless execution 24/7
                    </p>
                    <p class="carousel-text" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255,255,255,0.9); max-width: 700px; font-weight: 300; transition: all 0.5s ease; opacity: 0; position: absolute; top: 0;">
                        Our large and growing client base around the world trusts us to deliver innovative digital asset solutions
                    </p>
                </div>
                
                <!-- Botões com Gradiente -->
                <div style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 3rem;">
                    <a href="/solutions" 
                       class="btn-primary-gradient" 
                       style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 1.25rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                        Explore institutional solutions
                        <span style="font-size: 1.2rem; transition: transform 0.3s ease;">→</span>
                    </a>
                    
                    <a href="/about" 
                       style="background: rgba(255,255,255,0.1); color: white; padding: 1.25rem 2.5rem; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: all 0.3s ease; backdrop-filter: blur(10px);">
                        About B2C2
                    </a>
                </div>
                
                <!-- Estatísticas Flutuantes -->
                <div style="display: flex; gap: 3rem; flex-wrap: wrap; margin-top: 2rem;">
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.5rem;">24/7</div>
                        <div style="color: rgba(255,255,255,0.8); font-weight: 500;">Seamless Execution</div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.5rem;">Global</div>
                        <div style="color: rgba(255,255,255,0.8); font-weight: 500;">Institutional Base</div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.5rem;">Pioneer</div>
                        <div style="color: rgba(255,255,255,0.8); font-weight: 500;">Digital Asset</div>
                    </div>
                </div>
                
            </div>
        </div>
        
        <!-- Dots Animados -->
        <div class="floating-dots" style="position: absolute; top: 20%; right: 10%; width: 100px; height: 100px;">
            <div class="dot" style="position: absolute; width: 8px; height: 8px; background: rgba(251, 191, 36, 0.6); border-radius: 50%; animation: float 3s ease-in-out infinite;"></div>
            <div class="dot" style="position: absolute; width: 6px; height: 6px; background: rgba(139, 92, 246, 0.6); border-radius: 50%; top: 30px; left: 20px; animation: float 3s ease-in-out infinite 0.5s;"></div>
            <div class="dot" style="position: absolute; width: 10px; height: 10px; background: rgba(168, 85, 247, 0.6); border-radius: 50%; top: 60px; left: 40px; animation: float 3s ease-in-out infinite 1s;"></div>
        </div>
        
    </section>

    <!-- Institutional Solutions - Com Fundo Roxo B2C2 -->
    <section class="purple-section" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 6rem 0; color: white;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: 3rem; font-weight: 800; color: white; margin-bottom: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    Institutional solutions
                </h2>
                <p style="font-size: 1.3rem; color: rgba(255,255,255,0.9); max-width: 700px; margin: 0 auto 2.5rem; font-weight: 300;">
                    Our large and growing client base around the world trusts us to deliver seamless execution 24/7.
                </p>
                <a href="/solutions" class="btn-primary-gradient" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 1.25rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                    Explore institutional solutions
                    <span style="font-size: 1.2rem; transition: transform 0.3s ease;">→</span>
                </a>
            </div>
            
            <!-- Grid de Solutions com Glassmorphism -->
            <div class="institutional-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2.5rem;">
                
                <!-- Trading Overview -->
                <div class="solution-card glass-card" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 2.5rem; transition: all 0.3s ease;">
                    <div class="icon" style="width: 70px; height: 70px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
                        <span style="font-size: 28px;">📊</span>
                    </div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; color: white; margin-bottom: 1rem;">
                        Trading overview
                    </h3>
                    <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 2px; margin-bottom: 1.5rem;"></div>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 2rem; font-size: 1.05rem;">
                        Professional trading platforms with institutional-grade execution and deep liquidity access across global markets.
                    </p>
                    <a href="/solutions/trading-overview" style="color: #fbbf24; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease;">
                        <span style="text-decoration: underline;">Learn more</span>
                        <span style="font-size: 1.1rem; transition: transform 0.2s ease;">→</span>
                    </a>
                </div>
                
                <!-- OTC Products -->
                <div class="solution-card glass-card" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 2.5rem; transition: all 0.3s ease;">
                    <div class="icon" style="width: 70px; height: 70px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
                        <span style="font-size: 28px;">⚙️</span>
                    </div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; color: white; margin-bottom: 1rem;">
                        OTC Products
                    </h3>
                    <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 2px; margin-bottom: 1.5rem;"></div>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 2rem; font-size: 1.05rem;">
                        Over-the-counter trading solutions with competitive pricing and transparent execution for institutional clients.
                    </p>
                    <a href="/solutions/otc-products" style="color: #fbbf24; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease;">
                        <span style="text-decoration: underline;">Learn more</span>
                        <span style="font-size: 1.1rem; transition: transform 0.2s ease;">→</span>
                    </a>
                </div>
                
                <!-- Liquidity Partner -->
                <div class="solution-card glass-card" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 2.5rem; transition: all 0.3s ease;">
                    <div class="icon" style="width: 70px; height: 70px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
                        <span style="font-size: 28px;">🔄</span>
                    </div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; color: white; margin-bottom: 1rem;">
                        Liquidity Partner
                    </h3>
                    <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 2px; margin-bottom: 1.5rem;"></div>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 2rem; font-size: 1.05rem;">
                        Comprehensive liquidity partnership programs designed for exchanges and institutional trading platforms.
                    </p>
                    <a href="/solutions/liquidity-partner" style="color: #fbbf24; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease;">
                        <span style="text-decoration: underline;">Learn more</span>
                        <span style="font-size: 1.1rem; transition: transform 0.2s ease;">→</span>
                    </a>
                </div>
                
                <!-- Client Onboarding -->
                <div class="solution-card glass-card" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 2.5rem; transition: all 0.3s ease;">
                    <div class="icon" style="width: 70px; height: 70px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
                        <span style="font-size: 28px;">👤</span>
                    </div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; color: white; margin-bottom: 1rem;">
                        Client onboarding
                    </h3>
                    <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 2px; margin-bottom: 1.5rem;"></div>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 2rem; font-size: 1.05rem;">
                        Streamlined onboarding process with dedicated support to get institutional clients trading quickly and efficiently.
                    </p>
                    <a href="/solutions/client-onboarding" style="color: #fbbf24; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease;">
                        <span style="text-decoration: underline;">Learn more</span>
                        <span style="font-size: 1.1rem; transition: transform 0.2s ease;">→</span>
                    </a>
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

    <!-- CTA Section com Gradiente Roxo -->
    <section style="background: linear-gradient(135deg, #1a1a1a 0%, #6366f1 100%); color: white; padding: 6rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem; text-align: center;">
            <h2 style="font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                Ready to elevate your digital asset trading?
            </h2>
            <p style="font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 3rem; max-width: 700px; margin-left: auto; margin-right: auto; font-weight: 300;">
                Join leading institutions who trust B2C2 for their digital asset trading needs across global markets.
            </p>
            <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                <a href="/contact" 
                   class="btn-primary-gradient"
                   style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 1.25rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                    Get in touch
                    <span style="font-size: 1.2rem; transition: transform 0.3s ease;">→</span>
                </a>
                <a href="/about" 
                   style="background: rgba(255,255,255,0.1); color: white; padding: 1.25rem 2.5rem; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: all 0.3s ease; backdrop-filter: blur(10px);">
                    Learn about B2C2
                </a>
            </div>
        </div>
    </section>

</main>

<!-- JavaScript para Carrossel de Texto Rotativo -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Carrossel de subtítulos
    const carouselTexts = document.querySelectorAll('.carousel-text');
    let currentText = 0;
    
    function rotateText() {
        // Remove active class from current text
        carouselTexts[currentText].classList.remove('active');
        
        // Move to next text
        currentText = (currentText + 1) % carouselTexts.length;
        
        // Add active class to new text
        carouselTexts[currentText].classList.add('active');
    }
    
    // Start rotation every 4 seconds
    if (carouselTexts.length > 1) {
        setInterval(rotateText, 4000);
    }
    
    // Hover effects for solution cards
    const solutionCards = document.querySelectorAll('.solution-card');
    solutionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Hover effects for buttons
    const gradientButtons = document.querySelectorAll('.btn-primary-gradient');
    gradientButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            const arrow = this.querySelector('span:last-child');
            if (arrow) arrow.style.transform = 'translateX(8px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
            const arrow = this.querySelector('span:last-child');
            if (arrow) arrow.style.transform = 'translateX(5px)';
        });
    });
});
</script>

<?php
get_footer();
?>