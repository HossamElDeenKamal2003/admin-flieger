<template>
  <div class="login-container">

    <form @submit.prevent="handleSubmit" class="login-form">
      <h2 class="form-title">Login</h2>

      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input
            type="tel"
            id="phone"
            placeholder="Enter Phone Number"
            v-model="phoneNumber"
            required
        >
        <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
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
          <label class="radio-option">
            <input type="radio" name="userType" value="delivery" v-model="userType">
            <span class="radio-custom"></span>
            Delivery
          </label>
        </div>
        <div v-if="userTypeError" class="error-message">{{ userTypeError }}</div>
      </div>

      <button type="submit" class="submit-btn">Login</button>

      <div class="form-footer">
<!--        <a href="#" class="forgot-password">Forgot password?</a>-->
        <span>Don't have an account? <a href="/register" class="signup-link">Sign up</a></span>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "LoginComponent",
  data() {
    return {
      phoneNumber: '',
      password: '',
      userType: '',
      phoneError: '',
      passwordError: '',
      userTypeError: '',
      UID: '',
      baseUrl: "https://rr-5d46.onrender.com",
    }
  },
  methods: {
    handleSubmit() {
      let endpoint = '';
      switch(this.userType) {
        case 'doctor':
          endpoint = '/doctors/login';
          break;
        case 'lab':
          endpoint = '/labs/login';
          break;
        case 'delivery':
          endpoint = '/delivery/login';
          break;
        default:
          endpoint = '/user/login';
      }

      axios.post(`${this.baseUrl}${endpoint}`, {
        phoneNumber: this.phoneNumber,
        password: this.password,
      }).then(response => {
        if (!response.data) {
          throw new Error('Invalid response structure');
        }

        let username = '';
        let token = '';
        let uid = '';
        // let role = '';
        // Handle different response structures based on user type
        switch(this.userType) {
          case 'doctor':
            username = response.data.result?.doctor?.username || '';
            uid = response.data.result?.doctor.UID;
            localStorage.setItem("uid", uid);
            localStorage.setItem("role", "doctor");
            console.log(response.data);
            token = response.data.result?.token || '';
            this.$router.push('/create-order');
            break;
          case 'lab':
            username = response.data.lab?.username || '';
            token = response.data.token || '';
            this.$router.push('/lab');
            localStorage.setItem("role", "lab");
            break;
          case 'delivery':
            username = response.data.result?.delivery?.username || '';
            token = response.data.result?.token || '';
            localStorage.setItem("role", "del");
            break;
          default:
            username = response.data.result?.user?.username || '';
            token = response.data.result?.token || '';
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        // this.$router.push('/');

      }).catch(error => {
        console.error('Login error:', error);
        const errorData = error.response?.data || {};
        const errorMsg = errorData.message || 'Login failed. Please try again.';

        // Reset all errors
        this.phoneError = '';
        this.passwordError = '';
        this.userTypeError = '';

        // Set specific error
        switch(errorData.field) {
          case 'phone':
            this.phoneError = errorMsg;
            break;
          case 'password':
            this.passwordError = errorMsg;
            break;
          default:
            this.userTypeError = errorMsg;
        }
      });
    }
  }
}
</script>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
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
  margin-top: 10px;
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

.forgot-password {
  display: block;
  margin-bottom: 10px;
  color: #04AA6D;
  text-decoration: none;
}

.signup-link {
  color: #04AA6D;
  text-decoration: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-form {
    padding: 20px;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
/* Previous styles remain the same, add these new styles */

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

/* Add red border to invalid inputs */
.form-group input:invalid,
.form-group input.is-invalid {
  border-color: #ff4444;
}

/* Style the radio group error message to appear below the options */
.user-type-selection .error-message {
  margin-top: 10px;
}

/* Previous styles... */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
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
  margin-top: 10px;
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

.forgot-password {
  display: block;
  margin-bottom: 10px;
  color: #04AA6D;
  text-decoration: none;
}

.signup-link {
  color: #04AA6D;
  text-decoration: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-form {
    padding: 20px;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>