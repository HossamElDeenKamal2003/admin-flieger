<template>
    <div class="container">
        <div class="row">
            <div class="col-md-12 mb-4" v-for="user in users" :key="user._id">
                <div class="card">
                    <div class="row no-gutters">
                        <!-- Image Column -->
                        <div class="col-md-4">
                            <img class="card-img-left" :src="user.profile_image" :alt="`Profile image of ${user.username}`">
                        </div>
                        <!-- Content Column -->
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title"><span style="color: blue">UserName : </span>{{ user.username }}</h5>
                                <p class="card-text"><span style="color: blue">Email : </span>{{ user.email }}</p>
                                <p class="card-text"><span style="color: blue">Phone Number : </span>{{ user.phoneNumber }}</p>
                                <p class="card-text"><span style="color: blue">National ID : </span>{{ user.id }}</p>
                                <p class="card-text"><span style="color: blue">Rate : </span>{{ user.rate }}</p>
                                <p class="card-text"><span style="color: blue">Total Ratings : </span>{{ user.totalRatings }}</p>
                                <p class="card-text"><span style="color: blue">Car Model : </span>{{ user.carModel }}</p>
                                <p class="card-text"><span style="color: blue">Vehicle Type : </span>{{ user.vehicleType }}</p>
                                <p class="card-text"><span style="color: blue">Car Color : </span>{{ user.carColor }}</p>
                                <p class="card-text"><span style="color: blue">Car Number : </span>{{ user.carNumber }}</p>
                                <div class="alert">
                                    <span class="text-danger" style="font-size: 2em;">{{ user.alerts }}</span>
                                    <button class="btn btn-sm" @click="increase(user._id)">+</button>
                                </div>
                                <div class="buttons">
                                    <button class="btn btn-sm" 
                                            :class="{'btn-primary': user.block, 'btn-danger': !user.block}"
                                            @click="toggleBlock(user._id, user.block)">
                                        {{ user.block ? 'Block' : 'UnBlock' }}
                                    </button>
                                    <button class="btn btn-danger btn-sm" @click="deleteUser(user._id)">Delete</button>
                                    <button class="btn btn-info btn-sm" @click="redirectToImage(user.profile_image)">View Image</button>
                                </div>
                                <div class="images">
                                    <button class="btn btn-info btn-sm" @click="redirectToImage(user.licenseImage)">Car Licence</button>
                                    <button class="btn btn-info btn-sm" @click="redirectToImage(user.driver_licence_image)">Driver Licence</button>
                                </div>
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
//import { filter } from 'core-js/core/array';

export default {
    name: "driverPanel",
    data() {
        return {
            users: [],
            location: [],
            driversLocation: [],
            socket: null,
        };
    },
    methods: {
        async increase(id) {
        try {
            const response = await axios.patch(`http://localhost:3000/admin/increase/${id}`);
            const updatedUser = response.data;

            if (this.drivers && Array.isArray(this.drivers)) {
                const userIndex = this.drivers.findIndex(user => user._id === id);
                
                if (userIndex !== -1) { // Check if the user was found
                    this.drivers[userIndex] = updatedUser;
                }

                alert('Value increased successfully.');
            }
        } catch (error) {
            console.error(error);
            alert("Error occurred while increasing the value.");
        }
    },

        redirectToImage(imageUrl) {
            window.location.href = imageUrl;
        },

        async deleteUser(id) {
            try {
                const response = await axios.delete(`http://localhost:3000/authdriver/delete-user/${id}`);
                if (response.status === 200) {
                    alert(response.data.message);
                    this.users = this.users.filter(user => user._id !== id);
                }
            } catch (error) {
                console.error(error);
                alert("Error occurred while deleting user.");
            }
        },

        async toggleBlock(userId, currentBlockStatus) {
            try {
                const newBlockStatus = !currentBlockStatus;
                const response = await axios.patch(`http://localhost:3000/authdriver/patch-block/${userId}`, {
                    block: newBlockStatus
                });

                const updatedUser = response.data;
                const userIndex = this.users.findIndex(user => user._id === userId);
                if (userIndex !== -1) {
                    this.users[userIndex] = updatedUser;
                }

                alert(`User ${newBlockStatus ? 'unblocked' : 'blocked'} successfully.`);
            } catch (error) {
                console.error(error);
                alert("Error occurred while updating block status.");
            }
        },

        async getUsers() {
            try {
                const response = await axios.get('http://localhost:3000/admin/get-drivers');
                this.users = response.data;
                console.log(this.users);
            } catch (error) {
                console.error(error);
                alert("Error occurred while fetching users.");
            }
        },

        async getLocations() {
            try {
                const response = await axios.get("http://localhost:3000/admin/get-location");
                this.location = response.data;
                console.log(this.location);
            } catch (error) {
                console.log(error);
            }
        },

        showLocation() {
            this.users.forEach(user => {
                const driverLocation = this.location.find(location => location.driverId === user._id);
                if (driverLocation) {
                    this.driversLocation.push(driverLocation);
                } else {
                    console.log(`Location not available for user: ${user.username}`);
                }
            });
            console.log("Driver locations:", this.driversLocation);
        }
    },
    async created() {
        await this.getUsers();
        await this.getLocations();
        this.showLocation();
    },
};
</script>




<style scoped>
body {
    background-color: rgb(114, 89, 170);
}

.card {
    border: 2px rgb(114, 89, 170) solid;
    overflow: hidden;
}

.card-img-left {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.card-body {
    padding: 1rem;
}

.alert {
    display: flex;
    justify-content: center;
}

.buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
}

.images {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

/* Make <span> elements bold within card content */
.card-body span {
    font-weight: bold;
    color: blue; /* Apply text color if needed */
    font-size: 1.5em;
}

h5 span {
    font-weight: bold;
    color: blue; /* Apply text color if needed */
}
</style>

