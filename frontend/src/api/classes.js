import request from './request'

export function getClassList(params) {
  return request({ url: '/classes', method: 'get', params })
}

export function getClassById(id) {
  return request({ url: `/classes/${id}`, method: 'get' })
}

export function createClass(data) {
  return request({ url: '/classes', method: 'post', data })
}

export function updateClass(id, data) {
  return request({ url: `/classes/${id}`, method: 'put', data })
}

export function deleteClass(id) {
  return request({ url: `/classes/${id}`, method: 'delete' })
}

export function getClassStudents(id, params) {
  return request({ url: `/classes/${id}/students`, method: 'get', params })
}
