/**
 * A template for generating syntax diagrams html file.
 * See: https://github.com/SAP/chevrotain/tree/master/diagrams for more details
 *
 */

import * as path from 'path';
import {writeFileSync} from 'fs';
import {createSyntaxDiagramsCode} from 'chevrotain';
import {parser} from '../Parser.js';

export const generateGrammar = () => {
    const serializedGrammar = parser.getSerializedGastProductions();

    // create the HTML Text
    const htmlText = createSyntaxDiagramsCode(serializedGrammar);

    // Write the HTML file to disk
    const outPath = path.resolve(__dirname, './');
    console.log(outPath);
    writeFileSync(outPath + '/Grammar.html', htmlText);
};

generateGrammar();
