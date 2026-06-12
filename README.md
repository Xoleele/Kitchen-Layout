# Kitchen-Layout (app 3D)

App 3D isométrica de diseño de cocina, hecha con Vite + TypeScript + Three.js.

**Web publicada:** https://xoleele.github.io/Kitchen-Layout/

---

## Cómo actualizar la web (rutina normal)

Cada vez que modifiques la app y quieras que se vea online:

1. Abre **GitHub Desktop**.
2. Escribe un resumen del cambio abajo a la izquierda.
3. Clic en **"Commit to master"**.
4. Clic en **"Push origin"** (arriba).
5. Espera 1-2 minutos. La web se actualiza **sola** (gracias a GitHub Actions).

No hace falta usar la terminal ni `npm run deploy`. El despliegue es automático.

### ¿Cómo saber si se publicó bien?

En el repo en GitHub → pestaña **Actions** → la última ejecución debe estar en **verde** ✅.
Si sale roja, abre la ejecución para ver el error.

---

## Cómo trabajar en la app localmente (en tu PC)

Dentro de la carpeta del proyecto, en la terminal:

```
npm install     # solo la primera vez (instala dependencias)
npm run dev      # abre la app en el navegador para probar mientras editas
```

---

## Notas técnicas

- El modelo 3D viaja **incrustado en el código** (`src/model.ts`, en base64).
  No depende del archivo `123.glb` externo.
- La automatización del deploy está en `.github/workflows/deploy.yml`.
- En `vite.config.ts`, la línea `base: '/Kitchen-Layout/'` es necesaria para que
  los recursos carguen bien desde la URL de GitHub Pages. Si renombras el repo,
  hay que actualizar también esa línea.
