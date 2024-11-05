import { Counter, compareObjects, replaceVariables, logger, UserInteractionTracker, EvaluerLikes } from './utils/utils.js';
import { ChatContainer, ChatMessage, showAlert } from './components/message.js';
import { Replacetextoread, addfilterword } from './features/speechconfig.js';
import { handleleermensaje } from './audio/tts.js';
import { getTranslation, translations } from './translations.js';
import { ActionsManager } from './features/Actions.js';
import { EventsManager } from './features/Events.js';
import { sendcommandmc } from './features/Minecraftconfig.js';
let client = tmi.client();

const userProfile = document.querySelector('user-profile');
console.log(userProfile.state);
userProfile.setConnectionStatus('offline');
if (userProfile.state.connected) {
  const trackerMultiple = new UserInteractionTracker();
  trackerMultiple.addInteractionListener(event => {
    const interacted = trackerMultiple.getAllInteractionsByArray([
      'click', 
      'touchstart', 
      'keydown',
    ]);
    
    
    if (interacted) {
      console.log('Usuario ha interactuado se conectara');
      joinRoom(userProfile.state.username);
      trackerMultiple.destroy()
    }
  });
  
    userProfile.setConnectionStatus('away');
}
// Escuchar eventos
userProfile.addEventListener('userConnected', (e) => {
    console.log('Usuario conectado:', e.detail.username, e);
    userProfile.setConnectionStatus('away');
    joinRoom(e.detail.username);
  }); 

userProfile.addEventListener('userDisconnected', (e) => {
    console.log('Usuario desconectado' ,e);
});
function joinRoom(roomid) {
    const roomId = roomid;
    changeChannel(roomId, "#", client);
}
const eventsarray = [
  "emote",
  "emotes",
  "chat",
  "ban",
  "clear",
  "color",
  "commercial",
  "deletemessage",
  "host",
  "unhost",
  "cheer",
  "bits",
  "cheers",
  "connected",
  "disconnected",
  "maxreconnect",
  "reconnect",
  "action",
  "message",
  "emotesets",
  "whisper",
  "mod",
  "unmod",
  "r9kbeta",
  "r9kmode",
  "r9kbetaoff",
  "r9kmodeoff",
  "subscribers",
  "subscriber",
  "subscribersoff",
  "mods",
  "vips",
  "ban",
  "clear",
  "color",
  "commercial",
  "deletemessage",
  "host",
  "unhost",
  "join",
  "part",
  "subs_on",
  "subs_off",
  "slow",
  "slowmode",
  "slowoff",
  "sub",
  "resub",
  "subgift",
  "anonsubgift",
  "submysterygift",
  "anonsubmysterygift",
  "primepaidupgrade",
  "giftpaidupgrade",
  "anongiftpaidupgrade",
  "raided",
  "newanchor",
  "raid",
  "ritual",
]
const counterchat = new Counter(0, 1000);
const countergift = new Counter(0, 1000);
const countershare = new Counter(0, 1000);
const counterlike = new Counter(0, 1000);
const counterfollow = new Counter(0, 1000);
const countermember = new Counter(0, 1000);
const newChatContainer = new ChatContainer('.chatcontainer', 500);
const newGiftContainer = new ChatContainer('.giftcontainer', 500);
const newEventsContainer = new ChatContainer('.eventscontainer', 200); 
const containerConfig = {
  chat: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.chatcontainer', 500)
  },
  gift: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.giftcontainer', 500)
  },
  share: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  like: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  follow: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  member: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  }
};   

function getAvatarUrl(avatarData, preferredSize = 'large') {
  // Mapeo de nombres de tamaños a keys del objeto
  const sizeMap = {
      'large': 'avatar_large',
      'medium': 'avatar_medium',
      'thumb': 'avatar_thumb'
  };

  // Orden de fallback para los tamaños
  const sizeOrder = ['large', 'medium', 'thumb'];
  
  // Si se proporciona un tamaño preferido, reordenar para intentar ese primero
  if (preferredSize && sizeOrder.includes(preferredSize)) {
      const index = sizeOrder.indexOf(preferredSize);
      sizeOrder.unshift(...sizeOrder.splice(index, 1));
  }

  // Intentar obtener URL del tamaño preferido, con fallback a otros tamaños
  for (const size of sizeOrder) {
      const avatarKey = sizeMap[size];
      const avatarInfo = avatarData[avatarKey];

      if (avatarInfo && 
          avatarInfo.url_list && 
          Array.isArray(avatarInfo.url_list) && 
          avatarInfo.url_list.length > 0) {
          // Preferir WebP si está disponible
          const webpUrl = avatarInfo.url_list.find(url => url.endsWith('.webp'));
          return webpUrl || avatarInfo.url_list[0];
      }
  }

  return ''; // Retornar string vacío si no se encuentra ninguna URL
}
const textcontent = {
    content: {
      1: ["text", getTranslation('username'),"white"],
      2: ["text", "uniqueId","silver"],
      3: ["text", "comentario = ","gold"],
      4: ["text", "comment","gold"],
      // 4: ["url", "https://example.com", "blue", "Click para ir a mi perfil"]
  
    },
    comment: "texto de prueba123123123",
    // data: {
    //   comment: "texto de prueba123123123",
    //   number: 123,
    //   text: "text",
    // }
  }
const numbercontent = {
  content: {
    1: ["text", getTranslation('username'),"white"],
    2: ["text", "uniqueId","silver"],
    3: ["number", 1,"gold"],
    4: ["text", "= repeatCount","gold"],
    5: ["text", "giftname = rose","cyan"],
  },
  data: {
    number: 123,
    text: "text",
  }
}
const eventcontent = {
  content: {
    1: ["text", "UniqueId","white"],
    2: ["text", getTranslation('followed'),"yellow"],
  },
  data: {
    number: 123,
    text: "text",
  }
}
const splitfilterwords = (data) => {
  console.log("Callback 1 ejecutado:", data);
  if (data?.comment) {
    const comments = data.comment.match(/.{1,10}/g) || [];
    console.log("comments", comments);
    comments.forEach(comment => {
      if (comment.length < 6) return;
      addfilterword(comment);
    });
  }
};
const filterwordadd = (data) => {
  console.log("Callback 2 ejecutado:", data);
  if (data?.comment && data?.comment.length > 6) {
    addfilterword(data.comment);
  }
}
const callbacksmessage = [splitfilterwords,filterwordadd];
const optionTexts = ['filtrar comentarios - dividir', 'filtrar comentario'];
const message1 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', textcontent, callbacksmessage,optionTexts);
const message2 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', numbercontent);
const message3 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', eventcontent);
// Crear callbacks
newChatContainer.addMessage(message1);
newGiftContainer.addMessage(message2);
newEventsContainer.addMessage(message3);
const arrayevents = ["like", "gift", "chat"];

const messageTemplates = {
  chat: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', data.comment, 'white'],
        3: ['image', data.emotes?.[0]],
      },
      comment: data.comment
    }),
    alert: null,
    options: callbacksmessage,
    optionTexts: optionTexts,
  },

  gift: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', 'gifted', 'white'],
        3: ['number', data.diamondCount, 'gold'],
        4: ['text', data.giftName, 'gold'],
        5: ['image', data.giftPictureUrl]
      }
    }),
    alert: (data) => `${data.uniqueId} gifted ${data.diamondCount}, ${data.giftName}`
  },

  member: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', 'welcome', 'gold']
      },
      comment: ''
    }),
    alert: null
  },

  like: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', data.likeCount, 'gold'],
        3: ['text', 'likes', 'white']
      },
      comment: ''
    }),
    alert: null
  },

  follow: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', 'followed', 'gold']
      },
      comment: ''
    }),
    alert: null
  },

  share: {
    template: (data) => ({
      content: {
        1: ['text', `${data.uniqueId}`, 'gold', data.nickname],
        2: ['text', 'shared', 'gold']
      },
      comment: ''
    }),
    alert: null
  }
};
class MessageHandler {
  constructor(containerConfig, messageTemplates) {
    this.containerConfig = containerConfig;
    this.messageTemplates = messageTemplates;
    this.translations = translations;
    this.currentLang = localStorage.getItem('selectedLanguage') || 'es';
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
    }
  }

  getTranslation(key) {
    return this.translations[this.currentLang]?.[key] || key;
  }

  handleMessage(type, data) {
    const config = this.containerConfig[type];
    const template = this.messageTemplates[type];

    if (!config || !template) {
      console.error(`Configuration not found for message type: ${type}`);
      return;
    }

    const parsedData = template.template(data);
    const counter = config.counter;
    const container = config.container;

    const newMessage = new ChatMessage(
      `msg${counter.increment()}`,
      data.profilePictureUrl,
      parsedData,
      template.options,template.optionTexts
    );

    container.addMessage(newMessage);
    console.log(type, data);

    if (template.alert) {
      showAlert('info', template.alert(data), 5000);
    }
  }
}

// Crear instancia del manejador de mensajes
const messageHandler = new MessageHandler(containerConfig, messageTemplates);
messageHandler.setLanguage('es');
// Funciones de manejo específicas
const handlechat = (data) => messageHandler.handleMessage('chat', data);
const handlegift = (data) => messageHandler.handleMessage('gift', data);
const handlemember = (data) => messageHandler.handleMessage('member', data);
const handlelike = (data) => messageHandler.handleMessage('like', data);
const handleFollow = (data) => messageHandler.handleMessage('follow', data);
const handleShare = (data) => messageHandler.handleMessage('share', data);
let lastcomment = ''
function Readtext(eventType = 'chat',data) {
  // especial case if roomuser is welcome
  if (eventType === 'member') eventType = 'welcome';
  if (eventType === 'chat') {
    if(data.comment === lastcomment) {
      return;
    } 
    lastcomment = data.comment;
  }
  Replacetextoread(eventType, data);
}
const generateobject = (eventType,comparison ) => {
  return arrayevents.includes(eventType) 
    ? [{ key: eventType, compare: comparison },{ key: 'eventType', compare: 'isEqual' }] 
    : [{ key: 'eventType', compare: 'isEqual' }]
};
async function HandleAccionEvent(eventType,data,comparison = 'isEqual') {
  const keysToCheck = generateobject(eventType,comparison)
  const callbackFunction = (matchingObject, index, results) => {
    console.log(`Objeto coincidente encontrado en el índice ${index}:`, matchingObject, results);
  };
  const results = compareObjects(data, await EventsManager.getAllData(), keysToCheck, callbackFunction);
  logger.log('debug',"results HandleAccionEvent",results)
  if (results.validResults.length >= 1 ) {
    results.validResults.forEach(result => {
      processAction(result,data)
    });
  }
}
function processAction(data,userdata) {
  console.log("procesar accion",data)
  if (data.Actions.length > 0) {
    data.Actions.forEach(action => {
      Actionsprocessmanager(action,userdata)
    });
  }
}
const processActioncallbacks = {
  minecraft: (data,userdata) => handleMinecraft(data,userdata),
  tts: (data,userdata) => handletts(data,userdata),
}
async function Actionsprocessmanager(id,userdata) {
  console.log("accionesprocessmanager",id)
  const action = await ActionsManager.getDataById(id)
  console.log("accionesprocessmanager",action)
  if (action) {
    Object.keys(processActioncallbacks).forEach(key => {
      if (action[key]) {
        processActioncallbacks[key](action[key],userdata)
      }
    });
  }
}
function handleMinecraft(data,userdata) {
  if (data?.check) {
    console.log("minecraft check",data)
    const replacecommand = replaceVariables(data.command,userdata);
    console.log("replacecommand",replacecommand)
    sendcommandmc(replacecommand);
  } else {
    console.log("minecraft no check",data)
  }
}
function handletts(data,userdata) {
  if (data?.check) {
    console.log("tts check",data)
    const replacecommand = replaceVariables(data.text,userdata);
    console.log("replacecommand",replacecommand)
    handleleermensaje(replacecommand);
  } else {
    console.log("tts no check",data)
  }
}
async function changeChannel(newChannel, hash = "#", client) { 
  if (!newChannel || newChannel.length <= 2) return;

  // Asegúrate de que el cliente esté conectado
  if (!client.readyState) {
    await client.connect()
    .then(() => {
        const hashVal = window.location.hash.slice(1);
        if (hashVal.length) {
            // Cambia de canal solo si ya estás conectado
            changeChannel(hashVal, "#", client);
        }
          })
      .catch(e => console.error('No se pudo conectar a Twitch:', e));
      console.error('Error: No conectado al servidor.');
      return;
  }

  window.location.hash = newChannel.includes(hash) ? newChannel : '#' + newChannel;

  try {
      // Sal de todos los canales actuales antes de unirte a uno nuevo
      await Promise.all(client.getChannels().map(oldChannel => client.part(oldChannel)));
      const joinedChannel = await client.join(newChannel);
      console.log('Unido al canal:', joinedChannel[0]);
  } catch (e) {
      console.error('Error al cambiar de canal:', e);
  }
}
function getMessagestring(message, { emotes }) {
  if (!emotes) return { message: message, emotes: [] }; // Retorna mensaje original y un array vacío si no hay emotes

  // Array para almacenar los links de los emotes
  const emoteLinks = [];

  // Iterar sobre los emotes para acceder a los IDs y posiciones
  Object.entries(emotes).forEach(([id, positions]) => {
    // Usar solo la primera posición para encontrar la palabra clave del emote
    const position = positions[0];
    const [start, end] = position.split("-");
    const stringToReplace = message.substring(
      parseInt(start, 10),
      parseInt(end, 10) + 1
    );

    // Agregar el link del emote al array
    emoteLinks.push(`https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`);

    // En caso de error, agregar el emote de fallback
    const fallbackLink = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/animated/dark/1.0`;
    emoteLinks.push(fallbackLink);
    
    // Reemplazar la palabra clave del emote con un espacio en blanco
    message = message.replace(stringToReplace, ''); // Reemplaza el emote en el mensaje
  });

  // Retornar el mensaje sin emotes y el array de links de emotes
  return { message: message.trim(), emotes: emoteLinks }; // Elimina espacios en blanco innecesarios
}

// setTimeout(() => {
//   HandleAccionEvent('chat',{nombre: "coloca tu nombre",eventType: "chat",chat: "default text",like: 10,gift: 5655,Actions: [],id: undefined})
// }, 1000);
  client.on('connected', (addr, port) => {
    console.log(`Conectado a ${addr}:${port}`);
});

await client.connect()
    .then(() => {
        const hashVal = window.location.hash.slice(1);
        if (hashVal.length) {
            // Cambia de canal solo si ya estás conectado
            changeChannel(hashVal, "#", client);
        }
    })
.catch(e => console.error('No se pudo conectar a Twitch:', e));
  
eventsarray.forEach(event => {
    client.on(event, (...args) => {
        // Guardar el último evento en el localStorage
        const lastevent = "lastevent" + event;
        localStorage.setItem(lastevent, JSON.stringify(args));
        localStorage.setItem("lastevent", event);
        const mapdata = mapEvent(event, args);
        
        // Mapear todos los datos de args en un solo objeto con sus claves originales
        // const argsObject = args.reduce((acc, arg) => {
        //     if (typeof arg === 'object' && arg !== null) {
        //         // Si es un objeto, agregamos cada propiedad con su clave original
        //         Object.entries(arg).forEach(([key, value]) => {
        //             if (acc[key] !== undefined) {
        //                 // Si la clave ya existe, conviértelo en un array o añade el nuevo valor
        //                 acc[key] = Array.isArray(acc[key]) ? [...acc[key], value] : [acc[key], value];
        //             } else {
        //                 // Si la clave no existe, simplemente la añadimos
        //                 acc[key] = value;
        //             }
        //         });
        //     } else {
        //         // Si es un valor primitivo, lo agregamos sin reemplazar el valor anterior
        //         if (acc[event] !== undefined) {
        //             acc[event] = Array.isArray(acc[event]) ? [...acc[event], arg] : [acc[event], arg];
        //         } else {
        //             acc[event] = arg;
        //         }
        //     }
        //     return acc;
        // }, {});
        
        // console.log("argsObject:", argsObject);
        switch (event) {
            case "chat":
                handlechat(mapdata);
                Readtext(event,mapdata);
                HandleAccionEvent("chat",mapdata);
                break;
            case "cheer":
                handlegift(mapdata);
                Readtext("gift",mapdata);
                HandleAccionEvent("bits",mapdata);
                break;
            default:
              console.log(event,mapEvent(event, args));
            }

        });
});
function baseData(data, commentIndex = null, eventData) {
  let rawcomment = commentIndex !== null ? eventData[commentIndex] : undefined || data["system-msg"];
  return {
      uniqueId: data.username || eventData[1],
      nickname: data["display-name"] || eventData[1],
      isMod: data.mod,
      isSub: data.subscriber,
      isVip: data.vip,
      comment: getMessagestring(rawcomment, data).message,
      emotes: getMessagestring(rawcomment, data).emotes,
      data
  };
}
function mapEvent(eventType, eventData) {

    switch (eventType) {
        case "chat":
            return baseData(eventData[1], 2, eventData);
        case "cheer":
            return { ...baseData(eventData[1], 2, eventData), bits: eventData[1].bits };
        case "join":
            return { uniqueId: eventData[1], nickname: eventData[1], isMod: !eventData[2], isSub: !eventData[2] };
        case "sub":
            return baseData(eventData[4],null, eventData);
        case "resub":
            return { ...baseData(eventData[5], null , eventData), nickname: eventData[3], uniqueId: eventData[3] };
        case "subgift":
            return { ...baseData(eventData[5], null , eventData), nickname: eventData[3], uniqueId: eventData[3] };
        case "submysterygift":
            return baseData(eventData[4],null, eventData);
        case "primepaidupgrade":
            return baseData(eventData[3], null, eventData);
        case "giftpaidupgrade":
            return baseData(eventData[4], null, eventData);
        case "raided":
            return { ...baseData(eventData[3], null, eventData), nickname: eventData[1], uniqueId: eventData[1] };
        default:
            return eventData;
    }
}
