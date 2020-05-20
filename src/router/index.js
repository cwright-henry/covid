import Vue from 'vue'
import VueRouter from 'vue-router'
import World from '@/views/world/World'
import Country from '@/views/country/Country'
import Provinces from '@/views/provinces/Provinces'

Vue.use(VueRouter)

const routes = [
	{
		path: '',
		redirect: '/world',
	},
	{
		path: '/world',
		name: 'world',
		component: World,
	},
	{
		path: '/country/:country',
		name: 'country',
		component: Country,
		props: (route) => ({ countryCode: route.params.country })
	},
	{
		path: '/country/:country/provinces',
		name: 'provinces',
		component: Provinces,
		props: (route) => ({ countryCode: route.params.country })
	},
	{
		path: '*',
		redirect: '/'
	}
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

router.afterEach((to) => {
	window.gtag('config', window.GA_TRACKING_ID, {
		page_path: to.fullPath,
		page_title: to.name
	});
});

export default router
