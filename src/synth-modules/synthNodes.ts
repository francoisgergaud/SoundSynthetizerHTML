import { isThisTypeNode } from "typescript";

export type NodeBaseConfig = {
    name: string;
}

export type NodeConfig = {
    nodeData: NodeBaseConfig, 
    linkedInputs:{inputName: string; sourceNodeName: string; sourceOutputName: string}[]
}

/**
 * the interface for a node's input. It is used to connect nodes together. It is implemented by AudioNodeInput and GateInput.
 */
export interface SynthBaseNodeInput {
    readonly type: string
    readonly name: string
}

export class AudioNodeInput implements SynthBaseNodeInput {

    type:string = "AudioNode"
    audioNode: AudioNode | AudioParam

    constructor(public node: AudioNode | AudioParam, public name: string) {
        this.audioNode = node
        this.name = name
    }
}

export class GateInput implements SynthBaseNodeInput {

    readonly type:string = "Gate"
    triggerCallback: (time: number) => void

    constructor(public name: string, triggerCallback: (time: number) => void) {
        this.name = name
        this.triggerCallback = triggerCallback
    }

    trigger(time: number) {
        this.triggerCallback(time)
    }
}

/**
 * the interface for a node's output. It is used to connect nodes together. It is implemented by AudioNodeOutput and GateOutput.
 */
export interface SynthBaseNodeOutput {
    readonly type: string
    readonly name: string
    connectTo(input: SynthBaseNodeInput): void
    disconnect(input: SynthBaseNodeInput): void
}

export class AudioNodeOutput implements SynthBaseNodeOutput {

    readonly type:string = "AudioNode"
    audioNode: AudioNode
    index: number

    constructor(public node: AudioNode, public name: string, index: number) {
        this.audioNode = node
        this.name = name
        this.index = index
    }

    connectTo(input: SynthBaseNodeInput) {
        if(input.type === "AudioNode") {
            const inputAudioNode = (input as AudioNodeInput).audioNode
            if(inputAudioNode instanceof AudioNode){
                this.node.connect(inputAudioNode, this.index);
            } else if(inputAudioNode instanceof AudioParam) {
                this.node.connect(inputAudioNode, this.index);
            } else {
                throw new Error("Cannot connect AudioNode to input of type " + typeof(inputAudioNode))
            }
        } else {
            throw new Error("Cannot connect AudioNodeOutput to input of type " + input.type)
        }
    }

    disconnect(input: SynthBaseNodeInput) {
        if(input.type === "AudioNode") {
            const inputAudioNode = (input as AudioNodeInput).audioNode
            if(inputAudioNode instanceof AudioNode){
                this.node.disconnect(inputAudioNode, this.index);
            } else if(inputAudioNode instanceof AudioParam) {
                this.node.disconnect(inputAudioNode, this.index);
            } else {
                throw new Error("Cannot disconnect AudioNode to input of type " + typeof(inputAudioNode))
            }
        } else {
            throw new Error("Cannot disconnect AudioNodeOutput to input of type " + input.type)
        }
    }
}

export class GateOutput implements SynthBaseNodeOutput {

    type:string = "Gate"
    linkedateInputs: GateInput[]

    constructor(public name: string) {
        this.name = name
        this.linkedateInputs = []
    }
    
    connectTo(input: SynthBaseNodeInput) {
        if(input.type === "Gate") {
            this.linkedateInputs.push(input as GateInput)
        } else {
            throw new Error("Cannot connect GateOutput to input of type " + input.type)
        }
    }

    disconnect(input: SynthBaseNodeInput): void {
        const index = this.linkedateInputs.indexOf(input as GateInput);
        if (index > -1) {
            this.linkedateInputs.splice(index, 1);
        } else {
            throw new Error("Cannot disconnect GateOutput to input of type " + input.type)
        }
    }
    
    trigger(time: number) {
        for(const input of this.linkedateInputs) {
            input.trigger(time)
        }
    }
}

export abstract class SynthBaseNode {
    
    audioContext: AudioContext
    name: string
    linkedInputs: Map<string, Map<string, Map<string,SynthBaseNode>>>
    linkedOutputs: Map<string, Map<string, Map<string,SynthBaseNode>>>


    constructor(name: string, audioContext: AudioContext){
        this.name = name
        this.audioContext = audioContext
        this.linkedInputs = new Map()
        this.linkedOutputs = new Map()
    }

    abstract getInputs() : {[inputName:string]: SynthBaseNodeInput}
    abstract getOutputs() : {[outputName: string]: SynthBaseNodeOutput}


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

    /**
     * remove the reference of the source's node's output from the inputs. Ie also remove references
     * to source-node and input-name is empty.
     */
    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        if(this.linkedInputs.has(inputName)) {
            const linkedInput = this.linkedInputs.get(inputName)!
            const sourceNodeName = sourceNode.name
            if(linkedInput.has(sourceNodeName)) {
                const linkedInputSourceNode = linkedInput.get(sourceNodeName)!
                if(linkedInputSourceNode.has(sourceOutputName)) {
                    linkedInputSourceNode.delete(sourceOutputName)
                }
                //remove source-node element from linked-input's map if empty
                if(linkedInputSourceNode.size === 0) {
                    linkedInput.delete(sourceNodeName)
                }
                //remove input-name element from linked-inputs' map if empty
                if(linkedInput.size === 0) {
                    this.linkedInputs.delete(inputName)
                }
            }
        }
    }

    /**
     * remove the reference of the destination's node's input from the ouputs. It also removes references
     * to destination-node and output-name is empty.
     */
    unlinkOutput(destinationNode: SynthBaseNode, destinationInputName: string, outputName: string){
        if(this.linkedOutputs.has(outputName)) {
            const linkedOutput = this.linkedOutputs.get(outputName)!
            const destinationNodeName = destinationNode.name
            if(linkedOutput.has(destinationNodeName)) {
                const linkedOutputDestinationNode = linkedOutput.get(destinationNodeName)!
                if(linkedOutputDestinationNode.has(destinationInputName)) {
                    linkedOutputDestinationNode.delete(destinationInputName)
                }
                if(linkedOutputDestinationNode.size === 0) {
                    linkedOutput.delete(destinationNodeName)
                }
                 if(linkedOutput.size === 0) {
                    this.linkedOutputs.delete(outputName)
                }
            }
        }
    }

    abstract exportNodeData(): NodeBaseConfig

    baseExportNodeData(): NodeBaseConfig {
        return {"name": this.name}
    }

    export(): NodeConfig {
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