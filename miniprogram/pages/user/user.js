const app = getApp()

Page({
    data: {
        user: {}
    },
    onLoad: function () {
        this.setData({user: app.globalData.userInfo})
    },
    onShow: function () {
        this.getTabBar().init();
    },
})
