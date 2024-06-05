import ws from 'k6/ws';
import { config } from './configs/import-configs.js'
import { check, fail, sleep } from 'k6';

const urlPrefix = config.urlPrefix;
const channelToken = config.channelToken;
const channelCode = config.channelCode;
const userKey = config.userKey;
const wsUrl = 'ws://localhost:8081/ws-stomp/813/kvxggu6h/websocket';


// function connectWebSocket(url, params) {
//     let websocket = ws.connect(wsUrl, params);

//     websocket.on('open', () => {
//         console.log('WebSocket connection opened');
//     });

//     websocket.on('message', (data) => {
//         console.log(`Received message: ${data}`);
//     });

//     websocket.on('close', () => {
//         console.log('WebSocket connection closed');
//     });

//     return websocket;
// }

// function sendMessages(websocket, messages) {
//     websocket.on('open', () => {
//         messages.forEach(message => {
//             websocket.send(message);
//         });
//     });
// }

/**
 * 웹 소켓 통신
 */

export const wsConnect = (sessionKey, wsMessages, sleepSeconds, RateValidResponse) => {
    const params = { tags: { name: '2. WS Connect' } };

    const response = ws.connect(wsUrl, params, function (websocket) {        
        console.log('connected');
        
        websocket.on('open', () => {
            // CONNECT
            websocket.send(wsMessages[0]);
            // SUBSCRIBE
            websocket.send(wsMessages[1].replace('gw1_webSessionKey', sessionKey));   
         });
         sleep(sleepSeconds);
    
        websocket.on('message', (data) => {
            // SEND 메시지 전송
            websocket.send(wsMessages[2].replace('gw1_webSessionKey', sessionKey));
            console.log(`Received message: ${data}`);
        });
        sleep(sleepSeconds);
    
        websocket.on('message', (data) => {
            // SEND 메시지 전송
            websocket.send(wsMessages[3].replace('gw1_webSessionKey', sessionKey));
            console.log(`Received message: ${data}`);
        });
        sleep(sleepSeconds);
    
        websocket.on('message', (data) => {
            // SEND 메시지 전송
            websocket.send(wsMessages[4].replace('gw1_webSessionKey', sessionKey));
            console.log(`Received message: ${data}`);
        });
        sleep(sleepSeconds);
    
        websocket.on('close', () => {
            // WebSocket 연결 종료 처리
            // ...
            console.log('WebSocket connection closed');
        });

    });
}