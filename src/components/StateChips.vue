<template>
    <div class="chiplist">
        <md-chip v-bind:class="listClass"
                 v-for="(state, idxInner) in states" :key="idxInner">
            {{ (state.group !== undefined ? `(${state.group}) ` : '') + state.meta + (state.primary ? ' (primary)' : '') }}
        </md-chip>
    </div>

</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import {Prop} from "vue-property-decorator";
import {HypData} from "../Interpreter";

@Component
export default class StateChips extends Vue {

    @Prop({
        default: () => []
    }) states: HypData[] | undefined;

    @Prop({default: String}) listClass: string | undefined;
}

</script>

<style scoped>

</style>
