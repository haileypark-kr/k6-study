// Auto-generated by the postman-to-k6 converter

import "./libs/shim/core.js";

export let options = { maxRedirects: 4 };

const Request = Symbol.for("request");
postman[Symbol.for("initial")]({
  options
});

export default function() {
  postman[Request]({
    name: "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/talk Copy",
    id: "5601e8b7-6489-4e7c-b2a1-3b3425fccfaa",
    method: "POST",
    address: "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/talk",
    data:
      '{\n\n    "sessionKey": "gw1_pbxcb9894a3a4dcf898557315c36f99d",\n    "transactionId": "test-transaction-id-002",\n    "timestamp": "20220701001122333",\n    "queries": [\n        {\n            "sttServiceKey": 123456,\n            "message": "공과금",\n            "confidence": 89.72\n        }\n    ],\n    "type": "TALK",\n    "custom": {\n        "a1": 1111,\n        "a2": "tester2",\n        "a3": true,\n        "a4": {\n            "a4_1": "tt",\n            "a4_2": 123\n        }\n    }\n}'
  });

  postman[Request]({
    name:
      "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/start Copy",
    id: "e3161fff-756d-41a0-96f8-9eb70aaf5055",
    method: "POST",
    address: "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/start",
    data:
      '{\n    "channelToken": "channelToken_test",\n    "userKey": "01012341234",\n    "transactionId": "test-transaction-id-001",\n    "timestamp": "20220701001122333",\n    "channelId": "",\n    "botProfile": "TEST",\n    "ucid": "",\n    "custom": {}\n}'
  });

  postman[Request]({
    name: "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/stop",
    id: "024f47be-fac8-4c92-872b-ab1afe0a651b",
    method: "POST",
    address: "http://localhost:8081/gateway/voice/TT_OMNI_VOICE_1_CH/v1/stop",
    data:
      '{\n    "sessionKey": "gw1_pbxcb9894a3a4dcf898557315c36f99d",\n    "transactionId": "test-transaction-id-002",\n    "timestamp": "20220701001122333",\n    "queries": [\n        {\n            "sttServiceKey": 123456,\n            "message": "공과금",\n            "confidence": 89.72\n        }\n    ],\n    "type": "TALK",\n    "custom": {\n        "a1": 1111,\n        "a2": "tester2",\n        "a3": true,\n        "a4": {\n            "a4_1": "tt",\n            "a4_2": 123\n        }\n    }\n}'
  });
}