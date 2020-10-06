<template>
    <md-card>
        <md-card-header>
            <div class="md-title">Comparison</div>
            <div class="md-subhead">{{result.subtype}}</div>
        </md-card-header>
        <md-card-content>
            <h3>Solver 1: {{result.solverID1}} ({{result.solverMeta1}})</h3>
            <h3>Solver 2: {{result.solverID2}} ({{result.solverMeta2}})</h3>
            <div class="md-body-2">Morally Good States</div>
            <md-list>
                <md-list-item
                    class="statelist"
                    v-for="(goodState, idx) in result.goodStates" v-bind:key="idx">
                    <div class="chiplist">
                        <md-chip class="md-primary greenchip"
                                 v-for="(state, idxInner) in goodState" :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
            <div class="md-body-2">Morally Bad States</div>
            <md-list>
                <md-list-item
                    class="statelist"
                    v-for="(badState, idx) in result.badStates" v-bind:key="idx">
                    <div class="chiplist">
                        <md-chip class="md-primary redchip"
                                 v-for="(state, idxInner) in badState" :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
            <div class="md-body-2">Morally Neutral States</div>
            <md-list>
                <md-list-item
                    class="statelist"
                    v-for="(neutralState, idx) in result.neutralStates" v-bind:key="idx">
                    <div class="chiplist">
                        <md-chip class="md-primary bluechip" v-for="(state, idxInner) in neutralState"
                                 :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
            <md-switch v-model="additionalInfo" class="md-primary">Additional information</md-switch>
        </md-card-content>
        <div v-if="additionalInfo">
            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{ Math.round(100*result.similarity) + '%' }}</div>
                        <div class="md-subhead">Similarity</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The similiarity is the number of states that the two solvers has in common, divided by the number of total states. If the two solver has no states in common, the similarity would be 0%, and if a solver was compared to itself, the similiarity would be 100%.
                    </p>
                </md-card-content>
            </md-card>
            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">Formulas</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <h3>Formula for Good/Bad</h3>
                    <div style="overflow-x: auto">{{ result.formulaRes }}</div>
                    <h3>Formula for Neutral</h3>
                    <div style="overflow-x: auto">{{ result.formulaCon }}</div>
                </md-card-content>
            </md-card>
        </div>
    </md-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";
import {ResultDataComp} from "../Interpreter";

@Component
export default class Result extends Vue {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Prop({
        default: () => {
        }
    }) result: ResultDataComp | undefined;

    private additionalInfo = false;
}

</script>

<style scoped>

</style>

