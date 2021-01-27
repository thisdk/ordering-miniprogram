import rpx2px from '../../utils/rpx2px.js';

const thread = require('../../utils/thread.js')
const QRCode = require('../../utils/weapp-qrcode.js')

Page({

    data: {
        order: null,
        qrcodeWidth: rpx2px(300),
        qrcodeHeight: rpx2px(300),
        qrcode: null,
        createQrcode: false,
        codeText: null,
        showDialog: false
    },

    onLoad: function (options) {
        try {
            let order = JSON.parse(options.cart)
            this.setData({order: order})
        } catch (e) {
            console.log(e)
        }
    },

    onItemClick: async function (event) {
        let item = event.currentTarget.dataset.id
        if (!item.enabled) return
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

})
