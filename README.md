# LaVaca 🐮
Una aplicación de ahorro comunitario con UI mejorada que permite a grupos de amigos alcanzar metas financieras juntos.

## 🎯 Descripción
LaVaca es una plataforma que facilita el ahorro colaborativo entre grupos de personas. Ya sea que estés planeando un viaje a la playa, una fiesta de cumpleaños o cualquier meta financiera compartida, LaVaca te ayuda a:
- Establecer metas de ahorro grupales
- Hacer seguimiento de los aportes de cada participante
- Visualizar el progreso hacia el objetivo
- Gestionar fechas límite de pago
- Mantener a todos los participantes motivados y comprometidos
- Invitar amigos a unirse a tus "vacas" de ahorro

## 🚀 Estado del Proyecto
En desarrollo activo. Características implementadas:
- Sistema de autenticación completo (Login/Registro/Verificación)
- Interfaz de usuario mejorada con diseño responsivo
- Página de autenticación con animaciones y carrusel informativo
- Fondo SVG ondulado para mejor apariencia visual
- Dashboard interactivo con visualización de vacas
- Creación y gestión de vacas (metas de ahorro grupales)
- Dashboard inteligente que muestra la última vaca visitada
- Sistema de alerta para próximos pagos de vacas pendientes
- Vista optimizada para móviles y tablets con navegación simplificada

## 🔄 En Progreso
- Registro de transacciones y aportes
- Sistema de participantes por vaca
- Sistema de invitaciones a nuevos participantes
- Sistema de notificaciones para invitaciones pendientes

## 🛠 Tecnologías
- React + Vite
- Supabase (Base de datos y Autenticación)
- CSS avanzado con efectos visuales y animaciones
- Glassmorphism y efectos de diseño modernos
- CSS Variables para gestión de temas
- SVG para fondos e ilustraciones
- Context API para manejo de estado
- React Router para navegación
- FontAwesome para iconografía
- LocalStorage para persistencia de datos de usuarios
- Eventos personalizados para actualización en tiempo real

## 🎨 Funcionalidades del Dashboard
- **Tarjeta "Última Vaca Visitada"**: Muestra automáticamente la última vaca que visitaste con su saldo actual y meta
- **Tarjeta "Tus Vacas"**: Visualización animada de la cantidad de vacas activas
- **Tarjeta "Próximo Pago"**: Alerta inteligente que calcula y muestra la vaca con fecha límite más próxima
- **Historial de Transacciones**: Visualización de movimientos recientes
- **Navegación Intuitiva**: Acceso rápido a todas las vacas desde el sidebar
- **Diseño Responsivo**: Adaptación perfecta a cualquier dispositivo

## 📱 Interfaz de Usuario
La aplicación cuenta con:
- Página de inicio con registro/login mejorado visualmente
- Carrusel de imágenes animadas informativas
- Diseño completamente responsivo para móviles, tablets y escritorio
- Transiciones y animaciones suaves para mejor experiencia de usuario
- Dashboard principal con visualización de vacas activas
- Página detallada para cada vaca
- Formularios para crear vacas y registrar aportes
- Sistema de navegación intuitivo
- Interfaz móvil optimizada con navegación inferior

## 🎨 Mejoras Visuales
- Efectos de profundidad y sombras para mejor jerarquía visual
- Paleta de colores consistente a través de variables CSS
- Animaciones sutiles para mejorar la experiencia del usuario
- Diseño optimizado para diferentes tamaños de pantalla
- Transiciones suaves entre componentes

## 📚 Estructura de Base de Datos
El proyecto utiliza Supabase con las siguientes tablas principales:
- **profiles**: Datos de los usuarios registrados
- **vacas**: Proyectos de ahorro creados por los usuarios
- **participants**: Relación entre usuarios y vacas
- **transactions**: Registro de aportes económicos
- **invitations**: Sistema de invitaciones pendientes

## 📋 Próximas Características
- Recordatorios automáticos de pago
- Exportación de reportes de aportes
- Visualización avanzada de estadísticas
- Modo oscuro/claro
- Integración con métodos de pago populares
- Aplicación móvil (React Native)

## 🔧 Instalación
```bash
# Clonar el repositorio
git clone https://github.com/hurtadx/LaVacaReact

# Instalar dependencias
cd LaVacaReact
npm install

# Configurar variables de entorno
# Crear archivo .env.local con credenciales de Supabase

# Iniciar el servidor de desarrollo
npm run dev
```

## 💡 ¿Por qué LaVaca?
LaVaca surge de la necesidad de facilitar el ahorro grupal de manera organizada y transparente. Muchas veces, coordinar ahorros entre amigos puede ser complicado y poco estructurado. Esta aplicación proporciona una solución centralizada para:
- Evitar malentendidos sobre los aportes realizados
- Mantener un registro claro del progreso
- Facilitar la comunicación entre los participantes
- Establecer compromisos claros de ahorro

## 👥 Contribución
¡Las contribuciones son bienvenidas! Si deseas contribuir:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto
Email: andreshm253@gmail.com