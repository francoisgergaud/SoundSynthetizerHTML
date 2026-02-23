import { SynthBaseNode, type NodeBaseConfig } from "./synthNodes";

export type DelayConfig = {
    delayTime: number;
} & NodeBaseConfig;

export const MAX_DELAY_TIME = 5

export class Delay extends SynthBaseNode {

    delay: DelayNode

    constructor(name: string, audioContext: AudioContext, config : DelayConfig | null){
        const delayTime: number = config ? config.delayTime : 0.25
        super(name, audioContext);
        this.delay = audioContext.createDelay(MAX_DELAY_TIME);
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
        // the setValueAtTime on delayTyme a-param does not work (at least in chromium), and I have no idea why....
        //this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
        this.delay.delayTime.value = seconds
    }

    exportNodeData(): DelayConfig {
        return {
            ...super.baseExportNodeData(),
            delayTime: this.getDelayTime(),
        }
    }
}