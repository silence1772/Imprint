//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/util.js');

Page({
  data: {
    // 遮罩层 添加印迹 默认隐藏
    maskLayerHidden: true,
    // 卡片距顶端偏移量
    marginTop: 100,
    // scroll-view回到初始位置
    resetScrollView: "",
    // 更新数据标识
    canUpdateFlag: true,
    // 请求api参数
    parms: {
      lon: "",
      lat: ""
    },
    // 添加印迹选项
    navItem: [{
      text: "图片",
      iconUrl: "../resources/picture_1.png",
    },
    {
      text: "视频",
      iconUrl: "../resources/video_1.png",
    }],
    // 印迹列表
    cards: [],
    //用户指定位置
    point: {
      latitude: 0,
      longitude: 0
    },
    // 地图缩放级别
    scale: 18,
    // 标注物
    markers: [],
    // 临时保存标注物
    tempMarkers: [],
    // 控件
    controls: [
      // 中心点图标
      {
        id: 1,
        iconPath: '../resources/center.png',
        position: {
          left: 0.5 * wx.getStorageSync("screenW") - 20,
          top: 0.5 * 0.7 * wx.getStorageSync("screenH") - 40,
          width: 40,
          height: 40
        },
        clickable: false
      },
      // 回到定位点控件
      {
        id: 2,
        iconPath: '../resources/location.png',
        position: {
          left: 0.05 * wx.getStorageSync("screenW"),
          top: 0.85 * 0.7 * wx.getStorageSync("screenH"),
          width: 45,
          height: 45
        },
        clickable: true
      },
      // 新添印迹按钮
      {
        id: 3,
        iconPath: '../resources/add_4.png',
        position: {
          left: 0.5 * wx.getStorageSync("screenW") - 50,
          top: 0.7 * wx.getStorageSync("screenH") - 90,
          width: 100,
          height: 100
        },
        clickable: true
      },
      // 用户控件
      {
        id: 4,
        iconPath: '../resources/user.png',
        position: {
          left: wx.getStorageSync("screenW") - 65,
          top: 0.85 * 0.7 * wx.getStorageSync("screenH"),
          width: 65,
          height: 50
        },
        clickable: true
      },
      // banner
      {
        id: 5,
        iconPath: '../resources/banner_2.png',
        position: {
          left: 0.5 * wx.getStorageSync("screenW") - 175,
          top: 0.065 * 0.7 * wx.getStorageSync("screenH"),
          width: 350,
          height: 50
        },
        clickable: true
      },
    ]
  },

  // 地图移动，更新附近印迹列表
  regionchange(e) {
    var that = this
    that.hiddenMask()
    that.mapCtx.getCenterLocation({
      success: function (res) {
        // 经纬度保留6位小数
        var longitudeFix = res.longitude.toFixed(6)
        var latitudeFix = res.latitude.toFixed(6)
        // 移动结束时调用刷新
        if (e.type == "end") {
          // 设置请求参数
          that.setData({
            'parms.lon': longitudeFix,
            'parms.lat': latitudeFix
          })
          // 获取数据
          that.getRecordList()
        }
      }
    })
  },

  // 获取附近印迹列表
  getRecordList: function () {
    var that = this
    // 判断能否更新
    if (that.data.canUpdateFlag) {
      wx.request({
        url: app.globalData.apiList.recordlist,
        data: that.data.parms,
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var recordlist = res.data.data
          if (recordlist != null) {
            var markers = []
            var cards = []
            for (var i = 0; i < recordlist.length; i++) {
              // 更新地图图标
              var lon = Number(recordlist[i].lon)
              var lat = Number(recordlist[i].lat)
              var marker = {
                latitude: lat,
                longitude: lon,
                iconPath: "../resources/main_1.png",
                id: i,
                width: 40,
                height: 40
              }
              markers.push(marker)
              // 更新印迹列表
              var card = {
                id: recordlist[i].Id,
                userNickname: recordlist[i].nickname,
                userAvatar: recordlist[i].avatar,
                timestamp: util.formatMsgTime(recordlist[i].timestamp),
                content: recordlist[i].content,
                shortcut: recordlist[i].shortcut,
                voteups: recordlist[i].voteups,
                views: recordlist[i].views,
                visibleflag: recordlist[i].visibleflag,
                lat: recordlist[i].lat,
                lon: recordlist[i].lon,
              }
              cards.push(card)
            }
            // 刷新数据
            that.setData({
              'markers': markers,
              'tempMarkers': markers,
              'cards': cards,
              // scroll-view返回第一个
              resetScrollView: "first",
            })
          }
          //console.log(res.data)
        },
        fail: function () {
          console.log("请求失败")
        }
      })
    }
  },

  // 图标点击事件
  markertap(e) {
    console.log(e.markerId)
  },

  // 控件点击事件
  controltap(e) {
    var that = this
    var id = e.controlId
    switch (id) {
      case 2:
        that.moveToUserCurrentLocation()
        break
      case 3:
        that.setData({
          maskLayerHidden: !that.data.maskLayerHidden
        })
        break
      case 4:
        wx.navigateTo({
          url: '../user/user'
        })
        break
      case 5:
        wx.navigateTo({
          url: '../introduce/introduce'
        })
        break
      case 6:
        that.recover()
        break
      default:
    }
  },

  // 隐藏遮罩层
  hiddenMask: function () {
    if (!this.data.maskLayerHidden) {
      this.setData({
        maskLayerHidden: true
      })
    }
  },

  // 避免遮罩层滑动穿透
  doNothing: function () {
    // do nothing
  },

  // 跳转到发布页面
  gotoPost: function (e) {
    //获取用户的当前位置位置
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用wx.openLocation 的坐标
      success: (res) => {
        // success
        var latitude = res.latitude
        var longitude = res.longitude
        if (wx.getStorageSync("openid") == "od9XS5AoRlmj-HZtUGKJUk2EHsWM") {
          latitude = this.data.parms.lat
          longitude = this.data.parms.lon 
        }
        wx.navigateTo({
          url: '../post/post?lat=' + latitude + '&lon=' + longitude + '&category=' + e.currentTarget.dataset.index
        })
      }
    })
  },

  // 长按显示当前印迹位置
  displayPosition: function (e) {
    var markers = []
    var lon = Number(e.currentTarget.dataset.lon)
    var lat = Number(e.currentTarget.dataset.lat)
    // 该点的位置图标
    var marker = {
      latitude: lat,
      longitude: lon,
      iconPath: "../resources/main_1.png",
      id: 0,
      width: 40,
      height: 40
    }
    markers.push(marker)
    // 新增 退出当前状态的控件
    var control = {
      id: 6,
      iconPath: '../resources/quit.png',
      position: {
        left: 0.05 * wx.getStorageSync("screenW"),
        top: 0.72 * 0.7 * wx.getStorageSync("screenH"),
        width: 45,
        height: 45
      },
      clickable: true
    }
    // 深拷贝 不改变原数组
    var controls = JSON.parse(JSON.stringify(this.data.controls))
    controls.push(control)
    // 判断是否已存在 退出当前状态控件
    if (this.data.canUpdateFlag) {
      this.setData({
        canUpdateFlag: false,
        'markers': markers,
        'controls': controls,
      })
    } else {
      this.setData({
        'markers': markers,
      })
    }
  },

  // 恢复显示所有附近的印迹
  recover: function () {
    // 删除 退出当前状态控件
    var controls = this.data.controls
    controls.splice(5, 1)
    // 恢复刷新标识和所有印迹图标
    this.setData({
      canUpdateFlag: true,
      'markers': this.data.tempMarkers,
      'controls': controls
    })
  },

  // 跳转到详情页面
  gotoDetail: function (e) {
    var that = this
    // 判断是否为附近可见
    if (e.currentTarget.dataset.visibleflag == 1) {
      //获取用户的当前位置位置
      wx.getLocation({
        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用wx.openLocation 的坐标
        success: (res) => {
          // success
          that.setData({
            'point.latitude': res.latitude,
            'point.longitude': res.longitude,
          })
        }
      })
      // 计算当前位置与印迹位置的距离
      var distance = util.GetDistance(that.data.point.latitude, that.data.point.longitude, e.currentTarget.dataset.lat, e.currentTarget.dataset.lon)
      // 200米范围内才跳转
      if (distance < 200) {
        wx.navigateTo({
          url: '../detail/detail?id=' + e.currentTarget.dataset.id
        })
      } else {
        that.setData({
          canUpdateFlag: false,
        })
        wx.showModal({
          title: '太远啦',
          content: '该印迹已设置为附近可见，请走近点再打开哦',
          showCancel: false,
          success: function (res) {
            that.setData({
              canUpdateFlag: true,
            })
          }
        })
      }
    } else {
      wx.navigateTo({
        url: '../detail/detail?id=' + e.currentTarget.dataset.id
      })
    }
  },

  // 回到定位点
  moveToUserCurrentLocation: function () {
    this.mapCtx.moveToLocation()
  },

  onLoad: function () {
    console.log('onLoad')
    var that = this
    //获取用户的当前位置位置
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用wx.openLocation 的坐标
      success: (res) => {
        // success
        var latitude = res.latitude
        var longitude = res.longitude
        var point = {
          latitude: latitude,
          longitude: longitude
        };
        that.setData({
          'point': point
        })
      }
    })
    this.setData({
      marginTop: (wx.getStorageSync("screenH") * 0.3) - (300 * (wx.getStorageSync("screenW") / 750))
    })
  },

  onReady: function (e) {
    //通过id获取map,然后创建上下文
    this.mapCtx = wx.createMapContext("map");
  },
})