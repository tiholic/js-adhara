class AdharaController{

    control(method, context, data){
        Controller.control(method, context, data);
    };

    getData(context, data){
        this.control('get', context, data);
    };

    getListData(context, data){
        this.control('get_list', context, data);
    };

    putData(context, data){
        this.control('put', context, data);
    };

    postData(context, data){
        this.control('post', context, data);
    };

    deleteData(context, data){
        this.control('delete', context, data);
    };

}