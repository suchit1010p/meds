// DOM Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const placeholder = document.getElementById('videoPlaceholder');
const startBtn = document.getElementById('startBtn');
const hangupBtn = document.getElementById('hangupBtn');
const acceptBtn = document.getElementById('acceptBtn');
const rejectBtn = document.getElementById('rejectBtn');
const incomingCallDiv = document.getElementById('incomingCall');

// WebRTC Configuration

let localStream;
let pc;
let currentOffer = null;
const socket = io();

const iceServers = [
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
        urls: 'turn:global.turn.twilio.com:3478?transport=udp',
        username: '9c62ac6db56ec83729d37f40bad08e21ac43f45d82e5b1ce9448298507b56ff0',
        credential: '8ec4082643ca74269f2733e1d4a2443f86c79955aa39de95286c19187db5222e'
    }
];


// Socket Event Listeners
socket.on('offer', (offer) => {
    currentOffer = offer;
    incomingCallDiv.classList.remove('hidden');
});

socket.on('answer', (answer) => {
    if (pc) pc.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', (candidate) => {
    if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
});

// START CONSULTATION (Stream + Join)
startBtn.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
        });
        localVideo.srcObject = localStream;

        // UI Updates
        startBtn.classList.add('hidden');
        hangupBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');

        // Initialize Peer Connection
        createPeerConnection();

        // Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', pc.localDescription);

    } catch (err) {
        console.error("Setup Error:", err);
        alert("Camera/Mic access is required for clinical consultation.");
    }
};

function createPeerConnection() {
    pc = new RTCPeerConnection({ iceServers });

    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('candidate', candidate);
    };
}

// ACCEPT INCOMING
acceptBtn.onclick = async () => {
    incomingCallDiv.classList.add('hidden');
    placeholder.classList.add('hidden');

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    }

    createPeerConnection();

    await pc.setRemoteDescription(new RTCSessionDescription(currentOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', answer);

    startBtn.classList.add('hidden');
    hangupBtn.classList.remove('hidden');
};

rejectBtn.onclick = () => {
    incomingCallDiv.classList.add('hidden');
    currentOffer = null;
};

// END SESSION
hangupBtn.onclick = () => {
    if (pc) {
        pc.close();
        pc = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    remoteVideo.srcObject = null;
    localVideo.srcObject = null;

    // Reset UI
    hangupBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    placeholder.classList.remove('hidden');
};