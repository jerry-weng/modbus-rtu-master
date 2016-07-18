/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

module.exports = function lrc(buffer) {
    var lrc = 0;
    for (var i = 0; i < buffer.length; i++) {
        lrc += buffer[i] & 0xFF;
    }

    return ((lrc ^ 0xFF) + 1) & 0xFF;
};
