const cloud = require('../../utils/cloud.js')
const thread = require('../../utils/thread.js')

const app = getApp()

Page({
    data: {
        show: false,
        hasUserOpenId: false,
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        activeKey: "",
        background: ['swiper-item-1', 'swiper-item-2', 'swiper-item-3'],
    },
    onLoad: function () {
        this.initUserOpenId();
        this.initUserInfo();
        this.showPopupWindow();
    },
    onShow() {
        this.getTabBar().init();
    },
    async showPopupWindow() {
        await thread.delay(1500);
        this.setData({show: true});
    },
    onPopupClose() {

    },
    onOrderingSubmit() {

    },
    initUserInfo() {
        if (app.globalData.userInfo) {
            this.setData({
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            app.userInfoReadyCallback = res => {
                app.globalData.userInfo = res.userInfo
                this.setData({
                    hasUserInfo: true
                })
            }
        } else {
            wx.getUserInfo({
                success: res => {
                    if (res.userInfo) {
                        app.globalData.userInfo = res.userInfo
                        this.setData({
                            hasUserInfo: true
                        })
                    }
                }
            })
        }
    },
    initUserOpenId() {
        cloud.call("login", {}, res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            app.globalData.openid = res.result.openid
            this.setData({
                hasUserOpenId: true
            })
        }, err => {
            console.error('[云函数] [login] 调用失败', err)
        })
    },
    getUserInfo: function (res) {
        if (res.detail.userInfo) {
            app.globalData.userInfo = res.detail.userInfo
            this.setData({
                hasUserInfo: true
            })
        }
    },
})
