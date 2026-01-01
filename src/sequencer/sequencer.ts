import { Graph } from "@/graph"
import { SynthBaseNode } from "@/synth-modules/synthNodes"

export class Sequencer{
    
    name: string
    audioContext: AudioContext
    previousStep: number // playing previous index
    currentStep: number // playing current index
    intervalId: number | null // id of the timer use to sequence the beats' steps
    numberOfStep: number // the number of steps
    tracks: Track[]
    stepDurationTimeSeconds: number // the step time in seconds
    nextNoteTimeSeconds: number | null
    numberOfBeat: number
    numberOfStepsPerBeat: number
    tempo: number
    trackDurationSeconds: number
    _intervalId: number | null
    speakers: AudioDestinationNode

    constructor(name: string, audioContext: AudioContext) {
        this.name = name
        this.audioContext = audioContext
        this.previousStep = 0
        this.currentStep = 0
        this.intervalId = null
        this.numberOfBeat = 4 // 4 beats
        this.numberOfStepsPerBeat = 4 //16th notes (4 sub-division in a beat)
        this.tempo = 90
        this.trackDurationSeconds = this.numberOfBeat * (60/this.tempo)
        this.numberOfStep = this.numberOfBeat * this.numberOfStepsPerBeat
        this.stepDurationTimeSeconds = 60/(this.tempo * this.numberOfStepsPerBeat)
        this.tracks = []
        this.nextNoteTimeSeconds = null
        this._intervalId = null
        this.speakers = audioContext.destination
    }


    scheduleNextStep() {
        console.debug(`${this.name}: play step ${this.currentStep} at ${this.nextNoteTimeSeconds}`)
        for(const track of this.tracks){
            console.debug(`track: ${track.name}`)
            const previousStepValue = track.getStepValue(this.previousStep)
            const currentStepvalue = track.getStepValue(this.currentStep)
            console.debug(`${this.name}: ${track.name} value ${currentStepvalue}`)
            if(previousStepValue == 0) {
                if(currentStepvalue != 0) {
                    track.getGraph().trigger(true, currentStepvalue)
                }
            } else {
                if(currentStepvalue == 0) {
                    console.debug(`track ${track.name}: release`)
                    track.getGraph().trigger(false, null)
                } else {
                    track.getGraph().trigger(true, currentStepvalue)
                }
            }
           
        }
        this.previousStep = this.currentStep
        this.currentStep = (this.currentStep + 1) % this.numberOfStep
        this.nextNoteTimeSeconds! += this.stepDurationTimeSeconds
    }

    start() {
        this.previousStep = 0
        this.currentStep = 0
        this.nextNoteTimeSeconds = this.audioContext.currentTime
        const stepDurationTimeMs = this.stepDurationTimeSeconds *1000
        this._intervalId = setInterval(this.scheduleNextStep.bind(this), stepDurationTimeMs)
        this.scheduleNextStep()
    }

    stop() {
        for(const track of this.tracks){
            track.getGraph().trigger(false,0)
        }
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
            this.currentStep = 0;
            console.log("Sequencer stopped.");
        }
    }

    addTrack(trackName: string, steps: {number:number} | null, graphConfig: {[nodeName:string]: any} | null) {
        const track =  new Track(this.audioContext, trackName, steps, graphConfig, this.speakers)
        this.tracks.push(track)
        return track
    }

    getTracks(): Track[] {
        return this.tracks
    }

    export(): { [propertyName: string]: any } {
        let result: {[propertyName: string]: any} = {
            "tracks": [],
            "tempo": this.tempo,
            "numberOfBeat": this.numberOfBeat,
            "numberOfStepsPerBeat": this.numberOfStepsPerBeat,
        }
        for(const track of this.tracks){
            result["tracks"].push(track.export())
        }
        return result;
    }

    import(config : {[parameterName: string]: any}): void {
        this.stop()
        this.numberOfBeat = config?.numberOfBeat as number
        this.numberOfStepsPerBeat = config?.numberOfStepsPerBeat as number
        this.tempo = config?.tempo as number
        this.trackDurationSeconds = this.numberOfBeat * (60/this.tempo)
        this.numberOfStep = this.numberOfBeat * this.numberOfStepsPerBeat
        this.stepDurationTimeSeconds = 60/(this.tempo * this.numberOfStepsPerBeat)
        this.tracks = []
        if(config?.tracks) {
            for(const trackConfig of config!.tracks as {name: string, steps: {number:number}, graph: object}[]) {
                this.addTrack(trackConfig.name, trackConfig.steps, trackConfig.graph)
            }
        }
    }
}

export class Track {

    name: string
    steps: {[stepId:number]: number}
    graph: Graph

    constructor(audioContext: AudioContext, name: string, steps: {number: number} | null, graphConfig: {[nodeName:string]: any} | null, destination: AudioDestinationNode) {
        this.name = name 
        if(steps) {
            this.steps = steps
        } else {
            this.steps = {}
        }

        const trackOutNode = new TrackOutNode(audioContext, destination)
        this.graph = new Graph(audioContext, trackOutNode)
        if(graphConfig) {
            this.graph.import(graphConfig)
        }
    }

    getStepValue(step: number): number {
        return this.steps[step] || 0
    }

    setStepValue(step: number, value: number) {
        this.steps[step] = value
    }

    export(): { [propertyName: string]: any } {
        return {
            "name": this.name,
            "steps": this.steps,
            "graph": this.graph.export()
        }
    }

    getGraph(): Graph {
        return this.graph
    }

}

export class TrackOutNode extends SynthBaseNode {

    gain : GainNode

    constructor(audioContext: AudioContext, destination: AudioDestinationNode){
        super("track", audioContext)
        this.gain = audioContext.createGain()
        //TODO implement channel splitter and left/right pan
        this.gain.connect(destination)
    }
    
    getInputs(): { [inputName: string]: AudioNode; } {
        return {"out": this.gain}
    }
   
    getOutputs(): { [outputName: string]: { node: AudioNode; index: number; }; } {
        return {};
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        return {}
    }

}