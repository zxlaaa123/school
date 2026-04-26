import request from './request'

export function getCourseList(params) {
  return request({ url: '/courses', method: 'get', params })
}

export function getCourseById(id) {
  return request({ url: `/courses/${id}`, method: 'get' })
}

export function createCourse(data) {
  return request({ url: '/courses', method: 'post', data })
}

export function updateCourse(id, data) {
  return request({ url: `/courses/${id}`, method: 'put', data })
}

export function deleteCourse(id) {
  return request({ url: `/courses/${id}`, method: 'delete' })
}

export function assignClasses(courseId, classIds) {
  return request({ url: `/courses/${courseId}/classes`, method: 'post', data: { classIds } })
}

export function getCourseClasses(courseId) {
  return request({ url: `/courses/${courseId}/classes`, method: 'get' })
}
