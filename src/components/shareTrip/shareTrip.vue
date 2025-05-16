<template>
  <div class="map-container">
    <div ref="map" class="map"></div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import polyline from '@mapbox/polyline';
import io from 'socket.io-client';

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
      driverPath: [], // Store driver's actual path
      plannedPath: [], // Store the planned route path
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
            this.driverPath.push({ lat: driverLat, lng: driverLng });
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
      this.plannedPolyline = new this.google.maps.Polyline({
        path: this.plannedPath,
        geodesic: true,
        strokeColor: '#6b5b95', // Purple for planned route
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: this.googleMap,
      });
      console.log('Planned polyline drawn with path:', this.plannedPath);
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
      this.plannedPolyline = new this.google.maps.Polyline({
        path: this.plannedPath,
        geodesic: true,
        strokeColor: '#FF0000', // Red for fallback planned route
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: this.googleMap,
      });
      console.log('Fallback planned polyline drawn between:', this.plannedPath);
    },
    updateActualRoute() {
      if (!this.google || !this.googleMap) {
        this.error = 'الخريطة غير جاهزة';
        return;
      }
      if (this.driverPath.length < 2) return; // Need at least 2 points to draw a line

      // Remove the passed portion by keeping only the remaining path
      const remainingPath = this.calculateRemainingPath();
      if (this.actualPolyline) {
        this.actualPolyline.setMap(null); // Remove old polyline
      }
      this.actualPolyline = new this.google.maps.Polyline({
        path: remainingPath,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: this.googleMap,
      });
      console.log('Actual route updated with remaining path:', remainingPath);
    },
    calculateRemainingPath() {
      if (this.driverPath.length < 2) return this.driverPath;

      const currentPosition = this.driverPath[this.driverPath.length - 1];
      const remainingPath = [currentPosition]; // Start with current position

      // Find the closest point on the planned path to the current position
      let closestIndex = 0;
      let minDistance = Number.MAX_VALUE;
      for (let i = 0; i < this.plannedPath.length; i++) {
        const distance = this.google.maps.geometry.spherical.computeDistanceBetween(
            new this.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
            new this.google.maps.LatLng(this.plannedPath[i].lat, this.plannedPath[i].lng)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      for (let i = closestIndex; i < this.plannedPath.length; i++) {
        remainingPath.push(this.plannedPath[i]);
      }

      return remainingPath;
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
                this.driverPath.push({ lat, lng });
                this.updateActualRoute();
                console.log(`Updated marker and route for driver ${this.driverId} to:`, { lat, lng });
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
    this.carMarker = null;
    this.startMarker = null;
    this.endMarker = null;
    this.plannedPolyline = null;
    this.actualPolyline = null;
    this.googleMap = null;
    this.google = null;
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  height: 100vh;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.error {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
}
</style>