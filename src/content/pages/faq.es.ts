export default {
  meta: {
    title: 'Preguntas frecuentes — Denazen',
    description: 'Respuestas a preguntas comunes sobre Denazen: qué es, cómo funciona la privacidad y cómo entrar.',
  },
  heading: 'Preguntas frecuentes',
  lead: 'La versión corta: Denazen es una red social con privacidad primero sobre Bluesky, con círculos privados que solo los destinatarios que elijas pueden leer.',
  groups: [
    {
      heading: 'Producto',
      items: [
        {
          q: '¿Qué es Denazen?',
          a: ['Denazen es una red social con dos capas. La capa pública es Bluesky estándar — publicaciones abiertas, seguimientos abiertos, descubrimiento abierto. La capa privada es contenido cifrado de extremo a extremo que solo pueden leer las personas que hayas añadido a un círculo.'],
        },
        {
          q: '¿Cómo se relaciona Denazen con Bluesky?',
          a: ['Denazen está construido sobre el AT Protocol, el mismo protocolo abierto que impulsa a Bluesky. Tus publicaciones públicas viven en Bluesky. Tu nombre de usuario de Bluesky funciona aquí. Tus seguidores vienen contigo. La capa privada es una capacidad adicional que Denazen añade encima.'],
        },
        {
          q: '¿Qué es un Círculo?',
          a: ['Un Círculo es un grupo privado que tú defines. Tú decides quién está en él. Las publicaciones compartidas en un Círculo están cifradas de extremo a extremo, así que solo las personas en ese Círculo pueden leerlas. Puedes tener muchos Círculos — uno para la familia, uno para amigos cercanos, uno para compañeros de trabajo — y la misma publicación se puede compartir con uno o varios de ellos.'],
        },
        {
          q: '¿En qué se diferencia un Círculo de un chat grupal?',
          a: ['Los chats grupales son para conversación de ida y vuelta. Los Círculos son para compartir — fotos, publicaciones, pensamientos — con una audiencia elegida, de la misma forma que publicarías públicamente pero limitado a personas específicas. Los Círculos también son unidireccionales: tú controlas quién está en el tuyo; no tienen que corresponder.'],
        },
        {
          q: '¿Puedo responder en privado a una publicación pública?',
          a: ['Sí. Puedes reaccionar a cualquier cosa en la línea de tiempo pública dentro de un Círculo en lugar del hilo abierto — discútelo con tu gente sin transmitir tu opinión a internet.'],
        },
      ],
    },
    {
      heading: 'Privacidad',
      items: [
        {
          q: '¿Cómo funciona aquí el cifrado de extremo a extremo?',
          a: ['El contenido privado se cifra en tu dispositivo antes de enviarse. Las llaves de descifrado solo existen en los dispositivos de las personas con las que has compartido. Los servidores de Denazen y los servidores de Bluesky almacenan el texto cifrado pero no pueden leerlo.'],
        },
        {
          q: '¿Puede Denazen leer mis publicaciones privadas?',
          a: ['No. Nunca tenemos las llaves para descifrarlas. Eso se hace cumplir criptográficamente, no por política.'],
        },
        {
          q: '¿Qué hay de los servidores de Bluesky?',
          a: ['El contenido privado se cifra antes de salir de tu dispositivo. Sea cual sea el camino que tome — PDS de Bluesky, servidores de Denazen — es texto cifrado en todas partes excepto en los dispositivos de los destinatarios que elegiste.'],
        },
        {
          q: '¿Qué pasa cuando quito a alguien de un Círculo?',
          a: ['Pierden acceso inmediatamente a las publicaciones futuras en ese Círculo. La criptografía se rota para que lo nuevo no se pueda leer con las llaves viejas. Las publicaciones que ya descargaron antes de ser quitadas no se pueden «des-ver» — ese es un límite fundamental del compartir — pero nada a partir de ese momento será legible para ellos.'],
        },
        {
          q: '¿Hay anuncios o rastreadores?',
          a: ['Sin anuncios. Sin rastreadores. Sin feed algorítmico que optimice para el enganche. El modelo de negocio no depende de vigilarte.'],
        },
      ],
    },
    {
      heading: 'Lanzamiento y acceso',
      items: [
        {
          q: '¿Cuándo puedo unirme?',
          a: ['Denazen está ahora mismo en un alpha pequeño solo por invitación. Únete a la lista de espera y te contactaremos a medida que abramos más invitaciones.'],
        },
        {
          q: '¿Cómo funciona el sistema de invitaciones?',
          a: ['El alpha tiene un alcance reducido — 30 a 50 personas — para mantener al grupo unido mientras afinamos el producto. En la beta, los miembros existentes reciben códigos de invitación que pueden compartir con personas en las que confían. El crecimiento es impulsado por la red, no por la publicidad.'],
        },
        {
          q: '¿Es gratis?',
          a: ['Sí. El plan a largo plazo es un modelo freemium: el nivel gratuito cubre la experiencia social privada central; un nivel premium añade más círculos y funciones avanzadas.'],
        },
      ],
    },
    {
      heading: 'Cuenta',
      items: [
        {
          q: '¿Necesito una cuenta de Bluesky?',
          a: ['Sí — Denazen usa la identidad del AT Protocol. Si todavía no tienes un nombre de usuario de Bluesky, crear uno toma un minuto y puedes usarlo aquí.'],
        },
        {
          q: '¿Qué pasa con mi nombre de usuario y seguimientos existentes de Bluesky?',
          a: ['Vienen contigo. Tus publicaciones públicas y seguimientos en Bluesky se quedan exactamente como están hoy. Denazen añade la capa privada; no reemplaza la pública.'],
        },
        {
          q: '¿Necesitan mi número de teléfono?',
          a: ['No. La identidad proviene de tu nombre de usuario del AT Protocol. El correo se usa para tu cuenta y la comunicación de la lista de espera; no se requiere número de teléfono.'],
        },
        {
          q: '¿Qué pasa si olvido mi contraseña de cifrado?',
          a: [
            'Tu contenido privado se vuelve permanentemente inaccesible. Esto es intencional: si Denazen tuviera una forma de recuperarlo por ti, Denazen también podría leer tu contenido privado — rompiendo la promesa central.',
            'Tu identidad pública de Bluesky, nombre de usuario y seguimientos no se ven afectados; esos están vinculados a tu contraseña de Bluesky, que se puede recuperar a través de Bluesky de la forma normal. Pero tus Círculos, publicaciones privadas pasadas, DMs recibidos y las llaves que los descifran dependen todos de la contraseña de cifrado.',
            'Anota la contraseña en un lugar seguro, o usa un gestor de contraseñas.',
          ],
        },
        {
          q: '¿Puedo usar Denazen en más de un dispositivo?',
          a: [
            'Sí. Denazen es multi-dispositivo por diseño. No emparejas dispositivos ni sincronizas llaves entre ellos manualmente; tus llaves cifradas ya viven en infraestructura pública (el servidor de Denazen y tu PDS de Bluesky), y cualquier dispositivo puede desbloquearlas con las mismas tres credenciales: tu nombre de usuario de Bluesky, tu contraseña de Bluesky y tu contraseña de cifrado de Denazen.',
            'Inicia sesión en un teléfono, laptop o tableta nueva de la misma forma que lo harías en tu dispositivo existente. Cada Círculo, contacto y mensaje pasado está disponible. Cerrar sesión borra las llaves de ese dispositivo hasta el siguiente desbloqueo.',
          ],
        },
      ],
    },
  ],
  cta: {
    heading: '¿Aún tienes preguntas?',
    body: 'Únete a la lista de espera y te contactaremos.',
    waitlistButton: 'Solicitar invitación',
  },
};
