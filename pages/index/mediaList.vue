<template>
    <view @touchmove="touchMove" class="media-item">
        <view class="list-cell" hover-class="uni-list-cell-hover" @tap="handleCellClick">
          <view class="cell-left">
						<view class="cell-left-top">
							<view class="text-ellipsis text-bold">
								【{{data.workOrder.brandName}}&nbsp;&nbsp;{{data.workOrder.shopName}}】{{data.workOrder.failure}}
							</view>
						</view>
						<view class="cell-left-middle">
							<view class="text-ellipsis">
								配送地址：{{data.workOrder.shopAddress}}
							</view>
						</view>
						<view class="cell-left-bottom">
							<view class="text-ellipsis">
								应到时间：{{ data.workOrder.arriveTimeFormat }}
							</view>
						</view>
					</view>
					<view class="cell-right">
						<button type="default" v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus=='TOBECONFIRMED'" class="cell-right-btn blue" plain @tap.stop="handleSending">开始配送</button>
						<button type="default" v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus=='WAITFOROUTBOUND'" class="cell-right-btn yellow" plain @tap.stop="handleReceipt">确认收货</button>
						<button type="default" v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus=='INDISTRIBUTION'" class="cell-right-btn red" plain @tap.stop="handleDelivery">确认送达</button>
						<text v-if="data.deliveryOrder && (data.deliveryOrder.deliveryStatus=='ARRIVED'||data.deliveryOrder.deliveryStatus=='RECEIVED')" class="cell-right-text text-right text-bold">配送完成</text>
						<text v-if="data.deliveryOrder && data.deliveryOrder.deliveryStatus=='CANCELED'" class="cell-right-text text-right text-bold text-cancel">已取消</text>
						<text v-if="data.refundOrder && data.refundOrder.refundOrderStatus=='RETURNING'" class="cell-right-text text-right text-bold text-back">退货中</text>
						<text v-if="data.refundOrder && data.refundOrder.refundOrderStatus=='RETURNED'" class="cell-right-text text-right text-bold">已退货</text>
					</view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'cell',
    props: {
        data: {
            type: Object,
            default: function(e) {
                return {
                    workOrder: {},
                    deliveryOrder: {}
                };
            }
        }
    },
    computed: {},
    methods: {
        /**
         * 触发父级的touchmove事件
         */
        touchMove(e) {
            this.$emit('touch-move', e);
        },
        /**
         * 触发父级的点击查看详情事件
         */
        handleCellClick() {
            this.$emit('open-detail');
        },
        /**
         * 触发父级的开始配送事件
         */
        handleSending(e) {
            this.$emit('start-send');
        },
        /**
         * 触发父级的确认收货事件
         */
        handleReceipt(e) {
            this.$emit('confirm-receipt');
        },
        /**
         * 触发父级的确认送达事件
         */
        handleDelivery(e) {
            this.$emit('confirm-delivery');
        }
    }
};
</script>

<style lang="scss">
view {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.list-cell {
    width: 100%;
    padding: 32upx 36upx;
    height: 190upx;
    flex-direction: row;
}

.uni-list-cell-hover {
    background-color: #eeeeee;
}
.cell-left {
    flex: 2;
    // flex-direction: column;
    overflow: hidden;
    display: block;
}
.cell-right {
    flex: 1;
    align-items: flex-end;
    justify-content: center;
}
.cell-right-btn,
.cell-right-text {
    width: 148upx;
    height: 64upx;
    line-height: 64upx;
    font-size: 26upx;
    border-radius: 0;
    padding: 0;
    border: 0;
}
.cell-left-top,
.cell-left-middle,
.cell-left-bottom {
    display: block;
    overflow: hidden;
    width: 100%;
    font-size: 24upx;
    color: #5e5e5e;
    & > view {
        display: block;
        width: 100%;
        height: 42upx;
        line-height: 42upx;
        padding: 0;
    }
}
.cell-left-top {
    font-size: 26upx;
    color: #000000;
}

button[plain] {
    margin: 0;
    &.button-hover {
        opacity: 0.7;
        background-color: rgba(0, 0, 0, 0.1);
    }
    &.blue {
        color: #318af3;
        border-color: #318af3;
    }
    &.yellow {
        color: #f5af23;
        border-color: #f5af23;
    }
    &.red {
        color: #fd3844;
        border-color: #fd3844;
    }
}
.text-cancel {
    color: #fd3844;
}
.text-back {
    color: #ee7b46;
}
</style>
