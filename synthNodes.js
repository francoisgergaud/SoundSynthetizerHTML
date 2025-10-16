class GainNode {
    constructor(name, audioContext) {
        this.name = name
        this.audioContext = audioContext;

        this.gain = audioContext.createGain();
        this.gain.gain.value = 1;

        this.muter = audioContext.createGain();
        this.muter.gain.value = 1;
        this.isMuted = false;

        this.gain.connect(this.muter);
    }

    setGain(value) {
        this.gain.gain.setValueAtTime(value, this.audioContext.currentTime);
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
}

class BaseOscillator extends GainNode {
    static DEFAULT_FREQUENCY = 440; 
    static DEFAULT_GAIN = 1;

    constructor(name, audioContext) {
        super(name, audioContext);
        this.oscillator = audioContext.createOscillator();
        this.oscillator.frequency.value = this.constructor.DEFAULT_FREQUENCY;
        this.oscillator.connect(this.gain);
        this.oscillator.start();
    }

    setFrequency(value) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs(){
        return {
            "frequency": this.oscillator.frequency,
            "gain": this.gain.gain,
        }
    }

    setType(value) {
        this.oscillator.type=value;
    }
}

class LFO extends BaseOscillator{
    
    static DEFAULT_FREQUENCY = 1; 
    static DEFAULT_GAIN = 0;

    render(parentDiv){

        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="control-group">
                <label>
                    <span>-------------------${this.name}-------------------</span>
                </label>
                <div class="control-group">
                    <label for="${this.name}-frequency">Frequency (Hz): <span id="${this.name}-freqValue">${this.oscillator.frequency.value}</span></label>
                    <input type="range" id="${this.name}-frequency" min="0" max="10" value="${this.oscillator.frequency.value}" step="0.1">
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
                    <label for="${this.name}-gain">Gain: <span id="${this.name}-gainValue">${this.gain.gain.value}</span>%</label>
                    <input type="text" id="${this.name}-gain" value="${this.gain.gain.value}">
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

        document.getElementById(`${this.name}-gain`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-gainValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value);
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

class VCO extends BaseOscillator{

    constructor(name, audioContext) {
        super(name, audioContext);
    }

    setDetune(value) {
        this.oscillator.detune.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs(){
        let result = super.getInputs();
        result["detune"] = this.oscillator.detune;
        return result;
    }

    render(parentDiv){

        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="control-group">
                <label>
                    <span>-------------------${this.name}-------------------</span>
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

class Delay extends GainNode {
    constructor(name, audioContext){
        super(name, audioContext);
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = 0.25;
        this.delay.connect(this.gain);
    }

    getInputs(){
        return {
            "input": this.delay,
            "delayTime": this.delay.delayTime,
            "gain": this.gain.gain
        }
    }

    setDelayTime(seconds) {
        this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
    }

    render(parentDiv) {
        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="control-group">
                <label>
                    <span>-------------------${this.name}-------------------</span>
                </label>
                <div class="control-group">
                    <label for="${this.name}-delayTime">Delay (s): <span id="${this.name}-delayTimeValue">${this.delay.delayTime.value}</span></label>
                    <input type="range" id="${this.name}-delayTime" min="0" max="1" value="${this.delay.delayTime.value}" step="0.05">
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
        document.getElementById(`${this.name}-delayTime`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-delayTimeValue`).textContent = event.currentTarget.value;
            this.setDelayTime(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value / 100);
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

class Filter extends GainNode {
        constructor(name, audioContext){
        super(name, audioContext);
        this.filter = audioContext.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = 440;
        this.filter.Q.value = 1;
        this.filter.connect(this.gain);
    }

    getInputs(){
        return {
            "input": this.filter,
            "type": this.filter.type,
            "cutoffFrequency": this.filter.frequency,
            "Q": this.filter.Q
        }
    }

    setFilterType(value) {
        this.filter.type = value;
    }

    setCutoffFrequency(value) {
        this.filter.frequency.setValueAtTime(value, this.audioContext.currentTime);
    }

    setQ(value) {
        this.filter.Q.setValueAtTime(value, this.audioContext.currentTime);
    }

    render(parentDiv) {
        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="control-group">
                <label>
                    <span>-------------------${this.name}-------------------</span>
                </label>
                <div class="control-group">
                    <label for="${this.name}-filterType">Filter type: <span id="${this.name}-filterTypeValue">${this.filter.type}</span></label>
                    <select id="${this.name}-filterType">
                        <option value="lowpass" ${this.filter.type=='lowpass' ? "selected": ""}>Lowpass</option>
                        <option value="highpass" ${this.filter.type=='highpass' ? "selected": ""}>Highpass</option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="${this.name}-cutoffFrequency">Cutoff Frequency: <span id="${this.name}-cutoffFrequencyValue">${this.filter.frequency.value}</span>Hz</label>
                    <input type="range" id="${this.name}-cutoffFrequency" min="0" max="5000" value="${this.filter.frequency.value}" step="1">
                </div>
                
                <div class="control-group">
                    <label for="${this.name}-Q">Quality Factor: <span id="${this.name}-QValue">${this.filter.Q.value}</span></label>
                    <input type="range" id="${this.name}-Q" min="1" max="10" value="${this.filter.Q.value}" step="1">
                </div>

                <div class="control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;

        parentDiv.appendChild(childDiv);

        // Update displayed values
        document.getElementById(`${this.name}-filterType`).addEventListener('change', (event) => {
            this.setFilterType(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-cutoffFrequency`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-cutoffFrequencyValue`).textContent = event.currentTarget.value;
            this.setCutoffFrequency(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-Q`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-QValue`).textContent = event.currentTarget.value;
            this.setQ(event.currentTarget.value);
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
