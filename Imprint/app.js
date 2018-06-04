const server = "https://api.silence1772.cn"

//app.js
App({
  onLaunch: function () {
    //获取设备的信息
    wx.getSystemInfo({
      success: function (res) {
        var screenW = res.windowWidth
        var screenH = res.windowHeight
        wx.setStorageSync('screenW', screenW)
        wx.setStorageSync('screenH', screenH)
      }
    })

    if (wx.getStorageSync('openid') == '') {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({
            url: this.globalData.apiList.login,
            method: 'POST',
            data: {
              code: res.code
            },
            success: function (res) {
              console.log(res)
              wx.setStorageSync('openid', res.data.openid)
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }
      })
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // 全局变量
  globalData: {
    userInfo: null,

    apiList: {
      login: server + "/login",
      staticPath: server + "/static",
      recordlist: server + "/recordlist",
      uploadFile: server + "/uploadfile",
      deleteFile: server + "/deletefile",
      createRecord: server + "/createrecord",
      getRecord: server + "/getrecord",
      deleteRecord: server + "/deleterecord",
      createStar: server + "/createstar",
      cancelStar: server + "/cancelstar",
      createVote: server + "/createvote",
      createComment: server + "/createcomment",
      getRecordList: server + "/getrecordlist",
    }
  }
})