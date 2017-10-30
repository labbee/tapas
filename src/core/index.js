import './plugins'

const app = new PIXI.Application({
    width: design.width,
    height: design.height
})

function resize() {
    const screen = {
        w: window.innerWidth,
        h: window.innerHeight
    }

    const ratio = {}

    if (screen.w / screen.h >= 1) {
        // 宽屏
        design.angle = 0
        ratio.w = screen.w / design.width
        ratio.h = screen.h / design.height
    } else {
        // 窄屏 (canvas 旋转 90° w <=> h)
        design.angle = 90
        ratio.w = screen.w / design.height,
        ratio.h = screen.h / design.width
    }

    let w, h
    if (ratio.w >= ratio.h) {
        w = design.width * ratio.h
        h = design.height * ratio.h
    } else {
        w = design.width * ratio.w
        h = design.height * ratio.w
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