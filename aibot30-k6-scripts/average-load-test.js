/**
 $ K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \                
    K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true CUSTOM_K6_TEST_TYPE=average-load-test \
    k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js  
 */
import { Rate, Counter } from 'k6/metrics';
import { config } from './configs/import-configs.js';
import { start } from './http-requests-utils.js';
import ws from 'k6/ws';


// Custom Metric 추가
export const RateValidResponse = new Rate('valid_response');
export const CountSessions = new Counter('sessions_alive');

// 설정
const sleepMillis = config.sleepSeconds * 1000;
const socketUrlPrefix = config.socketUrlPrefix;
const channelToken = config.channelToken;
const channelCode = config.channelCode;

const wsMessages = config.userMessages;
const expectedBotMessages = config.expectedBotMessages;

// k6 options export
export const options = config.k6Options;

/**
 * setup
 */
export function setup() {
    console.log(`RUNNING ${__ENV.CUSTOM_K6_TEST_TYPE}`);
    console.log("CONFIG:", config);
}

/**
 * VU
 */
export default () => {

    const sessionKey = start(RateValidResponse);
    CountSessions.add(1);

    const socketUrl = getRandomSocketEndpoint();

    ws.connect(socketUrl, {}, function (websocket) {
        websocket.on('message', (message) => {
            // CONNECT
            if (message === expectedBotMessages[0]) {
                RateValidResponse.add(true);
                requestConnectHealthCheck(websocket, sessionKey);
            }
            // SUBSCRIBE + 의도추론
            else if (message.includes(expectedBotMessages[1])) {
                RateValidResponse.add(true);

                // SUBSCRIBE
                requestSubscribe(websocket, sessionKey);

                websocket.setTimeout(function () {
                    requestFindIntent(websocket, sessionKey);
                }, sleepMillis);
            }
            // 슬롯필링 1 - 아메리카노
            else if (message.includes(expectedBotMessages[2])) {
                RateValidResponse.add(true);

                websocket.setTimeout(function () {
                    requestSlotFilling(websocket, sessionKey, 0);
                }, sleepMillis);
            }
            // 슬롯필링 2 - 톨
            else if (message.includes(expectedBotMessages[3])) {
                RateValidResponse.add(true);

                websocket.setTimeout(function () {
                    requestSlotFilling(websocket, sessionKey, 1);
                }, sleepMillis);
            }
            // 답변노드 + close 요청
            else if (message.includes(expectedBotMessages[4])) {
                RateValidResponse.add(true);

                console.log("out close", sessionKey);
                websocket.setTimeout(function () {
                    requestClose(websocket, sessionKey);
                }, sleepMillis);
            }
            // 헬스체크
            else if (message === "h") {

            } else {
                RateValidResponse.add(false);
                console.error(sessionKey, "미답변", message);
                fail(`Invalid response for session ${sessionKey} ${message}`, sessionKey, message);
            }
            
            closeOnTimeout(websocket, sessionKey, sleepMillis);
        });
    })
};

const getRandomSocketEndpoint = () => {
    const getRandomNumber3 = () => {
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        const secondDigit = Math.floor(Math.random() * 10);
        const thirdDigit = Math.floor(Math.random() * 10);
        const randomThreeDigitNumber = `${firstDigit}${secondDigit}${thirdDigit}`;

        return randomThreeDigitNumber;
    }
    const getRandomString8 = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars[randomIndex];
        }
        return result;
    }
    return socketUrlPrefix.replace("{randNum3}",getRandomNumber3()).replace("{randomString8}", getRandomString8());
}

const requestConnectHealthCheck = (websocket, sessionKey) => {
    send(websocket, sessionKey, wsMessages[0]);
}

const requestSubscribe = (websocket, sessionKey) => {
    const subscribeMsg = wsMessages[1].replace("{sessionKey}", sessionKey);
    send(websocket, sessionKey, subscribeMsg);
}

const requestFindIntent = (websocket, sessionKey) => {
    const userMsg = wsMessages[2].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken)
    send(websocket, sessionKey, userMsg);
}

const requestSlotFilling = (websocket, sessionKey, sfIndex) => {
    const userMsg = wsMessages[3 + sfIndex].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken)
    send(websocket, sessionKey, userMsg);
}

const requestClose = (websocket, sessionKey) => {
    const userMsg = wsMessages[5].replace("{sessionKey}", sessionKey).replace("{channelToken}", channelToken);
    send(websocket, sessionKey, userMsg);
    websocket.close();
}

const send = (websocket, sessionKey, msg) => {
    console.log("out", sessionKey, msg);
    websocket.send(JSON.stringify([msg]));
}

const closeOnTimeout = (websocket, sessionKey, timeoutSeconds) => {
    // 5초 이상 응답이 안오면 소켓 강제 종료
    websocket.setTimeout(function () {
        console.error('5 seconds passed, closing the socket');
        requestClose(websocket, sessionKey)
    }, timeoutSeconds * 5);
}