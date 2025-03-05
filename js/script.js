console.log('Cảm ơn bạn đã ghé thăm trang web của meobeo! Chúc bạn vui vẻ! Mọi thông tin chi tiết vui lòng liên hệ https://meobeo.dev');
console.log('Nếu có ý tưởng hay muốn đóng góp cho project vui lòng truy cập https://github.com/hoaphamduc/cutebooth');

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(function() {
        document.getElementById('loader').style.display = 'none';
    }, 2399);
});

// Hàm để thay đổi ngôn ngữ
function setLanguage(language) {
    const elements = document.querySelectorAll("[data-vi], [data-en]");
    elements.forEach(el => {
        el.textContent = el.getAttribute(`data-${language}`);
    });

    localStorage.setItem('selectedLanguage', language);

    updateLanguageSelection(language);

    document.getElementById('language-menu').style.display = 'none';
}

// Hàm theo dõi các phần tử mới được thêm vào DOM và áp dụng ngôn ngữ
function observeLanguageElements(language) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.matches("[data-vi], [data-en]")) {
                    node.textContent = node.getAttribute(`data-${language}`);
                }
                // Kiểm tra các phần tử con bên trong
                const childElements = node.querySelectorAll?.("[data-vi], [data-en]");
                childElements?.forEach(el => {
                    el.textContent = el.getAttribute(`data-${language}`);
                });
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.getElementById('globe-icon').addEventListener('click', (event) => {
    toggleLanguageMenu();
    event.stopPropagation();
});

// Đóng menu khi bấm ra ngoài
document.addEventListener('click', (event) => {
    const menu = document.getElementById('language-menu');
    const globeIcon = document.getElementById('globe-icon');

    // Nếu bấm ra ngoài menu và không phải icon, đóng menu
    if (menu.style.display === 'block' && !menu.contains(event.target) && !globeIcon.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// Hàm để cập nhật giao diện và đánh dấu ngôn ngữ hiện tại
function updateLanguageSelection(language) {
    const buttons = document.querySelectorAll('.lang-option');
    buttons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-lang') === language);
    });
}

// Kiểm tra ngôn ngữ đã lưu trong localStorage và đặt mặc định nếu chưa có
const savedLanguage = localStorage.getItem('selectedLanguage') || 'vi';
setLanguage(savedLanguage);

// Khởi chạy theo dõi các phần tử mới
observeLanguageElements(savedLanguage);

document.getElementById('setLanguageVI').addEventListener('click', () => {
    setLanguage('vi');
});

document.getElementById('setLanguageEN').addEventListener('click', () => {
    setLanguage('en');
});

document.getElementById('setLanguageZH').addEventListener('click', () => {
    setLanguage('zh');
});

// Hàm mở section
function showSection(sectionId) {
    // Ẩn tất cả các section
    document.querySelectorAll("main section").forEach(section => {
        section.classList.remove("active");
    });

    // Hiển thị section có ID tương ứng
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active");
    } else {
        console.warn(`Không tìm thấy section với ID: ${sectionId}`);
    }

    // Hàm xử lý thêm class active cho các .address và .address-mobile
    function updateAddressClasses(selector) {
        document.querySelectorAll(selector).forEach(address => {
            // Xóa lớp 'active' khỏi tất cả các phần tử
            address.classList.remove("active");

            // Thêm lớp 'active' vào phần tử có data-section-id tương ứng
            if (address.getAttribute("data-section-id") === sectionId) {
                address.classList.add("active");
            }
        });
    }

    // Cập nhật .address và .address-mobile
    updateAddressClasses(".address");
    updateAddressClasses(".address-mobile");
}

// Lấy tất cả các .address và .address-mobile
const addresses = document.querySelectorAll(".address");
const addressesMobile = document.querySelectorAll(".address-mobile");

// Gán sự kiện click cho từng .address và .address-mobile
[addresses, addressesMobile].forEach(addressesGroup => {
    addressesGroup.forEach(address => {
        address.addEventListener("click", () => {
            // Lấy ID của section từ thuộc tính data-section-id
            const sectionId = address.getAttribute("data-section-id");

            // Gọi hàm hiển thị section
            showSection(sectionId);
        });
    });
});

document.getElementById("start-session").addEventListener("click", () => showSection("select-template"));

// Thêm ảnh vào queue để xếp
const MAX_PHOTOS = 12; // Giới hạn số ảnh trong queue
const photoQueue = document.getElementById("photo-queue");
const cameraPreview = document.getElementById("camera-preview");
let selectedTemplate = null; // Lưu template được chọn
let selectedTemplateType = null; // Loại template được chọn
let filledSlots = []; // Lưu danh sách các slot trong template đã được điền
let photoCount = 0;

// Function to Add Photo to Queue
function addPhotoToQueue(photoUrl) {
    if (!photoUrl) return;

    if (photoQueue.children.length >= MAX_PHOTOS) {
        Swal.fire({
            title: '<span data-vi="Hàng Đợi Đầy" data-en="Queue is Full" data-zh="队列已满"></span>',
            html: '<span data-vi="Hàng đợi đã đầy ảnh, vui lòng sử dụng ảnh ở hàng đợi hoặc xóa bớt để thêm ảnh!" data-en="The image queue is full, please use the images in the queue or delete some to add more images!" data-zh="图片队列已满，请使用队列中的图片或删除一些以添加更多图片！"></span>',
            icon: 'error',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
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
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", function () {
        photoQueue.removeChild(photoWrapper);
        photoCount--;
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

// Xử lý chọn ảnh
document.getElementById("upload-photo").addEventListener("click", function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.style.display = "none";

    fileInput.addEventListener("change", function () {
        const files = fileInput.files;
        if (files.length > 0) {
            const remainingSlots = MAX_PHOTOS - photoCount;
            const filesToAdd = Math.min(files.length, remainingSlots);

            for (let i = 0; i < filesToAdd; i++) {
                const file = files[i];
                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = new Image();
                    img.onload = function () {
                        // Tạo canvas 600x600
                        const canvas = document.createElement("canvas");
                        canvas.width = 600;
                        canvas.height = 600;
                        const ctx = canvas.getContext("2d");

                        // Tính scale để ảnh cover canvas
                        const scale = Math.max(600 / img.width, 600 / img.height);
                        const newWidth = img.width * scale;
                        const newHeight = img.height * scale;
                        // Tính offset để ảnh được căn giữa
                        const dx = (600 - newWidth) / 2;
                        const dy = (600 - newHeight) / 2;

                        // Vẽ ảnh lên canvas
                        ctx.drawImage(img, dx, dy, newWidth, newHeight);

                        // Xuất ảnh ra định dạng JPEG với chất lượng 1
                        const formattedDataUrl = canvas.toDataURL("image/jpeg", 1);
                        addPhotoToQueue(formattedDataUrl);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

            photoCount += filesToAdd;
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});

let flipCamera = true;

// Xử lý chụp ảnh
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("camera-video");
    const captureButton = document.getElementById("capture-button");
    const autoTakePhotoButton = document.getElementById("auto-take-photo");
    const flipToggle = document.getElementById("flip-toggle");

    // Hàm cập nhật transform cho video dựa trên trạng thái flipCamera
    function updateVideoTransform() {
        video.style.transform = flipCamera ? "scaleX(-1)" : "none";
    }

    // Hàm chụp ảnh dùng chung cho cả hai nút
    function capturePhoto() {
        // Tạo canvas để chụp ảnh từ video
        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        const captureCtx = captureCanvas.getContext("2d");

        // Nếu flipCamera = true, áp dụng transform lật ngang
        if (flipCamera) {
            captureCtx.translate(captureCanvas.width, 0);
            captureCtx.scale(-1, 1);
        }
        // Vẽ video lên canvas capture
        captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        // Tạo canvas mới với kích thước cố định 600x600
        const formattedCanvas = document.createElement("canvas");
        formattedCanvas.width = 600;
        formattedCanvas.height = 600;
        const formattedCtx = formattedCanvas.getContext("2d");

        // Tính toán tỉ lệ scale để ảnh cover canvas 600x600
        const scale = Math.max(600 / captureCanvas.width, 600 / captureCanvas.height);
        const newWidth = captureCanvas.width * scale;
        const newHeight = captureCanvas.height * scale;
        // Tính offset để căn giữa ảnh trong canvas
        const dx = (600 - newWidth) / 2;
        const dy = (600 - newHeight) / 2;

        // Vẽ ảnh từ canvas capture vào canvas đã format
        formattedCtx.drawImage(captureCanvas, dx, dy, newWidth, newHeight);

        // Xuất ảnh ra định dạng JPEG với chất lượng 1
        const photoUrl = formattedCanvas.toDataURL("image/jpeg", 1);
        addPhotoToQueue(photoUrl);
    }

    // Khi tùy chọn flip được thay đổi
    flipToggle.addEventListener("change", function () {
        flipCamera = this.checked;
        updateVideoTransform();
    });

    // Mở camera khi trang web được tải
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            // Áp dụng transform theo trạng thái ban đầu
            updateVideoTransform();

            // Xử lý chụp ảnh khi bấm nút "chụp ảnh"
            captureButton.addEventListener("click", function () {
                capturePhoto();
            });

            // Xử lý nút "auto chụp ảnh" với đếm ngược 5 giây
            autoTakePhotoButton.addEventListener("click", function () {
                let countdown = 5;

                // Tạo overlay đếm ngược
                const countdownOverlay = document.createElement("div");
                countdownOverlay.id = "countdown-overlay";
                countdownOverlay.style.position = "absolute";
                countdownOverlay.style.top = "50%";
                countdownOverlay.style.left = "50%";
                countdownOverlay.style.transform = "translate(-50%, -50%)";
                countdownOverlay.style.fontSize = "48px";
                countdownOverlay.style.color = "#fff";
                countdownOverlay.style.padding = "10px 20px";
                countdownOverlay.style.borderRadius = "8px";

                // Đảm bảo thẻ cha của video có position relative để overlay hiển thị chính xác
                document.getElementById('camera-container').style.position = "relative";
                document.getElementById('camera-container').appendChild(countdownOverlay);

                countdownOverlay.textContent = countdown;

                // Đếm ngược mỗi giây
                const interval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        countdownOverlay.textContent = countdown;
                    } else {
                        clearInterval(interval);
                        countdownOverlay.remove();
                        capturePhoto();
                    }
                }, 1000);
            });
        })
        .catch((err) => {
            if (window.innerWidth >= mobileWidth) {
                Swal.fire({
                    title: '<span data-vi="Lỗi Camera" data-en="Camera Error" data-zh="相机错误"></span>',
                    html: `<span data-vi="Không thể truy cập vào máy ảnh:" data-en="Unable to access the camera:" data-zh="无法访问相机："></span> ${err.message}. <span data-vi="Vui lòng kiểm tra cài đặt trình duyệt và máy ảnh của bạn!" data-en="Please check your browser and camera settings!" data-zh="请检查您的浏览器和相机设置！"></span>`,
                    icon: 'error',
                    confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
                });
            }
        });
});

// Gắn sự kiện cho tất cả template
document.querySelectorAll(".photo-template").forEach((template) => {
    template.addEventListener("click", function () {
        // Sao chép template được chọn
        selectedTemplate = template.cloneNode(true);
        selectedTemplate.id = "selected-template";
        selectedTemplate.style.pointerEvents = "none";

        // Lưu loại template dựa trên id
        const photoDiv = selectedTemplate.querySelector(".photo");
        if (photoDiv) {
            selectedTemplateType = photoDiv.id;
        } else {
            selectedTemplateType = null;
        }

        // Hiển thị template đã chọn
        const templateContainer = document.getElementById("selected-template-container");
        templateContainer.innerHTML = "";
        templateContainer.appendChild(selectedTemplate);

        // Reset trạng thái các slot
        filledSlots = Array.from(selectedTemplate.querySelectorAll("img")).map(() => null);

        showSection("upload-or-take-photos");
    });
});

// Điền ảnh vào template
function fillTemplateWithImage(photoUrl) {
    if (!selectedTemplate) {
        Swal.fire({
            title: '<span data-vi="Chưa Chọn Mẫu" data-en="Template Not Selected" data-zh="未选择模板"></span>',
            html: '<span data-vi="Vui lòng chọn một mẫu trước đã bro." data-en="Please choose a template first, bro." data-zh="请先选择一个模板，兄弟。"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
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
    Swal.fire({
        title: '<span data-vi="Slot Đầy" data-en="Slot Full" data-zh="插槽已满"></span>',
        html: '<span data-vi="Tất cả các vị trí trong mẫu đã được lấp đầy!" data-en="All positions in the template are filled!" data-zh="模板中的所有位置已被填满！"></span>',
        icon: 'info',
        confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
    });
    return false;
}

// Xóa ảnh khỏi template
function clearImageFromTemplate(photoUrl) {
    if (!selectedTemplate) return false;

    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    for (let i = 0; i < imgPlaceholders.length; i++) {
        if (filledSlots[i] === photoUrl) {
            imgPlaceholders[i].src = "/assets/images/placehoder.jpeg";
            filledSlots[i] = null; // Xóa trạng thái slot
            return true;
        }
    }
    return false;
}

document.getElementById("go-to-select-frame").addEventListener("click", function () {
    // Kiểm tra nếu template đã được chọn
    if (!selectedTemplate) {
        Swal.fire({
            title: '<span data-vi="Chưa Chọn Mẫu" data-en="Template Not Selected" data-zh="未选择模板"></span>',
            html: '<span data-vi="Vui lòng chọn một mẫu trước đã bro." data-en="Please choose a template first, bro." data-zh="请先选择一个模板，兄弟。"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // Kiểm tra nếu tất cả slot đã được điền
    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    const allSlotsFilled = Array.from(imgPlaceholders).every(
        (img) => !img.src.includes("placehoder")
    );

    if (!allSlotsFilled) {
        Swal.fire({
            title: '<span data-vi="Chưa Đủ Ảnh" data-en="Not Enough Images" data-zh="图片不足"></span>',
            html: '<span data-vi="Vui lòng chọn ảnh cho tất cả các vị trí trong mẫu trước khi tiếp tục." data-en="Please select images for all positions in the template before continuing." data-zh="请在继续之前为模板中的所有位置选择图片。"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // **BẮT ĐẦU: XÓA HÀNG ĐỢI ẢNH**
    photoQueue.innerHTML = ""; // Xóa tất cả các ảnh trong hàng đợi
    photoCount = 0; // Reset số lượng ảnh
    filledSlots = []; // Reset danh sách các slot đã điền
    // **KẾT THÚC: XÓA HÀNG ĐỢI ẢNH**

    // Hiển thị template đang được edit trong section select-frame
    const selectFrameContainer = document.getElementById('template-need-select-frame');
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
            previewContainer.style.pointerEvents = "none";
            targetPhoto.style.position = "relative";
            targetPhoto.appendChild(previewContainer);
        }

        // Thêm khối photo vào template-need-select-frame
        const existingPhotoContainer = selectFrameContainer.querySelector(".photo");
        if (existingPhotoContainer) {
            selectFrameContainer.replaceChild(targetPhoto, existingPhotoContainer);
        } else {
            selectFrameContainer.insertAdjacentElement("afterbegin", targetPhoto);
        }
    } else {
        Swal.fire({
            title: '<span data-vi="Lỗi" data-en="Error" data-zh="错误"></span>',
            html: '<span data-vi="Không tìm thấy vùng chứa ảnh hợp lệ trong mẫu đã chọn." data-en="No valid image container found in the selected template." data-zh="在所选模板中未找到有效的图片容器。"></span>',
            icon: 'error',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // Thêm danh sách frame
    const frames = getFramesByTemplateType(selectedTemplateType);
    frames.forEach((frame) => {
        const frameElement = document.createElement("img");
        frameElement.src = frame.src;
        frameElement.className = "frame-option";
        frameElement.alt = `Frame ${frame.id}`;
        frameElement.addEventListener("click", function () {
            const framePreview = document.getElementById("frame-preview");
            if (framePreview) {
                framePreview.style.backgroundImage = `url(${frame.src})`;
            }
        });
        frameContainer.appendChild(frameElement);
    });

    // Thêm filter cố định
    const filterContainer = document.querySelector(".filter-options");
    filterContainer.innerHTML = ""; // Xóa filter cũ

    const filters = [
        { name: "Default", style: "unset" },
        { name: "Grayscale", style: "grayscale(100%)" },
        { name: "Sepia", style: "sepia(100%)" },
        { name: "Blur", style: "blur(5px)" },
        { name: "Brightness", style: "brightness(1.5)" },
        { name: "Contrast", style: "contrast(200%)" },
        { name: "Hue Rotate", style: "hue-rotate(90deg)" },
        { name: "Invert", style: "invert(100%)" },
        { name: "Saturate", style: "saturate(300%)" },
        { name: "Opacity", style: "opacity(50%)" },
        { name: "Drop Shadow", style: "drop-shadow(10px 10px 10px gray)" },
        { name: "Warm", style: "sepia(30%) brightness(1.2) contrast(1.1)" },
        { name: "Cold", style: "hue-rotate(180deg) brightness(0.8)" },
        { name: "Vintage", style: "sepia(50%) saturate(50%) contrast(1.2)" },
        { name: "Night Vision", style: "invert(100%) hue-rotate(180deg)" },
        { name: "Glow", style: "brightness(1.5) contrast(2)" },
        { name: "Shadowed", style: "drop-shadow(20px 20px 15px black)" },
        { name: "Sharp", style: "contrast(300%) brightness(1.2)" },
        { name: "Frosted Glass", style: "blur(3px) brightness(1.1)" },
        { name: "Pastel", style: "saturate(150%) brightness(1.3) hue-rotate(-20deg)" },
        { name: "Golden Hour", style: "sepia(60%) brightness(1.2) saturate(1.5)" }
    ];

    filters.forEach((filter) => {
        const filterElement = document.createElement("div");
        filterElement.className = "filter";
        filterElement.textContent = filter.name;
        filterElement.style.filter = filter.style;
        filterElement.addEventListener("click", function () {
            const imgs = selectFrameContainer.querySelectorAll("img");
            imgs.forEach((img) => {
                img.style.filter = filter.style;
            });
        });
        filterContainer.appendChild(filterElement);
    });

    showSection("select-frame");
});

document.getElementById("go-to-preview-and-save").addEventListener("click", function () {
    // Kiểm tra nếu frame đã được chọn (nếu có yêu cầu)
    const framePreview = document.getElementById("frame-preview");
    if (framePreview && framePreview.style.backgroundImage === "") {
        // Nếu người dùng có thể chọn "No Frame", thì không bắt buộc
        // Bạn có thể bỏ qua kiểm tra này hoặc thêm thông báo nếu cần
    }

    if (!selectedTemplate) {
        Swal.fire({
            title: '<span data-vi="Chưa Chọn Mẫu" data-en="Template Not Selected" data-zh="未选择模板"></span>',
            html: '<span data-vi="Chưa có mẫu nào được chọn!" data-en="No template selected!" data-zh="没有选择模板！"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // Kiểm tra xem template đã được điền đầy đủ chưa
    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    const allSlotsFilled = Array.from(imgPlaceholders).every(
        (img) => !img.src.includes("placehoder")
    );

    if (!allSlotsFilled) {
        Swal.fire({
            title: '<span data-vi="Chưa Đủ Ảnh" data-en="Not Enough Images" data-zh="图片不足"></span>',
            html: '<span data-vi="Vui lòng chọn ảnh cho tất cả các vị trí trong mẫu trước khi tiếp tục." data-en="Please select images for all positions in the template before continuing." data-zh="请在继续之前为模板中的所有位置选择图片。"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // Lấy trực tiếp .photo từ section select-frame
    const selectFrameSection = document.getElementById("select-frame");
    const photoDiv = selectFrameSection.querySelector(".photo");
    if (!photoDiv) {
        Swal.fire({
            title: '<span data-vi="Lỗi" data-en="Error" data-zh="错误"></span>',
            html: '<span data-vi="Không tìm thấy vùng chứa ảnh nào trong khung chọn." data-en="No image container found in the selected frame." data-zh="在选择的框架中找不到图片容器。"></span>',
            icon: 'error',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
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

    showSection("preview-and-save");
});

document.getElementById("save-photo").addEventListener("click", function () {
    // Find the preview photo element
    const photoPreview = document.querySelector(".photo-preview");

    if (!photoPreview) {
        Swal.fire({
            title: '<span data-vi="Lỗi" data-en="Error" data-zh="错误"></span>',
            html: '<span data-vi="Không tìm thấy bản xem trước ảnh nào để lưu!" data-en="No preview image found to save!" data-zh="找不到可以保存的图片预览！"></span>',
            icon: 'error',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }

    // Clone the preview photo
    const photoClone = photoPreview.cloneNode(true);

    // Change class of the clone
    photoClone.classList.remove("photo-preview");
    photoClone.classList.add("photo-print");

    // Create a temporary container and append the cloned photo to it
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "-9999px";
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(photoClone);
    document.body.appendChild(tempContainer);

    // Use dom-to-image to create an image from the clone
    domtoimage.toPng(photoClone)
        .then(function (dataUrl) {
            // Remove the temporary container after creating the image
            document.body.removeChild(tempContainer);

            // Check if the user is on iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                // Adjust the image scaling to fit full width if needed
                const downloadLink = document.createElement("a");
                downloadLink.href = dataUrl;
                downloadLink.download = "cutebooth.png"; // Set filename for the downloaded file
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                // Trigger download for non-iOS devices
                const downloadLink = document.createElement("a");
                downloadLink.href = dataUrl;
                downloadLink.download = "cutebooth.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        })
        .catch(function (error) {
            document.body.removeChild(tempContainer);
            console.error("Error generating image:", error);
            Swal.fire({
                title: '<span data-vi="Lỗi" data-en="Error" data-zh="错误"></span>',
                html: '<span data-vi="Đã xảy ra lỗi khi tải ảnh." data-en="An error occurred while uploading the image." data-zh="上传图片时发生错误。"></span>',
                icon: 'error',
                confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
            });
        });
});

// Hàm tải frame template
function downloadFrameTemplate(url) {
    // Kiểm tra xem URL có hợp lệ không
    if (!url || typeof url !== 'string') {
        console.error("URL không hợp lệ. Vui lòng cung cấp một URL hợp lệ.");
        return;
    }

    // Tạo một thẻ <a> để kích hoạt download
    const link = document.createElement('a');
    link.href = url;

    // Lấy tên tệp từ URL (nếu có)
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    link.download = fileName || 'downloaded_file';

    // Thêm thẻ <a> vào DOM, kích hoạt click, và xóa thẻ sau khi tải xong
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Đã tải xuống tệp từ URL: ${url}`);
}

// Lấy frame dựa trên loại template
function getFramesByTemplateType(templateType) {
    const framesData = {
        "template-3-photos": [
            { id: 1, src: "/assets/frame/3-photos/no-frame.png" },
            { id: 2, src: "/assets/frame/3-photos/1.svg" },
            { id: 3, src: "/assets/frame/3-photos/2.svg" },
            { id: 4, src: "/assets/frame/3-photos/3.svg" },
            { id: 5, src: "/assets/frame/3-photos/4.svg" },
            { id: 6, src: "/assets/frame/3-photos/5.svg" },
        ],
        "template-4-photos": [
            { id: 1, src: "/assets/frame/4-photos/no-frame.png" },
            { id: 2, src: "/assets/frame/4-photos/frame-1.png" },
            { id: 3, src: "/assets/frame/4-photos/1.svg" },
            { id: 4, src: "/assets/frame/4-photos/2.svg" },
        ],
        "template-4-photos-2": [
            { id: 1, src: "/assets/frame/4-photos-2/no-frame.png" },
            { id: 2, src: "/assets/frame/4-photos-2/frame-1.png" },
            { id: 3, src: "/assets/frame/4-photos-2/frame-2.png" },
            { id: 4, src: "/assets/frame/4-photos-2/frame-3.png" },
            // { id: 5, src: "/assets/frame/4-photos-2/frame-4.png" },
            // { id: 6, src: "/assets/frame/4-photos-2/frame-5.png" },
            // { id: 7, src: "/assets/frame/4-photos-2/frame-6.png" },
            { id: 8, src: "/assets/frame/4-photos-2/1.svg" },
            { id: 8, src: "/assets/frame/4-photos-2/2.svg" },
            { id: 8, src: "/assets/frame/4-photos-2/3.svg" },
            { id: 8, src: "/assets/frame/4-photos-2/4.svg" },
            { id: 8, src: "/assets/frame/4-photos-2/5.svg" },
            { id: 9, src: "/assets/frame/4-photos-2/6.svg" },
        ],
    };

    return framesData[templateType] || [];
}