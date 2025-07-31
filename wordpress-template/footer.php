        <footer id="colophon" class="site-footer" style="background: #111827; color: white; padding: 4rem 0 2rem;">
                <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
                        <div class="footer-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
                                
                                <!-- Company Info -->
                                <div class="footer-section">
                                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; color: white;">
                                                <?php bloginfo('name'); ?>
                                        </h3>
                                        <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 1.5rem;">
                                                Leading digital asset liquidity provider serving institutional clients globally with cutting-edge technology and deep market expertise.
                                        </p>
                                        
                                        <!-- Social Links -->
                                        <div class="social-links" style="display: flex; gap: 1rem;">
                                                <?php
                                                $social_sites = array(
                                                        'linkedin' => array('icon' => 'fab fa-linkedin', 'label' => 'LinkedIn'),
                                                        'twitter' => array('icon' => 'fab fa-twitter', 'label' => 'Twitter'),
                                                        'youtube' => array('icon' => 'fab fa-youtube', 'label' => 'YouTube')
                                                );
                                                
                                                foreach ($social_sites as $social_site => $details) {
                                                        $social_url = get_theme_mod($social_site, '');
                                                        if ($social_url) {
                                                                echo '<a href="' . esc_url($social_url) . '" style="color: #9ca3af; font-size: 1.25rem; transition: color 0.3s ease;" target="_blank" rel="noopener" aria-label="' . $details['label'] . '">
                                                                        <i class="' . $details['icon'] . '"></i>
                                                                </a>';
                                                        }
                                                }
                                                ?>
                                        </div>
                                </div>
                                
                                <!-- Solutions -->
                                <div class="footer-section">
                                        <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; color: white;">Solutions</h4>
                                        <ul style="list-style: none; padding: 0; margin: 0;">
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/solutions/trading-overview" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Trading Overview</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/solutions/product" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">OTC Products</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/solutions/liquidity-partner" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Liquidity Partner</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/client-onboarding" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Client Onboarding</a>
                                                </li>
                                        </ul>
                                </div>
                                
                                <!-- Company -->
                                <div class="footer-section">
                                        <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; color: white;">Company</h4>
                                        <ul style="list-style: none; padding: 0; margin: 0;">
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/about" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">About</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/insights" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Insights</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/press-releases" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Press Releases</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/careers" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Careers</a>
                                                </li>
                                        </ul>
                                </div>
                                
                                <!-- Legal -->
                                <div class="footer-section">
                                        <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; color: white;">Legal</h4>
                                        <ul style="list-style: none; padding: 0; margin: 0;">
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/privacy-policy" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Privacy Policy</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/terms-of-service" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Terms of Service</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/risk-disclosure" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Risk Disclosure</a>
                                                </li>
                                                <li style="margin-bottom: 0.75rem;">
                                                        <a href="/contact" style="color: #d1d5db; text-decoration: none; transition: color 0.3s ease;">Contact</a>
                                                </li>
                                        </ul>
                                </div>
                        </div>
                        
                        <!-- Footer Bottom -->
                        <div class="footer-bottom" style="padding-top: 2rem; border-top: 1px solid #374151; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                                <div class="copyright" style="color: #9ca3af; font-size: 0.875rem;">
                                        <?php 
                                        $footer_text = get_theme_mod('footer_text', '© ' . date('Y') . ' ' . get_bloginfo('name') . '. All rights reserved.');
                                        echo esc_html($footer_text);
                                        ?>
                                </div>
                                
                                <div class="footer-disclaimer" style="color: #9ca3af; font-size: 0.75rem; max-width: 600px; text-align: right;">
                                        B2C2 does not transact with or provide any services to retail investors or consumers.
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