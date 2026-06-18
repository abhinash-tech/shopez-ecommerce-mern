import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import styles from './CartPage.module.css';

const CartPage = () => {
  const { cartItems, cartTotal, updateQty, removeItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className={styles.continueShoppingBtn}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.pageTitle}>Shopping Cart</h1>

      <div className={styles.cartLayout}>
        {/* ── Cart Items List ─────────────────────────────────────────────── */}
        <div className={styles.cartItemsSection}>
          <div className={styles.cartHeader}>
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                
                <div className={styles.itemInfo}>
                  <img src={item.img} alt={item.name} className={styles.itemImg} />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemVariant}>Variant: {item.variant}</p>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label={`Remove ${item.name} from cart`}>Remove</button>
                  </div>
                </div>

                <div className={styles.qtyControls}>
                  <button 
                    onClick={() => {
                      if (item.qty <= 1) {
                        removeItem(item.id);
                      } else {
                        updateQty(item.id, item.qty - 1);
                      }
                    }} 
                    className={styles.qtyBtn} 
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className={styles.qtyValue} aria-live="polite">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className={styles.qtyBtn} aria-label="Increase quantity">+</button>
                </div>

                <div className={styles.itemTotal}>
                  {formatCurrency(item.price * item.qty)}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* ── Order Summary ───────────────────────────────────────────────── */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className={styles.couponSection}>
            <input type="text" placeholder="Promo code" className={styles.couponInput} aria-label="Enter promo code" />
            <button className={styles.applyBtn} aria-label="Apply promo code">Apply</button>
          </div>

          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>

          <button onClick={() => navigate(user ? '/checkout' : '/login')} className={styles.checkoutBtn} aria-label="Proceed to secure checkout">
            Proceed to Checkout
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
