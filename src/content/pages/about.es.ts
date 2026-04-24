export default {
  meta: {
    title: 'Nosotros — Denazen',
    description: 'Por qué estamos construyendo Denazen: una red social donde la privacidad es lo predeterminado, no una configuración.',
  },
  hero: {
    heading: 'Una red social donde la privacidad es lo predeterminado.',
    lead: 'La mayoría de las personas no publica lo que realmente piensa. No porque no tengan nada que decir — sino porque saben quién está mirando, y no son solo las personas con las que quieren hablar.',
  },
  problem: {
    heading: 'El problema',
    paragraphs: [
      'Las redes sociales convencionales colapsaron todas nuestras relaciones en una sola audiencia. Familia, compañeros de trabajo, amigos cercanos, extraños, algoritmos, anunciantes — todos leen la misma publicación. Así que nos autocensuramos. Actuamos. Compartimos la versión segura, o no compartimos nada.',
      'Las apps de mensajería cifrada (como Signal) resolvieron el lado privado de esto, pero están desconectadas del lado social. Los chats grupales son para conversación directa, no para compartir una foto con «las personas a las que les importaría esto». No hay forma de vivir públicamente en línea <em>y</em> mantener una vida privada con personas específicas — al mismo tiempo, en la misma app.',
      'Hay otra capa: lo que publicas en plataformas convencionales no solo llega a las personas — alimenta perfiles publicitarios, expedientes de corredores de datos y modelos de IA que se entrenan con lo que puedan recopilar. Lo que compartes se convierte en un activo de otra persona. Denazen está diseñado para que el contenido privado simplemente nunca lo sea.',
    ],
  },
  whyDenazen: {
    heading: 'Por qué Denazen',
    intro: 'Denazen divide la red en dos capas:',
    list: [
      {
        label: 'Público:',
        body: ' Bluesky estándar. Abierto, descubrible, portátil. Trae tu nombre de usuario; publica como siempre.',
      },
      {
        label: 'Privado:',
        body: ' círculos cifrados de extremo a extremo. Comparte exactamente con las personas que elijas. Nadie más — ni la red, ni los servidores, ni nosotros — puede leerlo.',
      },
    ],
    trailing:
      'La capa privada no es una promesa que te pedimos que creas. Está construida sobre criptografía: el contenido se cifra en tu dispositivo antes de salir, con llaves que solo los destinatarios que tú eliges poseen. Quita a alguien de un círculo y pierde el acceso de verdad.',
  },
  whyBuiltThisWay: {
    heading: 'Por qué está construido así',
    paragraphs: [
      'Elegimos el AT Protocol porque es abierto, portátil y no es propiedad de nadie. Puedes llevarte tu identidad a otro lado si dejamos de valer la pena. Eso es lo predeterminado correcto para una red social, y es lo opuesto a cómo funcionan la mayoría de las plataformas.',
      'Elegimos el cifrado de extremo a extremo porque «respetamos tu privacidad» no es suficiente. La única forma honesta de prometer que no podemos leer tus publicaciones es hacerlo criptográficamente imposible.',
    ],
  },
  pbc: {
    heading: 'Una corporación de beneficio público',
    paragraphs: [
      'Denazen es una Public Benefit Corporation. La estructura nos obliga legalmente a perseguir una misión pública — así que el compromiso con la privacidad primero no son solo palabras. Es parte fundamental del estatuto de la empresa.',
      'El modelo de negocio se deriva de eso. No vendemos datos y no mostramos anuncios. Denazen se financia con las personas que usan la plataforma, no con lo que se puede manipularlas a ver. Una parte de las ganancias se destina, desde el primer día, a trabajo filantrópico — proteger ecosistemas naturales y apoyar a comunidades vulnerables — y crecerá a medida que lo hagamos nosotros.',
    ],
  },
  team: {
    heading: 'Quiénes somos',
    intro: 'Denazen está construido por dos personas.',
    founders: [
      {
        photo: '/images/team/cory.webp',
        photoAlt: 'Cory Welch',
        name: 'Cory Welch.',
        bio:
          ' Maestrías en ingeniería y negocios por el MIT. Pasó su carrera en la transición a energías limpias. Fundó Denazen porque el panorama de las redes sociales está roto y es lo siguiente que necesita arreglo.',
      },
      {
        photo: '/images/team/ian.webp',
        photoAlt: 'Ian Tassin',
        name: 'Ian Tassin.',
        bio:
          ' Estudiante de doctorado en ciencias de la computación en Oregon State. Originador de la idea y de la arquitectura inicial de cifrado. Cree que la privacidad es un derecho, no una característica.',
      },
    ],
  },
  whereWeAre: {
    heading: 'Dónde estamos',
    body:
      'Denazen está en fase previa al lanzamiento, corriendo una beta pequeña y solo por invitación. Si la propuesta te resuena, únete a la lista de espera — te contactaremos cuando se abra un lugar.',
  },
  cta: {
    heading: 'Únete a la beta',
    body: 'Grupos pequeños, invitaciones cerradas. Ayuda a dar forma a la capa privada de las redes sociales.',
    waitlistButton: 'Solicitar invitación',
  },
};
