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

})

  