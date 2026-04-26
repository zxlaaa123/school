import request from './request'

export function getMajorOptions() {
  return request({ url: '/options/majors', method: 'get' })
}

export function getTeacherOptions() {
  return request({ url: '/options/teachers', method: 'get' })
}

export function getClassOptions(params) {
  return request({ url: '/options/classes', method: 'get', params })
}

export function getCourseOptions() {
  return request({ url: '/options/courses', method: 'get' })
}

export function getStudentOptions(params) {
  return request({ url: '/options/students', method: 'get', params })
}
