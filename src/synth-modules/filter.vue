<script setup lang="ts">
    import { ref } from 'vue'
    import { Filter } from './synthNodes'

    const props = defineProps<{
        node: Filter,
    }>()

    let cutoffFrequencyParameter = ref<string>(props.node.getCutoffFrequency().toString())
    let filterTypeParameter = ref<BiquadFilterType>(props.node.getFilterType())
    let filterGainParameter = ref<string>(props.node.getFilterGain().toString())
    let filterQParameter = ref<string>(props.node.getQ().toString())
    let cutoffFrequencyDetuneParameter = ref<string>(props.node.getFilterDetune().toString())
    let gainParameter = ref<string>((props.node.getGain() * 100).toString())
    let muteParameter = ref<boolean>(props.node.isMute())


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

    function changeGain(value: string) {
        gainParameter.value = value
        props.node.setGain(+gainParameter.value/100);
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
                <label for="{{props.node.name}}-frequency">CutOff Frequency (Hz): </label>
                <input type="range" id="{{props.node.name}}-frequency" min="0" max="5000" :value="cutoffFrequencyParameter" step="1" @input="(event) => changeCutoffFrequency((event.currentTarget as HTMLInputElement).value)">
                <span id="{{props.node.name}}-freqValue">{{cutoffFrequencyParameter}}</span>
            </div>
            
            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-type">Type:</label>
                <select id="{{props.node.name}}-type" @change="(event) => changeFilterType((event.currentTarget as HTMLSelectElement).value)">
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
                <label for="{{props.node.name}}-Q">Q: </label>
                <input type="text" id="{{props.node.name}}-Q" :value="filterQParameter" @input="(event) => changeQ((event.currentTarget as HTMLInputElement).value)">
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-filterGain">Gain: </label>
                <input type="range" id="{{props.node.name}}-filterGain" min="-40" max="40" :value="filterGainParameter" step="1" @input="(event) => changeFilterGain((event.currentTarget as HTMLInputElement).value)">
                <span id="{{props.node.name}}-filterGainValue">{{filterGainParameter}}%</span>
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-detune">CutOff frequency detune: </label>
                <input type="text" id="{{props.node.name}}-detune" :value="cutoffFrequencyDetuneParameter" @input="(event) => changeCutoffFrequencyDetune((event.currentTarget as HTMLInputElement).value)">
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-gain">Gain: </label>
                <input type="range" id="{{props.node.name}}-gain" min="0" max="100" :value="gainParameter" step="1" @input="(event) => changeGain((event.currentTarget as HTMLInputElement).value)">
                <span id="{{props.node.name}}-gainValue">{{gainParameter}}%</span>
            </div>

            <div class="synth-node-control-group">
                <label for="{{props.node.name}}-mute">Mute:</label>
                <input type="checkbox" id="{{props.node.name}}-mute" :value="muteParameter" @input="(event) => changeMute((event.currentTarget as HTMLInputElement).checked)">
            </div>
        </div>
    </div>
</template>