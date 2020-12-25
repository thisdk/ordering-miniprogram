const thread = require('../../utils/thread.js')

import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({

    data: {
        playing: false,
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

    pay: function () {
        this.setData({playing: true});
        Dialog.confirm({
            title: '支付确定',
            message: '本次演示到此将要激活微信支付,但是本小程序只是模拟流程,无法接入支付.按确定后相当于已经付款.继续流程.',
        }).then(() => {
            this.onPaySuccess();
        }).catch(() => {
            this.setData({playing: false});
        });
    },

    onPaySuccess: async function () {
        await thread.delay(1500);
        this.setData({playing: false});
        Toast({
            type: 'success',
            message: '下单成功',
            onClose: () => {
                wx.reLaunch({
                    url: '/pages/order/order'
                })
            },
        });
    }

})
