<script setup lang="ts">
    import { Analyzer } from './analyzer-node';
    import { useTemplateRef, ref } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        id: string,
        node: Analyzer,
    }>()

    const analyzerType = ref<string>("frequency")

    const canvasHTMLElement = useTemplateRef('analyzerCanvas')

    function draw() {
        const canvasCtx: CanvasRenderingContext2D = canvasHTMLElement.value?.getContext("2d")!
        const canvasWidth = canvasHTMLElement.value!.width
        const canvasHeight = canvasHTMLElement.value!.height
        // clean the canvas
        canvasCtx.fillStyle = "rgb(0 0 0)";
        canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight)
        if(analyzerType.value == "frequency") {
            // draw a bar for each sample value from the frequency value
            const frequencyData = props.node.getFrequencyValues();
            const numberOfSamples = frequencyData.length
            
            const barWidth = (canvasWidth / numberOfSamples)
            let currentBarXPosition = 0
            // for each sample (depending of the FFTSize from the Analyzer node)
            for (let i = 0; i < numberOfSamples; i++) {
                // normalize the sample's value
                let value = (frequencyData[i]! || 0) / 255
                // get the bar's height proportianally from the canvas' height
                let barHeight = (canvasHeight)*value
                // get the light/dark color of the bar depending of the value
                //FIXME: make it more dynamic using a CSS variable
                const clampedValueForColor = Math.max(value, 0.50)
                const redValue = 245 * clampedValueForColor
                const greenValue = 171 * clampedValueForColor
                canvasCtx.fillStyle = `rgb(${redValue} ${greenValue} 00)`;
                canvasCtx.fillRect(currentBarXPosition, canvasHeight - barHeight, barWidth, barHeight);
                currentBarXPosition += barWidth + 1;
            }
        } else if(analyzerType.value == "time") {
            canvasCtx.beginPath()
            canvasCtx.strokeStyle = "rgb(245 171 00)"
            const timeData = props.node.getTimeValues();
            const numberOfSamples = timeData.length
            const lineXlength = (canvasWidth / numberOfSamples)
            let currentLineStartXPosition = 0
            let value = (timeData[0]! || 0) / 255
            let currentLineYPosition = (canvasHeight)*(1 - value)
            canvasCtx.moveTo(currentLineStartXPosition, currentLineYPosition);
            // for each sample (depending of the FFTSize from the Analyzer node)
            for (let i = 1; i < numberOfSamples; i++) {
                currentLineStartXPosition += lineXlength
                // normalize the sample's value
                value = (timeData[i]! || 0) / 255
                // get the bar's height proportianally from the canvas' height
                let currentLineYPosition = (canvasHeight)*(1 - value)
                canvasCtx.lineTo(currentLineStartXPosition, currentLineYPosition);
            }
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        }
    }

    let timerId = setInterval(() => requestAnimationFrame(draw), 50)

</script>

<template>

    <BaseNodeComponent :node="props.node">
        <canvas ref="analyzerCanvas" width="350" height="200" style="padding:5px"></canvas>
        <div class="control-group">
            <select id="nodeType" v-model="analyzerType">
                <option value="frequency">frequency</option>
                <option value="time">time</option>
            </select>
        </div>
    </BaseNodeComponent>
</template>