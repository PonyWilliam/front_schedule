<script lang="ts" setup>
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	import LeftMenu from '../components/menu.vue'
	import { users, article, comment } from '../utils/request.js'
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
	const comments = ref(reactive([]))
	const loading = ref(true)//加载中，emmm
	const ShowPublish = ref(false)
	const myarticle = reactive({
		title:'',
		content:'',
	})
	const comment_content = ref('')
	
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
	}
	const getComment = async function(){
		//获取评论列表
		await getArticle()
		let res = await comment.list()
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		let temp = {}
		console.log(res)
		for(let x = res.length-1;x>=0;x--){
			if(!temp.hasOwnProperty(res[x].aid.toString())){
				//没有属性，需要新建
				temp[res[x].aid.toString()] = []
				console.log(`${res[x].aid}需要构建`)
			}
			temp[res[x].aid.toString()].push(res[x])
		}
		comments.value = temp
		//加载完成
		loading.value = false
	}
	getComment()
	
	
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
		await getArticle()
		ElMessage({
		  message: res.msg,
		  type: 'success',
		})
	}
	
	//新增评论
	const postComment = async (aid) =>{
		let res = await comment.post(aid,comment_content.value,store.state.token)
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		await getComment()
		comment_content.value = ""
		await getComment()
		ElMessage({
		  message: res.msg,
		  type: 'success',
		})
	}
	
	//删除评论
	const delComment = async function(id){
		let res = await comment.del(id,store.state.token)
		if(typeof res != 'object'){
			ElMessage.error(res)
			return
		}
		await getComment()
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
						<div class="recive" v-if="store.state.hasOwnProperty('uid') && store.state.uid >= 1">
							<el-popconfirm v-if="item.recive == null || item.recive.split(',').indexOf(store.state.uid.toString()) < 0"
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
								<span v-for="(item2,index2) in item.recive.split(',').filter(s => s != '')">
									<img :src="user[`${item2}`].avaurl" >
									{{user[`${item2}`].nickname}}<span v-if="index2 != item.recive.split(',').filter(s => s != '').length-1">、</span>
									
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
						<div class="comment" v-if="store.state.hasOwnProperty('uid') && store.state.uid >= 1">
							<div class="comment_title">
								评论区
							</div>
							<div class="post_comment">
								<!-- 发表评论的地方 -->
								<el-input
								    v-model="comment_content"
								    autosize
								    type="textarea"
								    placeholder="输入你的评论"
									style="display: block;"
								/>
								<el-button class="submit_button" type="primary" @click="postComment(`${item.id}`)">发表</el-button>
							</div>
							<div class="no_comment" v-if="!comments.hasOwnProperty(`${item.id}`)">
								暂时没有评论
							</div>
							<div v-else class="comment_content">
								<div class="each_comment" v-for="(item3,index3) in comments[`${item.id}`]">
									<img :src="user[`${item3.uid}`].avaurl">{{user[`${item3.uid}`].nickname}} 说 ：{{item3.content}}
									<div class="tips">
										{{time.format(item3.time * 1000)}}
									</div>
									<div class="del">
										<el-popconfirm v-if="item3.uid == store.state.uid"
										    confirm-button-text="Yes"
										    cancel-button-text="No"
										    :icon="InfoFilled"
										    icon-color="red"
										    title="确认删除评论吗?"
										    @confirm="delComment(`${item3.id}`)"
										  >
											<template #reference>
												<el-button class="del_button" type="warning">删除</el-button>
											</template>
										</el-popconfirm>
									</div>
								</div>
							</div>
						</div>
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
							margin-top:20px;
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
						margin-top:-20px;
						text-align: right;
						font-size:18px;
						color:#444;
						line-height: 36px;
					}
					.time{
						margin-top:-5px;
						text-align: right;
						line-height: 30px;
						font-size:16px;
						color:#a5b3c2;
					}
					.comment{
						width:90%;
						padding:15px 25px;
						box-sizing: border-box;
						margin-left:5%;
						margin-top:10px;
						.post_comment{
							display: flex;
							flex-wrap: nowrap;
							flex-direction: row;
							margin-bottom: 15px;
							.submit_button{
								margin-left: 20px;
							}
						}
						.comment_title{
							letter-spacing: 8px;
							color:#111;
							font-size:24px;
							line-height:42px;
							text-shadow: 1px 1px 3px #000;
							text-align: center;
						}
						.no_comment{
							text-align: center;
							margin-top:2px;
							line-height:28px;
							font-size:16px;
						}
						.comment_content{
							.each_comment{
								img{
									width:40px;
									height:40px;
									border-radius: 20px;
									box-shadow:2px 2px 4px #ccc;
									margin-right:10px;
								}
								margin-bottom:20px;
								width:100%;
								box-sizing: border-box;
								font-size:16px;
								line-height:40px;
								border-bottom: 1px solid #ccc;
								.tips{
									color:#666;
									font-size:14px;
									line-height:20px;
								}
								.del{
									margin-bottom: 5px;
								}
							}
						}
					}
				}
			}
		}
	}
}
</style>