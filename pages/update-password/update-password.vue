<template>
	<view class="container">
		<view class="status-bar"></view>
		<view class="navigate-bar">
			<i-icon type="return" size="24" color="#000" class="navigate-bar-icon" @tap="back"></i-icon>
			<view class="title">修改密码</view>
		</view>
		<view class="inner-container">
			<view class="content">
				<view class="list">
					<view class="list-cell">
						<view class="list-cell-left">旧密码</view>
						<view class="list-cell-right">
							<input type="text" :password="!oldPasswordShow" placeholder="请输入密码" @input="toggleBtn" v-model="oldPassword" />
							<image :src="oldPasswordShow?iconShowPwd:iconHidePwd" mode="widthFix" class="password-show" v-if="oldPassword" @tap="oldPasswordShow = !oldPasswordShow"></image>
						</view>
					</view>
					<view class="list-cell">
						<view class="list-cell-left">新密码</view>
						<view class="list-cell-right">
							<input type="text" :password="!newPasswordShow" placeholder="请输入密码" @input="toggleBtn" v-model="newPassword" />
							<image :src="newPasswordShow?iconShowPwd:iconHidePwd" mode="widthFix" class="password-show" v-if="newPassword" @tap="newPasswordShow = !newPasswordShow"></image>
						</view>
					</view>
					<view class="list-cell">
						<view class="list-cell-left">确认密码</view>
						<view class="list-cell-right">
							<input type="text" :password="!confirmPasswordShow" placeholder="请输入密码" @input="toggleBtn" v-model="confirmPassword" />
							<image :src="confirmPasswordShow?iconShowPwd:iconHidePwd" mode="widthFix" class="password-show" v-if="confirmPassword" @tap="confirmPasswordShow = !confirmPasswordShow"></image>
						</view>
					</view>
				</view>
				<view class="text-sub">{{error}}</view>
			</view>
		</view>
		<button type="primary" size="default" :disabled="btnDisabled" class="btn" @tap="handleUpdatePassword" :style="{top: btnTop+'px'}">确定</button>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import httpService from '../../utils/httpService.js';
import { METHODS } from '../../config/api.js';
export default {
    data() {
        return {
            btnDisabled: true,
            oldPasswordShow: false,
            newPasswordShow: false,
            confirmPasswordShow: false,
            iconShowPwd: '../../static/pwd-show.png',
            iconHidePwd: '../../static/pwd-hide.png',
            oldPassword: null,
            newPassword: null,
            confirmPassword: null,
            error: ''
        };
    },
    computed: mapState(['btnTop', 'userName']),
    methods: {
        ...mapMutations(['logout']),
        /**
         * 返回上个页面
         */
        back() {
            uni.navigateBack();
        },
        /**
         * 切换修改密码按钮状态
         */
        toggleBtn() {
            this.btnDisabled = !(this.oldPassword && this.newPassword && this.confirmPassword);
        },
        /**
         * 修改密码，成功后跳转到登录页面
         */
        handleUpdatePassword() {
            uni.showLoading();
            //验证密码格式
            let password = uni.getStorageSync('password');
            if (!password || !this.oldPassword || this.oldPassword !== password) {
                this.error = '旧密码错误，请重新填写';
                uni.hideLoading();
                return;
            } else if (!this.newPassword || this.newPassword.length < 4) {
                this.error = '密码至少4位字符';
                uni.hideLoading();
                return;
            } else if (this.newPassword !== this.confirmPassword) {
                this.error = '两次填写的密码不一致';
                uni.hideLoading();
                return;
            }
            this.error = '';
            let self = this;
            //删除当前的登录状态
            httpService.post({
                data: {
                    method: METHODS.updatePassword,
                    data: {
                        passwdHash: self.newPassword
                    },
                    login_name: self.userName,
                    password: self.oldPassword
                },
                success(res) {
                    //TODO
                    try {
                        uni.removeStorageSync('userName');
                        uni.removeStorageSync('password');
                        uni.removeStorageSync('userInfo');
                    } catch (e) {
                        self.showErrorToast({
                            title: '删除登录状态失败！'
                        });
                    }
                    self.logout();
                    //跳转到登录页面重新登录

                    uni.hideLoading();
                    uni.showToast({
                        title: '密码修改成功!',
                        icon: 'success',
                        success() {
                            if (res.success) {
                                uni.reLaunch({
                                    url: '../login/login',
                                    success() {
                                        self.showErrorToast({
                                            title: '请重新登录！'
                                        });
                                    },
                                    fail() {
                                        self.showErrorToast({
                                            title: '退出登录失败！'
                                        });
                                    }
                                });
                            } else {
                                self.showErrorToast({
                                    title: '退出登录失败！'
                                });
                            }
                        },
                        fail() {
                            self.showErrorToast({
                                title: '退出登录失败！'
                            });
                        }
                    });
                },
                fail(err) {
                    self.showErrorToast({
                        title: '退出登录失败！'
                    });
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    flex-direction: column;
    position: relative;
}
.inner-container {
    flex: 1;
    flex-direction: column;
}
.navigate-bar {
    height: 44px;
    position: relative;
    background-color: #ffffff;
    // position: sticky;
    // left: 0;
    // top: var(--status-bar-height);
}
.title {
    flex: 1;
    align-items: center;
    justify-content: center;
    font-size: 32upx;
}
.navigate-bar-icon {
    position: absolute;
    left: 0;
    top: 0;
}
.content {
    flex: 1;
    flex-direction: column;
    padding: 100upx 36upx;
}
.list {
    flex-direction: column;
}
.list-cell {
    height: 130upx;
    border-bottom: 1px solid #dbdbdb;
    align-items: center;
    flex: 1;
    color: #333;
    font-size: 30upx;
}
.list-cell-left {
    flex: 1;
}
.list-cell-right {
    flex: 2;
    align-items: center;
}
.btn {
    position: absolute;
    left: 36upx;
    top: calc(100vh - 150upx - var(--status-bar-height) - 44px);
    border-radius: 2px;
    width: calc(100% - 72upx);
}
.text-sub {
    font-size: 24upx;
    color: #5e5e5e;
    height: 80upx;
    line-height: 80upx;
}
input {
    flex: 1;
    color: #000000;
}
.password-show {
    width: 30upx;
    justify-content: flex-end;
}
</style>
