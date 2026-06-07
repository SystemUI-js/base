# F3 Re-Verification QA Report

- Browser: headless Chromium via Playwright
- Viewport: 1200x900
- URL: http://127.0.0.1:9074
- Console log: `.omo/evidence/task-f3-reverify/console.log`
- Screenshots: `.omo/evidence/task-f3-reverify/screenshots/`

## Scenario Verdicts

### Scenario A: Fullscreen fills container — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-a.png`
- Details:
```json
{
  "frame": {
    "x": 0.0,
    "y": 0.0,
    "width": 1200.0,
    "height": 900.0
  },
  "screen": {
    "x": 0.0,
    "y": 0.0,
    "width": 1200.0,
    "height": 900.0
  }
}
```

### Scenario B: Resize handles hidden — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-b.png`
- Details:
```json
{
  "resizeHandleCount": 0
}
```

### Scenario C: Drag does not move fullscreen window — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-c.png`
- Details:
```json
{
  "before": {
    "x": 0.0,
    "y": 0.0,
    "width": 1200.0,
    "height": 900.0
  },
  "after": {
    "x": 0.0,
    "y": 0.0,
    "width": 1200.0,
    "height": 900.0
  }
}
```

### Scenario D: Exact geometry restore — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-d.png`
- Details:
```json
{
  "initial": {
    "x": 30.0,
    "y": 30.0,
    "width": 400.0,
    "height": 300.0
  },
  "fullscreen": {
    "x": 0.0,
    "y": 0.0,
    "width": 1200.0,
    "height": 900.0
  },
  "restored": {
    "x": 30.0,
    "y": 30.0,
    "width": 400.0,
    "height": 300.0
  }
}
```

### Scenario E: Only target window affected — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-e.png`
- Details:
```json
{
  "otherBefore": {
    "x": 60.0,
    "y": 60.0,
    "width": 400.0,
    "height": 300.0
  },
  "otherAfter": {
    "x": 60.0,
    "y": 60.0,
    "width": 400.0,
    "height": 300.0
  },
  "fullscreenWindowTextIncludes": "Demo Window"
}
```

### Scenario F: Close button works in fullscreen — PASS

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-f.png`
- Details:
```json
{
  "windowCountBefore": 1,
  "windowCountAfter": 0
}
```

### Scenario G: Console clean — FAIL

- Screenshot: `.omo/evidence/task-f3-reverify/screenshots/scenario-g.png`
- Details:
```json
{
  "consoleEventCount": 43,
  "reactProblemEventCount": 1,
  "reactProblemEvents": [
    {
      "type": "error",
      "text": "React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element. screenId screenid"
    }
  ]
}
```

## Formal Verdict: REJECT
