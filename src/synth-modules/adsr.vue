<script setup lang="ts">
    import { ADSR } from './adsr-node';
    import { useTemplateRef, ref, onMounted } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        id: string,
        node: ADSR,
    }>()

    const attack = ref<number>(props.node.attack)
    const decay = ref<number>(props.node.decay)
    const sustain = ref<number>(props.node.sustain)
    const release = ref<number>(props.node.release)

    const canvasHTMLElement = useTemplateRef('adsrCanvas')

    function changeAttack(value: string) {
        attack.value = +value
        props.node.attack = attack.value
        draw()
    }

    function changeDecay(value: string) {
        decay.value = +value
        props.node.decay = decay.value
        draw()
    }

    function changeSustain(value: string) {
        sustain.value = +value/100
        props.node.sustain = sustain.value
        draw()
    }

    function changeRelease(value: string) {
        release.value = +value
        props.node.release = release.value
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
            //sustain does not have length (it ends when key is released, on the user's decision.
            // its representqtion will take 1/4th of the total
            let totalTime = (attack.value + decay.value + release.value) * (4/3)
            const timeResolution = canvasWidth/totalTime
            canvasCtx.strokeStyle = "rgb(245 171 00)"
            canvasCtx.lineWidth = 2
            canvasCtx.beginPath()
            canvasCtx.moveTo(0, canvasHeight)
            const attackEndXPosition = (attack.value)*timeResolution
            canvasCtx.lineTo(attackEndXPosition, 0)
            const decayEndXPosition = attackEndXPosition + (decay.value)*timeResolution
            const sustainYPosition = canvasHeight * (1 - sustain.value)
            canvasCtx.lineTo(decayEndXPosition, sustainYPosition)
            //sustain is 1/4th width
            const sustainEndXPosition = decayEndXPosition + (canvasWidth/4)
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
            <input type="range" :id="`${props.id}-delay`" min="0" max="5" :value="attack" step="0.01" @input="(event) => changeAttack((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-attackValue`">{{attack}}</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-decay`">Decay (seconds): </label>
            <input type="range" :id="`${props.id}-decay`" min="0" max="5" :value="decay" step="0.01" @input="(event) => changeDecay((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-decayValue`">{{decay}}</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Sustain (level): </label>
            <input type="range" :id="`${props.id}-sustain`" min="0" max="100" :value="sustain*100" step="1" @input="(event) => changeSustain((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-sustainValue`">{{sustain * 100}}%</span>
        </div>
        <div class="synth-node-control-group">
            <label :for="`${props.id}-attack`">Release (seconds): </label>
            <input type="range" :id="`${props.id}-release`" min="0" max="5" :value="release" step="0.01" @input="(event) => changeRelease((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-releaseValue`">{{release}}</span>
        </div>
    </BaseNodeComponent>
    
</template>