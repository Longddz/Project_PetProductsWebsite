<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Thông tin người dùng</h1>
      <button v-if="!isEditing" @click="startEditing" class="edit-button">
        <i class="fas fa-edit"></i> Chỉnh sửa
      </button>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>Thông tin tài khoản</h2>
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="userData.email" 
            :disabled="true"
            type="email"
            class="form-control"
          />
        </div>
      </div>

      <div class="profile-section">
        <h2>Thông tin cá nhân</h2>
        <div class="form-group">
          <label>Họ và tên</label>
          <input 
            v-model="userData.fullName" 
            :disabled="!isEditing"
            type="text"
            class="form-control"
            placeholder="Nhập họ và tên"
            required
          />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input 
            v-model="userData.phone" 
            :disabled="!isEditing"
            type="tel"
            class="form-control"
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div class="form-group">
          <label>Ngày sinh</label>
          <input 
            v-model="userData.dateOfBirth" 
            :disabled="!isEditing"
            type="date"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label>Giới tính</label>
          <select 
            v-model="userData.gender" 
            :disabled="!isEditing"
            class="form-control"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      <div class="profile-section">
        <h2>Địa chỉ</h2>
        <div class="form-group">
          <label>Địa chỉ</label>
          <input 
            v-model="userData.address" 
            :disabled="!isEditing"
            type="text"
            class="form-control"
            placeholder="Nhập địa chỉ"
          />
        </div>
        <div class="form-group">
          <label>Thành phố</label>
          <input 
            v-model="userData.city" 
            :disabled="!isEditing"
            type="text"
            class="form-control"
            placeholder="Nhập thành phố"
          />
        </div>
        <div class="form-group">
          <label>Quận/Huyện</label>
          <input 
            v-model="userData.district" 
            :disabled="!isEditing"
            type="text"
            class="form-control"
            placeholder="Nhập quận/huyện"
          />
        </div>
        <div class="form-group">
          <label>Mã bưu điện</label>
          <input 
            v-model="userData.postalCode" 
            :disabled="!isEditing"
            type="text"
            class="form-control"
            placeholder="Nhập mã bưu điện"
          />
        </div>
      </div>

      <div class="profile-section">
        <h2>Đổi mật khẩu</h2>
        <div class="form-group">
          <label>Mật khẩu hiện tại</label>
          <input 
            v-model="passwordData.currentPassword" 
            type="password"
            class="form-control"
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <input 
            v-model="passwordData.newPassword" 
            type="password"
            class="form-control"
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <input 
            v-model="passwordData.confirmPassword" 
            type="password"
            class="form-control"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
        <button @click="changePassword" class="change-password-button">
          <i class="fas fa-key"></i> Đổi mật khẩu
        </button>
      </div>

      <div v-if="isEditing" class="button-group">
        <button @click="saveChanges" class="save-button" :disabled="isSaving">
          <i class="fas fa-save"></i> {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
        <button @click="cancelEditing" class="cancel-button" :disabled="isSaving">
          <i class="fas fa-times"></i> Hủy
        </button>
      </div>
    </div>
    
    <!-- Modal xác nhận hủy -->
    <div v-if="showConfirmCancel" class="modal-overlay">
      <div class="modal-content">
        <h3>Xác nhận hủy</h3>
        <p>Bạn có chắc muốn hủy các thay đổi? Các thông tin đã nhập sẽ không được lưu lại.</p>
        <div class="modal-buttons">
          <button @click="confirmCancel" class="confirm-button">Đồng ý</button>
          <button @click="showConfirmCancel = false" class="cancel-modal-button">Quay lại</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';

export default {
  name: 'Profile',
  data() {
    return {
      isEditing: false,
      isSaving: false,
      originalData: null,
      showConfirmCancel: false,
      userData: {
        email: '',
        username: '',
        fullName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        district: '',
        postalCode: ''
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  computed: {
    ...mapGetters(['currentUser']),
    userEmail() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.email || '';
    },
    hasChanges() {
      if (!this.originalData) return false;
      
      return (
        this.userData.fullName !== this.originalData.fullName ||
        this.userData.phone !== this.originalData.phone ||
        this.userData.dateOfBirth !== this.originalData.dateOfBirth ||
        this.userData.gender !== this.originalData.gender ||
        this.userData.address !== this.originalData.address ||
        this.userData.city !== this.originalData.city ||
        this.userData.district !== this.originalData.district ||
        this.userData.postalCode !== this.originalData.postalCode
      );
    }
  },
  methods: {
    ...mapActions(['updateUserInfo']),
    async fetchUserData() {
      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Lấy email từ localStorage thay vì store
        const user = JSON.parse(localStorage.getItem('user'));
        this.userData = {
          ...response.data,
          email: user?.email || ''
        };
        
        // Lưu bản sao của dữ liệu ban đầu
        this.originalData = {...this.userData};
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.$toast?.error('Không thể tải thông tin người dùng');
      }
    },
    startEditing() {
      this.isEditing = true;
      // Lưu bản sao của dữ liệu ban đầu khi bắt đầu chỉnh sửa
      this.originalData = {...this.userData};
    },
    cancelEditing() {
      // Nếu có thay đổi, hiển thị xác nhận
      if (this.hasChanges) {
        this.showConfirmCancel = true;
      } else {
        this.isEditing = false;
      }
    },
    confirmCancel() {
      // Khôi phục dữ liệu ban đầu
      this.userData = {...this.originalData};
      this.isEditing = false;
      this.showConfirmCancel = false;
    },
    async saveChanges() {
      // Bỏ kiểm tra dữ liệu bắt buộc
      this.isSaving = true;
      try {
        this.$toast?.info('Đang lưu thông tin...');
        
        await axios.put('http://localhost:5000/api/user/profile', this.userData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Cập nhật thông tin trong store
        this.updateUserInfo(this.userData);
        
        // Cập nhật dữ liệu gốc sau khi lưu thành công
        this.originalData = {...this.userData};
        
        this.isEditing = false;
        this.$toast?.success('Cập nhật thông tin thành công');
      } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin';
        this.$toast?.error(errorMessage);
      } finally {
        this.isSaving = false;
      }
    },
    async changePassword() {
      if (!this.passwordData.currentPassword) {
        this.$toast?.error('Vui lòng nhập mật khẩu hiện tại');
        return;
      }
      
      if (!this.passwordData.newPassword) {
        this.$toast?.error('Vui lòng nhập mật khẩu mới');
        return;
      }
      
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.$toast?.error('Mật khẩu mới không khớp');
        return;
      }

      try {
        this.$toast?.info('Đang cập nhật mật khẩu...');
        
        await axios.put('http://localhost:5000/api/user/change-password', this.passwordData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        this.$toast?.success('Đổi mật khẩu thành công');
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        console.error('Error changing password:', error);
        const errorMessage = error.response?.data?.message || 'Không thể đổi mật khẩu';
        this.$toast?.error(errorMessage);
      }
    }
  },
  created() {
    // Khởi tạo email từ localStorage ngay khi component được tạo
    const user = JSON.parse(localStorage.getItem('user'));
    this.userData.email = user?.email || '';
    this.fetchUserData();
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  color: #1a237e;
  font-size: 24px;
  margin: 0;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  color: #1a237e;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #1a237e;
  outline: none;
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-button,
.save-button,
.cancel-button,
.change-password-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-button {
  background: #1a237e;
  color: white;
}

.save-button {
  background: #4caf50;
  color: white;
}

.save-button:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.cancel-button {
  background: #f44336;
  color: white;
}

.cancel-button:disabled {
  background: #ef9a9a;
  cursor: not-allowed;
}

.change-password-button {
  background: #1a237e;
  color: white;
  margin-top: 10px;
}

.edit-button:hover:not(:disabled),
.save-button:hover:not(:disabled),
.cancel-button:hover:not(:disabled),
.change-password-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: #1a237e;
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-modal-button {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .profile-container {
    margin: 20px;
    padding: 10px;
  }

  .profile-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .button-group {
    flex-direction: column;
  }
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;
}

select.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style> 