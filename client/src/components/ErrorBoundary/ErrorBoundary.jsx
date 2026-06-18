import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service like Sentry
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontFamily: 'Outfit, sans-serif',
          backgroundColor: '#fef2f2',
          color: '#111827',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>⚠️</div>
          <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700}}>Oops! Something went wrong.</h1>
          <p style={{fontSize: '1.1rem', color: '#4b5563', marginBottom: '2rem', maxWidth: '600px'}}>
            We're sorry, but an unexpected error occurred. Our team has been notified. 
            Please try refreshing the page or navigate back to the home screen.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{
              padding: '1rem 2rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Return to Homepage
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
