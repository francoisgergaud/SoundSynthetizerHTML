<script setup lang="ts">
    import { ref } from 'vue'
    import { CarrierOscillator } from './carrier-oscillator-node'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        node: CarrierOscillator,
    }>()

    let frequencyParameter = ref<string>(props.node.getFrequency().toString())
    let waveFormParameter = ref<OscillatorType>(props.node.getType())
    let gainParameter = ref<number>(props.node.getGain()*100)
    let muteParameter = ref<boolean>(props.node.isMute())


    function changeFrequency(value: string) {
        frequencyParameter.value = value
        props.node.setFrequency(+frequencyParameter.value)
    }

    function changeWaveForm(value: string) {
        waveFormParameter.value = value as OscillatorType
        props.node.setType(waveFormParameter.value)
    }

    function changeGain(value: string) {
        gainParameter.value = +value
        props.node.setGain(gainParameter.value/100);
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
            <label for="{{props.node.name}}-frequency">Frequency (Hz): </label>
            <input type="range" id="{{props.node.name}}-frequency" min="0" max="10000" :value="frequencyParameter" step="1" @input="(event) => changeFrequency((event.currentTarget as HTMLInputElement).value)">
            <input type="text" id="{{props.node.name}}-frequency-text" :value="frequencyParameter" @input="(event) => changeFrequency((event.currentTarget as HTMLInputElement).value)">
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
            <label for="{{props.node.name}}-gain">Volume: </label>
            <input type="range" id="{{props.node.name}}-gain" min="0" max="100" :value="gainParameter" step="1" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label for="{{props.node.name}}-mute">Mute:</label>
            <input type="checkbox" id="{{props.node.name}}-mute" :value="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
        </div>
    </BaseNodeComponent>
</template>