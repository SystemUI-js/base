# Draft: CSelect and CList Menu Upgrade

## Requirements (confirmed)
- User request: "CSelect 组件的下拉菜单不使用原生的，而是使用 CMenu 组件作为下拉菜单。"
- User request: "CList 组件增加 type props，可选值 参考 文件浏览器的列表，比如单列列表，双列列表，图标"
- User request: "增加 iconSize props"
- User request: "增加 是否可移动选项 draggable"
- User request: "增加 onItemDrag props"
- User request: "增加 onItemClick props"
- User request: "增加 onItemHover props"
- User request: "增加 onItemDoubleClick props"
- User request: "增加 onItemDragInto props 意思是一个 Item 拖动到另一个 Item 上"
- User request: "增加排序方式"
- User request: "增加懒加载能力"

## Technical Decisions
- Planning mode only: produce a decision-complete implementation plan, not source changes.
- Package manager constraint: use `yarn` only for any planned commands.
- Spec-driven context: OpenSpec is present; plan should reference existing specs and recommend OpenSpec workflow where appropriate.

## Research Findings
- Pending: component implementation patterns from explore agent.
- Pending: test/build/QA infrastructure from explore agent.
- Pending: OpenSpec active/relevant change context from explore agent.

## Open Questions
- Confirm exact `CList.type` values and semantics: single-column, double-column, icon/grid.
- Confirm sorting API ownership: component sorts internally vs parent passes sorted items.
- Confirm lazy-loading trigger: scroll-bottom/infinite list vs item virtualization vs explicit load-more.

## Scope Boundaries
- INCLUDE: `CSelect` dropdown integration with `CMenu`.
- INCLUDE: `CList` props/types/events for file-browser-like layouts and item interactions.
- INCLUDE: tests/demo/docs tasks if existing infrastructure supports them.
- EXCLUDE: Source implementation during planning session.
