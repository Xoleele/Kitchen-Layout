import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { scene, camera, renderer } from './scene'
import { addEdgesToWrapper } from './edges'
import { allObjects } from './state'
import { SceneObject } from './types'

/** Clona un wrapper existente, regenera sus aristas y lo registra en allObjects. */
export function cloneObject(sourceWrapper: THREE.Group): SceneObject {
  const clone = sourceWrapper.clone(true)
  clone.name  = 'wrapper'

  // Eliminar todos los LineSegments2 clonados (se regeneran frescos)
  const toRemove: THREE.Object3D[] = []
  clone.traverse((child) => {
    if (child instanceof LineSegments2) toRemove.push(child)
  })
  toRemove.forEach(c => c.parent?.remove(c))

  // Aplicar material blanco a los meshes del clon
  const whiteMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })

  const cloneMeshes: THREE.Mesh[] = []
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = whiteMat.clone()
      cloneMeshes.push(child)
    }
  })

  scene.add(clone)
  renderer.render(scene, camera) // actualizar matrixWorld

  // Encontrar el grupo del modelo dentro del clon (se llama 'model')
  const cloneModelGroup = clone.getObjectByName('model') ?? clone

  // Generar aristas frescas
  const cloneEdges = addEdgesToWrapper(cloneModelGroup, clone)

  const sceneObj: SceneObject = {
    wrapper: clone,
    meshes: cloneMeshes,
    edges: cloneEdges,
  }

  allObjects.push(sceneObj)
  return sceneObj
}
