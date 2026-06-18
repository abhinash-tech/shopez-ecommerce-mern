import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Home.module.css';

const Home = () => {
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

  const categories = [
    { id: 1, name: 'Electronics', icon: '💻' },
    { id: 2, name: 'Fashion', icon: '👕' },
    { id: 3, name: 'Home & Living', icon: '🛋️' },
    { id: 4, name: 'Beauty', icon: '✨' },
    { id: 5, name: 'Sports', icon: '⚽' },
    { id: 6, name: 'Toys', icon: '🧸' },
  ];

  const featured = products.slice(4, 8);

  return (
    <div className={styles.homeContainer}>
      {/* ── Hero Banner ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Summer Sale 2026</span>
          <h1 className={styles.heroTitle}>Discover Your Next<br/> Favorite Thing</h1>
          <p className={styles.heroSubtitle}>
            Shop the latest trends in electronics, fashion, and home goods with up to 50% off.
          </p>
          <div className={styles.heroActions}>
            <Link to="/products" className={styles.btnPrimary}>Shop Now</Link>
            <a href="#categories" className={styles.btnSecondary}>Explore Categories</a>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <div className={`${styles.blob} ${styles.blob1}`}></div>
          <div className={`${styles.blob} ${styles.blob2}`}></div>
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
            alt="Fashion Model" 
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <Link to={`/products?category=${cat.name.toLowerCase()}`} key={cat.id} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>{cat.icon}</div>
              <h3 className={styles.categoryName}>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <Link to="/products?featured=true" className={styles.linkAll}>View All &rarr;</Link>
        </div>
        <div className={styles.productGrid}>
          {loading ? <p>Loading...</p> : featured.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.cardImageWrapper}>
                <img src={product.images[0]} alt={product.name} className={styles.cardImage} />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.cardFooter}>
                  <Link to="/login" style={{ fontSize: '0.8rem', color: '#6b7280', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>🔒 Sign in for price</Link>
                  <Link to="/login" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: '#111827', textDecoration: 'none' }}>Login</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Get 15% Off Your First Order</h2>
          <p className={styles.newsletterDesc}>
            Subscribe to our newsletter and be the first to know about new arrivals, sales, and exclusive offers.
          </p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className={styles.newsletterInput}
              required 
            />
            <button type="submit" className={styles.newsletterBtn}>Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;


