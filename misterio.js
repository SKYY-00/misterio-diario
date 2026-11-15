/* Misterio diario v7 - generador de casos con 3 dificultades de estructura fija.
   Fácil:   10 pistas, 5 sospechosos, cada uno en exactamente 2 pistas, todas directas (sin cruces).
   Normal:  10 pistas, 5 sospechosos, con cruces imprescindibles y pocas pistas directas.
   Difícil: 8 pistas, 5 sospechosos, todas imprescindibles, con cruces avanzados. (Con 6 sospechosos y 8 pistas solo
            existe 1 caso válido de cada ~800 intentos y sin pistas directas: demasiado enrevesado; 6 sospechosos funciona desde 9 pistas.)
   Garantías (verificadas por tests):
   1) Solución única.
   2) Se resuelve SOLO por deducción paso a paso (sin adivinar ni probar hipótesis).
   3) Todos los sospechosos tienen pistas propias.
   4) Ninguna pista, por sí sola, deja claro quién es el culpable; con las pistas en orden, el culpable no queda claro hasta el final.
   5) En las pistas "A o B" el orden es aleatorio (la primera opción no es "la buena").
   La lógica la genera el código; la historia es plantilla (más adelante, IA). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Misterio = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var N = 5;   // tamaño por defecto (cada dificultad define el suyo en DIFFS[x].n)


  // ---------- Aleatoriedad con semilla (misma fecha => mismo caso para todos) ----------
  function xmur3(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ---------- Temas (v8) ----------
  // Cada escenario tiene un banco de 8 sospechosos, 8 lugares y 8 objetos, varias situaciones (título, lugar e historia) y testigos.
  // Cada día se elige: la situación (rota sin repetir hasta agotarlas), 6 de 8 de cada banco (reparto del día) y, por dificultad, 5 de esos 6.
  // Formato compacto: sospechoso 'Nombre|descripción|emoji' · lugar/objeto 'artículo|nombre|emoji|etiqueta corta (opcional)'
  function S_(a) { return a.map(function (x) { var p = x.split('|'); return { n: p[0], d: p[1], e: p[2] }; }); }
  function I_(a) { return a.map(function (x) { var p = x.split('|'); return { a: p[0], n: p[1], e: p[2], s: p[3] || p[1] }; }); }
  function SIT_(a) { return a.map(function (x) { var p = x.split('|'); return { t: p[0], l: p[1], i: p[2] }; }); }
  var THEMES = [
    { id: 'mansion', hue: 32,
      situaciones: SIT_([
        'Cena de gala en la mansión Aldana|Mansión Aldana|Durante la cena de gala se fue la luz tres minutos. Cuando volvió, el anfitrión, don Ricardo Aldana, yacía sin vida. Nadie salió de la casa.',
        'Tormenta en la finca Montealegre|Finca Montealegre|Una tormenta cortó la carretera y el teléfono de la finca. A la mañana siguiente, doña Teresa Montealegre apareció sin vida en su cama. Las llaves de la verja siguen en el cajón: el culpable duerme bajo este techo.',
        'Cumpleaños en la mansión Ibarra|Mansión Ibarra|Se apagaron las velas de la tarta y, con ellas, la luz del salón. Cuando volvió, el cumpleañero, Julián Ibarra, yacía sin vida. Los invitados no pueden salir hasta que llegue la policía.',
        'Testamento en la casona Villaverde|Casona Villaverde|El notario aún no había abierto el sobre cuando el patriarca, Andrés Villaverde, se desplomó sin vida. Todos tenían algo que ganar con su testamento, y nadie ha abandonado la casona.']),
      voz: ['Un invitado jura que', 'El jardinero asegura que', 'En el libro de visitas consta que', 'Una doncella recuerda que', 'El inspector ha comprobado que', 'El chófer recuerda que', 'Una criada asegura que', 'Según la cámara del vestíbulo,'],
      suspects: S_(['Lucía|la chef|👩‍🍳', 'Marcos|el mayordomo|🤵', 'Elena|la heredera|👩‍🦰', 'Hugo|el socio|🧔', 'Carmen|la periodista|🕵️‍♀️', 'Iván|el sobrino|🧑‍🎓', 'Gloria|la tía abuela|👵', 'Rodrigo|el médico de la familia|🩺']),
      places: I_(['la|biblioteca|📚', 'la|cocina|🍳', 'la|bodega|🍷', 'el|invernadero|🌿', 'la|sala de música|🎹|música', 'la|terraza|🌙', 'el|salón de billar|🎱|billar', 'la|capilla|⛪']),
      weapons: I_(['el|candelabro|🕯️', 'la|cuerda|🪢', 'el|cuchillo de cocina|🔪|cuchillo', 'el|veneno|🧪', 'el|pisapapeles|🗿', 'el|atizador de chimenea|🔥|atizador', 'el|abrecartas|✉️', 'el|jarrón chino|🏺|jarrón']) },
    { id: 'teatro', hue: 350,
      situaciones: SIT_([
        'Estreno en el Teatro Cervantes|Teatro Cervantes|Era la noche de estreno. Al caer el telón, el director, Álvaro Quiroga, apareció sin vida entre bambalinas. La puerta del teatro estaba cerrada por dentro.',
        'Ensayo general en el Gran Teatro Lírico|Gran Teatro Lírico|Faltaban tres horas para el estreno cuando el empresario Enrique Salas fue hallado sin vida en el patio de butacas. Las puertas se cerraron por dentro: el culpable sigue en el teatro.',
        'Gala benéfica en el Teatro Calderón|Teatro Calderón|En plena gala benéfica, la mecenas Paloma Roldán desapareció tras el segundo acto. La encontraron sin vida entre los decorados. Nadie ha salido del edificio.',
        'Función de despedida en el Teatro Alcázar|Teatro Alcázar|La función de despedida de la gran diva terminó con un silencio helado: el director musical, Samuel Ortuño, no volvió a salir al foso. Fue encontrado sin vida tras el último aplauso.']),
      voz: ['El acomodador jura que', 'Consta en la hoja de ronda que', 'Una bailarina recuerda que', 'El portero asegura que', 'Según el parte de seguridad,', 'Un músico del foso recuerda que', 'La taquillera asegura que', 'El regidor jura que'],
      suspects: S_(['Irene|la actriz principal|🎭', 'Tomás|el apuntador|📜', 'Sofía|la figurinista|🧵', 'Daniel|el técnico de luces|💡', 'Beatriz|la productora|💼', 'Leo|el crítico|✍️', 'Mateo|el tenor|🎤', 'Pilar|la bailarina|🩰']),
      places: I_(['el|camerino|💄', 'el|foso de la orquesta|🎻|foso', 'la|sastrería|🧥', 'la|cabina de luces|🎛️|cabina', 'el|despacho de dirección|🗂️|despacho', 'el|palco|🎟️', 'el|escenario|🎬', 'la|sala de ensayos|🪞|ensayos']),
      weapons: I_(['la|espada de utilería|🗡️|espada', 'el|sandbag|🎒', 'la|tijera de sastre|✂️|tijera', 'el|cable eléctrico|🔌|cable', 'la|copa envenenada|🍸|copa', 'el|candelabro de atrezo|🕯️|candelabro', 'el|bastón de escena|🦯|bastón', 'el|trofeo del festival|🏆|trofeo']) },
    { id: 'hotel', hue: 192,
      situaciones: SIT_([
        'Congreso en el Gran Hotel Marítimo|Gran Hotel Marítimo|En plena tormenta, el conferenciante estrella del congreso, el doctor Ignacio Valdés, fue hallado sin vida. La carretera estaba cortada: el culpable sigue en el hotel.',
        'Boda en el Hotel Costa Dorada|Hotel Costa Dorada|En plena celebración de la boda, el padrino, Rafael Linares, fue hallado sin vida en el pasillo de las suites. La tormenta ha cortado la carretera costera: el culpable sigue en el hotel.',
        'Convención en el Hotel Alpino|Hotel Alpino|La nieve bloqueó el único acceso al hotel justo cuando el director de la convención, Emilio Roca, dejó de contestar al teléfono. Lo encontraron sin vida en su habitación.',
        'Temporada baja en el Hotel Belvedere|Hotel Belvedere|El hotel estaba casi vacío esa noche de temporada baja. Por eso fue más extraño que el crítico gastronómico, Álvaro Campos, apareciera sin vida. Solo quedan unos pocos huéspedes y todos tienen algo que ocultar.']),
      voz: ['El chófer del hotel jura que', 'Las cámaras de seguridad muestran que', 'Un huésped recuerda que', 'El camarero de guardia asegura que', 'Consta en el registro de llaves que', 'El recepcionista de noche anota que', 'Una limpiadora asegura que', 'El servicio de habitaciones registra que'],
      suspects: S_(['Paula|la recepcionista|🛎️', 'Víctor|el botones|🧳', 'Nuria|la organizadora|📋', 'Rubén|el rival académico|🎓', 'Alicia|la huésped de la 12|🔑', 'Marina|la camarera de pisos|🧹', 'Fermín|el conserje nocturno|🌙', 'Teresa|la directora del hotel|🗝️']),
      places: I_(['el|vestíbulo|🛋️', 'la|azotea|🌧️', 'la|sala de congresos|🎤|congresos', 'el|sótano de las calderas|🔥|sótano', 'el|spa|🧖', 'la|cocina|🍳', 'el|ascensor|🛗', 'la|piscina cubierta|🏊|piscina']),
      weapons: I_(['el|trofeo de cristal|🏆|trofeo', 'la|cuerda del ascensor|🪢|cuerda', 'la|llave inglesa|🔧|llave', 'el|somnífero|💊', 'el|puntero láser|🔦|puntero', 'la|bandeja de plata|🍽️|bandeja', 'el|extintor|🧯', 'el|paraguas|☂️']) },
    { id: 'museo', hue: 268,
      situaciones: SIT_([
        'Gala en el Museo Arqueológico|Museo Arqueológico|Durante la inauguración del ala nueva, el mecenas Gonzalo Ferrer apareció sin vida junto a una vitrina rota. Las alarmas saltaron y las puertas se sellaron: el culpable sigue dentro.',
        'Noche de los museos|Museo Arqueológico|Durante la Noche de los Museos, el conservador jefe, Fernando Sol, apareció sin vida entre las vitrinas. El sistema de seguridad selló todas las salidas.',
        'Subasta en la Fundación Duarte|Fundación Duarte|En mitad de la subasta, la tasadora, Inés Duarte, dejó caer el martillo y no volvió a levantarlo. Fue hallada sin vida tras la cortina del estrado. Las puertas están selladas.',
        'Reapertura tras la reforma|Museo Arqueológico|Tras años cerrado, el museo reabrió sus puertas. El arquitecto de la reforma, Luis Ferrán, no llegó a ver el corte de la cinta: lo hallaron sin vida. La alarma se activó y nadie puede salir.']),
      voz: ['Un electricista asegura que', 'La cámara de la sala 3 muestra que', 'Una guía recuerda que', 'El sensor de movimiento indica que', 'Un visitante jura que', 'El vigilante nocturno anotó que', 'Una becaria recuerda que', 'El registro de la alarma indica que'],
      suspects: S_(['Clara|la conservadora|🏺', 'Jaime|el guardia de seguridad|🔦', 'Marta|la restauradora|🖌️', 'Óscar|el coleccionista|🧐', 'Raquel|la comisaria invitada|🎟️', 'Lola|la becaria|📚', 'Andrés|el director|🎩', 'Berta|la guía|🗺️']),
      places: I_(['la|sala egipcia|🪲|egipcia', 'el|taller de restauración|🧰|taller', 'el|almacén subterráneo|📦|almacén', 'la|sala de armaduras|🛡️|armaduras', 'el|patio de esculturas|⛲|patio', 'la|sala de tapices|🧶|tapices', 'la|sala de joyas|💎|joyas', 'el|planetario|🔭']),
      weapons: I_(['la|daga ceremonial|🗡️|daga', 'el|busto de bronce|🗿|busto', 'el|disolvente|🧴', 'el|cordón de seguridad|🎗️|cordón', 'la|lanza de exhibición|🔱|lanza', 'el|cincel|⛏️', 'la|maza medieval|🔨|maza', 'la|estatuilla de jade|🐉|estatuilla']) },
    { id: 'tren', hue: 140,
      situaciones: SIT_([
        'Medianoche en el Expreso Cantábrico|Expreso Cantábrico|El Expreso Cantábrico atravesaba la noche cuando el senador Aurelio Navas fue hallado sin vida en su compartimento. El tren no para hasta el amanecer: el culpable viaja con vosotros.',
        'Nevada en el Expreso del Norte|Expreso del Norte|Una avalancha detuvo el Expreso del Norte entre dos túneles. Cuando el revisor pasó lista, faltaba el banquero, Arturo Beltrán: lo hallaron sin vida en su compartimento. Nadie puede bajarse del tren.',
        'Viaje inaugural del Tren de la Costa|Tren de la Costa|En el viaje inaugural del Tren de la Costa, el ingeniero que lo diseñó, Esteban Marín, no se presentó al brindis. Lo encontraron sin vida con el tren a toda máquina: el culpable viaja con vosotros.',
        'Madrugada en el Expreso de Lisboa|Expreso de Lisboa|El Expreso de Lisboa cruzaba la frontera de madrugada cuando la condesa Amelia de Rojas fue hallada sin vida. Las puertas siguen cerradas y el próximo apeadero está a dos horas.']),
      voz: ['El jefe de estación comprobó que', 'Un viajero del vagón vecino recuerda que', 'El cocinero jura que', 'Consta en el diario de a bordo que', 'El mozo de cargas asegura que', 'El interventor anotó que', 'Una azafata de coche cama recuerda que', 'El telegrafista de a bordo registró que'],
      suspects: S_(['Inés|la revisora|🎫', 'Gael|el maquinista|🚂', 'Valeria|la viajera de primera|👒', 'Leandro|el pianista del bar|🎹', 'Mónica|la secretaria del senador|📒', 'Bruno|el fogonero|🔥', 'Amparo|la camarera del bar|🥂', 'Ezequiel|el fotógrafo|📷']),
      places: I_(['el|vagón restaurante|🍽️|restaurante', 'la|cabina de la locomotora|⚙️|locomotora', 'el|vagón de equipajes|🧳|equipajes', 'el|coche cama|🛏️|cama', 'la|plataforma trasera|🌬️|plataforma', 'el|vagón mirador|🔭|mirador', 'el|vagón de correos|✉️|correos', 'la|cocina del tren|🍳|cocina']),
      weapons: I_(['la|botella de champán|🍾|champán', 'la|correa de equipaje|🧷|correa', 'el|extintor|🧯', 'el|bastón de pasajero|🦯|bastón', 'el|puro envenenado|🚬|puro', 'la|pala de carbón|⚒️|pala', 'la|linterna de señales|🔦|linterna', 'el|martillo de emergencia|🔨|martillo']) },
    { id: 'rodaje', hue: 310,
      situaciones: SIT_([
        'Rodaje en los Estudios Solana|Estudios Solana|En pleno rodaje de una película de época, el productor Ernesto Vidal apareció sin vida en el plató. Un fallo del sistema bloqueó las puertas del estudio: nadie pudo entrar ni salir.',
        'Último día de rodaje|Estudios Solana|En la última jornada de rodaje, el director de fotografía, Gonzalo Páez, no volvió tras el descanso. Lo hallaron sin vida mientras el equipo recogía. Las puertas del estudio están bloqueadas.',
        'Rodaje nocturno en los Estudios Lumière|Estudios Lumière|Era la escena final de una película de terror cuando el actor secundario, Leonardo Aranda, no se levantó tras la toma. No era ficción. Las puertas del estudio se bloquearon.',
        'Casting en los Estudios Meridiano|Estudios Meridiano|En plena jornada de casting, el productor Joaquín Menéndez fue hallado sin vida en su despacho. Cuarenta aspirantes, algunos sospechosos y ni una sola salida.']),
      voz: ['El tramoyista jura que', 'La hoja de rodaje indica que', 'Un extra recuerda que', 'La cámara de seguridad del plató muestra que', 'El técnico de sonido asegura que', 'El ayudante de dirección anota que', 'Una figurante recuerda que', 'El registro del catering indica que'],
      suspects: S_(['Carla|la directora|🎤', 'Pablo|el protagonista|🌟', 'Alba|la script|📝', 'Rafa|el especialista|🤸', 'Noelia|la maquilladora|💋', 'Sergio|el productor ejecutivo|🎩', 'Dani|el sonidista|🎧', 'Elisa|la guionista|✒️']),
      places: I_(['el|plató principal|🎥|plató', 'la|caravana de maquillaje|💅|caravana', 'la|sala de montaje|🎞️|montaje', 'el|almacén de atrezo|🧰|atrezo', 'el|catering|🥪', 'la|sala de proyección|📽️|proyección', 'el|camerino de la estrella|⭐|camerino', 'el|decorado de la calle|🏘️|decorado']),
      weapons: I_(['la|claqueta|🎬', 'el|foco pesado|💡|foco', 'la|espada de atrezo|⚔️|espada', 'el|trípode|📐', 'el|termo envenenado|☕|termo', 'el|micrófono jirafa|🎙️|micrófono', 'la|pistola de atrezo|🔫|pistola', 'el|cable de cámara|🔌|cable']) },
    { id: 'crucero', hue: 232,
      situaciones: SIT_([
        'Travesía en el crucero Estrella del Sur|Crucero Estrella del Sur|A mitad de la travesía, el armador del crucero, Ramón Valcárcel, no apareció en la cena del capitán. Lo hallaron sin vida. Estamos a tres días del próximo puerto: el culpable sigue a bordo.',
        'Noche de gala en el Gran Atlántico|Gran Atlántico|La noche de gala del Gran Atlántico terminó con un grito: la condesa Beatriz Alcalá yacía sin vida junto a la barandilla. El barco navega en plena niebla y nadie puede abandonarlo.',
        'Tormenta en el mar de Alborán|Crucero Alborán|Una tormenta zarandeó el barco toda la noche. Al amanecer, el jefe de seguridad, Mauro Ibáñez, no respondía por radio. Lo encontraron sin vida. Ningún bote ha sido tocado: el culpable sigue a bordo.',
        'Fin de travesía en el Mediterráneo Dorado|Mediterráneo Dorado|El último día de la travesía, el subastador de arte del barco, Leopoldo Quirós, no se presentó a la puja final. Lo hallaron sin vida. Atracaremos mañana y la policía subirá a bordo con prisa.']),
      voz: ['El camarero de cubierta jura que', 'El diario de a bordo anota que', 'Un pasajero de primera recuerda que', 'El vigía de la noche asegura que', 'La cámara del pasillo muestra que', 'El contramaestre comprobó que', 'Una azafata recuerda que', 'El registro de tarjetas de camarote indica que'],
      suspects: S_(['Adela|la capitana|🎖️', 'Néstor|el sobrecargo|🧾', 'Olga|la cantante|🎶', 'Fabián|el crupier|🃏', 'Celia|la médica de a bordo|⚕️', 'Gaspar|el magnate|💰', 'Lidia|la coreógrafa|🩰', 'Tobías|el marinero|🧢']),
      places: I_(['la|cubierta de proa|🌊|proa', 'la|sala de máquinas|⚙️|máquinas', 'el|casino de a bordo|🎰|casino', 'el|camarote presidencial|🛏️|camarote', 'la|piscina de popa|🏊|piscina', 'el|puente de mando|🧭|puente', 'la|bodega de carga|📦|bodega', 'el|salón de baile|💃|salón']),
      weapons: I_(['el|ancla de adorno|⚓|ancla', 'el|remo de bote|🛶|remo', 'la|botella de ron|🥃|ron', 'el|catalejo|🔭', 'la|cuerda de amarre|🪢|cuerda', 'el|cóctel envenenado|🍹|cóctel', 'la|llave de máquinas|🔧|llave', 'el|tridente decorativo|🔱|tridente']) },
    { id: 'refugio', hue: 200,
      situaciones: SIT_([
        'Ventisca en el refugio Peña Blanca|Refugio Peña Blanca|Una ventisca dejó incomunicado el refugio Peña Blanca. Al amanecer, el viejo guardián, don Anselmo Lanuza, fue hallado sin vida. No hay forma de bajar hasta que pare la nieve: el culpable duerme aquí.',
        'Travesía invernal en el refugio Ibón Helado|Refugio Ibón Helado|Una travesía, un guarda y una tormenta. Cuando el organizador de la excursión, Ismael Puyal, no bajó a cenar, lo encontraron sin vida en su litera. El camino está cortado por la nieve.',
        'Alud en el refugio Cumbre Azul|Refugio Cumbre Azul|Un alud bloqueó el único sendero. En el refugio Cumbre Azul solo quedan los que subieron ayer, y uno de ellos ya no puede contarlo: el alpinista Teodoro Mena apareció sin vida.',
        'Fin de año en el refugio La Fuenfría|Refugio La Fuenfría|Se celebraba la última noche del año en el refugio cuando su mecenas, Lorenzo Gil, brindó por última vez. Apareció sin vida antes de las campanadas. Nadie puede bajar con esta nieve.']),
      voz: ['El guarda jura que', 'El libro de ascensiones anota que', 'Un excursionista recuerda que', 'La radio del refugio registró que', 'Una cocinera asegura que', 'El parte meteorológico indica que', 'Las huellas en la nieve muestran que', 'Un montañero de la litera de al lado jura que'],
      suspects: S_(['Álex|el guarda del refugio|🧤', 'Marga|la cocinera|🍲', 'Íñigo|el guía de montaña|🧗', 'Noa|la fotógrafa|📷', 'Ramón|el alpinista veterano|🏔️', 'Salma|la médica excursionista|🩹', 'Berto|el meteorólogo|🌡️', 'Violeta|la escritora|🖋️']),
      places: I_(['el|comedor|🍽️', 'el|dormitorio común|🛏️|dormitorio', 'la|leñera|🪵', 'la|sala de calderas|🔥|calderas', 'la|terraza nevada|❄️|terraza', 'el|cuarto de esquís|🎿|esquís', 'la|cocina|🍳', 'la|torre de radio|📡|radio']),
      weapons: I_(['el|piolet|⛏️', 'la|cuerda de escalada|🪢|cuerda', 'el|hacha de leña|🪓|hacha', 'la|tetera envenenada|🫖|tetera', 'la|bota con crampones|🥾|bota', 'la|linterna frontal|🔦|linterna', 'el|cuchillo de monte|🔪|cuchillo', 'la|vela de emergencia|🕯️|vela']) },
    { id: 'casino', hue: 50,
      situaciones: SIT_([
        'Noche de gran premio en el Casino Real|Casino Real|Esa noche se jugaba el mayor bote de la historia del Casino Real cuando se fue la luz. Al volver, el magnate Octavio Lerma yacía sin vida. Las puertas se cerraron: el culpable sigue dentro.',
        'Torneo de póquer en el Casino Atlántida|Casino Atlántida|En la final del torneo de póquer del Casino Atlántida, el campeón defensor, Alonso Ríos, no volvió del descanso. Lo hallaron sin vida. Nadie ha salido del local.',
        'Inauguración del Casino Sirocco|Casino Sirocco|En la fiesta de inauguración del Casino Sirocco, el banquero que lo financiaba, Eduardo Vallés, fue hallado sin vida. Entre champán y humo de puros, alguien jugó muy sucio.',
        'Madrugada en el Casino Cibeles|Casino Cibeles|Eran las cuatro de la madrugada cuando el inspector de juego, Matías Cano, fue hallado sin vida. Los últimos clientes no han podido salir y todos tienen una coartada que no se sostiene.']),
      voz: ['El crupier jura que', 'La cámara de la sala muestra que', 'Un jugador recuerda que', 'El portero de la entrada asegura que', 'El registro de fichas indica que', 'El camarero de la barra anotó que', 'Una cantante recuerda que', 'La hoja de turnos indica que'],
      suspects: S_(['Valentina|la crupier|🃏', 'Sebas|el jefe de sala|🎩', 'Dolores|la cantante de jazz|🎤', 'Marcelo|el apostador|🎲', 'Irina|la dueña del casino|💎', 'Quino|el barman|🍸', 'Pietro|el guardaespaldas|🕶️', 'Estela|la fotógrafa de sociedad|📸']),
      places: I_(['la|sala de ruleta|🎰|ruleta', 'la|sala de póquer|♠️|póquer', 'la|barra americana|🥃|barra', 'la|cámara acorazada|🔐|cámara', 'el|escenario de jazz|🎷|jazz', 'el|despacho de la dueña|🗂️|despacho', 'el|guardarropa|🧥', 'la|azotea|🌃']),
      weapons: I_(['la|botella de champán|🍾|champán', 'el|cenicero de mármol|🪨|cenicero', 'el|bastón con estoque|🦯|bastón', 'la|corbata de seda|👔|corbata', 'el|cóctel envenenado|🍹|cóctel', 'la|cuerda de terciopelo|🪢|cuerda', 'la|pistola de bolsillo|🔫|pistola', 'el|puro envenenado|🚬|puro']) },
    { id: 'circo', hue: 18,
      situaciones: SIT_([
        'Función de gala en el Gran Circo Montecarlo|Gran Circo Montecarlo|Se apagaron las luces de la pista justo antes del número estrella. Cuando volvieron, el empresario del circo, don Aníbal Bruni, yacía sin vida junto a la pista. Las carpas están cerradas: el culpable sigue aquí.',
        'Temporada de invierno en el Circo Estrella|Circo Estrella|El Circo Estrella invernaba en las afueras cuando su fundador, Tomasso Vega, apareció sin vida entre los remolques. La nieve cubrió cualquier huella y nadie ha salido del recinto.',
        'Noche de estreno en el Circo Lunar|Circo Lunar|La noche del estreno de la nueva temporada, el equilibrista más veterano del Circo Lunar, Mateo Cruz, no regresó de su número. Lo hallaron sin vida tras el telón. El público se fue; el culpable no.',
        'Despedida en el Circo Fantasía|Circo Fantasía|Era la función de despedida del Circo Fantasía: después de cien años se bajaba el telón para siempre. Pero el payaso mayor, Eusebio Pons, no pudo hacer la reverencia final: lo hallaron sin vida.']),
      voz: ['El portero de la carpa jura que', 'El cartel de turnos indica que', 'Un espectador recuerda que', 'El jefe de pista asegura que', 'El cuidador de los animales recuerda que', 'La taquillera anota que', 'Un acróbata jura que', 'El electricista del circo comprobó que'],
      suspects: S_(['Zara|la trapecista|🤸', 'Ringo|el director de pista|🎩', 'Bruno|el malabarista|🤹', 'Lorenzo|el domador|🦁', 'Pepe|el payaso|🤡', 'Soledad|la adivina|🃏', 'Mei|la contorsionista|🧘', 'Atlas|el forzudo|💪']),
      places: I_(['la|carpa principal|🎪|carpa', 'el|camerino de los artistas|🪞|camerino', 'la|jaula de las fieras|🐅|jaula', 'la|caravana de la adivina|🔮|caravana', 'la|taquilla|🎟️', 'el|establo de los caballos|🐴|establo', 'el|almacén de vestuario|👗|vestuario', 'la|noria|🎡']),
      weapons: I_(['el|cuchillo de lanzador|🔪|cuchillo', 'el|mazo del forzudo|🔨|mazo', 'la|tarta trampa|🥧|tarta', 'la|cuerda de funámbulo|🪢|cuerda', 'la|varita de mago|🪄|varita', 'la|maza de malabarista|🏏|maza', 'el|maquillaje envenenado|💄|maquillaje', 'la|pesa de hierro|🏋️|pesa']) }
  ];
  THEMES.forEach(function (t) { t.titulo = t.situaciones[0].t; t.lugar = t.situaciones[0].l; t.intro = t.situaciones[0].i; });   // (por defecto; el día concreto lo decide dayTheme)

  // ---------- Metadatos de escenario (colección) y víctimas (para el epílogo) ----------
  var META = { mansion: ['Mansión', '🏰'], teatro: ['Teatro', '🎭'], hotel: ['Hotel', '🛎️'], museo: ['Museo', '🏺'], tren: ['Tren', '🚂'], rodaje: ['Rodaje', '🎬'],
               crucero: ['Crucero', '🚢'], refugio: ['Refugio', '🏔️'], casino: ['Casino', '🎰'], circo: ['Circo', '🎪'] };
  var VICTIMS = {
    'Cena de gala en la mansión Aldana': 'don Ricardo Aldana', 'Tormenta en la finca Montealegre': 'doña Teresa Montealegre', 'Cumpleaños en la mansión Ibarra': 'Julián Ibarra', 'Testamento en la casona Villaverde': 'Andrés Villaverde',
    'Estreno en el Teatro Cervantes': 'Álvaro Quiroga', 'Ensayo general en el Gran Teatro Lírico': 'Enrique Salas', 'Gala benéfica en el Teatro Calderón': 'Paloma Roldán', 'Función de despedida en el Teatro Alcázar': 'Samuel Ortuño',
    'Congreso en el Gran Hotel Marítimo': 'el doctor Ignacio Valdés', 'Boda en el Hotel Costa Dorada': 'Rafael Linares', 'Convención en el Hotel Alpino': 'Emilio Roca', 'Temporada baja en el Hotel Belvedere': 'Álvaro Campos',
    'Gala en el Museo Arqueológico': 'Gonzalo Ferrer', 'Noche de los museos': 'Fernando Sol', 'Subasta en la Fundación Duarte': 'Inés Duarte', 'Reapertura tras la reforma': 'Luis Ferrán',
    'Medianoche en el Expreso Cantábrico': 'el senador Aurelio Navas', 'Nevada en el Expreso del Norte': 'Arturo Beltrán', 'Viaje inaugural del Tren de la Costa': 'Esteban Marín', 'Madrugada en el Expreso de Lisboa': 'la condesa Amelia de Rojas',
    'Rodaje en los Estudios Solana': 'Ernesto Vidal', 'Último día de rodaje': 'Gonzalo Páez', 'Rodaje nocturno en los Estudios Lumière': 'Leonardo Aranda', 'Casting en los Estudios Meridiano': 'Joaquín Menéndez',
    'Travesía en el crucero Estrella del Sur': 'Ramón Valcárcel', 'Noche de gala en el Gran Atlántico': 'la condesa Beatriz Alcalá', 'Tormenta en el mar de Alborán': 'Mauro Ibáñez', 'Fin de travesía en el Mediterráneo Dorado': 'Leopoldo Quirós',
    'Ventisca en el refugio Peña Blanca': 'don Anselmo Lanuza', 'Travesía invernal en el refugio Ibón Helado': 'Ismael Puyal', 'Alud en el refugio Cumbre Azul': 'Teodoro Mena', 'Fin de año en el refugio La Fuenfría': 'Lorenzo Gil',
    'Noche de gran premio en el Casino Real': 'Octavio Lerma', 'Torneo de póquer en el Casino Atlántida': 'Alonso Ríos', 'Inauguración del Casino Sirocco': 'Eduardo Vallés', 'Madrugada en el Casino Cibeles': 'Matías Cano',
    'Función de gala en el Gran Circo Montecarlo': 'don Aníbal Bruni', 'Temporada de invierno en el Circo Estrella': 'Tomasso Vega', 'Noche de estreno en el Circo Lunar': 'Mateo Cruz', 'Despedida en el Circo Fantasía': 'Eusebio Pons',
    // pack Baker Street
    'Niebla sobre el Támesis': 'el notario Ambrose Pike', 'El violín desaparecido': 'el coleccionista Percival Dunne', 'El hombre que hablaba demasiado': 'el comerciante Silas Crowe', 'Baile de máscaras': 'lord Hawthorne',
    'El último tren': 'el banquero Edmund Vale', 'El secreto del egiptólogo': 'el egiptólogo Horace Finch', 'Marea baja': 'el comerciante Elias Marsh', 'El químico de la calle Gower': 'el doctor Ezra Whitlock',
    'Campanas de domingo': 'el organista Josiah Penn', 'Amanecer en Covent Garden': 'el prestamista Bartholomew Gray' };
  THEMES.forEach(function (t) {
    var m = META[t.id]; if (m) { t.nombre = m[0]; t.ico = m[1]; }
    t.situaciones.forEach(function (s) { s.v = VICTIMS[s.t] || ''; });
  });
  THEMES.forEach(function (t) { t.titulo = t.situaciones[0].t; t.lugar = t.situaciones[0].l; t.intro = t.situaciones[0].i; });

  // ---------- PACKS TEMÁTICOS (sagas de 10 capítulos; datos en packs.js) ----------
  var PD = (typeof module === 'object' && module.exports) ? require('./packs.js') : (typeof self !== 'undefined' ? self : this).MisterioPacks;
  var PACKS = PD.PACKS;
  function packById(id) { return PACKS.filter(function (p) { return p.id === id; })[0]; }
  function byName(list, key, what) {
    for (var i = 0; i < list.length; i++) if (list[i].n === key || list[i].s === key) return i;
    throw new Error('Pack: no existe ' + what + ' «' + key + '»');
  }
  // Cada capítulo fija quién está bajo sospecha, dónde, con qué y quién es el culpable; la historia es la misma en las 3 dificultades.
  function packTheme(pack, idx) {
    var base = pack.theme, c0 = pack.cap[idx % pack.cap.length], th = {}, k;
    for (k in base) th[k] = base[k];
    // El guion lista primero al culpable, el lugar y el objeto del crimen: se reordenan para que la posición no delate nada.
    // La posición del culpable (y la del lugar y la del objeto) está repartida: en 10 capítulos sale 2 veces en cada hueco.
    function slots(tag) {
      var r = mulberry32(xmur3('orden-' + pack.id + '-' + tag)), a = [], i;
      for (i = 0; i < 10; i++) a.push(i % 5);
      return shuffle(a, r);
    }
    function arrange(list, solution, tag) {
      var r = mulberry32(xmur3('orden-' + pack.id + '-' + tag + '-' + (idx % pack.cap.length)));
      var rest = shuffle(list.filter(function (x) { return x !== solution; }), r), at = slots(tag)[idx % pack.cap.length];
      rest.splice(at, 0, solution);
      return rest;
    }
    var c = {};
    for (k in c0) c[k] = c0[k];
    c.cast = arrange(c0.cast, c0.culpable, 'c');
    c.lugares = arrange(c0.lugares, c0.lugar, 'l');
    c.armas = arrange(c0.armas, c0.arma, 'a');
    th.suspects = c.cast.map(function (x) { return base.suspects[byName(base.suspects, x, 'sospechoso')]; });
    th.places = c.lugares.map(function (x) { return base.places[byName(base.places, x, 'lugar')]; });
    th.weapons = c.armas.map(function (x) { return base.weapons[byName(base.weapons, x, 'objeto')]; });
    th.force = { culprit: c.cast.indexOf(c.culpable), place: c.lugares.indexOf(c.lugar), weapon: c.armas.indexOf(c.arma) };
    if (th.force.culprit < 0 || th.force.place < 0 || th.force.weapon < 0) throw new Error('Pack: solución fuera del reparto en el capítulo ' + (idx + 1));
    th.titulo = c.t; th.lugar = c.l; th.story = c.intro; th.intro = c.intro.join(' '); th.previo = c.previo; th.chap = c;
    th.situacion = { t: c.t, l: c.l, i: th.intro, v: c.victima };
    return th;
  }

  // La ambientación cambia cada día y no se repite hasta agotar todas (ciclos con orden barajado).
  function dayNum(dateStr) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5);
  }
  function cycleOrder(cyc) {
    var o = shuffle(THEMES.map(function (_, i) { return i; }), mulberry32(xmur3('ciclo-' + cyc)));
    var prev = cyc > -1e9 ? shuffle(THEMES.map(function (_, i) { return i; }), mulberry32(xmur3('ciclo-' + (cyc - 1)))) : null;
    if (prev && o[0] === prev[prev.length - 1]) { var t = o[0]; o[0] = o[1]; o[1] = t; }   // sin repetir el día del cambio de ciclo
    return o;
  }
  function themeIdFor(dateStr) {
    var n = dayNum(dateStr), len = THEMES.length, cyc = Math.floor(n / len);
    return THEMES[cycleOrder(cyc)[n - cyc * len]].id;
  }
  // El escenario del día: situación (título, lugar, historia) que rota sin repetirse hasta agotarlas, y el reparto del día
  // (6 de 8 sospechosos, lugares y objetos). Es igual para las tres dificultades; cada una usa 5 de esos 6.
  function dayTheme(dateStr) {
    var base = themeById(themeIdFor(dateStr)), n = dayNum(dateStr), cyc = Math.floor(n / THEMES.length);
    var sit = base.situaciones[(cyc + xmur3(base.id)) % base.situaciones.length];
    var rnd = mulberry32(xmur3('reparto-' + dateStr)), th = {}, k;
    for (k in base) th[k] = base[k];
    th.titulo = sit.t; th.lugar = sit.l; th.intro = sit.i; th.situacion = sit;
    ['suspects', 'places', 'weapons'].forEach(function (g) {
      th[g] = shuffle(range(base[g].length), rnd).slice(0, 6).sort(function (x, y) { return x - y; }).map(function (i) { return base[g][i]; });
    });
    return th;
  }

  // ---------- Dificultades (v7) ----------
  // La dificultad NO depende de una nota de la IA, sino de una estructura fija y medible:
  //   n = sospechosos (= lugares = objetos) | count = nº EXACTO de pistas | mentions = [mín, máx] de pistas en que sale cada sospechoso
  //   cross* = pistas "cruzadas" (unen lugar y objeto) | hard* = cruzadas avanzadas | directMax = máx. de pistas que dan el dato tal cual
  //   crossEss = nº de cruzadas SIN las cuales el caso no se resuelve | reveal = la pista nº a partir de la cual puede quedar claro el culpable
  var CROSS = { wp: 1, nwp: 1, pw2: 1, wp2: 1, imp: 1 };     // pistas cruzadas
  var HARD = { pw2: 1, wp2: 1, imp: 1 };                       // cruzadas avanzadas
  var AMB = { op: 1, ow: 1, ap: 1, aw: 1, dp: 1, dw: 1 };      // pistas de "dos opciones"
  var DIRECT = { ip: 1, iw: 1 };                               // pistas que dan el dato tal cual
  var DIFFS = {
    facil: {
      id: 'facil', label: 'Fácil', ico: '🟢', desc: 'Pistas directas y al grano',
      n: 5, count: 10, mentions: [2, 2],
      w: { ip: 1.2, iw: 1.2, np: 1.2, nw: 1.2, op: 1, ow: 1 },
      quota: { op: 3, ow: 3 },
      ambMax: 4, hardMax: 0, hardMin: 0, crossMax: 0, crossMin: 0, directMax: 5, crossEss: 0, hardEss: 0, reveal: 8
    },
    normal: {
      id: 'normal', label: 'Normal', ico: '🟡', desc: 'Con cruces y menos intuitivo',
      n: 5, count: 10, mentions: [2, 5],
      w: { ip: 1, iw: 1, np: .9, nw: .9, op: 1.1, ow: 1.1, ap: .9, aw: .9, wp: 1.6, nwp: 1.3, pw2: .8, wp2: .8, nnp: 1, nnw: 1, dp: .9, dw: .9 },
      quota: { op: 2, ow: 2, ap: 2, aw: 2, nnp: 1, nnw: 1, dp: 1, dw: 1 },
      ambMax: 4, hardMax: 1, hardMin: 0, crossMax: 3, crossMin: 3, directMax: 2, crossEss: 2, hardEss: 0, reveal: 8
    },
    dificil: {
      id: 'dificil', label: 'Difícil', ico: '🔴', desc: 'Pocas pistas y todas cuentan',
      n: 5, count: 8, mentions: [1, 5],
      w: { ip: .5, iw: .5, np: .6, nw: .6, op: 1, ow: 1, ap: 1.2, aw: 1.2, wp: 1.2, nwp: 1, nnp: .8, nnw: .8, dp: .9, dw: .9, pw2: 1.6, wp2: 1.6, imp: 1 },
      quota: { op: 2, ow: 2, ap: 2, aw: 2, nnp: 1, nnw: 1, dp: 1, dw: 1, imp: 1, pw2: 2, wp2: 2 },
      smart: 70, ambMax: 99, hardMax: 3, hardMin: 2, crossMax: 5, crossMin: 4, directMax: 1, crossEss: 4, hardEss: 2, reveal: 7
    }
  };
  var DIFF_ORDER = ['facil', 'normal', 'dificil'];

  // ---------- Verificación por fuerza bruta (solo para comprobar unicidad) ----------
  function permutations(n) {
    var out = [];
    (function rec(cur, used) {
      if (cur.length === n) { out.push(cur.slice()); return; }
      for (var i = 0; i < n; i++) if (!used[i]) { used[i] = true; cur.push(i); rec(cur, used); cur.pop(); used[i] = false; }
    })([], []);
    return out;
  }
  var PERMS = {};
  function permsOf(n) { return PERMS[n] || (PERMS[n] = permutations(n)); }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

  // ---------- Pistas ----------
  // np: S no estaba en P | nw: S no llevaba W | ip: S estaba en P | iw: S llevaba W
  // op: S estaba en P o P2 | ow: S llevaba W o W2
  // ap: quien estaba en P era S o S2 | aw: quien llevaba W era S o S2
  // wp: quien llevaba W estaba en P | nwp: quien llevaba W no estaba en P
  // nnp: ni S ni S2 estaban en P | nnw: ni S ni S2 llevaban W
  // dp: S y S2 se repartían P y P2 | dw: S y S2 se repartían W y W2
  // pw2: quien estaba en P llevaba W o W2 | wp2: quien llevaba W estaba en P o P2
  // imp: si S estaba en P, entonces S2 llevaba W
  function holds(c, pl, wp) {
    switch (c.t) {
      case 'np': return pl[c.s] !== c.p;
      case 'nw': return wp[c.s] !== c.w;
      case 'ip': return pl[c.s] === c.p;
      case 'iw': return wp[c.s] === c.w;
      case 'op': return pl[c.s] === c.p || pl[c.s] === c.p2;
      case 'ow': return wp[c.s] === c.w || wp[c.s] === c.w2;
      case 'ap': { var h = pl.indexOf(c.p); return h === c.s || h === c.s2; }
      case 'aw': { var g = wp.indexOf(c.w); return g === c.s || g === c.s2; }
      case 'wp': case 'nwp': {
        var s = wp.indexOf(c.w), at = pl[s] === c.p;
        return c.t === 'wp' ? at : !at;
      }
      case 'nnp': return pl[c.s] !== c.p && pl[c.s2] !== c.p;
      case 'nnw': return wp[c.s] !== c.w && wp[c.s2] !== c.w;
      case 'dp': return (pl[c.s] === c.p || pl[c.s] === c.p2) && (pl[c.s2] === c.p || pl[c.s2] === c.p2);
      case 'dw': return (wp[c.s] === c.w || wp[c.s] === c.w2) && (wp[c.s2] === c.w || wp[c.s2] === c.w2);
      case 'pw2': { var q = pl.indexOf(c.p); return wp[q] === c.w || wp[q] === c.w2; }
      case 'wp2': { var z = wp.indexOf(c.w); return pl[z] === c.p || pl[z] === c.p2; }
      case 'imp': return pl[c.s] !== c.p || wp[c.s2] === c.w;
    }
    return false;
  }
  function countSolutions(clues, n) {
    n = n || 5;
    var perms = permsOf(n), cnt = 0, i, j, k, ok;
    for (i = 0; i < perms.length; i++) for (j = 0; j < perms.length; j++) {
      ok = true;
      for (k = 0; k < clues.length; k++) if (!holds(clues[k], perms[i], perms[j])) { ok = false; break; }
      if (ok) cnt++;
    }
    return cnt;
  }
  function clueSuspects(c) { var o = []; if (c.s !== undefined) o.push(c.s); if (c.s2 !== undefined) o.push(c.s2); return o; }

  // ---------- Solucionador "humano": propagación de restricciones, sin adivinar ----------
  // Reglas: cada pista recorta posibilidades; "único candidato" (celda y casilla) y "nadie más puede" (hidden single).
  // opt.n = nº de sospechosos | opt.noCross: ignora las pistas cruzadas | opt.noHard: ignora las cruzadas avanzadas
  var BIT = [1, 2, 4, 8, 16, 32, 64];
  function single(m) { return m !== 0 && (m & (m - 1)) === 0; }
  function bitCount(m) { var c = 0; while (m) { c += m & 1; m >>= 1; } return c; }
  // opt.log = array donde se registra CADA descarte con su motivo (sirve para explicar la solución y medir el esfuerzo):
  //   {g:'p'|'w', s:sospechoso, v:valor descartado, why:{q:nº de pista, dep:[hechos usados]} | {naked:s2} | {hidden:true}}
  function propagate(clues, opt) {
    opt = opt || {};
    var N = opt.n || 5, FULL = (1 << N) - 1, log = opt.log || null;
    var Dp = [], Dw = [], changed = true, guard = 0, bad = false, s, x, t, rounds = 0;
    for (x = 0; x < N; x++) { Dp.push(FULL); Dw.push(FULL); }
    function set(D, i, m, why) {
      var rem = D[i] & ~m;
      if (!rem && D[i] === m) return;
      if (D[i] !== m) { D[i] = m; changed = true; }
      if (log && rem) { var g = D === Dp ? 'p' : 'w'; for (var v = 0; v < N; v++) if (rem & BIT[v]) log.push({ g: g, s: i, v: v, why: why }); }
    }
    function allDiff(D) {
      var gname = D === Dp ? 'p' : 'w';
      for (var i = 0; i < N; i++) if (single(D[i])) for (var j = 0; j < N; j++) if (j !== i) set(D, j, D[j] & ~D[i], { naked: i });
      for (var v = 0; v < N; v++) {
        var holders = [];
        for (var k = 0; k < N; k++) if (D[k] & BIT[v]) holders.push(k);
        if (holders.length === 0) bad = true;
        else if (holders.length === 1) set(D, holders[0], BIT[v], { hidden: true, g: gname });
      }
    }
    // hecho usado como apoyo: pos = "S es de V", !pos = "S no es de V"
    function F(g, s, v, pos) { return { g: g, s: s, v: v, pos: pos }; }
    while (changed && guard++ < 300 && !bad) {
      changed = false; rounds++;
      for (var q = 0; q < clues.length; q++) {
        var c = clues[q], Q = { q: q };
        if (opt.noCross && CROSS[c.t]) continue;
        if (opt.noHard && HARD[c.t]) continue;
        switch (c.t) {
          case 'np': set(Dp, c.s, Dp[c.s] & ~BIT[c.p], Q); break;
          case 'nw': set(Dw, c.s, Dw[c.s] & ~BIT[c.w], Q); break;
          case 'ip': set(Dp, c.s, Dp[c.s] & BIT[c.p], Q); break;
          case 'iw': set(Dw, c.s, Dw[c.s] & BIT[c.w], Q); break;
          case 'op': set(Dp, c.s, Dp[c.s] & (BIT[c.p] | BIT[c.p2]), Q); break;
          case 'ow': set(Dw, c.s, Dw[c.s] & (BIT[c.w] | BIT[c.w2]), Q); break;
          case 'ap': for (s = 0; s < N; s++) if (s !== c.s && s !== c.s2) set(Dp, s, Dp[s] & ~BIT[c.p], Q); break;
          case 'aw': for (s = 0; s < N; s++) if (s !== c.s && s !== c.s2) set(Dw, s, Dw[s] & ~BIT[c.w], Q); break;
          case 'nnp': set(Dp, c.s, Dp[c.s] & ~BIT[c.p], Q); set(Dp, c.s2, Dp[c.s2] & ~BIT[c.p], Q); break;
          case 'nnw': set(Dw, c.s, Dw[c.s] & ~BIT[c.w], Q); set(Dw, c.s2, Dw[c.s2] & ~BIT[c.w], Q); break;
          case 'dp': set(Dp, c.s, Dp[c.s] & (BIT[c.p] | BIT[c.p2]), Q); set(Dp, c.s2, Dp[c.s2] & (BIT[c.p] | BIT[c.p2]), Q); break;
          case 'dw': set(Dw, c.s, Dw[c.s] & (BIT[c.w] | BIT[c.w2]), Q); set(Dw, c.s2, Dw[c.s2] & (BIT[c.w] | BIT[c.w2]), Q); break;
          case 'wp':
            for (s = 0; s < N; s++) {
              if (!(Dp[s] & BIT[c.p])) set(Dw, s, Dw[s] & ~BIT[c.w], { q: q, dep: [F('p', s, c.p, false)] });
              if (!(Dw[s] & BIT[c.w])) set(Dp, s, Dp[s] & ~BIT[c.p], { q: q, dep: [F('w', s, c.w, false)] });
              if (Dp[s] === BIT[c.p]) set(Dw, s, Dw[s] & BIT[c.w], { q: q, dep: [F('p', s, c.p, true)] });
              if (Dw[s] === BIT[c.w]) set(Dp, s, Dp[s] & BIT[c.p], { q: q, dep: [F('w', s, c.w, true)] });
            }
            break;
          case 'nwp':
            for (s = 0; s < N; s++) {
              if (Dp[s] === BIT[c.p]) set(Dw, s, Dw[s] & ~BIT[c.w], { q: q, dep: [F('p', s, c.p, true)] });
              if (Dw[s] === BIT[c.w]) set(Dp, s, Dp[s] & ~BIT[c.p], { q: q, dep: [F('w', s, c.w, true)] });
            }
            break;
          case 'pw2':   // quien estaba en P llevaba W o W2
            for (s = 0; s < N; s++) {
              if (!(Dw[s] & (BIT[c.w] | BIT[c.w2]))) set(Dp, s, Dp[s] & ~BIT[c.p], { q: q, dep: [F('w', s, c.w, false), F('w', s, c.w2, false)] });
              if (Dp[s] === BIT[c.p]) set(Dw, s, Dw[s] & (BIT[c.w] | BIT[c.w2]), { q: q, dep: [F('p', s, c.p, true)] });
            }
            break;
          case 'wp2':   // quien llevaba W estaba en P o P2
            for (s = 0; s < N; s++) {
              if (!(Dp[s] & (BIT[c.p] | BIT[c.p2]))) set(Dw, s, Dw[s] & ~BIT[c.w], { q: q, dep: [F('p', s, c.p, false), F('p', s, c.p2, false)] });
              if (Dw[s] === BIT[c.w]) set(Dp, s, Dp[s] & (BIT[c.p] | BIT[c.p2]), { q: q, dep: [F('w', s, c.w, true)] });
            }
            break;
          case 'imp':   // si S estaba en P, entonces S2 llevaba W
            if (Dp[c.s] === BIT[c.p]) set(Dw, c.s2, Dw[c.s2] & BIT[c.w], { q: q, dep: [F('p', c.s, c.p, true)] });
            if (!(Dw[c.s2] & BIT[c.w])) set(Dp, c.s, Dp[c.s] & ~BIT[c.p], { q: q, dep: [F('w', c.s2, c.w, false)] });
            break;
        }
      }
      allDiff(Dp); allDiff(Dw);
      for (x = 0; x < N; x++) if (Dp[x] === 0 || Dw[x] === 0) bad = true;
    }
    var solved = !bad, size = 0;
    for (t = 0; t < N; t++) { if (!single(Dp[t]) || !single(Dw[t])) solved = false; size += bitCount(Dp[t]) + bitCount(Dw[t]); }
    return { Dp: Dp, Dw: Dw, solved: solved, bad: bad, size: size, rounds: rounds };
  }
  // sospechosos que aún pueden ser el culpable (estar en el lugar del crimen Y llevar el arma del crimen)
  function culpritCands(r, n, cp, cw) {
    var k = 0;
    for (var s = 0; s < n; s++) if ((r.Dp[s] & BIT[cp]) && (r.Dw[s] & BIT[cw])) k++;
    return k;
  }

  // ---------- Esfuerzo humano estimado (solo informativo) ----------
  var COST = { np: 1, nw: 1, ip: 1, iw: 1, nnp: 1, nnw: 1, op: 1.5, ow: 1.5, dp: 1.5, dw: 1.5, ap: 1.5, aw: 1.5, wp: 3, nwp: 3, pw2: 3.5, wp2: 3.5, imp: 4 };
  function effort(clues, n) {
    var log = [], r = propagate(clues, { log: log, n: n }), sc = 0;
    log.forEach(function (e) {
      var w = e.why;
      sc += w.q !== undefined ? COST[clues[w.q].t] : (w.naked !== undefined ? 1 : 2);
    });
    return { score: sc + 2 * r.rounds, rounds: r.rounds, events: log.length };
  }

  // ---------- Explicación paso a paso de la solución ----------
  // Reproduce la deducción real del solucionador: para cada dato (dónde estaba / qué llevaba cada sospechoso), en el orden en que
  // se puede deducir, cuenta qué opciones se descartan y por qué (qué pista, qué dato previo, quién ya lo tenía...).
  function explain(c, th) {
    var clues = c.clues, n = c.n || 5, log = [], i;
    propagate(clues, { log: log, n: n });
    var byDom = { p: [], w: [] }, order = [];
    for (i = 0; i < n; i++) { byDom.p.push([]); byDom.w.push([]); }
    log.forEach(function (e) { var a = byDom[e.g][e.s]; a.push(e); if (a.length === n - 1) order.push({ g: e.g, s: e.s }); });
    function item(g, v) { return g === 'p' ? P(th, v) : W(th, v); }
    function tagItem(g, v) { return g === 'p' ? tagP(th, v) : tagW(th, v); }
    function verb(g, pos) { return (pos ? '' : 'no ') + (g === 'p' ? 'estaba en' : 'llevaba'); }
    function factPlain(f) { return th.suspects[f.s].n + ' ' + verb(f.g, f.pos) + ' ' + item(f.g, f.v); }
    function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }
    var steps = order.map(function (o, idx) {
      var g = o.g, s = o.s, vstar = g === 'p' ? c.solution.pl[s] : c.solution.wp[s], groups = [], gmap = {}, naked = [], hiddenN = 0, qs = [];
      byDom[g][s].forEach(function (e) {
        var w = e.why;
        if (w.q !== undefined) {
          var deps = (w.dep || []).map(factPlain).join(' y '), key = w.q + '|' + deps;
          if (!gmap[key]) { gmap[key] = { q: w.q, deps: deps, vals: [] }; groups.push(gmap[key]); }
          gmap[key].vals.push(e.v);
          if (qs.indexOf(w.q) < 0) qs.push(w.q);
        } else if (w.naked !== undefined) naked.push(tagItem(g, e.v) + ' <small>(de ' + th.suspects[w.naked].n + ')</small>');
        else hiddenN++;
      });
      var li = '';
      groups.forEach(function (gr) {
        li += '<li><span class="x">✕</span><span>' + list(gr.vals.map(function (v) { return tagItem(g, v); })) +
          ' <span class="why">— <button class="pref" data-q="' + gr.q + '">pista ' + (gr.q + 1) + '</button>' + (gr.deps ? ' + ' + gr.deps : '') + '</span></span></li>';
      });
      if (naked.length) li += '<li><span class="x">✕</span><span>' + list(naked) + ' <span class="why">— ' + (naked.length > 1 ? 'ya tienen dueño' : 'ya tiene dueño') + '</span></span></li>';
      if (hiddenN) li += '<li><span class="x">✕</span><span>Las demás opciones <span class="why">— nadie más podía ' + (g === 'p' ? 'estar en ' : 'llevar ') + item(g, vstar) + '</span></span></li>';
      var cul = s === c.culprit && ((g === 'p' && vstar === c.crimePlace) || (g === 'w' && vstar === c.crimeWeapon));
      return { n: idx + 1, s: s, g: g, v: vstar, culprit: cul, clues: qs,
               head: tagS(th, s) + ' ' + (g === 'p' ? 'estaba en ' : 'llevaba ') + tagItem(g, vstar), body: li };
    });
    return { steps: steps };
  }

  // ---------- Lupa: la siguiente deducción lógica que el jugador aún no ha marcado ----------
  // covered(g, s, v) -> true si esa casilla ya está descartada (o atenuada) en el tablero del jugador.
  function hintFor(c, th, covered) {
    var log = [], n = c.n || 5, k, e, w, what, why, it;
    propagate(c.clues, { log: log, n: n });
    for (k = 0; k < log.length; k++) {
      e = log[k];
      if (covered(e.g, e.s, e.v)) continue;       // los eventos van en orden lógico: lo previo ya está marcado, así que este paso se puede deducir ya
      w = e.why || {}; it = e.g === 'p' ? P(th, e.v) : W(th, e.v);
      what = th.suspects[e.s].n + (e.g === 'p' ? ' no estaba en ' : ' no llevaba ') + it;
      why = w.q !== undefined ? 'Relee la pista ' + (w.q + 1) : w.naked !== undefined ? 'Ese dato ya es de ' + th.suspects[w.naked].n : 'Por descarte, con lo que ya sabes';
      return { g: e.g, s: e.s, v: e.v, q: w.q, text: what, why: why };
    }
    return null;
  }

  function toAssign(D) { return D.map(function (m) { return BIT.indexOf(m); }); }

  function mentionCounts(clues, n) {
    var m = [], i; for (i = 0; i < (n || 5); i++) m.push(0);
    clues.forEach(function (c) { if (c.s !== undefined) m[c.s]++; if (c.s2 !== undefined) m[c.s2]++; });
    return m;
  }
  function mentionsOk(clues, n, D) { return mentionCounts(clues, n).every(function (k) { return k >= D.mentions[0] && k <= D.mentions[1]; }); }
  function typeCount(arr, t) { return arr.filter(function (c) { return c.t === t; }).length; }
  function countBy(arr, set) { return arr.filter(function (c) { return set[c.t]; }).length; }
  function themeById(id) { return THEMES.filter(function (t) { return t.id === id; })[0]; }

  // Tema del caso: con 5 sospechosos se eligen 5 de los 6 sospechosos/lugares/objetos del tema (más variedad cada día)
  function subTheme(base, n, rnd) {
    function pick(arr) {
      var idx = range(arr.length);
      if (arr.length > n) idx = shuffle(idx, rnd).slice(0, n).sort(function (a, b) { return a - b; });
      return idx.map(function (i) { return arr[i]; });
    }
    var th = {};
    for (var k in base) th[k] = base[k];
    th.suspects = pick(base.suspects); th.places = pick(base.places); th.weapons = pick(base.weapons);
    return th;
  }

  function buildCase(dateStr, diff, attempt, opts) {
    var D = DIFFS[diff], n = D.n;
    var rnd = mulberry32(xmur3('misterio-v7-' + dateStr + '-' + diff + '#' + attempt));
    var theme = subTheme(opts && opts.theme ? opts.theme : dayTheme(dateStr), n, rnd);
    var pl = shuffle(range(n), rnd), wp = shuffle(range(n), rnd);
    var culprit = Math.floor(rnd() * n);
    if (theme.force) {      // capítulo de un pack: la solución es la del guion
      var F = theme.force, j;
      culprit = F.culprit;
      j = pl.indexOf(F.place); pl[j] = pl[culprit]; pl[culprit] = F.place;
      j = wp.indexOf(F.weapon); wp[j] = wp[culprit]; wp[culprit] = F.weapon;
    }
    var crimePlace = pl[culprit], crimeWeapon = wp[culprit];

    // todas las pistas verdaderas (sin regalar la respuesta). En "A o B" el orden es aleatorio.
    var pool = [], s, s2, p, w, p2, w2;
    function push(c) { if (D.w[c.t]) pool.push(c); }
    function two(a, b) { return rnd() < .5 ? [a, b] : [b, a]; }
    for (s = 0; s < n; s++) {
      for (p = 0; p < n; p++) {
        if (pl[s] !== p) push({ t: 'np', s: s, p: p });
        else {
          if (s !== culprit) push({ t: 'ip', s: s, p: p });
          for (p2 = 0; p2 < n; p2++) if (p2 !== p) { var pp = two(p, p2); push({ t: 'op', s: s, p: pp[0], p2: pp[1] }); }
        }
      }
      for (w = 0; w < n; w++) {
        if (wp[s] !== w) push({ t: 'nw', s: s, w: w });
        else {
          if (s !== culprit) push({ t: 'iw', s: s, w: w });
          for (w2 = 0; w2 < n; w2++) if (w2 !== w) { var ww = two(w, w2); push({ t: 'ow', s: s, w: ww[0], w2: ww[1] }); }
        }
      }
    }
    for (p = 0; p < n; p++) { var hp = pl.indexOf(p); for (s = 0; s < n; s++) if (s !== hp) { var ss = two(hp, s); push({ t: 'ap', p: p, s: ss[0], s2: ss[1] }); } }
    for (w = 0; w < n; w++) { var hw = wp.indexOf(w); for (s = 0; s < n; s++) if (s !== hw) { var sw = two(hw, s); push({ t: 'aw', w: w, s: sw[0], s2: sw[1] }); } }
    for (w = 0; w < n; w++) for (p = 0; p < n; p++) {
      var holder = wp.indexOf(w), at = pl[holder] === p;
      if (at && w === crimeWeapon && p === crimePlace) continue;
      push({ t: at ? 'wp' : 'nwp', w: w, p: p });
    }
    for (s = 0; s < n; s++) for (s2 = s + 1; s2 < n; s2++) {
      for (p = 0; p < n; p++) if (pl[s] !== p && pl[s2] !== p) push({ t: 'nnp', s: s, s2: s2, p: p });
      for (w = 0; w < n; w++) if (wp[s] !== w && wp[s2] !== w) push({ t: 'nnw', s: s, s2: s2, w: w });
      push({ t: 'dp', s: s, s2: s2, p: Math.min(pl[s], pl[s2]), p2: Math.max(pl[s], pl[s2]) });
      push({ t: 'dw', s: s, s2: s2, w: Math.min(wp[s], wp[s2]), w2: Math.max(wp[s], wp[s2]) });
    }
    // "quien estaba en P llevaba W o W2": no se admite si repite lo que ya dice el enunciado (lugar y arma del crimen)
    for (p = 0; p < n; p++) { var ph = wp[pl.indexOf(p)]; for (w2 = 0; w2 < n; w2++) if (w2 !== ph) {
      if (p === crimePlace && (ph === crimeWeapon || w2 === crimeWeapon)) continue;
      var a1 = two(ph, w2); push({ t: 'pw2', p: p, w: a1[0], w2: a1[1] }); } }
    for (w = 0; w < n; w++) { var wh = pl[wp.indexOf(w)]; for (p2 = 0; p2 < n; p2++) if (p2 !== wh) {
      if (w === crimeWeapon && (wh === crimePlace || p2 === crimePlace)) continue;
      var a2 = two(wh, p2); push({ t: 'wp2', w: w, p: a2[0], p2: a2[1] }); } }
    if (D.w.imp) {
      for (s = 0; s < n; s++) for (s2 = 0; s2 < n; s2++) if (s !== s2) for (p = 0; p < n; p++) for (w = 0; w < n; w++) {
        var ant = pl[s] === p, con = wp[s2] === w;
        if (ant === con) push({ t: 'imp', s: s, p: p, s2: s2, w: w });   // ambas ciertas, o ambas falsas (se usa al revés)
      }
    }
    pool.forEach(function (c) { c.k = rnd() * D.w[c.t]; });
    pool.sort(function (a, b) { return b.k - a.k; });

    var chosen = [], cur = propagate(chosen, { n: n });
    function add(c) { chosen.push(c); cur = propagate(chosen, { n: n }); }
    function allowed(c) {
      if (chosen.length >= D.count) return false;
      var q = D.quota[c.t];
      if (q !== undefined && typeCount(chosen, c.t) >= q) return false;
      if (CROSS[c.t] && countBy(chosen, CROSS) >= D.crossMax) return false;
      if (HARD[c.t] && countBy(chosen, HARD) >= D.hardMax) return false;
      if (AMB[c.t] && countBy(chosen, AMB) >= D.ambMax) return false;
      if (DIRECT[c.t] && countBy(chosen, DIRECT) >= D.directMax) return false;
      var m = mentionCounts(chosen, n), ok = true;
      clueSuspects(c).forEach(function (x) { if (m[x] + 1 > D.mentions[1]) ok = false; });
      return ok;
    }
    function progresses(c) { return allowed(c) && propagate(chosen.concat([c]), { n: n }).size < cur.size; }
    function addFrom(filterFn, count) {
      for (var i = 0, k = 0; i < pool.length && k < count; i++) {
        var c = pool[i];
        if (chosen.indexOf(c) >= 0 || !filterFn(c)) continue;
        if (progresses(c)) { add(c); k++; }
      }
    }

    // fase 0: las pistas cruzadas obligatorias de la receta
    if (!D.smart && D.hardMin) addFrom(function (c) { return HARD[c.t]; }, D.hardMin);
    if (!D.smart && D.crossMin) addFrom(function (c) { return CROSS[c.t]; }, D.crossMin - countBy(chosen, CROSS));
    // fase 1: todos los sospechosos tienen sus pistas
    if (!D.smart) shuffle(range(n), rnd).forEach(function (sus) {
      var guard = 0;
      while (mentionCounts(chosen, n)[sus] < D.mentions[0] && guard++ < 10) {
        var cand = pool.filter(function (c) { return (c.s === sus || c.s2 === sus) && chosen.indexOf(c) < 0 && allowed(c); });
        var best = cand.filter(progresses)[0] || cand[0];
        if (!best) break; add(best);
      }
    });
    // fase 2: pistas hasta poder resolver por deducción. Con pocas pistas disponibles (smart) se elige la que más aclara
    var i;
    if (D.smart) {
      while (!cur.solved && chosen.length < D.count) {
        var bestC = null, bestG = 0, seen = 0;
        if (chosen.length === D.count - 1) {      // última pista: se busca entre TODAS la que cierra el caso
          var fin = [];
          for (i = 0; i < pool.length; i++) {
            var fc = pool[i];
            if (chosen.indexOf(fc) < 0 && allowed(fc) && propagate(chosen.concat([fc]), { n: n }).solved) fin.push(fc);
          }
          if (fin.length) add(fin[Math.floor(rnd() * fin.length)]);
          break;
        }
        for (i = 0; i < pool.length && seen < D.smart; i++) {
          var cc = pool[i];
          if (chosen.indexOf(cc) >= 0 || !allowed(cc)) continue;
          seen++;
          var g = cur.size - propagate(chosen.concat([cc]), { n: n }).size + rnd() * .9;
          if (D.hardMin && HARD[cc.t] && countBy(chosen, HARD) < D.hardMin) g += 2.5;       // las cruzadas obligatorias pesan más
          else if (D.crossMin && CROSS[cc.t] && countBy(chosen, CROSS) < D.crossMin) g += 1.5;
          clueSuspects(cc).forEach(function (x) { if (mentionCounts(chosen, n)[x] < D.mentions[0]) g += 1.2; });
          if (g > bestG) { bestG = g; bestC = cc; }
        }
        if (!bestC) break; add(bestC);
      }
    }
    for (i = 0; i < pool.length && !cur.solved; i++) {
      if (chosen.indexOf(pool[i]) >= 0) continue;
      if (progresses(pool[i])) add(pool[i]);
    }
    // fase 3: relleno hasta el nº exacto de pistas (verdaderas y permitidas)
    for (i = 0; i < pool.length && chosen.length < D.count; i++) {
      if (chosen.indexOf(pool[i]) < 0 && allowed(pool[i])) chosen.push(pool[i]);
    }
    chosen.forEach(function (c) { delete c.k; });
    return { theme: theme, n: n, pl: pl, wp: wp, culprit: culprit, crimePlace: crimePlace, crimeWeapon: crimeWeapon, clues: chosen,
             fin: propagate(chosen, { n: n }) };
  }

  // Ordena las pistas para que el culpable NO quede claro hasta el final (cada paso: la pista que menos revela)
  function orderClues(b, rnd) {
    var n = b.n, rest = b.clues.slice(), out = [], reveal = 0;
    while (rest.length) {
      var best = null, bc = -1;
      shuffle(rest, rnd).forEach(function (c) {
        var k = culpritCands(propagate(out.concat([c]), { n: n }), n, b.crimePlace, b.crimeWeapon);
        if (k > bc) { bc = k; best = c; }
      });
      out.push(best); rest.splice(rest.indexOf(best), 1);
      if (!reveal && bc === 1) reveal = out.length;
    }
    return { clues: out, reveal: reveal || out.length };
  }

  // comprueba la receta; devuelve null si todo vale o el motivo del rechazo
  function check(b, D, rnd) {
    var f = b.fin, n = b.n, cl = b.clues, i;
    if (!f.solved) return 'no se resuelve';
    if (cl.length !== D.count) return 'nº de pistas';
    if (!mentionsOk(cl, n, D)) return 'menciones';
    if (toAssign(f.Dp).join() !== b.pl.join() || toAssign(f.Dw).join() !== b.wp.join()) return 'solución distinta';
    var cr = countBy(cl, CROSS), hd = countBy(cl, HARD);
    if (cr < D.crossMin || cr > D.crossMax || hd < D.hardMin || hd > D.hardMax) return 'cruces';
    if (countBy(cl, DIRECT) > D.directMax || countBy(cl, AMB) > D.ambMax) return 'directas/ambiguas';
    // ninguna pista, por sí sola, deja claro quién es el culpable
    for (i = 0; i < cl.length; i++) if (culpritCands(propagate([cl[i]], { n: n }), n, b.crimePlace, b.crimeWeapon) < 2) return 'pista que regala al culpable';
    // cruzadas imprescindibles: sin ellas el caso no se resuelve
    var ce = 0, he = 0;
    for (i = 0; i < cl.length; i++) {
      if (!CROSS[cl[i].t]) continue;
      var rest = cl.filter(function (x) { return x !== cl[i]; });
      if (!propagate(rest, { n: n }).solved) { ce++; if (HARD[cl[i].t]) he++; }
    }
    if (ce < D.crossEss || he < D.hardEss) return 'cruces no imprescindibles';
    if (D.crossMax === 0 && !propagate(cl, { n: n, noCross: true }).solved) return 'sin cruces';
    var o = orderClues(b, rnd);
    if (o.reveal < D.reveal) return 'culpable demasiado pronto';
    b.clues = o.clues; b.reveal = o.reveal; b.crossEss = ce; b.hardEss = he;
    return null;
  }

  var LAST_FAILS = null;
  function generate(dateStr, diff, opts) {
    diff = DIFFS[diff] ? diff : 'normal';
    var D = DIFFS[diff], built = null, ok = false, attempt, fails = {};
    for (attempt = 0; attempt < 1500; attempt++) {
      var b = buildCase(dateStr, diff, attempt, opts);
      var why = check(b, D, mulberry32(xmur3('orden-' + dateStr + diff + attempt)));
      built = b; if (!why) { ok = true; break; }
      fails[why] = (fails[why] || 0) + 1;
    }
    LAST_FAILS = fails;
    var rnd = mulberry32(xmur3('var-' + dateStr + diff));
    built.clues.forEach(function (c) { c.v = Math.floor(rnd() * 10000); });   // variante de redacción
    var ef = effort(built.clues, built.n);
    return { date: dateStr, diff: diff, n: built.n, themeId: built.theme.id, th: built.theme, solution: { pl: built.pl, wp: built.wp }, culprit: built.culprit,
             crimePlace: built.crimePlace, crimeWeapon: built.crimeWeapon, clues: built.clues, number: opts && opts.number ? opts.number : caseNumber(dateStr),
             mentions: mentionCounts(built.clues, built.n), ok: ok, attempts: attempt + 1,
             stats: { score: ef.score, rounds: built.fin.rounds, cross: countBy(built.clues, CROSS), hard: countBy(built.clues, HARD),
                      direct: countBy(built.clues, DIRECT), amb: countBy(built.clues, AMB), reveal: built.reveal, crossEss: built.crossEss } };
  }


  // ---------- Texto de las pistas (con variantes de redacción y testigos) ----------
  function themeOf(id) { return THEMES.filter(function (t) { return t.id === id; })[0]; }
  function P(th, i) { return th.places[i].a + ' ' + th.places[i].n; }
  function W(th, i) { return th.weapons[i].a + ' ' + th.weapons[i].n; }
  var OR = ['or'];
  function templates(c) {
    var S = ['s', c.s], S2 = ['s', c.s2], Pl = ['p', c.p], P2 = ['p', c.p2], Wp = ['w', c.w], W2 = ['w', c.w2];
    switch (c.t) {
      case 'np': return [[S, ' no estaba en ', Pl, '.'], [S, ' no se encontraba en ', Pl, '.'], ['No había ni rastro de ', S, ' en ', Pl, '.'], ['Nadie vio a ', S, ' en ', Pl, '.'], [S, ' no pisó ', Pl, ' esa noche.']];
      case 'nw': return [[S, ' no llevaba ', Wp, '.'], [S, ' no tenía consigo ', Wp, '.'], [S, ' no tenía en su poder ', Wp, '.'], ['A ', S, ' no le encontraron ', Wp, '.'], [S, ' no tocó ', Wp, '.']];
      case 'ip': return [[S, ' estaba en ', Pl, '.'], [S, ' se encontraba en ', Pl, '.'], ['Vieron a ', S, ' en ', Pl, '.'], [S, ' estaba, sin duda, en ', Pl, '.'], ['Había alguien en ', Pl, ': ', S, '.']];
      case 'iw': return [[S, ' llevaba ', Wp, '.'], [S, ' tenía consigo ', Wp, '.'], [S, ' tenía en su poder ', Wp, '.'], [S, ' cargaba con ', Wp, '.'], [S, ' no soltaba ', Wp, '.']];
      case 'op': return [[S, ' estaba en ', Pl, OR, 'en ', P2, '.'], [S, ' se encontraba en ', Pl, OR, 'en ', P2, '.'], [S, ' andaba por ', Pl, OR, P2, '.'], ['La noche la pasó ', S, ' en ', Pl, OR, 'en ', P2, '.']];
      case 'ow': return [[S, ' llevaba ', Wp, OR, W2, '.'], [S, ' tenía consigo ', Wp, OR, W2, '.'], [S, ' cargaba con ', Wp, OR, W2, '.'], [S, ' guardaba ', Wp, OR, W2, '.']];
      case 'ap': return [['Quien estaba en ', Pl, ' era ', S, OR, S2, '.'], ['En ', Pl, ' se encontraba ', S, OR, S2, '.'], ['La persona que estaba en ', Pl, ' era ', S, OR, S2, '.'], ['Quien ocupaba ', Pl, ' era ', S, OR, S2, '.']];
      case 'aw': return [['Quien llevaba ', Wp, ' era ', S, OR, S2, '.'], ['Quien tenía en su poder ', Wp, ' era ', S, OR, S2, '.'], ['Quien cargaba con ', Wp, ' era ', S, OR, S2, '.'], ['Quien guardaba ', Wp, ' era ', S, OR, S2, '.']];
      case 'wp': return [['Quien llevaba ', Wp, ' estaba en ', Pl, '.'], ['Quien tenía consigo ', Wp, ' se encontraba en ', Pl, '.'], ['Quien cargaba con ', Wp, ' estaba en ', Pl, '.'], ['La persona con ', Wp, ' estaba en ', Pl, '.']];
      case 'nwp': return [['Quien llevaba ', Wp, ' no estaba en ', Pl, '.'], ['Quien tenía consigo ', Wp, ' no se encontraba en ', Pl, '.'], ['Quien cargaba con ', Wp, ' no estaba en ', Pl, '.'], ['La persona con ', Wp, ' no estaba en ', Pl, '.']];
      case 'nnp': return [['Ni ', S, ' ni ', S2, ' estaban en ', Pl, '.'], ['Ni ', S, ' ni ', S2, ' se encontraban en ', Pl, '.'], ['Ni ', S, ' ni ', S2, ' pisaron ', Pl, '.'], ['Ni rastro de ', S, ' ni de ', S2, ' en ', Pl, '.']];
      case 'nnw': return [['Ni ', S, ' ni ', S2, ' llevaban ', Wp, '.'], ['Ni ', S, ' ni ', S2, ' tenían consigo ', Wp, '.'], ['Ni ', S, ' ni ', S2, ' tocaron ', Wp, '.']];
      case 'dp': return [[S, ' y ', S2, ' estaban en ', Pl, ' y en ', P2, ', cada cual en un sitio.'], [S, ' y ', S2, ' se repartían ', Pl, ' y ', P2, '.'], ['Entre ', S, ' y ', S2, ' ocupaban ', Pl, ' y ', P2, '.']];
      case 'dw': return [[S, ' y ', S2, ' llevaban ', Wp, ' y ', W2, ', cada cual una cosa.'], [S, ' y ', S2, ' se repartían ', Wp, ' y ', W2, '.'], ['Entre ', S, ' y ', S2, ' llevaban ', Wp, ' y ', W2, '.']];
      case 'pw2': return [['Quien estaba en ', Pl, ' llevaba ', Wp, OR, W2, '.'], ['Quien se encontraba en ', Pl, ' tenía consigo ', Wp, OR, W2, '.'], ['Quien ocupaba ', Pl, ' cargaba con ', Wp, OR, W2, '.'], ['La persona en ', Pl, ' tenía ', Wp, OR, W2, '.']];
      case 'wp2': return [['Quien llevaba ', Wp, ' estaba en ', Pl, OR, 'en ', P2, '.'], ['Quien tenía consigo ', Wp, ' se encontraba en ', Pl, OR, 'en ', P2, '.'], ['La persona con ', Wp, ' estaba en ', Pl, OR, 'en ', P2, '.'], ['Quien cargaba con ', Wp, ' ocupaba ', Pl, OR, P2, '.']];
      case 'imp': return [['Si ', S, ' estaba en ', Pl, ', entonces ', S2, ' llevaba ', Wp, '.'], ['Si ', S2, ' no llevaba ', Wp, ', ', S, ' no estaba en ', Pl, '.'], ['Si ', S, ' ocupaba ', Pl, ', entonces ', S2, ' cargaba con ', Wp, '.']];
    }
    return [['']];
  }
  function clueTokens(c, th, plain) {   // plain = sin testigo (para el tutorial)
    var v = c.v || 0, tp = templates(c), toks = tp[v % tp.length].slice();
    if (!plain && th.voz && Math.floor(v / 10) % 10 < 4) {   // ~40 % de las pistas las cuenta un testigo
      var voz = th.voz[Math.floor(v / 100) % th.voz.length];
      if (typeof toks[0] === 'string') toks[0] = toks[0].charAt(0).toLowerCase() + toks[0].slice(1);
      toks.unshift(voz + ' ');
    }
    return toks;
  }
  function renderClue(c, th, plain) {
    return clueTokens(c, th, plain).map(function (t) {
      if (typeof t === 'string') return t;
      if (t[0] === 'or') return ' o ';
      if (t[0] === 's') return th.suspects[t[1]].n;
      return t[0] === 'p' ? P(th, t[1]) : W(th, t[1]);
    }).join('');
  }
  function tagS(th, i) { return '<span class="tag s">' + th.suspects[i].e + ' ' + th.suspects[i].n + '</span>'; }
  function tagP(th, i) { return '<span class="tag p">' + th.places[i].e + ' ' + th.places[i].a + ' ' + th.places[i].n + '</span>'; }
  function tagW(th, i) { return '<span class="tag w">' + th.weapons[i].e + ' ' + th.weapons[i].a + ' ' + th.weapons[i].n + '</span>'; }
  function renderClueHTML(c, th, plain) {
    return clueTokens(c, th, plain).map(function (t) {
      if (typeof t === 'string') return t;
      if (t[0] === 'or') return ' <i>o</i> ';
      if (t[0] === 's') return tagS(th, t[1]);
      return t[0] === 'p' ? tagP(th, t[1]) : tagW(th, t[1]);
    }).join('');
  }
  function caseNumber(dateStr) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    return Math.floor((Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(2026, 10, 12)) / 864e5) + 1;
  }

  function generatePack(packId, idx, diff) {
    var pack = packById(packId);
    return generate('pack-' + packId + '-' + idx, diff, { theme: packTheme(pack, idx), number: idx + 1 });
  }

  // ---------- Epílogo: la confesión y el móvil (cada caso cuenta una historia corta) ----------
  function de(v) { return /^el /.test(v) ? 'del ' + v.slice(3) : 'de ' + v; }   // «de el» → «del»
  var MOTIVES = [
    function () { return 'lo hizo por una antigua deuda que nadie recordaba'; },
    function (v) { return 'no soportaba que ' + v + ' fuera a revelar su secreto'; },
    function () { return 'llevaba años esperando una herencia que creía suya'; },
    function () { return 'actuó por unos celos que arrastraba desde hacía demasiado tiempo'; },
    function (v) { return 'quería evitar que ' + v + ' descubriera lo que ocultaba'; },
    function () { return 'cedió a un chantaje que ya no podía pagar'; },
    function (v) { return 'creyó que, sin ' + v + ', nadie volvería a preguntar por aquel viejo asunto'; },
    function () { return 'dejó que una vieja traición, jamás perdonada, pesara más que la prudencia'; },
    function () { return 'dejó que la ambición de quedárselo todo le nublara el juicio'; },
    function (v) { return 'estaba harto de las humillaciones ' + de(v); },
    function () { return 'quiso borrar una mentira que, de saberse, lo habría hundido'; }
  ];
  function epilogue(cs, th, won) {
    if (th.chap) {   // pack: epílogo escrito a mano; si se pierde, la verdad sale a la luz igualmente
      var c = th.chap, lead = won ? [] : ['Se agotó el tiempo. Pero la verdad no espera a nadie, y esto fue lo que ocurrió.'];
      return { titulo: won ? 'La confesión' : 'Lo que ocurrió', victima: c.victima || '', lines: lead.concat(c.epi), gancho: c.gancho };
    }
    var rnd = mulberry32(xmur3('epi-' + cs.date + cs.diff)), pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var cul = th.suspects[cs.culprit], S = cul.n, v = (th.situacion && th.situacion.v) || 'la víctima';
    var vNom = v.charAt(0).toUpperCase() + v.slice(1);
    var pl = P(th, cs.crimePlace), wp = W(th, cs.crimeWeapon), mot = pick(MOTIVES)(v);
    var l1 = won
      ? pick(['Ante la evidencia, ' + S + ' ya no pudo sostener su coartada.', 'Bastó una pregunta incómoda para que ' + S + ' dejara de sonreír.', S + ' intentó escabullirse, pero las pistas no dejaban ni una grieta.', 'Cuando lo señalaste, ' + S + ' se quedó sin palabras.'])
      : pick(['Se agotó el tiempo y ' + S + ' se esfumó entre la multitud.', S + ' aprovechó la confusión para desaparecer.', 'Mientras dudabas, ' + S + ' ya estaba lejos.']);
    var l2 = won ? S + ' (' + cul.d + ') lo confesó todo: ' + mot + '.' : 'Más tarde se supo la verdad: ' + S + ' (' + cul.d + ') ' + mot + '.';
    var l3 = pick(['El crimen se cometió en ' + pl + ', y ' + wp + ' fue el arma.', 'Todo ocurrió en ' + pl + ': allí estaban ' + wp + ' y ' + S + '.', 'Así fue: ' + S + ', en ' + pl + ', con ' + wp + ' en la mano.']);
    var l4 = won ? pick(['Otro expediente para el archivo.', 'La verdad, una vez más, estaba en los detalles.', 'Elemental: los datos nunca mienten.', 'El caso ' + de(v) + ' queda cerrado.'])
                 : pick(['Este caso se queda frío… hasta que mañana llegue otro.', 'Hay misterios que esperan su momento. Mañana, otro caso.', 'No siempre se gana: lo importante es volver a intentarlo.']);
    return { titulo: won ? 'La confesión' : 'Lo que ocurrió', victima: vNom, lines: [l1, l2, l3, l4] };
  }

  // ---------- Minihistoria del caso diario (el pack lleva su guion; el diario la compone con el escenario del día) ----------
  function story(cs, th) {
    if (th.story) return th.story.slice();
    var rnd = mulberry32(xmur3('hist-' + cs.date)), pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var pl = P(th, cs.crimePlace), wp = W(th, cs.crimeWeapon), v = (th.situacion && th.situacion.v) || '';
    var p2 = pick([
      'Todo apunta a ' + pl + '. Allí, junto a ' + wp + ', la escena habla más alto que cualquier testigo.',
      'La escena del crimen es ' + pl + '. Entre los restos, ' + wp + ': ese detalle no está ahí por casualidad.',
      'Los primeros en llegar coinciden en una cosa: el crimen ocurrió en ' + pl + ', y ' + wp + ' tiene algo que ver.',
      'Quien lo hizo estuvo en ' + pl + ' y se llevó ' + wp + ' consigo. Falta saber quién.']);
    var p3 = pick([
      'Hay cinco personas bajo sospecha. Todas conocían a ' + (v || 'la víctima') + ', y todas juran no haber visto nada.',
      'Cinco nombres, cinco coartadas a medias. Las pistas no mienten: las personas, quizá sí.',
      'Cinco personas estaban cerca. Una de ellas te está mintiendo a la cara, y ninguna se ha puesto nerviosa todavía.',
      'Hay cinco sospechosos y una sola verdad. Los testigos hablan, y es tu trabajo decidir qué encaja con qué.']);
    var fix = function (t) { return t.replace(/ a el /g, ' al ').replace(/ de el /g, ' del '); };
    return [th.intro, fix(p2), fix(p3)];
  }

  return { generate: generate, themeOf: themeOf, themeIdFor: themeIdFor, renderClue: renderClue, renderClueHTML: renderClueHTML,
           countSolutions: countSolutions, propagate: propagate, effort: effort, explain: explain, clueSuspects: clueSuspects, mentionCounts: mentionCounts,
           dayTheme: dayTheme, PACKS: PACKS, packById: packById, packTheme: packTheme, generatePack: generatePack, epilogue: epilogue, story: story, hintFor: hintFor, culpritCands: culpritCands, lastFails: function () { return LAST_FAILS; }, DIRECT: DIRECT,
           caseNumber: caseNumber, THEMES: THEMES, DIFFS: DIFFS, DIFF_ORDER: DIFF_ORDER, CROSS: CROSS, HARD: HARD, AMB: AMB, N: N };
});
