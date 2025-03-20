import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  runTransaction,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVBbQ2t-8IFFD80nOjykYIpc7IeWg0D9Y",
  authDomain: "cutebooth-d8f23.firebaseapp.com",
  projectId: "cutebooth-d8f23",
  storageBucket: "cutebooth-d8f23.firebasestorage.app",
  messagingSenderId: "228571962346",
  appId: "1:228571962346:web:6dbc6c9bef51ffe8dbb093",
  measurementId: "G-SN777W468S",
  databaseURL:
    "https://cutebooth-d8f23-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const viewCountRef = ref(db, "viewCount");

// Hàm cập nhật lượt xem
function updateViewCount() {
  runTransaction(viewCountRef, (currentViews) => {
    return (currentViews || 0) + 1;
  })
    .then(() => {
      console.log("View count updated successfully.");
    })
    .catch((error) => {
      console.error("Lỗi transaction:", error);
    });
}

// Hàm hiển thị lượt xem từ Firebase
function displayViewCount(snapshot) {
  const viewCountElement = document.getElementById("view-count");

  if (!viewCountElement) {
    document.addEventListener("DOMContentLoaded", () => {
      const delayedElement = document.getElementById("view-count");
      if (delayedElement) {
        delayedElement.innerText = snapshot.val();
      } else {
        console.error(
          "Element 'view-count' vẫn không tìm thấy sau khi DOM sẵn sàng."
        );
      }
    });
    return;
  }

  viewCountElement.innerText = snapshot.val();
}

// Lắng nghe thay đổi giá trị viewCount trên Firebase
onValue(viewCountRef, displayViewCount);

// Gọi hàm cập nhật lượt xem
document.addEventListener("DOMContentLoaded", () => {
  updateViewCount();
});
