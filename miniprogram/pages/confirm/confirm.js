const thread = require('../../utils/thread.js')

import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

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
            this.onPaySuccess();
        }).catch(() => {
            this.setData({submit: false});
        });
    },

    onPaySuccess: async function () {
        await thread.delay(1500);
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
