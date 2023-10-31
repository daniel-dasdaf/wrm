import { getColl, publishRef, loginUser, signOut, authUser} from './firebase.js';

var map = L.map('map').setView([39.75, -8.033], 7);
var isMapClickable = false;
var courseArr = [];
var tracksStatus = []
var markup__event, markup__event_latlng, linetrack;
let polylineMeasure = L.control.polylineMeasure();
polylineMeasure.addTo (map);
const form = document.getElementById('form')
const news = document.getElementById('news__wrapper');

window.addEventListener("DOMContentLoaded", async (e) => {
    const querySnapshot = await getColl("runnings", "event_status");
    querySnapshot.forEach((doc) => {
        const eventProperties = [
            {label: 'Event status', value: doc.data().event_status},
            {label: 'Event Name', value: doc.data().event_name},
            {label: 'Event Type', value: doc.data().event_type},
            {label: 'Event Date', value: formatDate(doc.data().event_date)},
            {label: 'Event url', value: doc.data().event_url}
        ]
        L.marker(JSON.parse('[' + JSON.parse(doc.data().event_marker) + ']')).addTo(map).on('click', function(){
            if (linetrack){
                map.removeLayer(linetrack);
            }
            linetrack = L.polyline(JSON.parse(doc.data().event_course), {color: 'orange'}).addTo(map);
            map.addLayer(linetrack);
        });

        // Create div
        var newDiv = document.createElement('div');
        newDiv.className = 'new__run';
        eventProperties.forEach((property) => {
            switch(property.label){
                case 'Event Name':
                    var value = document.createElement('h2');
                    value.textContent =  property.value ? property.value : 'Not set';
                    value.className = 'text';
                    newDiv.appendChild(value);
                break;
                case 'Event status':
                    var value = document.createElement('p');
                    value.textContent =  property.value ? property.value : 'Not set';
                    value.className = 'run__status';
                    value.dataset.value = property.value
                    newDiv.dataset.status = property.value
                    newDiv.appendChild(value);
                break;
                default:
                    var value = document.createElement('p');
                    value.textContent = property.label + ": " + (property.value ? property.value : 'Not set');
                    value.className = 'text';
                    newDiv.appendChild(value);
                break;
            }
        
        })
        
        news.appendChild(newDiv)

    });
});

function formatDate (input) {
    var datePart = input.match(/\d+/g),
    year = datePart[0].substring(), // get only two digits
    month = datePart[1], day = datePart[2];
    return day+'/'+month+'/'+year;
}

// Toggle side-panel view
var headerBtns = document.querySelectorAll('.right-side > *');

headerBtns.forEach(key => {
    key.addEventListener('click', function(){
        console.log(this.getAttribute('class').split(' ')[0])

        switch(this.getAttribute('class').split(' ')[0]){
            case 'add-markup':
                document.getElementById('add-markup').classList.remove('hidden');
                document.getElementById('news').classList.add('hidden')
            break;
            case 'news':
                document.getElementById('news').classList.remove('hidden');
                document.getElementById('add-markup').classList.add('hidden')
            break;
            case 'login':
                document.getElementById('login-modal').style.display='grid';
            break;
            case 'logout':
                signOut();
                document.getElementById('logout').style.display='none';
            break;
        }
    })
})

document.getElementById('checkstatus').addEventListener('input', (e) => {
    var codeInput = document.getElementById('checkstatus').value;
    tracksStatus.forEach(key => {
        if(codeInput === key[0]){
            switch(key[1]){
                case 'active':
                    document.getElementById('checkstatus').style.backgroundColor = "green";
                    document.getElementById('checkstatus').style.borderColor = "green";
                break;
                case 'pending':
                    document.getElementById('checkstatus').style.backgroundColor = "orange";
                    document.getElementById('checkstatus').style.borderColor ="orange";
                break;
                case 'denied':
                    document.getElementById('checkstatus').style.backgroundColor = "red";
                    document.getElementById('checkstatus').style.borderColor = "red";
                break;
            }
        }
    })

})

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function addMarker(e){
    document.querySelector(".map__input").value = "Markup is setted, click to change again"
    markup__event = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    markup__event_latlng = markup__event._latlng.lat+', '+ markup__event._latlng.lng;
    document.getElementById("event_markup").value = markup__event_latlng;
    markup__event.bindPopup(document.getElementById("event_name").value)
    isMapClickable = false;
    return
}
document.querySelector(".map__input").addEventListener('click', () => {
    if (markup__event){
        map.removeLayer(markup__event)
    }
    document.querySelector(".map__input").value = "Waiting"
    isMapClickable = true;
})
// On insert a point, sends it to CourseArray;
map.on('polylinemeasure:insert', function(e){
    //addMarker(e);
    e.circleCoords.forEach(key => {
        var lat = key.lat
        var lng = key.lng
        var latlng = [lat, lng];
        courseArr.push(latlng)
    }); 
})
// On change removes the previous course array and sets it to the new one.
map.on('polylinemeasure:change', function(e){
    courseArr = [];
    e.circleCoords.forEach(key => {
        var lat = key.lat
        var lng = key.lng
        var latlng = [lat, lng];
        courseArr.push(latlng)
    }); 
    document.getElementById("geographic_route").value = JSON.stringify(courseArr)
})
map.on('polylinemeasure:clear', function(e){
    //console.log(e, courseArr)
    L.polyline(courseArr, {color: 'blue'}).addTo(map);
})

map.on("click", function(e){
    if(isMapClickable){
        addMarker(e);
    }
})

//FORM HANDLER
form.addEventListener('submit', function(e){
    e.preventDefault();

    const data = {
        event_date: document.getElementById('event_date').value,
        event_description: document.getElementById('event_description').value,
        event_location: document.getElementById('event_location').value,
        event_logo: "",
        event_name: document.getElementById('event_name').value,
        event_start_time: document.getElementById('event_start_time').value,
        event_status: "Pending",
        event_type: document.getElementById('event_type').value,
        event_uid: `WRM_${new Date().getTime()}`, // need this to be unique
        event_url: document.getElementById('event_url').value,
        event_course: JSON.stringify(courseArr),
        event_marker: JSON.stringify(markup__event_latlng)
    }

    authUser()
    .then((user) => {
        if (user) {
            console.log('User is signed in:', user);
            publishRef("runnings", data);
        } else {
            console.log('User is not signed in.');
        }
    })
    .catch((error) => {
        console.error('Error checking authentication:', error);
    });
})

document.getElementById('submit-login').addEventListener('click', function(e){
    e.preventDefault();
    const email = document.getElementById('email').value;      
    const password = document.getElementById('password').value;

    loginUser(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('User logged in:', user);
        // Redirect to a protected route or update the UI fan   authenticated user.
        })
        .catch((error) => {
        console.error('Login error:', error);
        // Handle login errors, e.g., show an error message the user.
    });
})

document.getElementById('login-modal').addEventListener('click', (e) => {
    if(e.target.id){
        document.getElementById('login-modal').style.display= 'none'
    }
})