<script setup lang="ts">
    import { computed } from 'vue';
    import { SynthBaseNode } from './synthNodes'
    import { Graph } from '@/graph';

    const props = defineProps<{
        node: SynthBaseNode,
    }>()

    const getLinkedInputs = computed(
        () => {
            const result: {label:string; inputName: string, sourceNode: SynthBaseNode; sourceNodeOutputName: string}[] = []
            props.node.linkedInputs.forEach(
                (inputSourceNodeNames, inputName) => inputSourceNodeNames.forEach(
                    (sourceNodeOutputNames, sourceNodeName) => sourceNodeOutputNames.forEach(
                        (sourceNode, sourceNodeOutputName) => {
                            result.push({
                                label:`${sourceNodeName}:${sourceNodeOutputName} => ${inputName}`,
                                inputName: inputName,
                                sourceNode: sourceNode,
                                sourceNodeOutputName: sourceNodeOutputName
                            })
                        }
                    )
                )
            )
            return result;
        }
    )

    const getLinkedOutputs = computed(
        () => {
            const result: {label:string; outputName: string, destinationNode: SynthBaseNode; destinationNodeInputName: string}[] = []
            props.node.linkedOutputs.forEach(
                (outputDestinationNodeNames, outputName) => outputDestinationNodeNames.forEach(
                    (destinationNodeInputsNames, destinationNodeName) => destinationNodeInputsNames.forEach(
                        (destinationNode, destinationNodeInputName) => {
                            result.push({
                                label:`${outputName} &#128313; ${destinationNodeName}:${destinationNodeInputName}`,
                                outputName: outputName,
                                destinationNode: destinationNode,
                                destinationNodeInputName: destinationNodeInputName
                            })
                        }
                    )
                )
            )
            return result;
        }
    )

    function removeLinkedInput(inputName: string, sourceNode: SynthBaseNode, sourceNodeDestinationName:string) {
        Graph.unlinkNode(sourceNode, sourceNodeDestinationName, props.node, inputName)
    }

    function removeLinkedOutput(outputName: string, destinationNode: SynthBaseNode, destinationNodeOutputName:string) {
        Graph.unlinkNode(props.node, outputName, destinationNode, destinationNodeOutputName)
    }

</script>

<template>
    <div class="synth-node">
        <div class="synth-node-controls" >
            <slot/>
        </div>
        <div class="synth-node-inputs">
            <label class="header">
                inputs
            </label>
            <ul>
                <li v-for="linkedInput in getLinkedInputs" class="componentLinks">
                    <button @click="(event) => removeLinkedInput(linkedInput.inputName, linkedInput.sourceNode, linkedInput.sourceNodeOutputName)">&#x2717;</button>
                    <span>{{ linkedInput.inputName }} &#128309; {{linkedInput.sourceNode.name}}:{{linkedInput.sourceNodeOutputName}}</span>
                </li>
            </ul>
        </div>
        <div class="synth-node-outputs">
            <label class="header">
                outputs
            </label>
            <ul>
                <li v-for="linkedOutput in getLinkedOutputs" class="componentLinks">
                    <button @click="(event) => removeLinkedOutput(linkedOutput.outputName, linkedOutput.destinationNode, linkedOutput.destinationNodeInputName)">&#x2717;</button>
                    <span>{{ linkedOutput.outputName }} &#128309; {{linkedOutput.destinationNode.name}}:{{linkedOutput.destinationNodeInputName}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>