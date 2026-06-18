import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  // Mock fetching dashboard stats
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalRevenue: 2450000,
        totalOrders: 1245,
        totalProducts: 342,
        totalUsers: 890
      });
      setLoading(false);
    }, 500);
  }, []);

  const kpis = [
    { id: 1, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, trend: '+14%', isPositive: true, icon: '💰' },
    { id: 2, label: 'Total Orders', value: stats.totalOrders.toLocaleString('en-IN'), trend: '+5%', isPositive: true, icon: '🛒' },
    { id: 3, label: 'Total Products', value: stats.totalProducts, trend: '-2%', isPositive: false, icon: '📦' },
    { id: 4, label: 'Total Users', value: stats.totalUsers, trend: '+12%', isPositive: true, icon: '👥' },
  ];

  if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {kpis.map(kpi => (
          <div key={kpi.id} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={styles.kpiIcon}>{kpi.icon}</span>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={`${styles.kpiTrend} ${kpi.isPositive ? styles.trendUp : styles.trendDown}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Recent Activity Placeholder Layout */}
      <div className={styles.dashboardLayout}>
        <div className={styles.chartPanel}>
          <h2 className={styles.panelTitle}>Revenue Overview (Mock)</h2>
          <div className={styles.chartPlaceholder}>
            <p>Line Chart Visualization Area</p>
          </div>
        </div>
        
        <div className={styles.feedPanel}>
          <h2 className={styles.panelTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>👤</div>
              <div>
                <p className={styles.activityText}>New user <strong>Rahul S.</strong> registered.</p>
                <p className={styles.activityTime}>2 mins ago</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🛒</div>
              <div>
                <p className={styles.activityText}>Order <strong>#SEZ-9812</strong> placed for ₹29,900.</p>
                <p className={styles.activityTime}>15 mins ago</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>📦</div>
              <div>
                <p className={styles.activityText}>Vendor requested product approval.</p>
                <p className={styles.activityTime}>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
