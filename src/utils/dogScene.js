// Cachorro 3D procedural para as telas de autenticação.
// Sem dependência de Vue: recebe um <canvas> e devolve um controlador.
// Tudo é montado por código (nenhum modelo externo): esferas achatadas + material "toon".
import {
  AmbientLight,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  PerspectiveCamera,
  RedFormat,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

const PALETTE = {
  fur: '#F2BE78',
  furLight: '#FFE8C6',
  patch: '#C98A4B',
  ear: '#C98A4B',
  nose: '#3A2A2E',
  eye: '#2A1F26',
  brow: '#8A5530',
  cheek: '#FF9FB0',
  tongue: '#FF7C95',
  tear: '#8FD3FF',
  tag: '#FFD166',
}

// Cada humor é um conjunto de alvos; a cena suaviza a transição entre eles.
const BASE = {
  tilt: 0, // inclinação lateral da cabeça (rad)
  down: 0, // cabeça para baixo (+) ou para cima (-) (rad)
  lookW: 1, // quanto segue o cursor
  lookForm: 0, // quanto olha para o formulário (abaixo)
  bob: 0, // balançar a cabeça (digitando)
  paws: 0, // patinhas cobrindo os olhos
  shut: 0, // olhos fechados
  earDroop: 0,
  earPerk: 0,
  happy: 0, // olhos ^ ^
  tongue: 0,
  browSad: 0,
  browUp: 0,
  tear: 0,
  hop: 0,
  eyeScale: 1,
  wagSpeed: 4,
  wagAmp: 0.22,
  tailBase: -0.55,
}

export const DOG_MOODS = {
  idle: {},
  curious: { tilt: 0.22, down: 0.05, lookW: 0.25, lookForm: 0.75, earPerk: 1, browUp: 1, wagSpeed: 6.5, wagAmp: 0.38 },
  typing: { tilt: -0.08, lookW: 0.12, lookForm: 0.88, bob: 1, wagSpeed: 11, wagAmp: 0.5, earPerk: 0.3 },
  shy: { paws: 1, shut: 1, lookW: 0.08, lookForm: 0.2, down: 0.12, earDroop: 0.35, wagSpeed: 2, wagAmp: 0.08, tailBase: -1.1 },
  happy: { happy: 1, tongue: 1, hop: 1, lookW: 0.3, down: -0.12, earPerk: 0.5, wagSpeed: 18, wagAmp: 0.75 },
  sad: {
    down: 0.3, lookW: 0, lookForm: 0.4, earDroop: 1, browSad: 1, tear: 1, eyeScale: 1.14,
    wagSpeed: 1.2, wagAmp: 0.04, tailBase: -1.75, tilt: 0.06,
  },
}

function readCollarColor() {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    if (/^(#|rgb)/i.test(raw)) return raw
  } catch {
    // sem DOM: usa o padrão
  }
  return '#2E7D6B'
}

function makeGradientMap() {
  const tex = new DataTexture(new Uint8Array([110, 185, 255]), 3, 1, RedFormat)
  tex.minFilter = NearestFilter
  tex.magFilter = NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}

function makeShadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32)
  grad.addColorStop(0, 'rgba(20,20,30,0.28)')
  grad.addColorStop(1, 'rgba(20,20,30,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}

export function createDogScene(canvas, { animated = true, onContextLost } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new Scene()
  const camera = new PerspectiveCamera(28, 1, 0.1, 60)

  scene.add(new AmbientLight(0xffffff, 1.35))
  scene.add(new HemisphereLight(0xffffff, 0xffd9b0, 0.9))
  const sun = new DirectionalLight(0xffffff, 2.1)
  sun.position.set(-3, 5, 6)
  scene.add(sun)

  // ---------- materiais e geometrias compartilhadas ----------
  const gradientMap = makeGradientMap()
  const shadowTexture = makeShadowTexture()
  const materials = new Map()
  const toon = (hex) => {
    if (!materials.has(hex)) materials.set(hex, new MeshToonMaterial({ color: new Color(hex), gradientMap }))
    return materials.get(hex)
  }
  const ballGeo = new SphereGeometry(1, 36, 28)
  const cylGeo = new CylinderGeometry(1, 1, 1, 18)
  const geometries = [ballGeo, cylGeo]
  const extraMaterials = []

  const ball = (color, rx, ry = rx, rz = rx, pos = [0, 0, 0]) => {
    const m = new Mesh(ballGeo, typeof color === 'string' ? toon(color) : color)
    m.scale.set(rx, ry, rz)
    m.position.set(...pos)
    return m
  }
  const basic = (hex, opacity = 1) => {
    const m = new MeshBasicMaterial({ color: new Color(hex), transparent: opacity < 1, opacity })
    extraMaterials.push(m)
    return m
  }

  const root = new Group()
  scene.add(root)
  const dog = new Group()
  dog.rotation.y = -0.18 // levemente de lado: o rabo aparece
  root.add(dog)

  // ---------- corpo ----------
  const body = ball(PALETTE.fur, 0.82, 0.9, 0.78, [0, -1.45, 0])
  dog.add(body)
  dog.add(ball(PALETTE.furLight, 0.5, 0.6, 0.4, [0, -1.38, 0.5]))
  for (const s of [-1, 1]) {
    dog.add(ball(PALETTE.fur, 0.48, 0.52, 0.55, [s * 0.66, -1.95, -0.02])) // coxa
    dog.add(ball(PALETTE.furLight, 0.25, 0.14, 0.36, [s * 0.62, -2.26, 0.66])) // pé traseiro
  }

  // coleira com plaquinha
  const collar = new Mesh(new TorusGeometry(0.62, 0.085, 10, 32), basic(readCollarColor()))
  geometries.push(collar.geometry)
  collar.rotation.x = Math.PI / 2 - 0.12
  collar.position.set(0, -0.88, 0.05)
  dog.add(collar)
  dog.add(ball(PALETTE.tag, 0.1, 0.1, 0.04, [0, -1.08, 0.68]))

  // ---------- braços ----------
  const arms = [-1, 1].map((s) => {
    const shoulder = new Vector3(s * 0.42, -1.2, 0.5)
    const rest = new Vector3(s * 0.4, -2.14, 0.86)
    const lifted = new Vector3(s * 0.4, 0.2, 1.1)
    const upper = new Mesh(cylGeo, toon(PALETTE.fur))
    const paw = ball(PALETTE.furLight, 0.25, 0.22, 0.27)
    dog.add(upper, paw)
    return { s, shoulder, rest, lifted, upper, paw, tmp: new Vector3() }
  })
  const up = new Vector3(0, 1, 0)
  const dirTmp = new Vector3()
  function placeArm(a, k) {
    a.tmp.lerpVectors(a.rest, a.lifted, k)
    a.tmp.x += a.s * -0.06 * k // patinhas se aproximam do centro
    a.paw.position.copy(a.tmp)
    dirTmp.subVectors(a.tmp, a.shoulder)
    const len = dirTmp.length()
    a.upper.position.copy(a.shoulder).addScaledVector(dirTmp, 0.5)
    a.upper.scale.set(0.2, len, 0.2)
    a.upper.quaternion.setFromUnitVectors(up, dirTmp.normalize())
  }

  // ---------- rabo (dois segmentos para o efeito de chicote) ----------
  const tail = new Group()
  tail.position.set(0.55, -2.0, -0.4)
  const tailCapGeo = new CapsuleGeometry(0.14, 0.5, 6, 12)
  geometries.push(tailCapGeo)
  const tailA = new Mesh(tailCapGeo, toon(PALETTE.fur))
  tailA.position.y = 0.34
  tail.add(tailA)
  const tailTip = new Group()
  tailTip.position.y = 0.66
  const tailB = new Mesh(tailCapGeo, toon(PALETTE.furLight))
  tailB.scale.set(0.9, 0.8, 0.9)
  tailB.position.y = 0.26
  tailTip.add(tailB)
  tail.add(tailTip)
  dog.add(tail)

  // ---------- cabeça ----------
  const HEAD_Y = 0.15
  const head = new Group()
  head.position.set(0, HEAD_Y - 0.65, 0.05)
  dog.add(head)
  const face = new Group()
  face.position.y = 0.65
  head.add(face)

  face.add(ball(PALETTE.fur, 1.12, 0.96, 1.0))
  // mancha no olho direito
  face.add(ball(PALETTE.patch, 0.37, 0.4, 0.2, [0.46, 0.17, 0.78]))
  // focinho
  face.add(ball(PALETTE.furLight, 0.52, 0.4, 0.46, [0, -0.3, 0.78]))
  face.add(ball(PALETTE.nose, 0.17, 0.12, 0.1, [0, -0.1, 1.2]))
  face.add(ball('#FFFFFF', 0.035, 0.03, 0.02, [-0.05, -0.07, 1.29]))

  // boca "w"
  const mouthGeo = new TorusGeometry(0.095, 0.016, 6, 20, Math.PI)
  geometries.push(mouthGeo)
  for (const s of [-1, 1]) {
    const arc = new Mesh(mouthGeo, toon(PALETTE.nose))
    arc.rotation.z = Math.PI
    arc.position.set(s * 0.095, -0.35, 1.235)
    face.add(arc)
  }
  const philtrum = new Mesh(cylGeo, toon(PALETTE.nose))
  philtrum.scale.set(0.015, 0.075, 0.015)
  philtrum.position.set(0, -0.26, 1.225)
  face.add(philtrum)

  const tongue = ball(PALETTE.tongue, 0.12, 0.17, 0.05, [0, -0.47, 1.19])
  tongue.rotation.x = -0.25
  face.add(tongue)

  // bochechas
  const cheekGeo = new CircleGeometry(0.14, 20)
  geometries.push(cheekGeo)
  const cheekMat = basic(PALETTE.cheek, 0.6)
  for (const s of [-1, 1]) {
    const cheek = new Mesh(cheekGeo, cheekMat)
    cheek.position.set(s * 0.68, -0.2, 0.8)
    cheek.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(s * 0.62, -0.2, 0.75).normalize())
    face.add(cheek)
  }

  // olhos
  const eyeMat = toon(PALETTE.eye)
  const whiteMat = basic('#FFFFFF')
  const happyGeo = new TorusGeometry(0.14, 0.034, 8, 18, Math.PI)
  geometries.push(happyGeo)
  const eyes = [-1, 1].map((s) => {
    const base = new Vector3(s * 0.43, 0.17, 0.93)
    const g = new Group()
    g.position.copy(base)
    const open = new Group()
    open.add(ball(eyeMat, 0.2, 0.235, 0.12))
    open.add(ball(whiteMat, 0.07, 0.07, 0.04, [0.06, 0.09, 0.1]))
    open.add(ball(whiteMat, 0.035, 0.035, 0.03, [-0.06, -0.075, 0.1]))
    const joy = new Mesh(happyGeo, eyeMat)
    joy.position.set(0, -0.04, 0.14)
    g.add(open, joy)
    face.add(g)
    return { g, open, joy, base, s }
  })

  // sobrancelhas (pontinhos)
  const browGeo = new CapsuleGeometry(0.028, 0.1, 4, 8)
  geometries.push(browGeo)
  const brows = [-1, 1].map((s) => {
    const b = new Mesh(browGeo, toon(PALETTE.brow))
    b.rotation.z = Math.PI / 2
    const g = new Group()
    g.position.set(s * 0.43, 0.5, 0.86)
    g.add(b)
    face.add(g)
    return { g, s }
  })

  // lágrima
  const tearMat = basic(PALETTE.tear, 0.9)
  const tear = ball(tearMat, 0.055, 0.08, 0.05, [-0.52, -0.02, 0.98])
  face.add(tear)

  // orelhas
  const ears = [-1, 1].map((s) => {
    const pivot = new Group()
    pivot.position.set(s * 0.78, 0.55, 0.05)
    const outer = ball(PALETTE.ear, 0.46, 0.62, 0.26, [0, -0.55, 0])
    const inner = ball('#E8A98A', 0.28, 0.42, 0.1, [0, -0.52, 0.2])
    pivot.add(outer, inner)
    face.add(pivot)
    return { pivot, s }
  })

  // sombra no chão
  const shadowMat = new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
  extraMaterials.push(shadowMat)
  const shadow = new Mesh(new CircleGeometry(1, 28), shadowMat)
  geometries.push(shadow.geometry)
  shadow.rotation.x = -Math.PI / 2
  shadow.scale.set(1.9, 1.5, 1)
  shadow.position.set(0, -2.4, 0.1)
  root.add(shadow)

  // ---------- estado de animação ----------
  const target = { ...BASE }
  const cur = { ...BASE }
  const look = { x: 0, y: 0 }
  const pointer = { x: 0, y: 0, last: -10 }
  let time = 0
  let nextBlink = 1.5
  let blinkT = -1
  let moodName = 'idle'

  function setMood(name) {
    moodName = DOG_MOODS[name] ? name : 'idle'
    Object.assign(target, BASE, DOG_MOODS[moodName])
    if (!animated) renderStatic()
  }

  // x, y normalizados (-1..1), y positivo = acima do cachorro
  function setPointer(x, y) {
    pointer.x = MathUtils.clamp(x, -1, 1)
    pointer.y = MathUtils.clamp(y, -1, 1)
    pointer.last = time
  }

  function step(dt, snap = false) {
    const k = (lambda) => (snap ? 1 : 1 - Math.exp(-lambda * dt))
    for (const key of Object.keys(BASE)) cur[key] += (target[key] - cur[key]) * k(key === 'paws' ? 11 : 7)

    // olhar: cursor + formulário + balanço de repouso
    const sway = time - pointer.last > 3 ? Math.sin(time * 0.6) * 0.3 : 0
    const tx = pointer.x * cur.lookW + sway * cur.lookW
    const ty = pointer.y * cur.lookW - 0.75 * cur.lookForm
    look.x += (tx - look.x) * k(9)
    look.y += (ty - look.y) * k(9)

    const breathe = Math.sin(time * 2.1)
    const bob = Math.sin(time * 7.5) * 0.05 * cur.bob
    face.rotation.y = look.x * 0.55
    face.rotation.x = cur.down - look.y * 0.32 + bob
    face.rotation.z = cur.tilt
    head.position.y = HEAD_Y - 0.65 + breathe * 0.012

    // sempre visíveis, só mudam de forma
    body.scale.set(0.82 * (1 + breathe * 0.01), 0.9 * (1 + breathe * 0.018), 0.78)

    // pulinhos de alegria
    const hopWave = Math.abs(Math.sin(time * 9))
    const lift = cur.hop * hopWave * 0.38
    dog.position.y = lift
    const squash = 1 - cur.hop * (1 - hopWave) * 0.03
    dog.scale.set(1 / squash, squash, 1 / squash)
    shadow.scale.set(1.9 * (1 - lift * 0.5), 1.5 * (1 - lift * 0.5), 1)

    // parallax suave do corpo todo
    root.rotation.y = pointer.x * 0.14 * cur.lookW
    root.rotation.x = -pointer.y * 0.04 * cur.lookW

    // olhos
    if (animated && time >= nextBlink && blinkT < 0) blinkT = 0
    let blink = 1
    if (blinkT >= 0) {
      blinkT += dt
      blink = 1 - Math.sin(Math.min(blinkT / 0.16, 1) * Math.PI) * 0.92
      if (blinkT > 0.16) {
        blinkT = -1
        nextBlink = time + 2.2 + Math.random() * 3.2
      }
    }
    const openY = blink * (1 - cur.shut * 0.92)
    for (const e of eyes) {
      e.g.position.set(e.base.x + look.x * 0.045, e.base.y + look.y * 0.04, e.base.z)
      e.open.scale.set(cur.eyeScale, Math.max(0.05, openY) * cur.eyeScale, 1)
      e.open.visible = cur.happy < 0.5
      e.joy.visible = cur.happy >= 0.5
    }

    // sobrancelhas
    for (const b of brows) {
      b.g.rotation.z = b.s * -cur.browSad * 0.5
      b.g.position.y = 0.5 + cur.browUp * (b.s > 0 ? 0.1 : 0.03) + cur.browSad * 0.03
    }

    // língua e lágrima
    tongue.visible = cur.tongue > 0.15
    tongue.scale.set(0.12, 0.17 * cur.tongue + 0.001, 0.05)
    tear.visible = cur.tear > 0.4
    const tearPhase = animated ? (time % 1.5) / 1.5 : 0.3
    tear.position.y = -0.02 - tearPhase * 0.4
    tearMat.opacity = 0.9 * Math.min(1, (1 - tearPhase) * 3) * cur.tear

    // orelhas: caídas para fora, em pé ou balançando
    const flutter = Math.sin(time * 14) * 0.12 * cur.hop
    for (const ear of ears) {
      const outward = 0.3 + cur.earDroop * 0.55
      const perk = ear.s > 0 ? cur.earPerk : cur.earPerk * 0.35
      ear.pivot.rotation.z = ear.s * (outward + perk * 1.15) + flutter * ear.s
      ear.pivot.rotation.x = cur.earDroop * 0.18
    }

    // rabo
    const wag = Math.sin(time * cur.wagSpeed) * cur.wagAmp
    tail.rotation.z = cur.tailBase + wag
    tail.rotation.y = 0.2
    tailTip.rotation.z = -0.3 + Math.sin(time * cur.wagSpeed - 0.9) * cur.wagAmp * 0.9

    // patinhas
    const pawK = cur.paws
    for (const a of arms) placeArm(a, pawK)
    }

  // ---------- câmera e canvas ----------
  const HALF_H = 2.15
  const HALF_W = 1.95
  const CENTER_Y = -0.5
  function resize() {
    const w = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const tan = Math.tan(MathUtils.degToRad(camera.fov / 2))
    const dist = Math.max(HALF_H / tan, HALF_W / (tan * camera.aspect))
    camera.position.set(0, CENTER_Y, dist)
    camera.lookAt(0, CENTER_Y, 0)
    camera.updateProjectionMatrix()
    if (!animated) renderStatic()
  }

  function renderStatic() {
    for (let i = 0; i < 3; i++) step(1, true)
    renderer.render(scene, camera)
  }

  // ---------- laço de animação ----------
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const minInterval = coarse ? 1000 / 40 : 0
  let raf = 0
  let last = 0
  let lastRender = 0
  let active = false

  function frame(now) {
    raf = requestAnimationFrame(frame)
    if (now - lastRender < minInterval) return
    const dt = Math.min((now - (last || now)) / 1000, 0.05)
    last = now
    lastRender = now
    time += dt
    step(dt)
    renderer.render(scene, camera)
  }

  function setActive(on) {
    if (!animated) return
    if (on && !active) {
      active = true
      last = 0
      raf = requestAnimationFrame(frame)
    } else if (!on && active) {
      active = false
      cancelAnimationFrame(raf)
    }
  }

  const onLost = (e) => {
    e.preventDefault()
    setActive(false)
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  function dispose() {
    setActive(false)
    canvas.removeEventListener('webglcontextlost', onLost)
    for (const g of geometries) g.dispose()
    for (const m of materials.values()) m.dispose()
    for (const m of extraMaterials) m.dispose()
    gradientMap.dispose()
    shadowTexture.dispose()
    renderer.dispose()
  }

  resize()
  setMood('idle')
  step(1, true)
  if (!animated) renderStatic()

  return {
    setMood,
    setPointer,
    setActive,
    resize,
    dispose,
    get mood() {
      return moodName
    },
  }
}
