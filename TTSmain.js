
async function changeChannel() {
    newChannel = channelInput.value;
    window.location.hash = '#' + newChannel;
    return Promise.all(client.getChannels()
        .map(oldChannel => client.part(oldChannel))
    ).then(() =>
        client.join(newChannel)
    ).then(l =>
        console.log('unido al canal', l[0])
    );
}

async function onMessage(channel, tags, msg, self) {
    console.log("onMessage", msg, tags, channel, self);
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
// Función para inicializar la aplicación
window.onload = async function() {
    audio = document.getElementById("audio");
    chatbox = document.getElementById("chatbox");
    button = document.getElementById("channel-button");
    skip = document.getElementById("skip-button");
    channelInput = document.getElementById("channel");
    button.onclick = changeChannel;
    document.addEventListener("keyup", ({ key }) => {
        if (key == "Enter") changeChannel();
    });
    client = tmi.client();
    await client.connect()
        .then(() => {
            const hashVal = window.location.hash.slice(1);
            if (hashVal.length) {
                channelInput.value = hashVal;
                return changeChannel();
            }
        }).catch(e => console.error('no se pudo conectar a twitch:', e))
        eventsarray.forEach(event => {
            client.on(event, (...args) => {
                // Guardar el último evento en el localStorage
                localStorage.setItem(event, JSON.stringify(args));
                const lastevent = "lastevent" + event;
                localStorage.setItem(lastevent, JSON.stringify(args));
                localStorage.setItem("lastevent", event);
        
                console.log(event, args);
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
                
        
        
                onMessage(...args);
            });
        });
        
             

}
function getlastevent() {
    const lastevent = localStorage.getItem("lastevent");
    if (lastevent) {
        return lastevent;
    }
}
function getallevents() {
    eventsarray.forEach(event => {
        const item = localStorage.getItem("lastevent" + event);
        if (item) {
            const parsedItem = JSON.parse(item);
            console.log(event, parsedItem);
            console.log(mapEvent(event, parsedItem));
        }
    });
}

function mapEvent(eventType, eventData) {
    const baseData = (data, commentIndex = null) => ({
        uniqueId: data.username || eventData[1],
        nickname: data["display-name"] || eventData[1],
        isMod: data.mod,
        isSub: data.subscriber,
        isVip: data.vip,
        comment: commentIndex !== null ? eventData[commentIndex] : undefined || data["system-msg"],
        data
    });

    switch (eventType) {
        case "chat":
            return baseData(eventData[1], 2);
        case "cheer":
            return { ...baseData(eventData[1], 2), bits: eventData[1].bits };
        case "join":
            return { uniqueId: eventData[1], nickname: eventData[1], isMod: !eventData[2], isSub: !eventData[2] };
        case "sub":
            return baseData(eventData[4]);
        case "resub":
            return { ...baseData(eventData[5]), nickname: eventData[3], uniqueId: eventData[3] };
        case "subgift":
            return { ...baseData(eventData[5]), nickname: eventData[3], uniqueId: eventData[3] };
        case "submysterygift":
            return baseData(eventData[4]);
        case "primepaidupgrade":
            return baseData(eventData[3]);
        case "giftpaidupgrade":
            return baseData(eventData[4]);
        case "raided":
            return { ...baseData(eventData[3]), nickname: eventData[1], uniqueId: eventData[1] };
        default:
            return eventData;
    }
}

getallevents();
