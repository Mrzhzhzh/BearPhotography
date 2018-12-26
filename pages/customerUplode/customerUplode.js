import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();

Page({
  data: {
    isFirstLoadAllStandard:['getLabelData'],
    submitData:{
      description:'',
      mainImg:[],
      relation_id:'',
      title:''
    },
    labelData:[],
  },


  onLoad(options){
     const self = this;
     api.commonInit(self);
     self.getLabelData()
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

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');

    self.setData({
      web_submitData:self.data.submitData,
    }); 
    console.log(self.data.submitData)
  },

  messageAdd(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data = api.cloneForm(self.data.submitData);
    console.log(postData)
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('添加成功','none',1000);
        setTimeout(function(){
          wx.navigateBack({
            delta:1
          })
        }, 1000)
      }else{
        api.showToast(res.msg,'none');
      };
      api.buttonCanClick(self,true);
    };
    api.messageAdd(postData,callback);  
  },

  upLoadImg(){
    const self = this;
    if(self.data.submitData.mainImg.length>2){
      api.showToast('仅限3张','fail');
      return;
    };
    wx.showLoading({
      mask: true,
      title: '图片上传中',
    });
    const callback = (res)=>{
      console.log('res',res)
      if(res.solely_code==100000){

        self.data.submitData.mainImg.push({url:res.info.url})
        self.setData({
          web_submitData:self.data.submitData
        });
        console.log('web_submitData',web_submitData);
        wx.hideLoading()  
      }else{
        api.showToast('网络故障','none')
      }

    };

    wx.chooseImage({
      count:1,
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        console.log(callback)
        api.uploadFile(tempFilePaths[0],'file',{tokenFuncName:'getProjectToken'},callback)
      },
      fail: function(err){
        wx.hideLoading();
      }
    })
  },


  submit(){
    const self = this;
    api.buttonCanClick(self);
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
      const callback = (user,res) =>{
           self.messageAdd(); 
       };
       api.getAuthSetting(callback);   
       
    }else{
      api.showToast('请补全信息','fail');
      api.buttonCanClick(self,true);
    };
  },


  select(e) {
    const self = this;
    var index = e.detail.value;
    self.data.submitData.relation_id = self.data.labelData[index].id;
    self.setData({
      web_index:index,
      web_submitData: self.data.submitData
    })
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

  