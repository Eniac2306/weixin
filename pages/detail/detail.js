var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/getCode.js')
var app = getApp();
var that;
var questionId; //问题Id
var publisherId; //提问者的Id
var commentlist;
var likerlist;
let commentText; //评论输入框内容
isToResponse: false;
var startTime;
var endTime;

Page({
  data: {
    detail: '',
    userInfo:'',
    TopTips:'',//提示的内容
    showTopTips:'',//是否显示提示
    isdisabled: false,
    commentLoading: false,
    showCommentDialog: false,//评论输入框显示
    showCommentDialog1: false,//评论输入框显示
    commentInputHolder: "请输入回帖内容",//评论输入框提示
    isFollow:false,
    isFollowU:false,
    isMe:false,
    followImg:'../../images/star2.png'
  },

  onLoad: function (options) {
    that = this;
    var openid = wx.getStorageSync("user_openid");
    questionId = options.queid;
    publisherId = options.pubid;
    that.setData({
      isClose:options.isClose
    })

    wx.getStorage({ //判断当前操作是不是自己
      key: 'user_id',
      success: function (ress) {
        if (publisherId == ress.data) {
          that.setData({
            isMe: true,
          })
        }
      },
    })

    wx.getStorage({
      key: 'my_username',
      success: function (ress) {
        var my_username = ress.data;
        wx.getStorage({
          key: 'user_openid',
          success: function (res) {
            var openid = res.data;
            var user = Bmob.User.logIn(my_username, openid, {
              success: function (user) {
                var user_id = wx.getStorageSync("user_id");
                var questionArray = user.get("questionFollow");
                var userArray = user.get("userFollow");
                //已关注问题
                if (questionArray.length > 0) {
                  for (var i = 0; i < questionArray.length; i++) {
                    if (questionArray[i] == questionId) {
                      that.setData({
                        isFollow:true,
                        followImg: "../../images/star.png"
                      })
                      break;
                    }
                  } 
                } else {
                  that.setData({
                    isFollow:false,
                    followImg: "../../images/star2.png"
                  })
                }
                //已关注用户
                if (userArray.length > 0) {
                  for (var i = 0; i < userArray.length; i++) {
                    if (userArray[i] == publisherId) {
                      that.setData({
                        isFollowU: true,
                      })
                      break;
                    }
                  }
                } else {
                  that.setData({
                    isFollowU: false,
                  })
                }

              }
            });
          },
        })
      },
    })

  },

  onShow: function(){
    that = this;
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    function getReturn(){
      wx.getStorage({
        key: 'user_id',
        success: function(ress) {
          if(ress.data){
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

  touchstart: function (e) {
    startTime = e.timeStamp;
  },
  touchend: function (e) {
    endTime = e.timeStamp;
  },

  commentText: function (e) {//评论内容赋值
    commentText = e.detail.value
  },
  showCommentDialog: function (e) {//显示我要评论弹窗
  if(endTime - startTime < 300){
      this.setData({
        showCommentDialog: true,
        commentInputHolder: typeof e == 'string' ? e : "请输入评论内容",
      })
    }
  },
   
  hideCommentDialog: function () {//隐藏我要评论弹窗
    this.setData({
      showCommentDialog: false,
      isToResponse: false
    });
  },

  showCommentDialog1: function (e) {//显示我要评论弹窗
    this.setData({
      showCommentDialog1: true,
      commentInputHolder: typeof e == 'string' ? e : "请输入评论内容",
    })
  },
  hideCommentDialog1: function () {//隐藏我要评论弹窗
    this.setData({
      showCommentDialog1: false,
      isToResponse: false
    });
  },

  publishComment: function (e) {
    let that = this;
    var isReply = false;
    if (!commentText || commentText.length == 0) {
      this.setData({
        showTopTips: true,
        TopTips: '请输入回帖内容'
      });
      setTimeout(function () {
        that.setData({
          showTopTips: false
        });
      }, 3000);
    } else {
      that.setData({
        isdisabled: true,
        commentLoading: true
      })
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          that.setData({
            commentLoading: false
          })
          var queryUser = new Bmob.Query(Bmob.User);
          queryUser.get(ress.data, {
            success: function (userObject) {
              var Comments = Bmob.Object.extend("comments");
              var comment = new Comments();
              var Questions = Bmob.Object.extend("questions");
              var question = new Questions();
              question.id = questionId;
              var me = new Bmob.User();
              me.id = ress.data;
              comment.set("publisher", me);
              comment.set("publisherId", me.id);
              comment.set("question", question);
              comment.set("content", commentText);
              if(that.data.showCommentDialog1 == true){
                comment.set("isAnony", 1);
              }else{
                comment.set("isAnony", 0);
              }
              console.log("commentText=" + commentText);
              if (that.data.isToResponse) { //如果是回复的评论
                isReply = true;
                var olderName = that.data.responseName;
                var Comments1 = Bmob.Object.extend("comments");
                var comment1 = new Comments1();
                comment1.id = that.data.pid; //评论的评论Id
                comment.set("olderUserName", olderName);
                comment.set("olderComment", comment1);
              }
              //添加数据,第一个路口参数是null
              comment.save(null, {
                success: function (res) {
                  var queryQuestions = new Bmob.Query(Questions);
                  //查询单条数据,第一个参数就是这条数据的objectId
                  queryQuestions.get(questionId, {
                    success: function (object) {
                      object.set("commentnum", object.get("commentnum") + 1);
                      object.save();

                      var isme = new Bmob.User();
                      isme.id = ress.data;
                      var avatar = wx.getStorageSync("my_avatar")
                      var my_username = wx.getStorageSync("my_username")

                      var Notice = Bmob.Object.extend("notice");
                      var notice = new Notice();

                      console.log("isReply=" + isReply);
                      if (isReply) {//如果是评论，则消息通知行为存2
                        notice.set("noticeType", 2); //消息通知方式
                      } else {//如果是回答问题，消息通知行为存1
                        notice.set("noticeType", 1); //消息通知方式
                      }
                      notice.set("avatar", avatar);
                      notice.set("username", my_username);
                      notice.set("uid", isme);
                      notice.set("question", object);
                      notice.set("fid", publisherId);
                      notice.set("is_read", 0); //是否已读,0代表没有,1代表读了
                      //添加数据
                      notice.save(null, {
                        success: function (result) {
                          //添加成功
                          console.log("isReply3=" + isReply);
                          if (isReply) {
                            common.dataLoading("评论成功", "success");
                            console.log("评论成功");
                          } else {
                            common.dataLoading("回帖成功", "success");
                            console.log("回帖成功");
                          }
                        },

                        error: function (result, error) {
                          console.log("回帖失败");
                        }
                      });

                      that.setData({ commentText: '' })
                      that.hideCommentDialog();
                      that.hideCommentDialog1();
                      that.onShow();
                    },
                    error: function (object, error) {
                      //查询失败
                      console.log(error);
                    }
                  });
                  that.setData({
                    publishContent: "",
                    isToResponse: false,
                    responeContent: "",
                    isdisabled: false,
                    commentLoading: false
                  })
                },
                error: function (gameScore, error) {
                  common.dataLoading(error, "loading");
                  that.setData({
                    publishContent: "",
                    isToResponse: false,
                    responeContent: "",
                    isdisabled: false,
                    commentLoading: false
                  })
                }
              });
            },
            error: function (object, error) {
              console.log(error);
            }
          });
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

  commentQuery: function (question) {
    that = this;
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
          var isAnony = result[i].get("isAnony");
          if(isAnony == 1){
            var userPic = "../../images/user_default.png";
            var nickname = "  ";
          }else{
            var userPic = result[i].get("publisher").userPic;
            var nickname = result[i].get("publisher").nickname;
          }
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
    let commentActions;
    if (item.uid == wx.getStorageSync('user_id')) {//自己的评论，可以删除
      commentActions = ["删除"]
    } else {
      commentActions = ["回复"]
    }
    wx.showActionSheet({
      itemList: commentActions,
      success: function (res) {
        let button = commentActions[res.tapIndex];
        if (button == "回复") {
          that.setData({
            pid: item.uid,
            isToResponse: true,
            responseName: item.username
          })

          that.showCommentDialog("回复" + item.username + "：");
        } else if (button == "删除") {
          //删除评论
          var Comments = Bmob.Object.extend("comments");
          var comment = new Bmob.Query(Comments);
          comment.get(item.id, {
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
          //活动表中评论数量-1
          var Questions = Bmob.Object.extend("questions");
          var queryQuestions = new Bmob.Query(Questions);
          queryQuestions.get(questionId, {
            success: function (object) {
              object.set("commentnum", object.get("commentnum") - 1);
              object.save();
            }
          })
          that.onShow();
        }
      }
    });
  },

  changeFollow: function(ress) {
    that = this;
    wx.getStorage({
      key: 'my_username',
      success: function (ress) {
        var my_username = ress.data;
        wx.getStorage({
          key: 'user_openid',
          success: function (res) { //将该问题的Id添加到我的关注中，或者删除
            var openid = res.data;
            var user = Bmob.User.logIn(my_username, openid, {
              success: function (user) {
                var user_id = wx.getStorageSync("user_id");
                var questionArray = user.get("questionFollow");
                if (questionArray == null) {
                  questionArray = [];
                }
                if(that.data.isFollow){
                    for (var i = 0; i < questionArray.length; i++) {
                      if (questionArray[i] == questionId) { //如果已经关注过,再次点击应该是取消关注
                        questionArray.splice(i, 1);
                        break;
                      }
                    } 
                    that.setData({
                      isFollow:false,
                      followImg:"../../images/star2.png"
                    })

                  var Questions = Bmob.Object.extend("questions");
                  var question1 = new Bmob.Query(Questions);
                  question1.get(questionId, {
                    success: function (object) {
                      object.set("follownum", object.get("follownum") - 1);
                      object.save();
                    }
                  })

                } else { //如果没有关注过，点击关注
                  questionArray.push(questionId);
                  that.setData({
                    isFollow:true,
                    followImg: "../../images/star.png"
                  })
                  var Questions = Bmob.Object.extend("questions");
                  var question2 = new Bmob.Query(Questions);
                  question2.get(questionId, {
                    success: function (object) {
                      object.set("follownum", object.get("follownum") + 1);
                      object.save();
                    }
                  })
                }

                user.set("questionFollow", questionArray);
                user.save(null, {
                  success: function () {
                    if (that.data.isFollow == false) {
                      common.dataLoading("取消关注该贴", "success");
                    } else if (that.data.isFollow == true) {
                      common.dataLoading("成功关注该帖", "success");
                    }
                  },
                  error: function (error) {
                    console.log("失败");
                  }
                })
              }
            });
          },
        })
      },
    })
    that.onShow()
  },

  changeFollowU: function (ress) {
    that = this;
    wx.getStorage({
      key: 'my_username',
      success: function (ress) {
        var my_username = ress.data;
        wx.getStorage({
          key: 'user_openid',
          success: function (res) { //将该用户的Id添加到我的关注中，或者删除
            var openid = res.data;
            var user = Bmob.User.logIn(my_username, openid, {
              success: function (user) {
                var user_id = wx.getStorageSync("user_id");
                var userArray = user.get("userFollow");
                if (userArray == null) {
                  userArray = [];
                }
                if (that.data.isFollowU) {
                  for (var i = 0; i < userArray.length; i++) {
                    if (userArray[i] == publisherId) { //如果已经关注过,再次点击应该是取消关注
                      userArray.splice(i, 1);
                      break;
                    }
                  }
                  that.setData({
                    isFollowU:false
                  })

                } else { //如果没有关注过，点击关注
                 userArray.push(publisherId);
                  that.setData({
                    isFollowU:true
                  })
                }

                user.set("userFollow", userArray);
                user.save(null, {
                  success: function () {
                    if (that.data.isFollowU == false) {
                      common.dataLoading("取关该用户成功", "success");
                    } else if (that.data.isFollowU == true) {
                      common.dataLoading("关注用户成功", "success");
                    }
                  },
                  error: function (error) {
                    console.log("失败");
                  }
                })
              }
            });
          },
        })
      },
    })
    that.onShow()
  },

  closeAlert:function(){
    wx.showModal({
      title: '',
      content: '该帖子已关闭，无法操作',
      showCancel:false
    })
  }

})