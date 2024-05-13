
const options = {
    duration: '10s'
    // `stages`를 사용하면 `ramping-vus` executor를 디폴트로 사용한다.
    //   stages: [
    //     { duration: '30s', target: 10 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
    //     { duration: '1m', target: 10 }, // stay at 100 users for 30 minutes
    //     { duration: '30s', target: 0 }, // ramp-down to 0 users
    //   ],
};

const userMessages = [
    "커피 주문", "아메리카노 마실래", "톨 사이즈"
];

const expectedBotMessages = [
    "커피 뭐 마실래?", "톨, 벤티, 그란데 중에 말해줘.", "한 잔 시킬게!"
]


export const config = {
    urlPrefix: "http://localhost:8081/gateway/voice/",
    channelCode: "test2",
    channelToken: "592f9d6c-31ac-44a9-8d12-13df1c23ee2d",
    userKey: "01012341234",

    k6Options: options,

    sleepSeconds: 1,
    
    userMessages: userMessages,
    expectedBotMessages: expectedBotMessages,
}