/**
 * 테스트 종류에 맞는 config를 import한다.
 */

const testTypes = ['average-load-test', 'breakpoint-test', 'smoke-test', 'soak-test', 'stress-test'];
if(!testTypes.includes(__ENV.CUSTOM_K6_TEST_TYPE)) {
    console.error(`Test type ${__ENV.CUSTOM_K6_TEST_TYPE} is not supported. Test type should be one of  ['average-load-test', 'breakpoint-test', 'smoke-test', 'soak-test', 'stress-test']`)
}

export const config = JSON.parse(open(`./${__ENV.CUSTOM_K6_TEST_TYPE}-config.json`));
