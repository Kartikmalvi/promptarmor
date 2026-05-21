import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ThreatTimeline({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 bg-cards border border-border rounded-xl">
        No data yet — send prompts in the demo
      </div>
    );
  }

  return (
    <div className="bg-cards border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Threat Timeline (24h)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: '8px' }}
              itemStyle={{ color: '#F0EFF8' }}
            />
            <Area type="monotone" dataKey="allowed" stroke="#34D399" fill="#34D399" fillOpacity={0.15} />
            <Area type="monotone" dataKey="flagged" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.15} />
            <Area type="monotone" dataKey="blocked" stroke="#FF4D6A" fill="#FF4D6A" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
