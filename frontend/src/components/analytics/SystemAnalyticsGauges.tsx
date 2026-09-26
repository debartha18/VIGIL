import React from 'react';
import { BarChart2, Shield, Crosshair, CheckCircle } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  color,
  size = 46,
  strokeWidth = 4,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#132337"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-[11px] font-mono font-bold text-white tracking-tight">
        {value}%
      </span>
    </div>
  );
};

export const SystemAnalyticsGauges: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const metrics = [
    {
      id: 'emb',
      title: 'Embedding index',
      subtitle: 'Semantic search model (RemoteCLIP)',
      status: '128 tiles  •  512-dim cosine',
      value: 96,
      color: '#00E5FF',
      icon: <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />,
    },
    {
      id: 'change',
      title: 'Change detection',
      subtitle: 'Siamese differencing + NDWI/NDBI',
      status: '6 confirmed  •  Sub-pixel aligned',
      value: 93,
      color: '#10B981',
      icon: <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />,
    },
    {
      id: 'suppress',
      title: 'False alarm filter',
      subtitle: '8-tier rejection pipeline (gate ≥ 0.65)',
      status: '4 false alarms suppressed',
      value: 91,
      color: '#10B981',
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />,
    },
  ];

  return (
    <div className="w-full h-full bg-[#0B1523] border border-[#182A40] rounded-xl p-3.5 flex flex-col justify-between select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#182A40]/80">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-semibold text-white tracking-normal font-sans">
            System analytics
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[11px] text-[#64748B] hover:text-white transition px-2 py-0.5 rounded hover:bg-[#0E1A2B]"
          >
            Collapse
          </button>
        )}
      </div>

      {/* 3 Metric Rows */}
      <div className="space-y-2.5 pt-1.5">
        {metrics.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-[#070D16]/60 border border-[#182A40]/60 hover:bg-[#0E1E33] transition">
            {/* Left Icon + Text */}
            <div className="flex items-start space-x-2.5 pr-2 truncate">
              <div className="w-7 h-7 rounded-lg bg-[#0E1F33] border border-[#182A40] flex items-center justify-center shrink-0 mt-0.5">
                {m.icon}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white leading-tight truncate">
                  {m.title}
                </div>
                <div className="text-[11px] text-[#94A3B8] leading-tight truncate mt-0.5">
                  {m.subtitle}
                </div>
                <div className="text-[10px] font-mono text-[#64748B] mt-0.5 truncate">
                  {m.status}
                </div>
              </div>
            </div>

            {/* Circular Gauge */}
            <CircularGauge value={m.value} color={m.color} />
          </div>
        ))}
      </div>
    </div>
  );
};
