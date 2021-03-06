import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


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
    mainData:[],
    isFirstLoadAllStandard:['getSliderData','getMainData','getAboutData']
  },
  
  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.getSliderData();
    self.getAboutData()
  },

  onShow(){
    const self = this;
    self.getMainData(true)
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
  getSliderData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      title:'用户轮播',
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

  getMainData(isNew){
    const self = this;
    if(isNew){
      self.data.mainData = [];
      self.data.paginate = {
          count: 0,
          currentPage: 1,
          pagesize: 10,
          is_page: true,
      }
    };
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:2,
      user_type:0
    };
    postData.getAfter={
      label:{
        tableName:'label',
        middleKey:'relation_id',
        key:'id',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
       
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.messageGet(postData,callback);   
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


  phoneCall() {
    const self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.aboutData.contactPhone,
    })
  },
  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
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

  