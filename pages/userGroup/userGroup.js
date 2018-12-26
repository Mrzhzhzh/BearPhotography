import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    num:0,
    isFirstLoadAllStandard:['getMainData'],
    mainData:[],
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
 
      level:1
    }

  },
    

  onLoad(){
    const self = this;
    api.commonInit(self);
 /*   if(self.data.searchItem.parent_no&&self.data.searchItem.parent_no!=undefined){
      self.getMainData();
    }else{
      var token = new Token();
      const callback = (res)=>{
        console.log(res)
        self.getMainData(false,res)
      };
      token.getProjectToken(callback,{refreshToken:true});
    };*/
    self.getMainData();
    self.setData({
      num:self.data.num
    })  
  },



  getMainData(isNew,res){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    console.log(self.data.searchItem);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.parent_no=wx.getStorageSync('info').user_no;
    postData.order = {
      create_time:'desc'
    }
    postData.getAfter = {
      userInfo:{
        tableName:'user',
        middleKey:'child_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'=',
        info:['nickname','headImgUrl']
      },
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    if(!postData.searchItem.parent_no){
      api.showToast('网络故障','none');
      return;
    };
    api.distributionGet(postData,callback);
  },

  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self)
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeSearch(num){
    const self = this;
    this.setData({
      num: num
    });
    if(num=='0'){
      self.data.searchItem.level = 1;
    }else if(num=='1'){
      self.data.searchItem.level = 2;
    };
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },


  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },



 
})

  