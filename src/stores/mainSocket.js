import {defineStore} from "pinia";

const useMainSocket = defineStore("mainSocket",{
    persist:{
      enabled: true,
      strategies: [
          {
              key: "mainstate",
              storage: sessionStorage,
              paths: ["type"]
          }
      ]
    },
    state:()=>({
        mainSocket: null,
        pant: null,
        //matchState 匹配状态   0:未匹配    1:匹配中    2:匹配成功
        matchState: 0,
        type: null,
        networkStatus: 0     //连接状态     -1:重新连接     0:未连接       1:连接成功

    }),
    actions:{
        connectSocket(){
            console.log("连接主socket")
            if("WebSocket" in window) {
                this.mainSocket = new WebSocket("ws://" + location.host + "/api/socket/main")
                this.mainSocket.addEventListener("open", ()=>{
                    this.pant = Polling()
                    this.sendMessage({
                        type: "Ping"
                    })
                    this.networkStatus = 1
                })
                /**
                 * AlreadyMatching: 开始匹配
                 * MatchingSuccess： 匹配成功
                 * UnMatchSuccess:  取消匹配成功
                 */
                this.mainSocket.addEventListener("message", message=>{
                    let msg = JSON.parse(message.data)
                    switch (msg.type){
                        case "AlreadyMatching":
                            this.matchState = 1
                            break
                        case "MatchSuccess":
                            this.matchState = 2
                            break
                        case "UnMatchSuccess":
                            this.matchState = 0
                            break
                    }
                })
                this.mainSocket.addEventListener("close", ()=>{
                    console.log("连接断开");
                    this.pant = null
                    if(sessionStorage.getItem("state")){
                        this.networkStatus = -1
                        DisconnectedReconnection().call(this)
                    }
                })
                this.mainSocket.addEventListener("error", ()=>{
                    this.mainSocket.close()
                })
            }else{
                alert("您的浏览器不支持WebSocket");
            }
        },
        sendMessage(msg){
            this.pant.call(this)
            this.mainSocket.send(JSON.stringify(msg))
        }
    }
})

/**
 * 心跳检测 每50s内没有任何通信，自动发送一条消息
 * @return {(function(): void)|*}
 * @constructor
 */
function Polling(){
    let timer
    return function (){
        if(timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=>{
            if(!this.pant){
                return
            }
            this.sendMessage({
                type: "Ping"
            })
        },50000)
    }
}

function DisconnectedReconnection(){
    let timer
    return function (){
        if(timer){
            return
        }
        timer = setTimeout(()=>{
            console.log("尝试重新连接")
            this.connectSocket()
            clearTimeout(timer)
        },5000)
    }

}
export default useMainSocket