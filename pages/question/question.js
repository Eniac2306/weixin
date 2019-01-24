//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/getCode.js')
var that;
var myDate = new Date();

Page({

  data: {
    TopTips:"",
    noteMaxLen: 200,//备注最多字数
    content: "",
    noteNowLen: 0,//备注当前字数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({//初始化数据
      isLoading: false,
      loading: true,
      isdisabled: false
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var myInterval = setInterval(getReturn, 500); ////半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_openid',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval)
            that.setData({
              loading: true
            })
          }
        }
      })
    }
  },

  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value, noteNowLen: len
    })
  },

  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },

  //提交表单
  submitForm: function (e) {
    var that = this;

    var title = e.detail.value.title;
    var content = e.detail.value.content;
   
    //先进行表单非空验证
    if (title == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入主题'
      });
    } else if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入内容'
      });
    } else {
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      //向 Events 表中新增一条数据
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Diary = Bmob.Object.extend("questions");
          var diary = new Diary();
          var me = new Bmob.User();
          me.id = ress.data;
          diary.set("title", title);
          diary.set("content", content);
          diary.set("questioner", me);
          diary.set("likenum", 0);
          diary.set("commentnum", 0);
          diary.set("follownum", 0);
          diary.set("isClose", 0);
          diary.set("liker", []);
          //新增操作
          diary.save(null, {
            success: function (result) {
              that.setData({
                isLoading: false,
                isdisabled: false,
              })
              //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
              common.dataLoading("成功", "success", function () {
                //重置表单
                //that.setData({
                // title: '',
                //  content: "",
                //  noteNowLen: 0,
                //}),
                wx.switchTab({
                  url: '../list/list'
                });
              });
            },
            error: function (result, error) {
              //添加失败
              console.log("发布失败=" + error);
              common.dataLoading("发布失败", "loading");
              that.setData({
                isLoading: false,
                isdisabled: false
              })
            }
          })
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

})