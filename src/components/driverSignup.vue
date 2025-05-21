<template>
  <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
    <Sidebar />
  </div>

  <div class="signup-container">
    <WaitingDriversNumber :waiting-captains="waitingCaptains" />

    <h2>Driver Signup</h2>
    <form @submit.prevent="handleSignup" enctype="multipart/form-data">
      <!-- Text Inputs -->
      <div class="form-group">
        <label>Username</label>
        <input v-model="form.username" type="text" placeholder="Username" required />
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <input v-model="form.phoneNumber" type="tel" placeholder="Phone Number" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>
      <div class="form-group">
        <label>Driver ID</label>
        <input v-model="form.id" type="text" placeholder="ID" required />
      </div>
      <div class="form-group">
        <label>Car Model</label>
        <input v-model="form.carModel" type="text" placeholder="Car Model" required />
      </div>
      <div class="form-group">
        <label>Car Number</label>
        <input v-model="form.carNumber" type="text" placeholder="Car Number" required />
      </div>
      <div class="form-group">
        <label>Car Color</label>
        <select v-model="form.carColor" required>
          <option value="" disabled>Select Car Color</option>
          <option v-for="color in colors" :key="color._id" :value="color._id">
            {{ color.color }}
            <!-- Optional: Display hex color swatch -->
            <span :style="{ backgroundColor: color.hexDecimal, width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginLeft: '10px' }"></span>
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Vehicle Type</label>
        <input v-model="form.vehicleType" type="text" placeholder="Vehicle Type" required />
      </div>
      <div class="form-group">
        <label>License Expiry Date</label>
        <input v-model="form.licence_expire_date" type="date" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Password" required />
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password" required />
      </div>
      <div class="form-group">
        <label>Wallet Type</label>
        <input v-model="form.walletType" type="text" placeholder="Wallet Type" />
      </div>
      <div class="form-group">
        <label>Vehicle Category</label>
        <input v-model="form.vehicleCategory" type="text" placeholder="Vehicle Category" />
      </div>
      <div class="form-group">
        <label>Vehicle Sub-Category</label>
        <input v-model="form.vehicleSubCategory" type="text" placeholder="Vehicle Sub-Category" />
      </div>
      <div class="form-group">
        <label>Vehicle Production Date</label>
        <input v-model="form.vehicleProductionDate" type="date" placeholder="Vehicle Production Date" />
      </div>
      <div class="form-group">
        <label>City</label>
        <input v-model="form.city" type="text" placeholder="City" />
      </div>
      <div class="form-group">
        <label>Comments</label>
        <textarea v-model="form.comments" placeholder="Comments (Optional)" rows="4"></textarea>
      </div>

      <!-- File Uploads -->
      <div v-for="(label, key) in fileFields" :key="key" class="form-group">
        <label>{{ label }}</label>
        <input type="file" accept="image/*" @change="handleFileUpload($event, key)" :required="key !== 'vehicleNumberImage'" />
      </div>

      <!-- Location Button -->
      <div class="form-group">
        <button type="button" @click="getLocation" :disabled="loading || locationLoading">
          {{ locationLoading ? 'Fetching Location...' : 'Get Current Location' }}
        </button>
        <p v-if="form.location" class="success">
          Location captured: {{ form.location.latitude }}, {{ form.location.longitude }}
        </p>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="loading || !form.location">
        {{ loading ? 'Signing Up...' : 'Sign Up' }}
      </button>
    </form>

    <!-- Messages -->
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: 'DriverSignup',
  components: { WaitingDriversNumber, Sidebar },
  data() {
    return {
      isSidebarExpanded: true,
      form: {
        username: '',
        phoneNumber: '',
        email: '',
        id: '',
        carModel: '',
        carNumber: '',
        carColor: '',
        vehicleType: '',
        licence_expire_date: '',
        password: '',
        confirmPassword: '',
        licenseImage: null,
        driver_licence_image: null,
        profile_image: null,
        national_front: null,
        national_back: null,
        national_selfie: null,
        vehicleNumberImage: null,
        location: null,
        walletType: '',
        vehicleCategory: '',
        vehicleSubCategory: '',
        vehicleProductionDate: '',
        city: '',
        driverFCMToken: null,
        updateWallettime: null,
        comments: '',
      },
      fileFields: {
        licenseImage: 'License Image',
        driver_licence_image: 'Driver License Image',
        profile_image: 'Profile Image',
        national_front: 'National ID Front',
        national_back: 'National ID Back',
        national_selfie: 'Selfie with National ID',
        vehicleNumberImage: 'Vehicle Number Image',
      },
      colors: [],
      errorMessage: '',
      successMessage: '',
      loading: false,
      locationLoading: false,
      waitingCaptains: 0,
    };
  },
  methods: {
    async fetchColors() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/colors/get-colors');
        this.colors = response.data.colors; // Store colors array from response
      } catch (error) {
        console.error('Error fetching colors:', error);
        this.errorMessage = 'Failed to load car colors.';
      }
    },
    handleFileUpload(event, field) {
      const file = event.target.files[0];
      if (file) {
        this.reduceImageResolution(file, (compressedFile) => {
          this.form[field] = compressedFile;
        });
      } else {
        console.warn(`No file selected for ${field}`);
      }
    },
    reduceImageResolution(file, callback) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            callback(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
      reader.onerror = (error) => {
        console.error('FileReader Error:', error);
        this.errorMessage = 'Error reading the uploaded file.';
      };
    },
    getLocation() {
      if (!navigator.geolocation) {
        this.errorMessage = 'Geolocation is not supported by your browser.';
        return;
      }
      this.locationLoading = true;
      navigator.geolocation.getCurrentPosition(
          (position) => {
            this.form.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.locationLoading = false;
            console.log('Location fetched:', this.form.location);
          },
          (error) => {
            console.error('Location Error:', error);
            this.errorMessage = 'Failed to retrieve location. Please try again.';
            this.locationLoading = false;
          }
      );
    },
    async handleSignup() {
      this.errorMessage = '';
      this.successMessage = '';
      this.loading = true;

      try {
        // Validate password match
        if (this.form.password !== this.form.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        // Validate required fields
        const requiredFields = [
          'username',
          'phoneNumber',
          'email',
          'id',
          'carModel',
          'carNumber',
          'carColor',
          'vehicleType',
          'licence_expire_date',
          'password',
          'licenseImage',
          'driver_licence_image',
          'profile_image',
        ];
        for (const field of requiredFields) {
          if (!this.form[field]) {
            throw new Error(`Please fill out ${field} field.`);
          }
        }

        const formData = new FormData();
        Object.keys(this.form).forEach((key) => {
          if (key === 'confirmPassword') return;
          if (key === 'location' && this.form.location) {
            formData.append('latitude', this.form.location.latitude);
            formData.append('longitude', this.form.location.longitude);
          } else if (key === 'comments' && this.form.comments) {
            formData.append('comments', this.form.comments.split('\n').filter(c => c.trim()));
          } else if (this.form[key] !== null && this.form[key] !== '') {
            formData.append(key, this.form[key]);
          }
        });

        console.log('Submitting form data:', this.form);

        const response = await axios.post('https://backend.fego-rides.com/authdriver/driversignup', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.successMessage = 'Signup successful! Welcome aboard.';
        console.log('Signup Response:', response.data);

        // Reset form
        this.form = {
          username: '',
          phoneNumber: '',
          email: '',
          id: '',
          carModel: '',
          carNumber: '',
          carColor: '',
          vehicleType: '',
          licence_expire_date: '',
          password: '',
          confirmPassword: '',
          licenseImage: null,
          driver_licence_image: null,
          profile_image: null,
          national_front: null,
          national_back: null,
          national_selfie: null,
          vehicleNumberImage: null,
          location: null,
          walletType: '',
          vehicleCategory: '',
          vehicleSubCategory: '',
          vehicleProductionDate: '',
          city: '',
          driverFCMToken: null,
          updateWallettime: null,
          comments: '',
        };
      } catch (error) {
        console.error('Signup Error:', error);
        this.errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup.';
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.fetchColors();
  },
};
</script>

<style scoped>
.signup-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

input,
select,
textarea,
button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

input[type="file"] {
  padding: 3px;
}

textarea {
  resize: vertical;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  background-color: #1f2a44;
  color: #ffffff;
}

.sidebar-collapsed {
  width: 80px;
}

/* Style for color swatch in dropdown */
select option {
  display: flex;
  align-items: center;
}
</style>