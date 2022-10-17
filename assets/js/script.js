const url = "https://dummy-apis.netlify.app/api/contact-suggestions?count=";
let pplInfo = [];
const storage = localStorage.getItem("ppl");
let count = 0;
const randomBgs = [
  "../../assets/img/blood.png",
  "../../assets/img/bubbles.png",
  "../../assets/img/halloween.png",
  "../../assets/img/hotpink.png",
  "../../assets/img/spring.png",
];
// first time page load - catching ppl
if (storage === null) {
  init(8);
} else {
  pplInfo = JSON.parse(storage);
  renderPeople();
}

// render person cards
function renderPeople() {
  count = 0;
  let cardHtml = "";
  let pendingHtml = "";
  const pplOutput = document.querySelector("#ppl");
  const pendingOut = document.querySelector("#pending");
  pplOutput.innerHTML = "";

  //for each person  in our array
  pplInfo.forEach((person, index) => {
    let mutuals = hasMutuals(person);
    let stateOut = readState(person);

    cardHtml += `<div class="card">
    <div class="card_bg" style="--bg-img: url(${person.backgroundImage})">
      <button class="delete_button" onclick="deleteCard(${index})">
        <img src="assets/img/x-lg.svg" class="close-icon" alt="" />
      </button>
    </div>
    <img
      src="${person.picture}"
      alt="Profile Picture"
      class="profile_pic"
    />
    <div class="person_info">
      <p class="person_name">${person.name.title} ${person.name.first} ${person.name.last}</p>
      <p class="person_position">${person.title}</p>
      <p class="person_mutuals">${mutuals}</p>
    <button class="connect_button" onclick="changeStateBtn(${index})">${stateOut}</button>
    </div>
  </div>`;
  });

  pendingHtml = selectPendingOut(count);
  pplOutput.insertAdjacentHTML("afterbegin", cardHtml);
  pendingOut.innerText = pendingHtml;
}

//get ppl data from api and add states
async function getPplData(count) {
  pplInfo = [];
  const response = await fetch(url + count);
  const data = await response.json();
  pplInfo.push(...data);
  addConnectState();
}

//background from api or local if there is none
function setBackground(person) {
  let randomBanner = randomBgs[Math.floor(Math.random() * randomBgs.length)];

  if (person.backgroundImage.length === 0) {
    person.backgroundImage = randomBanner;
  }
}

//check for mutual contacts else gives out the GfK
function hasMutuals(person) {
  if (person.mutualConnections > 0) {
    return `<img src="assets/img/link.svg" class="mutuals_icon"/> ${person.mutualConnections} Mutual Connections`;
  } else {
    return `<img src="assets/img/gfk.png" class="gfk_logo"/> GfK`;
  }
}

function selectPendingOut(n) {
  /*  if (n === 0) {
    return "No pending invitations";
  } else if (n === 1) {
    return `${n} pending invitation`;
  } else {
    return `${n} pending invitations`;
  }*/
  switch (n) {
    case 0:
      return `No pending invitations`;
      break;
    case 1:
      return `${n} pending invitation`;
      break;
    default:
      return `${n} pending invitations`;
  }
}
//Checking the "pending" / "connect"
function readState(person) {
  if (!person.state) {
    count += 1;
    return "Pending";
  } else {
    return "Connect";
  }
}

// Btn for Pending/Connect
function changeStateBtn(index) {
  pplInfo[index].state = !pplInfo[index].state;
  reload();
}

//adds a  random connect or pending state
function addConnectState() {
  const randomConnect = [false, true];
  pplInfo.forEach((person) => {
    let randomState =
      randomConnect[Math.floor(Math.random() * randomConnect.length)];
    person.state = randomState;
  });
}

//initial load
async function init(count) {
  await getPplData(count);
  pplInfo.forEach((person) => {
    setBackground(person);
  });
  renderPeople();
  localStorage.setItem("ppl", JSON.stringify(pplInfo));
}

//cleans the local storage array and pushes current data in
function reload() {
  renderPeople();
  localStorage.clear();
  localStorage.setItem("ppl", JSON.stringify(pplInfo));
}

//deletes a Card via the delete button
async function deleteCard(index) {
  await loadNewCard();
  pplInfo.splice(index, 1);
  reload();
}

//adds a new Card after we deleted one
async function loadNewCard() {
  const response = await fetch(url + 1);
  const data = await response.json();
  const person = data[0];
  const randomConnect = [false, true];
  let randomState =
    randomConnect[Math.floor(Math.random() * randomConnect.length)];
  person.state = randomState;
  setBackground(person);
  pplInfo.push(person);
}
