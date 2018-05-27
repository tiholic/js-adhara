class DataBlob extends Serializable{
    // extender blobs represent tree like objects only

    constructor(data) {
        super(data);
        if(!data){
            return;
        }
        this._data =  data;
        let data_is_fine = this.validate(data);
        if (data_is_fine === false) {
            throw new Error(`assigned data does not clear the custom validation: ${data}`);
        }
        this.onInit();
    }

    /**
     * Easy override method: to handle creating any cacheable objects/references classes
     * */
    onInit(){

    }

    static get _context() {
        return "base";
    }

    // noinspection JSAnnotator
    get data() {
        return this._data;
    }

    set data(data) {
        if(!Serializable._validateData(data)) {  // all blobs are validated for serializability
            throw new Error(`blob must represent a non-array, tree-like object ${data}`);
        }
        let data_is_fine = this.validate(data);   // custom validators must throw their own errors or return a false status on failure
        if(data_is_fine === false) {
            throw new Error(`assigned data does not clear the custom validation: ${data}`);
        }
        this._data = data;
    }

    get packet() {
        return this.serialize();
    }

    validate(){
        return true;
    }

    _formatTimeBit(value){
        return ((value.toString().length === 1)?"0":"")+value.toString();
    }

    //TODO generalize this using string format's
    _formatTime(date){
        return `${this._formatTimeBit(date.getHours())}:${this._formatTimeBit(date.getMinutes())}:${this._formatTimeBit(date.getSeconds())}`;
    }

    //TODO generalize this using string format's
    _formatDate(date){
        return `${this._formatTimeBit(date.getDate())}/${this._formatTimeBit(date.getMonth())}/${date.getFullYear()}`;
    }

}