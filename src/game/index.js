import core from '../core'
import tip from './tip'
import star from './star'

export default {
    core,
    speed: 4,
    score: 0,

    // 游戏状态
    state: 'ready',

    init() {
        this.load().then(res => {
            this.textures = res.game.textures
            this.shapes = res.shape.data.bodies

            this.audios = {
                jump: new Howl({src: 'res/audio/jump.mp3'}),
                eat: new Howl({src: 'res/audio/eat.mp3'}),
                one: new Howl({src: 'res/audio/1.mp3'}),
                two: new Howl({src: 'res/audio/2.mp3'}),
                three: new Howl({src: 'res/audio/3.mp3'}),
                ready: new Howl({src: 'res/audio/ready.mp3'}),
                over: new Howl({src: 'res/audio/gameover.mp3'}),
                go: new Howl({src: 'res/audio/go.mp3'})
            }

            // 添加游戏内容

            this.addBkg()
            this.addScoreboard()
            this.addGround()
            this.addRock()
            this.addPlane()
            this.listen()

            this.tip = tip.init(this)
            this.tip.start().then(() => this.state = 'run')

            this.star = star.init(this)

            core.ticker.add(this.loop.bind(this))
        })
    },

    addBkg() {
        this.bkgs = []
        this.lastBkg = null
        for (let i = 0; i < 3; i++) {
            const
                bkg = new PIXI.Sprite(this.textures['background.png']),
                ratio = bkg.width / bkg.height

            if (ratio > window.design.ratio) bkg.scale.set(window.design.width / bkg.width)
            else bkg.scale.set(window.design.height / bkg.height)

            if (this.lastBkg) bkg.x = this.lastBkg.x + this.lastBkg.width - 1
            else bkg.x = 0

            this.lastBkg = bkg
            this.bkgs.push(bkg)

            core.stage.addChild(bkg)
        }
    },

    addScoreboard() {
        this.scoreboard = new PIXI.Text(`SCORE: ${this.score}`, {
            fontFamily: '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
            fontSize: 36,
            fill: 0xff5722,
            align: 'center'
        })

        this.scoreboard.position.set(
            window.design.width - this.scoreboard.width - 6,
            6)

        core.stage.addChild(this.scoreboard)
    },

    addGround() {
        this.grounds = []
        this.lastGround = null

        for (let i = 0; i < 3; i++) {
            const ground = new PIXI.Sprite(this.textures['groundSnow.png'])
            ground.anchor.set(.5)
            ground.position.set(ground.width * (i + .5),
                window.design.height - ground.height * .5)

            PIXI.extras.physics.enable(ground)
                .clearShapes()
                .loadPolygon(this.shapes.groundRock.fixtures[0].polygons)
                .setKinematic()
                .setLinearVelocity(planck.Vec2(-this.speed, 0))

            this.lastGround = ground

            this.grounds.push(ground)

            core.stage.addChild(ground)
        }
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
        puff.position.set(-this.plane.width * .5 - 15, 10)
        puff.animationSpeed = 1.5
        puff.play()

        this.plane.addChild(puff)

        PIXI.extras.physics.enable(this.plane)
            .clearShapes()
            .loadPolygon(this.shapes.planeRed1.fixtures[0].polygons)
            .setFixedRotation(false)

        core.stage.addChild(this.plane)
    },

    addRock() {
        const
            _this = this,
            stamp = {
                lastTopStar: 0,
                lastBottomStar: 0
            }

        this.rocks = {
            top: {front: [], back: []},
            bottom: {front: [], back: []}
        }

        loopTop()
        loopBottom()
        function loopTop() {
            setTimeout(loopTop, 1e3 * (Math.random() * 2 + 1))
            if (_this.state !== 'run') return

            const rock = _this.rocks.top.back.pop() ||
                new PIXI.Sprite(_this.textures['rockSnowDown.png'])

            if (!rock.visible) rock.visible = true
            else {
                rock.name = 'rock'
                rock.anchor.set(.5)
                PIXI.extras.physics.enable(rock)
                    .clearShapes()
                    .loadPolygon(_this.shapes.rockSnowDown.fixtures[0].polygons)
                    .setKinematic()
                    .setLinearVelocity(planck.Vec2(-_this.speed, 0))

                // 添加在 scoreboard 之前
                core.stage.addChildAt(rock, core.stage.getChildIndex(_this.scoreboard))
            }

            rock.position.set(window.design.width + rock.width * .5,
                rock.height * .5)
            rock.body.syncPosition()

            _this.rocks.top.front.push(rock)

            if (Date.now() - stamp.lastTopStar > 3e3) {
                stamp.lastTopStar = Date.now()
                _this.star.add({
                    x: rock.position.x + 12,
                    y: rock.position.y + rock.height / 2 - 50
                }, Math.random() > .5 ? 3 : 4)
            }
        }

        function loopBottom() {
            setTimeout(loopBottom, 1e3 * (Math.random() * 2 + 1))
            if (_this.state !== 'run') return

            const rock = _this.rocks.bottom.back.pop() ||
                new PIXI.Sprite(_this.textures['rockSnow.png'])

            if (!rock.visible) rock.visible = true
            else {
                rock.name = 'rock'
                rock.anchor.set(.5)
                PIXI.extras.physics.enable(rock)
                    .clearShapes()
                    .loadPolygon(_this.shapes.rockSnow.fixtures[0].polygons)
                    .setKinematic()
                    .setLinearVelocity(planck.Vec2(-_this.speed, 0))

                // 添加到 ground 前面
                core.stage.addChildAt(rock, core.stage.getChildIndex(_this.grounds[0]))
            }

            rock.position.set(window.design.width + rock.width * .5,
                window.design.height - rock.height * .5)
            rock.body.syncPosition()

            _this.rocks.bottom.front.push(rock)

            if (Date.now() - stamp.lastBottomStar > 3e3) {
                stamp.lastBottomStar = Date.now()
                _this.star.add({
                    x: rock.position.x + 12,
                    y: window.design.height - rock.height + 50
                }, Math.random() > .5 ? 1 : 2)
            }
        }
    },

    retRock(rock, type) {
        const
            front = this.rocks[type].front,
            back = this.rocks[type].back

        const index = front.indexOf(rock)

        if (index !== -1) {
            rock.visible = false
            front.splice(index, 1)
            back.push(rock)
        }
    },

    over() {
        const filter = new PIXI.filters.TwistFilter()
        this.plane.filters = [filter]
        filter.offset = new PIXI.Point(this.plane.x, this.plane.y)

        createjs.Tween.get(filter)
            .to({angle: 16}, 1000)

        createjs.Tween.get(this.plane.scale)
            .to({x: 0, y: 0}, 1000)

        this.tip.over()

        PIXI.extras.physics.stop()
        this.state = 'over'
    },

    load() {
        return new Promise(resolve => {
            core.loader
                .add({url: 'res/audio/jump.mp3', loadType: 1})
                .add({url: 'res/audio/ready.mp3', loadType: 1})
                .add({url: 'res/audio/go.mp3', loadType: 1})
                .add({url: 'res/audio/eat.mp3', loadType: 1})
                .add({url: 'res/audio/1.mp3', loadType: 1})
                .add({url: 'res/audio/2.mp3', loadType: 1})
                .add({url: 'res/audio/3.mp3', loadType: 1})
                .add('game', 'res/game.json')
                .add('shape', 'res/shape.json')
                .load((loader, res) => {
                    progress.destroy()
                    resolve(res)
                })

            const progress = new PIXI.Text('0%', {
                fontFamily: '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
                fontSize: 36,
                fill: 0xffffff,
                align: 'center'
            })

            progress.position.set(
                (window.design.width - progress.width) * .5,
                (window.design.height - progress.height) * .5)

            core.stage.addChild(progress)

            core.loader.onProgress.add(loader => {
                progress.text = `${~~loader.progress}%`
                progress.x = (window.design.width - progress.width) * .5
            })
        })
    },

    tap() {
        if (this.state === 'over') return

        this.audios.jump.play()
        this.plane.body.applyLinearImpulse(
            planck.Vec2(0, this.plane.body.getMass() * 12),
            this.plane.body.getPosition())
    },

    eat(star) {
        this.star.ret(star)
        this.audios.eat.play()

        // 更新分数
        this.scoreboard.text = `SCORE: ${++this.score}`
        this.scoreboard.x = window.design.width - this.scoreboard.width - 6
    },

    /* 重置游戏 */
    replay() {
        // 分数清零
        this.score = 0
        this.scoreboard.text = `SCORE: ${this.score}`
        this.scoreboard.x = window.design.width - this.scoreboard.width - 6

        // 重置飞机
        this.plane.position.set(250, window.design.height >> 1)
        this.plane.filters = []
        this.plane.scale.set(1)
        this.plane.body.syncPosition()

        // 重置星星
        this.star.reset()

        // 重置岩石柱
        for (const key in this.rocks) {
            while (this.rocks[key].front.length) {
                const rock = this.rocks[key].front.pop()
                rock.x = -rock.width / 2
                rock.visible = false
                rock.body.syncPosition()
                this.rocks[key].back.push(rock)
            }
        }

        // 启动物理引擎
        PIXI.extras.physics.start()

        this.state = 'ready'

        // 提示重置
        this.tip.replay().then(() => this.state = 'run')
    },

    listen() {
        const pointerDown = window.hasOwnProperty('onpointerdown') ?
            'pointerdown' : 'touchstart'

        core.view.addEventListener(pointerDown, this.tap.bind(this))

        this.plane.on('begin-contact', (self, other) => {
            if (other.node.name === 'rock') {
                this.over()
            }

            if (other.node.name === 'star' && other.node.visible) {
                this.eat(other.node)
            }
        })
    },

    loop() {

        if (this.state === 'over') return

        this.grounds.forEach(ground => {
            if (ground.x < -ground.width >> 1) {
                const lastPosition = this.lastGround.body.getPosition()
                ground.body.setPosition(planck.Vec2(
                    lastPosition.x + ground.width / PIXI.extras.physics.PTM,
                    lastPosition.y
                ))
                this.lastGround = ground
            }
        })

        // 背景移动
        this.bkgs.forEach((bkg, i) => {
            if (bkg.x < -bkg.width) {
                bkg.x = this.lastBkg.x + this.lastBkg.width - this.speed
                this.lastBkg = bkg
            }
            bkg.x -= this.speed
        })

        // 飞机高度限制
        {
            if (this.plane.x < window.design.width / 3) {
                const velocity = this.plane.body.getLinearVelocity()
                velocity.x = 1.5
                this.plane.body.setLinearVelocity(velocity)
            } else {
                const velocity = this.plane.body.getLinearVelocity()
                velocity.x = 0
                this.plane.body.setLinearVelocity(velocity)
            }

            const velocity = this.plane.body.getLinearVelocity()
            velocity.y > 10 ? velocity.y = 10 : null
            if (this.plane.y < this.plane.height >> 1) {
                velocity.y > 0 ? velocity.y = 0 : null
            }
            this.plane.body.setLinearVelocity(velocity)
        }


        // 飞机角度限制
        {
            const
                body = this.plane.body,
                angle = body.getAngle() % (Math.PI * 2),
                velocity = body.getLinearVelocity()

            if (velocity.y > 0 && angle < .3) body.setAngularVelocity(1)
            else if (velocity.y < 0 && angle > -.3) body.setAngularVelocity(-.5)
            else if (velocity.y != 0) body.setAngularVelocity(0)
        }

        // 岩石
        {
            this.rocks.top.front.forEach(rock => {
                if (rock.x < -rock.width / 2) {
                    this.retRock(rock, 'top')
                }
            })

            this.rocks.bottom.front.forEach(rock => {
                if (rock.x < -rock.width / 2) {
                    this.retRock(rock, 'bottom')
                }
            })
        }
    }
}

core.resize()
document.body.appendChild(core.view)
window.addEventListener('resize', () => {
    /*
    * 微信浏览器内不加延时
    * 会出现放缩故障
    */
    setTimeout(core.resize, 100)
})