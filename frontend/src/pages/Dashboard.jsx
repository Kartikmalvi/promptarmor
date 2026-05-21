import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ThreatTimeline from '../components/dashboard/ThreatTimeline';
import LiveFeed from '../components/dashboard/LiveFeed';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalScanned: 0,
    blocked: 0,
    flagged: 0,
    avgResponseTime: 0
  });
  const [timelineData, setTimelineData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch for stats
    const fetchStats = async () => {
      const data = await api.getStats();
      if (data) {
        setStats(data.summary || stats);
        setTimelineData(data.timeline || []);
        setLogs(data.recentLogs || []);
      }
    };
    
    fetchStats();

    // Supabase realtime subscription
    const channel = supabase
      .channel('prompt_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prompt_logs' },
        (payload) => {
          const newLog = payload.new;
          
          if (newLog.verdict === 'blocked') addToast('⊘ Attack blocked!', 'error');
          if (newLog.verdict === 'flagged') addToast('⚠ Request flagged', 'warning');

          // Update logs
          setLogs((prev) => [newLog, ...prev].slice(0, 20));
          
          // Update stats dynamically
          setStats((prev) => ({
            ...prev,
            totalScanned: prev.totalScanned + 1,
            blocked: newLog.verdict === 'blocked' ? prev.blocked + 1 : prev.blocked,
            flagged: newLog.verdict === 'flagged' ? prev.flagged + 1 : prev.flagged,
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          addToast('● Connected to live feed', 'success');
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-cards border border-border rounded-full text-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-gray-500'}`} />
          {isConnected ? 'LIVE' : 'DISCONNECTED'}
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Scanned" 
          value={stats.totalScanned} 
          icon={ShieldCheck} 
          color="#34D399" 
        />
        <StatCard 
          label="Blocked" 
          value={stats.blocked} 
          icon={ShieldAlert} 
          color="#FF4D6A" 
        />
        <StatCard 
          label="Flagged" 
          value={stats.flagged} 
          icon={AlertTriangle} 
          color="#FBBF24" 
        />
        <StatCard 
          label="Avg Response Time" 
          value={`${stats.avgResponseTime}ms`} 
          icon={Clock} 
          color="#7C6EF8" 
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTimeline data={timelineData} />
        </div>
        <div className="bg-cards border border-border rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 h-[300px] lg:h-auto">
          {/* Placeholder for Attack Breakdown Donut Chart */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text mb-4">Attack Breakdown</h3>
            <p>Donut chart placeholder</p>
          </div>
        </div>
      </div>

      {/* Row 3: Live Feed */}
      <LiveFeed logs={logs} />
    </motion.div>
  );
}
