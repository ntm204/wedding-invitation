# wedding-invitation · Thiệp cưới online Tuấn Minh & Thu Thuỷ

Thiệp thành hôn với nền ngà và chữ đỏ trầm. Phân cấp bằng tỷ lệ chữ, khoảng trắng và trục giữa nhất quán; thông tin hai họ chia đều trên desktop và xếp dọc trên mobile. Mỗi khách có link riêng hiện đúng tên mình.

HTML/CSS/JS thuần, không cần cài gì.

## Cấu trúc

```
index.html        Toàn bộ nội dung chữ (tên, song thân, giờ lễ, địa điểm, số điện thoại)
css/style.css     Màu, chữ, bố cục
js/main.js        Xem ảnh lớn và nút sao chép
js/invite.js      Màn hình chào: điền tên khách theo link, mở thiệp giấy
js/guest-name.js  Mã hoá tên khách thành chuỗi ngắn trong link
invite.html       Trang ẩn: gõ tên khách → ra link mời riêng
images/           Ảnh cưới (đang là ảnh mẫu CC0)
```

## Xem thử

```sh
python3 -m http.server 8000
# máy tính: http://localhost:8000/  ·  tạo link khách: http://localhost:8000/invite.html
# điện thoại cùng Wi-Fi: http://<IP của máy>:8000/
```

## Sửa nội dung

| Muốn sửa | Ở đâu |
|---|---|
| Tên, song thân, giờ lễ, địa điểm, số điện thoại | `index.html` (tìm đúng chữ cần đổi) |
| Trưởng nam / Thứ nữ (thứ bậc trong nhà) | `index.html`, phần "Báo hỷ" |
| Nút "Chỉ đường", "Lưu vào lịch" | `index.html`, thuộc tính `href` của hai nút |
| Màu | `css/style.css`, khối `:root` ở đầu file |

## Lời mời riêng cho từng khách

Khi mở thiệp, khách thấy thiệp giấy ghi đúng tên mình, ví dụ "Trân trọng kính mời *Anh Hoàng & Chị Lan*". Tên này cũng hiện ở phần Xác nhận tham dự. Link không có tên (hoặc link bị sửa hỏng) thì thiệp ghi "Quý khách".

Mở trang ẩn `https://<địa chỉ thiệp>/invite.html`, gõ tên khách, bấm "Sao chép link" rồi gửi. Không cần sửa code hay deploy lại. Tên được mã hoá ngắn gọn ngay trong link (`/?anh_hoaAng-chiE_lan`, xem `js/guest-name.js`; link `?k=` cũ vẫn mở được), nên chỉ ghi tên, không ghi số điện thoại hay địa chỉ của khách. Trang này không có link nào trỏ tới và chặn Google index. Danh sách "Đã tạo" chỉ lưu trên trình duyệt của máy đang dùng.

## Thay ảnh

Giữ nguyên tên file trong `images/`, chép đè ảnh thật vào (ảnh nên rộng 1000–1300px, dưới 300 KB). Thay xong thì xoá dòng "Ảnh minh hoạ" trong `index.html`.

| File | Vị trí | Nên dùng |
|---|---|---|
| `veil.jpg` | Ảnh chủ đạo bên trái | Ảnh dọc 2:3 |
| `hands.jpg` | Ảnh chi tiết bên phải | Cận cảnh tay, nhẫn, ngang 3:2 |
| `run.jpg` | Ảnh ngang ở cụm thứ hai | Ảnh ngang 3:2 |
| `lace.jpg` | Ảnh chi tiết dưới ảnh tay | Ảnh ngang 3:2 |
| `lean.jpg` | Chân dung kết album | Ảnh dọc 2:3 |

## Đăng lên mạng

Thư mục này đăng thẳng được lên GitHub Pages, Netlify hoặc Cloudflare Pages (không cần build). Sau khi có tên miền, sửa `og:image` trong `index.html` thành đường dẫn đầy đủ (`https://…/images/veil.jpg`) để Zalo, Messenger hiện ảnh xem trước.

## Nguồn ảnh mẫu

Ảnh mẫu là ảnh CC0 (Unsplash, qua Wikimedia Commons): *Under the bridal veil*, *Black and white love*, *Wedding veil and lips*, *Bride running from groom Vietnam*, *Bride leans into husband*.

## Thiết kế và tương tác

Nền ngà `#faf7f2`, mực đỏ trầm `#782d3b`. Lora cho tên và tiêu đề, Be Vietnam Pro cho thông tin. Trang rộng tối đa 880px, phần nội dung tối đa 680px. Bìa tập trung vào tên; lời mời và hai họ cùng một trục giữa. Thứ tự đọc: tên và ngày, lời mời và hai họ, hôn lễ, địa điểm, ảnh, hồi âm. Album chia hai cụm bất đối xứng: chân dung dọc cùng hai ảnh chi tiết, rồi ảnh ngoài trời ngang cân với chân dung dọc. Ảnh giữ tỷ lệ 2:3 hoặc 3:2, mở lớn được khi chạm; thông tin quan trọng từ 14px và tên chính 37–58px.

Không giữ màn hình khi cuộn, không parallax, không hiệu ứng ẩn nội dung. Thiệp chào mở trong 450 ms, tôn trọng chế độ giảm chuyển động. Chạm ảnh để xem lớn; dùng các nút hoặc phím mũi tên để chuyển ảnh, Escape để đóng. Các tính năng tên khách, sao chép số điện thoại, Google Maps và lưu lịch được giữ nguyên.
