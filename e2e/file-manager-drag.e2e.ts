/**
 * E2E：FileManager 拖拽移动行为
 *
 * 覆盖：
 *  1. Happy path —— 把文件拖入文件夹后，目标文件夹内部出现该文件，
 *     原目录不再展示。
 *  2. Invalid path —— 把文件拖到「另一个文件」上（target 不是目录），
 *     根目录中两个文件仍然存在，没有被移动。
 *
 * 注意：
 *  - 使用手动 pointer 序列（mouse.move → mouse.down → 多段 move → mouse.up），
 *    因为 CList 的 HTML5 drag 事件在 Playwright 中通过 `locator.dragTo()`
 *    并不稳定；纯鼠标序列足够触发 React DnD 拖拽守卫。
 *  - 演示页使用 IndexedDB 持久化，需要在每次测试前清空 `FileSystemDB`，
 *    否则前一次运行的目录残留会污染断言。
 */

import { test, expect, type Page, type Locator } from '@playwright/test'

/** 演示页 IndexedDB 数据库名（来自 @system-ui-js/file-system-browser-workspace/packages/core/src/db.ts）*/
const DB_NAME = 'FileSystemDB'

/**
 * 在每次导航前清空 IndexedDB，保证 demo 文件系统从空根目录开始。
 * 必须使用 addInitScript：它在每个 frame 的脚本运行前注入，
 * 能保证 IndexedDB 在 React 组件挂载并写入之前被清掉。
 */
async function resetIndexedDB(page: Page): Promise<void> {
  await page.addInitScript((dbName) => {
    // 异步删除，但不 await —— 浏览器内部对同一个 db 的 open 会排在 delete 之后
    try {
      indexedDB.deleteDatabase(dbName)
    } catch {
      /* ignore */
    }
  }, DB_NAME)
}

/** 打开「文件浏览器」窗口并等待 FileManager 渲染就绪。 */
async function openFileBrowser(page: Page): Promise<void> {
  await page.getByRole('button', { name: '打开文件浏览器' }).click()
  // 等待路径标签出现，意味着 FileBrowserWindow 已挂载
  await expect(page.getByText('当前路径: /')).toBeVisible()
  // 等待 FileManager 进入「目录为空」或显示真实条目，避免在加载中态触发交互
  await expect(page.locator('.system-ui-js__file-manager')).toBeVisible()
}

/**
 * 通过 demo 顶栏的「新建文件夹」按钮创建一个文件夹。
 * 该按钮使用 window.prompt，需要在弹出前注册 dialog 处理器。
 */
async function createFolder(page: Page, name: string): Promise<void> {
  page.once('dialog', (dialog) => {
    void dialog.accept(name)
  })
  await page.getByRole('button', { name: '新建文件夹' }).click()
  await expect(getEntryItem(page, name)).toBeVisible()
}

/**
 * 通过 demo 顶栏的「上传」按钮把一段内存中的文本写入当前目录。
 * 演示页隐藏的 <input type="file"> 接受任意文件，这里用 Playwright 的
 * setInputFiles 直接喂数据，无需真实磁盘文件。
 */
async function uploadFile(page: Page, name: string, content: string): Promise<void> {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name,
    mimeType: 'text/plain',
    buffer: Buffer.from(content, 'utf-8'),
  })
  await expect(getEntryItem(page, name)).toBeVisible()
}

/**
 * 通过条目内文本定位 CList 中的某个 item 元素。
 * CList 把每个条目包成 .cm-list__item，文件名出现在内部 span 上。
 */
function getEntryItem(page: Page, name: string): Locator {
  return page.locator('.cm-list__item', { hasText: name }).first()
}

/**
 * 手动 pointer 拖拽：source → target。
 * 不依赖 locator.dragTo()，因为 HTML5 dragstart/dragover 在 Playwright Chromium
 * 中需要真实指针事件序列才能稳定触发 React DnD 内部状态机。
 */
async function manualDrag(page: Page, source: Locator, target: Locator): Promise<void> {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) {
    throw new Error('Source or target element is not visible / has no bounding box')
  }

  const sx = sourceBox.x + sourceBox.width / 2
  const sy = sourceBox.y + sourceBox.height / 2
  const tx = targetBox.x + targetBox.width / 2
  const ty = targetBox.y + targetBox.height / 2

  // 1) hover 让源被识别为拖拽起点
  await source.hover()
  // 2) 按下鼠标
  await page.mouse.down()
  // 3) 多段微小移动以触发 dragstart（Chromium 需要超过最小阈值的移动）
  await page.mouse.move(sx + 5, sy + 5, { steps: 5 })
  await page.mouse.move((sx + tx) / 2, (sy + ty) / 2, { steps: 10 })
  // 4) 移到目标上，再 hover 一次确保 dragover 被识别
  await page.mouse.move(tx, ty, { steps: 10 })
  await target.hover()
  // 5) 释放鼠标完成 drop
  await page.mouse.up()
}

test.describe('FileManager 拖拽移动', () => {
  test.beforeEach(async ({ page }) => {
    await resetIndexedDB(page)
    await page.goto('/')
    await openFileBrowser(page)
  })

  test('happy path：把文件拖入文件夹后，文件出现在目标文件夹内', async ({ page }) => {
    const folderName = 'target-folder'
    const fileName = 'dragme.txt'

    await createFolder(page, folderName)
    await uploadFile(page, fileName, 'hello drag world')

    // 拖：dragme.txt → target-folder
    const source = getEntryItem(page, fileName)
    const target = getEntryItem(page, folderName)
    await manualDrag(page, source, target)

    // 拖完后根目录里 dragme.txt 应该消失；用 waitFor 容忍 rename + setState 的异步刷新
    await expect(getEntryItem(page, fileName)).toHaveCount(0, { timeout: 5000 })

    // 进入 target-folder（双击触发 onItemDoubleClick → onPathChange）
    await target.dblclick()
    await expect(page.getByText(`当前路径: /${folderName}`)).toBeVisible()

    // 断言 dragme.txt 出现在新目录里
    await expect(getEntryItem(page, fileName)).toBeVisible()
  })

  test('invalid path：拖到另一个文件上时，原文件保留在原目录', async ({ page }) => {
    const fileA = 'file-a.txt'
    const fileB = 'file-b.txt'

    await uploadFile(page, fileA, 'aaa')
    await uploadFile(page, fileB, 'bbb')

    // 拖 file-a.txt 到 file-b.txt（target 不是目录）
    const source = getEntryItem(page, fileA)
    const target = getEntryItem(page, fileB)
    await manualDrag(page, source, target)

    // demo 端 onMoveError 会写出「移动失败」红字；存在与否取决于 DnD 是否真的触发到 handler
    // 这里不强断言提示文本，只强断言「两个文件都还在根目录」
    // —— 即没有发生移动，行为符合 invalid-target 守卫。
    await expect(getEntryItem(page, fileA)).toBeVisible()
    await expect(getEntryItem(page, fileB)).toBeVisible()

    // 路径未发生变化
    await expect(page.getByText('当前路径: /')).toBeVisible()
  })
})
