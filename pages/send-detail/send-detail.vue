<template>
	<view class="container">
		<view class="status-bar"></view>
		<view class="inner-container">
			<view class="navigate-bar">
				<i-icon type="return" size="24" color="#000" class="navigate-bar-icon" @tap="back"></i-icon>
				<view class="title">配送单详情</view>
			</view>
			<view class="warning" v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus=='CANCELED'">
				<view>配送单已取消，请停止配送</view>
				<view>
					<text v-if="data.deliveryOrder.cancelReason">取消原因：{{data.deliveryOrder.cancelReason}} &emsp; </text>
					<text>{{data.deliveryOrder.updateTime}}</text>
				</view>
			</view>
			<view class="content" v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus!=='RETURNING'">
				<view class="section">
					<view class="section-header text-bold">配送信息</view>
					<view class="section-item">
						<view class="section-item-left">配送单号</view>
						<view class="section-item-right ">
							{{data.deliveryOrder.deliveryOrderNo}}
							<i-icon type="document" @tap="setClipboardData(data.deliveryOrder.deliveryOrderNo)"></i-icon>
						</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">配送地址</view>
						<view class="section-item-right ">{{data.deliveryOrder.recipientAddress}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">应到时间</view>
						<view class="section-item-right ">{{data.deliveryOrder.estimatedDeliveryTimeFormat}}</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-header text-bold">仓库信息</view>
					<block v-for="item in data.deliveryOrder.outboundOrderBos" :key="item.id">
						<view class="section-item">
							<view class="section-item-left">仓库名称</view>
							<view class="section-item-right ">{{item.warehouseName}}</view>
						</view>
						<view class="section-item">
							<view class="section-item-left">仓库地址</view>
							<view class="section-item-right ">{{item.warehouseAddress}}</view>
						</view>
						<view class="section-item">
							<view class="section-item-left">联系电话</view>
							<view class="section-item-right  text-phone" @tap="makePhoneCall(item.warehouseTel)">{{item.warehouseTel||'暂无'}}</view>
						</view>
					</block>
					<view class="section-item">
						<view class="section-item-left">配送清单</view>
					</view>
					<view class="table" v-for="item in data.deliveryOrder.deliveryOrderLines" :key="item.itemId">
						<view class="table-left">
							{{item.skuName}}
						</view>
						<view class="table-right">
							X{{item.quantity}}
						</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-header text-bold">收件人信息</view>
					<view class="section-item">
						<view class="section-item-left">收件人</view>
						<view class="section-item-right ">{{data.workOrder.staffName}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">联系电话</view>
						<view class="section-item-right  text-phone" @tap="makePhoneCall(data.deliveryOrder.recipientTel)">{{data.deliveryOrder.recipientTel}}</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-header text-bold">工单信息</view>
					<view class="section-item">
						<view class="section-item-left">工单号</view>
						<view class="section-item-right ">
							{{data.workOrder.workOrderNo}}
							<i-icon type="document" @tap="setClipboardData(data.workOrder.workOrderNo)"></i-icon>
						</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">项目经理</view>
						<view class="section-item-right ">{{data.workOrder.dispatcherName}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">联系电话</view>
						<view class="section-item-right  text-phone" @tap="makePhoneCall(data.workOrder.dispatcherPhone)">{{data.workOrder.dispatcherPhone}}</view>
					</view>
				</view>
				<view class="btn-container">
					<button v-if="data.deliveryOrder.deliveryStatus=='TOBECONFIRMED'" type="primary" size="default" class="btn" @tap="startSend(data.deliveryOrder.deliveryOrderNo)">开始配送</button>
					<button v-if="data.deliveryOrder.deliveryStatus=='WAITFOROUTBOUND'" type="warn" size="default" class="btn" @tap="confirmReceipt(data.deliveryOrder.deliveryOrderNo)">确认收货</button>
					<button v-if="data.deliveryOrder.deliveryStatus=='INDISTRIBUTION'" type="warn" size="default" class="btn" @tap="confirmDelivery(data.deliveryOrder.deliveryOrderNo)">确认送达</button>
					<view v-if="data.deliveryOrder.deliveryStatus==('ARRIVED'||'RECEIVED')" class="btn-status">
						<i-icon type="success_fill" size="22" color="#6DC76E" class="status-icon"></i-icon>
						完成配送
					</view>
				</view>
			</view>
			<view class="warning" v-if="data.refundOrder && data.refundOrder.refundOrderStatus=='RETURNING'">
				<view>退货中…</view>
				<view>具体退货时间和地点等待项目经理通知</view>
			</view>
			<view class="content" v-if="data.refundOrder && (data.refundOrder.refundOrderStatus=== 'RETURNING'||data.refundOrder.refundOrderStatus==='RETURNED')">
				<view class="section">
					<view class="section-header text-bold">退货信息</view>
					<view class="section-item">
						<view class="section-item-left">退货配件</view>
					</view>
					<view class="table" v-for="item in data.refundOrder.refundOrderLineBos" :key="item.itemId">
						<view class="table-left">
							{{item.skuName}}
						</view>
						<view class="table-right">
							X{{item.quantity}}
						</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">退货原因</view>
						<view class="section-item-right ">{{data.refundOrder.refundReason}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">发起时间</view>
						<view class="section-item-right ">{{data.refundOrder.applyTime}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">审批时间</view>
						<view class="section-item-right ">{{data.refundOrder.approveTime}}</view>
					</view>
				</view>
				<view class="section">
					<view class="section-header text-bold">工单信息</view>
					<view class="section-item">
						<view class="section-item-left">收件人</view>
						<view class="section-item-right ">{{data.refundOrder.workerName}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">联系电话</view>
						<view class="section-item-right  text-phone" @tap="makePhoneCall(data.refundOrder.workerPhone)">{{data.refundOrder.workerPhone}}</view>
					</view>
				</view>
				<view class="section">
					<view class="section-header text-bold">联系人电话</view>
					<view class="section-item">
						<view class="section-item-left">工单号</view>
						<view class="section-item-right ">
							{{data.refundOrder.workOrderNo}}
							<i-icon type="document" @tap="setClipboardData(data.refundOrder.workOrderNo)"></i-icon>
						</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">项目经理</view>
						<view class="section-item-right ">{{data.refundOrder.dispatcherName}}</view>
					</view>
					<view class="section-item">
						<view class="section-item-left">联系电话</view>
						<view class="section-item-right  text-phone" @tap="makePhoneCall(data.refundOrder.dispatcherPhone)">{{data.refundOrder.dispatcherPhone}}</view>
					</view>
					<view class="btn-container">
						<button v-if="data.refundOrder.refundOrderStatus=='RETURNING'" type="warn" size="default" class="btn" @tap="confirmReceiptBack(data.refundOrder.refundOrderNo)">确认收货</button>
						<view v-if="data.refundOrder.refundOrderStatus=='RETURNED'" class="btn-status">
							<i-icon type="success_fill" size="22" color="#6DC76E" class="status-icon"></i-icon>
							已退货
						</view>
					</view>
				</view>
			</view>	
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import httpService from '../../utils/httpService.js';
import { METHODS } from '../../config/api.js';
export default {
    data() {
        return {
            data: null
        };
    },
    onLoad(param) {
        //获取到当前页面传递的参数
        this.data = JSON.parse(param.data);
    },
    methods: {
        ...mapMutations(['updateRefreshList']),
        /**
         * 返回上个页面
         */
        back() {
            uni.navigateBack();
        },
        /**
         * 打电话
         */
        makePhoneCall(phoneNum) {
            if (!phoneNum) return;
            uni.makePhoneCall({
                phoneNumber: phoneNum
            });
        },
        /**
         * 复制
         */
        setClipboardData(str) {
            uni.setClipboardData({
                data: str,
                success() {
                    uni.showToast({
                        title: '复制成功！'
                    });
                }
            });
        },
        /**
         * 更改状态
         */
        updateStatus(deliveryOrderNo, deliveryOrderStatus, ErrorToast) {
            let self = this;
            httpService.post({
                data: {
                    method: METHODS.updateDeliveryStatus,
                    data: {
                        deliveryOrderNo,
                        deliveryOrderStatus
                    }
                },
                success(res) {
                    if (res.success) {
                        uni.showToast({
                            title: '成功！'
                        });
                        self.updateRefreshList('working');
                        self.data.deliveryOrder.deliveryStatus = status;
                    } else {
                        self.showErrorToast(ErrorToast);
                    }
                },
                fail(err) {
                    console.log(err);
                    self.showErrorToast(ErrorToast);
                }
            });
        },
        /**
         * 开始配送
         */
        startSend(deliveryOrderNo) {
            if (!deliveryOrderNo) return;
            this.updateStatus(deliveryOrderNo, 'WAITFOROUTBOUND', '开始配送失败！');
        },
        /**
         * 确认收货
         */
        confirmReceipt(deliveryOrderNo) {
            if (!deliveryOrderNo) return;
            this.updateStatus(deliveryOrderNo, 'INDISTRIBUTION', '确认收货失败！');
        },
        /**
         * 确认送达
         */
        confirmDelivery(deliveryOrderNo) {
            if (!deliveryOrderNo) return;
            this.updateStatus(deliveryOrderNo, 'ARRIVED', '确认送达失败！');
        },
        /**
         * 确认收到退货
         */
        confirmReceiptBack(id) {
            if (!id) return;
            let self = this;
            httpService.post({
                data: {
                    method: METHODS.updateRefundStatus,
                    data: {
                        refundOrderNo: id
                    }
                },
                success(res) {
                    if (res.success) {
                        uni.showToast({
                            title: '成功！'
                        });
                        self.updateRefreshList('refund');
                        self.data.refundOrder.refundOrderStatus = 'RETURNED';
                    } else {
                        self.showErrorToast('收取退货出错！');
                    }
                },
                fail(err) {
                    console.log(err);
                    self.showErrorToast('收取退货出错！');
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
    flex-direction: column;
    position: relative;
}
.navigate-bar {
    flex: 1;
    position: sticky;
    background-color: #ffffff;
    left: 0;
    top: var(--status-bar-height);
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
    flex-direction: column;
    padding: 36upx;
}
.section {
    flex-direction: column;
    margin-bottom: 30upx;
}
.section-header {
    font-size: 30upx;
    height: 100upx;
    line-height: 100upx;
}
.section-item {
    margin: 20upx 0;
    justify-content: space-between;
}
.section-item-left {
    font-size: 26upx;
    color: #5e5e5e;
    width: 5em;
    min-width: 5em;
}
.section-item-right {
    font-size: 26upx;
    color: #000000;
    word-break: break-all;
    margin-left: 2em;
}
.btn-container {
    margin-top: 50upx;
    margin-bottom: 20upx;
}
.btn,
.btn-status {
    flex: 1;
}
.btn-status {
    color: #000;
    font-weight: bold;
    font-size: 30upx;
    justify-content: center;
}
.status-icon {
    margin-right: 10upx;
    font-weight: 100;
}
.text-phone {
    text-decoration: underline;
    color: #318af3;
}
i-icon {
    margin-left: 0.5em;
}
.warning {
    height: 148upx;
    background-color: #f8e71c;
    color: #333333;
    font-size: 28upx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.table {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.table-left {
    flex-shrink: 2;
    color: #5e5e5e;
    font-size: 24upx;
}
.table-right {
    font-size: 24upx;
    color: #000000;
    margin-left: 2em;
}
</style>
