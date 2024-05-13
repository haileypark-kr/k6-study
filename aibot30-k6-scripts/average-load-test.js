import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { config } from './average-load-test-parameters.js'

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

    close();
    sleep(sleepSeconds);
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
            name: "START"
        },
        headers: { 'Content-Type': 'application/json' },
    });
    const sessionKey = JSON.parse(res.body).sessionKey;

    if (
        !check(res, {
            'is status 200': (r) => r.status === 200,
            'body size is bigger than 0': (r) => r.body.length > 0,
            'created session key': (r) => sessionKey != null && sessionKey.includes('gw1_')
        })
    ) {
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
            name: "FindIntent"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    if (
        !check(res, {
            'is status 200': (r) => r.status === 200,
            'body size is bigger than 0': (r) => r.body.length > 0,
            'has slot-filling messages': (r) => resBody.messages != null && resBody.messages.length > 0,
            'has valid message': (r) => resBody.messages[0].message.includes(expectedMessage)
        })
    ) {
        fail(`status code was not 200(${res.status}) or expected messages were not present in response body(${resBody.messages})`);
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
            name: "SLOT"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    if (
        !check(res, {
            'is status 200': (r) => r.status === 200,
            'body size is bigger than 0': (r) => r.body.length > 0,
            'has slot-filling messages': (r) => resBody.messages != null && resBody.messages.length > 0,
            'has valid message': (r) => resBody.messages[0].message.includes(expectedMessage)
        })
    ) {
        fail(`status code was not 200(${res.status}) or expected messages were not present in response body(${resBody.messages})`);
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
                "message": inputMessage
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "CLOSE"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    const resBody = JSON.parse(res.body);

    if (
        !check(res, {
            'is status 200': (r) => r.status === 200,
            'body size is bigger than 0': (r) => r.body.length > 0,
            'is close type': (r) => resBody.type != null && resBody.type === "CLOSE"
        })
    ) {
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