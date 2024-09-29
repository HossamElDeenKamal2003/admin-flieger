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
    },
    methods: {
        async fetchPrices() {
            try {
                const response = await axios.get('http://localhost:3000/prices/level1/getprices');
                this.prices = response.data;
            } catch (error) {
                console.error('Error fetching prices:', error);
            }
        },
        async handleSubmit() {
            if (this.editMode) {
                try {
                    const response = await axios.patch('http://localhost:3000/prices/level1/updateprices', this.form);
                    alert(response.data.message);
                    this.fetchPrices();
                } catch (error) {
                    console.error('Error updating price:', error);
                }
            } else {
                try {
                    const response = await axios.post('http://localhost:3000/prices/level1/putprices', this.form);
                    alert(response.data.message);
                    const response2 = await axios.get('http://localhost:3000/prices/level1/getprices');
                    this.prices = response2.data;
                } catch (error) {
                    console.error('Error adding price:', error);
                }
            }
            this.resetForm();
        },
        async getProperity() {
            try {
                const response = await axios.get('http://localhost:3000/admin/get-properties');
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
                axios.post('http://localhost:3000/prices/delete/level1', {
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
                axios.post('http://localhost:3000/prices/delete/level2', {
                    country: country
                }).then(() => {
                    alert('deleted')
                })
            }
        },
        async updateDistance() {
            try {
                const response = await axios.patch('http://localhost:3000/book/max-distance', { maxDistance: this.maxDistance });
                alert(response.data.message);
                this.fetchMaxDistance();
            } catch (error) {
                console.error('Error updating max distance:', error);
            }
        },
        async fetchMaxDistance() {
            try {
                const response = await axios.get('http://localhost:3000/book/get-distance-find-drivers');
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
