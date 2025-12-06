import { Gain } from "./synthNodes"

export class Oscillator extends Gain {
    oscillator: OscillatorNode

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}) {
        super(name, audioContext, config)
        const oscillatorType: OscillatorType = config.oscillatorType as OscillatorType ?? "sine"
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = config.frequency as number ?? 0
        this.oscillator.detune.value = config.detune as number ?? 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gain)
        this.oscillator.start()
    }

    getFrequency(): number {
        return this.oscillator.frequency.value
    }

    setFrequency(value: number) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    getDetune(): number {
        return this.oscillator.detune.value
    }

    setDetune(value: number) {
       this.oscillator.detune.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const inputs = super.getInputs()
        inputs["frequency"] = this.oscillator.frequency
        inputs["detune"] = this.oscillator.detune;
        return inputs
    }

    getType() : OscillatorType {
        return this.oscillator.type
    }

    setType(value: OscillatorType) {
        this.oscillator.type=value
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        result["frequency"] = this.getFrequency()
        result["oscillatorType"] = this.getType()
        result["detune"] = this.getDetune()
        return result
    }
}