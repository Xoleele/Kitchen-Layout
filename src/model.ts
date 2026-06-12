import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { buildSceneObject } from './edges'
import { allObjects, setActiveObject } from './state'
import { MODELS, targetBaseMeters, type ModelDef } from './models'
import { CELL_SIZE } from './grid'

const loader = new GLTFLoader()

/** Carga un unico .glb desde su URL y crea su SceneObject en la escena. */
function loadOne(def: ModelDef, position: THREE.Vector3): Promise<void> {
  return new Promise((resolve) => {
    loader.load(
      import.meta.env.BASE_URL + def.url,
      (gltf) => {
        const obj = buildSceneObject(
          gltf.scene as THREE.Group,
          targetBaseMeters(def),
          position
        )
        allObjects.push(obj)
        setActiveObject(obj)
        resolve()
      },
      undefined,
      (err) => {
        console.error('Error cargando "' + def.name + '" (' + def.url + '):', err)
        resolve()
      }
    )
  })
}

/** Carga todos los modelos del catalogo, separandolos en la rejilla. */
export async function loadModel(): Promise<void> {
  const gap = CELL_SIZE * 4
  for (let i = 0; i < MODELS.length; i++) {
    const x = (i - (MODELS.length - 1) / 2) * gap
    const position = new THREE.Vector3(x, 0, 0)
    await loadOne(MODELS[i], position)
  }
}
