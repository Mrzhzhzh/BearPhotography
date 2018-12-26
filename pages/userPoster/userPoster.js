import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  
  data: {
    isFirstLoadAllStandard:['getQrData'],
    QrData:[]
  },

  onLoad(){
    const self = this;
    api.commonInit(self);
    self.getQrData();
    
  },

  
  getQrData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken'
    postData.qrInfo = {
      scene:wx.getStorageSync('info').user_no,
      path:'pages/index/index',
    };
    postData.output = 'url';
    postData.ext = 'png';
    const callback = (res)=>{
      if(res.solely_code==100000){
        self.data.QrData = res; 
      }else{
        api.showToast(res.msg,'none')
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getQrData',self)
      self.setData({
        web_QrData:self.data.QrData,
      });
    };
    api.getQrCode(postData,callback);
 },

 onShareAppMessage(res){
    const self = this;
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '威尼熊经典儿童摄影',
         path: 'pages/index/index?parent_no='+wx.getStorageSync('info').user_no,
        success: function (res){
          console.log(res);
          console.log(parentNo)
          if(res.errMsg == 'shareAppMessage:ok'){
            console.log('分享成功')
            if (self.data.shareBtn){
              if(res.hasOwnProperty('shareTickets')){
              console.log(res.shareTickets[0]);
                self.data.isshare = 1;
              }else{
                self.data.isshare = 0;
              }
            }
          }else{
            wx.showToast({
              title: '分享失败',
            })
            self.data.isshare = 0;
          }
        },
        fail: function(res) {
          console.log(res)
        }
      }
  },

})

  