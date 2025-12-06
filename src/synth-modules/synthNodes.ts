import type { Graph } from "@/graph"

export abstract class SynthBaseNode {
    
    audioContext: AudioContext
    name: string
    //linkedInputs:  {[inputName: string]:  { [sourceNodeName: string]: { [sourceOutputName: string]: {sourceNode: SynthBaseNode} }}}
    linkedInputs: Map<string, Map<string, Map<string,SynthBaseNode>>>
    //linkedOutputs:  {[outputName: string]:  { [destinationNodeName: string]: {[destinationInputName: string]: {destinationNode: SynthBaseNode; } }}}
    linkedOutputs: Map<string, Map<string, Map<string,SynthBaseNode>>>
    

    constructor(name: string, audioContext: AudioContext){
        this.name = name
        this.audioContext = audioContext
        this.linkedInputs = new Map()
        this.linkedOutputs = new Map()
    }

    abstract getInputs() : {[inputName:string]: AudioParam | AudioNode}
    abstract getOutputs() : {[outputName: string]: {node: AudioNode; index: number}}


    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        //TODO: isn't there a way to have default when accessing an object property or map key in Javascript?
        //still experimental: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert
        if(!(this.linkedInputs.has(inputName))) {
            this.linkedInputs.set(inputName, new Map())
        }
        const linkedInput = this.linkedInputs.get(inputName)!
        const sourceNodeName = sourceNode.name
        if(!(linkedInput.has(sourceNodeName))) {
            linkedInput.set(sourceNodeName, new Map())
        }
        const linkedInputSourceNode = linkedInput.get(sourceNodeName)!
        if(!(linkedInputSourceNode.has(sourceOutputName))) {
            linkedInputSourceNode.set(sourceOutputName, sourceNode)
        }
    }

    linkOutput(destinationNode: SynthBaseNode, destinationInputName: string, outputName: string){
        //TODO: isn't there a way to have default when accessing an object property or map key in Javascript?
        //still experimental: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert
        if(!(this.linkedOutputs.has(outputName))) {
            this.linkedOutputs.set(outputName, new Map())
        }
        const linkedOutput = this.linkedOutputs.get(outputName)!
        const destinationNodeName = destinationNode.name
        if(!(linkedOutput.has(destinationNodeName))) {
            linkedOutput.set(destinationNodeName, new Map())
        }
        const linkedOutputDestinationNode = linkedOutput.get(destinationNodeName)!
        if(!(linkedOutputDestinationNode.has(destinationInputName))) {
            linkedOutputDestinationNode.set(destinationInputName, destinationNode)
        }   
    }

    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        if(this.linkedInputs.has(inputName)) {
            const linkedInput = this.linkedInputs.get(inputName)!
            const sourceNodeName = sourceNode.name
            if(linkedInput.has(sourceNodeName)) {
                const linkedInputSourceNode = linkedInput.get(sourceNodeName)!
                if(linkedInputSourceNode.has(sourceOutputName)) {
                    linkedInputSourceNode.delete(sourceOutputName)
                }
            }
        }
    }

    unlinkOutput(destinationNode: SynthBaseNode, destinationInputName: string, outputName: string){
        if(this.linkedOutputs.has(outputName)) {
            const linkedOutput = this.linkedOutputs.get(outputName)!
            const destinationNodeName = destinationNode.name
            if(linkedOutput.has(destinationNodeName)) {
                const linkedOutputDestinationNode = linkedOutput.get(destinationNodeName)!
                if(linkedOutputDestinationNode.has(destinationInputName)) {
                    linkedOutputDestinationNode.delete(destinationInputName)
                }
            }
        }
    }

    abstract exportNodeData(): {[isPropertyNamee: string]: string|number|boolean}

    baseExportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        return {"name": this.name}
    }

    export(): {nodeData: object, linkedInputs:{inputName: string; sourceNodeName: string; sourceOutputName: string}[]} {
        const linkedInputs = []
        //reminder: inputs format:  {[inputName: string]:  { [sourceNodeName: string]: { [sourceOutputName: string]: {sourceNode: SynthBaseNode} }}}
        for(const inputName of this.linkedInputs.keys()) {
            for(const sourceNodeName of this.linkedInputs.get(inputName)!.keys()) {
                for(const sourceOutputName of this.linkedInputs.get(inputName)!.get(sourceNodeName)!.keys()) {
                    linkedInputs.push(
                        {
                            "inputName": inputName,
                            "sourceNodeName": sourceNodeName,
                            "sourceOutputName": sourceOutputName
                        }
                    )
                }
            }
        }
        return {
            "linkedInputs": linkedInputs,
            "nodeData": this.exportNodeData()
        }
    }
}

export abstract class Gain extends SynthBaseNode{
    gain: GainNode
    muter: GainNode
    isMuted: boolean

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}) {
        super(name, audioContext);
        const gain: number = config.gain as number ?? 1
        const isMuted: boolean = config.isMuted as boolean ?? false
        this.gain = audioContext.createGain()
        this.gain.gain.value = gain;

        this.muter = audioContext.createGain()
        this.isMuted = isMuted
        if(this.isMuted)  {
            this.muter.gain.value = 0
        } else {
            this.muter.gain.value = 1
        }
        this.gain.connect(this.muter)
    }

    getGain(): number {
        return this.gain.gain.value
    }

    setGain(value: number) {
        this.gain.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    isMute(): boolean {
        return this.isMuted
    }

    unmute() {
        this.muter.gain.value= 1;
        this.isMuted = false;
    }

    mute() {
        this.muter.gain.value= 0;
        this.isMuted = true;
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        return {
            "gain": this.gain.gain,
        }
    }

    getOutputs() : {[outputName:string]: {node: AudioNode, index: number }}{
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }

    baseExportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        result["gain"] = this.getGain()
        result["isMuted"] = this.isMuted
        return result
    }
}



export class Speaker extends SynthBaseNode {

    constructor(audioContext: AudioContext){
        super("speaker", audioContext)
    }
    
    getInputs(): { [inputName: string]: AudioNode; } {
        return {"speakers": this.audioContext.destination}
    }
   
    getOutputs(): { [outputName: string]: { node: AudioNode; index: number; }; } {
        return {};
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        return result
    }

}

export class Delay extends Gain {

    delay: DelayNode

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}){
        const delayTime: number = config.delayTime as number ?? 0.25
        super(name, audioContext, config);
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = delayTime;
        this.delay.connect(this.gain);
    }

    getInputs(): {[inputName:string]: AudioParam|AudioNode} {
        const inputs = super.getInputs();
        inputs["input"] = this.delay
        inputs["delayTime"] = this.delay.delayTime
        return inputs
    }

    getOutputs():  { [outputName: string]: { node: AudioNode; index: number; }; }{
        const outputs = super.getOutputs();

        outputs["oscillator"] = {
            "node": this.delay,
            "index": 0,
        }

        return outputs;
    }

    getDelayTime(): number {
        return this.delay.delayTime.value
    }

    setDelayTime(seconds: number) {
        this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        result["delayTime"] = this.getDelayTime()
        return result
    }
}

export class Filter extends Gain {

    filter: BiquadFilterNode
        
    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}){
        const cutoffFrequency: number = config.cutoffFrequency as number ?? 440
        const filterType: BiquadFilterType = config.filterType as BiquadFilterType ?? "lowpass"
        const q: number = config.q as number ?? 1
        const filterGain: number = config.filterGain as number ?? 1
        const filterDetune: number = config.filterDetune as number ?? 1
        super(name, audioContext, config);
        this.filter = audioContext.createBiquadFilter();
        this.filter.frequency.value = cutoffFrequency;
        this.filter.type = filterType
        this.filter.Q.value = q;
        this.filter.gain.value = filterGain
        this.filter.detune.value = filterDetune
        this.filter.connect(this.gain);
    }

    getInputs(){
        return {
            "input": this.filter,
            "cutoffFrequency": this.filter.frequency,
            "Q": this.filter.Q,
            "filterGain": this.filter.gain,
            "cutoffFrequencyDetune": this.filter.detune
        }
    }

    getFilterType(): BiquadFilterType {
        return this.filter.type;
    }

    setFilterType(value: BiquadFilterType) {
        this.filter.type = value;
    }

    getCutoffFrequency(): number {
        return this.filter.frequency.value
    }

    setCutoffFrequency(value: number) {
        this.filter.frequency.setValueAtTime(value, this.audioContext.currentTime);
    }

    getQ(): number {
        return this.filter.Q.value
    }

    setQ(value: number) {
        this.filter.Q.setValueAtTime(value, this.audioContext.currentTime);
    }

    getFilterGain(): number {
        return this.filter.gain.value
    }

    setFilterGain(value: number) {
        this.filter.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    getFilterDetune(): number {
        return this.filter.gain.value
    }

    setFilterDetune(value: number) {
        this.filter.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        result["filterType"] = this.getFilterType()
        result["cutoffFrequency"] = this.getCutoffFrequency()
        result["q"] = this.getQ()
        result["filterGain"] = this.getFilterGain()
        result["filterDetune"] = this.getFilterDetune()
        return result
    }
}
