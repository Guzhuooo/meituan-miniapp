/**
 * 应用入口。
 *
 * 真机约束（证据：jsfm-nvue.js launchApp / "TypeError: not a constructor"）：
 * 运行时会对 $falcon.__AppClazz 执行实例化，App 必须是构造函数。
 * 导出普通对象会导致启动失败 + 黑屏，因此这里导出 class。
 *
 * 结构对齐设备上正常运行的第三方应用：BasePage 负责
 * 页面生命周期转发（onShow/onHide/onUnload → $root）与资源释放。
 */

/** @type {any} */
const falcon = $falcon;
const FalconApp = falcon.App;
const FalconPage = falcon.Page;

class BasePage extends FalconPage {
  constructor() {
    super();
    /** @type {Set<any>} */
    this.timeoutTokens = new Set();
    /** @type {Set<any>} */
    this.intervalTokens = new Set();
    /** @type {any} */
    this.$root = null;
  }

  /**
   * @param {() => void} callback
   * @param {number} delay
   * @returns {any}
   */
  setTimeout(callback, delay) {
    const token = setTimeout(() => {
      this.timeoutTokens.delete(token);
      callback();
    }, delay);
    this.timeoutTokens.add(token);
    return token;
  }

  /** @param {any} token */
  clearTimeout(token) {
    clearTimeout(token);
    this.timeoutTokens.delete(token);
  }

  /**
   * @param {() => void} callback
   * @param {number} delay
   * @returns {any}
   */
  setInterval(callback, delay) {
    const token = setInterval(callback, delay);
    this.intervalTokens.add(token);
    return token;
  }

  /** @param {any} token */
  clearInterval(token) {
    clearInterval(token);
    this.intervalTokens.delete(token);
  }

  /**
   * @param {number} delay
   * @returns {Promise<void>}
   */
  sleep(delay) {
    return new Promise((resolve) => this.setTimeout(resolve, delay));
  }

  onShow() {
    super.onShow();
    if (this.$root && this.$root.onShow) this.$root.onShow();
  }

  onHide() {
    super.onHide();
    if (this.$root && this.$root.onHide) this.$root.onHide();
  }

  onUnload() {
    try {
      super.onUnload();
      if (this.$root && this.$root.onUnload) this.$root.onUnload();
    } finally {
      this.release();
    }
  }

  /** 释放本页所有 timer（幂等） */
  release() {
    for (const token of this.timeoutTokens) clearTimeout(token);
    for (const token of this.intervalTokens) clearInterval(token);
    this.timeoutTokens.clear();
    this.intervalTokens.clear();
  }
}

class App extends FalconApp {
  constructor() {
    super();
  }

  /** @param {unknown} [options] */
  onLaunch(options) {
    super.onLaunch(options);
    // 注意：viewPort 宽度需先用真机探针页验证 vh/vw 行为后再决定是否设置，
    // 当前不设置，避免未经验证的猜测尺寸（设备默认坐标即真机坐标系）。
    falcon.useDefaultBasePageClass(BasePage);
  }

  onShow() {
    super.onShow();
  }

  onHide() {
    super.onHide();
  }

  onDestroy() {
    super.onDestroy();
  }
}

export default App;
