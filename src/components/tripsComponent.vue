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
                        <div class="dropdown">
                            <p class="card-text"><strong>Driver Data</strong> {{ trip.driverData }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'TripsComponent',
    data() {
        return {
            trips: [],
            searchQuery: '',
            filteredTrips: []
        };
    },
    methods: {
        async getTrips() {
            try {
                const response = await axios.get('http://localhost:3000/admin/get-trips');
                this.trips = response.data;
                this.filteredTrips = this.trips;
                console.log(this.trips.driverData);
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
</style>
