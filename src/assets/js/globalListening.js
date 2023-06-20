//全局监听器
console.log("开启全局监听器")
window.addEventListener("resize", ()=>{
    // console.log("监听到页面发生变化")
    // if(document.body.clientWidth <= 600){
    //
    // }
})

window.addEventListener("beforeunload", ()=>{
    sessionStorage.setItem("state", "false")
    console.log("页面被刷新")
})