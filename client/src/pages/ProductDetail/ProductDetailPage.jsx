import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for gallery and variant selection
  const [mainImage, setMainImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.data);
        // Reset state on new product load
        setMainImage(0);
        setQuantity(1);
        setSelectedColor('Standard');
      } catch (err) {
        console.error('Failed to fetch product details', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleQtyChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > product.stockQuantity) return product.stockQuantity;
      return newQty;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    
    // Map backend model to cart context model
    const cartItem = {
      id: product._id, // Using product ObjectId as cart item ID
      name: product.name,
      price: product.basePrice / 100, // Converting from paise to rupees
      img: product.images[0],
      variant: selectedColor,
      vendor: product.vendor
    };

    addToCart(cartItem, quantity);

    setTimeout(() => {
      setAddingToCart(false);
      navigate('/cart');
    }, 500);
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      await api.post('/users/wishlist', { productId: product._id });
      setInWishlist(prev => !prev);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { from: `/products/${slug}` } });
      } else {
        alert('Failed to update wishlist. Please try again later.');
      }
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading product details...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!product) return null;

  const displayPrice = `₹${(product.basePrice / 100).toLocaleString('en-IN')}`;
  const displayOldPrice = product.salePrice ? `₹${(product.salePrice / 100).toLocaleString('en-IN')}` : null;

  return (
    <div className={styles.pdpContainer}>
      
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className={styles.breadcrumb}>
        <span>Home</span> &gt; <span>{product.category?.name || 'Category'}</span> &gt; <span className={styles.currentCrumb}>{product.name}</span>
      </nav>

      <div className={styles.productGrid}>
        
        {/* ── Image Gallery ─────────────────────────────────────────────────── */}
        <div className={styles.gallerySection}>
          <div className={styles.mainImageWrapper}>
            <img 
              src={product.images[mainImage]} 
              alt={product.name} 
              className={styles.mainImage} 
            />
          </div>
          <div className={styles.thumbnailList}>
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbnailBtn} ${mainImage === idx ? styles.activeThumb : ''}`}
                onClick={() => setMainImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImg} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Info ──────────────────────────────────────────────────── */}
        <div className={styles.infoSection}>
          <span className={styles.brandName}>{product.brand}</span>
          <h1 className={styles.productTitle}>{product.name}</h1>
          
          <div className={styles.ratingMeta}>
            <span className={styles.stars}>★★★★★</span>
            <span className={styles.ratingValue}>{product.avgRating || 4.5}</span>
            <span className={styles.reviewsCount}>({product.reviewCount || Math.floor(Math.random() * 100)} reviews)</span>
          </div>

          {user ? (
            <div className={styles.priceSection}>
              <span className={styles.price}>{displayPrice}</span>
              {displayOldPrice && <span className={styles.oldPrice}>{displayOldPrice}</span>}
              {displayOldPrice && <span className={styles.saveBadge}>Sale!</span>}
            </div>
          ) : (
            <div className={styles.lockedPriceContainer}>
              <span className={styles.lockedText}>🔒 Sign in to view price</span>
            </div>
          )}

          <p className={styles.description}>{product.description}</p>

          <hr className={styles.divider} />

          {/* ── Variants ──────────────────────────────────────────────────────── */}
          <div className={styles.variantSection}>
            <h4 className={styles.variantTitle}>Variant: <span className={styles.selectedVariantText}>{selectedColor}</span></h4>
            <div className={styles.colorOptions}>
              {/* Hardcoding variants for demo as backend doesn't strictly enforce variants on standard seeded products */}
              {['Standard', 'Premium'].map(variant => (
                <button 
                  key={variant}
                  className={`${styles.colorBtn} ${selectedColor === variant ? styles.activeColor : ''}`}
                  onClick={() => setSelectedColor(variant)}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>

          {/* ── Add to Cart ───────────────────────────────────────────────────── */}
          {user ? (
            <div className={styles.actionSection}>
              <div className={styles.qtySelector}>
                <button onClick={() => handleQtyChange(-1)} className={styles.qtyBtn}>-</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button onClick={() => handleQtyChange(1)} className={styles.qtyBtn}>+</button>
              </div>
              <button 
                className={styles.addToCartBtn} 
                onClick={handleAddToCart}
                disabled={addingToCart || product.stockQuantity < 1}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                className={styles.wishlistActionBtn} 
                aria-label="Add to wishlist"
                onClick={toggleWishlist}
                style={{ color: inWishlist ? 'red' : 'inherit' }}
              >
                {inWishlist ? '♥' : '♡'}
              </button>
            </div>
          ) : (
            <div className={styles.actionSection}>
              <button 
                className={styles.loginToPurchaseBtnLg} 
                onClick={() => navigate('/login')}
              >
                Login to Purchase
              </button>
              <button 
                className={styles.wishlistActionBtn} 
                aria-label="Add to wishlist"
                onClick={() => navigate('/login')}
              >
                ♡
              </button>
            </div>
          )}
          
          <div className={styles.stockStatus}>
            {product.stockQuantity > 0 ? (
              <>
                <span className={styles.inStockDot}></span>
                <span>{product.stockQuantity} items in stock. Ready to ship.</span>
              </>
            ) : (
              <span style={{ color: 'red' }}>Out of Stock.</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
