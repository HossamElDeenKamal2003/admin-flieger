import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import 'bootstrap/dist/css/bootstrap.min.css';
// import VueSocketIO from 'vue-3-socket.io';
// import SocketIO from 'socket.io-client';

const app = createApp(App);

// app.use(new VueSocketIO({
//     debug: true,
//     connection: SocketIO('http://localhost:3000', {}), 
//     vuex: {
//         actionPrefix: "SOCKET_",
//         mutationPrefix: "SOCKET_"
//     }
// }));

app.use(router);
app.mount('#app');
