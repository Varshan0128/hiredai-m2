import { motion } from 'motion/react';
import { Brain, FileText, Target, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Resume Builder',
    description: 'Create a professional ATS-optimized resume that truly represents your skills and experience.',
    color: '#C8A2FF'
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    description: 'Choose from modern, recruiter-approved templates designed to get you noticed.',
    color: '#A8D5C2'
  },
  {
    icon: Target,
    title: 'Interview Prep',
    description: 'Practice with AI-powered mock interviews tailored to your target role.',
    color: '#FF7F7F'
  },
  {
    icon: Sparkles,
    title: 'Instant Optimization',
    description: 'Get real-time feedback and suggestions to improve your resume impact.',
    color: '#C8A2FF'
  },
  {
    icon: Users,
    title: 'Career Guidance',
    description: 'Receive personalized career advice and job matching recommendations.',
    color: '#A8D5C2'
  },
];

export default function ExploreSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('explore-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="explore" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div id="explore-section" className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-gray-900 mb-4">
            Explore Hired AI
          </h2>
        </motion.div>

        {/* Large Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mt-12"
        >
          {/* Cards Grid with Scroll Reveal */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)'
                  }}
                  className="bg-gray-50 rounded-2xl p-6 space-y-4 transition-all"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  
                  <h3 className="text-gray-900">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Center Feature Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 text-center space-y-4 max-w-2xl mx-auto"
          >
            <div className="flex justify-center">
              <Brain className="w-16 h-16 text-gray-900" />
            </div>
            <h3 className="text-gray-900">
              AI-Powered Resume Builder
            </h3>
            <p className="text-gray-600">
              Create a professional ATS-optimized resume that truly represents your skills, 
              experience, and achievements. Stand out from the competition with intelligent 
              formatting and industry-specific recommendations.
            </p>
          </motion.div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full transition-all ${
                  dot === 2 ? 'bg-gray-900 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
