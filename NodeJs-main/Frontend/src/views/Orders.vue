<template>
  <div class="orders-container">
    <h1>Quản lý hóa đơn</h1>
    
    <div class="orders-list">
      <div v-if="orders.length === 0" class="no-orders">
        <i class="fas fa-file-invoice"></i>
        <p>Bạn chưa có hóa đơn nào</p>
      </div>
      
      <div v-else class="order-items">
        <div v-for="order in orders" :key="order._id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Hóa đơn #{{ order._id.slice(-6) }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status" :class="order.status">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          
          <div class="order-products">
            <div class="product-item">
              <img :src="getImageUrl(order)" 
                   :alt="order.productName"
                   @error="handleImageError" 
                   class="product-image" />
              <div class="product-info">
                <h4>{{ order.productName }}</h4>
                <p>Số lượng: {{ order.productQuantity }}</p>
                <p class="price">{{ formatPrice(order.totalAmount / order.productQuantity) }}đ</p>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <button 
              v-if="order.status === 'pending'" 
              @click="deleteOrder(order._id)" 
              class="delete-btn"
            >
              Hủy hóa đơn
            </button>
            <div class="order-total">
              <span>Tổng cộng:</span>
              <span class="total-amount">{{ formatPrice(order.totalAmount) }}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Orders',
  data() {
    return {
      orders: []
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('http://localhost:5000/api/invoice', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Received orders:', response.data);
        this.orders = response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.$toast?.error('Không thể tải danh sách hóa đơn');
      }
    },
    async deleteOrder(orderId) {
      if (!confirm('Bạn có chắc muốn hủy hóa đơn này không?')) return;

      try {
        await axios.delete(`http://localhost:5000/api/invoice/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        this.orders = this.orders.filter(order => order._id !== orderId);
        this.$toast?.success('Đã hủy hóa đơn thành công');
      } catch (error) {
        console.error('Error deleting order:', error);
        this.$toast?.error(error.response?.data?.message || 'Không thể hủy hóa đơn');
      }
    },
    getImageUrl(order) {
      if (!order.imageURL) return '/default-product.jpg';
      
      const imageURL = order.imageURL;
      if (imageURL.startsWith('http')) return imageURL;
      if (imageURL.includes('/uploads/')) {
        return `http://localhost:5000${imageURL}`;
      }
      return `http://localhost:5000/uploads/${encodeURIComponent(imageURL)}`;
    },
    handleImageError(e) {
      e.target.src = '/default-product.jpg';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    },
    getStatusText(status) {
      const statusMap = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
      };
      return statusMap[status] || status;
    }
  },
  created() {
    this.fetchOrders();
  }
};
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
  min-height: calc(100vh - 80px);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.03);
}

.orders-container h1 {
  color: #1a237e;
  margin-bottom: 40px;
  font-size: 2.8rem;
  text-align: center;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding-bottom: 15px;
}

.orders-container h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  border-radius: 2px;
}

.no-orders {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border: 1px solid rgba(147, 162, 235, 0.1);
}

.no-orders i {
  font-size: 80px;
  background: linear-gradient(45deg, #3949ab, #5c6bc0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 25px;
  display: block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.no-orders p {
  color: #455a64;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.6;
}

.order-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border: 1px solid rgba(147, 162, 235, 0.1);
  position: relative;
  overflow: hidden;
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  opacity: 0;
  transition: all 0.4s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.order-card:hover::before {
  opacity: 1;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(147, 162, 235, 0.1);
}

.order-info h3 {
  color: #1a237e;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.order-info h3::before {
  content: '📋';
  font-size: 26px;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.order-date {
  color: #546e7a;
  font-size: 15px;
  margin: 10px 0 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-date::before {
  content: '🕒';
  font-size: 16px;
}

.order-status {
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-status.pending {
  background: linear-gradient(45deg, #fff3e0, #ffe0b2);
  color: #e65100;
  border: none;
}

.order-status.processing {
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  color: #0d47a1;
  border: none;
}

.order-status.completed {
  background: linear-gradient(45deg, #e8f5e9, #c8e6c9);
  color: #1b5e20;
  border: none;
}

.order-status.cancelled {
  background: linear-gradient(45deg, #ffebee, #ffcdd2);
  color: #b71c1c;
  border: none;
}

.order-products {
  margin: 0 -30px;
  background: rgba(147, 162, 235, 0.03);
  padding: 20px 30px;
}

.product-item {
  display: flex;
  gap: 25px;
  padding: 20px;
  border-bottom: 1px solid rgba(147, 162, 235, 0.1);
  transition: all 0.4s ease;
  border-radius: 12px;
}

.product-item:hover {
  background: rgba(147, 162, 235, 0.05);
  transform: translateX(10px);
}

.product-item:last-child {
  border-bottom: none;
}

.product-item img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
}

.product-item img:hover {
  transform: scale(1.08) rotate(2deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.product-info h4 {
  margin: 0;
  color: #1a237e;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.product-info p {
  margin: 0;
  color: #546e7a;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-info p::before {
  font-size: 16px;
}

.price {
  color: #1a237e;
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 25px;
  margin-top: 25px;
  border-top: 2px solid rgba(147, 162, 235, 0.1);
}

.order-total {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #1a237e, #3949ab);
  padding: 15px 30px;
  border-radius: 30px;
  color: white;
  box-shadow: 0 4px 15px rgba(26, 35, 126, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-total:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 35, 126, 0.3);
}

.total-amount {
  color: white;
  margin-left: 10px;
  font-weight: 700;
  position: relative;
}

.total-amount::before {
  content: '|';
  margin-right: 10px;
  opacity: 0.5;
}

.delete-btn {
  padding: 10px 20px;
  background: linear-gradient(45deg, #b71c1c, #e53935);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 20px;
  box-shadow: 0 2px 8px rgba(183, 28, 28, 0.2);
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3);
  background: linear-gradient(45deg, #c62828, #f44336);
}

@media (max-width: 768px) {
  .orders-container {
    margin: 20px;
    padding: 20px;
  }

  .orders-container h1 {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .product-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
    padding: 25px 15px;
  }

  .product-item img {
    width: 180px;
    height: 180px;
  }

  .product-info {
    align-items: center;
  }

  .order-footer {
    flex-direction: column;
    gap: 15px;
  }

  .delete-btn {
    width: 100%;
    margin-right: 0;
    padding: 12px;
  }

  .order-total {
    width: 100%;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }

  .total-amount::before {
    display: none;
  }
}
</style>