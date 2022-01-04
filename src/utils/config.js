let protocol = 'https'
let host = 'service-8ca882p4-1257689370.gz.apigw.tencentcs.com'
// let protocol = 'http'
// let host = 'localhost:3001'
const config = {
	back_url:`${protocol}://${host}`,
	user:`/users`,
	article:`/article`,
	comment:`/comment`
}
export default config