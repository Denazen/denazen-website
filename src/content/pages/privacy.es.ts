export default {
  meta: {
    title: 'Política de Privacidad — Denazen',
    description:
      'La política de privacidad de Denazen: qué recopilamos, qué no, y cómo el cifrado de extremo a extremo limita lo que siquiera podríamos ver.',
  },
  heading: 'Política de Privacidad',
  lastUpdatedLabel: 'Última actualización: ',
  lastUpdatedDate: '2026-04-18',
  lastUpdatedText: 'se fijará en la publicación',
  placeholderNotice:
    'Esta es una plantilla provisional. La Política de Privacidad definitiva debe ser revisada y finalizada por asesoría legal calificada antes de su publicación.',
  sections: [
    {
      heading: 'Quiénes somos',
      paragraphs: [
        'Denazen («nosotros», «nos», «nuestro») opera el sitio web denazen.com y la aplicación social Denazen. Denazen está construido sobre el AT Protocol; parte del contenido público que creas en Denazen es manejado por la infraestructura del AT Protocol / Bluesky.',
      ],
    },
    {
      heading: 'Información que recopilamos',
      list: [
        {
          label: 'Información de la cuenta:',
          body: ' tu correo electrónico (usado para la comunicación de lista de espera y el acceso a la cuenta) y tu nombre de usuario del AT Protocol.',
        },
        {
          label: 'Contenido público:',
          body: ' las publicaciones, "me gusta" y seguimientos que publicas en la capa pública (Bluesky) son públicos por diseño.',
        },
        {
          label: 'Contenido privado cifrado:',
          body: ' el texto cifrado de tus publicaciones privadas transita y se almacena en nuestros servidores, pero no podemos leerlo. No tenemos las llaves de descifrado.',
        },
        {
          label: 'Metadatos operativos mínimos:',
          body: ' tiempos y tamaños de las solicitudes para operar el servicio, información básica del dispositivo para resolución de problemas.',
        },
      ],
    },
    {
      heading: 'Qué no recopilamos',
      list: [
        { body: 'No recopilamos identificadores publicitarios.' },
        { body: 'No rastreamos tu comportamiento en otros sitios o aplicaciones.' },
        { body: 'No tenemos acceso al contenido de tus publicaciones privadas (cifradas de extremo a extremo).' },
      ],
    },
    {
      heading: 'Cómo usamos la información',
      paragraphs: [
        'Usamos la información de la cuenta para operar el servicio, comunicarnos contigo y asegurar tu cuenta. Usamos los metadatos operativos para mantener el servicio funcionando de forma confiable.',
      ],
    },
    {
      heading: 'Compartir',
      paragraphs: [
        'No vendemos tu información personal. Se comparte información limitada con proveedores de servicios estrictamente para operar Denazen (por ejemplo, alojamiento de infraestructura, envío de correos para comunicación de la cuenta). El contenido público se comparte a través de la red del AT Protocol por diseño.',
      ],
    },
    {
      heading: 'Tus opciones',
      list: [
        { body: 'Puedes solicitar la eliminación de tu cuenta de Denazen.' },
        { body: 'Puedes revocar el acceso de una persona a un Círculo; la criptografía lo hará cumplir de ahí en adelante.' },
        { body: 'Puedes cancelar la suscripción a la comunicación por correo no esencial.' },
      ],
    },
    {
      heading: 'Seguridad',
      paragraphs: ['El contenido privado se cifra de extremo a extremo en tu dispositivo antes de llegar a nuestros servidores.'],
    },
    {
      heading: 'Cambios a esta política',
      paragraphs: [
        'Publicaremos los cambios importantes aquí y, cuando corresponda, te notificaremos por correo antes de que entren en vigor.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: ['Preguntas: '],
      contactEmail: 'privacy@denazen.com',
    },
  ],
};
