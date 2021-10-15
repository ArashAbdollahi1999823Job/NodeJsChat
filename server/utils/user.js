class Users {

    constructor() {
        this.users = [];
    }

    addUsers(id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user
    }


    removeUser(id) {
        var user = this.getUser(id);
        this.users=this.users.filter((user)=> user.id!==id);
        return user;
    }

    getUser(id) {

        return this.users.filter((user) => user.id == id)[0]
    }

    getUserList(room) {
        var usersList = this.users.filter((user) => user.room === room);
        var nameArray = usersList.map((user) => user.name);
        return nameArray;
    }
}

module.exports={Users}