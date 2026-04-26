#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
generate_fake_school_data.py

本地学校学生管理网页仿真系统：模拟数据生成脚本

用途：
1. 为毕业设计项目批量生成模拟数据。
2. 不使用真实学生信息，避免隐私问题。
3. 生成 students、teachers、majors、classes、courses、scores、attendance、notices 等数据。
4. 同时输出 JSON 和 CSV，方便导入数据库或交给 AI 开发工具使用。

默认输出目录：
./mock_school_data/

运行示例：
python generate_fake_school_data.py

自定义数量：
python generate_fake_school_data.py --students 200 --teachers 15 --classes 10 --courses 25 --output ./mock_data

说明：
- 该脚本只使用 Python 标准库，不需要额外安装第三方包。
- 生成的数据全部为虚构模拟数据。
- 密码字段默认使用 plainPassword=123456，正式接入后端时应由 Node.js seed 脚本使用 bcrypt 加密。
"""

import argparse
import csv
import json
import random
from datetime import datetime, timedelta
from pathlib import Path


# =========================
# 基础配置
# =========================

DEFAULT_PASSWORD = "123456"

RANDOM_SEED = 20260426

FAMILY_NAMES = [
    "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
    "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
    "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
    "陶", "姜", "谢", "邹", "喻", "柏", "水", "窦", "章", "云",
    "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦", "昌",
    "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "鲍",
]

GIVEN_NAMES_MALE = [
    "子轩", "浩然", "宇航", "明哲", "俊杰", "博文", "志远", "思源",
    "泽宇", "嘉豪", "天宇", "文博", "梓豪", "昊然", "鹏飞", "一鸣",
    "建国", "国强", "伟杰", "俊宇", "承泽", "景行", "睿哲", "嘉诚",
]

GIVEN_NAMES_FEMALE = [
    "雨桐", "欣怡", "子涵", "诗涵", "佳怡", "梓萱", "梦瑶", "思琪",
    "雅婷", "若曦", "婉婷", "静怡", "可欣", "语嫣", "晓彤", "雪晴",
    "文静", "丽娜", "慧敏", "佳宁", "清妍", "芷若", "依晨", "沐晴",
]

DEPARTMENTS = [
    "信息工程学院",
    "管理学院",
    "外国语学院",
    "数学与统计学院",
    "艺术设计学院",
]

MAJOR_TEMPLATES = [
    ("SE", "软件工程", "信息工程学院", 4),
    ("CS", "计算机科学与技术", "信息工程学院", 4),
    ("AI", "人工智能", "信息工程学院", 4),
    ("DS", "数据科学与大数据技术", "信息工程学院", 4),
    ("ECOM", "电子商务", "管理学院", 4),
    ("ACC", "会计学", "管理学院", 4),
    ("ENG", "英语", "外国语学院", 4),
    ("MATH", "数学与应用数学", "数学与统计学院", 4),
    ("DES", "视觉传达设计", "艺术设计学院", 4),
]

COURSE_TEMPLATES = [
    ("C001", "Java程序设计", "required", 4),
    ("C002", "数据库原理", "required", 4),
    ("C003", "Web前端开发", "required", 3),
    ("C004", "数据结构", "required", 4),
    ("C005", "操作系统", "required", 4),
    ("C006", "软件工程导论", "required", 3),
    ("C007", "Python程序设计", "elective", 3),
    ("C008", "人工智能基础", "elective", 3),
    ("C009", "大学英语", "public", 2),
    ("C010", "体育", "public", 1),
    ("C011", "计算机网络", "required", 4),
    ("C012", "离散数学", "required", 3),
    ("C013", "Linux操作系统", "elective", 2),
    ("C014", "移动应用开发", "elective", 3),
    ("C015", "软件测试技术", "required", 3),
    ("C016", "信息安全基础", "elective", 2),
    ("C017", "高等数学", "public", 4),
    ("C018", "线性代数", "public", 3),
    ("C019", "大学物理", "public", 3),
    ("C020", "创新创业基础", "public", 2),
    ("C021", "机器学习导论", "elective", 3),
    ("C022", "数据可视化", "elective", 3),
    ("C023", "项目管理", "required", 2),
    ("C024", "毕业设计指导", "practice", 2),
    ("C025", "专业实训", "practice", 4),
]

TEACHER_TITLES = ["助教", "讲师", "副教授", "教授"]

GRADE_LIST = ["2021", "2022", "2023", "2024"]

STUDENT_STATUS_LIST = ["studying", "studying", "studying", "studying", "suspended", "graduated"]

ATTENDANCE_STATUS_LIST = [
    "normal", "normal", "normal", "normal", "normal", "normal",
    "late", "leave_early", "leave", "absent"
]

NOTICE_CATEGORIES = ["academic", "exam", "activity", "system"]

NOTICE_TITLES = [
    "关于本学期期末考试安排的通知",
    "关于开展学生信息核对工作的通知",
    "关于校园文化活动报名的通知",
    "关于课程调整的通知",
    "关于学生考勤管理要求的通知",
    "关于奖学金评定工作的通知",
    "关于毕业设计开题安排的通知",
    "关于实验室开放时间调整的通知",
    "关于校园网络维护的通知",
    "关于组织学科竞赛报名的通知",
]

REWARD_TITLES = [
    "三好学生",
    "优秀学生干部",
    "一等奖学金",
    "二等奖学金",
    "学科竞赛优秀奖",
    "志愿服务优秀个人",
]

PUNISHMENT_TITLES = [
    "警告处分",
    "严重警告处分",
    "记过处分",
]

CITY_AREAS = [
    "模拟市朝阳区", "模拟市海淀区", "模拟市西湖区", "模拟市滨江区",
    "模拟市天河区", "模拟市浦东新区", "模拟市武侯区", "模拟市高新区",
]


# =========================
# 工具函数
# =========================

def now_iso():
    return datetime.now().replace(microsecond=0).isoformat()


def date_iso(dt):
    return dt.strftime("%Y-%m-%d")


def datetime_iso(dt):
    return dt.replace(microsecond=0).isoformat()


def random_name(gender):
    family = random.choice(FAMILY_NAMES)
    if gender == "male":
        given = random.choice(GIVEN_NAMES_MALE)
    else:
        given = random.choice(GIVEN_NAMES_FEMALE)
    return family + given


def random_phone():
    prefixes = ["138", "139", "150", "151", "152", "157", "158", "159", "166", "178", "186", "188"]
    return random.choice(prefixes) + "".join(str(random.randint(0, 9)) for _ in range(8))


def random_email(prefix):
    domains = ["example.com", "school.local", "demo.edu"]
    return f"{prefix}@{random.choice(domains)}"


def random_address():
    return f"{random.choice(CITY_AREAS)}模拟路{random.randint(1, 999)}号"


def score_level(total_score):
    if total_score >= 90:
        return "excellent"
    if total_score >= 80:
        return "good"
    if total_score >= 70:
        return "medium"
    if total_score >= 60:
        return "pass"
    return "fail"


def calc_total_score(usual_score, final_score):
    return round(usual_score * 0.4 + final_score * 0.6, 1)


def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def write_csv(path, rows):
    if not rows:
        return

    fieldnames = list(rows[0].keys())

    # utf-8-sig 方便 Windows Excel 直接打开中文不乱码
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# =========================
# 数据生成函数
# =========================

def generate_majors(count):
    selected = MAJOR_TEMPLATES[:count]
    majors = []

    for idx, (major_no, name, department, duration) in enumerate(selected, start=1):
        majors.append({
            "id": idx,
            "majorNo": major_no,
            "name": name,
            "department": department,
            "duration": duration,
            "description": f"{name}专业主要培养具备相关理论基础和实践能力的应用型人才。",
            "status": "enabled",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return majors


def generate_teachers(count):
    teachers = []

    for idx in range(1, count + 1):
        gender = random.choice(["male", "female"])
        name = random_name(gender)
        teacher_no = f"T{idx:03d}"
        department = random.choice(DEPARTMENTS)
        title = random.choice(TEACHER_TITLES)

        teachers.append({
            "id": idx,
            "teacherNo": teacher_no,
            "name": name,
            "gender": gender,
            "department": department,
            "title": title,
            "phone": random_phone(),
            "email": random_email(teacher_no.lower()),
            "isHeadTeacher": False,
            "remark": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return teachers


def generate_classes(count, majors, teachers):
    classes = []

    for idx in range(1, count + 1):
        major = random.choice(majors)
        grade = random.choice(GRADE_LIST)
        class_seq = random.randint(1, 3)
        class_no = f"{major['majorNo']}{grade[-2:]}{class_seq:02d}"

        # 保证编号尽量不重复
        existing_nos = {c["classNo"] for c in classes}
        while class_no in existing_nos:
            class_seq += 1
            class_no = f"{major['majorNo']}{grade[-2:]}{class_seq:02d}"

        head_teacher = random.choice(teachers)

        classes.append({
            "id": idx,
            "classNo": class_no,
            "name": f"{major['name']}{grade[-2:]}{class_seq:02d}班",
            "grade": grade,
            "majorId": major["id"],
            "majorName": major["name"],
            "headTeacherId": head_teacher["id"],
            "headTeacherName": head_teacher["name"],
            "status": "enabled",
            "remark": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

        # 标记班主任
        for t in teachers:
            if t["id"] == head_teacher["id"]:
                t["isHeadTeacher"] = True

    return classes


def generate_students(count, majors, classes):
    students = []
    used_student_nos = set()

    for idx in range(1, count + 1):
        class_item = random.choice(classes)
        major = next(m for m in majors if m["id"] == class_item["majorId"])

        gender = random.choice(["male", "female"])
        name = random_name(gender)

        grade = class_item["grade"]
        year_short = grade
        seq = idx

        student_no = f"{year_short}{major['majorNo']}{class_item['classNo'][-2:]}{seq:03d}"
        while student_no in used_student_nos:
            seq += random.randint(1, 9)
            student_no = f"{year_short}{major['majorNo']}{class_item['classNo'][-2:]}{seq:03d}"

        used_student_nos.add(student_no)

        enrollment_date = datetime(int(grade), 9, 1)
        birth_year = int(grade) - random.randint(17, 20)
        birth_date = datetime(birth_year, random.randint(1, 12), random.randint(1, 28))

        students.append({
            "id": idx,
            "studentNo": student_no,
            "name": name,
            "gender": gender,
            "birthDate": date_iso(birth_date),
            "phone": random_phone(),
            "address": random_address(),
            "grade": grade,
            "enrollmentDate": date_iso(enrollment_date),
            "status": random.choice(STUDENT_STATUS_LIST),
            "avatar": "",
            "remark": "",
            "majorId": major["id"],
            "majorName": major["name"],
            "classId": class_item["id"],
            "className": class_item["name"],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return students


def generate_courses(count, majors, teachers):
    courses = []
    templates = COURSE_TEMPLATES[:count]

    for idx, (course_no, name, course_type, credit) in enumerate(templates, start=1):
        teacher = random.choice(teachers)
        major = random.choice(majors)
        grade = random.choice(GRADE_LIST)
        semester = random.choice([
            "2023-2024第一学期",
            "2023-2024第二学期",
            "2024-2025第一学期",
            "2024-2025第二学期",
        ])

        courses.append({
            "id": idx,
            "courseNo": course_no,
            "name": name,
            "type": course_type,
            "credit": credit,
            "teacherId": teacher["id"],
            "teacherName": teacher["name"],
            "majorId": major["id"],
            "majorName": major["name"],
            "grade": grade,
            "semester": semester,
            "status": "enabled",
            "remark": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return courses


def generate_course_classes(courses, classes):
    course_classes = []
    current_id = 1
    used = set()

    for course in courses:
        # 每门课随机关联 1-3 个班级，优先同年级
        same_grade_classes = [c for c in classes if c["grade"] == course["grade"]]
        pool = same_grade_classes if same_grade_classes else classes
        sample_size = min(len(pool), random.randint(1, 3))

        for class_item in random.sample(pool, sample_size):
            key = (course["id"], class_item["id"])
            if key in used:
                continue

            used.add(key)
            course_classes.append({
                "id": current_id,
                "courseId": course["id"],
                "courseName": course["name"],
                "classId": class_item["id"],
                "className": class_item["name"],
                "createdAt": now_iso(),
            })
            current_id += 1

    return course_classes


def generate_scores(students, courses, course_classes, max_courses_per_student=5):
    scores = []
    current_id = 1
    used = set()

    class_to_courses = {}
    for cc in course_classes:
        class_to_courses.setdefault(cc["classId"], []).append(cc["courseId"])

    course_map = {c["id"]: c for c in courses}

    for student in students:
        available_course_ids = class_to_courses.get(student["classId"], [])
        if not available_course_ids:
            available_course_ids = [c["id"] for c in courses]

        sample_size = min(len(available_course_ids), random.randint(3, max_courses_per_student))
        selected_course_ids = random.sample(available_course_ids, sample_size)

        for course_id in selected_course_ids:
            course = course_map[course_id]
            key = (student["id"], course_id, course["semester"])
            if key in used:
                continue
            used.add(key)

            usual = random.randint(55, 100)
            final = random.randint(45, 100)
            total = calc_total_score(usual, final)
            level = score_level(total)

            scores.append({
                "id": current_id,
                "studentId": student["id"],
                "studentNo": student["studentNo"],
                "studentName": student["name"],
                "classId": student["classId"],
                "className": student["className"],
                "courseId": course_id,
                "courseName": course["name"],
                "semester": course["semester"],
                "usualScore": usual,
                "finalScore": final,
                "totalScore": total,
                "level": level,
                "recorderId": course["teacherId"],
                "recorderName": course["teacherName"],
                "remark": "",
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            })
            current_id += 1

    return scores


def generate_attendance(students, courses, course_classes, days=30, records_per_student=8):
    attendance = []
    current_id = 1
    used = set()

    class_to_courses = {}
    for cc in course_classes:
        class_to_courses.setdefault(cc["classId"], []).append(cc["courseId"])

    course_map = {c["id"]: c for c in courses}
    today = datetime.now()

    for student in students:
        available_course_ids = class_to_courses.get(student["classId"], [])
        if not available_course_ids:
            available_course_ids = [c["id"] for c in courses]

        for _ in range(records_per_student):
            course_id = random.choice(available_course_ids)
            course = course_map[course_id]
            date = today - timedelta(days=random.randint(0, days))
            date_str = date_iso(date)

            key = (student["id"], course_id, date_str)
            if key in used:
                continue
            used.add(key)

            status = random.choice(ATTENDANCE_STATUS_LIST)

            attendance.append({
                "id": current_id,
                "studentId": student["id"],
                "studentNo": student["studentNo"],
                "studentName": student["name"],
                "classId": student["classId"],
                "className": student["className"],
                "courseId": course_id,
                "courseName": course["name"],
                "attendanceDate": date_str,
                "status": status,
                "recorderId": course["teacherId"],
                "recorderName": course["teacherName"],
                "remark": "" if status == "normal" else "模拟考勤异常记录",
                "createdAt": now_iso(),
                "updatedAt": now_iso(),
            })
            current_id += 1

    return attendance


def generate_rewards_punishments(students, count):
    records = []

    for idx in range(1, count + 1):
        student = random.choice(students)
        rp_type = random.choice(["reward", "reward", "reward", "punishment"])

        if rp_type == "reward":
            title = random.choice(REWARD_TITLES)
            level = random.choice(["校级", "院级", "班级", "市级"])
            description = f"{student['name']}获得{level}{title}。"
        else:
            title = random.choice(PUNISHMENT_TITLES)
            level = random.choice(["校级", "院级"])
            description = f"{student['name']}因违反相关规定，给予{title}。"

        record_date = datetime.now() - timedelta(days=random.randint(1, 365))

        records.append({
            "id": idx,
            "studentId": student["id"],
            "studentNo": student["studentNo"],
            "studentName": student["name"],
            "classId": student["classId"],
            "className": student["className"],
            "type": rp_type,
            "title": title,
            "level": level,
            "recordDate": date_iso(record_date),
            "description": description,
            "recorderUserId": 1,
            "recorderName": "系统管理员",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return records


def generate_notices(count):
    notices = []

    for idx in range(1, count + 1):
        title = NOTICE_TITLES[(idx - 1) % len(NOTICE_TITLES)]
        category = random.choice(NOTICE_CATEGORIES)
        published_at = datetime.now() - timedelta(days=random.randint(0, 60))

        notices.append({
            "id": idx,
            "title": title,
            "content": f"这是关于“{title}”的模拟公告内容。请相关师生及时查看，并按照通知要求完成对应事项。本公告仅用于毕业设计系统演示。",
            "category": category,
            "status": "published",
            "isTop": True if idx <= 2 else False,
            "publisherId": 1,
            "publisherName": "系统管理员",
            "publishedAt": datetime_iso(published_at),
            "expiredAt": "",
            "viewCount": random.randint(0, 300),
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return notices


def generate_users(teachers, students):
    users = []

    # 管理员
    users.append({
        "id": 1,
        "username": "admin",
        "plainPassword": DEFAULT_PASSWORD,
        "nickname": "系统管理员",
        "role": "admin",
        "status": "enabled",
        "teacherId": "",
        "studentId": "",
        "lastLoginAt": "",
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    })

    current_id = 2

    # 教师用户
    for teacher in teachers:
        users.append({
            "id": current_id,
            "username": teacher["teacherNo"].lower(),
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": teacher["name"],
            "role": "teacher",
            "status": "enabled",
            "teacherId": teacher["id"],
            "studentId": "",
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })
        current_id += 1

    # 学生用户
    for student in students:
        users.append({
            "id": current_id,
            "username": student["studentNo"].lower(),
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": student["name"],
            "role": "student",
            "status": "enabled",
            "teacherId": "",
            "studentId": student["id"],
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })
        current_id += 1

    # 额外加几个更好记的演示账号，方便登录演示
    if teachers:
        users.append({
            "id": current_id,
            "username": "teacher001",
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": teachers[0]["name"],
            "role": "teacher",
            "status": "enabled",
            "teacherId": teachers[0]["id"],
            "studentId": "",
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })
        current_id += 1

    if len(teachers) > 1:
        users.append({
            "id": current_id,
            "username": "teacher002",
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": teachers[1]["name"],
            "role": "teacher",
            "status": "enabled",
            "teacherId": teachers[1]["id"],
            "studentId": "",
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })
        current_id += 1

    if students:
        users.append({
            "id": current_id,
            "username": "student001",
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": students[0]["name"],
            "role": "student",
            "status": "enabled",
            "teacherId": "",
            "studentId": students[0]["id"],
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })
        current_id += 1

    if len(students) > 1:
        users.append({
            "id": current_id,
            "username": "student002",
            "plainPassword": DEFAULT_PASSWORD,
            "nickname": students[1]["name"],
            "role": "student",
            "status": "enabled",
            "teacherId": "",
            "studentId": students[1]["id"],
            "lastLoginAt": "",
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        })

    return users


def generate_operation_logs(count=30):
    modules = ["auth", "students", "teachers", "classes", "courses", "scores", "attendance", "notices"]
    actions = ["login", "create", "update", "delete", "query"]
    logs = []

    for idx in range(1, count + 1):
        module = random.choice(modules)
        action = random.choice(actions)
        created_at = datetime.now() - timedelta(days=random.randint(0, 30), minutes=random.randint(0, 1440))

        logs.append({
            "id": idx,
            "userId": 1,
            "username": "admin",
            "role": "admin",
            "module": module,
            "action": action,
            "description": f"模拟操作日志：{module} 模块执行 {action} 操作。",
            "result": "success",
            "ip": "127.0.0.1",
            "createdAt": datetime_iso(created_at),
        })

    return logs


def generate_all(args):
    random.seed(args.seed)

    major_count = min(args.majors, len(MAJOR_TEMPLATES))
    course_count = min(args.courses, len(COURSE_TEMPLATES))

    majors = generate_majors(major_count)
    teachers = generate_teachers(args.teachers)
    classes = generate_classes(args.classes, majors, teachers)
    students = generate_students(args.students, majors, classes)
    courses = generate_courses(course_count, majors, teachers)
    course_classes = generate_course_classes(courses, classes)
    scores = generate_scores(students, courses, course_classes, args.max_courses_per_student)
    attendance_records = generate_attendance(
        students,
        courses,
        course_classes,
        days=args.attendance_days,
        records_per_student=args.attendance_per_student
    )
    rewards_punishments = generate_rewards_punishments(students, args.rewards)
    notices = generate_notices(args.notices)
    users = generate_users(teachers, students)
    operation_logs = generate_operation_logs(args.logs)

    data = {
        "meta": {
            "project": "本地学校学生管理网页仿真系统",
            "description": "本文件中的所有数据均为模拟数据，仅用于毕业设计和本地演示。",
            "generatedAt": now_iso(),
            "defaultPassword": DEFAULT_PASSWORD,
            "counts": {
                "users": len(users),
                "majors": len(majors),
                "teachers": len(teachers),
                "classes": len(classes),
                "students": len(students),
                "courses": len(courses),
                "courseClasses": len(course_classes),
                "scores": len(scores),
                "attendanceRecords": len(attendance_records),
                "rewardsPunishments": len(rewards_punishments),
                "notices": len(notices),
                "operationLogs": len(operation_logs),
            }
        },
        "users": users,
        "majors": majors,
        "teachers": teachers,
        "classes": classes,
        "students": students,
        "courses": courses,
        "courseClasses": course_classes,
        "scores": scores,
        "attendanceRecords": attendance_records,
        "rewardsPunishments": rewards_punishments,
        "notices": notices,
        "operationLogs": operation_logs,
    }

    return data


def write_readme(output_dir, data):
    text = f"""# 模拟数据说明

本目录由 `generate_fake_school_data.py` 自动生成。

## 说明

这些数据全部是虚构模拟数据，仅用于本地学校学生管理网页仿真系统、毕业设计展示、接口联调和页面测试。

请不要把这些数据当作真实学校数据使用。

## 默认演示账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | {DEFAULT_PASSWORD} |
| 教师 | teacher001 | {DEFAULT_PASSWORD} |
| 教师 | teacher002 | {DEFAULT_PASSWORD} |
| 学生 | student001 | {DEFAULT_PASSWORD} |
| 学生 | student002 | {DEFAULT_PASSWORD} |

## 数据数量

| 数据表 | 数量 |
|---|---:|
| users | {len(data["users"])} |
| majors | {len(data["majors"])} |
| teachers | {len(data["teachers"])} |
| classes | {len(data["classes"])} |
| students | {len(data["students"])} |
| courses | {len(data["courses"])} |
| courseClasses | {len(data["courseClasses"])} |
| scores | {len(data["scores"])} |
| attendanceRecords | {len(data["attendanceRecords"])} |
| rewardsPunishments | {len(data["rewardsPunishments"])} |
| notices | {len(data["notices"])} |
| operationLogs | {len(data["operationLogs"])} |

## 文件说明

- `seed_data.json`：完整 JSON 数据，适合 Node.js / Prisma seed 脚本读取。
- `csv/`：按表拆分的 CSV 文件，适合检查数据或导入其他工具。
- `README_数据说明.md`：当前说明文件。

## 接入建议

如果你的后端使用 Node.js + Prisma，推荐在 `backend/prisma/seed.js` 中读取 `seed_data.json`，然后使用 Prisma 逐表写入数据库。

注意：
- `plainPassword` 是明文演示密码。
- 真正写入 users 表时，应该使用 bcrypt 加密后保存到 `password` 字段。
"""
    Path(output_dir, "README_数据说明.md").write_text(text, encoding="utf-8")


def save_outputs(data, output_dir):
    output = Path(output_dir)
    csv_dir = output / "csv"

    ensure_dir(output)
    ensure_dir(csv_dir)

    write_json(output / "seed_data.json", data)

    table_keys = [
        "users",
        "majors",
        "teachers",
        "classes",
        "students",
        "courses",
        "courseClasses",
        "scores",
        "attendanceRecords",
        "rewardsPunishments",
        "notices",
        "operationLogs",
    ]

    for key in table_keys:
        write_csv(csv_dir / f"{key}.csv", data[key])

    write_readme(output, data)


def parse_args():
    parser = argparse.ArgumentParser(
        description="为本地学校学生管理网页仿真系统生成模拟数据。"
    )

    parser.add_argument("--output", default="./mock_school_data", help="输出目录，默认 ./mock_school_data")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="随机种子，默认固定，方便重复生成")
    parser.add_argument("--students", type=int, default=120, help="学生数量，默认 120")
    parser.add_argument("--teachers", type=int, default=12, help="教师数量，默认 12")
    parser.add_argument("--classes", type=int, default=8, help="班级数量，默认 8")
    parser.add_argument("--majors", type=int, default=5, help="专业数量，默认 5，最大不超过内置模板数量")
    parser.add_argument("--courses", type=int, default=20, help="课程数量，默认 20，最大不超过内置模板数量")
    parser.add_argument("--max-courses-per-student", type=int, default=5, help="每名学生最多生成几门成绩，默认 5")
    parser.add_argument("--attendance-days", type=int, default=30, help="考勤日期范围，默认最近 30 天")
    parser.add_argument("--attendance-per-student", type=int, default=8, help="每名学生生成多少条考勤，默认 8")
    parser.add_argument("--rewards", type=int, default=30, help="奖惩记录数量，默认 30")
    parser.add_argument("--notices", type=int, default=8, help="公告数量，默认 8")
    parser.add_argument("--logs", type=int, default=30, help="操作日志数量，默认 30")

    return parser.parse_args()


def main():
    args = parse_args()

    if args.students < 1:
        raise ValueError("students 必须大于 0")
    if args.teachers < 1:
        raise ValueError("teachers 必须大于 0")
    if args.classes < 1:
        raise ValueError("classes 必须大于 0")
    if args.majors < 1:
        raise ValueError("majors 必须大于 0")
    if args.courses < 1:
        raise ValueError("courses 必须大于 0")

    data = generate_all(args)
    save_outputs(data, args.output)

    print("模拟数据生成完成！")
    print(f"输出目录：{Path(args.output).resolve()}")
    print(f"完整 JSON：{Path(args.output, 'seed_data.json').resolve()}")
    print(f"CSV 目录：{Path(args.output, 'csv').resolve()}")
    print()
    print("默认演示账号：")
    print(f"管理员：admin / {DEFAULT_PASSWORD}")
    print(f"教师：teacher001 / {DEFAULT_PASSWORD}")
    print(f"学生：student001 / {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    main()
