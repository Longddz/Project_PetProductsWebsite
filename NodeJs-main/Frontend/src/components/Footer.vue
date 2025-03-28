<template>
  <footer class="footer">
    <div class="footer-top">
      <h2>Thành viên Pattiers</h2>
      <p>
        Đăng ký thành viên ngay hôm nay để nhận email về sản phẩm mới và chương trình khuyến mãi của Patti
      </p>
      <div class="subscribe">
        <input v-model="email" type="email" placeholder="Email của bạn..." />
        <button @click="subscribe">Đăng Ký</button>
      </div>
      <p v-if="message" class="subscribe-message">{{ message }}</p>
    </div>

    <div class="footer-content">
      <div class="footer-column">
        <h3>Shop</h3>
        <ul>
          <li><a href="#">Dành Cho Chó</a></li>
          <li><a href="#">Dành Cho Mèo</a></li>
          <li><a href="#">Thương Hiệu</a></li>
          <li><a href="#">Blogs</a></li>
          <li><a href="#">Bộ Sưu Tập</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3>Patti Pet Shop</h3>
        <ul>
          <li><a href="#">Giới Thiệu</a></li>
          <li><a href="#">Thành Viên Paddier</a></li>
          <li><a href="#">Điều Khoản Sử Dụng</a></li>
          <li><a href="#">Tuyển Dụng</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3>Hỗ Trợ Khách Hàng</h3>
        <ul>
          <li><a href="#">Chính Sách Đổi Trả Hàng</a></li>
          <li><a href="#">Phương Thức Vận Chuyển</a></li>
          <li><a href="#">Chính Sách Bảo Mật</a></li>
          <li><a href="#">Phương Thức Thanh Toán</a></li>
          <li><a href="#">Chính Sách Hoàn Tiền</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3>Liên Hệ</h3>
        <p><strong>CÔNG TY CỔ PHẦN THƯƠNG MẠI & DỊCH VỤ Patti</strong></p>
        <p>MST: 0316459054</p>
        <p>116 Nguyễn Văn Thủ, P. Đa Kao, Q.1, TP. Hồ Chí Minh, Việt Nam</p>
        <p>📞 Hotline: 0867677891</p>
        <p>📧 Email: <a href="mailto:contact@Patti.vn">contact@Patti.vn</a></p>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>@2024 Patti VN. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const email = ref('');
    const message = ref('');

    const subscribe = () => {
      if (email.value.trim() === '') {
        message.value = 'Vui lòng nhập email!';
      } else {
        message.value = '🎉 Đăng ký thành công! Cảm ơn bạn đã đăng ký.';
        email.value = '';
      }

      setTimeout(() => {
        message.value = '';
      }, 4000);
    };

    return { email, message, subscribe };
  }
};
</script>


<style scoped>
.footer {
  background: #f8f9fa;
  padding: 30px 10%;
  font-family: Arial, sans-serif;
}

.footer-top {
  text-align: center;
  margin-bottom: 30px;
}

.footer-top h2 {
  font-size: 22px;
  font-weight: bold;
}

.footer-top p {
  font-size: 14px;
  color: #666;
}

.subscribe {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.subscribe input {
  padding: 10px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
}

.subscribe button {
  background: #0056b3;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-column {
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
}

.footer-column h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 8px;
}

.footer-column ul li a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

.footer-column ul li a:hover {
  color: #0056b3;
}

.footer-column p {
  font-size: 14px;
  color: #333;
}

.social-icons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.social-icons a {
  font-size: 20px;
  color: #333;
  text-decoration: none;
}

.social-icons a:hover {
  color: #0056b3;
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #777;
}
</style>
