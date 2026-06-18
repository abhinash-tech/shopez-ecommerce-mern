import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import styles from './Profile.module.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return styles.statusDelivered;
      case 'shipped': return styles.statusShipped;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return <div className={styles.loading}>Loading your orders...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Order History</h1>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className={styles.shopBtn}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                </div>
                <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className={styles.orderBody}>
                <p className={styles.itemSummary}>
                  {order.items[0]?.name} {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : ''}
                </p>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  <Link to={`/dashboard/profile/orders/${order._id}`} className={styles.viewDetailsBtn}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
