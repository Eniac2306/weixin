const App = getApp()
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/getCode.js')
var that;
var startTime;
var endTime;
var my_username;
var openid;

Page({

  data: {
    total1: 0,
    total2: 0,
    question_list1: {},
    question_list2: {}
  },

  onLoad: function (options) {
    that = this;
    my_username = options.my_username;
    openid = options.openid;
    that.onShow();
  },

  onShow: function(){
    that = this;
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval);

            var user = Bmob.User.logIn(my_username, openid, {
              success: function (user) {
                //var objectId = user.get("objectId");
                var Questions = Bmob.Object.extend("questions");
                //查询未关闭问题
                var query = new Bmob.Query(Questions);
                query.equalTo("questioner", user);
                query.equalTo("isClose", 0);
                query.include("questioner")
                query.descending("createdAt");
                var quesList = new Array();
                query.find({
                  success: function (result) {
                    if (result.length == 0) {
                      that.setData({
                        total1: 0
                      })
                    } else {
                      that.setData({
                        total1: result.length
                      })
                    }
                    for (var i = 0; i < result.length; i++) {
                      var publisherId = result[i].get("questioner").objectId;
                      var title = result[i].get("title");
                      var content = result[i].get("content");
                      var isClose = result[i].get("isClose");
                      var follownum = result[i].get("follownum");
                      var liker = result[i].get("liker");
                      var commentnum = result[i].get("commentnum");
                      var id = result[i].id;
                      var createdAt = result.createdAt;
                      var username = result[i].get("questioner").nickname;
                      var userPic = result[i].get("questioner").userPic;
                      var jsonA;
                      jsonA = {
                        "title": title || '',
                        "content": content || '',
                        "isClose": isClose,
                        "id": id || '',
                        "userPic": userPic || '',
                        "username": username || '',
                        "publisherId": publisherId || '',
                        "createdAt": createdAt || '',
                        "follownum": follownum || 0,
                        "commentnum": commentnum || 0
                      }
                      quesList.push(jsonA);
                    }
                    that.setData({
                      question_list1: quesList,
                    })
                  }
                });

                //查询已关闭问题
                var query2 = new Bmob.Query(Questions);
                query2.equalTo("questioner", user);
                query2.equalTo("isClose", 1);
                query2.include("questioner")
                query2.descending("createdAt");
                var quesList2 = new Array();
                query2.find({
                  success: function (result) {
                    if (result.length == 0) {
                      that.setData({
                        total2: 0
                      })
                    } else {
                      that.setData({
                        total2: result.length
                      })
                    }
                    for (var i = 0; i < result.length; i++) {
                      var publisherId = result[i].get("questioner").objectId;
                      var title = result[i].get("title");
                      var content = result[i].get("content");
                      var isClose = result[i].get("isClose");
                      var likenum = result[i].get("likenum");
                      var follownum = result[i].get("follownum");
                      var liker = result[i].get("liker");
                      var commentnum = result[i].get("commentnum");
                      var id = result[i].id;
                      var createdAt = result.createdAt;
                      var username = result[i].get("questioner").nickname;
                      var userPic = result[i].get("questioner").userPic;
                      var jsonA;
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
                      quesList2.push(jsonA);
                    }
                    //console.log(quesList);
                    that.setData({
                      question_list2: quesList2,
                    })
                  }
                })

              }
            });

          }
        }
      })
    }
  },

  touchstart:function(e){
    startTime = e.timeStamp;
  },
  touchend: function(e){
    endTime = e.timeStamp;
  },

  showDetail: function (e) {
    if(endTime - startTime < 300){
      that = this;
      var queid = e.currentTarget.dataset.queid;
      var pubid = e.currentTarget.dataset.pubid;
      var isClose = e.currentTarget.dataset.isclose;
      // 跳转到详情页
      wx.navigateTo({
        url: '../../detail/detail?queid=' + queid + '&pubid=' + pubid + "&isClose=" + isClose
      });
    }
  },

 closeQuestion: function (e) {
   that = this;
   wx.showModal({
     title: '',
     content: '是否关闭该帖子？',
     btn_ok: '确定',
     btn_no: '取消',
     success:function(res){
       if(res.confirm){
         var queid = e.currentTarget.dataset.queid;
         var Questions = Bmob.Object.extend("questions");
         var question = new Bmob.Query(Questions);
         question.get(queid, {
           success: function (result) {
             var isClose = result.get("isClose")
             console.log(isClose)
             result.set("isClose", 1);
             result.save();
             wx.showToast({
               title: '关闭成功',
               icon: 'success',
               duration: 1000
             })  
             that.onShow();
           },
           error: function (result, error) {
             console.log(error);
           }
         })
       }else if(res.cancel){
         console.log("cancle")
       }
     }
   })

  },

  openQuestion: function (e) {
    that = this;
    wx.showModal({
      title: '',
      content: '是否重新开启该帖子？',
      success: function (res) {
        if (res.confirm) {
          var queid = e.currentTarget.dataset.queid;
          var Questions = Bmob.Object.extend("questions");
          var question = new Bmob.Query(Questions);
          question.get(queid, {
            success: function (result) {
              var isClose = result.get("isClose")
              result.set("isClose", 0);
              result.save();
              wx.showToast({
                title: '开启成功',
                icon: 'success',
                duration: 1000
              })
              that.onShow();
            },
            error: function (result, error) {
              console.log(error);
            }
          })
        } else if (res.cancel) {
          console.log("cancle")
        }
      }
    })

  },
 
})