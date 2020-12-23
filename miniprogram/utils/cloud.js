const call = (name, data, success, fail) => {
    wx.cloud.callFunction({
        name: name,
        data: data,
        success: res => success(res),
        fail: err => fail(err)
    });
}

module.exports = {
    call: call
}
