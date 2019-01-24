var Bmob = require('../../../utils/bmob.js');
var that = this;
var page_size = 10;
var total = 0;
Page({
  data: {
    loadingTip: '上拉加载更多',
    page_index: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.getQuesNum();
    that.loadMore();
  },

  getQuesNum: function () {
    var Questions = Bmob.Object.extend("questions");
    var query = new Bmob.Query(Questions);
    query.count({
      success: function (count) {
        total = count;
      }
    })
  },

  loadMore: function () {
    var molist = new Array();
    that = this;
    var Questions = Bmob.Object.extend("questions");
    var query = new Bmob.Query(Questions);
    query.limit(page_size);
    query.include("questioner")
    query.skip(page_size * that.data.page_index);
    query.descending('createdAt');
    // 查询所有数据
    query.find({
      success: function (results) {
        // 请求成功将数据存入question_list
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("questioner").objectId;
          var title = results[i].get("title");
          var content = results[i].get("content");
          var isClose = results[i].get("isClose");
          var likenum = results[i].get("likenum");
          var liker = results[i].get("liker");
          var commentnum = results[i].get("commentnum");
          var follownum = results[i].get("follownum");
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var username = results[i].get("questioner").nickname;
          var userPic = results[i].get("questioner").userPic;
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
            "likenum": likenum,
            "commentnum": commentnum,
            "follownum": follownum
          }
          molist.push(jsonA);
        }
        that.setData({
          question_list: molist
        });
        if (results.length < page_size) {
          that.setData({
            loadingTip: '没有更多内容'
          });
        }
      },
      error: function (error) {
        alert("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  onReachBottom: function () {
    if (total > page_size) {
      wx.showLoading({
        title: 'loading...',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 500)
      that.setData({
        page_index: that.data.page_index + 1
      });
      that.loadMore();
    }
  },
  onPullDownRefresh: function () {
    wx.showLoading({
      title: 'loading...',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
    that.setData({
      page_index: that.data.page_index - 1
    });
    if (that.data.page_index < 0) {
      that.data.page_index = 0;
    }
    that.loadMore();
  },

  showDetail: function (e) {
    //
    that = this;
    var queid = e.currentTarget.dataset.queid;
    var pubid = e.currentTarget.dataset.pubid;
    var isClose = e.currentTarget.dataset.isclose;
    // 跳转到详情页
    wx.navigateTo({
      url: '../detail/detail?queid=' + queid + '&pubid=' + pubid + "&isClose=" + isClose
    });
  },

})