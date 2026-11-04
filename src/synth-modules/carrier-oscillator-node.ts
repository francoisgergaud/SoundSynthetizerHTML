import { AudioNodeInput, AudioNodeOutput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synthNodes"

export type CarrierOscillatorConfig = {
    oscillatorType: OscillatorType;
    detune: number;
} & NodeBaseConfig;

export class CarrierOscillator extends SynthBaseNode{
    
    oscillator: OscillatorNode
    gain: GainNode

    constructor(name: string, audioContext: AudioContext, config : CarrierOscillatorConfig | null) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config ? config.oscillatorType : "sine"
        this.gain = audioContext.createGain()
        this.gain.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = 0
        this.oscillator.detune.value = config ? config.detune : 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gain)
        this.oscillator.start()
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

    getInputs() : {[inputName:string]: SynthBaseNodeInput} {
        const result: {[inputName:string]: SynthBaseNodeInput} = {
            "frequency": new AudioNodeInput(this.oscillator.frequency, "frequency"),
            "detune": new AudioNodeInput(this.oscillator.detune, "detune"),
            "gain": new AudioNodeInput(this.gain.gain, "gain")
        }
        return result
    }

    getOutputs(): { [outputName: string]: SynthBaseNodeOutput} {
        return {
            "output": new AudioNodeOutput(this.gain, "output", 0)
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
}