const cloud = require('../../utils/cloud.js')
const thread = require('../../utils/thread.js')

const app = getApp()

Page({
    data: {
        show: false,
        showCart: false,
        hasUserOpenId: false,
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        background: ['swiper-item-1', 'swiper-item-2', 'swiper-item-3'],
        category: 0,
        foodDataInfo: null,
        cart: {
            total: 0,
            quantity: 0,
            list: []
        }
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
        console.log(this.data.cart);
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
    requestIndexInfo: async function () {
        await thread.delay(1500);
        let array = this.generateJsonData();
        let data = this.transformJsonToUiData(array);
        this.setData({
            foodDataInfo: data
        })
        this.updateCartInfo();
    },
    transformJsonToUiData(array) {
        return [...new Set([...array.map(i => i.tag), ...array.map(i => i.category)])].filter(item => item != null).map(item => {
            return {
                category: item,
                list: array.filter(i => i.category === item || i.tag === item)
            }
        });
    },
    generateJsonData: function () {
        let array = [];
        array.push({
            id: thread.uuid(),
            category: '菜单',
            tag: "热销",
            title: "佛跳墙",
            desc: "宇宙无敌佛跳墙",
            origin: 0,
            price: 188888,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: "推荐",
            title: "黯然销魂饭",
            desc: "洋葱,我加了洋葱.",
            origin: 0,
            price: 3990,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: "推荐",
            title: "黄金蛋炒饭",
            desc: "炒饭界的劳斯莱斯",
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
            origin: 0,
            price: 1380,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        }, {
            id: thread.uuid(),
            category: '菜单',
            tag: "热销",
            title: "蛋炒饭",
            desc: "看起来普普通通的炒饭,但是架不住便宜呀.",
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
            origin: 0,
            price: 1580,
            thumb: "https://img.yzcdn.cn/vant/ipad.jpeg",
            quantity: 1
        });
        return array;
    }
})
