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
            design.width * .5 + pos.x * PTM,
            design.height * .5 - pos.y * PTM)
        node.rotation = -body.getAngle()
    }

}


PIXI.extras.physics = {
    PTM,
    world,

    enable(node, fixtureDef = {}) {
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
planck.Body.prototype.clearShapes = function () {
    for (let fixture = this.getFixtureList(); fixture; fixture = fixture.getNext()) {
        this.destroyFixture(fixture)
    }
    return this
}

planck.Body.prototype.loadPolygon = function (paths, fixtureDef = {}) {
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

planck.Body.prototype.syncPosition = function () {
    const node = this.node
    node && this.setPosition(planck.Vec2(
        (node.x - design.width * .5) / PTM,
        (design.height * .5 - node.y) / PTM))
    return this
}

/*
* 画布旋转处理
*/

PIXI.interaction.InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
    let rect;

    // IE 11 fix
    if (!this.interactionDOMElement.parentElement) {
        rect = { x: 0, y: 0, width: 0, height: 0 }
    } else {
        rect = this.interactionDOMElement.getBoundingClientRect()
    }

    const resolutionMultiplier = navigator.isCocoonJS ? this.resolution : (1.0 / this.resolution);

    /*
    * 特殊处理
    */
    if (PIXI._angle === 90) {
        point.y = (1 - (x - rect.left) / rect.width) * this.interactionDOMElement.height * resolutionMultiplier;
        point.x = (y - rect.top) * (this.interactionDOMElement.width / rect.height) * resolutionMultiplier;
    } else {
        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier
        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier
    }
}