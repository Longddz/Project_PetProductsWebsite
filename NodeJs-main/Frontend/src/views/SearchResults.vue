<template>
  <div class="products-page">
    <h2>Kết quả tìm kiếm cho "{{ searchQuery }}"</h2>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tìm kiếm...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="products.length === 0" class="no-products">
      <i class="fas fa-search"></i>
      <p>Không tìm thấy sản phẩm nào phù hợp</p>
    </div>

    <div v-else class="products-grid">
      <div v-for="product in products" :key="product._id" class="product-card">
        <router-link :to="'/product/' + product._id" class="product-link">
          <img 
            :src="getImageUrl(product)" 
            :alt="product.productName"
            @error="handleImageError"
          />
          <div class="product-info">
            <h3>{{ product.productName }}</h3>
            <p class="price">{{ formatPrice(product.productPrice) }}đ</p>
            <p class="description">{{ truncateDescription(product.productDescription) }}</p>
            <p class="stock">Còn lại: {{ product.productQuantity }} sản phẩm</p>
          </div>
        </router-link>
        <div class="product-actions">
          <button @click="addToCartWithQuantity(product)" class="btn-add-cart" :disabled="product.productQuantity === 0">
            <i class="fas fa-shopping-cart"></i>
            {{ product.productQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  name: 'SearchResults',
  data() {
    return {
      searchQuery: '',
      products: [],
      loading: true,
      error: null
    };
  },
  methods: {
    ...mapActions(['addToCart']),
    async fetchSearchResults() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`http://localhost:5000/api/product/search?name=${encodeURIComponent(this.searchQuery)}`);
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching search results:', error);
        this.error = error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm';
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(product) {
      if (!product?.imageURL) return '/default-product.jpg';
      if (product.imageURL.startsWith('http')) return product.imageURL;
      if (product.imageURL.startsWith('/uploads')) {
        return `http://localhost:5000${product.imageURL}`;
      }
      return `http://localhost:5000/uploads/${product.imageURL}`;
    },
    handleImageError(e) {
      e.target.src = '/default-product.jpg';
    },
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    },
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 100 
        ? description.substring(0, 100) + '...'
        : description;
    },
    getStockStatus(quantity) {
      if (quantity === 0) return 'Hết hàng';
      if (quantity < 10) return `Chỉ còn ${quantity} sản phẩm`;
      return 'Còn hàng';
    },
    addToCartWithQuantity(product) {
      if (product.productQuantity === 0) return;
      
      const productToAdd = {
        ...product,
        quantity: 1
      };
      
      this.addToCart(productToAdd);
      this.$toast?.success('Đã thêm vào giỏ hàng!');
    }
  },
  created() {
    this.searchQuery = this.$route.query.name || '';
    if (this.searchQuery) {
      this.fetchSearchResults();
    }
  },
  watch: {
    '$route.query.name'(newValue) {
      this.searchQuery = newValue;
      if (this.searchQuery) {
        this.fetchSearchResults();
      }
    }
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.products-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 28px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.loading, .error, .no-products {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.loading i, .error i, .no-products i {
  font-size: 48px;
  margin-bottom: 20px;
  color: #3949ab;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 1.1em;
  color: #333;
  font-weight: 600;
}

.price {
  color: #e53935;
  font-weight: bold;
  font-size: 1.2em;
  margin: 10px 0;
}

.description {
  color: #666;
  font-size: 0.9em;
  margin: 10px 0;
  line-height: 1.4;
}

.stock {
  color: #4CAF50;
  font-size: 0.9em;
  margin: 10px 0;
}

.product-actions {
  padding: 15px;
  border-top: 1px solid #eee;
}

.btn-add-cart {
  width: 100%;
  padding: 10px;
  background: #3949ab;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.btn-add-cart:hover {
  background: #283593;
}

.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-add-cart i {
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}
</style> 