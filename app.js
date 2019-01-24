//app.js
import Touches from './utils/Touches.js'
var Bmob = require('utils/bmob.js')
var common = require('utils/common.js')
//Bmob.initialize("9d85d5e9082583648239c848bbf975c4", "1821225a3fb3c1b4e137ecdc483de868")
Bmob.initialize("aa6ccb1324fb89eebfe3362fefc9bda6", "6c3af93e31c22bae1ff1f161e9eb92cf");

App({
  onLaunch: function () {
    var that = this;
   
    //调用API从本地缓存中获取数据
    
    
  },
  onShow: function () {

  },
  formate_data: function (date) {
    let month_add = date.getMonth() + 1;
    var formate_result = date.getFullYear() + '年'
      + month_add + '月'
      + date.getDate() + '日'
      + ' '
      + date.getHours() + '点'
      + date.getMinutes() + '分';
    return formate_result;
  },

  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  
  globalData: {
    userInfo: null,
  },
  onPullDownRefresh: function () {
    //wx.stopPullDownRefresh()
  },
  onError: function (msg) {
  },
  Touches: new Touches(),
})