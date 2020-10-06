import {
    createHypVar,
    createRuleVar,
    createSolverVar,
    HypVariable,
    ruleFromVar,
    RuleVariable,
    Variable
} from "../src/Variable";
import {testANDFormula, testImpliesFormula, testInterpret, testORFormula, testXORFormula} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('operator precedence', () => {

        test('interpreting mixed and/xor 3 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            rule R = H1 and H2 xor H3
            `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataXor = testXORFormula(data);
            testANDFormula(dataXor.operands[0]);
            expect(dataXor.operands[1]).toBe('H3');
        });

        test('interpreting mixed and/xor 4 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            hyp H4 "H4 pos" "H4 neg"
            rule R = H1 xor H2 and H3 xor H4
            `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataXor = testXORFormula(data);
            expect(dataXor.operands[0]).toBe('H1');
            testANDFormula(dataXor.operands[1]);
            expect(dataXor.operands[2]).toBe('H4');
        });

        test('interpreting mixed and/or 3 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            rule R = H1 and H2 or H3
            `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataOr = testORFormula(data);
            testANDFormula(dataOr.operands[0]);
            expect(dataOr.operands[1]).toBe('H3');
        });

        test('interpreting mixed and/or 4 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            hyp H4 "H4 pos" "H4 neg"
            rule R = H1 or H2 and H3 or H4
            `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataOr = testORFormula(data);
            expect(dataOr.operands[0]).toBe('H1');
            testANDFormula(dataOr.operands[1]);
            expect(dataOr.operands[2]).toBe('H4');
        });

        test('interpreting mixed and/impl 3 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            rule R = H1 and H2 impl H3
            `);
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataImpl = testImpliesFormula(data);
            testANDFormula(dataImpl.A);
            expect(dataImpl.B).toBe('H3');
        });

        test('interpreting mixed and/impl 4 terms successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `
            hyp H1 "H1 pos" "H1 neg"
            hyp H2 "H2 pos" "H2 neg"
            hyp H3 "H3 pos" "H3 neg"
            hyp H4 "H4 pos" "H4 neg"
            rule R = H1 impl H2 and H3 impl H4
            `);
            // (H1 impl (H2 and H3)) impl H4
            const v = int.getVariable('R');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('');
            expect(vDef.type).toBe('rule');
            const vDefRule = vDef as RuleVariable;
            const data = vDefRule.data;
            const dataImpl = testImpliesFormula(data);
            const dataImplInner = testImpliesFormula(dataImpl.A);
            expect(dataImplInner.A).toBe('H1');
            console.log(dataImplInner.type);
            testANDFormula(dataImplInner.B);
            expect(dataImpl.B).toBe('H4');
        });

    });

});
