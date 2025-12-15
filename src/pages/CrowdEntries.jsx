import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, RefreshCw } from 'lucide-react';
import { DashboardLayout, useSiteContext } from '../components/layout/DashboardLayout';
import { fetchEntryExit, getTodayTimeRange } from '../services/analyticsApi';
import { fetchSites } from '../services/sitesApi';

const CrowdEntriesContent = () => {
  const { sites, setSites, selectedSiteId, setSelectedSiteId } = useSiteContext();
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageSize = 10;

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

  const loadEntries = async () => {
    if (!selectedSiteId) return;
    const timeRange = getTodayTimeRange();
    try {
      const response = await fetchEntryExit({
        siteId: selectedSiteId,
        fromUtc: timeRange.fromUtc,
        toUtc: timeRange.toUtc,
        pageSize,
        pageNumber: currentPage,
      });
      setEntries(response.records || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  useEffect(() => {
    if (selectedSiteId) {
      setIsLoading(true);
      loadEntries().finally(() => setIsLoading(false));
    }
  }, [selectedSiteId, currentPage]);

  const formatDwellTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  const getSeverityClass = (severity) => {
    if (severity === 'high') return 'bg-destructive/20 text-destructive';
    if (severity === 'medium') return 'bg-warning/20 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(1);
      if (currentPage > 3) buttons.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        buttons.push(i);
      }
      if (currentPage < totalPages - 2) buttons.push('...');
      buttons.push(totalPages);
    }
    return buttons;
  };

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Crowd Entries</h1>
          <p className="text-muted-foreground">Individual visitor entry and exit records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadEntries().finally(() => setIsRefreshing(false));
            }}
            disabled={isRefreshing || !selectedSiteId}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Visitor</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Zone</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Entry Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exit Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dwell Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading entries...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">No entries found</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.personId + entry.entryUtc}
                    className={`border-b border-border/50 transition-colors hover:bg-secondary/20 ${!entry.exitUtc ? 'bg-primary/5' : ''}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{entry.personName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityClass(entry.severity)}`}>
                        {entry.zoneName}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-display text-foreground">{entry.entryLocal}</td>
                    <td className="py-4 px-6 font-display">
                      {entry.exitLocal ? (
                        <span className="text-foreground">{entry.exitLocal}</span>
                      ) : (
                        <span className="text-success flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          Inside
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-display font-medium ${!entry.exitUtc ? 'text-primary' : 'text-muted-foreground'}`}>
                        {formatDwellTime(entry.dwellMinutes)}{!entry.exitUtc && '+'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {totalRecords > 0 ? (
              <>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries</>
            ) : (
              'No entries'
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {getPaginationButtons().map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={idx} className="text-muted-foreground px-2">...</span>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const CrowdEntries = () => {
  return (
    <DashboardLayout>
      <CrowdEntriesContent />
    </DashboardLayout>
  );
};

export default CrowdEntries;
