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
            const a: [string, boolean][] = [['a', true], ['b', true], ['c', true]];
            const res = arrsAreEqual(a, a);
            expect(res).toBe(true);
        });

        test('setsAreEqual true for empty arrays', () => {
            const a1: [string, boolean][] = [];
            const a2: [string, boolean][] = [];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(true);
        });

        test('arrsAreEqual true for simple arrays', () => {
            const a1: [string, boolean][] = [['a', true], ['b', true], ['c', true]];
            const a2: [string, boolean][] = [['a', true], ['b', true], ['c', true]];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(true);
        });

        test('arrsAreEqual false for simple arrays of different lengths', () => {
            const a1: [string, boolean][] = [['a', true], ['b', true], ['c', true]];
            const a2: [string, boolean][] = [['a', true], ['b', true]];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(false);
        });

        test('arrsAreEqual false for simple arrays of same lengths', () => {
            const a1: [string, boolean][] = [['a', true], ['b', true], ['c', true]];
            const a2: [string, boolean][] = [['a', true], ['b', true], ['d', true]];
            const res = arrsAreEqual(a1, a2);
            expect(res).toBe(false);
        });

        test('getArrsByComp true for empty arrays and always true comp', () => {
            const da1: [string, boolean][][] = [];
            const da2: [string, boolean][][] = [];
            const res = getArrsByComp(da1, da2, (a1: [string, boolean][], a2: [string, boolean][]) => {return true});
            expect(res.length).toBe(0);
        });

        test('getArrsByComp for simple arrays and always true comp', () => {
            const da1: [string, boolean][][] = [[['a', true], ['b', true], ['c', true]], [['d', true], ['e', true], ['f', true]], [['g', true], ['h', true], ['i', true]]];
            const da2: [string, boolean][][] = [[['a', true], ['b', true], ['c', true]], [['d', true], ['e', true], ['f', true]], [['g', true], ['h', true], ['i', true]]];
            const res = getArrsByComp(da1, da2, (a1: [string, boolean][], a2: [string, boolean][]) => {return true});
            compArrs(da1, res);
        });

        test('getArrsByComp for simple arrays with different lengths and always true comp', () => {
            const da1: [string, boolean][][] = [[['a', true], ['b', true], ['c', true]], [['d', true], ['e', true], ['f', true]], [['g', true], ['h', true], ['i', true]]];
            const da2: [string, boolean][][] = [[['a', true], ['b', true], ['c', true]], [['d', true], ['e', true], ['f', true]]];
            const res = getArrsByComp(da1, da2, (a1: [string, boolean][], a2: [string, boolean][]) => {return true});
            compArrs(da1, res);
        });

        test('getArrsByComp for simple arrays with different lengths and different arrays and equality comp', () => {
            const da1: [string, boolean][][] = [[['a', true], ['b', true], ['c', true]], [['d', true], ['e', true], ['f', true]], [['g', true], ['h', true], ['i', true]]];
            const da2: [string, boolean][][] = [[['a', true], ['b', true], ['p', true]], [['d', true], ['e', true], ['q', true]], [['g', true], ['h', true], ['i', true]]];
            const res = getArrsByComp(da1, da2, arrsAreEqual);
            expect(res.length).toBe(0);
        });

    });

});
