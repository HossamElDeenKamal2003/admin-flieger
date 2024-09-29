<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12 mb-4" v-for="user in users" :key="user.driverId">
                <div class="card">
                    <div class="row no-gutters">
                        <!-- Image Column
                        <div class="col-md-4">
                            <img class="card-img-left" :src="user.profile_image" :alt="`Profile image of ${user.username}`">
                        </div> -->
                        <!-- Content Column -->
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title"><span style="color: blue">UserName : </span>{{ user.username }}</h5>
                                <!-- <p class="card-text"><span style="color: blue">National ID : </span>{{ user.id }}</p> -->
                                <p class="card-text"><span style="color: blue">Car Model : </span>{{ user.carModel }}</p>
                                <p class="card-text"><span style="color: blue">Vehicle Type : </span>{{ user.vehicleType }}</p>
                                <p class="card-text"><span style="color: blue">Car Color : </span>{{ user.carColor }}</p>
                                <p class="card-text"><span style="color: blue">Car Number : </span>{{ user.carNumber }}</p>
                                <p class="card-text" v-if="user.location">
                                    <span style="color: blue">Location : </span>
                                    Latitude: {{ user.location.coordinates[0] }}, 
                                    Longitude: {{ user.location.coordinates[1] }}
                                </p>
                            </div>
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
    name: "trackingDriver",
    data() {
        return {
            users: [],
        };
    },
    methods: {
        getTracking() {
            axios.get("http://localhost:3000/admin/get-location").then(response => {
                this.users = response.data;
            }).catch(error => {
                console.log(error);
                alert(error.message);
            });
        },
        redirectToImage(imageUrl) {
            window.open(imageUrl, '_blank');
        }
    },
    created() {
        this.getTracking();
    }
};
</script>
