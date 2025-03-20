function goCutebooth() {
    window.location.href = '/cutebooth.html';
}

function goToFanpage() {
    window.open('https://www.facebook.com/cutebooth.official', '_blank');
}

function goToGroup() {
    window.open('https://www.facebook.com/groups/cutebooth', '_blank');
}

function getToday() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    const dateElement = document.getElementById('date-today');

    if (dateElement) { // Kiểm tra nếu phần tử tồn tại
        dateElement.innerHTML = formattedDate;
    } else {
        console.error("Phần tử #date-today không tồn tại!");
    }
}

window.onload = getToday;