<template>
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col-md-12">
                <input type="text" v-model="searchQuery" class="form-control" placeholder="Search trips..."
                    @input="filterTrips" />
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mb-4" v-for="trip in filteredTrips" :key="trip._id">
                <div class="card w-100">
                    <div class="card-body">
                        <h5 class="card-title">Trip ID: {{ trip._id }}</h5>
                        <p class="card-text"><strong>User ID:</strong> {{ trip.userId }}</p>
                        <p class="card-text"><strong>Location Name:</strong> {{ trip.locationName }}</p>
                        <p class="card-text"><strong>Distance:</strong> {{ trip.distance }} km</p>
                        <p class="card-text"><strong>Username:</strong> {{ trip.username }}</p>
                        <p class="card-text"><strong>Destination:</strong> {{ trip.destination }}</p>
                        <p class="card-text"><strong>Pickup Location:</strong> {{ trip.pickupLocation.coordinates }}</p>
                        <p class="card-text"><strong>Destination Location:</strong> {{
                            trip.destinationLocation.coordinates }}</p>
                        <p class="card-text"><strong>Vehicle Type:</strong> {{ trip.vehicleType }}</p>
                        <p class="card-text"><strong>Status:</strong> <span :class="statusClass(trip.status)">{{
                            trip.status }}</span></p>
                        <p class="card-text"><strong>Cost:</strong> {{ trip.cost }} EGP</p>
                        <p class="card-text"><strong>Date:</strong> {{ trip.date }}</p>

                        <div class="dropdown" v-if="trip.driverData">
                            <strong>Driver Data</strong>
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p>Id: {{ trip.driverData._id }}</p>
                                        <p>Name: {{ trip.driverData.username }}</p>
                                        <p>Email: {{ trip.driverData.email }}</p>
                                        <p>Phone Number: {{ trip.driverData.phoneNumber }}</p>
                                    </div>
                                    <div class="col-md-6 d-grid gap-2">
                                        <button class="btn btn-primary btn-sm"
                                            @click="openImageModal(trip.driverData.profile_image)">Profile
                                            Image</button>
                                        <button class="btn btn-primary btn-sm"
                                            @click="openImageModal(trip.driverData.licenseImage)">Car Licence
                                            Image</button>
                                        <button class="btn btn-primary btn-sm"
                                            @click="openImageModal(trip.driverData.driver_licence_image)">Driver Licence
                                            Image</button>
                                        <button class="btn btn-primary btn-sm"
                                            @click="openImageModal(trip.driverData.national_front)">National
                                            Front</button>
                                        <button class="btn btn-primary btn-sm"
                                            @click="openImageModal(trip.driverData.national_back)">National
                                            Back</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="driverDataNo" v-else>
                            <strong>Driver Data</strong>
                            <p>No Driver Data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for Image Display -->
        <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="imageModalLabel">Image Preview</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img :src="modalImageSrc" alt="Preview" class="img-fluid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import axios from 'axios';
import { Modal } from 'bootstrap';
export default {
    name: 'TripsComponent',
    data() {
        return {
            trips: [],
            searchQuery: '',
            filteredTrips: [],
            modalImageSrc: '' // Store the image source for the modal
        };
    },
    methods: {
        async getTrips() {
            try {
                const response = await axios.get('https://backend.fego-rides.com/admin/get-trips');
                this.trips = response.data;
                this.filteredTrips = this.trips;
                console.log(this.trips);
            } catch (error) {
                console.log(error);
            }
        },
        filterTrips() {
            const query = this.searchQuery.toLowerCase();
            this.filteredTrips = this.trips.filter(trip => {
                return Object.values(trip).some(value =>
                    value ? value.toString().toLowerCase().includes(query) : false
                );
            });
        },
        statusClass(status) {
            return {
                'text-success': status === 'end',
                'text-danger': status === 'cancelled',
                'text-warning': status === 'pending',
                'text-secondary': status === 'accepted'
            };
        },
        openImageModal(imageUrl) {
            this.modalImageSrc = imageUrl;
            const modalElement = document.getElementById('imageModal');
            const modal = new Modal(modalElement); // Use Modal directly
            modal.show();
        }


    },
    created() {
        this.getTrips();
    }
};
</script>

<style scoped>
.card {
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.modal-body img {
    max-height: 500px;
    object-fit: contain;
}
</style>
