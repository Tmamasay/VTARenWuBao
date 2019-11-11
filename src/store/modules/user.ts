import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login, logout, getUserAndMenu } from '@/api/users'
import { getToken, setToken, removeToken } from '@/utils/cookies'
import router, { resetRouter } from '@/router'
import { PermissionModule } from './permission'
import { TagsViewModule } from './tags-view'
import store from '@/store'

export interface IUserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
  email: string
  menu: any
}
export const filterData = (data: any) => {
  for (const key of Object.keys(data)) {
    // console.log(key.match(/^\.$/))
    if (key.match(/^\./)) {
      // debugger
      delete data[key]
    }
    // if(data.hasOwnProperty(key)) {
    //   data[key];
    // }
  }
  return data
}
@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  public introduction = ''
  public roles: string[] = []
  public email = ''
  public menu = {}

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_MENU(menu: any) {
    this.menu = menu
  }
  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_EMAIL(email: string) {
    this.email = email
  }

  @Action
  public async Login(userInfo: { userAccount: string, password: string }) {
    let { userAccount, password } = userInfo
    userAccount = userAccount.trim()
    const data: any = await login({ userAccount, password })
    setToken(data.data.token)
    this.SET_TOKEN(data.data.token)
    // debugger
  }

  @Action
  public ResetToken() {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo(token: string) {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    // debugger
    const data: any = await getUserAndMenu({ token: token })
    console.log(data)
    // debugger
    // const filterDataFirst = filterData(data.systemMenuGroups)
    const filterDataFirst = data.data.list
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    // debugger
    const roles = []
    roles.push(data.data.hnSysUser.userType)
    // // roles must be a non-empty array
    // if (!roles || roles.length <= 0) {
    //   throw Error('GetUserInfo: roles must be a non-null array!')
    // }
    console.log(filterDataFirst)
    // debugger
    this.SET_MENU(filterDataFirst)
    this.SET_ROLES(roles)
    // this.SET_NAME(name)
    // this.SET_AVATAR(avatar)
    // this.SET_INTRODUCTION(introduction)
    // this.SET_EMAIL(email)
  }

  @Action
  public async ChangeRoles(role: string) {
    // Dynamically modify permissions
    const ParmToken = this.token
    const token = role + '-token'
    this.SET_TOKEN(token)
    setToken(token)
    await this.GetUserInfo(ParmToken)
    resetRouter()
    // Generate dynamic accessible routes based on roles
    PermissionModule.GenerateRoutes(this.roles)
    // Add generated routes
    router.addRoutes(PermissionModule.dynamicRoutes)
    // Reset visited views and cached views
    TagsViewModule.delAllViews()
  }

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    await logout()
    removeToken()
    resetRouter()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }
}

export const UserModule = getModule(User)
