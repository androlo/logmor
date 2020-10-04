<template>
    <div id="app" class="page-container">

        <md-app style="background-color: #f1ebe6">
            <md-app-toolbar class="md-primary md-large" id="toolbar">
            </md-app-toolbar>

            <md-app-content style="background-color: #eae3db;">
                <LogMor style="margin-bottom: 2em; background-color: #eae3db;" md-elevation-0/>
            </md-app-content>
        </md-app>

        <footer>
            <md-bottom-bar style="background-color: #1f2430;">
                <div class="footeritem"><a class="footerlink" target="_blank" href="https://github.com/androlo/logmor">Project Page</a></div>
                <div class="footeritem"><a class="footerlink" target="_blank" href="https://github.com/androlo/logmor/blob/main/docs/tutorial.md">Tutorial</a></div>
                <div class="footeritem"><a class="footerlink" target="_blank" href="https://github.com/androlo/logmor/blob/main/docs/docs.md">Documentation</a></div>
            </md-bottom-bar>
            <cookie-law theme="base" buttonText="OK" storageType="cookies" storageName="LogMor.CookieAlert"
                        message="This page uses cookies for Your convenience."></cookie-law>
        </footer>
    </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import LogMor from "./components/LogMor.vue";
import CookieLaw from 'vue-cookie-law';

@Component({
    components: {
        LogMor,
        CookieLaw
    }
})
export default class App extends Vue {
}
</script>

<style>
@import './App.css';
</style>
