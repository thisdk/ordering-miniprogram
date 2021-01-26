import api from '../../utils/wechat-request/index';
import dayjs from "dayjs";
import rpx2px from '../../utils/rpx2px.js';

const thread = require('../../utils/thread.js')
const QRCode = require('../../utils/weapp-qrcode.js')

const app = getApp();

Page({

    data: {
        tips: "列表为空",
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
            let res = await api.post("/order/query", {
                openid: app.globalData.openid
            })
            res = res.map(it => {
                it.createTimeStr = dayjs(it.createTime).format('YYYY-MM-DD HH:mm:ss')
                it.enabled = dayjs(Date.now()).diff(it.createTime, 'day') < 1
                return it;
            }).reverse()
            this.setData({
                triggered: false,
                orderArrayList: res
            });
        } catch (e) {
            console.log(e)
            this.setData({
                triggered: false,
                tips: "获取失败"
            });
        }
    },

    onItemClick: async function (event) {
        this.setData({
            qrcode: null,
            showDialog: true,
            createQrcode: true,
            codeText: event.currentTarget.dataset.id
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
