var Bmob = require('../../../utils/bmob.js');
var that;
var flag = false;
Page({

  data: {
    total: 0,
    question_list: {}
  },

  onLoad: function (options) {
    that = this;
    var my_username = options.my_username;
    var openid = options.openid;
    var user = Bmob.User.logIn(my_username, openid, {
      success: function (user) {
        user = user;
        //var objectId = user.get("objectId");
        var Comments = Bmob.Object.extend("comments");
        var query = new Bmob.Query(Comments);
        query.equalTo("publisher", user);
        query.include("question")
        query.include("publisher")
        query.descending("createdAt");
        var quesList = new Array();
        query.find({
          success: function (result) {
            if (result.length == 0) {
              that.setData({
                total: 0
              })
            } else {
              that.setData({
                total: result.length
              })
            }
            for (var i = 0; i < result.length; i++) {
              var publisherId = result[i].get("publisher").objectId;
              var title = result[i].get("question").title;
              var content = result[i].get("question").content;
              var isClose = result[i].get("question").isClose;
              var likenum = result[i].get("question").likenum;
              var follownum = result[i].get("question").follownum;
              var liker = result[i].get("question").liker;
              var commentnum = result[i].get("question").commentnum;
              var id = result[i].get("question").objectId;
              var createdAt = result[i].get("question").createdAt;
              var username = result[i].get("publisher").nickname;
              var userPic = result[i].get("publisher").userPic;
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
                "follownum":follownum
              };
              for(var j = 0;j < quesList.length;j++){
                if(id == quesList[j].id){
                  flag = true;
                  break;
                }
              }
              if(!flag){
                quesList.push(jsonA);
              }
              flag = false;
            }
            that.setData({
              question_list: quesList,
            })
          }
        })
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