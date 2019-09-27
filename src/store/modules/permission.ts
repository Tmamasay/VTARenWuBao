import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router'
import { getComponent,getUrlCompent} from '@/utils'
import Layout from '@/layout'
import store from '@/store'

export interface routerZDY {
  path: string
  name: string
  meta: any
  component?: any
  children?: any
}
// const hasPermission = ( route: RouteConfig) => {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

// export const filterAsyncRoutes = (routes: RouteConfig[], roles: string[]) => {
//   const res: RouteConfig[] = []
//   routes.forEach(route => {
//     const r = { ...route }
//     if (hasPermission(roles, r)) {
//       if (r.children) {
//         r.children = filterAsyncRoutes(r.children, roles)
//       }
//       res.push(r)
//     }
//   })
//   return res
// }
export const componentsMap: any = {
  // 渠道商列表(超级管理员)
  article: () => import('@/views/charts/line-chart.vue')
}
export const generateRouter = (item: any, isParent: boolean) => {
  const reg = /\/([\w.]+\/?)\S*/
  const fmeta = { title: item.text, icon: 'documentation', affix: false }
  const cmeta = { title: `${item.text}` }
  const ccomponent = isParent ? '1' : getComponent(item.permission)
  console.log(item.permission)
  // const otherU = item.permission.split('=')[1]
  // console.log('===========------------->')
  // console.log(otherU)
  const router: routerZDY = {
    // path: getUrlCompent(item.permission),
    path: item.permission,
    name: item.text,
    meta: isParent ? fmeta : cmeta,
    // component: isParent ? Layout : () => import(item.component)
    component: isParent ? Layout : componentsMap[ccomponent]
  }
  return router
}
export const filterAsyncRoutes = (routes: any) => {
  const res: any = []
  if (routes) {
    routes.forEach((route: any) => {
      const parent = generateRouter(route, true)
      var children: any[] = []
      if (route.items) {
        route.items.forEach((child: any) => {
          children.push(generateRouter(child, false))
        })
      }
      parent.children = children
      res.push(parent)
      // const r = { ...route }
      //   if (r.children) {
      //     r.children = filterAsyncRoutes(r.children)
      //   }
      //   res.push(r)
    })
  }
  return res
}

export interface IPermissionState {
  routes: RouteConfig[]
  dynamicRoutes: RouteConfig[]
}

@Module({ dynamic: true, store, name: 'permission' })
class Permission extends VuexModule implements IPermissionState {
  public routes: RouteConfig[] = []
  public dynamicRoutes: RouteConfig[] = []

  @Mutation
  private SET_ROUTES(routes: RouteConfig[]) {
    this.routes = constantRoutes.concat(routes)
    this.dynamicRoutes = routes
  }

  // @Action
  // public GenerateRoutes(roles: string[]) {
  //   let accessedRoutes
  //   if (roles.includes('admin')) {
  //     accessedRoutes = asyncRoutes
  //   } else {
  //     accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
  //   }
  //   this.SET_ROUTES(accessedRoutes)
  // }
  @Action
  public GenerateRoutes(data: any) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(data)
      //   if (roles.includes('admin')) {
      //     accessedRoutes = asyncRoutes
      //   } else {
      //     accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      //   }
      console.log('==============================>')
      console.log(accessedRoutes)
      this.SET_ROUTES(accessedRoutes)
      // resolve(accessedRoutes)
    })
  }
}

export const PermissionModule = getModule(Permission)
