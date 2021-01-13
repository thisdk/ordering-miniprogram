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

        api.defaults.baseURL = 'https://service.thisdk.cool/ordering/program';

        api.defaults.timeout = 15 * 1000;

        api.defaults.headers.post['Content-Type'] = 'application/json';

        api.interceptors.request.use(config => {
            config.data = {
                param: config.data == null ? null : config.data,
                client: "miniprogram",
                timestamp: Date.now()
            }
            return config;
        }, error => {
            return Promise.reject(error.errMsg);
        });

        api.interceptors.response.use(response => {
            if (response.status !== 200) {
                return Promise.reject("http status code : " + response.status);
            }
            let data = response.data;
            if (data.code !== 0) {
                return Promise.reject(data.msg);
            } else {
                return data.data;
            }
        }, error => {
            return Promise.reject(error.errMsg);
        });

    }
})
