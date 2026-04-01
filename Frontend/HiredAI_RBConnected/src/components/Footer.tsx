import { Linkedin, Instagram, Twitter } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded" />
              <span className="text-white">Hired AI</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Your AI-powered career partner for building standout resumes and landing your dream job.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-white mb-4">Useful Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Resume Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Hired AI. All rights reserved.</p>
        </div>
      </div>

      {/* Large Watermark with Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-[12rem] md:text-[16rem] lg:text-[20rem] tracking-wider select-none"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'rgba(200, 162, 255, 0.1)',
            textShadow: `
              0 0 40px rgba(200, 162, 255, 0.3),
              0 0 80px rgba(200, 162, 255, 0.2),
              0 0 120px rgba(200, 162, 255, 0.1)
            `,
            WebkitTextStroke: '1px rgba(200, 162, 255, 0.1)',
          }}
        >
          Hired AI
        </motion.div>
      </div>
    </footer>
  );
}
