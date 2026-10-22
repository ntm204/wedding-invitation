# wedding-invitation · Thiệp cưới online Tuấn Minh & Thu Thuỷ

Trang thiệp mời cưới song ngữ Việt – Anh, phong cách tạp chí Paris: tên tràn khổ thu về thành logo khi cuộn, album ảnh đen trắng, chương trình, địa điểm, dress code, thẻ mời và số điện thoại xác nhận.

HTML/CSS/JS thuần, không cần cài gì.

## Cấu trúc

```
index.html      Toàn bộ nội dung chữ (tên, ngày, giờ, địa điểm, gia đình, số điện thoại)
css/style.css   Màu, chữ, bố cục
js/main.js      Hiệu ứng cuộn, đếm ngày J – n, nút sao chép
images/         Ảnh album (đang là ảnh mẫu CC0)
```

## Xem thử

```sh
open index.html
```

Hoặc chạy máy chủ nhỏ để xem trên điện thoại cùng mạng Wi-Fi:

```sh
python3 -m http.server 8000
# điện thoại mở: http://<IP của Mac>:8000
```

## Sửa nội dung

| Muốn sửa | Ở đâu |
|---|---|
| Chữ, tên, giờ, địa điểm, số điện thoại | `index.html` (tìm đúng chữ cần đổi) |
| Ngày đếm ngược J – n | `js/main.js`, dòng `Date.parse('2026-12-12...')` |
| Nút "Chỉ đường", "Lưu vào lịch" | `index.html`, thuộc tính `href` của hai nút |
| Màu | `css/style.css`, khối `:root` ở đầu file |

## Thay ảnh

Giữ nguyên tên file trong `images/`, chỉ cần chép đè ảnh thật vào:

| File | Vị trí | Nên dùng |
|---|---|---|
| `veil.jpg` | Ảnh mở đầu tràn màn hình | Ảnh dọc |
| `hands.jpg` | Ảnh lớn bên trái | Cận cảnh tay, nhẫn |
| `lace.jpg` | Ảnh nhỏ bên phải | Chi tiết váy, hoa |
| `run.jpg` | Ảnh ngang tràn khổ | Ảnh ngang |
| `lean.jpg` | Ảnh cuối | Ảnh dọc |

Ảnh nên rộng khoảng 1000–1300px, dưới 300 KB. Thay xong thì xoá dòng "Ảnh minh hoạ" trong `index.html`.

## Đăng lên mạng

Thư mục này đăng thẳng được lên GitHub Pages, Netlify hoặc Cloudflare Pages (không cần build). Sau khi có tên miền, sửa `og:image` trong `index.html` thành đường dẫn đầy đủ (`https://…/images/veil.jpg`) để Zalo, Messenger hiện ảnh xem trước.

## Nguồn ảnh mẫu

Ảnh mẫu là ảnh CC0 (Unsplash, qua Wikimedia Commons): *Under the bridal veil*, *Black and white love*, *Wedding veil and lips*, *Bride running from groom Vietnam*, *Bride leans into husband*.
