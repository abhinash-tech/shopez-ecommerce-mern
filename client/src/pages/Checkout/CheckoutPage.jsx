import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import styles from './CheckoutPage.module.css';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price * 100, // Convert rupees back to paise for backend
          quantity: item.qty,
          image: item.img,
          vendor: item.vendor
        })),
        shippingAddress: {
          fullName: `${address.firstName} ${address.lastName}`.trim(),
          phone: address.phone,
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'India'
        },
        paymentMethod
      };

      const res = await api.post('/orders', orderPayload);
      
      clearCart();
      navigate('/order-success', { state: { orderId: res.data.data.orderNumber } });
    } catch (err) {
      console.error('Order creation failed:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { from: '/checkout' } });
      } else {
        setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      <div className={styles.checkoutLayout}>
        
        {/* ── Left Side: Checkout Flow ────────────────────────────────────── */}
        <div className={styles.flowSection}>
          
          {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red' }}>{error}</div>}

          {/* Step 1: Address */}
          <div className={`${styles.stepCard} ${step === 1 ? styles.activeStep : ''}`}>
            <h2 className={styles.stepTitle}>1. Shipping Address</h2>
            {step === 1 && (
              <form className={styles.addressForm} onSubmit={handleAddressSubmit}>
                <div className={styles.formRow}>
                  <input type="text" placeholder="First Name" required value={address.firstName} onChange={(e) => setAddress({...address, firstName: e.target.value})} />
                  <input type="text" placeholder="Last Name" required value={address.lastName} onChange={(e) => setAddress({...address, lastName: e.target.value})} />
                </div>
                <input type="text" placeholder="Phone Number" required value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
                <input type="text" placeholder="Street Address (Line 1)" required value={address.line1} onChange={(e) => setAddress({...address, line1: e.target.value})} />
                <div className={styles.formRow}>
                  <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                  <input type="text" placeholder="State" required value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} />
                  <input type="text" placeholder="PIN Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
                </div>
                <button type="submit" className={styles.nextBtn}>Continue to Payment</button>
              </form>
            )}
            {step > 1 && (
              <div className={styles.savedInfo}>
                <p><strong>{address.firstName} {address.lastName}</strong></p>
                <p>{address.line1}</p>
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginTop: '10px' }}>Edit</button>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`${styles.stepCard} ${step === 2 ? styles.activeStep : ''}`}>
            <h2 className={styles.stepTitle}>2. Payment Method</h2>
            {step === 2 && (
              <form className={styles.paymentForm} onSubmit={handlePlaceOrder}>
                <label className={styles.paymentOption}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className={styles.radioCustom}></span>
                  Credit / Debit Card
                </label>
                <label className={styles.paymentOption}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className={styles.radioCustom}></span>
                  UPI (Google Pay, PhonePe)
                </label>
                <label className={styles.paymentOption}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className={styles.radioCustom}></span>
                  Cash on Delivery
                </label>
                <button type="submit" className={styles.placeOrderBtn} disabled={isProcessing || cartItems.length === 0}>
                  {isProcessing ? 'Processing...' : 'Place Order securely'}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── Right Side: Order Summary ─────────────────────────────────── */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Your Order</h2>
          <div className={styles.itemsList}>
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={styles.summaryItem}>
                <div className={styles.itemBadgeWrapper}>
                  <img src={item.img} alt={item.name} />
                  <span className={styles.itemBadge}>{item.qty}</span>
                </div>
                <div className={styles.summaryItemInfo}>
                  <p className={styles.summaryItemName}>{item.name}</p>
                  <p className={styles.summaryItemPrice}>{formatCurrency(item.price * item.qty)}</p>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && <p>Your cart is empty.</p>}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className={styles.totalRowMain}>
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
