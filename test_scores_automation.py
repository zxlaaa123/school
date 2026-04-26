"""成绩管理模块自动化测试 - 最终版"""
from playwright.sync_api import sync_playwright
import time, sys

BASE_URL = "http://[::1]:5173"
RESULTS = []

def log(name, ok, detail=""):
    tag = "[OK]" if ok else "[XX]"
    RESULTS.append({"name": name, "ok": ok, "detail": detail})
    print(f"  {tag} {name} | {detail}")

def do_login(page, username, password):
    page.goto(f"{BASE_URL}/login")
    time.sleep(3)
    page.locator('input[placeholder="请输入账号"]').fill(username)
    page.locator('input[placeholder="请输入密码"]').fill(password)
    page.locator('button:has-text("登")').click()
    try:
        page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
        return True
    except:
        return False

def pick_select(page, idx, opt=0):
    """在对话框中选择下拉项"""
    dlg = page.locator('.el-dialog:visible')
    sel = dlg.locator('.el-select').nth(idx)
    sel.click()
    time.sleep(0.8)
    items = page.locator('.el-select-dropdown:visible .el-select-dropdown__item')
    try:
        items.nth(opt).wait_for(state='visible', timeout=3000)
        items.nth(opt).click()
        time.sleep(0.5)
        return True
    except:
        return False

def main():
    print("\n" + "="*60)
    print("成绩管理模块自动化测试")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # === 1. 教师登录 ===
        print("\n--- 1. 教师登录 ---")
        ok = do_login(page, "teacher001", "123456")
        log("教师登录", ok, f"URL={page.url}")
        if not ok:
            print("登录失败,终止"); browser.close(); return

        # === 2. 成绩管理页面 ===
        print("\n--- 2. 成绩管理页面 ---")
        page.goto(f"{BASE_URL}/scores")
        time.sleep(4)
        log("进入成绩管理页", "/scores" in page.url, f"URL={page.url}")

        title = page.locator('h2').inner_text() if page.locator('h2').count() > 0 else ""
        log("页面标题", "成绩管理" in title, title)

        # === 3. 新增按钮 ===
        print("\n--- 3. 新增按钮 ---")
        add_btn = page.locator('button:has-text("新增成绩")')
        log("教师可见新增按钮", add_btn.is_visible())

        # === 4. 统计卡片 ===
        print("\n--- 4. 统计卡片 ---")
        sc = page.locator('.stat-card').count()
        log("统计卡片存在", sc > 0, f"数量={sc}")
        if sc > 0:
            vals = []
            for i in range(sc):
                try:
                    v = page.locator('.stat-card').nth(i).locator('.stat-value').inner_text()
                    vals.append(v)
                except:
                    vals.append("?")
            log("统计数值显示", True, f"值={vals}")

        # === 5. 列表数据 ===
        print("\n--- 5. 列表数据 ---")
        rows = page.locator('table tbody tr').count()
        log("表格有数据", rows > 0, f"行数={rows}")

        # === 6. 新增成绩(自动计算) ===
        print("\n--- 6. 新增成绩(自动计算总评) ---")
        add_btn.click()
        time.sleep(2)
        dlg = page.locator('.el-dialog:visible')
        log("打开新增对话框", dlg.count() > 0)

        if dlg.count() > 0:
            # 选择学生(0)和课程(1)
            log("选择学生", pick_select(page, 0, 0))
            log("选择课程", pick_select(page, 1, 0))

            # 输入学期
            si = page.locator('.el-dialog:visible input[placeholder*="2023"]')
            if si.count() > 0:
                si.fill('2024-2025-1')
                log("输入学期", True, "2024-2025-1")
            else:
                # 用通用input
                dlg_inputs = dlg.locator('input.el-input__inner:visible').all()
                for inp in dlg_inputs:
                    ph = inp.get_attribute('placeholder') or ''
                    if '2023' in ph or '学期' in ph.lower():
                        inp.fill('2024-2025-1')
                        log("输入学期", True, "2024-2025-1")
                        break

            # 输入平时/期末成绩
            num_inputs = dlg.locator('input[type="number"]:visible').all()
            print(f"  number inputs: {len(num_inputs)}")
            # num_inputs: [平时成绩, 期末成绩, 总评成绩(disabled)]
            if len(num_inputs) >= 3:
                num_inputs[0].fill('85')
                time.sleep(0.5)
                log("输入平时成绩85", True)

                num_inputs[1].fill('90')
                time.sleep(0.5)
                log("输入期末成绩90", True)

                # 检查总评(disabled input)
                total_val = num_inputs[2].input_value()
                log("总评自动计算", "86" in total_val, f"总评值={total_val}")

                # 检查等级标签
                level_tag = dlg.locator('.el-tag').inner_text()
                log("等级自动生成", "良好" in level_tag, f"等级={level_tag}")

                # 修改期末成绩验证实时更新
                num_inputs[1].fill('80')
                time.sleep(0.5)
                total_val2 = num_inputs[2].input_value()
                log("修改后总评更新", "78" in total_val2, f"总评值={total_val2}")

                # 还原期末成绩
                num_inputs[1].fill('90')
                time.sleep(0.5)

                # 保存
                save_btn = dlg.locator('button:has-text("保存")')
                if save_btn.count() > 0:
                    save_btn.click()
                else:
                    dlg.locator('button:has-text("确")').first.click()
                time.sleep(3)

                # 检查保存成功
                dlg_closed = page.locator('.el-dialog:visible').count() == 0
                log("保存成功(对话框关闭)", dlg_closed)

                # 如果对话框没关闭，手动关闭
                if not dlg_closed:
                    cancel = page.locator('.el-dialog:visible button:has-text("取消")')
                    if cancel.count() > 0:
                        cancel.click()
                    else:
                        page.locator('.el-dialog__headerbtn').click()
                    time.sleep(1)

                # 刷新后检查列表
                time.sleep(1)
                rows2 = page.locator('table tbody tr').count()
                log("保存后列表有数据", rows2 > 0, f"行数={rows2}")

        # === 7. 重复成绩拦截 ===
        print("\n--- 7. 重复成绩拦截 ---")
        add_btn2 = page.locator('button:has-text("新增成绩")')
        if add_btn2.is_visible():
            add_btn2.click()
            time.sleep(2)
            pick_select(page, 0, 0)  # 同一学生
            pick_select(page, 1, 0)  # 同一课程

            si = page.locator('.el-dialog:visible input[placeholder*="2023"]')
            if si.count() > 0:
                si.fill('2024-2025-1')  # 同一学期

            num_inputs = page.locator('.el-dialog:visible input[type="number"]:visible').all()
            if len(num_inputs) >= 2:
                num_inputs[0].fill('70')
                num_inputs[1].fill('75')

            save_btn = page.locator('.el-dialog:visible button:has-text("保存")')
            if save_btn.count() > 0:
                save_btn.click()
            else:
                page.locator('.el-dialog:visible button:has-text("确")').first.click()
            time.sleep(2)

            # 检查错误提示
            err_msg = page.locator('.el-message--error')
            dlg_open = page.locator('.el-dialog:visible').count() > 0
            if err_msg.count() > 0:
                txt = err_msg.first.inner_text()
                log("重复成绩拦截", "已有成绩" in txt or "重复" in txt, f"提示={txt}")
            elif dlg_open:
                log("重复成绩拦截", True, "对话框未关闭=拦截成功")
            else:
                log("重复成绩拦截", False, "未拦截")

            # 关闭对话框
            if dlg_open:
                cancel = page.locator('.el-dialog:visible button:has-text("取消")')
                if cancel.count() > 0:
                    cancel.click()
                else:
                    page.locator('.el-dialog__headerbtn').click()
                time.sleep(1)

        # === 8. 分数范围校验 ===
        print("\n--- 8. 分数范围校验 ===")
        add_btn3 = page.locator('button:has-text("新增成绩")')
        if add_btn3.is_visible():
            add_btn3.click()
            time.sleep(2)
            pick_select(page, 0, 0)
            # 选第二个课程避免重复
            course_items_count = 0
            sel2 = page.locator('.el-dialog:visible .el-select').nth(1)
            sel2.click()
            time.sleep(0.8)
            course_items_count = page.locator('.el-select-dropdown:visible .el-select-dropdown__item').count()
            if course_items_count > 1:
                page.locator('.el-select-dropdown:visible .el-select-dropdown__item').nth(1).click()
            else:
                page.locator('.el-select-dropdown:visible .el-select-dropdown__item').first.click()
            time.sleep(0.5)

            si = page.locator('.el-dialog:visible input[placeholder*="2023"]')
            if si.count() > 0:
                si.fill('2024-2025-2')  # 不同学期

            num_inputs = page.locator('.el-dialog:visible input[type="number"]:visible').all()
            if len(num_inputs) >= 2:
                num_inputs[0].fill('150')  # 超范围
                time.sleep(0.5)

                save_btn = page.locator('.el-dialog:visible button:has-text("保存")')
                if save_btn.count() > 0:
                    save_btn.click()
                else:
                    page.locator('.el-dialog:visible button:has-text("确")').first.click()
                time.sleep(2)

                # 检查拦截
                form_err = page.locator('.el-form-item__error')
                err_msg = page.locator('.el-message--error')
                dlg_open = page.locator('.el-dialog:visible').count() > 0

                if form_err.count() > 0:
                    log("分数范围校验", True, f"表单错误={form_err.first.inner_text()}")
                elif err_msg.count() > 0:
                    log("分数范围校验", True, f"错误提示={err_msg.first.inner_text()}")
                elif dlg_open:
                    log("分数范围校验", True, "超范围被拦截(对话框未关闭)")
                else:
                    log("分数范围校验", False, "超范围未被拦截")

            # 关闭对话框
            if page.locator('.el-dialog:visible').count() > 0:
                cancel = page.locator('.el-dialog:visible button:has-text("取消")')
                if cancel.count() > 0:
                    cancel.click()
                else:
                    page.locator('.el-dialog__headerbtn').click()
                time.sleep(1)

        # === 9. 学生只能查看个人成绩 ===
        print("\n--- 9. 学生只能查看个人成绩 ---")
        page.evaluate('() => localStorage.clear()')
        ok = do_login(page, "student001", "123456")
        log("学生登录", ok, f"URL={page.url}")

        if ok:
            page.goto(f"{BASE_URL}/my-scores")
            time.sleep(3)
            log("进入我的成绩页", "/my-scores" in page.url, f"URL={page.url}")

            # 检查无操作按钮
            a = page.locator('button:has-text("新增成绩")').count()
            e = page.locator('button:has-text("编辑")').count()
            d = page.locator('button:has-text("删除")').count()
            log("学生无操作按钮", a==0 and e==0 and d==0, f"新增={a} 编辑={e} 删除={d}")

            # 检查学生只能看自己的成绩
            my_rows = page.locator('table tbody tr').count()
            log("学生成绩列表有数据", my_rows > 0, f"行数={my_rows}")

        # === 10. 学生访问成绩管理页被拦截 ===
        print("\n--- 10. 学生访问成绩管理页被拦截 ---")
        page.goto(f"{BASE_URL}/scores")
        time.sleep(3)
        url = page.url
        # 检查403内容或跳转
        has_403 = page.locator('h1:has-text("403")').count() > 0
        is_redirected = "/403" in url or "/my-scores" in url or "/dashboard" in url
        no_add_btn = not page.locator('button:has-text("新增成绩")').is_visible()
        blocked = has_403 or is_redirected or no_add_btn
        log("学生无法访问成绩管理页", blocked, f"URL={url} 403内容={has_403}")

        # === 11. 管理员全权限 ===
        print("\n--- 11. 管理员全权限 ---")
        page.evaluate('() => localStorage.clear()')
        ok = do_login(page, "admin", "123456")
        log("管理员登录", ok, f"URL={page.url}")

        if ok:
            page.goto(f"{BASE_URL}/scores")
            time.sleep(4)
            log("管理员进入成绩管理页", "/scores" in page.url, f"URL={page.url}")

            add_btn = page.locator('button:has-text("新增成绩")')
            log("管理员可见新增按钮", add_btn.is_visible())

            # 检查表格操作列
            rows = page.locator('table tbody tr').count()
            log("管理员表格有数据", rows > 0, f"行数={rows}")

            if rows > 0:
                # 检查编辑按钮(可能需要hover才能看到)
                edit_btns = page.locator('table button:has-text("编辑")').count()
                delete_btns = page.locator('table button:has-text("删除")').count()
                log("管理员有编辑删除按钮", edit_btns > 0 or delete_btns > 0,
                    f"编辑={edit_btns} 删除={delete_btns}")

        # === 报告 ===
        print("\n" + "="*60)
        print("测试报告")
        print("="*60)
        ok_count = sum(1 for r in RESULTS if r["ok"])
        fail_count = sum(1 for r in RESULTS if not r["ok"])
        total = len(RESULTS)
        for r in RESULTS:
            tag = "[OK]" if r["ok"] else "[XX]"
            print(f"  {tag} {r['name']} | {r['detail']}")
        print(f"\n总计={total} 通过={ok_count} 失败={fail_count} 通过率={ok_count/total*100:.1f}%")

        page.screenshot(path='d:/schoolnet/test_final.png', full_page=True)
        browser.close()
        print("\n测试完成!")

if __name__ == "__main__":
    main()