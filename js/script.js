console.log('Cảm ơn bạn đã ghé thăm trang web của meobeo! Chúc bạn vui vẻ! Mọi thông tin chi tiết vui lòng liên hệ https://meobeo.dev');
console.log('Nếu có ý tưởng hay muốn đóng góp cho project vui lòng truy cập https://github.com/hoaphamduc/cutebooth');

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(function () {
        document.getElementById('loader').style.display = 'none';
    }, 2399);
});

// Hàm thay đổi ngôn ngữ
function setLanguage(language) {
    const elements = document.querySelectorAll("[data-vi], [data-en], [data-zh]");
    elements.forEach(el => {
        el.textContent = el.getAttribute(`data-${language}`);
    });
    localStorage.setItem('selectedLanguage', language);
    updateLanguageSelection(language);
    document.getElementById('language-menu').style.display = 'none';
}
function observeLanguageElements(language) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.matches("[data-vi], [data-en], [data-zh]")) {
                    node.textContent = node.getAttribute(`data-${language}`);
                }
                const childElements = node.querySelectorAll?.("[data-vi], [data-en], [data-zh]");
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
document.addEventListener('click', (event) => {
    const menu = document.getElementById('language-menu');
    const globeIcon = document.getElementById('globe-icon');
    if (menu.style.display === 'block' && !menu.contains(event.target) && !globeIcon.contains(event.target)) {
        menu.style.display = 'none';
    }
});
function updateLanguageSelection(language) {
    const buttons = document.querySelectorAll('.lang-option');
    buttons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-lang') === language);
    });
}
const savedLanguage = localStorage.getItem('selectedLanguage') || 'vi';
setLanguage(savedLanguage);
observeLanguageElements(savedLanguage);
document.getElementById('setLanguageVI').addEventListener('click', () => setLanguage('vi'));
document.getElementById('setLanguageEN').addEventListener('click', () => setLanguage('en'));
document.getElementById('setLanguageZH').addEventListener('click', () => setLanguage('zh'));

// Hàm mở section
function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(section => section.classList.remove("active"));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active");
    } else {
        console.warn(`Không tìm thấy section với ID: ${sectionId}`);
    }
    // Cập nhật .address & .address-mobile
    function updateAddressClasses(selector) {
        document.querySelectorAll(selector).forEach(address => {
            address.classList.remove("active");
            if (address.getAttribute("data-section-id") === sectionId) {
                address.classList.add("active");
            }
        });
    }
    updateAddressClasses(".address");
    updateAddressClasses(".address-mobile");
}
const addresses = document.querySelectorAll(".address");
const addressesMobile = document.querySelectorAll(".address-mobile");
[addresses, addressesMobile].forEach(group => {
    group.forEach(address => {
        address.addEventListener("click", () => {
            const sectionId = address.getAttribute("data-section-id");
            showSection(sectionId);
        });
    });
});
document.getElementById("start-session").addEventListener("click", () => showSection("select-template"));

// ----------------------------------------------
// Queue & Template Handling
// ----------------------------------------------
const MAX_PHOTOS = 12;
const photoQueue = document.getElementById("photo-queue");
let selectedTemplate = null;
let selectedTemplateType = null;
let filledSlots = [];
let photoCount = 0;

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

    const photo = document.createElement("img");
    photo.src = photoUrl;
    photo.alt = "Ảnh trong hàng đợi";
    photo.className = "queue-photo";

    // Nếu thiết bị là iOS, áp dụng thêm thuộc tính -webkit-filter
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        photo.style.webkitFilter = cameraFilter;
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-photo";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        if (photoWrapper.dataset.selected === "true") {
            clearImageFromTemplate(photo.src);
        }
        photoQueue.removeChild(photoWrapper);
        photoCount--;
    });
    photoWrapper.addEventListener("click", function (event) {
        if (event.target.closest(".remove-photo")) return;
        const isSelected = photoWrapper.dataset.selected === "true";
        if (!isSelected) {
            const slotFilled = fillTemplateWithImage(photo.src);
            if (slotFilled) {
                photoWrapper.style.opacity = "0.5";
                photoWrapper.dataset.selected = "true";
            }
        } else {
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
    photoCount++;
}

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
                        // Tạo canvas 2000x2000 để "crop/cover" ảnh vuông
                        const canvas = document.createElement("canvas");
                        canvas.width = 2000;
                        canvas.height = 2000;
                        const ctx = canvas.getContext("2d");
                        const scale = Math.max(2000 / img.width, 2000 / img.height);
                        const newWidth = img.width * scale;
                        const newHeight = img.height * scale;
                        const dx = (2000 - newWidth) / 2;
                        const dy = (2000 - newHeight) / 2;
                        ctx.drawImage(img, dx, dy, newWidth, newHeight);
                        const formattedDataUrl = canvas.toDataURL("image/jpeg", 1);
                        addPhotoToQueue(formattedDataUrl);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});

// ----------------------------------------------
// Camera & Filter Handling
// ----------------------------------------------
let flipCamera = true;
let cameraFilter = "none";  // Lưu filter đang chọn

document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("camera-video");
    const captureButton = document.getElementById("capture-button");
    const autoTakePhotoButton = document.getElementById("auto-take-photo");
    const flipToggle = document.getElementById("flip-toggle");

    // Danh sách filter áp dụng lên camera
    const filters = [
        { name: "Default", style: "none" },
        {
            name: "Walden",
            style: "brightness(1.2) saturate(1.3) hue-rotate(10deg)"
        },
        {
            name: "Amaro",
            style: "brightness(1.1) saturate(1.5) contrast(0.9) hue-rotate(-5deg)"
        },
        {
            name: "Lo-Fi",
            style: "contrast(1.6) saturate(1.6) brightness(0.9)"
        },
        {
            name: "Hefe",
            style: "contrast(1.3) sepia(0.2) saturate(1.3) brightness(1.3)"
        },
        {
            name: "Toaster",
            style: "sepia(0.4) contrast(1.5) brightness(0.9) hue-rotate(-15deg)"
        },
        {
            name: "1977",
            style: "sepia(0.3) hue-rotate(-30deg) saturate(1.3) brightness(1.1)"
        },
        {
            name: "Kelvin",
            style: "sepia(0.3) contrast(1.5) brightness(1.5) saturate(2)"
        },
        {
            name: "Hudson",
            style: "brightness(1.2) contrast(0.9) saturate(1.2) hue-rotate(-15deg)"
        },
        {
            name: "Valencia",
            style: "sepia(0.15) saturate(1.4) brightness(1.1) contrast(1.1)"
        },
        {
            name: "Willow",
            style: "grayscale(0.9) brightness(1.1) contrast(1.2)"
        },
        {
            name: "Nashville",
            style: "sepia(0.25) contrast(1.5) saturate(1.4) hue-rotate(15deg) brightness(1.1)"
        },
        {
            name: "Clarendon",
            style: "contrast(1.2) saturate(1.35) brightness(1.1)"
        },
        {
            name: "Gingham",
            style: "contrast(1.1) brightness(1.05) sepia(0.02)"
        },
        {
            name: "Juno",
            style: "saturate(1.5) contrast(1.15)"
        },
        {
            name: "Lark",
            style: "brightness(1.1) saturate(1.3)"
        },
        {
            name: "Reyes",
            style: "sepia(0.75) contrast(0.75) brightness(1.25) saturate(1.4)"
        },
        {
            name: "X-Pro II",
            style: "sepia(0.3) contrast(1.3) brightness(1.25) saturate(1.3)"
        }
    ];

    // Đổ filter lên giao diện
    const filterContainer = document.querySelector(".filter-options");
    filterContainer.innerHTML = "";
    filters.forEach((filter) => {
        const filterElement = document.createElement("div");
        filterElement.className = "filter";
        filterElement.textContent = filter.name;
        filterElement.style.filter = filter.style === "none" ? "none" : filter.style;
        filterElement.addEventListener("click", function () {
            cameraFilter = filter.style;
            video.style.filter = filter.style;  // Áp dụng realtime cho video
        });
        filterContainer.appendChild(filterElement);
    });

    function updateVideoTransform() {
        video.style.transform = flipCamera ? "scaleX(-1)" : "none";
    }

    // Mở camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            updateVideoTransform();

            // Nút chụp ảnh
            captureButton.addEventListener("click", function () {
                capturePhoto();
            });

            function showCountdownNumber(number) {
                const countdownCircle = document.createElement("div");
                countdownCircle.className = "countdown-circle";
                countdownCircle.textContent = number;
                const container = document.getElementById('camera-container');
                container.appendChild(countdownCircle);
                // Loại bỏ sau 1 giây (thời gian animation)
                setTimeout(() => {
                    countdownCircle.remove();
                }, 1000);
            }

            // Nút chụp ảnh sau 5s
            autoTakePhotoButton.addEventListener("click", function () {
                let cycles = 4; // Số chu trình chụp ảnh

                function runCountdownCycle() {
                    let countdown = 5;
                    const countdownInterval = setInterval(() => {
                        showCountdownNumber(countdown); // Hiển thị số với hiệu ứng pulse
                        countdown--;
                        if (countdown < 0) {
                            clearInterval(countdownInterval);
                            capturePhoto(); // Chụp ảnh khi đếm xong
                            cycles--;
                            if (cycles > 0) {
                                // Chờ thêm 1 giây rồi bắt đầu chu trình mới
                                setTimeout(runCountdownCycle, 1000);
                            }
                        }
                    }, 1000);
                }

                runCountdownCycle();
            });
        })
        .catch((err) => {
            Swal.fire({
                title: '<span data-vi="Lỗi Camera" data-en="Camera Error" data-zh="相机错误"></span>',
                html: `<span data-vi="Không thể truy cập vào máy ảnh:" data-en="Unable to access the camera:" data-zh="无法访问相机："></span> ${err.message}. <span data-vi="Vui lòng kiểm tra cài đặt trình duyệt và máy ảnh của bạn!" data-en="Please check your browser and camera settings!" data-zh="请检查您的浏览器和相机设置！"></span>`,
                icon: 'error',
                confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
            });
        }
        );

    // Flip camera
    flipToggle.addEventListener("change", function () {
        flipCamera = this.checked;
        updateVideoTransform();
    });

    // Hàm chụp ảnh, có áp dụng filter
    function capturePhoto() {
        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        const captureCtx = captureCanvas.getContext("2d");

        // Áp dụng filter vào canvas
        captureCtx.filter = cameraFilter || "none";

        // Nếu lật cam, vẽ ngược
        if (flipCamera) {
            captureCtx.translate(captureCanvas.width, 0);
            captureCtx.scale(-1, 1);
        }
        captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        // Đưa ảnh về 2000x2000 cho đồng nhất
        const formattedCanvas = document.createElement("canvas");
        formattedCanvas.width = 2000;
        formattedCanvas.height = 2000;
        const formattedCtx = formattedCanvas.getContext("2d");
        // Muốn filter ảnh đã được "in" lên captureCanvas, không cần set filter lần nữa
        const scale = Math.max(2000 / captureCanvas.width, 2000 / captureCanvas.height);
        const newWidth = captureCanvas.width * scale;
        const newHeight = captureCanvas.height * scale;
        const dx = (2000 - newWidth) / 2;
        const dy = (2000 - newHeight) / 2;

        formattedCtx.drawImage(captureCanvas, dx, dy, newWidth, newHeight);
        const photoUrl = formattedCanvas.toDataURL("image/jpeg", 1);

        addPhotoToQueue(photoUrl);
    }
});

// ----------------------------------------------
// Template Selection
// ----------------------------------------------
document.querySelectorAll(".photo-template").forEach((template) => {
    template.addEventListener("click", function () {
        selectedTemplate = template.cloneNode(true);
        selectedTemplate.id = "selected-template";
        selectedTemplate.style.pointerEvents = "none";

        const photoDiv = selectedTemplate.querySelector(".photo");
        if (photoDiv) {
            selectedTemplateType = photoDiv.id;
        } else {
            selectedTemplateType = null;
        }

        const templateContainer = document.getElementById("selected-template-container");
        templateContainer.innerHTML = "";
        templateContainer.appendChild(selectedTemplate);

        filledSlots = Array.from(selectedTemplate.querySelectorAll("img")).map(() => null);
        showSection("upload-or-take-photos");
    });
});

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
            imgPlaceholders[i].src = photoUrl;
            filledSlots[i] = photoUrl;
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

function clearImageFromTemplate(photoUrl) {
    if (!selectedTemplate) return false;
    const imgPlaceholders = selectedTemplate.querySelectorAll("img");
    for (let i = 0; i < imgPlaceholders.length; i++) {
        if (filledSlots[i] === photoUrl) {
            imgPlaceholders[i].src = "/assets/images/placehoder.webp";
            filledSlots[i] = null;
            return true;
        }
    }
    return false;
}

document.getElementById("go-to-select-frame").addEventListener("click", function () {
    if (!selectedTemplate) {
        Swal.fire({
            title: '<span data-vi="Chưa Chọn Mẫu" data-en="Template Not Selected" data-zh="未选择模板"></span>',
            html: '<span data-vi="Vui lòng chọn một mẫu trước đã bro." data-en="Please choose a template first, bro." data-zh="请先选择一个模板，兄弟。"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }
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
    photoQueue.innerHTML = "";
    photoCount = 0;
    filledSlots = [];

    const selectFrameContainer = document.getElementById('template-need-select-frame');
    const frameContainer = document.querySelector(".frame-options");
    frameContainer.innerHTML = "";

    const targetPhoto = selectedTemplate.querySelector(".photo");
    if (targetPhoto) {
        let previewContainer = targetPhoto.querySelector("#frame-preview");
        if (!previewContainer) {
            previewContainer = document.createElement("div");
            previewContainer.id = "frame-preview";
            previewContainer.style.pointerEvents = "none";
            targetPhoto.style.position = "relative";
            targetPhoto.appendChild(previewContainer);
        }
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

    // Thêm frame
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

    // KHÔNG ADD FILTER Ở ĐÂY NỮA
    showSection("select-frame");
});

document.getElementById("go-to-preview-and-save").addEventListener("click", function () {
    const framePreview = document.getElementById("frame-preview");
    if (!selectedTemplate) {
        Swal.fire({
            title: '<span data-vi="Chưa Chọn Mẫu" data-en="Template Not Selected" data-zh="未选择模板"></span>',
            html: '<span data-vi="Chưa có mẫu nào được chọn!" data-en="No template selected!" data-zh="没有选择模板！"></span>',
            icon: 'warning',
            confirmButtonText: '<span data-vi="OK" data-en="OK" data-zh="好的"></span>'
        });
        return;
    }
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
    const photoClone = photoDiv.cloneNode(true);
    photoClone.classList.add("photo-preview");
    const photoPreviewContainer = document.getElementById("photo-preview");
    photoPreviewContainer.innerHTML = "";
    photoPreviewContainer.appendChild(photoClone);

    showSection("preview-and-save");
});

document.getElementById("save-photo").addEventListener("click", function () {
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
    const photoClone = photoPreview.cloneNode(true);
    photoClone.classList.remove("photo-preview");
    photoClone.classList.add("photo-print");

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "-9999px";
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(photoClone);
    document.body.appendChild(tempContainer);

    domtoimage.toPng(photoClone)
        .then(function (dataUrl) {
            document.body.removeChild(tempContainer);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                const downloadLink = document.createElement("a");
                downloadLink.href = dataUrl;
                downloadLink.download = "cutebooth.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
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

// Tải khung template
function downloadFrameTemplate(url) {
    if (!url || typeof url !== 'string') {
        console.error("URL không hợp lệ.");
        return;
    }
    const link = document.createElement('a');
    link.href = url;
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    link.download = fileName || 'downloaded_file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Đã tải xuống tệp từ URL: ${url}`);
}

function getFramesByTemplateType(templateType) {
    const framesData = {
        "template-1-photo": [
            { id: 1, src: "/assets/frame/1-photo/no-frame.png" },
            { id: 2, src: "/assets/frame/1-photo/1.webp" },
        ],
        "template-3-photos": [
            { id: 1, src: "/assets/frame/3-photos/no-frame.png" },
            { id: 2, src: "/assets/frame/3-photos/1.webp" },
            { id: 3, src: "/assets/frame/3-photos/2.webp" },
            { id: 4, src: "/assets/frame/3-photos/3.webp" },
            { id: 5, src: "/assets/frame/3-photos/4.webp" },
            { id: 6, src: "/assets/frame/3-photos/5.webp" },
            { id: 7, src: "/assets/frame/3-photos/6.webp" },
            { id: 8, src: "/assets/frame/3-photos/7.webp" },
            { id: 9, src: "/assets/frame/3-photos/8.webp" },
        ],
        "template-4-photos": [
            { id: 1, src: "/assets/frame/4-photos/no-frame.png" },
            { id: 17, src: "/assets/frame/4-photos/11.webp" },
            { id: 17, src: "/assets/frame/4-photos/12.webp" },
            { id: 17, src: "/assets/frame/4-photos/13.webp" },
            { id: 17, src: "/assets/frame/4-photos/14.webp" },
            { id: 17, src: "/assets/frame/4-photos/15.webp" },
            { id: 18, src: "/assets/frame/4-photos/16.webp" },
            { id: 7, src: "/assets/frame/4-photos/Faker.png" },
            { id: 8, src: "/assets/frame/4-photos/Gumayusi.png" },
            { id: 9, src: "/assets/frame/4-photos/Keria.png" },
            { id: 10, src: "/assets/frame/4-photos/Oner.png" },
            { id: 11, src: "/assets/frame/4-photos/Doran.png" },
            { id: 12, src: "/assets/frame/4-photos/Chovy.png" },
            { id: 12, src: "/assets/frame/4-photos/DuongDomic.png" },
            { id: 13, src: "/assets/frame/4-photos/6.webp" },
            { id: 14, src: "/assets/frame/4-photos/7.webp" },
            { id: 15, src: "/assets/frame/4-photos/8.webp" },
            { id: 16, src: "/assets/frame/4-photos/9.webp" },
            { id: 17, src: "/assets/frame/4-photos/10.webp" },
            { id: 2, src: "/assets/frame/4-photos/1.webp" },
            { id: 3, src: "/assets/frame/4-photos/2.webp" },
            { id: 4, src: "/assets/frame/4-photos/3.webp" },
            { id: 5, src: "/assets/frame/4-photos/4.webp" },
            { id: 6, src: "/assets/frame/4-photos/5.webp" },
        ],
        "template-4-photos-2": [
            { id: 1, src: "/assets/frame/4-photos-2/no-frame.png" },
            { id: 2, src: "/assets/frame/4-photos-2/1.webp" },
            { id: 3, src: "/assets/frame/4-photos-2/2.webp" },
            { id: 4, src: "/assets/frame/4-photos-2/3.webp" },
            { id: 5, src: "/assets/frame/4-photos-2/4.webp" },
            { id: 6, src: "/assets/frame/4-photos-2/5.webp" },
            { id: 7, src: "/assets/frame/4-photos-2/6.webp" },
            { id: 8, src: "/assets/frame/4-photos-2/7.webp" },
            { id: 9, src: "/assets/frame/4-photos-2/8.webp" },
        ],
        "template-8-photos": [
            { id: 1, src: "/assets/frame/8-photos/basic-1.svg" },
            { id: 2, src: "/assets/frame/8-photos/pastel-1.webp" },
            { id: 3, src: "/assets/frame/8-photos/pastel-2.webp" },
            { id: 4, src: "/assets/frame/8-photos/pastel-3.webp" },
            { id: 5, src: "/assets/frame/8-photos/1.webp" },
        ],
    };
    return framesData[templateType] || [];
}