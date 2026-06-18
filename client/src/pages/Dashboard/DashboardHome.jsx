import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import ProductCarousel from '../../components/product/ProductCarousel/ProductCarousel';
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=24');
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const recommendedForYou = [...products].sort(() => 0.5 - Math.random()).slice(0, 6);
  const trendingProducts = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 6);
  const todaysDeals = [...products].filter(p => p.discountPercent).slice(0, 6);
  
  if (todaysDeals.length === 0) {
    todaysDeals.push(...products.slice(8, 14)); // Fallback if no discounts
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* ── Welcome Section & Quick Actions ── */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeHeader}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className={styles.welcomeSubtitle}>Here is what is happening with your account today.</p>
        </div>
        
        <div className={styles.quickActionsGrid}>
          <Link to="/dashboard/profile/orders" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}>📦</div>
            <div className={styles.quickActionText}>
              <h3>My Orders</h3>
              <p>Track your recent orders</p>
            </div>
          </Link>
          
          <Link to="/dashboard/profile/wishlist" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}>❤️</div>
            <div className={styles.quickActionText}>
              <h3>Wishlist</h3>
              <p>Items you saved</p>
            </div>
          </Link>
          
          <Link to="/cart" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}>🛒</div>
            <div className={styles.quickActionText}>
              <h3>Shopping Cart</h3>
              <p>{itemCount} items waiting for checkout</p>
            </div>
          </Link>

          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard/profile'} className={styles.quickActionCard}>
            <div className={styles.quickActionIcon}>👤</div>
            <div className={styles.quickActionText}>
              <h3>My Profile</h3>
              <p>Manage account settings</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Personalized Carousels ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading personalized recommendations...</div>
      ) : (
        <div className={styles.carouselsWrapper}>
          <ProductCarousel title="Recommended For You" products={recommendedForYou} />
          <ProductCarousel title="Trending Right Now" products={trendingProducts} />
          <ProductCarousel title="Today's Deals" products={todaysDeals} />
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
