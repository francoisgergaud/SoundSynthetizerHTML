<script setup lang="ts">
    import { ref } from 'vue'
    import { Delay } from './synthNodes'

    const props = defineProps<{
        node: Delay,
    }>()

    let delayParameter = ref<string>(props.node.getDelayTime().toString())
    let gainParameter = ref<string>(props.node.getGain().toString())
    let muteParameter = ref<boolean>(props.node.isMute())


    function changeDelay(value: string) {
        delayParameter.value = value
        props.node.setDelayTime(+delayParameter.value)
    }

    function changeGain(value: string) {
        gainParameter.value = value
        props.node.setGain(+gainParameter.value);
    }

    function changeMute(value: boolean) {
        muteParameter.value = value
        if(muteParameter.value) {
            props.node.mute()
        } else {
            props.node.unmute()
        }
    }

</script>

<template>
    <div class="synth-node">
        <div>
            <label class="header">
                {{props.node.name}}
            </label>
            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-delay">Delay (seconds): </label>
                <input type="range" id="{{props.node.name}}-delay" min="0" max="5" :value="delayParameter" step="0.1" @input="(event) => changeDelay((event.currentTarget as HTMLInputElement).value)">
                <span id="{{props.node.name}}-delayValue">{{delayParameter}}</span>
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-gain">Gain: </label>
                <input type="text" id="{{props.node.name}}-gain" :value="gainParameter" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-mute">Mute:</label>
                <input type="checkbox" id="{{props.node.name}}-mute" :value="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
            </div>
        </div>
    </div>
</template>