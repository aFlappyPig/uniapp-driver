import {
	dateFormat
} from '../utils/util.js';

import {
	HOST
} from '../config/api.js';
import Base64 from 'utils/base64.js';
import store from '../store';

/**
 * 对uni.request的封装，默认发请求之前显示加载框，完成后隐藏加载框
 */
const httpService = {
	request: config => {
		// console.log(userInfo, password)
		uni.showLoading();
		const userInfo = store.state.userInfo || {};
		const password = store.state.password;
		const HEADERS = {
			'Authorization': Base64.encode((encodeURIComponent(userInfo.loginName + ':' + password))) || null,
			'User-ID': userInfo.id || null,
			'content-type': 'application/x-www-form-urlencoded'
		}
		const CONFIG = {
			'login_name': userInfo.loginName,
			'password': password,
			'timestamp': dateFormat(new Date()),
			'version': 2,
			'sign': 'e8844a3dd2a7bcb7aad197587dc92a8a'
		}
		const option = Object.assign({}, config, {
			url: HOST,
			data: {
				...CONFIG,
				...config.data,
				data: JSON.stringify(config.data.data)
			},
			header: HEADERS,
			success(res) {
				if (res.statusCode === 200) {
					(config.success && typeof config.success === 'function') ? config.success(res.data): 1;
				} else {
					console.error(res.data);
					(config.fail && typeof config.fail === 'function') ? config.fail(res.data): 1;
				}
			},
			complete() {
				(config.complete && typeof config.complete === 'function') ? config.complete(): 1;
				uni.hideLoading();
			}
		});
		return uni.request(option);
	},
	get: config => httpService.request(Object.assign(config, {
		method: 'GET'
	})),
	post: config => httpService.request(Object.assign(config, {
		method: 'POST'
	}))
}
export default httpService;
