<script lang="ts" setup>
	import { ref,defineComponent,reactive } from 'vue'
	import {
	  Location,
	  Document,
	  Menu as IconMenu,
	  Calendar
	} from '@element-plus/icons-vue'
	import {useStore} from 'vuex'
	import { ElMessage } from 'element-plus'
	import config from '../utils/config.js'
	import {users} from '../utils/request.js'
	defineProps({
	  now: String
	})
	const store = useStore()
	const ShowLogin = ref(false)
	const handleOpen = (key: string, keyPath: string[]) => {
	  console.log(key, keyPath)
	}
	const handleClose = (key: string, keyPath: string[]) => {
	  console.log(key, keyPath)
	}
	const openCollspace = (val: Boolean) => {
		console.log(val)
		store.commit('changeCollspace',val)
		console.log(store.state.collspace)
	}
	
	const User = reactive({
		name:'',
		password:'',
	})
	const SendSuccess = (message) => {
		  ElMessage({
		    message: message,
		    type: 'success',
		  })
	}
	const isLogin = ref(false)
	const userinfo = ref(reactive({
		ava:'',
		nickname:'',
		username:'',
	}))
	const test = async ()=>{
		let res = await users.verify(store.state.token)
		isLogin.value = typeof res === 'object' ? true : false
		console.log(res)
		store.commit('setUid',res.id)
		userinfo.value = reactive({
			'ava':res.avaurl,
			'nickname':res.nickname,
			'username':res.username
		})
		console.log(userinfo)
	}
	test()
	const Logout = async () => {
		store.commit('setToken','')
		store.commit('setUid',-1)
		location.reload()
	}
	const GoLogin = async ()=>{
		if(User.name.length < 1 || User.password.length < 1){
			ElMessage.error("请填写完整的用户名和密码")
			return
		}
		console.log("开始尝试登陆" + `username:${User.name},password:${User.password}`)
		let temp = await users.login(User.name,User.password)
		if(typeof temp == 'object'){
			//测试
			SendSuccess(temp.msg)
			//存储token
			store.commit('setToken',temp.token)
			setTimeout(function(){
				ShowLogin.value = false
				},500)//自动关闭，登录成功
			//获取token
			setTimeout(()=>{
				location.reload()
			},800)
		}else{
			ElMessage.error(temp)
		}
	}
</script>
<template>
	  <el-dialog v-model="ShowLogin" title="登 陆" :center="true" width="40%">
			  <el-form
				label-position="top"
				label-width="25vw"
				:model="User"
				
			  >
				<el-form-item label="用户名">
				  <el-input v-model="User.name"></el-input>
				</el-form-item>
				<el-form-item label="密码">
				  <el-input type="password" v-model="User.password"></el-input>
				</el-form-item>
				
				<el-form-item>
				  <el-button type="primary" class="submit" @click="GoLogin()">登 录</el-button>
				</el-form-item>
			  </el-form>
	  </el-dialog>
	  <div class="header">
		  <el-radio-group class="group" v-model="store.state.collspace" style="margin-bottom: 20px">
		    <el-radio-button :label="true" @click="openCollspace(true)">收起</el-radio-button>
		    <el-radio-button :label="false" @click="openCollspace(false)">展开</el-radio-button>
		  </el-radio-group>
		  <div class="login" v-if="!isLogin" @click="ShowLogin = true">
			  登 录
		  </div>
		  <div class="userinfo" v-if="isLogin">
			  <div class="ava">
				<img :src="userinfo.ava" >
			  </div>
			  <div class="nickname">
				  {{userinfo.nickname}}
			  </div>
			    <el-popconfirm
			      confirm-button-text="Yes"
			      cancel-button-text="No"
			      :icon="InfoFilled"
			      icon-color="red"
			      title="是否确定退出"
			      @confirm="Logout()"
			    >
					<template #reference>
					  <div class="logout">
						  退出登录
					  </div>
					</template>
				</el-popconfirm>
		  </div>
	  </div>
	  <el-menu
	    :default-active="now"
	    class="el-menu"
	    :collapse="store.state.collspace"
	    @open="handleOpen"
	    @close="handleClose"
	  >
		<router-link to="/">
			<el-menu-item index="1">
			  <el-icon><icon-menu /></el-icon>
			  <template #title>工作报告</template>
			</el-menu-item>
		</router-link>
		<router-link to="/share">
			<el-menu-item index="2">
			  <el-icon><document /></el-icon>
			  <template #title>文档共享</template>
			</el-menu-item>
		</router-link>
		<router-link to="/setting">
			<el-menu-item index="3">
			  <el-icon><calendar /></el-icon>
			  <template #title>日历</template>
			</el-menu-item>
		</router-link>
	  </el-menu>
</template>
<style lang="scss">
	.logout:hover{
		cursor: pointer;
	}
	.el-menu {
	  width: 200px;
	  min-height: calc(100vh - 100px);
	  text-decoration: none!important;
	  box-sizing: border-box;
	  position:fixed;
	}
	.header{
		width:100vw;
		display: flex;
		height:80px;
		box-sizing: border-box;
		padding:10px 15px;
		justify-content: space-between;
		align-items: center;
		.login{
			line-height:80px;
			font-size:24px;
			padding-right:40px;
			color:#333;
			text-decoration: none;
			transition: all .8s;
			&:hover{
				text-decoration: underline;
				color:lightskyblue;
				cursor: pointer;
			}
		}
		.ava{
			padding-right:60px;
			img{
				border-radius: 15px;
				height:50px;
				width:50px;
				margin-right: 10px;
			}
		}
	}
</style>
