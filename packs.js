/* Packs temáticos de «Misterio diario»: cada pack es una saga de 10 capítulos con guion fijo.
   Cada capítulo fija quiénes están bajo sospecha, quién es el culpable, dónde y con qué; lo que sigue siendo variable
   es el rompecabezas (quién estuvo dónde y con qué objeto), así que cada dificultad tiene sus propias pistas. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MisterioPacks = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // formato compacto: sospechoso 'Nombre|descripción|emoji' · lugar/objeto 'artículo|nombre|emoji|etiqueta corta'
  function S_(a) { return a.map(function (x) { var p = x.split('|'); return { n: p[0], d: p[1], e: p[2] }; }); }
  function I_(a) { return a.map(function (x) { var p = x.split('|'); return { a: p[0], n: p[1], e: p[2], s: p[3] || p[1] }; }); }

  /* =====================================================================
     PACK 1 · BAKER STREET — «Las siete llaves» (Londres, 1890)
     Inspirado en el universo literario de Arthur Conan Doyle (obras y personajes de dominio público).
     Giro final (no desvelar antes): el Relojero es el inspector Lestrade, que encadenó las puertas del incendio de 1883.
     ===================================================================== */
  var BAKER = {
    id: 'baker', hue: 105, nombre: 'Baker Street', ico: '🕰️',
    voz: ['El sereno de la calle jura que', 'El cochero del coche de punto asegura que', 'Un vendedor de periódicos recuerda que', 'El Times publicó que', 'Una florista de Covent Garden asegura que', 'El farolero recuerda que', 'Un agente de ronda anotó que', 'El telegrafista comprobó que'],
    suspects: S_(['Watson|el médico militar retirado|🩺', 'Lestrade|el inspector de Scotland Yard|🕵️', 'Irene|la cantante de ópera|🎤', 'Moriarty|el profesor de matemáticas|🎓', 'Hudson|la casera de Baker Street|🫖',
                  'Mycroft|el funcionario del Gobierno|🎩', 'Moran|el coronel cazador|🎖️', 'Wiggins|el jefe de los golfillos|🧢', 'Lady Ashby|la viuda del conde|👒', 'Henry|el heredero de los Baskerville|🐕']),
    places: I_(['el|salón de 221B|🛋️|221B', 'el|laboratorio químico|⚗️|laboratorio', 'el|muelle del Támesis|🚢|muelle', 'el|club Diógenes|🤫|Diógenes', 'la|estación de Paddington|🚉|Paddington',
                'el|teatro de variedades|🎭|teatro', 'el|Museo Británico|🏛️|museo', 'el|mercado de Covent Garden|🍎|mercado', 'los|jardines de Kensington|🌳|Kensington', 'la|catedral de San Pablo|⛪|catedral', 'la|torre del reloj|🕰️|torre']),
    weapons: I_(['el|bastón estoque|🦯|estoque', 'el|veneno de la botica|🧪|veneno', 'el|violín|🎻', 'el|revólver de servicio|🔫|revólver', 'el|cuchillo de carnicero|🔪|cuchillo',
                 'la|lupa de bronce|🔍|lupa', 'el|candelabro de plata|🕯️|candelabro', 'la|cuerda de seda|🪢|cuerda', 'la|cadena de reloj|⛓️|cadena', 'el|atizador|🔥', 'el|rifle de aire comprimido|🎯|rifle', 'el|cloroformo|🧴'])
  };
  var BAKER_CAP = [
    { t: 'Niebla sobre el Támesis', l: 'Londres · 3 de noviembre de 1890', victima: 'el notario Ambrose Pike',
      cast: ['Moran', 'Watson', 'Lestrade', 'Wiggins', 'Moriarty'], culpable: 'Moran',
      lugares: ['muelle', '221B', 'Paddington', 'mercado', 'Diógenes'], armas: ['rifle', 'estoque', 'veneno', 'cuerda', 'candelabro'], lugar: 'muelle', arma: 'rifle',
      previo: '',
      intro: ['Holmes se marchó ayer de Londres. Un telegrama de Viena, una maleta y una sola frase antes de cruzar la puerta: «Aquí queda mi sillón, aprendiz. Procura no romperlo». Esta mañana, la niebla ha traído algo peor que el frío.',
              'Un golfillo de Wiggins ha dado la alarma: en la orilla del Támesis yace el notario Ambrose Pike, con un disparo limpio y, en la mano, una pequeña llave de latón, de las que dan cuerda a un reloj. El inspector Lestrade ha llegado antes que nadie, como siempre.',
              'Pike guardaba los secretos de media ciudad. Scotland Yard ha apuntado cinco nombres y Watson te espera con el abrigo puesto. Es tu primer caso sin Holmes. Que no se note.'],
      epi: ['Moran ni siquiera intentó huir. Apoyado en un farol, con el rifle de aire aún envuelto en un paño, dejó que Lestrade lo esposara sin una palabra. Solo sonrió cuando le preguntaste por la llave.',
            '—No fue idea mía —dijo—. Me llegó una nota: un reloj dibujado a tinta, con las agujas a las doce menos dieciocho, y un sobre con más dinero del que he visto en diez años. Pike debía morir antes del alba. Nada más. A quien firma con ese reloj nunca le he visto la cara.',
            'Se lo llevaron en un coche cerrado. Tú te quedaste con la llave de latón en la palma, viendo cómo la niebla se tragaba el muelle. Alguien había contado con que la encontrarías.'],
      gancho: 'Esa noche llega a Baker Street un paquete sin remitente: un reloj de bolsillo parado a las 11:42 y una nota de dos palabras. «Quedan seis.»' },

    { t: 'El violín desaparecido', l: 'Londres · 5 de noviembre de 1890', victima: 'el coleccionista Percival Dunne',
      cast: ['Lady Ashby', 'Irene', 'Mycroft', 'Henry', 'Wiggins'], culpable: 'Lady Ashby',
      lugares: ['teatro', 'museo', 'mercado', 'Kensington', 'Paddington'], armas: ['candelabro', 'violín', 'veneno', 'atizador', 'lupa'], lugar: 'teatro', arma: 'candelabro',
      previo: 'El notario Pike murió en el muelle con una llave de latón en la mano. Moran, el tirador, solo habla de una nota con un reloj dibujado: las 11:42.',
      intro: ['El reloj parado en las 11:42 lleva dos días sobre la repisa de Baker Street. Watson lo mira como quien mira una serpiente: «Esto no es un aviso, es un calendario». No tarda en darle la razón.',
              'Anoche, en el Teatro de Variedades, se celebraba el concierto de gala de la temporada. El coleccionista Percival Dunne nunca llegó a ocupar su palco: lo hallaron entre bastidores, sin vida. Y su violín —un instrumento que vale más que el teatro entero— ha desaparecido.',
              'Mycroft Holmes ha salido de su club para venir en persona, algo que no hacía desde hacía años. «Ese violín escondía algo más que música», dice. Cinco personas estuvieron en el teatro esa noche. Una de ellas sabe dónde está.'],
      epi: ['Lady Ashby te recibió en su salón con la espalda recta y las manos temblando. Sobre la mesa, el violín. Dentro, atornillada bajo la tapa, una segunda llave de latón idéntica a la del muelle.',
            '—Dunne no tenía que morir —susurró—. Se interpuso. El candelabro estaba allí, y yo solo... —Calló, y después lo contó todo: alguien le enviaba cartas que probaban que su difunto marido había firmado, hacía años, unos papeles sobre un incendio. Al pie de cada carta, un reloj dibujado.',
            'No pidió clemencia. Solo preguntó si el nombre de su marido saldría en los periódicos. Tú no supiste qué responder. Aquel incendio de 1883 empezaba a tener demasiados nombres.'],
      gancho: 'Al día siguiente, un joven de aire cansado espera en la puerta de 221B: Henry, heredero de una familia con demasiada fama en Dartmoor. Dice que su padre murió en un incendio en Wapping, y que tiene una pregunta sobre un tal Silas Crowe.' },

    { t: 'El hombre que hablaba demasiado', l: 'Londres · 8 de noviembre de 1890', victima: 'el comerciante Silas Crowe',
      cast: ['Henry', 'Mycroft', 'Lestrade', 'Irene', 'Watson'], culpable: 'Henry',
      lugares: ['mercado', 'Diógenes', 'Kensington', 'Paddington', '221B'], armas: ['cuerda', 'veneno', 'estoque', 'lupa', 'cadena'], lugar: 'mercado', arma: 'cuerda',
      previo: 'En el violín de Dunne había una segunda llave. Lady Ashby confesó: alguien la chantajeaba con un secreto de su marido sobre un incendio ocurrido en 1883.',
      intro: ['Silas Crowe llevaba cuarenta años hablando más de la cuenta. En las tabernas de Covent Garden se decía que sabía cosas del incendio de Wapping, y que esta semana, por fin, iba a contárselas a Scotland Yard. Anoche estuvo hablando hasta cerca de medianoche.',
              'Esta mañana lo han encontrado en el reservado de la taberna, con una cuerda de seda al cuello y la boca entreabierta, como si aún tuviera algo que decir. Entre sus manos, otra llave de latón: la tercera. Lestrade ya estaba allí cuando abrieron las puertas del mercado.',
              'Henry, el joven que visitó Baker Street, estuvo preguntando por Crowe toda la noche. Mycroft observa con una curiosidad inquietante. Watson, a tu lado, murmura lo que todos piensan: «Alguien no quiere que se hable de ese fuego».'],
      epi: ['Henry no negó nada. Sentado en el escalón de la taberna, con las manos entre las rodillas, contó que su padre murió en el incendio de Wapping y que durante siete años había buscado a los culpables. Crowe era el primer nombre de una lista.',
            '—Me llegó una carta hace un mes —dijo—. Sin firma, con un reloj dibujado en la esquina. Siete nombres. «Ellos mataron a tu padre.» No me pedía nada. Solo me daba nombres.',
            'Lestrade lo esposó sin un gesto. Los periódicos ya habían bautizado a quien firmaba con el reloj: «el Relojero». Tú te quedaste mirando el reservado vacío y preguntándote quién había escrito esa lista, y por qué se la ofrecía a un joven con ganas de venganza.'],
      gancho: 'La noche siguiente llega a Baker Street una invitación con lacre negro: baile de máscaras en los jardines de Kensington. Al pie, un reloj dibujado.' },

    { t: 'Baile de máscaras', l: 'Londres · 15 de noviembre de 1890', victima: 'lord Hawthorne',
      cast: ['Moriarty', 'Irene', 'Mycroft', 'Lestrade', 'Watson'], culpable: 'Moriarty',
      lugares: ['Kensington', 'teatro', 'museo', 'catedral', 'Diógenes'], armas: ['estoque', 'cadena', 'candelabro', 'lupa', 'revólver'], lugar: 'Kensington', arma: 'estoque',
      previo: 'Henry estranguló a Crowe por venganza: alguien le había dado una lista de siete nombres. Tres llaves, tres muertos, y un Relojero sin cara.',
      intro: ['La invitación llegó con lacre negro: baile de máscaras en los jardines de Kensington, esta noche. Al pie, el dibujo de un reloj con las agujas en las 11:42. Watson dijo que era una trampa. Tú dijiste que sí. Y fuisteis igualmente.',
              'Entre cuatrocientas máscaras es fácil esconderse. Lord Hawthorne, anfitrión de la velada, salió a la terraza a medianoche para tomar el aire. Cuando sonaron las campanadas, su máscara de arlequín seguía junto a la balaustrada, pero él ya no se movía. Una herida limpia, de estoque.',
              'En el salón, entre el humo de los candelabros, alguien se alzó la máscara frente a ti: el profesor Moriarty. «Qué decepción —dijo—. Me acusarán de esto, y ni siquiera lo haría tan mal.» Cinco personas estaban cerca de esa terraza. Todas tienen una máscara que quitarse.'],
      epi: ['Moriarty aplaudió cuando lo señalaste. Lento, irónico, con la punta del estoque aún manchada. —Brillante. Sí: fui yo. Hawthorne me debía un favor que no pensaba pagar. Y alguien me avisó de a qué hora saldría a la terraza.',
            'Te miró con una atención casi paternal. —Pero no soy yo quien dibuja relojes, aprendiz. Yo mato por negocios, no por teatro. Alguien está usando mi nombre —y mi estilo— para tapar el suyo. Tengo el mismo interés que tú en saber quién.',
            'Lestrade quiso esposarlo, pero justo entonces la orquesta calló y se apagaron las lámparas. Cuando volvieron a encenderse, solo quedaba una máscara en el suelo y una frase dejada caer en el aire: «Cuatro llaves. Cuenta bien. Quien lleva la cuenta no siempre es quien parece.»'],
      gancho: 'Esa madrugada llega por fin el telegrama que esperabas de Viena. Tres palabras de Holmes: «Desconfía de todos.»' },

    { t: 'El último tren', l: 'Londres · 22 de noviembre de 1890', victima: 'el banquero Edmund Vale',
      cast: ['Irene', 'Watson', 'Lestrade', 'Moriarty', 'Wiggins'], culpable: 'Irene',
      lugares: ['Paddington', 'muelle', 'mercado', 'teatro', 'museo'], armas: ['revólver', 'cuchillo', 'veneno', 'cadena', 'cuerda'], lugar: 'Paddington', arma: 'revólver',
      previo: 'Moriarty admitió el crimen del baile y se esfumó entre las máscaras. Negó ser el Relojero: «Alguien usa mi nombre para tapar el suyo». Holmes, desde Viena, solo envía un consejo: desconfiar de todos.',
      intro: ['El último tren a Dover salía a medianoche y el banquero Edmund Vale tenía billete en primera. Esa tarde había recibido, como los otros, un reloj de bolsillo parado a las 11:42, y no esperó a que le salieran las cuentas: quería cruzar el Canal antes de que llegase la quinta llave.',
              'No llegó a Dover. En el andén de Paddington, entre el vapor de la locomotora y la gente que despedía a alguien, se oyó un disparo que nadie supo situar. Vale cayó junto a su maleta. En la solapa, cosida con hilo, otra llave de latón: la quinta.',
              'Lestrade cerró el andén en tres minutos. Tú, Watson y varias personas quedasteis dentro: viajeros, curiosos y un par de rostros que no deberían estar allí. Todos tienen billete. Ninguno tiene prisa por explicar por qué.'],
      epi: ['Irene Adler no esperó a que la acusaras. Se quitó un guante, dejó el revólver sobre un banco del andén y lo empujó hacia ti con dos dedos. —Era un trabajo —dijo—. No me enorgullezco, pero pagaba bien.',
            'Alguien le había escrito prometiéndole algo que llevaba años buscando: la devolución de una fotografía que podía arruinarla. Un reloj dibujado en la esquina. Exigió ver una cara, oír una voz. Solo recibió instrucciones, siempre por carta, siempre con una letra pulcra y regular.',
            '—Quien escribe así —añadió— no es un criminal de callejón. Es alguien acostumbrado a que obedezcan sin preguntar. —Y tú pensaste en Mycroft, en Lestrade, en media Inglaterra con despacho propio, y en lo poco que te gustó esa lista.'],
      gancho: 'Una semana después, el té de la señora Hudson sabe distinto. En el salón de 221B espera un visitante ansioso, con un maletín de planos bajo el brazo. «Necesito hablar con alguien antes de que me llegue el reloj», dice Horace Finch.' },

    { t: 'El perito de los planos', l: 'Londres · 1 de diciembre de 1890', victima: 'el perito Horace Finch',
      cast: ['Hudson', 'Watson', 'Wiggins', 'Mycroft', 'Lestrade'], culpable: 'Hudson',
      lugares: ['221B', 'laboratorio', 'mercado', 'Diógenes', 'Kensington'], armas: ['veneno', 'atizador', 'lupa', 'cuchillo', 'violín'], lugar: '221B', arma: 'veneno',
      previo: 'Irene Adler mató al banquero Vale en Paddington a cambio de una fotografía. Cinco llaves, cinco muertos, y un Relojero que escribe con letra pulcra y nunca da la cara.',
      intro: ['Horace Finch era perito: en 1883 había firmado el informe que declaraba seguros los almacenes de Wapping. Seis semanas después ardieron, con treinta y un obreros dentro. No había dormido desde entonces. Llegó a Baker Street con un maletín de planos y una frase: «Quiero confesarlo todo antes de que me llegue el reloj».',
              'La señora Hudson le sirvió el té. Watson le tomó el pulso, que ya era el de un hombre asustado. Finch dio un sorbo, se llevó la mano al pecho y miró hacia la puerta como si esperase a alguien. No llegó a pronunciar el nombre. Cayó sobre el sillón de Holmes con los planos en el regazo.',
              'Murió en 221B, en tu casa, a tres pasos de ti. La sexta llave estaba en el bolsillo de su chaleco. El veneno, en el té. Y las únicas personas que habían entrado en esa casa en las últimas horas eran personas que tú conocías bien.'],
      epi: ['La señora Hudson no negó nada. Se quedó en el pasillo con el delantal doblado entre las manos y te pidió permiso para sentarse. —Mi hijo Tommy trabajaba en el turno de noche de aquellos almacenes —dijo—. Tenía diecinueve años.',
            'Durante siete años buscó respuestas sin saber a quién preguntar. Hace tres semanas, una carta con un reloj en la esquina le dio un nombre y un frasquito. —Solo tenía que servirle el té al hombre del informe. No me dijeron que sería en vuestra casa. No me dijeron que se sentaría en el sillón de Holmes. —Lloró sin hacer ruido.',
            'Watson cerró los planos de Finch y los apartó con cuidado. En uno de ellos, alguien había dibujado a lápiz las puertas de los almacenes, con una cadena echada por fuera. Debajo, el sello del Ayuntamiento y una firma apresurada que no supisteis leer.'],
      gancho: 'Esa noche llega un sobre con el sello del Club Diógenes: «Ven. Y ven solo. —M. H.»' },

    { t: 'Silencio en el Club Diógenes', l: 'Londres · 9 de diciembre de 1890', victima: 'el funcionario Elias Marsh',
      cast: ['Mycroft', 'Lestrade', 'Watson', 'Moriarty', 'Wiggins'], culpable: 'Mycroft',
      lugares: ['Diógenes', '221B', 'museo', 'muelle', 'Paddington'], armas: ['atizador', 'estoque', 'cadena', 'lupa', 'cuchillo'], lugar: 'Diógenes', arma: 'atizador',
      previo: 'La casera, Hudson, envenenó el té de Finch por su hijo, muerto en el incendio de Wapping. En los planos de Finch quedó dibujada una cadena echada por fuera en las puertas de los almacenes.',
      intro: ['El Club Diógenes es el único lugar de Londres donde hablar está prohibido. Allí te citó Mycroft Holmes. Pero cuando cruzaste el vestíbulo, en la única sala donde se tolera una palabra, ya había un cadáver junto a la chimenea.',
              'Elias Marsh, funcionario del Tesoro, había pasado la tarde buscando entre los archivos del Gobierno un expediente sellado: el informe oficial del incendio de Wapping. Lo encontraron con un golpe seco en la nuca y la séptima llave sobre el pecho. En el hogar, el atizador, todavía caliente.',
              'Nadie entra en el club sin ser visto. Nadie, salvo los socios, y la lista es corta: Mycroft, Lestrade —que acudió en cuanto sonó la alarma—, Watson, que te acompañaba, y dos intrusos con más suerte que permiso. El expediente de Wapping ha desaparecido.'],
      epi: ['Mycroft Holmes, que nunca levantaba la voz, lo dijo muy bajo: —Fui yo. —Siguió sentado, con las manos sobre el vientre, mirando las brasas—. Marsh iba a publicar el expediente. Habría caído un ministro, quizá el Gobierno. Creí estar protegiendo a la Corona.',
            '—¿Quién le avisó de lo que Marsh había encontrado? —preguntaste. Tardó en responder. —Una nota anónima, con un reloj dibujado. Decía que Marsh pensaba vendérselo al Times. —Se frotó los ojos—. Me han usado, aprendiz. A todos. Y a mí el que más: se supone que soy el hombre más inteligente de Inglaterra.',
            'Antes de entregarse te dejó la carátula del expediente que ardió en 1883. El cierre lo firmaba un joven agente de Scotland Yard, de rúbrica apresurada. Solo se distinguía una inicial y la fecha. Siete llaves, siete muertos, y por fin sabías en qué año había empezado todo a pudrirse.'],
      gancho: 'Esa misma noche, mientras trasladaban a Moran a otra prisión, el furgón llegó vacío a su destino. El conductor no aparece. Sobre el asiento, solo un reloj dibujado con carbón.' },

    { t: 'El químico de la calle Gower', l: 'Londres · 16 de diciembre de 1890', victima: 'el doctor Ezra Whitlock',
      cast: ['Moran', 'Watson', 'Wiggins', 'Moriarty', 'Lestrade'], culpable: 'Moran',
      lugares: ['laboratorio', '221B', 'muelle', 'mercado', 'museo'], armas: ['rifle', 'cuchillo', 'cuerda', 'veneno', 'lupa'], lugar: 'laboratorio', arma: 'rifle',
      previo: 'Mycroft mató a Marsh convencido de proteger a la Corona: otra nota con un reloj. Y Moran, el tirador del muelle, se ha escapado durante su traslado.',
      intro: ['El doctor Ezra Whitlock era el mejor químico de Londres y el único que había examinado las siete llaves, que Lestrade le confió como pruebas. «No son de latón corriente —te dijo ayer—. Están limadas para encajar unas con otras. Forman una pieza de relojería, o la cerradura de una.» Prometió traerte sus conclusiones por escrito.',
              'No llegó a escribirlas. Lo han encontrado esta mañana en su laboratorio de la calle Gower, de bruces sobre la mesa de trabajo, con un orificio limpio en la nuca y la ventana entreabierta. Los matraces siguen humeando. Las siete llaves ya no están.',
              'Wiggins asegura haber visto en la calle un hombre alto con un rifle envuelto en una manta. Cinco personas pasaron esa noche por el barrio. Quien disparó sabía exactamente cuál era la ventana.'],
      epi: ['Lo encontraste en el tejado de enfrente, con el rifle sobre las rodillas, esperando a que amaneciera. Moran no te apuntó. —Sabía que vendrías, aprendiz. Quien me sacó del furgón me dijo que vendría alguien, y que me quedase quieto.',
            '—Mataste a Whitlock por orden de... —empezaste. —Del reloj. —Se encogió de hombros—. Pero esta vez vi algo. Un sello de lacre azul en la nota, el lacre oficial. No es la tinta de un criminal. Es la de un despacho con muchos expedientes.',
            'Lestrade llegó en ese momento con dos agentes y su gesto de siempre. Esposó a Moran. Luego te miró y dijo: —Buen trabajo. Mañana quiero ver esos planos de Finch. —Aún no se los habías mencionado a nadie.'],
      gancho: 'A la mañana siguiente, Watson no ha vuelto de su ronda de pacientes. Solo ha dejado una nota: «Voy a San Pablo. Wiggins dice que alguien quiere hablar.»' },

    { t: 'Campanas de domingo', l: 'Londres · 27 de diciembre de 1890', victima: 'el doctor Watson',
      cast: ['Wiggins', 'Moriarty', 'Mycroft', 'Lestrade', 'Irene'], culpable: 'Wiggins',
      lugares: ['catedral', 'muelle', 'mercado', '221B', 'Paddington'], armas: ['cloroformo', 'cuerda', 'cadena', 'cuchillo', 'estoque'], lugar: 'catedral', arma: 'cloroformo',
      previo: 'Moran mató a Whitlock por orden del reloj. Vio un sello de lacre oficial en la nota, y Lestrade pidió los planos de Finch antes de que nadie se los mencionara.',
      intro: ['La catedral de San Pablo estaba llena de domingo: coro, incienso, mil velas. Watson había ido a una cita que Wiggins le consiguió con alguien que decía saber quién era el Relojero. En el crucero, a los pies de una columna, encontraste su maletín de médico, abierto, y a su lado un pañuelo empapado en cloroformo.',
              'Nadie lo vio salir. Nadie lo vio caer. Entre el humo del incienso, un sobre blanco sobre el banco más cercano: «Los planos de Finch por el doctor. Medianoche. Torre del reloj. Si hay policía, no hay doctor.»',
              'Cinco personas estaban en la catedral a esa hora, y todas dicen haber ido a rezar. Alguien, sin embargo, llevaba cloroformo en el bolsillo. El reloj de la nave marca las nueve y diez.'],
      epi: ['Wiggins lloraba sin hacer ruido, sentado entre los bancos vacíos. —Me dijeron que si no lo hacía, ninguno de mis chicos volvería a dormir bajo un techo. No sabía que era el doctor. Yo creía que era otro más de los suyos.',
            'Te describió lo poco que sabía: un hombre alto, de voz tranquila y abrigo oscuro, que le dio las instrucciones en un callejón. —Olía a papel de oficina y a tabaco de pipa. Y cuando sacó el dinero, vi que llevaba el reloj de bolsillo de un agente.',
            'Lestrade se acercó entonces con su expresión cansada de siempre. —¿Algo útil, aprendiz? —Respondiste que no. Era la primera vez que le mentías.'],
      gancho: 'Medianoche. La torre del reloj del Parlamento. Un maletín con los planos de Finch, un amigo atado a una viga y una sola cuestión: quién llevará esta noche el reloj de la ciudad.' },

    { t: 'La torre del reloj', l: 'Londres · 31 de diciembre de 1890', victima: 'el relojero mayor Eliah Brandt',
      cast: ['Lestrade', 'Moriarty', 'Mycroft', 'Irene', 'Wiggins'], culpable: 'Lestrade',
      lugares: ['torre', 'catedral', 'Diógenes', 'laboratorio', 'muelle'], armas: ['revólver', 'estoque', 'cuchillo', 'lupa', 'cadena'], lugar: 'torre', arma: 'revólver',
      previo: 'Wiggins, obligado, secuestró al doctor Watson en San Pablo. Un hombre de abrigo oscuro, olor a pipa y reloj de agente le dio las órdenes. Esta noche, a medianoche, la torre del reloj.',
      intro: ['Es 31 de diciembre. Faltan veinte minutos para que el Parlamento dé las doce campanadas de 1891, y tú subes los trescientos escalones de la torre con un maletín en la mano. Dentro, los planos de Finch. Fuera, la niebla más densa del invierno y un Londres que no sabe lo que se juega esta noche.',
              'En la sala de máquinas, entre engranajes del tamaño de una carreta, Watson está atado a una viga, vivo y furioso. A sus pies yace el relojero mayor Eliah Brandt, con un disparo limpio, y a su lado una caja de acero abierta: la cerradura de siete llaves, vacía.',
              'Cinco personas se han citado en esta torre por razones distintas, y a todas les conviene que alguien no salga de aquí: Moriarty, que dice seguir el rastro de un rival; Mycroft, al que el Gobierno soltó bajo palabra y a quien la culpa ha vuelto prudente; Irene, de nuevo con guantes; Wiggins, con las manos temblando; y Lestrade, con la pipa apagada entre los dientes. El reloj tiene diez minutos. Tú, una sola pregunta.'],
      epi: ['Lestrade guardó el revólver en el abrigo con la calma de quien lleva años esperando este momento. —Tenía que ser alguien de dentro —dijo—. Solo alguien de dentro puede cerrar un expediente sin que le hagan preguntas. Yo cerré el de Wapping.',
            'Contó el incendio de 1883 con una voz sin color. Era un agente de veintidós años; siete hombres le pagaron por encadenar las puertas de los almacenes desde fuera y por declarar después que había sido un accidente. Treinta y un obreros. —Pike guardaba la contabilidad de aquella noche. Quien tuviera ese libro, tenía mi vida. Por eso empezó por él. Y por eso fui matando a los demás, siempre con manos ajenas.',
            'El reloj dio las doce. Desde las torres de las iglesias de Londres empezaron a sonar campanas: 1891. Watson, ya libre, te puso la mano en el hombro y no dijo nada. Sobre una mesa, dentro de la caja de acero, estaba el libro: treinta y un nombres, uno por uno. Los leíste en voz alta, y en la torre, durante un rato, nadie interrumpió.',
            'A la mañana siguiente, junto al sillón de Holmes, un telegrama de Viena: «Excelente trabajo, aprendiz. No rompiste el sillón. Vuelvo el jueves. —H.»'],
      gancho: 'Fin de la temporada 1: «Las siete llaves».' }
  ];

  /* =====================================================================
     PACK 2 · PARQUE PANGEA — «La noche más larga» (una isla, una tormenta, diez horas)
     Historia original, inspirada en el género de aventuras con criaturas prehistóricas. Sin personajes, nombres ni imágenes de terceros.
     Giro final: el fundador, dado por muerto en el capítulo 1, es «la Voz» que manda por el intercomunicador con su propio código.
     ===================================================================== */
  var PANGEA = {
    id: 'pangea', hue: 160, nombre: 'Parque Pangea', ico: '🦖',
    voz: ['Un guarda del parque jura que', 'El registro de tarjetas indica que', 'Un inversor recuerda que', 'La cámara del pasillo muestra que', 'La radio del parque registró que', 'Una azafata del hotel asegura que', 'El sensor de movimiento marca que', 'El diario de guardia anota que'],
    suspects: S_(['Aurelio|el fundador del parque|🎩', 'Elena|la genetista jefa|🧬', 'Ortega|el jefe de seguridad|🛡️', 'Pablo|el ingeniero de sistemas|💻', 'Tomás|el veterinario|🐾', 'Marta|la abogada de los inversores|⚖️', 'Carla|la periodista invitada|📰',
                  'Félix|el paleontólogo escéptico|🦴', 'Lucía|la guía del parque|🥾', 'Roque|el piloto del helicóptero|🧑‍✈️', 'Sofía|la hija del fundador|💼', 'Nuria|la técnica de laboratorio|🔬', 'Bruno|el guarda de las vallas|🔦', 'Hugo|el chef del hotel|👨‍🍳']),
    places: I_(['el|centro de visitantes|🏛️|visitantes', 'el|laboratorio de incubación|🥚|incubadora', 'la|sala de control|🖥️|control', 'el|recinto de los carnívoros|🦖|carnívoros', 'el|aviario de los voladores|🪶|aviario', 'el|helipuerto|🚁',
                'el|sendero de la selva|🌴|selva', 'el|muelle de la isla|⚓|muelle', 'el|invernadero prehistórico|🌿|invernadero', 'el|museo de fósiles|🏺|museo', 'el|comedor del hotel|🍽️|comedor']),
    weapons: I_(['la|llave maestra|🔑|llave', 'el|cable de alta tensión|⚡|cable', 'la|maleta térmica|🧳|maleta', 'el|pisapapeles de ámbar|🟠|ámbar', 'el|colmillo fósil|🦷|colmillo', 'la|bengala de emergencia|🧨|bengala',
                 'la|jeringuilla|💉|jeringuilla', 'el|machete|🔪', 'la|radio del parque|📻|radio', 'el|rifle de dardos|🔫|rifle', 'la|botella de vino|🍷|vino', 'la|cuerda de rapel|🪢|cuerda'])
  };
  var PANGEA_CAP = [
    { t: 'Cena de inauguración', l: 'Isla Pangea · 21:00', victima: 'Aurelio Montalbán',
      cast: ['Ortega', 'Elena', 'Pablo', 'Sofía', 'Carla'], culpable: 'Ortega',
      lugares: ['carnívoros', 'visitantes', 'control', 'incubadora', 'comedor'], armas: ['llave', 'vino', 'bengala', 'machete', 'radio'], lugar: 'carnívoros', arma: 'llave',
      previo: '',
      intro: ['Llegaste a la isla esa tarde como perito de la aseguradora: tu trabajo era firmar que el parque era seguro. Doce inversores, un chef de estrella y un fundador, Aurelio Montalbán, que brindó con la copa en alto: «Esta noche el pasado vuelve a la vida». Fuera, la tormenta llevaba una hora ensayando su entrada.',
              'A las nueve y diez se fue la luz. Cuando los generadores de emergencia la devolvieron, la silla de Aurelio estaba vacía. A las nueve y cuarenta, un guardia encontró su chaqueta rota, un zapato y su reloj junto a la verja del recinto de los carnívoros. La puerta estaba abierta. Algo grande ya no estaba dentro.',
              'Nadie sale de la isla hasta que pare la tormenta. Esa puerta no se abre sola: hizo falta una llave maestra y alguien que supiera usarla. Cinco personas tenían acceso o motivos, y ninguna recuerda con exactitud dónde estaba cuando se apagaron las luces.'],
      epi: ['Marcos Ortega, el jefe de seguridad, no esperó a que lo acusaras. Dejó la llave maestra sobre la mesa del comedor, junto a las copas sin terminar. —Abrí yo —dijo—. Pero nadie me dijo que el fundador estaba dentro.',
            'Una voz le había hablado por el intercomunicador a las nueve y cuarto, con el código personal de Aurelio, el que solo él conocía: «Abre el recinto, Marcos; es una demostración para los inversores». —Era su voz —insistió—. O la de alguien que la imitaba muy bien. Cuando llegué, ya no había nadie. Solo la puerta, y el ruido.',
            'Lo encerraron en el almacén de la cocina. Tú te quedaste con el reloj roto del fundador en la mano. No apareció ningún cuerpo: el veterinario dice que una criatura así no deja nada. Tú no estás tan seguro.'],
      gancho: 'A las diez y media se apagan todas las luces otra vez y esta vez el sistema no vuelve a arrancar: «Perímetro eléctrico caído. Vallas desactivadas.»' },

    { t: 'Perímetro caído', l: 'Isla Pangea · 22:30', victima: '',
      cast: ['Pablo', 'Roque', 'Félix', 'Marta', 'Lucía'], culpable: 'Pablo',
      lugares: ['control', 'helipuerto', 'visitantes', 'selva', 'aviario'], armas: ['cable', 'radio', 'llave', 'machete', 'bengala'], lugar: 'control', arma: 'cable',
      previo: 'Aurelio Montalbán desapareció junto al recinto de los carnívoros. Ortega abrió la puerta con una llave maestra tras escuchar, dice, la voz del propio fundador por el intercomunicador. No hay cuerpo.',
      intro: ['Faltaban cinco minutos para las once cuando las luces se apagaron por segunda vez, y esta vez ni los generadores respondieron. En la pantalla de la sala de control, una línea roja parpadeaba sobre el mapa de la isla: «Valla perimetral: 0 % de tensión».',
              'Sin electricidad, las vallas de los recintos son solo alambre. Lucía, la guía del parque, ha contado los rugidos: al menos dos criaturas rondan ya fuera de sus jaulas. Roque asegura que el helicóptero no puede despegar con este viento. Félix repite sin parar que algo así no ocurre por casualidad.',
              'Alguien cortó el cable principal de alta tensión en la sala de control y manipuló los registros para que pareciera un fallo de la tormenta. Cinco personas tenían tarjeta de acceso a esa sala, y a ninguna le gusta la pregunta de dónde estaba hace una hora.'],
      epi: ['Pablo Salas, el ingeniero de sistemas, se hundió en la silla frente a las pantallas apagadas. —Solo debía ser un test de estrés —murmuró—. Tres minutos sin tensión, para demostrar que el parque era vulnerable. Me ofrecieron más de lo que cobro en diez años.',
            '—¿Quién? —Una voz por el intercomunicador. El código del fundador, otra vez. —Se pasó las manos por el pelo—. Y hay algo más. Revisé los registros antes de cortar. La tarjeta de acceso de Aurelio abrió la puerta del laboratorio a las nueve y cincuenta y dos. Media hora después de que, según todos, muriese.',
            'Un muerto no pasa una tarjeta. O el sistema fallaba, o alguien se la había quitado antes, o alguien en esta isla estaba jugando con ventaja. Fuera, un rugido hizo temblar los cristales.'],
      gancho: 'A medianoche, la tarjeta del fundador vuelve a abrir una puerta: la del laboratorio de incubación. Dentro, la incubadora número siete está vacía.' },

    { t: 'La incubadora siete', l: 'Isla Pangea · 00:00', victima: '',
      cast: ['Carla', 'Elena', 'Tomás', 'Nuria', 'Roque'], culpable: 'Carla',
      lugares: ['incubadora', 'invernadero', 'control', 'museo', 'comedor'], armas: ['maleta', 'jeringuilla', 'llave', 'ámbar', 'vino'], lugar: 'incubadora', arma: 'maleta',
      previo: 'Pablo cortó el cable principal por encargo de una voz con el código de Aurelio. Los registros muestran que la tarjeta del fundador abrió el laboratorio media hora después de su supuesta muerte.',
      intro: ['Elena Vidal, la genetista jefa, abrió la puerta del laboratorio con el rostro blanco. La incubadora número siete, la que guardaba el proyecto más secreto de la isla, estaba abierta y vacía. —Eran los huevos del Proyecto Génesis —dijo—. No se los he enseñado a nadie. Ni siquiera a los inversores.',
              'Génesis no era un animal más: era la apuesta de Aurelio por crear una criatura que no hubiera existido jamás, y valía más que el parque entero. Alguien entró con la tarjeta del fundador, forzó la cámara y se llevó los huevos en un contenedor térmico. Con esta tormenta, no puede haber ido muy lejos.',
              'La periodista que había venido a cubrir la inauguración llevaba la cámara colgada y una sonrisa nerviosa. Tomás, el veterinario, tenía barro hasta las rodillas. Nuria, la técnica, no había dormido. Roque dice que estuvo en el helipuerto. Todos tienen algo que explicar.'],
      epi: ['Carla Ruiz abrió su maleta térmica sobre una mesa del invernadero y mostró lo que quedaba: cuatro huevos intactos, envueltos en gel frío. —Trabajo para una empresa que quiere saber qué esconde Montalbán —admitió—. Me infiltré como periodista. Hoy iba a ser mi noche.',
            '—¿Y la tarjeta? —Me la dejaron en el buzón de mi habitación a las once y media, junto a un plano del laboratorio y una nota: «Sé lo que buscas». —Alzó la vista—. La nota llevaba el sello de tinta ámbar del despacho del fundador.',
            'En la mesa, uno de los huevos se movió. Un golpecito seco desde dentro. Todos se quedaron en silencio. Elena susurró: —Faltaban horas para la eclosión. Ha empezado antes.'],
      gancho: 'A la una de la madrugada un grito rasga el aviario. Un inversor ya no se mueve.' },

    { t: 'El aviario', l: 'Isla Pangea · 01:15', victima: 'el inversor Gustavo Brandt',
      cast: ['Marta', 'Félix', 'Lucía', 'Tomás', 'Bruno'], culpable: 'Marta',
      lugares: ['aviario', 'visitantes', 'museo', 'selva', 'invernadero'], armas: ['ámbar', 'colmillo', 'cuerda', 'machete', 'vino'], lugar: 'aviario', arma: 'ámbar',
      previo: 'Carla robó los huevos del Proyecto Génesis con la tarjeta de un muerto. Alguien en la isla da órdenes por el intercomunicador con el código del fundador, y todos obedecen.',
      intro: ['El aviario es una enorme cúpula de red y acero donde viven las criaturas voladoras. A la una y cuarto de la madrugada, un guía cruzó el pasillo de servicio y encontró al inversor Gustavo Brandt tendido bajo un empalme de cables, con la cabeza abierta y las sombras de las alas rozándole.',
              'A primera vista, un ataque. A segunda, un golpe seco, con algo pesado y redondo, antes de que las criaturas se acercaran. A su lado, un pisapapeles de ámbar con una mosca prehistórica dentro, como los que adornan los despachos del parque.',
              'Brandt era el único inversor que había amenazado con retirar su dinero y avisar a los reguladores. Cinco personas estaban cerca. Cualquiera de ellas pudo hacerlo, y alguien se está esforzando mucho en que parezca un accidente.'],
      epi: ['Marta Quiroga, la abogada de los inversores, sostuvo el pisapapeles un segundo y después lo dejó sobre la mesa con cuidado. —Brandt descubrió que el parque estaba financiado con dinero que no debía existir —dijo—. Y yo había firmado cada papel.',
            '—Una nota me avisó de que iba a hablar con el regulador. Una nota con el código del fundador. —Sonrió con tristeza—. Soy abogada: sé cuándo me tienden una trampa. Y aun así fui a ese aviario con un pisapapeles en el bolso.',
            '—Dime una cosa —preguntaste—. ¿Quién conoce el código personal de Aurelio? —Aurelio —respondió ella—. Y su hija. Nadie más. Y eso es lo que no entiendo.'],
      gancho: 'A las dos y media el veterinario Tomás Rey no responde por radio. Su último mensaje: «Estoy en el sendero de la selva. He encontrado algo que no debería existir.»' },

    { t: 'Rastros en la selva', l: 'Isla Pangea · 02:30', victima: 'el veterinario Tomás Rey',
      cast: ['Félix', 'Elena', 'Lucía', 'Roque', 'Nuria'], culpable: 'Félix',
      lugares: ['selva', 'museo', 'muelle', 'carnívoros', 'helipuerto'], armas: ['colmillo', 'machete', 'jeringuilla', 'cuerda', 'radio'], lugar: 'selva', arma: 'colmillo',
      previo: 'Marta mató al inversor Brandt, que iba a denunciar la financiación del parque. Dice que solo el fundador y su hija conocen el código personal de Aurelio.',
      intro: ['El sendero de la selva estaba cubierto de huellas enormes. Siguiéndolas, a las dos y media, una cuadrilla encontró a Tomás Rey, el veterinario, boca arriba entre helechos, con los ojos abiertos y una herida limpia en el costado. Cerca, una huella de tres dedos, gigantesca. Demasiado gigantesca.',
              'Tomás había encontrado algo, lo dijo por radio: nidos de verdad, con huevos puestos por criaturas que el parque no había creado, sino heredado. «Hay animales que nadie ha fabricado», dijo, y no pudo acabar la frase. Entre sus dedos, un fragmento de colmillo fósil que no pertenecía a ninguna criatura viva.',
              'El paleontólogo Félix Ibarra, que desde la tarde repetía que el parque era un fraude, estaba lívido. Elena temblaba. Lucía había llegado la primera. Roque dijo que no se había movido del helipuerto. Nuria llevaba barro en las botas. Alguien está usando la selva como coartada.'],
      epi: ['Félix Ibarra, el paleontólogo escéptico, lo admitió con un hilo de voz: —Tomás encontró los nidos. Y comprendió que mis datos sobre el ADN eran falsos. Yo había firmado decenas de informes... y los fósiles que certifiqué eran copias.',
            '—Recibí una nota anoche, con el código de Aurelio. Decía que Tomás iba a publicar la verdad y que, si no lo detenía, me arruinaría. —Cerró los ojos—. Pensé que solo iba a asustarlo. Cogí el colmillo para amenazarlo. No sé en qué momento dejé de amenazar.',
            'Elena Vidal, junto a ti, murmuró algo que no iba dirigido a nadie: —Aquella tarde Aurelio me pidió que le prestara a alguien de confianza su código personal. Pensé que se refería a Sofía. —Nadie preguntó a qué se refería. Todos lo habíais oído.'],
      gancho: 'A las tres y media, el único helicóptero de la isla arde en el helipuerto. Alguien ha querido que nadie se vaya.' },

    { t: 'El helipuerto', l: 'Isla Pangea · 03:30', victima: '',
      cast: ['Bruno', 'Roque', 'Elena', 'Sofía', 'Hugo'], culpable: 'Bruno',
      lugares: ['helipuerto', 'control', 'comedor', 'muelle', 'visitantes'], armas: ['bengala', 'cable', 'radio', 'vino', 'llave'], lugar: 'helipuerto', arma: 'bengala',
      previo: 'Félix mató al veterinario Tomás Rey porque este iba a descubrir su fraude con los fósiles. Elena sospecha que el fundador prestó su código personal a alguien de confianza.',
      intro: ['El helicóptero ardió con una llama anaranjada que el aguacero no logró apagar. A las tres y media, el helipuerto era un círculo de fuego bajo la lluvia y el último medio de escapar de la isla se convertía en chatarra. Roque, el piloto, miraba las llamas sin parpadear, con una mano en la boca.',
              'Una bengala de emergencia, de las que se guardan en la caseta del helipuerto, había sido disparada contra el depósito de combustible. Alguien sabía exactamente dónde apuntar, y a qué hora. Aún quedaba un barco en el muelle, pero con este oleaje nadie se atrevería a zarpar antes del alba.',
              'Sofía Montalbán, la hija del fundador, llegó a la carrera con el pelo mojado. Elena. Bruno, el guarda de las vallas. Hugo, el chef, que decía haber salido a fumar. Y Roque. Cinco personas, un incendio, y una radio que sigue susurrando órdenes con una voz que ya conoces.'],
      epi: ['Bruno Cano, el guarda de las vallas, estaba sentado entre dos bidones, con la bengala vacía todavía en la mano. —Mi hija está enferma —dijo sin levantar la vista—. Necesita un tratamiento que no puedo pagar. La voz me dijo que si el helicóptero no salía, el fundador pagaría la cuenta.',
            '—¿Qué voz? —La del intercomunicador. La de Aurelio. —Sacudió la cabeza—. Murió hace seis horas y me habló a las tres. Ya no me lo pregunto, señorita. Ya no me lo pregunto.',
            'Elena Vidal, apoyada en la puerta de la caseta, soltó la frase que se había estado guardando: —Si Aurelio estuviera muerto, nadie estaría pagando sobornos en su nombre. —Y tú tuviste la sensación de que alguien, en algún rincón de la isla, había escuchado esa frase con una sonrisa.'],
      gancho: 'A las cinco de la madrugada, en el invernadero prehistórico, la técnica Nuria Pons aparece con una jeringuilla clavada en el cuello. Susurraba un nombre cuando murió.' },

    { t: 'El invernadero', l: 'Isla Pangea · 05:00', victima: 'la técnica Nuria Pons',
      cast: ['Sofía', 'Elena', 'Roque', 'Lucía', 'Hugo'], culpable: 'Sofía',
      lugares: ['invernadero', 'incubadora', 'comedor', 'museo', 'selva'], armas: ['jeringuilla', 'cuerda', 'ámbar', 'machete', 'vino'], lugar: 'invernadero', arma: 'jeringuilla',
      previo: 'Bruno incendió el helicóptero por dinero que prometía la voz del fundador. Elena sostiene que Aurelio no ha muerto: nadie soborna en nombre de un muerto.',
      intro: ['El invernadero prehistórico es un bosque de helechos gigantes y cícadas, caliente y húmedo como el aliento de algo vivo. A las cinco de la madrugada, entre las hojas, yacía Nuria Pons, la técnica de laboratorio, con una jeringuilla clavada en el cuello y un dedo manchado de tierra señalando hacia la puerta.',
              'Nuria susurró un nombre antes de morir, pero quien la oyó, el chef Hugo, jura no haberlo entendido. «Sonaba a Sofía, o a sofá, o a nada», dice. Lo único claro: Nuria sabía algo sobre Génesis y sobre quién guardaba la tarjeta del fundador.',
              'Ya no quedan cuartos seguros ni nadie en quien confiar. Sofía, Elena, Roque, Lucía y Hugo estuvieron cerca del invernadero a la hora del crimen. Y a lo lejos, por los altavoces, la voz del fundador pide calma a todos, con el tono amable de quien está disfrutando.'],
      epi: ['Sofía Montalbán no lloró. Se limpió las manos en la bata y te miró a los ojos. —Mi padre me pidió que cuidara de su tarjeta y de su código, si algo salía mal. Que no dejara que nadie los viera. Nuria me vio sacarla del bolsillo. Habría hablado.',
            '—Tu padre te dijo... —Solo que cuidara de lo suyo. —Se apoyó en una cícada—. Creí que había muerto, y que proteger lo que dejó era lo último que podía hacer por él. No te pido que me creas. Pero yo no sabía que habría más muertos.',
            '—Y el código —preguntaste—, ¿quién más lo ha usado? —Sofía alzó la cabeza hacia los altavoces del techo, donde seguía sonando aquella voz serena. —Esa es la pregunta —dijo—. Ahora mismo, no sé quién habla.'],
      gancho: 'A las seis y cuarto, alguien corta las amarras del último barco que quedaba en el muelle. Se acabaron las salidas.' },

    { t: 'Amarras', l: 'Isla Pangea · 06:15', victima: '',
      cast: ['Roque', 'Elena', 'Lucía', 'Hugo', 'Pablo'], culpable: 'Roque',
      lugares: ['muelle', 'helipuerto', 'selva', 'control', 'comedor'], armas: ['machete', 'bengala', 'cuerda', 'cable', 'radio'], lugar: 'muelle', arma: 'machete',
      previo: 'Sofía mató a Nuria Pons para que no hablara de la tarjeta del fundador. Dice que su padre le pidió custodiarla y que, ahora, ya no sabe quién habla por los altavoces.',
      intro: ['A las seis y cuarto, justo cuando el cielo empezaba a clarear, un golpe seco resonó en el muelle. Las amarras del último barco de la isla habían sido cortadas a machetazos; la lancha derivaba ya a cien metros, arrastrada por la marea. Si alguien pensaba huir de la isla, esa posibilidad acababa de esfumarse.',
              'Solo un puñado de personas sabía dónde estaba el machete que colgaba de la caseta del muelle. Un rugido profundo, desde la selva, hizo callar el aire. Algo grande se acercaba al agua. Y el único refugio posible era el propio muelle.',
              'Roque, Elena, Lucía, Hugo y Pablo —a quien dejaron libre cuando prometió ayudarte— están bajo sospecha. En la caseta quedan una radio sin batería y un papel arrugado: «El amanecer pertenece a quien llegue primero al helipuerto». Alguien quiere que corráis. Alguien quiere ver cómo corréis.'],
      epi: ['Roque Alcázar se quitó la gorra y la dejó en el suelo. —Fui yo —dijo—. Me pagaron por mantener a todos aquí hasta el amanecer. Pensé que era una broma de ricos. Con todo lo que ha pasado... ya no sé qué pensar.',
            '—¿Por qué hasta el amanecer? —Porque a las siete llega un yate con gente que no está invitada a la inauguración. Los compradores. —Roque hizo una mueca—. La voz me lo dijo así: «A las siete se abre la subasta». Fue lo último que me dijo.',
            'Elena dejó caer la linterna. —La subasta —repitió—. Génesis. Quiere vender Génesis. —Y por primera vez dijiste en voz alta lo que llevabas toda la noche pensando: —No quiere vender el parque. Quiere vender los huevos, y que nadie pueda decir quién se los llevó.'],
      gancho: 'A las seis y media, en el laboratorio, Elena Vidal deja de contestar. Alguien ha vuelto a usar la tarjeta del fundador.' },

    { t: 'La caja fuerte', l: 'Isla Pangea · 06:30', victima: 'la genetista Elena Vidal',
      cast: ['Ortega', 'Pablo', 'Carla', 'Lucía', 'Hugo'], culpable: 'Ortega',
      lugares: ['incubadora', 'control', 'comedor', 'museo', 'visitantes'], armas: ['rifle', 'cuerda', 'vino', 'llave', 'radio'], lugar: 'incubadora', arma: 'rifle',
      previo: 'Roque cortó las amarras del barco por dinero de la voz: a las siete llegan compradores a una subasta. Quien manda quiere vender Génesis sin que nadie sepa quién se llevó los huevos.',
      intro: ['Elena Vidal llevaba toda la noche diciendo que sabía quién era la Voz. Se lo dijo a las seis y veinte, en voz baja, solo a ti. Diez minutos después no contestaba a la radio. La encontraron en el laboratorio de incubación, junto a la caja fuerte abierta, con un dardo de rifle clavado en el hombro y los ojos abiertos.',
              'El dardo no era tranquilizante: era una carga de toxina de las que el parque guarda para emergencias. Alguien con acceso al armero y a la tarjeta del fundador disparó desde la puerta y se llevó lo único que Elena guardaba allí: una carpeta con el nombre de quien firmaba la orden de crear a Génesis.',
              'La tormenta amaina; los compradores llegan en media hora. Ortega, que se escapó del almacén cuando se fue la luz; Pablo; Carla; Lucía; Hugo: cinco personas, un laboratorio y una carpeta desaparecida. Quien la tenga conoce al hombre de la voz.'],
      epi: ['Ortega no se resistió. Dejó el rifle de dardos en el suelo y se frotó la cara con las dos manos. —La voz me soltó del almacén —dijo—. Me prometió una isla entera si hacía callar a Elena. Pensé que eran palabras. Hoy me he dado cuenta de que a esa voz no le gusta dejar cabos sueltos.',
            '—¿Y la carpeta? —Aquí. —Te la tendió—. Pero no la abras todavía. La voz me dijo que quien la abriera... —Calló. Tú la abriste. Dentro, una sola página: el contrato de la subasta, con una firma de tinta ámbar que conocías de cada cartel del parque. La firma de Aurelio Montalbán. Fechada hacía una hora.',
            'Una hora, pensaste. Un muerto no firma contratos. Fuera, el cielo empezaba a clarear, y por el altavoz que colgaba del techo del laboratorio, alguien carraspeó con suavidad antes de hablar: «Buenos días a todos. Gracias por haber llegado hasta aquí.»'],
      gancho: 'Seis y cuarenta y cinco. La voz del altavoz da cinco minutos: o le entregáis lo que falta, o abre todas las puertas de la isla. Sabes desde dónde habla.' },

    { t: 'Amanecer en Pangea', l: 'Isla Pangea · 06:45', victima: '',
      cast: ['Aurelio', 'Sofía', 'Pablo', 'Carla', 'Roque'], culpable: 'Aurelio',
      lugares: ['control', 'helipuerto', 'visitantes', 'incubadora', 'carnívoros'], armas: ['radio', 'llave', 'cable', 'bengala', 'rifle'], lugar: 'control', arma: 'radio',
      previo: 'Ortega mató a Elena Vidal para que no revelara quién firmaba la orden de crear a Génesis. En la carpeta, una firma de Aurelio Montalbán, fechada una hora antes: un muerto que firma contratos.',
      intro: ['Subes los doscientos escalones de la sala de control con el corazón en la garganta. La tormenta se ha ido y deja un amanecer rosa sobre la selva; abajo, en la bahía, un yate blanco se acerca despacio. Por los altavoces de toda la isla, la voz del fundador cuenta hacia atrás.',
              'En el cuadro de mandos, cada recinto tiene un interruptor. Los de los carnívoros, los voladores y los grandes herbívoros están en rojo, y dos dedos de alguien se acercan a ellos. Frente a la pantalla hay una figura que conoces por la forma de los hombros y que debería estar muerta desde las nueve de la noche.',
              'Sofía, Pablo, Carla, Roque y un quinto nombre que ya nadie se atreve a pronunciar convergen en esta sala. Una sola persona sostiene la radio. Una sola persona lo ha organizado todo. Tienes cinco minutos antes de que el sol suba del todo y los compradores toquen el muelle.'],
      epi: ['Aurelio Montalbán dejó el micrófono con una sonrisa cansada. —Qué lástima. Casi funciona. —Se giró hacia ti—. Eres buena, ¿lo sabes? La aseguradora no pagó por esto: envió a alguien que sabía mirar.',
            'Lo contó todo con la serenidad de quien se ha ensayado el discurso: la deuda de ocho cifras, el parque que no iba a rendir, Génesis como única salida, la necesidad de una noche de caos para desaparecer sin dejar rastro y de un puñado de personas desesperadas que obedeciesen a una voz. —Todo el mundo tiene una llave, un precio y un miedo —dijo—. Solo hay que saber cuál es cuál.',
            'Cuando el yate llegó al muelle, los compradores no encontraron a nadie dispuesto a venderles nada. La policía de la costa llegó dos horas después, con el sol ya alto. Sobre el mapa de la sala de control volvió a encenderse una línea de luz verde: el perímetro, restablecido. Allá lejos, sobre la selva, un animal enorme levantó la cabeza y miró hacia el amanecer.'],
      gancho: 'Fin de la temporada 1: «La noche más larga».' }
  ];

  // Cada capítulo cerrado entrega una prueba coleccionable que va llenando el tablón de la saga.
  var BAKER_PRU = [
    ['🗝️', 'La llave de latón', 'De la mano del notario Pike. Dentada para dar cuerda a un reloj. Alguien quería que la encontraras.'],
    ['🎻', 'La segunda llave', 'Atornillada bajo la tapa del violín de Dunne. Idéntica a la del muelle.'],
    ['📜', 'La lista de siete nombres', 'Se la enviaron a Henry sin firma, con un reloj dibujado en la esquina.'],
    ['🎭', 'Máscara de arlequín', 'Cayó en la terraza de Kensington. «Quien lleva la cuenta no siempre es quien parece.»'],
    ['✉️', 'Carta de letra pulcra', 'Las órdenes a Irene Adler: letra regular, sin una tachadura, acostumbrada a que obedezcan.'],
    ['📐', 'Los planos de Finch', 'En las puertas de los almacenes, a lápiz: una cadena echada por fuera.'],
    ['🗂️', 'La carátula de 1883', 'El cierre del expediente de Wapping lo firmó un joven agente. Rúbrica apresurada.'],
    ['🔵', 'Lacre azul', 'El sello de la nota a Moran. No es tinta de criminal: es de despacho oficial.'],
    ['⌚', 'Reloj de agente', 'Lo llevaba quien dio órdenes a Wiggins. Olía a papel de oficina y a tabaco de pipa.'],
    ['📖', 'El libro de los 31 nombres', 'Uno por cada obrero del turno de noche. Lo leíste en voz alta bajo las campanadas de 1891.']
  ];
  var PANGEA_PRU = [
    ['⌚', 'El reloj roto de Aurelio', 'Junto a la verja de los carnívoros. Marca las 21:10. No hay cuerpo.'],
    ['💳', 'La tarjeta del fundador', 'Abrió el laboratorio a las 21:52, media hora después de su «muerte».'],
    ['🟠', 'Nota con tinta ámbar', 'El sello del despacho del fundador en la nota que recibió Carla: «Sé lo que buscas».'],
    ['🔮', 'Pisapapeles de ámbar', 'Con una mosca prehistórica dentro. Un arma que parecía decoración.'],
    ['🦷', 'Fragmento de colmillo', 'No pertenece a ninguna criatura viva. Los fósiles certificados eran copias.'],
    ['🧨', 'Bengala vacía', 'Disparada contra el depósito del helicóptero. La Voz prometió pagarlo todo.'],
    ['🔐', 'Tarjeta y código custodiados', 'Aurelio le pidió a su hija que los guardara «si algo salía mal».'],
    ['⚓', 'Amarras cortadas', 'A las siete llega un yate de compradores: subasta de los huevos de Génesis.'],
    ['📄', 'El contrato de la subasta', 'Firma de tinta ámbar de Aurelio, fechada una hora antes. Un muerto no firma.'],
    ['📻', 'La radio de la Voz', 'La que usaba el fundador para dar órdenes a toda la isla con su propio código.']
  ];
  BAKER_PRU.forEach(function (x, i) { BAKER_CAP[i].prueba = { i: x[0], t: x[1], d: x[2] }; });
  PANGEA_PRU.forEach(function (x, i) { PANGEA_CAP[i].prueba = { i: x[0], t: x[1], d: x[2] }; });

  var PACKS = [
    { id: 'baker', theme: BAKER, cap: BAKER_CAP, count: BAKER_CAP.length, free: 3, hue: BAKER.hue, ico: BAKER.ico, nombre: BAKER.nombre,
      lema: 'Las siete llaves · una saga en diez capítulos',
      desc: 'Londres, 1890. Alguien mata dejando una llave de reloj en la mano de cada víctima, y tú te quedas solo con el sillón de Holmes. Diez capítulos, una sola conspiración, y todos los sospechosos con algo que esconder.',
      nota: 'Inspirado en el universo literario de Arthur Conan Doyle (obras y personajes de dominio público).' },
    { id: 'pangea', theme: PANGEA, cap: PANGEA_CAP, count: PANGEA_CAP.length, free: 3, hue: PANGEA.hue, ico: PANGEA.ico, nombre: PANGEA.nombre,
      lema: 'La noche más larga · diez capítulos, diez horas',
      desc: 'Una isla remota, una tormenta, un parque de criaturas que nunca debieron volver y un fundador desaparecido. Cada capítulo es una hora de la noche, y cada hora trae un culpable distinto.',
      nota: 'Historia original inspirada en el género de aventuras con criaturas prehistóricas. No usa personajes, nombres ni imágenes de terceros.' }
  ];
  return { PACKS: PACKS };
});
