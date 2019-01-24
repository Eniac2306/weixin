const App = getApp()
var util = require('../../../utils/util.js');
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/getCode.js')
var that;

Page({
  data: {
    total:0,
    follow_list:{}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var my_username = options.my_username;
    var openid = options.openid;
    var user = Bmob.User.logIn(my_username, openid, {
      success: function (user) {
        var questionArray = user.get("questionFollow");
        var Questions = Bmob.Object.extend("questions");
        var query = new Bmob.Query(Questions);
        query.include("questioner")
        query.descending('createdAt');
        if (questionArray.length > 0) {
          that.setData({
            total: questionArray.length
          })
          var molist = new Array();
          for (var i = 0; i < questionArray.length; i++) {
            query.get(questionArray[i], {
              success: function (result) {
                var publisherId = result.get("questioner").objectId;
                var title = result.get("title");
                var content = result.get("content");
                var isClose = result.get("isClose");
                var likenum = result.get("likenum");
                var liker = result.get("liker");
                var commentnum = result.get("commentnum");
                var follownum = result.get("follownum");
                var id = result.id;
                var createdAt = result.createdAt;
                var username = result.get("questioner").nickname;
                var userPic = result.get("questioner").userPic;
                let jsonA;
                jsonA = {
                  "title": title || '',
                  "content": content || '',
                  "isClose": isClose,
                  "id": id || '',
                  "userPic": userPic || '',
                  "username": username || '',
                  "publisherId": publisherId || '',
                  "createdAt": createdAt || '',
                  "likenum": likenum || 0,
                  "commentnum": commentnum || 0,
                  "follownum": follownum
                }
                molist.push(jsonA);
                that.setData({
                  follow_list: molist
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

  showDetail: function (e) {
    //
    that = this;
    var queid = e.currentTarget.dataset.queid;
    var pubid = e.currentTarget.dataset.pubid;
    var isClose = e.currentTarget.dataset.isclose;
    console.log(pubid)
    // 跳转到详情页
    wx.navigateTo({
      url: '../../detail/detail?queid=' + queid + '&pubid=' + pubid + "&isClose=" + isClose
    });
  },

})