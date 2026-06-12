import * as THREE from 'three'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { camera, renderer, scene } from './scene'
import { allObjects } from './state'

export type { LineSegments2 }

/** Genera aristas visibles (LineSegments2) para todos los meshes de un grupo,
 *  añadiéndolas al wrapper. Devuelve los LineSegments2 creados. */
export function addEdgesToWrapper(
  modelGroup: THREE.Object3D,
  wrapper: THREE.Group
): LineSegments2[] {
  const created: LineSegments2[] = []

  modelGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    child.updateWorldMatrix(true, false)
    wrapper.updateWorldMatrix(true, false)

    const relMatrix = new THREE.Matrix4()
      .copy(wrapper.matrixWorld)
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
    wrapper.add(line)
    created.push(line)
  })

  return created
}

/** Remueve y regenera las aristas de un wrapper dado su grupo de modelo. */
export function refreshEdges(
  existingEdges: LineSegments2[],
  wrapper: THREE.Group,
  modelGroup: THREE.Object3D
): LineSegments2[] {
  existingEdges.forEach(e => wrapper.remove(e))
  return addEdgesToWrapper(modelGroup, wrapper)
}

/** Actualiza resolución de todos los LineMaterial al redimensionar. */
window.addEventListener('resize', () => {
  allObjects.forEach(obj => {
    obj.edges.forEach(e => {
      if (e.material instanceof LineMaterial) {
        e.material.resolution.set(window.innerWidth, window.innerHeight)
      }
    })
  })
})

/** Crea el primer objeto desde el GLB cargado y lo registra. */
export function buildFirstObject(
  gltfScene: THREE.Group
): { wrapper: THREE.Group; meshes: THREE.Mesh[]; edges: LineSegments2[] } {
  gltfScene.name = 'model'

  const bbox = new THREE.Box3().setFromObject(gltfScene)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  gltfScene.position.set(-center.x, -bbox.min.y, -center.z)

  // Ajuste a la rejilla de 60 cm:
  //   base 2x2 celdas = 1.20 m  (lado horizontal X/Z)
  //   con la proporción original 2x2x3, el alto resulta 1.80 m = 3 celdas
  const targetBase = 1.2
  const baseSize = Math.max(size.x, size.z)
  if (baseSize > 0) {
    const s = targetBase / baseSize
    gltfScene.scale.setScalar(s)
    gltfScene.position.multiplyScalar(s)
  }

  const wrapper = new THREE.Group()
  wrapper.name = 'wrapper'
  wrapper.add(gltfScene)
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
  const edges = addEdgesToWrapper(gltfScene, wrapper)

  return { wrapper, meshes, edges }
}
