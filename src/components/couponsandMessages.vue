```vue
<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <sidebarComponent />
    </div>
    <!-- Main Content -->
    <div class="main-content">
      <WaitingDriversNumber :waiting-captains="waitingCaptains" />
      <div class="coupon-message-management">
        <h2 class="section-title">Send Coupons & Messages</h2>
        <!-- Coupon and Message Form -->
        <div class="coupon-message-form">
          <div class="input-wrapper">
            <select v-model="couponMessage.recipientType" class="form-input recipient-select" required>
              <option value="" disabled>Select Recipient</option>
              <option value="users">Users</option>
              <option value="captains">Captains</option>
              <option value="all">All (Users & Captains)</option>
            </select>
          </div>
          <div class="input-wrapper">
            <input v-model="couponMessage.couponCode" placeholder="Enter Coupon Code (e.g., FEGO50)" class="form-input" required />
          </div>
          <div class="input-wrapper">
            <input v-model.number="couponMessage.couponValue" type="number" placeholder="Coupon Value (e.g., 50)" class="form-input" min="0" required />
          </div>
          <div class="input-wrapper">
            <input v-model="couponMessage.couponExpiry" type="date" class="form-input" required />
          </div>
          <div class="input-wrapper">
            <textarea v-model="couponMessage.message" placeholder="Enter Message (e.g., Enjoy 50% off your next ride!)" class="form-input textarea" rows="4" required></textarea>
          </div>
          <button @click="sendCouponMessage" class="confirm-button" :disabled="loading">Send</button>
          <button @click="copyAllText" class="copy-button">📋</button>
          <p v-if="couponMessage.updatedAt" class="timestamp">Last Sent: {{ formatDate(couponMessage.updatedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import sidebarComponent from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
import axios from 'axios';

export default defineComponent({
  components: { WaitingDriversNumber, sidebarComponent },
  data() {
    return {
      waitingCaptains: 0,
      loading: false,
      couponMessage: {
        recipientType: '',
        couponCode: '',
        couponValue: 0,
        couponExpiry: '',
        message: '',
        updatedAt: null
      }
    };
  },
  methods: {
    async sendCouponMessage() {
      if (!this.couponMessage.recipientType || !this.couponMessage.couponCode || !this.couponMessage.couponValue || !this.couponMessage.couponExpiry || !this.couponMessage.message) {
        alert('Please fill all fields');
        return;
      }
      this.loading = true;
      try {
        const response = await axios.post('https://backend.fego-rides.com/sendCouponMessage', {
          recipientType: this.couponMessage.recipientType,
          couponCode: this.couponMessage.couponCode,
          couponValue: this.couponMessage.couponValue,
          couponExpiry: this.couponMessage.couponExpiry,
          message: this.couponMessage.message
        });
        if (response.status === 200 || response.status === 201) {
          this.couponMessage.updatedAt = new Date();
          alert('Coupon and message sent successfully!');
          // Reset form
          this.couponMessage = {
            recipientType: '',
            couponCode: '',
            couponValue: 0,
            couponExpiry: '',
            message: '',
            updatedAt: this.couponMessage.updatedAt
          };
        }
      } catch (error) {
        console.error('Error sending coupon/message:', error);
        alert('Failed to send coupon/message: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return '';
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).replace(',', '');
    },
    copyAllText() {
      const allText = `Recipient: ${this.couponMessage.recipientType}\nCoupon Code: ${this.couponMessage.couponCode}\nCoupon Value: ${this.couponMessage.couponValue}\nCoupon Expiry: ${this.couponMessage.couponExpiry}\nMessage: ${this.couponMessage.message}`;
      if (allText.trim()) {
        navigator.clipboard.writeText(allText)
            .then(() => {
              alert('All text copied to clipboard!');
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              alert('Failed to copy text');
            });
      }
    }
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2f1c6a;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.coupon-message-management {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
  width: 100%;
  max-width: 900px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #34495e;
}

.coupon-message-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.form-input {
  width: 100%;
  max-width: 400px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 25px;
  font-size: 16px;
  background-color: #f5f5ff;
}

.recipient-select {
  height: 48px;
}

.textarea {
  border-radius: 10px;
  resize: vertical;
}

.confirm-button {
  background-color: #6b48ff;
  color: white;
  padding: 10px 40px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #563bd1;
}

.confirm-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.copy-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  margin-top: 10px;
}

.copy-button:hover {
  opacity: 0.7;
}

.timestamp {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
  text-align: center;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
  .main-content {
    margin-left: 80px;
  }
  .form-input,
  .recipient-select,
  .textarea {
    width: 100%;
    max-width: 100%;
  }
}
</style>
```