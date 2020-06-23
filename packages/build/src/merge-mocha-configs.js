// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('debug')('loopback:build:merge-mocha-configs');

module.exports = mergeMochaConfigs;

/**
 * Merge multiple Mocha configuration files into a single one.
 *
 * @param {MochaConfig[]} configs A list of Mocha configuration objects
 * as provided by `.mocharc.js` files.
 */
function mergeMochaConfigs(...configs) {
  debug('Merging mocha configurations', ...configs);
  const result = configs.reduce(assignMochaConfig, {});
  debug('Merged config:', result);
  return result;
}

function assignMochaConfig(target, config) {
  for (const key in config) {
    switch (key) {
      case 'timeout':
        target.timeout = Math.max(target.timeout || 0, config.timeout);
        break;
      case 'require':
        if (!target.require) target.require = [];
        if (Array.isArray(config.require)) {
          debug('Adding an array of files to require', config.require);
          target.require.push(...config.require);
        } else {
          debug('Adding a single file to require', config.require);
          target.require.push(config.require);
        }
        break;
      default:
        // Perform a shallow copy to avoid mutation of original config objects
        if (Array.isArray(config[key])) {
          target[key] = [...config[key]];
        } else if (typeof config[key] === 'object') {
          target[key] = {...config[key]};
        } else {
          target[key] = config[key];
        }
    }
  }
  return target;
}
