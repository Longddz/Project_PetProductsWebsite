<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Không tìm thấy trang</h2>
      <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
      <router-link to="/" class="home-button">
        Về trang chủ
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

h1 {
  font-size: 120px;
  margin: 0;
  background: linear-gradient(45deg, #1a237e, #283593);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}

h2 {
  font-size: 28px;
  color: #333;
  margin: 20px 0;
  font-family: 'Montserrat', sans-serif;
}

p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(45deg, #1a237e, #283593);
  color: white;
  text-decoration: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 16px;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.home-button i {
  font-size: 18px;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 30px;
  }

  h1 {
    font-size: 100px;
  }

  h2 {
    font-size: 24px;
  }
}
</style>
