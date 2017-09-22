export default {
    pools: {front: [], back: []},

    init(game) {
        this.game = game
        game.core.ticker.add(this.loop.bind(this))
        return this
    },

    buildBias(position, type, radius=100) {
        /*
          1. *              2.    *
               *                *
                *              *
          3.    *           4. *
               *                *
             *                    *
        */
        for (let i = 0; i < 3; i++) {
            const star = this.pools.back.pop() ||
                new PIXI.Sprite(this.game.textures['starGold.png'])

            if (star.visible) {
                // new
                star.anchor.set(.5)
                star.name = 'star'

                PIXI.extras.physics.enable(star)
                    .clearShapes()
                    .loadPolygon(this.game.shapes.starGold.fixtures[0].polygons,
                        {isSensor: true})
                    .setKinematic()
                    .setLinearVelocity(planck.Vec2(-this.game.speed, 0))

                this.game.core.stage.addChild(star)

            } else {
                // old
                star.visible = true
            }

            switch (type) {
                case 1: {
                    star.position.set(
                        position.x + radius * Math.sin(Math.PI * 45 * i / 180),
                        position.y - radius * Math.cos(Math.PI * 45 * i/ 180))
                    break
                }

                case 2: {
                    star.position.set(
                        position.x - radius * Math.sin(Math.PI * 45 * i / 180),
                        position.y - radius * Math.cos(Math.PI * 45 * i/ 180))
                    break
                }
                case 3: {
                    star.position.set(
                        position.x + radius * Math.sin(Math.PI * 45 * i / 180),
                        position.y + radius * Math.cos(Math.PI * 45 * i/ 180))
                    break
                }

                case 4: {
                    star.position.set(
                        position.x - radius * Math.sin(Math.PI * 45 * i / 180),
                        position.y + radius * Math.cos(Math.PI * 45 * i/ 180))
                    break
                }
            }

            star.body.syncPosition()
            this.pools.front.push(star)
        }
    },

    reset() {
        while (this.pools.front.length) {
            const star = this.pools.front.pop()
            star.visible = false
            star.x = -star.width / 2
            star.body.syncPosition()
            this.pools.back.push(star)
        }
    },

    add(position, type=0) {
        switch (type) {
            // 单个星星
            case 0: {
                const star = this.pools.back.pop() || new PIXI.Sprite(this.game.textures['starGold.png'])

                if (star.visible) {
                    // 新生成的
                    star.anchor.set(.5)
                    star.position.set(position.x, position.y)
                    star.name = 'star'

                    PIXI.extras.physics.enable(star)
                        .clearShapes()
                        .loadPolygon(this.game.shapes.starGold.fixtures[0].polygons,
                            {isSensor: true})
                        .setKinematic()
                        .setLinearVelocity(planck.Vec2(-this.game.speed, 0))

                    this.game.core.stage.addChild(star)

                } else {
                    // 重置属性
                    star.visible = true
                    star.position.set(position.x, position.y)
                    star.body.syncPosition()
                }

                this.pools.front.push(star)

                break
            }

            // type: 1 ~ 4 斜型
            case 1: {
                this.buildBias(position, type)
                break
            }

            case 2: {
                this.buildBias(position, type)
                break
            }

            case 3: {
                this.buildBias(position, type)
                break
            }

            case 4: {
                this.buildBias(position, type)
                break
            }

        }
    },

    ret(star) {
        const index = this.pools.front.indexOf(star)

        if (index !== -1) {
            star.visible = false
            this.pools.front.splice(index, 1)
            this.pools.back.push(star)
        }
    },

    loop() {
        this.pools.front.forEach(star => {
            if (star.x < -star.width * .5) {
                this.ret(star)
            }
        })
    }
}