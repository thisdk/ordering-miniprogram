Page({

    data: {
        order: null
    },

    onLoad: function (options) {
        try {
            let order = JSON.parse(options.cart)
            this.setData({order: order})
        } catch (e) {
            console.log(e)
        }
    },

    onReady: function () {

    },

    onShow: function () {

    }
})
