import request from './request'

export function getMajorList(params) {
  return request({ url: '/majors', method: 'get', params })
}

export function getMajorById(id) {
  return request({ url: `/majors/${id}`, method: 'get' })
}

export function createMajor(data) {
  return request({ url: '/majors', method: 'post', data })
}

export function updateMajor(id, data) {
  return request({ url: `/majors/${id}`, method: 'put', data })
}

export function deleteMajor(id) {
  return request({ url: `/majors/${id}`, method: 'delete' })
}
