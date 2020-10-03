/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
import {parser} from './Parser';

import {IToken} from 'chevrotain';
import {keywordSet} from './Tokens';
import {InterpreterJSError} from './Errors';
import {
    createHypVar,
    createRuleVar,
    createSolverVar, HypVariable,
    ruleFromVar, RuleVariable,
    SolverVariable,
    Variable
} from "./Variable";

import Logic from 'logic-solver';

export type IMessageType = 'warning' | 'error' | 'solver';
export type IErrorCType = 'LexerError' | 'ParserError' | 'InterpreterError' | 'JSError';

// Returned from interpret method.
export interface InterpreterResult {
    ret: boolean;
    messages: ConsoleMessage[];
    solverResults: ResultDataSolver[];
    compResults: ResultDataComp[];
}

// A console message. Returned in interpret method.
export interface ConsoleMessage {
    type: IMessageType;
    message: string;
    eType?: IErrorCType;
    subType?: string;
    line?: number;
    lineOffset?: number;
    column?: number;
}

// Comparisons. Only supports 'similarity' atm.
export type CompDataTypeID = 'similarity';

// Moral category - comparing the number of good vs. bad moral states.
export type MoralCategory =
    'absolutely permissive'
    | 'permissive'
    | 'balanced'
    | 'forbidding'
    | 'absolutely forbidding'
    | 'indeterminable';

// Amoral category - comparing the number of neutral vs good/bad states.
export type AmoralCategory =
    'absolutely amoral'
    | 'amoral'
    | 'balanced'
    | 'moral'
    | 'absolutely moral'
    | 'indeterminable';

// Result from running a solver.
export type ResultDataSolver = {
    solverID: string;
    solverMeta: string;
    categoryMoral: MoralCategory;
    categoryAmoral: AmoralCategory;
    hyps: [string, string, string][];
    numHyps: number;
    numCases: number;
    goodStates: string[][];
    neutralStates: string[][];
    badStates: string[][];
    formulaRes: any;
    formulaCon: any;
    aLevel: [number, number];
    mBalance: [number, number] | undefined;
    mEntropy: number | undefined;
    mEntropyNorm: number | undefined;
    mEntropyScale: [number, number] | undefined;
};

// Result from running a comparison.
export type ResultDataComp = {
    subtype: CompDataTypeID;
    solverID1: string;
    solverMeta1: string;
    solverID2: string;
    solverMeta2: string;
    goodStates: string[][];
    badStates: string[][];
    neutralStates: string[][];
};

// Dummy token for errors.
export const dummyToken = {
    image: '',
    startOffset: 0,
    startLine: 0,
    startColumn: 0,
    endOffset: 0,
    endLine: 0,
    endColumn: 0,
    isInsertedInRecovery: false,
    tokenTypeIdx: 0,
    tokenType: {
        name: 'dummy'
    }
};

const SC_NAMES = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd'
];

// For aborting the execution of a solver.
export class ExecutionController {
    public aborted = false;
}

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export default class Interpreter extends BaseCstVisitor {

    private _keywords: ReadonlySet<string> = keywordSet();
    private _varTable: Map<string, Variable> = new Map();
    private _hyps: HypVariable[] = [];
    private _po2: number[] = [];

    private _solverResults: ResultDataSolver[] = [];
    private _compResults: ResultDataComp[] = [];

    private _consoleMessages: ConsoleMessage[] = [];

    private _ec: ExecutionController = new ExecutionController();

    constructor() {
        super();
        // This helper will detect any missing or redundant methods on this visitor
        this.validateVisitor();
    }

    parenthesizedExpression(ctx: any): RuleVariable {
        return this.visit(ctx.logicalImplExpression[0]) as RuleVariable;
    }

    primaryExpression(ctx: any): RuleVariable {
        // A hypothetical or a rule
        if (ctx.ID !== undefined) {
            const token = this._getToken(ctx.ID[0]);
            const id = token.image;
            const vari = this.getVariable(id);
            if (vari === undefined) {
                throw InterpreterJSError.createVarDoesNotExist(id, token);
            } else {
                // Must be 'rule' or 'hyp'
                if (vari.type !== 'rule' && vari.type !== 'hyp') {
                    throw InterpreterJSError.create(`Variable ${vari.id} is not a rule or a hypothetical.`, 'TypeError', token);
                }
                // If there is member access, i.e. "var.member".
                if (ctx.BoolLit !== undefined) {
                    const bToken = this._getToken(ctx.BoolLit[0]);
                    const bStr = bToken.image;

                    // This means "P.pos or P.neg".
                    if (bStr === 'either') {
                        // We turn the variable into a rule variable, meaning hypotheticals will be converted.
                        // Same in all cases here.
                        const ruleData = ruleFromVar(vari);
                        return createRuleVar('', Logic.or(ruleData, Logic.not(ruleData)));
                    } else if (bStr === 'false' || bStr === 'neg') {
                        return createRuleVar('', Logic.not(ruleFromVar(vari)));
                    } else {
                        // 'pos' or 'true'
                        return createRuleVar('', ruleFromVar(vari));
                    }
                } else {
                    // Defaults to pos/true.
                    return createRuleVar('', ruleFromVar(vari));
                }
            }
        } else {
            // Parenthesized expression is the only choice other than a variable ID.
            return this.visit(ctx.parenthesizedExpression[0]) as RuleVariable;
        }
    }

    logicalANDExpression(ctx: any): RuleVariable {
        // Get the first variable.
        const vari = this.visit(ctx.primaryExpression[0]) as RuleVariable;
        // If there is at least one 'and', we gather all variables and 'and's and evaluate.
        if (ctx.And !== undefined) {
            // const token = this._getToken(ctx.And[0]);
            // for keeping all operands (Logic objects and variable names).
            const data = [];
            data.push(ruleFromVar(vari));
            for (let i = 0; i < ctx.And.length; i++) {
                // Get all variables and push the rule to the array.
                const vari2 = this.visit(ctx.primaryExpression[i + 1]) as RuleVariable;
                data.push(ruleFromVar(vari2));
            }
            // Take all data and pass it to a Logic object.
            return createRuleVar('', Logic.and(data));
        } else {
            return vari;
        }
    }

    logicalXORExpression(ctx: any): RuleVariable {
        // See docs for 'and'
        const vari = this.visit(ctx.logicalANDExpression[0]) as RuleVariable;
        if (ctx.XOr !== undefined) {
            // const token = this._getToken(ctx.XOr[0]);
            const data = [];
            data.push(ruleFromVar(vari));
            for (let i = 0; i < ctx.XOr.length; i++) {
                const vari2 = this.visit(ctx.logicalANDExpression[i + 1]) as RuleVariable;
                data.push(ruleFromVar(vari2));
            }
            return createRuleVar('', Logic.xor(data));
        } else {
            return vari;
        }
    }

    logicalORExpression(ctx: any): RuleVariable {
        // See docs for 'and'
        const vari = this.visit(ctx.logicalXORExpression[0]) as RuleVariable;
        if (ctx.Or !== undefined) {
            // const token = this._getToken(ctx.Or[0]);
            const data = [];
            data.push(ruleFromVar(vari));
            for (let i = 0; i < ctx.Or.length; i++) {
                const vari2 = this.visit(ctx.logicalXORExpression[i + 1]) as RuleVariable;
                data.push(ruleFromVar(vari2));
            }
            return createRuleVar('', Logic.or(data));
        } else {
            return vari;
        }
    }

    logicalEQExpression(ctx: any): RuleVariable {
        // See docs for 'and'
        let vari = this.visit(ctx.logicalORExpression[0]) as RuleVariable;
        if (ctx.Eq !== undefined) {
            // const token = this._getToken(ctx.Eq[0]);
            for (let i = 0; i < ctx.Eq.length; i++) {
                const vari2 = this.visit(ctx.logicalORExpression[i + 1]) as RuleVariable;
                vari = createRuleVar('', Logic.equiv(vari.data, vari2.data));
            }
        }
        return vari;
    }

    logicalImplExpression(ctx: any): RuleVariable {
        // See docs for 'and', except we do these as nested "(((A -> B) -> C) -> ... ) ".
        let vari = this.visit(ctx.logicalEQExpression[0]) as RuleVariable;
        if (ctx.Impl !== undefined) {
            // const token = this._getToken(ctx.Impl[0]);
            for (let i = 0; i < ctx.Impl.length; i++) {
                const vari2 = this.visit(ctx.logicalEQExpression[i + 1]) as RuleVariable;
                vari = createRuleVar('', Logic.implies(vari.data, vari2.data));
            }
        }
        return vari;
    }

    hypDeclaration(ctx: any): void {
        // Get the variable ID and check that it does not already exist.
        const varIdToken = this._getToken(ctx.ID[0]);
        const varId = varIdToken.image;
        // The string for when the hypothetical is true
        const metaToken = this._getToken(ctx.QUOTED_STRING[0]);
        const meta = metaToken.image;
        if (meta === '""') {
            throw InterpreterJSError.create(`The quoted strings in 'hyp' declarations must not be empty.`, 'DefinitionError', varIdToken);
        }
        // The string for when the hypothetical is false
        const metaToken2 = this._getToken(ctx.QUOTED_STRING[1]);
        const meta2 = metaToken2.image;
        if (meta2 === '""') {
            throw InterpreterJSError.create(`The quoted strings in 'hyp' declarations must not be empty.`, 'DefinitionError', varIdToken);
        }
        // Check that the variable id is available.
        this._checkVarName(varId, varIdToken);
        // Add to variable table.
        this.addVariable(varId, createHypVar(varId, [meta.slice(1, -1), meta2.slice(1, -1)]));
    }

    ruleDeclaration(ctx: any): void {
        // Get the variable ID and check that it does not already exist.
        const idToken = this._getToken(ctx.ID[0]);
        const id = idToken.image;
        this._checkVarName(id, idToken);
        // Get the logical expression (everything after the '=' sign until optional 'is good/bad')
        let vari = this.visit(ctx.logicalImplExpression[0]) as RuleVariable;
        // If there is an 'is good' or 'is bad'.
        if (ctx.MoralLit !== undefined) {
            const mlToken = this._getToken(ctx.MoralLit[0]);
            const ml = mlToken.image;
            if (ml === 'bad') {
                // Negate the rule.
                vari = createRuleVar(vari.id, Logic.not(vari.data));
            }
            // 'is good' changes nothing.
        } else {
            // defaults to 'is good'.
            vari = createRuleVar(vari.id, vari.data);
        }
        // Add to variable table.
        this.addVariable(id, vari);
    }

    solverDeclaration(ctx: any): void {
        // Get the variable ID and check that it does not already exist.
        const varIdToken = this._getToken(ctx.ID[0]);
        const varId = varIdToken.image;
        // The description of the solver (as a quoted string).

        const metaToken = this._getToken(ctx.QUOTED_STRING[0]);
        const meta = metaToken.image;

        // Check that the variable id is available.
        this._checkVarName(varId, varIdToken);
        this.addVariable(varId, createSolverVar(varId, meta.slice(1, -1)));
    }

    solverStatement(ctx: any): void {
        // Get variable and make sure it is of type solver.
        const idToken = this._getToken(ctx.ID[0]);
        const id = idToken.image;
        const sVari = this.getVariable(id);
        if (sVari === undefined) {
            throw InterpreterJSError.createVarDoesNotExist(id, idToken);
        }
        if (sVari.type !== 'solver') {
            throw InterpreterJSError.create(`Variable ${sVari.id} is not a solver.`, 'TypeError', idToken);
        }
        // If the command is either 'apply' or 'omit', meaning it relates to a rule.
        if (ctx.SolverRuleOP !== undefined) {
            // Get var and check that it is a rule.
            const ruleOP = this._getToken(ctx.SolverRuleOP[0]).image;
            const idToken2 = this._getToken(ctx.ID[1]);
            const id2 = idToken2.image;
            const rVari = this.getVariable(id2);
            if (rVari === undefined) {
                throw InterpreterJSError.createVarDoesNotExist(id2, idToken2);
            }
            if (rVari.type !== 'rule') {
                throw InterpreterJSError.create(`Variable ${rVari.id} is not a rule.`, 'TypeError', idToken2);
            }
            // If it is 'apply', add the rule to 'rules', otherwise for 'omit' add it to 'pruned'.
            if (ruleOP === 'apply') {
                sVari.rules.push(rVari.data);
            } else {
                sVari.pruned.push(rVari.data);
            }
        } else if (ctx.Run !== undefined) {
            // Run.
            this._runSolver(sVari, idToken);
        } else if (ctx.Print !== undefined) {
            // If the command is 'print', make sure that the solver has been run first,
            // so there is something to print.
            const res = sVari.solverResult;
            if (res === undefined) {
                throw InterpreterJSError.create(`Variable ${sVari.id} has no results. It must be run first: 'solver ${sVari.id} run'.`, 'TypeError', idToken);
            }
            // If the solver has been run, push the results to the result list.
            this._solverResults.push(res.results);
        }
    }

    compareStatement(ctx: any): void {
        // Get first variable. Check that it exists, that the variable is a solver,
        // and that the solutions has been computed.
        const idToken = this._getToken(ctx.ID[0]);
        const id = idToken.image;
        const sVari = this.getVariable(id);
        if (sVari === undefined) {
            throw InterpreterJSError.createVarDoesNotExist(id, idToken);
        }
        if (sVari.type !== 'solver') {
            throw InterpreterJSError.create(`Variable ${sVari.id} is not a solver.`, 'TypeError', idToken);
        }
        if (sVari.solverResult === undefined) {
            throw InterpreterJSError.create(`Variable ${sVari.id} has no results, it must be run: 'solver ${sVari.id} run'.`, 'TypeError', idToken);
        }

        // Same thing for second variable.
        const idToken2 = this._getToken(ctx.ID[1]);
        const id2 = idToken2.image;
        const sVari2 = this.getVariable(id2);
        if (sVari2 === undefined) {
            throw InterpreterJSError.createVarDoesNotExist(id2, idToken2);
        }
        if (sVari2.type !== 'solver') {
            throw InterpreterJSError.create(`Variable ${sVari2.id} is not a solver.`, 'TypeError', idToken);
        }
        if (sVari2.solverResult === undefined) {
            throw InterpreterJSError.create(`Variable ${sVari2.id} has no results. It must be run first: 'solver ${sVari2.id} run'.`, 'TypeError', idToken2);
        }

        // Solver variable names and meta.
        const solverID1 = sVari.id;
        const solverMeta1 = sVari.meta;
        const solverID2 = sVari2.id;
        const solverMeta2 = sVari2.meta;

        // Subtype, e.g. 'similarity', 'difference' (only 'similarity' works for now).
        let subtype: CompDataTypeID = 'similarity';

        // The results from each solver.
        const results = sVari.solverResult.results;
        const results2 = sVari2.solverResult.results;

        // if it is a 'similarity' (which it must be for now).
        if (ctx.Sim !== undefined) {
            subtype = 'similarity';

            // Get all the good, bad, and netural states that are common to both solvers.
            const goodStates = getArrsByComp(results.goodStates, results2.goodStates, arrsAreEqual);
            const badStates = getArrsByComp(results.badStates, results2.badStates, arrsAreEqual);
            const neutralStates = getArrsByComp(results.neutralStates, results2.neutralStates, arrsAreEqual);

            // push the data to the comparison list.
            this._compResults.push({
                subtype,
                solverID1,
                solverMeta1,
                solverID2,
                solverMeta2,
                goodStates,
                badStates,
                neutralStates
            });
        } else {
            throw InterpreterJSError.create(`The only supported comparison type is similarity ('sim').`, 'UnsupportedError', idToken);
        }
    }

    program(ctx: any): void {
        // Get all hyp declarations and process them.
        if (ctx.hypDeclaration !== undefined) {
            for (let i = 0; i < ctx.hypDeclaration.length; i++) {
                this.visit(ctx.hypDeclaration[i]);
            }

            // Create an array of all hyp variables for quick access.
            const hyps = [];
            for (const [key, val] of this._varTable) {
                if (val.type === 'hyp') {
                    hyps.push(val);
                }
            }

            // Very unlikely that someone will use 30+ hypotheticals, and Bigints are annoying
            // and slow, and doesn't go well with typescript, so we will restrict this to 30 hyps
            // for now so that we can use safe bit operations.
            // More notes about this in the methods 'this._runSolver' and
            // 'this._computeAndAddResults' below.
            if (hyps.length > 30) {
                throw InterpreterJSError.create(`The maximum number of hypotheticals supported is 30`, 'UnsupportedError', dummyToken);
            }

            this._hyps = hyps;
            const numHyps = hyps.length;
            // Create power-of-two array for doing some math later on.
            const po2: number[] = new Array(numHyps);
            for (let i = 0; i < numHyps; i++) {
                po2[i] = 1 << i;
            }
            this._po2 = po2;
        } else {
            // If there are no hyps, the system will not work.
            throw InterpreterJSError.create(`A system must consist of at least one hypothetical.`, 'EvalError', dummyToken);
        }

        // Rule declarations.
        if (ctx.ruleDeclaration !== undefined) {
            for (let i = 0; i < ctx.ruleDeclaration.length; i++) {
                this.visit(ctx.ruleDeclaration[i]);
            }
        }

        // Solver declarations
        if (ctx.solverDeclaration !== undefined) {
            for (let i = 0; i < ctx.solverDeclaration.length; i++) {
                this.visit(ctx.solverDeclaration[i]);
            }
        }

        // Solver statements ('solver run', 'solver apply', etc.)
        if (ctx.solverStatement !== undefined) {
            for (let i = 0; i < ctx.solverStatement.length; i++) {
                this.visit(ctx.solverStatement[i]);
            }
        }

        // Comparison statements.
        if (ctx.compareStatement !== undefined) {
            for (let i = 0; i < ctx.compareStatement.length; i++) {
                this.visit(ctx.compareStatement[i]);
            }
        }
    }

    // Run a solver. TODO split up better
    _runSolver(vari: SolverVariable, token: IToken): void {
        // Check that it hasn't already been run.
        if (vari.solverResult !== undefined) {
            throw InterpreterJSError.create(`Solver '${vari.id}' has already been run.`, 'OperatorError', token);
        }
        console.log(vari.rules.length);
        // Check that at least one rule has been applied.
        if (vari.rules.length === 0) {
            throw InterpreterJSError.create(`Solver '${vari.id}' has no applied rules.`, 'OperatorError', token);
        }
        // Instantiate two Solvers
        const solverRes = new Logic.Solver();
        const solverCon = new Logic.Solver();

        // Add the list of rules.
        for (let i = 0; i < vari.rules.length; i++) {
            const rule = vari.rules[i];
            solverRes.require(rule);
        }

        // If there are any neutral rules, load up the neutral solver as well.
        if (vari.pruned.length > 0) {
            for (let i = 0; i < vari.pruned.length; i++) {
                const rule = vari.pruned[i];
                solverCon.require(rule);
            }
        }

        // First run the solver for the good/bad solutions unconstrained.
        const solutionsRes = solve(solverRes, this._ec);
        // TODO
        if (this._ec.aborted) {
            throw InterpreterJSError.create(`Execution of solver aborted`, 'EvalError', token);
        }
        // The run the one for the neutral constraints.
        let solutionsCon: Set<string>[] = [];
        if (vari.pruned.length > 0) {
            solutionsCon = solve(solverCon, this._ec);
        }

        // TODO
        if (this._ec.aborted) {
            throw InterpreterJSError.create(`Execution of solver aborted`, 'EvalError', token);
        }

        // Now we figure out what the good solutions are within the given constraints.
        // To get full information about which solutions are removed by the neutral
        // rules we ran two solvers:
        // 'solutionsRes' was run with the normal rules.
        // 'solutionsCon' was run with the neutral rules.
        //
        // The reason is that if we ran it with normal rules using 'Solver.require' and added
        // the neutral constraints using 'Solver.forbid' and we would not know how many
        // states are actually neutral, and how many good/bad rules were actually filtered
        // out by the neutral rules.
        //
        // By running a solver with the neutral rules only, we find all the states (solutions)
        // that are produced by those rules. The set of those solutions we can call 'N'.
        // Then we run a solver with the normal rules and see what those states are: 'R'.
        // The good states that would be filtered out by the neutral states must then be the
        // intersection of those two sets, meaning the good states that would remain after
        // filtering is: 'G = R \ (R ∩ N)'
        // Finally, if the set of all possible states is 'U' we get the bad states as: 'B = U \ G \ N'
        // (G and N always being disjoint because of how 'G' is computed).
        //
        // Some of these computations are done in this method, and some in a method that this
        // method calls in turn.

        let goodSolutions: Set<string>[] = [];

        // If there are no neutral solutions, the good states will be
        // exactly those produced from 'solutionsRes'.
        if (solutionsCon.length === 0) {
            goodSolutions = solutionsRes;
        } else {
            // Add all solutions from 'solutionsRes' to 'goodSolutions', except
            // those that appear in 'solutionsCon' (i.e. the set of neutral constraints).
            for (let i = 0; i < solutionsRes.length; i++) {
                const set1 = solutionsRes[i];
                let has = false;
                for (let j = 0; j < solutionsCon.length; j++) {
                    if (setsAreEqual(set1, solutionsCon[j])) {
                        has = true;
                        break;
                    }
                }
                if (!has) {
                    goodSolutions.push(set1);
                }
            }
        }

        // The rest of the computation is done in a separate method. We pass it the
        // solver variable, the two solver objects, and the good and neutral solutions.
        this._computeAndAddResults(vari, solverRes, solverCon, goodSolutions, solutionsCon);
    }

    // TODO split up
    private _computeAndAddResults(
        solverVar: SolverVariable,
        solverRes: any,
        solverCon: any,
        goodSolutions: Set<string>[],
        // previously 'solutionsCon'.
        neutralSolutions: Set<string>[]): void {

        const hyps = this._hyps;

        const solverID = solverVar.id;
        const solverMeta = solverVar.meta;
        let categoryMoral: MoralCategory;
        let categoryAmoral: AmoralCategory;

        // Total number of hypotheticals.
        const numHyps = hyps.length;

        // Total number of possible states/cases.
        const numCases = Math.pow(2, numHyps);

        const numNeutralCases = neutralSolutions.length;
        const numGoodBadCases = numCases - numNeutralCases;
        const numGoodCases = goodSolutions.length;
        const numBadCases = numGoodBadCases - numGoodCases;

        const aLevel: [number, number] = [numNeutralCases, numCases];
        let mBalance: [number, number] | undefined = undefined;
        let mEntropy: number | undefined = undefined;
        let mEntropyNorm: number | undefined = undefined;
        let mEntropyScale: [number, number] | undefined = undefined;

        // Morality
        if (numGoodBadCases === 0) {
            categoryMoral = 'indeterminable';
        } else if (numGoodCases === numGoodBadCases) {
            categoryMoral = 'absolutely permissive';
        } else if (numGoodCases === numBadCases) {
            categoryMoral = 'balanced';
        } else if (numGoodCases === 0) {
            categoryMoral = 'absolutely forbidding';
        } else if (numGoodCases > numBadCases) {
            categoryMoral = 'permissive';
        } else {
            categoryMoral = 'forbidding';
        }

        // Amorality
        const casesHalf = numCases / 2;
        if (numNeutralCases === numCases) {
            categoryAmoral = 'indeterminable';
        } else if (numNeutralCases === numCases) {
            categoryAmoral = 'absolutely amoral';
        } else if (numNeutralCases === casesHalf) {
            categoryAmoral = 'balanced';
        } else if (numNeutralCases === 0) {
            categoryAmoral = 'absolutely moral';
        } else if (numNeutralCases > casesHalf) {
            categoryAmoral = 'amoral';
        } else {
            categoryAmoral = 'moral';
        }

        // Balance of good and bad, and entropy.

        // 'numGoodBadCases === 0' is already taken care of by setting all values to 'undefined'
        if (numGoodBadCases > 1) {
            // This case automatically ensures that
            mBalance = [numGoodCases, numGoodBadCases];

            if (numGoodCases !== 0 && numBadCases !== 0) {
                const badVal = numBadCases / numGoodBadCases;
                const goodVal = numGoodCases / numGoodBadCases;
                mEntropy = -badVal * Math.log2(badVal) - goodVal * Math.log2(goodVal);

                const lowL = 1 / numGoodBadCases;
                const highL = 1 - lowL;
                const ELow = -lowL * Math.log2(lowL) - highL * Math.log2(highL);

                if (numGoodBadCases % 2 === 0) {
                    mEntropyScale = [ELow, 1];
                } else {
                    const lowH = (numGoodBadCases - 1) / 2 / numGoodBadCases;
                    const highH = (numGoodBadCases + 1) / 2 / numGoodBadCases;
                    const EHigh = -lowH * Math.log2(lowH) - highH * Math.log2(highH);
                    mEntropyScale = [ELow, EHigh];
                }

                if (mEntropyScale[0] === mEntropyScale[1]) {
                    mEntropyNorm = 0;
                } else {
                    mEntropyNorm = (mEntropy - mEntropyScale[0]) / (mEntropyScale[1] - mEntropyScale[0]);
                }
            }
        }

        // From here on we will convert the solutions (good and neutral) to 2d string
        // arrays rather then arrays of sets of strings, and replace the variable names
        // with their meta text (for true or false), which is how they will be presented.
        // We will also use the good and neutral solutions to find what the bad solutions
        // are.
        const goodStates: string[][] = [];
        const neutralStates: string[][] = [];
        const badStates: string[][] = [];

        // Used to track which of the possible states are good or neutral, so we can find
        // out which states are left (which would be the bad ones).
        const bitSet: Set<number> = new Set();
        // Pre-computed powers of 2
        const po2 = this._po2;

        // Create the good states from the hyp metas.
        for (let i = 0; i < goodSolutions.length; i++) {
            const res: string[] = new Array(numHyps);
            const gs = goodSolutions[i];
            let bits = 0;
            for (let j = 0; j < hyps.length; j++) {
                const hypVar = hyps[j];
                if (gs.has(hypVar.id)) {
                    res[j] = hypVar.meta[0];
                    // Also add this state to the bitset as occupied.
                    bits |= po2[j];
                } else {
                    res[j] = hypVar.meta[1];
                }
            }
            bitSet.add(bits);
            goodStates.push(res);
        }

        // Create the neutral cases. Same as for good states.
        for (let i = 0; i < neutralSolutions.length; i++) {
            const res: string[] = new Array(numHyps);
            const cons = neutralSolutions[i];
            let bits = 0;
            for (let j = 0; j < hyps.length; j++) {
                const hypVar = hyps[j];
                if (cons.has(hypVar.id)) {
                    res[j] = hypVar.meta[0];
                    bits |= po2[j];
                } else {
                    res[j] = hypVar.meta[1];
                }
            }
            neutralStates.push(res);
            bitSet.add(bits);
        }

        // Create the bad cases. Just go over all possible states, check if
        // the state is taken (i.e. good or neutral), and if not, add it to
        // the list of bad states.
        for (let i = 0; i < numCases; i++) {
            const res: string[] = [];
            if (!bitSet.has(i)) {
                for (let j = 0; j < numHyps; j++) {
                    if (i & po2[j]) {
                        res[j] = hyps[j].meta[0];
                    } else {
                        res[j] = hyps[j].meta[1];
                    }
                }
                badStates.push(res);
            }
        }


        // Get string representation of the rules - both ordinary rules and neutrals.
        const formulaRes = formulaToString(solverVar.rules, 'and').slice(1, -1);
        const formulaCon = formulaToString(solverVar.pruned, 'and').slice(1, -1);

        // We convert the variable mappings to an array since the solver results
        // is a presentation object, and we want it to map directly to JSON.
        // Also we want the hyps themselves as a plain array of strings.
        const hypArr: [string, string, string][] = new Array(hyps.length);
        for (let i = 0; i < hyps.length; i++) {
            const hyp = hyps[i];
            const hypID = hyp.id;
            hypArr[i] = [hypID, hyp.meta[0], hyp.meta[1]];
        }

        // Finally we create the results object.

        const results: ResultDataSolver = {
            solverID,
            solverMeta,
            categoryMoral,
            categoryAmoral,
            mBalance,
            aLevel,
            mEntropy,
            mEntropyNorm,
            mEntropyScale,
            numHyps,
            numCases,
            goodStates,
            neutralStates,
            badStates,
            hyps: hypArr,
            formulaRes,
            formulaCon
        };

        solverVar.solverResult = {solverRes, solverCon, results};
    }

    private _checkVarName(varId: string, token: IToken): void {
        if (this.hasVariable(varId)) {
            throw InterpreterJSError.createVarAlreadyExists(varId, token);
        }
        if (this._keywords.has(varId)) {
            throw InterpreterJSError.createReservedName(varId, token);
        }
    }

    private _getToken(ctx: any): IToken {
        if (ctx.tokenType === undefined) {
            throw new Error('BUG: Trying to use a non-token as a token.');
        }
        return ctx;
    }

    public addVariable(id: string, vari: Variable): boolean {
        if (this._varTable.has(id)) {
            return false;
        }
        this._varTable.set(id, vari);
        return true;
    }

    public getVariable(id: string): Variable | undefined {
        return this._varTable.get(id);
    }

    public hasVariable(id: string): boolean {
        return this._varTable.has(id);
    }

    public varTable(): Map<string, Variable> {
        return this._varTable;
    }

    interpret(script: string, ec: ExecutionController): InterpreterResult {
        this._varTable = new Map<string, Variable>();
        this._consoleMessages = [];
        this._hyps = [];
        this._solverResults = [];
        this._compResults = [];
        this._ec = ec;

        const pRes = parser.parse(script);
        let ret = false;
        if (pRes.parseErrors.length === 0 && pRes.lexErrors.length === 0) {
            try {
                ret = this.visit(pRes.cst) as boolean;
            } catch (err) {
                console.log(err);
                if ('data' in err) {
                    const e = err as InterpreterJSError;
                    const errObj: ConsoleMessage = {
                        type: 'error',
                        eType: 'InterpreterError',
                        subType: e.data.type,
                        line: e.data.token && e.data.token.startLine && !isNaN(e.data.token.startLine) ? e.data.token.startLine : undefined,
                        lineOffset: e.data.token && e.data.token.startOffset && !isNaN(e.data.token.startOffset) ? e.data.token.startOffset : undefined,
                        column: e.data.token && e.data.token.startColumn && !isNaN(e.data.token.startColumn) ? e.data.token.startColumn : undefined,
                        message: err.message
                    };
                    this._consoleMessages.push(errObj);
                } else {
                    const errObj: ConsoleMessage = {
                        type: 'error',
                        eType: 'JSError',
                        subType: err.name,
                        line: -1,
                        lineOffset: -1,
                        column: -1,
                        message: err.message
                    };
                    this._consoleMessages.push(errObj);
                }
            }
        } else {
            for (let i = 0; i < pRes.lexErrors.length; i++) {
                const err = pRes.lexErrors[i];
                const errObj: ConsoleMessage = {
                    type: 'error',
                    eType: 'LexerError',
                    subType: 'TokenizationError',
                    line: err.line,
                    lineOffset: err.offset,
                    column: err.column,
                    message: err.message
                };
                this._consoleMessages.push(errObj);
            }
            for (let i = 0; i < pRes.parseErrors.length; i++) {
                const err = pRes.parseErrors[i];
                const errObj: ConsoleMessage = {
                    type: 'error',
                    eType: 'ParserError',
                    subType: err.name,
                    line: err.token.startLine,
                    lineOffset: err.token.startOffset,
                    column: err.token.startColumn,
                    message: err.message
                };
                this._consoleMessages.push(errObj);
            }
        }
        return {
            ret,
            messages: this._consoleMessages,
            solverResults: this._solverResults,
            compResults: this._compResults
        };
    }
}

const solve = (solver: any, ec: ExecutionController): Set<string>[] => {

    const solutions: Set<string>[] = [];
    let done = false;
    do {
        const curSol = solver.solve();

        if (curSol === null) {
            done = true;
        } else {
            solutions.push(new Set(curSol.getTrueVars()));
            solver.forbid(curSol.getFormula());
        }
    } while (!done && !ec.aborted);
    return solutions;
};

const setsAreEqual = (s1: Set<string>, s2: Set<string>) => {
    if (s1.size !== s2.size) {
        return false;
    }
    for (const e of s1) {
        if (!s2.has(e)) {
            return false;
        }
    }
    return true;
};

const arrsAreEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
};

const getArrsByComp = (arr1: string[][], arr2: string[][], comp: (a1: string[], a2: string[]) => boolean): string[][] => {
    const res: string[][] = [];
    for (let i = 0; i < arr1.length; i++) {
        const e = arr1[i];
        for (let j = 0; j < arr2.length; j++) {
            if (comp(e, arr2[j])) {
                res.push(e);
                break;
            }
        }
    }
    return res;
};

const formulaToString = (formulas: any, logic: string): string => {
    let str = '(';

    for (let i = 0; i < formulas.length; i++) {
        let op = formulas[i];
        if (typeof op === 'string') {
            let idx = 0;
            while (op[idx] === '-' && idx < op.length) {
                idx++;
            }
            op = `${idx % 2 === 1 ? 'not ' : ''}${op.slice(idx)}`;
            str += op;
        } else if (op instanceof Array) {
            str += ` ${formulaToString(op, 'and')} `;
        } else { // Must be an object of type Logic.xxx
            // TODO go over all cases.
            if (op.type === 'not') {
                str += 'not';
                console.log(op);
                str += ` ${formulaToString([op.operand], 'not')} `;
            } else {
                str += ` ${formulaToString(op.operands, op.type)} `;
            }
        }

        if (i + 1 < formulas.length)
            str += ` ${logic} `;

    }

    str += ')';
    return str;
};

const nameToFormatted = (name: string): string => {
    if (name === 'and') {
        return 'And';
    } else if (name === 'or') {
        return 'Or';
    } else if (name === 'xor') {
        return 'Xor';
    } else {
        return 'Implies';
    }
};
