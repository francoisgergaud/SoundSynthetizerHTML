<script setup lang="ts">
    import { ref } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';
    import type { OperatorOscillator } from './operator-oscillator-node';

    const props = defineProps<{
        id: string,
        node: OperatorOscillator,
    }>()

    let ratioParameter = ref<string>(props.node.getRatio().toString())
    let waveFormParameter = ref<OscillatorType>(props.node.getType())
    let modulationIndexParameter = ref<string>((props.node.getModulationIndex()).toString())


    function changeRatio(value: string) {
        ratioParameter.value = value
        props.node.setRatio(+ratioParameter.value)
    }

    function changeWaveForm(value: string) {
        waveFormParameter.value = value as OscillatorType
        props.node.setType(waveFormParameter.value)
    }

    function changeModulationIndex(value: string) {
        modulationIndexParameter.value = value
        props.node.setModulationIndex(+modulationIndexParameter.value);
    }


</script>

<template>
    <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            <label :for="`${props.id}-ratio`">Ratio: </label>
            <input type="text" :id="`${props.id}-ratio`" :value="ratioParameter" @input="(event) => changeRatio((event.currentTarget as HTMLInputElement).value)">
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
            <label :for="`${props.id}-modulation-index`">Modulation index: </label>
            <input type="text" :id="`${props.id}-modulation-index`" :value="modulationIndexParameter" @input="(event) => changeModulationIndex((event.currentTarget as HTMLInputElement).value)">
        </div>
    </BaseNodeComponent>
</template>