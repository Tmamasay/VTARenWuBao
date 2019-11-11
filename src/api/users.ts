import request from '@/utils/request'

export const getUsers = (params: any) =>
  request({
    url: '/users',
    method: 'get',
    params
  })
// 登录入口
export const login = (data: any) =>
  request({
    url: '/api/auth/v1/adminLogin',
    method: 'post',
    data
  })
// 获取用户和用户的权限菜单-蔡洋
export const getUserAndMenu = (params: any) =>
  request({
    url: '/admin-web/api/v1/admin/hnSysUser/getUserAndMenu',
    method: 'get',
    params
  })

export const getUserByName = (username: string) =>
  request({
    url: `/users/${username}`,
    method: 'get'
  })

export const updateUser = (username: string, data: any) =>
  request({
    url: `/users/${username}`,
    method: 'put',
    data
  })

export const deleteUser = (username: string) =>
  request({
    url: `/users/${username}`,
    method: 'delete'
  })

// export const login = (data: any) =>
//   request({
//     url: '/admin/api/doLogin',
//     method: 'post',
//     data
//   })

export const getUserMenu = (data: any) =>
  request({
    url: '/admin/api/permission',
    method: 'post',
    data
  })
export const getMenuGroup = (data: any) =>
  request({
    url: '/admin/api/menuGroup',
    method: 'post',
    data
  })

export const logout = () =>
  request({
    url: '/users/logout',
    method: 'post'
  })

export const register = (data: any) =>
  request({
    url: '/users/register',
    method: 'post',
    data
  })
