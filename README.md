# Wedding Invitation

Thiệp cưới online viết bằng HTML, CSS và JavaScript, hỗ trợ điện thoại và máy tính.

[Xem trang](https://ntm204.github.io/wedding-invitation/)

## Chạy trên máy

Cần Node.js, FFmpeg và Python.

```sh
npm ci
npm run build
python -m http.server 8085 --directory dist
```

Mở `http://localhost:8085`. Sửa nội dung trong `index.html`, thay ảnh và video trong `assets/`.

Đẩy lên nhánh `main` để tự động cập nhật GitHub Pages.

RSVP hiện chỉ lưu trên thiết bị, chưa gửi phản hồi đến cô dâu và chú rể.
