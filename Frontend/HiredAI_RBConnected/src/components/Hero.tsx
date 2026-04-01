import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import exampleImage from 'figma:asset/e1dde1a34c4765627631de14ecbd5c65fe553651.png';

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-gray-900 leading-tight">
              Craft. Prepare. Conquer.<br />
              With Hired AI
            </h1>
            
            <p className="text-gray-600 max-w-lg">
              Your AI-powered career partner – from building resumes to mastering 
              interviews and landing your dream job.
            </p>

            <motion.button
              className="bg-black text-white px-8 py-4 rounded-xl flex items-center gap-2 transition-all"
              whileHover={{ 
                scale: 1.03, 
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)' 
              }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Right Content - Resume Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] hidden lg:block"
          >
            {/* Card 1 - Back */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-20 w-64 h-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ transform: 'rotate(-5deg)' }}
            >
              <img 
                src={exampleImage} 
                alt="Resume preview" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Card 2 - Front */}
            <motion.div
              animate={{ 
                y: [0, -12, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-8 right-0 w-72 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ transform: 'rotate(3deg)' }}
            >
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-900 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
                
                <div className="space-y-3 pt-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-4/5" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3 - Left back */}
            <motion.div
              animate={{ 
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-12 right-52 w-56 h-72 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-xl border border-purple-100"
              style={{ transform: 'rotate(-8deg)' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
