<script setup lang="ts">
    import { ADSR } from './adsr-node';
    import { useTemplateRef, ref, onMounted } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        id: string,
        node: ADSR,
    }>()

    const attackDuration = ref<number>(props.node.attackDuration)
    const decayDuration = ref<number>(props.node.decayDuration)
    const sustainLevel = ref<number>(props.node.sustainLevel)
    const sustainDuration = ref<number>(props.node.sustainDuration)
    const releaseDuration = ref<number>(props.node.releaseDuration)

    const canvasHTMLElement = useTemplateRef('adsrCanvas')

    function changeAttack(value: string) {
        attackDuration.value = +value
        props.node.attackDuration = attackDuration.value
        draw()
    }

    function changeDecay(value: string) {
        decayDuration.value = +value
        props.node.decayDuration = decayDuration.value
        draw()
    }

    function changeSustainLevel(value: string) {
        sustainLevel.value = +value/100
        props.node.sustainLevel = sustainLevel.value
        draw()
    }

    function changeSustainDuration(value: string) {
        sustainDuration.value = +value
        props.node.sustainDuration = sustainDuration.value
        draw()
    }

    function changeRelease(value: string) {
        releaseDuration.value = +value
        props.node.releaseDuration = releaseDuration.value
        draw()
    }

    function _updateCanvas() {
            const canvasCtx: CanvasRenderingContext2D = canvasHTMLElement.value?.getContext("2d")!
            const canvasWidth = canvasHTMLElement.value!.width
            const canvasHeight = canvasHTMLElement.value!.height
            // clean the canvas
            canvasCtx.fillStyle = "rgb(0 0 0)";
            canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight)
            // calculate the resolution: number of pixel for 1 second
            let totalTime = (attackDuration.value + decayDuration.value + sustainDuration.value + releaseDuration.value)
            const timeResolution = canvasWidth/totalTime
            canvasCtx.strokeStyle = "rgb(245 171 00)"
            canvasCtx.lineWidth = 2
            canvasCtx.beginPath()
            canvasCtx.moveTo(0, canvasHeight)
            const attackEndXPosition = (attackDuration.value)*timeResolution
            canvasCtx.lineTo(attackEndXPosition, 0)
            const decayEndXPosition = attackEndXPosition + (decayDuration.value)*timeResolution
            const sustainYPosition = canvasHeight * (1 - sustainLevel.value)
            canvasCtx.lineTo(decayEndXPosition, sustainYPosition)
            //sustain is 1/4th width
            const sustainEndXPosition = decayEndXPosition + (sustainDuration.value)*timeResolution
            canvasCtx.lineTo(sustainEndXPosition, sustainYPosition)
            canvasCtx.lineTo(canvasWidth, canvasHeight)
            canvasCtx.lineWidth = 2
            canvasCtx.stroke()
        }

    function draw() {
        requestAnimationFrame(_updateCanvas)
    }

    onMounted(draw)

</script>

<template>

    <BaseNodeComponent :node="props.node">
        <canvas ref="adsrCanvas" width="350" height="200" style="padding:5px"></canvas>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Attack (seconds): </label>
            <input type="range" :id="`${props.id}-delay`" min="0" max="5" :value="attackDuration" step="0.01" @input="(event) => changeAttack((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-attackValue`">{{attackDuration}}</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-decay`">Decay (seconds): </label>
            <input type="range" :id="`${props.id}-decay`" min="0" max="5" :value="decayDuration" step="0.01" @input="(event) => changeDecay((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-decayValue`">{{decayDuration}}</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Sustain (level): </label>
            <input type="range" :id="`${props.id}-sustain`" min="0" max="100" :value="sustainLevel*100" step="1" @input="(event) => changeSustainLevel((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-sustainValue`">{{sustainLevel * 100}}%</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Sustain duration(seconds): </label>
            <input type="range" :id="`${props.id}-sustain`" min="0" max="5" :value="sustainDuration" step="0.01" @input="(event) => changeSustainDuration((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-sustainValue`">{{sustainDuration}}</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Release (seconds): </label>
            <input type="range" :id="`${props.id}-release`" min="0" max="5" :value="releaseDuration" step="0.01" @input="(event) => changeRelease((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-releaseValue`">{{releaseDuration}}</span>
        </div>
    </BaseNodeComponent>
    
</template>