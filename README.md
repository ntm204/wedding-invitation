# wedding-invitation · Thiệp cưới online Tuấn Minh & Thu Thuỷ

Thiệp báo hỷ online mang bản sắc Việt: hộp trầu sơn mài trên giấy dó, vầng trăng khảm vỏ trứng hiện dần khi cuộn, nội dung đúng lối thiệp Việt (song thân hai họ, Trưởng nam, Thứ nữ, Lễ Vu Quy, Lễ Thành Hôn, ngày âm lịch). Mỗi khách có link riêng hiện đúng tên mình.

HTML/CSS/JS thuần, không cần cài gì.

## Cấu trúc

```
index.html        Toàn bộ nội dung chữ (tên, song thân, giờ lễ, địa điểm, số điện thoại)
css/style.css     Màu, chữ, bố cục
js/main.js        Vẽ sơn mài khảm vỏ trứng, hộp trầu, giấy dó; nút sao chép
js/invite.js      Màn hình chào: điền tên khách theo mã trong link, mở hộp trầu
js/guests.js      Danh sách khách mời: mã → tên
scripts/links.py  In link riêng cho từng khách
images/           Ảnh cưới (đang là ảnh mẫu CC0)
```

## Xem thử

```sh
python3 -m http.server 8000
# máy tính: http://localhost:8000/?m=hoang-lan
# điện thoại cùng Wi-Fi: http://<IP của Mac>:8000/?m=hoang-lan  (IP: ipconfig getifaddr en0)
```

## Sửa nội dung

| Muốn sửa | Ở đâu |
|---|---|
| Tên, song thân, giờ lễ, địa điểm, số điện thoại | `index.html` (tìm đúng chữ cần đổi) |
| Trưởng nam / Thứ nữ (thứ bậc trong nhà) | `index.html`, phần "Báo hỷ" |
| Nút "Chỉ đường", "Lưu vào lịch" | `index.html`, thuộc tính `href` của hai nút |
| Màu | `css/style.css`, khối `:root` ở đầu file |

## Lời mời riêng cho từng khách

Khi mở thiệp, khách thấy nắp hộp trầu ghi đúng tên mình, ví dụ "Trân trọng kính mời *Anh Hoàng & Chị Lan*". Tên này cũng hiện ở phần Xác nhận tham dự. Link không có mã (hoặc mã sai) thì thiệp ghi "Quý khách".

1. Thêm khách vào `js/guests.js`, mỗi dòng một khách: `'mã': 'Tên hiện trên thiệp',`
2. In link để gửi:

```sh
python3 scripts/links.py https://<địa chỉ thiệp>
# Anh Hoàng & Chị Lan   https://<địa chỉ thiệp>/?m=hoang-lan
```

Lưu ý: ai mở được trang cũng có thể đọc `js/guests.js`, nên chỉ ghi tên, không ghi số điện thoại hay địa chỉ của khách.

## Thay ảnh

Giữ nguyên tên file trong `images/`, chép đè ảnh thật vào (ảnh nên rộng 1000–1300px, dưới 300 KB). Thay xong thì xoá dòng "Ảnh minh hoạ" trong `index.html`.

| File | Vị trí | Nên dùng |
|---|---|---|
| `veil.jpg` | Ảnh lớn đầu tiên | Ảnh dọc |
| `hands.jpg` | Ảnh nhỏ bên trái | Cận cảnh tay, nhẫn |
| `run.jpg` | Ảnh nhỏ bên phải | Ảnh dọc hoặc ngang |
| `lace.jpg` | Ảnh ngang tràn khung | Ảnh ngang |
| `lean.jpg` | Ảnh cuối | Ảnh dọc |

## Đăng lên mạng

Thư mục này đăng thẳng được lên GitHub Pages, Netlify hoặc Cloudflare Pages (không cần build). Sau khi có tên miền, sửa `og:image` trong `index.html` thành đường dẫn đầy đủ (`https://…/images/veil.jpg`) để Zalo, Messenger hiện ảnh xem trước.

## Nguồn ảnh mẫu

Ảnh mẫu là ảnh CC0 (Unsplash, qua Wikimedia Commons): *Under the bridal veil*, *Black and white love*, *Wedding veil and lips*, *Bride running from groom Vietnam*, *Bride leans into husband*.
