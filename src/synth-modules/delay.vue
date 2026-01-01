<script setup lang="ts">
    import { ref } from 'vue'
    import BaseNodeComponent from './base-node-component.vue';
    import type { Delay } from './delay-node';

    const props = defineProps<{
        id: string,
        node: Delay,
    }>()

    let delayParameter = ref<string>(props.node.getDelayTime().toString())


    function changeDelay(value: string) {
        delayParameter.value = value
        props.node.setDelayTime(+delayParameter.value)
    }

</script>

<template>
    <BaseNodeComponent :node="props.node">
        <div class="synth-node-control-group">
            <label :for="`${props.id}-delay`">Delay (seconds): </label>
            <input type="range" :id="`${props.id}-delay`" min="0" max="5" :value="delayParameter" step="0.1" @input="(event) => changeDelay((event.currentTarget as HTMLInputElement).value)">
            <span :id="`${props.id}-delayValue`">{{delayParameter}}</span>
        </div>
    </BaseNodeComponent>
</template>