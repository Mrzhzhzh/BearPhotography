import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


Page({
  data: {
    mainData:[],
    labelData:[],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    currentId:0,
    swiperIndex:0,
    isFirstLoadAllStandard:['getSliderData','getLabelData','getMainData','getAboutData']
  },

  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.getSliderData();
    self.getLabelData();
    self.getMainData();
    self.getAboutData()
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
      console.log(self.data.labelData)
      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:2,
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
        if(res.info.data.length>4){
          self.data.mainData = self.data.mainData.slice(0,4) 
        }
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.skuGet(postData,callback);   
  },

  getSliderData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      title:'商品轮播',
    };
   
    const callback = (res)=>{
      if(res.info.data.length>0){ 
        self.data.sliderData = res.info.data[0]
      };
      self.setData({
        web_sliderData:self.data.sliderData
      });
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getSliderData',self);
    };
    api.labelGet(postData,callback);
  },

  getAboutData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:2,
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['有关店面']],
        },
        middleKey:'menu_id',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.aboutData = res.info.data[0];
        self.data.aboutData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getAboutData',self);
      self.setData({
        web_aboutData:self.data.aboutData,
      });
    };
    api.articleGet(postData,callback);   
  },

  intoMap:function(){
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {  //因为这里得到的是你当前位置的经纬度
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({        //所以这里会显示你当前的位置
          // longitude: 109.045249,
          // latitude: 34.325841,
          longitude: 109.038907,
          latitude: 34.319956,
          name: "长安区韦曲建材街十三中向西50米路北(耀阳灯饰二楼)",
          address:"长安区韦曲建材街十三中向西50米路北(耀阳灯饰二楼)",
          scale: 28
        })
      }
    })
  },

  phoneCall() {
    const self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.aboutData.contactPhone,
    })
  },

  swiperChange(e) {
    const that = this;
    that.setData({
      swiperIndex: e.detail.current,
    })
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 

})

  