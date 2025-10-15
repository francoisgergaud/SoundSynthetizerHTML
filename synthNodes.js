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
        this.isMuted = false;
        this.oscillator.start();
    }

    setFrequency(value) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    setGain(value) {
        this.gain.gain.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs(){
        return {
            "gain": this.gain.gain,
            "frequency": this.oscillator.frequency,
        }
    }

    setType(value) {
        this.oscillator.type=value;
    }

    unmute() {
        this.muter.gain.value= 1;
        this.isMuted = false;
    }

    mute() {
        this.muter.gain.value= 0;
        this.isMuted = true;
    }

    getOutputs(){
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }

    render(parentDiv){

        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="control-group">
                <label>
                    <span>${this.name} (VCO)</span>
                </label>
                <div class="control-group">
                    <label for="${this.name}-frequency">Frequency (Hz): <span id="${this.name}-freqValue">${this.oscillator.frequency.value}</span></label>
                    <input type="range" id="${this.name}-frequency" min="20" max="5000" value="${this.oscillator.frequency.value}" step="1">
                </div>

                <div class="control-group">
                    <label for="${this.name}-waveform">Waveform Type:</label>
                    <select id="${this.name}-waveform">
                        <option value="sine" ${this.oscillator.type=='sine' ? "selected": ""}>Sine</option>
                        <option value="square" ${this.oscillator.type=='square' ? "selected": ""}>Square</option>
                        <option value="sawtooth" ${this.oscillator.type=='sawtooth' ? "selected": ""}>Sawtooth</option>
                        <option value="triangle" ${this.oscillator.type=='triangle' ? "selected": ""}>Triangle</option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="${this.name}-volume">Volume: <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}</span>%</label>
                    <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
                </div>

                <div class="control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;
        parentDiv.appendChild(childDiv);
        // Update displayed values
        document.getElementById(`${this.name}-frequency`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-freqValue`).textContent = event.currentTarget.value;
            this.setFrequency(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value/100);
        });

        document.getElementById(`${this.name}-waveform`).addEventListener('change', (event) => {
            this.setType(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
            if(event.currentTarget.checked){
                this.mute();
            } else {
                this.unmute();
            }
        });
    }
}

class LFO extends BaseOscillator{
    
    static DEFAULT_FREQUENCY = 1; 
    static DEFAULT_GAIN = 0;
}

class VCO extends BaseOscillator{

    constructor(name, audioContext) {
        super(name, audioContext);
        this.muter.connect(audioContext.destination);
    }
    
    setDetune(value) {
        this.oscillator.detune.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs(){
        let result = super.getInputs();
        result["detune"] = this.oscillator.detune;
        return result;
    }

}