import {
    SolverVariable,
    Variable
} from "../src/Variable";
import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('solver declarations', () => {

        test('interpreting a solver declaration successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                `);
            const v = int.getVariable('S');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('S');
            expect(vDef.type).toBe('solver');
            const vDefSolver = vDef as SolverVariable;
            expect(vDefSolver.meta).toBe('s');
        });

        test('fail with custom error if malformed name', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed solver variable name in 'solver' declaration`);
        });

        test('fail with custom error if only solver keyword and nothing else', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed solver variable name in 'solver' declaration`);
        });

        test('fail with custom error if only solver + name', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Error in solver declaration`);
        });

        test('fail with custom error if solver + name + bad token', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Error in solver declaration`);
        });

    });

});
