import { SynthBaseNode, type AudibleFrequencyBaseNode, type NodeBaseConfig, type TriggerBaseNode } from "./synthNodes"

export type CarrierOscillatorConfig = {
    oscillatorType: OscillatorType;
    detune: number;
} & NodeBaseConfig;

export class CarrierOscillator extends SynthBaseNode implements AudibleFrequencyBaseNode, TriggerBaseNode{
    
    oscillator: OscillatorNode
    envelopGain: GainNode
    // is the frequency controlled by events (note from the user or sequencer)?
    frequencyBasedOnPitch: boolean
    static readonly ENVELOP_INPUT_NAME: string = "envelop"
    // is the "envelop" input controled by another node/ connected to another node?
    envelopInputConnected: boolean

    

    constructor(name: string, audioContext: AudioContext, config : CarrierOscillatorConfig | null) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config ? config.oscillatorType : "sine"
        this.envelopGain = audioContext.createGain()
        this.envelopGain.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = 0
        this.oscillator.detune.value = config ? config.detune : 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.envelopGain)
        this.oscillator.start()
        this.frequencyBasedOnPitch = true
        this.envelopInputConnected = false
    }

    getFrequency(): number {
        return this.oscillator.frequency.value
    }

    setFrequency(value: number) {
        this.oscillator.frequency.value = value
    }

    getDetune(): number {
        return this.oscillator.detune.value
    }

    setDetune(value: number) {
       this.oscillator.detune.value = value
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const result: {[inputName:string]: AudioParam | AudioNode} = {
            "frequency": this.oscillator.frequency,
            "detune": this.oscillator.detune,
        }
        result[CarrierOscillator.ENVELOP_INPUT_NAME]=this.envelopGain.gain
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

    exportNodeData(): CarrierOscillatorConfig {
        return {
            ...super.baseExportNodeData(),
            oscillatorType: this.getType(),
            detune: this.getDetune()
        }
    }

    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.linkInput(sourceNode, sourceOutputName, inputName)
        this.envelopInputConnected = this.linkedInputs.has(CarrierOscillator.ENVELOP_INPUT_NAME)
    }

    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.unlinkInput(sourceNode, sourceOutputName, inputName)
        this.envelopInputConnected = this.linkedInputs.has(CarrierOscillator.ENVELOP_INPUT_NAME)
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
            console.debug("oscillator default envelop triggered")
            this.envelopGain.gain.setTargetAtTime(enabled ? 1: 0, this.audioContext.currentTime, 0.02)
        }
    }
}