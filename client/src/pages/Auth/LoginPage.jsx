import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import styles from './Auth.module.css'; // Shared CSS for auth pages

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // authService.login returns response.data = { success, message, data: { user, accessToken } }
      // So res.data = { user, accessToken }
      const res = await authService.login(email, password);
      login(res.data.user, res.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        
        {/* Left Side: Branding / Image */}
        <div className={styles.authBrand}>
          <div className={styles.brandOverlay}>
            <Link to="/" className={styles.logoLink}><h2>ShopEZ.</h2></Link>
            <p className={styles.brandSlogan}>Shop smarter with curated products, exclusive deals and secure ordering.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.authFormSection}>
          <div className={styles.formWrapper}>
            <Link to="/" className={styles.backHomeBtn}>&larr; Back to Home</Link>
            <h1 className={styles.formTitle}>Sign In</h1>
            <p className={styles.formSubtitle}>Enter your details to access your account.</p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.passwordHeader}>
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                </div>
                <div className={styles.passwordInputWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required 
                  />
                  <button 
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.formFooter}>
              <p>Don't have an account? <Link to="/register" className={styles.footerLink}>Create one</Link></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
