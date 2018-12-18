<template>
    <view class="index">
        <view id="tab-bar" class="swiper-tab">
            <view v-for="(tab,index) in tabBars" :key="tab.id" :class="['swiper-tab-list',tabIndex==index ? 'active' : '']"
                :id="tab.id" :data-current="index" @tap="tapTab">{{tab.name+'('+tab.count+'单)'}}</view>
        </view>
        <swiper :current="tabIndex" class="swiper-box" duration="300" @change="changeTab">
            <swiper-item v-for="(tab,index1) in tabBars" :key="index1">
                <view v-if="status === 'APPLYING'" class="applying">
                  <image src="../../static/vacation.png" mode="widthFix"></image>
                </view>
                <scroll-view v-else :id="'scroll'+index1" class="list" scroll-y :style="{'height': bodyHeight+'px'}"
                @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
                    <view :key="'refresh'+index1" class="loading" :animation="animation">
                        <image src="../../static/loading.gif"></image>
                    </view>
                    <view class="prompt" v-if="prompt && !index1">
                        <view class="prompt-left">前往仓库取货前，记得点击对应配送单的“开始配送”按钮，方便取到货后确认收货哦。</view>
                        <view class="prompt-right">
                            <button type="default"  class="cell-right-btn" plain @tap.stop="setPromptStartSend">知道了</button>
                        </view>
                    </view>
                    <block v-for="(newsitem,index2) in tab.data" :key="index2">
                      <media-list :data="newsitem" 
                        @touch-move="touchMove"
                        @open-detail="goDetail(newsitem)" 
                        @start-send="startSend(newsitem.deliveryOrder.deliveryOrderNo)"
                        @confirm-receipt="confirmReceipt(newsitem.deliveryOrder.deliveryOrderNo)"
                        @confirm-delivery="confirmDelivery(newsitem.deliveryOrder.deliveryOrderNo)">
                    </media-list>
                    </block>
                    <!-- <view :key="'load'+index1" class="loading" :animation="loadMoreAnimation">
                        <image src="../../static/loading.gif"></image>
                    </view> -->
                </scroll-view>
            </swiper-item>
        </swiper>
    </view>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import mediaList from './mediaList.vue';
import httpService from '../../utils/httpService.js';
import { dateFormat } from '../../utils/util.js';
import { HOST, METHODS } from '../../config/api.js';
//定义手势事件中的起点Y值和终点Y值
let startY, endY;
//定义加载框的显示和隐藏动画
let showAnimation = uni
    .createAnimation({
        duration: 100,
        timingFunction: 'ease-in'
    })
    .height(50)
    .step()
    .export();
let hideAnimation = uni
    .createAnimation({
        duration: 100,
        timingFunction: 'ease-in-out'
    })
    .height(0)
    .step()
    .export();
export default {
    name: 'tab',
    components: {
        mediaList
    },
    props: ['status'],
    data() {
        return {
            prompt: false,
            animation: null,
            loadMoreAnimation: null,
            scrollLeft: 0,
            isClickChange: false,
            tabIndex: 0,
            tabBars: [
                {
                    name: '进行中',
                    id: 'working',
                    fun: 'getWorking',
                    count: 0,
                    data: []
                },
                {
                    name: '已取消',
                    id: 'canceled',
                    fun: 'getCanceled',
                    count: 0,
                    data: []
                },
                {
                    name: '退货',
                    id: 'refund',
                    fun: 'getRefund',
                    count: 0,
                    data: []
                }
            ]
        };
    },
    onLoad() {
        //确认用户是否点击过用户提示信息，默认不显示提示
        let self = this;
        uni.getStorage({
            key: 'prompt_start_send',
            fail() {
                self.prompt = true;
            }
        });
        this.status !== 'APPLYING' ? this.initData() : 1;
    },
    computed: {
        ...mapState(['refreshList']),
        /**
         * 可滚动区域的高度
         */
        bodyHeight: function() {
            let sys = uni.getSystemInfoSync();
            return sys.screenHeight - sys.statusBarHeight - (sys.windowWidth / 750) * 190;
        }
    },
    watch: {
        refreshList(newValue) {
            let item = this.tabBars.find(item => item.id === newValue);
            item.fun && typeof this[item.fun] === 'function' ? this[item.fun]() : 1;
        },
        status(newValue) {
            newValue !== 'APPLYING' ? this.initData() : 1;
        }
    },
    methods: {
        /**
         * 开始touch事件，记录位置
         */
        touchStart(e) {
            startY = e.clientY;
        },
        /**
         * touchmove的时候记录位置
         */
        touchMove(e) {
            endY = e.clientY;
        },
        /**
         * touch结束，根据记录的位置判断是否需要下拉刷新和上滑加载
         */
        touchEnd(e) {
            if (endY - startY > 30) {
                //如果下拉一段距离且滚动条已到顶部，开启下拉刷新
                //暂定下拉距离为30像素
                uni.createSelectorQuery()
                    .select('#scroll' + this.tabIndex)
                    .scrollOffset(({ scrollTop }) => {
                        if (scrollTop === 0) {
                            this.refresh();
                        }
                    })
                    .exec();
            }
            /* else if (startY - endY > 30) {
                //如果上滑一段距离且滚动条要到底部时，开启加载更多
                //暂定下拉距离为30像素，底部距离为100像素
                uni.createSelectorQuery()
                    .selectAll('#scroll' + this.tabIndex + ' .media-item')
                    .boundingClientRect(e => {
                        if (e.length && e[e.length - 1] && e[e.length - 1].bottom) {
                            let sys = uni.getSystemInfoSync();
                            Math.abs(sys.screenHeight - e[e.length - 1].bottom) < 100
                                ? this.loadMore()
                                : 1;
                        }
                    })
                    .exec();
            } */
            startY = endY = 0;
        },
        /**
         * 初始化数据
         */
        initData() {
            this.tabBars.forEach(item => {
                item.fun && typeof this[item.fun] === 'function' ? this[item.fun]() : 1;
            });
        },
        /**
         * 获取进行中的派送单列表
         */
        getWorking(callback) {
            let self = this;
            httpService.post({
                data: {
                    method: METHODS.workingOrderList,
                    data: {}
                },
                success: function(res) {
                    if (res.success) {
                        res.data.forEach(
                            e => (
                                (e.workOrder.arriveTimeFormat = dateFormat(
                                    e.workOrder.arriveTime,
                                    'HH:mm'
                                )),
                                (e.deliveryOrder.estimatedDeliveryTimeFormat = dateFormat(
                                    e.deliveryOrder.estimatedDeliveryTime,
                                    'HH:mm'
                                ))
                            )
                        );
                        let item = self.tabBars.find(e => e.id === 'working');
                        item.data = res.data;
                        item.count = res.data.length;
                        callback && typeof callback === 'function' ? callback() : 1;
                    } else {
                        self.showErrorToast('获取进行中的派送单失败！');
                    }
                },
                fail: function(err) {
                    self.showErrorToast('获取进行中的派送单失败！');
                }
            });
        },
        /**
         * 获取已取消的派送单列表
         */
        getCanceled(callback) {
            let self = this;
            httpService.post({
                data: {
                    method: METHODS.canceledOrderList,
                    data: {}
                },
                success: function(res) {
                    if (res.success) {
                        res.data.forEach(
                            e => (
                                (e.workOrder.arriveTimeFormat = dateFormat(
                                    e.workOrder.arriveTime,
                                    'HH:mm'
                                )),
                                (e.deliveryOrder.estimatedDeliveryTimeFormat = dateFormat(
                                    e.deliveryOrder.estimatedDeliveryTime,
                                    'HH:mm'
                                ))
                            )
                        );
                        let item = self.tabBars.find(e => e.id === 'canceled');
                        item.data = res.data;
                        item.count = res.data.length;
                        callback && typeof callback === 'function' ? callback() : 1;
                    } else {
                        self.showErrorToast('获取已取消的派送单失败！');
                    }
                },
                fail: function(err) {
                    self.showErrorToast('获取已取消的派送单失败！');
                }
            });
        },
        /**
         * 获取已退货的派送单列表
         */
        getRefund(callback) {
            let self = this;
            httpService.post({
                data: {
                    method: METHODS.refundOrderList,
                    data: {}
                },
                success: function(res) {
                    if (res.success) {
                        res.data.forEach(
                            e =>
                                (e.workOrder.arriveTimeFormat = dateFormat(
                                    e.workOrder.arriveTime,
                                    'HH:mm'
                                ))
                        );
                        let item = self.tabBars.find(e => e.id === 'refund');
                        item.data = res.data;
                        item.count = res.data.length;
                        callback && typeof callback === 'function' ? callback() : 1;
                    } else {
                        self.showErrorToast('获取已退货的配送单失败！');
                    }
                },
                fail: function(err) {
                    self.showErrorToast('获取已退货的配送单失败！');
                }
            });
        },
        /**
         * 打开配送单详情页面
         */
        goDetail(item) {
            uni.navigateTo({
                url: '../send-detail/send-detail?data=' + JSON.stringify(item)
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
                        self.getWorking();
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
         * 加载更多数据
         */
        loadMore(e) {
            this.loadMoreAnimation = showAnimation;
            setTimeout(() => {
                this.loadMoreAnimation = hideAnimation;
            }, 1000);
        },
        /**
         * 下拉刷新数据
         */
        refresh(e) {
            this.animation = showAnimation;
            let item = this.tabBars[this.tabIndex];
            item.fun && typeof this[item.fun] === 'function'
                ? this[item.fun](() => {
                      this.animation = hideAnimation;
                  })
                : 1;
        },
        /**
         * 切换tab，这个函数从uni示例中抄来的，建议不要随便改动
         */
        async changeTab(e) {
            let index = e.target.current;
            if (this.isClickChange) {
                this.tabIndex = index;
                this.isClickChange = false;
                return;
            }
            let tabBar = await this.getElSize('tab-bar'),
                tabBarScrollLeft = tabBar.scrollLeft;
            let width = 0;

            for (let i = 0; i < index; i++) {
                let result = await this.getElSize(this.tabBars[i].id);
                width += result.width;
            }
            let winWidth = uni.getSystemInfoSync().windowWidth,
                nowElement = await this.getElSize(this.tabBars[index].id),
                nowWidth = nowElement.width;
            if (width + nowWidth - tabBarScrollLeft > winWidth) {
                this.scrollLeft = width + nowWidth - winWidth;
            }
            if (width < tabBarScrollLeft) {
                this.scrollLeft = width;
            }
            this.isClickChange = false;
            this.tabIndex = index; //一旦访问data就会出问题
        },
        /**
         * 这个函数从uni示例中抄来的，建议不要随便改动
         */
        getElSize(id) {
            //得到元素的size
            return new Promise((res, rej) => {
                uni.createSelectorQuery()
                    .select('#' + id)
                    .fields(
                        {
                            size: true,
                            scrollOffset: true
                        },
                        data => {
                            res(data);
                        }
                    )
                    .exec();
            });
        },
        /**
         * 这个函数从uni示例中抄来的，建议不要随便改动
         */
        async tapTab(e) {
            //点击tab-bar
            if (this.tabIndex === e.target.dataset.current) {
                return false;
            } else {
                let tabBar = await this.getElSize('tab-bar'),
                    tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft
                this.scrollLeft = tabBarScrollLeft;
                this.isClickChange = true;
                this.tabIndex = e.target.dataset.current;
            }
        },
        /**
         * 用户点击提示信息之后，不再显示提示信息，存储在app数据空间中，不清理数据都不会再显示
         */
        setPromptStartSend() {
            let self = this;
            uni.setStorage({
                key: 'prompt_start_send',
                data: true,
                success() {
                    self.prompt = false;
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
page {
    display: flex;
}

.index {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
}

.list {
    width: 750upx;
    height: 100%;
}

.swiper-tab {
    width: 100%;
    white-space: nowrap;
    line-height: 100upx;
    height: 100upx;
    border-bottom: 1px solid #c8c7cc;
    display: flex;
    flex-direction: row;
}

.swiper-tab-list {
    font-size: 30upx;
    /* width: 150upx; */
    /* display: inline-block; */
    flex: 1;
    text-align: center;
    color: #555;
}

.active {
    color: #007aff;
}

.swiper-box {
    flex: 1;
    width: 100%;
    height: calc(100% - 100upx);
}

.loadmore {
    height: 70upx;
    width: 750upx;
    flex-direction: column;
    justify-content: center;
}

.loadmore-text {
    font-size: 30upx;
    text-align: center;
    color: #999999;
}
.loading {
    width: 100%;
    height: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    & > image {
        width: 30px;
        height: 30px;
    }
}
.prompt {
    height: 148upx;
    background-color: #f8e71c;
    flex-direction: row;
    padding: 0upx 36upx;
}
.prompt-left {
    flex: 2;
    flex-direction: column;
    overflow: hidden;
    font-size: 24upx;
    color: #333333;
    align-items: flex-end;
    justify-content: center;
}
.prompt-right {
    flex: 1;
    align-items: flex-end;
    justify-content: center;
}
.applying {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
