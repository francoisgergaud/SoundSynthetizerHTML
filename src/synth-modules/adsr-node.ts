import { AudioNodeOutput, GateInput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synthNodes"

export type ADSRConfig = {
    attackDuration: number;
    decayDuration: number;
    sustainLevel: number;
    sustainDuration: number;
    releaseDuration: number;
} & NodeBaseConfig;

export class ADSR extends SynthBaseNode {

    name: string
    audioContext: AudioContext
    constantSourceNode: ConstantSourceNode
    attackDuration: number
    decayDuration: number
    sustainLevel: number
    sustainDuration: number
    releaseDuration: number

    constructor(name: string, audioContext: AudioContext, config : ADSRConfig | null) {
        super(name, audioContext)
        this.name = name
        this.audioContext = audioContext
        this.attackDuration = config ? config.attackDuration : 0.1
        this.decayDuration = config ? config.decayDuration : 0.1
        this.sustainLevel = config ? config.sustainLevel : 0.5
        this.sustainDuration = config ? config.sustainDuration : 1
        this.releaseDuration = config ? config.releaseDuration: 0.1
        this.constantSourceNode = new ConstantSourceNode(this.audioContext, {offset:0})
        this.constantSourceNode.start();
    }

    getInputs(): { [inputName: string]: SynthBaseNodeInput } {
        /**
         * here we provide the input for audio data to the gain-node, not to the gain-parameter.
         */
        return {
            "trigger": new GateInput(this.name + "_trigger", this.trigger.bind(this))
        }
    }
    getOutputs(): { [outputName: string]: SynthBaseNodeOutput } {
        return {
            "out": new AudioNodeOutput(this.constantSourceNode, "out", 0)
        }
    }
    exportNodeData(): ADSRConfig {
        return {
            ...super.baseExportNodeData(),
            attackDuration: this.attackDuration,
            decayDuration: this.decayDuration,
            sustainLevel: this.sustainLevel,
            sustainDuration: this.sustainDuration,
            releaseDuration: this.releaseDuration
        }
    }

    trigger(time: number) {
        console.debug(`${this.name}: trigger at ${time}`)
        let startTime = time
        this.constantSourceNode.offset.cancelScheduledValues(startTime)
        let endOfAttackTime = startTime + this.attackDuration
        let endOfDecay = endOfAttackTime + this.decayDuration
        let endOfSustain = endOfDecay + this.sustainDuration
        let endOfRelease = endOfSustain + this.releaseDuration
        this.constantSourceNode.offset.setValueAtTime(0, startTime)
        this.constantSourceNode.offset.linearRampToValueAtTime(1, endOfAttackTime)
        this.constantSourceNode.offset.linearRampToValueAtTime(this.sustainLevel, endOfDecay)
        this.constantSourceNode.offset.linearRampToValueAtTime(0, endOfRelease)
    }

}