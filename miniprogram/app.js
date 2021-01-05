import api from 'wechat-request';

App({
    globalData: {
        appid: "wxdd5f28543852c63d",
        secret: "",
        openid: "",
        userid: "",
        userInfo: null,
        location: false
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
                this.globalData.location = res.authSetting['scope.userLocation'];
            }
        });

        api.defaults.baseURL = 'https://service.thisdk.cool/ordering';

        api.defaults.timeout = 15 * 1000;

        api.defaults.headers.post['Content-Type'] = 'application/json';

        api.interceptors.response.use(fulfilled => {
            if (fulfilled.status !== 200) {
                return Promise.reject("http status code : " + fulfilled.status);
            }
            let data = fulfilled.data;
            if (data.code !== 0) {
                return Promise.reject(data.msg);
            } else {
                return data.data;
            }
        }, rejected => {
            return Promise.reject(rejected.errMsg);
        });

    }
})
