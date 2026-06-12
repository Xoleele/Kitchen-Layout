import * as THREE from 'three'
import { scene } from './scene'

export const CELL_SIZE = 0.6

// ─── REJILLA INFINITA (shader procedural) ────────────────────────────────────
const gridMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  uniforms: {
    uCellSize:  { value: CELL_SIZE },
    uThickness: { value: 0.04 },
  },
  vertexShader: /* glsl */`
    varying vec2 vWorldXZ;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldXZ = wp.xz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: /* glsl */`
    uniform float uCellSize;
    uniform float uThickness;
    varying vec2 vWorldXZ;
    void main() {
      vec2 cell  = vWorldXZ / uCellSize;
      vec2 d     = abs(fract(cell) - 0.5);
      vec2 fw    = fwidth(cell);
      vec2 lines = smoothstep(uThickness * 0.5 + fw, uThickness * 0.5 - fw, 0.5 - d);
      float isLine = max(lines.x, lines.y);

      vec3 lineCol = vec3(0.90);
      if (isLine < 0.01) discard;
      gl_FragColor = vec4(lineCol, isLine);
    }
  `,
})

const gridGeo   = new THREE.PlaneGeometry(2000, 2000)
const gridPlane = new THREE.Mesh(gridGeo, gridMat)
gridPlane.rotation.x = -Math.PI / 2
gridPlane.position.y = -0.001
scene.add(gridPlane)

// ─── PLANO INVISIBLE PARA RAYCASTING ─────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(2000, 2000)
const groundMat = new THREE.MeshBasicMaterial({ visible: false })
export const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.name = 'ground'
scene.add(ground)
