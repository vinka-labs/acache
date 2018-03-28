//  -*- coding: utf-8 -*-
//  index.js ---
//  created: 2018-03-28 23:09:45
//

'use strict';

const assert = require('assert');

exports.create = (afun, ttl) => {
    const TIMEOUT = ttl;
    const promises = [];
    let cached = null;
    let loading = false;
    let timer = null;

    const restartTimer = function () {
        assert(!loading);
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            assert(!loading, `loading is ${loading}`);
            cached = null;
            timer = null;
        }, TIMEOUT);
    };

    const that = {
        get() {
            if (cached) {
                // cache hit
                return Promise.resolve(cached);
            }

            const p = new Promise((resolve, reject) => {
                promises.push({resolve, reject});
            });

            if (!loading) {
                // cache miss -> execute afun()
                loading = true;
                afun()
                .then(result => {
                    cached = result;
                    loading = false;
                    promises.forEach(p => p.resolve(result));
                    promises.length = 0;
                    restartTimer();
                })
                .catch(e => {
                    cached = null;
                    loading = false;
                    promises.forEach(p => p.reject(e));
                    promises.length = 0;
                });
            }

            // if we are already loading just return the promise

            return p;
        }
    };

    return that;
};

//
//  index.js ends here
