<template>
  <div class="cart-container">
    <div class="cart-header">
      <h1>Giỏ hàng của bạn</h1>
      <p v-if="cartItems.length" class="items-count">{{ totalQuantity }} sản phẩm</p>
    </div>

    <div v-if="!cartItems.length" class="empty-cart">
      <i class="fas fa-shopping-cart empty-cart-icon"></i>
      <p>Giỏ hàng của bạn đang trống</p>
      <router-link to="/" class="continue-shopping">
        <i class="fas fa-arrow-left"></i>
        Tiếp tục mua sắm
      </router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item._id" class="cart-item">
          <div class="product-image">
            <img :src="getImageUrl(item)" :alt="item.productName" @error="handleImageError" />
            <span v-if="item.discount" class="discount-badge">
              -{{ item.discount }}%
            </span>
          </div>

          <div class="item-details">
            <h3>{{ item.productName }}</h3>
            <div class="price-container">
              <p class="current-price">{{ formatPrice(getDiscountedPrice(item)) }}đ</p>
              <p v-if="item.discount" class="original-price">{{ formatPrice(item.productPrice) }}đ</p>
            </div>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item)" class="quantity-btn">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" class="quantity-btn" :disabled="item.quantity >= item.productQuantity">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="item-total">
            <p class="total-label">Tổng tiền:</p>
            <p class="total-amount">{{ formatPrice(getDiscountedPrice(item) * item.quantity) }}đ</p>
          </div>

          <button @click="removeFromCart(item._id)" class="remove-btn" title="Xóa sản phẩm">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Tổng đơn hàng</h3>
        <div class="summary-row">
          <span>Tạm tính:</span>
          <span>{{ formatPrice(totalAmount) }}đ</span>
        </div>
        <div class="summary-row">
          <span>Phí vận chuyển:</span>
          <span>{{ formatPrice(shippingFee) }}đ</span>
        </div>
        <div class="summary-row total">
          <span>Tổng cộng:</span>
          <span class="final-total">{{ formatPrice(totalAmount + shippingFee) }}đ</span>
        </div>
        <button @click="checkout" class="checkout-btn">
          Thanh toán
        </button>
        <router-link to="/" class="continue-shopping-bottom">
          <i class="fas fa-arrow-left"></i>
          Tiếp tục mua sắm
        </router-link>
      </div>
    </div>
    <div class="toast" :class="{ 'show': showToast }">
      <div class="toast-content">
        <div class="toast-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="toast-message">
          <h4>Đã thêm vào giỏ hàng</h4>
          <p v-if="lastAddedItem">{{ lastAddedItem.productName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'Cart',
  data() {
    return {
      shippingFee: 30000,
      showToast: false,
      lastAddedItem: null,
      toastTimeout: null,
      isProcessing: false
    }
  },
  computed: {
    ...mapState(['cartItems']),
    ...mapGetters(['totalAmount', 'totalQuantity']),
  },
  methods: {
    ...mapActions(['updateCartItemQuantity', 'removeFromCart', 'createOrderFromCart']),
    
    getImageUrl(item) {
      if (!item?.imageURL) return '/default-product.jpg';
      const encodedImageURL = encodeURIComponent(item.imageURL);
      return `http://localhost:5000/uploads/${encodedImageURL}`;
    },
    
    handleImageError(e) {
      e.target.src = '/default-product.jpg';
    },
    
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    },
    
    getDiscountedPrice(item) {
      if (!item.discount) return item.productPrice;
      return item.productPrice * (1 - item.discount / 100);
    },
    
    increaseQuantity(item) {
      console.log('Tăng số lượng cho sản phẩm:', item._id);
      this.updateCartItemQuantity({ 
        productId: item._id, 
        quantity: item.quantity + 1 
      });
    },
    
    decreaseQuantity(item) {
      console.log('Giảm số lượng cho sản phẩm:', item._id);
      if (item.quantity > 1) {
        this.updateCartItemQuantity({ 
          productId: item._id, 
          quantity: item.quantity - 1 
        });
      } else {
        // Nếu số lượng là 1, xóa sản phẩm khỏi giỏ hàng
        this.removeFromCart(item._id);
      }
    },
    
    async checkout() {
      if (this.isProcessing) return;
      
      try {
        this.isProcessing = true;
        
        // Kiểm tra giỏ hàng có trống không
        if (this.cartItems.length === 0) {
          alert('Giỏ hàng của bạn đang trống!');
          return;
        }

        // Gọi action để tạo hóa đơn
        await this.createOrderFromCart();
        
        // Chuyển hướng đến trang Orders
        this.$router.push('/orders');
        
      } catch (error) {
        console.error('Lỗi khi thanh toán:', error);
        alert(error.message || 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
      } finally {
        this.isProcessing = false;
      }
    },
    
    showAddToCartToast(item) {
      this.lastAddedItem = item;
      this.showToast = true;
      
      // Xóa timeout cũ nếu có
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      // Set timeout mới
      this.toastTimeout = setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  },
  watch: {
    cartItems: {
      handler(newItems, oldItems) {
        if (newItems.length > oldItems.length) {
          // Tìm item mới được thêm vào
          const newItem = newItems.find(item => !oldItems.some(oldItem => oldItem._id === item._id));
          if (newItem) {
            this.showAddToCartToast(newItem);
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    // Thêm Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.cart-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 30px;
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.cart-header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.items-count {
  color: #666;
  font-size: 16px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-cart-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-cart p {
  color: #666;
  font-size: 18px;
  margin-bottom: 30px;
}

.continue-shopping {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(to right, #1a237e, #283593);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  width: 120px;
  height: 120px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.discount-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e53935;
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.item-details {
  min-width: 200px;
}

.item-details h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-price {
  color: #e53935;
  font-weight: 600;
  font-size: 18px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 25px;
  width: fit-content;
}

.quantity-btn {
  width: 28px;
  height: 28px;
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

.quantity-btn:disabled {
  background: #eee;
  color: #999;
  cursor: not-allowed;
}

.quantity-btn:not(:disabled):hover {
  background: #1a237e;
  color: white;
}

.quantity {
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.item-total {
  text-align: right;
}

.total-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.total-amount {
  color: #1a237e;
  font-weight: 600;
  font-size: 18px;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: #e53935;
}

.cart-summary {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  color: #666;
}

.summary-row.total {
  border-bottom: none;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 2px solid #eee;
  font-weight: 600;
  color: #333;
}

.final-total {
  color: #e53935;
  font-size: 24px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(to right, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.continue-shopping-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.continue-shopping-bottom:hover {
  color: #1a237e;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .product-image {
    margin: 0 auto;
  }
  
  .item-details {
    text-align: center;
  }
  
  .quantity-controls {
    margin: 15px auto;
  }
  
  .item-total {
    text-align: center;
  }
  
  .remove-btn {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 20px 10px;
  }
  
  .cart-header h1 {
    font-size: 24px;
  }
  
  .product-image {
    width: 100px;
    height: 100px;
  }
}

.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  min-width: 300px;
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

.toast-icon {
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

@media (max-width: 480px) {
  .toast {
    bottom: 20px;
    right: 20px;
    left: 20px;
    min-width: unset;
  }
}
</style>
