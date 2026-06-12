// ─── CATÁLOGO DE MODELOS 3D ──────────────────────────────────────────────────
// Para añadir un objeto nuevo:
//   1. Exporta el .glb desde SketchUp (File ▸ Export ▸ 3D Model ▸ .glb)
//   2. Guarda el archivo en  public/models/
//   3. Añade una entrada aquí abajo con su nombre de archivo.
//
// `baseCells` = cuántas celdas de la rejilla (de 60 cm) ocupará la base del
// objeto en su lado más largo (X o Z). La altura se escala en proporción para
// mantener las dimensiones originales del modelo. Así todo encaja en la rejilla.

import { CELL_SIZE } from './grid'

export interface ModelDef {
  /** Nombre visible del objeto */
  name: string
  /** Ruta al archivo .glb dentro de public/ */
  url: string
  /** Lado de la base en celdas de rejilla (default 2 = 120 cm) */
  baseCells?: number
}

export const MODELS: ModelDef[] = [
  { name: 'Objeto 123', url: 'models/123.glb', baseCells: 2 },

  // ── Añade tus nuevos modelos debajo, por ejemplo: ──
  // { name: 'Mesa',   url: 'models/mesa.glb',   baseCells: 3 },
  // { name: 'Silla',  url: 'models/silla.glb',  baseCells: 1 },
]

/** Tamaño objetivo (en metros) de la base de un modelo según sus celdas. */
export function targetBaseMeters(def: ModelDef): number {
  return (def.baseCells ?? 2) * CELL_SIZE
}
