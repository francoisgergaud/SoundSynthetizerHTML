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

        </div>
   </BaseNodeComponent>
</template>