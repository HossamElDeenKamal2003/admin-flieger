<template>
    <div class="container mt-5">
        <h1 class="text-center">Settings: Manage Prices</h1>
        <h1 class="text-center">level one</h1>
        <!-- Form to add or update prices -->
        <form @submit.prevent="handleSubmit" class="my-4">
            <div class="mb-3">
                <label for="country" class="form-label">Country</label>
                <input type="text" id="country" v-model="form.country" class="form-control" placeholder="Enter Country"
                    required />
            </div>
            <div class="mb-3">
                <label for="priceCar" class="form-label">Car Price</label>
                <input type="number" id="priceCar" v-model="form.priceCar" class="form-control"
                    placeholder="Enter Car Price" required />
            </div>
            <div class="mb-3">
                <label for="motorocycle" class="form-label">Motorcycle Price</label>
                <input type="number" id="motorocycle" v-model="form.motorocycle" class="form-control"
                    placeholder="Enter Motorcycle Price" required />
            </div>
            <div class="mb-3">
                <label for="priceVan" class="form-label">Van Price</label>
                <input type="number" id="priceVan" v-model="form.priceVan" class="form-control"
                    placeholder="Enter Van Price" required />
            </div>
            <div class="mb-3">
                <label for="penfits" class="form-label">Penfits</label>
                <input type="number" id="penfits" v-model="form.penfits" class="form-control"
                    placeholder="Enter Penfits" required />
            </div>
            <div class="mb-3">
                <label for="comfort" class="form-label">Comfort</label>
                <input type="number" id="comfort" v-model="form.compfort" class="form-control"
                    placeholder="Enter Comfort" required />
            </div>
            <button type="submit" class="btn btn-primary">{{ editMode ? "Update Price" : "Add Price" }}</button>
        </form>

        <!-- Display price list -->
        <h3 class="text-center">Current Prices</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Car Price</th>
                    <th>Motorcycle Price</th>
                    <th>Van Price</th>
                    <th>Penfits</th>
                    <th>Comfort</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="price in prices" :key="price._id">
                    <td>{{ price.country }}</td>
                    <td>{{ price.priceCar }}</td>
                    <td>{{ price.motorocycle }}</td>
                    <td>{{ price.priceVan }}</td>
                    <td>{{ price.penfits }}</td>
                    <td>{{ price.compfort }}</td>
                    <td>
                        <button @click="editPrice(price)" class="btn btn-warning btn-sm">Edit</button>
                        <button @click="deletePrice(price.country)" class="btn btn-danger btn-sm">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <leve2Component />
        <leve3Component />
        <leve4Component />
        <h3 class="text-center">Manage Properties (Time & Distance)</h3>
        <form @submit.prevent="updateProperty">
            <div class="mb-3">
                <label for="time" class="form-label">Time</label>
                <input type="number" id="time" v-model="propertyForm.time" class="form-control" placeholder="Enter Time"
                    required />
            </div>
            <div class="mb-3">
                <label for="distance" class="form-label">Distance</label>
                <input type="number" id="distance" v-model="propertyForm.distance" class="form-control"
                    placeholder="Enter Distance" required />
            </div>
            <button type="submit" class="btn btn-primary">Update Property</button>
        </form>

        <!-- Display current property details -->
        <h3 class="text-center">Current Properties</h3>
        <p>Time: {{ currentProperty.time }}</p>
        <p>Distance: {{ currentProperty.distance }}</p>
        <h3 class="text-center">Manage Maximum Distance</h3>
        <form @submit.prevent="updateDistance">
            <div class="mb-3">
                <label for="maxDistance" class="form-label">Max Distance</label>
                <input type="number" id="maxDistance" v-model="maxDistance" class="form-control"
                    placeholder="Enter Max Distance" required />
            </div>
            <button type="submit" class="btn btn-primary">Update Max Distance</button>
        </form>
        <!-- Display current max distance -->
        <h3 class="text-center">Current Max Distance</h3>
        <p>Max Distance: {{ currentMaxDistance }}</p>

        <h1 class="text-center">Subscription</h1>
        <form @submit.prevent="updateSub">
            <div class="mb-3">
                <label for="sub" class="form-label">Subscription</label>
                <input type="number" id="sub" v-model="subs.sub" class="form-control"
                    placeholder="Enter New Subscription" required />
            </div>
            <div class="mb-3">
                <label for="profit" class="form-label">Profit</label>
                <input type="number" id="profit" v-model="subs.profit" class="form-control"
                    placeholder="Enter New Profit" required />
            </div>
            <button type="submit" class="btn btn-primary">Add</button>
        </form>
        <!-- Display current max distance -->
        <h3 class="text-center">Current Sub</h3>
        <p>Subscription : {{ sub }}</p>
        <p>Profit : {{ profit }}</p>

        <h2>Current Distance In Trip</h2>
        <form @submit.prevent="updatedistanceintrip">
            <div class="mb-3">
                <input type="number" id="sub" v-model="this.distance_in_trip" class="form-control"
                    placeholder="Enter New Subscription" required />
            </div>
           <p>{{ this.current_distance_in_trip }}</p>
            <button type="submit" class="btn btn-primary">Update</button>
        </form>
        <!-- Display current max distance -->
    </div>
</template>

<script>
import axios from 'axios';
import leve2Component from "./levels/level2omponent";
import leve3Component from "./levels/level3component.vue";
import leve4Component from "./levels/level4Component.vue";
export default {
    data() {
        return {
            form: {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                penfits: '',
                compfort: '',
                maxDistance: '',
            },
            form2: {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                penfits: '',
                compfort: '',
                maxDistance: '',
            },
            form3: {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                penfits: '',
                compfort: '',
                maxDistance: '',
            },
            form4: {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                penfits: '',
                compfort: '',
                maxDistance: '',
            },
            propertyForm: {
                time: '',
                distance: '',
            },
            currentProperty: {},
            prices: [],
            prices2: [],
            prices3: [],
            prices4: [],
            editMode: false,
            maxDistance: '', // Field for max distance
            currentMaxDistance: '', // Holds the current max distance value
            sub: 0,
            profit: 0,
            subs: {
                newSub: 0,
                profit: 0
            },
            distance_in_trip: 0,
            current_distance_in_trip: 0
        };
    },
    components:{
        leve2Component,
        leve3Component,
        leve4Component
    },
    created() {
        this.fetchPrices();
        this.getProperity();
        this.fetchMaxDistance();
        this.fetchSub();
        this.getDistance_inTrip();
    },
    methods: {

        async getDistance_inTrip(){
            axios.get('https://backend.fego-rides.com/admin/get-des').then(response=>{
                this.current_distance_in_trip = response.data.distances[0].distance;
            }).catch(()=>{
                alert('Error Fetching Distance In Trip');
            })
        },

        async updatedistanceintrip(){
            axios.patch('https://backend.fego-rides.com/admin/update-dis',{
                distance: this.distance_in_trip
            }).then(response=>{
                if(response.status === 200){
                    console.log(response.data)
                    alert('Distance Updated Successfully');
                    this.getDistance_inTrip();
                }
            }).catch(()=>{
                alert('Error When Updating Distance');
            })
        },

        async updateSub(){
            try{
                axios.patch("https://backend.fego-rides.com/admin/update-subscription", {
                    subScription: this.subs.sub,
                    profit: this.subs.profit
                }).then((response)=>{
                    if(response.status === 200){
                        alert("Added Subscription Successfully");
                        this.sub = this.subs.sub;
                        this.profit = this.subs.profit
                    }else{
                        alert("Error While Adding Subscription");
                    }
                }).catch(error=>{
                    console.log(error);
                    alert(error.message);
                })
            }
            catch(error){
                console.log(error.data.message);
            }
        },
        async fetchSub(){
            try{
                const response = await axios.get('https://backend.fego-rides.com/admin/get-sub');
                this.sub = response.data.sub.subScription;
                this.profit = response.data.sub.profit;
            }
            catch(error){
                console.log(error);
            }
        },
        async fetchPrices() {
            try {
                const response = await axios.get('https://backend.fego-rides.com/prices/level1/getprices');
                this.prices = response.data;
            } catch (error) {
                console.error('Error fetching prices:', error);
            }
        },
        async handleSubmit() {
            if (this.editMode) {
                try {
                    const response = await axios.patch('https://backend.fego-rides.com/prices/level1/updateprices', this.form);
                    alert(response.data.message);
                    this.fetchPrices();
                } catch (error) {
                    console.error('Error updating price:', error);
                }
            } else {
                try {
                    const response = await axios.post('https://backend.fego-rides.com/prices/level1/putprices', this.form);
                    alert(response.data.message);
                    const response2 = await axios.get('https://backend.fego-rides.com/prices/level1/getprices');
                    this.prices = response2.data;
                } catch (error) {
                    console.error('Error adding price:', error);
                }
            }
            this.resetForm();
        },
        async getProperity() {
            try {
                const response = await axios.get('https://backend.fego-rides.com/admin/get-properties');
                this.currentProperty = response.data;
            } catch (error) {
                console.error('Error fetching property:', error);
            }
        },
        deletePrice(country) {
            console.log(country);
            if (confirm(`Are you sure you want to delete prices for ${country}?`)) {
                // Optimistically update the prices array
                this.prices = this.prices.filter(price => price.country !== country);

                // Then make the request to delete the price
                axios.post('https://backend.fego-rides.com/prices/delete/level1', {
                    country: country
                }).then(() => {
                    this.fetchPrices();
                }).catch(error => {
                    console.log(error);
                    alert(error.response?.data?.error || 'Error deleting price');
                    // Revert the optimistic update if there's an error
                    this.fetchPrices();
                });
            }
        },
        deletePrice2(country) {
            console.log(country);
            if (confirm(`Are you sure you want to delete prices for ${country}?`)) {
                axios.post('https://backend.fego-rides.com/prices/delete/level2', {
                    country: country
                }).then(() => {
                    alert('deleted')
                })
            }
        },
        async updateDistance() {
            try {
                const response = await axios.patch('https://backend.fego-rides.com/book/max-distance', { maxDistance: this.maxDistance });
                alert(response.data.message);
                this.fetchMaxDistance();
            } catch (error) {
                console.error('Error updating max distance:', error);
            }
        },
        async fetchMaxDistance() {
            try {
                const response = await axios.get('https://backend.fego-rides.com/book/get-distance-find-drivers');
                this.currentMaxDistance = response.data.message.maxDistance;
            } catch (error) {
                console.error('Error fetching max distance:', error);
            }
        },
        editPrice(price) {
            this.form = { ...price };
            this.editMode = true;
        },
        editPrice2(price) {
            this.form = { ...price };
            this.editMode = true;
        },
        resetForm() {
            this.form = {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                maxDistance: '',
            };
            this.editMode = false;
        },
    },
};
</script>

<style scoped>
.container {
    max-width: 800px;
}

tr {
    text-align: center;
}

td {
    text-align: center;
}
</style>
