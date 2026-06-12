import * as THREE from 'three'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { camera, renderer, scene } from './scene'
import { allObjects } from './state'
import { CELL_SIZE } from './grid'

export type { LineSegments2 }

/** Genera aristas visibles (LineSegments2) para todos los meshes de un grupo,
 *  anadiendolas al contenedor `host`. Las coordenadas se calculan relativas a
 *  `host` para que las aristas roten/transformen junto con el. */
export function addEdgesToWrapper(
  modelGroup: THREE.Object3D,
  host: THREE.Object3D
): LineSegments2[] {
  const created: LineSegments2[] = []

  modelGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    child.updateWorldMatrix(true, false)
    host.updateWorldMatrix(true, false)

    const relMatrix = new THREE.Matrix4()
      .copy(host.matrixWorld)
      .invert()
      .multiply(child.matrixWorld)

    const edgesGeo = new THREE.EdgesGeometry(child.geometry)
    const posAttr  = edgesGeo.attributes['position'] as THREE.BufferAttribute
    const positions: number[] = []

    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i)
      v.applyMatrix4(relMatrix)
      positions.push(v.x, v.y, v.z)
    }

    const lineGeo = new LineSegmentsGeometry()
    lineGeo.setPositions(positions)

    const lineMat = new LineMaterial({
      color: 0x000000,
      linewidth: 2,
      depthTest: true,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    })

    const line = new LineSegments2(lineGeo, lineMat)
    host.add(line)
    created.push(line)
  })

  return created
}

/** Remueve y regenera las aristas de un host dado su grupo de modelo. */
export function refreshEdges(
  existingEdges: LineSegments2[],
  host: THREE.Object3D,
  modelGroup: THREE.Object3D
): LineSegments2[] {
  existingEdges.forEach(e => host.remove(e))
  return addEdgesToWrapper(modelGroup, host)
}

/** Actualiza resolucion de todos los LineMaterial al redimensionar. */
window.addEventListener('resize', () => {
  allObjects.forEach(obj => {
    obj.edges.forEach(e => {
      if (e.material instanceof LineMaterial) {
        e.material.resolution.set(window.innerWidth, window.innerHeight)
      }
    })
  })
})

/** Opciones para construir un objeto de escena. */
export interface BuildOptions {
  /** Tamano deseado (m) del lado mas largo de la base. Ignorado si keepScale. */
  targetBase?: number
  /** Posicion inicial del wrapper en el plano. Se alinea a la rejilla. */
  position?: THREE.Vector3
  /** Si es true, NO reescala el modelo (conserva su tamano original). */
  keepScale?: boolean
  /** Si es true, NO recentra: conserva el origen (0,0,0) del modelo. */
  keepOrigin?: boolean
}

/** Redondea un valor al multiplo de CELL_SIZE mas cercano (alinea a rejilla). */
function snapToGrid(v: number): number {
  return Math.round(v / CELL_SIZE) * CELL_SIZE
}

/** Construye un objeto de escena a partir de un GLB cargado y lo registra.
 *
 *  Jerarquia:  wrapper (anclado a rejilla, se mueve al arrastrar)
 *                └─ pivot (centrado en el centro de la celda; se ROTA aqui)
 *                     ├─ model
 *                     └─ edges
 *  Rotar el pivot hace que el objeto gire alrededor del centro de la celda
 *  sin que el ancla (wrapper) se desplace. */
export function buildSceneObject(
  gltfScene: THREE.Group,
  opts: BuildOptions = {}
): { wrapper: THREE.Group; pivot: THREE.Group; meshes: THREE.Mesh[]; edges: LineSegments2[] } {
  const {
    targetBase = 1.2,
    position = new THREE.Vector3(0, 0, 0),
    keepScale = false,
    keepOrigin = false,
  } = opts

  gltfScene.name = 'model'

  const bbox = new THREE.Box3().setFromObject(gltfScene)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  // Posicionamiento del modelo dentro del pivot.
  if (keepOrigin) {
    gltfScene.position.set(0, 0, 0)
  } else {
    gltfScene.position.set(-center.x, -bbox.min.y, -center.z)
  }

  // Escalado (solo si no se pide conservar la escala original).
  if (!keepScale) {
    const baseSize = Math.max(size.x, size.z)
    if (baseSize > 0) {
      const s = targetBase / baseSize
      gltfScene.scale.setScalar(s)
      if (!keepOrigin) gltfScene.position.multiplyScalar(s)
    }
  }

  // El centro de la celda esta a +CELL_SIZE/2 del origen (que esta en la
  // interseccion). Colocamos el pivot ahi y compensamos al modelo restando ese
  // offset, de modo que el modelo no cambie de sitio, pero el pivot quede
  // exactamente en el centro de la celda como eje de giro.
  const half = CELL_SIZE / 2
  const pivot = new THREE.Group()
  pivot.name = 'pivot'
  pivot.position.set(half, 0, half)
  gltfScene.position.x -= half
  gltfScene.position.z -= half
  pivot.add(gltfScene)

  const wrapper = new THREE.Group()
  wrapper.name = 'wrapper'
  wrapper.add(pivot)
  // El wrapper se ancla SIEMPRE sobre una interseccion de la rejilla.
  wrapper.position.set(snapToGrid(position.x), position.y, snapToGrid(position.z))
  scene.add(wrapper)

  const whiteMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })

  const meshes: THREE.Mesh[] = []
  gltfScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material      = whiteMat
      child.castShadow    = false
      child.receiveShadow = false
      meshes.push(child)
    }
  })

  renderer.render(scene, camera)
  // Las aristas cuelgan del pivot para rotar junto con el modelo.
  const edges = addEdgesToWrapper(gltfScene, pivot)

  return { wrapper, pivot, meshes, edges }
}

/** Alias retrocompatible. */
export function buildFirstObject(
  gltfScene: THREE.Group
): { wrapper: THREE.Group; pivot: THREE.Group; meshes: THREE.Mesh[]; edges: LineSegments2[] } {
  return buildSceneObject(gltfScene)
}
