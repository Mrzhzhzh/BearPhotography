import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({


  data: {
    num:0,
    searchItem:{
      
    },
    isFirstLoadAllStandard:['getMainData','getLabelData'],
    labelData:[],
    mainData:[],
  },

  onLoad(options){
    const self = this;
    api.commonInit(self);
    if(options.id){
      self.data.num = options.id;
      self.data.searchItem.category_id = options.id
    };
    self.getMainData();
    self.getLabelData();
    self.setData({
      web_num:self.data.num
    })  
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = 2;
    postData.order = {
      create_time:'normal'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
       
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.buttonCanClick(self,true);
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.skuGet(postData,callback);   
  },

  getLabelData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['商品分类']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data);
         
      }else{
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getLabelData',self);

      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },


   
  tab(e){
    const self = this;
    api.buttonCanClick(self);
    var num = api.getDataSet(e,'num')
    self.changeSearch(num)
  },

  changeSearch(num){
    const self = this;
    self.setData({
      web_num: num
    });
    if(num==0){
      delete self.data.searchItem.category_id
    }else{
      self.data.searchItem.category_id = num;
    }
    
    self.getMainData(true);
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


  intoPathRedi(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 
 
})

  