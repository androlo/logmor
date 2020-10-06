import {
    RuleVariable,
    Variable
} from "../src/Variable";
import {
    testANDFormula,
    testEquivFormula,
    testImpliesFormula,
    testInterpret,
    testORFormula,
    testXORFormula
} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('rule declarations', () => {

        test('interpreting a rule derived from hyp H.pos successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            expect(typeof data).toBe('string');
            expect(data).toBe('H');
        });

        test('interpreting a rule derived from hyp.neg successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            console.log(data);
        });

        test('interpreting a rule derived from hyp.either successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H.either
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataOr = testORFormula(data);
            expect(dataOr.operands[0]).toBe('H');
            expect(dataOr.operands[1]).toBe('-H');
        });

        test('interpreting a rule derived from and-logic successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H and H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataAnd = testANDFormula(data);
            expect(dataAnd.operands[0]).toBe('H');
            expect(dataAnd.operands[1]).toBe('-H');
        });

        test('interpreting a rule derived from or-logic successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H or H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataOr = testORFormula(data);
            expect(dataOr.operands[0]).toBe('H');
            expect(dataOr.operands[1]).toBe('-H');
        });

        test('interpreting a rule derived from xor-logic successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H xor H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataXor = testXORFormula(data);
            expect(dataXor.operands[0]).toBe('H');
            expect(dataXor.operands[1]).toBe('-H');
        });

        test('interpreting a rule derived from impl-logic successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H impl H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataImpl = testImpliesFormula(data);
            expect(dataImpl.A).toBe('H');
            expect(dataImpl.B).toBe('-H');
        });

        test('interpreting a rule derived from eq-logic successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H eq H.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataEquiv = testEquivFormula(data);
            expect(dataEquiv.A).toBe('H');
            expect(dataEquiv.B).toBe('-H');
        });

        test(`storing 'H0 and not H1' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                rule R = H0.pos and H1.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const form = testANDFormula(data);
            expect(form.operands.length).toBe(2);
            const op0 = form.operands[0];
            expect(op0).toBe('H0');
            const op1 = form.operands[1];
            expect(op1).toBe('-H1');
        });

        test(`storing '(not H0 or H1) xor (H1 and not H2)' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                hyp H2 "p2" "n2"
                rule R = (H0.neg and H1.pos) xor (H1.pos or H2.neg)
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const form = testXORFormula(data);
            expect(form.operands.length).toBe(2);

            const op0 = testANDFormula(form.operands[0]);
            expect(op0.operands.length).toBe(2);
            const op00 = op0.operands[0];
            expect(op00).toBe('-H0');
            const op01 = op0.operands[1];
            expect(op01).toBe('H1');

            const op1 = testORFormula(form.operands[1]);
            expect(op1.operands.length).toBe(2);
            const op10 = op1.operands[0];
            expect(op10).toBe('H1');
            const op11 = op1.operands[1];
            expect(op11).toBe('-H2');
        });

        test(`storing '(not H0 or H1) eq (H1 and not H2)' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                hyp H2 "p2" "n2"
                rule R = (H0.neg and H1.pos) eq (H1.pos or H2.neg)
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;

            const form = testEquivFormula(data);

            const op0 = testANDFormula(form.A);
            expect(op0.operands.length).toBe(2);
            const op00 = op0.operands[0];
            expect(op00).toBe('-H0');
            const op01 = op0.operands[1];
            expect(op01).toBe('H1');

            const op1 = testORFormula(form.B);
            expect(op1.operands.length).toBe(2);
            const op10 = op1.operands[0];
            expect(op10).toBe('H1');
            const op11 = op1.operands[1];
            expect(op11).toBe('-H2');
        });

        test(`storing '(not H0 or H1) impl (H1 and not H2)' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                hyp H2 "p2" "n2"
                rule R = (H0.neg and H1.pos) impl (H1.pos or H2.neg)
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;

            const form = testImpliesFormula(data);

            const op0 = testANDFormula(form.A);
            expect(op0.operands.length).toBe(2);
            const op00 = op0.operands[0];
            expect(op00).toBe('-H0');
            const op01 = op0.operands[1];
            expect(op01).toBe('H1');

            const op1 = testORFormula(form.B);
            expect(op1.operands.length).toBe(2);
            const op10 = op1.operands[0];
            expect(op10).toBe('H1');
            const op11 = op1.operands[1];
            expect(op11).toBe('-H2');
        });

        test(`storing 'H0 impl H1 impl not H2' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                hyp H2 "p2" "n2"
                rule R = H0.pos impl H1.pos impl H2.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;

            const form = testImpliesFormula(data);
            const form2 = testImpliesFormula(form.A);
            expect(form2.A).toBe('H0');
            expect(form2.B).toBe('H1');
            expect(form.B).toBe('-H2');
        });

        test(`storing 'H0 eq H1 eq not H2' successfully`, () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H0 "p0" "n0"
                hyp H1 "p1" "n1"
                hyp H2 "p2" "n2"
                rule R = H0.pos eq H1.pos eq H2.neg
                `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;

            const form = testEquivFormula(data);
            const form2 = testEquivFormula(form.A);
            expect(form2.A).toBe('H0');
            expect(form2.B).toBe('H1');
            expect(form.B).toBe('-H2');
        });

        test('interpreting a rule derived from another rule successfully', () => {
            const int = new Interpreter();
            testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                rule R2 = R
                `);
            const v = int.getVariable('R2');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            expect(typeof data).toBe('string');
            expect(data).toBe('H');
        });

        test('fail with custom error if malformed name', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed variable name in 'rule' declaration`);
        });

        test('fail with custom error if only rule keyword and nothing else', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed variable name in 'rule' declaration`);
        });

        test('fail with custom error if malformed equals', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule X -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed '=' in rule declaration`);
        });

        test('fail with custom error if missing equals', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule X
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed '=' in rule declaration`);
        });

        test('fail with custom error if malformed token for logical formula', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule X = -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Error in rule declaration`);
        });

        test('fail with custom error if missing logic', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule X = 
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Error in rule declaration`);
        });

    });

});
