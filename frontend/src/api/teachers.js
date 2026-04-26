import request from './request'

export function getTeacherList(params) {
  return request({ url: '/teachers', method: 'get', params })
}

export function getTeacherById(id) {
  return request({ url: `/teachers/${id}`, method: 'get' })
}

export function createTeacher(data) {
  return request({ url: '/teachers', method: 'post', data })
}

export function updateTeacher(id, data) {
  return request({ url: `/teachers/${id}`, method: 'put', data })
}

export function deleteTeacher(id) {
  return request({ url: `/teachers/${id}`, method: 'delete' })
}
