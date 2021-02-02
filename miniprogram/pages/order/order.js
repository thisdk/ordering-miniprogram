import api from '../../utils/wechat-request/index';
import dayjs from "dayjs";
import rpx2px from '../../utils/rpx2px.js';


const isToday = require('../../utils/isToday.js')
const thread = require('../../utils/thread.js')
const QRCode = require('../../utils/weapp-qrcode.js')

Page({
    data: {
        tips: "",
        triggered: false,
        orderArrayList: null,
        qrcodeWidth: rpx2px(300),
        qrcodeHeight: rpx2px(300),
        qrcode: null,
        createQrcode: false,
        codeText: null,
        showDialog: false
    },
    onLoad: function () {
        dayjs.extend(isToday)
        this.getOrderList()
    },
    onShow: function () {
        this.getTabBar().init();
    },
    getOrderList: async function () {
        try {
            this.setData({
                triggered: true,
                tips: "正在获取..."
            });
            let res = await api.post("/program/order/querySelfOrder", null)
            res = res.map(it => {
                it.createTimeStr = dayjs(it.createTime).format('YYYY-MM-DD HH:mm:ss')
                if (it.obtainTime) {
                    it.obtainTimeStr = dayjs(it.obtainTime).format('YYYY-MM-DD HH:mm:ss')
                }
                it.enabled = dayjs(it.createTime).isToday()
                switch (it.status) {
                    case 1: {
                        it.statusStr = "已付款";
                        break;
                    }
                    case 2: {
                        it.statusStr = "已取餐";
                        break;
                    }
                    case 3: {
                        it.statusStr = "已取消";
                        break;
                    }
                    default: {
                        it.statusStr = "异常";
                    }
                }
                if (!it.enabled) it.statusStr = "已过期";
                return it;
            }).reverse()
            this.setData({
                triggered: false,
                orderArrayList: res.length === 0 ? null : res,
                tips: res.length === 0 ? "暂无订单" : ""
            });
        } catch (e) {
            console.log(e)
            this.setData({
                triggered: false,
                tips: "获取订单失败"
            });
        }
    },
    onItemClick: async function (event) {
        let item = event.currentTarget.dataset.id
        if (!item.enabled || item.status !== 1) return
        this.setData({
            qrcode: null,
            showDialog: true,
            createQrcode: true,
            codeText: item.code
        });
        let qrcode = new QRCode('canvas', {
            text: Date.now() + '-' + event.currentTarget.dataset.id,
            width: this.data.qrcodeWidth,
            height: this.data.qrcodeHeight,
            colorDark: "#333333",
            colorLight: "white",
            correctLevel: QRCode.CorrectLevel.H,
        });
        await thread.delay(1000);
        if (this.data.createQrcode) {
            this.setData({
                qrcode: qrcode,
                createQrcode: false
            });
        }
    },
    qrcodeDialogClose: function () {
        this.setData({
            qrcode: null,
            createQrcode: false
        });
    },
    onOrderClick: function (event) {
        wx.navigateTo({
            url: '../details/details?cart=' + JSON.stringify(event.currentTarget.dataset.item)
        })
    },
    onRefresh: function () {
        this.getOrderList();
    }
})
