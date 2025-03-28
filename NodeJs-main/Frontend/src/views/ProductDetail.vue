<template>
  <div class="product-detail-container">
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Đang tải thông tin sản phẩm...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <router-link to="/" class="back-button">
        <i class="fas fa-arrow-left"></i>
        Quay lại trang chủ
      </router-link>
    </div>

    <div v-else class="product-detail">
      <div class="product-images">
        <div class="main-image">
          <img :src="getImageUrl(product)" :alt="product.productName" @error="handleImageError" />
          <span v-if="product.discount" class="discount-badge">
            -{{ product.discount }}%
          </span>
        </div>
      </div>

      <div class="product-info">
        <nav class="breadcrumb">
          <router-link to="/">Trang chủ</router-link>
          <span class="separator">/</span>
          <router-link :to="{ path: '/products', query: { type: product.productType }}">
            {{ formatProductType(product.productType) }}
          </router-link>
          <span class="separator">/</span>
          <span class="current">{{ product.productName }}</span>
        </nav>

        <h1>{{ product.productName }}</h1>

        <div class="price-section">
          <div class="price-container">
            <p class="current-price">{{ formatPrice(getDiscountedPrice) }}đ</p>
            <p v-if="product.discount" class="original-price">
              {{ formatPrice(product.productPrice) }}đ
            </p>
          </div>
          <span v-if="product.discount" class="saving">
            Tiết kiệm: {{ formatPrice(product.productPrice - getDiscountedPrice) }}đ
          </span>
        </div>

        <div class="stock-info" :class="{ 'low-stock': product.productQuantity < 10 }">
          <i class="fas" :class="stockIcon"></i>
          {{ stockStatus }}
        </div>

        <div class="description">
          <h3>Mô tả sản phẩm</h3>
          <p>{{ product.productDescription }}</p>
        </div>

        <div class="purchase-section">
          <div class="quantity-controls">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" v-model.number="quantity" min="1" :max="product.productQuantity" />
            <button @click="increaseQuantity" :disabled="quantity >= product.productQuantity">
              <i class="fas fa-plus"></i>
            </button>
          </div>

          <button @click="addToCartWithQuantity" class="add-to-cart-btn" :disabled="!product.productQuantity">
            <i class="fas fa-shopping-cart"></i>
            {{ product.productQuantity ? 'Thêm vào giỏ hàng' : 'Hết hàng' }}
          </button>
        </div>

        <div class="additional-info">
          <div class="info-item">
            <i class="fas fa-truck"></i>
            <div>
              <h4>Miễn phí vận chuyển</h4>
              <p>Cho đơn hàng từ 500.000đ</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-shield-alt"></i>
            <div>
              <h4>Bảo hành chính hãng</h4>
              <p>12 tháng bảo hành</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-exchange-alt"></i>
            <div>
              <h4>Đổi trả miễn phí</h4>
              <p>Trong vòng 7 ngày</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" :class="{ 'show': showToast }">
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <div class="toast-message">
          <h4>Đã thêm vào giỏ hàng</h4>
          <p>{{ product.productName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from 'axios';

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: {},
      loading: true,
      error: null,
      quantity: 1,
      showToast: false
    };
  },
  computed: {
    getDiscountedPrice() {
      if (!this.product.discount) return this.product.productPrice;
      return this.product.productPrice * (1 - this.product.discount / 100);
    },
    stockStatus() {
      if (!this.product.productQuantity) return 'Hết hàng';
      if (this.product.productQuantity < 10) return `Chỉ còn ${this.product.productQuantity} sản phẩm`;
      return 'Còn hàng';
    },
    stockIcon() {
      if (!this.product.productQuantity) return 'fa-times-circle';
      if (this.product.productQuantity < 10) return 'fa-exclamation-circle';
      return 'fa-check-circle';
    }
  },
  methods: {
    ...mapActions(["addToCart"]),
    
    async fetchProduct() {
      try {
        this.loading = true;
        const productId = this.$route.params.id;
        
        // Kiểm tra ID hợp lệ
        if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
          this.error = 'ID sản phẩm không hợp lệ';
          return;
        }

        console.log('Fetching product with ID:', productId); // Debug log
        const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
        
        if (!response.data) {
          this.error = 'Không tìm thấy thông tin sản phẩm';
          return;
        }
        
        this.product = response.data;
        this.error = null;
        
        console.log('Product data:', this.product); // Debug log
      } catch (error) {
        console.error('Error fetching product:', error);
        this.error = error.response?.data?.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.';
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

    formatProductType(type) {
      const types = {
        'dogs': 'Chó',
        'cats': 'Mèo',
        'smart-devices': 'Thiết bị thông minh'
      };
      return types[type] || type;
    },

    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

    increaseQuantity() {
      if (this.quantity < this.product.productQuantity) {
        this.quantity++;
      }
    },

    addToCartWithQuantity() {
      if (this.product.productQuantity === 0) return;

      const productToAdd = {
        ...this.product,
        quantity: this.quantity
      };

      this.addToCart(productToAdd);
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  },
  created() {
    this.fetchProduct();
  },
  mounted() {
    // Thêm Font Awesome nếu chưa có
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.fetchProduct();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.product-detail-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.loading-spinner {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a237e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  color: #e53935;
}

.error-message i {
  font-size: 48px;
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #1a237e;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #283593;
  transform: translateY(-2px);
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.product-images {
  position: relative;
}

.main-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #e53935;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.breadcrumb {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.breadcrumb a {
  color: #1a237e;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb .current {
  color: #666;
}

.product-info h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.price-section {
  margin-bottom: 20px;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 32px;
  font-weight: 600;
  color: #e53935;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 18px;
}

.saving {
  display: inline-block;
  background: #fef2f2;
  color: #e53935;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f0f7f0;
  color: #2e7d32;
  font-weight: 500;
  width: fit-content;
}

.stock-info.low-stock {
  background: #fff3e0;
  color: #e65100;
}

.stock-info i {
  font-size: 16px;
}

.description {
  margin-bottom: 30px;
}

.description h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
}

.description p {
  color: #666;
  line-height: 1.6;
}

.purchase-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 25px;
}

.quantity-controls button {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.2s ease;
}

.quantity-controls button:disabled {
  background: #eee;
  color: #999;
  cursor: not-allowed;
}

.quantity-controls button:not(:disabled):hover {
  background: #1a237e;
  color: white;
}

.quantity-controls input {
  width: 50px;
  text-align: center;
  border: none;
  background: none;
  font-weight: 500;
  font-size: 16px;
  -moz-appearance: textfield;
}

.quantity-controls input::-webkit-outer-spin-button,
.quantity-controls input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.add-to-cart-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 30px;
  background: linear-gradient(to right, #1a237e, #283593);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.additional-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-item i {
  font-size: 24px;
  color: #1a237e;
}

.info-item h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.info-item p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transform: translateX(120%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.toast.show {
  transform: translateX(0);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toast-content i {
  font-size: 24px;
  color: #4CAF50;
}

.toast-message h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.toast-message p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    margin: 20px auto;
  }
  
  .product-detail {
    padding: 20px;
  }
  
  .current-price {
    font-size: 28px;
  }
  
  .purchase-section {
    flex-direction: column;
  }
  
  .quantity-controls {
    width: fit-content;
  }
}

@media (max-width: 480px) {
  .product-info h1 {
    font-size: 24px;
  }
  
  .toast {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
  