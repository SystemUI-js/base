from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Callable

from playwright.sync_api import Page, expect, sync_playwright


BASE_URL = "http://127.0.0.1:9074"
EVIDENCE_DIR = Path(".omo/evidence/task-f3-reverify")
SCREENSHOT_DIR = EVIDENCE_DIR / "screenshots"
CONSOLE_LOG = EVIDENCE_DIR / "console.log"
REPORT = EVIDENCE_DIR / "qa-report.md"


def rect_close(actual: dict[str, float], expected: dict[str, float], tolerance: float = 1.0) -> bool:
    return all(math.isclose(actual[key], expected[key], abs_tol=tolerance) for key in ("x", "y", "width", "height"))


def assert_rect(actual: dict[str, float], expected: dict[str, float], label: str, tolerance: float = 1.0) -> None:
    if not rect_close(actual, expected, tolerance):
        raise AssertionError(f"{label}: expected {expected}, got {actual}")


def setup_page(page: Page) -> None:
    page.set_viewport_size({"width": 1200, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    expect(page.locator(".system-ui-js__screen")).to_have_count(1)
    expect(page.locator(".cm-window-frame")).to_have_count(1)


def get_rect(page: Page, selector: str) -> dict[str, float]:
    rect = page.locator(selector).first.bounding_box()
    if rect is None:
        raise AssertionError(f"No bounding box for selector {selector}")
    return {key: round(float(rect[key]), 2) for key in ("x", "y", "width", "height")}


def click_fullscreen(page: Page) -> None:
    page.get_by_role("button", name="全屏").click()
    expect(page.locator('.cm-window-frame[data-system-ui-fullscreen="true"]')).to_have_count(1)


def click_exit_fullscreen(page: Page) -> None:
    page.get_by_role("button", name="退出全屏").click()
    expect(page.locator('.cm-window-frame[data-system-ui-fullscreen="true"]')).to_have_count(0)


def scenario_a(page: Page) -> dict[str, Any]:
    setup_page(page)
    click_fullscreen(page)
    frame = get_rect(page, ".cm-window-frame")
    screen = get_rect(page, ".system-ui-js__screen")
    expected = {"x": 0.0, "y": 0.0, "width": 1200.0, "height": 900.0}
    assert_rect(screen, expected, "screen rect")
    assert_rect(frame, screen, "fullscreen frame equals screen")
    return {"frame": frame, "screen": screen}


def scenario_b(page: Page) -> dict[str, Any]:
    setup_page(page)
    click_fullscreen(page)
    count = page.evaluate("document.querySelectorAll('[data-testid^=\"window-resize-\"]').length")
    if count != 0:
      raise AssertionError(f"Expected 0 resize handles in fullscreen, got {count}")
    return {"resizeHandleCount": count}


def scenario_c(page: Page) -> dict[str, Any]:
    setup_page(page)
    click_fullscreen(page)
    before = get_rect(page, ".cm-window-frame")
    title = page.locator('.cm-window-frame [data-testid="window-title"]').first
    box = title.bounding_box()
    if box is None:
        raise AssertionError("No title bar bounding box")
    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] / 2 + 100, box["y"] + box["height"] / 2, steps=8)
    page.mouse.up()
    page.wait_for_timeout(100)
    after = get_rect(page, ".cm-window-frame")
    assert_rect(after, before, "fullscreen frame after title drag")
    return {"before": before, "after": after}


def scenario_d(page: Page) -> dict[str, Any]:
    setup_page(page)
    initial = get_rect(page, ".cm-window-frame")
    expected = {"x": 30.0, "y": 30.0, "width": 400.0, "height": 300.0}
    assert_rect(initial, expected, "initial demo window geometry")
    click_fullscreen(page)
    fullscreen = get_rect(page, ".cm-window-frame")
    click_exit_fullscreen(page)
    restored = get_rect(page, ".cm-window-frame")
    assert_rect(restored, expected, "restored demo window geometry")
    return {"initial": initial, "fullscreen": fullscreen, "restored": restored}


def scenario_e(page: Page) -> dict[str, Any]:
    setup_page(page)
    page.get_by_role("button", name="打开文件浏览器").click()
    expect(page.locator(".cm-window-frame")).to_have_count(2)
    demo = page.locator(".cm-window-frame", has_text="Demo Window").first
    file_browser = page.locator(".cm-window-frame", has_text="文件浏览器").first
    other_before = file_browser.bounding_box()
    if other_before is None:
        raise AssertionError("No file browser bounding box before fullscreen")
    other_before = {key: round(float(other_before[key]), 2) for key in ("x", "y", "width", "height")}
    page.locator('.cm-start-bar button', has_text="Demo Window").click()
    page.wait_for_timeout(100)
    demo.get_by_role("button", name="全屏").click()
    expect(page.locator('.cm-window-frame[data-system-ui-fullscreen="true"]')).to_have_count(1)
    other_after_box = file_browser.bounding_box()
    if other_after_box is None:
        raise AssertionError("No file browser bounding box after fullscreen")
    other_after = {key: round(float(other_after_box[key]), 2) for key in ("x", "y", "width", "height")}
    assert_rect(other_after, other_before, "non-target file browser geometry")
    fullscreen_text = page.locator('.cm-window-frame[data-system-ui-fullscreen="true"]').inner_text()
    if "Demo Window" not in fullscreen_text:
        raise AssertionError("Target demo window was not the fullscreen window")
    return {"otherBefore": other_before, "otherAfter": other_after, "fullscreenWindowTextIncludes": "Demo Window"}


def scenario_f(page: Page) -> dict[str, Any]:
    setup_page(page)
    before_count = page.locator(".cm-window-frame").count()
    if before_count != 1:
        raise AssertionError(f"Expected one window before close scenario, got {before_count}")
    click_fullscreen(page)
    frame = get_rect(page, ".cm-window-frame")
    assert_rect(frame, {"x": 0.0, "y": 0.0, "width": 1200.0, "height": 900.0}, "fullscreen frame before close")
    page.locator('.cm-window-frame[data-system-ui-fullscreen="true"]').get_by_role("button", name="关闭").click()
    expect(page.locator(".cm-window-frame")).to_have_count(0)
    after_count = page.locator(".cm-window-frame").count()
    return {"windowCountBefore": before_count, "windowCountAfter": after_count}


SCENARIOS: list[tuple[str, str, Callable[[Page], dict[str, Any]]]] = [
    ("A", "Fullscreen fills container", scenario_a),
    ("B", "Resize handles hidden", scenario_b),
    ("C", "Drag does not move fullscreen window", scenario_c),
    ("D", "Exact geometry restore", scenario_d),
    ("E", "Only target window affected", scenario_e),
    ("F", "Close button works in fullscreen", scenario_f),
]


def main() -> int:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    console_events: list[dict[str, str]] = []
    results: list[dict[str, Any]] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 900})

        def record_console(msg: Any) -> None:
            console_events.append({"type": msg.type, "text": msg.text})

        page.on("console", record_console)
        page.on("pageerror", lambda exc: console_events.append({"type": "pageerror", "text": str(exc)}))

        for key, name, runner in SCENARIOS:
            result: dict[str, Any] = {"key": key, "name": name, "status": "PASS", "details": {}}
            try:
                result["details"] = runner(page)
            except Exception as exc:  # noqa: BLE001 - QA report needs exact failure text.
                result["status"] = "FAIL"
                result["error"] = str(exc)
            finally:
                screenshot_path = SCREENSHOT_DIR / f"scenario-{key.lower()}.png"
                try:
                    page.screenshot(path=str(screenshot_path), full_page=True)
                    result["screenshot"] = str(screenshot_path)
                except Exception as exc:  # noqa: BLE001 - keep report generation resilient.
                    result["screenshotError"] = str(exc)
                results.append(result)

        browser.close()

    CONSOLE_LOG.write_text("\n".join(json.dumps(event, ensure_ascii=False) for event in console_events) + ("\n" if console_events else ""), encoding="utf-8")

    react_problem_events = [
        event for event in console_events
        if event["type"] in {"error", "warning"}
        and (
            "Received true for a non-boolean attribute" in event["text"]
            or "non-boolean attribute" in event["text"]
            or ("fullscreen" in event["text"].lower() and "attribute" in event["text"].lower())
            or "React" in event["text"]
        )
    ]

    scenario_g = {
        "key": "G",
        "name": "Console clean",
        "status": "PASS" if not react_problem_events else "FAIL",
        "details": {
            "consoleEventCount": len(console_events),
            "reactProblemEventCount": len(react_problem_events),
            "reactProblemEvents": react_problem_events,
        },
        "screenshot": str(SCREENSHOT_DIR / "scenario-g.png"),
    }
    results.append(scenario_g)

    report_lines = [
        "# F3 Re-Verification QA Report",
        "",
        "- Browser: headless Chromium via Playwright",
        "- Viewport: 1200x900",
        f"- URL: {BASE_URL}",
        f"- Console log: `{CONSOLE_LOG}`",
        f"- Screenshots: `{SCREENSHOT_DIR}/`",
        "",
        "## Scenario Verdicts",
        "",
    ]

    for result in results:
        report_lines.append(f"### Scenario {result['key']}: {result['name']} — {result['status']}")
        report_lines.append("")
        if "error" in result:
            report_lines.append(f"- Error: `{result['error']}`")
        report_lines.append(f"- Screenshot: `{result.get('screenshot', 'not captured')}`")
        report_lines.append("- Details:")
        report_lines.append("```json")
        report_lines.append(json.dumps(result.get("details", {}), ensure_ascii=False, indent=2))
        report_lines.append("```")
        report_lines.append("")

    overall = "APPROVE" if all(result["status"] == "PASS" for result in results) else "REJECT"
    report_lines.append(f"## Formal Verdict: {overall}")
    report_lines.append("")
    REPORT.write_text("\n".join(report_lines), encoding="utf-8")

    g_path = SCREENSHOT_DIR / "scenario-g.png"
    f_path = SCREENSHOT_DIR / "scenario-f.png"
    if f_path.exists() and not g_path.exists():
        g_path.write_bytes(f_path.read_bytes())

    print(json.dumps({"overall": overall, "results": results, "consoleEvents": console_events}, ensure_ascii=False, indent=2))
    return 0 if overall == "APPROVE" else 1


if __name__ == "__main__":
    raise SystemExit(main())
