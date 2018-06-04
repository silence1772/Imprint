const app = getApp()
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 上方区域高度
    upheight: 0,
    downheight: 0,
    count: 0,
    cards: [{
      Id: "5b1299036f6eac643837477d",
      avatar: "https://api.silence1772.cn/static/od9XS5AoRlmj-HZtUGKJUk2EHsWM/1527945196_59_wx1a0df4a001bd9060.o6zAJs2nDhOOFuLIYbgjgpKX7Dss.PjACbwkjrA9A0b7c34402a26d754d86a0994ad303e05.png",
      content: "这里还没有任何印迹哦",
      nickname: "管理员",
      shortcut: "",
      timestamp: "刚刚",
      views: 0,
      voteups: 0
    }]
  },

  gotoDetail: function (e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: app.globalData.apiList.getRecordList,
      data: {
        category: options.category,
        openid: wx.getStorageSync('openid')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.data != null) {
          res.data.data.reverse()
          for (var i = 0; i < res.data.data.length; i++) {
            res.data.data[i].timestamp = util.formatMsgTime(res.data.data[i].timestamp)
          }
          console.log(res)
          that.setData({
            cards: res.data.data,
            count: res.data.data.length
          })
        }
      },
      fail: function () {
        console.log("请求失败")
      }
    })
    this.setData({
      upheight: wx.getStorageSync("screenH") * 0.08,
      downheight: wx.getStorageSync("screenH") * 0.92,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})