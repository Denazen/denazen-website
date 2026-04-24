export default {
  meta: {
    title: 'Denazen — Público cuando quieras. Privado cuando importa.',
    description:
      'Una red social con privacidad primero, construida sobre Bluesky. Comparte públicamente cuando quieras y en privado en círculos cifrados de extremo a extremo cuando importa.',
  },
  hero: {
    headlinePublic: 'Público cuando quieras.',
    headlinePrivate: 'Privado cuando importa.',
    lead: 'Hay cosas que no son para todos.',
    encrypted: 'Cifrado de extremo a extremo por defecto.',
    waitlistButton: 'Solicitar invitación',
    waitlistNote: 'Alpha solo por invitación. Los primeros lugares son limitados.',
    imageAltPublic: 'La app de Denazen en un iPhone mostrando un feed público de publicaciones de Bluesky.',
    imageAltPrivate:
      'La app de Denazen en un iPhone mostrando un feed privado, con una publicación etiquetada como "Compartida con tu círculo de amigos de confianza".',
  },
  whyDenazen: {
    heading: '¿Por qué Denazen?',
    body: 'La mayoría de las redes sociales te hacen actuar para todos. Denazen te deja elegir.',
  },
  publicSection: {
    heading: 'Público cuando quieras',
    paragraphs: [
      'Denazen está construido sobre Bluesky, así que te conectas directamente a una red de más de 40 millones. Publica abiertamente, sigue a quien quieras y déjate descubrir.',
      'Trae tu nombre de usuario o crea uno nuevo. Conserva todos los seguidores que ya tienes.',
    ],
    imageAlt: 'El feed público de Denazen, con las pestañas Público y Privado visibles en la parte superior de la pantalla.',
  },
  privateSection: {
    heading: 'Privado cuando importa',
    paragraphs: [
      'Para los momentos que no todos necesitan ver, Denazen añade una capa privada. Las publicaciones se cifran en tu dispositivo antes de salir de él. Solo las personas en las que confías pueden descifrarlas.',
      'Nadie más puede verlas. Ni siquiera nosotros.',
    ],
    imageAlt:
      'La pantalla de Red Privada de Denazen en iPhone, explicando el cifrado de extremo a extremo: "Ni siquiera nosotros podemos ver tus publicaciones privadas."',
  },
  circlesSection: {
    heading: 'No todo es para todos',
    paragraphs: [
      'Crea tus propios círculos privados. Comparte con tus amigos cercanos sin transmitirle a tus compañeros de trabajo. Comparte con la familia sin publicar para extraños.',
      'Tú decides quién está en cada uno, y puedes revocar el acceso en cualquier momento — de forma criptográfica, no como una promesa.',
    ],
    imageAlt:
      'La pantalla de gestión de círculos de Denazen: cuatro círculos llamados Amigos Más Cercanos, Amigos Políticos, Club de Lectura y Familia, con botones de invitación y conteo de miembros.',
  },
  features: {
    heading: 'Privacidad, sin concesiones',
    subheading: 'Una red social que cumple sus promesas porque no puede romperlas.',
    cards: [
      {
        title: 'Cifrado de extremo a extremo',
        body:
          'Las publicaciones privadas se cifran en tu dispositivo con AES-256. Solo las descifran las personas con las que las compartiste. Los servidores de Denazen no ven nada legible.',
      },
      {
        title: 'Tú controlas a la audiencia',
        body:
          'Los círculos son unidireccionales y revocables. Quita a alguien y pierde el acceso — lo impone la criptografía, no una configuración.',
      },
      {
        title: 'Construido sobre AT Protocol',
        body:
          'Identidad abierta y portátil. Usa tu nombre de usuario de Bluesky — no se requiere número de teléfono. Tu presencia pública sigue siendo tuya, portátil entre aplicaciones.',
      },
      {
        title: 'Respuestas privadas a publicaciones públicas',
        body:
          'Reacciona a cualquier cosa en Bluesky dentro de un círculo en vez de en la línea de tiempo. Conversa sin transmitir. Comentarios más seguros, sin los ataques en masa.',
      },
    ],
  },
  noAds: {
    heading: 'Sin anuncios. Sin rastreadores. Sin un algoritmo decidiendo lo que ves.',
    paragraphs: [
      'Denazen no está hecho para mantenerte deslizando. No hay anuncios, ni seguimiento de comportamiento, ni un feed ordenado por lo que te hará reaccionar. Solo las personas que elegiste escuchar.',
      'Casi todo lo que la gente hace en línea es observado — plataformas, intermediarios de datos, modelos de IA recopilando todo lo que alcanzan. El contenido privado en Denazen es opaco para todos ellos. Sin llave, no hay lectura.',
      'No vendemos tus datos. Ni siquiera podemos verlos.',
    ],
    listAria: 'Lo que Denazen no hace',
    listItems: ['Anuncios', 'Rastreadores', 'Feeds algorítmicos', 'Datos de entrenamiento'],
  },
  ctaSection: {
    heading: 'Únete al alpha',
    body:
      'Denazen está lanzando un alpha pequeño y solo por invitación. Déjanos tu correo y te avisamos cuando se abra un lugar.',
    waitlistButton: 'Solicitar invitación',
    waitlistNote: 'Sin spam. Un solo correo cuando tu invitación esté lista.',
  },
};
