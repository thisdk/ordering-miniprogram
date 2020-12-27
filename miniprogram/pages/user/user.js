const app = getApp()

Page({
    data: {
        user: {}
    },
    onLoad: function (options) {
        this.setData({user: app.globalData.userInfo})
    },
    onShow: function () {
        this.getTabBar().init();
    },
})
