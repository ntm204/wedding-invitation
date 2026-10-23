# wedding-invitation · Thiệp cưới online Tuấn Minh & Thu Thuỷ

Thiệp báo hỷ online mang bản sắc Việt: thiệp giấy dó chào khách, biểu tượng hai nét chỉ duyên đan nhau cùng chữ M · T, nội dung đúng lối thiệp Việt (song thân hai họ, Trưởng nam, Thứ nữ, Lễ Vu Quy, Lễ Thành Hôn, ngày âm lịch). Mỗi khách có link riêng hiện đúng tên mình.

HTML/CSS/JS thuần, không cần cài gì.

## Cấu trúc

```
index.html        Toàn bộ nội dung chữ (tên, song thân, giờ lễ, địa điểm, số điện thoại)
css/style.css     Màu, chữ, bố cục
js/main.js        Tạo giấy dó; điều phối chuyển động khi cuộn, xem ảnh lớn, nút sao chép
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

Mở trang ẩn `https://<địa chỉ thiệp>/invite`, gõ tên khách, bấm "Sao chép link" rồi gửi. Không cần sửa code hay deploy lại. Tên được mã hoá ngắn gọn ngay trong link (`/?anh_hoaAng-chiE_lan`, xem `js/guest-name.js`; link `?k=` cũ vẫn mở được), nên chỉ ghi tên, không ghi số điện thoại hay địa chỉ của khách. Trang này không có link nào trỏ tới và chặn Google index. Danh sách "Đã tạo" chỉ lưu trên trình duyệt của máy đang dùng.

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

## Chuyển động và album

Thiệp mở trong 850 ms; hai nét chỉ duyên được vẽ trong 2,8 giây. Bố cục chia thành năm chương trên lưới bất đối xứng; mobile tổ chức lại ảnh, tên và thông tin hai họ. Chuyển động dùng chung ngôn ngữ sơn mài: chữ hé từ mép trên, nét vàng vẽ từ trong ra, khung ảnh mở ngang xen kẽ. Mỗi thành phần chỉ xuất hiện một lần trong một lượt mở trang. Sau khi đã xem, nội dung giữ nguyên khi cuộn lên hoặc quay lại; không khép rồi mở lại. Các nhịp và đường cong nằm trong `--ease-uncover`, `--ease-fold`, `--motion-ink`, `--motion-panel` ở CSS. Chạm ảnh để xem lớn; dùng nút hai bên hoặc phím mũi tên để chuyển ảnh, Escape để đóng. Chế độ giảm chuyển động hiển thị nội dung ngay.

Cuộn giữ hành vi gốc của trình duyệt. Ảnh bìa dịch tối đa 26 px theo tiến độ đầu trang; ảnh album dịch tối đa 14 px. Chữ hé trong 1,6 giây, khung ảnh mở trong 1,9 giây; không dùng thư viện chiếm quyền cuộn.

## Thiệp chào khách

Thiệp giấy trên bì đỏ son, mở bằng cách chạm trực tiếp vào tấm thiệp hoặc dùng Tab rồi Enter/Space. Không có xoay 3D, nút mở riêng hay tương tác hover. Nét chỉ vẽ một lần, tên khách hiện nhẹ; tấm thiệp trượt khỏi bì khi mở. Giảm chuyển động được tôn trọng.
