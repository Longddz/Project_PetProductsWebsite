<template>
  <div class="new-arrivals">
    <h1>Sản phẩm mới về</h1>
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="products-grid">
      <div v-for="product in newProducts" :key="product._id" class="product-card">
        <img :src="getImageUrl(product)" :alt="product.productName" @error="handleImageError" />
        <div class="new-badge">Mới</div>
        <h3>{{ product.productName }}</h3>
        <p class="price">{{ formatPrice(product.productPrice) }}đ</p>
        <p class="description">{{ product.productDescription }}</p>
        <button @click="addToCart(product)" :disabled="!product.productQuantity">
          {{ product.productQuantity ? 'Thêm vào giỏ' : 'Hết hàng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewArrivals',
  data() {
    return {
      newProducts: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchNewProducts() {
      try {
        const response = await axios.get('http://localhost:5000/api/product');
        if (response.data) {
          // Lọc sản phẩm mới trong vòng 30 ngày
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          this.newProducts = response.data
            .filter(product => new Date(product.createdAt) > thirtyDaysAgo)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.error = 'Không thể tải danh sách sản phẩm mới. Vui lòng thử lại sau.';
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(product) {
      if (!product?.imageURL) return '/default-product.jpg';
      return `http://localhost:5000${product.imageURL}`;
    },
    handleImageError(e) {
      e.target.src = '/default-product.jpg';
    },
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    },
    addToCart(product) {
      this.$store.dispatch('addToCart', product);
    }
  },
  created() {
    this.fetchNewProducts();
  }
};
</script>

<style scoped>
.new-arrivals {
  padding: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.product-card {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  background: white;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4081;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9em;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.product-card h3 {
  margin: 10px 0;
  font-size: 1.2em;
}

.price {
  color: #e53935;
  font-weight: bold;
  font-size: 1.1em;
}

.description {
  color: #666;
  margin: 8px 0;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #2196f3;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #1976d2;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: #e53935;
}
</style>
