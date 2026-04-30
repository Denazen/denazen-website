type Block =
  | { kind: 'p'; html: string }
  | { kind: 'h3'; text: string; id?: string }
  | { kind: 'h4'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][]; className?: string }
  | { kind: 'code'; text: string }
  | { kind: 'callout'; variant: 'status' | 'invariant'; label: string; body: string }
  | { kind: 'figure'; src: string; alt: string; caption: string; width: number; height: number }
  | { kind: 'hr' };

interface Section {
  id: string;
  heading: string;
  blocks: Block[];
}

const content: {
  meta: { title: string; description: string };
  heading: string;
  lead: string;
  plainLang: { before: string; linkText: string; after: string };
  lastUpdated: { before: string; date: string; text: string; between: string; linkText: string };
  draftNotice: { title: string; body: string };
  toc: { heading: string; sections: { id: string; label: string }[] };
  preambleBlocks: Block[];
  sections: Section[];
} = {
  meta: {
    title: 'Penrose',
    description:
      'La arquitectura de cifrado de extremo a extremo de Penrose: modelo de contenido de confianza cero, intercambio de llaves post-cuántico (ML-KEM-1024, NIST Nivel 5), jerarquía de bóveda de cuatro niveles, inbox con metadatos mínimos y el invariante de privacidad a prueba de fallos.',
  },
  heading: 'Arquitectura de seguridad y cifrado',
  lead:
    'Un libro blanco técnico que describe el modelo de cifrado de extremo a extremo usado por Penrose. Escrito para ingenieros de seguridad, criptógrafos y desarrolladores que evalúan las garantías de privacidad de Penrose.',
  plainLang: {
    before: '¿Prefieres la versión en lenguaje sencillo? Consulta las ',
    linkText: 'preguntas frecuentes',
    after: '.',
  },
  lastUpdated: {
    before: 'Última actualización: ',
    date: '2026-04-23',
    text: '23 de abril de 2026',
    between: ' · ',
    linkText: 'Ver registro de cambios',
  },
  draftNotice: {
    title: 'Borrador — aún no listo para revisión técnica o de investigación',
    body: 'Este documento de arquitectura es un borrador previo al lanzamiento. El contenido, el alcance y las afirmaciones pueden cambiar antes de que Penrose esté disponible públicamente. No cites esta versión.',
  },
  toc: {
    heading: 'Contenido',
    sections: [
      { id: 'threat-model', label: '1. Modelo de amenazas' },
      { id: 'zero-trust-scope', label: '1.4 Alcance de confianza cero' },
      { id: 'primitives', label: '2. Primitivas criptográficas' },
      { id: 'key-hierarchy', label: '3. Jerarquía de llaves' },
      { id: 'unlock', label: '4. Flujo de desbloqueo' },
      { id: 'password-strength', label: '4.1 Fuerza de la contraseña' },
      { id: 'recovery', label: '4.2 Recuperación' },
      { id: 'devices', label: '4.3 Dispositivos' },
      { id: 'auto-relogin', label: '4.4 Persistencia en el dispositivo' },
      { id: 'posting', label: '5. Publicación: cifrado en dos niveles' },
      { id: 'media-sanitization', label: '5.5 Saneamiento de medios' },
      { id: 'deletion', label: '5.6 Eliminación' },
      { id: 'replies', label: '6. Respuestas y citas' },
      { id: 'reading', label: '7. Lectura: descifrado' },
      { id: 'inbox', label: '8. Intercambio de llaves e inbox' },
      { id: 'push', label: '8.7 Notificaciones push' },
      { id: 'invariant', label: '9. Invariante de privacidad' },
      { id: 'rotation', label: '10. Rotación' },
      { id: 'storage', label: '11. Límites de almacenamiento' },
      { id: 'telemetry', label: '12. Telemetría' },
      { id: 'moderation', label: '13. Abuso y moderación' },
      { id: 'legal-process', label: '14. Proceso legal' },
      { id: 'audit', label: '15. Auditoría y divulgación' },
      { id: 'future-work', label: '16. Trabajo futuro' },
      { id: 'verification', label: '17. Historia de verificación' },
      { id: 'summary', label: '18. Resumen' },
      { id: 'glossary', label: 'Apéndice A. Glosario' },
    ],
  },
  preambleBlocks: [
    {
      kind: 'p',
      html:
        '<strong>Penrose apunta a un modelo de contenido de confianza cero.</strong> Ningún servidor, proveedor de infraestructura o desarrollador de Penrose puede leer contenido en texto plano o material de llaves, y ningún atacante de red — incluido un Personal Data Server (PDS) comprometido — puede sustituir llaves sin ser detectado.',
    },
    { kind: 'p', html: 'Tres propiedades sustentan esta garantía:' },
    {
      kind: 'ol',
      items: [
        '<strong>Contraseña de cifrado independiente.</strong> La jerarquía de llaves de la bóveda se deriva de una contraseña de cifrado que nunca se envía a Bluesky ni a ningún otro servidor.',
        '<strong>Vinculación de llaves Trust-On-First-Use (TOFU).</strong> La llave pública post-cuántica de un contacto se identifica mediante huella y se vincula en el primer intercambio. Todos los intercambios posteriores se comprueban contra la huella vinculada; un operador de PDS que luego sustituya la llave es detectado. Está prevista la verificación de primer contacto mediante números de seguridad / código QR para cerrar la ventana residual del primer intercambio — consulta la sección de Trabajo futuro.',
        '<strong>Inbox de remitente sellado.</strong> Los mensajes del inbox — solicitudes de amistad, comparticiones de llaves de círculo, aceptaciones y mensajes directos — viajan como sobres sellados de dos capas. La capa externa oculta por completo la identidad del remitente al servidor del inbox. La capa interna autentica al remitente ante el destinatario mediante una llave que el servidor no puede derivar. Un operador de PDS que sustituya la llave pública de un contacto después del primer contacto es detectado; uno que intente impersonar a un contacto establecido en el inbox es rechazado cuando el destinatario abre el sobre.',
      ],
    },
    { kind: 'hr' },
  ],
  sections: [
    {
      id: 'threat-model',
      heading: '1. Modelo de amenazas',
      blocks: [
        { kind: 'h3', text: '1.1 Activos protegidos' },
        {
          kind: 'table',
          headers: ['Activo', 'Protección'],
          rows: [
            ['Texto e imágenes de publicaciones (modo privado)', 'Confidencialidad + integridad'],
            ['Mensajes directos', 'Confidencialidad + integridad'],
            ['Membresía de círculo (quién puede leer una publicación)', 'Confidencialidad frente a no miembros'],
            ['Grafo de contactos (quién envía mensajes a quién)', 'Opacado al servidor de inbox'],
            ['Llaves de cifrado en reposo (en el dispositivo y el servidor)', 'Confidencialidad + integridad'],
            ['Llaves de cifrado en tránsito (intercambio de llaves)', 'Confidencialidad + resistencia post-cuántica'],
          ],
        },
        { kind: 'h3', text: '1.2 Adversarios considerados' },
        {
          kind: 'table',
          headers: ['Adversario', 'Capacidad', 'Resultado bajo Penrose'],
          rows: [
            ['Observador pasivo de red', 'Interceptación TLS', 'Solo ve texto cifrado y tráfico protegido por TLS'],
            [
              'Operador de PDS de Bluesky',
              'Lectura/escritura completa en el repositorio del usuario',
              'Solo ve blobs cifrados, URIs de llaves y metadatos; no puede derivar llaves de descifrado; no puede sustituir la llave pública de un contacto sin ser detectado',
            ],
            [
              'AppView / Relay de Bluesky',
              'Visibilidad completa del grafo social',
              'Ve metadatos de publicaciones y el grafo de seguimientos; no ve contenido ni llaves',
            ],
            [
              'Relay / base de datos de Penrose',
              'Lectura completa del lado del servidor',
              'Solo ve payloads cifrados, DIDs y metadatos',
            ],
            [
              'Gateway del lado del servidor comprometido',
              'Acceso de corto plazo a las solicitudes',
              'Solo ve tokens de acceso emitidos por OAuth y pruebas DPoP por solicitud para verificación de identidad; sin secretos de larga vida. Los tokens de acceso están ligados mediante DPoP a pares de llaves por sesión guardados en los elementos seguros del dispositivo del usuario (RFC 9449), así que capturar un token no permite por sí solo suplantar al usuario.',
            ],
            [
              'Desarrollador de Penrose con acceso a la base de datos',
              'Metadatos + texto cifrado del servidor',
              'No puede derivar texto plano — la misma posición que el servidor',
            ],
            [
              'Dispositivo perdido o robado (bloqueado)',
              'Acceso físico al almacenamiento del dispositivo',
              'No puede leer material de llaves sin desbloqueo del dispositivo + contraseña de cifrado',
            ],
            [
              'Adversario cuántico futuro',
              'Algoritmo de Shor sobre intercambio de llaves clásico; algoritmo de Grover sobre llaves simétricas',
              'ML-KEM-1024 (KEM post-cuántico NIST Nivel 5) para todo intercambio de llaves; AES-256 para todo contenido y envoltura de llaves',
            ],
          ],
        },
        { kind: 'h3', text: '1.3 No-objetivos / límites explícitos' },
        {
          kind: 'ul',
          items: [
            '<strong>Sin secreto perfecto hacia adelante para llaves de larga vida.</strong> Las llaves de círculo y las llaves de mensajería persisten hasta que se rotan; el compromiso de una llave de mensajería actual expone los mensajes pasados cifrados con esa llave. La rotación está disponible pero no es automática por mensaje.',
            '<strong>Sin protección ante un dispositivo comprometido.</strong> Si un atacante tiene el dispositivo desbloqueado <em>y</em> la contraseña de cifrado del usuario, lo lee todo. Esta es la línea base estándar para sistemas cifrados de extremo a extremo.',
            '<strong>Los metadatos son parcialmente visibles.</strong> Los conteos de publicaciones, los tiempos y el grafo de seguimiento de Bluesky siguen siendo visibles para Bluesky mismo. El inbox (para mensajes directos e intercambios de llaves) está diseñado para ocultar la identidad del remitente y el tipo de mensaje al servidor que los almacena.',
            '<strong>Las direcciones IP y los metadatos a nivel de red son visibles.</strong> Los clientes se comunican directamente con el servidor de Penrose y con los PDS de Bluesky sobre TLS; no se aplica ruteo tipo onion, proxy ni capa de transporte sellada. Cualquiera con visibilidad a nivel de red ve que una IP determinada se comunica con Penrose, aunque no pueda ver lo que se dice. Los usuarios que requieran anonimato a nivel de red deben enrutar su tráfico a través de una capa de anonimato separada.',
          ],
        },
        { kind: 'h3', text: '1.4 Qué cubre la confianza cero — y qué no', id: 'zero-trust-scope' },
        {
          kind: 'p',
          html:
            'El «modelo de contenido de confianza cero» de Penrose es una afirmación precisa y auditable. No es una afirmación de que nada es de confianza. Esta subsección indica exactamente qué cubre la afirmación y qué no, para que los revisores puedan evaluarla contra un alcance concreto.',
        },
        { kind: 'h4', text: 'Qué SÍ es de confianza cero' },
        {
          kind: 'ul',
          items: [
            '<strong>Confidencialidad del contenido.</strong> Ningún servidor — PDS de Bluesky, relay de Penrose, función edge de Penrose — puede leer una publicación privada, un DM o un intercambio de llave de círculo. El texto cifrado es opaco en reposo y en tránsito; el material de descifrado vive solo en los dispositivos de los destinatarios elegidos.',
            '<strong>Confidencialidad del material de llaves.</strong> La Llave de Bóveda nunca sale del dispositivo en texto plano. La Llave Maestra llega al servidor de Penrose solo como EMK (envuelta por la PDK). Las llaves simétricas de larga vida — mensajería, círculo, contenido, secreto Kyber — se envuelven en reposo y se cifran bajo secretos compartidos efímeros en tránsito. Ningún servidor posee, ni puede derivar, material de llaves en texto plano.',
            '<strong>Resistencia a MITM (con verificación fuera de banda, planificada).</strong> Trust-On-First-Use vincula la llave pública ML-KEM-1024 de un contacto en el primer intercambio y detecta cualquier sustitución posterior. Cuando se entregue la verificación fuera de banda (consulta Trabajo futuro), la ventana residual de primer contacto se cierra y un PDS comprometido no puede sustituir la llave pública de un contacto sin ser detectado.',
            '<strong>No vinculabilidad del remitente en el inbox.</strong> El servidor del inbox no puede saber quién envió un mensaje dado. La identidad del remitente se cifra bajo la llave pública post-cuántica del destinatario dentro del sobre sellado (§8.2.1) y solo el destinatario puede recuperarla. Dos sobres del mismo remitente al mismo destinatario son indistinguibles como texto cifrado.',
            '<strong>El invariante de privacidad a prueba de fallos (§9).</strong> Un usuario que quiere crear una publicación privada no puede producir silenciosamente una pública. Esto se aplica como una propiedad estructural del cliente, no como una política.',
            '<strong>Rechazo de aceptaciones falsificadas.</strong> Una comprobación del lado del remitente valida que las aceptaciones entrantes correspondan a solicitudes salientes que el usuario realmente envió, así que un atacante no puede inyectar una «aceptación de Bob» falsa que Alice nunca solicitó.',
          ],
        },
        { kind: 'h4', text: 'Qué NO es de confianza cero' },
        {
          kind: 'ul',
          items: [
            '<strong>Metadatos y tiempos.</strong> El AppView y el Relay de Bluesky ven conteos de publicaciones, marcas de tiempo, grafos de seguimiento y contenido público. El inbox oculta la identidad del remitente y el tipo de mensaje, pero no los tiempos de actividad por usuario ni los conteos de mensajes.',
            '<strong>Disponibilidad.</strong> Los servidores de Penrose y la infraestructura de Bluesky deben estar activos para que el servicio sea usable. Un operador malicioso puede negar el servicio; simplemente no puede leer contenido privado.',
            '<strong>Publicaciones en texto plano de la capa de Bluesky.</strong> Las publicaciones públicas (registros <code>app.bsky.feed.post</code> sin el marcador de cifrado de Penrose) están en texto plano en la infraestructura de Bluesky por diseño — eso es lo que las hace públicas. Su integridad es la que Bluesky proporcione.',
            '<strong>Credenciales de la cuenta de Bluesky.</strong> La contraseña de Bluesky (o passkey, factor 2FA, etc.) se ingresa en la página de inicio de sesión alojada por Bluesky y es procesada por la infraestructura de Bluesky. Penrose no ve, toca ni posee estas credenciales en ningún momento — pero su confidencialidad es responsabilidad de Bluesky, no de Penrose. Un usuario que reutiliza su contraseña de Bluesky en otros lugares acepta los riesgos de esa reutilización. Un usuario cuya cuenta de Bluesky se vea comprometida a nivel de Bluesky verá que su contenido privado de Penrose permanece cifrado (eso es lo que protege la contraseña de cifrado), pero el atacante podrá autorizar una sesión OAuth nueva en Penrose y estaría entonces limitado solo por la barrera de la contraseña de cifrado.',
            '<strong>Intercambios de primer contacto antes de que se entregue la verificación fuera de banda.</strong> TOFU detecta cualquier sustitución de llave tras el primer contacto, pero no durante él. Un operador de PDS que sustituya la llave de un contacto <em>antes</em> de la primera vinculación puede inyectarse; la detección requiere la función de verificación OOB (consulta Trabajo futuro).',
            '<strong>Equivalencia de contraseña elegida por el usuario.</strong> Toda garantía criptográfica se apoya en última instancia en la entropía de la contraseña de cifrado (§4.1). Un usuario que elige una contraseña de baja entropía acepta un margen más débil frente a ataques offline. La arquitectura ofrece herramientas; no puede imponer buenas elecciones de contraseña más allá del mínimo de 12 caracteres.',
          ],
        },
        { kind: 'h4', text: 'Qué significa esto para la raíz de confianza' },
        { kind: 'p', html: 'El modelo de contenido de confianza cero reduce el conjunto de partes que deben ser de confianza para la confidencialidad a:' },
        {
          kind: 'ol',
          items: [
            '<strong>El dispositivo del usuario.</strong> El almacenamiento seguro de la plataforma (iOS Keychain / Android Keystore) guarda las llaves desbloqueadas por la sesión; un dispositivo comprometido queda explícitamente fuera del alcance (§1.3).',
            '<strong>La contraseña de cifrado del usuario.</strong> Nunca se transmite. La entropía determina el margen frente a ataques offline (§4.1).',
            '<strong>(Una vez que se entregue la verificación fuera de banda)</strong> La atestación fuera de banda del usuario de las huellas de los contactos — un segundo canal que no pasa por la infraestructura de Penrose ni de Bluesky.',
          ],
        },
        {
          kind: 'p',
          html:
            'Ni el PDS de Bluesky, ni el relay de Penrose, ni ningún operador externo aparecen en esta lista. Eso es lo que significa «confianza cero» aquí, y ese es su alcance preciso.',
        },
      ],
    },
    {
      id: 'primitives',
      heading: '2. Primitivas criptográficas',
      blocks: [
        {
          kind: 'p',
          html: 'Todas las bibliotecas criptográficas están vendidas localmente o fijadas a versiones exactas para evitar una deriva silenciosa de algoritmos.',
        },
        {
          kind: 'table',
          headers: ['Propósito', 'Primitiva'],
          rows: [
            ['Derivación de llaves a partir de contraseña', 'Argon2id (libsodium)'],
            [
              'Cifrado simétrico autenticado (material de llaves, DMs, inbox)',
              'XSalsa20-Poly1305 (<code>crypto_secretbox</code>, libsodium)',
            ],
            ['Cifrado de contenido en bloque (archivos <code>.zen</code>, imágenes)', 'AES-CBC-256 con PKCS7'],
            ['Intercambio de llaves post-cuántico', 'ML-KEM-1024 (Kyber), NIST Nivel 5, auditado por Cure53'],
            ['Función de derivación de llaves', 'HKDF-SHA256 (RFC 5869)'],
            ['Hashing con llave', 'HMAC-SHA256'],
            ['Hash', 'SHA-256, SHA-3'],
            ['Aleatorio seguro', 'CSPRNG de la plataforma'],
          ],
        },
        { kind: 'p', html: 'Notas:' },
        {
          kind: 'ul',
          items: [
            'AES-CBC se usa solo para contenido en bloque donde la posesión de la llave de contenido es la frontera de control de acceso. Todo el material de llaves y todos los mensajes se autentican mediante XSalsa20-Poly1305.',
            'ML-KEM-1024 apunta a la seguridad post-cuántica NIST Nivel 5 — el conjunto de parámetros más alto del estándar. Se usa solo para encapsulación de llaves; los secretos compartidos derivados envuelven llaves simétricas de larga vida una vez y luego se descartan.',
            'HKDF-SHA256 se usa dentro del sobre del inbox de remitente sellado (§8) para derivar llaves de cifrado por sobre a partir del secreto compartido post-cuántico, y para derivar sub-llaves para los IDs de conversación de mensajes directos a partir de la llave de la bóveda. Las llaves de larga vida nunca se usan directamente como llaves HMAC — sub-llaves para propósitos distintos siempre se derivan vía HKDF con una cadena <code>info</code> estrechamente ligada (separación criptográfica de llaves estándar).',
            'Cada primitiva simétrica de la pila usa una llave de 256 bits. Bajo el algoritmo de Grover esto da un suelo efectivo de seguridad post-cuántica de 2^128 por capa.',
          ],
        },
      ],
    },
    {
      id: 'key-hierarchy',
      heading: '3. Jerarquía de llaves',
      blocks: [
        {
          kind: 'p',
          html:
            'Penrose usa una <strong>jerarquía de bóveda de cuatro niveles</strong> para la protección de llaves en reposo y una familia separada de <strong>llaves de contenido / intercambio</strong> para mensajería y publicaciones.',
        },
        { kind: 'h3', text: '3.1 Jerarquía de bóveda (en reposo)' },
        {
          kind: 'figure',
          src: '/images/diagram-vault-hierarchy.svg',
          alt: 'Diagrama de jerarquía de bóveda de cuatro niveles: la contraseña de cifrado alimenta a Argon2id para derivar la Llave Derivada de Contraseña. La PDK cifra la Llave Maestra (almacenada en el servidor como EMK). La Llave Maestra cifra la Llave de Bóveda (almacenada en el PDS como EVK). La Llave de Bóveda protege llaves por registro — círculo, amigo, mensajería, secreto Kyber y llaves de contenido por publicación.',
          caption:
            'Figura 1. Jerarquía de bóveda de cuatro niveles. Cada capa envuelve a la siguiente; solo la contraseña de cifrado sale del dispositivo en texto plano (en la cabeza del usuario).',
          width: 720,
          height: 620,
        },
        {
          kind: 'p',
          html: '<strong>¿Por qué dos saltos (PDK → Maestra → Bóveda) en lugar de uno?</strong>',
        },
        {
          kind: 'ul',
          items: [
            'La <strong>Llave Maestra</strong> vive en el servidor de Penrose (cifrada por la PDK); la <strong>EVK</strong> vive en el PDS de Bluesky del usuario (cifrada por la Llave Maestra).',
            'Para montar un ataque offline de fuerza bruta contra la contraseña de cifrado, un atacante necesita <em>tanto</em> (a) la EMK del servidor de Penrose como (b) la EVK más la sal y los parámetros de Argon2 del PDS. Ningún servidor individual, y ningún operador comprometido individual, posee material suficiente para ejecutar el ataque.',
            'Los cambios de contraseña reenvuelven la Llave Maestra con una nueva PDK pero dejan la Llave de Bóveda (y por tanto todo el cifrado por registro) intacta — sin tormenta de recifrado.',
          ],
        },
        { kind: 'h3', text: '3.2 Llaves de contenido e intercambio' },
        {
          kind: 'table',
          headers: ['Llave', 'Vida útil', 'Propósito', 'Envuelta por'],
          rows: [
            [
              'Secreto compartido (ML-KEM-1024)',
              'Efímero',
              'Envuelve la llave de mensajería solo durante el intercambio de llaves',
              'n/a — derivada una vez por encapsulate/decapsulate',
            ],
            [
              'Llave de mensajería (AES-256)',
              'Por contacto, larga duración',
              'Cifra DMs, intercambios de llaves de círculo, payloads de llaves de amigo',
              'Secreto compartido (durante el intercambio); llave de bóveda (en reposo)',
            ],
            [
              'Llave de círculo (AES-256)',
              'Por círculo, larga duración',
              'Envuelve las llaves de contenido por publicación',
              'Llave de mensajería (cuando se comparte); llave de bóveda (en reposo)',
            ],
            [
              'Llave de contenido (AES-256)',
              'Una por publicación',
              'Cifra los archivos <code>.zen</code> adjuntos de una sola publicación',
              'Llave de círculo',
            ],
          ],
        },
        { kind: 'p', html: 'Reglas aplicadas en toda la base de código:' },
        {
          kind: 'ul',
          items: [
            'Los secretos compartidos nunca se usan para cifrar contenido — solo para envolver la llave de mensajería.',
            'Las llaves de círculo nunca se envían sin envolver; siempre se entregan dentro de un payload cifrado con la llave de mensajería.',
            'La Llave de Bóveda nunca sale del dispositivo en texto plano; solo la forma envuelta por la PDK (EMK) llega al servidor.',
          ],
        },
      ],
    },
    {
      id: 'unlock',
      heading: '4. Flujo de desbloqueo',
      blocks: [
        {
          kind: 'code',
          text: `"Continuar con Bluesky" → hoja de navegador en la app → inicio de sesión alojado en bsky.social.
   ▼ (el usuario se autentica con Bluesky en la página alojada de Bluesky)
La devolución de OAuth retorna tokens de acceso + refresco ligados a DPoP.
   ▼
El usuario envía la contraseña de cifrado.
   ▼
Derivar PDK = Argon2id(contraseña_de_cifrado, sal).
   ▼
Obtener EMK del servidor de Penrose.
   ▼
Llave Maestra = descifrar(EMK, PDK, XSalsa20-Poly1305).
   Fallo de MAC → "contraseña de cifrado incorrecta" (no "no hay cuenta").
   ▼
Obtener EVK del PDS.
   ▼
Llave de Bóveda = descifrar(EVK, Llave Maestra).
   ▼
Almacenar {PDK, Maestra, Bóveda} en el almacenamiento seguro del dispositivo para la sesión.`,
        },
        {
          kind: 'p',
          html:
            'La parte de autenticación con Bluesky corre en la página alojada por Bluesky (<code>bsky.social</code>) dentro de una hoja de navegador gestionada por el SO (<code>ASWebAuthenticationSession</code> en iOS, Custom Tabs en Android). Bluesky maneja el ingreso de usuario / correo, contraseña (o passkey), 2FA, captcha y confirmación por correo — Penrose nunca ve las credenciales de Bluesky del usuario. El flujo OAuth retorna un token de acceso ligado a un par de llaves DPoP por sesión (RFC 9449); el par de llaves se genera en el dispositivo, se persiste de forma no extraíble en iOS Keychain / Android Keystore, y se usa para firmar cada solicitud al PDS. La renovación del token la maneja de forma transparente <code>@atproto/oauth-client-expo</code> sin re-solicitud visible.',
        },
        { kind: 'p', html: '<strong>La configuración inicial</strong> es a prueba de fallos en tres fases:' },
        {
          kind: 'ol',
          items: [
            'Generar la Llave Maestra, la Llave de Bóveda, la EMK y la EVK en memoria — sin E/S de red todavía.',
            'Una sola llamada al servidor crea el perfil y almacena la EMK de forma atómica. En caso de fallo: no se ha escrito nada en el PDS, así que el reintento regenera limpiamente.',
            'Escritura en el PDS: guardar la EVK y los parámetros de Argon2 en el registro de seguridad. En caso de fallo: el único huérfano es la EMK en el servidor, que un reintento limpio reemplaza.',
          ],
        },
        { kind: 'p', html: 'En ningún paso se transmite una llave en texto plano a ningún lugar.' },
        { kind: 'h3', text: '4.1 Fuerza de la contraseña de cifrado', id: 'password-strength' },
        {
          kind: 'p',
          html:
            'Toda garantía criptográfica de este documento finalmente se apoya en la entropía de la contraseña de cifrado del usuario. La dureza de memoria de Argon2id encarece cada intento de fuerza bruta — incluso para un adversario cuántico, porque la memoria cuántica coherente es catastróficamente costosa — pero no puede crear entropía que la contraseña misma no contenga.',
        },
        { kind: 'h4', text: 'La política aplicada por la app' },
        {
          kind: 'ul',
          items: [
            '<strong>Longitud mínima:</strong> 12 caracteres. Este es el único requisito duro para el envío.',
            '<strong>Sin longitud máxima.</strong> Las frases de paso son bienvenidas.',
            '<strong>Independiente de la contraseña de Bluesky.</strong> Las credenciales de Bluesky se ingresan en la página alojada de inicio de sesión de Bluesky durante el flujo OAuth y nunca tocan el proceso de Penrose; no hay oportunidad de que la contraseña de cifrado se filtre de forma cruzada a través de Penrose aunque el usuario elija cadenas idénticas. (Aun así, se recomienda encarecidamente elegir contraseñas distintas y de alta entropía para ambos sistemas.)',
          ],
        },
        { kind: 'h4', text: 'El medidor de fuerza en tiempo real' },
        {
          kind: 'p',
          html:
            'A medida que el usuario escribe, el campo de contraseña muestra un medidor de color que estima la entropía en bits y la clasifica en uno de seis niveles:',
        },
        {
          kind: 'table',
          className: 'password-tiers',
          headers: ['Nivel', 'Entropía', 'Significado'],
          rows: [
            ['Muy débil', '&lt; 50 bits', 'Trivial para ataque de diccionario'],
            ['Débil', '50–79 bits', 'Inseguro frente a un atacante decidido'],
            ['Aceptable', '80–99 bits', 'Adecuada frente a ataque offline casual'],
            ['Fuerte', '100–127 bits', 'Clásicamente segura'],
            ['Muy fuerte', '128–159 bits', 'Clásicamente excelente'],
            ['Segura post-cuánticamente', '≥ 160 bits', 'Supera el umbral post-cuántico NIST Nivel 5'],
          ],
        },
        {
          kind: 'p',
          html:
            'El medidor usa rojo / naranja / amarillo para los niveles bajos, verde para Fuerte y Muy fuerte, y el púrpura de la marca con un icono de escudo y marca de verificación para el nivel Segura post-cuánticamente.',
        },
        { kind: 'h4', text: 'Alcanzar el nivel post-cuántico' },
        {
          kind: 'p',
          html:
            '160 bits de entropía, combinados con el factor de coste y la penalización por dureza de memoria de Argon2id frente al algoritmo de Grover, producen un factor de trabajo post-cuántico efectivo que supera el umbral NIST Nivel 5 (≥ 2^128 de trabajo efectivo). Alcanzable con:',
        },
        {
          kind: 'ul',
          items: [
            '~27 caracteres alfanuméricos aleatorios, o',
            '~25 caracteres aleatorios de todos los imprimibles, o',
            'Una frase de paso de 13 palabras al estilo diceware de la EFF (altamente recomendada — las frases de paso llevan entropía aleatoria completa por construcción, mientras que las contraseñas de caracteres elegidos por humanos típicamente no).',
          ],
        },
        { kind: 'h4', text: 'Qué significa post-cuántico para tu contraseña' },
        {
          kind: 'p',
          html:
            'Las afirmaciones post-cuánticas en otras partes de este libro blanco aplican al sistema tal como se despliega con una contraseña que alcance el nivel Segura post-cuánticamente. Una contraseña más corta o de menor entropía permanece protegida clásicamente por la dureza de memoria de Argon2id — la fuerza bruta offline contra una contraseña de 12 caracteres bien elegida sigue siendo costosa — pero su margen frente a un futuro adversario cuántico se reduce con su entropía. Los usuarios que quieran la garantía más fuerte que ofrece la arquitectura deben apuntar al nivel más alto.',
        },
        { kind: 'h4', text: 'Parámetros de Argon2id' },
        {
          kind: 'p',
          html:
            'Los parámetros de memoria, iteración y paralelismo de Argon2id están ajustados al hardware móvil mínimo soportado y dimensionados para preservar los límites de entropía anteriores. Los valores finales que se publiquen aquí se fijarán una vez congelado el build público.',
        },
        { kind: 'h3', text: '4.2 Recuperación y ciclo de vida de la cuenta', id: 'recovery' },
        {
          kind: 'p',
          html:
            '<strong>Penrose no ofrece recuperación de contraseña.</strong> Si un usuario pierde su contraseña de cifrado, su contenido privado se vuelve permanentemente inaccesible:',
        },
        {
          kind: 'ul',
          items: [
            'La PDK no puede re-derivarse de una contraseña olvidada.',
            'La EMK en el servidor de Penrose queda como texto cifrado que nadie puede desbloquear.',
            'La EVK en el PDS del usuario queda como texto cifrado que nadie puede desbloquear.',
            'Todo el material privado — publicaciones pasadas, DMs recibidos, membresías de círculos — se pierde para la cuenta.',
          ],
        },
        {
          kind: 'p',
          html:
            'Esto es intrínseco al diseño de confianza cero. Si existiera una ruta de recuperación del lado del servidor, el servidor podría usarla. La garantía de «ningún texto plano toca jamás un servidor» requiere que ninguna parte distinta del usuario posea material capaz de desbloquear la bóveda.',
        },
        {
          kind: 'p',
          html:
            'Las publicaciones públicas (la capa de Bluesky) no se ven afectadas: viven bajo la identidad del AT Protocol, a la cual el usuario puede seguir accediendo mediante los propios clientes de Bluesky y los flujos de recuperación de cuenta. La pérdida de la bóveda de Penrose no toca la cuenta de Bluesky.',
        },
        { kind: 'h3', text: '4.3 Dispositivos', id: 'devices' },
        {
          kind: 'p',
          html:
            'Penrose es multi-dispositivo por diseño. Una cuenta no está ligada a un teléfono específico ni a un blob de llaves que debe sincronizarse entre dispositivos; está ligada a una identidad criptográfica cuyo material en reposo vive en infraestructura pública:',
        },
        {
          kind: 'ul',
          items: [
            'La <strong>EMK</strong> (Llave Maestra cifrada) vive en el servidor de Penrose, direccionable por el DID del usuario.',
            'La <strong>EVK</strong> (Llave de Bóveda cifrada) vive en el PDS de Bluesky del usuario bajo el registro de seguridad.',
            'Todas las llaves simétricas de larga vida — llaves de mensajería, llaves de círculo, llaves de amigo, llave secreta Kyber — viven en el PDS como registros cifrados envueltos bajo la Llave de Bóveda.',
          ],
        },
        { kind: 'p', html: 'Un nuevo dispositivo desbloquea la cuenta completando dos flujos:' },
        {
          kind: 'ol',
          items: [
            '<strong>OAuth de Bluesky</strong> en la página alojada de inicio de sesión de Bluesky — nombre de usuario, contraseña (o passkey), 2FA y cualquier otra credencial se ingresan en <code>bsky.social</code> mismo. Penrose recibe solo un token de acceso emitido por OAuth ligado a un par de llaves DPoP por sesión.',
            '<strong>Contraseña de cifrado</strong> — para derivar la PDK, desbloquear la EMK, luego la EVK, y finalmente cada llave por registro en la bóveda.',
          ],
        },
        {
          kind: 'p',
          html:
            'No hay protocolo de sincronización entre dispositivos, ni registro de dispositivos emparejados, ni sesión de larga vida que deba migrar. Inicia sesión en cualquier dispositivo, desbloquea la bóveda, y cada llave recibida hasta la fecha queda disponible desde el PDS.',
        },
        {
          kind: 'p',
          html:
            'Cerrar sesión borra la PDK, la Llave Maestra y la Llave de Bóveda del dispositivo, revoca los tokens OAuth del lado del servidor y limpia el almacén local de llaves y tokens de la biblioteca OAuth. Nada en el dispositivo puede descifrar contenido hasta el próximo inicio de sesión.',
        },
        { kind: 'h3', text: '4.4 Qué persiste en el dispositivo entre lanzamientos', id: 'auto-relogin' },
        {
          kind: 'p',
          html:
            'Penrose no guarda contraseña de Bluesky ni contraseña de cifrado en el dispositivo. Tras un desbloqueo exitoso, el almacenamiento seguro del dispositivo (iOS Keychain / Android Keystore) contiene:',
        },
        {
          kind: 'ul',
          items: [
            'Las <strong>llaves derivadas de la bóveda</strong> — PDK, Llave Maestra, Llave de Bóveda — que se leen al inicio de la app para que al usuario no se le pida de nuevo la contraseña de cifrado en cada arranque en frío.',
            'El <strong>material de sesión de la biblioteca OAuth</strong> — el par de llaves DPoP (no extraíble, generado y guardado en el elemento seguro), el token de refresco y el DPoP-Nonce más reciente. Los gestiona por completo <code>@atproto/oauth-client-expo</code> y se refrescan de forma transparente en cada solicitud al PDS.',
          ],
        },
        {
          kind: 'p',
          html:
            'La contraseña de cifrado en sí misma se mantiene solo en la memoria del proceso el tiempo suficiente para derivar la PDK, y luego se descarta. La contraseña de Bluesky nunca está en el dispositivo — se ingresa en la página alojada de Bluesky y se intercambia por una sesión OAuth que Bluesky emite directamente a la biblioteca OAuth.',
        },
        { kind: 'p', html: 'Qué significa esto en cada límite de estado del dispositivo:' },
        {
          kind: 'ul',
          items: [
            '<strong>Cierre de la app (sin cierre de sesión explícito).</strong> Las llaves de bóveda persisten en el almacenamiento seguro; los tokens OAuth persisten en el almacén respaldado por MMKV de la biblioteca. El próximo lanzamiento restaura ambos silenciosamente — sin solicitudes.',
            '<strong>Expiración de token.</strong> La biblioteca OAuth refresca el token de acceso en su próxima llamada saliente. Sin re-solicitud visible para el usuario; sin re-autenticación del lado de Bluesky.',
            '<strong>Cierre de sesión explícito.</strong> Las llaves de bóveda en caché se borran del almacenamiento seguro; los tokens OAuth se revocan del lado del servidor y el almacén local de la biblioteca se limpia. El próximo lanzamiento requiere el flujo completo de OAuth de Bluesky + contraseña de cifrado.',
            '<strong>Dispositivo comprometido y desbloqueado.</strong> Las llaves de bóveda y el token de refresco OAuth están protegidos por hardware en la clase de Keychain / Keystore. Extraerlas requiere un SO comprometido. La contraseña de cifrado en sí no se almacena, así que no puede extraerse del dispositivo — solo atacarse offline contra el par EMK + EVK, lo cual requiere vulnerar tanto el servidor de Penrose como el PDS del usuario (§3.1).',
            '<strong>Dispositivo con root / jailbreak.</strong> Las garantías de SecureStore son más débiles en un SO comprometido. Las llaves de bóveda permanecen envueltas frente al almacén seguro a nivel de SO; si ese almacén se ve comprometido, el atacante tiene acceso completo a la sesión.',
          ],
        },
        {
          kind: 'p',
          html:
            'Las afirmaciones post-cuánticas y de confianza cero a lo largo de este libro blanco son sobre lo que poseen los servidores, no sobre el dispositivo mismo. Un dispositivo comprometido está explícitamente fuera del alcance (§1.3).',
        },
      ],
    },
    {
      id: 'posting',
      heading: '5. Publicación: cifrado de contenido en dos niveles',
      blocks: [
        {
          kind: 'p',
          html: 'Cada publicación cifrada usa <strong>dos niveles</strong> de llaves para que comprometer una publicación nunca exponga las demás.',
        },
        {
          kind: 'figure',
          src: '/images/diagram-two-tier-content.svg',
          alt: 'Diagrama de cifrado de contenido en dos niveles: la llave de círculo (AES-256), compartida con los miembros del círculo, envuelve una llave de contenido por publicación (AES-256, aleatoria fresca), que cifra cada archivo .zen — el texto de la publicación, la primera imagen y cualquier imagen adicional.',
          caption: 'Figura 2. Cifrado de contenido en dos niveles. Comprometer una publicación expone solo esa publicación — no el círculo.',
          width: 720,
          height: 460,
        },
        { kind: 'h3', text: '5.1 Redactar' },
        {
          kind: 'ol',
          items: [
            'El usuario escribe texto y/o selecciona imágenes.',
            'La app genera una <strong>llave de contenido</strong> fresca (32 bytes aleatorios, AES-256).',
            'En paralelo: Cifra el texto de la publicación con la llave de contenido → <code>_text.zen</code>. Para cada imagen: redimensiona, recodifica y luego cifra con la llave de contenido → <code>image_&lt;i&gt;.zen</code>.',
            'Cifra la propia llave de contenido con la <strong>llave de círculo</strong> seleccionada para producir un payload de <strong>registro de llave de contenido</strong>.',
          ],
        },
        { kind: 'h3', text: '5.2 Publicar' },
        { kind: 'p', html: 'El manejador de envío de publicaciones aplica el <strong>invariante de privacidad</strong> (consulta §9) con comprobaciones en el momento del envío:' },
        {
          kind: 'ol',
          items: [
            'Escribe el registro de llave de contenido en el PDS del autor. El payload incluye la llave de contenido cifrada y una referencia a la llave de círculo usada. Si esta escritura falla, la publicación queda <strong>bloqueada</strong> — nunca se degrada a texto plano.',
            'Sube todos los blobs <code>.zen</code> al PDS. Estos son blobs binarios opacos para Bluesky; el AppView los indexa solo como archivos adjuntos.',
            'Publica el registro de la publicación con: Texto vacío (el texto real vive en <code>_text.zen</code>). Un marcador de app de Penrose. Una referencia AT URI a la llave de círculo usada. Una referencia AT URI al registro de llave de contenido. Embeds de documento para los archivos <code>.zen</code>.',
            'Parchea el registro de llave de contenido con la URI final de la publicación (enlace bidireccional para limpieza al eliminar).',
          ],
        },
        { kind: 'h3', text: '5.3 Formato del archivo .zen' },
        {
          kind: 'code',
          text: `{
  "version": 1,
  "type": "encrypted-image" | "encrypted-text",
  "format": "jpg" | "txt",
  "iv": "<hex>",
  "data": "<base64 ciphertext>",
  "encryptedAt": "<iso>"
}`,
        },
        { kind: 'p', html: 'El texto cifrado es AES-CBC con PKCS7. El IV es aleatorio fresco por archivo.' },
        { kind: 'h3', text: '5.4 Índice de publicaciones privadas' },
        {
          kind: 'p',
          html:
            'Para la generación del feed, el servidor de Penrose mantiene un <strong>índice solo de metadatos</strong> que consiste en <code>{post_uri, key_uri, author_did, indexed_at}</code>. Una regla de validación impone que la URI de la llave haga referencia al repositorio del propio autor, previniendo el envenenamiento del feed. Este índice permite a un miembro de un círculo enumerar rápidamente las publicaciones cifradas para él sin recorrer el repositorio de cada contacto.',
        },
        {
          kind: 'p',
          html:
            'Ningún contenido de publicación, ningún material de llaves y ningún texto plano de ningún tipo se almacena en este índice — solo referencias que el cliente del miembro usa luego para obtener y descifrar en el dispositivo.',
        },
        { kind: 'h3', text: '5.5 Saneamiento de medios', id: 'media-sanitization' },
        { kind: 'callout', variant: 'status', label: 'Estado', body: 'En desarrollo activo.' },
        {
          kind: 'p',
          html:
            'Cifrar una imagen no protege por sí mismo al usuario de los metadatos incrustados dentro de la imagen — etiquetas EXIF, coordenadas GPS, números de serie de la cámara y huellas de software de edición viajan dentro del archivo de píxeles. Un destinatario que descifre la imagen puede extraerlos.',
        },
        {
          kind: 'p',
          html:
            'El comportamiento objetivo de Penrose es eliminar todos los metadatos no esenciales de las imágenes antes del cifrado, por defecto, sin acción requerida del usuario. La política exacta de limpieza — qué etiquetas se eliminan y cuáles se conservan (p. ej., la orientación) — está en diseño activo. Hasta que esto se entregue y se documente aquí, los usuarios que se preocupen por los metadatos de las imágenes deberían eliminarlos en su propio dispositivo antes de publicar.',
        },
        { kind: 'h3', text: '5.6 Eliminación', id: 'deletion' },
        { kind: 'callout', variant: 'status', label: 'Estado', body: 'Parcialmente implementada; semántica completa en diseño activo.' },
        {
          kind: 'p',
          html:
            'Hoy, eliminar una publicación privada quita el registro de la publicación, el registro de llave de contenido y los adjuntos <code>.zen</code> del PDS del autor, y quita la entrada correspondiente del índice de publicaciones privadas en el servidor de Penrose.',
        },
        { kind: 'p', html: 'Los siguientes aspectos aún se están especificando:' },
        {
          kind: 'ul',
          items: [
            'Si los dispositivos destinatarios purgan proactivamente sus cachés de descifrado al ver un evento de eliminación, o si la limpieza se aplaza hasta la próxima sesión.',
            'Eliminación de mensajes directos (iniciada por el remitente e iniciada por el destinatario), y qué garantiza cada una.',
            'El orden exacto de las operaciones de eliminación para asegurar que no haya huérfanos observables (un registro de publicación sin su registro de llave de contenido, o viceversa).',
          ],
        },
        {
          kind: 'p',
          html:
            'Una vez finalizado, esta sección indicará qué garantiza la eliminación y qué no. Algunos límites son fundamentales: la copia ya descifrada del destinatario, una captura de pantalla tomada antes de la eliminación y cualquier copia de seguridad fuera del dispositivo que el destinatario haya creado están permanentemente fuera del control de Penrose.',
        },
      ],
    },
    {
      id: 'replies',
      heading: '6. Respuestas y citas',
      blocks: [
        { kind: 'p', html: 'Las <strong>respuestas</strong> reutilizan la llave de contenido de la publicación padre:' },
        {
          kind: 'ul',
          items: [
            'Si el padre está cifrado, el <code>_text.zen</code> de la respuesta se cifra con la <strong>misma llave de contenido</strong> que usó el padre, y el registro de la respuesta apunta su referencia de llave de contenido al registro de llave de contenido del padre.',
            'Esto preserva el control de acceso: cualquiera con la llave de círculo del padre lee automáticamente todas las respuestas sin intercambio de llaves separado.',
            'Cuando se elimina una respuesta, el registro de llave de contenido <strong>no</strong> se elimina (el padre todavía lo usa).',
          ],
        },
        {
          kind: 'p',
          html: 'Las <strong>citas cifradas</strong> incrustan la referencia a la cita <em>dentro</em> del texto cifrado:',
        },
        {
          kind: 'code',
          text: `Texto del mensaje del usuario
---QUOTE---
{"uri":"at://did:plc:xxx/app.bsky.feed.post/yyy","cid":"bafyrei..."}`,
        },
        {
          kind: 'p',
          html:
            'No se adjunta ningún embed de cita pública al registro de la publicación, así que los observadores no pueden ver qué se está citando. Tras el descifrado, el cliente divide por <code>---QUOTE---</code> y obtiene la publicación referenciada.',
        },
      ],
    },
    {
      id: 'reading',
      heading: '7. Lectura: canalización de descifrado',
      blocks: [
        {
          kind: 'code',
          text: `La publicación con archivos .zen se carga en el feed
   ▼
Extrae la referencia de llave de círculo y la referencia de llave de contenido del registro de la publicación
   ▼
Comprobar caché de descifrado ── HIT → mostrar
   ▼
┌─── Paso 1: resolver llave de círculo (solo en el dispositivo) ───┐
│  - Publicación propia: almacén local de llaves de círculo       │
│  - Publicación de amigo: almacén de llaves de amigos            │
└─────────────────────────────────────────────────────────────────┘
   ▼
┌─── Paso 2: obtener y descifrar llave de contenido ───────────────┐
│  - Obtener el registro de llave de contenido                    │
│  - Descifrar con AES usando la llave de círculo                 │
│  - Resultado: llave de contenido AES-256                        │
│  - En caso de fallo: retornar null (NUNCA recurrir              │
│    a la llave de círculo como llave de contenido)               │
└─────────────────────────────────────────────────────────────────┘
   ▼
┌─── Paso 3: obtener y descifrar archivos .zen ────────────────────┐
│  Modo streaming: descargar + descifrar concurrentemente         │
│  Modo tradicional: descargar → analizar → descifrar             │
│  Con puntos de cesión para mantener vivo el hilo de UI          │
└─────────────────────────────────────────────────────────────────┘
   ▼
Cachear URI de datos → renderizar → limpiar archivos temporales`,
        },
        { kind: 'p', html: 'Propiedades clave:' },
        {
          kind: 'ul',
          items: [
            '<strong>El texto plano nunca persiste.</strong> Las URIs de datos descifradas viven solo en memoria del componente; no se escribe nada en almacenamiento persistente fuera de archivos temporales efímeros que se eliminan inmediatamente tras el descifrado.',
            '<strong>Las llaves de contenido se cachean dentro de la sesión</strong> para evitar volver a obtenerlas en cada imagen de una publicación con múltiples imágenes. La caché se limpia al cerrar sesión.',
            '<strong>Disciplina estricta de dos niveles.</strong> Si el registro de llave de contenido existe pero su obtención o descifrado falla, el descifrado falla. El código nunca «recurre» a descifrar el archivo <code>.zen</code> directamente con la llave de círculo — eso produciría basura y enmascararía errores reales.',
          ],
        },
      ],
    },
    {
      id: 'inbox',
      heading: '8. Intercambio de llaves y el inbox cifrado',
      blocks: [
        { kind: 'h3', text: '8.1 Patrón de intercambio ML-KEM-1024' },
        { kind: 'p', html: 'Cada primer contacto (solicitud de amistad) y cada intercambio posterior de llave de círculo se construye sobre el mismo patrón de encapsulación de llaves post-cuántico:' },
        {
          kind: 'code',
          text: `Remitente                              Destinatario
---------                              ------------
Obtener pubkey Kyber del destinatario
  (del registro de seguridad del
   destinatario en su PDS)
ml_kem1024.encapsulate(pk)
  → (cipherText, sharedSecret)
Derivar llaves de sobre desde shared_secret    (HKDF-SHA256 — ver §8.2.1)
Envolver carga útil interna (messaging_key,
  opcionalmente circle_key, …) bajo las
  llaves de sobre
Entregar sobre sellado
                                       ml_kem1024.decapsulate(cipherText, sk)
                                         → sharedSecret
                                       Re-derivar llaves de sobre
                                       Abrir carga útil interna
                                       Validar messaging_key
                                       Almacenar llaves bajo la bóveda`,
        },
        {
          kind: 'p',
          html:
            'El secreto compartido <strong>se usa una vez y se descarta.</strong> Toda comunicación futura con ese contacto se apoya en la llave de mensajería ya establecida, transportada dentro del sobre de remitente sellado (§8.2.1).',
        },
        { kind: 'h3', text: '8.2 El inbox cifrado' },
        {
          kind: 'p',
          html:
            'Las solicitudes de amistad, las comparticiones de llaves de círculo, las aceptaciones y los mensajes directos fluyen por un <strong>inbox con metadatos mínimos</strong> en lugar de hacerlo por el PDS público del remitente. El inbox está diseñado para que una brecha completa del servidor revele esencialmente nada sobre el grafo social.',
        },
        { kind: 'p', html: 'Cada fila del inbox contiene:' },
        {
          kind: 'table',
          headers: ['Campo', 'Visibilidad', 'Contenido'],
          rows: [
            ['ID del mensaje', 'Servidor', 'Identificador aleatorio'],
            ['Propietario', 'Servidor', 'ID de cuenta del destinatario (requerido para la entrega)'],
            ['Bandera de leído', 'Servidor', 'Booleano'],
            ['Prioridad', 'Servidor', 'Pista de enrutamiento fijada por el cliente'],
            [
              '<strong>Sobre sellado</strong>',
              '<strong>Opaco</strong>',
              'Sobre de remitente sellado de dos capas (descrito abajo)',
            ],
            ['Información de cifrado', 'Servidor', 'Etiqueta de algoritmo (p. ej. <code>sealed-sender-v1/ml-kem-1024+hkdf-sha256+xsalsa20-poly1305</code>)'],
            ['Hash del token del remitente', 'Servidor', 'SHA-256 de un token aleatorio solo conocido por el remitente (solo para eliminación)'],
            ['Marcas de tiempo', 'Servidor', 'Creación y expiración (TTL acotado)'],
          ],
        },
        { kind: 'p', html: 'El servidor <strong>no sabe</strong>:' },
        {
          kind: 'ul',
          items: [
            'Quién envió el mensaje. La identidad del remitente está cifrada dentro del sobre bajo la llave pública post-cuántica del destinatario — no es visible en ninguna capa que el servidor pueda leer. El hash del token del remitente no está relacionado con la identidad y existe solo para que el remitente pueda eliminar más adelante un mensaje no leído.',
            'Qué tipo de mensaje es. El discriminador de tipo (solicitud de amistad, compartición de llave, aceptación, mensaje directo) vive dentro del sobre.',
            'Cuál es el contenido.',
            'Si dos filas del inbox están relacionadas. No hay identificador de hilo o conversación en el servidor.',
          ],
        },
        { kind: 'h4', text: '8.2.1 Sobre de remitente sellado' },
        {
          kind: 'p',
          html:
            'La carga útil de cada fila es un sobre de dos capas adaptado de la construcción sealed-sender de Signal a un KEM post-cuántico. Conlleva dos garantías independientes: la capa externa oculta al remitente del servidor; la capa interna autentica al remitente ante el destinatario.',
        },
        {
          kind: 'figure',
          src: '/images/diagram-sealed-sender-envelope.svg',
          alt: 'Diagrama lado a lado de las dos capas del sobre de remitente sellado. La Capa 1 (izquierda) oculta la identidad del remitente al servidor: la encapsulación ML-KEM-1024 contra la llave pública del destinatario produce un secreto compartido; HKDF-SHA256 deriva tres sub-llaves (K_id, K_oob, K_l2_salt), y la identidad del remitente y un OOB_VAL por sobre se envuelven bajo las dos primeras. K_l2_salt alimenta la sal del HKDF de la Capa 2. La Capa 2 (derecha) autentica al remitente ante el destinatario: HKDF-SHA256, con llave o bien la llave de mensajería por contacto (contactos establecidos) o bien el OOB_VAL por sobre (primer contacto) y con sal de la Capa 1, deriva K_inner, que cifra la carga útil interna (cuerpo del mensaje y discriminador de tipo) bajo XSalsa20-Poly1305.',
          caption:
            'Figura 3. Sobre de remitente sellado. La Capa 1 oculta al remitente del servidor; la Capa 2 autentica al remitente ante el destinatario. K_l2_salt vincula las dos capas, de modo que cualquier manipulación de la Capa 1 invalida la Capa 2.',
          width: 1100,
          height: 580,
        },
        {
          kind: 'p',
          html:
            '<strong>Capa 1 — ocultar la identidad del remitente al servidor.</strong> El remitente encapsula contra la llave pública ML-KEM-1024 del destinatario, produciendo un secreto compartido conocido solo por el remitente y el destinatario. HKDF-SHA256 deriva tres sub-llaves, con sal a partir de hashes de la llave pública del destinatario y del texto cifrado del KEM (separación de dominios). Dos de esas sub-llaves envuelven (a) la identidad declarada del remitente y (b) un valor aleatorio por sobre (<code>OOB_VAL</code>). La tercera alimenta la sal de la Capa 2, de modo que cualquier manipulación de la Capa 1 invalida la Capa 2.',
        },
        {
          kind: 'p',
          html:
            '<strong>Capa 2 — autenticar al remitente ante el destinatario.</strong> Una segunda derivación HKDF usa como llave <em>ya sea</em> la llave de mensajería por contacto (para contactos establecidos) <em>o bien</em> el valor aleatorio por sobre de la Capa 1 (para primer contacto). El resultado cifra la carga útil interna (el mensaje real: solicitud de amistad, compartición de llave, cuerpo de DM, etc.). El destinatario prueba la llave de mensajería que tiene archivada para el remitente declarado; si esa abre el texto cifrado interno, el remitente poseía esa llave demostrablemente — el destinatario lo vincula. Si la llave de mensajería falla, el destinatario recurre al valor por sobre (ruta de primer contacto).',
        },
        {
          kind: 'p',
          html:
            '<strong>Qué significa esto para el destinatario:</strong> para un contacto establecido, la única parte que pudo haber producido un sobre que abre bajo la llave de mensajería almacenada para ese contacto es alguien que de hecho posee esa llave — es decir, el propio contacto. Un impostor que intenta forjar un mensaje por la ruta de contacto establecido falla en producir un sobre que se abra.',
        },
        {
          kind: 'p',
          html:
            '<strong>Qué significa esto para el servidor:</strong> en ninguna capa el servidor ve, infiere o aprende el DID del remitente. Incluso comparar dos sobres del mismo remitente al mismo destinatario es indistinguible como texto cifrado — el valor aleatorio por sobre y el texto cifrado fresco del KEM re-aleatorizan ambas capas en cada envío.',
        },
        {
          kind: 'p',
          html:
            'El respaldo <code>OOB_VAL</code> de primer contacto es un residual aceptado explícitamente: un atacante que ya posee la llave pública Kyber del destinatario puede construir un sobre de «primer contacto» que afirme ser de cualquiera. Esto está acotado por la misma ventana de confianza que cierra la verificación fuera de banda (Trabajo futuro), y el destinatario lo presenta como un evento de primer contacto que el usuario puede verificar antes de aceptar.',
        },
        { kind: 'h3', text: '8.3 Autenticación de escrituras del lado del servidor' },
        {
          kind: 'p',
          html: 'La mayoría de las escrituras del lado del servidor — entradas del índice de publicaciones, mutaciones de perfil, almacenamiento de la llave maestra cifrada — pasan por un único gateway que realiza <strong>verificación de sesión del PDS mediante relay DPoP</strong> (RFC 9449):',
        },
        {
          kind: 'ol',
          items: [
            'El cliente envía tres encabezados por solicitud: el token de acceso emitido por OAuth, una prueba DPoP JWT recién acuñada y ligada a la solicitud upstream al PDS, y la URL del PDS del usuario.',
            'El gateway reenvía el token de acceso + la prueba DPoP al PDS del usuario en <code>com.atproto.server.getSession</code>. El PDS valida la prueba contra el claim <code>cnf.jkt</code> del token de acceso — confirmando que quien envió la solicitud posee la llave DPoP para la que se emitió el token — y retorna el DID de la sesión.',
            'El gateway <strong>resuelve independientemente</strong> el DID retornado a su endpoint de servicio PDS canónico vía <code>plc.directory</code> (para identificadores <code>did:plc:</code>) o <code>https://&lt;host&gt;/.well-known/did.json</code> (para identificadores <code>did:web:</code>).',
            'El gateway afirma que el PDS canónico coincide con la URL que el cliente envió. Esta comprobación de vinculación es la mitigación crítica contra un PDS malicioso que retorne DIDs arbitrarios desde <code>getSession</code>; sin ella, cualquiera que ejecute un PDS podría suplantar a cualquier usuario.',
            'Las escrituras se atribuyen a este DID verificado — nunca a una afirmación del cliente.',
          ],
        },
        {
          kind: 'p',
          html:
            'Los tokens ligados a DPoP derrotan los reenvíos: el gateway del lado del servidor rastrea el <code>jti</code> (JWT ID) de la prueba en una caché en memoria durante la ventana TTL de la prueba y rechaza cualquier duplicado. Una solicitud capturada no puede reenviarse ni siquiera dentro del período de validez del token de acceso.',
        },
        {
          kind: 'p',
          html:
            'El gateway también maneja el desafío DPoP-Nonce: cuando el PDS responde con <code>401 use_dpop_nonce</code>, el gateway propaga el nonce fresco de vuelta al cliente en un encabezado de respuesta <code>DPoP-Nonce</code> para que el cliente pueda reconstruir su prueba y reintentar de forma transparente (el reintento único estándar de RFC 9449 §8).',
        },
        {
          kind: 'p',
          html:
            '<strong>Las escrituras al inbox están deliberadamente exentas</strong> de esta autenticación del gateway. La autenticidad del remitente para los mensajes del inbox se prueba criptográficamente dentro del sobre sellado (§8.2.1), no mediante una comprobación de identidad del lado del servidor sobre quien escribe. Esta es una propiedad crítica del remitente sellado: si el servidor autenticara a quien escribe, aprendería la identidad del remitente, anulando la propia propiedad que el sobre está diseñado para proporcionar. El servidor, por tanto, acepta escrituras al inbox de cualquier llamante y se apoya en los topes de no leídos por destinatario y en la garantía criptográfica de que el destinatario rechazará sobres que no se autentiquen como un contacto conocido o como una solicitud de primer contacto bien formada.',
        },
        { kind: 'h3', text: '8.4 Autenticación de remitente confirmado' },
        {
          kind: 'p',
          html: 'Dos mecanismos en conjunto imponen que el remitente de un mensaje del inbox sea quien dice ser.',
        },
        {
          kind: 'p',
          html:
            '<strong>Capa 2 del sobre sellado (cada mensaje).</strong> La carga útil interna de cada sobre del inbox se cifra bajo una llave derivada de la llave de mensajería por contacto (§8.2.1). Para un contacto establecido, la única parte que puede producir un sobre que abre bajo la llave de mensajería que el destinatario tiene almacenada para ese contacto es alguien que de hecho posee esa llave — es decir, el propio contacto. Un sobre que no abre bajo la llave de mensajería vinculada se rechaza en el momento de abrir el sobre, antes de procesar cualquier carga útil.',
        },
        {
          kind: 'p',
          html:
            '<strong>Vinculación TOFU en la primera aceptación.</strong> Cuando el cliente del destinatario acepta una solicitud de amistad, obtiene la llave pública ML-KEM-1024 del remitente desde el PDS del remitente, calcula una huella y la almacena junto con el nuevo registro de llave de mensajería. Los sobres posteriores — DMs, comparticiones de llaves de círculo, avisos de rotación — quedan ligados a esta huella por estar cifrados bajo la llave de mensajería vinculada. Un operador de PDS que más tarde sustituya la llave pública del remitente no puede derivar esa llave de mensajería y, por tanto, no puede producir sobres que el destinatario acepte.',
        },
        {
          kind: 'p',
          html:
            'Esto es <strong>Trust-On-First-Use</strong>: la primera llave vista para un contacto es de confianza; la sustitución en cualquier intercambio posterior se detecta. TOFU no defiende contra un operador de PDS que sustituya una llave <em>antes</em> de la primera vinculación — esa ventana residual la cierra la verificación fuera de banda, que está planificada (consulta Trabajo futuro). La ruta de primer contacto del sobre sellado (Capa 2 con llave a partir del <code>OOB_VAL</code> por sobre) hereda la misma ventana residual y se cierra por el mismo mecanismo.',
        },
        {
          kind: 'p',
          html:
            'En el lado del remitente, una comprobación separada valida que las aceptaciones entrantes correspondan a solicitudes salientes que el usuario realmente envió, así que un atacante no puede inyectar una «aceptación de Bob» falsa que Alice nunca solicitó.',
        },
        { kind: 'h3', text: '8.5 Transporte de mensajes directos' },
        {
          kind: 'p',
          html:
            'Los mensajes directos de tipo chat comparten el mismo transporte del inbox de remitente sellado que las solicitudes de amistad y las comparticiones de llaves. La construcción se estratifica así:',
        },
        {
          kind: 'ol',
          items: [
            '<strong>Almacenamiento autoritativo en el PDS del usuario.</strong> Cada DM entregado también se escribe en el PDS propio del remitente y del destinatario como un registro opaco. El cuerpo del registro es texto cifrado XSalsa20-Poly1305 del texto del mensaje (y cualquier faceta de texto enriquecido), cifrado bajo la llave de mensajería por contacto. El PDS ve el texto cifrado, una marca de tiempo por mensaje, y nada más — ni el contacto, ni el cuerpo del mensaje, ni la conversación a la que pertenece.',
            '<strong>Entrega vía el inbox de remitente sellado.</strong> Saliente, un DM se envuelve en un sobre sellado (§8.2.1) y se deposita en el inbox del destinatario. El destinatario abre el sobre, valida que se autentica bajo la llave de mensajería vinculada al remitente declarado, luego escribe el registro de texto cifrado correspondiente en su propio PDS. Las entregas fallidas nunca llegan al PDS — el repositorio del usuario solo contiene mensajes que de hecho se entregaron.',
            '<strong>Los metadatos de conversación están cifrados con la bóveda.</strong> Cada contacto tiene un registro de conversación en el PDS del usuario que contiene puntero de cabeza, vista previa del último mensaje y conteo de no leídos. El cuerpo del registro es texto cifrado XSalsa20-Poly1305 cifrado bajo la <strong>llave de bóveda</strong> (no la llave de mensajería) — incluso un contacto cuya llave de mensajería se haya visto de alguna forma comprometida no puede leer el índice de conversación del usuario.',
            '<strong>Identificadores de registro pseudónimos.</strong> El identificador del registro de conversación se deriva determinísticamente como <code>HMAC-SHA256(HKDF(vault_key, "denazen-dm-contact-id-v1"), contact_did)</code> truncado a 16 bytes. El mismo contacto siempre mapea al mismo identificador en una cuenta dada; cuentas distintas (llaves de bóveda distintas) mapean el mismo contacto a identificadores distintos. El PDS ve N identificadores de registro opacos pero no puede revertirlos a DIDs sin la llave de bóveda.',
          ],
        },
        { kind: 'p', html: 'Qué significa esto para el modelo de amenazas:' },
        {
          kind: 'ul',
          items: [
            '<strong>El PDS ve</strong> cuántas conversaciones tiene el usuario (N identificadores de registro), tiempos por mensaje y tamaños de texto cifrado. No puede vincular ningún registro a un contacto específico, leer ningún mensaje ni reconstruir la cadena de conversación.',
            '<strong>El servidor del inbox ve</strong> sobres sellados opacos dirigidos a un destinatario. No puede distinguir los sobres de DM de los sobres de solicitud de amistad o compartición de llave — el discriminador de tipo está dentro de la Capa 2.',
            '<strong>Los punteros de cadena hacia adelante son solo del dispositivo.</strong> Cada carga útil de DM hace referencia al mensaje anterior en la cadena (cifrado) para que los destinatarios puedan caminar el historial hacia atrás. Los punteros hacia adelante usados para eliminación por mensaje se reconstruyen en la caché local del dispositivo y nunca se escriben en el PDS — el PDS no puede reconstruir cadenas sin la llave de mensajería.',
          ],
        },
        { kind: 'h3', text: '8.6 Tokens de eliminación del lado del remitente' },
        { kind: 'p', html: 'Al enviar, el cliente:' },
        {
          kind: 'ol',
          items: [
            'Genera 32 bytes aleatorios (el token del remitente en bruto).',
            'Envía solo el hash SHA-256 del token al servidor.',
            'Almacena el token en bruto localmente.',
          ],
        },
        {
          kind: 'p',
          html:
            'Para eliminar un mensaje enviado (p. ej. después de que el destinatario lo rechace), el cliente presenta el token en bruto; el servidor lo vuelve a hashear y elimina solo si los hashes coinciden. El servidor no aprende nada sobre el remitente a partir del hash y no puede falsificar eliminaciones.',
        },
        { kind: 'h3', text: '8.7 Notificaciones push', id: 'push' },
        { kind: 'callout', variant: 'status', label: 'Estado', body: 'Aún no implementada.' },
        {
          kind: 'p',
          html:
            'Penrose no entrega actualmente notificaciones push vía Apple APNs o Google FCM. La postura para push — si los payloads serán señales opacas de activación, contendrán contenido cifrado que una extensión de servicio de notificaciones en el dispositivo descifra localmente, o incluirán vistas previas legibles — todavía se está diseñando.',
        },
        {
          kind: 'p',
          html:
            'Las notificaciones push son una superficie de metadatos bien conocida para aplicaciones cifradas de extremo a extremo: Apple y Google pueden observar los tiempos y el destinatario de cada notificación, junto con cualquier payload legible. Cuando push se entregue en Penrose, esta sección indicará explícitamente qué pueden observar APNs y FCM.',
        },
      ],
    },
    {
      id: 'invariant',
      heading: '9. El invariante de privacidad',
      blocks: [
        { kind: 'p', html: 'Penrose opera bajo un único invariante no negociable:' },
        {
          kind: 'callout',
          variant: 'invariant',
          label: 'Invariante de privacidad',
          body: 'Un usuario que pretende crear una publicación privada NO DEBE NUNCA producir una pública — bajo ninguna circunstancia.',
        },
        { kind: 'p', html: 'Esto se implementa como una unión discriminada a prueba de fallos aplicada en el momento del envío:' },
        {
          kind: 'code',
          text: `type ComposeState =
  | { mode: 'public' /* ... */ }
  | { mode: 'private', keyId: string, encryptionReady: true, /* ... */ }`,
        },
        { kind: 'p', html: 'El manejador de envío:' },
        {
          kind: 'ol',
          items: [
            '<strong>Toma una instantánea</strong> de todos los parámetros de cifrado en constantes locales inmutables antes de cualquier trabajo asíncrono.',
            'Valida la instantánea: si el modo es <code>\'private\'</code> y falta alguno de los parámetros requeridos, <strong>lanza una excepción y bloquea</strong> el envío.',
            'Pasa la instantánea — nunca el estado de UI en vivo — a la canalización de subida en segundo plano.',
          ],
        },
        {
          kind: 'p',
          html:
            'El servicio de creación de publicaciones valida independientemente: si cualquier parámetro de cifrado está presente, <em>todos</em> deben estarlo, o lanza. No hay ruta de código que «se recupere» enviando una publicación en texto plano, ni coalescencia nula hacia público, ni reintento que degrade silenciosamente la privacidad.',
        },
        { kind: 'p', html: 'La misma disciplina a prueba de fallos se extiende a:' },
        {
          kind: 'ul',
          items: [
            'Intercambios de llaves de círculo (nunca se envían sin envolver).',
            'Llaves de mensajería en solicitudes de amistad (deben cifrarse bajo el secreto compartido derivado de Kyber).',
            'Eventos de rotación (las llaves rotadas se reenvían solo a los miembros retenidos, envueltas bajo sus llaves de mensajería).',
            'Integridad de la lista de miembros del círculo (la lista de compartición se actualiza <em>antes</em> de transmitir una llave; si esa escritura falla, la llave no se envía).',
          ],
        },
      ],
    },
    {
      id: 'rotation',
      heading: '10. Rotación',
      blocks: [
        { kind: 'h3', text: '10.1 Rotación de llave de mensajería' },
        { kind: 'p', html: 'Un usuario puede rotar la llave de mensajería que comparte con cualquier contacto:' },
        {
          kind: 'ol',
          items: [
            'Generar una nueva llave de mensajería AES-256.',
            'Enviarla al contacto vía el inbox, cifrada con la llave de mensajería <em>actual</em>.',
            'Almacenar la nueva llave como «pendiente» en el lado del remitente; esperar un mensaje de confirmación indicando que el destinatario la ha almacenado.',
            'Al recibir la confirmación, promover la nueva llave a predeterminada y desactivar la antigua.',
          ],
        },
        { kind: 'p', html: 'Las llaves antiguas permanecen disponibles para descifrar mensajes pasados pero nunca se usan para cifrar nuevos.' },
        { kind: 'h3', text: '10.2 Rotación de llave de círculo' },
        { kind: 'p', html: 'Cuando un usuario quita a un miembro de un círculo, <strong>rota la llave de círculo</strong>:' },
        {
          kind: 'ol',
          items: [
            'Generar una nueva llave de círculo.',
            'Actualizar la lista de compartición (quitando al miembro no compartido) <em>antes</em> de cualquier distribución de llaves.',
            'Volver a compartir la nueva llave de círculo con cada miembro retenido vía inbox, envuelta bajo la llave de mensajería de ese miembro.',
            'Enviar una notificación de rotación al miembro quitado, cuyo cliente elimina la llave antigua al recibirla.',
            'Las publicaciones futuras usan la nueva llave; las publicaciones previas siguen siendo legibles para quien tuvo la llave antigua al momento de publicarlas.',
          ],
        },
        {
          kind: 'p',
          html:
            'Esto intencionalmente <strong>no tiene secreto hacia adelante para publicaciones previas</strong> — el contenido histórico sigue siendo descifrable por los miembros que tuvieron acceso legítimo cuando se escribió.',
        },
        { kind: 'h3', text: '10.3 Rotación de llave Kyber' },
        {
          kind: 'p',
          html:
            'Los usuarios pueden rotar su par de llaves ML-KEM-1024 desde Configuración. La nueva llave pública se escribe en el registro de seguridad del usuario; el registro de seguridad antiguo se respalda automáticamente. Los contactos que previamente realizaron un intercambio de llaves tendrán que volver a intercambiar, lo que activa una nueva vinculación TOFU en su lado (§8.4). La verificación fuera de banda de la nueva llave está planificada (consulta Trabajo futuro) para los usuarios que quieran confirmar que la rotación no fue una sustitución por parte de un operador de PDS.',
        },
      ],
    },
    {
      id: 'storage',
      heading: '11. Límites de almacenamiento',
      blocks: [
        {
          kind: 'table',
          headers: ['Almacén', 'Qué se almacena', 'Qué NUNCA se almacena'],
          rows: [
            [
              'PDS de Bluesky',
              'Blobs <code>.zen</code> cifrados, registros de llaves cifradas, registros de DM cifrados, registros de metadatos de conversación cifrados, EVK, llave pública Kyber',
              'Contenido en texto plano, llaves en texto plano, contraseña de cifrado',
            ],
            ['AppView / Relay de Bluesky', 'Metadatos de publicaciones, grafo de seguimiento', 'Contenido, llaves'],
            [
              'Servidor de Penrose',
              'Filas de perfil (DID + EMK), metadatos del índice de publicaciones, filas del inbox de remitente sellado (sobres opacos), invitaciones',
              'Identidad del remitente para mensajes del inbox, contenido en texto plano, llaves en texto plano, contraseñas, llaves de bóveda',
            ],
            [
              'Gateway del lado del servidor (en tránsito)',
              'Token de acceso emitido por OAuth + prueba DPoP por solicitud (transitorios, para verificación del PDS)',
              'Secretos de larga vida, contenido, llaves, contraseña de cifrado, llave privada DPoP',
            ],
            [
              'Almacenamiento seguro del dispositivo',
              'PDK, Llave Maestra, Llave de Bóveda, sesiones por cuenta, token de refresco OAuth, par de llaves DPoP OAuth (no extraíble, respaldado por elemento seguro)',
              'Contraseña de Bluesky, contraseña de cifrado (— esta es la raíz de confianza)',
            ],
            [
              'Almacenamiento general del dispositivo',
              'Archivos de caché de llaves cifrados (solo texto cifrado), preferencias',
              'Llaves en texto plano, contenido en texto plano',
            ],
          ],
        },
      ],
    },
    {
      id: 'telemetry',
      heading: '12. Telemetría y privacidad',
      blocks: [
        { kind: 'p', html: 'La telemetría es anónima por construcción:' },
        {
          kind: 'ul',
          items: [
            'Sin identificación de usuario — sin <code>identify()</code> ni vinculación de perfil.',
            'Los nombres de propiedades que podrían llevar datos identificables de usuario se enumeran en una lista de permitidos; un filtro final los descarta como última línea de defensa.',
            'Las cadenas de error se mapean a un vocabulario acotado en el sitio de la llamada — los mensajes de error en bruto o los cuerpos de respuesta de la API nunca se capturan.',
            'La reproducción de sesión está desactivada. La autocaptura de nombre de pantalla y toques está desactivada. GeoIP está deshabilitado.',
          ],
        },
      ],
    },
    {
      id: 'moderation',
      heading: '13. Abuso y moderación',
      blocks: [
        { kind: 'callout', variant: 'status', label: 'Estado', body: 'Pre-política.' },
        {
          kind: 'p',
          html:
            'El cifrado de extremo a extremo en la capa privada significa que Penrose no puede observar el contenido de las publicaciones privadas, los DMs o los payloads de intercambio de llaves de círculo. Por tanto, un modelo de moderación para contenido privado debe descansar en una acción explícita del usuario: un destinatario reporta un incidente, momento en el cual su cliente sube el mensaje descifrado y la identidad del remitente para revisión.',
        },
        {
          kind: 'p',
          html:
            'La política específica de moderación — flujo de trabajo, estándares aplicados, coordinación con la moderación de Bluesky para contenido público, y rutas de escalamiento para CSAM y otro material ilegal — se está redactando. Hasta que se publique la política, el comportamiento actual es:',
        },
        {
          kind: 'ul',
          items: [
            'El abuso en la capa pública sigue los raíles de moderación existentes de Bluesky.',
            'El abuso en la capa privada se aborda con las herramientas que los usuarios ya tienen: quitar al miembro del Círculo, bloquear al contacto (lo que revoca el intercambio de llaves) y reportar por canales externos.',
          ],
        },
        { kind: 'p', html: 'Esta sección se ampliará cuando esté disponible la política redactada.' },
      ],
    },
    {
      id: 'legal-process',
      heading: '14. Respuesta a procesos legales',
      blocks: [
        { kind: 'callout', variant: 'status', label: 'Estado', body: 'Pre-política.' },
        {
          kind: 'p',
          html:
            'El diseño de confianza cero de Penrose dicta qué no puede producir Penrose bajo compulsión legal, porque Penrose nunca poseyó el material:',
        },
        {
          kind: 'ul',
          items: [
            'Ningún contenido privado en texto plano (publicaciones, DMs, imágenes).',
            'Ninguna llave de descifrado de ningún tipo — bóveda, mensajería, círculo, contenido o secreto Kyber.',
            'Ninguna contraseña de cifrado.',
            'Ningún mapeo del DID de un usuario a su identidad legal más allá de lo que el usuario haya asociado voluntariamente con la cuenta.',
          ],
        },
        { kind: 'p', html: 'Lo que Penrose sí posee, y por tanto podría ser compelido a producir:' },
        {
          kind: 'ul',
          items: [
            'El DID y el nombre de usuario del usuario.',
            'La EMK — un texto cifrado opaco que no puede desenvolverse sin la contraseña de cifrado del usuario.',
            'Filas del índice de publicaciones privadas: URI de publicación, URI de llave, DID del autor, marcas de tiempo.',
            'Filas del inbox: payloads cifrados opacos, marcas de tiempo y hashes de tokens del remitente.',
            'Metadatos operativos y tiempos de las solicitudes.',
          ],
        },
        { kind: 'p', html: 'Un documento formal de directrices para la aplicación de la ley y una cadencia de reportes de transparencia están en desarrollo.' },
      ],
    },
    {
      id: 'audit',
      heading: '15. Auditoría y divulgación responsable',
      blocks: [
        { kind: 'h3', text: 'Auditoría de terceros' },
        {
          kind: 'p',
          html:
            'Primitivas criptográficas individuales usadas en Penrose han sido auditadas de forma independiente — notablemente <code>@noble/post-quantum</code> (ML-KEM) por Cure53. El sistema Penrose como un todo — la jerarquía de bóveda, los protocolos de publicación e inbox, el invariante de privacidad y las implementaciones del cliente — aún no ha sido auditado de forma independiente. Una auditoría a nivel de sistema es prioridad para una versión próxima; los resultados se publicarán aquí cuando estén disponibles.',
        },
        { kind: 'h3', text: 'Reportar una vulnerabilidad' },
        {
          kind: 'p',
          html:
            'Los investigadores de seguridad que identifiquen un problema pueden reportarlo a <strong><a href="mailto:security@denazen.com">security@denazen.com</a></strong>. Nos proponemos acusar recibo de los reportes en un plazo de 72 horas y coordinaremos el calendario de divulgación. La información de contacto y política legible por máquina se publica en <a href="/.well-known/security.txt"><code>/.well-known/security.txt</code></a> según RFC 9116.',
        },
        { kind: 'h3', text: 'Programa de recompensas' },
        {
          kind: 'p',
          html: 'No hay un programa formal de recompensas de errores activo en este momento. Reconocemos los reportes valiosos en las notas de lanzamiento y en esta página.',
        },
      ],
    },
    {
      id: 'future-work',
      heading: '16. Trabajo futuro',
      blocks: [
        { kind: 'p', html: 'Cuatro puntos están explícitamente <em>fuera</em> del alcance de la versión actual y se nombran aquí en lugar de dejarlos implícitos:' },
        {
          kind: 'ul',
          items: [
            '<strong>Verificación de contacto fuera de banda.</strong> UI de números de seguridad / código QR para que los usuarios confirmen manualmente la llave pública ML-KEM-1024 de un contacto antes de que Trust-On-First-Use la vincule (§8.4). TOFU detecta sustitución de llaves en cualquier intercambio posterior; la verificación OOB cierra la ventana residual de primer contacto ante un operador de PDS que pudiera sustituir una llave antes de la primera vinculación. Planificada para una versión próxima; replica el modelo de números de seguridad de Signal cuando se entregue.',
            '<strong>Transparencia de llaves.</strong> La dirección de la industria es un registro público de solo-adición de llaves públicas post-cuánticas, que permite a cualquier usuario verificar que la llave que el servidor de Penrose atribuye a un contacto coincide con la que ese contacto realmente publicó. Penrose se entrega con TOFU (§8.4) — fuerte pero no equivalente a un registro de transparencia. Una versión futura añadirá uno.',
            '<strong>Builds reproducibles y atestación binaria.</strong> La base de código open source es verificable; los binarios móviles y web compilados aún no son reproducibles byte a byte a partir del código fuente. Se planea entregar builds reproducibles — y, en las plataformas compatibles, atestaciones de transparencia de código.',
            '<strong>Protocolo formal de migración post-cuántica.</strong> El formato <code>.zen</code> lleva un campo <code>version</code> (§5.3), y los clientes negocian sobre él: los clientes más nuevos leen versiones más antiguas, los clientes más antiguos muestran un marcador «se requiere actualización» para las más nuevas. Un protocolo documentado de ventana de rotación de llaves para mover llaves de círculo y de mensajería a través de un cambio de primitiva aún no está especificado; se añadirá antes de la primera rotación de primitiva.',
          ],
        },
      ],
    },
    {
      id: 'verification',
      heading: '17. Historia de verificación',
      blocks: [
        { kind: 'p', html: 'La afirmación «ningún servidor puede descifrar» se apoya en los siguientes hechos comprobables, cada uno verificable desde la base de código:' },
        {
          kind: 'ol',
          items: [
            '<strong>Ninguna llave en texto plano cruza jamás un límite de red.</strong> La Llave de Bóveda se genera en el dispositivo; sale solo como la EVK (envuelta bajo la Llave Maestra) hacia el PDS y nunca llega al servidor de Penrose. La Llave Maestra sale solo como la EMK (envuelta bajo la PDK) hacia el servidor de Penrose.',
            '<strong>Ningún contenido en texto plano cruza jamás un límite de red.</strong> Las publicaciones se cifran en el dispositivo antes de cualquier subida; los blobs <code>.zen</code> son opacos para Bluesky; los mensajes directos y los mensajes del inbox se sellan bajo la llave Kyber del destinatario.',
            '<strong>Los gateways del lado del servidor no ven secretos.</strong> El gateway de escritura maneja tokens de acceso OAuth y pruebas DPoP solo el tiempo necesario para retransmitir la llamada de verificación al PDS. Nunca posee la llave privada DPoP (que vive en el elemento seguro del usuario) y nunca toca llaves de bóveda, mensajería o círculo. En la ruta de escritura al inbox no ve ni un token de sesión ni una identidad de remitente — los sobres de remitente sellado se autentican por sí mismos ante el destinatario y no requieren autenticación del lado del servidor de quien llama.',
            '<strong>Disciplina a prueba de fallos.</strong> El invariante de privacidad (§9) hace estructuralmente imposible que una publicación pretendida privada se vuelva pública sin un cambio explícito de código.',
            '<strong>Bibliotecas criptográficas vendidas.</strong> Todas las primitivas criptográficas están fijadas o copiadas en el repositorio; las actualizaciones de bibliotecas requieren un cambio deliberado.',
            '<strong>Capa independiente de llaves en reposo.</strong> La jerarquía de bóveda (§3) significa que comprometer cualquier servidor individual (Bluesky <em>o</em> Penrose) no produce un objetivo para fuerza bruta offline — un atacante necesita material de ambos.',
          ],
        },
      ],
    },
    {
      id: 'summary',
      heading: '18. Resumen',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Bóveda de cuatro niveles</strong> (contraseña → PDK → Llave Maestra → Llave de Bóveda) divide el material de llaves en reposo entre dos servidores, de modo que ninguna brecha individual permite un ataque offline.',
            '<strong>Cifrado de contenido en dos niveles</strong> (llave de círculo → llave de contenido → archivos <code>.zen</code>) aísla el radio de daño de cualquier publicación comprometida a sí misma.',
            '<strong>Intercambio de llaves post-cuántico</strong> (ML-KEM-1024, NIST Nivel 5) protege todos los apretones de manos de primer contacto contra futuros adversarios cuánticos.',
            '<strong>Llaves simétricas de 256 bits en todas partes</strong> — llaves de contenido, llaves de círculo, llaves de mensajería y llaves de bóveda usan todas llaves de 256 bits, manteniendo un suelo de seguridad post-cuántica ≥ 2^128 en cada capa simétrica.',
            '<strong>Inbox de remitente sellado</strong> oculta la identidad del remitente, el tipo de mensaje y las relaciones al servidor que los almacena. Las escrituras al inbox están intencionalmente sin autenticar del lado del servidor — la autenticidad del remitente se prueba criptográficamente dentro del sobre, recuperable solo por el destinatario.',
            '<strong>Verificación de sesión del PDS</strong> en el único gateway de escritura asegura que quienes llaman son quienes dicen ser antes de cualquier mutación del lado del servidor que no sea del inbox (entradas del índice de publicaciones, filas de perfil, almacenamiento de la llave maestra cifrada).',
            '<strong>Autenticación de remitente confirmado mediante huella TOFU y Capa 2 de remitente sellado</strong> detecta cualquier sustitución de llave posterior al primer contacto por parte de un PDS comprometido — cada sobre debe abrir bajo la llave de mensajería que el destinatario tiene vinculada para el remitente declarado. La verificación fuera de banda de primer contacto está planificada (consulta Trabajo futuro).',
            '<strong>Invariante de privacidad a prueba de fallos</strong> previene la degradación silenciosa de privado a público en cada capa.',
            '<strong>Ningún texto plano toca jamás un servidor.</strong> La única raíz de confianza para la confidencialidad del contenido es el dispositivo del usuario, la contraseña de cifrado del usuario y (una vez que se entregue la verificación OOB) la atestación fuera de banda del propio usuario de las huellas de los contactos. Ni el PDS de Bluesky ni el servidor de Penrose son de confianza para la confidencialidad. Consulta §1.4 para una declaración precisa de qué cubre y qué no cubre la «confianza cero».',
          ],
        },
        {
          kind: 'p',
          html:
            'Incluso un PDS de Bluesky completamente comprometido y un servidor de Penrose completamente comprometido no pueden, individualmente ni en conjunto, leer una sola palabra del contenido privado de un usuario — hoy ni en un futuro post-cuántico, dado que la contraseña de cifrado cumpla los requisitos.',
        },
      ],
    },
    {
      id: 'glossary',
      heading: 'Apéndice A. Glosario',
      blocks: [
        { kind: 'p', html: 'Abreviaturas estándar de AT Protocol y criptografía usadas a lo largo de esta página.' },
        {
          kind: 'table',
          headers: ['Término', 'Definición'],
          rows: [
            [
              '<strong>AEAD</strong>',
              'Cifrado Autenticado con Datos Asociados. Un esquema de cifrado que proporciona confidencialidad e integridad en una sola operación. XSalsa20-Poly1305 es AEAD.',
            ],
            [
              '<strong>AppView</strong>',
              'En AT Protocol, un servicio que indexa registros de los PDSes para servir consultas (líneas de tiempo, búsqueda, notificaciones). El AppView de Bluesky lo ejecuta Bluesky Social.',
            ],
            ['<strong>Argon2id</strong>', 'Función de hash de contraseñas de memoria dura. Ganadora de la Password Hashing Competition de 2015.'],
            ['<strong>CSPRNG</strong>', 'Generador de Números Pseudoaleatorios Criptográficamente Seguro.'],
            [
              '<strong>DID</strong>',
              'Identificador Descentralizado. En AT Protocol, una cadena de identidad de larga vida con raíz en un repositorio (p. ej., <code>did:plc:xxxxxx</code>).',
            ],
            ['<strong>E2EE</strong>', 'Cifrado de extremo a extremo.'],
            ['<strong>EMK</strong>', 'Llave Maestra Cifrada — la Llave Maestra envuelta bajo la PDK, almacenada en el servidor de Penrose.'],
            ['<strong>EVK</strong>', 'Llave de Bóveda Cifrada — la Llave de Bóveda envuelta bajo la Llave Maestra, almacenada en el PDS del usuario.'],
            [
              '<strong>HKDF</strong>',
              'Función de Derivación de Llaves basada en HMAC (RFC 5869). Extrae entropía del material de llave de entrada y la expande en sub-llaves de salida; una cadena <code>info</code> delimita cada derivación a un propósito específico (separación de dominios). HKDF-SHA256 usa HMAC-SHA256 internamente.',
            ],
            [
              '<strong>HMAC</strong>',
              'Código de Autenticación de Mensajes basado en Hash (RFC 2104). Confirma integridad y autenticidad bajo una llave simétrica usando una función hash. HMAC-SHA256 es la instanciación con SHA-256.',
            ],
            [
              '<strong>KEM</strong>',
              'Mecanismo de Encapsulación de Llaves. Produce un secreto compartido más un texto cifrado que solo quien posea la llave privada correspondiente puede desencapsular. ML-KEM es un KEM.',
            ],
            ['<strong>MAC</strong>', 'Código de Autenticación de Mensaje. Confirma integridad y autenticidad bajo una llave simétrica.'],
            [
              '<strong>ML-KEM</strong>',
              'Mecanismo de Encapsulación de Llaves basado en Retículos de Módulo — un estándar NIST (FIPS 203) derivado de Kyber. ML-KEM-1024 es el conjunto de parámetros de Nivel 5 (el más alto).',
            ],
            [
              '<strong>NIST Nivel 5</strong>',
              'La categoría de seguridad post-cuántica más alta de NIST — al menos 256 bits de seguridad clásica-equivalente contra un adversario cuántico.',
            ],
            ['<strong>PDK</strong>', 'Llave Derivada de Contraseña — una llave de 32 bytes derivada de la contraseña de cifrado vía Argon2id.'],
            [
              '<strong>PDS</strong>',
              'Personal Data Server. En AT Protocol, el servidor de repositorio por usuario que almacena los registros de un usuario.',
            ],
            ['<strong>PKCS7</strong>', 'Esquema de relleno para cifrados por bloques como AES-CBC.'],
            ['<strong>Relay</strong>', 'En AT Protocol, un servicio tipo firehose que agrega y transmite registros de todos los PDSes.'],
            [
              '<strong>TOFU</strong>',
              'Trust-On-First-Use. Un modelo de vinculación de llaves en el que la primera llave vista para un contacto es de confianza, y la sustitución se detecta en intercambios posteriores.',
            ],
            [
              '<strong>XSalsa20-Poly1305</strong>',
              'La construcción AEAD predeterminada de libsodium — cifrado de flujo Salsa20 de nonce extendido con un MAC Poly1305.',
            ],
          ],
        },
      ],
    },
  ],
};

export default content;
