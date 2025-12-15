import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const LiveLabel = (props) => {
  const { viewBox } = props;
  if (!viewBox) return null;
  const { x } = viewBox;
  
  return (
    <g>
      <rect
        x={x - 18}
        y={5}
        width={36}
        height={22}
        rx={3}
        fill="#b91c1c"
      />
      <text
        x={x}
        y={20}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight="bold"
      >
        LIVE
      </text>
    </g>
  );
};

export const OccupancyChart = ({ data }) => {
  const currentHour = new Date().getHours();
  const currentHourStr = currentHour.toString().padStart(2, '0') + ':00';
  
  const validData = Array.isArray(data) ? data.filter(d => d && typeof d.time === 'string') : [];
  
  const dataMap = new Map();
  validData.forEach(d => {
    const timeParts = d.time.split(':');
    if (timeParts.length >= 1) {
      const hour = parseInt(timeParts[0], 10);
      if (!isNaN(hour) && hour <= currentHour) {
        dataMap.set(hour, d.count || 0);
      }
    }
  });

  const startHour = 8;
  const chartData = Array.from({ length: Math.max(1, currentHour - startHour + 1) }, (_, i) => {
    const hour = startHour + i;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return {
      time: timeStr,
      count: dataMap.get(hour) || 0
    };
  });

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count || 0), 50) : 250;
  const yAxisMax = Math.ceil(maxCount / 50) * 50 + 50;
  
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">Overall Occupancy</h3>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#4db6ac' }} />
          <span className="text-sm text-muted-foreground">Occupancy</span>
        </div>
      </div>
      
      <div className="h-[280px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 35, right: 20, left: 10, bottom: 35 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4db6ac" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4db6ac" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={8}
              />
              <YAxis 
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dx={-5}
                domain={[0, yAxisMax]}
                tickCount={6}
              />
              <text
                x="50%"
                y="98%"
                textAnchor="middle"
                fill="#6b7280"
                fontSize={12}
              >
                Time
              </text>
              <text
                x={-140}
                y={15}
                transform="rotate(-90)"
                textAnchor="middle"
                fill="#6b7280"
                fontSize={12}
              >
                Count
              </text>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#1f2937', fontWeight: 500 }}
                itemStyle={{ color: '#4db6ac' }}
                formatter={(value) => [value.toLocaleString(), 'Occupancy']}
              />
              <ReferenceLine 
                x={currentHourStr} 
                stroke="#b91c1c"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={<LiveLabel />}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4db6ac"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
                name="Occupancy"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};
