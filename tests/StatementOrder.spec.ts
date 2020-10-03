import {
    SolverVariable,
    Variable
} from "../src/Variable";
import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('solver declarations', () => {

        test('interpreting a hyp declaration successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                `);
            expect(res.messages.length).toBe(0);
        });

        test('interpreting a hyp + rule declaration successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                `);
            expect(res.messages.length).toBe(0);
        });

        test('interpreting a hyp + rule + solver declaration successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                `);
            expect(res.messages.length).toBe(0);
        });

        test('interpreting many different statements in the correct order successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                hyp H2 "p2" "n2"
                
                rule R = H
                rule R2 = H2
                rule R3 = R
                
                solver S "test"
                solver T "test2"
                
                solver S apply R
                solver S omit R2
                solver S run
                solver T apply R3
                solver S print
                `);
            expect(res.messages.length).toBe(0);
        });

        test('fail with custom error if hyp after rule', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                hyp H2 "p2" "n2"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'hyp'`);
        });

        test('fail with custom error if hyp after solver declaration', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                hyp H2 "p2" "n2"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'hyp'`);
        });

        test('fail with custom error if hyp after solver statement', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply H
                hyp H2 "p2" "n2"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'hyp'`);
        });

        test('fail with custom error if hyp after comparison', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S T
                hyp H2 "p2" "n2"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'hyp'`);
        });

        test('fail with custom error if rule after solver declaration', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                rule R2 = H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'rule'`);
        });

        test('fail with custom error if rule after solver statements', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply H
                rule R2 = H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'rule'`);
        });

        test('fail with custom error if rule after comparison', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S T
                rule R2 = H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'rule'`);
        });

        test('fail with custom error if solver declaration after solver statements', () => {
            // This one is special in that it is a no viable alternative error rather than a token
            // mismatch error, which is the case for all other cases here, but the error message takes
            // this into account.
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply R
                solver T "t"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Additionally, solver declarations must come before solver statements.`);
        });

        test('fail with custom error if solver declaration after comparisons', () => {
            // This one is special in that it is a no viable alternative error rather than a token
            // mismatch error, which is the case for all other cases here, but the error message takes
            // this into account.
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S T
                solver U "u"
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`unexpected 'solver'`);
        });

    });

    test('fail with custom error if solver declaration after comparisons', () => {
        // This one is special in that it is a no viable alternative error rather than a token
        // mismatch error, which is the case for all other cases here, but the error message takes
        // this into account.
        const int = new Interpreter();
        const res = testInterpret(int,
            `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver U "u"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S T
                solver U apply R
                `);
        expect(res.messages.length).toBe(1);
        expect(res.messages[0].message).toMatch(`unexpected 'solver'`);
    });

});
