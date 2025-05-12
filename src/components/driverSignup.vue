<template>
  <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
  <Sidebar />
</div>


  <div class="signup-container">
    <WaitingDriversNumber :waiting-captains="waitingCaptains" />

    <h2>Driver Signup</h2>
        <form @submit.prevent="handleSignup" enctype="multipart/form-data">
            <!-- Text Inputs -->
            <input v-model="form.username" type="text" placeholder="Username" required />
            <input v-model="form.phoneNumber" type="tel" placeholder="Phone Number" required />
            <input v-model="form.email" type="email" placeholder="Email" required />
            <input v-model="form.id" type="text" placeholder="ID" required />
            <input v-model="form.carModel" type="text" placeholder="Car Model" required />
            <input v-model="form.carNumber" type="text" placeholder="Car Number" required />
            <input v-model="form.carColor" type="text" placeholder="Car Color" required />
            <input v-model="form.vehicleType" type="text" placeholder="Vehicle Type" required />
            <input v-model="form.licence_expire_date" type="date" required />
            <input v-model="form.password" type="password" placeholder="Password" required />
            <input v-model="form.walletType" type="text" placeholder="Wallet Type" required />
            <!-- File Uploads -->
            <div v-for="(label, key) in fileFields" :key="key">
                <label>{{ label }}</label>
                <input type="file" @change="handleFileUpload($event, key)" required />
            </div>

            <!-- Location Button -->
            <button type="button" @click="getLocation" :disabled="loading || locationLoading">
                {{ locationLoading ? 'Fetching Location...' : 'Get Current Location' }}
            </button>
            <p v-if="form.location" class="success">
                Location captured: {{ form.location.latitude }}, {{ form.location.longitude }}
            </p>

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
  components: {WaitingDriversNumber, Sidebar},
    data() {
        return {
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
                licenseImage: null,
                driver_licence_image: null,
                profile_image: null,
                national_front: null,
                national_back: null,
                national_selfie: null,
                location: null,
                walletType: ""
            },
            fileFields: {
                licenseImage: 'License Image',
                driver_licence_image: 'Driver License Image',
                profile_image: 'Profile Image',
                national_front: 'National ID Front',
                national_back: 'National ID Back',
                national_selfie: 'Selfie with National ID',
            },
            errorMessage: '',
            successMessage: '',
            loading: false,
            locationLoading: false,
        };
    },
    methods: {
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
                // Validate required fields
                const requiredFields = ['username', 'phoneNumber', 'email', 'password', 'location'];
                for (const field of requiredFields) {
                    if (!this.form[field]) {
                        throw new Error(`Please fill out ${field} field.`);
                    }
                }

                const formData = new FormData();
                Object.keys(this.form).forEach((key) => {
                    if (key === 'location') {
                        formData.append('latitude', this.form.location.latitude);
                        formData.append('longitude', this.form.location.longitude);
                    } else {
                        formData.append(key, this.form[key]);
                    }
                });

                console.log('Submitting form data:', this.form);

                const response = await axios.post('https://backend.fego-rides.com/authdriver/driversignup', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                this.successMessage = 'Signup successful! Welcome aboard.';
                console.log('Signup Response:', response.data);
            } catch (error) {
                console.error('Signup Error:', error);
                this.errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup.';
            } finally {
                this.loading = false;
            }
        },
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

input,
button {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
}

label {
    font-weight: bold;
    margin-top: 10px;
    display: block;
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
</style>
