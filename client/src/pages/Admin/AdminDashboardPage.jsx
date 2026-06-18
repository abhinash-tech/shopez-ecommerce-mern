import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders/all'),
          api.get('/products'),
          api.get('/users')
        ]);

        const orders = ordersRes.data.data || [];
        const products = productsRes.data.meta?.total || 0;
        const users = usersRes.data.data || [];

        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalProducts: products,
          totalUsers: users.length
        });

        setRecentOrders(orders.slice(0, 5)); // Get top 5 recent
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpis = [
    { id: 1, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰' },
    { id: 2, label: 'Total Orders', value: stats.totalOrders.toLocaleString('en-IN'), icon: '🛒' },
    { id: 3, label: 'Total Products', value: stats.totalProducts, icon: '📦' },
    { id: 4, label: 'Total Customers', value: stats.totalUsers, icon: '👥' },
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
            </div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardLayout} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.feedPanel}>
          <h2 className={styles.panelTitle}>Recent Orders</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent orders.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                      <td>{order.user?.name || 'Unknown User'}</td>
                      <td>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`${styles.badge} ${
                          order.status === 'delivered' ? styles.badgeSuccess :
                          order.status === 'cancelled' ? styles.badgeError : styles.badgeWarning
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
