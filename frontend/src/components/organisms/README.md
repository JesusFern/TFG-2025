# Interfaz de Perfil de Usuario

## Descripción

La interfaz de perfil de usuario es un sistema completo que permite a los usuarios visualizar y editar su información personal, datos de salud y actividad física. Está construida siguiendo la arquitectura de componentes de Mantine y utiliza la paleta de colores personalizada de Nutroos.

## Componentes

### 1. ProfileHeader
- **Ubicación**: `src/components/molecules/ProfileHeader.tsx`
- **Función**: Muestra la información principal del usuario incluyendo avatar, nombre, rol y badges
- **Características**:
  - Avatar con botón de edición de foto
  - Información personal básica
  - Badges de rol y tipo de trabajador
  - Botón de edición del perfil

### 2. ProfileStats
- **Ubicación**: `src/components/molecules/ProfileStats.tsx`
- **Función**: Muestra estadísticas y métricas del usuario
- **Características**:
  - Métricas principales (edad, fecha de registro, objetivo de peso, nivel de actividad)
  - Cálculo automático de IMC con categorización
  - Información de salud y actividad física

### 3. ProfileForm
- **Ubicación**: `src/components/molecules/ProfileForm.tsx`
- **Función**: Formulario de edición del perfil
- **Características**:
  - Validación de campos en tiempo real
  - Campos específicos según el rol del usuario
  - Manejo de errores y estados de carga

### 4. ProfilePage (Organismo)
- **Ubicación**: `src/components/organisms/ProfilePage.tsx`
- **Función**: Componente principal que integra todos los subcomponentes
- **Características**:
  - Sistema de pestañas para organizar la información
  - Modales para edición y cambio de foto
  - Manejo de estados y alertas

## Páginas

### ProfilePage
- **Ubicación**: `src/pages/ProfilePage.tsx`
- **Función**: Página principal del perfil
- **Características**:
  - Datos mock para desarrollo
  - Integración con servicios de API
  - Manejo de estados y efectos

## Servicios

### profileService
- **Ubicación**: `src/services/profileService.ts`
- **Función**: Maneja todas las operaciones relacionadas con el perfil
- **Métodos**:
  - `getProfile(userId)`: Obtener perfil del usuario
  - `updateProfile(userId, data)`: Actualizar perfil
  - `getDatosSalud(userId)`: Obtener datos de salud
  - `getDatosActividad(userId)`: Obtener datos de actividad
  - `uploadProfilePhoto(userId, file)`: Subir foto de perfil
  - `changePassword(userId, currentPassword, newPassword)`: Cambiar contraseña
  - `deleteAccount(userId, password)`: Eliminar cuenta

## Tipos

### profile.ts
- **Ubicación**: `src/types/profile.ts`
- **Función**: Define todas las interfaces TypeScript para el perfil
- **Interfaces**:
  - `UserProfile`: Perfil principal del usuario
  - `DatosSaludYNutricion`: Datos de salud y nutrición
  - `DatosActividadFisica`: Datos de actividad física
  - `ProfileFormData`: Datos del formulario de edición
  - `ProfileFormErrors`: Errores de validación

## Estilos

### ProfilePage.module.css
- **Ubicación**: `src/styles/ProfilePage.module.css`
- **Función**: Estilos específicos para la página de perfil
- **Características**:
  - Paleta de colores de Nutroos
  - Diseño responsive
  - Animaciones y transiciones
  - Gradientes y sombras personalizadas

## Uso

### 1. Importar el componente
```tsx
import { ProfilePage } from '../components/organisms/ProfilePage';
```

### 2. Usar en una página
```tsx
const MyPage = () => {
  const handleUpdateProfile = async (data) => {
    // Lógica para actualizar perfil
  };

  const handleUpdatePhoto = async (file) => {
    // Lógica para actualizar foto
  };

  return (
    <ProfilePage
      profile={userProfile}
      datosSalud={healthData}
      datosActividad={activityData}
      onUpdateProfile={handleUpdateProfile}
      onUpdatePhoto={handleUpdatePhoto}
    />
  );
};
```

### 3. Agregar a las rutas
```tsx
<Route path="/profile" element={
  <Layout>
    <ProfilePage />
  </Layout>
} />
```

## Características de Diseño

### Paleta de Colores
- **Verde principal**: `#4cb46f` (nutroos-green.6)
- **Verde claro**: `#93d2aa` (nutroos-green.3)
- **Verde oscuro**: `#3d9d5d` (nutroos-green.7)
- **Grises**: Escala personalizada con toques verdes

### Componentes Mantine Utilizados
- `Container`, `Paper`, `Stack`, `Group`
- `Avatar`, `Badge`, `Button`, `ActionIcon`
- `TextInput`, `Select`, `DatePickerInput`, `Textarea`
- `Modal`, `Tabs`, `Alert`, `Text`

### Iconos
- Utiliza `@tabler/icons-react` para consistencia visual
- Iconos contextuales para cada sección

## Responsive Design

- **Desktop**: Layout completo con todas las funcionalidades
- **Tablet**: Adaptación de espaciados y tamaños
- **Mobile**: Stack vertical y modales optimizados

## Validaciones

- **Campos requeridos**: Nombre, email, teléfono, género, fecha de nacimiento
- **Validación de email**: Formato estándar
- **Validación de teléfono**: Formato internacional
- **Campos específicos de trabajador**: Biografía y disponibilidad obligatorias

## Estado y Manejo de Errores

- Estados de carga para operaciones asíncronas
- Alertas de éxito y error
- Validación en tiempo real
- Manejo de errores de API

## Integración con Backend

La interfaz está preparada para integrarse con el backend existente:
- Endpoints de usuario (`/api/users/:id`)
- Endpoints de datos de salud y actividad
- Autenticación mediante tokens JWT
- Manejo de roles y permisos
