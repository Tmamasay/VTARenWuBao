import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'
import { PermissionModule } from '@/store/modules/permission'
import i18n from '@/lang' // Internationalization
import settings from './settings'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

const getPageTitle = (key: string) => {
  const hasKey = i18n.te(`route.${key}`)
  if (hasKey) {
    const pageName = i18n.t(`route.${key}`)
    return `${pageName} - ${settings.title}`
  }
  return `${settings.title}`
}

router.beforeEach(async(to: Route, _: Route, next: any) => {
  // 开始进度条
  NProgress.start()

  // 确定用户是否已登录
  if (UserModule.token) {
    if (to.path === '/login') {
      // 如果已登录，请重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查用户是否获得了权限角色
      if (UserModule.roles.length === 0) {
        try {
          // Note: 角色必须是对象数组！例如：['admin']或['developer'，'editor']
          await UserModule.GetUserInfo()
          // debugger
          const menus = UserModule.menu
          // 基于角色生成可访问路由图
          PermissionModule.GenerateRoutes(menus)
          // 动态添加可访问路由
          router.addRoutes(PermissionModule.dynamicRoutes)
          // Hack: 确保addroutes已完成
          // Set the replace: true, so the navigation will not leave a history record
          // 设置replace:true，这样导航就不会留下历史记录
          next({ ...to, replace: true })
        } catch (err) {
          // 删除令牌并重定向到登录页
          debugger
          UserModule.ResetToken()
          Message.error(err || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // Has no token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免费登录白名单中，直接进入

      next()
    } else {
      // 没有访问权限的其他页将重定向到登录页。
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to: Route) => {
  // Finish progress bar
  NProgress.done()

  // set page title
  document.title = getPageTitle(to.meta.title)
})
