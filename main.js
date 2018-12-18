import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

App.mpType = 'app'

Vue.prototype.$store = store
//改写默认的uni.showToast，不显示默认的图片，用于提示用户
Vue.prototype.showErrorToast = function(option) {
	typeof option === 'string' ? option = {
		title: option
	} : 1;

	uni.showToast(Object.assign({
		icon: 'none',
		duration: 2000
	}, option));
};

const app = new Vue({
	store,
	...App
})
app.$mount()
