import http from 'k6/http';
import { sleep , check } from 'k6';

const urlPrefix = "http://localhost:8081/gateway/voice/";
const channelCode = "test2"

export const options = {
  // `stages`를 사용하면 `ramping-vus` executor를 디폴트로 사용한다.
  stages: [
    { duration: '30s', target: 10 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
    { duration: '1m', target: 10 }, // stay at 100 users for 30 minutes
    { duration: '30s', target: 0 }, // ramp-down to 0 users
  ],
};

export default () => {
  const sessionKey = start();
  sleep(1);
  askCoffee(sessionKey);
  sleep(1);
  slotFilling(sessionKey, "아메리카노", "톨, 벤티, 그란데 중에 말해줘.");
  sleep(1);
  slotFilling(sessionKey, "톨 사이즈", "몇 잔 시킬래?");
  sleep(1);
  slotFilling(sessionKey, "1잔 주세요", "시킬게!");
  sleep(1);
  close(sessionKey)
};


const start = () => {
    const url = urlPrefix + channelCode + "/v1/start";
    const body = {
        "channelToken": "592f9d6c-31ac-44a9-8d12-13df1c23ee2d",
        "userKey": "01012341234",
        "transactionId": "test-transaction-id-001",
        "timestamp": "20220701001122333",
        "channelId": "test2",
        "botProfile": "TEST",
        "ucid": "",
        "custom": {}
    };

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "start"
        },
        headers: { 'Content-Type': 'application/json' },
    });
    
    if (
        check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'created session key': (r) =>
            r.body.sessionKey != null && r.body.sessionKey.includes('gw1_'),
        })
    ){
        fail('status code was not 200 and sessionKey was not in response body');
    }

    return res.body.sessionKey;
}

const askCoffee = (sessionKey) => {
    const url = urlPrefix + channelCode + "/v1/talk";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-002",
        "timestamp": "20220701001122333",
        "queries": [
            {
                "message": "커피 주문"
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "의도 파악"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    if (
        check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'has slot-filling messages': (r) =>
            r.body.messages != null && r.body.messages.length > 0,
        'has valid message': (r) => r.body.messages[0]?.message === "커피 뭐 마실래?"
        })
    ){
        fail('status code was not 200 and slot-filling messages were not in response body');
    }
}



const slotFilling = (sessionKey, inputMessage, expectedMessage) => {
    const url = urlPrefix + channelCode + "/v1/talk";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-003",
        "timestamp": "20220701001122333",
        "queries": [
            {
                "message": inputMessage
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "슬롯필링"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    if (
        check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'has slot-filling messages': (r) =>
            r.body.messages != null && r.body.messages.length > 0,
        'has valid message': (r) => r.body.messages[0]?.message.includes(expectedMessage)
        })
    ){
        fail('status code was not 200 and slot-filling messages were not in response body');
    }
}


const close = (sessionKey) => {
    const url = urlPrefix + channelCode + "/v1/stop";
    const body = {
        "sessionKey": sessionKey,
        "transactionId": "test-transaction-id-006",
        "timestamp": "20220701001122333",
        "queries": [
            {
                "message": inputMessage
            }
        ],
        "type": "TALK"
    }

    const res = http.post(url, JSON.stringify(body), {
        tags: {
            name: "close"
        },
        headers: { 'Content-Type': 'application/json' },
    });

    if (
        check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'is close type': (r) =>
            r.body.type != null && r.body.type === "CLOSE"
        })
    ){
        fail('status code was not 200 and response type was not `CLOSE`');
    }
}


