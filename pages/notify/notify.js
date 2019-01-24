//获取应用实例
const App = getApp()
var util = require('../../utils/util.js');
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/getCode.js');
var that;

Page({
  data: {
    infoCount:0,
    infoList: {},
    navTab:["动态", "通知"],
    currentNavtab: "0",
    newsFeedList:{},
    newsFeedCount:0,
  },

  switchTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  },

  onLoad: function() {
    
  },

  onShow: function () {
    that = this;
    var userAray;
    var user_id = wx.getStorageSync('user_id')
    var User = Bmob.Object.extend('_User')
    var userQuery = new Bmob.Query(User);
    userQuery.get(user_id, {
      success: function (res) {
        userAray = res.get("userFollow");
        var feedList = new Array();
        var Comments = Bmob.Object.extend('comments')
        var comment = new Bmob.Query(Comments);
        comment.containedIn("publisherId", (userAray));
        comment.include("publisher")
        comment.include("question")
        comment.descending("createdAt");
        comment.find({
          success: function (result) {

            for (var i = 0; i < result.length; i++) {
              var username = result[i].get("publisher").nickname;
              var avatar = result[i].get("publisher").userPic;
              var createdAt = result[i].createdAt;
              var title = result[i].get("question").title;
              var qid = result[i].get("question").objectId;
              var isClose = result[i].get("question").isClose;
              var Questions = Bmob.Object.extend('questions')
              var query2 = new Bmob.Query(Questions);
              query2.include("questioner");
              query2.get(qid, {
                success: function (ques) {
                  that.setData({
                    fid: ques.get("questioner").objectId
                  })
                }
              })
              var jsonA;

              jsonA = {
                "username": username || '',
                "time": createdAt || '',
                "avatar": avatar || '',
                "title": title || '',
                "qid": qid || '',
                "isClose": isClose,
                "fid": that.data.fid || '',
              }

              feedList.push(jsonA);

            }
            that.setData({
              newsFeedList: feedList
            })
          }
        })
      }
    })




    var user_id = wx.getStorageSync('user_id')
    var me = new Bmob.User();
    //var me = Bmob.User.current();
    me.id = user_id;
   
    //先查询未读消息有多少条
    var Notice = Bmob.Object.extend("notice");
    var notice = new Bmob.Query(Notice);
    notice.equalTo("is_read", 0);
    notice.equalTo("fid", user_id);
    notice.count({
      success: function (count) {
        console.log("共有 " + count + " 条未读消息");
        that.setData({
          infoCount: count
        });
      },
      error: function (error) {
      }
    });

    //再查询全部消息，包括已读
    var Notice = Bmob.Object.extend("notice");
    var notice = new Bmob.Query(Notice);
    notice.equalTo("fid", user_id);
    notice.include("question");
    //notice.limit(50);
    notice.descending("createdAt"); //按照时间降序
    var infoList = new Array();
    notice.find({ //查询消息的详细信息，并返回显示
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          var id = result[i].id; //消息的id
          var is_read = result[i].get("is_read");
          if (is_read == 0) {
            var status = "未读";
          } else if (is_read == 1) {
            var status = "已读";
          }
          var username = result[i].get("username");
          var avatar = result[i].get("avatar");
          var createdAt = result[i].createdAt;
          var noticeType = result[i].get("noticeType"); //消息的类型（1：被回答，2：被评论;3: ）
          if (noticeType == 1) {
            var message = "跟了你的帖子";
          } else if (noticeType == 2) {
            var message = "评论了你的回答";
          } 
          var qid = result[i].get("question").objectId; //问题的id
          var isClose = result[i].get("question").isClose;
          var fid = result[i].get("fid");
          var jsonA;
          jsonA = {
            "id": id || '',
            "is_read": is_read,
            "status": status || '',
            "username": username || '',
            "time": createdAt || '',
            "avatar": avatar || '',
            "message": message || '',
            "qid": qid || '',
            "isClose": isClose,
            "fid": fid || '',
          }
          infoList.push(jsonA);
        }
        //console.log(infoList);
        that.setData({
          infoList: infoList,
        })
        //console.log(that.data.infoList)
      }
    })
    //********************************************************** */
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.onShow()
  },

  deleteNotice: function (e) {
    var id = e.currentTarget.dataset.id; //消息通知的id
    var Notice = Bmob.Object.extend("notice");
    var notice = new Bmob.Query(Notice);
    notice.get(id, {
      success: function (result) {
        result.destroy({
          success: function (myObject) {
            common.dataLoading("删除成功", "success");
            console.log("删除消息成功");
            that.onShow();
          },
          error: function (myObject, error) {
            console.log(error);
          }
        })
      },
      error: function (result, error) {
        console.log(error);
      }
    })

  },

  //-----------滑动删除消息---------------------------
  touchSInfo: function (e) {  // touchstart
    let startX = App.Touches.getClientX(e)
    startX && this.setData({ startX })
  },
  touchMInfo: function (e) {  // touchmove
    let infoList = App.Touches.touchM(e, this.data.infoList, this.data.startX)
    infoList && this.setData({ infoList })
  },
  touchEInfo: function (e) {  // touchend
    const width = 150  // 定义操作列表宽度
    let infoList = App.Touches.touchE(e, this.data.infoList, this.data.startX, width)
    infoList && this.setData({ infoList })
  },
  infoDelete: function (e) {  // itemDelete
    let infoList = App.Touches.deleteItem(e, this.data.infoList)
    infoList && this.setData({ infoList })
    this.deleteNotice(e);
  },

  readDetail1: function (event) {
    var qid = event.currentTarget.dataset.qid;
    var fid = event.currentTarget.dataset.fid;
    console.log(fid);
    var isClose = event.currentTarget.dataset.isclose;
    //console.log("消息通知的id" + id + ",问题的id=" + qid + ",提问者ID=" + fid);
    wx.navigateTo({
      url: "../detail/detail?queid=" + qid + "&pubid=" + fid + "&isClose=" + isClose
    })
  },

  readDetail2: function (event) {
    //console.log(event);
    var id = event.currentTarget.dataset.id; //消息通知的id
    var qid = event.currentTarget.dataset.qid;
    var fid = event.currentTarget.dataset.fid;
    console.log(fid);
    var isClose = event.currentTarget.dataset.isclose;
    //console.log("消息通知的id" + id + ",问题的id=" + qid + ",提问者ID=" + fid);
    var Notice = Bmob.Object.extend("notice");
    var notice = new Bmob.Query(Notice);
    notice.get(id, {
      success: function (result) {
        result.set("is_read", 1);
        result.save();
      },
      error: function (result, error) {
        console.log(error);
      }
    })
    wx.navigateTo({
      url: "../detail/detail?queid=" + qid + "&pubid=" + fid + "&isClose=" + isClose
    })
  },

});