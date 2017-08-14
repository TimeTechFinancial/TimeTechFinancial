/**
 * @providesModule AppStorageActions
 *
 */

'use strict';
const {EventEmitter} = require('fbemitter');
const emitter = new EventEmitter();

module.exports = {
    emitter: emitter,
};