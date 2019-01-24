//logs.js
var util = require('../../utils/util.js')
var app = getApp()
var my_username;
var openid;
Page({
  data: {
    userInfo: {}
  },
 
  // 获得用户信息
  onLoad: function () {
    if (app.globalData.userInfo) {
      console.log('--userInfo--' + app.globalData.userInfo);
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      // 注意： 最后是调用了最后的这个方法获取的用户信息
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          console.log('--userInfo--' + res.userInfo);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    wx.getStorage({
      key: 'my_username',
      success: function (ress) {
        my_username = ress.data;
        wx.getStorage({
          key: 'user_openid',
          success: function (res) {
            openid = res.data;
          },
        })
      },
    })

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  askQuestion: function () {
    wx.navigateTo({
      url: '../question/question'
    });
  },

  navigate1: function () {
    wx.navigateTo({
      url: 'myQuestions/myQuestions?my_username=' + my_username + '&openid=' + openid,
    })
  },

  navigate2: function () {
    wx.navigateTo({
      url: 'myAnswers/myAnswers?my_username=' + my_username + '&openid=' + openid,
    })
  },

  navigate3: function () {
    wx.navigateTo({
      url: 'usersFollow/usersFollow?my_username=' + my_username + '&openid=' + openid,
    })
  },

  navigate4: function(){
    wx.navigateTo({
      url: 'questionsFollow/questionsFollow?my_username=' + my_username + '&openid=' + openid,
    })
  },

})