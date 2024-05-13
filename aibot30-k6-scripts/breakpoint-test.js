/**
 $ K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \                
    K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
    k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") breakpoint-test.js  
 */
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { sleep, check, fail } from 'k6';
import { config } from './breakpoint-test-config.js'


// Custom Metric 추가
export const RateValidResponse = new Rate('valid_response');

// 설정
const urlPrefix = config.urlPrefix;
const channelToken = config.channelToken;
const channelCode = config.channelCode;
const userKey = config.userKey;
const sleepSeconds = config.sleepSeconds;

export const options = config.k6Options;

export default () => {
    const sessionKey = start();
    sleep(sleepSeconds);

    findIntent(sessionKey, config.userMessages[0], config.expectedBotMessages[0]);
    sleep(sleepSeconds);

    slotFilling(sessionKey, config.userMessages[1], config.expectedBotMessages[1]);
    sleep(sleepSeconds);

    slotFilling(sessionKey, config.userMessages[2], config.expectedBotMessages[2]);
    sleep(sleepSeconds);

    close(sessionKey);
    // breakpoint 테스트 끝에는 sleep 넣지 말아라.
};


/**
 * Start 요청
 * @returns 세션키
 */
const start = () => {
    const url = urlPrefix + channelCode + "/v1/start";
    const body = {
        "channelToken": channelToken,
        "userKey": userKey,
        "transactionId": "test-transaction-id-001",
        "timestamp": timestamp(),
        "channelId": channelCode,
        "botProfile": "TEST",
        "ucid": "",
        "custom": {}
    };

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "1.START"
        },
        headers: { 'Content-Type': 'application/json' },
    });
    const sessionKey = JSON.parse(res.body).sessionKey;

    const valid = check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'created session key': (r) => sessionKey != null && sessionKey.includes('gw1_')
    });

    RateValidResponse.add(valid);

    if (!valid) {
        console.error("Failed to start -", res);
        fail(`status code was not 200(${res.status}) or sessionKey was not in response body`);
    }

    return sessionKey;
}


/**
 * 의도 추론
 * @param {*} sessionKey 
 * @param {*} intent 
 * @param {*} expectedMessage 
 */
const findIntent = (sessionKey, intent, expectedMessage) => {
    const url = urlPrefix + channelCode + "/v1/talk";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-002",
        "timestamp": timestamp(),
        "queries": [
            {
                "message": intent
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "2.의도추론"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    const valid = check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'type is message': (r) => resBody.type === 'MESSAGE',
        'has slot-filling messages': (r) => resBody.messages != null && resBody.messages.length > 0,
        'has valid message': (r) => resBody.messages.length > 0 ? resBody.messages[0].message.includes(expectedMessage) : false
    });

    RateValidResponse.add(valid);

    if (!valid) {
        console.error("Failed to find intent -", sessionKey, resBody);
        fail(`status code was not 200(${res.status}) or expected messages were not in response body(${resBody})`);
    }
}


/**
 * 슬롯필링 진행
 * @param {*} sessionKey 
 * @param {*} inputMessage 사용자 발화
 * @param {*} expectedMessage 예상된 봇 메시지 (validation 체크를 위한)
 */
const slotFilling = (sessionKey, inputMessage, expectedMessage) => {
    const url = urlPrefix + channelCode + "/v1/talk";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-003",
        "timestamp": timestamp(),
        "queries": [
            {
                "message": inputMessage
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "3.슬롯필링"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    const valid = check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'type is message': (r) => resBody.type === 'MESSAGE',
        'has slot-filling messages': (r) => resBody.messages != null && resBody.messages.length > 0,
        'has valid message': (r) => resBody.messages.length > 0 ? resBody.messages[0].message.includes(expectedMessage) : false
    });

    RateValidResponse.add(valid);

    if (!valid) {
        console.error("Failed to slot-filling -", sessionKey, resBody);
        fail(`status code was not 200(${res.status}) or expected messages were not in response body(${resBody})`);
    }
}


/**
 * 세션 종료
 * @param {*} sessionKey 
 */
const close = (sessionKey) => {
    const url = urlPrefix + channelCode + "/v1/stop";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-006",
        "timestamp": timestamp(),
        "queries": [
            {
                "message": "종료"
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "4.CLOSE"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    const valid = check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'is close type': (r) => resBody.type != null && resBody.type === "CLOSE"
    });

    RateValidResponse.add(valid);

    if (!valid) {
        console.error("Failed to close -", sessionKey, resBody);
        fail(`status code was not 200(${res.status}) or response type was not CLOSE(${resBody.type})`);
    }
}



/**
 * 현재 timestamp 을 리턴한다.
 * @returns yyyyMMddHHmmssSSS
 */
const timestamp = () => {

    const pad = (number, length) => {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    const nowDate = new Date();
    return '' + nowDate.getFullYear() + pad(nowDate.getMonth() + 1, 2)
        + pad(nowDate.getDay(), 2)
        + pad(nowDate.getHours(), 2)
        + pad(nowDate.getMinutes(), 2)
        + pad(nowDate.getSeconds(), 2)
        + pad(nowDate.getMilliseconds(), 3);
}