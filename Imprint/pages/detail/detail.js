const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 登录提示框默认隐藏
    loginLayerHidden: true,
    // 删除按钮默认隐藏
    delButton: false,
    // 印迹内容
    record: {},
    // 收藏状态
    hasStared: false,
    voteFlag: 0,
    category: 0,
    //record: {},
    mainId: "",
    //图片宽度
    width: 0,
    //评论数量
    commentCnt: 0,
    //是否禁用按钮
    disable: true,
    //唤起输入框
    focu: false,
    //是否为回复评论
    isReply: false,
    //要回复的评论的nickname
    commentNickname: "",
    //要回复的评论的id
    commentId: "",
    value: "",
  },

  // 隐藏登录提示框
  hiddenLoginLayer: function () {
    this.setData({
      loginLayerHidden: true
    })
  },

  bindGetUserInfo: function (e) {
    var avatarUrl = e.detail.userInfo.avatarUrl
    var nickName = e.detail.userInfo.nickName
    if (avatarUrl != "") {
      wx.setStorageSync('avatarUrl', avatarUrl)
      wx.setStorageSync('nickName', nickName)
      this.hiddenLoginLayer()
      //this.post()
    }
  },

  // 显示图片大图
  previewImage: function (e) {
    var index = e.currentTarget.dataset.index,
      tempImageList = this.data.record.piclist;
    wx.previewImage({
      urls: tempImageList,
      current: tempImageList[index]
    })
  },

  // 监听输入框 以设置按钮禁用状态
  bindInput: function (e) {
    if (e.detail.value != "") {
      this.setData({
        disable: false
      })
    } else {
      this.setData({
        disable: true
      })
    }
  },

  //唤起回复评论
  bindReply: function (e) {
    this.setData({
      commentId: e.currentTarget.dataset.id,
      commentNickname: e.currentTarget.dataset.nickname,
      isReply: true,
      focu: true,
    })
  },

  //取消回复评论
  cancelReply: function () {
    this.setData({
      isReply: false,
      focu: false,
      commentId: "",
      value: "",
    })
  },

  //发布评论
  postComment: function (e) {
    var that = this
    if (wx.getStorageSync('avatarUrl') != "" && wx.getStorageSync('nickName') != "") {
      wx.request({
        url: app.globalData.apiList.createComment,
        data: {
          openid: wx.getStorageSync('openid'),
          avatar: wx.getStorageSync('avatarUrl'),
          nickname: wx.getStorageSync('nickName'),
          content: e.detail.value.content,
          mainid: that.data.record.Id,
          commentid: that.data.commentId,
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res)
          // 转换时间
          res.data.timestamp = that.formatMsgTime(res.data.timestamp)
          // 更新评论列表
          var temp = that.data.record.comments
          if (res.data.hasOwnProperty("count")) {//根据是否有count属性判断评论性质
            if (temp == null) {
              temp = []
            }
            temp.push(res.data)
          } else {
            for (var i = 0; i < temp.length; i++) {
              if (temp[i].Id == that.data.commentId) {
                if (temp[i].reply == null) {
                  temp[i].reply = []
                }
                temp[i].reply.push(res.data)
                break
              }
            }
          }
          that.setData({
            value: "",
            isReply: false,
            commentId: "",
            focu: false,
            'record.comments': temp,
            commentCnt: that.data.commentCnt + 1,
          })
        },
        fail: function () {
          console.log("请求失败")
        }
      })
    } else {
      //显示登录提示框
      this.setData({
        loginLayerHidden: false
      })
    }
  },

  // 赞同反对
  bindVote: function (e) {
    var that = this
    if (e.currentTarget.id == "up") {
      if (this.data.voteFlag == 0) {
        this.data.category = 1
      } else if (this.data.voteFlag == 1) {
        this.data.category = 2
      } else {
        this.data.category = 3
      }
    } else {
      if (this.data.voteFlag == 0) {
        this.data.category = -1
      } else if (this.data.voteFlag == -1) {
        this.data.category = -2
      } else {
        this.data.category = -3
      }
    }
    wx.request({
      url: app.globalData.apiList.createVote,
      data: {
        mainid: that.data.mainId,
        openid: wx.getStorageSync('openid'),
        category: that.data.category,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          voteFlag: res.data.voteflag
        })
      },
      fail: function () {
        console.log("请求失败")
      }
    })
  },

  // 收藏
  bindCollect: function () {
    var that = this
    if (that.data.hasStared) {
      wx.request({
        url: app.globalData.apiList.cancelStar,
        data: {
          mainid: that.data.mainId,
          openid: wx.getStorageSync('openid')
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          that.setData({
            hasStared: false
          })
        },
        fail: function () {
          console.log("请求失败")
        }
      })
    } else {
      wx.request({
        url: app.globalData.apiList.createStar,
        data: {
          mainid: that.data.mainId,
          openid: wx.getStorageSync('openid')
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          that.setData({
            hasStared: true
          })
        },
        fail: function () {
          console.log("请求失败")
        }
      })
    }
  },

  // 删除印迹
  bindDelete: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '即将永久删除此条印迹，是否确认',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.apiList.deleteRecord,
            data: {
              id: that.data.mainId,
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res)
              wx.showToast({
                title: '删除成功',
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
            fail: function () {
              wx.showToast({
                title: '删除失败',
                duration: 1000,
                mask: true
              })
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      mainId: options.id
    })
  },

  /**
   * 时间戳转文字描述
   */
  formatMsgTime: function (timestamp) {
    // 获取时间戳时间
    var dateTime = new Date(timestamp * 1000);
    // 获取当前时间戳10位
    var now = Math.round(new Date().getTime() / 1000);
    var seconds = 0;
    var timeSpanStr;
    // 时间差
    seconds = now - timestamp;
    // 时间戳格式化
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();

    if (seconds <= 60 * 1) {
      timeSpanStr = '刚刚';
    }
    else if (60 * 1 < seconds && seconds <= 60 * 60) {
      timeSpanStr = Math.round((seconds / (60))) + '分钟前';
    }
    else if (60 * 60 * 1 < seconds && seconds <= 60 * 60 * 24) {
      timeSpanStr = Math.round(seconds / (60 * 60)) + '小时前';
    }
    else if (60 * 60 * 24 < seconds && seconds <= 60 * 60 * 24 * 15) {
      timeSpanStr = Math.round(seconds / (60 * 60 * 24)) + '天前';
    }
    else if (seconds > 60 * 60 * 24 * 15 && year == now.getFullYear()) {
      timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    }
    return timeSpanStr;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    wx.request({
      url: app.globalData.apiList.getRecord,
      data: {
        id: that.data.mainId,
        openid: wx.getStorageSync('openid')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        // 设置图片大小
        var width = 0
        switch (res.data.piclist.length) {
          case 0:
            break;
          case 1:
            width = 710
            break;
          case 2:
            width = 345
            break;
          case 4:
            width = 345
            break;
          case 3:
            width = 223.3
          default:
            width = 223.3
            break;
        }
        // 修改数据
        var tempcnt = 0
        if (res.data.comments != null) {
          for (var i = 0; i < res.data.comments.length; i++) {
            // 计算评论数量
            tempcnt += res.data.comments[i].count
            // 时间戳转为文字
            res.data.comments[i].timestamp = that.formatMsgTime(res.data.comments[i].timestamp)
            for (var j = 0; j < res.data.comments[i].reply.length; j++) {
              res.data.comments[i].reply[j].timestamp = that.formatMsgTime(res.data.comments[i].reply[j].timestamp)
            }
          }
        }
        res.data.timestamp = that.formatMsgTime(res.data.timestamp)
        // 修改收藏图标状态
        var hasstared = false
        if (res.data.hasstared == 1) {
          hasstared = true
        }
        // 修改投票状态
        var voteflag = res.data.voteflag
        // 修改删除按钮状态
        var delButton = false
        if (res.data.openid == wx.getStorageSync('openid')) {
          delButton = true
        }

        // 更新数据
        that.setData({
          record: res.data,
          width: width,
          commentCnt: tempcnt,
          hasStared: hasstared,
          voteFlag: voteflag,
          delButton: delButton,
        })
      },
      fail: function () {
        console.log("请求失败")
      }
    })
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