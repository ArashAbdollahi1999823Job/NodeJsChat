var socket = io();

function scrollFunction() {
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    // height
    var clientHeight = messages.prop('clientHeight');//636
    var scrollTop = messages.prop('scrollTop');//scroll untel top
    var scrollHeight = messages.prop('scrollHeight');//scroll


    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight;


    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

//connect
socket.on('connect', function () {
    console.log('conneted to server');


    var params = $.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = "/";
        } else {
            console.log('no err');
        }
    })

})

socket.on('updateUserList', function (users) {
    var ol = $('<ol></ol>');
    users.forEach(function (users) {
        ol.append($('<li></li>').text(users))
    })
    $('#users').html(ol);
})

//disconnect
socket.on('disconnect', function () {
    console.log('disconneted to server');

})


//get
socket.on('newMessage', function (message) {
    var formated = moment(message.createAt).format('hh:mm:a');
    console.log('new message=', message);

    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createAt: formated,
    })
    $('#messages').append(html);
    scrollFunction();
})
socket.on('newLocation', function (doc) {
    var formated = moment(doc.createAt).format('hh:mm:a');
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        url: doc.url,
        from: doc.from,
        createAt: formated,
    })
    $('#messages').append(html);
    scrollFunction();
})


$('#message-form').on('submit', function (e) {
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'user',
        text: $('[name=message]').val(),
    }, function () {
        $('[name=message]').val('');
    })
})


var locationbtn = $('#send-location');


locationbtn.on('click', function () {
    if (!navigator.geolocation) {
        return alert('geolocation not supported by your browser');
    }

    locationbtn.attr('disabled', 'disabled').text('sending location ...');


    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position, 'this is position');

        locationbtn.removeAttr('disabled').text('send location');

        socket.emit('createLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        })
    }, function () {
        alert('note fetch connection');
        locationbtn.removeAttr('disabled').text('send location');
    })
})


