<template>
  <div class="map-container">
    <!-- Driver Data Card -->
    <div class="driver-card-container">
      <div v-if="isLoadingDriverData" class="loader">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات السائق...</p>
      </div>
      <div v-else-if="driverData" class="driver-card">
        <h3>معلومات السائق</h3>
        <p><strong>الاسم:</strong> {{ driverData.username || 'غير متوفر' }}</p>
        <p><strong>رقم الهاتف:</strong> {{ driverData.phoneNumber || 'غير متوفر' }}</p>
        <p v-if="driverData.carNumber">
          <strong>رقم السيارة:</strong> {{ driverData.carNumber || 'غير متوفر' }}
        </p>
        <p v-if="driverData.vehicleCategory">
          <strong>فئة السيارة:</strong> {{ driverData.vehicleCategory || 'غير متوفر' }}
        </p>
        <p v-if="driverData.vehicleSubCategory">
          <strong>نوع السيارة:</strong> {{ driverData.vehicleSubCategory || 'غير متوفر' }}
        </p>
        <p v-else><strong>السيارة:</strong> غير متوفر</p>
      </div>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div ref="map" class="map"></div>
  </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import polyline from '@mapbox/polyline';
import io from 'socket.io-client';
import axios from 'axios';

export default {
  name: 'ShareTripMap',
  data() {
    return {
      map: null,
      error: '',
      googleMap: null,
      carMarker: null,
      startMarker: null,
      endMarker: null,
      socket: null,
      tripId: '',
      driverId: '',
      google: null,
      plannedPolyline: null,
      actualPolyline: null,
      walkedPolyline: null, // New polyline for walked path
      driverPath: [],
      walkedPath: [], // New array to store walked coordinates
      plannedPath: [],
      driverData: null,
      isLoadingDriverData: false,
      lastVisitedIndex: 0,
      isTripComplete: false,
    };
  },
  methods: {
    async initMap() {
      try {
        const loader = new Loader({
          apiKey: 'AIzaSyA_iAzagkzd23lbgSdUVJemZO77vdWJ-aM',
          version: 'weekly',
          libraries: ['geometry'],
        });

        this.google = await loader.load();
        if (!this.google || !this.google.maps) {
          throw new Error('Google Maps API failed to load');
        }

        this.googleMap = new this.google.maps.Map(this.$refs.map, {
          center: { lat: 30.0444, lng: 31.2357 },
          zoom: 15,
          disableDefaultUI: false,
        });

        console.log('Google Maps initialized successfully');
      } catch (err) {
        this.error = 'فشل تحميل الخريطة. تحقق من اتصالك بالإنترنت أو مفتاح API.';
        console.error('Map initialization error:', err);
      }
    },
    async fetchTrip() {
      try {
        console.log('Fetching trip for tripId:', this.tripId);
        const response = await fetch(`https://backend.fego-rides.com/book/getTripbyId/${this.tripId}`);
        if (!response.ok) throw new Error(`فشل جلب بيانات الرحلة: ${response.statusText}`);
        const data = await response.json();
        console.log('Trip data:', data);

        if (data.trip) {
          this.lastVisitedIndex = 0;
          if (data.trip.encodedPolyline) {
            try {
              this.drawPlannedPolyline(data.trip.encodedPolyline);
            } catch (err) {
              console.error('Polyline decoding failed:', err);
              this.error = 'فشل رسم المسار بسبب بيانات غير صالحة';
            }
          } else {
            console.warn('No encodedPolyline in response:', data);
            this.error = 'بيانات المسار غير متاحة';
          }

          if (data.trip.pickupLocation && data.trip.destinationLocation) {
            const [startLng, startLat] = data.trip.pickupLocation.coordinates;
            const [endLng, endLat] = data.trip.destinationLocation.coordinates;

            if (!data.trip.encodedPolyline || this.error.includes('فشل رسم المسار')) {
              this.drawFallbackPlannedPolyline(startLat, startLng, endLat, endLng);
            }

            this.startMarker = new this.google.maps.Marker({
              map: this.googleMap,
              position: { lat: startLat, lng: startLng },
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              },
              title: 'Pickup Location: ' + (data.trip.pickupLocationName || 'Start'),
            });
            console.log('Start marker added at:', { lat: startLat, lng: startLng });

            this.endMarker = new this.google.maps.Marker({
              map: this.googleMap,
              position: { lat: endLat, lng: endLng },
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
              title: 'Destination: ' + (data.trip.destination || 'End'),
            });
            console.log('End marker added at:', { lat: endLat, lng: endLng });

            const bounds = new this.google.maps.LatLngBounds();
            bounds.extend({ lat: startLat, lng: startLng });
            bounds.extend({ lat: endLat, lng: endLng });

            let driverLat, driverLng;
            if (data.trip.driverLocation && data.trip.driverLocation.coordinates) {
              [driverLng, driverLat] = data.trip.driverLocation.coordinates;
              if (typeof driverLat === 'number' && typeof driverLng === 'number' && !isNaN(driverLat) && !isNaN(driverLng)) {
                console.log('Initial driver location set:', { lat: driverLat, lng: driverLng });
                bounds.extend({ lat: driverLat, lng: driverLng });
              } else {
                console.warn('Invalid driver coordinates:', data.trip.driverLocation.coordinates);
                driverLat = startLat;
                driverLng = startLng;
              }
            } else {
              console.warn('Driver location not available, using pickup location as fallback');
              driverLat = startLat;
              driverLng = startLng;
            }

            this.updateCarMarker(driverLat, driverLng);
            if (this.isPositionOnRoute(driverLat, driverLng)) {
              this.driverPath.push({ lat: driverLat, lng: driverLng });
              this.walkedPath.push({ lat: driverLat, lng: driverLng }); // Add to walked path
            } else {
              console.warn('Initial driver position is off-route, not adding to driverPath:', { lat: driverLat, lng: driverLng });
            }
            this.updateActualRoute();
            this.googleMap.fitBounds(bounds);
          } else {
            console.warn('Pickup or destination location missing:', data.trip);
            this.error = 'بيانات المواقع غير متاحة';
          }
        } else {
          this.error = 'بيانات الرحلة غير متاحة';
          console.warn('No trip data in response:', data);
        }
      } catch (err) {
        this.error = 'خطأ في جلب بيانات الرحلة';
        console.error('Fetch trip error:', err);
      }
    },
    drawPlannedPolyline(encoded) {
      if (!this.google || !this.googleMap) {
        this.error = 'الخريطة غير جاهزة';
        return;
      }
      this.plannedPath = polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
      if (this.plannedPath.length === 0) {
        this.error = 'فشل رسم المسار: المسار فارغ';
        console.warn('Empty path after decoding:', encoded);
        return;
      }
      this.lastVisitedIndex = 0;
      this.updatePlannedPolyline(this.plannedPath);
      console.log('Planned polyline initialized with path:', this.plannedPath);
    },
    drawFallbackPlannedPolyline(startLat, startLng, endLat, endLng) {
      if (!this.google || !this.googleMap) {
        this.error = 'الخريطة غير جاهزة';
        return;
      }
      this.plannedPath = [
        { lat: startLat, lng: startLng },
        { lat: endLat, lng: endLng },
      ];
      this.lastVisitedIndex = 0;
      this.updatePlannedPolyline(this.plannedPath);
      console.log('Fallback planned polyline drawn between:', this.plannedPath);
    },
    updatePlannedPolyline(path) {
      if (this.plannedPolyline) {
        this.plannedPolyline.setMap(null);
      }
      this.plannedPolyline = new this.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#6b5b95',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: this.googleMap,
      });
      console.log('Planned polyline updated with path:', path);
    },
    isPositionOnRoute(lat, lng) {
      if (!this.plannedPath.length || this.plannedPath.length < 2) return false;

      const position = new this.google.maps.LatLng(lat, lng);
      let minDistance = Number.MAX_VALUE;

      // Check perpendicular distance to each segment of the planned route
      for (let i = 0; i < this.plannedPath.length - 1; i++) {
        const start = new this.google.maps.LatLng(this.plannedPath[i].lat, this.plannedPath[i].lng);
        const end = new this.google.maps.LatLng(this.plannedPath[i + 1].lat, this.plannedPath[i + 1].lng);

        // Approximate perpendicular distance
        const distance = this.google.maps.geometry.spherical.computeDistanceBetween(position,
            this.google.maps.geometry.spherical.interpolate(start, end,
                this.google.maps.geometry.spherical.computeHeading(start, end, position)));

        minDistance = Math.min(minDistance, distance);
      }

      const DISTANCE_THRESHOLD = 20; // meters
      return minDistance <= DISTANCE_THRESHOLD;
    },
    updateActualRoute() {
      if (!this.google || !this.googleMap) {
        this.error = 'الخريطة غير جاهزة';
        return;
      }
      if (this.driverPath.length < 1) return;

      if (this.actualPolyline) {
        this.actualPolyline.setMap(null);
      }
      this.actualPolyline = new this.google.maps.Polyline({
        path: this.driverPath,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: this.googleMap,
      });
      console.log('Actual route updated with path:', this.driverPath);

      // Draw the walked path in grey
      if (this.walkedPolyline) {
        this.walkedPolyline.setMap(null);
      }
      if (this.walkedPath.length > 0) {
        this.walkedPolyline = new this.google.maps.Polyline({
          path: this.walkedPath,
          geodesic: true,
          strokeColor: '#808080', // Grey color for walked path
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map: this.googleMap,
        });
        console.log('Walked path updated with path:', this.walkedPath);
      }

      // Check if the driver is near the destination
      const currentPosition = this.driverPath[this.driverPath.length - 1];
      const destinationPosition = this.endMarker.getPosition();
      const distanceToDestination = this.google.maps.geometry.spherical.computeDistanceBetween(
          new this.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
          destinationPosition
      );
      const NEAR_DESTINATION_THRESHOLD = 50; // meters
      if (distanceToDestination < NEAR_DESTINATION_THRESHOLD) {
        this.isTripComplete = true;
        console.log('Driver has reached the destination');
      }

      if (!this.isTripComplete) {
        const remainingPath = this.calculateRemainingPath();
        console.log('Remaining planned path:', remainingPath);
        if (remainingPath.length === 0) {
          console.warn('Remaining path is empty, showing full planned path as fallback');
          this.updatePlannedPolyline(this.plannedPath);
        } else {
          this.updatePlannedPolyline(remainingPath);
        }
      } else {
        this.updatePlannedPolyline([]);
      }
    },
    calculateRemainingPath() {
      if (!this.plannedPath.length || !this.driverPath.length) {
        console.log('Planned or driver path is empty, returning full planned path');
        return this.plannedPath;
      }

      const currentPosition = this.driverPath[this.driverPath.length - 1];
      let closestIndex = this.lastVisitedIndex;
      let minDistance = Number.MAX_VALUE;

      for (let i = this.lastVisitedIndex; i < this.plannedPath.length; i++) {
        const distance = this.google.maps.geometry.spherical.computeDistanceBetween(
            new this.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
            new this.google.maps.LatLng(this.plannedPath[i].lat, this.plannedPath[i].lng)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      const DISTANCE_THRESHOLD = 20; // meters
      if (minDistance > DISTANCE_THRESHOLD) {
        console.warn('Driver is too far from the planned path:', minDistance);
        return this.plannedPath.slice(this.lastVisitedIndex);
      }

      this.lastVisitedIndex = closestIndex;
      const remainingPath = this.plannedPath.slice(closestIndex);
      console.log('Calculated remaining path:', remainingPath);
      return remainingPath;
    },
    async refreshPlannedRoute() {
      try {
        console.log('Refreshing planned route for tripId:', this.tripId);
        const response = await fetch(`https://backend.fego-rides.com/book/getTripbyId/${this.tripId}`);
        if (!response.ok) throw new Error(`فشل جلب المسار الجديد: ${response.statusText}`);
        const data = await response.json();
        if (data.trip && data.trip.encodedPolyline) {
          this.drawPlannedPolyline(data.trip.encodedPolyline);
          console.log('Planned route refreshed with new polyline');
        } else {
          console.warn('No new encodedPolyline in response:', data);
        }
      } catch (err) {
        console.error('Refresh planned route error:', err);
        this.error = 'خطأ في تحديث المسار';
      }
    },
    setupWebSocket() {
      try {
        this.socket = io('https://backend.fego-rides.com', {
          transports: ['websocket'],
          query: { driverId: this.driverId },
        });

        this.socket.on('connect', () => {
          console.log('Socket.IO connected for driverId:', this.driverId);
          this.error = '';
        });

        this.socket.on(`location-updated/${this.driverId}`, (data) => {
          try {
            console.log('Received location update:', data);
            if (data.location && data.location.coordinates) {
              const [lng, lat] = data.location.coordinates;
              if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                this.updateCarMarker(lat, lng);
                if (this.isPositionOnRoute(lat, lng)) {
                  this.driverPath.push({ lat, lng });
                  this.walkedPath.push({ lat, lng }); // Add to walked path
                  this.updateActualRoute();
                  console.log(`Updated marker and route for driver ${this.driverId} to:`, { lat, lng });
                } else {
                  console.warn('Driver position is off-route, not adding to driverPath:', { lat, lng });
                }
              } else {
                console.warn('Invalid coordinates received:', data.location.coordinates);
              }
            } else {
              console.warn('Invalid location data received:', data);
            }
          } catch (err) {
            console.error('Socket.IO message error:', err);
          }
        });

        this.socket.on(`route-updated/${this.tripId}`, (data) => {
          try {
            console.log('Received route update for tripId:', this.tripId, data);
            if (data.encodedPolyline) {
              this.drawPlannedPolyline(data.encodedPolyline);
              console.log('Planned route updated via Socket.IO');
            } else {
              this.refreshPlannedRoute();
            }
          } catch (err) {
            console.error('Route update error:', err);
            this.error = 'خطأ في تحديث المسار';
          }
        });

        this.socket.on('connect_error', (err) => {
          this.error = 'خطأ في الاتصال بالسوكيت';
          console.error('Socket.IO connect error:', err.message, err);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket.IO disconnected');
          setTimeout(() => this.setupWebSocket(), 5000);
        });

        this.socket.on('any', (event, data) => {
          console.log('Received Socket.IO event:', event, data);
        });
      } catch (err) {
        this.error = 'فشل إعداد السوكيت';
        console.error('Socket.IO setup error:', err);
      }
    },
    async getDriverdata() {
      try {
        this.isLoadingDriverData = true;
        console.log('Fetching driver data for driverId:', this.driverId);
        const response = await axios.get(`https://backend.fego-rides.com/authdriver/driver/${this.driverId}`);
        this.driverData = response.data.driver;
        console.log('Driver data fetched:', this.driverData);
      } catch (err) {
        this.error = 'خطأ في جلب بيانات السائق';
        console.error('Get driver data error:', err);
      } finally {
        this.isLoadingDriverData = false;
      }
    },
    updateCarMarker(lat, lng) {
      if (!this.google || !this.googleMap) {
        this.error = 'الخريطة غير جاهزة';
        return;
      }
      try {
        if (!this.carMarker) {
          this.carMarker = new this.google.maps.Marker({
            map: this.googleMap,
            position: { lat, lng },
            icon: {
              url: 'https://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
            },
            title: 'Driver Location',
          });
          console.log('Car marker created at:', { lat, lng });
        } else {
          this.carMarker.setPosition({ lat, lng });
          console.log('Car marker updated to:', { lat, lng });
        }
        this.googleMap.panTo({ lat, lng });
      } catch (err) {
        console.error('Update marker error:', err);
      }
    },
  },
  async mounted() {
    this.tripId = this.$route.params.tripId;
    this.driverId = this.$route.params.driverId;

    if (!this.tripId || !this.driverId) {
      this.error = 'معرف الرحلة أو السائق مفقود';
      console.error('Missing tripId or driverId:', { tripId: this.tripId, driverId: this.driverId });
      return;
    }

    await this.initMap();
    if (this.googleMap && this.google) {
      await this.fetchTrip();
      await this.getDriverdata();
      this.setupWebSocket();
    } else {
      this.error = 'فشل تهيئة الخريطة';
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.carMarker) this.carMarker.setMap(null);
    if (this.startMarker) this.startMarker.setMap(null);
    if (this.endMarker) this.endMarker.setMap(null);
    if (this.plannedPolyline) this.plannedPolyline.setMap(null);
    if (this.actualPolyline) this.actualPolyline.setMap(null);
    if (this.walkedPolyline) this.walkedPolyline.setMap(null); // Clean up walked polyline
    this.carMarker = null;
    this.startMarker = null;
    this.endMarker = null;
    this.plannedPolyline = null;
    this.actualPolyline = null;
    this.walkedPolyline = null;
    this.googleMap = null;
    this.google = null;
    this.driverData = null;
    this.isLoadingDriverData = false;
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.map {
  height: 100%;
  width: 100%;
}

.driver-card-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  max-width: 320px;
  width: 90%;
}

.driver-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.driver-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.driver-card h3 {
  margin: 0 0 15px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #6b5b95;
  padding-bottom: 8px;
}

.driver-card p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.driver-card p strong {
  color: #333;
  font-weight: 500;
}

.loader {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.loader p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #6b5b95;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  position: absolute;
  top: 260px;
  left: 50%;
  transform: translateX(-50%);
  background: #d32f2f;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  z-index: 1000;
  max-width: 90%;
  text-align: center;
}

@media (max-width: 600px) {
  .driver-card-container {
    top: 10px;
    left: 10px;
    max-width: 280px;
  }

  .driver-card,
  .loader {
    padding: 15px;
  }

  .driver-card h3 {
    font-size: 18px;
  }

  .driver-card p {
    font-size: 13px;
  }

  .error {
    top: 220px;
    padding: 10px 15px;
    font-size: 13px;
  }
}
</style>