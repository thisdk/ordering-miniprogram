const cloud = require('../../utils/cloud.js');
const thread = require('../../utils/thread.js');

const app = getApp();

import api from 'wechat-request';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({
    data: {
        show: false,
        showCart: false,
        hasUserOpenId: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        hasUserInfo: false,
        category: 0,
        foodArrayList: null,
        cart: {
            total: 0,
            quantity: 0,
            list: []
        },
        timer: null,
        config: {
            serviceTime: [0, 24],
            interval: 10 * 1000
        },
        background: ['swiper-item-1', 'swiper-item-2', 'swiper-item-3'],
    },
    onLoad: function () {
        this.initUserOpenId();
        this.initUserInfo();
        this.showPopupWindow();
        this.requestIndexInfo();
    },
    onShow: function () {
        this.getTabBar().init();
        this.checkFoodAvailable();
        this.data.timer = setInterval(this.checkFoodAvailable, this.data.config.interval);
    },
    onHide: function () {
        clearInterval(this.data.timer);
    },
    updateCartInfo: function () {
        let cart = this.data.cart;
        cart.total = cart.list.map(item => item.price * item.quantity).reduce((prev, next) => prev + next, 0);
        cart.quantity = cart.list.map(item => item.quantity).reduce((prev, next) => prev + next, 0);
        this.setData({cart: cart});
    },
    onFoodItemClick: function (event) {
        let list = this.data.cart.list;
        let item = event.currentTarget.dataset.id;
        let obj = list.find(e => e.id === item.id);
        if (obj) {
            for (let i = 0; i < this.data.cart.list.length; i++) {
                if (this.data.cart.list[i].id === item.id) {
                    this.data.cart.list[i].quantity++;
                }
            }
        } else {
            this.data.cart.list.push(item);
        }
        this.updateCartInfo();
    },
    onFoodItemClickNotAvailable: function (event) {
        let list = this.data.foodArrayList.find(e => e.category === "全部").list;
        let item = event.currentTarget.dataset.id;
        let obj = list.find(e => e.id === item.id)
        Toast.fail("不在服务时段\n" + obj.time[0] + ":00 - " + obj.time[1] + ":00");
    },
    onSidebarChange: function (event) {
        this.setData({category: event.detail});
    },
    onCartClick: function () {
        this.setData({showCart: true});
    },
    onCartPopupClose: function () {
        let cart = this.data.cart;
        cart.list = this.data.cart.list.filter(i => i.quantity !== 0);
        this.setData({
            showCart: false,
            cart: cart
        });
    },
    onCartChange: function (event) {
        let itemId = event.currentTarget.dataset.id;
        for (let i = 0; i < this.data.cart.list.length; i++) {
            if (this.data.cart.list[i].id === itemId) {
                this.data.cart.list[i].quantity = event.detail;
            }
        }
        this.updateCartInfo();
    },
    onOrderingSubmit: function () {
        let cart = this.data.cart;
        cart.list = this.data.cart.list.filter(i => i.quantity !== 0);
        this.setData({
            showCart: false,
            cart: cart
        });
        if (this.data.cart.quantity !== 0) {
            wx.navigateTo({
                url: '../confirm/confirm?cart=' + JSON.stringify(this.data.cart)
            })
        } else {
            Toast.fail('没有餐品');
        }
    },
    initAppLocation: function () {
        wx.authorize({
            scope: 'scope.userLocation',
            success() {
                app.globalData.location = true;
            },
            fail() {
                app.globalData.location = false;
            }
        })
    },
    initUserInfo: function () {
        if (app.globalData.userInfo) {
            this.setData({hasUserInfo: true})
        } else if (this.data.canIUse) {
            app.userInfoReadyCallback = res => {
                app.globalData.userInfo = res.userInfo
                this.setData({hasUserInfo: true})
                this.updateUserInfo(app.globalData.openid, res.userInfo);
            }
        } else {
            wx.getUserInfo({
                success: res => {
                    if (res.userInfo) {
                        app.globalData.userInfo = res.userInfo
                        this.setData({hasUserInfo: true})
                        this.updateUserInfo(app.globalData.openid, res.userInfo);
                    }
                }
            });
        }
    },
    getUserInfo: function (res) {
        if (res.detail.userInfo) {
            app.globalData.userInfo = res.detail.userInfo;
            this.setData({hasUserInfo: true});
            this.updateUserInfo(app.globalData.openid, res.detail.userInfo);
        }
    },
    updateUserInfo: async function (openid, userInfo) {
        try {
            let result = await api.get("/user/query?openid=" + openid);
            app.globalData.userid = result.id;
            await api.post("/user/insert", {
                id: result.id,
                openid: openid,
                avatarUrl: userInfo.avatarUrl,
                city: userInfo.city,
                nickName: userInfo.nickName
            });
        } catch (e) {
            await api.post("/user/insert", {
                openid: openid,
                avatarUrl: userInfo.avatarUrl,
                city: userInfo.city,
                nickName: userInfo.nickName
            });
        }
    },
    initUserOpenId: function () {
        cloud.call("login", {}, res => {
            console.log('[云函数] [login] user openid: ', res.result.openid);
            app.globalData.openid = res.result.openid;
            this.setData({hasUserOpenId: true});
        }, err => {
            console.error('[云函数] [login] 调用失败', err);
        })
    },
    showPopupWindow: async function () {
        await thread.delay(1500);
        this.setData({show: true});
    },
    checkFoodAvailable: function () {
        if (!this.data.foodArrayList || this.data.foodArrayList.length === 0) return;
        let hours = new Date().getHours();
        this.data.foodArrayList
            .filter(i => i.category === "全部")
            .forEach(e => e.list.forEach(item => {
                item.available = hours >= item.time[0] && hours < item.time[1];
            }));
        this.setData({foodArrayList: this.data.foodArrayList})
    },
    requestIndexInfo: async function () {
        try {
            let array = await api.post("/food/query");
            this.setData({
                foodArrayList: this.transformJsonToUiData(this.dataQuantityHoursHandler(array))
            });
            this.updateCartInfo();
            this.checkFoodAvailable()
        } catch (e) {
            Toast.fail(e);
        }
    },
    dataQuantityHoursHandler: function (array) {
        let serviceTime = this.data.config.serviceTime;
        return array.map(e => {
            if (!e.time) {
                e.time = serviceTime;
            }
            e.quantity = 1;
            return e;
        });
    },
    transformJsonToUiData(array) {
        return [...new Set([...array.map(i => i.category)]), "全部"].filter(item => item != null).map(item => {
            return {
                category: item,
                list: array.filter(i => i.category === item || item === "全部")
            }
        });
    }
})
