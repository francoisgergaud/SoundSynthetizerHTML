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

    getAllInputs(){
        result = {}
        for(const nodeName in this.nodes){
            const nodeInputs = this.nodes[nodeName].getInputs();
            for(const inputName in nodeInputs){
                let key = `${nodeName}/${inputName}`
                result[key] = nodeInputs[inputName];
            }   
        }
        return result;
    }

    getAllOutputs(){
        result = {}
        for(const nodeName in this.nodes){
            const nodeOutputs = this.nodes[nodeName].getOutputs();
            for(const outputName in nodeOutputs){
                let key = `${nodeName}/${outputName}`
                result[key] = nodeOutputs[outputName];
            }   
        }
        return result;
    }

    setOptionsForSelect(selectElementId, optionsMapping){
        const selectElement = document.getElementById(selectElementId);
        selectElement.innerHTML = "";
        for(optionId in optionsMapping) {
            const newOption = new Option(optionId, optionId);
            selectElement.add(newOption);
        }
    }

}