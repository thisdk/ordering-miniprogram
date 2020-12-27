const cloud = require('../../utils/cloud.js')
const thread = require('../../utils/thread.js')

const app = getApp()

import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({
    data: {
        config: {
            serviceTime: [9, 21]
        },
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
        let obj = list.find(e => e.id === item.id)
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
            });
        }
    },
    initUserOpenId: function () {
        cloud.call("login", {}, res => {
            console.log('[云函数] [login] user openid: ', res.result.openid);
            app.globalData.openid = res.result.openid;
            this.setData({
                hasUserOpenId: true
            });
        }, err => {
            console.error('[云函数] [login] 调用失败', err);
        })
    },
    getUserInfo: function (res) {
        if (res.detail.userInfo) {
            app.globalData.userInfo = res.detail.userInfo;
            this.setData({
                hasUserInfo: true
            });
        }
    },
    showPopupWindow: async function () {
        await thread.delay(1500);
        this.setData({show: true});
    },
    checkFoodAvailable: function () {
        let hours = new Date().getHours();
        this.data.foodArrayList
            .filter(i => i.category === "全部")
            .forEach(e => e.list.forEach(item => {
                item.available = hours >= item.time[0] && hours < item.time[1];
            }));
        this.setData({foodArrayList: this.data.foodArrayList})
    },
    requestIndexInfo: async function () {
        await thread.delay(1500);
        let array = this.generateJsonData();
        this.setData({
            foodArrayList: this.transformJsonToUiData(this.serviceHoursHandler(array))
        });
        this.updateCartInfo();
        this.checkFoodAvailable()
    },
    serviceHoursHandler: function (array) {
        let serviceTime = this.data.config.serviceTime;
        return array.map(e => {
            if (!e.time) {
                e.time = serviceTime
            }
            return e
        });
    },
    transformJsonToUiData(array) {
        return [...new Set([...array.map(i => i.category)]), "全部"].filter(item => item != null).map(item => {
            return {
                category: item,
                list: array.filter(i => i.category === item || item === "全部")
            }
        });
    },
    generateJsonData: function () {
        let array = [];
        array.push({
            id: thread.uuid(),
            category: '职员',
            tag: "限时",
            title: "午饭",
            desc: "中午吃的饭",
            time: [7, 9],
            origin: 0,
            price: 1000,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '职员',
            tag: "限时",
            title: "晚饭",
            desc: "晚上吃的饭",
            time: [12, 15],
            origin: 0,
            price: 1000,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '奢华',
            tag: "热销",
            title: "佛跳墙",
            desc: "宇宙无敌佛跳墙",
            time: null,
            origin: 0,
            price: 88888,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '奢华',
            tag: "推荐",
            title: "黯然销魂饭",
            desc: "洋葱,我加了洋葱.",
            time: null,
            origin: 0,
            price: 3990,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '奢华',
            tag: "推荐",
            title: "黄金蛋炒饭",
            desc: "炒饭界的劳斯莱斯",
            time: null,
            origin: 13888,
            price: 8888,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: null,
            title: "酱油炒饭",
            desc: "看起来普普通通的炒饭.",
            time: null,
            origin: 0,
            price: 1380,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: "热销",
            title: "蛋炒饭",
            desc: "看起来普普通通的炒饭,但是实在便宜呀.",
            time: null,
            origin: 0,
            price: 1080,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: null,
            title: "扬州炒饭",
            desc: "看起来普普通通的炒饭.",
            time: null,
            origin: 0,
            price: 1680,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: null,
            title: "葱花煎蛋",
            desc: "看起来普普通通的煎蛋.",
            time: null,
            origin: 0,
            price: 1580,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: "推荐",
            title: "凉瓜煎蛋",
            desc: "非常好吃的煎蛋.",
            time: null,
            origin: 0,
            price: 1580,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        });
        return array;
    }
})
