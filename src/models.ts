// ─── CATALOGO DE MODELOS 3D ──────────────────────────────────────────────────
// Para anadir un objeto nuevo:
//   1. Exporta el .glb desde SketchUp (File > Export > 3D Model > .glb)
//   2. Guarda el archivo en  public/models/
//   3. Anade una entrada aqui abajo con su nombre de archivo.
//
// `baseCells` = cuantas celdas de la rejilla (de 60 cm) ocupara la base del
// objeto en su lado mas largo (X o Z). La altura se escala en proporcion para
// mantener las dimensiones originales del modelo. Asi encaja en la rejilla.
//
// `keepScale: true`  -> NO reescala el modelo; conserva sus dimensiones reales.
// `keepOrigin: true` -> NO recentra el modelo; conserva su origen (0,0,0). El
//                       origen del modelo se alinea siempre a un punto de la
//                       rejilla.

import { CELL_SIZE } from './grid'

export interface ModelDef {
  /** Nombre visible del objeto */
  name: string
  /** Ruta al archivo .glb dentro de public/ */
  url: string
  /** Lado de la base en celdas de rejilla (default 2 = 120 cm) */
  baseCells?: number
  /** Si es true, NO se reescala el modelo (conserva su tamano original). */
  keepScale?: boolean
  /** Si es true, NO se recentra: se conserva el origen (0,0,0) del modelo. */
  keepOrigin?: boolean
}

export const MODELS: ModelDef[] = [
  { name: 'Objeto 123', url: 'models/123.glb', baseCells: 2 },

  // Modelo a escala real, con su origen (0,0,0) alineado a la rejilla:
  { name: 'Prueba 1', url: 'models/prueba1.glb', keepScale: true, keepOrigin: true },

  // ── Anade tus nuevos modelos debajo, por ejemplo: ──
  // { name: 'Mesa',   url: 'models/mesa.glb',   baseCells: 3 },
  // { name: 'Silla',  url: 'models/silla.glb',  baseCells: 1 },
]

/** Tamano objetivo (en metros) de la base de un modelo segun sus celdas. */
export function targetBaseMeters(def: ModelDef): number {
  return (def.baseCells ?? 2) * CELL_SIZE
}
