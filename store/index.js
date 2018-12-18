import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false, //是否登录
		userName: null, //当前登录用户的用户名
		password: null, //当前登录用户的密码
		userInfo: {}, //用户信息
		btnTop: 500, //底部button距离顶部的距离（px），默认给500
		refreshList: null
	},
	mutations: {
		login(state, {
			userName,
			password,
			userInfo
		}) {
			state.userName = userName;
			state.password = password;
			state.userInfo = userInfo;
			state.hasLogin = true;
		},
		logout(state) {
			state.userName = null;
			state.password = null;
			state.userInfo = {};
			state.hasLogin = false;
		},
		setBtnTop(state, btnTop) {
			state.btnTop = btnTop;
		},
		updatePassword(state, password) {
			state.password = password;
		},
		updateRefreshList(state, listName) {
			state.refreshList = listName;
		}
	}
})

export default store
