import {arrsAreEqual, getArrsByComp, setsAreEqual} from "../src/Interpreter";
import {compArrs} from "./utils";

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

        test('arrsAreEqual true for same array', () => {
            const a = ['a', 'b', 'c'];
            const res = arrsAreEqual(a, a);
            expect(res).toBe(true);
        });

        test('setsAreEqual true for empty arrays', () => {
            const a1: string[] = [];
            const a2: string[] = [];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(true);
        });

        test('arrsAreEqual true for simple arrays', () => {
            const a1 = ['a', 'b', 'c'];
            const a2 = ['a', 'b', 'c'];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(true);
        });

        test('arrsAreEqual false for simple arrays of different lengths', () => {
            const a1 = ['a', 'b', 'c'];
            const a2 = ['a', 'b'];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(false);
        });

        test('arrsAreEqual false for simple arrays of same lengths', () => {
            const a1 = ['a', 'b', 'c'];
            const a2 = ['a', 'b', 'd'];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(false);
        });

        test('getArrsByComp true for empty arrays and always true comp', () => {
            const da1: string[][] = [];
            const da2: string[][] = [];
            const res = getArrsByComp(da1, da2, (a1: string[], a2: string[]) => {return true});
            expect(res.length).toBe(0);
        });

        test('getArrsByComp for simple arrays and always true comp', () => {
            const da1 = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']];
            const da2 = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']];
            const res = getArrsByComp(da1, da2, (a1: string[], a2: string[]) => {return true});
            compArrs(da1, res);
        });

        test('getArrsByComp for simple arrays with different lengths and always true comp', () => {
            const da1 = [['a', 'b', 'c'], ['d', 'e', 'f']];
            const da2 = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']];
            const res = getArrsByComp(da1, da2, (a1: string[], a2: string[]) => {return true});
            compArrs(da1, res);
        });

        test('getArrsByComp for simple arrays with different lengths and different arrays and equality comp', () => {
            const da1 = [['a', 'b', 'c'], ['d', 'e', 'f']];
            const da2 = [['a', 'b', 'q'], ['d', 'e', 'y'], ['g', 'h', 'i']];
            const res = getArrsByComp(da1, da2, arrsAreEqual);
            expect(res.length).toBe(0);
        });

        test('getArrsByComp for simple arrays with different lengths and some different arrays and equality comp', () => {
            const da1 = [['a', 'b', 'c'], ['d', 'e', 'f']];
            const da2 = [['a', 'b', 'q'], ['d', 'e', 'f'], ['g', 'h', 'i']];
            const res = getArrsByComp(da1, da2, arrsAreEqual);
            compArrs([['d', 'e', 'f']], res);
        });

    });

});
