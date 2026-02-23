import { SynthBaseNode, type NodeBaseConfig, type TriggerBaseNode } from "./synthNodes"

export type ADSRConfig = {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
} & NodeBaseConfig;

export class ADSR extends SynthBaseNode implements TriggerBaseNode {

    name: string
    audioContext: AudioContext
    constantSourceNode: ConstantSourceNode
    attack: number
    decay: number
    sustain: number
    release: number

    constructor(name: string, audioContext: AudioContext, config : ADSRConfig | null) {
        super(name, audioContext)
        this.name = name
        this.audioContext = audioContext
        this.attack = config ? config.attack : 0.1
        this.decay = config ? config.decay : 0.1
        this.sustain = config ? config.sustain : 0.5
        this.release = config ? config.release: 0.1
        this.constantSourceNode = new ConstantSourceNode(this.audioContext, {offset:0})
        this.constantSourceNode.start();
    }

    getInputs(): { [inputName: string]: AudioParam | AudioNode; } {
        /**
         * here we provide the input for audio data to the gain-node, not to the gain-parameter.
         */
        return {}
    }
    getOutputs(): { [outputName: string]: { node: AudioNode; index: number; }; } {
        return {
            "out": {node: this.constantSourceNode, index: 0}
        }
    }
    exportNodeData(): ADSRConfig {
        return {
            ...super.baseExportNodeData(),
            attack: this.attack,
            decay: this.decay,
            sustain: this.sustain,
            release: this.release
        }
    }

    trigger(enabled: boolean) {
        console.debug(`${this.name}: trigger ${enabled}`)
        let startTime = this.audioContext.currentTime!
        this.constantSourceNode.offset.cancelScheduledValues(startTime)
        if(enabled) {
            let endOfAttackTime = startTime + this.attack
            let endOfDecay = endOfAttackTime + this.decay
            this.constantSourceNode.offset.setValueAtTime(0, startTime)
            this.constantSourceNode.offset.linearRampToValueAtTime(1, endOfAttackTime)
            this.constantSourceNode.offset.linearRampToValueAtTime(this.sustain, endOfDecay)
        } else {
            let endOfRelease = startTime + this.release
            this.constantSourceNode.offset.linearRampToValueAtTime(0, endOfRelease)
        }
    }

}