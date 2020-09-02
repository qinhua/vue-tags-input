const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const iPhone = devices["iPhone 7"];

/* 浏览器配置 */
const browserConfig = {
  headless: false, //是否启用无头模式（无UI模式）
  // slowMo: 1000,//慢动作
  ignoreHTTPSErrors: true, //忽略https错误提示
  executablePath: "./test/chrome/chrome.exe"//chrome路径
};
/* 窗口配置 */
const viewConfig = {
  width: 375,//屏幕宽度
  height: 667,//屏幕高度
  deviceScaleFactor: 1,//缩放比例
  isMobile: true,//是否是移动设备
  hasTouch: true,//是否支持touch事件
  isLandscape: false//是否横屏
};
/* const showTips = () => {
  return new Promise((resolve, reject) => {
    var ele = document.createElement('h2');
    ele.setAttribute("style", "position:fixed;left:50%;top:50%;transform:translate3d(-50%,-50%,0);text-align:center;padding:10px;font-size:16px;color:#fff;background:rgba(0,0,0,0.5)");
    ele.innerHTML = '测试已经结束，浏览器将在3s内关闭';
    document.body.appendChild(ele);
  })
}; */

/* 启动Puppeteer */
puppeteer.launch(browserConfig).then(async browser => {
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: true
  })
  await page.goto("http://localhost:3000");
  console.log(">> 进入页面");

  /* 测试1：添加标签 */
  await page.waitFor(1000);
  await page.type(".addTag", "精灵4pro", { delay: 100 });
  await page.keyboard.down("Enter");
  await page.waitFor(1000);
  await page.type(".addTag", "MavicPro", { delay: 100 });
  await page.keyboard.down("Enter");
  await page.waitFor(1000);
  await page.type(".addTag", "Inspire2", { delay: 100 });
  await page.keyboard.down("Enter");

  /* 添加完毕，截图 */
  await page.screenshot({ path: "./test/puppeteer/capture/snapshot-add.png" });
  await page.waitFor(2000);

  /* 测试2：标签拖拽排序 */
  // const item = await page.$(".tags-list > .t-item:nth-child(1)");
  // const boundingBox = await item.boundingBox();
  // await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
  // await page.mouse.down();
  // await page.mouse.move((boundingBox.x + boundingBox.width / 2) * 2, boundingBox.y + boundingBox.height / 2, { steps: 500 });
  // await page.mouse.up();
  // /* 排序完毕，截图 */
  // await page.screenshot({ path: "./test/puppeteer/capture/snapshot-sort.png" });

  /* 测试3：删除标签 */
  await page.click(".t-del");
  await page.click(".t-del");
  await page.click(".t-del");
  /* 删除完毕，截图 */
  await page.screenshot({ path: "./test/puppeteer/capture/snapshot-del.png" });

  /* 测试结束，关闭窗口 */
  /* await page.evaluate(el => {
    //如果需要赋值要返回Promise
    return new Promise((resolve, reject) => {
      console.log(el)
      //可以用Dom api啦 
      try {
        reslove(el)
      } catch (error) {
        reject()
      }
    })
  }); */
  page.setContent('<div style="position: fixed;left: 50%;top: 50%; transform: translate3d(-50%, -50%, 0);text-align: center; padding: 10px;font-size: 16px; color: #fff; background: rgba(0, 0, 0, 0.5); border-radius: 3px;">测试已经结束，浏览器将在3s内关闭</div>')
  await page.waitFor(3000);
  console.log("测试结束，关闭窗口 >>");
  browser.close();
})

