import { motion } from 'framer-motion';

// An animated SVG semicircle gauge to visually show confidence score
export default function ConfidenceGauge({ value = 0, color = '#FF4D6A' }) {
  // SVG viewBox 0 0 200 100 makes a perfect semicircle if we draw an arc
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (value * circumference);

  return (
    <div className="relative w-full max-w-[200px] aspect-[2/1] mx-auto flex items-end justify-center">
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 100">
        {/* Background track (Grey) */}
        <path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke="#2A2A3A"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Animated value track */}
        <motion.path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Display percentage text inside the gauge */}
      <div className="text-3xl font-bold mb-[-5px]" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </div>
    </div>
  );
}
