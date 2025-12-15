import { useState, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Menu, LogOut, Bell, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import kloudspotIcon from '../../assets/kloudspot-icon.png';

const SiteContext = createContext(undefined);

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteContext must be used within DashboardLayout');
  }
  return context;
};

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSiteSelect, setShowSiteSelect] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [alerts, setAlerts] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Crowd Entries', href: '/crowd-entries', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const addAlert = (alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 20));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const selectedSite = sites.find(s => s.siteId === selectedSiteId);

  const getSeverityClass = (severity) => {
    if (severity === 'high') return 'bg-destructive/10 border-l-destructive';
    if (severity === 'medium') return 'bg-warning/10 border-l-warning';
    return 'bg-secondary/50 border-l-muted-foreground';
  };

  return (
    <SiteContext.Provider value={{ sites, setSites, selectedSiteId, setSelectedSiteId, alerts, addAlert, clearAlerts }}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 ${
            sidebarOpen ? 'w-56' : 'w-16'
          }`}
        >
          {/* Sidebar background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 400" fill="none">
              <path d="M-50 100 L150 50 L200 150 L50 200 Z" stroke="currentColor" strokeWidth="1" className="text-primary" />
              <path d="M-30 200 L170 150 L220 250 L70 300 Z" stroke="currentColor" strokeWidth="1" className="text-primary" />
              <path d="M-70 300 L130 250 L180 350 L30 400 Z" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </svg>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border relative">
            <img src={kloudspotIcon} alt="Kloudspot" className="h-8 w-8 object-contain" />
            {sidebarOpen && (
              <span className="font-display text-lg text-sidebar-foreground">kloudspot</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Menu className="w-3 h-3" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 relative">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-sidebar-border relative">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-56' : 'ml-16'
          }`}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-lg text-foreground">Crowd Solutions</h1>
                <div className="h-6 w-px bg-border" />
                {/* Site selector in header */}
                <div className="relative">
                  <button
                    onClick={() => setShowSiteSelect(!showSiteSelect)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">{selectedSite?.name || 'Select a site'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSiteSelect && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSiteSelect(false)} />
                      <div className="absolute left-0 top-full mt-2 w-[220px] bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {sites.map((site) => (
                          <button
                            key={site.siteId}
                            onClick={() => {
                              setSelectedSiteId(site.siteId);
                              setShowSiteSelect(false);
                            }}
                            className="w-full px-4 py-2 text-left text-foreground hover:bg-secondary/50 transition-colors text-sm"
                          >
                            {site.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Notifications/Alerts button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowAlerts(!showAlerts)}
                    className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {alerts.length > 9 ? '9+' : alerts.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Alerts dropdown */}
                  {showAlerts && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <h3 className="font-semibold text-foreground">Alerts</h3>
                          {alerts.length > 0 && (
                            <button
                              onClick={clearAlerts}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {alerts.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                              No alerts yet
                            </div>
                          ) : (
                            alerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={`px-4 py-3 border-b border-border/50 border-l-4 ${getSeverityClass(alert.severity)}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{alert.personName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {alert.direction.includes('entry') ? '↗ Entered' : '↙ Exited'} {alert.zoneName}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(alert.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SiteContext.Provider>
  );
};
