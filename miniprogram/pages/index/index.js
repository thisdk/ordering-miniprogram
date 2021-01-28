const cloud = require('../../utils/cloud.js');
const thread = require('../../utils/thread.js');

const app = getApp();

import api from '../../utils/wechat-request/index';
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
        tips: "加载中..."
    },
    onLoad: function () {
        this.showPopupWindow();
        this.initUserOpenId();
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
                this.updateUserInfo();
            }
        } else {
            wx.getUserInfo({
                success: res => {
                    if (res.userInfo) {
                        app.globalData.userInfo = res.userInfo
                        this.setData({hasUserInfo: true})
                        this.updateUserInfo();
                    }
                }
            });
        }
    },
    getUserInfo: function (res) {
        if (res.detail.userInfo) {
            app.globalData.userInfo = res.detail.userInfo;
            this.setData({hasUserInfo: true});
            this.updateUserInfo();
        }
    },
    updateUserInfo: async function () {
        try {
            let user = app.globalData.userInfo;
            await api.post("/user/update", {
                id: app.globalData.serviceUser.id,
                username: app.globalData.openid,
                password: app.globalData.serviceUser.password,
                openid: app.globalData.openid,
                avatar: user.avatarUrl,
                city: user.city,
                nickname: user.nickName
            });
        } catch (e) {
            console.log(e)
        }
    },
    initUserOpenId: function () {
        cloud.call("login", {}, async res => {
            console.log('[云函数] [login] user openid: ', res.result.openid);
            app.globalData.openid = res.result.openid;
            this.setData({hasUserOpenId: true});
            await this.loginToService()
        }, err => {
            console.error('[云函数] [login] 调用失败', err);
        })
    },
    loginToService: async function () {
        try {
            app.globalData.token = await api.post("/auth/login", {
                username: app.globalData.openid,
                password: app.globalData.openid
            });
            api.defaults.headers['Authorization'] = app.globalData.token;
            await this.getServiceUserInfo()
            await this.requestIndexInfo()
        } catch (e) {
            console.log(e)
            await this.registerToService()
        }
    },
    registerToService: async function () {
        try {
            await api.post("/auth/register", {
                username: app.globalData.openid,
                password: app.globalData.openid
            });
            await this.loginToService()
        } catch (e) {
            console.log(e)
        }
    },
    getServiceUserInfo: async function () {
        try {
            app.globalData.serviceUser = await api.post("/user/query", null);
            this.initUserInfo()
        } catch (e) {
            console.log(e)
        }
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
            let array = await api.post("/program/food/query");
            if (array.length > 0) {
                this.setData({
                    foodArrayList: this.transformJsonToUiData(this.dataQuantityHoursHandler(array))
                });
                this.updateCartInfo();
                this.checkFoodAvailable()
            } else {
                Toast.fail("暂无餐品");
                this.setData({
                    tips: '暂无餐品'
                });
            }
        } catch (e) {
            Toast.fail(e);
            this.setData({
                tips: '服务器异常'
            });
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
