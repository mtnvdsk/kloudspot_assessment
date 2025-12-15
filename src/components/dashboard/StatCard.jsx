export const StatCard = ({ title, value, icon: Icon, isLive, glowColor = 'primary', trend }) => {
  const TrendIcon = () => (
    <svg viewBox="0 0 24 12" className="w-6 h-3" fill="none">
      {trend?.isPositive ? (
        <path d="M0 10 L4 6 L8 8 L16 2 L24 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M0 2 L4 6 L8 4 L16 10 L24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>
      
      <div className="font-display text-4xl font-bold text-foreground mb-4">
        {value}
      </div>
      
      {trend && (
        <div className={`flex items-center gap-2 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
          <TrendIcon />
          <span className="text-sm font-medium">
            {trend.value}% {trend.isPositive ? 'More' : 'Less'} than yesterday
          </span>
        </div>
      )}
    </div>
  );
};
