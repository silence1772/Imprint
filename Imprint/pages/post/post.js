const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 登录提示框默认隐藏
    loginLayerHidden: true,
    // 发布按钮禁用状态，默认禁用
    canotPost: true,
    // 发布完成状态
    postFlag: false,
    // 最多图片数量
    maxImageCount: 9,
    // 上传图片临时index
    tempIndex: 0,
    // 上传图片临时列表
    tempFilePaths: [],
    // 本地图片列表
    imageList: [],
    // 图片地址列表
    imageUrlList: [],
    // 请求参数
    record: {
      lon: 0.0,
      lat: 0.0,
      category: 0,
      openid: "",
      avatar: "",
      nickname: "",
      content: "",
      piclist: [],
      visibleflag: 0
    },
    // 是否设置为仅附近可见
    visibleFlag: 0,
  },

  // 隐藏登录提示框
  hiddenLoginLayer: function () {
    this.setData({
      loginLayerHidden: true
    })
  },

  // 切换visibleFlag选中状态
  selectVisible: function () {
    if (this.data.visibleFlag == 0) {
      this.setData({
        visibleFlag: 1
      })
    } else {
      this.setData({
        visibleFlag: 0
      })
    }
  },

  // 保存用户信息
  bindGetUserInfo: function (e) {
    var avatarUrl = e.detail.userInfo.avatarUrl
    var nickName = e.detail.userInfo.nickName
    if (avatarUrl != "") {
      wx.setStorageSync('avatarUrl', avatarUrl)
      wx.setStorageSync('nickName', nickName)
      this.hiddenLoginLayer()
    }
  },

  // 添加图片
  addImage: function () {
    var that = this
    wx.chooseImage({
      count: that.data.maxImageCount,
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          tempFilePaths: tempFilePaths
        })
        // 启动上传等待中...  
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        // 遍历缓存图片上传服务器
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: app.globalData.apiList.uploadFile,
            filePath: tempFilePaths[i],
            name: 'image',
            formData: {
              openid: wx.getStorageSync('openid')
            },
            success: function (res) {
              console.log(res)
              // 更新图片URL列表
              var data = JSON.parse(res.data)
              var tempImageUrlList = that.data.imageUrlList
              tempImageUrlList.push(data.filepath)
              // 更新本地图片列表及数量
              var tempCount = that.data.maxImageCount - 1
              var tempImageList = that.data.imageList
              var imageItem = that.data.tempFilePaths[that.data.tempIndex]
              tempImageList.push(imageItem)
              // 更新数据
              that.setData({
                imageUrlList: tempImageUrlList,
                imageList: tempImageList,
                maxImageCount: tempCount,
                tempIndex: that.data.tempIndex + 1
              })
              // 更新发布按钮禁用状态
              if (that.data.imageUrlList.length != 0) {
                that.setData({
                  canotPost: false
                })
              }
              wx.hideToast();
            },
            fail: function (res) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          })
        }
        // 恢复tempIndex
        that.setData({
          tempIndex: 0
        })
      },
    })
  },

  // 显示图片大图
  previewImage: function (e) {
    var index = e.currentTarget.dataset.index,
      tempImageList = this.data.imageList;
    wx.previewImage({
      urls: tempImageList,
      current: tempImageList[index]
    })
  },

  // 删除图片
  deleteImage: function (e) {
    var tempCount = this.data.maxImageCount + 1,
      index = parseInt(e.currentTarget.dataset.index),
      tempImageList = this.data.imageList,
      tempImageUrlList = this.data.imageUrlList;
    // 请求后台
    wx.request({
      url: app.globalData.apiList.deleteFile + this.data.imageUrlList[index],
      method: 'DELETE',
      success: function (res) {
        console.log(res)
      },
      fail: function () {
        console("删除失败")
      }
    })
    // 更新列表
    tempImageList.splice(index, 1)
    tempImageUrlList.splice(index, 1)
    this.setData({
      imageList: tempImageList,
      imageUrlList: tempImageUrlList,
      maxImageCount: tempCount
    })
    // 更新发布按钮禁用状态
    if (this.data.imageUrlList.length == 0) {
      this.setData({
        canotPost: true
      })
    }
  },

  // 发布动态
  post: function (e) {
    var that= this
    // 判断是否已登录
    if (wx.getStorageSync('avatarUrl') != "" && wx.getStorageSync('nickName') != "") {
      wx.showLoading({
        title: '发布中',
        mask: true
      })
      // 深拷贝
      var tempList = JSON.parse(JSON.stringify(this.data.imageUrlList))
      // 拼接上后台静态文件地址变成完整url
      for (var i = 0; i < tempList.length; i++) {
        tempList[i] = app.globalData.apiList.staticPath + tempList[i]
      }
      this.setData({
        "record.content": e.detail.value.content,
        "record.piclist": tempList,
        "record.avatar": wx.getStorageSync('avatarUrl'),
        "record.nickname": wx.getStorageSync('nickName'),
        "record.visibleflag": this.data.visibleFlag
      })
      // 请求后台
      wx.request({
        url: app.globalData.apiList.createRecord,
        method: 'POST',
        data: this.data.record,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res)
          that.setData({
            postFlag: true
          })
          wx.hideLoading()
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 1000,
            mask: true
          })
          // 返回上一级页面
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        },
        fail: function (res) {
          console.log(res)
          wx.hideLoading()
          wx.showModal({
            title: '错误提示',
            content: '发布失败,请重试',
            showCancel: false,
            success: function (res) { }
          })

        }
      })
    } else {
      //显示登录提示框
      this.setData({
        loginLayerHidden: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      "record.lon": options.lon,
      "record.lat": options.lat,
      "record.category": options.category,
      "record.openid": wx.getStorageSync('openid')
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
    if (this.data.postFlag == false) {
      for (var i = 0; i < this.data.imageUrlList.length; i++) {
        wx.request({
          url: app.globalData.apiList.deleteFile + this.data.imageUrlList[i],
          method: 'DELETE',
          success: function (res) {
            console.log(res)
          },
          fail: function () {
            console("删除失败")
          }
        })
      }
    }
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