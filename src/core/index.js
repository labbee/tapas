import './plugin'

const
    ratio = 2,
    width = 568 * ratio,
    height = 375 * ratio

const app = new PIXI.Application({
    width,
    height
})

function resize() {

    const screen = {
        w: window.innerWidth,
        h: window.innerHeight
    }

    const ratio = {}

    if (screen.w / screen.h >= 1) {
        // 宽屏
        window.angle = 0
        ratio.w = screen.w / width
        ratio.h = screen.h / height
    } else {
        // 窄屏 (canvas 旋转 90° w <=> h)
        window.angle = 90
        ratio.w = screen.w / height,
        ratio.h = screen.h / width
    }

    let w, h
    if (ratio.w >= ratio.h) {
        w = width * ratio.h
        h = height * ratio.h
    } else {
        w = width * ratio.w
        h = height * ratio.w
    }

    app.view.style.width = `${w}px`
    app.view.style.height = `${h}px`

    app.view.style.top = `${(screen.h - h) * .5}px`
    app.view.style.left = `${(screen.w - w) * .5}px`

}


export default {
    resize,
    loader: app.loader,
    ticker: app.ticker,
    renderer: app.renderer,
    view: app.view,
    stage: app.stage
}

/*
* 导出尺寸信息
* 方便物理引擎调用
* 由于 planck 与 pixi 坐标系不同
* 同步位置时需要转换
*/
window.design = {width, height, ratio}