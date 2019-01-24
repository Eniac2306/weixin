var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/getCode.js')
var app = getApp();
var that;
var questionId; //问题Id
var publisherId; //提问者的Id
var commentlist;
var likerlist;

Page({
  data: {
    detail: '',
    userInfo: '',
  },

  onLoad: function (options) {
    that = this;
    var openid = wx.getStorageSync("user_openid");
    questionId = options.queid;
    publisherId = options.pubid;
    that.setData({
      isClose: options.isClose
    })
    if(that.data.isClose == 1){
      that.setData({
        btn_txt: "开启帖子",
        btn_color:"#0068c4"
      })
    }else{
      that.setData({
        btn_txt: "关闭帖子",
        btn_color:"lightgray"
      })
    }
    wx.getStorage({ //判断当前是不是自己
      key: 'user_id',
      success: function (ress) {
        if (publisherId == ress.data) {
          that.setData({
            isMe: true,
          })
        }
      },
    })
  },

  onShow: function () {
    that = this;
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval);
            // 向Bmob请求详情页数据
            var Questions = Bmob.Object.extend("questions");
            //创建查询对象，入口参数是对象类的实例
            var query = new Bmob.Query(Questions);
            query.include("questioner");
            //查询单条数据，第一个参数是这条数据的objectId值
            query.get(questionId, {
              success: function (result) {
                // 查询成功，调用get方法获取对应属性的值
                var userInfo = result.get("questioner");
                var followArray = userInfo.follow;
                that.setData({
                  detail: result,
                  userInfo: userInfo
                });
                that.commentQuery(that.data.detail);
              },
              error: function (object, error) {
                // 查询失败
              }
            });
          }
        },
      })
    }
  },

  commentQuery: function (question) {
    var self = this;
    commentlist = new Array();
    var Comments = Bmob.Object.extend("comments");
    var queryComment = new Bmob.Query(Comments);
    queryComment.equalTo("question", question);
    queryComment.descending("createAt");
    queryComment.include("publisher");
    queryComment.find({
      success: function (result) {
        for (var i = 0; i < result.length; i++) {
          var id = result[i].id;
          var pid = result[i].get("olderComment"); //被评论的评论
          var uid = result[i].get("publisher").objectId; //评论人的id
          var content = result[i].get("content");
          var createdAt = result[i].createdAt;
          var olderUserName;
          var userPic = result[i].get("publisher").userPic;
          var nickname = result[i].get("publisher").nickname;
          if (pid) {
            pid = pid.id;
            olderUserName = result[i].get("olderUserName");
          }
          else {
            pid = 0;
            olderUserName = "";
          }
          var jsonA;
          jsonA = {
            "id": id || '',
            "content": content || '',
            "pid": pid || '',
            "uid": uid || '',
            "createdAt": createdAt || '',
            "pusername": olderUserName || '',
            "username": nickname || '',
            "avatar": userPic || '',
          }
          commentlist.push(jsonA)
          that.setData({
            commentList: commentlist,
            loading: true
          })
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    });
  },

  commentTap: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    let commentActions = ["删除"];
    wx.showActionSheet({
      itemList: commentActions,
      success: function (res) {
        //删除评论
        that.deleteComment(item.id);
        that.onShow();
      }
      
    });
  },

  deleteComment:function(commentId){
    var Comments = Bmob.Object.extend("comments");
    var comment = new Bmob.Query(Comments);
    comment.get(commentId, {
      success: function (result) {
        result.destroy({
          success: function (res) {
            common.dataLoading("删除成功", "success");
            console.log("删除成功");
          },
          error: function (res) {
            console.log("删除评论错误");
          }
        })
      }
    })
    //问题表中评论数量-1
    var Questions = Bmob.Object.extend("questions");
    var queryQuestions = new Bmob.Query(Questions);
    queryQuestions.get(questionId, {
      success: function (object) {
        object.set("commentnum", object.get("commentnum") - 1);
        object.save();
      }
    })
  },

  //删除问题
  deleteQuestion:function(){
    that = this;
    wx.showModal({
      content: '是否删除该帖子?',
      success: function(res){
        if(res.confirm){
          var Questions = Bmob.Object.extend("questions");
          var query = new Bmob.Query(Questions);
          query.get(questionId, {
            success: function (ques) {
              //删除评论
              var Comments = Bmob.Object.extend("comments");
              var comment = new Bmob.Query(Comments);
              comment.equalTo("question", ques);
              comment.destroyAll();
              //删除消息通知
              var Notices = Bmob.Object.extend("notice");
              var notice = new Bmob.Query(Notices);
              notice.equalTo("question", ques);
              notice.destroyAll();
              //更新用户关注列表。若该问题在用户关注列表中,将其删除
              var Users = Bmob.Object.extend('_User');
              var user = new Bmob.Query(Users);
              user.exists("questionFollow")
              user.find({
                success: function (userlist) {
                  for (var i = 0; i < userlist.length; i++) {
                    var followArr = userlist[i].get("questionFollow")
                    for (var j = 0; j < followArr.length; j++) {
                      if (followArr[j] == questionId) {
                        followArr.splice(j, 1)
                      }
                    }
                    userlist[i].set("questionFollow", followArr);
                    userlist[i].save();
                  }
                }
              })
              ques.destroy({
                success: function () {
                  wx.showToast({
                    title: "删除成功",
                    icon: "success",
                    duration: 1000,
                    success: function(){
                      wx.redirectTo({
                        url: '../list/list',
                      })
                    }
                  })
                }
              })

            }
          })
        }
      }
    })
    
  },

  closeQuestion: function (e) {
    that = this;
    var Questions = Bmob.Object.extend("questions");
    var question = new Bmob.Query(Questions);
    if(that.data.isClose == 0){
      wx.showModal({
        content: '是否关闭该帖子？',
        success: function (res) {
          if (res.confirm) {
            question.get(questionId, {
              success: function (result) {
                var isClose = result.get("isClose")
                result.set("isClose", 1);
                result.save();
                that.setData({
                  isClose: 1,
                  btn_txt: "开启帖子",
                  btn_color: "#0068c4"

                })
                wx.showToast({
                  title: '关闭成功',
                  icon: 'success',
                  duration: 1000
                })
                that.onShow();
              }
            })
          }
        }
      })
    }else{
      wx.showModal({
        content: '是否开启该帖子？',
        success: function (res) {
          if (res.confirm) {
            question.get(questionId, {
              success: function (result) {
                var isClose = result.get("isClose")
                result.set("isClose", 0);
                result.save();
                that.setData({
                  isClose: 0,
                  btn_txt: "关闭帖子",
                  btn_color: "lightgray"

                })
                wx.showToast({
                  title: '开启成功',
                  icon: 'success',
                  duration: 1000
                })
                that.onShow();
              }
            })
          }
        }
      })

    }
  },

})