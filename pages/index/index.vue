<template>
	<view class="container">
		<view>
			<view class="status-bar"></view>
			<view class="header">
				<view class="user" @tap="drawerVisible = !drawerVisible">
					<image src="../../static/user.png" mode="widthFix" class="user-icon"></image>
				</view>
				<view class="current-status">
					<text>{{statusName}}</text>
					<!-- <i-icon :type="statusShow ? 'packup':'unfold'" size="16" @tap.stop="handleChangeStatus"></i-icon> -->
					<!-- <view v-show="statusShow" class="status-list">
						<view v-for="item in statusList" v-if="!item.hidden" :key="item.id" @tap.stop="handleSelectStatus(item)" class="status-cell" :class="{active: status === item.id}">
							<text class="status-name">{{item.name}}</text>
							<i-icon v-if="status === item.id" type="right" size="16" class="status-icon text-right"></i-icon>
						</view>
					</view> -->
				</view>
			</view>
			<view class="body" :style="{height: bodyHeight+'px'}">
				<tabs :status="status"></tabs>
			</view>
		</view>
		<uni-drawer :visible="drawerVisible" mode="left" @close="closeDrawer">
			<view class="drawer-content">
				<view class="user-info">
					<view class="user-image">{{realName?realName[0]:''}}</view>
					<text class="user-name text-center text-bold">{{realName}}</text>
                    <button v-if="status==='ONBREAK'" class="user-status" type="primary" @tap="handleSelectStatus(statusList[0])">开始工作</button>
                    <button v-if="status==='WORKING'" class="user-status" type="primary" @tap="handleSelectStatus(statusList[1])">申请休假</button>
                    <button v-if="status==='APPLYING'" class="user-status" type="primary" disabled>申请休假中</button>
				</view>
				<view class="drawer-list">
					<view class="drawer-list-cell" hover-class="drawer-list-cell-hover">
						<view class="drawer-list-cell-navigate navigate-right" @tap="goUpdatePassword">
							<text class="fx-1">修改密码</text>
							<i-icon type="enter" size="14" color="#dbdbdb" class="text-right fx-1"></i-icon>
						</view>
					</view>
					<view class="drawer-list-cell drawer-list-cell-last" hover-class="drawer-list-cell-hover">
						<view class="drawer-list-cell-navigate navigate-right" @tap="handleLogout">
							退出登录
						</view>
					</view>
				</view>
			</view>
		</uni-drawer>
	</view>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import tabs from './tabbar.vue';
import uniDrawer from '../../components/uni-drawer.vue';
import httpService from '../../utils/httpService.js';
import { METHODS } from '../../config/api.js';
import { LOCATIONINTERVAL } from '../../config/constant.js';

export default {
    name: 'main',
    components: {
        tabs,
        uniDrawer
    },
    data() {
        return {
            status: 'WORKING',
            statusName: '工作中',
            drawerVisible: false,
            statusList: [
                { name: '工作中', id: 'WORKING' },
                { name: '休假中', id: 'ONBREAK' },
                { name: '申请休假中', id: 'APPLYING', hidden: true }
            ]
        };
    },
    onLoad() {
        //定位
        this.getLocation();
        setInterval(() => {
            this.getLocation();
        }, LOCATIONINTERVAL);
        this.getWorkStatus();
    },
    computed: {
        realName() {
            return this.$store.state.userInfo.realName;
        },
        /**
         * 可滚动区域的高度
         */
        bodyHeight() {
            let sys = uni.getSystemInfoSync();
            return sys.screenHeight - sys.statusBarHeight - (sys.windowWidth / 750) * 90;
        }
    },
    methods: {
        ...mapMutations(['logout']),
        /**
         * 获取当前位置
         */
        getLocation() {
            let self = this;
            uni.getLocation({
                type: 'gcj02',
                success: function({ longitude, latitude }) {
                    //TODO
                    httpService.post({
                        data: {
                            method: METHODS.uploadLocation,
                            data: {
                                lon: String(longitude),
                                lat: String(latitude)
                            }
                        },
                        success(res) {
                            if (res.success) {
                                console.log('定位成功！');
                            } else {
                                console.log('定位失败！');
                            }
                        },
                        fail(err) {
                            console.log('定位失败：', err);
                        }
                    });
                },
                fail(err) {
                    console.log('定位失败：', err);
                }
            });
        },
        /**
         * 获取当前的工作状态
         */
        getWorkStatus() {
            let self = this;
            httpService.get({
                data: {
                    method: METHODS.getDriverStatus,
                    data: {}
                },
                success(res) {
                    //休假，工作中，申请中
                    //ONBREAK,WORKING,APPLYING;
                    if (res.success) {
                        self.status = res.data.driverStatus;
                        self.statusName = self.statusList.find(
                            e => e.id === res.data.driverStatus
                        ).name;
                        if (res.data.driverStatus === 'APPLYING') {
                            //TODO
                            setTimeout(self.getWorkStatus, 1000 * 60 * 5);
                        }
                    } else {
                        self.showErrorToast('获取司机工作状态失败！');
                    }
                },
                fail() {
                    console.log('获取司机工作状态失败！');
                    self.showErrorToast('获取司机工作状态失败！');
                }
            });
        },
        /**
         * 切换工作中/休假中
         */
        handleSelectStatus(item) {
            if (!item || !item.id || !item.name) return;
            let self = this;
            if (item.name === '工作中') {
                uni.showModal({
                    content: '切换后系统会自动派单给你，确定要切换成工作中吗？',
                    success({ confirm, cancel }) {
                        if (confirm) {
                            httpService.post({
                                data: {
                                    method: METHODS.endOfVacation,
                                    data: {}
                                },
                                success() {
                                    self.statusName = item.name;
                                    self.status = item.id;
                                },
                                fail() {
                                    console.log('切换工作状态出错！');
                                    self.showErrorToast('切换工作状态出错！');
                                }
                            });
                        }
                    },
                    fail() {
                        self.showErrorToast({
                            title: '切换工作状态失败！'
                        });
                    }
                });
            } else if (item.name === '休假中') {
                uni.showModal({
                    content:
                        '切换后当天的配送单会自动做取消或退货处理，请慎重操作？提交后等待平台审批，确定要切换成休假中吗？',
                    success({ confirm, cancel }) {
                        if (confirm) {
                            httpService.post({
                                data: {
                                    method: METHODS.applyVacation,
                                    data: {}
                                },
                                success() {
                                    self.statusName = '申请休假中';
                                    self.status = 'APPLYING';
                                },
                                fail() {
                                    console.log('切换工作状态出错！');
                                    self.showErrorToast('切换工作状态出错！');
                                }
                            });
                        }
                    },
                    fail() {
                        self.showErrorToast({
                            title: '切换工作状态失败！'
                        });
                    }
                });
            }
        },
        /**
         * 关闭左滑抽屉
         */
        closeDrawer() {
            this.drawerVisible = false;
        },
        /**
         * 跳转到修改密码页面
         */
        goUpdatePassword() {
            let self = this;
            uni.navigateTo({
                url: '../update-password/update-password',
                success() {
                    self.closeDrawer();
                },
                fail() {
                    self.showErrorToast({
                        title: '跳转到修改密码页面失败！'
                    });
                }
            });
        },
        /**
         * 退出登录，重新登录app到登录页面，清除当前登录信息
         */
        handleLogout() {
            try {
                //这里要使用同步接口，避免异步引起的问题
                uni.removeStorageSync('userName');
                uni.removeStorageSync('password');
                uni.removeStorageSync('userInfo');
            } catch (e) {
                self.showErrorToast({
                    title: '删除登录状态失败！'
                });
            }
            this.logout();
            //TODO
            let self = this;
            uni.reLaunch({
                url: '../login/login',
                success() {
                    self.closeDrawer();
                },
                fail() {
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
    flex: 1;
    flex-direction: column;
}
.header {
    width: 100%;
    height: 90upx;
    position: relative;
}
.user {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    padding: 22upx 24upx;
}
.user-icon {
    width: 40upx;
    height: 44upx;
}
.current-status {
    flex: 1;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 32upx;
    color: #000;
    position: relative;
}
.status-list {
    position: absolute;
    top: 90upx;
    left: calc(50% - 100upx);
    z-index: 2;
    flex-direction: column;
    border: 1px solid #b9b9b9;
    background-color: #fff;
}
.status-cell {
    &.active {
        color: #318af3;
    }
    width: 200upx;
    height: 90upx;
    line-height: 90upx;
    font-size: 28upx;
    color: #5e5e5e;
    padding: 0 30upx;
    flex-direction: row;
}
.status-name {
    flex: 2;
}
.status-icon {
    flex: 1;
}
.mask {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
}
.drawer-content {
    padding: 36upx;
}
.user-info {
    flex-direction: row;
    height: 240upx;
    align-items: center;
    justify-content: space-between;
}
.user-image {
    width: 118upx;
    height: 118upx;
    border-radius: 50%;
    border: 1px solid #999;
    color: #318af3;
    text-align: center;
    justify-content: center;
}
.user-name {
    flex: 2;
    font-size: 44upx;
    color: #333;
}
.drawer-list {
    flex-direction: column;
}
.drawer-list-cell-navigate {
    flex: 1;
    font-size: 30upx;
    color: #333333;
    flex-direction: row;
    align-items: center;
}
.drawer-list-cell {
    height: 130upx;
    border-bottom: 1px solid #dbdbdb;
}
.fx-1 {
    flex: 1;
}
.apply-mask {
    opacity: 0.7;
    background-color: #000000;
    color: #ffffff;
    text-align: center;
    display: flex;
    align-content: center;
    justify-content: center;
}
.user-status {
    width: 154upx;
    height: 64upx;
    background-color: #318af3;
    color: #ffffff;
    font-size: 26upx;
    border-radius: 0;
    padding: 0;
    line-height: 64upx;
    text-align: center;
}
.user-status[disabled] {
    background-color: #318af3;
    opacity: 0.6;
}
</style>
