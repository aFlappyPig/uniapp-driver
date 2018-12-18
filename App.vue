<script>
import { mapMutations } from 'vuex';
import { initPosition } from 'utils/util.js';

export default {
    onLaunch: function() {
        console.log('App Launch');
        //计算底部btn的位置，用于有底部button且有input的输入框的页面
        //主要解决软键盘弹出时顶起底部button
        let btnTop = initPosition();
        this.setBtnTop(btnTop);
    },
    onShow: function() {
        console.log('App Show');
    },
    onHide: function() {
        console.log('App Hide');
    },
    methods: {
        ...mapMutations(['setBtnTop'])
    }
};
</script>

<style lang="scss">
/*每个页面公共css */

page,
view {
    display: flex; /* uni-app默认使用flex布局。因为flex布局有利于跨更多平台，尤其是采用原生渲染的平台。如不了解flex布局，请参考http://www.w3.org/TR/css3-flexbox/。若不需要flex布局可删除本行*/
    font-family: PingFangSC-Regular;
}

page {
    min-height: 100%;
}
.status-bar {
    width: 100%;
    height: var(--status-bar-height);
    background-color: #9b9b9b;
    position: sticky;
    left: 0;
    top: 0;
    z-index: 1;
}
.navigate-bar {
    height: 44px;
}
.navigate-bar-icon {
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
}
.input-placeholder {
    font-size: 30upx;
    color: #9b9b9b;
}
.fl {
    float: left;
}
.fr {
    float: right;
}
.clearfix:after {
    clear: both;
    content: '';
    visibility: hidden;
    height: 0;
}
.text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.text-right {
    text-align: right;
}
.text-center {
    text-align: center;
}
.text-bold {
    font-weight: bold;
}
button.btn {
    opacity: 1;
    color: #ffffff;
    font-size: 30upx;
    height: 98upx;
    line-height: 98upx;
    border-radius: 2px;
}
button[type='primary'].btn {
    background-color: #318af3;
}
button[disabled].btn {
    opacity: 0.6;
}
button[type='warn'].btn {
    background-color: #ee7b46;
}
button[type='danger'].btn {
    background-color: #fd3844;
}
</style>
