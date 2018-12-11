var Bmob = require('../../utils/bmob.js');
var that;
Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var Article = Bmob.Object.extend("article");
    var query = new Bmob.Query(Article);
    // 按照priority逆序排列
    query.descending('priority');
    // 查询所有数据
    query.find({
      success: function (results) {
        // 请求成功将数据存入article_list
        that.setData({
          article_list: results
        });
      },
      error: function (error) {
        alert("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  showDetail: function (e) {
    // 获取wxml元素绑定的index值
    that = this;
    var index = e.currentTarget.dataset.index;
    // 取出objectId
    var objectId = that.data.article_list[index].id;
    // 跳转到详情页
    wx.navigateTo({
      url: '../detail/detail?objectId=' + objectId
    });
  }

})