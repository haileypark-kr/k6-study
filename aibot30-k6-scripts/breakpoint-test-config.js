
const options = {
    scenarios: {
        default: {
            executor: 'ramping-arrival-rate', //Assure load increase if the system slows
            startRate: 10,
            timeUnit: '6s', // startRate를 적용할 timeunit. (start 200ms - talk 500ms * 3 - close 200ms + 1초 sleep 4회)
            preAllocatedVUs: 2000, // 테스트 시작 전 미리 할당할 VU 개수
            stages: [
                { duration: '2h', target: 2000 }, // just slowly ramp-up to a HUGE load
            ],
        }
    },
    thresholds: {
        'http_req_failed': ['rate<0.001'], // HTTP response status code의 에러 비율 < 0.1%
        'http_req_duration{name:2.의도추론}': ['p(99)<1000'], // 의도 추론용 talk 요청 시간이 1초 이내
        'http_req_duration{name:3.슬롯필링}': ['p(99)<1000'], // 슬롯필링용 talk 요청 시간이 1초 이내
        'valid_response': ['rate>0.95'],   // threshold 이름은 스크립트 내부의 custom metric 이름과 동일.
    },
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