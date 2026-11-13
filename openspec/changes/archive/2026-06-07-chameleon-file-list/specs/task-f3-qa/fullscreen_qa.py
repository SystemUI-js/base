import json
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError, sync_playwright


BASE_URL = "http://localhost:9074/"
OUT = Path(".omo/evidence/task-f3-qa")
SCREENSHOT = OUT / "screenshots"
SCREENSHOT.mkdir(parents=True, exist_ok=True)


def rect_js(selector):
    return """
    (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    }
    """


def rounded_rect(rect):
    return {k: round(v, 3) for k, v in rect.items()}


def close_enough(a, b, tolerance=1):
    return abs(a - b) <= tolerance


def same_rect(a, b, tolerance=1):
    return all(close_enough(a[k], b[k], tolerance) for k in ["left", "top", "width", "height"])


def frame_metrics(page):
    return page.evaluate(
        """
        () => {
          const screen = document.querySelector('.system-ui-js__screen');
          const frame = document.querySelector('[data-testid="window-frame"][data-system-ui-fullscreen="true"]')
            || document.querySelector('[data-testid="window-frame"]');
          const screenRect = screen.getBoundingClientRect();
          const frameRect = frame.getBoundingClientRect();
          const frameStyle = getComputedStyle(frame);
          return {
            screen: { left: screenRect.left, top: screenRect.top, width: screenRect.width, height: screenRect.height },
            frame: { left: frameRect.left, top: frameRect.top, width: frameRect.width, height: frameRect.height },
            relative: {
              left: frameRect.left - screenRect.left,
              top: frameRect.top - screenRect.top,
              width: frameRect.width,
              height: frameRect.height,
            },
            style: {
              position: frameStyle.position,
              left: frameStyle.left,
              top: frameStyle.top,
              right: frameStyle.right,
              bottom: frameStyle.bottom,
              width: frameStyle.width,
              height: frameStyle.height,
            },
            fullscreenAttr: frame.getAttribute('data-system-ui-fullscreen'),
            frameTestId: frame.getAttribute('data-testid'),
          };
        }
        """
    )


def active_frame_selector():
    return '[data-testid="window-frame"]'


def load_demo(page):
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_selector('.system-ui-js__screen')
    page.wait_for_selector('[data-testid="window-frame"]')


def click_fullscreen(page):
    page.get_by_label("全屏").click()
    page.wait_for_selector('[data-testid="window-frame"][data-system-ui-fullscreen="true"]')


def click_exit_fullscreen(page):
    page.get_by_label("退出全屏").click()
    page.wait_for_function("() => !document.querySelector('[data-system-ui-fullscreen=\"true\"]')")


def screenshot(page, name):
    path = SCREENSHOT / name
    page.screenshot(path=str(path), full_page=True)
    return str(path)


def title_center(page):
    return page.evaluate(
        """
        () => {
          const title = document.querySelector('[data-testid="window-title"]');
          const r = title.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        """
    )


def first_frame_rect(page):
    return page.evaluate(rect_js('[data-testid="window-frame"]'), '[data-testid="window-frame"]')


results = []
console_messages = []


def add_result(name, action, observed, passed, screenshot_path=None):
    results.append({
        "scenario": name,
        "action": action,
        "observed": observed,
        "pass": bool(passed),
        "screenshot": screenshot_path,
    })


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1200, "height": 900}, device_scale_factor=1)
    page.on("console", lambda msg: console_messages.append({"type": msg.type, "text": msg.text, "location": msg.location}))
    page.on("pageerror", lambda exc: console_messages.append({"type": "pageerror", "text": str(exc), "location": {}}))

    load_demo(page)
    initial_rect = rounded_rect(first_frame_rect(page))
    before_d_path = screenshot(page, "scenario-d-before-fullscreen.png")
    click_fullscreen(page)
    click_exit_fullscreen(page)
    restored_rect = rounded_rect(first_frame_rect(page))
    after_d_path = screenshot(page, "scenario-d-after-exit-fullscreen.png")
    add_result(
        "Scenario D — Exit fullscreen restores exact geometry",
        "Captured the initial normal window geometry, entered fullscreen, exited via the same toggle, then re-measured the frame.",
        {"initial_rect": initial_rect, "restored_rect": restored_rect, "before_screenshot": before_d_path, "after_screenshot": after_d_path},
        same_rect(initial_rect, restored_rect, tolerance=0.5),
        after_d_path,
    )

    load_demo(page)
    click_fullscreen(page)
    metrics_a = frame_metrics(page)
    a_pass = (
        metrics_a["fullscreenAttr"] == "true"
        and close_enough(metrics_a["relative"]["left"], 0, 0.5)
        and close_enough(metrics_a["relative"]["top"], 0, 0.5)
        and close_enough(metrics_a["relative"]["width"], metrics_a["screen"]["width"], 0.5)
        and close_enough(metrics_a["relative"]["height"], metrics_a["screen"]["height"], 0.5)
        and metrics_a["style"]["position"] == "absolute"
    )
    a_path = screenshot(page, "scenario-a-fullscreen-state.png")
    add_result(
        "Scenario A — Fullscreen fills screen container",
        "Opened the desktop demo, clicked the window fullscreen toggle, and compared the window frame rect to .system-ui-js__screen.",
        {"metrics": metrics_a},
        a_pass,
        a_path,
    )

    handles_count = page.locator('[data-testid^="window-resize-"]').count()
    cursor_samples = page.evaluate(
        """
        () => {
          const screen = document.querySelector('.system-ui-js__screen');
          const frame = document.querySelector('[data-testid="window-frame"][data-system-ui-fullscreen="true"]');
          const sr = screen.getBoundingClientRect();
          const points = [
            { name: 'left-edge', x: sr.left + 1, y: sr.top + sr.height / 2 },
            { name: 'right-edge', x: sr.right - 1, y: sr.top + sr.height / 2 },
            { name: 'top-edge', x: sr.left + sr.width / 2, y: sr.top + 1 },
            { name: 'bottom-edge', x: sr.left + sr.width / 2, y: sr.bottom - 1 },
            { name: 'bottom-right-corner', x: sr.right - 1, y: sr.bottom - 1 },
          ];
          return points.map(point => {
            const el = document.elementFromPoint(point.x, point.y);
            return {
              ...point,
              tag: el ? el.tagName : null,
              testid: el ? el.getAttribute('data-testid') : null,
              className: el ? String(el.className) : null,
              cursor: el ? getComputedStyle(el).cursor : null,
              isFrame: el === frame || Boolean(el && frame.contains(el)),
            };
          });
        }
        """
    )
    resize_cursor_values = {"e-resize", "w-resize", "n-resize", "s-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "col-resize", "row-resize"}
    b_pass = handles_count == 0 and all(sample["cursor"] not in resize_cursor_values for sample in cursor_samples)
    b_path = screenshot(page, "scenario-b-fullscreen-edge-no-handles.png")
    add_result(
        "Scenario B — Resize handles hidden in fullscreen",
        "While fullscreen, inspected resize-handle test IDs and sampled computed cursor at all screen/window edges.",
        {"resize_handle_count": handles_count, "cursor_samples": cursor_samples},
        b_pass,
        b_path,
    )

    before_drag = frame_metrics(page)
    c = title_center(page)
    page.mouse.move(c["x"], c["y"])
    page.mouse.down()
    page.mouse.move(c["x"] + 180, c["y"] + 140, steps=10)
    page.mouse.up()
    page.wait_for_timeout(250)
    after_drag = frame_metrics(page)
    c_pass = (
        close_enough(after_drag["relative"]["left"], 0, 0.5)
        and close_enough(after_drag["relative"]["top"], 0, 0.5)
        and close_enough(after_drag["relative"]["width"], after_drag["screen"]["width"], 0.5)
        and close_enough(after_drag["relative"]["height"], after_drag["screen"]["height"], 0.5)
        and same_rect(before_drag["relative"], after_drag["relative"], tolerance=0.5)
    )
    c_path = screenshot(page, "scenario-c-after-title-drag-attempt.png")
    add_result(
        "Scenario C — Title bar drag does NOT move fullscreen window",
        "Dragged the fullscreen title bar by approximately 180x140 pixels, then re-measured frame position and size relative to the screen container.",
        {"before_drag": before_drag, "after_drag": after_drag},
        c_pass,
        c_path,
    )

    load_demo(page)
    first_before_e = page.evaluate(rect_js('[data-testid="window-frame"]'), '[data-testid="window-frame"]')
    page.get_by_text("+", exact=True).first.click()
    page.wait_for_function("() => document.querySelectorAll('[data-testid=\"window-frame\"]').length >= 2")
    titles = page.locator('[data-testid="window-title"]')
    second_title_box = titles.nth(1).bounding_box()
    page.mouse.move(second_title_box["x"] + second_title_box["width"] / 2, second_title_box["y"] + second_title_box["height"] / 2)
    page.mouse.down()
    page.mouse.move(second_title_box["x"] + second_title_box["width"] / 2 + 220, second_title_box["y"] + second_title_box["height"] / 2 + 40, steps=10)
    page.mouse.up()
    page.wait_for_timeout(250)
    frames_before_fullscreen_e = page.evaluate(
        """
        () => Array.from(document.querySelectorAll('[data-testid="window-frame"]')).map((frame, index) => {
          const r = frame.getBoundingClientRect();
          return { index, left: r.left, top: r.top, width: r.width, height: r.height, fullscreen: frame.getAttribute('data-system-ui-fullscreen') };
        })
        """
    )
    page.get_by_label("全屏").last.click()
    page.wait_for_selector('[data-testid="window-frame"][data-system-ui-fullscreen="true"]')
    frames_after_fullscreen_e = page.evaluate(
        """
        () => Array.from(document.querySelectorAll('[data-testid="window-frame"]')).map((frame, index) => {
          const r = frame.getBoundingClientRect();
          return { index, left: r.left, top: r.top, width: r.width, height: r.height, fullscreen: frame.getAttribute('data-system-ui-fullscreen') };
        })
        """
    )
    fullscreen_count_e = sum(1 for frame in frames_after_fullscreen_e if frame["fullscreen"] == "true")
    normal_after_e = [frame for frame in frames_after_fullscreen_e if frame["fullscreen"] != "true"]
    normal_before_candidates = [frame for frame in frames_before_fullscreen_e if frame["fullscreen"] != "true"]
    unchanged_other = False
    if normal_after_e:
        other_after = normal_after_e[0]
        unchanged_other = any(same_rect(candidate, other_after, tolerance=0.5) for candidate in normal_before_candidates)
    e_pass = fullscreen_count_e == 1 and len(frames_after_fullscreen_e) == 2 and unchanged_other
    e_path = screenshot(page, "scenario-e-one-window-fullscreen-one-normal.png")
    add_result(
        "Scenario E — Multiple windows, only target goes fullscreen",
        "Opened a second demo window, dragged it side-by-side, fullscreened only the second/active window, then compared both frame rects.",
        {"before_fullscreen": frames_before_fullscreen_e, "after_fullscreen": frames_after_fullscreen_e, "fullscreen_count": fullscreen_count_e, "other_unchanged": unchanged_other, "initial_first_before_second_open": first_before_e},
        e_pass,
        e_path,
    )

    load_demo(page)
    click_fullscreen(page)
    close_error = None
    close_box = page.get_by_label("关闭").bounding_box()
    overlay_at_close = page.evaluate(
        """
        (box) => {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          const el = document.elementFromPoint(x, y);
          return el ? {
            tag: el.tagName,
            text: el.textContent,
            ariaLabel: el.getAttribute('aria-label'),
            className: String(el.className),
          } : null;
        }
        """,
        close_box,
    )
    try:
        page.get_by_label("关闭").click(timeout=3000)
        page.wait_for_function("() => document.querySelectorAll('[data-testid=\"window-frame\"]').length === 0", timeout=3000)
    except PlaywrightError as exc:
        close_error = str(exc)
    remaining_count = page.locator('[data-testid="window-frame"]').count()
    f_path = screenshot(page, "scenario-f-post-close-fullscreen-window.png")
    add_result(
        "Scenario F — Close button works on fullscreen window",
        "Entered fullscreen and clicked the title-bar close button.",
        {"remaining_window_frame_count": remaining_count, "close_button_box": close_box, "element_at_close_center": overlay_at_close, "click_error": close_error},
        close_error is None and remaining_count == 0,
        f_path,
    )

    error_like = [m for m in console_messages if m["type"] in ["error", "warning", "pageerror"]]
    g_path = screenshot(page, "scenario-g-final-console-clean-state.png")
    add_result(
        "Scenario G — No console errors throughout",
        "Captured browser console and pageerror events across all scenario runs.",
        {"console_messages": console_messages, "error_or_warning_messages": error_like},
        len(error_like) == 0,
        g_path,
    )

    browser.close()

verdict = "APPROVE" if all(item["pass"] for item in results) else "REJECT"
report = {"verdict": verdict, "base_url": BASE_URL, "results": results, "console_messages": console_messages}
(OUT / "qa-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

lines = [f"VERDICT: {verdict}", "", f"Base URL: {BASE_URL}", ""]
for item in results:
    lines.append(f"## {item['scenario']}")
    lines.append(f"Pass/Fail: {'PASS' if item['pass'] else 'FAIL'}")
    lines.append(f"Action taken: {item['action']}")
    lines.append(f"Observed result: `{json.dumps(item['observed'], ensure_ascii=False)}`")
    if item.get("screenshot"):
        lines.append(f"Screenshot: `{item['screenshot']}`")
    lines.append("")
lines.append(f"VERDICT: {verdict}")
(OUT / "qa-report.md").write_text("\n".join(lines), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
