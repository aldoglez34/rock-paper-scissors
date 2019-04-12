// ! global variables
var username;

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

    // create reference
    const dbRef_roomcounter = firebase.database().ref().child("roomcounter");

    // ? 1 - get the value of the child roomcounter and increment it
    dbRef_roomcounter.on("child_added", function (snap) {

        // get it
        var roomCounter = snap.val();
        //increment it
        var incRoomCounter = roomCounter + 1;

        console.log("creating room: room" + incRoomCounter);

        // ? 2 - set the incremented value to the roomcounter child
        dbRef_roomcounter.set({
            val: incRoomCounter
        }, errorHandler);

        // ? set a new child at root level
        // create reference
        const dbRef_root = firebase.database().ref().child("room" + incRoomCounter);
        // set it
        dbRef_root.set({
            onlineplayers: 1,
            player1: username,
            player2: "?"
        }, errorHandler);

        // ? run player 1 listener, send the room as a parameter
        p1_listener("room" + incRoomCounter);

        // ? update the html
        updateHtml("This game room's key is: <b> room" + incRoomCounter + "</b>", "Share room key with a friend and start playing!");

    }, errorHandler);
};

// ! trying to join a room
let tryToJoinRoom = function (room) {

    console.log("looking for room -> " + room);

    // create references
    const dbRef_room = firebase.database().ref().child(room);

    // ? get the values of the given child (room)
    dbRef_room.once("value", function (snap) {

        console.log("online players in '" + room + "' are -> " + snap.val().onlineplayers);

        // ? if the room's online players is less than 2
        if (snap.val().onlineplayers < 2) {

            var op = snap.val().onlineplayers;
            op = op + 1;

            // ? update the online players and player2 value of THAT child 
            dbRef_room.update({
                onlineplayers: op,
                player2: username
            }, errorHandler);

            // ? run player 2 listener, send the room as a parameter
            p2_listener(room);

            // ? update the html
            updateHtml("This is <b>" + snap.val().player1 + "</b>'s room.", "You joined <b>" + snap.val().player1 + "</b>'s room.");
        }
        else {
            alert(room + " is full.");
        }
    }, errorHandler);
};

// ! user listener
let p1_listener = function (room) {

    // create reference
    const dbRef_room = firebase.database().ref().child(room);

    // ? set usernames
    dbRef_room.on("value", function (snap) {

        $("#player1").text(snap.val().player1);
        $("#player2").text(snap.val().player2);

        $("#usermsgmiddle").html("<b>" + snap.val().player2 + "</b> just joined the room!");

    });
};

let p2_listener = function (room) {

    // create reference
    const dbRef_room = firebase.database().ref().child(room);

    // ? set usernames
    dbRef_room.on("value", function (snap) {

        $("#player1").text(snap.val().player2);
        $("#player2").text(snap.val().player1);
    });
};

// ! update the html for a new game
let updateHtml = function (usermsg1, usermsg2) {

    // hide and show containers
    $("#newgamecontainer").hide();
    $("#gamecontainer").show(500);

    // user messages
    $("#usermsgup").html(usermsg1);
    $("#usermsgmiddle").html(usermsg2);

};

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
};
