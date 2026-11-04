<script setup lang="ts">
    import { ref, useTemplateRef } from 'vue'
    import CarrierOscillatorComponent from "./carrier-oscillator.vue"
    import OperatorOscillatorComponent from "./operator-oscillator.vue"
    import DelayComponent from "./delay.vue"
    import FilterComponent from "./filter.vue"
    import AnalyzerComponent from "./analyzer.vue"
    import ADSRComponent from "./adsr.vue"
    import type { OperatorOscillator } from './operator-oscillator-node.ts';
    import type { CarrierOscillator } from './carrier-oscillator-node.ts';
    import type { Delay } from './delay-node.ts';
    import type { Filter } from './filter-node.ts';
    import type { Analyzer } from './analyzer-node.ts';
    import type { ADSR } from './adsr-node.ts';
    import { rackStore, addSynthModuleOnRack as storeAddSynthModuleOnRack, addRack as storeAddRack, moveSynthModuleOnRack as storeMoveSynthModuleOnRack } from './rack-store.js'
    import type { Graph } from '@/graph.ts'

    const props = defineProps<{
        graph: Graph,
    }>()

    const addSynthNodeModal = useTemplateRef('addSynthNodeModal')

    //const racks = ref<{node: SynthBaseNode, type: string}[][]>([[]])
    const addModuleCurrentRackIndex = ref<number>(0)
    const currentDraggingElement = ref<[number|null, number|null]>([null,null]);
    const currentDragOverElement = ref<[number|null, number|null]>([null,null]);
    const draggingElementBoundingRect = ref<DOMRect | null>(null)

    const nodeName = ref<string>("")
    const nodeType = ref<string>("vco")
    const addSynthNodeModalErrorMessage = ref<string>("")

    function showAddModuleDialog(rackIndex: number) {
        addModuleCurrentRackIndex.value = rackIndex
        addSynthNodeModal.value!.showModal()
    }

    function addSynthModuleOnRack() {
        if (nodeName.value == ""|| nodeType.value == "") {
            addSynthNodeModalErrorMessage.value = "Node name or type is empty"
            return
        } else if (props.graph.nodes[nodeName.value]) {
            addSynthNodeModalErrorMessage.value = "Node name already exists"
            return
        } else {
            addSynthNodeModalErrorMessage.value = ""
            props.graph.addNode(nodeName.value,nodeType.value, null)
            storeAddSynthModuleOnRack(
                props.graph.nodes[nodeName.value]!.node,
                nodeType.value,
                addModuleCurrentRackIndex.value
            )
            nodeName.value = ""
            nodeType.value = ""
        }
    }

    function addRack() {
        storeAddRack()
    }

    function dragRackNode(originRackIndex: number, originPositionInRack: number, event: DragEvent){
        const target = event.target as HTMLDivElement
        draggingElementBoundingRect.value = target.getBoundingClientRect()
        console.debug("dragRackNode", originRackIndex, originPositionInRack,  target.getBoundingClientRect())
        currentDraggingElement.value = [originRackIndex, originPositionInRack]
    }

    function dragEndRackNode(originRackIndex: number, originPositionInRack: number, event: DragEvent){
        console.debug("dragEndRackNode", originRackIndex, originPositionInRack)
        currentDraggingElement.value = [null, null]
        currentDragOverElement.value = [null, null]
    }

    function dragEnter(destinationRackIndex: number, destinationPositionInRack: number){
        console.debug("dragEnter", destinationRackIndex, destinationPositionInRack)
        currentDragOverElement.value = [destinationRackIndex, destinationPositionInRack]
    }

    function dropRackNode(destinationRackIndex: number, destinationPositionInRack: number){
        console.debug("dropRackNode", destinationRackIndex, destinationPositionInRack)
        const originRackIndex = currentDraggingElement.value[0]
        const originPositionInRack = currentDraggingElement.value[1]
        storeMoveSynthModuleOnRack(originRackIndex!, originPositionInRack!, destinationRackIndex, destinationPositionInRack)
        currentDragOverElement.value = [null, null]
    }

    function setDraggable(e: MouseEvent, isDraggable: boolean) {
        const target = (e.target as HTMLElement)!.parentNode as HTMLElement
        target.setAttribute("draggable", isDraggable.toString())
    }

</script>

<template>
    <div v-for="(rack, rackIndex) in rackStore.racks" class="rack">
        <div v-for="(nodeData, nodeIndex) in rack" style="display: inline-flex;"
            @dragenter="dragEnter(rackIndex,nodeIndex)"
            @dragover.prevent
        >
            <div class="synth-node-container drag-over-indicator" 
                v-if="currentDragOverElement[0] === rackIndex && currentDragOverElement[1] === nodeIndex && (currentDraggingElement[0] !== rackIndex || currentDraggingElement[1] !== nodeIndex)"
                draggable="false" 
                @drop.stop.prevent="dropRackNode(rackIndex,nodeIndex)"
                :style="{ 'width': draggingElementBoundingRect!.width + 'px', 'backgroundColor': 'lightgray' }"
                >
                Drop here
            </div>
            <div class="synth-node-container" 
                draggable="false" 
                @dragstart="(event) => dragRackNode(rackIndex,nodeIndex, event)"
                @dragend="(event) => dragEndRackNode(rackIndex,nodeIndex, event)"
            >
                <label class="header" @mousedown="e=> setDraggable(e, true)" @mouseup="e => setDraggable(e, false)">
                    {{nodeData.node.name}}
                </label>
                <CarrierOscillatorComponent v-if="nodeData.type === 'carrier-oscillator'" :node="nodeData.node as CarrierOscillator" :id="nodeName"></CarrierOscillatorComponent>
                <OperatorOscillatorComponent v-if="nodeData.type === 'operator-oscillator' " :node="nodeData.node as OperatorOscillator" :id="nodeName"></OperatorOscillatorComponent>
                <DelayComponent v-if="nodeData.type === 'delay' " :node="nodeData.node as Delay" :id="nodeName"></DelayComponent>
                <FilterComponent v-if="nodeData.type === 'filter' " :node="nodeData.node as Filter" :id="nodeName"></FilterComponent>
                <AnalyzerComponent v-if="nodeData.type === 'analyzer' " :node="nodeData.node as Analyzer" :id="nodeName"></AnalyzerComponent>
                <ADSRComponent v-if="nodeData.type === 'adsr' " :node="nodeData.node as ADSR" :id="nodeName"></ADSRComponent>
            </div>
        </div>
        <div @dragenter="dragEnter(rackIndex,-1)" @dragover.prevent >
            <div class="synth-node-container drag-over-indicator" 
                v-if="currentDragOverElement[0] === rackIndex && currentDragOverElement[1] === -1"
                draggable="false" 
                @drop.stop.prevent="dropRackNode(rackIndex,-1)"
                :style="{ 'width': draggingElementBoundingRect!.width + 'px', 'backgroundColor': 'lightgray' }"
            >
                Drop here
            </div>
            <div class="synth-node-container add-synth-node-container" 
                draggable="false"
                @click="() => showAddModuleDialog(rackIndex)"
            >
                Add module
            </div>
        </div>
    </div>
    <div>
        <button @click="() => addRack()">Add rack</button>
    </div>
        

    <dialog ref="addSynthNodeModal">

        <div v-if="addSynthNodeModalErrorMessage" class="error-message">{{ addSynthNodeModalErrorMessage }}</div>

        <div class="control-group">
            <select id="nodeType" v-model="nodeType">
                <option value="carrier-oscillator">Carrier Oscillator</option>
                <option value="operator-oscillator">Operator Oscillator</option>
                <option value="delay">Delay</option>
                <option value="filter">Filter</option>
                <option value="analyzer">Analyzer</option>
                <option value="adsr">Envelop</option>
            </select>
            
            &nbsp;
            <input type="text" id="nodeName" placeholder="name" v-model="nodeName"/>
                
            &nbsp;
            <button id="addNode" @click="(event) => addSynthModuleOnRack()">Add</button>
        </div>

        <div class="control-group">
            <button id="cancelAddNode" @click="() => addSynthNodeModal!.close()">Cancel</button>
        </div>
    </dialog>
</template>