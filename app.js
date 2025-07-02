// ✅ Your Firebase config (using your details!)
const firebaseConfig = {
  apiKey: "AIzaSyCNTP6kRscHDnFnw5tCnNvlqZwWNjMBirU",
  authDomain: "my-chat-app-6ff33.firebaseapp.com",
  databaseURL: "https://my-chat-app-6ff33-default-rtdb.firebaseio.com",
  projectId: "my-chat-app-6ff33",
  storageBucket: "my-chat-app-6ff33.appspot.com",
  messagingSenderId: "751929474831",
  appId: "1:751929474831:web:bd5f190555e6a4625fc87a",
  measurementId: "G-Y9BTFB5Q77"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let username = "";
let chatLog = [];

// SHA-256 hash of 'sunflower'
const PASSWORD_HASH = "4a4fb04d62ce02bb79eb1c3471a4b3e6bc6d17fe5be2fc0e2f91ef4b1f8c6d89";

// Hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login with password check
function login() {
  const name = document.getElementById("nameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!name || !password) {
    alert("Please enter BOTH your name and password.");
    return;
  }

  // ✅ Plain text password check:
  if (password !== "sunflower") {
    alert("Incorrect password. Access denied.");
    return;
  }

  username = name;
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "block";
  listenForMessages();
}


// Send message
function sendMessage() {
  const msg = document.getElementById("messageInput").value.trim();
  if (msg) {
    const timestamp = new Date().toISOString();
    db.ref("messages").push({
      name: username,
      message: msg,
      timestamp: timestamp
    });
    document.getElementById("messageInput").value = "";
  }
}

// Listen for messages
function listenForMessages() {
  db.ref("messages").on("child_added", snapshot => {
    const data = snapshot.val();
    const time = new Date(data.timestamp).toLocaleString();
    const line = `(${time}) (${data.name}): ${data.message}`;
    chatLog.push(line);

    const msgElem = document.createElement("div");
    msgElem.textContent = line;
    document.getElementById("messages").appendChild(msgElem);

    // Scroll to bottom
    const messagesDiv = document.getElementById("messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Export chat to text file
function exportChat() {
  if (chatLog.length === 0) {
    alert("No chat messages to export.");
    return;
  }
  const blob = new Blob([chatLog.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chat_log.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// Clear chat messages
function clearChat() {
  if (confirm("Are you sure you want to delete all chat messages?")) {
    db.ref("messages").remove()
      .then(() => {
        alert("Chat history cleared!");
        document.getElementById("messages").innerHTML = "";
        chatLog = [];
      })
      .catch((error) => {
        console.error("Error deleting messages:", error);
      });
  }
}
