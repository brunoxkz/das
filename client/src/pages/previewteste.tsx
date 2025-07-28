import { useState } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';

export default function PreviewTeste() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                B2C2
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  Solutions
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  About
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  News & Insights
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  Contact
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                  Careers
                </a>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                Solutions
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                News & Insights
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                Contact
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                Careers
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              More than just a liquidity provider,{' '}
              <span className="block">
                B2C2 is a digital asset pioneer building the ecosystem of the future
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              B2C2's success is built on a foundation of proprietary crypto-native technology 
              combined with an innovative range of products, making the firm the partner of 
              choice for diverse institutions globally.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News Cards */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured Article 1 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop" 
                alt="A very stable GENIUS"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  A very stable GENIUS: The US stablecoin bill and the next key to scaling adoption
                </h3>
                <p className="text-gray-500 text-sm mb-4">July 23, 2025</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 2 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop" 
                alt="HashKey Exchange Partnership"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  HashKey Exchange, Hong Kong's Largest Licensed Virtual Asset Exchange, Partners with Global Leading Crypto Market Maker B2C2
                </h3>
                <p className="text-gray-500 text-sm mb-4">March 10, 2025</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 3 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop" 
                alt="Corporate Bond on Blockchain"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Press release</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  B2C2 and PV01 Pioneer Corporate Bond on Blockchain
                </h3>
                <p className="text-gray-500 text-sm mb-4">November 25, 2024</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Featured Article 4 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop" 
                alt="OpenPayd Partnership"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Press release</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  B2C2 Partners with OpenPayd to Expand its Global Instant Settlement Network
                </h3>
                <p className="text-gray-500 text-sm mb-4">October 28, 2024</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Solutions Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Institutional solutions
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our large and growing client base around the world trusts us to deliver seamless execution 24/7.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
              Explore institutional solutions <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solution 1 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Trading overview</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>

            {/* Solution 2 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">OTC Products</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>

            {/* Solution 3 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Liquidity Partner</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>

            {/* Solution 4 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Client onboarding</h3>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12 text-center">
            Latest news
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* News Item 1 */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 bg-white rounded mb-4">
                <span className="text-gray-900 font-bold text-sm block text-center leading-8">B2C2</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Press release</div>
              <h3 className="font-bold text-white mb-2">
                B2C2 and PV01 Pioneer Corporate Bond on Blockchain
              </h3>
              <p className="text-gray-400 text-sm mb-4">November 25, 2024</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center">
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* News Item 2 */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 bg-white rounded mb-4">
                <span className="text-gray-900 font-bold text-sm block text-center leading-8">B2C2</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Press release</div>
              <h3 className="font-bold text-white mb-2">
                B2C2 Partners with OpenPayd to Expand its Global Instant Settlement Network
              </h3>
              <p className="text-gray-400 text-sm mb-4">October 28, 2024</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center">
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* News Item 3 */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 bg-white rounded mb-4">
                <span className="text-gray-900 font-bold text-sm block text-center leading-8">B2C2</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Press release</div>
              <h3 className="font-bold text-white mb-2">
                B2C2 Appoints Cactus Raazi as US CEO
              </h3>
              <p className="text-gray-400 text-sm mb-4">September 2, 2024</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center">
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* News Item 4 */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 bg-white rounded mb-4">
                <span className="text-gray-900 font-bold text-sm block text-center leading-8">B2C2</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Press release</div>
              <h3 className="font-bold text-white mb-2">
                Arbelos and B2C2 Complete First Bilateral OTC Option Transaction on BVIV Index
              </h3>
              <p className="text-gray-400 text-sm mb-4">June 4, 2024</p>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center">
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
            Events
          </h2>
          <div className="text-center text-gray-500">
            No items found.
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe</h2>
          <p className="text-gray-600 mb-8">
            Sign up to our news alerts to receive our regular newsletter and institutional insights 
            into the crypto market direct to your inbox.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </div>
          </form>
          
          <p className="text-sm text-gray-500 mt-4">
            B2C2 does not transact with or provide any service to any retail investor or consumer. 
            By subscribing to our content, you represent that you are not a retail investor or consumer. 
            Please refer to our disclaimer for further information.
          </p>
        </div>
      </section>

      {/* Institutional Insights Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            Institutional Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Insight 1 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop" 
                alt="Future Frontiers"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Insights</div>
                <p className="text-sm text-gray-500 mb-2">October 1, 2024</p>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  B2C2 joins forces with Future Frontiers to support social mobility by hosting student career development program
                </h3>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop" 
                alt="Q3 Review"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Insights</div>
                <p className="text-sm text-gray-500 mb-2">October 13, 2022</p>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Q3 2022: Quarterly Review
                </h3>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop" 
                alt="Treasurer's Guide"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Insights</div>
                <p className="text-sm text-gray-500 mb-2">September 20, 2022</p>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  A Treasurer's guide to Becoming Crypto-ready
                </h3>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop" 
                alt="Trading Sideways Market"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Insights</div>
                <p className="text-sm text-gray-500 mb-2">August 17, 2022</p>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Trading a sideways crypto market
                </h3>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            We use cookies to improve user experience and analyze website traffic. By clicking "Accept", 
            you agree to our website's cookie use as described in our Cookie Policy. You can change your 
            cookie settings at any time by clicking "Preferences."
          </p>
          <div className="flex gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg">
              Preferences
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg">
              Reject
            </button>
            <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}