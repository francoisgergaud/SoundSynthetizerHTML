

<script setup lang="ts">
  import { ref, computed, type ComputedRef } from "vue"
  import CarrierOscillatorComponent from "./synth-modules/carrier-oscillator.vue"
  import OperatorOscillatorComponent from "./synth-modules/operator-oscillator.vue"
  import DelayComponent from "./synth-modules/delay.vue"
  import FilterComponent from "./synth-modules/filter.vue"
  import SequencerComponent from "./synth-modules/sequencer.vue"
  import AnalyzerComponent from "./synth-modules/analyzer.vue"
  import ADSRComponent from "./synth-modules/adsr.vue"
  import { SynthBaseNode, Delay, Filter } from "./synth-modules/synthNodes"
  import { Graph } from "./graph"
  import type { Sequencer } from "./synth-modules/sequencer-node"
  import type { Analyzer } from "./synth-modules/analyzer-node"
  import type { CarrierOscillator } from "./synth-modules/carrier-oscillator-node"
  import type { ADSR } from "./synth-modules/adsr-node"
  import type { OperatorOscillator } from "./synth-modules/operator-oscillator-node"

  const audioContext = new AudioContext()
  const nodeName = ref<string>("")
  const loadedFile = ref<string>("")
  const nodeType = ref<string>("vco")
  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)
  const isKeyboardPlaying = ref<boolean>(false)

  let graph = ref<Graph>(new Graph(audioContext))


  function addNode() {
    graph.value.addNode(nodeName.value,nodeType.value, {})
  }

  function linkNodes() {
    Graph.linkNodes(source.value!.node, source.value!.outputName, destination.value!.node, destination.value!.inputName)
  }

  function exportGraph() {
    const content = graph.value.export()
    const fileName = "synthModules.json"
    const jsonContent = JSON.stringify(content)
    const blob = new Blob([jsonContent], {type: 'application/json'});
    if((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, fileName);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = fileName;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
  }

  function importGraph(event: Event){
    if ((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files!.length) {
      const file = (event.target as HTMLInputElement).files?.item(0)
      if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
          const fileContent = JSON.parse(event.target!.result! as string); //UTF-8 content should be automatically decoded as string by browser (no array-buffer)
          graph.value.import(fileContent)
        }
        reader.onerror = function (event) {
          document.getElementById("fileUpload")!.innerHTML = "error reading file";
        }
        reader.readAsText(file, "UTF-8");
      }
    }

  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    return graph.value.getAllInputs();
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    return graph.value.getAllOutputs();
  })


  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  function fillKeysFrequencyTable(){
    let frequencyByKey:{[keyName:string]: number} = {}
    let currentKeyName = "A"
    let currentOctave = 4
    let currentFrequency = 440
    let currentKeyIndex = keys.indexOf(currentKeyName)
    frequencyByKey[currentKeyName + currentOctave.toString() ] = currentFrequency
    while( Object.keys(frequencyByKey).length < 12) {
      currentKeyIndex +=  7 //we multiply the frequency by 1.5 for 7 semi-tones
      currentFrequency *= 1.5
      if(currentKeyIndex >=  keys.length) {
        // we went out of the current octave, we go back to the current octave by dividing the frequency by 2
        currentKeyIndex -= keys.length
        currentFrequency /= 2
      }
      currentKeyName = keys[currentKeyIndex]!
      frequencyByKey[currentKeyName + currentOctave.toString() ] = currentFrequency
    }
    return frequencyByKey
  }

  const frequencyByKey = fillKeysFrequencyTable()

  function manageKeyDown(event : KeyboardEvent) {
      if(!isKeyboardPlaying.value) { return }
      if (event.repeat) { return }
      let currentKeyPosition = null
      const currentOctave = 4
      switch(event.key) {
        case 'a': currentKeyPosition = 0; break;
        case 'w': currentKeyPosition = 1; break;
        case 's': currentKeyPosition = 2; break;
        case 'e': currentKeyPosition = 3; break;
        case 'd': currentKeyPosition = 4; break;
        case 'f': currentKeyPosition = 5; break;
        case 't': currentKeyPosition = 6; break;
        case 'g': currentKeyPosition = 7; break;
        case 'y': currentKeyPosition = 8; break;
        case 'h': currentKeyPosition = 9; break;
        case 'u': currentKeyPosition = 10; break;
        case 'j': currentKeyPosition = 11; break;
      }
      if(currentKeyPosition != null) {
        const currentKey: string = keys[currentKeyPosition]!
        console.debug(`keyboard: playing ${currentKey}`)
        let frequency = frequencyByKey[currentKey + currentOctave.toString()]!
        graph.value.trigger(true, frequency)
      }
  }

  window.addEventListener('keydown', manageKeyDown );

  window.addEventListener('keyup', (e) => {
    if(!isKeyboardPlaying.value) { return }
    graph.value.trigger(false, null)
  });

</script>


<template>
  <header>
    <ul class="nav">
        <li class="navlink">
          <label for="fileUpload" class="custom-file-upload">Import</label>
          <input type="file" id="fileUpload" accept="application/json" @change="(event) => importGraph(event)"></input>
        </li>
        <li class="navlink">
          <a id="exportGraph" @click="(event) => exportGraph()">Export</a>
        </li>
    </ul>
  </header>
  <div class="control-group">
    <select id="nodeType" v-model="nodeType">
      <option value="carrier-oscillator">Carrier Oscillator</option>
      <option value="operator-oscillator">Operator Oscillator</option>
      <option value="delay">Delay</option>
      <option value="filter">Filter</option>
      <option value="sequencer">Sequencer</option>
      <option value="analyzer">Analyzer</option>
      <option value="adsr">Envelop</option>
    </select>
       
    &nbsp;
    <input type="text" id="nodeName" placeholder="name" v-model="nodeName"/>
        
    &nbsp;
    <button id="addNode" @click="(event) => addNode()">Add</button>
  </div>

  <div id="nodeConnector" class="control-group">
    <label for="source">
        from
    </label>
    &nbsp;
    <select id="source" v-model="source">
      <option v-for="(output, outputName) in allOutputs" :value="output">
        {{ outputName }}
      </option>
    </select>
    &nbsp;
    <label for="destination">
        to
    </label>
    &nbsp;
    <select id="destination" v-model="destination">
      <option v-for="(input, inputName) in allInputs" :value="input">
        {{ inputName }}
      </option>
    </select>
    &nbsp;
    <button id="addLink" @click="(event) => linkNodes()">Connect nodes</button>
  </div>
  <div id="keyboardPlayMode" class="control-group">
    <button id="keyboardPlayModeDisabled" @click="(event) => isKeyboardPlaying = true" v-show="!isKeyboardPlaying">Not playing</button>
    <button id="keyboardPlayModeEnabled" @click="(event) => isKeyboardPlaying = false" v-show="isKeyboardPlaying">Playing</button>
  </div>

  <div id="nodes">
    <div v-for="(nodeData,nodeName) in graph.nodes" v-bind:key="nodeName">
        <CarrierOscillatorComponent v-if="nodeData.type === 'carrier-oscillator' " :node="nodeData.node as CarrierOscillator"></CarrierOscillatorComponent>
        <OperatorOscillatorComponent v-if="nodeData.type === 'operator-oscillator' " :node="nodeData.node as OperatorOscillator"></OperatorOscillatorComponent>
        <DelayComponent v-if="nodeData.type === 'delay' " :node="nodeData.node as Delay"></DelayComponent>
        <FilterComponent v-if="nodeData.type === 'filter' " :node="nodeData.node as Filter"></FilterComponent>
        <SequencerComponent v-if="nodeData.type === 'sequencer' " :node="nodeData.node as Sequencer"></SequencerComponent>
        <AnalyzerComponent v-if="nodeData.type === 'analyzer' " :node="nodeData.node as Analyzer"></AnalyzerComponent>
        <ADSRComponent v-if="nodeData.type === 'adsr' " :node="nodeData.node as ADSR"></ADSRComponent>
    </div>
  </div>
 
</template>
