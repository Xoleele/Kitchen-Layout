import * as THREE from 'three'

// ─── RENDERER ────────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container') as HTMLDivElement

export const W = window.innerWidth
export const H = window.innerHeight

export const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

// ─── CÁMARA ORTOGRÁFICA (ISOMÉTRICA) ─────────────────────────────────────────
export const aspect = W / H
export const frustum = 2.8

export const camera = new THREE.OrthographicCamera(
  -frustum * aspect, frustum * aspect,
   frustum, -frustum,
   0.1, 1000
)
camera.position.set(15, 15, 15)
camera.lookAt(0, 0, 0)

export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(W, H)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = false
container.appendChild(renderer.domElement)

// ─── LUCES ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.5))

// ─── RESIZE ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const nw = window.innerWidth
  const nh = window.innerHeight
  const na = nw / nh
  camera.left   = -frustum * na
  camera.right  =  frustum * na
  camera.top    =  frustum
  camera.bottom = -frustum
  camera.updateProjectionMatrix()
  renderer.setSize(nw, nh)
})

// ─── LOOP DE ANIMACIÓN ───────────────────────────────────────────────────────
export function startAnimationLoop(): void {
  function animate(): void {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}
