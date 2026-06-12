import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'

/** Representa un objeto interactivo en la escena */
export interface SceneObject {
  wrapper: THREE.Group
  meshes: THREE.Mesh[]
  edges: LineSegments2[]
}
