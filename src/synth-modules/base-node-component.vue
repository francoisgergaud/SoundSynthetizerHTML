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
                                label:`${outputName} => ${destinationNodeName}:${destinationNodeInputName}`,
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
    <div class="synth-node-container">
        <div class="synth-node">
            <label class="header">
                {{props.node.name}}
            </label>
            <div class="synth-node-controls" >
                <slot/>
            </div>
            <div class="synth-node-inputs">
                <label class="header">
                    inputs
                </label>
                <ul>
                    <li v-for="linkedInput in getLinkedInputs">
                        <button @click="(event) => removeLinkedInput(linkedInput.inputName, linkedInput.sourceNode, linkedInput.sourceNodeOutputName)">&#x2717;</button>
                        {{ linkedInput.label }}
                    </li>
                </ul>
            </div>
            <div class="synth-node-outputs">
                <label class="header">
                    outputs
                </label>
                <ul>
                    <li v-for="linkedOutput in getLinkedOutputs">
                        <button @click="(event) => removeLinkedOutput(linkedOutput.outputName, linkedOutput.destinationNode, linkedOutput.destinationNodeInputName)">&#x2717;</button>
                        {{ linkedOutput.label}}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>