import ws from 'k6/ws';
import http from 'k6/http';
import { config } from './configs/import-configs.js'
import { check, fail, sleep } from 'k6';
import { parseHTML } from 'k6/html';

const startUrlPrefix = config.startUrlPrefix;
const socketUrlPrefix = config.socketUrlPrefix;
const channelToken = config.channelToken;
const channelCode = config.channelCode;

const wsMessages = config.userMessages;
const expectedBotMessages = config.expectedBotMessages;

const wsUrl = 'ws://localhost:8081/ws-stomp/813/kvxggu6h/websocket';

export const wsStart = (RateValidResponse) => {

    // const wsParams = { tags: { name: '2. WS Connect' } };

    const startUrl = startUrlPrefix.replace("{channelCode}", channelCode);
    const chatHtml = http.get(startUrl);

    let sessionKey = null;
    if (chatHtml.status == 200 && chatHtml.body != null && chatHtml.body.length > 0) {
        sessionKey = parseChatHtml(chatHtml.body);
    }

    const valid = check(chatHtml, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'created session key': (r) => sessionKey != null && sessionKey.includes('gw1_web')
    });

    RateValidResponse.add(valid);

    if (!valid) {
        console.error("Failed to start");
        fail(`status code was not 200(${chatHtml.status}) or sessionKey was not in response body`);
    } else {
        console.info("Success to start - ", sessionKey);
    }

    ws.connect(socketUrlPrefix, wsMessages, function (websocket) {
        websocket.on('open', () => {
            console.log("opened");
        });

        websocket.on('message', (message) => {
            // console.log("in", sessionKey, message);

            // CONNECT
            if (message === expectedBotMessages[0]) { // o
                console.log("out CONNECT 요청", sessionKey);
                websocket.send(JSON.stringify([wsMessages[0]])); // ["CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000"]	
            }
            // SUBSCRIBE + 의도추론
            else if (message.includes(expectedBotMessages[1])) { // a["CONNECTED\nversion:1.1\nheart-beat:0,0\n\n\u0000"],
                websocket.setTimeout(function () {

                    // SUBSCRIBE
                    console.log("out SUBSCRIBE 요청", sessionKey);
                    websocket.send(JSON.stringify([wsMessages[1]])); // ["SUBSCRIBE\nid:sub-0\ndestination:/sub/room/gw1_webcfb0b5cb245078460c1e66a5b6ced\n\n\u0000"]	

                    sleep(1);

                    // 의도추론 (커피 주문)
                    const userMsg = wsMessages[2].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken)
                    console.log("out 커피 주문", sessionKey);
                    websocket.send(JSON.stringify([userMsg])); // 커피 주문 - ["SEND\ndestination:/pub/message\ncontent-length:436\n\n{\"sessionKey\":\"gw1_webcfb0b5cb245078460c1e66a5b6ced\",\"channelToken\":\"91812fa5-eb2b-4a20-932d-f5daee671b91\",\"query\":\"커피\",\"queryValue\":null,\"isChangeHuman\":false,\"isClose\":false,\"inputStatus\":\"WRITING\",\"userKey\":null,\"chatInputType\":\"DIRECT\",\"id\":\"TwGYpFi3A0F2vJOk9lEt\",\"currentTime\":\"오후 2:19\",\"className\":\"name\",\"type\":\"TALK\",\"personalData\":false,\"displayText\":\"커피\",\"recommend\":false,\"intentId\":\"\",\"webSocketTalkType\":\"TALK\"}\u0000"]	

                }, 1000);
            }
            // 슬롯필링 1 - 아메리카노
            else if (message.includes(expectedBotMessages[2])) { // "커피 뭐 마실래? 아메리카노, 카페라떼, 콜드브루 중에 골라봐."
                websocket.setTimeout(function () {
                    const userMsg = wsMessages[3].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken)
                    console.log("out 아메리카노", sessionKey);

                    websocket.send(JSON.stringify([userMsg])); // 아메리카노 - ["SEND\ndestination:/pub/message\ncontent-length:453\n\n{\"sessionKey\":\"gw1_webcfb0b5cb245078460c1e66a5b6ced\",\"channelToken\":\"91812fa5-eb2b-4a20-932d-f5daee671b91\",\"query\":\"아메리카노\",\"queryValue\":null,\"isChangeHuman\":false,\"isClose\":true,\"inputStatus\":\"WRITING\",\"userKey\":null,\"chatInputType\":\"DIRECT\",\"id\":\"309Yh9R7P2D3EwBvfuuf\",\"currentTime\":\"오후 2:20\",\"className\":\"name\",\"type\":\"TALK\",\"personalData\":false,\"displayText\":\"아메리카노\",\"recommend\":false,\"intentId\":\"\",\"webSocketTalkType\":\"TALK\"}\u0000"]	
                }, 1000);
            }
            // 슬롯필링 2 - 톨
            else if (message.includes(expectedBotMessages[3])) { // "아메리카노 를 무슨 사이즈로 시킬래? 톨, 벤티, 그란데 중에 말해줘."
                websocket.setTimeout(function () {
                    const userMsg = wsMessages[4].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken)
                    console.log("out 톨", sessionKey);

                    websocket.send(JSON.stringify([userMsg])); // 톨 - ["SEND\ndestination:/pub/message\ncontent-length:453\n\n{\"sessionKey\":\"gw1_webcfb0b5cb245078460c1e66a5b6ced\",\"channelToken\":\"91812fa5-eb2b-4a20-932d-f5daee671b91\",\"query\":\"아메리카노\",\"queryValue\":null,\"isChangeHuman\":false,\"isClose\":true,\"inputStatus\":\"WRITING\",\"userKey\":null,\"chatInputType\":\"DIRECT\",\"id\":\"309Yh9R7P2D3EwBvfuuf\",\"currentTime\":\"오후 2:20\",\"className\":\"name\",\"type\":\"TALK\",\"personalData\":false,\"displayText\":\"아메리카노\",\"recommend\":false,\"intentId\":\"\",\"webSocketTalkType\":\"TALK\"}\u0000"]	
                }, 1000);
            }
            // 답변노드 + close
            else if (message.includes(expectedBotMessages[4])) {
                console.log("close", sessionKey);
                websocket.close()
            }
            // 헬스체크
            else if (message === "h") {

            } else {
                console.error(sessionKey, "미답변", message);
                console.error(message === expectedBotMessages[0], message.includes(expectedBotMessages[1]), 
                message.includes(expectedBotMessages[2]), message.includes(expectedBotMessages[3]), message.includes(expectedBotMessages[4]));
            }
        });
    })


    return sessionKey;
}

/**
 * chat.html에서 세션키를 추출한다.
 * @param {*} inputHtml chat.html
 * @returns 세션키
 */
const parseChatHtml = (inputHtml) => {
    const sessionKeyMatch = inputHtml.match(/var sessionKey = "(.*?)";/);

    // sessionKey 값
    let sessionKey = null;
    if (sessionKeyMatch && sessionKeyMatch[1]) {
        sessionKey = sessionKeyMatch[1];
    }

    return sessionKey;
}


function connectWebSocket(url, params) {
    let websocket = ws.connect(wsUrl, params);

    websocket.on('open', () => {
        console.log('WebSocket connection opened');
    });

    websocket.on('message', (data) => {
        console.log(`Received message: ${data}`);
    });

    // websocket.on('close', () => {
    //     console.log('WebSocket connection closed');
    // });

    return websocket;
}

function sendMessages(websocket, messages) {
    websocket.on('open', () => {
        messages.forEach(message => {
            websocket.send(message);
        });
    });
}

/**
 * 웹 소켓 통신
 */

export const wsConnect = (sessionKey, wsMessages, sleepSeconds, RateValidResponse) => {
    const params = { tags: { name: '2. WS Connect' } };

    const response = ws.connect(wsUrl, params, function (websocket) {
        console.log(sessionKey, 'connected');

        // websocket.on('open', () => {
        //     // CONNECT
        //     websocket.send(wsMessages[0]);
        //     // SUBSCRIBE
        //     websocket.send(wsMessages[1].replace('gw1_webSessionKey', sessionKey));   

        //     console.log("opened");
        //  });
        //  sleep(sleepSeconds);

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


/**
 * 메시지 전송
 * @param {} reqData 
 */
function sendMessage(reqData) {
    reqData.webSocketTalkType = SOCKET_REQ_TYPE.TALK;
    ws.send("/pub/message", {}, JSON.stringify(reqData))
}

function closeChat() {
    if (ws.connected) {
        ws.send("/pub/message", {},
            JSON.stringify({
                webSocketTalkType: SOCKET_REQ_TYPE.QUIT,
                sessionKey: sessionKey,
                channelToken,
                query: null
            })
        )
        ws.disconnect(function () {
            console.log('ws 연결 종료')
        })
    }
}