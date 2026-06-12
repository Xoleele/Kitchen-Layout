import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'

/** Representa un objeto interactivo en la escena */
export interface SceneObject {
  /** Ancla a la rejilla; se mueve al arrastrar. */
  wrapper: THREE.Group
  /** Centrado en el centro de la celda; se rota aqui. */
  pivot: THREE.Group
  meshes: THREE.Mesh[]
  edges: LineSegments2[]
}
