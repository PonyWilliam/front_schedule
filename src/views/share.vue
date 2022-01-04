<script lang="ts" setup>
	import {ref} from 'vue'
	import {useStore} from 'vuex'
	import type { ElUpload  } from 'element-plus'
	import {ElMessage} from 'element-plus'
	import LeftMenu from '../components/menu.vue'
	import COS from 'cos-js-sdk-v5';
	import {
	  Search,
	  Edit,
	  Check,
	  Message,
	  Star,
	  Delete,
	  InfoFilled,
	  UploadFilled
	} from '@element-plus/icons-vue'
	// SECRETID 和 SECRETKEY请登录 https://console.cloud.tencent.com/cam/capi 进行查看和管理
	const store = useStore()
	const cos = new COS({
	    SecretId: 'AKIDf8NMAnDPM4XmmX3KM9l37wXu3w852nKd',
	    SecretKey: '69xYjfNr78vTw1rTqyrVu4yc2ECvObZH',
	});
	const now = ref('')
	const percentage = ref(0)
	const now_speed = ref('0 kb/s ')
	const uploadRef = ref<InstanceType<typeof ElUpload>>()
	const submitUpload = () => {
		uploadRef.value!.submit()
	}
	const useTencentCos = (file) => {
		return new Promise((resolve,reject)=>{
			cos.putObject({
			    Bucket: 'pan-1257689370', /* 必须 */
			    Region: 'ap-guangzhou',     /* 存储桶所在地域，必须字段 */
			    Key: file.name,              /* 必须 */
			    StorageClass: 'STANDARD',
			    Body: file, // 上传文件对象
			    onProgress: function(progressData) {
			        percentage.value = progressData.percent * 100
					now_speed.value = `${progressData.speed/1024} kb/s `
			    }
			}, function(err, data) {
			    if(err && (err != null || err != undefined)){
					reject(err)
					return
				}
				resolve(data)
			});
		})
		
	}
	const listTencentCos = () => {
		return new Promise((resolve,reject)=>{
			cos.getBucket({
			    Bucket: 'pan-1257689370', /* 填入您自己的存储桶，必须字段 */
			    Region: 'ap-guangzhou',  /* 存储桶所在地域，例如ap-beijing，必须字段 */
			}, function(err, data) {
			    if(err && (err != null || err != undefined)){
			    	reject(err)
			    	return
			    }
			    resolve(data)
			});
		})
	}
	const downloadTencentCos = (Key) => {
		return new Promise((resolve,reject)=>{
			cos.getObjectUrl({
			    Bucket: 'pan-1257689370', /* 填入您自己的存储桶，必须字段 */
			    Region: 'ap-guangzhou',  /* 存储桶所在地域，例如ap-beijing，必须字段 */
			    Key: Key,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
			}, function(err, data) {
			    if(err && (err != null || err != undefined)){
			    	reject(err)
			    	return
			    }
			    resolve(data)
			});
		})
	}
	const beforeUpload = async (file) => {
		now.value = file.name
		percentage.value = 0
		let MaxSize = 1024  * 1024 * 30
		console.log(file)
		if(file.size >= MaxSize){
			console.log('too big')
			//upload error
			ElMessage.error(`${file.name}太大，上传大小限制为${MaxSize / 1024 / 1024}MB`)
			return false
		}
		//拦截upload操作，并上传到腾讯云
		//开始上传
		console.log('开始上传')
		let res = await useTencentCos(file)
		console.log(res)
		return false
	}
	const files_list = ref([])
	const list = async () =>{
		try{
			let res = await listTencentCos()
			console.log(res)
			files_list.value = res.Contents
		}catch(e){
			console.log(e)
			ElMessage.error('列出文件出现未知错误')
		}
		
	}
	list()
	const listen_file = function(file, fileList){
		if(typeof fileList != 'undefined' && fileList.length == 0){
			//上传完成，刷新文件列表
			list()
		}
	}
	const get_file = async function(key){
		try{
			let res = await downloadTencentCos(key)
			console.log(res)
			ElMessage({
				type:'success',
				message:'请求下载成功'
			})
			window.open(res.Url,"_blank")
		}catch(e){
			ElMessage.error('请求下载失败')
		}
	}
	
</script>
<template>
	<div class="container">
		<left-menu now="2"></left-menu>
		<div class="right" v-if="typeof store.state.uid != 'undefined' && store.state.uid > 0">
			<div class="upload">
				<div class="upload_button">
					<el-upload
					    ref="uploadRef"
					    class="upload-demo"
					    :auto-upload="false"
						:multiple="true"
						action=""
						:before-upload="beforeUpload"
						:on-change="listen_file"
					  >
					<template #trigger>
						<el-button type="primary" class="button">
							<el-icon class="icon"><upload-filled /></el-icon>选择文件
						</el-button>
					</template>
						<el-button type="success" class="button" @click="submitUpload()">
							<el-icon class="icon"><upload-filled /></el-icon>上传
						</el-button>
					</el-upload>
				</div>
				<div class="uploadtips">
					<span class="tips">
						正在上传：{{now}}
					</span>
					<el-progress :percentage="percentage" status="success" />
					<p class="speed">
						当前速度：{{now_speed}}
					</p>
				</div>
			</div>
			<div class="show" v-if="files_list.length > 0">
				<div class="file_card" v-for="(item,index) in files_list">
				      <el-card class="card" :body-style="{ padding: '5px 10px' }">
				        <img
				          src="https://arcsoft.dadiqq.cn/file.jpg"
				          class="image"
				        />
				        <div style="padding: 14px">
				          <span class="filename">{{item.Key}}</span>
				          <div class="bottom">
				            <time class="size">{{Math.round(item.Size / 1024)}}kb</time>
				            <el-button type="text" class="button" @click="get_file(`${item.Key}`)">下载</el-button>
				          </div>
				        </div>
				      </el-card>
				</div>
			</div>
			<div class="noshow" v-else>
				暂时没有文件
			</div>
		</div>
		<div class="permission" v-else>
			<p>对不起您无权访问该页面</p>
			<p>请先登录</p>
		</div>
	</div>
	
</template>


<style lang="scss">
.container{
	display: flex;
	flex-wrap: wrap;
	padding:0;
	margin:0;
	.permission{
		font-size:30px;
		line-height:60px;
		color:red;
		text-align: center;
		width:100%;
		margin-top:-80vh;
	}
	.right{
		.show{
			display: flex;
			width:100%;
			flex-wrap: wrap;
			.file_card{
				width:22%;
				box-sizing: border-box;
				margin-left:3%;
				margin-bottom:20px;
				.image{
					width:80%;
					margin-left:10%;
				}
				.button{
					float:right;
				}
				.filename{
					font-size:14px;
					line-height:26px;
				}
				.bottom{
					.size{
						color:#555;
						font-size:12px;
					}
				}
			}
		}
		.noshow{
			text-align: center;
			color:#111;
			font-size:24px;
		}
		box-sizing: border-box;
		width:calc(100% - 250px);
		.upload{
			margin-top:0;
			box-sizing: border-box;
			margin-left:2.5%;
			width:100%;
			.upload_button{
				.button{
					.icon{
						padding-right:1px;
						margin-left:-3px;
						margin-right:2px;
					}
					margin-right:20px;
				}
				margin-left:30px;
			}
			.uploadtips{
				margin-top:20px;
			}
			.tips{
				margin-bottom:10px;
			}
		}
	}
}
</style>