import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Fetching
    setTimeout(() => {
      setOrders([
        { id: 'ORD-9982', customer: 'John Doe', date: '2026-06-17', amount: 29900, status: 'Processing', items: 1 },
        { id: 'ORD-9981', customer: 'Rahul Sharma', date: '2026-06-16', amount: 83800, status: 'Shipped', items: 2 },
        { id: 'ORD-9980', customer: 'Anita Desai', date: '2026-06-15', amount: 5900, status: 'Delivered', items: 1 },
        { id: 'ORD-9979', customer: 'Vikram Singh', date: '2026-06-14', amount: 14500, status: 'Cancelled', items: 3 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return styles.badgeSuccess;
      case 'Shipped': return styles.badgeInfo;
      case 'Processing': return styles.badgeWarning;
      case 'Cancelled': return styles.badgeError;
      default: return styles.badgeInfo;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Order Management</h1>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <input type="text" placeholder="Search by Order ID..." className={styles.tableSearch} />
          <select className={styles.tableSearch}>
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td style={{fontWeight: 600, color: '#111827'}}>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td style={{fontWeight: 600}}>₹{order.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.btnEdit}>Update</button>
                        <button className={styles.btnEdit} style={{color: '#6b7280'}}>View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 4 of 1,245 entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled>Previous</button>
            <button className={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
