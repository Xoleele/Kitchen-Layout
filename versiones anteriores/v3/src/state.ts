import * as THREE from 'three'
import { SceneObject } from './types'

/** Lista de todos los objetos interactivos en escena */
export const allObjects: SceneObject[] = []

/** Objeto actualmente bajo el cursor / siendo arrastrado */
export let activeObject: SceneObject | null = null

export function setActiveObject(obj: SceneObject | null): void {
  activeObject = obj
}

/** Snap al grid */
export const SNAP = 1

/** Raycaster compartido */
export const raycaster = new THREE.Raycaster()
export const mouse     = new THREE.Vector2()
