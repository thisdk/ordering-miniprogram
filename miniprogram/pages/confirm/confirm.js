import api from "wechat-request";

const thread = require('../../utils/thread.js')

import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp();

Page({

    data: {
        submit: false,
        cart: null
    },

    onLoad: function (options) {
        try {
            let cart = JSON.parse(options.cart)
            this.setData({cart: cart})
        } catch (e) {
            console.log(e)
        }
    },

    submit: function () {
        this.setData({submit: true});
        Dialog.confirm({
            title: '提交确定',
            message: '本次演示到此将要激活微信支付,但是本小程序只是模拟流程,无法接入支付.按确定后继续流程.',
        }).then(() => {
            this.insertOrder()
        }).catch(() => {
            this.setData({submit: false});
        });
    },

    insertOrder: async function () {
        try {
            await api.post("/order/insert", {
                openid: app.globalData.openid,
                total: this.data.cart.total,
                quantity: this.data.cart.quantity,
                list: this.data.cart.list.map(i => {
                    return {
                        foodId: i.id,
                        quantity: i.quantity
                    }
                }),
                phone: "",
                remark: ""
            });
            this.onPaySuccess()
        } catch (e) {
            this.setData({submit: false});
            Toast({
                type: 'fail',
                message: '创建订单失败',
                onClose: () => {
                    wx.reLaunch({
                        url: '/pages/order/order'
                    })
                },
            });
        }
    },

    onPaySuccess: async function () {
        this.setData({submit: false});
        Toast({
            type: 'success',
            message: '提交成功',
            onClose: () => {
                wx.reLaunch({
                    url: '/pages/order/order'
                })
            },
        });
    }

})
