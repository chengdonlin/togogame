import {defineStore} from "pinia";

const useGoBangSocket = defineStore("goBangSocket", {
    persist:{
        enabled: true,
        strategies: [
            {
                key: "gamestate",
                storage: sessionStorage,
                paths:["gameStart"]
            }
        ]
    },
    state: ()=>({
        goBangSocket: null,
        first: null,            //先手id
        step: null,             //最新的一步棋
        currentChess: 0,        //当前下棋的玩家      1:玩家一    2:玩家二
        camp: null,             //阵营
        playChess: false,       //该你下棋吗
        gameOver: false,        //游戏结束了吗
        gameStart: false,       //游戏开始了吗
        gameOverData:null       //游戏结束数据
    }),
    getters:{

    },
    actions:{
        connectSocket(){
            console.log("连接次socket")
            if("WebSocket" in window) {
                this.goBangSocket = new WebSocket("ws://" + location.host + "/api/gobang/socket")
                this.goBangSocket.addEventListener("message", message=>{
                    let msg = JSON.parse(message.data)
                    console.log(msg)
                    switch (msg.type){
                        case "Drop":
                            this.step = msg.data
                            this.currentChess = this.currentChess === 1? 2 : 1
                            this.playChess = !this.playChess
                            break
                        case "GameOver":
                            this.gameOver = true
                            this.gameStart = false
                            this.gameOverData = msg.data
                            break
                    }
                })
                this.goBangSocket.addEventListener("close", ()=>{
                    console.log("连接断开");
                })
                this.goBangSocket.addEventListener("error", ()=>{
                    this.goBangSocket.close()
                })
            }else{
                alert("您的浏览器不支持WebSocket");
            }
        },
        sendMessage(msg){
            this.goBangSocket.send(JSON.stringify(msg))
        }
    }
})
export default useGoBangSocket