import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function LiveFeed({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-cards border border-border rounded-xl p-12 flex flex-col items-center justify-center text-gray-400">
        <Shield size={48} className="mb-4 opacity-20" />
        <p>No activity yet</p>
      </div>
    );
  }

  const getBadge = (verdict) => {
    switch (verdict) {
      case 'blocked':
        return <span className="px-3 py-1 bg-danger/20 text-danger rounded-full text-xs font-semibold">⊘ Blocked</span>;
      case 'flagged':
        return <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-semibold">⚠ Flagged</span>;
      case 'allowed':
        return <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">✓ Allowed</span>;
      default:
        return <span>{verdict}</span>;
    }
  };

  return (
    <div className="bg-cards border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Live Feed</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111118] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Verdict</th>
              <th className="px-6 py-4 font-medium">Attack Type</th>
              <th className="px-6 py-4 font-medium">Confidence</th>
              <th className="px-6 py-4 font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {logs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-border/50 hover:bg-[#1A1A24]/50"
                >
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getBadge(log.verdict)}</td>
                  <td className="px-6 py-4 text-gray-300">{log.attackType || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent" 
                        style={{ width: `${(log.confidence || 0) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{log.latency}ms</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
