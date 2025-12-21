<script setup lang="ts">
    import { ref } from 'vue'
    import { Delay } from './synthNodes'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        id: string,
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
    <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            <label :for="`${props.id}-delay`">Delay (seconds): </label>
            <input type="range" :id="`${props.id}-delay`" min="0" max="5" :value="delayParameter" step="0.1" @input="(event) => changeDelay((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-delayValue`">{{delayParameter}}</span>
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-gain`">Gain: </label>
            <input type="text" :id="`${props.id}-gain`" :value="gainParameter" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-mute`">Mute:</label>
            <input type="checkbox" :id="`${props.id}-mute`" :value="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
        </div>
    </BaseNodeComponent>
</template>