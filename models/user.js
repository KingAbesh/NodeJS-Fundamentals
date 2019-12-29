const mongodb = require("mongodb");
const getDB = require("../utils/database").getDB;

class User {

    constructor(username, email){
        this.name = username;
        this.email = email;
    }

    save(){
        const db = getDB();
        return db.collection('users').insertOne(this);
    }

    static findById(id){
        const id = getDB();
        return db.collection('users').findOne({_id: new mongodb.ObjectId(id)});
    }

}

module.exports = User;