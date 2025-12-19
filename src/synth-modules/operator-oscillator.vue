<script setup lang="ts">
    import { ref } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';
    import type { OperatorOscillator } from './operator-oscillator-node';

    const props = defineProps<{
        node: OperatorOscillator,
    }>()

    let ratioParameter = ref<string>(props.node.getRatio().toString())
    let waveFormParameter = ref<OscillatorType>(props.node.getType())
    let gainParameter = ref<string>((props.node.getGain()).toString())
    let muteParameter = ref<boolean>(props.node.isMute())


    function changeRatio(value: string) {
        ratioParameter.value = value
        props.node.setRatio(+ratioParameter.value)
    }

    function changeWaveForm(value: string) {
        waveFormParameter.value = value as OscillatorType
        props.node.setType(waveFormParameter.value)
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
            <label for="{{props.node.name}}-ratio">Ratio: </label>
            <input type="text" id="{{props.node.name}}-ratio" :value="ratioParameter" @input="(event) => changeRatio((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label for="{{props.node.name}}-waveform">Waveform Type:</label>
            <select id="{{props.node.name}}-waveform" @change="(event) => changeWaveForm((event.currentTarget as HTMLSelectElement).value)">
                <option value="sine" :selected="waveFormParameter === 'sine' ">Sine</option>
                <option value="square" :selected="waveFormParameter === 'square' ">Square</option>
                <option value="sawtooth" :selected="waveFormParameter === 'sawtooth' ">Sawtooth</option>
                <option value="triangle" :selected="waveFormParameter === 'triangle' ">Triangle</option>
            </select>
        </div>

        <div class="synth-node-control-group">
            <label for="{{props.node.name}}-gain">Amplitude: </label>
            <!--input type="range" id="{{props.node.name}}-gain" min="0" max="5000" :value="gainParameter" step="1" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)" -->
            <input type="text" id="{{props.node.name}}-gain-text" :value="gainParameter" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label for="{{props.node.name}}-mute">Mute:</label>
            <input type="checkbox" id="{{props.node.name}}-mute" :value="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
        </div>
    </BaseNodeComponent>
</template>