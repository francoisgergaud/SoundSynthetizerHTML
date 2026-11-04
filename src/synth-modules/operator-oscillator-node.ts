import { AudioNodeInput, AudioNodeOutput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synthNodes"

export type OperatorOscillatorConfig = {
    oscillatorType: OscillatorType;
    // modulation's index is the amplitude of the modulation
    modulationIndex: number;
    // ratio is the operator frequency ratio compared to the original frequency
    ratio: number;
} & NodeBaseConfig;

export class OperatorOscillator extends SynthBaseNode {
    oscillator: OscillatorNode
    gainForModulationIndex: GainNode
    gain: GainNode
    ratio: number

    constructor(name: string, audioContext: AudioContext, config: OperatorOscillatorConfig | null) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config ? config.oscillatorType : "sine"
        this.gain = audioContext.createGain()
        this.gainForModulationIndex = audioContext.createGain()
        this.gainForModulationIndex.gain.value = config ? config.modulationIndex : 1;
        this.gain.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gain)
        this.oscillator.start()
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

    getInputs() : {[inputName:string]: SynthBaseNodeInput} {
        const result: {[inputName:string]: SynthBaseNodeInput} = {
            "frequency": new AudioNodeInput(this.oscillator.frequency, "frequency"),
            "gain": new AudioNodeInput(this.gain.gain, "gain"),
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

    exportNodeData(): OperatorOscillatorConfig {
        return {
            ...super.baseExportNodeData(),
            oscillatorType: this.getType(),
            ratio: this.getRatio(),
            modulationIndex: this.getModulationIndex()
        }
    }
}