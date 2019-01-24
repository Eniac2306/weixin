const App = getApp()
var util = require('../../../utils/util.js');
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/getCode.js')
var that;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    total: 0,
    userList: {},
  },

  onLoad: function (options) {
    that = this;
    var my_username = options.my_username;
    var openid = options.openid;
    var user = Bmob.User.logIn(my_username, openid, {
      success: function (user) {
        var userArray = user.get("userFollow");
        var Users = Bmob.Object.extend("_User");
        var query = new Bmob.Query(Users);
        if (userArray.length > 0) {
          that.setData({
            total: userArray.length
          })
          var molist = new Array();
          for (var i = 0; i < userArray.length; i++) {
            query.get(userArray[i], {
              success: function (result) {
                var nickname = result.get("nickname");
                var userPic = result.get("userPic");
                //var userFollow = result.get("userFollow");
                //var questionFollow = result.get("questionFollow");
                let jsonA;
                jsonA = {
                  "nickname": nickname || '',
                  "userPic": userPic || '',
                }
                molist.push(jsonA);
                that.setData({
                  userList: molist
                })
              },
              error: function (object, error) {
                // 查询失败
              }
            });
          }
        } else {
          that.setData({
            total: 0
          });
        }
      }
    });
  },

  onShow: function () {

  },

})