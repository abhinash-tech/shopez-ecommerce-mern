import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductCarousel.module.css';

const ProductCarousel = ({ title, products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselHeader}>
        <h2 className={styles.carouselTitle}>{title}</h2>
      </div>
      
      <div className={styles.carouselContainer}>
        {products.map((product) => (
          <div key={product.id || product._id} className={styles.carouselItem}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
