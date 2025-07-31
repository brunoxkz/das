<?php
/**
 * Template for displaying Contact page
 * Based on B2C2.com contact structure
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- Page Header -->
    <section class="page-header" style="padding: 4rem 0; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; text-align: center;">
            <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; margin-bottom: 1rem;">
                Contact Us
            </h1>
            <p style="font-size: 1.2rem; opacity: 0.9; max-width: 800px; margin: 0 auto;">
                Get in touch with our team of digital asset experts
            </p>
        </div>
    </section>

    <!-- Contact Information -->
    <section class="contact-info" style="padding: 6rem 0; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;">
                
                <!-- Contact Details -->
                <div class="contact-details">
                    <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 2rem; color: #111827;">
                        Get in Touch
                    </h2>
                    <p style="font-size: 1.1rem; color: #6B7280; line-height: 1.7; margin-bottom: 3rem;">
                        Our team is ready to help you with your digital asset trading needs. Contact us to learn more about our institutional solutions.
                    </p>
                    
                    <div class="contact-methods" style="display: grid; gap: 2rem;">
                        <!-- Email -->
                        <div class="contact-method" style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-envelope" style="color: white; font-size: 1.25rem;"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">Email</h4>
                                <p style="color: #6B7280; margin: 0;">hello@yourcompany.com</p>
                            </div>
                        </div>
                        
                        <!-- Phone -->
                        <div class="contact-method" style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-phone" style="color: white; font-size: 1.25rem;"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">Phone</h4>
                                <p style="color: #6B7280; margin: 0;">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        
                        <!-- Office -->
                        <div class="contact-method" style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; background: #0066FF; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-map-marker-alt" style="color: white; font-size: 1.25rem;"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">Office</h4>
                                <p style="color: #6B7280; margin: 0;">123 Business District<br>Financial Center, FC 12345</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Form -->
                <div class="contact-form-section">
                    <form class="contact-form" style="background: #f8f9fa; padding: 2.5rem; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 2rem; color: #111827;">
                            Send us a message
                        </h3>
                        
                        <div style="display: grid; gap: 1.5rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">First Name</label>
                                    <input type="text" name="first_name" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Last Name</label>
                                    <input type="text" name="last_name" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                                </div>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Email</label>
                                <input type="email" name="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Company</label>
                                <input type="text" name="company" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Subject</label>
                                <select name="subject" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                                    <option value="">Select a subject</option>
                                    <option value="trading">Trading Solutions</option>
                                    <option value="partnership">Partnership Inquiry</option>
                                    <option value="support">Customer Support</option>
                                    <option value="media">Media Inquiry</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Message</label>
                                <textarea name="message" rows="5" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; resize: vertical;"></textarea>
                            </div>
                            
                            <button type="submit" style="padding: 1rem 2rem; background: #0066FF; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.3s ease; justify-self: start;">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Office Locations -->
    <section class="office-locations" style="padding: 6rem 0; background: #f8f9fa;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: #111827;">
                    Global Presence
                </h2>
                <p style="font-size: 1.1rem; color: #6B7280; max-width: 600px; margin: 0 auto;">
                    Our offices around the world provide 24/7 support to our institutional clients
                </p>
            </div>

            <div class="offices-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <!-- London Office -->
                <div class="office-card" style="background: white; border-radius: 12px; padding: 2rem; text-align: center; border: 1px solid #e5e7eb;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">London</h3>
                    <p style="color: #6B7280; margin-bottom: 1rem;">Headquarters</p>
                    <p style="color: #374151; font-size: 0.875rem;">
                        123 Financial District<br>
                        London, EC1A 1AA<br>
                        United Kingdom
                    </p>
                </div>

                <!-- New York Office -->
                <div class="office-card" style="background: white; border-radius: 12px; padding: 2rem; text-align: center; border: 1px solid #e5e7eb;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">New York</h3>
                    <p style="color: #6B7280; margin-bottom: 1rem;">Americas Hub</p>
                    <p style="color: #374151; font-size: 0.875rem;">
                        456 Wall Street<br>
                        New York, NY 10005<br>
                        United States
                    </p>
                </div>

                <!-- Singapore Office -->
                <div class="office-card" style="background: white; border-radius: 12px; padding: 2rem; text-align: center; border: 1px solid #e5e7eb;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">Singapore</h3>
                    <p style="color: #6B7280; margin-bottom: 1rem;">Asia Pacific Hub</p>
                    <p style="color: #374151; font-size: 0.875rem;">
                        789 Marina Bay<br>
                        Singapore 018956<br>
                        Singapore
                    </p>
                </div>
            </div>
        </div>
    </section>

</main>

<?php get_footer(); ?>