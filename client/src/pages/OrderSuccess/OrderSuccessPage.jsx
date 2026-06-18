import { useLocation, Link } from 'react-router-dom';
import styles from './OrderSuccessPage.module.css';

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'SEZ-DEFAULT-000';

  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        
        <div className={styles.iconWrapper}>
          <div className={styles.checkIcon}>✓</div>
        </div>
        
        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>
          Thank you for shopping with ShopEZ. Your order has been received and is currently being processed.
        </p>
        
        <div className={styles.orderDetails}>
          <span className={styles.orderLabel}>Order Number</span>
          <span className={styles.orderNumber}>{orderId}</span>
        </div>
        
        <p className={styles.emailNote}>
          We've sent a confirmation email with your order details and tracking information.
        </p>

        <div className={styles.actionGroup}>
          <Link to="/products" className={styles.continueBtn}>Continue Shopping</Link>
          <Link to="/dashboard/profile/orders" className={styles.trackBtn}>Track Order</Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
