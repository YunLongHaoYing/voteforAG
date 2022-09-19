Page({
  data: {
    voteImage: [],
    VoteTitle: [],
    radioValue: '',
    result: [],
    userinfo: {},
    openid: '',
    islogin: false,
    isopenid: false,
    a: 1
  },
  onLoad: function () {
    let islogin = wx.getStorageSync('islogin') || false
    let userinfo = wx.getStorageSync('userinfo')
    let isname = wx.getStorageSync('isname') || false
    let isimage = wx.getStorageSync('isimage') || false
    let VoteTitle = wx.getStorageSync('VoteTitle')
    let voteImage = wx.getStorageSync('voteImage')
    //console.log(islogin)
    if (islogin) {
      this.setData({
        islogin: true,
        userinfo: userinfo,
      })
    }
    //判断本地是否存在/获取投票名字和图片
    if (isname) {
      this.setData({
        VoteTitle: VoteTitle
      })
    } else {
      this.getvotename()
    }
    if (isimage) {
      this.setData({
        voteImage: voteImage
      })
    } else {
      this.getvoteimage()
    }
    //微信登录获取openid
    this.wxlogin()
  },
  sureVote: function () {
    this.setData({
      a: 1
    })
    //let openid = wx.getStorageSync('openid')
    console.log(this.data.openid)
    //微信登录获取个人信息
    if (!this.data.islogin) {
      //登陆及获取用户信息
      this.wxgeiuserinfo()
      //console.log(this.data.islogin)
      //console.log(this.data.userinfo)
    } else {
      //console.log(this.data.islogin)
      //console.log(this.data.userinfo)
      if (this.radioValue == undefined) {
        wx.showToast({
          title: '请选择你的投票对象',
          icon: 'none'
        })
      } else {
        this.data.isopenid = wx.getStorageSync('isopenid')
        console.log(this.data.isopenid)
        if (this.data.isopenid){
          wx.setStorageSync('votevalue', this.radioValue)
          wx.redirectTo({
            url: '/pages/result/result'
          })
        } else {
          wx.request({
            url: 'http://localhost:8080/vote/voteupdate',
            data: {
              votevalue: this.radioValue
            },
            method: 'get',
            header: {
              'content-type': 'application/json'
            },
          })
          wx.setStorageSync('votevalue', this.radioValue)
          wx.redirectTo({
            url: '/pages/result/result'
          })
        }
      }
    }
  },
  radioChang: function (e) {
    console.log("选择的值为" + e.detail.value)
    this.radioValue = e.detail.value
    console.log(this.radioValue)
    if (this.data.a == 1) {
      //判断该用户是否投票
      this.isopenid()
      this.setData({
        a: 0
      })
    }
  },

  //获取投票名字
  getvotename: function () {
    console.log("我是获取投票名字")
    var that = this
    wx.request({
      url: 'http://localhost:8080/vote/votename',
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //console.log(res);
        that.setData({
          VoteTitle: res.data
        })
        wx.setStorageSync('VoteTitle', res.data)
        wx.setStorageSync('isname', true)
      },
      fail: function (res) {
        console.log("失败");
      }
    })
  },
  //获取投票图片
  getvoteimage: function () {
    console.log("我是获取投票图片")
    var that = this
    wx.request({
      url: 'http://localhost:8080/vote/voteimage',
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //console.log(res);
        that.setData({
          voteImage: res.data
        })
        wx.setStorageSync('voteImage', res.data)
        wx.setStorageSync('isimage', true)
      },
      fail: function (res) {
        wx.showToast({
          title: '网络连接失败！',
          icon: 'error'
        })
        console.log("失败");
      }
    })

  },
  //获取openid
  wxlogin: function () {
    console.log("我是获取openid")
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          //console.log(res.data)
          //发起网络请求
          wx.request({
            url: 'http://localhost:8080/vote/openid',
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              //console.log(res);
              let openid = res.data
              that.setData({
                openid: openid
              })
              //console.log(that.data.openid);
              wx.setStorageSync('openid', that.data.openid)
            },
            fail: function (res) {
              console.log("失败");
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  //登陆及获取用户信息
  wxgeiuserinfo: function () {
    console.log("我是登陆及获取用户信息")
    let that = this;
    wx.getUserProfile({
      desc: '获取个人信息以便于您的投票',
      success(res) {
        let userinfo = res.userInfo
        that.setData({
          islogin: true,
          userinfo: userinfo
        })
        console.log(that.islogin)
        wx.setStorageSync('islogin', true)
        wx.setStorageSync('userinfo', userinfo)
      },
      fail() {
        wx.showToast({
          title: '请求信息失败',
          icon: 'error'
        })
      }
    })
  },
  //判断该用户是否投票
  isopenid: function () {
    console.log("我是判断该用户是否投票")
    let that = this
    wx.request({
      url: 'http://localhost:8080/vote/isopenid',
      data: {
        openid: this.data.openid
      },
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data)
        let isopenid = res.data
        wx.setStorageSync('isopenid', isopenid)
      },
      fail() {
        wx.showToast({
          title: '网络连接失败！',
          icon: 'error'
        })
        console.log("失败");
      },
    })
  }
})
