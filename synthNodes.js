
class Graph {
    
    constructor(){
        this.nodes={}
    }

    addNode(synthNode){
        this.nodes[synthNode.name] = synthNode;
    }

    getNodes(){
        return this.nodes;
    }

    addLink(source, destination){
        source.node.connect(destination, source.index);
    }
}

class BaseOscillator {
    static DEFAULT_FREQUENCY = 440; 
    static DEFAULT_GAIN = 1;

    constructor(name, audioContext){
        this.name = name;
        this.audioContext = audioContext;
        this.oscillator = audioContext.createOscillator();
        this.oscillator.frequency.value = this.constructor.DEFAULT_FREQUENCY;
        this.gain = audioContext.createGain();
        this.gain.gain.value = this.constructor.DEFAULT_GAIN;
        this.muter = audioContext.createGain();
        this.muter.gain.value = 1;
        this.oscillator.connect(this.gain);
        this.gain.connect(this.muter);
        this.oscillator.start();
    }

    setFrequency(value) {
        this.oscillator.frequency.value = value;
    }

    setGain(value) {
        this.gain.gain.value= value;
    }

    getInputs(){
        return {
            "gain": this.gain.gain,
            "frequency": this.oscillator.frequency,
        }
    }

    setType(value) {
        this.oscillator.type= value;
    }

    unmute() {
        this.muter.gain.value= 1;
    }

    mute() {
        this.muter.gain.value= 0;
    }

    getOutputs(){
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }
}

class LFO extends BaseOscillator{
    
    static DEFAULT_FREQUENCY = 1; 
    static DEFAULT_GAIN = 0;


}

class VCO extends BaseOscillator{

    constructor(name, audioContext) {
        super(name, audioContext);
        this.gain.connect(audioContext.destination);
    }
    
    setDetune(value) {
        this.oscillator.detune.value = value;
    }

    getInputs(){
        let result = super.getInputs();
        result["detune"] = this.oscillator.detune;
        return result;
    }

}