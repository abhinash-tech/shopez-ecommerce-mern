import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.navbarContainer}>
      <div className={styles.navbarInner}>
        
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="ShopEZ Home">
          ShopEZ<span className={styles.dot}>.</span>
        </Link>

        {/* Desktop Links */}
        <nav className={styles.navLinks}>
          <Link to="/products" className={styles.navLink}>Shop</Link>
          <Link to="/products?category=electronics" className={styles.navLink}>Electronics</Link>
          <Link to="/products?category=fashion" className={styles.navLink}>Fashion</Link>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          <div className={styles.searchBox}>
            <input type="text" placeholder="Search..." aria-label="Search products" />
            <button aria-label="Submit search">🔍</button>
          </div>

          <Link to="/cart" className={styles.cartIcon} aria-label={`View cart with ${itemCount} items`}>
            🛒
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </Link>

          {user ? (
            <div className={styles.userDropdownContainer}>
              <button className={styles.avatarBtn} aria-label="User Menu">
                <div className={styles.avatarCircle}>{user.name.charAt(0).toUpperCase()}</div>
                <span className={styles.avatarName}>Hello, {user.name.split(' ')[0]}</span>
                <span className={styles.dropdownArrow}>▼</span>
              </button>
              
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <hr className={styles.dropdownDivider} />
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={styles.dropdownItem}>👤 My Profile</Link>
                <Link to="/orders" className={styles.dropdownItem}>📦 Orders</Link>
                <Link to="/wishlist" className={styles.dropdownItem}>❤️ Wishlist</Link>
                <hr className={styles.dropdownDivider} />
                <button onClick={handleLogout} className={styles.dropdownLogoutBtn}>Sign Out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Sign In</Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? '✖' : '☰'}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/products" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/cart" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Cart ({itemCount})</Link>
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <button onClick={handleLogout} className={styles.mobileLogoutBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" className={styles.mobileLoginBtn} onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
