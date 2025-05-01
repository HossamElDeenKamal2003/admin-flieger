<template>
  <div>
    <h2 style="color: red">ملاحظة : يرجى تزويدنا بموقعك الدقيق لتسهيل عملية التوصيل</h2>
  </div>
  <div class="signup-container">

    <form @submit.prevent="handleSubmit" class="signup-form">
      <h2 class="form-title">Sign Up</h2>

      <div class="user-type-selection">
        <h3>Select User Type</h3>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="userType" value="doctor" v-model="userType">
            <span class="radio-custom"></span>
            Doctor
          </label>
          <label class="radio-option">
            <input type="radio" name="userType" value="lab" v-model="userType">
            <span class="radio-custom"></span>
            Lab
          </label>
        </div>
        <div v-if="userTypeError" class="error-message">{{ userTypeError }}</div>
      </div>

      <div class="form-group">
        <label for="phone">{{ userType === 'doctor' ? 'Clinic Name' : 'Lab Number' }}</label>
        <input
            type="text"
            id="username"
            :placeholder="userType === 'doctor' ? 'Enter Clinic Name' : 'Enter Lab Name'"
            v-model="username"
            required
        >
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
      </div>

      <div class="form-group">
        <label for="phone">{{ userType === 'doctor' ? 'Clinic Number' : 'Phone Number' }}</label>
        <input
            type="tel"
            id="phone"
            :placeholder="userType === 'doctor' ? 'Enter Clinic Number' : 'Enter Phone Number'"
            v-model="phoneNumber"
            required
        >
        <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
            type="email"
            id="email"
            placeholder="Enter Email"
            v-model="email"
            required
        >
        <div v-if="emailError" class="error-message">{{ emailError }}</div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
            type="password"
            id="password"
            placeholder="Enter Password"
            v-model="password"
            required
        >
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            v-model="confirmPassword"
            required
        >
        <div v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</div>
      </div>

      <div class="address-section">
        <h3>Address Information</h3>
        <div class="form-row">
          <div class="form-group half-width">
            <label for="buildNo">Building Number</label>
            <input
                type="text"
                id="buildNo"
                placeholder="Building No"
                v-model="buildNo"
                required
            >
          </div>
          <div class="form-group half-width">
            <label for="floorNo">Floor Number</label>
            <input
                type="text"
                id="floorNo"
                placeholder="Floor No"
                v-model="floorNo"
                required
            >
          </div>
        </div>
        <div class="form-group">
          <label for="address">Full Address</label>
          <input
              type="text"
              id="address"
              placeholder="Enter Full Address"
              v-model="address"
              required
          >
        </div>
      </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-option">
            <input type="checkbox" v-model="subscribeDelivery">
            <span class="checkbox-custom"></span>
            Subscribe to Delivery Service
          </label>
        </div>

      <button type="submit" class="submit-btn">Sign Up</button>

      <div class="form-footer">
        <span>Already have an account? <router-link to="/login" class="login-link">Login</router-link></span>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
export default {
  name: "SignupComponent",
  data() {
    return {
      userType: 'doctor',
      username: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      buildNo: '',
      floorNo: '',
      address: '',
      // Lab-specific fields
      coverImage: '',
      profileImage: '',
      subscribeDelivery: false,
      // Error messages
      userTypeError: '',
      usernameError: '',
      phoneError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      baseUrl: "https://rr-5d46.onrender.com",
    }
  },
  methods: {
    validateForm() {
      let isValid = true;

      // Reset errors
      this.userTypeError = '';
      this.usernameError = '';
      this.phoneError = '';
      this.emailError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';

      // Validate user type
      if (!this.userType) {
        this.userTypeError = 'Please select a user type';
        isValid = false;
      }

      // Validate username
      if (!this.username) {
        this.usernameError = 'Username is required';
        isValid = false;
      }

      // Validate phone number
      if (!this.phoneNumber) {
        this.phoneError = 'Phone number is required';
        isValid = false;
      } else if (!/^\d+$/.test(this.phoneNumber)) {
        this.phoneError = 'Phone number should contain only digits';
        isValid = false;
      }

      // Validate email
      if (!this.email) {
        this.emailError = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
        isValid = false;
      }

      // Validate password
      if (!this.password) {
        this.passwordError = 'Password is required';
        isValid = false;
      } else if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
        isValid = false;
      }

      // Validate confirm password
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match';
        isValid = false;
      }

      return isValid;
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      try {
        let endpoint = '';
        let payload = {};

        const commonFields = {
          username: this.username,
          phoneNumber: this.phoneNumber,
          email: this.email,
          buildNo: this.buildNo,
          floorNo: this.floorNo,
          address: this.address,
          password: this.password,
        };

        if (this.userType === 'doctor') {
          endpoint = '/doctors/register';
          payload = commonFields;
        } else if (this.userType === 'lab') {
          endpoint = '/labs/register';
          payload = {
            ...commonFields,
            coverImage: this.coverImage,
            profileImage: this.profileImage,
            subscribeDelivery: this.subscribeDelivery,
          };
        }

        const response = await axios.post(`${this.baseUrl}${endpoint}`, payload);

        if (response.data) {
          this.$router.push('/login');
          this.$toast.success('Registration successful! Please login.');
        } else {
          throw new Error('Registration failed');
        }
      } catch (error) {
        console.error('Signup error:', error);

        let errorMsg = 'Registration failed. Please try again.';

        // Safely check for error.response and error.response.data
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data.error) {
            errorMsg = error.response.data.error;
          }
        } else if (error.message) {
          errorMsg = error.message; // Fallback to error.message for network errors, etc.
        }
        toast.error(errorMsg);
      }
    }
  }
}
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.signup-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
}

.form-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #04AA6D;
  outline: none;
  box-shadow: 0 0 0 3px rgba(4, 170, 109, 0.1);
}

.user-type-selection {
  margin: 25px 0;
}

.user-type-selection h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #555;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding-left: 30px;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 50%;
  transition: all 0.3s;
}

.radio-option:hover .radio-custom {
  border-color: #04AA6D;
}

.radio-option input:checked ~ .radio-custom {
  background-color: #04AA6D;
  border-color: #04AA6D;
}

.radio-custom:after {
  content: "";
  position: absolute;
  display: none;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.radio-option input:checked ~ .radio-custom:after {
  display: block;
}

.address-section h3 {
  margin: 25px 0 15px;
  font-size: 16px;
  color: #555;
}

.form-row {
  display: flex;
  gap: 15px;
}

.half-width {
  flex: 1;
}

.checkbox-group {
  margin-top: 15px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding-left: 30px;
}

.checkbox-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.checkbox-option:hover .checkbox-custom {
  border-color: #04AA6D;
}

.checkbox-option input:checked ~ .checkbox-custom {
  background-color: #04AA6D;
  border-color: #04AA6D;
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-option input:checked ~ .checkbox-custom:after {
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #04AA6D;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.submit-btn:hover {
  background-color: #038a5a;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link {
  color: #04AA6D;
  text-decoration: none;
  font-weight: 500;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.lab-fields {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .half-width {
    width: 100%;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>