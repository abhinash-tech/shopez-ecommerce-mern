import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      // Update local state
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'delivered': return styles.badgeSuccess;
      case 'shipped': return styles.badgeInfo;
      case 'processing': 
      case 'pending': 
      case 'confirmed': return styles.badgeWarning;
      case 'cancelled': 
      case 'returned': return styles.badgeError;
      default: return styles.badgeInfo;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Order Management</h1>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status / Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td style={{fontWeight: 600, color: '#111827'}}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.user?.name || 'Unknown User'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{fontWeight: 600}}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`${styles.badge} ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <select 
                          className={styles.tableSearch} 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={{ padding: '0.2rem', margin: 0, width: 'auto' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
