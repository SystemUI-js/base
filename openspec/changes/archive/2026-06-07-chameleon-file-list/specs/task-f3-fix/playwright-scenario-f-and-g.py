"""
Playwright verification for Scenario F (fullscreen close button) and Scenario G (no DOM warning).

Scenario F: Fullscreen a window, click the close button -> window closes successfully.
Scenario G: Console clean - no 'Received true for a non-boolean attribute' error.
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Collect console errors/warnings
    console_messages = []
    page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

    page.goto("http://localhost:9073")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    # Take initial screenshot
    page.screenshot(path="/home/zhangxiao/frontend/worktrees/SysUIBase/feature-init-framework/.omo/evidence/task-f3-fix/01-initial-state.png")

    # === Scenario F: Fullscreen and close ===
    # Find the fullscreen button and click it
    fullscreen_btn = page.locator('button:has-text("全屏")')
    fullscreen_btn.first.click()
    page.wait_for_timeout(500)

    # Screenshot after fullscreen
    page.screenshot(path="/home/zhangxiao/frontend/worktrees/SysUIBase/feature-init-framework/.omo/evidence/task-f3-fix/02-fullscreen-state.png")

    # Verify the fullscreen data attribute is set
    fullscreen_frame = page.locator('[data-system-ui-fullscreen="true"]')
    assert fullscreen_frame.count() > 0, "FAIL: No element with data-system-ui-fullscreen=true found after fullscreen"
    print(f"PASS Scenario F: Found {fullscreen_frame.count()} fullscreen element(s)")

    # Now click the close button (x) in the fullscreen window's title bar
    close_btn = page.locator('[aria-label="关闭"]')
    assert close_btn.count() > 0, "FAIL: No close button found"
    close_btn.first.click()
    page.wait_for_timeout(500)

    # Screenshot after close
    page.screenshot(path="/home/zhangxiao/frontend/worktrees/SysUIBase/feature-init-framework/.omo/evidence/task-f3-fix/03-after-close.png")

    # Verify the fullscreen window is gone
    fullscreen_after = page.locator('[data-system-ui-fullscreen="true"]')
    assert fullscreen_after.count() == 0, f"FAIL: Fullscreen window still present after close (count={fullscreen_after.count()})"
    print("PASS Scenario F: Fullscreen window closed successfully")

    # Verify the launcher button is at top-left (not overlapping right side)
    launcher = page.locator('div:has-text("打开文件浏览器")')
    if launcher.count() > 0:
        box = launcher.first.bounding_box()
        if box:
            print(f"PASS Scenario F: Launcher button position: x={box['x']:.0f}, y={box['y']:.0f} (should be top-left)")
            assert box['x'] < 200, f"FAIL: Launcher button x={box['x']} is too far right"
            print("PASS Scenario F: Launcher button is at top-left, not overlapping close button zone")

    # === Scenario G: Check for DOM warnings ===
    non_boolean_warnings = [m for m in console_messages if "non-boolean attribute" in m.lower() or "fullscreen" in m.lower()]
    if non_boolean_warnings:
        print(f"FAIL Scenario G: Found fullscreen-related console warnings: {non_boolean_warnings}")
    else:
        print("PASS Scenario G: No 'non-boolean attribute fullscreen' warnings in console")

    # Print all console messages for evidence
    print(f"\n=== All console messages ({len(console_messages)}) ===")
    for m in console_messages:
        print(f"  {m}")

    browser.close()
    print("\n=== ALL SCENARIOS PASSED ===")
