<script lang="ts" setup>
	import LeftMenu from '../components/menu.vue'
	import { ref } from 'vue'
	const calendar = ref()
	const selectDate = (val: string) => {
	  calendar.value.selectDate(val)
	}
</script>
<template>
	<div class="container">
		<left-menu now="3"></left-menu>
		<div class="right">
			<div class="show">
				    <el-calendar ref="calendar">
				      <template #header="{ date }">
				        <span>Custom header content</span>
				        <span>{{ date }}</span>
				        <el-button-group>
				          <el-button size="small" @click="selectDate('prev-year')"
				            >Previous Year</el-button
				          >
				          <el-button size="small" @click="selectDate('prev-month')"
				            >Previous Month</el-button
				          >
				          <el-button size="small" @click="selectDate('today')">Today</el-button>
				          <el-button size="small" @click="selectDate('next-month')"
				            >Next Month</el-button
				          >
				          <el-button size="small" @click="selectDate('next-year')"
				            >Next Year</el-button
				          >
				        </el-button-group>
				      </template>
				    </el-calendar>
			</div>
		</div>
	</div>
	
</template>

<style lang="scss">
	.is-selected {
	  color: #1989fa;
	}
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
		}
	}
}
</style>