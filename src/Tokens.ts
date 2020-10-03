import { ITokenConfig, Lexer, TokenType, createToken } from 'chevrotain';

export const allTokens: TokenType[] = [];

function createChevToken (options: ITokenConfig) {
    const newToken = createToken(options);
    allTokens.push(newToken);
    return newToken;
}

createChevToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

createChevToken({
    name: 'Comment',
    pattern: /\/\/[^\n\r]*/,
    group: Lexer.SKIPPED
});

createChevToken({
    name: 'MultiLineComment',
    pattern: /\/\*.?\*\//,
    group: Lexer.SKIPPED,
    line_breaks: true
});

// Groups
export const TKeyword = createChevToken({ name: 'Keyword', pattern: Lexer.NA });
export const TLogicalOP = createChevToken({ name: 'LogicalOP', pattern: Lexer.NA });
export const TBoolLit = createChevToken({ name: 'BoolLit', pattern: Lexer.NA });
export const TMoralLit = createChevToken({ name: 'MoralLit', pattern: Lexer.NA });
export const TSolverRuleOP = createChevToken({ name: 'SolverRuleOP', pattern: Lexer.NA });

// Declarations
export const THyp = createChevToken({ name: 'Hyp', pattern: /hyp/, categories: [TKeyword] });
export const TRule = createChevToken({ name: 'Rule', pattern: /rule/, categories: [TKeyword] });
export const TSolver = createChevToken({ name: 'Solver', pattern: /solver/, categories: [TKeyword] });
export const TDef = createChevToken({ name: 'Def', pattern: /=/, categories: [TKeyword] });

// Rule members
export const TTrue = createChevToken({ name: 'True', pattern: /true/, categories: [TBoolLit] });
export const TPos = createChevToken({ name: 'Pos', pattern: /pos/, categories: [TBoolLit] });
export const TFalse = createChevToken({ name: 'False', pattern: /false/, categories: [TBoolLit] });
export const TNeg = createChevToken({ name: 'Neg', pattern: /neg/, categories: [TBoolLit] });
export const TEither = createChevToken({ name: 'Either', pattern: /either/, categories: [TBoolLit] });

// Solver ops
export const TApply = createChevToken({ name: 'Apply', pattern: /apply/, categories: [TKeyword, TSolverRuleOP] });
export const TOmit = createChevToken({ name: 'Omit', pattern: /omit/, categories: [TKeyword, TSolverRuleOP] });
export const TRun = createChevToken({ name: 'Run', pattern: /run/, categories: [TKeyword] });
export const TCompare = createChevToken({ name: 'Compare', pattern: /compare/, categories: [TKeyword] });
export const TPrint = createChevToken({ name: 'Print', pattern: /print/, categories: [TKeyword] });

// Comparison ops
export const TSim = createChevToken({ name: 'Sim', pattern: /sim/, categories: [TKeyword] });
//export const TDiff = createChevToken({ name: 'Diff', pattern: /diff/, categories: [TKeyword] });

// Rules, moral modifiers
export const TIs = createChevToken({ name: 'Is', pattern: /is/, categories: [TKeyword] });
export const TGood = createChevToken({ name: 'Good', pattern: /good/, categories: [TKeyword, TMoralLit] });
export const TBad = createChevToken({ name: 'Bad', pattern: /bad/, categories: [TKeyword, TMoralLit] });

// Logical operators
export const TOr = createChevToken({ name: 'Or', pattern: /or/, categories: [TKeyword, TLogicalOP] });
export const TXor = createChevToken({ name: 'XOr', pattern: /xor/, categories: [TKeyword, TLogicalOP] });
export const TAnd = createChevToken({ name: 'And', pattern: /and/, categories: [TKeyword, TLogicalOP] });
export const TImpl = createChevToken({ name: 'Impl', pattern: /impl/, categories: [TKeyword, TLogicalOP] });
export const TEq = createChevToken({ name: 'Eq', pattern: /eq/, categories: [TKeyword] });

// Misc
export const TLParen = createChevToken({ name: 'LParen', pattern: /\(/ });
export const TRParen = createChevToken({ name: 'RParen', pattern: /\)/ });
export const TLCurly = createChevToken({ name: 'LCurly', pattern: /{/ });
export const TRCurly = createChevToken({ name: 'RCurly', pattern: /}/ });
export const TDot = createChevToken({ name: 'Dot', pattern: /\./ });

// ID
export const TID = createChevToken({ name: 'ID', pattern: /[A-Za-z_]+\w*/ });

// Quoted strings
export const TQUOTED_STRING = createChevToken({
    name: 'QUOTED_STRING',
    // @ts-ignore
    pattern: matchQuotedString,
    line_breaks: true,
    start_chars_hint: [`'`, '"', '`']
});

function matchQuotedString (text: string, startOffset: number) {
    let endOffset = startOffset;
    const char = text[endOffset++];

    if (char !== '"' && char !== `'` && char !== '`') {
        return null;
    }

    if (char === '`') {
        while (endOffset < text.length && text[endOffset] !== char) {
            endOffset++;
        }
    } else {
        while (endOffset < text.length && text[endOffset] !== char) {
            if (text[endOffset] === '\n' || text[endOffset] === '\r') {
                return null;
            }
            endOffset++;
        }
    }

    if (endOffset === text.length) {
        return null;
    } else {
        const matchedString = text.substring(startOffset, endOffset + 1);
        return [matchedString];
    }
}

export const allKeywords: string[] = [];

for (const token of allTokens) {
    if (token.CATEGORIES !== undefined) {
        for (const cat of token.CATEGORIES) {
            if (cat.name === 'Keyword') {
                allKeywords.push((token.PATTERN as any).source);
                break;
            }
        }
    }
}

// TODO
export const keywordSet = (): ReadonlySet<string> => {
    return new Set<string>(allKeywords);
};
