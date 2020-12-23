App({
    globalData: {
        appid: "wxdd5f28543852c63d",
        secret: "",
        openid: "",
        userInfo: null
    },
    onLaunch: function () {
        // 初始化云开发
        if (wx.cloud) {
            wx.cloud.init({
                traceUser: true,
            })
        }
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: res => {
                            this.globalData.userInfo = res.userInfo
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    }
})
