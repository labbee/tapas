const
    world = planck.World(planck.Vec2(0, -6)),
    PTM = 32,
    STEP = 1 / PTM

let pause = false

loop()
function loop() {
    window.requestAnimationFrame(loop)

    if (pause) return

    world.step(STEP)
    for (let pos, node, body = world.getBodyList();
        body; body = body.getNext()) {
        node = body.node
        pos = body.getPosition()
        node.position.set(
            window.design.width * .5 + pos.x * PTM,
            window.design.height * .5 - pos.y * PTM)
        node.rotation = -body.getAngle()
    }

}


PIXI.extras.physics = {
    PTM,
    world,

    enable(node, fixtureDef={}) {
        node.body = world.createBody().setDynamic()
        node.body.createFixture(
            planck.Box(node.width * .5 / PTM, node.height * .5 / PTM),
            {
                density: 1,
                ...fixtureDef
            })

        node.body.node = node
        node.body.syncPosition()

        return node.body
    },

    stop() {
        pause = true
    },

    start() {
        pause = false
    }
}

// 事件分发
world.on('post-solve', (contact, oldManifold) => {
    const
        bodyA = contact.getFixtureA().getBody(),
        bodyB = contact.getFixtureB().getBody()

    bodyA.node.emit('post-solve', bodyA, bodyB, contact)
    bodyB.node.emit('post-solve', bodyB, bodyA, contact)
})

world.on('begin-contact', contact => {
    const
        bodyA = contact.getFixtureA().getBody(),
        bodyB = contact.getFixtureB().getBody()

    bodyA.node.emit('begin-contact', bodyA, bodyB, contact)
    bodyB.node.emit('begin-contact', bodyB, bodyA, contact)
})

// 扩展方法
planck.Body.prototype.clearShapes = function() {
    for (let fixture = this.getFixtureList(); fixture; fixture = fixture.getNext()) {
        this.destroyFixture(fixture)
    }
    return this
}

planck.Body.prototype.loadPolygon = function(paths, fixtureDef={}) {
    paths.forEach(vertexs => {
        this.createFixture(
            planck.Polygon(vertexs.map(vertex => planck.Vec2(vertex[0] / PTM, vertex[1] / PTM))),
            {
                density: 1,
                ...fixtureDef
            })
    })
    return this
}

planck.Body.prototype.syncPosition = function() {
    const node = this.node
    node && this.setPosition(planck.Vec2(
        (node.x - window.design.width * .5) / PTM,
        (window.design.height * .5 - node.y) / PTM))
    return this
}