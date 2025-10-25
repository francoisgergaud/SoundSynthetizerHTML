<script setup lang="ts">
    import { MusicSequence } from './synthNodes'
    import BaseNodeComponent from './base-node-component.vue';

    const props = defineProps<{
        node: MusicSequence,
    }>()

</script>

<template>
   <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            Inputs:
            <ul>
                <li v-for="(sourceData,inputName) in props.node.inputs"> {{inputName + " => " + sourceData.sourceNode.name + ":" + sourceData.sourceOutputName }}</li>
            </ul>
            Outputs:
            <ul>
                <li v-for="(destinationData,outputName) in props.node.outputs">{{outputName + " => " + destinationData.destinationNode.name + ":" + destinationData.destinationInputName}}</li>
            </ul>
        </div>
   </BaseNodeComponent>
</template>