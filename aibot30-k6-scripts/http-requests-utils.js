import http from 'k6/http';
import { config } from './configs/import-configs.js'
import { check, fail } from 'k6';

const urlPrefix = config.urlPrefix;
const channelToken = config.channelToken;
const channelCode = config.channelCode;
const userKey = config.userKey;


/**
 * Start 요청
 * @param {*} RateValidResponse 유효 응답 체크하는 k6 custom Rate
 * @returns 세션키
 */
export const start = (RateValidResponse) => {
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
 * @param {*} sessionKey start에서 생성된 세션키
 * @param {*} intent 
 * @param {*} expectedMessage 예상된 봇 메시지 (validation 체크를 위한)
 * @param {*} RateValidResponse 유효 응답 체크하는 k6 custom Rate
 */
export const findIntent = (sessionKey, intent, expectedMessage, RateValidResponse) => {
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
 * @param {*} RateValidResponse 유효 응답 체크하는 k6 custom Rate
 */
export const slotFilling = (sessionKey, inputMessage, expectedMessage, RateValidResponse) => {
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
 * @param {*} RateValidResponse 유효 응답 체크하는 k6 custom Rate
 */
export const close = (sessionKey, RateValidResponse) => {
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