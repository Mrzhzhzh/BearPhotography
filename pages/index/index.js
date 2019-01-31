import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {
    is_show:false,
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
    isFirstLoadAllStandard:['getSliderData','getLabelData','getMainData','getActiveData','getAboutData'],
    labelData:[],
    mainData:[],
    activeData:[],
    aboutData:[]
  },


  onLoad(options) {
    const self = this;
    api.commonInit(self);
    token.getProjectToken();
    if(options.scene){
      var scene = decodeURIComponent(options.scene)
    };
    if(options.parent_no){
      var scene = options.parent_no
    };
    if(scene){
       const callback=(res)=>{
        self.getSliderData();
        self.getLabelData();
        self.getMainData();
        self.getActiveData();
        self.getAboutData()
      };
      api.parentAdd('getProjectToken',scene,callback); 
    }else{
      self.getSliderData();
        self.getLabelData();
        self.getMainData();
        self.getActiveData();
        self.getAboutData()
    }
    
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
          title:['=',['文章分类']],
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
      menu_id:['NOT IN',[7,8]]
    };
    postData.order = {
      create_time:'desc'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
        if(res.info.data.length>6){
          self.data.mainData = self.data.mainData.slice(0,6) 
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
    api.articleGet(postData,callback);   
  },

  getActiveData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:2,
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['活动介绍']],
        },
        middleKey:'menu_id',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.activeData.push.apply(self.data.activeData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getActiveData',self);
      self.setData({
        web_activeData:self.data.activeData,
      });
    };
    api.articleGet(postData,callback);   
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

  getSliderData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      title:'首页轮播',
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

  intoMap:function(){
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {  //因为这里得到的是你当前位置的经纬度
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({        //所以这里会显示你当前的位置
          // longitude: 109.045249,
          // latitude: 34.325841,
          longitude: 108.9259300000,
          latitude: 34.1639200000,
          name: "威尼熊经典儿童摄影(长安店)",
          address:"长安区韦曲建材街十三中向西50米路北(耀阳灯饰二楼)",
          scale: 28
        })
      }
    })
  },

  saveImageToPhotosAlbum() {  
    const self = this;
    wx.showLoading();
    wx.downloadFile({  
      url: self.data.aboutData.mainImg[0].url,  
      success: function (res) {  
        console.log("下载文件：success");  
        console.log(res);  

        // 保存图片到系统相册  
        wx.saveImageToPhotosAlbum({  
          filePath: res.tempFilePath,  
          success(res) {  
            console.log("保存图片：success");  
            wx.showToast({  
              title: '保存成功',  
            });  
            self.data.is_show = false;
            self.setData({
              is_show:self.data.is_show
            });
          },  
          fail(res) {  
            console.log("保存图片：fail");  
            console.log(res);  
          }  
        })  
      },  
      fail: function (res) {  
      
        console.log(res);  
      }  
    }) 
    wx.hideLoading(); 
  },

  

  wx_contact(){
    const self =this;
    self.setData({
      is_show:true,
    })
  },
  mask(){
    const self =this;
    self.setData({
      is_show:false,
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

  