import { SynthBaseNode, type AudibleFrequencyBaseNode, type NodeBaseConfig, type TriggerBaseNode } from "./synthNodes"

export type OperatorOscillatorConfig = {
    oscillatorType: OscillatorType;
    // modulation's index is the amplitude of the modulqtion
    modulationIndex: number;
    // ratio is the operator frequency ratio compared to the original frequency
    ratio: number;
} & NodeBaseConfig;

export class OperatorOscillator extends SynthBaseNode implements AudibleFrequencyBaseNode, TriggerBaseNode {
    oscillator: OscillatorNode
    gainForModulationIndex: GainNode
    envelopGain: GainNode
    frequencyBasedOnPitch: boolean
    envelopInputConnected: boolean
    ratio: number
    static readonly ENVELOP_INPUT_NAME: string = "envelop"

    constructor(name: string, audioContext: AudioContext, config: OperatorOscillatorConfig | null) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config ? config.oscillatorType : "sine"
        this.envelopGain = audioContext.createGain()
        this.gainForModulationIndex = audioContext.createGain()
        this.gainForModulationIndex.gain.value = config ? config.modulationIndex : 1;
        this.envelopGain.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.envelopGain)
        this.oscillator.start()
        this.frequencyBasedOnPitch = true
        this.envelopInputConnected = false
        this.ratio = config? config.ratio : 1
    }

    setFrequency(value: number) {
        const frequency = value * this.ratio
        console.debug(`${this.name}: change frequency to ${frequency}`)
        this.oscillator.frequency.value = frequency
    }

    getRatio(): number {
        return this.ratio
    }

    setRatio(value: number): void {
        this.ratio = value
    }

    setModulationIndex(value: number) {
        this.gainForModulationIndex.gain.value = value
    }

    getModulationIndex(): number {
        return this.gainForModulationIndex.gain.value
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const result: {[inputName:string]: AudioParam | AudioNode} = {
            "frequency": this.oscillator.frequency
        }
        result[OperatorOscillator.ENVELOP_INPUT_NAME]=this.envelopGain.gain
        return result
    }

    getOutputs(): { [outputName: string]: { node: AudioNode; index: number } } {
        return {
            "output": {
                "node": this.envelopGain,
                "index": 0
            }
        }
    }

    getType() : OscillatorType {
        return this.oscillator.type
    }

    setType(value: OscillatorType) {
        this.oscillator.type=value
    }

    exportNodeData(): OperatorOscillatorConfig {
        return {
            ...super.baseExportNodeData(),
            oscillatorType: this.getType(),
            ratio: this.getRatio(),
            modulationIndex: this.getModulationIndex()
        }
    }

    /**
     * link the input and reference the envelop-trigger if ADSR is connected
     * @param sourceNode the source-node to connect to this node
     * @param sourceOutputName the source-node's output to connect
     * @param inputName the node's input to be connected
     */
    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.linkInput(sourceNode, sourceOutputName, inputName)
        this.envelopInputConnected = this.linkedInputs.has(OperatorOscillator.ENVELOP_INPUT_NAME)
    }

    /**
     * unlink the input and unreference the envelop-trigger if ADSR is connected 
     * @param sourceNode the source-node to be disconnected from this node
     * @param sourceOutputName the source-node's output to disconnect
     * @param inputName the node's input to be disconnected
     */
    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.unlinkInput(sourceNode, sourceOutputName, inputName)
        this.envelopInputConnected = this.linkedInputs.has(OperatorOscillator.ENVELOP_INPUT_NAME)
    }

    /**
     * triggers check if there is an node connected tot he envelop input. If this is the case,
     * we do nothing as the node connected tot he envelop input is supposed to activate the gain.
     * If there is nothing connected tot the envelop input, we simulate a dummy envelop with immediate attack, no decay an immediate release.
     * The sustain is set to full gain.
     */
    trigger(enabled: boolean) {
        console.debug(`${this.name}: trigger ${enabled}`)
        if(! this.envelopInputConnected) {
            this.envelopGain.gain.value = enabled ? 1 : 0
        }
    }
}