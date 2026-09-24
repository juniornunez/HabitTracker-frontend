# Habit Tracker — Frontend

Interfaz web del sistema de gestión de hábitos y metas personales **Habit Tracker**, desarrollada con Next.js y Material UI.

## Tecnologías utilizadas

- **Next.js** (App Router) — framework de React
- **Material UI (MUI)** — sistema de componentes y tema personalizado
- **Zod** — validación de formularios en el cliente
- **Axios** — cliente HTTP hacia la API
- **Recharts** — gráficas del Dashboard y Estadísticas
- **pnpm** — gestor de paquetes

## Arquitectura

```
src/
├── app/
│   ├── login/            Página de inicio de sesión
│   ├── register/          Página de registro
│   ├── dashboard/         Dashboard con resumen y gráficas
│   ├── habits/             Lista de hábitos (CRUD + seguimiento)
│   ├── statistics/         Estadísticas y gráficas
│   ├── profile/            Perfil del usuario y logros
│   └── layout.tsx          Layout raíz (tema de Material UI)
├── components/
│   ├── AppLayout.tsx       Sidebar + navbar responsive, compartido por
│   │                       Dashboard, Hábitos, Estadísticas y Perfil
│   ├── HabitDialog.tsx     Diálogo de crear/editar hábito
│   ├── HabitTodayAction.tsx  Botón de marcar hábito como completado
│   └── ConfirmDialog.tsx   Diálogo de confirmación genérico
├── lib/
│   ├── api.ts               Cliente Axios con interceptor de JWT
│   ├── validation.ts         Esquemas de validación con Zod
│   ├── date.ts               Utilidades de fecha (zona horaria de Honduras)
│   ├── priority.ts            Colores/etiquetas de prioridad
│   ├── habitTracking.ts       Lógica de agrupamiento y días habilitados
│   └── services/               Llamadas a la API (auth, habits, records,
│                                statistics)
└── theme/
    ├── theme.ts               Tema personalizado de Material UI
    └── ThemeRegistry.tsx       Provider del tema
```

## Diseño

- **Paleta**: blanco y azul clarito como colores principales, con acentos de estado estándar (verde éxito, rojo error, ámbar advertencia)
- **Tipografía**: Roboto (por defecto de Material UI)
- **Componentes**: Cards, Diálogos, Snackbars, Alertas, Chips, Progress bars, Gráficas (Recharts)
- **Responsive**: sidebar colapsable en mobile (menú hamburguesa), contenido con ancho máximo en pantallas grandes

## Instalación y ejecución local

### 1. Requisitos previos

- Node.js 18+
- pnpm
- El backend de Habit Tracker corriendo (ver su propio README)

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Ajustalo si tu backend corre en otra URL/puerto.

### 4. Levantar el servidor de desarrollo

```bash
pnpm run dev
```

La app queda disponible en `http://localhost:3000`.

## Sesión

El token JWT se guarda en `sessionStorage` (no `localStorage`), por lo que la sesión se cierra automáticamente al cerrar la pestaña/navegador, además de con el botón "Cerrar sesión" del menú de usuario.

## Páginas principales

| Ruta          | Descripción                                                       |
| ------------- | ----------------------------------------------------------------- |
| `/login`      | Inicio de sesión                                                  |
| `/register`   | Registro de nuevo usuario                                         |
| `/dashboard`  | Resumen de actividad, gráficas semanal y mensual                  |
| `/habits`     | Gestión de hábitos (crear, editar, eliminar, marcar cumplimiento) |
| `/statistics` | Estadísticas y gráficas de cumplimiento                           |
| `/profile`    | Perfil del usuario y logros desbloqueados                         |
