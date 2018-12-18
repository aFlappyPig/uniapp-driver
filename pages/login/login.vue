<template>
	<view class="container">
		<view class="status-bar"></view>
		<view class="inner-container">
			<image src="../../static/logo.png" mode="widthFix" class="logo" @click="togglePwd"></image>
			<view class="row">
				<image src="../../static/user.png" mode="widthFix" class="user-icon"></image>
				<input type="text" placeholder="请输入用户名" @input="toggleBtn" v-model="user" />
			</view>
			<view class="row">
				<image src="../../static/password.png" mode="widthFix" class="password-icon"></image>
				<input type="text" :password="!pwdShow" placeholder="请输入密码" @input="toggleBtn" v-model="password" />
				<image :src="iconPwdShow" mode="widthFix" class="password-show" v-if="password" @tap="togglePwd"></image>
			</view>
		</view>
		<button type="primary" size="default" :disabled="btnDisabled" class="btn" @tap="handleLogin" :style="{top: btnTop+'px'}">登录</button>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { HOST, METHODS } from '../../config/api.js';
import { dateFormat } from '../../utils/util.js';
import httpService from '../../utils/httpService.js';
const iconShowPwd = '../../static/pwd-show.png',
    iconHidePwd = '../../static/pwd-hide.png';

export default {
    name: 'login',
    data: function() {
        return {
            pwdShow: false,
            btnDisabled: true,
            user: null,
            password: null,
            userInfo: null,
            iconPwdShow: iconHidePwd
        };
    },
    computed: mapState(['hasLogin', 'userName', 'btnTop']),
    onLoad() {
        //先隐藏loading框，因为从修改密码界面跳转到该界面时有可能会有loading框显示
        uni.hideLoading();
        //同步获取app数据中是否存储有当前登录的用户名和密码
        //如果有，就直接跳转到主页面去，没有就显示当前页面
        try {
            this.user = uni.getStorageSync('userName');
            this.password = uni.getStorageSync('password');
            this.userInfo = uni.getStorageSync('userInfo');
            if (this.user && this.password && this.userInfo) {
                this.login({
                    userName: this.user,
                    password: this.password,
                    userInfo: this.userInfo
                });
                uni.reLaunch({
                    url: '../index/index',
                    complete() {
                        uni.hideLoading();
                    }
                });
            }
        } catch (e) {
            this.showErrorToast({
                title: '无法获取登录状态！'
            });
        }
    },
    methods: {
        ...mapMutations(['login']),
        /**
         * 切换登录按钮的状态，如果用户名和密码不为空就enable
         */
        toggleBtn: function() {
            this.btnDisabled = !(this.user && this.password);
        },
        /**
         * 切换显示/隐藏密码
         */
        togglePwd: function() {
            this.pwdShow = !this.pwdShow;
            this.iconPwdShow = this.pwdShow ? iconShowPwd : iconHidePwd;
        },
        /**
         * 登录
         */
        handleLogin: function() {
            let self = this;
            httpService.request({
                url: HOST,
                method: 'POST',
                data: {
                    method: METHODS.login,
                    login_name: this.user,
                    password: this.password,
                    data: { passwdHash: this.password }
                },
                success: function(res) {
                    if (res.success && 'id' in res.data) {
                        self.userInfo = res.data;
                        let userInfo = res.data;
                        try {
                            uni.setStorageSync('userName', self.user);
                            uni.setStorageSync('password', self.password);
                            uni.setStorageSync('userInfo', self.userInfo || null);

                            self.login({
                                userName: self.user,
                                password: self.password,
                                userInfo: self.userInfo
                            });
                            uni.reLaunch({
                                url: '../index/index',
                                complete() {
                                    uni.hideLoading();
                                }
                            });
                        } catch (e) {
                            console.error(e);
                            self.showErrorToast({
                                title: '无法存储登录状态！'
                            });
                        }
                    } else {
                        let title = res.message;
                        uni.showToast({
                            title: title || '登录错误',
                            icon: 'none',
                            duration: 3000
                        });
                    }
                },
                fail: function(err) {
                    self.showErrorToast({
                        title: '登录错误！'
                    });
                }
            });
        }
    }
};
</script>

<style scoped>
.container {
    display: block;
    width: 100%;
    position: relative;
}

.inner-container {
    display: block;
    padding: 36upx;
}

.row {
    position: relative;
}

.logo {
    display: block;
    width: 160upx;
    margin: 120upx auto;
}

input {
    width: 100%;
    padding: 40upx 0;
    border-bottom: 1px solid #dbdbdb;
    font-size: 30upx;
    color: #333;
    padding-left: 90upx;
}

.user-icon,
.password-icon {
    width: 50upx;
    position: absolute;
    bottom: 40upx;
}

.password-show {
    width: 30upx;
    position: absolute;
    right: 0;
    bottom: 50upx;
    z-index: 100;
}

.btn {
    width: calc(100% - 72upx);
    position: absolute;
    left: 36upx;
    top: calc(100vh - 150upx);
    border-radius: 2px;
}
</style>
