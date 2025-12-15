import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'];

export const DemographicsPie = ({ data }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">Chart of Demographics</h3>
      
      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground">Total Crowd</span>
          <span className="font-display text-xl font-bold text-foreground">100%</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DemographicsTimeline = ({ data }) => {
  const currentHour = new Date().getHours();
  
  const validData = Array.isArray(data) ? data.filter(d => d && typeof d.time === 'string') : [];
  
  const dataMap = new Map();
  validData.forEach(d => {
    const timeParts = d.time.split(':');
    if (timeParts.length >= 1) {
      const hour = parseInt(timeParts[0], 10);
      if (!isNaN(hour) && hour <= currentHour) {
        dataMap.set(hour, { male: d.male || 0, female: d.female || 0 });
      }
    }
  });

  const startHour = 8;
  const chartData = Array.from({ length: Math.max(1, currentHour - startHour + 1) }, (_, i) => {
    const hour = startHour + i;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const hourData = dataMap.get(hour);
    return {
      time: timeStr,
      male: hourData?.male || 0,
      female: hourData?.female || 0
    };
  });

  const maxCount = chartData.length > 0 
    ? Math.max(...chartData.map(d => Math.max(d.male || 0, d.female || 0)), 10) 
    : 100;
  const yAxisMax = Math.ceil(maxCount / 10) * 10 + 10;

  return (
    <div className="glass-card p-6 animate-slide-up lg:col-span-2" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">Demographics Analysis</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">Female</span>
          </div>
        </div>
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 35 }}>
            <defs>
              <linearGradient id="maleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="femaleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
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
              x={-120}
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
            />
            <Area
              type="monotone"
              dataKey="male"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#maleGradient)"
              name="Male"
            />
            <Area
              type="monotone"
              dataKey="female"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              fill="url(#femaleGradient)"
              name="Female"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
