import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {

    mainData:[],
    addressData:[],
    userInfoData:[],
    idData:[],
    orderData:[],
    couponData:[],
    couponId:[],
    searchItem:{
      isdefault:1
    },
    submitData:{
      passage1:''
    },
    sForm:{
      score:0,
    },
    scoreForm:{

    },
    searchItemTwo:{
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
      user_no:wx.getStorageSync('mall_info').user_no,
      type:['in',[3,4]]
    },
    order_id:'',
    order_array:[],
    buyType:'delivery',
    isFirstLoadAllStandard:['getMainData','getAddressData','getUserData','distributionGet'],
    pay:{
      coupon:[]
    },
    couponTotalPrice:0

  },

  onLoad(options) {

    const self = this;
    api.commonInit(self);
    if(options.order_id){
      self.data.order_id = options.order_id;
      self.data.order_array = options.order_id.split(',');
    }else{
      api.showToast('数据传递有误','error');
    };
    self.setData({
      web_buyType:self.data.buyType
    });
    getApp().globalData.address_id = '';
    self.getMainData();
    self.getUserData();
    self.distributionGet()
  },

 

  onShow(){

    const self = this;
    self.data.searchItem = {};
    if(getApp().globalData.address_id){
      self.data.searchItem.id = getApp().globalData.address_id;
    }else{
      self.data.searchItem.isdefault = 1;
    };
    
    self.getAddressData();

  },

  onUnload(){
    const self = this;
    wx.removeStorageSync('payPro');
  },


  getMainData(isNew){

    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      id:['in',self.data.order_array]
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data;
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });     
      self.countPrice();
    };
    api.orderGet(postData,callback);

  }, 

  getUserData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.userData = res.info.data[0]; 
        }
        self.setData({
          web_userData:self.data.userData,
        });  
      }else{
        api.showToast('网络故障','none')
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getUserData',self);
    };
    api.userInfoGet(postData,callback);   
  }, 

  distributionGet(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      child_no:wx.getStorageSync('info').user_no
    };

    const callback = (res)=>{
      if(res){
        self.data.distributionData = res;
        self.setData({
          web_distributionData:self.data.distributionData,
        });   
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'distributionGet',self)
    };
    api.distributionGet(postData,callback);

  },
  

  inputBind(e){
    const self = this;
     api.fillChange(e,self,'sForm');
      console.log('inputBind',self.data.sForm.score);
      console.log('inputBind',self.data.userData.score)
      if(parseInt(self.data.sForm.score)>parseInt(self.data.userData.score)||parseInt(self.data.sForm.score)>parseInt(self.data.price)){
        api.showToast('积分不符合规则','none');
        self.data.sForm.score = '';
        self.setData({
          web_sForm:self.data.sForm,
        }); 
        return;
      };

    console.log('test',self.data.sForm);
    self.countPrice(); 

  },


  
  countPrice(){

    const self = this;
    var totalPrice = 0;
    var couponPrice = 0;
    var productsArray = self.data.mainData.products;
    self.data.price = api.addItemInArray(self.data.mainData,'price');
    console.log('self.data.price',self.data.price)
    if(self.data.sForm.score>0){
      self.data.pay.score = self.data.sForm.score
    };
   /* if(self.data.sForm.balance>0){
      self.data.pay.balance = self.data.sForm.balance
    };*/
    var ratio = parseInt(wx.getStorageSync('info').thirdApp.custom_rule.payScoreRatio);
    var wxPay = self.data.price - self.data.sForm.score/parseInt(wx.getStorageSync('info').thirdApp.custom_rule.payScoreRatio);
    if(wxPay>0){
      self.data.pay.wxPay = {
        price:wxPay,
      };
    }else{
      delete self.data.pay.wxPay;
    };
    console.log('self.data.sForm.score',self.data.sForm.score);
    console.log('ratio',ratio);
    console.log('countPrice-wxPay',wxPay);
    console.log('countPrice-price',self.data.price);
    console.log('countPrice',self.data.pay);
    self.setData({
      web_couponPrice:parseFloat(self.data.couponTotalPrice).toFixed(2),
      web_price:parseFloat(self.data.price).toFixed(2),
      web_pay:self.data.pay
    });

  },






  getAddressData(){
    const self = this;
    const postData = {}
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {isdefault:1};
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.addressData = res.info.data[0]; 
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getAddressData',self);
      self.setData({
        web_addressData:self.data.addressData,
      });
    };
    api.addressGet(postData,callback);
  },




  pay(order_id){

    const self = this;
    const postData = self.data.pay;
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      id:self.data.order_id
    };
    postData.payAfter = [];
    if(self.data.submitData.passage1&&self.data.submitData.passage1!=''){
      postData.payAfter.push(
        {
          tableName:'order',
          FuncName:'update',
          data:{
            passage1:self.data.submitData.passage1
          },
          searchItem:{
            id:self.data.order_id
          }
        }
      );
    };
    if(self.data.pay.wxPay&&self.data.pay.wxPay.price&&self.data.pay.wxPay.price>0&&wx.getStorageSync('info').thirdApp.custom_rule&&wx.getStorageSync('info').thirdApp.custom_rule.getScoreRatio&&wx.getStorageSync('info').thirdApp.custom_rule.getScoreRatio>0){
      postData.payAfter.push({
        tableName:'FlowLog',
        FuncName:'add',
        data:{
          count:self.data.pay.wxPay.price/parseInt(wx.getStorageSync('info').thirdApp.custom_rule.getScoreRatio),//62.5%
          trade_info:'购物得积分',
          user_no:wx.getStorageSync('info').user_no,
          type:3,
          thirdapp_id:getApp().globalData.thirdapp_id
        }
      });
    };
    if(self.data.distributionData.info.data.length>0){
        var transitionArray = self.data.distributionData.info.data;
        for (var i = 0; i < transitionArray.length; i++){
          if(self.data.pay.wxPay&&self.data.pay.wxPay.price&&self.data.pay.wxPay.price>0&&transitionArray[i].level==1&&wx.getStorageSync('info').thirdApp.custom_rule.firstClass>0){
            postData.payAfter.push({
              tableName:'FlowLog',
              FuncName:'add',
              data:{
                behavior:1,
                count:self.data.pay.wxPay.price/parseInt(wx.getStorageSync('info').thirdApp.custom_rule.firstClass),
                trade_info:'下级消费返积分',
                user_no:transitionArray[i].parent_no,
                type:3,
                thirdapp_id:getApp().globalData.thirdapp_id
              }
            });
          };
          if(self.data.pay.wxPay&&self.data.pay.wxPay.price&&self.data.pay.wxPay.price>0&&transitionArray[i].level==2&&wx.getStorageSync('info').thirdApp.custom_rule.secondClass>0){
            postData.payAfter.push({
              tableName:'FlowLog',
              FuncName:'add',
              data:{
                behavior:1,
                count:self.data.pay.wxPay.price/wx.getStorageSync('info').thirdApp.custom_rule.secondClass,
                trade_info:'下级消费返积分',
                user_no:transitionArray[i].parent_no,
                type:3,
                thirdapp_id:getApp().globalData.thirdapp_id
              }
            });
          };
      };
    }
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info){
          const payCallback=(payData)=>{
            if(payData==1){
              const cc_callback=()=>{
                api.pathTo('/pages/userOrder/userOrder','redi');
              };
              api.showToast('支付成功','none',1000,cc_callback);
            };   
          };
          api.realPay(res.info,payCallback); 
        }else{
          api.showToast('支付成功','none',1000,function(){
            api.pathTo('/pages/userOrder/userOrder','redi');
          }); 
        };
      }else{
        api.showToast(res.msg,'none');
      };
      api.buttonCanClick(self,true);

    };
    api.pay(postData,callback);

  },



  chooseBuyWay(e){

    const self = this;
    console.log(e)
    var buyType = api.getDataSet(e,'buytype');
    self.data.buyType = buyType;
    console.log(self.data.buyType)
    self.setData({
      web_buyType:self.data.buyType
    });

  },

  checkboxChange(e) {
    const self = this;
    self.data.id = e.detail.value;
    console.log(self.data.id);
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    });  
  },


  submit(e){
    const self = this;
    api.buttonCanClick(self);
    if(self.data.buyType=='delivery'&&self.data.addressData.length==0){
      api.showToast('请选择收货地址','error');
      api.buttonCanClick(self,true);
      return;
    };
    self.pay();
  },


})

  