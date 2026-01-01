<script setup lang="ts">
    import { ref } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';
    import type { Filter } from './filter-node';

    const props = defineProps<{
        id: string,
        node: Filter,
    }>()

    let cutoffFrequencyParameter = ref<string>(props.node.getCutoffFrequency().toString())
    let filterTypeParameter = ref<BiquadFilterType>(props.node.getFilterType())
    let filterGainParameter = ref<string>(props.node.getFilterGain().toString())
    let filterQParameter = ref<string>(props.node.getQ().toString())
    let cutoffFrequencyDetuneParameter = ref<string>(props.node.getFilterDetune().toString())


    function changeCutoffFrequency(value: string) {
        cutoffFrequencyParameter.value = value
        props.node.setCutoffFrequency(+cutoffFrequencyParameter.value)
    }

    function changeFilterType(value: string) {
        filterTypeParameter.value = value as BiquadFilterType
        props.node.setFilterType(filterTypeParameter.value)
    }

    function changeQ(value: string) {
        filterQParameter.value = value
        props.node.setQ(+cutoffFrequencyParameter.value)
    }

    function changeFilterGain(value: string) {
        filterGainParameter.value = value
        props.node.setFilterGain(+filterGainParameter.value)
    }

    function changeCutoffFrequencyDetune(value: string) {
        cutoffFrequencyDetuneParameter.value = value
        props.node.setFilterDetune(+cutoffFrequencyDetuneParameter.value)
    }

</script>

<template>
    <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            <label :for="`${props.id}-frequency`">CutOff Frequency (Hz): </label>
            <input type="range" :id="`${props.id}-frequency`" min="0" max="5000" :value="cutoffFrequencyParameter" step="1" @input="(event) => changeCutoffFrequency((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-freqValue`">{{cutoffFrequencyParameter}}</span>
        </div>
        
        <div class="synth-node-control-group">
            <label :for="`${props.id}-type`">Type:</label>
            <select :id="`${props.id}-type`" @change="(event) => changeFilterType((event.currentTarget as HTMLSelectElement).value)">
                <option value="allpass" :selected="filterTypeParameter === 'allpass' ">Allpass</option>
                <option value="bandpass" :selected="filterTypeParameter === 'bandpass' ">Bandpass</option>
                <option value="highpass" :selected="filterTypeParameter === 'highpass' ">Highpass</option>
                <option value="highshelf" :selected="filterTypeParameter === 'highshelf' ">Highshelf</option>
                <option value="lowpass" :selected="filterTypeParameter === 'lowpass' ">Lowpass</option>
                <option value="lowshelf" :selected="filterTypeParameter === 'lowshelf' ">Lowshelf</option>
                <option value="notch" :selected="filterTypeParameter === 'notch' ">Notch</option>
                <option value="peaking" :selected="filterTypeParameter === 'peaking' ">Peaking</option>
            </select>
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-Q`">Q: </label>
            <input type="text" :id="`${props.id}-Q`" :value="filterQParameter" @input="(event) => changeQ((event.currentTarget as HTMLInputElement).value)">
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-filterGain`">Gain: </label>
            <input type="range" :id="`${props.id}-filterGain`" min="-40" max="40" :value="filterGainParameter" step="1" @input="(event) => changeFilterGain((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-filterGainValue`">{{filterGainParameter}}%</span>
        </div>

        <div class="synth-node-control-group">
            <label :for="`${props.id}-detune`">CutOff frequency detune: </label>
            <input type="text" :id="`${props.id}-detune`" :value="cutoffFrequencyDetuneParameter" @input="(event) => changeCutoffFrequencyDetune((event.currentTarget as HTMLInputElement).value)">
        </div>
    </BaseNodeComponent>
</template>