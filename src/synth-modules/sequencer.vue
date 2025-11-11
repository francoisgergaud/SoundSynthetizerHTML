<script setup lang="ts">
    import BaseNodeComponent from './base-node-component.vue';
    import SequencerStepComponent from './sequencer-step.vue';
    import { computed, ref, useTemplateRef, type ComputedRef } from 'vue';
    import type { Sequencer, Track } from './sequencer-node';

    const props = defineProps<{
        node: Sequencer,
    }>()

    const scrollableSequencerTracksWrapperHTMLElement = useTemplateRef('scrollableSequencerTracksWrapper')
    const sequencerTracksWrapperHTMLElement = useTemplateRef('sequencerTracksWrapper')

    let isPlaying = ref<boolean>(false)
    let autoScroll = ref<boolean>(true)
    let newTrackName = ref<string>("")

    const getTracks: ComputedRef<Track[]> = computed(
        () => props.node.getTracks()
    )

    let scrollerTimerId: number|null = null

    function start(){
        props.node.start()
        isPlaying.value = true
        //width the wrapping box with the scroller
        let scrollableSequencerTrackWrapperWidth = parseInt(getComputedStyle(scrollableSequencerTracksWrapperHTMLElement.value!).getPropertyValue('width'));
        //width of the track box
        let sequencerTrackWrapperWidth = parseInt(getComputedStyle(sequencerTracksWrapperHTMLElement.value!).getPropertyValue('width'));
        //if the track need to be scrolled
        if(autoScroll.value == true && sequencerTrackWrapperWidth > scrollableSequencerTrackWrapperWidth){
            //create a time to autoscroll
            scrollerTimerId = setInterval((startTime: number, trackDurationMs: number, displayableTotalRation: number, sequencerTrackWrapperWidth: number) => {
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
            }, 50, Date.now(), props.node.trackDurationSeconds*1000, scrollableSequencerTrackWrapperWidth/sequencerTrackWrapperWidth, sequencerTrackWrapperWidth);
        }
    }

    function stop(){
        props.node.stop()
        isPlaying.value = false
        if(scrollerTimerId) {
            clearInterval(scrollerTimerId)
            scrollerTimerId = null
            scrollableSequencerTracksWrapperHTMLElement.value!.scrollLeft = 0
        }
    }

    function addTrack(){
        props.node.addTrack(newTrackName.value, null)
    }

</script>

<template>
   <BaseNodeComponent :node="props.node">
        <div>
            <div class="synth-node-control-group">
                <button v-if="! isPlaying" @click="(event) => start()">&#x25B6</button>
                <button v-if="isPlaying" @click="(event) => stop()">&#x25A0;</button>
            </div>
            <div class="synth-node-control-group">
                <button @click="(event) => addTrack()">&#43;</button>
                <input type="text" id="newTrackName" placeholder="track name" v-model="newTrackName"/>
            </div>
        </div>
        <div class="sequencerTracks">
            <div class="tracksDescriptionWrapper">
                <div v-for="track in getTracks" class="trackDescription">
                    {{track.name}}
                </div>
            </div -->
            <div class="scrollableParent" ref="scrollableSequencerTracksWrapper" style="overflow: auto;">
                <div class="sequencerTracksStepWrapper" ref="sequencerTracksWrapper">
                    <div v-for="stepNumber in props.node.numberOfStep" :class="['sequencerStep', {'active': props.node.currentStep == stepNumber}]">
                        <SequencerStepComponent v-for="track in getTracks" :step-number="stepNumber - 1" :track="track"/>
                    </div>
                </div>
            </div>
        </div>
   </BaseNodeComponent>
</template>