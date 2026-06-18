import { Link } from 'react-router-dom';
import styles from './Profile.module.css';

const WishlistPage = () => {
  // Mock wishlist data for now
  const wishlistItems = [];

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Your wishlist is currently empty.</p>
          <Link to="/products" className={styles.shopBtn}>Discover Products</Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {/* We will map over real wishlist items here later */}
          <p>Wishlist items would appear here.</p>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
