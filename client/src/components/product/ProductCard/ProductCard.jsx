import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { CartContext } from '../../../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({
      id: product.id || product._id,
      name: product.name,
      price: product.rawPrice || product.basePrice || 0,
      img: product.images?.[0] || product.img,
      variant: 'Standard',
    }, 1);
    navigate('/cart');
  };
  
  const displayImage = product.images?.[0] || product.img;

  return (
    <div className={styles.productCard}>
      <div className={styles.cardImageWrapper}>
        {/* Badges Container */}
        <div className={styles.badgesContainer}>
          {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
          {product.discountPercent && <span className={styles.discountBadge}>-{product.discountPercent}%</span>}
          {product.stockQuantity === 0 && <span className={styles.outOfStockBadge}>Out of Stock</span>}
        </div>
        
        {/* Link to Product Details Page */}
        <Link to={`/products/${product.slug || product.id}`} aria-label={`View details for ${product.name}`}>
          <img src={displayImage} alt={product.name} className={styles.cardImage} />
        </Link>
        
        {user && (
          <button className={styles.wishlistBtn} aria-label="Add to wishlist">♡</button>
        )}
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.rating}>★ {product.rating}</span>
          <span className={styles.reviews}>({product.reviews || 0})</span>
        </div>
        
        <Link to={`/products/${product.slug || product.id}`} className={styles.productNameLink}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        
        <div className={styles.cardFooter}>
          {user ? (
            <>
              <div className={styles.priceContainer}>
                <span className={styles.productPrice}>{product.price}</span>
                {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice}</span>}
              </div>
              <button className={styles.addToCartBtn} onClick={handleAddToCart} aria-label="Add to cart">+</button>
            </>
          ) : (
            <div className={styles.guestFooter}>
              <span className={styles.lockedText}>🔒 Sign in</span>
              <Link to="/login" className={styles.loginToPurchaseBtn}>Login to Purchase</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
