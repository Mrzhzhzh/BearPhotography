import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();





Page({
  data: {
    mainData:[],
    
    isFirstLoadAllStandard:['getMainData']
  },


  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.data.id = options.id;
    if(options.type){
      self.setData({
        web_type:options.type
      })
    };
    self.getMainData();   
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      id:self.data.id,
      thirdapp_id:getApp().globalData.thirdapp_id
    }; 
    postData.getAfter={
      label:{
        tableName:'label',
        middleKey:'menu_id',
        key:'id',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      }    
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.articleGet(postData,callback);
  },


})


  