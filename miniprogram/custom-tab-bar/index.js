const app = getApp()

Component({
    data: {
        active: 0,
        list: [
            {
                icon: 'home-o',
                text: '主页',
                url: '/pages/index/index'
            },
            {
                icon: 'orders-o',
                text: '订单',
                url: '/pages/order/order'
            },
            {
                icon: 'user-o',
                text: '我',
                url: '/pages/user/user'
            }
        ]
    },
    methods: {
        onChange(event) {
            if(!app.globalData.userInfo) return;
            this.setData({active: event.detail});
            wx.switchTab({
                url: this.data.list[event.detail].url
            });
        },
        init() {
            const page = getCurrentPages().pop();
            this.setData({
                active: this.data.list.findIndex(item => item.url === `/${page.route}`)
            });
        }
    }
})
