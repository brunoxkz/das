    <!-- B2C2 Footer Minimalista -->
    <footer id="colophon" class="site-footer" style="background: white; border-top: 1px solid #e5e7eb; padding: 3rem 0 2rem;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 3rem;">
            
            <!-- Main Footer Content -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem; margin-bottom: 3rem;">
                
                <!-- Company Info -->
                <div>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 1.5rem; color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                        B2C2
                    </div>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 2rem; max-width: 300px; font-size: 14px;">
                        <?php echo get_theme_mod('footer_description', 'More than just a liquidity provider, B2C2 is a digital asset pioneer building the ecosystem of the future.'); ?>
                    </p>
                </div>
                
                <!-- Solutions -->
                <div>
                    <h4 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        Solutions
                    </h4>
                    <ul style="list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/solutions/trading-overview" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Trading Overview
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/solutions/spot-trading" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Spot Trading
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/solutions/derivatives" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Derivatives
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- Company -->
                <div>
                    <h4 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        Company
                    </h4>
                    <ul style="list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/about" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                About
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/insights" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Insights
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/join-b2c2" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Join B2C2
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- Legal -->
                <div>
                    <h4 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        Legal
                    </h4>
                    <ul style="list-style: none; margin: 0; padding: 0;">
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/disclosure" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Disclosure
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/regulatory-permissions" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Regulatory Permissions
                            </a>
                        </li>
                        <li style="margin-bottom: 0.75rem;">
                            <a href="/privacy-policy" style="color: #666; text-decoration: none; font-size: 14px; transition: color 0.2s ease;">
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>
                
            </div>
            
            <!-- Bottom Bar -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                
                <!-- Copyright -->
                <div style="color: #999; font-size: 14px;">
                    <?php echo '© ' . date('Y') . ' ' . get_bloginfo('name') . '. All rights reserved.'; ?>
                </div>
                
                <!-- Social Links -->
                <div style="display: flex; gap: 1.5rem;">
                    <?php
                    $social_links = array(
                        'linkedin' => get_theme_mod('linkedin'),
                        'twitter' => get_theme_mod('twitter')
                    );
                    
                    foreach ($social_links as $platform => $url) {
                        if ($url) {
                            $platform_name = ucfirst($platform);
                            echo '<a href="' . esc_url($url) . '" target="_blank" style="color: #999; text-decoration: none; transition: color 0.2s ease; font-size: 14px;">
                                    ' . $platform_name . '
                                  </a>';
                        }
                    }
                    ?>
                </div>
                
            </div>
            
        </div>
    </footer>

</div><!-- #page -->

<?php wp_footer(); ?>

<!-- B2C2 Mobile Menu Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            const isOpen = navMenu.style.display === 'flex';
            navMenu.style.display = isOpen ? 'none' : 'flex';
            
            // Animate hamburger lines
            const lines = this.querySelectorAll('span');
            if (lines.length >= 3) {
                if (isOpen) {
                    lines[0].style.transform = 'rotate(0deg)';
                    lines[1].style.opacity = '1';
                    lines[2].style.transform = 'rotate(0deg)';
                } else {
                    lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    lines[1].style.opacity = '0';
                    lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                }
            }
        });
    }
});
</script>

<!-- B2C2 CSS for Mobile -->
<style>
@media (max-width: 768px) {
    .header-content {
        flex-wrap: wrap;
    }
    
    .menu-toggle {
        display: block !important;
    }
    
    .nav-menu {
        display: none !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        flex-direction: column;
        padding: 2rem;
        z-index: 1000;
    }
    
    .nav-menu ul {
        flex-direction: column !important;
        gap: 1rem !important;
    }
    
    .footer-content {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
    }
    
    .hero-section h1 {
        font-size: 2.5rem !important;
        line-height: 1.2 !important;
    }
    
    .values-section {
        grid-template-columns: 1fr !important;
        gap: 3rem !important;
    }
    
    .solutions-grid {
        grid-template-columns: 1fr !important;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 1.5rem !important;
    }
    
    .container {
        padding: 0 1.5rem !important;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr !important;
    }
    
    .hero-section {
        padding: 3rem 0 !important;
    }
    
    .hero-section h1 {
        font-size: 2rem !important;
    }
}
</style>

</body>
</html>