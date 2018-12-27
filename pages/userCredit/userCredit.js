import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {

    mainData:[],
    userData:[],
    startTime:'',
    endTime:'',
    searchItem:{
      status:['in',[0,1]],
      type:3
    },
    isFirstLoadAllStandard:['getMainData','getUserInfoData','getComputeData'],
  },

  
  onLoad(){
    const self = this;
    api.commonInit(self);
    self.getMainData();
    self.getUserInfoData();
    self.getComputeData()
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },





  getUserInfoData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.userData = res.info.data[0];
      }
      self.setData({
        web_userData:self.data.userData,
      });
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getUserInfoData',self);
    };
    api.userInfoGet(postData,callback);   
  },

  

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem)
    postData.order = {
      create_time:'desc',
    };
/*    postData.getAfter = {
      shareScore:{
        tableName:'FlowLog',
        middleKey:'id',
        key:'id',
        searchItem:{
          status:1
        },
        condition:'=',
        compute:{
          total_count:[
            'sum',
            'count',
            {
              status:1,
              behavior:1,
              type:3,
              count:['>',0]
            }
          ]
        }
      }
    }*/
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
    api.flowLogGet(postData,callback);
  },

  getComputeData(){
    const self = this;
    const postData = {};
    postData.data = {
      FlowLog:{
        compute:{
          count:'sum',
        },
        
        searchItem:{
          user_no:wx.getStorageSync('info').user_no,
          type:3,
          behavior:2,
          count:['>',0]
        }
      }
    };
    const callback = (res)=>{
      self.data.computeData = res;
      self.setData({
        web_computeData:self.data.computeData,
      });
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getComputeData',self)
    };
    api.flowLogCompute(postData,callback);
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },







})


  