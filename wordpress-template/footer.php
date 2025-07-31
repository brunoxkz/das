    <footer id="colophon" class="site-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3><?php _e('About Us', 'b2c2-template'); ?></h3>
                    <p><?php _e('We are a leading digital asset liquidity provider, building the ecosystem of the future with proprietary crypto-native technology.', 'b2c2-template'); ?></p>
                    
                    <?php
                    // Social media links
                    $social_links = array(
                        'facebook' => get_theme_mod('facebook', ''),
                        'twitter' => get_theme_mod('twitter', ''),
                        'linkedin' => get_theme_mod('linkedin', ''),
                        'instagram' => get_theme_mod('instagram', ''),
                        'youtube' => get_theme_mod('youtube', ''),
                    );
                    
                    $has_social = false;
                    foreach ($social_links as $link) {
                        if (!empty($link)) {
                            $has_social = true;
                            break;
                        }
                    }
                    
                    if ($has_social) : ?>
                        <div class="social-links">
                            <?php foreach ($social_links as $platform => $url) : ?>
                                <?php if (!empty($url)) : ?>
                                    <a href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener noreferrer">
                                        <i class="fab fa-<?php echo esc_attr($platform); ?>"></i>
                                    </a>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="footer-section">
                    <h3><?php _e('Quick Links', 'b2c2-template'); ?></h3>
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'footer',
                        'menu_id' => 'footer-menu',
                        'container' => false,
                        'fallback_cb' => false,
                    ));
                    ?>
                    <?php if (!has_nav_menu('footer')) : ?>
                        <ul>
                            <li><a href="<?php echo esc_url(home_url('/')); ?>"><?php _e('Home', 'b2c2-template'); ?></a></li>
                            <li><a href="<?php echo esc_url(home_url('/about')); ?>"><?php _e('About', 'b2c2-template'); ?></a></li>
                            <li><a href="<?php echo esc_url(home_url('/services')); ?>"><?php _e('Services', 'b2c2-template'); ?></a></li>
                            <li><a href="<?php echo esc_url(home_url('/news')); ?>"><?php _e('News', 'b2c2-template'); ?></a></li>
                            <li><a href="<?php echo esc_url(home_url('/contact')); ?>"><?php _e('Contact', 'b2c2-template'); ?></a></li>
                        </ul>
                    <?php endif; ?>
                </div>
                
                <div class="footer-section">
                    <h3><?php _e('Services', 'b2c2-template'); ?></h3>
                    <ul>
                        <li><a href="#"><?php _e('Trading Overview', 'b2c2-template'); ?></a></li>
                        <li><a href="#"><?php _e('OTC Products', 'b2c2-template'); ?></a></li>
                        <li><a href="#"><?php _e('Liquidity Partner', 'b2c2-template'); ?></a></li>
                        <li><a href="#"><?php _e('Client Onboarding', 'b2c2-template'); ?></a></li>
                        <li><a href="#"><?php _e('Risk Management', 'b2c2-template'); ?></a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3><?php _e('Newsletter', 'b2c2-template'); ?></h3>
                    <p><?php _e('Sign up to our news alerts to receive our regular newsletter and institutional insights.', 'b2c2-template'); ?></p>
                    
                    <!-- Newsletter Signup Form -->
                    <form class="newsletter-form" action="#" method="post">
                        <div class="form-group">
                            <input type="email" name="newsletter_email" placeholder="<?php _e('Enter your email', 'b2c2-template'); ?>" required>
                            <button type="submit" class="btn btn-primary">
                                <?php _e('Subscribe', 'b2c2-template'); ?>
                            </button>
                        </div>
                    </form>
                    
                    <?php if (is_active_sidebar('footer-4')) : ?>
                        <?php dynamic_sidebar('footer-4'); ?>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <div class="copyright">
                        <?php
                        $footer_text = get_theme_mod('footer_text', '© 2025 Your Company Name. All rights reserved.');
                        echo wp_kses_post($footer_text);
                        ?>
                    </div>
                    
                    <div class="footer-links">
                        <a href="#"><?php _e('Privacy Policy', 'b2c2-template'); ?></a>
                        <a href="#"><?php _e('Terms of Service', 'b2c2-template'); ?></a>
                        <a href="#"><?php _e('Cookie Policy', 'b2c2-template'); ?></a>
                        <a href="#"><?php _e('Disclaimer', 'b2c2-template'); ?></a>
                    </div>
                </div>
            </div>
        </div>
    </footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

<!-- Mobile Menu Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const primaryMenu = document.querySelector('#primary-menu');
    
    if (menuToggle && primaryMenu) {
        menuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
            primaryMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[name="newsletter_email"]').value;
            
            // Here you can add your newsletter subscription logic
            // For now, just show a simple alert
            alert('Thank you for subscribing! We\'ll be in touch soon.');
            this.reset();
        });
    }
});
</script>

</body>
</html>