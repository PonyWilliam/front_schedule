import { createApp } from 'vue'
import {createStore} from 'vuex'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const store = createStore({
	state:{
		collspace:localStorage.getItem('collspace')=='false'?false:true,
		token:localStorage.getItem('token') || '',
		uid:parseInt(localStorage.getItem('uid')) || -1
	},
	mutations:{
		changeCollspace(state,val){
			localStorage.setItem('collspace',val)
			state.collspace = val
		},
		setToken(state,val){
			localStorage.setItem('token',val)
			state.token = val
		},
		setUid(state,val){
			localStorage.setItem('uid',val)
			state.uid = val
		}
	}
})
const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')