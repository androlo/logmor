import {ResultDataSolver} from "./Interpreter";
import {Operand, Operands, Solution} from "logic-solver";

export type TypeID = 'hyp' | 'rule' | 'solver';

export type VariableBase = {
    readonly id: string;
}

export type HypVariable = {
    readonly type: 'hyp';
    readonly meta: [string, string];
    readonly group?: number
} & VariableBase;

export type RuleVariable = {
    readonly type: 'rule';
    readonly data: Operand;
} & VariableBase;

export type SolverResult = {
    solverRes: Solution;
    solverCon: Solution;
    results: ResultDataSolver
};

export type SolverVariable = {
    readonly type: 'solver';
    readonly meta: string;
    rules: Operands[];
    pruned: Operands[];
    solverResult: SolverResult | undefined;
    primaryHyp: string | undefined;
} & VariableBase;

export type Variable = HypVariable | RuleVariable | SolverVariable;

export const createHypVar = (id: string, meta: [string, string], group?: number): HypVariable => {
    return {
        id,
        type: 'hyp',
        meta,
        group
    };
};

export const createRuleVar = (id: string, data: Operand): RuleVariable => {
    return {
        id,
        type: 'rule',
        data
    };
};

export const createSolverVar = (id: string, meta: string): SolverVariable => {
    return {
        id,
        type: 'solver',
        meta,
        rules: [],
        pruned: [],
        solverResult: undefined,
        primaryHyp: undefined
    };
};

export const ruleFromVar = (vari: Variable): Operand => {
    if (vari.type === 'hyp') {
        return vari.id;
    } else if (vari.type === 'rule') {
        return vari.data;
    } else {
        throw new Error(`BUG: Variable ${vari.id} is not an atom or rule variable.`);
    }
};
