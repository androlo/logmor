import Vue, {CreateElement, VNode} from "vue";
import VueMaterial from "vue-material";
import "vue-material/dist/theme/default.css";
import "vue-material/dist/vue-material.min.css";
import App from "./App.vue";
import VueCookies from 'vue-cookies';

Vue.use(VueMaterial);
Vue.use(VueCookies);
Vue.config.productionTip = false;

Vue.$cookies.config('30d');

new Vue({
    render: (h: CreateElement): VNode => h(App)
}).$mount("#app");
