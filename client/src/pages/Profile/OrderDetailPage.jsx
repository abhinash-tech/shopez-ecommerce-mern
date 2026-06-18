import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import styles from './Profile.module.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        // Mock data fallback
        setOrder({
          _id: id,
          createdAt: new Date().toISOString(),
          status: 'shipped',
          totalAmount: 41900,
          shippingAddress: {
            fullName: 'John Doe',
            street: '123 React Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400001'
          },
          items: [
            { 
              _id: 'itm1',
              name: 'Apple Watch Series 9', 
              price: 41900, 
              quantity: 1, 
              image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&q=80'
            }
          ],
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 43200000).toISOString() },
            { status: 'shipped', timestamp: new Date().toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading order details...</div>;
  if (!order) return <div className={styles.error}>Order not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <Link to="/dashboard/profile/orders" className={styles.backLink}>&larr; Back to Orders</Link>
        <h1 className={styles.pageTitle}>Order #{order._id.slice(-6).toUpperCase()}</h1>
      </div>

      <div className={styles.timeline}>
        {['pending', 'confirmed', 'shipped', 'delivered'].map((step, idx) => {
          const isCompleted = order.statusHistory.some(h => h.status === step);
          return (
            <div key={step} className={`${styles.timelineStep} ${isCompleted ? styles.stepCompleted : ''}`}>
              <div className={styles.stepCircle}>{idx + 1}</div>
              <span className={styles.stepLabel}>{step}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Items</h2>
          <div className={styles.orderedItems}>
            {order.items.map(item => (
              <div key={item._id} className={styles.orderedItem}>
                <img src={item.image} alt={item.name} />
                <div className={styles.itemMeta}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemQty}>Qty: {item.quantity}</p>
                </div>
                <div className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Shipping Details</h2>
          <p className={styles.addressLine}><strong>{order.shippingAddress.fullName}</strong></p>
          <p className={styles.addressLine}>{order.shippingAddress.street}</p>
          <p className={styles.addressLine}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>
          
          <hr className={styles.divider} />
          
          <h2 className={styles.cardTitle}>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.summaryRowMain}>
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
