import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({


  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    mainData:[],
    chooseId:[],
    tabCurrent:0,
    isShow:false,
    complete_api:[],
    keys:[],
    values:[],    
    count:1,
    id:'',
    searchItem:{
      status:['in',1]
    },
    skuIdArray:[],
    skuData:[],
    choosed_sku_item:[],
    can_choose_sku_item:[],
    skuLabelData:[],
    buttonType:'',
    buttonClicked:true,
    isInCollectData:false,
    is_collect:false,
    isFirstLoadAllStandard:['getMainData'],
    submitData:{
      passage1:''
    }
  },

  onLoad(options){
    const self = this;
    console.log(options)
    api.commonInit(self);
    if(options.id){
      self.data.id = options.id;
    };
    if(options.is_group){
      self.data.is_group = options.is_group
    };
    //初始化购物车
    var cartData = api.getStorageArray('cartData');
    var cartRes = api.findItemInArray(cartData,'id',self.data.id);
    self.data.cart_count = cartRes.length>0?cartRes[1].count:0;
    //初始化收藏
    var collectData = api.getStorageArray('collectData');
    self.data.isInCollectData = api.findItemInArray(collectData,'id',self.data.id);

    wx.showShareMenu({
      withShareTicket: true
    });
    self.getMainData();
    
    self.setData({
      
      web_isInCollectData:self.data.isInCollectData,
      web_cart_count:self.data.cart_count,
      web_count:self.data.count,
    });
    
  },

  collect(){
    const self = this;  
    if(getApp().globalData.buttonClick){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    if(self.data.isInCollectData){
      api.delStorageArray('collectData',self.data.choosed_skuData,'id'); 
    }else{
      api.setStorageArray('collectData',self.data.choosed_skuData,'id',999);
    };
    var collectData = api.getStorageArray('collectData');
    self.data.isInCollectData = api.findItemInArray(collectData,'id',self.data.id);
    self.setData({
      web_isInCollectData:self.data.isInCollectData,
    }); 
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
    };
    console.log(13,self.data.id);
    postData.getBefore={
      sku:{
        tableName:'sku',
        searchItem:{
          id:['in',[self.data.id]]
        },
        fixSearchItem:{
          status:1
        },
        key:'product_no',
        middleKey:'product_no',
        condition:'in',
      } 
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:api.cloneForm(self.data.searchItem)
      } 
    };
    if(self.data.is_group==1){
      postData.getAfter.sku.searchItem.is_group = ['in',1]
    };  
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];

        for(var key in self.data.mainData.label){
            console.log('self.data.mainData.sku_array',self.data.mainData.sku_array)
          if(self.data.mainData.sku_array.indexOf(parseInt(key))!=-1){
            self.data.skuLabelData.push(self.data.mainData.label[key])
          };    
        };

        for (var i = 0; i < self.data.mainData.sku.length; i++) {
          if(self.data.mainData.sku[i].id==self.data.id){
            self.data.choosed_skuData = api.cloneForm(self.data.mainData.sku[i]);
            self.data.choosed_sku_item = api.cloneForm(self.data.mainData.sku[i].sku_item);
            var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
            self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
      
          };
        };
        console.log('self.data.skuIdArray',self.data.skuIdArray)
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
        console.log(self.data.mainData)
      }else{
        api.showToast('商品信息有误','none');
      };
      console.log('getMainData',self.data.choosed_skuData);
      console.log('getMainDataweb_skuData',self.data.skuLabelData);

      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);

      self.setData({
        web_choosed_skuData:self.data.choosed_skuData,
        web_skuLabelData:self.data.skuLabelData,
        web_mainData:self.data.mainData,
        web_choosed_sku_item:self.data.choosed_sku_item,
        web_can_choose_sku_item:self.data.can_choose_sku_item,
      });

      /*sku逻辑说明
      被选中的sku数据choosed_skuData
      被选中的sku_item choosed_sku_item
      可供选择的sku_item can_choose_sku_item(包括被选中的sku_item)
       api.skuChoose(sku数据，被选中的sku_item)返回choosed_skuData，choosed_sku_item
      */

    };

    api.productGet(postData,callback);
  },

  chooseSku(e){
    const self = this;

    
    var id = api.getDataSet(e,'id');
    if(self.data.can_choose_sku_item.indexOf(id)==-1){
      return;
    };

    var index = self.data.choosed_sku_item.indexOf(id);
    if(index==-1){
      self.data.choosed_sku_item.push(id);
    }else{
      self.data.choosed_sku_item.splice(index,1);
    };
    var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
    self.data.choosed_skuData = skuRes.choosed_skuData;
    self.data.can_choose_sku_item = skuRes.can_choose_sku_item;

    self.data.count = 1;
    self.countTotalPrice();
    self.setData({
      web_choosed_sku_item:self.data.choosed_sku_item,
      web_choosed_skuData:self.data.choosed_skuData,
      web_can_choose_sku_item:self.data.can_choose_sku_item,
    });
    
  },


  //计算数量
  counter(e){

    const self = this;

    if(JSON.stringify(self.data.choosed_skuData)!='{}'){
      if(api.getDataSet(e,'type')=='+'){
        self.data.count++;
      }else if(self.data.choosed_skuData.count > '1'){
        self.data.count--;
      }
      self.data.choosed_skuData.count = self.data.count;
    }else{
      self.data.count = 1;
    };
    self.countTotalPrice();

  },

  //计算总价
  countTotalPrice(){  
    const self = this;
    var totalPrice = 0;
    if(JSON.stringify(self.data.choosed_skuData)!='{}'){
      totalPrice += self.data.count*parseFloat(self.data.choosed_skuData.price);
      self.data.totalPrice = totalPrice.toFixed(2);
    };
    self.data.totalPrice = totalPrice;
    self.setData({
      web_count:self.data.count,
      web_totalPrice:self.data.totalPrice
    });
  },

  bindManual(e) {
    const self = this;
    var count = e.detail.value;
    self.setData({
      web_count:count
    });
  },



  selectModel(e){
    const self = this;
    
    self.data.buttonType = api.getDataSet(e,'type');
    console.log( self.data.buttonType)
    self.data.isShow = !self.data.isShow;
    self.setData({
      web_buttonType:self.data.buttonType,
      isShow:self.data.isShow
    })

  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');

    self.setData({
      web_submitData:self.data.submitData,
    }); 
    console.log(self.data.submitData)
  },

  addCart(e){
    const self = this;

    if(JSON.stringify(self.data.choosed_skuData)=='{}'){
      api.showToast('未选中商品','success');
      return;
    };
    self.data.choosed_skuData.count = self.data.count;
    self.data.choosed_skuData.isSelect = true;
    var res = api.setStorageArray('cartData',self.data.choosed_skuData,'id',999); 
    if(res){
      api.showToast('加入成功','success');
      self.data.isShow = !self.data.isShow;
      self.setData({
        isShow:self.data.isShow
      })
    };
    var cartData = api.getStorageArray('cartData');
    var cartRes = api.findItemInArray(cartData,'id',self.data.id);
    self.data.cart_count = cartRes.length>0?cartRes[1].count:0;
    self.setData({
      web_cart_count:self.data.cart_count,
    }); 
  },

  goBuy(){

    const self = this;
    api.buttonCanClick(self);
    
    if(JSON.stringify(self.data.choosed_skuData)=='{}'){
      api.showToast('未选中商品','success');
      api.buttonCanClick(self,true);
      return;
    };
    const c_postData = {
      tokenFuncName:'getProjectToken',
      sku:[
        {
          id:self.data.choosed_skuData.id,
          count:self.data.count,
          passage1:self.data.submitData.passage1
        }
      ],
      type:1

    };

    const c_callback = (res)=>{
      api.buttonCanClick(self,true);
      if(res&&res.solely_code==100000){
        api.pathTo('/pages/confirmOrder/confirmOrder?order_id='+res.info.id,'nav');        
      }else{
        api.showToast(res.msg,'none');
        api.buttonCanClick(self,true);
      };
    };
    api.addOrder(c_postData,c_callback);

  },





  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  close(){
    const self = this;
    self.setData({
      isShow:false
    })
  },
  
  select_this(e){
    const self = this;
    self.setData({
      tabCurrent:e.currentTarget.dataset.current
    })
    console.log(self.data.tabCurrent)
  },

})

