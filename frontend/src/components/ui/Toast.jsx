import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  // Map toast types to Lucide icons
  const icons = {
    success: <ShieldCheck size={20} className="text-success" />,
    error: <ShieldAlert size={20} className="text-danger" />,
    warning: <AlertTriangle size={20} className="text-warning" />,
    info: <Info size={20} className="text-accent" />
  };

  // Map toast types to border colors
  const borders = {
    success: 'border-success/50',
    error: 'border-danger/50',
    warning: 'border-warning/50',
    info: 'border-accent/50'
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={`bg-cards border ${borders[toast.type]} rounded-lg p-4 shadow-xl flex items-start gap-3 w-[320px] pointer-events-auto relative overflow-hidden`}
    >
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)} 
        className="text-gray-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
