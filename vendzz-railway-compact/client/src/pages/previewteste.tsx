import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PreviewTeste() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  // Fetch dynamic data from API
  const { data: news } = useQuery({
    queryKey: ['/api/news'],
    queryFn: () => fetch('/api/news?limit=4').then(res => res.json()),
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/insights'],
    queryFn: () => fetch('/api/insights?limit=4').then(res => res.json()),
  });

  const { data: solutions } = useQuery({
    queryKey: ['/api/solutions'],
    queryFn: () => fetch('/api/solutions').then(res => res.json()),
  });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'website' })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setEmail('');
        alert('Thank you for subscribing to our newsletter!');
      } else {
        alert(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-blue-800 text-white font-sans overflow-x-hidden">
      <style>{`
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes animate-fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: animate-fade-in 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: animate-fade-in-delay 1s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-400 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-purple-600 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 right-1/3 w-48 h-48 bg-purple-500 rounded-full opacity-15 animate-ping"></div>
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500 rounded-full opacity-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pink-500 rounded-full opacity-15"
          style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
        ></div>
      </div>

      {/* Header Navigation */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                B2C2
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 rounded-lg">
                  Solutions
                </a>
                <a href="#" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 rounded-lg">
                  About
                </a>
                <a href="#" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 rounded-lg">
                  News & Insights
                </a>
                <a href="#" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 rounded-lg">
                  Contact
                </a>
                <a href="#" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 rounded-lg">
                  Careers
                </a>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-white/10 backdrop-blur-md inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-all duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-md border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="text-white/80 hover:text-white block px-3 py-3 text-base font-medium hover:bg-white/10 rounded-lg transition-all duration-300">
                Solutions
              </a>
              <a href="#" className="text-white/80 hover:text-white block px-3 py-3 text-base font-medium hover:bg-white/10 rounded-lg transition-all duration-300">
                About
              </a>
              <a href="#" className="text-white/80 hover:text-white block px-3 py-3 text-base font-medium hover:bg-white/10 rounded-lg transition-all duration-300">
                News & Insights
              </a>
              <a href="#" className="text-white/80 hover:text-white block px-3 py-3 text-base font-medium hover:bg-white/10 rounded-lg transition-all duration-300">
                Contact
              </a>
              <a href="#" className="text-white/80 hover:text-white block px-3 py-3 text-base font-medium hover:bg-white/10 rounded-lg transition-all duration-300">
                Careers
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-transparent to-blue-900/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-bounce mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-80"></div>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-7xl font-bold text-white leading-tight mb-6 sm:mb-8 animate-fade-in px-2">
              More than just a{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                liquidity provider
              </span>
              <span className="block mt-2 sm:mt-4">
                B2C2 is a digital asset pioneer building the{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ecosystem of the future
                </span>
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12 animate-fade-in-delay px-4">
              B2C2's success is built on a foundation of proprietary crypto-native technology 
              combined with an innovative range of products, making the firm the partner of 
              choice for diverse institutions globally.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <button className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
              </button>
              
              <button className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                Learn More
                <ArrowRight className="inline-block ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <a 
                href="/admin-panel" 
                className="w-full sm:w-auto group px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-2xl text-center block"
              >
                Admin Panel
                <ArrowRight className="inline-block ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Floating Animation Elements - Hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-20 left-10 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-60"></div>
        <div className="hidden sm:block absolute top-40 right-20 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="hidden sm:block absolute bottom-32 left-1/4 w-8 h-8 bg-cyan-400 rounded-full animate-bounce opacity-30"></div>
      </section>

      {/* Featured News Cards */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 px-4">Latest Insights</h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Featured Article 1 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-purple-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop" 
                  alt="A very stable GENIUS"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg group-hover:text-purple-300 transition-colors duration-300 line-clamp-3">
                  A very stable GENIUS: The US stablecoin bill and the next key to scaling adoption
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">July 23, 2025</p>
                <a href="#" className="text-purple-400 hover:text-purple-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 2 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-blue-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop" 
                  alt="HashKey Exchange Partnership"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg group-hover:text-blue-300 transition-colors duration-300 line-clamp-3">
                  HashKey Exchange, Hong Kong's Largest Licensed Virtual Asset Exchange, Partners with Global Leading Crypto Market Maker B2C2
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">March 10, 2025</p>
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 3 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-indigo-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop" 
                  alt="Corporate Bond on Blockchain"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-xs text-purple-300 uppercase tracking-wide mb-2 font-semibold">Press release</div>
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg group-hover:text-indigo-300 transition-colors duration-300 line-clamp-3">
                  B2C2 and PV01 Pioneer Corporate Bond on Blockchain
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">November 25, 2024</p>
                <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 4 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-cyan-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop" 
                  alt="OpenPayd Partnership"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-xs text-cyan-300 uppercase tracking-wide mb-2 font-semibold">Press release</div>
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg group-hover:text-cyan-300 transition-colors duration-300 line-clamp-3">
                  B2C2 Partners with OpenPayd to Expand its Global Instant Settlement Network
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">October 28, 2024</p>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Solutions Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-b from-black/20 to-transparent overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent px-4">
              Institutional solutions
            </h2>
            <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Our large and growing client base around the world trusts us to deliver seamless execution 24/7.
            </p>
            <a href="#" className="group inline-flex items-center text-purple-400 hover:text-purple-300 font-medium text-base sm:text-lg transition-all duration-300">
              Explore institutional solutions 
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Solution 1 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer border border-white/10 hover:border-purple-400/50 transform hover:-translate-y-3 hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-4 text-lg sm:text-xl group-hover:text-purple-300 transition-colors duration-300">Trading overview</h3>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-purple-400 group-hover:translate-x-2 transition-all duration-300" />
            </div>

            {/* Solution 2 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer border border-white/10 hover:border-green-400/50 transform hover:-translate-y-3 hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-4 text-lg sm:text-xl group-hover:text-green-300 transition-colors duration-300">OTC Products</h3>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-green-400 group-hover:translate-x-2 transition-all duration-300" />
            </div>

            {/* Solution 3 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer border border-white/10 hover:border-indigo-400/50 transform hover:-translate-y-3 hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-4 text-lg sm:text-xl group-hover:text-indigo-300 transition-colors duration-300">Liquidity Partner</h3>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all duration-300" />
            </div>

            {/* Solution 4 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer border border-white/10 hover:border-orange-400/50 transform hover:-translate-y-3 hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-4 text-lg sm:text-xl group-hover:text-orange-300 transition-colors duration-300">Client onboarding</h3>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-orange-400 group-hover:translate-x-2 transition-all duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-b from-black/40 to-black/60 overflow-hidden">
        {/* Background Effects - Hidden on mobile for performance */}
        <div className="absolute inset-0 opacity-5 hidden sm:block">
          <div className="absolute top-20 right-20 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent px-4">
              Latest news
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* News Item 1 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-purple-400/50 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">B2C2</span>
              </div>
              <div className="text-xs text-purple-300 uppercase tracking-wide mb-2 sm:mb-3 font-semibold">Press release</div>
              <h3 className="font-bold text-white mb-2 sm:mb-3 text-base sm:text-lg group-hover:text-purple-300 transition-colors duration-300 line-clamp-3">
                B2C2 and PV01 Pioneer Corporate Bond on Blockchain
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">November 25, 2024</p>
              <a href="#" className="text-purple-400 hover:text-purple-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>

            {/* News Item 2 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-blue-400/50 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">B2C2</span>
              </div>
              <div className="text-xs text-blue-300 uppercase tracking-wide mb-2 sm:mb-3 font-semibold">Press release</div>
              <h3 className="font-bold text-white mb-2 sm:mb-3 text-base sm:text-lg group-hover:text-blue-300 transition-colors duration-300 line-clamp-3">
                B2C2 Partners with OpenPayd to Expand its Global Instant Settlement Network
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">October 28, 2024</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>

            {/* News Item 3 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-indigo-400/50 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">B2C2</span>
              </div>
              <div className="text-xs text-indigo-300 uppercase tracking-wide mb-2 sm:mb-3 font-semibold">Press release</div>
              <h3 className="font-bold text-white mb-2 sm:mb-3 text-base sm:text-lg group-hover:text-indigo-300 transition-colors duration-300 line-clamp-3">
                B2C2 Appoints Cactus Raazi as US CEO
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">September 2, 2024</p>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium text-xs sm:text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>

            {/* News Item 4 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-xl p-8 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-cyan-400/50 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">B2C2</span>
              </div>
              <div className="text-xs text-cyan-300 uppercase tracking-wide mb-3 font-semibold">Press release</div>
              <h3 className="font-bold text-white mb-3 text-lg group-hover:text-cyan-300 transition-colors duration-300">
                Arbelos and B2C2 Complete First Bilateral OTC Option Transaction on BVIV Index
              </h3>
              <p className="text-gray-300 text-sm mb-6">June 4, 2024</p>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Events
            </h2>
            <div className="inline-block p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60"></div>
              </div>
              <p className="text-gray-300 text-lg">No items found.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-indigo-900/50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-full mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Subscribe
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Sign up to our news alerts to receive our regular newsletter and institutional insights 
            into the crypto market direct to your inbox.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-300 hover:bg-white/20"
                required
              />
              <button
                type="submit"
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all duration-300 font-semibold transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center justify-center">
                  Subscribe
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </form>
          
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
            B2C2 does not transact with or provide any service to any retail investor or consumer. 
            By subscribing to our content, you represent that you are not a retail investor or consumer. 
            Please refer to our disclaimer for further information.
          </p>
        </div>
      </section>

      {/* Institutional Insights Section */}
      <section className="relative py-20 bg-gradient-to-b from-black/20 to-transparent overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-32 left-32 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Institutional Insights
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Insight 1 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-purple-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop" 
                  alt="Future Frontiers Program"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-purple-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">Insights</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-purple-300 mb-3 font-semibold">October 1, 2024</div>
                <h3 className="font-bold text-white mb-4 text-lg group-hover:text-purple-300 transition-colors duration-300 leading-tight">
                  B2C2 joins forces with Future Frontiers to support social mobility by hosting student career development program
                </h3>
                <a href="#" className="text-purple-400 hover:text-purple-300 font-medium text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-blue-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop" 
                  alt="Q3 2022 Review"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">Insights</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-blue-300 mb-3 font-semibold">October 13, 2022</div>
                <h3 className="font-bold text-white mb-4 text-lg group-hover:text-blue-300 transition-colors duration-300">
                  Q3 2022: Quarterly Review
                </h3>
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-indigo-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop" 
                  alt="Treasurer's Guide"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-indigo-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">Insights</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-indigo-300 mb-3 font-semibold">September 20, 2022</div>
                <h3 className="font-bold text-white mb-4 text-lg group-hover:text-indigo-300 transition-colors duration-300">
                  A Treasurer's guide to Becoming Crypto-ready
                </h3>
                <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-cyan-400/50 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop" 
                  alt="Trading Sideways Market"
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-cyan-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">Insights</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-cyan-300 mb-3 font-semibold">August 17, 2022</div>
                <h3 className="font-bold text-white mb-4 text-lg group-hover:text-cyan-300 transition-colors duration-300">
                  Trading a sideways crypto market
                </h3>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center group-hover:translate-x-1 transition-all duration-300">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20 p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300">
            We use cookies to improve user experience and analyze website traffic. By clicking "Accept", 
            you agree to our website's cookie use as described in our Cookie Policy. You can change your 
            cookie settings at any time by clicking "Preferences."
          </p>
          <div className="flex gap-2">
            <button className="text-sm text-gray-300 hover:text-white px-4 py-2 border border-white/30 rounded-lg hover:border-white/50 transition-all duration-300">
              Preferences
            </button>
            <button className="text-sm text-gray-300 hover:text-white px-4 py-2 border border-white/30 rounded-lg hover:border-white/50 transition-all duration-300">
              Reject
            </button>
            <button className="text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}