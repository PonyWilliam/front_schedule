<script lang="ts" setup>
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	import LeftMenu from '../components/menu.vue'
	import { users, article} from '../utils/request.js'
	import { ElMessage } from 'element-plus'
	import time from '../utils/time.js'
	import {
	  Search,
	  Edit,
	  Check,
	  Message,
	  Star,
	  Delete,
	  InfoFilled
	} from '@element-plus/icons-vue'
	const store = useStore()
	const articles = ref(reactive([]))
	const user = ref(reactive({}))//用于查找文章所有者
	const loading = ref(true)//加载中，emmm
	const ShowPublish = ref(false)
	const myarticle = reactive({
		title:'',
		content:'',
	})
	function delay(ms){
		return new Promise((resolve,reject)=>{
			setTimeout(()=>{
				resolve(1)
			},ms)
		})
	}
	const getUsers = async function(){
		let res = await users.list()
		let temp = []
		for(let x of res){
			temp[`${x.id}`] = x
		}
		user.value = temp
		console.log(user)
	}
	//获取文章列表
	const getArticle = async function(){
		await getUsers()
		let res = await article.list()
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		res.reverse()
		console.log(store.state.uid)
		articles.value = res
		//加载完成
		loading.value = false
	}
	getArticle()
	
	//发表文章
	const submitArticle = async function(){
		
		let res = await article.publish(myarticle.title,myarticle.content,store.state.token)
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		ElMessage({
		  message: res.msg,
		  type: 'success',
		})
		let temp = {title:'',content:''}
		myarticle.value = temp
		getArticle()
		setTimeout(()=>{
			ShowPublish.value = false
		},800)
	}
	
	//删除文章
	const delArticle = async function(id){
		let res = await article.del(id,store.state.token)
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		getArticle()
		ElMessage({
		  message: res.msg,
		  type: 'success',
		})
	}
	//收到
	const reciveArticle = async function(id){
		let res = await article.recive(id,store.state.token)
		if(typeof res != 'object'){
			if(res == 500){
				ElMessage.error("重复收到")
				return
			}
			ElMessage.error(res)
			return
		}
		getArticle()
		ElMessage({
		  message: res.msg,
		  type: 'success',
		})
	}
</script>
<template>
	
	<el-dialog v-model="ShowPublish" title="发表工作汇报" :center="true" width="40%">
				  <el-form
					label-position="top"
					label-width="25vw"
					:model="myarticle"
					
				  >
					<el-form-item label="标 题">
					  <el-input v-model="myarticle.title"></el-input>
					</el-form-item>
					<el-form-item label="内 容">
					  <el-input type="textarea" v-model="myarticle.content"></el-input>
					</el-form-item>
					
					<el-form-item>
					  <el-button type="primary" class="submit" @click="submitArticle()">发表工作汇报</el-button>
					</el-form-item>
				  </el-form>
	</el-dialog>
	
	<div class="container">
		<left-menu now="1"></left-menu>
		<div class="right">
			<div class="post" v-if="store.state.hasOwnProperty('uid') && store.state.uid >= 1">
				<el-button class="postArticle" type="primary" @click="ShowPublish = true" :icon="Edit">发表工作汇报</el-button>
			</div>
			<div class="show" v-loading="loading">
				  <el-card v-for="(item,index) in articles" :key="index" class="box-card" shadow="hover">
				    <template #header>
				      <div class="card-header">
				        <span>{{item.title}}</span>
						<span class="delete" v-if="store.state.hasOwnProperty('uid') && store.state.uid == item.uid">
							  <el-popconfirm
							    confirm-button-text="Yes"
							    cancel-button-text="No"
							    :icon="InfoFilled"
							    icon-color="red"
							    title="是否确认删除?"
							    @confirm="delArticle(item.id)"
							  >
							<template #reference>
							<el-button type="danger" :icon="Delete">
								删除
							</el-button>
							</template>
							</el-popconfirm>
						</span>
				      </div>
				    </template>
					<div class="content">
						<pre>{{item.content}}</pre>
					</div>
					<div class="footer">
						<div class="recive">
							<el-popconfirm
							    confirm-button-text="Yes"
							    cancel-button-text="No"
							    :icon="InfoFilled"
							    icon-color="red"
							    title="是否确认收到?"
							    @confirm="reciveArticle(item.id)"
							  >
								<template #reference>
								<el-button class="recive_button" type="primary">收到</el-button>
								</template>
							</el-popconfirm>
							<div class="tips" v-if="item.recive != null">
								<span v-for="(item2,index2) in item.recive.split(',').shift()">
									<img :src="user[`${item2}`].avaurl" >
									{{user[`${item2}`].nickname}}
									
								</span>
								<span>
									已收到
								</span>
								
							</div>
							<div class="tips" v-if="item.recive == null">
								暂无人收到
							</div>
						</div>
						<div class="name">{{user[`${item.uid}`].nickname}}</div>
						<div class="time">{{time.format(item.time * 1000)}}</div>
					</div>
				  </el-card>
			</div>
			<el-backtop />
		</div>
	</div>
	
</template>

<style lang="scss">
#root{
	padding:0;
	margin:0;
}

.container{
	display: flex;
	flex-wrap: wrap;
	
	.right{
		box-sizing: border-box;
		width:calc(100% - 250px);
		.post{
			margin-top:45px;
			display: flex;
			flex-direction: row-reverse;
			.postArticle{
				font-size:18px;
				box-shadow: 2px 3px 4px rgba($color: #2ae3e8, $alpha: .35);
			}
		}
		.show{
			min-height:80vh;
			margin-top:40px;
			box-sizing: border-box;
			margin-left:2.5%;
			width:100%;
			.box-card{
				width:100%;
				border-radius: 15px;
				margin-bottom:30px;
				.card-header{
					display: flex;
					flex-direction: row;
					flex-wrap: nowrap;
					justify-content: space-between;
				}
				.content{
					pre{
						white-space:pre-wrap;
						white-space:-moz-pre-wrap;
						white-space:-pre-wrap;
						white-space:-o-pre-wrap;
						word-wrap:break-word;
						font-size:16px;
					}
				}
				.footer{
					margin-top:30px;
					border-top:1px dashed #b2b2b2;
					padding-top:15px;
					padding-right:30px;
					.recive{
						margin-top:10px;
						.recive_button{
							padding:12px 18px;
							border-radius: 10px;
							font-size:18px;
							color:#efefef;
							margin-left:20px;
						}
						.tips{
							margin-top:10px;
							span{
								color:orangered;
								line-height:40px;
								padding:0;
								margin:0;
								img{
									width:40px;
									height:40px;
									margin-right:10px;
									border-radius: 20px;
									box-shadow: 2px 4px 5px #ccc;
									padding:0;
									margin:0;
								}
								margin-right:20px;
							}
						}
					}
					.name{
						margin-top:-30px;
						text-align: right;
						font-size:18px;
						color:#444;
						line-height: 36px;
					}
					.time{
						margin-top:-10px;
						text-align: right;
						line-height: 30px;
						font-size:16px;
						color:#a5b3c2;
					}
				}
			}
		}
	}
}
</style>