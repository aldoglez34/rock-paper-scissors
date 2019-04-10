// ! global variables
var username;
var database = firebase.database();

// ! on load window function
window.onload = function () {

    // hide containers
    $("#gamecontainer").hide();

    // if there's a username in the local storage, show it
    if (localStorage.getItem("rpsgame") != null) {

        $("#usernameinput").val(localStorage.getItem("rpsgame"));
    }
};

// ! creating a new room button
$("#createnewroombttn").click(function () {

    // set username in the global variable
    username = $("#usernameinput").val();

    // verify the username isn't blank
    let usernamePass = verifyUsername(username);

    if (usernamePass) {

        // saves user in the local storage if checkbox "remember me" is checked
        if (document.getElementById("remembermeinput").checked === true) {

            localStorage.setItem("rpsgame", username);
        }

        // create new room on the db
        createNewRoom();

        // starts a new game
        startGame();
    }
});

// ! joining a room button
$("#joinroom").click(function () {

    // set username in the global variable
    username = $("#usernameinput").val();
    // verify the username isn't blank
    let usernamePass = verifyUsername(username);

    // set the room input variable and convert it to lower case
    let roominput = $("#roomkeyinput").val();
    roominput = roominput.toLowerCase()
    // verify the room key isn't blank
    let roomKeyPass = verifyRoomKey(roominput);

    // if both inputs are ok, enter the room
    if (usernamePass && roomKeyPass) {

        tryToJoinRoom(roominput);
    }
});

// ! create a new room function

let createNewRoom = function () {

    var roomcounter;

    // get the room counter from the db
    database.ref("_roomcounter").on("child_added", function (snapshot) {

        roomcounter = snapshot.val();
        roomcounter = roomcounter + 1;

        // update html
        $("#gamekey").text("room" + roomcounter);
        $("#myusername").text(username);

        // update it + 1
        database.ref("_roomcounter").set({ val: roomcounter }, errorHandler);

        // create the room in the "rooms" directory with the new roomcounter
        database.ref("rooms").push({

            _playersonline: 1,
            _roomid: "room" + roomcounter,
            player1: username,
            player2: ""

        }, errorHandler);
    }, errorHandler);
}

// ! all the functions needed to join the room

let tryToJoinRoom = function (roominput) {

    // ? look through all the rooms in the root directory
    database.ref("rooms").on("child_added", function (snapshot) {

        // console.log(roominput);
        // console.log(snapshot);
        // console.log(snapshot.val());
        // console.log("---------------------------------------------------------");

        // if (snapshot.val()._roomid = roominput) {
        //     console.log(snapshot.val());
        // }

        // // ? if the room input exists as a child in the db
        // if (roominput === id) {

        //     // set 2 to the players online field
        //     database.ref("rooms").update({
        //         _playersonline: "2"
        //     });

        // }
        // else {
        //     console.log("The room '" + roominput + "' doesn't exist in the database.");
        // }
    }, errorHandler);

};

let checkIfRoomExists = function (roominput, roomsArray) {

    var exists = false;

    for (var i = 0; i < roomsArray.length; i++) {

        if (roominput === roomsArray[i]) {

            exists = true;
        }
    }

    return exists;
};

let checkIfRoomIsFull = function (roominput, cbf_getOnlinePlayers) {

    let op = cbf_getOnlinePlayers(roominput);

    if (op >= 2) {

        alert("Room is full, there are " + op + " players online.");
    }
    else {

        console.log("Room is available, there are " + op + " players online.");
        console.log("YOU CAN ENTER THE GAME!!!");
    }
};

let getOnlinePlayers = function (roominput) {

    let op;

    database.ref("Rooms").on("child_added", function (snapshot) {

        op = snapshot.val()._playersonline;
    });

    return op;
};

// ! starting the game function

let startGame = function () {

    // hide and show containers
    $("#newgamecontainer").hide();
    $("#gamecontainer").show(500);

    // let thisroom = roomcounter + 1;

    // show room
    // $("#gamekey").text("room" + thisroom);
}

// ! global functions

let verifyUsername = function (username) {

    let usernamePass;

    if (username.trim() === "") {

        usernamePass = false;
        alert("Your username is blank.");
    }
    else {

        usernamePass = true;
    }

    return usernamePass;
};

let verifyRoomKey = function (roominput) {

    let roomKeyPass;

    if (roominput.trim() === "") {

        roomKeyPass = false;
        alert("The room key is blank.");
    }
    else {

        roomKeyPass = true;
    }

    return roomKeyPass;
};

// ! error handler function
function errorHandler(errorObject) {
    console.log("The read failed: ", errorObject);
}