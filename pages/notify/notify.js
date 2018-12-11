var util = require('../../utils/util.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    navTab: ["通知", "赞与感谢", "关注"],
    currentNavtab: "0",
    text: ''
  },

  onLoad: function() {

  },

// 切换
  switchTab: function (e) {
    console.log(e);
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  }
});