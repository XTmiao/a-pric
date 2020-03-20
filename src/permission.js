import router from './router'
import store from './store'
import {
	Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
	getToken
} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
	showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
	// start progress bar
	NProgress.start()

	// set page title
	document.title = getPageTitle(to.meta.title)

	// 判断用户是否已经登录
	const hasToken = getToken()
	if (hasToken) {
		if (to.path === '/login') { // to表示要去的路由
			// 如果已经登录，重定向到主页
			next({
				path: '/'
			})
			NProgress.done()
		} else {
			// 确定用户是否通过getInfo获得了他的权限角色
			const hasGetUserInfo = store.getters.name
			const hasRoles = store.getters.roles && store.getters.roles.length>0;
			if (hasGetUserInfo && hasRoles) {  
				next()
			} else {
				try {
					// debugger;
					
					// get user info
					// roles必须是一个数组
					const { roles, name } = await store.dispatch('user/getInfo')
					
					// 根据角色生成可访问路由映射
					const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
					router.addRoutes(accessRoutes)
					console.log(accessRoutes);
					// 破解方法确保addRoutes是完整的，设置replace: true，这样导航就不会留下历史记录
					next({ ...to, replace: true })
				} catch (error) {
					console.log(error);
					// remove token and go to login page to re-login
					await store.dispatch('user/resetToken')
					Message.error(error || 'Has Error')
					next(`/login?redirect=${to.path}`)
					NProgress.done()
				}
			}
		}
	} else {
		/* has no token*/
		if (whiteList.indexOf(to.path) !== -1) {
			// in the free login whitelist, go directly
			next()
		} else {
			// other pages that do not have permission to access are redirected to the login page.
			next(`/login?redirect=${to.path}`)
			NProgress.done()
		}
	}
})

router.afterEach(() => {
	// finish progress bar
	NProgress.done()
})
