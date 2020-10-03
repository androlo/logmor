<template>
    <div>
        <md-card style="background-color: #f5f5f5; margin-bottom: 0.5em;">
            <md-card-content>
                <div class="md-display-2 mainTitle" style="margin-bottom: 0.3em;text-align: center; color: #474747">
                    Logical Morality
                </div>
                <div class="md-layout" style="margin-bottom: 0.5em;">
                    <div class="md-layout-item md-size-15">
                        <v-select v-model="theme" :clearable="false" id="theme" @input="themeSelected"
                                  :options="themeOptions"></v-select>
                    </div>
                </div>
                <div>
                    <textarea id="ide"></textarea>
                </div>
            </md-card-content>
            <md-card-actions>
                <md-button :disabled="isEvaluating" @click="submitEvaluate">Evaluate</md-button>
                <md-button :disabled="isEvaluating" @click="submitClear">Clear</md-button>
            </md-card-actions>
        </md-card>
        <md-card style="background-color: #f5f5f5;">
            <md-card-header>
                <div class="md-display-1">Output</div>
            </md-card-header>
            <md-card-content>
                <div v-if="logOutput.length > 0" class="list">
                    <div class="output">
            <span class="outputItem" v-for="(str, idx) in logOutput" v-bind:key="idx">
              : {{ str }}
            </span>
                    </div>
                </div>
                <div v-if="solverResults.length > 0" style="padding-top: 1em;">
                    <div v-for="(data, key) in solverResults" v-bind:key="key">
                        <Result v-bind:result="data" style="margin-bottom: 0.5em;"></Result>
                    </div>
                </div>
                <div v-if="compResults.length > 0">
                    <div v-for="(data, key) in compResults" v-bind:key="key">
                        <Comp v-bind:result="data" style="margin-bottom: 0.5em;"></Comp>
                    </div>
                </div>
            </md-card-content>
        </md-card>
        <md-dialog :md-active.sync="isEvaluating">
            <md-dialog-title>Evaluating Script</md-dialog-title>
            <div style="padding: 1em;">
                <p v-if="!abortingEval">Running (may take a while) ... </p>
                <p v-if="printingOutput">Printing (may freeze the window for large datasets) ... </p>
                <p v-if="abortingEval">Aborting (may take a little while) ... </p>
                <md-progress-bar md-mode="indeterminate"></md-progress-bar>
            </div>
            <md-dialog-actions>
                <md-button class="md-primary" @click="abortEval()">Abort</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from "vue-class-component";
import CodeMirror from 'codemirror';
import '../cm_modes/lcc';
import Interpreter, {ResultDataSolver, ResultDataComp, ExecutionController} from "../Interpreter";
import Result from "./Result.vue";
import Comp from "./Comp.vue";
import vSelect from 'vue-select';

type Theme = {
    name: string,
    label: string
}

const EDITOR_CONTENT_COOKIE = "LogMor.EditorContent";
const EDITOR_THEME_COOKIE = "LogMor.EditorTheme";

let executionController: ExecutionController | undefined;

@Component({
    components: {
        Comp,
        Result,
        vSelect
    }
})
export default class LogMor extends Vue {

    private logOutput: string[] = [];
    private solverResults: ResultDataSolver[] = [];
    private compResults: ResultDataComp[] = [];
    private ide: any;
    private isEvaluating = false;
    private abortingEval = false;
    private printingOutput = false;
    private theme = this.initTheme();
    readonly themeOptions = THEME_OPTIONS;

    private initTheme(): Theme {
        const theme = Vue.$cookies.get(EDITOR_THEME_COOKIE);
        if (theme && 'name' in theme) {
            return theme;
        } else {
            return {name: 'mbo', label: 'MBO'};
        }
    }

    themeSelected(theme: Theme) {
        this.ide.setOption('theme', theme.name);
        Vue.$cookies.set(EDITOR_THEME_COOKIE, theme);
    }

    mounted() {
        this.ide = CodeMirror.fromTextArea(document.getElementById("ide"),
            {
                lineNumbers: true,
                tabSize: 2,
                lineWrapping: true,
                theme: this.theme.name,
                mode: "lcc"
            });
        const that = this;
        this.ide.setOption("extraKeys", {
            'Ctrl-Enter': function () {
                that.submitEvaluate();
            }
        });
        this.ide.setSize(null, 500);
        const cookieTxt = Vue.$cookies.get(EDITOR_CONTENT_COOKIE);
        if (cookieTxt && typeof cookieTxt === 'string') {
            this.ide.setValue(cookieTxt);
        } else {
            this.ide.setValue(JERY_AND_GERGE);
            Vue.$cookies.set(EDITOR_CONTENT_COOKIE, JERY_AND_GERGE);
        }
    }

    submitEvaluate() {
        if (this.isEvaluating) {
            return;
        }
        this.isEvaluating = true;
        executionController = new ExecutionController();
        this.abortingEval = false;

        this.logOutput = [];
        this.solverResults = [];
        this.compResults = [];

        const text = this.ide.getValue();
        if (text.replace(/\s/g, '') === '') {
            return;
        }
        this.evaluate(text);
        Vue.$cookies.set(EDITOR_CONTENT_COOKIE, this.ide.getValue());
    }

    evaluate(text: string) {
        // TODO maybe some webworker stuff...
        setTimeout(() => {
            const ret = new Interpreter().interpret(text, executionController as ExecutionController);
            let str: string[] = [];
            for (const item of ret.messages) {
                if (item.type === 'solver') {
                    str.push(item.message);
                } else {
                    if (item.line) {
                        str.push(`${item.subType} (line: ${item.line}): ${item.message}`);
                    } else {
                        str.push(`${item.subType}: ${item.message}`);
                    }
                }
            }
            this.logOutput = str;
            this.solverResults = ret.solverResults;
            this.compResults = ret.compResults;
            this.printingOutput = true;
            this.$nextTick(() => {
                executionController = undefined;
                this.abortingEval = false;
                this.printingOutput = false;
                this.isEvaluating = false;
            });
        }, 100);
    }

    submitClear() {
        if (this.isEvaluating) {
            return;
        }
        this.logOutput = [];
        this.solverResults = [];
        this.compResults = [];
        this.ide.setValue('');
        Vue.$cookies.set(EDITOR_CONTENT_COOKIE, '');
    }

    abortEval() {
        if (this.isEvaluating && !this.abortingEval) {
            console.log("(abort successful)");
            this.abortingEval = true;
            (executionController as ExecutionController).aborted = true;
        }
    }

}

const THEME_OPTIONS = [
    {name: '3024-day', label: '3024 (day)'},
    {name: '3024-night', label: '3024 (night)'},
    {name: 'abcdef', label: 'Abcdef'},
    {name: 'ambiance', label: 'Ambiance'},
    {name: 'ambiance-mobile', label: 'Ambiance (mobile)'},
    {name: 'ayu-dark', label: 'Ayu (dark)'},
    {name: 'ayu-mirage', label: 'Ayu (mirage)'},
    {name: 'base16-dark', label: 'Base16 (dark)'},
    {name: 'base16-light', label: 'Base16 (light)'},
    {name: 'bespin', label: 'Bespin'},
    {name: 'blackboard', label: 'Blackboard'},
    {name: 'cobalt', label: 'Cobalt'},
    {name: 'colorforth', label: 'Color-forth'},
    {name: 'darcula', label: 'Darcula'},
    {name: 'dracula', label: 'Dracula'},
    {name: 'duotone-dark', label: 'Duotone (dark)'},
    {name: 'duotone-light', label: 'Duotone (light)'},
    {name: 'eclipe', label: 'Eclipse'},
    {name: 'elegant', label: 'Elegant'},
    {name: 'erlang-dark', label: 'Erlang (dark)'},
    {name: 'gruvbox-dark', label: 'Gruvbox (dark)'},
    {name: 'hopscotch', label: 'Hopscotch'},
    {name: 'icecoder', label: 'Icecoder'},
    {name: 'idea', label: 'IDEA'},
    {name: 'isotope', label: 'Isotope'},
    {name: 'lesser-dark', label: 'Lesser (dark)'},
    {name: 'liquibyte', label: 'Liquibyte'},
    {name: 'lucario', label: 'Lucario'},
    {name: 'material', label: 'Material'},
    {name: 'material-darker', label: 'Material (darker)'},
    {name: 'material-ocean', label: 'Material (ocean)'},
    {name: 'material-palenight', label: 'Material (pale night)'},
    {name: 'mbo', label: 'MBO'},
    {name: 'mdn-like', label: 'MDN-like'},
    {name: 'midnight', label: 'Midnight'},
    {name: 'monokai', label: 'Monokai'},
    {name: 'moxer', label: 'Moxer'},
    {name: 'neat', label: 'Neat'},
    {name: 'neo', label: 'Neo'},
    {name: 'night', label: 'Night'},
    {name: 'nord', label: 'Nord'},
    {name: 'oceanic-next', label: 'Oceanic Next'},
    {name: 'panda-syntax', label: 'Panda Syntax'},
    {name: 'paraiso-dark', label: 'Paraiso (dark)'},
    {name: 'paraiso-light', label: 'Paraiso (light)'},
    {name: 'pastel-on-dark', label: 'Pastel-on-dark'},
    {name: 'railscasts', label: 'Railscasts'},
    {name: 'rubyblue', label: 'Ruby Blue'},
    {name: 'seti', label: 'SETI'},
    {name: 'shadowfox', label: 'Shadowfox'},
    {name: 'solarized', label: 'Solarized'},
    {name: 'ssms', label: 'SSMS'},
    {name: 'the-matrix', label: 'The Matrix'},
    {name: 'tomorrow-night-bright', label: 'Tomorrow Night (bright)'},
    {name: 'tomorrow-night-eighties', label: 'Tomorrow Night (eighties)'},
    {name: 'ttcn', label: 'TTCN'},
    {name: 'twilight', label: 'Twilight'},
    {name: 'vibrant-ink', label: 'Vibrant Ink'},
    {name: 'xq-dark', label: 'XQ (dark)'},
    {name: 'xq-light', label: 'XQ (light)'},
    {name: 'yeti', label: 'Yeti'},
    {name: 'yonce', label: 'Yonce'},
    {name: 'zenburn', label: 'Zenburn'}
];

const JERY_AND_GERGE = `// Fairness in receiving gifts.

// 1. Gerge and Jery may or may not receive IPADS
hyp GergeIPAD "Gerge get IPAD" "Gerge don't get IPAD"
hyp JeryIPAD \t"Jery get IPAD"  "Jery don't get IPAD"

// 2. Gerges reaction to him and Jery receiving, or not receiving, IPADs.
hyp GergeMood "Gerge becomes happy" "Gerge becomes sad"

// If both gets an IPAD, Gerge should be happy.
rule BothGetRule = GergeIPAD.pos and JeryIPAD.pos and GergeMood.pos is good

// If one of them gets an IPAD but not the other, Gerge should be sad.
rule MoodRuleOnlyOne = (GergeIPAD.pos xor JeryIPAD.pos) and GergeMood.neg is good

// The two rules above combined into one.
rule MoodRule = BothGetRule or MoodRuleOnlyOne

// If neither of the two gets an IPAD we will be indifferent - regardless of Gerge's mood.
rule IPADIndifferenceRule = GergeIPAD.neg and JeryIPAD.neg and GergeMood.either

solver GergeSolver "My Gerge solver"

// Apply the fairness rule.
solver GergeSolver apply MoodRule

// Omit the cases that we are indifferent to.
solver GergeSolver omit IPADIndifferenceRule

// Run the solver
solver GergeSolver run

// Print the results
solver GergeSolver print`;

</script>

<style>

@import '~vue-select/dist/vue-select.css';

.output {
    border-style: solid;
    border-width: 1px;
    border-color: #e0e0e0;
    overflow: scroll;
    font-family: monospace, monospace;
    background-color: #2c2827;
    color: #bfd4d4;
}

.outputItem {
    padding-left: 1em;
    display: block;
    white-space: pre-line;
}
</style>
