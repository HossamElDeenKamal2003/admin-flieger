<template>
    <div>
        <h1 class="text-center">Level Three</h1>
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
                <label for="compfort" class="form-label">Compfort</label>
                <input type="number" id="compfort" v-model="form.compfort" class="form-control"
                    placeholder="Enter Compfort" required />
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
                    <th>Compfort</th>
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
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: "leve3Component",
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
            prices: [],
            editMode: false,
        }
    },
    created() {
        this.fetchPrices();
    },
    methods: {
        async fetchPrices() {
            try {
                const response = await axios.get('http://localhost:3000/prices/level3/getprices');
                this.prices = response.data;
                console.log(this.prices);
            } catch (error) {
                console.error('Error fetching prices:', error);
            }
        },
        async handleSubmit() {
            if (this.editMode) {
                try {
                    const response = await axios.patch('http://localhost:3000/prices/level3/updateprices', this.form);
                    alert(response.data.message);
                    this.fetchPrices();
                } catch (error) {
                    console.error('Error updating price:', error);
                }
            } else {
                try {
                    const response = await axios.post('http://localhost:3000/prices/level3/putprices', this.form);
                    alert(response.data.message);
                    this.fetchPrices();
                } catch (error) {
                    console.error('Error adding price:', error);
                }
            }
            this.resetForm();
        },
        resetForm() {
            this.form = {
                country: '',
                priceCar: '',
                motorocycle: '',
                priceVan: '',
                penfits: '',
                compfort: '',
                maxDistance: '',
            };
            this.editMode = false;
        },
        editPrice(price) {
            this.form = { ...price };
            this.editMode = true;
        },
        deletePrice(country) {
            console.log(country);
            if (confirm(`Are you sure you want to delete prices for ${country}?`)) {
                // Optimistically update the prices array
                this.prices = this.prices.filter(price => price.country !== country);

                // Then make the request to delete the price
                axios.post('http://localhost:3000/prices/delete/level3', {
                    country: country
                }).then(() => {
                    this.fetchPrices();
                }).catch(error => {
                    console.error('Error deleting price:', error);
                    alert(error.response?.data?.error || 'Error deleting price');
                    // Revert the optimistic update if there's an error
                    this.fetchPrices();
                });
            }
        },
    }
}
</script>
