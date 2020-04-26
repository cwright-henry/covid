import Vue from 'vue'
import VueRouter from 'vue-router'
import World from '@/views/World'
import Country from '@/views/Country'

Vue.use(VueRouter)

const routes = [
	{
		path: '',
		redirect: '/world',
	},
	{
		path: '/world',
		component: World,
	},
	{
		path: '/country/:country',
		component: Country,
		props: (route) => ({ countryCode: route.params.country })
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,

	/**
	 * Browser based navigation - does not take care of
	 * programmatic navigation
	 */
	scrollBehavior(to, from, savedPosition) {
		let position = { x: 0, y: 0 };
		if (savedPosition) {
			position = savedPosition
		}

		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(position)
			}, 100)
		})
	},
	
	routes
})

export default router
