```vue
<template>
  <div class="app-container">
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar />
    </div>

    <div class="main-content">
      <div class="signup-container">
        <WaitingDriversNumber :waiting-captains="waitingCaptains" />

        <h2>Driver Signup</h2>

        <form @submit.prevent="handleSignup" enctype="multipart/form-data">
          <!-- Personal Information -->
          <div class="form-section">
            <h3>Personal Information</h3>
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
              <label>National ID</label>
              <input v-model="form.id" type="National ID" placeholder="Nationl ID" required />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input v-model="form.password" type="password" placeholder="Password" required />
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password" required />
            </div>
          </div>

          <!-- Vehicle Information -->
          <div class="form-section">
            <h3>Vehicle Information</h3>
            <div class="form-group">
              <label>Vehicle Type</label>
              <select v-model="form.vehicleType" @change="onVehicleTypeChange" required>
                <option value="" disabled>Select Vehicle Type</option>
                <option v-for="type in vehicleTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
              <p v-if="loadingVehicles" class="info-message">Loading vehicle categories...</p>
            </div>
            <div class="form-group">
              <label>Vehicle Category</label>
              <select v-model="form.vehicleCategory" @change="onCategoryChange" :disabled="!form.vehicleType || loadingVehicles || !vehicleCategories.length" required>
                <option value="" disabled>Select Vehicle Category</option>
                <option v-for="category in vehicleCategories" :key="category._id" :value="category.category">
                  {{ formatName(category.category) }}
                </option>
              </select>
              <p v-if="form.vehicleType && !vehicleCategories.length && !loadingVehicles" class="error-message">
                No categories available for this vehicle type. Please try again later.
              </p>
            </div>
            <div class="form-group">
              <label>Vehicle Sub-Category</label>
              <select v-model="form.vehicleSubCategory" :disabled="!form.vehicleCategory || !selectedSubCategories.length || loadingVehicles" required>
                <option value="" disabled>Select Vehicle Sub-Category</option>
                <option v-for="subCategory in selectedSubCategories" :key="subCategory" :value="subCategory">
                  {{ formatName(subCategory) }}
                </option>
              </select>
              <p v-if="form.vehicleCategory && !selectedSubCategories.length && !loadingVehicles" class="error-message">
                No sub-categories available for this category.
              </p>
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
                  <span class="color-swatch" :style="{ backgroundColor: color.hexDecimal }"></span>
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Vehicle Production Date</label>
              <input v-model="form.vehicleProductionDate" type="date" />
            </div>
          </div>

          <!-- Documents -->
          <div class="form-section">
            <h3>Documents</h3>
            <div class="form-group">
              <label>License Expiry Date</label>
              <input v-model="form.licence_expire_date" type="date" required />
            </div>
            <div v-for="(label, key) in fileFields" :key="key" class="form-group">
              <label>{{ label }}</label>
              <input type="file" accept="image/*" @change="handleFileUpload($event, key)" :required="key !== 'vehicleNumberImage'" />
            </div>
          </div>

          <!-- Additional Information -->
<!--          <div class="form-section">-->
<!--            <h3>Additional Information</h3>-->
<!--            <div class="form-group">-->
<!--              <label>Wallet Type</label>-->
<!--              <input v-model="form.walletType" type="text" placeholder="Wallet Type" />-->
<!--            </div>-->
<!--            <div class="form-group">-->
<!--              <label>City</label>-->
<!--              <input v-model="form.city" type="text" placeholder="City" />-->
<!--            </div>-->
<!--            <div class="form-group">-->
<!--              <label>Comments</label>-->
<!--              <textarea v-model="form.comments" placeholder="Comments (Optional)" rows="4"></textarea>-->
<!--            </div>-->
<!--          </div>-->

          <!-- Location -->
          <div class="form-group location-group">
            <button type="button" @click="getLocation" :disabled="loading || locationLoading" class="location-button">
              <span v-if="locationLoading">Fetching Location...</span>
              <span v-else>Get Current Location</span>
            </button>
            <p v-if="form.location" class="success-message">
              Location captured: {{ form.location.latitude }}, {{ form.location.longitude }}
            </p>
            <p v-if="locationError" class="error-message">{{ locationError }}</p>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading || !form.location" class="submit-button">
            <span v-if="loading">Signing Up...</span>
            <span v-else>Sign Up</span>
          </button>

          <!-- Status Messages -->
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: 'DriverSignup',
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  data() {
    return {
      isSidebarExpanded: true,
      vehicleTypes: ['Car', 'Motorcycle', 'Van'],
      form: {
        username: '',
        phoneNumber: '',
        email: '',
        id: '',
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
      vehicleCategories: [],
      selectedSubCategories: [],
      errorMessage: '',
      successMessage: '',
      loading: false,
      locationLoading: false,
      locationError: '',
      loadingVehicles: false,
      waitingCaptains: 0,
    };
  },
  methods: {
    // Format names for consistent display (e.g., capitalize, fix typos)
    formatName(name) {
      if (!name) return '';
      // Known typo corrections
      const typoFixes = {
        'toyta': 'Toyota',
        'A5 Cabriolrt': 'A5 Cabriolet',
        'RS6 Aant': 'RS6 Avant',
        'rio x line': 'Rio X-Line',
        'ceedgt': 'Ceed GT',
      };
      const correctedName = typoFixes[name.toLowerCase()] || name;
      // Capitalize first letter of each word
      return correctedName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    },
    // Clean vehicle data to remove duplicates and empty strings
    cleanVehicleData(vehicles) {
      return vehicles.map(category => ({
        ...category,
        category: category.category || '',
        subCategories: [
          ...new Set( // Remove duplicates
              (category.subCategories || [])
                  .filter(sub => sub && sub.trim() !== '') // Remove empty strings
                  .map(sub => sub.trim())
          )
        ]
      })).filter(cat => cat.category && cat.subCategories.length > 0); // Remove invalid categories
    },
    async fetchColors() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/colors/get-colors');
        this.colors = response.data.colors || [];
      } catch (error) {
        console.error('Error fetching colors:', error);
        this.errorMessage = 'Failed to load car colors. Please try again.';
      }
    },
    async fetchVehicles(type) {
      try {
        this.loadingVehicles = true;
        this.errorMessage = '';
        this.vehicleCategories = [];
        this.selectedSubCategories = [];
        this.form.vehicleCategory = '';
        this.form.vehicleSubCategory = '';

        const endpoint = `https://backend.fego-rides.com/vehicles/${type.toLowerCase()}`;
        const response = await axios.get(endpoint);

        // Validate and clean API response
        if (response.data && Array.isArray(response.data.vehicles)) {
          this.vehicleCategories = this.cleanVehicleData(response.data.vehicles);
          if (!this.vehicleCategories.length) {
            this.errorMessage = `No valid ${type.toLowerCase()} categories found.`;
          }
        } else {
          throw new Error('Invalid response format from vehicles API');
        }
      } catch (error) {
        console.error(`Error fetching ${type} vehicles:`, error);
        this.errorMessage = `Failed to load ${type.toLowerCase()} categories. Please try again later.`;
        this.vehicleCategories = [];
      } finally {
        this.loadingVehicles = false;
      }
    },
    onVehicleTypeChange() {
      // Reset dependent fields
      this.form.vehicleCategory = '';
      this.form.vehicleSubCategory = '';
      this.vehicleCategories = [];
      this.selectedSubCategories = [];

      if (this.form.vehicleType) {
        this.fetchVehicles(this.form.vehicleType);
      }
    },
    onCategoryChange() {
      this.form.vehicleSubCategory = '';
      const selectedCategory = this.vehicleCategories.find(
          (cat) => cat.category.toLowerCase() === this.form.vehicleCategory.toLowerCase()
      );
      this.selectedSubCategories = selectedCategory && Array.isArray(selectedCategory.subCategories)
          ? [...selectedCategory.subCategories].sort() // Sort for consistent UX
          : [];
      if (!this.selectedSubCategories.length && this.form.vehicleCategory) {
        this.errorMessage = 'No sub-categories available for the selected category.';
      }
    },
    handleFileUpload(event, field) {
      const file = event.target.files[0];
      if (file) {
        this.compressImage(file)
            .then((compressedFile) => {
              this.form[field] = compressedFile;
            })
            .catch(() => {
              this.form[field] = file; // Fallback to original file
              this.errorMessage = `Failed to compress ${field.replace('_', ' ')}. Using original file.`;
            });
      }
    },
    compressImage(file) {
      return new Promise((resolve, reject) => {
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
            canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                  } else {
                    reject();
                  }
                },
                'image/jpeg',
                0.8
            );
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
    },
    getLocation() {
      if (!navigator.geolocation) {
        this.locationError = 'Geolocation is not supported by your browser.';
        return;
      }
      this.locationLoading = true;
      this.locationError = '';
      navigator.geolocation.getCurrentPosition(
          (position) => {
            this.form.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.locationLoading = false;
          },
          (error) => {
            console.error('Location Error:', error);
            this.locationError = 'Failed to retrieve location. Please try again.';
            this.locationLoading = false;
          }
      );
    },
    validateForm() {
      if (this.form.password !== this.form.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const requiredFields = [
        'username',
        'phoneNumber',
        'email',
        'carNumber',
        'carColor',
        'vehicleType',
        'licence_expire_date',
        'password',
        'licenseImage',
        'driver_licence_image',
        'profile_image',
        'vehicleCategory',
        'vehicleSubCategory',
      ];

      for (const field of requiredFields) {
        if (!this.form[field]) {
          throw new Error(`Please fill out ${field.replace('_', ' ')} field.`);
        }
      }

      if (!this.form.location) {
        throw new Error('Please capture your location.');
      }
    },
    prepareFormData() {
      const formData = new FormData();
      Object.keys(this.form).forEach((key) => {
        if (key === 'confirmPassword') return;
        if (key === 'location' && this.form.location) {
          formData.append('latitude', this.form.location.latitude);
          formData.append('longitude', this.form.location.longitude);
          formData.append('carModel', "2302")
        } else if (key === 'comments' && this.form.comments) {
          formData.append('comments', this.form.comments.split('\n').filter((c) => c.trim()));
        } else if (this.form[key] !== null && this.form[key] !== '') {
          formData.append(key, this.form[key]);
        }
      });
      return formData;
    },
    resetForm() {
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
      this.vehicleCategories = [];
      this.selectedSubCategories = [];
    },
    async handleSignup() {
      this.errorMessage = '';
      this.successMessage = '';
      this.loading = true;

      try {
        this.validateForm();
        const formData = this.prepareFormData();

        // 🔽 Log form data before sending
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}:`, pair[1]);
        }

        const response = await axios.post(
            'https://backend.fego-rides.com/authdriver/driversignup',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        console.log('Signup response:', response.data);
        this.successMessage = 'Signup successful! Welcome aboard.';
        this.resetForm();
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
.app-container {
  display: flex;
  min-height: 100vh;
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

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.signup-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.form-section h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input[type="file"] {
  padding: 5px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.color-swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  vertical-align: middle;
  border: 1px solid #ddd;
}

.location-button,
.submit-button {
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.location-button {
  background-color: #3498db;
  color: white;
}

.location-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.submit-button {
  background-color: #2ecc71;
  color: white;
  width: 100%;
  margin-top: 20px;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 5px;
  font-size: 14px;
}

.success-message {
  color: #27ae60;
  margin-top: 10px;
}

.info-message {
  color: #3498db;
  margin-top: 5px;
  font-size: 14px;
}

.location-group {
  text-align: center;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .sidebar-collapsed {
    width: 100%;
  }

  .signup-container {
    padding: 15px;
  }
}
</style>
```