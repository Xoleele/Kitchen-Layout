// Importar módulos en orden — cada uno registra su lógica al importarse
import './grid'          // crea rejilla y plano de raycasting
import './model'         // re-exporta loadModel()
import { loadModel } from './model'
import './interaction'   // registra todos los event listeners de mouse
import { startAnimationLoop } from './scene'

// Arrancar
loadModel()
startAnimationLoop()
