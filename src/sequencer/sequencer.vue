<script setup lang="ts">
    import SequencerStepComponent from './sequencer-step.vue';
    import { computed, ref, useTemplateRef, watch, type ComputedRef } from 'vue';
    import type { Sequencer, Track } from './sequencer';
    import { fillKeysFrequencyTable, keys } from './utils';
    import { Graph } from '@/graph';

    const props = defineProps<{
        sequencer: Sequencer
    }>()
    watch(
        () => props.sequencer, 
        (newSequencer, oldSequencer) => {
            tracks.value = new Array()
            if(newSequencer.getTracks()){
                for(const sequencerTrack of newSequencer.getTracks()){
                    tracks.value.push(createStateFromTrack(sequencerTrack))
                }
            }
        }
    )
    const emit = defineEmits(['selectTrack'])

    const scrollableSequencerTracksWrapperHTMLElement = useTemplateRef('scrollableSequencerTracksWrapper')
    const sequencerTracksWrapperHTMLElement = useTemplateRef('sequencerTracksWrapper')

    let recordingFrequency = 0

    let isPlaying = ref<boolean>(false)
    let isRecording = ref<boolean>(false)
    let autoScroll = ref<boolean>(true)
    const isKeyboardPlaying = ref<boolean>(false)
    let newTrackName = ref<string>("")
    const selectedTrackIndex = ref<number | null>(null)
    const tracks = ref<{name:string, steps : (number|undefined)[], pan: number, graph: Graph}[]>(new Array())

    //intiialize state tracks from sequencer in properties
    tracks.value = new Array()
    if(props.sequencer.getTracks()){
        for(const sequencerTrack of props.sequencer.getTracks()){
            tracks.value.push(createStateFromTrack(sequencerTrack))
        }
    }


    function createStateFromTrack(sequencerTrack: Track): {name:string, steps : (number|undefined)[], pan: number, graph: Graph} {
        //transorm map of steps into a list
                const steps = new Array(props.sequencer.numberOfStep).fill(undefined)
                for (const stepIndex in sequencerTrack.steps) {
                    steps[stepIndex] = sequencerTrack.steps[stepIndex]
                }
                return {
                    name: sequencerTrack.name,
                    steps: steps,
                    graph: sequencerTrack.getGraph(),
                    pan: sequencerTrack.trackOutNode.getPan()
                }
    }

    let scrollerTimerId: number|null = null
    let recordingTimerId: number|null = null

    function start(){
        props.sequencer.start()
        isPlaying.value = true
        //width the wrapping box with the scroller
        let scrollableSequencerTrackWrapperWidth = parseInt(getComputedStyle(scrollableSequencerTracksWrapperHTMLElement.value!).getPropertyValue('width'));
        //width of the track box
        let sequencerTrackWrapperWidth = parseInt(getComputedStyle(sequencerTracksWrapperHTMLElement.value!).getPropertyValue('width'));
        //if the track need to be scrolled
        if(autoScroll.value == true && sequencerTrackWrapperWidth > scrollableSequencerTrackWrapperWidth){
            //create a time to autoscroll
            scrollerTimerId = setInterval(
                (startTime: number, trackDurationMs: number, displayableTotalRation: number, sequencerTrackWrapperWidth: number) => {
                    //total playing-time in ms
                    const elapsedTimeMs =  Date.now() - startTime
                    //current-loop's time
                    const currentIterationElapsedTimeMs = elapsedTimeMs % trackDurationMs
                    //ration of the current-loop time over the track-time
                    const currentRatio = currentIterationElapsedTimeMs/trackDurationMs
                    // lower and upper limit for scrolling: we start to scroll when the current ratio is in the second half of the scrollable box at the beginning of the track
                    // and stop to scroll when the ratio reach the second half of the scrollable box at the end of the track
                    const lowerLimitForScrolling = (displayableTotalRation/2)
                    const upperLimitForScrolling = 1 - lowerLimitForScrolling
                    // if the current ration is bellow the lower limit, scroll to 0
                    if(currentRatio < lowerLimitForScrolling){
                        scrollableSequencerTracksWrapperHTMLElement.value!.scrollLeft = 0
                    }
                    //if the ratio is between the lower and upper limits
                    else if(currentRatio > lowerLimitForScrolling && currentRatio < upperLimitForScrolling){
                        //get the current scroll-position by multiplying the current-ration by the track-box width
                        const currentPosition = (sequencerTrackWrapperWidth * currentRatio)-(lowerLimitForScrolling*sequencerTrackWrapperWidth)
                        //set the scroller to this position
                        scrollableSequencerTracksWrapperHTMLElement.value!.scrollLeft = currentPosition
                    }
                }, 
                50, 
                Date.now(), 
                props.sequencer.trackDurationSeconds*1000, 
                scrollableSequencerTrackWrapperWidth/sequencerTrackWrapperWidth, 
                sequencerTrackWrapperWidth
            );
        }
        //if we are recording
        if(isRecording && selectedTrackIndex.value != null) {
            recordingTimerId = setInterval(
                () => {
                    const selectedTrackIndexValue = selectedTrackIndex.value!
                    console.debug(`recording: setting track ${selectedTrackIndexValue} step ${props.sequencer.currentStep} value ${recordingFrequency}`)
                    if(selectedTrackIndexValue != null){
                        setTrackStepValue(selectedTrackIndexValue, props.sequencer.currentStep, recordingFrequency)
                        recordingFrequency = 0
                    }
                },
                props.sequencer.stepDurationTimeSeconds * 1000
            )
            
        }
    }

    function stop(){
        props.sequencer.stop()
        isPlaying.value = false
        if(scrollerTimerId) {
            clearInterval(scrollerTimerId)
            scrollerTimerId = null
            scrollableSequencerTracksWrapperHTMLElement.value!.scrollLeft = 0
        }
        if(recordingTimerId) {
            clearInterval(recordingTimerId)
            recordingTimerId = null
        }
    }

    function startRecording(){
        isRecording.value = true
    }

    function stopRecording(){
        isRecording.value = false
    }

    function addTrack(){
        const newTrack = props.sequencer.addTrack(newTrackName.value, null)
        tracks.value.push(createStateFromTrack(newTrack))
    }

    function changeSelectedTrack(trackIndex: number) {
        selectedTrackIndex.value = trackIndex
        emit('selectTrack', trackIndex)
    }

    function setTrackStepValue(trackIndex: number, stepNumber: number, stepValue: number | undefined){
        console.info(`setting track ${trackIndex} step ${stepNumber} value ${stepValue}`)
        //set value in sequencer
        props.sequencer.getTracks()[trackIndex]!.setStepValue(stepNumber, stepValue)
        // set the reactive property
        tracks.value[trackIndex]!.steps[stepNumber] = stepValue
    }

    function changeTrackPan(trackIndex: number, value: string) {
        //set value in sequencer
        props.sequencer.getTracks()[trackIndex]!.trackOutNode.setPan(+value)
        // set the reactive property
        tracks.value[trackIndex]!.pan = +value
    }

    const frequencyByKey = fillKeysFrequencyTable()

    function manageKeyDown(event : KeyboardEvent) {
        if(!isKeyboardPlaying.value) { return }
        if (event.repeat) { return }
        let currentKeyPosition = null
        const currentOctave = 4
        switch(event.key) {
            case 'a': currentKeyPosition = 0; break;
            case 'w': currentKeyPosition = 1; break;
            case 's': currentKeyPosition = 2; break;
            case 'e': currentKeyPosition = 3; break;
            case 'd': currentKeyPosition = 4; break;
            case 'f': currentKeyPosition = 5; break;
            case 't': currentKeyPosition = 6; break;
            case 'g': currentKeyPosition = 7; break;
            case 'y': currentKeyPosition = 8; break;
            case 'h': currentKeyPosition = 9; break;
            case 'u': currentKeyPosition = 10; break;
            case 'j': currentKeyPosition = 11; break;
        }
        if(currentKeyPosition != null) {
            const currentKey: string = keys[currentKeyPosition]!
            console.debug(`keyboard: playing ${currentKey}`)
            let frequency = frequencyByKey[currentKey + currentOctave.toString()]!
            if(selectedTrackIndex.value != null) {
                const selectedTrackIndexValue = selectedTrackIndex.value
                tracks.value[selectedTrackIndexValue]!.graph.trigger(true, frequency)
                if(isRecording) {
                    recordingFrequency = frequency;
                    /*console.debug(`recording: setting track ${selectedTrackIndexValue} step ${props.sequencer.currentStep} value ${frequency}`)
                    setTrackStepValue(selectedTrackIndexValue, props.sequencer.currentStep, frequency)*/
                }
            }
            
        }
    }

    window.addEventListener('keydown', manageKeyDown );

    window.addEventListener('keyup', (e) => {
        if(!isKeyboardPlaying.value) { return }
        if(selectedTrackIndex.value != null && tracks.value.length > selectedTrackIndex.value) {
            tracks.value[selectedTrackIndex.value]!.graph.trigger(false, null)
        }
        if(isRecording) {
            recordingFrequency = 0;
        }
    });

</script>

<template>

    <div>
        <div class="synth-node-control-group">
            <button @click="(event) => addTrack()">&#43;</button>
            <input type="text" id="newTrackName" placeholder="track name" v-model="newTrackName"/>
        </div>
    </div>
    <div class="sequencerTracks" v-show="tracks.length > 0">
        <div class="scrollableParent" ref="scrollableSequencerTracksWrapper" style="overflow: auto;">
            <table ref="sequencerTracksWrapper">
                <tbody>
                    <tr v-for="(track, trackIndex) in tracks" class="sequencerTrack" :class="trackIndex == selectedTrackIndex ? 'sequencerTrackSelected': ''">
                        <td class="trackHeader">
                            <div @click="changeSelectedTrack(trackIndex)" class="trackDescription">
                                {{track.name}}
                            </div>
                            <div class="trackBalance">
                                L <input type="range" :id="`${track.name}-balance`" min="-1" max="1" :value="track.pan" step="0.1" @input="(event) => changeTrackPan(trackIndex, (event.currentTarget as HTMLInputElement).value)"> R
                            </div>
                        </td>
                        <td v-for="(stepValue, stepIndex) in track.steps" :class="['sequencerStep', {'active': props.sequencer.currentStep == stepIndex}]">
                            <SequencerStepComponent :step-number="stepIndex - 1" :track-index="trackIndex" :step-value="stepValue" @change-step-value="(stepValue: number | undefined) => setTrackStepValue(trackIndex, stepIndex, stepValue)"/>
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>
    </div>
    <div class="sequencerControlsWrapper">
        <div class="sequencerControls">
            <button v-show="! isRecording" @click="(event) => startRecording()">&#x25EF</button>
            <button v-show="isRecording" @click="(event) => stopRecording()">&#x2B24;</button>
            <button v-show="! isPlaying" @click="(event) => start()">&#x25B6</button>
            <button v-show="isPlaying" @click="(event) => stop()">&#x25A0;</button>
            <button id="keyboardPlayModeDisabled" @click="(event) => isKeyboardPlaying = true" v-show="!isKeyboardPlaying">Keyboard disabled</button>
            <button id="keyboardPlayModeEnabled" @click="(event) => isKeyboardPlaying = false" v-show="isKeyboardPlaying">Keyboard enabled</button>
        </div>
    </div>
</template>