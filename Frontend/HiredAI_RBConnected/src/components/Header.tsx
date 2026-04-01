import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-6 h-6 bg-black rounded" />
            <span className="text-gray-900">Hired AI</span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#explore" className="text-gray-600 hover:text-gray-900 transition-colors">
              Explore
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Login Button */}
          <motion.button
            className="bg-black text-white px-6 py-2 rounded-lg transition-all"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            Log In
          </motion.button>
        </div>
      </div>
    </header>
  );
}
