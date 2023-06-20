import {defineStore} from "pinia";
import axios from "axios";

const useUserInfo = defineStore("userInfo",{
    persist:{
        enabled: true,
        strategies: [
            {
                key: "userstate",
                storage: sessionStorage,
                paths: ["userGameInfo","user"]
            }
        ]
    },
    state: ()=> ({
        user: null,
        status: false,
        userGameInfo: null
    }),
    actions: {
        getUserInfo(){
            return new Promise((resolve, reject)=>{
                axios.get("/api/user/userInfo").then(
                    response =>{
                        if(response.data.code === 200){
                            sessionStorage.setItem("state", "在线")
                            this.user = response.data.data
                            console.log(this.status)
                            this.status = true
                            resolve(true)
                        }else {
                            sessionStorage.setItem("state", "false")
                            resolve(false)
                        }
                    },
                    error =>{
                        console.log(error)
                        reject()
                    }
                )
            })
        }
    }
})

export default useUserInfo