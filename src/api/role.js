import request from '@/utils/request'

export function getRoles(params) {
  return request({
    url: '/role/list',
    method: 'get',
    params: params
  })
}

export function getRoutes() {
  return request({
    url: '/menu/treeList',
    method: 'get'
  })
}