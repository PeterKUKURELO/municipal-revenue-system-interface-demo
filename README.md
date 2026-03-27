# Portal de Recaudacion Municipal Demo

Demo web de recaudacion municipal con acceso separado para contribuyente y administracion, flujo de pago embebido y persistencia local para simular cambios de estado entre ambos paneles.

## Que incluye

- Login ciudadano con `DNI + ubigeo`
- Login administrativo independiente
- Dashboard ciudadano con deuda, obligaciones e historial
- Panel admin con metricas y transacciones recientes
- Flujo de pago demo con Pay-Me Flex Payment Forms
- Persistencia compartida en `localStorage`
- Datos base centralizados en `db.json`

## Estructura principal

- [db.json](./db.json): semilla de datos del demo
- [src/app/App.tsx](./src/app/App.tsx): flujo principal, sesiones y sincronizacion entre paneles
- [src/app/storage.ts](./src/app/storage.ts): lectura y guardado en `localStorage`
- [src/app/components/AccessPortal.tsx](./src/app/components/AccessPortal.tsx): acceso ciudadano y admin
- [src/app/components/PaymentFlow.tsx](./src/app/components/PaymentFlow.tsx): seleccion de metodo e integracion demo del gateway
- [vite.config.ts](./vite.config.ts): configuracion de Vite y compatibilidad con GitHub Pages

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Como levantarlo localmente

1. Instala dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run dev
```

3. Si quieres validar el build final:

```bash
npm run build
npm run preview
```

## Credenciales demo

Los accesos se controlan desde `db.json`.

### Contribuyente

- DNI: `45871236`
- Ubigeo: `150114`

### Administracion

- Usuario: `admin`
- Contrasena: `admin123`

## Como funciona la persistencia

El archivo `db.json` se usa como semilla inicial. Una vez que la app corre en el navegador, los cambios se guardan en `localStorage` con la llave:

```txt
municipal-revenue-demo-state
```

Eso significa que:

- si el contribuyente paga, el estado de sus obligaciones cambia a `Pagado`
- el historial reciente se actualiza
- el panel admin ve nuevas transacciones y metricas
- si abres otra pestana del mismo navegador, los cambios se sincronizan

### Reiniciar el demo

Si quieres volver al estado original de `db.json`, borra la llave desde la consola del navegador:

```js
localStorage.removeItem('municipal-revenue-demo-state')
location.reload()
```

## Gateway de pago demo

La integracion actual esta pensada solo para demo visual y pruebas de flujo.

- Carga el JS y CSS de Pay-Me Flex Payment Forms
- Solicita `access token`
- Solicita `nonce`
- Construye el `payload`
- Inicializa `FlexPaymentForms`
- Renderiza el gateway dentro del flujo de pago

### Importante

- Las credenciales de Pay-Me estan expuestas en frontend solo porque este proyecto es una maqueta demo.
- No debe usarse esta estrategia en produccion.

## Como actualizar datos del demo

### Cambiar usuarios o obligaciones

Edita [db.json](./db.json) y luego limpia el `localStorage` si quieres que esos cambios se reflejen desde cero.

### Cambiar branding o logos

Los assets estan en `src/assets`.

## Publicacion en GitHub Pages

Este proyecto ya quedo preparado para GitHub Pages:

- Vite detecta automaticamente el `base` cuando el build corre en GitHub Actions
- se incluyo el workflow [deploy-pages.yml](../.github/workflows/deploy-pages.yml)
- funciona tanto para repos tipo `usuario.github.io` como para repos normales

### Pasos

1. Sube este proyecto a un repositorio en GitHub.
2. Asegurate de incluir la carpeta `.github/workflows`.
3. Haz push a la rama principal, por ejemplo `main`.
4. En GitHub entra a `Settings > Pages`.
5. En `Source`, selecciona `GitHub Actions`.
6. El workflow publicara automaticamente el contenido de `municipal-revenue-system-interface-demo/dist`.

### URL esperada

- Si el repo se llama `usuario.github.io`, la app quedara en:

```txt
https://usuario.github.io/
```

- Si el repo se llama, por ejemplo, `municipal-demo`, la app quedara en:

```txt
https://usuario.github.io/municipal-demo/
```

## Flujo recomendado de despliegue

1. Trabaja localmente con `npm run dev`.
2. Valida con `npm run build`.
3. Haz commit y push.
4. Espera a que GitHub Actions publique la pagina.

## Notas del demo

- La app no usa backend real.
- Todo el estado compartido vive en navegador.
- Para ambientes reales conviene mover autenticacion, tokenizacion y confirmacion de pagos a servicios backend.
