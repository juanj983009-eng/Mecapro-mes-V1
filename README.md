# SISTEMA DE EJECUCION DE MANUFACTURA MECA-PRO MES V1.1

Este documento constituye la especificacion tecnica y guia de despliegue oficial para Meca-PRO MES v1.1, un sistema de ejecucion de manufactura (MES) e interfaz hombre-maquina (HMI) de grado industrial desarrollado para plantas de mecanizado y produccion metalmecanica de alta precision.

---

## 1. ESPECIFICACION DEL SISTEMA

### Informacion General
*   **Nombre de la Solucion:** Meca-PRO MES v1.1.
*   **Proposito Operativo:** Control operativo en planta, adquisicion de telemetria basica de piso de produccion y analisis financiero de costos reales de manufactura por orden de trabajo.

### Especificaciones HMI (Human-Machine Interface)
El sistema implementa el sistema de diseno unificado "Midnight Amethyst", disenado para maximizar el rendimiento visual en entornos industriales y mitigar la fatiga ocular del operador bajo iluminacion de planta:
*   **Esquema de Colores:** Fondo de pantalla principal en tono negro-violeta oscuro (#08060D) y contenedores de tarjetas en morado profundo (#120E1E).
*   **Efectos de Translucidez:** Aplicacion de tecnicas de Glassmorphism a traves de la propiedad CSS backdrop-filter con desenfoque de 12px y bordes finos de baja opacidad (rgba(124, 58, 237, 0.15)) para separar capas de control.
*   **Estabilidad Tipografica:** Uso obligatorio de la tipografia monoespaciada JetBrains Mono con la propiedad font-variant-numeric configurada en tabular-nums en contadores de stock, codigos de orden y temporizadores de actividad activa. Esto garantiza anchos de digito identicos, eliminando la vibracion visual del texto durante las actualizaciones de estado en tiempo real.

---

## 2. ARQUITECTURA DE SOFTWARE Y STACK TECNOLOGICO

El sistema utiliza una arquitectura totalmente desacoplada, facilitando el mantenimiento independiente de la logica de negocio y la interfaz de usuario:

### Backend
El servicio de backend esta construido en Java 17 utilizando Spring Boot, estructurado bajo un patron de arquitectura limpia multicapa:
*   **Controller:** Capa de puntos de enlace (endpoints) REST que procesa las solicitudes HTTP entrantes.
*   **DTO (Data Transfer Object):** Modelos dedicados para el transporte de informacion hacia y desde el frontend, evitando la exposicion directa de las entidades de persistencia.
*   **Service:** Implementacion aislada de la logica y reglas de negocio.
*   **Repository:** Abstraccion de persistencia de datos mediante interfaces Spring Data JPA.
*   **Entity:** Modelos relacionales que representan el esquema de base de datos.
*   **Seguridad:** Control perimetral gestionado por Spring Security mediante autorizacion sin estado basada en tokens JWT (JSON Web Tokens).
*   **Base de Datos:** Motor relacional PostgreSQL 16. La gestion del esquema y la inicializacion se realizan de forma automatizada en el arranque mediante Flyway Migrations (archivos .sql en recursos).

### Frontend
El cliente esta estructurado como una aplicacion de pagina unica (SPA) en React:
*   **Gestion de Estado:** Orquestacion asincrona concurrente del estado de la planta mediante Zustand a traves del hook global useUiStore. Los datos criticos de sesion (DNI, token y nombre del operador) se almacenan en RAM al inicio y se sincronizan directamente con endpoints del servidor en consultas Promise.all, lo que elimina consultas redundantes al localStorage del navegador durante el renderizado.
*   **Iconografia:** Proporcionada por la libreria Lucide React en formato vectorial ligero.
*   **Animacion del Sistema de Carga (SplashScreen):** Secuencia de inicio construida con CSS3 nativo y vectores SVG. Utiliza animaciones de contra-giro simultaneas sobre circulos concentricos segmentados mediante las propiedades stroke-dasharray y stroke-dashoffset de SVG.

---

## 3. MODULOS NUCLEO (CORE KEY FEATURES)

### Dashboard Industrial
Dispone de un layout adaptativo asimetrico controlado por el estado global de la aplicacion en Zustand. Ante la activacion de un estado critico del operador (como el inicio de un REFRIGERIO ACTIVO o el registro de una parada tecnica por falla mecanica), la interfaz ejecuta una transicion CSS reasignando las dimensiones de los modulos para otorgar un flex de 65% de ancho de pantalla al boton de control de estado. Esto optimiza el area tactil y disminuye el riesgo de fallas de operacion del operario.

### Flujo de Paradas Tecnicas
Modulo de registro de detenciones estructurado como un stepper de 3 pasos (Paso 1: Seleccion de maquina, Paso 2: Seleccion de causa, Paso 3: Confirmacion). Disenado para operar de forma rapida y tactil (compatible con guantes de seguridad) sin requerir el tipeo de texto libre. Genera de forma automatica minutas estandarizadas para el area de Recursos Humanos (RRHH) conteniendo los motivos detallados de la detencion mediante el uso de modales controlados en React, eliminando el uso de ventanas prompt y alert nativas del navegador.

### Gestion de Recursos
Catalogo unificado de existencias dividido en Equipos de Proteccion Personal (EPPs) y Herramental. Cuenta con vistas de tabla asincronas con banding violeta alternado de baja opacidad para mejorar el escaneo ocular de registros, acompañadas de pildoras indicadoras de stock (verde, amarillo y rojo de alerta de desabastecimiento) y controles reactivos contra solicitudes de inventario sin existencias fisicas disponibles.

### Analisis Financiero de Costos
Consola analitica gerencial que realiza un aislamiento relacional de base de datos agrupado de manera estricta por el identificador unico de Hoja de Proceso (HP). El motor financiero extrae las duraciones reales de operacion (tiempo de produccion activa y paradas mecanicas), calcula los costos proporcionales asociados a la mano de obra del operador, horas de ejecucion de maquina, coste de materiales y overheads asociados, computando de forma automatica la rentabilidad real de la orden.

---

## 4. PROTOCOLO DE DESPLIEGUE E INFRAESTRUCTURA (QUICK START)

La infraestructura de servicios esta orquestada a traves de contenedores mediante Docker y Docker-Compose.

### Arranque Limpio del Ecosistema
Para compilar los fuentes locales, invalidar la cache previa de imagenes y levantar todos los servicios en segundo plano, ejecute el siguiente comando en la terminal desde la raiz de la solucion:

```bash
docker-compose down && docker-compose up --build -d
```

### Tabla de Red y Puertos Expuestos
Una vez iniciados los contenedores, las interfaces de red estaran mapeadas bajo los siguientes parametros:

| Servicio | Contenedor | Puerto Interno | Puerto Host | Protocolo |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Web (Nginx) | mecapro-web | 80 | 80 | HTTP |
| Spring Boot API | mecapro-api | 8081 | 8081 | HTTP |
| Base de Datos SQL | mecapro-postgres | 5432 | 5432 | TCP (PostgreSQL) |

### Credenciales de Pruebas
Para acceder a la consola HMI del operador localmente sin configurar un servidor de autenticacion corporativo:
*   **DNI de Acceso Autorizado:** 77777777

---

## 5. INDICADORES DE CALIDAD DE CODIGO

El codigo fuente de la solucion esta sujeto a politicas estrictas de entrega continua y control de deuda tecnica:
*   **Compilacion de Produccion:** Verificada de forma automatica en el empaquetado del frontend mediante configuraciones webpack bajo react-scripts.
*   **Conformidad:** El proceso de construccion finaliza con estado exitoso (Compiled successfully), garantizando la presencia de 0 errores de sintaxis y 0 advertencias (warnings) de ESLint no resueltas.
