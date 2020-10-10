import {setsAreEqual} from "../src/Interpreter";

describe('LogMor', () => {

    describe('setsAreEqual', () => {

        test('setsAreEqual true for same set', () => {
            const s = new Set(['a', 'b', 'c']);
            const res = setsAreEqual(s, s);
            expect(res).toBe(true);
        });

        test('setsAreEqual true for empty sets', () => {
            const s1: Set<string> = new Set();
            const s2: Set<string> = new Set();
            const res = setsAreEqual(s1, s2);
            expect(res).toBe(true);
        });

        test('setsAreEqual true for simple sets', () => {
            const s1 = new Set(['a', 'b', 'c']);
            const s2 = new Set(['c', 'a', 'b']);
            const res = setsAreEqual(s1, s2);
            expect(res).toBe(true);
        });

        test('setsAreEqual false for simple sets of different lengths', () => {
            const s1 = new Set(['a', 'b', 'c']);
            const s2 = new Set(['a', 'b']);
            const res = setsAreEqual(s1, s2);
            expect(res).toBe(false);
        });

        test('setsAreEqual false for simple sets of same lengths', () => {
            const s1 = new Set(['a', 'b', 'c']);
            const s2 = new Set(['a', 'b', 'd']);
            const res = setsAreEqual(s1, s2);
            expect(res).toBe(false);
        });

    });

});
