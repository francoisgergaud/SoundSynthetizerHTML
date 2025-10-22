<script setup lang="ts">
    import { ref } from 'vue'
    import { MusicSequence } from './synthNodes'

    const props = defineProps<{
        node: MusicSequence,
    }>()

</script>

<template>
    <div class="synth-node">
        <div>
            <label class="header">
                {{props.node.name}}
            </label>
        </div>
    </div>
</template>