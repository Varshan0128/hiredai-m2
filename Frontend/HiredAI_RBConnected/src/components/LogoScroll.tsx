import { motion } from 'motion/react';

const companies = [
  { name: 'Infosys', style: 'italic' },
  { name: 'Google', style: 'normal' },
  { name: 'cognizant', style: 'normal' },
  { name: 'ORACLE', style: 'normal' },
  { name: 'Meta', style: 'normal' },
];

export default function LogoScroll() {
  // Duplicate for seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
      <div className="relative">
        <motion.div
          className="flex gap-16 items-center"
          animate={{
            x: [0, -100 * companies.length],
          }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{ width: 'fit-content' }}
        >
          {duplicatedCompanies.map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-gray-400 text-2xl px-8"
              style={{ 
                fontStyle: company.style,
                minWidth: '150px',
                textAlign: 'center'
              }}
            >
              {company.name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
