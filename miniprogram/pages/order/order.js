const thread = require('../../utils/thread.js')

Page({

    data: {
        triggered: false
    },

    onLoad: function () {

    },

    onShow: function () {
        this.getTabBar().init();
    },

    onRefresh: function () {
    },

    onRestore: function () {
    }

})
