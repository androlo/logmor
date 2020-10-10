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
            <md-list style="">
                <md-list-item class="statelist"
                              v-for="(goodState, idx) in result.goodStates" v-bind:key="idx">
                    <StateChips v-bind:states="goodState" listClass="md-primary greenchip"/>
                </md-list-item>
            </md-list>
            <div class="md-body-2">Morally Bad States</div>
            <md-list>
                <md-list-item
                    class="statelist"
                    v-for="(badState, idx) in result.badStates" v-bind:key="idx">
                    <StateChips v-bind:states="badState" listClass="md-primary redchip"/>
                </md-list-item>
            </md-list>
            <div class="md-body-2">Morally Neutral States</div>
            <md-list>
                <md-list-item
                    class="statelist"
                    v-for="(neutralState, idx) in result.neutralStates" v-bind:key="idx">
                    <StateChips v-bind:states="neutralState" listClass="md-primary bluechip"/>
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
                        The total number of states is the number of possible combinations of hypotheticals. It is also
                        the sum of the amount of good, bad, and neutral states.
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{ Math.round(100 * (result.aLevel[0] / result.aLevel[1])) + '%' }}
                        </div>
                        <div class="md-subhead">Level of amorality
                        </div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The level of amorality is the percentage of all states that are neutral. Here,
                        {{ result.aLevel[0] + '/' + result.aLevel[1] }} states are neutral.
                    </p>
                </md-card-content>
            </md-card>

            <md-card class="datacard">
                <md-card-header>
                    <md-card-header-text>
                        <div class="md-title">{{
                                result.mBalance === undefined ? '-' : Math.round(100 * (result.mBalance[0] / result.mBalance[1])) + '%'
                            }}
                        </div>
                        <div class="md-subhead">Permissiveness
                        </div>
                    </md-card-header-text>
                </md-card-header>
                <md-card-content>
                    <p>
                        The permissiveness is the percentage of good cases among the total number of good and bad
                        cases. Here, {{
                            result.mBalance === undefined ? `the value can't be computed because there are 0 good or bad cases combined.` : result.mBalance[0] + '/' + result.mBalance[1] + ' states are good.'
                        }}.
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
                        Moral sophistication is a measure of how selective a rule is about what's good and bad. An even
                        50/50 split between good and bad means 0 sophistication, and more uneven splits leads to higher
                        values (although 0-to-all splits are regarded as special cases). A higher number of neutral
                        cases will lead to a lower sophistication as well.
                    </p>
                    <p>
                        Mathematically, the moral sophistication value 'S' is computed as 'S = (1 - E)*P' where 'E'
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
                        Moral entropy is a measure of the bias in the set of good and bad states, that also takes the
                        total number of good and bad choices into account. A 50/50 split between good and bad choices
                        will give the highest possible entropy, while a single good choice (or a single bad choice)
                        gives the lowest possible entropy (0 good or bad states are considered special cases). Entropy
                        also gets a larger spread the more possible states there are, meaning 1 good choice out of 5
                        total states has a higher entropy (less bias) than 1 good state out of 10.
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
import StateChips from './StateChips.vue';

@Component({
    components: {
        StateChips
    }
})
export default class Result extends Vue {

    @Prop({
        default: () => {
        }
    }) result: ResultDataSolver | undefined;

    private additionalInfo = false;
}

</script>

<style scoped>

</style>
