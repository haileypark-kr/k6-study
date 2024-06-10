import http from 'k6/http';
import { config } from './configs/import-configs.js'
import { check, fail } from 'k6';

const startUrlPrefix = config.startUrlPrefix;
const channelCode = config.channelCode;


/**
 * Start 요청
 * @param {*} RateValidResponse 유효 응답 체크하는 k6 custom Rate
 * @returns 세션키
 */
export const start = (RateValidResponse) => {
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
    }

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