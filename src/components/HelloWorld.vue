<template>
  <div class="cont" :class="{ 's--signup': isSignUp }">
    <div class="form sign-in">
      <h2>Welcome</h2>
      <label>
        <span>username</span>
        <input type="email" v-model="signInForm.username" />
      </label>
      <label>
        <span>Password</span>
        <input type="password" v-model="signInForm.password" />
      </label>
      <!-- <p class="forgot-pass">Forgot password?</p> -->
      <button type="button" class="submit" @click="signIn">Sign In</button>
    </div>
    <div class="sub-cont">
      <div class="img">
        <div class="img__text m--up">
          <h3>Don't have an account? Please Sign up!</h3>
        </div>
        <div class="img__text m--in">
          <h3>If you already have an account, just sign in.</h3>
        </div>
        <div class="img__btn" @click="toggleSignUp">
          <span class="m--up">Sign Up</span>
          <span class="m--in">Sign In</span>
        </div>
      </div>
      <div class="form sign-up">
        <h2>Create your Account</h2>
        <label>
          <span>Name</span>
          <input type="text" v-model="signUpForm.username" />
        </label>
        <label>
          <span>secretKey</span>
          <input type="email" v-model="signUpForm.secretKey" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" v-model="signUpForm.password" />
        </label>
        <button type="button" class="submit" @click="signUp">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<script>
// import HomeComponent from './HomeComponent.vue';

// import axios from 'axios';
export default {
  name: 'AuthComponent', 
  data() {
    return {
      isSignUp: false,
      signInForm: {
        username: '',
        password: ''
      },
      signUpForm: {
        username: '',
        secretKey: '',
        password: ''
      }
    };
  },
  methods: {
    toggleSignUp() {
      this.isSignUp = !this.isSignUp;
    },
    signIn() {
      // Handle sign in logic here
      console.log('Sign In with:', this.signInForm);
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.signInForm.username,
          //secretKey: this.signUpForm.secretKey,
          password: this.signInForm.password
        })
      };

      // Send the request
      fetch("https://fliegertechnology.onrender.com/admin/signin", requestOptions)
        .then(response => {
          if (!response.ok) {
            // Check if the response is JSON
            return response.json().then(err => {
              // Throw an error with a message from the server
              throw new Error(err.message || 'Network response was not ok');
            });
          }
          return response.json(); // Parse JSON from the response
        })
        .then(data => {
          console.log('data : ', data);
          alert("Login Successful");
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("role", data.user.role);
          console.log(data.username)
          this.$router.push('/home');
        })
        .catch(error => {
          console.log('error : ', error.message);
          alert(error.message);
        });

    },
    signUp() {
      // Handle sign up logic here
      console.log('Sign Up with:', this.signUpForm);

      // Prepare the request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.signUpForm.username,
          secretKey: this.signUpForm.secretKey,
          password: this.signUpForm.password
        })
      };

      // Send the request
      fetch("https://fliegertechnology.onrender.com/admin/signup", requestOptions)
        .then(response => {
          if (!response.ok) {
            // Check if the response is JSON
            return response.json().then(err => {
              // Throw an error with a message from the server
              throw new Error(err.message || 'Network response was not ok');
            });
          }
          return response.json(); // Parse JSON from the response
        })
        .then(data => {
          console.log(data);
          alert("Admin created successfully")
        })
        .catch(error => {
          console.log('error : ', error.message);
          alert(error.message);
        });
    },
    created(){
      
    }

  }
};
</script>

<style scoped>
/* Your existing CSS with some tweaks for Vue's scoped styling */
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.img{
  color: rgb(114, 89, 170);
}
body {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  background: #ffffff;
}

input,
button {
  border: none;
  outline: none;
  background: none;
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
}

.cont {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  width: 900px;
  height: 550px;
  margin: 0 auto 100px;
  background: #fff;
  box-shadow: -10px -10px 15px rgba(255, 255, 255, 0.3), 10px 10px 15px rgba(70, 70, 70, 0.15),
    inset -10px -10px 15px rgba(255, 255, 255, 0.3), inset 10px 10px 15px rgba(70, 70, 70, 0.15);
}

.form {
  position: relative;
  width: 640px;
  height: 100%;
  transition: transform 1.2s ease-in-out;
  padding: 50px 30px 0;
}

.sub-cont {
  overflow: hidden;
  position: absolute;
  left: 640px;
  top: 0;
  width: 900px;
  height: 100%;
  padding-left: 260px;
  background: rgb(114, 89, 170);
  transition: transform 1.2s ease-in-out;
}

.cont.s--signup .sub-cont {
  transform: translate3d(-640px, 0, 0);
}

button {
  display: block;
  margin: 0 auto;
  width: 260px;
  height: 36px;
  border-radius: 30px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  background: #d4af7a;
  text-transform: uppercase;
}

.img {
  overflow: hidden;
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 260px;
  height: 100%;
  padding-top: 360px;
}

.img:before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 900px;
  height: 100%;
  opacity: 0.8;
  background-size: cover;
  transition: transform 1.2s ease-in-out;
}

.img:after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.cont.s--signup .img:before {
  transform: translate3d(640px, 0, 0);
}

.img__text {
  z-index: 2;
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
  padding: 0 20px;
  text-align: center;
  color: #fff;
  transition: transform 1.2s ease-in-out;
}

.cont.s--signup .img__text.m--up {
  transform: translateX(520px);
}

.img__text.m--in {
  transform: translateX(-520px);
}

.cont.s--signup .img__text.m--in {
  transform: translateX(0);
}

.img__btn {
  overflow: hidden;
  z-index: 2;
  position: relative;
  width: 100px;
  height: 36px;
  margin: 0 auto;
  background: transparent;
  color: #fff;
  text-transform: uppercase;
  font-size: 15px;
  cursor: pointer;
}

.img__btn:after {
  content: '';
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #fff;
  border-radius: 30px;
}

.img__btn span {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: transform 1.2s;
}

.img__btn span.m--in {
  transform: translateY(-72px);
}

.cont.s--signup .img__btn span.m--in {
  transform: translateY(0);
}

.cont.s--signup .img__btn span.m--up {
  transform: translateY(72px);
}

h2 {
  width: 100%;
  font-size: 26px;
  text-align: center;
}

label {
  display: block;
  width: 260px;
  margin: 25px auto 0;
  text-align: center;
}

label span {
  font-size: 12px;
  color: #cfcfcf;
  text-transform: uppercase;
}

input {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding-bottom: 5px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);
  text-align: center;
}

.forgot-pass {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
  color: #cfcfcf;
}
</style>
