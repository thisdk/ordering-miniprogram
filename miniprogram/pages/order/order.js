import api from "wechat-request";

const thread = require('../../utils/thread.js')

const app = getApp();

Page({

    data: {
        triggered: false
    },

    onLoad: function () {
        this.getOrderList()
    },

    onShow: function () {
        this.getTabBar().init();
    },

    getOrderList: async function () {
        await api.post("/order/query", {
            openid: app.globalData.openid
        });
    },

    onRefresh: function () {
    },

    onRestore: function () {
    }

})
