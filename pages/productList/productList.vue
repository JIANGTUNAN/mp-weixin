<template>
	<view class="page">
		<view class="search-box">

			<view class="search">
				<view class="search-box">
					<u-icon color="#0c34ba" :size='18' name='search'></u-icon>
					<input type="search" v-model="searchQuery" clearable class="ipt" placeholder="搜索" />
				</view>
			</view>
		</view>
		<view class="menu-wrap">
			<scroll-view scroll-y scroll-with-animation class="tab-view menu-scroll-view" :scroll-top="scrollTop"
				:scroll-into-view="itemId">
				<view v-for="(item,index) in goods" :key="index" class="tab-item"
					:class="[current == index ? 'tab-item-active' : '']" @tap.stop="swichMenu(index)">
					<text class="line">{{item.name}}</text>
				</view>
			</scroll-view>
			<scroll-view :scroll-top="scrollRightTop" scroll-y scroll-with-animation class="right-box"
				@scroll="rightScroll">
				<view class="page-view">
					<view class="class-item" :id="'item' + index" v-for="(item , index) in filterGoods" :key="index">
						<view class="item-title">
							<text>{{item.name}}</text>
						</view>
						<view class="item-container">
							<view class="item-box" v-for="(i,idx) in item.goods" :key="idx"
								@click="productDetail(i)">
								<image :src="i.src" mode=""></image>
								<view class="item-name">{{i.name}}</view>
								<view class="item-descr">{{i.desc}}</view>
							</view>
							<view class="item-box empty" v-if="item.goods.length%2==1">
								<image src="" mode=""></image>
								<view class="item-name"></view>
								<view class="item-descr"></view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<ProductDetail :data='selectedItem' ref='detail'></ProductDetail>
	</view>
</template>
<script>
	import {
		getProduct,
		getTypeDict
	} from "@/api/api.js"
	import {
		baseUrl
	} from '@/request/request.js';
	import ProductDetail from './productDetail.vue'
	export default {
		data() {
			return {
				scrollTop: 0, //tab标题的滚动条位置
				oldScrollTop: 0,
				current: 0, // 预设当前项的值
				menuHeight: 0, // 左边菜单的高度
				menuItemHeight: 0, // 左边菜单item的高度
				itemId: '', // 栏目右边scroll-view用于滚动的id
				menuItemPos: [],
				arr: [],
				scrollRightTop: 0, // 右边栏目scroll-view的滚动条高度
				timer: null, // 定时器
				storeId: null,
				goods: [],
				baseUrl,
				searchQuery:'',
				selectedItem:{}
			}
		},
		components:{ProductDetail},
		onLoad(options) {
			const id = options.storeId;
			this.storeId = id;
			this.init(id);
		},
		onReady() {
			this.getMenuItemTop()
		},
		computed: {
			filterGoods() {
				return this.goods.map(type=>{
					return {...type,goods:type.goods.filter(i=>i.name.includes(this.searchQuery))}
				})
			},
		},
		methods: {
			productDetail(item){
				this.selectedItem=item;
				this.$refs.detail.open();
			},
			init(id) {
				getTypeDict().then(respond => {
					const typeDict = respond.data;
					getProduct(id,100).then(res => {// 采用循环模拟数据
						// const list = res.data;
						const list = res.rdata;
						let every={};
						list.forEach(i=>{
							let type=i.type+'';
							if(every[type]){
								every[type].push(i);
							}else{
								every[type]=[i]
							}
						})
						const productList = typeDict.map(i => {
							const {
								label,
								value
							} = i;
							
							const obj = {
								name: label,
								goods: every[value+'']
							}
							return obj;
						})
						this.goods = productList.filter(i => i.goods.length > 0);
					})
				})
			},
			// 点击左边的栏目切换
			async swichMenu(index) {
				if (this.arr.length == 0) {
					await this.getMenuItemTop();
				}
				if (index == this.current) return;
				this.scrollRightTop = this.oldScrollTop;
				this.$nextTick(function() {
					this.scrollRightTop = this.arr[index];
					this.current = index;
					this.leftMenuStatus(index);
				})
			},
			// 获取一个目标元素的高度
			getElRect(elClass, dataVal) {
				new Promise((resolve, reject) => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.' + elClass).fields({
						size: true
					}, res => {
						// 如果节点尚未生成，res值为null，循环调用执行
						if (!res) {
							setTimeout(() => {
								this.getElRect(elClass);
							}, 10);
							return;
						}
						this[dataVal] = res.height;
						resolve();
					}).exec();
				})
			},
			// 观测元素相交状态
			async observer() {
				this.filterGoods.map((val, index) => {
					let observer = uni.createIntersectionObserver(this);
					// 检测右边scroll-view的id为itemxx的元素与right-box的相交状态
					// 如果跟.right-box底部相交，就动态设置左边栏目的活动状态
					observer.relativeTo('.right-box', {
						top: 0
					}).observe('#item' + index, res => {
						if (res.intersectionRatio > 0) {
							let id = res.id.substring(4);
							this.leftMenuStatus(id);
						}
					})
				})
			},
			// 设置左边菜单的滚动状态
			async leftMenuStatus(index) {
				this.current = index;
				// 如果为0，意味着尚未初始化
				if (this.menuHeight == 0 || this.menuItemHeight == 0) {
					await this.getElRect('menu-scroll-view', 'menuHeight');
					await this.getElRect('tab-item', 'menuItemHeight');
				}
				// 将菜单活动item垂直居中
				this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2;
			},
			// 获取右边菜单每个item到顶部的距离
			getMenuItemTop() {
				new Promise(resolve => {
					let selectorQuery = uni.createSelectorQuery();
					selectorQuery.selectAll('.class-item').boundingClientRect((rects) => {
						// 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
						if (!rects.length) {
							setTimeout(() => {
								this.getMenuItemTop();
							}, 10);
							return;
						}
						rects.forEach((rect) => {
							// 这里减去rects[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
							this.arr.push(rect.top - rects[0].top);
							resolve();
						})
					}).exec()
				})
			},
			// 右边菜单滚动
			async rightScroll(e) {
				this.oldScrollTop = e.detail.scrollTop;
				if (this.arr.length == 0) {
					await this.getMenuItemTop();
				}
				if (this.timer) return;
				if (!this.menuHeight) {
					await this.getElRect('menu-scroll-view', 'menuHeight');
				}
				setTimeout(() => { // 节流
					this.timer = null;
					// scrollHeight为右边菜单垂直中点位置
					let scrollHeight = e.detail.scrollTop + this.menuHeight / 2;
					for (let i = 0; i < this.arr.length; i++) {
						let height1 = this.arr[i];
						let height2 = this.arr[i + 1];
						// 如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
						if (!height2 || scrollHeight >= height1 && scrollHeight < height2) {
							this.leftMenuStatus(i);
							return;
						}
					}
				}, 10)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		display: flex;
		flex-direction: column;

	}

	.search {
		position: sticky;
		top: 0;
		z-index: 100;
		height: 100rpx;
		padding: 0 60rpx;
		background-color: #fff;
		display: flex;
		align-items: center;


		.search-box {
			width: 640rpx;
			height: 70rpx;
			border-radius: 60rpx;
			padding: 0 30rpx;
			background-color: #f7f7f7;
			display: flex;
			align-items: center;

			.ipt {
				width: 500rpx;
			}
		}

	}

	.item-container {
		position: relative;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;

		.item-box {
			width: 40%;
			height: 100%;
			padding: 16rpx;
			margin-right: 8rpx;
			margin-bottom: 15rpx;
			border-radius: 12rpx;
			border: 4rpx solid #FFFFFF;
			box-shadow: 0px 4rpx 8rpx 0px rgba(0, 0, 0, 0.1);
			text-align: center;

			&.empty {
				visibility: hidden;
			}

			image {
				width: 200rpx;
				height: 200rpx;
			}

			.item-name {
				display: table;
				width: 100%;
				font-size: 28rpx;
				line-height: 28rpx;
				font-weight: bold;
				white-space: pre-wrap;
				color: #333333;
				margin-top: 8rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}

			.item-descr {
				display: table;
				width: 100%;
				font-size: 24rpx;
				line-height: 24rpx;
				white-space: pre-wrap;
				color: #999999;
				margin-top: 12rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
		}

	}

	.menu-wrap {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.tab-view {
		width: 200rpx;
		height: 100%;
	}

	.tab-item {
		height: 110rpx;
		background: #f6f6f6;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #444;
		font-weight: 400;
		line-height: 1;
	}

	.tab-item-active {
		position: relative;
		color: #000;
		font-size: 30rpx;
		font-weight: 600;
		background: #fff;
	}

	.tab-item-active::before {
		content: "";
		position: absolute;
		border-left: 4px solid #2979ff;
		height: 32rpx;
		left: 0;
		top: 39rpx;
	}

	.tab-view {
		height: 100%;
	}

	.right-box {
		background-color: rgb(250, 250, 250);
	}

	.page-view {
		padding: 16rpx;
	}

	.class-item {
		margin-bottom: 30rpx;
		background-color: #fff;
		padding: 16rpx;
		border-radius: 8rpx;
	}

	.class-item:last-child {
		min-height: 100vh;
	}

	.item-title {
		padding: 10rpx;
		font-size: 32rpx;
		color: #303133;
		font-weight: bold;
	}

	.item-menu-name {
		font-weight: normal;
		font-size: 24rpx;
		color: #303133;
	}


	.thumb-box {
		width: 33.333333%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		margin-top: 20rpx;
	}

	.item-menu-image {
		width: 120rpx;
		height: 120rpx;
	}
</style>
