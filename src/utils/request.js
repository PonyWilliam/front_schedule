import config from './config.js'
async function _request(url,method='GET',data={},token=""){
	
	if(method == 'GET'){
		const res = await fetch(`${url}`,{
			method,
			mode: 'cors',
			cache: 'no-cache',
			headers:{
				token,
				"Content-Type" : 'application/x-www-form-urlencoded',
			},
		})
		return res.json()
	}
	var urlencoded = new URLSearchParams();
	for(let x in data){
		urlencoded.append(x,data[x])
	}
	const res = await fetch(`${url}`,{
		method,
		mode: 'cors',
		cache: 'no-cache',
		headers:{
			token,
			"Content-Type" : 'application/x-www-form-urlencoded',
		},
		body:urlencoded
	})
	return res.json()
}
//用户登录方法合集
const users = {
	//分为数据处理类和验证类
	verify:async function(token){
		//验证token是否有效
		let res = await _request(`${config.back_url}${config.user}/verify`,'POST',{},token)
		if(typeof res != 'object'){
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			console.log(res)
			return res.msg
		}
		return res
	},login:async function(username,password){
		let res = await _request(`${config.back_url}${config.user}/login`,'POST',{
			username,
			password,
		})
		if(typeof res != 'object'){
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			console.log(res)
			return res.msg
		}
		return res//登录成功
	},list:async function(){
		let res = await _request(`${config.back_url}${config.user}`)
		if(typeof res != 'object'){
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			console.log(res)
			return res.msg
		}
		return res//登录成功
	}
}
//文章方法合集
const article = {
	list:async function(){
		let res = await _request(`${config.back_url}${config.article}`)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.msg
		}
		return res
	},
	publish:async function(title,content,token){
		let res = await _request(`${config.back_url}${config.article}`,'POST',{
			title,
			content,
		},token)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.msg
		}
		return res
	},
	del:async function(id,token){
		let res = await _request(`${config.back_url}${config.article}/id/${id}`,'DELETE',{
		},token)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.msg
		}
		return res
	},
	recive:async function(id,token){
		let res = await _request(`${config.back_url}${config.article}/recive`,'POST',{
			id,
		},token)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.code
		}
		return res
	}
}

//评论方法合集
const comment = {
	list:async function(){
		let res = await _request(`${config.back_url}${config.comment}`)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.code
		}
		return res
	},
	post:async function(aid,content,token){
		let res = await _request(`${config.back_url}${config.comment}`,'POST',{
			aid,
			content
		},token)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.msg
		}
		return res
	},del:async function(id,token){
		let res = await _request(`${config.back_url}${config.comment}/id/${id}`,'DELETE',{
		},token)
		if(typeof res != 'object') {
			console.log(res)
			return "服务端错误"
		}
		if(res.code == 500){
			return res.msg
		}
		return res
	}
}
export {users,article,comment}