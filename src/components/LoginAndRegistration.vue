<script setup>
import {ref, defineEmits, reactive, computed, getCurrentInstance, toRefs, toRaw} from "vue";

const { $axios, $layer } = getCurrentInstance().appContext.config.globalProperties

let user = reactive({
  name: null,
  email: null,
  password: null
})

let insertedRef = ref(null)
let input_yz = ref(null)
//验证码
let code = reactive({
  a: "",
  b: "",
  c: "",
  d: "",
})
//解构验证码
let {a, b, c, d} = toRefs(code)

function switchFocus(event){
  console.log(event.target.value)
  if(event.target.value === ""){
    return
  }
  if(+event.target.dataset.dex === 3){
    submitCode()
  }else {
    input_yz.value.children[+event.target.dataset.dex+1].focus()
  }
}


const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
const regPwd = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/;
const regName = /^\S{3,}$/
/**
 * 验证邮箱
 * @type {ComputedRef<unknown>}
 * @return {boolean}
 */
let checkEmail = computed(()=>{
  if(!user.email){
    return user.email === ""
  }
  return !regEmail.test(user.email)
})
/**
 * 验证密码
 * @type {ComputedRef<unknown>}
 * @return {boolean}
 */
let checkPassWord = computed(()=>{
  if(!user.password){
    return user.password === ""
  }
  return !regPwd.test(user.password)
})
/**
 * 验证用户名
 * @type {ComputedRef<unknown>}
 * @return {boolean}
 */
let checkName= computed(()=>{
  if(!user.name){
    return user.name === ""
  }
  return !regName.test(user.name)
})
/**
 * 按钮是否为禁用状态
 * @type {ComputedRef<unknown>}
 * @return {boolean}
 */
let isDisabled = computed(()=>{
  if(switchingModule.value){
    return user.email && user.password && !checkEmail.value && !checkPassWord.value
  }
  else {
    return checkEmail && checkPassWord
  }
})

let cid = ''
//登录和注册提交方法 true为登录操作 false为注册操作
function submit() {
  if (switchingModule.value) {
    $axios.post("/user/login", {
      ...user
    }).then(
        response =>{
          console.log(response)
          if(response.data.code === 200){
            $layer.msg("登录成功！")
            setTimeout(()=>{
              window.location.reload()
            },500)
          }else {
            $layer.msg("登录失败！"+response.data.msg)
          }
        }
    )
  } else {
    $axios.post("/user/register", {
      ...user
    }).then(
        response => {
          if(response.data.code === 200) {
            cid = response.data.data
            openCaptcha()
          }
        }
    )
  }
}

/**
 * 提交验证码
 *
 */
function submitCode(){
  console.log("提交验证码")
  $axios.post("/user/submitCode",{
    code: Object.values(toRaw(code)).join(""),
    codeId: cid
  }).then(
      response =>{
        if(response.data.code === 200){
          $layer.msg(response.data.msg)
          insertedRef.value.classList.remove("open_code")
          closeWindow()
        }else {
          $layer.msg(response.data.msg)
        }
      }
  )
}
//打开验证码页面
function openCaptcha(){
  insertedRef.value.classList.add("open_code")
}

let emit = defineEmits(["closeLogin"])
// switchingModule用于切换显示登录和注册 ，true为登录 false为注册
let switchingModule = ref(true)
function closeWindow(){
  switchingModule.value = true
  emit('closeLogin')
}

/**
 * 切换登录和注册窗口
 */
function registrationModule(){
  user.name = null
  user.email = null
  user.password = null
  switchingModule.value = !switchingModule.value
}
</script>

<template>
  <div class="overlay_container">
    <div class="wrapper">
      <div class="overlay_pane">
        <div class="container">
          <div class="close" @click="closeWindow">
            <svg  class="icon" viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg" ><path d="M614.69312 511.99872l308.08448 308.09088c18.9056 18.8992 18.9056 49.55008 0 68.45824l-34.22976 34.22976c-18.9056 18.90688-49.56032 18.90688-68.45952 0L511.99872 614.6944l-308.0896 308.0832c-18.90048 18.90688-49.55008 18.90688-68.45568 0l-34.23488-34.22976c-18.90432-18.90816-18.90432-49.56032 0-68.45824l308.08576-308.09088L101.21856 203.9104c-18.90432-18.90048-18.90432-49.55008 0-68.45952l34.23488-34.22976c18.9056-18.9056 49.5552-18.9056 68.45568 0L511.99872 409.3056 820.08832 101.22112c18.90048-18.9056 49.5552-18.9056 68.45952 0l34.22976 34.22976c18.9056 18.90944 18.9056 49.56416 0 68.45952L614.69312 511.99872 614.69312 511.99872zM614.69312 511.99872" fill="#272636"></path></svg>
          </div>
          <div class="inserted" ref="insertedRef">
            <div class="container-xs" v-if="true">
              <div class="title">
                <div class="lo_ding" v-if="switchingModule">
                  <h1 style="font-weight: 400; margin-bottom: 10px">欢迎回来！</h1>
                  <p>我们很高兴再次见到你!</p>
                </div>
                <h2 v-if="!switchingModule" style="font-weight: 400">创建账户</h2>
              </div>
              <div class="from">
                <div class="fill_items" v-if="!switchingModule">
                  <input type="text" name="name" class="input" placeholder="显示名称" v-model="user.name" maxlength="10">
                  <span v-show="checkName">至少必须为3个字符</span>
                </div>
                <div class="fill_items">
                  <input type="email" name="email" class="input" placeholder="电子邮箱" v-model="user.email" maxlength="24">
                  <span v-show="checkEmail">必须是有效的电子邮箱地址</span>
                </div>
                <div class="fill_items">
                  <input type="password" name="password" class="input" placeholder="密码" v-model="user.password" maxlength="16">
                  <span v-show="checkPassWord">至少必须为6个以上（含6个），并且由字母和数字组成</span>
                </div>
              </div>
              <div class="items" v-if="switchingModule"><a>忘记密码？</a></div>
              <button :class="{'disabled': isDisabled}" @click="submit">{{switchingModule?"登录" : "继续"}}</button>
              <div class="items">{{switchingModule? "需要一个账户？" : "" }}<a @click="registrationModule">{{ switchingModule? "注册" : "已有账户了?" }}</a></div>
            </div >
            <div class="container-yz" v-if="true">
              <div class="form_yz">
                <p class="heading">Verify</p>
                <svg class="check" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="60px" height="60px" viewBox="0 0 60 60" xml:space="preserve">
                  <image id="image0" width="60" height="60" x="0" y="0" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAQAAACQ9RH5AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
                    AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ
                    cwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0NDzN/r+StAAACR0lEQVRYw+3Yy2sTURTH8W+bNgVf
                    aGhFaxNiAoJou3FVEUQE1yL031BEROjCnf4PLlxILZSGYncuiiC48AEKxghaNGiliAojiBWZNnNd
                    xDza3pl77jyCyPzO8ubcT85wmUkG0qT539In+MwgoxQoUqDAKDn2kSNLlp3AGi4uDt9xWOUTK3xg
                    hVU2wsIZSkxwnHHGKZOxHKfBe6rUqFGlTkPaVmKGn6iYao1ZyhK2zJfY0FZ9ldBzsbMKxZwZjn/e
                    5szGw6UsD5I0W6T+hBhjUjiF7bNInjz37Ruj3igGABjbtpIo3GIh30u4ww5wr3fwfJvNcFeznhBs
                    YgXw70TYX2bY/ulkZhWfzfBbTdtrzjPFsvFI+T/L35jhp5q2owDs51VIVvHYDM9sa/LY8XdtKy1l
                    FXfM8FVN2/X2ajctZxVXzPA5TZvHpfb6CFXxkerUWTOcY11LX9w0tc20inX2mmF4qG3upnNWrOKB
                    hIXLPu3dF1x+kRWq6ysHpkjDl+7eQjatYoOCDIZF3006U0unVSxIWTgTsI3HNP3soSJkFaflMDwL
                    3OoHrph9YsPCJJ5466DyOGUHY3Epg2rWloUxnMjsNw7aw3AhMjwVhgW4HYm9FZaFQZ/bp6QeMRQe
                    hhHehWKXGY7CAuSpW7MfKUZlAUqWdJ3DcbAAB3guZl9yKC4WYLfmT4muFtgVJwvQx7T2t0mnXK6J
                    XlGGyAQvfNkaJ5JBmxnipubJ5HKDbJJsM0eY38QucSx5tJWTVHBwqDDZOzRNmn87fwDoyM4J2hRz
                    NgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xM1QxMzoxNTo1MCswMDowMKC8JaoAAAAldEVY
                    dGRhdGU6bW9kaWZ5ADIwMjMtMDItMTNUMTM6MTU6NTArMDA6MDDR4Z0WAAAAKHRFWHRkYXRlOnRp
                    bWVzdGFtcAAyMDIzLTAyLTEzVDEzOjE1OjUxKzAwOjAwIIO3fQAAAABJRU5ErkJggg==">
                  </image>
                </svg>
                <div class="box" @keyup="switchFocus" ref="input_yz">
                  <input class="input_yz" type="number" maxlength="1" v-model="a" :data-dex="0">
                  <input class="input_yz" type="number" maxlength="1" v-model="b" :data-dex="1">
                  <input class="input_yz" type="number" maxlength="1" v-model="c" :data-dex="2">
                  <input class="input_yz" type="number" maxlength="1" v-model="d" :data-dex="3">
                </div>
                <button class="btn" @click="submitCode">Submit</button>
                <button class="btn">Back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .open_code{
    transform: translateX(-430px);
  }
  .login_animation{
    transform: scale(1)!important;
    opacity: 1!important;
    pointer-events: initial!important;
  }
  .overlay_container{
    position: fixed;
    z-index: 99;
    pointer-events: none;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transform: scale(0.7);
    transition: transform 0.3s;
  }
  .wrapper{
    display: flex;
    position: absolute;
    z-index: 1000;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }
  .overlay_pane{
    position: static;
    box-sizing: border-box;
    z-index: 1000;
    display: flex;
    max-width: 100%;
    max-height: 100%;
  }
  .title{
    position: relative;
    z-index: 20;
  }
  .container{
    display: block;
    padding: 24px;
    border-radius: 4px;
    box-sizing: border-box;
    overflow: hidden;
    outline: 0;
    width: 450px;
    height: 490px;
    min-height: inherit;
    max-height: inherit;
    box-shadow: 0 11px 15px -7px #0003, 0 24px 38px 3px #00000024, 0 9px 46px 8px #0000001f;
    background: #fff;
    color: #000000de;
    position: relative;

  }
  .inserted{
    width: 207%;
    height: auto;
    position: relative;
    display: flex;
    justify-content: space-between;
    transition: transform 0.3s;
  }
  .container-xs, .container-yz{
    width: 402px;
    min-width: 310px;
  }

  .input {
    box-sizing: border-box;
    margin: 0 0 40px 0;
    width: 100%;
    border: none;
    padding: 20px;
    border-radius: 30px;
    background: #e8e8e8;
    box-shadow: 20px 20px 60px #c5c5c5,
    -20px -20px 60px #ffffff;
    transition: 0.3s;
  }

  .input:focus {
    outline-color: #e8e8e8;
    background: #e8e8e8;
    box-shadow: inset 20px 20px 60px #c5c5c5,
    inset -20px -20px 60px #ffffff;
    transition: 0.3s;
  }
  .items{
    margin: 20px 0;
  }
  .fill_items{
    position: relative;
  }
  .fill_items span{
    position: absolute;
    bottom: 10px;
    left: 20px;
    color: red;
    z-index: 20;
    font-size: 15px;
    transition: opacity 0.3s;
  }
  .from{
    margin-top: 20px;
  }
  .container-xs a{
    color: rgb(3,155,229);
    text-decoration: underline;
  }
  .container-xs button{
    padding: 10px;
    width: 100%;
    color: white;
    border: none;
    border-radius: 5px;
    background-color: rgb(60, 204, 176);
    pointer-events: none;
  }
  .lo_ding{
    text-align: center;
  }
  .close{
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0;
    right: 0;
    transition: transform 1s;
    z-index: 30;
  }
  .close:hover{
    transform: rotate(720deg);
  }
  .disabled{
    background-color: rgb(24,188,156)!important;
    pointer-events: auto!important;
  }


  .form_yz {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 15px;
    background-color: white;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    transition: .4s ease-in-out;
    align-items: center;
  }

  .form_yz:hover {
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
    scale: 0.99;
  }

  .heading {
    position: relative;
    text-align: center;
    color: black;
    font-weight: bold;
    margin: 30px 0 10px 0;
  }

  .check {
    position: relative;
    align-self: center;
    margin: 10px 0;
  }

  .box{
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    margin: 30px 0 10px 0;
  }
  .input_yz {
    position: relative;
    width: 30px;
    height: 50px;
    border-radius: 5px;
    border: none;
    outline: none;
    background-color: rgb(235, 235, 235);
    box-shadow: inset 3px 3px 6px #d1d1d1,
    inset -3px -3px 6px #ffffff;
    padding-left: 20px;
    transition: .4s ease-in-out;
  }

  .input_yz:hover {
    box-shadow: inset 0 0 0 #d1d1d1,
    inset 0 0 0 #ffffff;
    background-color: lightgrey;
  }

  .input_yz:focus {
    box-shadow: inset 0 0 0 #d1d1d1,
    inset 0 0 0 #ffffff;
    background-color: lightgrey;
  }

  .btn {
    margin: 20px 0;
    width: 17em;
    height: 3em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    box-shadow: 1px 1px 3px #b5b5b5,
    -1px -1px 3px #ffffff;
  }

  .btn:active {
    box-shadow: inset 3px 3px 6px #b5b5b5,
    inset -3px -3px 6px #ffffff;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

</style>