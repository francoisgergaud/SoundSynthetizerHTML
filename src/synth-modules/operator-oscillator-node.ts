import { Gain } from "./synthNodes"

export class OperatorOscillator extends Gain {
    oscillator: OscillatorNode
    isFrequencyBasedOnPitch: boolean
    ratio: number

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}) {
        super(name, audioContext, config)
        const oscillatorType: OscillatorType = config.oscillatorType as OscillatorType ?? "sine"
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = config.frequency as number ?? 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gain)
        this.oscillator.start()
        this.isFrequencyBasedOnPitch = true
        this.ratio = 1
    }

    getFrequency(): number {
        return this.oscillator.frequency.value
    }

    setFrequency(value: number) {
        const frequency = value * this.ratio
        console.debug(`${this.name}: change frequency to ${frequency}`)
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    }

    getRatio(): number {
        return this.ratio
    }

    setRatio(value: number) {
        this.ratio = value
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const inputs = super.getInputs()
        inputs["frequency"] = this.oscillator.frequency
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
        result["ratio"] = this.getRatio()
        return result
    }
}