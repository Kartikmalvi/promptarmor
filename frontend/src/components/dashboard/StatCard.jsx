import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-cards border border-border rounded-xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-gray-400 font-medium text-sm">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={20} />
        </div>
      </div>
      <motion.div
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-bold text-text"
      >
        {value}
      </motion.div>
    </div>
  );
}
