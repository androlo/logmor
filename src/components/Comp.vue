<template>
    <md-card>
        <md-card-header>
            <div class="md-title">Comparison</div>
            <div class="md-subhead">{{result.subtype}}</div>
        </md-card-header>
        <md-card-content>
            <h3>Solver 1: {{result.solverID1}} ({{result.solverMeta1.slice(1, -1)}})</h3>
            <h3>Solver 2: {{result.solverID2}} ({{result.solverMeta2.slice(1, -1)}})</h3>
            <h3>Good States</h3>
            <md-list>
                <md-list-item style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;" v-for="(goodState, idx) in result.goodStates" v-bind:key="idx">

                    <div style="display: block;" >
                        <md-chip class="md-primary greenchip" v-for="(state, idxInner) in goodState" :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
            <h3>Bad States</h3>
            <md-list>
                <md-list-item style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;" v-for="(badState, idx) in result.badStates" v-bind:key="idx">

                    <div style="display: block;" >
                        <md-chip class="md-primary redchip" v-for="(state, idxInner) in badState" :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
            <h3>Neutral States</h3>
            <md-list>
                <md-list-item style="border-width: 1px; border-color: lightgrey; border-style: solid; overflow-x: scroll;" v-for="(neutralState, idx) in result.neutralStates" v-bind:key="idx">

                    <div style="display: block;" >
                        <md-chip class="md-primary bluechip" v-for="(state, idxInner) in neutralState" :key="idxInner">
                            {{ state }}
                        </md-chip>
                    </div>
                </md-list-item>
            </md-list>
        </md-card-content>
        <md-card-actions>
        </md-card-actions>
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
}

</script>

<style scoped>

</style>

