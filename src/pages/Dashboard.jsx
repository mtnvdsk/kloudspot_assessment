import { useEffect, useState, useCallback } from 'react';
import { Users, Footprints, Clock, CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { DashboardLayout, useSiteContext } from '@/components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { OccupancyChart } from '../components/dashboard/OccupancyChart';
import { DemographicsTimeline, DemographicsPie } from '../components/dashboard/DemographicsChart';
import { fetchDwellTime, fetchFootfall, fetchOccupancy, fetchDemographics } from '../services/analyticsApi';
import { fetchSites } from '../services/sitesApi';
import { useSocketIO } from '../hooks/useSocketIO';

const DashboardContent = () => {
  const { sites, setSites, selectedSiteId, setSelectedSiteId, addAlert } = useSiteContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [liveOccupancy, setLiveOccupancy] = useState(0);
  const [footfall, setFootfall] = useState(0);
  const [avgDwellMinutes, setAvgDwellMinutes] = useState(0);
  const [occupancyData, setOccupancyData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [comparisonFootfall, setComparisonFootfall] = useState(0);
  const [comparisonDwell, setComparisonDwell] = useState(0);
  const [comparisonOccupancyAtSameHour, setComparisonOccupancyAtSameHour] = useState(0);

  const isToday = startOfDay(selectedDate).getTime() === startOfDay(new Date()).getTime();
  const currentHour = format(new Date(), 'HH:00');

  useEffect(() => {
    const loadSites = async () => {
      const sitesData = await fetchSites();
      setSites(sitesData);
      if (sitesData.length > 0 && !selectedSiteId) {
        setSelectedSiteId(sitesData[0].siteId);
      }
    };
    loadSites();
  }, [setSites, setSelectedSiteId, selectedSiteId]);

  const loadData = useCallback(async () => {
    if (!selectedSiteId) return;

    const fromUtc = startOfDay(selectedDate).getTime();
    const toUtc = endOfDay(selectedDate).getTime();
    const comparisonDate = subDays(selectedDate, 1);
    const compFromUtc = startOfDay(comparisonDate).getTime();
    const compToUtc = endOfDay(comparisonDate).getTime();

    try {
      const [dwellData, footfallData, occupancyResponse, demographicsResponse, compDwellData, compFootfallData, compOccupancyData] = await Promise.all([
        fetchDwellTime({ siteId: selectedSiteId, fromUtc, toUtc }),
        fetchFootfall({ siteId: selectedSiteId, fromUtc, toUtc }),
        fetchOccupancy({ siteId: selectedSiteId, fromUtc, toUtc }),
        fetchDemographics({ siteId: selectedSiteId, fromUtc, toUtc }),
        fetchDwellTime({ siteId: selectedSiteId, fromUtc: compFromUtc, toUtc: compToUtc }).catch(() => ({ avgDwellMinutes: 0 })),
        fetchFootfall({ siteId: selectedSiteId, fromUtc: compFromUtc, toUtc: compToUtc }).catch(() => ({ footfall: 0 })),
        fetchOccupancy({ siteId: selectedSiteId, fromUtc: compFromUtc, toUtc: compToUtc }).catch(() => ({ buckets: [] })),
      ]);

      setAvgDwellMinutes(dwellData.avgDwellMinutes || 0);
      setFootfall(footfallData.footfall || 0);
      const buckets = occupancyResponse.buckets || [];
      setOccupancyData(buckets);
      setDemographicsData(demographicsResponse.buckets || []);
      setLiveOccupancy(Math.round(buckets.length > 0 ? buckets[buckets.length - 1].avgOccupancy || 0 : 0));
      setComparisonDwell(compDwellData.avgDwellMinutes || 0);
      setComparisonFootfall(compFootfallData.footfall || 0);
      const sameHourBucket = (compOccupancyData.buckets || []).find((b) => b.hour === currentHour);
      setComparisonOccupancyAtSameHour(sameHourBucket ? Math.round(sameHourBucket.avgOccupancy || 0) : 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [selectedSiteId, selectedDate, currentHour]);

  const handleAlert = useCallback((alert) => {
    addAlert({ 
      id: alert.eventId, 
      personName: alert.personName,
      zoneName: alert.zoneName,
      direction: alert.direction,
      severity: alert.severity,
      ts: alert.ts 
    });

    if (!isToday || alert.siteId !== selectedSiteId) return;

    const isEntry = alert.direction.includes('entry');
    if (isEntry) {
      setLiveOccupancy(prev => prev + 1);
      setFootfall(prev => prev + 1);
    } else {
      setLiveOccupancy(prev => Math.max(0, prev - 1));
    }
  }, [selectedSiteId, isToday, addAlert]);

  const handleLiveOccupancy = useCallback((data) => {
    if (isToday && data.siteId === selectedSiteId) {
      setLiveOccupancy(data.count);
    }
  }, [selectedSiteId, isToday]);

  useSocketIO({ onAlert: handleAlert, onLiveOccupancy: handleLiveOccupancy, enabled: true });

  useEffect(() => {
    if (selectedSiteId) {
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    }
  }, [selectedSiteId, loadData]);

  const formatDwellTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return '0m';
    const mins = Math.round(minutes);
    const secs = Math.round((minutes % 1) * 60);
    if (mins < 60) return `${String(mins).padStart(2, '0')}min ${String(secs).padStart(2, '0')}sec`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const calcComparison = (today, yesterday) => {
    if (!yesterday || yesterday === 0) return { value: 0, isPositive: true };
    const diff = ((today - yesterday) / yesterday) * 100;
    return { value: Math.abs(Math.round(diff)), isPositive: diff >= 0 };
  };

  const occupancyTrend = calcComparison(liveOccupancy, comparisonOccupancyAtSameHour);
  const footfallTrend = calcComparison(footfall, comparisonFootfall);
  const dwellTrend = calcComparison(avgDwellMinutes, comparisonDwell);

  const occupancyChartData = occupancyData.map(bucket => {
    const localTime = bucket.local || '';
    const timePart = localTime.split(' ')[1] || '00:00:00';
    const hour = timePart.substring(0, 5);
    return {
      time: hour,
      count: Math.round(bucket.avg || bucket.avgOccupancy || 0),
    };
  });

  const demographicsTimelineData = demographicsData.map(bucket => {
    const localTime = bucket.local || '';
    const timePart = localTime.split(' ')[1] || '00:00:00';
    const hour = timePart.substring(0, 5);
    return {
      time: hour,
      male: bucket.male || 0,
      female: bucket.female || 0,
    };
  });

  const totalMale = demographicsData.reduce((sum, b) => sum + (b.male || 0), 0);
  const totalFemale = demographicsData.reduce((sum, b) => sum + (b.female || 0), 0);
  const total = totalMale + totalFemale;
  const demographicsPieData = total > 0 ? [
    { name: 'Male', value: Math.round((totalMale / total) * 100) },
    { name: 'Female', value: Math.round((totalFemale / total) * 100) },
  ] : [{ name: 'Male', value: 50 }, { name: 'Female', value: 50 }];

  return (
    <>
      {/* Header with date selector */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Overview</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{isToday ? 'Today' : format(selectedDate, 'PPP')}</span>
            </button>
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 top-full mt-2 w-auto p-3 bg-card border border-border rounded-lg shadow-lg z-50">
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(new Date(e.target.value));
                        setShowDatePicker(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Occupancy section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">Occupancy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={isToday ? "Live Occupancy" : "Avg Occupancy"}
            value={isLoading ? '--' : liveOccupancy.toLocaleString()}
            icon={Users}
            isLive={isToday}
            glowColor="success"
            trend={{ value: occupancyTrend.value, isPositive: occupancyTrend.isPositive, label: 'vs yesterday' }}
          />
          <StatCard
            title={isToday ? "Today's Footfall" : "Total Footfall"}
            value={isLoading ? '--' : footfall.toLocaleString()}
            icon={Footprints}
            glowColor="primary"
            trend={{ value: footfallTrend.value, isPositive: footfallTrend.isPositive, label: 'vs yesterday' }}
          />
          <StatCard
            title="Avg Dwell Time"
            value={isLoading ? '--' : formatDwellTime(avgDwellMinutes)}
            icon={Clock}
            glowColor="warning"
            trend={{ value: dwellTrend.value, isPositive: dwellTrend.isPositive, label: 'vs yesterday' }}
          />
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="mb-8">
        <OccupancyChart data={occupancyChartData} />
      </div>

      {/* Demographics section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Demographics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DemographicsPie data={demographicsPieData} />
          <DemographicsTimeline data={demographicsTimelineData} />
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Dashboard;
