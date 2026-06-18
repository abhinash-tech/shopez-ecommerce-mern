import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>ShopEZ<span className={styles.dot}>.</span></Link>
          <p className={styles.brandText}>
            Your one-stop destination for premium products. Experience seamless shopping, secure payments, and lightning-fast delivery.
          </p>
        </div>

        <div className={styles.linksCol}>
          <h3 className={styles.colTitle}>Shop</h3>
          <Link to="/products" className={styles.footerLink}>All Products</Link>
          <Link to="/products?category=electronics" className={styles.footerLink}>Electronics</Link>
          <Link to="/products?category=fashion" className={styles.footerLink}>Fashion</Link>
          <Link to="/products?category=home" className={styles.footerLink}>Home & Living</Link>
        </div>

        <div className={styles.linksCol}>
          <h3 className={styles.colTitle}>Support</h3>
          <Link to="/faq" className={styles.footerLink}>Help Center / FAQ</Link>
          <Link to="/track" className={styles.footerLink}>Track Your Order</Link>
          <Link to="/returns" className={styles.footerLink}>Returns & Exchanges</Link>
          <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
        </div>

        <div className={styles.newsletterCol}>
          <h3 className={styles.colTitle}>Stay Updated</h3>
          <p className={styles.newsletterText}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required aria-label="Email for newsletter" />
            <button type="submit" aria-label="Subscribe to newsletter">Subscribe</button>
          </form>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
