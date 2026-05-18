<script setup lang="ts">
    import { onMounted, ref, useTemplateRef, watch } from 'vue';

    const props = defineProps<{
        stepValue: number | undefined
    }>()

    watch(() => props.stepValue, (oldValue, newValue) => {
        stepValue.value = newValue
    });

    const emit = defineEmits(['changeStepValue'])

    const trackStepInputHTMLElement = useTemplateRef('trackStepInput')
    const trackStepInputDivHTMLElement = useTemplateRef('trackStepInputDiv')

    let editMode = ref<boolean>(false)
    let stepValue = ref<number | undefined>(props.stepValue)

    function showEditMode() {
        editMode.value = true        
    }

    function saveStepValue() {
        emit('changeStepValue', stepValue.value)
        //props.track.setStepValue(props.stepNumber,stepValue.value)
        editMode.value = false
    }

    onMounted(
        () => {
            // Once the template's HTMLElement are mounted, create an observer
            // on the div containing the input field so that when this Div is display, its input HTMLElement
            //takes the focus. This makes it possible to apply the "blur" event on this input. If this element is not focus,
            // div with there inputs qre displayed on eqch click and their "blur" event is not executed when displaying another track-step's input-div
            const observer = new MutationObserver(
                (mutations) => {
                    if ((mutations[0]!.target as HTMLElement).style.display == "block")
                        trackStepInputHTMLElement.value?.focus()
                }, 
            );
            // Start observing the target node for configured mutations
            observer.observe(trackStepInputDivHTMLElement.value!, {attributes: true, attributeFilter: ["style"]});
        }
    )
    
</script>

<template>
    <div class="trackStep">
        <div @click="showEditMode" :style="{'display': !editMode ? 'inline': 'none' }">
            {{stepValue?.toFixed(0) || 0}}
        </div>
         <div ref="trackStepInputDiv" :style="{'display': editMode ? 'inline': 'none' }">
            <input ref="trackStepInput" type="text" v-model="stepValue" @blur="saveStepValue"/>
        </div>
    </div>
</template>