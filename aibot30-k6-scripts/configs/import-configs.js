
console.log(`RUNNING ${__ENV.CUSTOM_K6_TEST_TYPE}`);
export const config = JSON.parse(open(`./${__ENV.CUSTOM_K6_TEST_TYPE}-config.json`));
