<template>
	<div class="container">
		<left-menu now="2"></left-menu>
		<div class="right">
			<div class="show">
				  
			</div>
		</div>
	</div>
	
</template>

<script lang="ts" setup>
	import LeftMenu from '../components/menu.vue'
</script>

<style lang="scss">
.container{
	display: flex;
	flex-wrap: wrap;
	padding:0;
	margin:0;
	.right{
		box-sizing: border-box;
		width:calc(100% - 250px);
		.show{
			box-sizing: border-box;
			margin-left:2.5%;
			width:100%;
		}
	}
}
</style>