export default {
  meta: {
    title: 'Penrose',
    description:
      'Una red social hecha para relaciones reales—con espacios privados, control real y sin anuncios ni rastreo.',
  },
  hero: {
    heading: 'Las redes sociales, sin concesiones.',
    linesBefore: [],
    rotator: {
      prefix: 'Conexión como ',
      words: ['Facebook', 'Instagram'],
      suffix: ' en sus <em>primeros días</em>.',
    },
    linesAfter: [
      'Privacidad inspirada en Signal.',
      'Libertad de Bluesky.',
    ],
    waitlistButton: 'Solicitar invitación',
    waitlistNote: 'Beta solo por invitación próximamente. Ayuda a dar forma al futuro de las redes sociales.',
    imagePublic: {
      src: '/images/screenshots/hero-public.webp',
      alt: 'La app de Penrose en un iPhone mostrando un feed público de publicaciones de Bluesky.',
    },
    imagePrivate: {
      src: '/images/screenshots/hero-private.webp',
      alt: 'La app de Penrose en un iPhone mostrando un feed privado con una publicación etiquetada como "Compartida con tu círculo de amigos de confianza".',
    },
  },
  whatPenrose: {
    heading: '¿Te acuerdas cuando lo social era social?',
    paragraphs: [
      'Las redes sociales empezaron como una forma de mantenerte al día con las personas de tu vida—las personas a las que de verdad llamarías. Tu hermana. Tu compañera de cuarto de la universidad. Tus amigos más cercanos.',
      'En algún momento, el feed dejó de ser sobre ellos. Se convirtió en extraños, performers y anuncios—lo que un algoritmo decidiera para mantenerte desplazándote.',
    ],
    resolution: 'Penrose vuelve a poner a las personas en el centro.',
    list: [
      'Crea círculos para las personas que importan—amigos cercanos, familia, tu club de lectura',
      'Un feed cronológico de las personas que realmente elegiste seguir',
      'Comparte momentos pensados para unos pocos, no publicaciones diseñadas para alcanzar a millones',
      'Menos performance. Más presencia.',
    ],
    image: {
      src: '/images/screenshots/whats-denazen.webp',
      alt: 'El feed privado de Penrose mostrando una publicación del viaje de una pareja compartida con el círculo Familia del usuario.',
    },
  },
  privacy: {
    heading: 'Privado significa privado.',
    paragraphs: [
      'Las publicaciones que compartes con un círculo se cifran en tu dispositivo antes de salir de él. Solo las personas en las que confías dentro de ese círculo tienen las llaves para descifrarlas.',
      'Ni los anunciantes. Ni la IA. Ni los gobiernos. <em>Nadie más.</em> Ni siquiera nosotros—las llaves viven en tus dispositivos y no tenemos forma de descifrar tu contenido.',
    ],
    closer: 'Criptografía, no políticas. La matemática es la promesa.',
    image: {
      src: '/images/screenshots/private-network.webp',
      alt: 'La pantalla de Red Privada de Penrose en iPhone, explicando el cifrado de extremo a extremo.',
    },
  },
  freedom: {
    heading: 'La libertad de una red abierta.',
    intro:
      'Penrose corre sobre el AT Protocol—la red social abierta detrás de Bluesky y más de 40 millones de personas. Tienes un mundo entero de conversación pública al alcance: sumérgete en cualquier tema que te importe, sigue voces fuera de tu círculo y descubre lo que realmente está pasando—no lo que un algoritmo decidió mostrarte.',
    list: [
      'Explora publicaciones públicas sobre cualquier tema—política, arte, ciencia, tu hobby de nicho',
      'Trae tu handle existente de Bluesky, o empieza desde cero en la app',
      'Lleva tus seguidores, publicaciones e identidad a cualquier app del AT Protocol',
      'Elige tus propios algoritmos—o sáltatelos por completo',
    ],
    closing: [
      'Tú eliges lo que importa. Tú eliges cómo experimentarlo.',
      'Si algún día dejamos de ser el lugar adecuado para ti, tu red se va contigo.',
    ],
    bskyNote:
      'Los usuarios actuales de Bluesky pueden iniciar sesión con su cuenta existente, o puedes crear una nueva en la app.',
    image: {
      src: '/images/screenshots/circles.webp',
      alt: 'La pantalla de gestión de círculos de Penrose mostrando círculos definidos por el usuario como Amigos Más Cercanos, Familia y Club de Lectura.',
    },
  },
  values: {
    heading: 'Construido diferente—a propósito.',
    paragraphs: [
      'Penrose es una Public Benefit Corporation. Eso significa que nuestra misión no es solo una promesa. Es parte de nuestra estructura legal.',
      'Somos responsables ante las personas que usan la plataforma y el mundo en el que estamos construyendo. Desde el primer día contribuiremos con una parte de las ganancias a causas que incluyen la conservación y la protección del medio ambiente, los derechos civiles y humanos, y la privacidad.',
      'Penrose es gratis para todos, con funciones premium que nos permiten mantenernos independientes y no depender de anuncios, rastreo ni extracción de atención.',
      'Estamos construyendo un modelo basado en la reciprocidad—diseñado para devolver a las personas que hacen esta red lo que es.',
    ],
  },
};
