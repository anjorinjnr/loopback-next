// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// A workaround to use `--require ./test/snapshot-matcher.js` so that root
// hooks are executed by mocha parallel testing for each job

const debug = require('debug')('loopback:cli:test');
const {mergeMochaConfigs} = require('@loopback/build');

/**
 * Build mocha config for `@loopback/cli`
 */
function buildConfig() {
  // Use the default config from `@loopback/build`
  const defaultConfig = require('@loopback/build/config/.mocharc.json');
  debug('Default mocha config:', defaultConfig);

  // Resolve `./test/snapshot-matcher.js` to get the absolute path
  const mochaHooksFile = require.resolve('./test/snapshot-matcher.js');
  debug('Root hooks for --require %s', mochaHooksFile);

  const config = mergeMochaConfigs(defaultConfig, {
    timeout: 5000,
    require: mochaHooksFile,
  });
  debug('Final mocha config:', config);
  return config;
}

module.exports = buildConfig();
