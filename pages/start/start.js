var app = getApp();
var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    angle: 0,
    year: 2018,
    userInfo: {}
  },

  onLoad:function(){
    this.setData({
      year: new Date().getFullYear()
    })
  },

  onShow: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      console.log(userInfo)
      that.setData({
        userInfo: userInfo
      })
    })
  },

  onReady: function () {
    var that = this;
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },

  onGotUserInfo(e) {
    if (e.detail.userInfo) {
      try {
        var value = wx.getStorageSync('user_openid')
        if (value) {
        } else {
          wx.login({
            success: function (res) {
              if (res.code) {
                Bmob.User.requestOpenId(res.code, {
                  success: function (userData) {
                    console.log(userData)
                    wx.getUserInfo({
                      success: function (result) {
                        var userInfo = result.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        var sex = userInfo.gender
                        Bmob.User.logIn(nickName, userData.openid, {
                          success: function (user) {
                            try {
                              wx.setStorageSync('user_openid', user.get('userData').openid)
                              wx.setStorageSync('user_id', user.id)
                              wx.setStorageSync('my_nick', user.get("nickname"))
                              wx.setStorageSync('my_username', user.get("username"))
                              wx.setStorageSync('my_sex', user.get("sex"))
                              wx.setStorageSync('my_avatar', user.get("userPic"))
                            } catch (e) {
                            }
                            console.log("登录成功");
                          },
                          error: function (user, error) {
                            if (error.code == '101') {
                              var user = new Bmob.User();//开始注册用户
                              user.set('username', nickName);
                              user.set('password', userData.openid);
                              user.set("nickname", nickName);
                              user.set("userPic", avatarUrl);
                              user.set("userData", userData);
                              user.set('sex', sex);
                              user.signUp(null, {
                                success: function (result) {
                                  console.log('注册成功');
                                  try {//将返回的3rd_session存储到缓存中
                                    wx.setStorageSync('user_openid', user.get('userData').openid)
                                    wx.setStorageSync('user_id', user.id)
                                    wx.setStorageSync('my_nick', user.get("nickname"))
                                    wx.setStorageSync('my_username', user.get("username"))
                                    wx.setStorageSync('my_sex', user.get("sex"))
                                    wx.setStorageSync('my_avatar', user.get("userPic"))
                                  } catch (e) {
                                  }
                                },
                                error: function (userData, error) {
                                  console.log("openid=" + userData);
                                  console.log(error)
                                }
                              });

                            }
                          }
                        });
                      }
                    })
                  },
                  error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                  }
                });
              } else {
                console.log('获取用户登录状态失败1！' + res.errMsg)
              }
            },
            error: function (e) {
              console.log('获取用户登录状态失败2！' + e)
            }
          });
        }
      } catch (e) {
        console.log("登陆失败")
      }
      wx.checkSession({
        success: function () {
        },
        fail: function () {
          //登录态过期，重新登录
          wx.login()
        }
      })
      wx.switchTab({
        url: '../list/list'
      })
    } else {
      
    }
   
  },

  checkAdmin: function(){
    var user_id = wx.getStorageSync('user_id');
    var User = Bmob.Object.extend('_User')
    var userQuery = new Bmob.Query(User);
    userQuery.get(user_id, {
      success: function(res){
        var isAdmin = res.get("isAdmin");
        if(isAdmin == 0){
          wx.showModal({
            content: '您没有管理员权限！',
            showCancel:false,
          })
        }else{
          wx.navigateTo({
            url: '../../pages/admin/list/list',
          })
        }
      }
    })
  },

})