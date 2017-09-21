// 操作指南

export default {
    container: new PIXI.Container(),

    init(game) {
        this.textures = game.textures
        this.audios = game.audios
        this.stage = game.core.stage
        this.stage.addChild(this.container)

        this.addNum()
        this.addTapTicker()

        return this
    },

    addNum() {
        this.num = new PIXI.extras.AnimatedSprite([
            this.textures['number3.png'],
            this.textures['number2.png'],
            this.textures['number1.png'],
            this.textures['textGetReady.png']
        ])

        this.num.anchor.set(.5)
        this.num.position.set(window.design.width >> 1, window.design.height >> 1)

        this.container.addChild(this.num)
    },

    addTapTicker() {
        this.tapTicker = new PIXI.extras.AnimatedSprite([
            this.textures['tap.png'],
            this.textures['tapTick.png']
        ])

        this.tapTicker.animationSpeed = 1.8
        this.tapTicker.play()
        this.tapTicker.anchor.set(.5)
        this.tapTicker.position.set(window.design.width * .6, window.design.height >> 1)

        this.container.addChild(this.tapTicker)
    },

    play(i=0) {
        switch (i) {
            case 0: {
                this.audios.three.play()
                break
            }

            case 1: {
                this.audios.two.play()
                break
            }

            case 2: {
                this.audios.one.play()
                break
            }

            case 3: {
                this.audios.ready.play()
                break
            }

            default: {
                this.tapTicker.visible = false
                this.audios.go.play()

                createjs.Tween.get(this.num.scale)
                    .to({x: 1.5, y: 1.5}, 200)
                    .to({x: 0, y: 0}, 300)

                return
            }
        }

        this.num.gotoAndStop(i)
        setTimeout(this.play.bind(this, i+1), 1000)
    }
}