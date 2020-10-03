<template>
    <md-card>
        <md-card-header>
            <md-card-header-text>
                <div class="md-title">{{ result.solverID }}</div>
                <div class="md-subhead">{{ result.solverMeta }}</div>
            </md-card-header-text>
        </md-card-header>
        <md-card-content>
            <div class="md-body-2">Morally Good States</div>
            <md-list>
                <md-list-item
                    style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;"
                    v-for="(goodState, idx) in result.goodStates" v-bind:key="idx">
                    <div style="display: block;">
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
                    style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;"
                    v-for="(badState, idx) in result.badStates" v-bind:key="idx">

                    <div style="display: block;">
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
                    style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;"
                    v-for="(neutralState, idx) in result.neutralStates" v-bind:key="idx">
                    <div style="display: block;">
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
                        <div class="md-title">{{ result.numCases }}</div>
                        <div class="md-subhead">Total number of states</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The total number of states is the number of possible combinations of hypotheticals. It is the
                        same
                        as the total number of good, bad, and neutral states.
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{ result.categoryAmoral }}
                        </div>
                        <div class="md-subhead">Level of amorality
                        </div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The level of amorality is number of neutral cases divided by the number of total cases. Here,
                        {{ result.aLevel[0] + '/' + result.aLevel[1] }}
                        are neutral.
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{ result.categoryMoral }}
                        </div>
                        <div class="md-subhead">Permissiveness
                        </div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The permissiveness is the number of good cases divided by the total number of good and bad
                        cases. Here, {{
                            result.mBalance === undefined ? `the value can't be computed because there are 0 good or bad cases combined.` : result.mBalance[0] + '/' + result.mBalance[1] + ' states are good.'
                        }}
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{
                                result.mEntropyNorm === undefined ? '-' : Math.round(100 * (1 - result.mEntropyNorm) * (1 - result.aLevel[0] / result.aLevel[1])) + '%'
                            }}
                        </div>
                        <div class="md-subhead">Moral sophistication</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        Moral sophistication is a measure of how selective a rule is about what's good and bad. It can
                        be
                        seen
                        as
                        a measure of the imbalance between the number of good and bad cases, that also takes the
                        proportion
                        of choices that are non-neutral into account. An even 50/50 split between
                        good and bad means 0 sophistication, whereas more uneven splits leads to higher values (0/all
                        splits
                        are
                        regarded as a special cases). Generally, a higher number of neutral cases will lead to a lower
                        sophistication as well.
                    </p>
                    <p>
                        More specifically, the moral sophistication value 'S' is computed as 'S = (1 - E)*P' where 'E'
                        is the normalized entropy value (found below), and 'P = N/T' is the number of non-neutral cases
                        (N) divided by the total number of cases (T).
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{ result.mEntropy === undefined ? '-' : result.mEntropy.toFixed(2) }}
                        </div>
                        <div class="md-subhead">Moral entropy</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        Moral entropy is a measure of bias that takes the total number of choices
                        and the balance between good and bad choices into account. A lower value means a higher bias.
                        For
                        any number of states, the highest entropy is for an even split between good and bad, and the
                        lowest
                        is
                        with only 1 good (or bad) choice because the extremes (0 and all choices) are treated as special
                        cases.
                        The entropy also gets a larger spread the more possible states there are, e.g. 1 good choice out
                        of
                        5
                        states has a higher entropy (less bias) than 1 good out of 10. The local scale is the minimum
                        and maximum entropy for the specific system in question.
                    </p>
                </md-card-content>
            </md-card>
            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{
                                result.mEntropyScale === undefined ? '-' : '[' + result.mEntropyScale[0].toFixed(2) + ', ' + result.mEntropyScale[1].toFixed(2) + ']'
                            }}
                        </div>
                        <div class="md-subhead">Local entropy scale</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The local entropy scale is the minimum and maximum possible entropy for this system.
                    </p>
                </md-card-content>
            </md-card>
            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{
                                result.mEntropyNorm === undefined ? '-' : result.mEntropyNorm.toFixed(2)
                            }}
                        </div>
                        <div class="md-subhead">Normalized moral entropy</div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The normalized moral entropy is the moral entropy scaled to [0, 1] using the local scale. If the
                        upper and lower end of the scale is the same number, the normalized moral entropy is set to 0.
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
import {ResultDataSolver} from "../Interpreter";

@Component
export default class Result extends Vue {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Prop({
        default: () => {
        }
    }) result: ResultDataSolver | undefined;

    private additionalInfo = false;
}

</script>

<style scoped>

</style>
