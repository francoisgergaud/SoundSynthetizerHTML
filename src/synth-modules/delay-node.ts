import { SynthBaseNode } from "./synthNodes";

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