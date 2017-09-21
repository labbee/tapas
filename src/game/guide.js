// 操作指南

export default {
    container: new PIXI.Container(),
    init(game) {
        this.textures = game.textures
        this.audios = game.audios

        this.addBkg()
        this.addPlane()
        this.addTicker()

        this.listen()


        return this
    },

    addBkg() {
        this.bkg = new PIXI.Sprite(this.textures['background.png'])
        const ratio = this.bkg.width / this.bkg.height

        if (ratio > window.design.ratio) this.bkg.scale.set(window.design.width / this.bkg.width)
        else this.bkg.scale.set(window.design.height / this.bkg.height)

        this.container.addChild(this.bkg)
    },

    addPlane() {
        this.plane = new PIXI.extras.AnimatedSprite([
            this.textures['planeRed1.png'],
            this.textures['planeRed2.png'],
            this.textures['planeRed3.png'],
        ])

        this.plane.animationSpeed = .5
        this.plane.play()
        this.plane.anchor.set(.5)
        this.plane.position.set(250, window.design.height >> 1)

        const puff = new PIXI.extras.AnimatedSprite([
            this.textures['puffLarge.png'],
            this.textures['puffSmall.png']
        ])

        puff.anchor.set(.5)
        puff.position.set(-this.plane.width / 2 - 15, 10)
        puff.animationSpeed = 1.5
        puff.play()

        this.plane.addChild(puff)

        this.container.addChild(this.plane)
    },

    addTicker() {
        this.ticker = new PIXI.extras.AnimatedSprite([
            this.textures['tap.png'],
            this.textures['tapTick.png']
        ])

        this.ticker.animationSpeed = 1.8
        this.ticker.play()
        this.ticker.anchor.set(.5)
        this.ticker.position.set(window.design.width >> 1, window.design.height >> 1)

        this.container.addChild(this.ticker)
    },

    tap() {
        this.audios.jump.play()
    },

    listen() {
        const ok = window.hasOwnProperty('onpointerdown')
        this.bkg.interactive = true
        ok ? this.bkg.on('pointerdown', this.tap.bind(this)) :
            this.bkg.on('touchstart', this.tap.bind(this))
    }

}