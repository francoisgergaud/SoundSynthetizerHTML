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
     * remove the reference of the destination's node's input from the ouputs. Ie also remove references
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

export interface TriggerBaseNode{
    
    trigger(enabled: boolean): void
}

export interface AudibleFrequencyBaseNode {
    setFrequency(value: number): void
}

export function isTriggerableBaseNode(object: any): object is TriggerBaseNode {
    //typescript is compile time. Runtime does not know about interface. We must check if the
    //function exists on the object
    return 'trigger' in object;
}

export function isFrequencyBasedOnPitchNode(object: any): object is AudibleFrequencyBaseNode {
    //typescript is compile time. Runtime does not know about interface. We must check if the
    //function exists on the object. We actually set frequencies on carrier AND operator oscillators
    //(operator oscillators apply a ratio on this frequency)
    return 'isFrequencyBasedOnPitch' in object;
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

export class Delay extends SynthBaseNode {

    delay: DelayNode

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}){
        const delayTime: number = config.delayTime as number ?? 0.25
        super(name, audioContext);
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = delayTime;
    }

    getInputs(): {[inputName:string]: AudioParam|AudioNode} {
        return {
            "input": this.delay,
            "delayTime": this.delay.delayTime
        }
    }

    getOutputs():  { [outputName: string]: { node: AudioNode; index: number; }; }{
        return {
            "output": {
                "node": this.delay,
                "index": 0,
            }
        }
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


