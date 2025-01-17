console.log('Cảm ơn bạn đã ghé thăm trang web của meobeo! Chúc bạn vui vẻ! Mọi thông tin chi tiết vui lòng liên hệ https://meobeo.dev');
console.log('Nếu có ý tưởng hay muốn đóng góp cho project vui lòng truy cập https://github.com/hoaphamduc/cutebooth');

document.getElementById("start-session").addEventListener("click", function () {
    const targetSection = document.getElementById("select-template");
    targetSection.scrollIntoView({
        behavior: "smooth"
    });
});

// Thêm ảnh vào queue để xếp

const MAX_PHOTOS = 6;
const photoQueue = document.getElementById("photo-queue");
const cameraPreview = document.getElementById("camera-preview");
let selectedTemplate = null; // Lưu template được chọn
let selectedTemplateType = null; // Loại template được chọn
let filledSlots = []; // Lưu danh sách các slot trong template đã được điền

// Function to Add Photo to Queue
function addPhotoToQueue(photoUrl) {
    if (!photoUrl) return; // Kiểm tra nếu photoUrl hợp lệ

    if (photoQueue.children.length >= MAX_PHOTOS) {
        alert("Hàng đợi đã đầy ảnh, vui lòng sử dụng ảnh ở hàng đợi hoặc xóa bớt để thêm ảnh!");
        return;
    }

    const photoWrapper = document.createElement("div");
    photoWrapper.className = "photo-thumbnail";
    photoWrapper.dataset.selected = "false";

    // Add photo
    const photo = document.createElement("img");
    photo.src = photoUrl;
    photo.alt = "Ảnh trong hàng đợi";
    photo.className = "queue-photo";

    // Add remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-photo";
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", function () {
        photoQueue.removeChild(photoWrapper);
    });

    // Add click event to select/unselect photo for template
    photoWrapper.addEventListener("click", function () {
        const isSelected = photoWrapper.dataset.selected === "true";
        if (!isSelected) {
            // Điền ảnh vào template
            const slotFilled = fillTemplateWithImage(photo.src);
            if (slotFilled) {
                photoWrapper.style.opacity = "0.5";
                photoWrapper.dataset.selected = "true";
            }
        } else {
            // Bỏ chọn ảnh khỏi template
            const slotCleared = clearImageFromTemplate(photo.src);
            if (slotCleared) {
                photoWrapper.style.opacity = "1";
                photoWrapper.dataset.selected = "false";
            }
        }
    });

    photoWrapper.appendChild(photo);
    photoWrapper.appendChild(removeBtn);
    photoQueue.appendChild(photoWrapper);
}

// Handle Upload Photo
document.getElementById("upload-photo").addEventListener("click", function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                addPhotoToQueue(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});

// Handle Take Photo
document.getElementById("take-photo").addEventListener("click", function () {
    const video = document.createElement("video");
    // Tạo nút "Capture Photo"
    const captureButton = document.createElement("button");

    // Tạo span để chứa chữ "Capture Photo"
    const span = document.createElement("span");
    span.textContent = "Capture Photo";

    // Thêm span vào button
    captureButton.appendChild(span);

    cameraPreview.innerHTML = "";
    cameraPreview.appendChild(video);
    cameraPreview.appendChild(captureButton);

    // Start camera
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();

            captureButton.addEventListener("click", function () {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoUrl = canvas.toDataURL("image/png");
                addPhotoToQueue(photoUrl);

                // Stop the video stream after capture
                // stream.getTracks().forEach((track) => track.stop());
                // cameraPreview.innerHTML = "";
            });
        })
        .catch((err) => {
            alert("Unable to access camera: " + err.message);
        });
});

// Gắn sự kiện cho tất cả template
document.querySelectorAll(".photo-template").forEach((template) => {
    template.addEventListener("click", function () {
        // Sao chép template được chọn
        selectedTemplate = template.cloneNode(true);
        selectedTemplate.id = "selected-template";
        selectedTemplate.style.pointerEvents = "none"; // Ngăn tương tác với template

        // Lưu loại template dựa trên id
        const photoDiv = selectedTemplate.querySelector(".photo");
        if (photoDiv) {
            selectedTemplateType = photoDiv.id;
        } else {
            selectedTemplateType = null;
        }

        // Hiển thị template đã chọn
        const templateContainer = document.getElementById("selected-template-container");
        templateContainer.innerHTML = ""; // Xóa template trước đó nếu có
        templateContainer.appendChild(selectedTemplate);

        // Reset trạng thái các slot
        filledSlots = Array.from(selectedTemplate.querySelectorAll("img")).map(() => null);

        // Tự động cuộn xuống section "upload-or-take-photos"
        const uploadSection = document.getElementById("upload-or-take-photos");
        uploadSection.scrollIntoView({
            behavior: "smooth",
        });
    });
});

// Điền ảnh vào template
function fillTemplateWithImage(photoUrl) {
    if (!selectedTemplate) {
        alert("Please select a template first.");
        return false;
    }

    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    for (let i = 0; i < imgPlaceholders.length; i++) {
        if (!filledSlots[i]) {
            imgPlaceholders[i].src = photoUrl; // Điền ảnh vào slot
            filledSlots[i] = photoUrl; // Lưu trạng thái slot đã điền
            return true;
        }
    }
    alert("All slots in the template are filled!");
    return false;
}

// Xóa ảnh khỏi template
function clearImageFromTemplate(photoUrl) {
    if (!selectedTemplate) return false;

    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    for (let i = 0; i < imgPlaceholders.length; i++) {
        if (filledSlots[i] === photoUrl) {
            imgPlaceholders[i].src = "/assets/images/placehoder.jpeg"; // Khôi phục placeholder
            filledSlots[i] = null; // Xóa trạng thái slot
            return true;
        }
    }
    return false;
}

document.getElementById("go-to-select-frame").addEventListener("click", function () {
    // Kiểm tra nếu template đã được chọn
    if (!selectedTemplate) {
        alert("Please select a template first.");
        return;
    }

    // Kiểm tra nếu tất cả slot đã được điền
    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    const allSlotsFilled = Array.from(imgPlaceholders).every(
        (img) => !img.src.includes("placehoder")
    );

    if (!allSlotsFilled) {
        alert("Please fill all the slots in the template before proceeding.");
        return;
    }

    // Hiển thị template đang được edit trong section select-frame
    const selectFrameSection = document.getElementById("select-frame");
    const frameContainer = document.querySelector(".frame-options");
    frameContainer.innerHTML = ""; // Xóa các frame cũ

    // Lấy khối .photo cụ thể trong template
    const targetPhoto = selectedTemplate.querySelector(".photo");
    if (targetPhoto) {
        // Tìm hoặc thêm khối frame-preview vào bên trong targetPhoto
        let previewContainer = targetPhoto.querySelector("#frame-preview");
        if (!previewContainer) {
            previewContainer = document.createElement("div");
            previewContainer.id = "frame-preview";
            previewContainer.style.position = "absolute";
            previewContainer.style.top = "0";
            previewContainer.style.left = "0";
            previewContainer.style.width = "100%";
            previewContainer.style.height = "100%";
            previewContainer.style.backgroundSize = "cover";
            previewContainer.style.backgroundPosition = "center";
            previewContainer.style.opacity = "0.7";
            previewContainer.style.zIndex = "1";
            previewContainer.style.pointerEvents = "none"; // Ngăn tương tác
            targetPhoto.style.position = "relative"; // Đảm bảo targetPhoto có position
            targetPhoto.appendChild(previewContainer);
        }

        // Thêm khối photo vào section select-frame
        const existingPhotoContainer = selectFrameSection.querySelector(".photo");
        if (existingPhotoContainer) {
            selectFrameSection.replaceChild(targetPhoto, existingPhotoContainer);
        } else {
            selectFrameSection.insertAdjacentElement("afterbegin", targetPhoto);
        }
    } else {
        alert("No valid photo container found in the selected template.");
        return;
    }

    // Thêm lựa chọn "No Frame"
    const noFrameOption = document.createElement("button");

    // Tạo span để chứa chữ "No Frame"
    const span = document.createElement("span");
    span.textContent = "Không có khung";

    // Thêm span vào button
    noFrameOption.appendChild(span);

    // Gán các thuộc tính cho button
    noFrameOption.style.margin = "10px";
    noFrameOption.style.cursor = "pointer";
    noFrameOption.addEventListener("click", function () {
        // Xóa background của preview
        const framePreview = document.getElementById("frame-preview");
        if (framePreview) {
            framePreview.style.backgroundImage = "none";
        }
    });
    frameContainer.appendChild(noFrameOption);

    // Thêm danh sách frame
    const frames = getFramesByTemplateType(selectedTemplateType);
    frames.forEach((frame) => {
        const frameElement = document.createElement("img");
        frameElement.src = frame.src;
        frameElement.className = "frame-option";
        frameElement.alt = `Frame ${frame.id}`;
        frameElement.style.cursor = "pointer";
        frameElement.style.margin = "5px";
        frameElement.style.width = "100px"; // Điều chỉnh kích thước frame nếu cần
        frameElement.addEventListener("click", function () {
            // Đặt frame làm background của preview
            const framePreview = document.getElementById("frame-preview");
            if (framePreview) {
                framePreview.style.backgroundImage = `url(${frame.src})`;
            }
        });
        frameContainer.appendChild(frameElement);
    });

    // Cuộn mượt đến section "select-frame"
    selectFrameSection.scrollIntoView({
        behavior: "smooth",
    });
});

document.getElementById("go-to-preview-and-save").addEventListener("click", function () {
    // Kiểm tra nếu frame đã được chọn (nếu có yêu cầu)
    const framePreview = document.getElementById("frame-preview");
    if (framePreview && framePreview.style.backgroundImage === "") {
        // Nếu người dùng có thể chọn "No Frame", thì không bắt buộc
        // Bạn có thể bỏ qua kiểm tra này hoặc thêm thông báo nếu cần
    }

    if (!selectedTemplate) {
        alert("No template selected!");
        return;
    }

    // Kiểm tra xem template đã được điền đầy đủ chưa
    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    const allSlotsFilled = Array.from(imgPlaceholders).every(
        (img) => !img.src.includes("placehoder")
    );

    if (!allSlotsFilled) {
        alert("Please fill all the slots in the template before proceeding.");
        return;
    }

    // Lấy trực tiếp .photo từ section select-frame
    const selectFrameSection = document.getElementById("select-frame");
    const photoDiv = selectFrameSection.querySelector(".photo");
    if (!photoDiv) {
        alert("No photo container found in select-frame.");
        return;
    }

    // Clone .photo div
    const photoClone = photoDiv.cloneNode(true);

    // Thêm class 'photo-preview' vào bản sao
    photoClone.classList.add("photo-preview");

    // Hiển thị bản sao trong section "preview-and-save"
    const photoPreviewContainer = document.getElementById("photo-preview");
    photoPreviewContainer.innerHTML = ""; // Xóa preview trước đó nếu có
    photoPreviewContainer.appendChild(photoClone);

    // Cuộn mượt đến section "preview-and-save"
    const previewSection = document.getElementById("preview-and-save");
    previewSection.scrollIntoView({
        behavior: "smooth",
    });
});

document.getElementById("save-photo").addEventListener("click", function () {
    // Tìm phần tử có class .photo-preview
    const photoPreview = document.querySelector(".photo-preview");

    if (!photoPreview) {
        alert("No photo preview found to save!");
        return;
    }

    // Clone phần tử
    const photoClone = photoPreview.cloneNode(true);

    // Thay đổi class của bản clone
    photoClone.classList.remove("photo-preview");
    photoClone.classList.add("photo-print");

    // Tạo một container tạm thời và thêm bản clone vào DOM
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "-9999px"; // Đặt ngoài màn hình
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(photoClone);
    document.body.appendChild(tempContainer);

    // Sử dụng dom-to-image để tạo ảnh từ bản clone
    domtoimage.toPng(photoClone)
        .then(function (dataUrl) {
            // Xóa container tạm thời sau khi tạo ảnh
            document.body.removeChild(tempContainer);

            // Tạo link download
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = "cutebooth.png"; // Tên file sẽ lưu
            downloadLink.click();
        })
        .catch(function (error) {
            // Xóa container tạm thời trong trường hợp lỗi
            document.body.removeChild(tempContainer);
            console.error("Error generating image:", error);
            alert("An error occurred while saving the photo.");
        });
});

// Lấy frame dựa trên loại template
function getFramesByTemplateType(templateType) {
    const framesData = {
        "template-3-photos": [
            { id: 1, src: "/assets/frame/frame3-photos-1.png" },
            { id: 2, src: "/assets/frame/frame3-photos-2.png" },
        ],
        "template-4-photos": [
            { id: 1, src: "/assets/frame/frame4-photos-1.png" },
            { id: 2, src: "/assets/frame/frame4-photos-2.png" },
        ],
        "template-4-photos-2": [
            { id: 1, src: "/assets/frame/frame4-photos2-1.png" },
            { id: 2, src: "/assets/frame/frame4-photos2-2.png" },
        ],
    };

    return framesData[templateType] || [];
}
