import Interpreter, {ExecutionController} from "../src/Interpreter";
import Logic, {ANDFormula, EquivFormula, Formula, ImpliesFormula, ORFormula, XORFormula} from "logic-solver";

export const testInterpret = (int: Interpreter, script: string) => {
    return int.interpret(script, new ExecutionController());
}

export const testANDFormula = (data: any): ANDFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('and');
    return frm as ANDFormula;
};

export const testORFormula = (data: any): ORFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('or');
    return frm as ORFormula;
};

export const testXORFormula = (data: any): XORFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('xor');
    return frm as XORFormula;
};

export const testImpliesFormula = (data: any): ImpliesFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('implies');
    return frm as ImpliesFormula;
};

export const testEquivFormula = (data: any): EquivFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('equiv');
    return frm as EquivFormula;
};
