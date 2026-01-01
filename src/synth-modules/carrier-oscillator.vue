<script setup lang="ts">
    import { ref } from 'vue'
    import { CarrierOscillator } from './carrier-oscillator-node'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        id: string,
        node: CarrierOscillator,
    }>()

    let frequencyParameter = ref<string>(props.node.getFrequency().toString())
    let waveFormParameter = ref<OscillatorType>(props.node.getType())
    let detuneParameter = ref<number>(props.node.getDetune())
    //let muteParameter = ref<boolean>(props.node.isMute())


    function changeFrequency(value: string) {
        frequencyParameter.value = value
        props.node.setFrequency(+frequencyParameter.value)
    }

    function changeWaveForm(value: string) {
        waveFormParameter.value = value as OscillatorType
        props.node.setType(waveFormParameter.value)
    }

    function changeDetune(value: string) {
        detuneParameter.value = +value
        props.node.setDetune(detuneParameter.value);
    }

    /*function changeMute(value: boolean) {
        muteParameter.value = value
        console.debug(`${props.id} chqnge its mute value to ${muteParameter.value}`)
        if(muteParameter.value) {
            props.node.mute()
        } else {
            props.node.unmute()
        }
    }*/

</script>

<template>
    <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            <label :for="`${props.id}-frequency`">Frequency (Hz): </label>
            <input type="range" :id="`${props.id}-frequency`" min="40" max="3500" :value="frequencyParameter" step="1" @input="(event) => changeFrequency((event.currentTarget as HTMLInputElement).value)">
            <input type="text" :id="`${props.id}-frequency-text`" :value="frequencyParameter" @input="(event) => changeFrequency((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-waveform`">Waveform Type:</label>
            <select :id="`${props.id}-waveform`" @change="(event) => changeWaveForm((event.currentTarget as HTMLSelectElement).value)">
                <option value="sine" :selected="waveFormParameter === 'sine' ">Sine</option>
                <option value="square" :selected="waveFormParameter === 'square' ">Square</option>
                <option value="sawtooth" :selected="waveFormParameter === 'sawtooth' ">Sawtooth</option>
                <option value="triangle" :selected="waveFormParameter === 'triangle' ">Triangle</option>
            </select>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-detune`">Detune: </label>
            <input type="text" :id="`${props.id}-detune`" :value="detuneParameter" @input="(event) => changeDetune((event.currentTarget as HTMLInputElement).value)">
        </div>

        <!--div class="synth-node-control-group">
            <label :for="`${props.id}-gain`">Volume: </label>
            <input type="range" :id="`${props.id}-gain`" min="0" max="100" :value="gainParameter" step="1" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-mute`">Mute:</label>
            <input type="checkbox" :id="`${props.id}-mute`" :checked="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
        </div-->
    </BaseNodeComponent>
</template>