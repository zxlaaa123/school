// 用户角色
export const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '教师', value: 'teacher' },
  { label: '学生', value: 'student' }
]

// 用户状态
export const USER_STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' }
]

// 性别
export const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

// 学籍状态
export const STUDENT_STATUS_OPTIONS = [
  { label: '在读', value: 'studying' },
  { label: '休学', value: 'suspended' },
  { label: '退学', value: 'withdrawn' },
  { label: '毕业', value: 'graduated' }
]

// 课程类型
export const COURSE_TYPE_OPTIONS = [
  { label: '必修', value: 'required' },
  { label: '选修', value: 'elective' },
  { label: '公共课', value: 'public' },
  { label: '实践课', value: 'practice' }
]

// 成绩等级
export const SCORE_LEVEL_OPTIONS = [
  { label: '优秀', value: 'excellent' },
  { label: '良好', value: 'good' },
  { label: '中等', value: 'medium' },
  { label: '及格', value: 'pass' },
  { label: '不及格', value: 'fail' }
]

// 考勤状态
export const ATTENDANCE_STATUS_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '迟到', value: 'late' },
  { label: '早退', value: 'leave_early' },
  { label: '请假', value: 'leave' },
  { label: '缺勤', value: 'absent' }
]

// 奖惩类型
export const RP_TYPE_OPTIONS = [
  { label: '奖励', value: 'reward' },
  { label: '处分', value: 'punishment' }
]

// 公告状态
export const NOTICE_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已过期', value: 'expired' }
]

// 公告分类
export const NOTICE_CATEGORY_OPTIONS = [
  { label: '教务通知', value: 'academic' },
  { label: '考试通知', value: 'exam' },
  { label: '活动通知', value: 'activity' },
  { label: '系统通知', value: 'system' }
]

// 通用状态
export const STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' }
]

// 枚举值转中文映射
const ENUM_MAP = {
  // 角色
  admin: '管理员', teacher: '教师', student: '学生',
  // 状态
  enabled: '启用', disabled: '禁用',
  // 性别
  male: '男', female: '女', unknown: '未知',
  // 学籍状态
  studying: '在读', suspended: '休学', withdrawn: '退学', graduated: '毕业',
  // 课程类型
  required: '必修', elective: '选修', public: '公共课', practice: '实践课',
  // 成绩等级
  excellent: '优秀', good: '良好', medium: '中等', pass: '及格', fail: '不及格',
  // 考勤状态
  normal: '正常', late: '迟到', leave_early: '早退', leave: '请假', absent: '缺勤',
  // 奖惩类型
  reward: '奖励', punishment: '处分',
  // 公告状态
  draft: '草稿', published: '已发布', expired: '已过期',
  // 公告分类
  academic: '教务通知', exam: '考试通知', activity: '活动通知', system: '系统通知'
}

export function getEnumLabel(value) {
  return ENUM_MAP[value] || value || '--'
}
