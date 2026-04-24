export default {
  meta: {
    title: 'Política de Seguridad — Denazen',
    description: 'Cómo reportar una vulnerabilidad de seguridad en Denazen y qué esperar de nosotros a cambio.',
  },
  heading: 'Política de Seguridad',
  draftNotice: {
    title: 'Borrador — aún no listo para revisión técnica o de investigación',
    body: 'Esta política es un borrador previo al lanzamiento. El contenido, el alcance y las afirmaciones pueden cambiar antes de que Denazen esté disponible públicamente. No cites esta versión.',
  },
  leadBefore: 'Denazen está construido en torno a sólidas garantías de privacidad y cifrado. Publicamos nuestra ',
  leadArchitectureLink: 'arquitectura de cifrado',
  leadAfter: ' en detalle y damos la bienvenida al escrutinio de la comunidad de investigación en seguridad.',
  intro: 'Esta página describe cómo reportar un problema de seguridad y qué puedes esperar de nosotros a cambio.',

  reporting: {
    heading: 'Reporte de vulnerabilidades',
    p1Before: 'Si crees que has encontrado una vulnerabilidad de seguridad en Denazen, repórtala de forma privada escribiendo a ',
    reportEmail: 'security@denazen.com',
    p1After: '.',
    p2: 'Por favor, no divulgues el problema públicamente antes de darnos una oportunidad razonable de responder. Acusaremos recibo de tu reporte en un plazo de 72 horas y coordinaremos contigo el calendario de divulgación.',
    p3Before: 'Para información de contacto y política legible por máquina, consulta ',
    securityTxtLinkText: 'security.txt',
    p3Between: ', publicado según ',
    rfcLinkText: 'RFC 9116',
    p3After: '.',
  },

  whatToInclude: {
    heading: 'Qué incluir en tu reporte',
    list: [
      'Una descripción del problema y su posible impacto',
      'Pasos para reproducirlo, o una prueba de concepto',
      'La versión de la app o la fecha en que lo probaste',
      'Detalles relevantes del entorno (plataforma, dispositivo)',
      'Tu dirección de contacto preferida y si quieres crédito público',
    ],
    trailing: 'Cuanto más detalle aportes, más rápido podremos clasificarlo.',
  },

  whatWellDo: {
    heading: 'Qué haremos',
    steps: [
      'Acusar recibo en un plazo de 72 horas.',
      'Clasificar el reporte y confirmar si lo consideramos una vulnerabilidad.',
      'Mantenerte informado del progreso en intervalos razonables, normalmente cada 7 a 14 días.',
      'Coordinar contigo un calendario de divulgación. Nuestro estándar es publicar una corrección y luego divulgar públicamente dentro de los 90 días del reporte inicial. Somos flexibles en problemas complejos.',
    ],
    step5Before: 'Darte crédito públicamente en nuestra ',
    step5Link: 'página de agradecimientos',
    step5After: ' si quieres aparecer con tu nombre, o mantener tu reporte anónimo si lo prefieres.',
  },

  scope: {
    heading: 'Alcance',
    inScopeHeading: 'Dentro del alcance',
    inScope: [
      {
        kind: 'linked',
        before: 'El ',
        linkText: 'libro blanco de la arquitectura de cifrado',
        after: ' publicado — fallos a nivel de diseño en el protocolo, la jerarquía de llaves, el sobre del inbox, el patrón de intercambio de llaves o el invariante de privacidad.',
      },
      {
        kind: 'plain',
        text: 'La app móvil de Denazen publicada en la App Store y Google Play — errores criptográficos, de autenticación, autorización o manejo de datos en la compilación publicada.',
      },
      {
        kind: 'plain',
        text: 'Endpoints del servidor de Denazen — el API gateway, el inbox, el índice de publicaciones, el manejo de solicitudes de amistad. Incluye bypass de autenticación, fallos de autorización, inyección y problemas de fuga de datos.',
      },
      {
        kind: 'code',
        before: 'Datos almacenados en registros del AT Protocol accesibles al usuario (colecciones ',
        code: 'com.denazen.*',
        after: ').',
      },
    ],
    outOfScopeHeading: 'Fuera del alcance',
    outOfScope: [
      'Ataques físicos a dispositivos bajo el control del usuario (un dispositivo robado y desbloqueado está fuera de nuestro modelo de amenazas).',
      'Ingeniería social al personal o usuarios de Denazen.',
      'Pruebas de denegación de servicio contra la infraestructura de producción. Reporta preocupaciones de DoS de forma analítica, no mediante ataques de carga reales.',
      'Vulnerabilidades en servicios de terceros con los que nos integramos (PDS de Bluesky, relays del AT Protocol, infraestructura de tiendas de apps). Repórtalas al proveedor correspondiente.',
      'Vulnerabilidades que requieren que un atacante ya posea tu contraseña de cifrado o llave de bóveda.',
      'Reportes generados puramente por escáneres automatizados sin impacto demostrado.',
      'Falta de encabezados de seguridad o flags de cookies en páginas de marketing no sensibles.',
    ],
    askBefore: 'Si no estás seguro de si una prueba específica está dentro del alcance, pregunta primero escribiendo a ',
    askAfter: ' antes de probar.',
  },

  safeHarbor: {
    heading: 'Puerto seguro',
    intro: 'Consideramos que la investigación en seguridad realizada de buena fe bajo esta política es:',
    considerations: [
      'Autorizada bajo nuestros Términos del Servicio',
      'Exenta de cualquier reclamación que de otro modo pudiéramos seguir bajo la Ley de Fraude y Abuso Informático o leyes equivalentes',
      'Exenta de cualquier reclamación bajo leyes anti-circunvención relevantes',
    ],
    noPursuit: 'No emprenderemos acciones legales contra investigadores que:',
    conditions: [
      'Hagan un esfuerzo de buena fe para cumplir con esta política',
      'Eviten violaciones de privacidad, destrucción de datos e interrupción del servicio',
      'Usen solo cuentas que les pertenezcan o a las que tengan permiso explícito de acceso',
      'Nos den un tiempo razonable para abordar el problema antes de la divulgación pública',
      'No exploten el problema más allá de lo necesario para demostrarlo',
    ],
  },

  bugBounty: {
    heading: 'Programa de recompensas',
    body: 'Denazen no ofrece actualmente recompensas pagadas por errores. Proporcionamos reconocimiento público para los reportes válidos y podemos ofrecer otras formas de reconocimiento a medida que el producto madure. Está previsto un programa de recompensas pagadas después del lanzamiento.',
  },

  acknowledgments: {
    heading: 'Agradecimientos',
    before: 'Los investigadores que han reportado problemas de forma responsable a Denazen están listados en nuestra ',
    linkText: 'página de agradecimientos',
    after: '.',
  },

  changelog: {
    heading: 'Registro de cambios',
    before: 'Los cambios importantes en los documentos públicos de seguridad de Denazen — incluido el libro blanco de la arquitectura de cifrado — se registran en el ',
    linkText: 'registro de cambios de seguridad',
    after: '. Si has revisado antes la postura de seguridad de Denazen, esa es la forma más rápida de ver qué ha cambiado.',
  },
};
