(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/email/email"],{"754c":function(e,t,n){"use strict";var i=n("d292"),o=n.n(i);o.a},"8ee0":function(e,t,n){"use strict";n.d(t,"b",(function(){return o})),n.d(t,"c",(function(){return u})),n.d(t,"a",(function(){return i}));var i={uForm:function(){return n.e("uview-ui/components/u-form/u-form").then(n.bind(null,"a12d"))},uFormItem:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-form-item/u-form-item")]).then(n.bind(null,"3979"))},uInput:function(){return Promise.all([n.e("common/vendor"),n.e("uview-ui/components/u-input/u-input")]).then(n.bind(null,"b379"))}},o=function(){var e=this,t=e.$createElement;e._self._c},u=[]},"94be":function(e,t,n){"use strict";n.r(t);var i=n("8ee0"),o=n("99f7");for(var u in o)"default"!==u&&function(e){n.d(t,e,(function(){return o[e]}))}(u);n("754c");var a,r=n("f0c5"),s=Object(r["a"])(o["default"],i["b"],i["c"],!1,null,"69fce2d2",null,!1,i["a"],a);t["default"]=s.exports},"99f7":function(e,t,n){"use strict";n.r(t);var i=n("e6c5"),o=n.n(i);for(var u in i)"default"!==u&&function(e){n.d(t,e,(function(){return i[e]}))}(u);t["default"]=o.a},b070:function(e,t,n){"use strict";(function(e){n("f91f");i(n("66fd"));var t=i(n("94be"));function i(e){return e&&e.__esModule?e:{default:e}}e(t.default)}).call(this,n("543d")["createPage"])},d292:function(e,t,n){},e6c5:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=o(n("e178"));function o(e){return e&&e.__esModule?e:{default:e}}var u={data:function(){return{isFlag:!1,show:!1,tiemer:null,times:11,num:11,form:{email:"",code:""},rules:{email:[{required:!0,pattern:/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,message:"请输入正确邮箱"}],code:[{required:!0,pattern:/^\d{6}$/,message:"请输入正确验证码"}]}}},methods:{submit:function(){var e=this;this.$refs.uForms.validate((function(t){t?e.getCode():console.log("验证失败")}))},getCode:function(){(0,i.default)({url:"/checkValidCode",method:"POST",data:{validCode:this.form.code},success:function(t){console.log(t),"K001"==t.data.code&&(e.showToast({title:t.data.msg,icon:"none",mask:!0,duration:1e3}),setTimeout((function(){e.navigateTo({url:"../sigin/sigin"})}),1e3))}})},getEmail:function(){(0,i.default)({url:"/emailValidCode",method:"POST",data:{email:this.form.email},success:function(t){console.log(t),200==t.code&&e.showToast({title:t.data.msg,icon:"none",mask:!0,duration:1e3})}})},goTo:function(){e.navigateTo({url:"../login/login"})},time:function(){var e=this;console.log(this.num),this.isFlag=!this.isFlag,this.isFlag&&(this.getEmail(),this.tiemer=setInterval((function(){e.num--,e.num<10?e.times="0"+e.num:e.times=e.num,0==e.num&&(clearInterval(e.tiemer),e.tiemer=null,e.num=11,e.times=11,e.isFlag=!1)}),1e3))}},onReady:function(){this.$refs.uForms.setRules(this.rules)}};t.default=u}).call(this,n("543d")["default"])}},[["b070","common/runtime","common/vendor"]]]);