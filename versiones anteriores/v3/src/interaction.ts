import * as THREE from 'three'
import { camera, renderer } from './scene'
import { allObjects, activeObject, setActiveObject, SNAP, raycaster, mouse } from './state'
import { cloneObject } from './clone'
import { SceneObject } from './types'

// ─── ESTADO DE INTERACCIÓN ────────────────────────────────────────────────────
let isDragging  = false
let currentObj: SceneObject | null = null

const dragPlane  = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const dragOffset = new THREE.Vector3()
let mouseDownPos = { x: 0, y: 0 }

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function setMouse(event: MouseEvent): void {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1
  mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1
}

function getWorldPos(event: MouseEvent): THREE.Vector3 | null {
  setMouse(event)
  raycaster.setFromCamera(mouse, camera)
  const target = new THREE.Vector3()
  return raycaster.ray.intersectPlane(dragPlane, target) ? target : null
}

function hitObject(event: MouseEvent): SceneObject | null {
  setMouse(event)
  raycaster.setFromCamera(mouse, camera)
  const allMeshes = allObjects.flatMap(o => o.meshes)
  const hits = raycaster.intersectObjects(allMeshes, false)
  if (hits.length === 0) return null
  const hitMesh = hits[0].object as THREE.Mesh
  return allObjects.find(o => o.meshes.includes(hitMesh)) ?? null
}

// ─── MOUSE DOWN ───────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
  if (e.button !== 0) return   // solo botón izquierdo
  if (allObjects.length === 0) return

  mouseDownPos = { x: e.clientX, y: e.clientY }

  const owner = hitObject(e)
  if (!owner) return

  if (e.ctrlKey) {
    // Ctrl + click: clonar y arrastrar el clon
    const cloned = cloneObject(owner.wrapper)
    cloned.wrapper.position.copy(owner.wrapper.position)
    cloned.wrapper.rotation.y = owner.wrapper.rotation.y
    currentObj = cloned
  } else {
    currentObj = owner
  }

  setActiveObject(currentObj)
  isDragging = true
  dragPlane.constant = -currentObj.wrapper.position.y

  const worldPos = getWorldPos(e)
  if (worldPos) dragOffset.copy(currentObj.wrapper.position).sub(worldPos)

  e.preventDefault()
})

// ─── MOUSE MOVE ───────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
  if (!isDragging || !currentObj) return

  const worldPos = getWorldPos(e)
  if (!worldPos) return

  let nx = worldPos.x + dragOffset.x
  let nz = worldPos.z + dragOffset.z

  nx = Math.round(nx / SNAP) * SNAP
  nz = Math.round(nz / SNAP) * SNAP

  currentObj.wrapper.position.x = nx
  currentObj.wrapper.position.z = nz
})

// ─── MOUSE UP ─────────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('mouseup', (e: MouseEvent) => {
  if (!isDragging || !currentObj) return

  const dx   = e.clientX - mouseDownPos.x
  const dy   = e.clientY - mouseDownPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Rotar solo si fue un clic sin arrastrar y sin Ctrl
  if (dist < 4 && !e.ctrlKey) {
    const owner = hitObject(e)
    if (owner) owner.wrapper.rotation.y += Math.PI / 2
  }

  isDragging = false
})

// ─── PAN (rueda presionada + mover mouse) ────────────────────────────────────
let isPanning = false
let panStart  = { x: 0, y: 0 }

const panRight = new THREE.Vector3()
const panUp    = new THREE.Vector3()

function updatePanAxes(): void {
  camera.getWorldDirection(panUp)
  panRight.crossVectors(panUp, camera.up).normalize()
  panUp.crossVectors(camera.up, panRight).normalize()
}

renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
  if (e.button === 1) {
    isPanning = true
    panStart  = { x: e.clientX, y: e.clientY }
    updatePanAxes()
    e.preventDefault()
  }
})

renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
  if (!isPanning) return

  const dx = e.clientX - panStart.x
  const dy = e.clientY - panStart.y
  panStart = { x: e.clientX, y: e.clientY }

  const frustumW = (camera as THREE.OrthographicCamera).right - (camera as THREE.OrthographicCamera).left
  const speed    = frustumW / window.innerWidth

  const delta = new THREE.Vector3()
    .addScaledVector(panRight, -dx * speed)
    .addScaledVector(panUp,     dy * speed)

  camera.position.add(delta)
  camera.updateProjectionMatrix()
})

window.addEventListener('mouseup', (e: MouseEvent) => {
  if (e.button === 1) isPanning = false
})

renderer.domElement.addEventListener('auxclick', (e: MouseEvent) => {
  if (e.button === 1) e.preventDefault()
})
