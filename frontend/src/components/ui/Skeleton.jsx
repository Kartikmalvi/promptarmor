import { motion } from 'framer-motion';

// A simple loading skeleton component for the UI
export default function Skeleton({ width = '100%', height = '20px', rounded = 'md', className = '' }) {
  return (
    <div 
      className={`relative overflow-hidden bg-[#1A1A24] ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : rounded === 'xl' ? 'rounded-xl' : 'rounded-md'} ${className}`}
      style={{ width, height }}
    >
      {/* Shimmer Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2A2A3A] to-transparent opacity-50"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
    </div>
  );
}
