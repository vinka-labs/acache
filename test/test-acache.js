//  -*- coding: utf-8 -*-
//  test-acache.js ---
//  created: 2018-03-28 23:11:24
//

'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Code = require('code');
const expect = Code.expect;
const sinon = require('sinon');
const acache = require('../index');

const sleep = async time => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

const afun = async () => {
    await sleep(10);
    return {a: 1, b: 2};
};

lab.experiment('ACache', () => {
    lab.test('Cached reads', async () => {
        const spy = sinon.spy(afun);
        const cache = acache.create(spy, 20);
        let result = await cache.get();
        expect(result).to.be.equal({a: 1, b: 2});
        result = await cache.get();
        result = await cache.get();
        expect(spy.callCount).to.be.equal(1);
        await sleep(10);
        result = await cache.get();
        expect(result).to.be.equal({a: 1, b: 2});
        // still only one call because the timer is started after afun()
        expect(spy.callCount).to.be.equal(1);
        await sleep(10);
        result = await cache.get();
        expect(result).to.be.equal({a: 1, b: 2});
        expect(spy.callCount).to.be.equal(2);
    });

    lab.test('Parallel reads', async () => {
        const spy = sinon.spy(afun);
        const cache = acache.create(spy, 20);
        return Promise.all([
            cache.get(),
            cache.get(),
            cache.get(),
        ]).then(res => {
            expect(res).to.be.equal([
                {a: 1, b: 2},
                {a: 1, b: 2},
                {a: 1, b: 2},
            ]);
            expect(spy.callCount).to.be.equal(1);
        });
    });
});

//
//  test-acache.js ends here
