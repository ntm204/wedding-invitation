# Wedding Invitation

Mẫu thiết kế tham chiếu: https://delicious-days-690807.framer.app/ (How We Met, bố cục desktop/tablet/mobile).

Thiệp cưới Evelyn & Arthur viết bằng HTML, CSS và JavaScript thuần. Runtime không cần thư viện; build dùng Sharp và FFmpeg để tối ưu media.

Trang xem thử: https://ntm204.github.io/wedding-invitation/

Mỗi lần đẩy lên nhánh `main`, GitHub Actions tự build, kiểm tra và cập nhật GitHub Pages từ `dist/`.

- `index.html`: nội dung và bố cục.
- `style.css`: giao diện, font và hiệu ứng.
- `app.js`: menu, hiệu ứng cuộn, FAQ và RSVP.
- `assets/`: ảnh, video, font và favicon.
- `scripts/build.mjs`: tạo thư mục `dist/` khi cần xuất bản.

Chạy tại thư mục dự án:

```sh
python -m http.server 8085 --bind 127.0.0.1
```

Mở `http://127.0.0.1:8085`. Có thể sửa trực tiếp ba file source ở thư mục gốc.

Chuẩn bị: cài Node.js, FFmpeg (có trong PATH, hoặc đặt biến `FFMPEG_PATH` trỏ đến executable), rồi chạy `npm ci`.

Tạo bản xuất bản: `npm run build`. Xem bản đã tối ưu bằng `python -m http.server 8085 --bind 127.0.0.1 --directory dist`.

### Thay ảnh và video

- Thay file gốc trong `assets/` và giữ tên đang dùng trong `index.html`. Nếu đổi tên ảnh, cập nhật `src` trong HTML; video đầu trang dùng `assets/hero.mp4`.
- Chạy lại `npm run build`: tự xoay ảnh theo EXIF, bỏ metadata, xuất WebP nhiều kích thước, thêm `srcset`, `sizes`, kích thước ảnh và giải mã bất đồng bộ. Ảnh dưới màn hình vẫn tải lazy.
- Video được bỏ âm thanh, nén H.264 với faststart, tạo bản 720/1280 pixel theo chiều rộng và poster WebP. Mobile tải bản nhỏ; video chỉ tải khi hero hiện và dừng khi cuộn khỏi hero hoặc ẩn tab. Chế độ giảm chuyển động/tiết kiệm dữ liệu chỉ hiển thị poster.
- Tên file xuất có hash nội dung nên thay ảnh/video không bị dính cache cũ. `.media-cache/` giúp build sau nhanh hơn; có thể xóa thư mục này để tạo lại. Không sửa `dist/` vì build sẽ tạo lại thư mục đó.
- File gốc được giữ nguyên để sau này đổi chất lượng. Bản xuất chỉ chứa media và các font đang dùng trên trang.

Cuộn chuột có quán tính và giảm tốc; touch, trackpad pixel nhỏ, bàn phím, vùng cuộn lồng và tùy chọn giảm chuyển động giữ hành vi native.

Kiểm tra: `npm run build` rồi `npm test`.

RSVP hiện lưu trên trình duyệt của khách, chưa gửi dữ liệu đến cô dâu/chú rể.
